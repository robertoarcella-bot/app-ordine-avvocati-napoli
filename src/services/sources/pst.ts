/**
 * Scraper per pst.giustizia.it (Portale Servizi Telematici del Min. Giustizia).
 *
 * Il sito è basato su JSF (Java Server Faces) e non espone né API REST né RSS.
 * Estraiamo la lista news parsando l'HTML della pagina /PST/it/news.page.
 *
 * URL utili:
 *   - Lista:    https://pst.giustizia.it/PST/it/news.page[?frame6_item=N]
 *   - Filtro:   https://pst.giustizia.it/PST/it/news.page?metadata_category_frame6=avvisi
 *   - Dettaglio: https://pst.giustizia.it/PST/page/it/<slug>?contentId=NWS<num>
 *
 * Il dettaglio NON viene scrapato: la pagina di dettaglio JSF è instabile e
 * piena di markup tecnico — apriamo direttamente il link in WebView quando
 * l'utente tocca una news.
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';
import * as cheerio from 'cheerio';
import type { SourceNewsItem } from '../../config/sources';

const SOURCE_ID = 'pst';
const PST_BASE = 'https://pst.giustizia.it';
/** In dev mode passa dal proxy Vite; su Capacitor nativo va diretto via CapacitorHttp */
const PST_LIST_URL = Capacitor.isNativePlatform()
  ? `${PST_BASE}/PST/it/news.page`
  : '/proxy/pst/PST/it/news.page';

const ABS_BASE_FOR_LINKS = `${PST_BASE}/PST/`;

/**
 * Recupera HTML come stringa, usando CapacitorHttp su nativo (bypass CORS)
 * o fetch standard nel browser (passando per il proxy Vite).
 */
async function fetchHtml(url: string, params?: Record<string, string>): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.get({
      url,
      params,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'AppCOANapoli/1.0',
      },
      responseType: 'text',
    });
    if (res.status >= 400) throw new Error(`HTTP ${res.status} su ${url}`);
    // CapacitorHttp può restituire stringa o oggetto; normalizziamo.
    return typeof res.data === 'string' ? res.data : String(res.data ?? '');
  }
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const r = await fetch(url + qs, { headers: { Accept: 'text/html' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} su ${url}`);
  return r.text();
}

/** Converte URL relativi (tipici di pst.giustizia.it) in assoluti */
function toAbsoluteUrl(href: string | undefined): string {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return `${PST_BASE}${href}`;
  return new URL(href, ABS_BASE_FOR_LINKS).toString();
}

/** Estrae la data in formato ISO (best-effort) da stringhe tipo "24 apr 2026" */
function parseItalianDate(s: string): string | undefined {
  const months: Record<string, number> = {
    gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5,
    lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11,
  };
  const m = s.toLowerCase().match(/(\d{1,2})\s+([a-zà]+)\.?\s+(\d{4})/);
  if (!m) return undefined;
  const day = parseInt(m[1], 10);
  const monthKey = m[2].slice(0, 3);
  const year = parseInt(m[3], 10);
  const month = months[monthKey];
  if (month === undefined || isNaN(day) || isNaN(year)) return undefined;
  const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return d.toISOString();
}

/** Estrae contentId da link tipo "/PST/page/it/foo?contentId=NWS4803" */
function extractContentId(link: string): string | undefined {
  const m = link.match(/contentId=([A-Z]+\d+)/i);
  return m ? m[1] : undefined;
}

export async function fetchPstNews(page = 1): Promise<SourceNewsItem[]> {
  const params: Record<string, string> = {};
  if (page > 1) params.frame6_item = String(page);

  const html = await fetchHtml(PST_LIST_URL, params);
  const $ = cheerio.load(html);

  const items: SourceNewsItem[] = [];

  /**
   * Strategia di parsing:
   * Cerchiamo tutti i blocchi che hanno un link "Leggi di più" (o un <h5> con <a>)
   * verso /PST/page/it/...?contentId=NWS...
   * e da lì risaliamo al "card" contenitore per estrarre titolo, data, categoria.
   *
   * Selettori multipli per robustezza: se cambiano le classi CSS, il fallback
   * si basa sull'attributo href con contentId.
   */
  const seen = new Set<string>();

  $('a[href*="contentId=NWS"]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href') || '';
    const absLink = toAbsoluteUrl(href);
    const contentId = extractContentId(href);
    if (!contentId || seen.has(contentId)) return;
    seen.add(contentId);

    // Risali al contenitore "card" più prossimo (li, article, div)
    const $card = $a.closest('li, article, .news-item, .card, div').first();

    // Titolo: prefer h5/h3/h2 dentro il card; fallback al testo del link
    let title = $card.find('h5, h4, h3, h2').first().text().trim();
    if (!title) title = $a.text().trim();
    if (!title || title.length < 5) return; // probabilmente un link di servizio

    // Data: cerca testo simile a "24 apr 2026" nel card
    const cardText = $card.text();
    const dateMatch = cardText.match(/\d{1,2}\s+[a-zà]{3,9}\.?\s+\d{4}/i);
    const dateRaw = dateMatch ? dateMatch[0] : undefined;
    const dateIso = dateRaw ? parseItalianDate(dateRaw) : undefined;

    // Categoria: cerca "Avvisi", "News", "Comunicazioni"
    const catMatch = cardText.match(/\b(Avvisi|News|Comunicazioni)\b/);
    const category = catMatch ? catMatch[1] : undefined;

    // Immagine
    const $img = $card.find('img').first();
    const imgSrc = $img.attr('src');
    const imageUrl = imgSrc ? toAbsoluteUrl(imgSrc) : undefined;

    items.push({
      id: `${SOURCE_ID}:${contentId}`,
      sourceId: SOURCE_ID,
      title,
      date: dateIso || dateRaw,
      category,
      imageUrl,
      link: absLink,
    });
  });

  return items;
}
