#!/usr/bin/env node
// Jednorazowy: wyciąga główny <style> z index.html do assets/gajowka.css i podmienia na <link>.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const idx = path.join(ROOT, 'index.html');
let html = fs.readFileSync(idx, 'utf8');
const start = html.indexOf('<style>');
const end = html.indexOf('</style>');
if (start === -1 || end === -1 || end < start) { console.error('Nie znaleziono <style>'); process.exit(1); }
const css = html.slice(start + '<style>'.length, end);
const block = html.slice(start, end + '</style>'.length);
fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets', 'gajowka.css'), css.trim() + '\n', 'utf8');
html = html.replace(block, '<link rel="stylesheet" href="/assets/gajowka.css">');
fs.writeFileSync(idx, html, 'utf8');
console.log(JSON.stringify({ cssBytes: css.length, linkInjected: html.includes('/assets/gajowka.css'), styleRemaining: html.includes('<style>') }));
