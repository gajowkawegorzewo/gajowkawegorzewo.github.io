#!/usr/bin/env node
// Usuwa bledny numer "13" przy Lesniewie w copy (zostaje wioska Lesniewo jako odniesienie).
// Oficjalny adres pocztowy Kamien 1 zostaje w schemacie/NAP (osobno).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const skip = new Set(['node_modules', '.git', 'img', 'assets']);
const exts = new Set(['.html']);
const rules = [
  [/Leśniewie\s+13\b/g, 'Leśniewie', 'lesniewie-13'],
  [/Leśniewo\s+13\b/g, 'Leśniewo', 'lesniewo-13'],
  [/Leśniewa\s+13\b/g, 'Leśniewa', 'lesniewa-13'],
];
let changed = 0; const tally = {};
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(dir, e.name)); continue; }
    if (!exts.has(path.extname(e.name))) continue;
    const fp = path.join(dir, e.name);
    let txt = fs.readFileSync(fp, 'utf8'); const before = txt;
    for (const [re, rep, label] of rules) txt = txt.replace(re, () => { tally[label] = (tally[label] || 0) + 1; return rep; });
    if (txt !== before) { fs.writeFileSync(fp, txt, 'utf8'); changed++; console.log('  ✓ ' + path.relative(ROOT, fp)); }
  }
}
walk(ROOT);
console.log('\nZmienione pliki: ' + changed + ' | trafienia: ' + JSON.stringify(tally));
