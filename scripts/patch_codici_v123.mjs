/* eslint-disable no-undef */
/**
 * Patch v1.2.3 dei file della miniapp codici.
 *
 * Risolve due problemi segnalati dagli utenti:
 *   1) Scroll bloccato finché non si tocca un input (bug WebView Android: il
 *      gesture detector non si "sveglia" dopo il primo render dinamico).
 *   2) Manca un menu a discesa per saltare rapidamente a un articolo
 *      e un accesso diretto alla ricerca globale fra tutti i codici.
 *
 * Modifiche applicate a ciascun codice-*.html:
 *   - CSS per la barra "Vai a articolo..."
 *   - HTML del select + link "Cerca in tutti i codici"
 *   - JS: popolamento select, sync, scroll wake-up
 *
 * Modifica applicata a home.html:
 *   - Autofocus search quando si arriva con #search
 *
 * Uso: node scripts/patch_codici_v123.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CODICI_DIR = resolve(__dirname, '..', 'public/miniapps/codici');

const CODICI = [
  'costituzione',
  'codice-civile',
  'disp-att-codice-civile',
  'codice-procedura-civile',
  'disp-att-codice-procedura-civile',
  'codice-penale',
  'codice-procedura-penale',
  'norme-att-codice-procedura-penale',
  'reg-esecuzione-codice-procedura-penale',
  'cad',
  'codice-processo-amministrativo',
];

// ── CSS da iniettare prima del </style> finale (subito prima di "</style>\n</head>") ──
const CSS_BLOCK = `
/* ── ARTICLE JUMP BAR (v1.2.3) ── */
.article-jump-bar {
  max-width: 820px;
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.article-jump-bar label {
  font-size: .78rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;
  flex-shrink: 0;
}
.article-jump-bar select {
  flex: 1 1 200px;
  min-width: 0;
  padding: 8px 10px;
  font-family: var(--sans);
  font-size: .85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--article-bg);
  color: var(--text);
  cursor: pointer;
}
.article-jump-bar select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
}
.article-jump-bar .global-search-link {
  flex-shrink: 0;
  padding: 8px 12px;
  font-family: var(--sans);
  font-size: .8rem;
  font-weight: 600;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--article-bg);
  color: var(--accent);
  text-decoration: none;
  white-space: nowrap;
  transition: all .15s;
}
.article-jump-bar .global-search-link:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
@media (max-width: 768px) {
  .article-jump-bar { padding: 0 4px; }
  .article-jump-bar label { display: none; }
  .article-jump-bar .global-search-link { padding: 8px 10px; font-size: .75rem; }
}
`;

// ── HTML da iniettare DENTRO main, prima di <div id="article-view"></div> ──
const JUMP_BAR_HTML = `  <div class="article-jump-bar">
    <label for="article-jump">Vai a:</label>
    <select id="article-jump"></select>
    <a href="home.html#search" class="global-search-link" title="Cerca in tutti i codici">🔍 Tutti i codici</a>
  </div>
  `;

// ── Marker per evitare doppi patch ──
const MARKER = '/* ── ARTICLE JUMP BAR (v1.2.3) ── */';

function patchCodice(slug) {
  const path = resolve(CODICI_DIR, slug + '.html');
  let html = readFileSync(path, 'utf8');

  // Normalizza i CRLF in LF: a fine patch riconvertiremo per coerenza con il resto
  // del progetto. Tutte le ricerche/sostituzioni avvengono su LF.
  const hadCrlf = html.includes('\r\n');
  if (hadCrlf) html = html.replace(/\r\n/g, '\n');

  if (html.includes(MARKER)) {
    console.log(`  [skip] ${slug}.html già patchato`);
    return false;
  }

  // 1) Inietta CSS prima dell'ultimo </style> prima di </head>
  const styleClose = html.indexOf('</style>\n</head>');
  if (styleClose < 0) throw new Error('</style></head> non trovato in ' + slug);
  html = html.slice(0, styleClose) + CSS_BLOCK + '\n' + html.slice(styleClose);

  // 2) Inietta HTML jump-bar dentro <main>, prima di <div id="article-view">
  const mainAnchor = '<main class="main-content" id="main">\n  <div id="article-view"></div>';
  if (!html.includes(mainAnchor)) throw new Error('main anchor non trovato in ' + slug);
  html = html.replace(
    mainAnchor,
    '<main class="main-content" id="main">\n' + JUMP_BAR_HTML + '<div id="article-view"></div>'
  );

  // 3) Patch JS init(): scroll wake-up + populateJump
  const initAnchor = `    showArticle(initIdx);

    document.getElementById('search').addEventListener('input', onSearch);`;
  const initReplacement = `    showArticle(initIdx);
    populateJump();

    // Workaround WebView Android: dopo il primo render dinamico il gesture
    // detector non si attiva finché l'utente non tocca un elemento focusabile.
    // Forziamo un piccolo "tickle" scroll + resize per svegliarlo.
    setTimeout(function() {
      window.scrollTo(0, 1); window.scrollTo(0, 0);
      window.dispatchEvent(new Event('resize'));
    }, 50);
    setTimeout(function() { window.scrollTo(0, 1); window.scrollTo(0, 0); }, 400);

    document.getElementById('search').addEventListener('input', onSearch);`;
  if (!html.includes(initAnchor)) throw new Error('init anchor non trovato in ' + slug);
  html = html.replace(initAnchor, initReplacement);

  // 4) Aggiungi sync del select in showArticle: subito dopo "currentIdx = idx;"
  const syncAnchor = `    currentIdx = idx;
    var art = CODE.articles[idx];`;
  const syncReplacement = `    currentIdx = idx;
    var art = CODE.articles[idx];

    // Sync dropdown jump
    var jumpSel = document.getElementById('article-jump');
    if (jumpSel) jumpSel.value = String(idx);`;
  if (!html.includes(syncAnchor)) throw new Error('sync anchor non trovato in ' + slug);
  html = html.replace(syncAnchor, syncReplacement);

  // 5) Aggiungi la funzione populateJump prima di "function showArticle(idx)"
  const populateAnchor = `  function showArticle(idx) {`;
  const populateFn = `  function populateJump() {
    var sel = document.getElementById('article-jump');
    if (!sel) return;
    var html = '';
    var lastGroup = null;
    var inGroup = false;
    CODE.articles.forEach(function(art, i) {
      if (art.group && art.group !== lastGroup) {
        if (inGroup) html += '</optgroup>';
        var gLabel = art.group.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        html += '<optgroup label="' + gLabel + '">';
        lastGroup = art.group;
        inGroup = true;
      }
      var label = art.numText + (art.heading ? ' — ' + art.heading : '');
      if (label.length > 90) label = label.slice(0, 87) + '…';
      var safe = label.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      html += '<option value="' + i + '">' + safe + '</option>';
    });
    if (inGroup) html += '</optgroup>';
    sel.innerHTML = html;
    sel.addEventListener('change', function() {
      var idx = parseInt(this.value, 10);
      if (!isNaN(idx)) showArticle(idx);
    });
  }

  function showArticle(idx) {`;
  // Sostituisci SOLO la prima occorrenza
  const populatePos = html.indexOf(populateAnchor);
  if (populatePos < 0) throw new Error('populate anchor non trovato in ' + slug);
  html = html.slice(0, populatePos) + populateFn + html.slice(populatePos + populateAnchor.length);

  if (hadCrlf) html = html.replace(/\n/g, '\r\n');
  writeFileSync(path, html, 'utf8');
  console.log(`  [ok]   ${slug}.html`);
  return true;
}

// ── Patch home.html per gestire #search ──
function patchHome() {
  const path = resolve(CODICI_DIR, 'home.html');
  let html = readFileSync(path, 'utf8');
  const hadCrlf = html.includes('\r\n');
  if (hadCrlf) html = html.replace(/\r\n/g, '\n');

  const HOME_MARKER = '/* HOME-SEARCH-V123 */';
  if (html.includes(HOME_MARKER)) {
    console.log('  [skip] home.html già patchato');
    return false;
  }

  // Aggiungi al termine del IIFE doSearch (subito prima del "})();" finale dello script)
  const anchor = `  input.addEventListener('focus', function() {
    if (resultsEl.innerHTML) resultsEl.classList.add('visible');
  });
})();`;
  const replacement = `  input.addEventListener('focus', function() {
    if (resultsEl.innerHTML) resultsEl.classList.add('visible');
  });

  /* HOME-SEARCH-V123 */
  // Se l'utente arriva con #search (es. dal link "Tutti i codici" di un codice),
  // scroll alla barra e focus automatico.
  function focusSearch() {
    try {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch(e) { window.scrollTo(0, 0); }
    setTimeout(function() { input.focus(); }, 250);
  }
  if (location.hash === '#search') focusSearch();
  window.addEventListener('hashchange', function() {
    if (location.hash === '#search') focusSearch();
  });

  // Workaround WebView Android: forza wake-up scroll dopo il primo paint.
  setTimeout(function() {
    window.scrollTo(0, 1); window.scrollTo(0, 0);
    window.dispatchEvent(new Event('resize'));
  }, 80);
})();`;

  if (!html.includes(anchor)) throw new Error('anchor finale IIFE non trovato in home.html');
  html = html.replace(anchor, replacement);

  if (hadCrlf) html = html.replace(/\n/g, '\r\n');
  writeFileSync(path, html, 'utf8');
  console.log('  [ok]   home.html');
  return true;
}

// ── Run ──
console.log('Patch v1.2.3 dei codici…');
let n = 0;
for (const slug of CODICI) {
  try {
    if (patchCodice(slug)) n++;
  } catch (e) {
    console.error(`  [err]  ${slug}.html: ${e.message}`);
    process.exit(1);
  }
}
try {
  if (patchHome()) n++;
} catch (e) {
  console.error(`  [err]  home.html: ${e.message}`);
  process.exit(1);
}
console.log(`\nFatto. ${n} file modificati.`);
