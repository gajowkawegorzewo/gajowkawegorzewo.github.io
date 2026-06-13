#!/usr/bin/env node
// Jednorazowy NAP-fix: prawidłowy adres = "Kamień 1, 11-600 Kamień" (zgodnie z Wizytówką Google).
// Bylo bledne "Leśniewo 13" (Leśniewo zostaje TYLKO jako pobliski landmark: śluza/plaża).
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const exts = new Set(['.html']);
const skipDirs = new Set(['node_modules', '.git', 'scripts', 'img', 'assets']);

const repls = [
  [/Leśniewo 13/g, 'Kamień 1'],
  [/Le&#x15B;niewo 13/g, 'Kamień 1'],
  [/"addressLocality":"Leśniewo, Węgorzewo"/g, '"addressLocality":"Kamień"'],
  [/"addressLocality":"Leśniewo, Węgorzewo, /g, '"addressLocality":"Kamień, '],
];

let files = 0, changedFiles = 0, totalRepl = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skipDirs.has(e.name)) walk(path.join(dir, e.name)); continue; }
    if (!exts.has(path.extname(e.name))) continue;
    const fp = path.join(dir, e.name);
    files++;
    let html = fs.readFileSync(fp, 'utf8');
    let before = html, n = 0;
    for (const [re, to] of repls) { html = html.replace(re, (m) => { n++; return to; }); }
    if (html !== before) { fs.writeFileSync(fp, html, 'utf8'); changedFiles++; totalRepl += n; console.log('  ✓ ' + path.relative(ROOT, fp) + ' (' + n + ')'); }
  }
}
walk(ROOT);
console.log(`\nNAP-fix: ${changedFiles}/${files} plików zmienionych, ${totalRepl} podmian (Leśniewo 13 → Kamień 1).`);
// sanity: ile zostalo
const leftover = require('child_process');
