#!/usr/bin/env node
/**
 * GAJÓWKA RSS FEED GENERATOR
 *
 * Skanuje blog/*.html, wyciąga meta (title, description, canonical, datePublished),
 * generuje feed.xml (RSS 2.0) w root repo z 20 najnowszymi wpisami.
 *
 * Run: node scripts/generate-rss.js
 * Output: feed.xml (UTF-8)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://gajowkawegorzewo.pl';
const FEED_URL = `${BASE_URL}/feed.xml`;
const BLOG_INDEX_URL = `${BASE_URL}/blog/`;
const MAX_ITEMS = 20;

const SITE_TITLE = 'Blog Gajówki Węgorzewo';
const SITE_DESCRIPTION = 'Praktyczne przewodniki po Mazurach i okolicach Węgorzewa: atrakcje, transport, domki, sezon, wydarzenia. Pisane lokalnie, bez clickbaitu.';
const SITE_LANGUAGE = 'pl-PL';

function xmlEscape(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractMeta(html, filePath) {
  const meta = {};

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  meta.title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.html');

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  meta.description = descMatch ? descMatch[1].trim() : '';

  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  meta.canonical = canonMatch ? canonMatch[1].trim() : `${BASE_URL}/blog/${path.basename(filePath)}`;

  // datePublished z JSON-LD
  let dateStr = null;
  const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    const dp = jsonLdMatch[1].match(/"datePublished"\s*:\s*"([^"]+)"/);
    if (dp) dateStr = dp[1];
  }
  // fallback: dateModified
  if (!dateStr && jsonLdMatch) {
    const dm = jsonLdMatch[1].match(/"dateModified"\s*:\s*"([^"]+)"/);
    if (dm) dateStr = dm[1];
  }
  // fallback: file mtime
  if (!dateStr) {
    try {
      const stat = fs.statSync(filePath);
      dateStr = stat.mtime.toISOString().slice(0, 10);
    } catch (_) {
      dateStr = new Date().toISOString().slice(0, 10);
    }
  }
  meta.date = dateStr;

  return meta;
}

function toRfc822(dateStr) {
  // Akceptuj "YYYY-MM-DD" lub pełen ISO
  let d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    d = new Date(dateStr + 'T12:00:00+02:00');
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d.getTime())) d = new Date();
  return d.toUTCString();
}

function generateRss() {
  const blogDir = path.resolve(__dirname, '..', 'blog');
  if (!fs.existsSync(blogDir)) {
    console.error('[RSS] Brak folderu blog/ — anuluję.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html');

  const items = files.map((f) => {
    const full = path.join(blogDir, f);
    const html = fs.readFileSync(full, 'utf8');
    return extractMeta(html, full);
  });

  // Sort malejąco po dacie
  items.sort((a, b) => {
    if (a.date === b.date) return a.title.localeCompare(b.title);
    return a.date < b.date ? 1 : -1;
  });

  const top = items.slice(0, MAX_ITEMS);
  const lastBuildDate = new Date().toUTCString();
  const pubDateNewest = top.length ? toRfc822(top[0].date) : lastBuildDate;

  const itemsXml = top
    .map((it) => {
      return `    <item>
      <title>${xmlEscape(it.title)}</title>
      <link>${xmlEscape(it.canonical)}</link>
      <guid isPermaLink="true">${xmlEscape(it.canonical)}</guid>
      <pubDate>${toRfc822(it.date)}</pubDate>
      <description>${xmlEscape(it.description)}</description>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_TITLE)}</title>
    <link>${xmlEscape(BLOG_INDEX_URL)}</link>
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>${SITE_LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDateNewest}</pubDate>
    <atom:link href="${xmlEscape(FEED_URL)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

  const outPath = path.resolve(__dirname, '..', 'feed.xml');
  fs.writeFileSync(outPath, rss, 'utf8');
  console.log(`[RSS] feed.xml zapisany: ${outPath}`);
  console.log(`[RSS] Itemów: ${top.length} (z ${items.length} znalezionych)`);
  top.forEach((it, i) => {
    console.log(`  ${i + 1}. ${it.date}  ${it.title}`);
  });
}

generateRss();
