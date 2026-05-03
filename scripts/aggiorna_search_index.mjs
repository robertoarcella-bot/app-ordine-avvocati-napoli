/* eslint-disable no-undef */
/**
 * Aggiunge CAD e CPA al SEARCH_INDEX globale di home.html, estraendo gli
 * articles dal const CODE = {...}; di ciascuna pagina.
 *
 * Uso: node scripts/aggiorna_search_index.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CODICI_DIR = resolve(__dirname, '..', 'public/miniapps/codici');

function extractCode(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  // Estrae il blocco JSON dopo "const CODE = " bilanciando le graffe.
  const start = html.indexOf('const CODE = ');
  if (start < 0) throw new Error('CODE non trovato in ' + htmlPath);
  let i = html.indexOf('{', start);
  let depth = 0, end = -1;
  for (; i < html.length; i++) {
    const c = html[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end < 0) throw new Error('JSON non bilanciato in ' + htmlPath);
  const m = [null, html.slice(html.indexOf('{', start), end)];
  if (!m) throw new Error('CODE non trovato in ' + htmlPath);
  return JSON.parse(m[1]);
}

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function toIndexEntry(code) {
  return {
    slug: code.slug,
    shortTitle: code.shortTitle,
    color: code.color,
    articles: code.articles.map((a, i) => [
      a.numText,
      a.heading || '',
      i,
      plainText((a.contentHtml || '') + ' ' + (a.notesHtml || '')),
    ]),
  };
}

const cad = extractCode(resolve(CODICI_DIR, 'cad.html'));
const cpa = extractCode(resolve(CODICI_DIR, 'codice-processo-amministrativo.html'));
const cadEntry = toIndexEntry(cad);
const cpaEntry = toIndexEntry(cpa);

const homePath = resolve(CODICI_DIR, 'home.html');
let home = readFileSync(homePath, 'utf8');

// Trova `var SEARCH_INDEX = [...];` e parsa il contenuto come JSON.
// L'array è enorme (>4MB) ma JSON.parse va bene.
const re = /var SEARCH_INDEX = (\[[\s\S]*?\]);/m;
const m = re.exec(home);
if (!m) throw new Error('SEARCH_INDEX non trovato in home.html');
const idx = JSON.parse(m[1]);
console.log(`SEARCH_INDEX corrente: ${idx.length} codici`);

// Rimuovi eventuali precedenti CAD/CPA per idempotenza
const filtered = idx.filter(e => e.slug !== 'cad' && e.slug !== 'codice-processo-amministrativo');
filtered.push(cadEntry, cpaEntry);
console.log(`SEARCH_INDEX nuovo: ${filtered.length} codici (+ CAD ${cadEntry.articles.length} art., + CPA ${cpaEntry.articles.length} art.)`);

const newIdxJson = JSON.stringify(filtered);
home = home.replace(re, `var SEARCH_INDEX = ${newIdxJson};`);
writeFileSync(homePath, home, 'utf8');
console.log('home.html aggiornata');
