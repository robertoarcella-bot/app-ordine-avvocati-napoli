/**
 * Test isolato dello scraper PST.
 * Replica la logica di src/services/sources/pst.ts ma usando fetch nativo
 * (nessuna dipendenza da Capacitor). Esegui con:
 *   node scripts/test-pst.mjs
 */

import * as cheerio from 'cheerio';

const PST_BASE = 'https://pst.giustizia.it';
const PST_LIST_URL = `${PST_BASE}/PST/it/news.page`;
const ABS_BASE_FOR_LINKS = `${PST_BASE}/PST/`;

function toAbsoluteUrl(href) {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return `${PST_BASE}${href}`;
  return new URL(href, ABS_BASE_FOR_LINKS).toString();
}

function parseItalianDate(s) {
  const months = { gen:0,feb:1,mar:2,apr:3,mag:4,giu:5,lug:6,ago:7,set:8,ott:9,nov:10,dic:11 };
  const m = s.toLowerCase().match(/(\d{1,2})\s+([a-zà]+)\.?\s+(\d{4})/);
  if (!m) return undefined;
  const day = parseInt(m[1], 10);
  const monthKey = m[2].slice(0, 3);
  const year = parseInt(m[3], 10);
  const month = months[monthKey];
  if (month === undefined) return undefined;
  return new Date(Date.UTC(year, month, day, 12)).toISOString();
}

function extractContentId(link) {
  const m = link.match(/contentId=([A-Z]+\d+)/i);
  return m ? m[1] : undefined;
}

async function fetchPstNews(page = 1) {
  const url = page > 1 ? `${PST_LIST_URL}?frame6_item=${page}` : PST_LIST_URL;
  const t0 = Date.now();
  const res = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'AppOrdineAvvocatiNapoli/1.0',
    },
  });
  const html = await res.text();
  const fetchMs = Date.now() - t0;
  console.log(`HTTP ${res.status} | ${html.length.toLocaleString()} bytes | ${fetchMs} ms`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const $ = cheerio.load(html);
  const items = [];
  const seen = new Set();

  $('a[href*="contentId=NWS"]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href') || '';
    const absLink = toAbsoluteUrl(href);
    const contentId = extractContentId(href);
    if (!contentId || seen.has(contentId)) return;
    seen.add(contentId);

    const $card = $a.closest('li, article, .news-item, .card, div').first();

    let title = $card.find('h5, h4, h3, h2').first().text().trim();
    if (!title) title = $a.text().trim();
    if (!title || title.length < 5) return;

    const cardText = $card.text();
    const dateMatch = cardText.match(/\d{1,2}\s+[a-zà]{3,9}\.?\s+\d{4}/i);
    const dateRaw = dateMatch ? dateMatch[0] : undefined;
    const dateIso = dateRaw ? parseItalianDate(dateRaw) : undefined;

    const catMatch = cardText.match(/\b(Avvisi|News|Comunicazioni)\b/);
    const category = catMatch ? catMatch[1] : undefined;

    const $img = $card.find('img').first();
    const imgSrc = $img.attr('src');
    const imageUrl = imgSrc ? toAbsoluteUrl(imgSrc) : undefined;

    items.push({
      id: `pst:${contentId}`,
      title,
      date: dateIso || dateRaw,
      category,
      imageUrl,
      link: absLink,
    });
  });

  return items;
}

async function main() {
  console.log('=== Test scraper PST ===\n');

  console.log('--- Pagina 1 ---');
  const p1 = await fetchPstNews(1);
  console.log(`Estratti ${p1.length} item\n`);
  p1.slice(0, 5).forEach((it, i) => {
    console.log(`[${i + 1}] ${it.id}`);
    console.log(`    Titolo:   ${it.title.slice(0, 90)}${it.title.length > 90 ? '…' : ''}`);
    console.log(`    Data:     ${it.date || '(non rilevata)'}`);
    console.log(`    Categoria:${it.category ? ' ' + it.category : ' (none)'}`);
    console.log(`    Immagine: ${it.imageUrl ? 'sì' : 'no'}`);
    console.log(`    Link:     ${it.link.slice(0, 100)}`);
    console.log();
  });

  console.log('--- Pagina 2 (paginazione) ---');
  try {
    const p2 = await fetchPstNews(2);
    console.log(`Estratti ${p2.length} item`);
    const overlap = p2.filter(b => p1.some(a => a.id === b.id)).length;
    console.log(`Sovrapposizione con p1: ${overlap} item`);
    if (p2.length > 0) {
      console.log(`Esempio p2[0]: ${p2[0].id} - ${p2[0].title.slice(0, 70)}…`);
    }
  } catch (e) {
    console.log('Errore p2:', e.message);
  }

  // Statistiche utili
  console.log('\n--- Statistiche pagina 1 ---');
  const withDate = p1.filter(i => i.date).length;
  const withCat = p1.filter(i => i.category).length;
  const withImg = p1.filter(i => i.imageUrl).length;
  console.log(`Con data:      ${withDate}/${p1.length} (${Math.round(100*withDate/p1.length)}%)`);
  console.log(`Con categoria: ${withCat}/${p1.length} (${Math.round(100*withCat/p1.length)}%)`);
  console.log(`Con immagine:  ${withImg}/${p1.length} (${Math.round(100*withImg/p1.length)}%)`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
