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
import type { SourceNewsItem } from '../../config/sources';
import { fetchText } from './http';
import { extractContentId, parseItalianDate, toAbsoluteUrl } from './scrape';

const SOURCE_ID = 'pst';
const PST_BASE = 'https://pst.giustizia.it';
/** In dev mode passa dal proxy Vite; su Capacitor nativo va diretto via CapacitorHttp */
const PST_LIST_URL = Capacitor.isNativePlatform()
  ? `${PST_BASE}/PST/it/news.page`
  : '/proxy/pst/PST/it/news.page';

const ABS_BASE_FOR_LINKS = `${PST_BASE}/PST/`;

export async function fetchPstNews(page = 1): Promise<SourceNewsItem[]> {
  const params: Record<string, string> = {};
  if (page > 1) params.frame6_item = String(page);

  const html = await fetchText(PST_LIST_URL, params);
  // Import dinamico: cheerio è pesante e questo modulo è raggiungibile dal
  // chunk iniziale (via polling notifiche in App.tsx) — lo carichiamo solo
  // quando serve davvero fare parsing.
  const cheerio = await import('cheerio');
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
    const absLink = toAbsoluteUrl(href, PST_BASE, ABS_BASE_FOR_LINKS);
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
    const imageUrl = imgSrc ? toAbsoluteUrl(imgSrc, PST_BASE, ABS_BASE_FOR_LINKS) : undefined;

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
