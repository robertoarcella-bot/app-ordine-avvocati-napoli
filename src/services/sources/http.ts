/**
 * Helper condiviso per le fonti: fa richieste HTTP che funzionano sia
 * su Capacitor nativo (CapacitorHttp, bypass CORS) sia in dev sul browser
 * (passando per i proxy Vite configurati in vite.config.ts).
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

/**
 * Restituisce il testo di una risorsa.
 * Su nativo: usa CapacitorHttp (no CORS).
 * Su browser dev: chiama l'URL via proxy Vite (vedi vite.config.ts).
 */
export async function fetchText(url: string, params?: Record<string, string>): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.get({
      url,
      params,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml',
        'User-Agent': 'AppOrdineAvvocatiNapoli/1.0 (+https://www.ordineavvocatinapoli.it/)',
      },
      responseType: 'text',
    });
    if (res.status >= 400) throw new Error(`HTTP ${res.status} su ${url}`);
    return typeof res.data === 'string' ? res.data : String(res.data ?? '');
  }
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const r = await fetch(url + qs, { headers: { Accept: 'text/html,application/xml,application/rss+xml' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} su ${url}`);
  return r.text();
}
