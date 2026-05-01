import { IonContent, IonPage, IonText } from '@ionic/react';
import { useParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { Browser } from '@capacitor/browser';
import { MINIAPPS } from '../config/miniapps';

interface RouteParams { id: string }

/**
 * Visualizzatore di mini-webapp HTML.
 *
 * Comportamento:
 *  - Full-screen, niente header (per tornare indietro: back hardware Android,
 *    o swipe iOS). Massimo spazio alla webapp.
 *  - Inietta uno script che intercetta `window.open(...)` e i click su link
 *    target="_blank" / href esterni (whatsapp:, mailto:, https://...) e li
 *    passa al parent via postMessage. Il parent li apre con Browser.open()
 *    di Capacitor, che invoca l'app esterna corretta (WhatsApp, Mail, browser).
 *  - Le mini-app continuano a funzionare anche fuori dall'app (se aperte
 *    direttamente nel sito originario), perché lo script aggiunto è
 *    "additive" e non rompe il comportamento standard del browser.
 */

const PROXY_SCRIPT = `
(function () {
  if (window.__coaProxyInjected) return;
  window.__coaProxyInjected = true;

  function isExternal(url) {
    if (!url) return false;
    var u = String(url);
    return /^(https?:|whatsapp:|mailto:|tel:|sms:)/i.test(u);
  }

  function dispatchOpen(url) {
    try {
      window.parent.postMessage({ __coa: 'open-external', url: String(url) }, '*');
    } catch (e) { /* noop */ }
  }

  // 1) Garantisce un viewport mobile-friendly (molte webapp originarie
  //    mancavano il meta viewport o lo avevano fissato su 1200px).
  try {
    var head = document.head || document.getElementsByTagName('head')[0];
    var existing = document.querySelector('meta[name="viewport"]');
    if (existing) existing.parentNode.removeChild(existing);
    var meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    if (head) head.appendChild(meta);
  } catch (e) { /* noop */ }

  // 2) Inietta CSS che forza lo scroll verticale e impedisce a layout
  //    fissi di sforare orizzontalmente (sostituisce overflow:hidden).
  try {
    var style = document.createElement('style');
    style.setAttribute('data-coa', 'mobile-fit');
    style.textContent =
      'html, body {' +
      '  margin: 0 !important;' +
      '  padding: 0 !important;' +
      '  max-width: 100% !important;' +
      '  overflow-x: auto !important;' +
      '  overflow-y: auto !important;' +
      '  -webkit-overflow-scrolling: touch;' +
      '  height: auto !important;' +
      '  min-height: 100% !important;' +
      '}' +
      'body { padding: 8px !important; box-sizing: border-box; font-size: 16px; }' +
      'img, table, video, iframe, canvas, svg { max-width: 100% !important; height: auto; }' +
      '* { box-sizing: border-box; max-width: 100%; }' +
      '.container, .wrapper, .main, main { max-width: 100% !important; width: auto !important; }';
    (document.head || document.body).appendChild(style);
  } catch (e) { /* noop */ }

  // 3) Intercetta window.open (per WhatsApp, mailto, link esterni)
  var nativeOpen = window.open;
  window.open = function (url, target, features) {
    if (isExternal(url)) {
      dispatchOpen(url);
      return null;
    }
    return nativeOpen ? nativeOpen.call(window, url, target, features) : null;
  };

  // 4) Intercetta click su <a href> esterni o target=_blank
  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t.nodeType === 1 && t.tagName !== 'A') t = t.parentNode;
    if (!t || t.tagName !== 'A') return;
    var href = t.getAttribute('href');
    if (!href) return;
    if (isExternal(href) || t.target === '_blank') {
      e.preventDefault();
      dispatchOpen(href);
    }
  }, true);
})();
`;

const MiniAppView: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const app = MINIAPPS.find(a => a.id === id);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listener globale per i messaggi delle mini-app
  useEffect(() => {
    const onMessage = async (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || typeof data !== 'object') return;
      if ((data as { __coa?: string }).__coa === 'open-external' &&
          typeof (data as { url?: unknown }).url === 'string') {
        const url = (data as { url: string }).url;
        try {
          await Browser.open({ url });
        } catch (e) {
          // Su browser senza Capacitor, fallback nativo
          window.open(url, '_blank', 'noopener');
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Inietta lo script proxy nella mini-app non appena ha caricato il DOM
  const onLoad = () => {
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument;
    if (!win || !doc) return;
    try {
      const s = doc.createElement('script');
      s.textContent = PROXY_SCRIPT;
      doc.head.appendChild(s);
    } catch {
      // cross-origin (non dovrebbe mai accadere: le mini-app sono asset locali)
    }
  };

  if (!app || !app.file) {
    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding">
          <IonText color="medium">Strumento non disponibile in questa modalità.</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <iframe
          ref={iframeRef}
          src={`/${app.file}`}
          title={app.title}
          onLoad={onLoad}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
          style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
        />
      </IonContent>
    </IonPage>
  );
};

export default MiniAppView;
