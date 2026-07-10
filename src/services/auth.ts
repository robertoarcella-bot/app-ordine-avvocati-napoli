/**
 * URL dell'Area Riservata del sito COA.
 *
 * L'accesso avviene interamente nel browser di sistema (Chrome Custom Tabs)
 * con flusso a 2 step esplicito — vedi `pages/AreaRiservata.tsx`. Il vecchio
 * login in-app via iframe headless (form nativo + CSRF + cookie WebView) è
 * stato rimosso: l'app non tocca più le credenziali. Se servisse di nuovo,
 * è nella history git (fino a v1.2.3).
 */

const SITE_BASE = 'https://www.ordineavvocatinapoli.it';

export const AUTH_URLS = {
  /** Pagina di login del sito istituzionale (step 1) */
  loginPage: `${SITE_BASE}/login-logout/`,
  /**
   * URL dell'Area Riservata Consiglieri vera e propria (step 2). Per
   * "difetto" del sito, il login non redirige automaticamente qui: l'utente
   * deve aprirla con un secondo tocco dopo essersi autenticato.
   */
  areaConsiglieri: `${SITE_BASE}/area-riservata-consiglieri/`,
};
