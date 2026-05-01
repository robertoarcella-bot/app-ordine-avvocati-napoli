/**
 * Test isolato dello scraper Giustizia Amministrativa.
 * Esegui con: node scripts/test-ga.mjs
 */

import * as cheerio from 'cheerio';

const GA_BASE = 'https://www.giustizia-amministrativa.it';
const GA_NEWS_URL = `${GA_BASE}/news`;

function toAbsoluteUrl(href) {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return `${GA_BASE}${href}`;
  return new URL(href, GA_BASE + '/').toString();
}

function extractDateHint(title) {
  const m = title.match(/n\.\s*(\d+)\/(\d{4})/i);
  if (!m) return undefined;
  const year = parseInt(m[2], 10);
  if (!year || year < 2000 || year > 2100) return undefined;
  return new Date(Date.UTC(year, 0, 1, 12, 0, 0)).toISOString();
}

async function fetchGa() {
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(GA_NEWS_URL, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'AppOrdineAvvocatiNapoli/1.0',
      },
    });
  } catch (e) {
    console.error('FETCH FAILED:', e.message);
    if (e.cause) console.error('cause:', e.cause.code || e.cause.message);
    throw e;
  }
  const html = await res.text();
  console.log(`HTTP ${res.status} | ${html.length.toLocaleString()} bytes | ${Date.now() - t0} ms`);

  const $ = cheerio.load(html);
  const items = [];
  const seen = new Set();

  $('article.ricerca--item').each((_, el) => {
    const $art = $(el);
    const $titleA = $art.find('h3 a.item-title').first();
    const title = $titleA.text().trim();
    const link = toAbsoluteUrl($titleA.attr('href'));
    if (!title || !link) return;

    const idMatch = link.match(/\/-\/([\w-]+)/);
    const localId = idMatch ? idMatch[1] : link;
    if (seen.has(localId)) return;
    seen.add(localId);

    const excerpt = $art.find('p.two-rows, p.hidden-xs').first().text().trim();

    items.push({
      id: `ga:${localId}`,
      title,
      date: extractDateHint(title),
      excerpt: excerpt || undefined,
      link,
    });
  });

  return items;
}

async function main() {
  console.log('=== Test scraper Giustizia Amministrativa ===\n');
  const items = await fetchGa();
  console.log(`Estratti ${items.length} item\n`);
  items.slice(0, 5).forEach((it, i) => {
    console.log(`[${i + 1}] ${it.id}`);
    console.log(`    Titolo: ${it.title.slice(0, 90)}${it.title.length > 90 ? '…' : ''}`);
    console.log(`    Data:   ${it.date || '(non rilevata)'}`);
    console.log(`    Excerpt:${it.excerpt ? ' ' + it.excerpt.slice(0, 120) + '…' : ' (none)'}`);
    console.log();
  });
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
