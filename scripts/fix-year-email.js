#!/usr/bin/env node
// Email unify (-> luuretwitch@gmail.com) + sweep "1880" (founding year) -> "XIX wiek / 19th century".
// NIE rusza narracji o mieszkaniu rodzin ("1880s", "1880er", "lata 1880-tych", "1880-").
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const skip = new Set(['node_modules', '.git', 'img', 'assets']);
const exts = new Set(['.html']);

// ordered rules: [regex, replacement, label]
const rules = [
  // --- EMAIL (ASCII, exact) ---
  [/gajowkawegorzewo@gmail\.com/g, 'luuretwitch@gmail.com', 'email'],
  // --- PL founding-year (ASCII context, encoding-safe) ---
  [/z\s+oko[^\s]{1,8}o\s+1880\s+roku/g, 'z XIX wieku', 'pl-z-okolo-roku'],   // "z około 1880 roku" (ł raw or entity)
  [/oko[^\s]{1,8}o\s+<strong>1880\s+roku<\/strong>/g, '<strong>w XIX wieku</strong>', 'pl-okolo-strong'],
  [/oko[^\s]{1,8}o\s+1880\s+roku/g, 'w XIX wieku', 'pl-okolo-roku'],         // "około 1880 roku"
  [/od\s+1880\s+roku/g, 'od XIX wieku', 'pl-od-roku'],
  [/z\s+1880\s+roku/g, 'z XIX wieku', 'pl-z-roku'],
  [/z\s+1880(?![0-9s\-])/g, 'z XIX wieku', 'pl-z'],                          // "z 1880 i 3 apart" / "z 1880 w sniegu"
  [/1880\s+roku/g, 'XIX wieku', 'pl-roku'],
  [/1880\s+r\./g, 'XIX w.', 'pl-r'],
  // --- DE ---
  [/von\s+1880/g, 'aus dem 19. Jahrhundert', 'de-von'],
  [/um\s+<strong>1880<\/strong>/g, '<strong>im 19. Jahrhundert</strong>', 'de-um-strong'],
  [/um\s+1880(?![0-9s\-])/g, 'im 19. Jahrhundert', 'de-um'],
  // --- EN ---
  [/A\s+historic\s+1880\s+forester/g, 'A historic 19th-century forester', 'en-a-historic'],
  [/Historic\s+1880\s+forester/g, 'Historic 19th-century forester', 'en-historic'],
  [/around\s+<strong>1880<\/strong>/g, '<strong>in the 19th century</strong>', 'en-around-strong'],
  [/around\s+1880(?![0-9s\-])/g, 'in the 19th century', 'en-around'],
  // --- 2nd pass: leftover founding assertions (NIE rusza "1880s"/"1880er"/"od 1880 do lat") ---
  [/von\s+etwa\s+1880/g, 'aus dem 19. Jahrhundert', 'de-von-etwa'],
  [/since\s+1880\b/gi, 'since the 19th century', 'en-since'],
  [/1880\s+forester['’]s\s+lodge/gi, "19th-century forester's lodge", 'en-foresters-lodge'],
  [/1880\s+forest\s+lodge/gi, '19th-century forest lodge', 'en-forest-lodge'],
  [/\bAn\s+(19th-century)/g, 'A $1', 'en-An-article'],
  [/\ban\s+(19th-century)/g, 'a $1', 'en-an-article'],
];

let files = 0, changedFiles = 0;
const tally = {};
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(dir, e.name)); continue; }
    if (!exts.has(path.extname(e.name))) continue;
    const fp = path.join(dir, e.name);
    files++;
    let txt = fs.readFileSync(fp, 'utf8');
    const before = txt;
    const local = [];
    for (const [re, rep, label] of rules) {
      txt = txt.replace(re, (...a) => { tally[label] = (tally[label] || 0) + 1; local.push(label); return typeof rep === 'function' ? rep(...a) : rep; });
    }
    if (txt !== before) {
      fs.writeFileSync(fp, txt, 'utf8');
      changedFiles++;
      console.log('  ✓ ' + path.relative(ROOT, fp) + ' [' + local.join(',') + ']');
    }
  }
}
walk(ROOT);
console.log('\nZmienione pliki: ' + changedFiles + '/' + files);
console.log('Reguly (ile trafien):', JSON.stringify(tally, null, 0));
