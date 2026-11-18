/**
 * Aggiorna la miniapp "Codici Italiani" (public/miniapps/codici/) con l'ultima
 * versione pubblicata su avvocatotelematico.studiolegalearcella.it/codici/,
 * mantenendo i codici sempre inclusi nell'app (offline).
 *
 * Passi:
 *   1. scarica home.html + 9 codici + manifest/icone dal sito e li valida
 *      (HTTP 200, presenza di `const CODE = ` / `var SEARCH_INDEX = `);
 *   2. reinserisce in home.html le schede di CAD e Cod. Proc. Amministrativo,
 *      che esistono solo nell'app (generati da scripts/genera_codici_aggiuntivi.mjs)
 *      e aggiorna la data nel footer;
 *   3. applica il tema COA        (scripts/restyle_codici_coa.mjs);
 *   4. applica la patch v1.2.3    (scripts/patch_codici_v123.mjs:
 *      menu "Vai a articolo", "Tutti i codici", sblocco scroll WebView);
 *   5. aggiunge CAD e CPA all'indice di ricerca globale (scripts/aggiorna_search_index.mjs).
 *
 * cad.html e codice-processo-amministrativo.html non vengono toccati.
 *
 * Uso: node scripts/aggiorna_codici.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CODICI_DIR = resolve(__dirname, '..', 'public/miniapps/codici');
const BASE = 'https://avvocatotelematico.studiolegalearcella.it/codici/';

const CODICI_ONLINE = [
  'costituzione',
  'codice-civile',
  'disp-att-codice-civile',
  'codice-procedura-civile',
  'disp-att-codice-procedura-civile',
  'codice-penale',
  'codice-procedura-penale',
  'norme-att-codice-procedura-penale',
  'reg-esecuzione-codice-procedura-penale',
];
const ASSETS = ['manifest.json', 'icon.svg', 'icon-192.png'];

// Schede dei codici presenti solo nell'app (stessa struttura delle schede online)
const CARDS_SOLO_APP = `
    <a href="cad.html" class="code-card" style="--card-color:#0066CC">
      <div class="card-icon">💻</div>
      <div class="card-body">
        <h2 class="card-title">CAD</h2>
        <p class="card-desc">Codice dell'amministrazione digitale: identità digitale, SPID, PEC, firma elettronica e servizi della PA.</p>
      </div>
      <div class="card-footer">
        <span class="card-year">2005</span>
        <span class="card-vigenza">agg. __VIG_CAD__</span>
      </div>
    </a>

    <a href="codice-processo-amministrativo.html" class="code-card" style="--card-color:#003F7F">
      <div class="card-icon">🏛️</div>
      <div class="card-body">
        <h2 class="card-title">Cod. Proc. Amministrativo</h2>
        <p class="card-desc">Disciplina la giurisdizione amministrativa: TAR e Consiglio di Stato (D.Lgs. 104/2010).</p>
      </div>
      <div class="card-footer">
        <span class="card-year">2010</span>
        <span class="card-vigenza">agg. __VIG_CPA__</span>
      </div>
    </a>
`;

async function download(name, { binary = false } = {}) {
  const res = await fetch(BASE + name, { redirect: 'follow' });
  if (res.status !== 200) throw new Error(`${name}: HTTP ${res.status}`);
  return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
}

/** Legge "vigenza" dal blocco CODE di un codice già presente nell'app. */
function vigenzaLocale(file) {
  const html = readFileSync(resolve(CODICI_DIR, file), 'utf8');
  const m = /"vigenza"\s*:\s*"([^"]+)"|vigenza\s*:\s*"([^"]+)"/.exec(html);
  if (!m) throw new Error('vigenza non trovata in ' + file);
  return m[1] || m[2];
}

function patchHome(html) {
  const hadCrlf = html.includes('\r\n');
  let h = html.replace(/\r\n/g, '\n');

  if (h.includes('href="cad.html"')) {
    console.log('  [skip] schede CAD/CPA già presenti nella home online');
  } else {
    const anchor = '  </div>\n</section>\n\n<footer>';
    if (!h.includes(anchor)) throw new Error('fine griglia codici non trovata in home.html');
    const cards = CARDS_SOLO_APP
      .replace('__VIG_CAD__', vigenzaLocale('cad.html'))
      .replace('__VIG_CPA__', vigenzaLocale('codice-processo-amministrativo.html'));
    h = h.replace(anchor, cards + anchor);
  }

  // Data nel footer: usa la vigenza (più recente) dei codici scaricati
  const date = [...h.matchAll(/<span class="card-vigenza">agg\. (\d{2})\/(\d{2})\/(\d{4})<\/span>/g)]
    .map(m => `${m[3]}-${m[2]}-${m[1]}`)
    .sort()
    .pop();
  if (date) {
    const [y, mo, d] = date.split('-');
    h = h.replace(
      /risultano aggiornati al <strong>[^<]*<\/strong>\./,
      () => `risultano aggiornati al <strong>${d}/${mo}/${y}</strong> (CAD e Cod. Proc. Amministrativo: alla data indicata nella rispettiva scheda).`
    );
  }
  return hadCrlf ? h.replace(/\n/g, '\r\n') : h;
}

function runScript(name) {
  console.log(`\n▶ ${name}`);
  execFileSync(process.execPath, [resolve(__dirname, name)], { stdio: 'inherit' });
}

// ── 1. Download e validazione (nulla viene scritto se un file non è valido) ──
console.log('Download da ' + BASE);
const files = new Map();
const home = await download('home.html');
if (!home.includes('var SEARCH_INDEX = ')) throw new Error('home.html: SEARCH_INDEX assente');
files.set('home.html', home);
for (const slug of CODICI_ONLINE) {
  const html = await download(slug + '.html');
  if (!html.includes('const CODE = ')) throw new Error(`${slug}.html: blocco CODE assente`);
  files.set(slug + '.html', html);
}
for (const a of ASSETS) files.set(a, await download(a, { binary: a.endsWith('.png') }));
for (const [name, body] of files) console.log(`  ${name.padEnd(45)} ${(body.length / 1024).toFixed(0).padStart(6)} KB`);

// ── 2. Scrittura + schede CAD/CPA in home ──
files.set('home.html', patchHome(files.get('home.html')));
for (const [name, body] of files) writeFileSync(resolve(CODICI_DIR, name), body);
console.log(`\nScritti ${files.size} file in public/miniapps/codici/`);

// ── 3-5. Adattamenti per l'app ──
runScript('restyle_codici_coa.mjs');
runScript('patch_codici_v123.mjs');
runScript('aggiorna_search_index.mjs');

console.log('\nCodici aggiornati. Prossimo passo: npm run build && npx cap sync android');
