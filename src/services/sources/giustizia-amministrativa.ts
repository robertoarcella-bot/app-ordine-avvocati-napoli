/**
 * Scraper per giustizia-amministrativa.it/news (Consiglio di Stato e TAR).
 *
 * Sito basato su Liferay, niente RSS pubblico. Estraiamo le news parsando
 * gli `<article class="ricerca--item">` della pagina news.
 */

import { Capacitor } from '@capacitor/core';
import * as cheerio from 'cheerio';
import { fetchText } from './http';
import type { SourceNewsItem } from '../../config/sources';

const SOURCE_ID = 'ga';
const GA_BASE = 'https://www.giustizia-amministrativa.it';
const GA_NEWS_URL = Capacitor.isNativePlatform()
  ? `${GA_BASE}/news`
  : '/proxy/ga/news';

function toAbsoluteUrl(href: string | undefined): string {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return `${GA_BASE}${href}`;
  return new URL(href, GA_BASE + '/').toString();
}

/**
 * I titoli della Giustizia Amministrativa contengono spesso un riferimento
 * tipo "News UM n. 43/2026" o "n. 41/2026" che possiamo usare come pseudo-data.
 * Estrae anno e numero per ordinare almeno per anno.
 */
function extractDateHint(title: string): string | undefined {
  const m = title.match(/n\.\s*(\d+)\/(\d{4})/i);
  if (!m) return undefined;
  const year = parseInt(m[2], 10);
  if (!year || year < 2000 || year > 2100) return undefined;
  // Usa il 1° gennaio dell'anno come ancora — meglio di niente per ordering
  return new Date(Date.UTC(year, 0, 1, 12, 0, 0)).toISOString();
}

export async function fetchGiustiziaAmministrativaNews(_page = 1): Promise<SourceNewsItem[]> {
  // Liferay del sito GA usa parametri URL stateful per la paginazione,
  // difficili da pilotare. Per ora restituiamo solo la prima pagina.
  const html = await fetchText(GA_NEWS_URL);
  const $ = cheerio.load(html);

  const items: SourceNewsItem[] = [];
  const seen = new Set<string>();

  $('article.ricerca--item').each((_, el) => {
    const $art = $(el);
    const $titleA = $art.find('h3 a.item-title').first();
    const title = $titleA.text().trim();
    const link = toAbsoluteUrl($titleA.attr('href'));
    if (!title || !link) return;

    // Id stabile: prendi l'ultimo segmento dell'URL (tipo "158197-345")
    const idMatch = link.match(/\/-\/([\w-]+)/);
    const localId = idMatch ? idMatch[1] : link;
    if (seen.has(localId)) return;
    seen.add(localId);

    const excerpt = $art.find('p.two-rows, p.hidden-xs').first().text().trim();

    items.push({
      id: `${SOURCE_ID}:${localId}`,
      sourceId: SOURCE_ID,
      title,
      date: extractDateHint(title),
      excerpt: excerpt || undefined,
      link,
      category: 'Giurisprudenza amministrativa',
    });
  });

  return items;
}
