import {
  IonContent, IonPage, IonText,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
} from '@ionic/react';
import { useParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { openExternal } from '../services/download';
import { MINIAPPS } from '../config/miniapps';
import { useIframeScrollWake } from '../hooks/useIframeScrollWake';

interface RouteParams { id: string }

/**
 * Visualizzatore di mini-webapp HTML.
 *
 * Comportamento:
 *  - Header compatto con back button verso /miniapps. Necessario su iOS, dove
 *    non esiste un back hardware: senza freccia l'utente sarebbe costretto a
 *    chiudere l'app per uscire dallo strumento.
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
    // Lo sblocco dello scroll (WebView Android) è gestito dal parent:
    // vedi hooks/useIframeScrollWake.ts.
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
  const wakeOnLoad = useIframeScrollWake(iframeRef);

  // Listener globale per i messaggi delle mini-app
  useEffect(() => {
    const onMessage = async (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || typeof data !== 'object') return;
      if ((data as { __coa?: string }).__coa === 'open-external' &&
          typeof (data as { url?: unknown }).url === 'string') {
        const url = (data as { url: string }).url;
        await openExternal(url);
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
    wakeOnLoad();
  };

  if (!app || !app.file) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/miniapps" />
            </IonButtons>
            <IonTitle>Strumento</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <IonText color="medium">Strumento non disponibile in questa modalità.</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/miniapps" />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>{app.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      {/* scrollY=false: lasciamo che sia l'iframe a gestire lo scroll interno,
          altrimenti IonContent intercetta i touch e l'iframe resta bloccato. */}
      <IonContent scrollY={false}>
        <iframe
          ref={iframeRef}
          src={`/${app.file}`}
          title={app.title}
          onLoad={onLoad}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
          style={{
            border: 'none',
            width: '100%',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            // Android 15+ edge-to-edge: non finire sotto la barra di navigazione.
            // Altezza esplicita: un iframe (elemento "replaced") in position
            // absolute NON si allunga tra top e bottom, userebbe 150px.
            height: 'calc(100% - var(--ion-safe-area-bottom, 0px))',
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default MiniAppView;
