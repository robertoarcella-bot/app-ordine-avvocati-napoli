/**
 * Configurazione sito COA Napoli.
 *
 * Tutti gli URL e i selettori sono qui in modo che, se il sito cambia,
 * basta aggiornare questo file (o in futuro un JSON remoto).
 */

export const SITE = {
  baseUrl: 'https://www.ordineavvocatinapoli.it',
  wpApi: 'https://www.ordineavvocatinapoli.it/wp-json/wp/v2',
  loginUrl: 'https://www.ordineavvocatinapoli.it/login-logout/',

  /** Sezioni pubbliche del sito (per la WebView e il menu rapido) */
  sections: [
    {
      id: 'componenti',
      label: 'Componenti C.O.A.',
      url: 'https://www.ordineavvocatinapoli.it/componenti-c-o-a/',
      icon: 'people-outline',
    },
    {
      id: 'commissioni',
      label: 'Commissioni',
      url: 'https://www.ordineavvocatinapoli.it/componenti-c-o-a/commissioni-2/',
      icon: 'people-circle-outline',
    },
    {
      id: 'verbali',
      label: 'Verbali sedute consiliari',
      url: 'https://www.ordineavvocatinapoli.it/category/delibere-consiglio-dell-ordine-degli-avvocati-di-napoli/',
      icon: 'document-text-outline',
    },
    {
      id: 'modulistica',
      label: 'Modulistica',
      url: 'https://www.ordineavvocatinapoli.it/modulistica-ordine-professionale/',
      icon: 'reader-outline',
    },
    {
      id: 'trasparenza',
      label: 'Amministrazione Trasparente',
      url: 'https://www.ordineavvocatinapoli.it/amministrazione-trasparente/',
      icon: 'eye-outline',
    },
    {
      id: 'protocolli',
      label: "Protocolli d'intesa",
      url: 'https://www.ordineavvocatinapoli.it/category/protocolli-d-intesa/',
      icon: 'ribbon-outline',
    },
    {
      id: 'regolamenti',
      label: 'Compiti e regolamenti',
      url: 'https://www.ordineavvocatinapoli.it/componenti-c-o-a/compiti-e-regolamenti/',
      icon: 'shield-checkmark-outline',
    },
    {
      id: 'negoziazione',
      label: 'Deposito negoziazioni assistite',
      url: 'https://negoziazione.consiglionazionaleforense.it/',
      icon: 'archive-outline',
      external: true,
    },
    {
      id: 'contatti',
      label: 'Contatti',
      url: 'https://www.ordineavvocatinapoli.it/contatti-2/',
      icon: 'call-outline',
    },
  ],

  /** CSS iniettato nella WebView per ottimizzare il sito su mobile */
  mobileFriendlyCss: `
    body { -webkit-text-size-adjust: 100%; font-size: 16px !important; }
    img, table, video, iframe { max-width: 100% !important; height: auto !important; }
    .menu-toggle, .header-top, .top-bar, #wpadminbar { display: none !important; }
    .container, .wrap, main, article { padding-left: 12px !important; padding-right: 12px !important; }
    a { word-break: break-word; }
  `,
} as const;

/** Quanti minuti tenere in cache la lista news */
export const NEWS_CACHE_MINUTES = 30;

/** Numero post per pagina */
export const NEWS_PER_PAGE = 12;
