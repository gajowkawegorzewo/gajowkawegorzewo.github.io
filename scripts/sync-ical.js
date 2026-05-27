#!/usr/bin/env node
/**
 * sync-ical.js
 *
 * Autonomous booking calendar sync for gajowkawegorzewo.github.io
 *
 * Reads:
 *   availability/sources.json     - iCal URLs per object (Airbnb etc.)
 *   availability/manual-blocks.json - manually added booking ranges (Booking, direct etc.)
 *
 * Writes:
 *   availability.json             - { "Object Name": [ {from, to, source}, ... ], ... }
 *   calendar/<slug>.ics           - our merged iCal export per object (import to Booking)
 *
 * Node 18+ (uses built-in fetch). No external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const SOURCES_PATH = path.join(ROOT, 'availability', 'sources.json');
const MANUAL_PATH = path.join(ROOT, 'availability', 'manual-blocks.json');
const OUT_AVAIL = path.join(ROOT, 'availability.json');
const CAL_DIR = path.join(ROOT, 'calendar');

const FETCH_TIMEOUT_MS = 15000;
const SITE_DOMAIN = 'gajowkawegorzewo.github.io';

// SUMMARY values we treat as "blocked" (case-insensitive contains)
const BLOCKED_SUMMARY_PATTERNS = [
  /reserved/i,
  /not available/i,
  /confirmed/i,
  /closed/i,
  /booking/i,
  /blocked/i,
  /busy/i,
  /unavailable/i,
];

// -------------------- HTTP fetch (built-in https, timeout, redirects) --------------------

function httpGet(urlStr, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try {
      urlObj = new URL(urlStr);
    } catch (err) {
      return reject(new Error(`Invalid URL: ${urlStr}`));
    }
    const req = https.get(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        port: urlObj.port || 443,
        headers: {
          'User-Agent': 'gajowka-ical-sync/1.0 (+https://gajowkawegorzewo.github.io)',
          'Accept': 'text/calendar, text/plain, */*',
        },
        timeout: FETCH_TIMEOUT_MS,
      },
      (res) => {
        // Handle redirects
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          if (redirectsLeft <= 0) {
            res.resume();
            return reject(new Error(`Too many redirects: ${urlStr}`));
          }
          const next = new URL(res.headers.location, urlStr).toString();
          res.resume();
          return resolve(httpGet(next, redirectsLeft - 1));
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error(`Timeout after ${FETCH_TIMEOUT_MS}ms: ${urlStr}`));
    });
    req.on('error', (err) => reject(err));
  });
}

// -------------------- iCal parsing --------------------

/**
 * Unfold iCal lines per RFC 5545 (lines starting with space/tab are continuations).
 */
function unfoldIcs(text) {
  // Normalise line endings first
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out = [];
  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

/**
 * Parse VEVENT blocks from raw iCal text.
 * Returns array of { uid, summary, dtstart, dtend, description }
 * Date values are normalised to 'YYYYMMDD' strings (date-only).
 */
function parseIcs(text) {
  const lines = unfoldIcs(text);
  const events = [];
  let cur = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === 'BEGIN:VEVENT') {
      cur = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (cur && cur.dtstart && cur.dtend) {
        events.push(cur);
      }
      cur = null;
      continue;
    }
    if (!cur) continue;

    // Split into "key (with params)" : "value"
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const keyFull = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    const key = keyFull.split(';')[0].toUpperCase();

    if (key === 'UID') cur.uid = value;
    else if (key === 'SUMMARY') cur.summary = value;
    else if (key === 'DESCRIPTION') cur.description = value;
    else if (key === 'DTSTART') cur.dtstart = normaliseDate(value);
    else if (key === 'DTEND') cur.dtend = normaliseDate(value);
  }
  return events;
}

/**
 * Normalise an iCal date/datetime to YYYYMMDD (date-only).
 * Accepts: 20260528, 20260528T120000, 20260528T120000Z, 2026-05-28
 */
function normaliseDate(v) {
  if (!v) return null;
  const m = v.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3]}`;
}

function ymdToIso(ymd) {
  // YYYYMMDD -> YYYY-MM-DD
  if (!ymd || ymd.length !== 8) return null;
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

function isoToYmd(iso) {
  // YYYY-MM-DD -> YYYYMMDD
  if (!iso) return null;
  return iso.replace(/-/g, '');
}

function isBlockedSummary(summary) {
  if (!summary) return false;
  return BLOCKED_SUMMARY_PATTERNS.some((re) => re.test(summary));
}

// -------------------- Merge / dedupe --------------------

/**
 * Merge overlapping or contiguous half-open ranges [from, to).
 * Input: array of { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', source: '...' }
 * (DTEND in Airbnb iCal is exclusive — checkout day, when guest leaves)
 * Output: same shape, sorted, merged.
 */
function mergeRanges(ranges) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.from.localeCompare(b.from));
  const out = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    const cur = sorted[i];
    if (cur.from <= last.to) {
      // overlap or touch — extend
      if (cur.to > last.to) last.to = cur.to;
      // combine source labels (dedup)
      const srcs = new Set(
        String(last.source || '').split('+').map((s) => s.trim()).filter(Boolean)
      );
      if (cur.source) srcs.add(cur.source);
      last.source = Array.from(srcs).join('+');
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

// -------------------- iCal output --------------------

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nowDtStamp() {
  const d = new Date();
  return (
    d.getUTCFullYear().toString() +
    pad2(d.getUTCMonth() + 1) +
    pad2(d.getUTCDate()) +
    'T' +
    pad2(d.getUTCHours()) +
    pad2(d.getUTCMinutes()) +
    pad2(d.getUTCSeconds()) +
    'Z'
  );
}

function buildIcs(objectName, slug, ranges) {
  const dtstamp = nowDtStamp();
  const lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('PRODID:-//Gajowka Wegorzewo//Booking Calendar 1.0//PL');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('VERSION:2.0');
  lines.push(`X-WR-CALNAME:Gajowka - ${objectName}`);
  lines.push('X-WR-TIMEZONE:Europe/Warsaw');
  for (const r of ranges) {
    const fromYmd = isoToYmd(r.from);
    const toYmd = isoToYmd(r.to);
    if (!fromYmd || !toYmd) continue;
    const uid = `gajowka-${slug}-${fromYmd}-${toYmd}@${SITE_DOMAIN}`;
    lines.push('BEGIN:VEVENT');
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${fromYmd}`);
    lines.push(`DTEND;VALUE=DATE:${toYmd}`);
    lines.push('SUMMARY:Reserved');
    lines.push(`UID:${uid}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  // RFC 5545 requires CRLF
  return lines.join('\r\n') + '\r\n';
}

// -------------------- Main --------------------

async function main() {
  // Read configs
  let sources, manual;
  try {
    sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
  } catch (err) {
    console.error(`[fatal] Cannot read ${SOURCES_PATH}: ${err.message}`);
    process.exit(2);
  }
  try {
    manual = JSON.parse(fs.readFileSync(MANUAL_PATH, 'utf8'));
  } catch (err) {
    console.error(`[warn] Cannot read ${MANUAL_PATH}, using empty: ${err.message}`);
    manual = {};
  }

  if (!fs.existsSync(CAL_DIR)) fs.mkdirSync(CAL_DIR, { recursive: true });

  const availability = {};
  const counts = {};
  let hadError = false;

  for (const [objectName, cfg] of Object.entries(sources)) {
    const slug = cfg.slug;
    if (!slug) {
      console.error(`[skip] ${objectName}: missing slug`);
      continue;
    }

    const ranges = [];

    // Manual blocks first
    const manualEntries = Array.isArray(manual[objectName]) ? manual[objectName] : [];
    for (const entry of manualEntries) {
      if (!entry || !entry.from || !entry.to) continue;
      ranges.push({
        from: entry.from,
        to: entry.to,
        source: entry.source || 'Manual',
      });
    }

    // External iCal sources
    const sourceKeys = ['airbnb', 'booking', 'slowhop'];
    for (const key of sourceKeys) {
      const url = cfg[key];
      if (!url) continue;
      try {
        const text = await httpGet(url);
        const events = parseIcs(text);
        let kept = 0;
        for (const ev of events) {
          if (!isBlockedSummary(ev.summary)) continue;
          const fromIso = ymdToIso(ev.dtstart);
          const toIso = ymdToIso(ev.dtend);
          if (!fromIso || !toIso) continue;
          if (toIso <= fromIso) continue;
          ranges.push({
            from: fromIso,
            to: toIso,
            source: key.charAt(0).toUpperCase() + key.slice(1),
            // NOTE: deliberately NOT storing original UID/description — those contain
            // Airbnb-private data (last4 phone, reservation URL). Scrubbed by design.
          });
          kept++;
        }
        console.error(`[ok] ${objectName} <- ${key}: ${kept} events kept`);
      } catch (err) {
        hadError = true;
        console.error(`[err] ${objectName} <- ${key}: ${err.message}`);
      }
    }

    const merged = mergeRanges(ranges);
    availability[objectName] = merged;
    counts[objectName] = merged.length;

    // Write per-object ICS (even if empty — valid VCALENDAR placeholder)
    const ics = buildIcs(objectName, slug, merged);
    const icsPath = path.join(CAL_DIR, `${slug}.ics`);
    fs.writeFileSync(icsPath, ics, 'utf8');
  }

  // Write availability.json
  fs.writeFileSync(OUT_AVAIL, JSON.stringify(availability, null, 2) + '\n', 'utf8');

  // Summary to stdout (machine-parseable)
  console.log(
    JSON.stringify({
      updated: true,
      objects: counts,
      hadFetchError: hadError,
    })
  );

  // If every external fetch failed (and there were any), exit non-zero so the workflow
  // surfaces the issue. Manual-only objects still succeed.
  if (hadError && Object.values(counts).every((n) => n === 0)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[fatal] ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
