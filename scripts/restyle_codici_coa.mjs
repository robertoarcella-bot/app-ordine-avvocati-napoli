/* eslint-disable no-undef */
/**
 * Applica il tema istituzionale COA Napoli (blu #0066CC + bianco) ai file
 * della miniapp codici. Sostituisce le CSS variables del tema scuro originale
 * e i gradient hardcoded.
 *
 * Uso: node scripts/restyle_codici_coa.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CODICI_DIR = resolve(__dirname, '..', 'public/miniapps/codici');

// Palette COA istituzionale
const COA = {
  primary: '#0066CC',
  primaryShade: '#003F7F',
  primaryTint: '#1A75D1',
  secondary: '#C9A24A',
  bg: '#ffffff',
  surface: '#f6f8fb',
  surface2: '#eef2f8',
  border: 'rgba(0,102,204,.15)',
  text: '#1a1a1a',
  muted: '#5a6675',
};

/** Patch della home.html (palette dark → light + accenti blu COA) */
function patchHome(html) {
  let h = html;
  h = h.replace('<meta name="theme-color" content="#0d1117">',
                `<meta name="theme-color" content="${COA.primary}">`);
  h = h.replace('--bg: #0d1117;', `--bg: ${COA.bg};`);
  h = h.replace('--surface: #161b27;', `--surface: ${COA.surface};`);
  h = h.replace('--surface2: #1e2535;', `--surface2: ${COA.surface2};`);
  h = h.replace('--border: rgba(255,255,255,.08);', `--border: ${COA.border};`);
  h = h.replace('--text: #e6edf3;', `--text: ${COA.text};`);
  h = h.replace('--muted: #8b949e;', `--muted: ${COA.muted};`);
  h = h.replace('--gold: #c9a227;', `--gold: ${COA.secondary};`);
  // Hero gradient → blu COA
  h = h.replace(
    'linear-gradient(160deg, #0d1117 0%, #141a2a 60%, #1a1434 100%)',
    `linear-gradient(160deg, ${COA.primary} 0%, ${COA.primaryShade} 60%, ${COA.primaryTint} 100%)`
  );
  // Hero h1 testo bianco/azzurrino: lascia (è già bianco)
  // color-mix delle card: 15% accento + #161b27 → 12% accento + white
  h = h.replace(
    'background: color-mix(in srgb, var(--card-color) 15%, #161b27);',
    `background: color-mix(in srgb, var(--card-color) 12%, white);`
  );
  // Aggiungi un blocco di patch finale (per overrides a prova di fallback)
  const overrideStyle = `
<style>
/* === Tema COA Napoli (override istituzionale) === */
.hero-badge { color: rgba(255,255,255,.92); border-color: rgba(255,255,255,.35); background: rgba(255,255,255,.10); }
.hero-badge:hover { color: #fff; border-color: rgba(255,255,255,.6); }
.hero h1 { background: linear-gradient(135deg, #fff 0%, #e8f0fb 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle, .hero p { color: rgba(255,255,255,.92) !important; }
.code-card {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  color: var(--text) !important;
  box-shadow: 0 2px 8px rgba(0,102,204,.08);
}
.code-card:hover { box-shadow: 0 6px 20px rgba(0,102,204,.18); }
.code-card .code-card-title, .code-card h3, .code-card h2 { color: var(--text) !important; }
.code-card .code-card-desc, .code-card p { color: var(--muted) !important; }
footer { background: var(--surface) !important; color: var(--muted) !important; border-top: 1px solid var(--border) !important; }
footer a, .hero a:not(.hero-badge):not(.code-card) { color: ${COA.primary}; }
input, .search-input, #global-search {
  background: #fff !important; color: var(--text) !important; border: 1px solid var(--border) !important;
}
input::placeholder { color: var(--muted) !important; }
</style>`;
  h = h.replace('</head>', overrideStyle + '\n</head>');
  return h;
}

/** Patch delle pagine codice (sidebar dark → blu COA, restano main chiaro) */
function patchCodicePage(html) {
  let h = html;
  h = h.replace('<meta name="theme-color" content="#0d1117">',
                `<meta name="theme-color" content="${COA.primary}">`);
  // Sidebar
  h = h.replace('--sidebar-bg: #12192b;', `--sidebar-bg: ${COA.primaryShade};`);
  h = h.replace('--sidebar-text: #c8d3e8;', `--sidebar-text: #ffffff;`);
  h = h.replace('--sidebar-muted: #7a8baa;', `--sidebar-muted: #d6e2f4;`);
  h = h.replace('--sidebar-hover: rgba(255,255,255,.07);', `--sidebar-hover: rgba(255,255,255,.12);`);
  h = h.replace('--sidebar-active-bg: rgba(255,255,255,.13);', `--sidebar-active-bg: rgba(255,255,255,.20);`);
  h = h.replace('--sidebar-border: rgba(255,255,255,.08);', `--sidebar-border: rgba(255,255,255,.18);`);
  // Append override for any --code-color: imposto blu COA come fallback se è troppo scuro/non leggibile
  // ma lascio --code-color del singolo codice per mantenere l'identità visiva.
  return h;
}

const files = readdirSync(CODICI_DIR).filter(f => f.endsWith('.html'));
for (const f of files) {
  const fp = resolve(CODICI_DIR, f);
  let h = readFileSync(fp, 'utf8');
  if (f === 'home.html') {
    h = patchHome(h);
  } else {
    h = patchCodicePage(h);
  }
  writeFileSync(fp, h, 'utf8');
  console.log('patched ' + basename(fp));
}
