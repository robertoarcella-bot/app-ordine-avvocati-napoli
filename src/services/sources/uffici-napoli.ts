/**
 * Aggregatore news degli Uffici Giudiziari di Napoli.
 *
 * Fonti (entrambe basate su JSF, identiche a pst.giustizia.it):
 *  - Tribunale di Napoli:    https://tribunale-napoli.giustizia.it/it/news.page
 *  - Corte d'Appello Napoli: https://ca-napoli.giustizia.it/it/news.page
 *
 * Le news hanno link al dettaglio nel formato:
 *  /it/paginadettaglio.page?contentId=CTM<num>&modelId=<num>
 *
 * (UNEP: la pagina /it/unep_presso_la_corte_d_appell.page non e' un feed
 * di news ma una scheda informativa statica; non viene inclusa.)
 *
 * Output: lista unica ordinata per data discendente.
 */

import { Capacitor } from '@capacitor/core';
import * as cheerio from 'cheerio';
import { fetchText } from './http';
import type { SourceNewsItem } from '../../config/sources';

const SOURCE_ID = 'uffici-na';

interface OfficeFeed {
  officeId: string;
  officeLabel: string;
  origin: string;        // base URL (es. https://tribunale-napoli.giustizia.it)
  newsListPath: string;  // path della pagina news (es. /it/news.page)
  proxyPrefix: string;   // prefisso per dev mode (es. /proxy/tnna)
}

const FEEDS: OfficeFeed[] = [
  {
    officeId: 'tribunale',
    officeLabel: 'Tribunale di Napoli',
    origin: 'https://tribunale-napoli.giustizia.it',
    newsListPath: '/it/news.page',
    proxyPrefix: '/proxy/tnna',
  },
  {
    officeId: 'corte-appello',
    officeLabel: "Corte d'Appello di Napoli",
    origin: 'https://ca-napoli.giustizia.it',
    newsListPath: '/it/news.page',
    proxyPrefix: '/proxy/cana',
  },
];

const MONTHS_IT: Record<string, number> = {
  gen: 0, gennaio: 0,
  feb: 1, febbraio: 1,
  mar: 2, marzo: 2,
  apr: 3, aprile: 3,
  mag: 4, maggio: 4,
  giu: 5, giugno: 5,
  lug: 6, luglio: 6,
  ago: 7, agosto: 7,
  set: 8, settembre: 8,
  ott: 9, ottobre: 9,
  nov: 10, novembre: 10,
  dic: 11, dicembre: 11,
};

function parseItalianDate(s: string): string | undefined {
  // "20 aprile 2026" / "20 apr 2026"
  const m = s.toLowerCase().match(/(\d{1,2})\s+([a-zà]{3,12})\s+(\d{4})/);
  if (!m) return undefined;
  const day = parseInt(m[1], 10);
  const month = MONTHS_IT[m[2]] ?? MONTHS_IT[m[2].slice(0, 3)];
  const year = parseInt(m[3], 10);
  if (month === undefined || isNaN(day) || isNaN(year)) return undefined;
  return new Date(Date.UTC(year, month, day, 12)).toISOString();
}

function extractContentId(href: string): string | undefined {
  const m = href.match(/contentId=([A-Z]+\d+)/i);
  return m ? m[1] : undefined;
}

async function fetchOffice(feed: OfficeFeed): Promise<SourceNewsItem[]> {
  const url = Capacitor.isNativePlatform()
    ? feed.origin + feed.newsListPath
    : feed.proxyPrefix + feed.newsListPath;
  const html = await fetchText(url);
  const $ = cheerio.load(html);

  const items: SourceNewsItem[] = [];
  const seen = new Set<string>();

  $('a[href*="contentId="]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href') || '';
    const contentId = extractContentId(href);
    if (!contentId || seen.has(contentId)) return;
    seen.add(contentId);

    const absLink = href.startsWith('http')
      ? href
      : feed.origin + (href.startsWith('/') ? href : '/' + href);

    // Risali al contenitore "card"
    const $card = $a.closest('li, article, .news-item, .card, .card-body, div').first();
    let title = $card.find('h5, h4, h3, h2').first().text().trim();
    if (!title) title = $a.text().trim();
    if (!title || title.length < 5) return;

    const cardText = $card.text();
    const dateMatch = cardText.match(/\d{1,2}\s+[a-zà]{3,12}\s+\d{4}/i);
    const dateRaw = dateMatch ? dateMatch[0] : undefined;
    const dateIso = dateRaw ? parseItalianDate(dateRaw) : undefined;

    // Excerpt: testo del card, senza il titolo
    let excerpt = cardText.replace(title, '').replace(/\s+/g, ' ').trim();
    if (dateRaw) excerpt = excerpt.replace(dateRaw, '').trim();
    if (excerpt.length > 220) excerpt = excerpt.slice(0, 220) + '…';

    items.push({
      id: `${SOURCE_ID}:${feed.officeId}:${contentId}`,
      sourceId: SOURCE_ID,
      title,
      date: dateIso || dateRaw,
      excerpt: excerpt || undefined,
      link: absLink,
      category: feed.officeLabel,
    });
  });

  return items;
}

/**
 * Restituisce la lista aggregata di news di tutti gli uffici giudiziari,
 * ordinata per data discendente. Le richieste sono fatte in parallelo.
 *
 * Robusto a fallimenti parziali: se una fonte fallisce, l'altra continua.
 */
export async function fetchUfficiNapoliNews(_page = 1): Promise<SourceNewsItem[]> {
  const settled = await Promise.allSettled(FEEDS.map(fetchOffice));
  const all: SourceNewsItem[] = [];
  settled.forEach((r) => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });
  // Ordina per data ISO discendente (le voci senza data vanno in fondo)
  all.sort((a, b) => {
    const da = a.date && /^\d{4}-/.test(a.date) ? a.date : '';
    const db = b.date && /^\d{4}-/.test(b.date) ? b.date : '';
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.localeCompare(da);
  });
  return all;
}
