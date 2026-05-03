/* eslint-disable no-undef */
/**
 * Genera cad.html e codice-processo-amministrativo.html partendo dagli XML
 * AkomaNtoso di Normattiva e dal template di costituzione.html già presente
 * nella miniapp dei codici. Adotta lo stesso stile della webapp originale:
 * un <p> per ogni comma numerato, note di aggiornamento separate in
 * notesHtml, heading pulito dalle parentesi.
 *
 * Uso: node scripts/genera_codici_aggiuntivi.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CODICI_DIR = resolve(ROOT, 'public/miniapps/codici');
const XML_DIR = "C:/Users/rober/kDrive/__CODING_PROVVISORIA/CODICI XML";

function clean(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sostituisce nel sotto-albero tutti i tag inline (ref, ins, mod, mref, def, span)
 * con il loro contenuto testuale, lasciando solo il testo.
 */
function flattenInline($, $node) {
  $node.find('ref, mref, mod, def, span').each((_, el) => {
    const $el = $(el);
    $el.replaceWith($el.text());
  });
  // Le <ins> sono inserzioni di Normattiva: il loro testo è già contenuto
  // (es. ((289a))). Le rimuoviamo del tutto perché nella webapp originale
  // appaiono come riferimenti tra parentesi tonde nel testo principale.
  $node.find('ins').each((_, el) => {
    const $el = $(el);
    $el.replaceWith(' ' + $el.text() + ' ');
  });
}

/**
 * Renderizza un singolo <paragraph> di tipo "comma" (con eId) in HTML <p>.
 * Lo stile riproduce quello della webapp originale: un solo <p> col numero
 * (es. "1.", "2-bis.") seguito dal testo, e gli eventuali point in linea
 * con la loro lettera (es. " a) ... b) ...").
 */
function commaToHtml($, $par) {
  const num = clean($par.children('num').first().text());
  const $body = $par.clone();
  $body.children('num').first().remove();
  flattenInline($, $body);

  // Caso semplice: <content><p>...</p></content>
  let txt = '';
  const $directContent = $body.children('content').first();
  if ($directContent.length) {
    txt = clean($directContent.text());
  } else {
    // Con liste
    const $list = $body.children('list').first();
    if ($list.length) {
      const intro = clean($list.children('intro').text());
      const points = [];
      $list.children('point').each((_, p) => {
        const $p = $(p);
        const pn = clean($p.children('num').first().text());
        const pc = clean($p.find('content').text());
        if (pc) points.push((pn ? pn + ' ' : '') + pc);
      });
      const tail = clean($list.children('wrapUp').text());
      txt = [intro, points.join(' '), tail].filter(Boolean).join(' ');
    } else {
      txt = clean($body.text());
    }
  }
  if (!txt) return '';
  const prefix = num ? num + ' ' : '';
  return `<p>${escapeHtml(prefix + txt)}</p>`;
}

/**
 * Renderizza un <paragraph> SENZA eId (note di aggiornamento) come HTML.
 * Mantiene la struttura "<p>--------</p><p>AGGIORNAMENTO (X)</p><p>testo...</p>".
 */
function noteParagraphToHtml($, $par) {
  const $clone = $par.clone();
  flattenInline($, $clone);
  let html = '';
  $clone.find('content > p').each((_, p) => {
    const txt = clean($(p).text());
    if (!txt) return;
    html += `<p>${escapeHtml(txt)}</p>`;
  });
  return html;
}

function articleToObj($, $art, group) {
  const eId = $art.attr('eId') || '';
  let num = clean($art.children('num').first().text()).replace(/\.$/, '');
  let heading = clean($art.children('heading').first().text());
  // Heading con parentesi tonde: rimuovile (lo stile originale è senza)
  heading = heading.replace(/^\(/, '').replace(/\)$/, '').trim();

  let contentHtml = '';
  let notesHtml = '';
  $art.children('paragraph').each((_, par) => {
    const $par = $(par);
    const parEId = $par.attr('eId') || '';
    if (!parEId) {
      notesHtml += noteParagraphToHtml($, $par);
    } else {
      contentHtml += commaToHtml($, $par);
    }
  });

  return { id: eId, numText: num, group, heading, contentHtml, notesHtml };
}

/** CAD: <body><chapter><article>... */
function parseCAD(xmlPath) {
  const xml = readFileSync(xmlPath, 'utf8');
  const $ = load(xml, { xmlMode: true });
  const articles = [];
  const $body = $('akomaNtoso > act > body').first();

  function walk($node, parentGroup) {
    $node.children().each((_, el) => {
      const $el = $(el);
      const tag = (el.tagName || el.name || '').toLowerCase();
      if (tag === 'article') {
        articles.push(articleToObj($, $el, parentGroup));
      } else if (['chapter', 'section', 'title', 'part', 'book'].includes(tag)) {
        const num = clean($el.children('num').first().text());
        const heading = clean($el.children('heading').first().text());
        const bits = [parentGroup, num && num !== '-' ? num : '', heading].filter(Boolean);
        const newGroup = bits.join(' ').trim() || parentGroup;
        walk($el, newGroup);
      } else {
        walk($el, parentGroup);
      }
    });
  }
  walk($body, '');
  return articles;
}

/**
 * CPA: ogni articolo è in <attachment><doc name="Allegato 1 ... -art. N">.
 * Il contenuto è in <mainBody><paragraph><content><p>...</p></content></paragraph>
 * come testo plain con boilerplate "Art. N\n\nHEADING\n\n1. ... 2. ...".
 * Estraiamo heading e splittiamo i commi.
 */
function parseCPA(xmlPath) {
  const xml = readFileSync(xmlPath, 'utf8');
  const $ = load(xml, { xmlMode: true });
  const articles = [];

  // Mappa nome allegato → group + id-suffix per disambiguare gli articoli
  // (ogni allegato riparte da art. 1).
  const ALLEGATI = [
    { match: /^Allegato 1 /i, group: 'Allegato 1 — Codice del processo amministrativo', suffix: '' },
    { match: /^Allegato 2 /i, group: 'Allegato 2 — Norme di attuazione',                suffix: '_all2' },
    { match: /^Allegato 3 /i, group: 'Allegato 3 — Norme transitorie',                  suffix: '_all3' },
    { match: /^Allegato 4 /i, group: 'Allegato 4 — Disposizioni abrogative e di coordinamento', suffix: '_all4' },
  ];

  $('attachment > doc').each((_, doc) => {
    const $doc = $(doc);
    const name = $doc.attr('name') || '';
    const meta = ALLEGATI.find(a => a.match.test(name));
    if (!meta) return; // skip "Indice generale" e altri non-articoli
    const m = /art\.\s*(\d+(?:[\s\-]?(?:bis|ter|quater|quinquies|sexies|septies|octies|novies|decies))?)/i.exec(name);
    if (!m) return;
    const numRaw = m[1].replace(/\s+/g, '-').toLowerCase();
    const numText = `Art. ${numRaw}`;
    const id = `art_${numRaw}${meta.suffix}`;
    const groupDefault = meta.group;
    const $body = $doc.find('mainBody').first();
    if (!$body.length) return;
    const $clone = $body.clone();
    flattenInline($, $clone);
    let txt = $clone.text().replace(/\r\n?/g, '\n').replace(/[\t ]+/g, ' ');
    const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);

    // Salta l'introduzione: "ALLEGATO 1", "Codice del processo amministrativo"
    // e la riga "Art. N" stessa.
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^Art\.\s*\d/i.test(lines[i])) { startIdx = i + 1; break; }
    }
    const body = lines.slice(startIdx);

    let heading = '';
    let contentLines = [];
    if (body.length && !/^\d+\s*([\-\.]|bis|ter|quater|quinquies|sexies|septies|octies|novies|decies)/i.test(body[0]) && !/^\(/.test(body[0])) {
      heading = body[0].replace(/^\(/, '').replace(/\)$/, '').trim();
      contentLines = body.slice(1);
    } else {
      contentLines = body;
    }

    // Identifica righe di nota di aggiornamento: dopo una riga "------" tutto il
    // resto va in notesHtml.
    let noteStartIdx = -1;
    for (let i = 0; i < contentLines.length; i++) {
      const ln = contentLines[i];
      // Riga di trattini (>= 5)
      if (/^-{5,}$/.test(ln)) { noteStartIdx = i; break; }
      if (/^AGGIORNAMENTO\s*\(/i.test(ln)) { noteStartIdx = i; break; }
    }
    const mainLines = noteStartIdx >= 0 ? contentLines.slice(0, noteStartIdx) : contentLines;
    const noteLines = noteStartIdx >= 0 ? contentLines.slice(noteStartIdx) : [];

    // Costruisci contentHtml splittando ai numeri di comma
    let contentHtml = '';
    let buf = '';
    const flush = () => {
      const t = clean(buf);
      if (t) contentHtml += `<p>${escapeHtml(t)}</p>`;
      buf = '';
    };
    for (const ln of mainLines) {
      // Inizio nuovo comma se la riga inizia con un numero seguito da "." o "-bis." ecc.
      if (/^(\d+(-bis|-ter|-quater|-quinquies|-sexies|-septies|-octies|-novies|-decies)?)\./i.test(ln)) {
        flush();
        buf = ln;
      } else {
        buf += (buf ? ' ' : '') + ln;
      }
    }
    flush();
    if (!contentHtml) contentHtml = `<p>${escapeHtml(clean(mainLines.join(' ')))}</p>`;

    // notesHtml: ogni riga in un <p>
    let notesHtml = '';
    for (const ln of noteLines) {
      notesHtml += `<p>${escapeHtml(ln)}</p>`;
    }

    articles.push({ id, numText, group: groupDefault, heading, contentHtml, notesHtml });
  });

  // Ordina per allegato (l'id contiene il suffix), poi per numero+suffisso
  const allegatoOrder = id => {
    if (id.endsWith('_all2')) return 1;
    if (id.endsWith('_all3')) return 2;
    if (id.endsWith('_all4')) return 3;
    return 0;
  };
  const numKey = s => {
    const m = /(\d+)([a-z\-]*)?/i.exec(s);
    if (!m) return [9999, ''];
    return [parseInt(m[1], 10), (m[2] || '').toLowerCase()];
  };
  articles.sort((a, b) => {
    const oa = allegatoOrder(a.id), ob = allegatoOrder(b.id);
    if (oa !== ob) return oa - ob;
    const [na, sa] = numKey(a.numText);
    const [nb, sb] = numKey(b.numText);
    if (na !== nb) return na - nb;
    return sa.localeCompare(sb);
  });

  return articles;
}

function buildHtml(templateHtml, codeMeta, articles) {
  const codeObj = {
    title: codeMeta.title,
    shortTitle: codeMeta.shortTitle,
    slug: codeMeta.slug,
    vigenza: codeMeta.vigenza,
    color: codeMeta.color,
    articles,
  };
  const codeJson = JSON.stringify(codeObj);

  // Sostituisci il blocco const CODE = {...}; bilanciando le graffe.
  const start = templateHtml.indexOf('const CODE = ');
  if (start < 0) throw new Error('Template senza "const CODE = "');
  const braceStart = templateHtml.indexOf('{', start);
  let depth = 0, end = -1;
  for (let i = braceStart; i < templateHtml.length; i++) {
    const c = templateHtml[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end < 0) throw new Error('Template: graffe non bilanciate');
  // Includi anche il ; finale
  let semiEnd = end;
  while (semiEnd < templateHtml.length && /\s/.test(templateHtml[semiEnd])) semiEnd++;
  if (templateHtml[semiEnd] === ';') semiEnd++;

  let out = templateHtml.slice(0, start) + 'const CODE = ' + codeJson + ';' + templateHtml.slice(semiEnd);
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${codeMeta.title}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${codeMeta.description || codeMeta.title}">`);
  return out;
}

const TEMPLATE = readFileSync(resolve(CODICI_DIR, 'costituzione.html'), 'utf8');

// CAD
{
  const xmlPath = resolve(XML_DIR, "Codice dell'amministrazione digitale.xml");
  const articles = parseCAD(xmlPath);
  console.log(`CAD: ${articles.length} articoli`);
  const html = buildHtml(TEMPLATE, {
    title: "Codice dell'amministrazione digitale",
    shortTitle: 'CAD',
    slug: 'cad',
    vigenza: '30/01/2025',
    color: '#0066CC',
    description: "Codice dell'amministrazione digitale (D.Lgs. 7 marzo 2005, n. 82) — testo coordinato con tutte le modifiche.",
  }, articles);
  writeFileSync(resolve(CODICI_DIR, 'cad.html'), html, 'utf8');
  console.log('  → public/miniapps/codici/cad.html');
}

// CPA
{
  const xmlPath = resolve(XML_DIR, 'Codice del processo amministrativo.xml');
  const articles = parseCPA(xmlPath);
  console.log(`CPA: ${articles.length} articoli`);
  const html = buildHtml(TEMPLATE, {
    title: 'Codice del processo amministrativo',
    shortTitle: 'CPA',
    slug: 'codice-processo-amministrativo',
    vigenza: '08/10/2025',
    color: '#0066CC',
    description: 'Codice del processo amministrativo (D.Lgs. 2 luglio 2010, n. 104, Allegato 1).',
  }, articles);
  writeFileSync(resolve(CODICI_DIR, 'codice-processo-amministrativo.html'), html, 'utf8');
  console.log('  → public/miniapps/codici/codice-processo-amministrativo.html');
}
