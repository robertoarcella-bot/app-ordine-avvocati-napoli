/**
 * Parser RSS per dgt.mef.gov.it (Dipartimento Giustizia Tributaria).
 *
 * Espone un vero feed RSS 2.0 a:
 *   https://www.dgt.mef.gov.it/gt/c/portal/news/rss?idrss=1
 *
 * Niente scraping, niente cheerio: parsiamo l'XML con DOMParser nativo
 * (disponibile sia nei browser sia nel WebView Capacitor).
 */

import { Capacitor } from '@capacitor/core';
import { fetchText } from './http';
import type { SourceNewsItem } from '../../config/sources';

const SOURCE_ID = 'gt';
const GT_BASE = 'https://www.dgt.mef.gov.it';
const GT_RSS_URL = Capacitor.isNativePlatform()
  ? `${GT_BASE}/gt/c/portal/news/rss`
  : '/proxy/gt/gt/c/portal/news/rss';

const stripCdata = (s: string) =>
  s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();

const stripTags = (s: string) =>
  s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export async function fetchGiustiziaTributariaNews(_page = 1): Promise<SourceNewsItem[]> {
  // Il feed restituisce ~50 item, sufficiente per ora (no paginazione lato server).
  const xml = await fetchText(GT_RSS_URL, { idrss: '1' });

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Feed RSS non valido: ' + parserError.textContent?.slice(0, 100));
  }

  const items: SourceNewsItem[] = [];

  doc.querySelectorAll('item').forEach((it) => {
    const title = stripCdata(it.querySelector('title')?.textContent ?? '').trim();
    const link = (it.querySelector('link')?.textContent ?? '').trim();
    const pubDate = (it.querySelector('pubDate')?.textContent ?? '').trim();
    const descRaw = stripCdata(it.querySelector('description')?.textContent ?? '');
    const guid = (it.querySelector('guid')?.textContent ?? '').trim();
    const category = stripCdata(it.querySelector('category')?.textContent ?? '').trim() || undefined;

    if (!title) return;

    const dateIso = pubDate ? new Date(pubDate).toISOString() : undefined;
    const id = `${SOURCE_ID}:${guid || link || title}`;

    items.push({
      id,
      sourceId: SOURCE_ID,
      title,
      date: dateIso,
      excerpt: descRaw ? stripTags(descRaw) : undefined,
      link,
      category,
    });
  });

  return items;
}
