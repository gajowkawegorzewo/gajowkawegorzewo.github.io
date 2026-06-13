#!/usr/bin/env node
// Poprawka: addressLocality = Węgorzewo (NIE Kamień). NAP = Kamień 1, 11-600 Węgorzewo.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const skip = new Set(['node_modules', '.git', 'scripts', 'img', 'assets']);
let n = 0, files = 0;

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(d, e.name)); continue; }
    if (!e.name.endsWith('.html')) continue;
    const fp = path.join(d, e.name);
    const before = fs.readFileSync(fp, 'utf8');
    const after = before.replace(/"addressLocality":"Kamień"/g, () => { n++; return '"addressLocality":"Węgorzewo"'; });
    if (after !== before) { fs.writeFileSync(fp, after, 'utf8'); files++; }
  }
}

walk(ROOT);
console.log('addressLocality Kamień -> Węgorzewo: ' + n + ' podmian w ' + files + ' plikach.');
