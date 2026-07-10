/**
 * Utility di testo condivise.
 */

/**
 * Normalizza una stringa per la ricerca: minuscole, accenti rimossi,
 * apostrofi tipografici uniformati a quello dritto.
 */
export const norm = (s: string | undefined | null): string =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’]/g, "'");

/** Rimuove i tag HTML e comprime gli spazi multipli. */
export const stripTags = (html: string): string =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
