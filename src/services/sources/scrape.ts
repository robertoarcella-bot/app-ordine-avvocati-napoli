/**
 * Utility condivise per gli scraper delle fonti news (PST, uffici giudiziari).
 * I siti JSF del Min. Giustizia condividono struttura e convenzioni.
 */

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

/**
 * Estrae la data in formato ISO (best-effort) da stringhe tipo
 * "24 apr 2026" o "24 aprile 2026".
 */
export function parseItalianDate(s: string): string | undefined {
  const m = s.toLowerCase().match(/(\d{1,2})\s+([a-zà]{3,12})\.?\s+(\d{4})/);
  if (!m) return undefined;
  const day = parseInt(m[1], 10);
  const month = MONTHS_IT[m[2]] ?? MONTHS_IT[m[2].slice(0, 3)];
  const year = parseInt(m[3], 10);
  if (month === undefined || isNaN(day) || isNaN(year)) return undefined;
  return new Date(Date.UTC(year, month, day, 12, 0, 0)).toISOString();
}

/** Estrae contentId da link tipo "/PST/page/it/foo?contentId=NWS4803" */
export function extractContentId(link: string): string | undefined {
  const m = link.match(/contentId=([A-Z]+\d+)/i);
  return m ? m[1] : undefined;
}

/**
 * Converte URL relativi in assoluti.
 * @param origin base del sito (es. https://pst.giustizia.it), usata per i path che iniziano con '/'
 * @param baseForRelative base per i path relativi senza '/'; default `origin + '/'`
 */
export function toAbsoluteUrl(href: string | undefined, origin: string, baseForRelative?: string): string {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return origin + href;
  return new URL(href, baseForRelative || origin + '/').toString();
}
