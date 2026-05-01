/**
 * Servizio di autenticazione per l'Area Riservata del sito COA.
 *
 * Approccio "B-bis" (form nativo + iframe headless):
 *  1) Recuperiamo via CapacitorHttp la pagina di login per estrarre il
 *     CSRFToken-wppb (plugin WordPress Profile Builder)
 *  2) Costruiamo un form HTML completo con tutti i campi richiesti e lo
 *     carichiamo dentro un iframe nascosto via `srcdoc`. Auto-submit.
 *  3) L'iframe POSTa direttamente al sito ordineavvocatinapoli.it: il
 *     browser del WebView nativo gestisce naturalmente cookie + redirect
 *     (i cookie wordpress_logged_in_* finiscono nel CookieManager Android,
 *     condiviso con tutte le WebView dell'app)
 *  4) Quando l'iframe ha completato il redirect, leggiamo lo URL finale.
 *     Se contiene wppb-error/incorrect → fallimento. Altrimenti → ok.
 *  5) Marchiamo "logged in" in @capacitor/preferences (non salviamo MAI
 *     password; al massimo lo username se l'utente ha attivato "ricordami").
 *
 * Logout: navighiamo l'iframe headless a /wp-login.php?action=logout per
 * far cancellare i cookie dal WebView, poi rimuoviamo lo stato locale.
 */

import { CapacitorHttp, Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const SITE_BASE = 'https://www.ordineavvocatinapoli.it';
const LOGIN_PAGE = `${SITE_BASE}/login-logout/`;
const LOGOUT_URL = `${SITE_BASE}/wp-login.php?action=logout`;

const PREFS_LOGGED_IN = 'auth:logged-in';
const PREFS_USERNAME = 'auth:username';
const PREFS_REMEMBER = 'auth:remember';

export interface LoginParams {
  username: string;
  password: string;
  remember: boolean;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: 'csrf' | 'network' | 'invalid_credentials' | 'unknown'; detail?: string };

/**
 * Estrae il token CSRF dalla pagina di login.
 * Su Capacitor nativo usa CapacitorHttp (no CORS); su browser dev usa fetch
 * (richiede proxy Vite).
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    let html: string;
    if (Capacitor.isNativePlatform()) {
      const res = await CapacitorHttp.get({
        url: LOGIN_PAGE,
        headers: {
          Accept: 'text/html',
          'User-Agent': 'AppOrdineAvvocatiNapoli/1.0',
        },
        responseType: 'text',
      });
      if (res.status >= 400) return null;
      html = typeof res.data === 'string' ? res.data : String(res.data ?? '');
    } else {
      const r = await fetch('/proxy/coa/login-logout/', { headers: { Accept: 'text/html' } });
      if (!r.ok) return null;
      html = await r.text();
    }
    const m = html.match(/name="CSRFToken-wppb"\s+value="([^"]+)"/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Costruisce l'HTML del form di login pronto per essere caricato dentro
 * un iframe via `srcdoc` con auto-submit. Tutti i valori sono escapati per
 * evitare iniezioni nei attributi HTML.
 */
export function buildLoginFormHtml(p: LoginParams, csrfToken: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Campi nascosti riprodotti dal form originale del sito
  const fields: Record<string, string> = {
    log: p.username,
    pwd: p.password,
    'wppb_login': 'true',
    'CSRFToken-wppb': csrfToken,
    'redirect_to': LOGIN_PAGE,
    'wppb_form_location': 'page',
    'wppb_request_url': LOGIN_PAGE,
    'wppb_lostpassword_url': '',
    'wppb_redirect_priority': '',
    'wppb_referer_url': '',
    '_wp_http_referer': '/login-logout/',
    'wppb_redirect_check': 'true',
    'wp-submit': 'Accedi',
  };
  if (p.remember) fields.rememberme = 'forever';

  const inputs = Object.entries(fields).map(
    ([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`
  ).join('\n');

  return `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body>
<form id="f" method="post" action="${LOGIN_PAGE}">
${inputs}
</form>
<script>document.getElementById('f').submit();</script>
</body></html>`;
}

/**
 * Esegue il login facendo girare un iframe headless con il form auto-submit.
 * Il chiamante deve fornire un riferimento a un <iframe> già montato nel DOM
 * (nascosto via display:none) e attendere l'esito.
 */
export function performLogin(
  iframe: HTMLIFrameElement,
  params: LoginParams,
  csrfToken: string,
  timeoutMs = 20000
): Promise<LoginResult> {
  return new Promise<LoginResult>((resolve) => {
    let settled = false;
    const finish = (r: LoginResult) => { if (!settled) { settled = true; resolve(r); } };

    let lastUrl = '';
    const onLoad = () => {
      try {
        const url = iframe.contentWindow?.location?.href || '';
        lastUrl = url;
        // Se la URL contiene un parametro errore noto del plugin WPPB → invalide
        if (/wppb-warning|wppb-error|wppb_error|incorrect|loginerror/i.test(url)) {
          finish({ ok: false, reason: 'invalid_credentials', detail: url });
          return;
        }
        // Se la URL è ancora la pagina di login dopo un secondo redirect
        // potremmo voler controllare il body per messaggi di errore.
        // (cross-origin access bloccherebbe, ma lo proviamo cautamente)
      } catch {
        // cross-origin: ignoriamo, ci basta che l'iframe abbia caricato
      }
    };
    iframe.addEventListener('load', onLoad);

    // Timeout di sicurezza: dopo X secondi rinunciamo e consideriamo fallito
    const timer = setTimeout(() => {
      iframe.removeEventListener('load', onLoad);
      finish({ ok: false, reason: 'network', detail: `Timeout dopo ${timeoutMs / 1000}s. Ultimo URL: ${lastUrl}` });
    }, timeoutMs);

    // L'iframe potrebbe ricevere più "load" (form submit + redirect).
    // Aspettiamo un secondo dopo l'ultimo load per valutare l'esito finale.
    let lastLoadTs = Date.now();
    const onLoadGate = () => { lastLoadTs = Date.now(); };
    iframe.addEventListener('load', onLoadGate);
    const settleTimer = setInterval(() => {
      if (settled) { clearInterval(settleTimer); clearTimeout(timer); return; }
      // Se sono passati 1.2s dall'ultimo load e non abbiamo ancora rilevato
      // errore espliciti → consideriamo successo (i cookie sono nel WebView).
      if (Date.now() - lastLoadTs > 1200) {
        clearInterval(settleTimer);
        clearTimeout(timer);
        iframe.removeEventListener('load', onLoad);
        iframe.removeEventListener('load', onLoadGate);
        finish({ ok: true });
      }
    }, 200);

    // Avvia: scrivi srcdoc col form + auto-submit
    iframe.srcdoc = buildLoginFormHtml(params, csrfToken);
  });
}

/** Persiste lo stato "loggato" — NON salviamo mai la password */
export async function markLoggedIn(username: string, remember: boolean): Promise<void> {
  await Preferences.set({ key: PREFS_LOGGED_IN, value: '1' });
  await Preferences.set({ key: PREFS_REMEMBER, value: remember ? '1' : '0' });
  if (remember) {
    await Preferences.set({ key: PREFS_USERNAME, value: username });
  } else {
    await Preferences.remove({ key: PREFS_USERNAME });
  }
}

export async function clearLoggedIn(): Promise<void> {
  await Preferences.remove({ key: PREFS_LOGGED_IN });
  // Manteniamo lo username solo se l'utente aveva attivato "ricordami"
  const remember = (await Preferences.get({ key: PREFS_REMEMBER })).value;
  if (remember !== '1') await Preferences.remove({ key: PREFS_USERNAME });
}

export async function isLoggedIn(): Promise<boolean> {
  const v = await Preferences.get({ key: PREFS_LOGGED_IN });
  return v.value === '1';
}

export async function getRememberedUsername(): Promise<string | null> {
  const v = await Preferences.get({ key: PREFS_USERNAME });
  return v.value || null;
}

/**
 * Esegue il logout caricando l'URL di logout nell'iframe headless.
 * Il sito risponde cancellando i cookie wordpress_logged_in_* e tornando
 * alla home: dopo questa chiamata l'app non è più autenticata.
 */
export async function performLogout(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise<void>((resolve) => {
    const done = () => { iframe.removeEventListener('load', done); resolve(); };
    iframe.addEventListener('load', done);
    setTimeout(done, 5000);
    iframe.src = LOGOUT_URL;
  });
}

export const AUTH_URLS = {
  loginPage: LOGIN_PAGE,
  logoutPage: LOGOUT_URL,
  // Pagina che dimostra l'autenticazione (post-login il sito porta qui).
  // Idealmente, ad area riservata vera e propria; per ora la pagina login
  // mostra link autenticati a "Profilo", "Modifica dati", ecc.
  reservedHome: LOGIN_PAGE,
};
