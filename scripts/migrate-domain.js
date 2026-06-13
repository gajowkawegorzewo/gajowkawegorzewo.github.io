#!/usr/bin/env node
// Migracja domeny: gajowkawegorzewo.github.io -> gajowkawegorzewo.pl
// URUCHOM DOPIERO gdy DNS .pl wskazuje na GitHub Pages i CNAME jest scommitowany!
// Podmienia host we wszystkich absolutnych URL (canonical/og/hreflang/schema/sitemapy/robots/feed/indexnow).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const skip = new Set(['node_modules', '.git', 'img', 'assets']);
const exts = new Set(['.html', '.xml', '.txt', '.sh', '.js']);
const FROM = /gajowkawegorzewo\.github\.io/g;
const TO = 'gajowkawegorzewo.pl';
let files = 0, changed = 0, total = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(dir, e.name)); continue; }
    if (!exts.has(path.extname(e.name))) continue;
    if (e.name === 'migrate-domain.js') continue;
    if (e.name === 'sync-ical.js') continue; // UID namespace + User-Agent — zostaw stabilne, nie URL publiczny
    const fp = path.join(dir, e.name);
    files++;
    const before = fs.readFileSync(fp, 'utf8');
    let n = 0;
    const after = before.replace(FROM, () => { n++; return TO; });
    if (after !== before) { fs.writeFileSync(fp, after, 'utf8'); changed++; total += n; console.log('  ✓ ' + path.relative(ROOT, fp) + ' (' + n + ')'); }
  }
}
walk(ROOT);
console.log(`\nMigracja URL: ${changed}/${files} plików, ${total} podmian (github.io -> .pl).`);
