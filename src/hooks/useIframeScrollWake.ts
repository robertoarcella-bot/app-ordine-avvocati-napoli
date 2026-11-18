import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { useIonViewDidEnter } from '@ionic/react';

/**
 * Sblocca lo scroll degli iframe nel WebView Android.
 *
 * Sintomo: aperta una mini-app (o un sito in iframe), lo schermo non scorre
 * finché non lo si tocca una volta. Il compositor del WebView non registra lo
 * scroller del sotto-documento quando questo viene caricato durante
 * l'animazione di ingresso della pagina, o quando diventa scorrevole dopo il
 * primo render (es. un codice che disegna l'articolo via JS). Il tap
 * dell'utente forza un hit-test sul thread principale e ripristina tutto.
 *
 * I vecchi "tickle" (scrollTo 1→0, overflow hidden→auto, evento resize) erano
 * sincroni nello stesso task: il compositor non vedeva alcuna modifica, per
 * questo non funzionavano. Qui l'iframe viene davvero ridimensionato di 1px
 * per un frame (layout + commit del sotto-documento, come dopo un tap) e il
 * suo documento riceve il focus.
 *
 * Il risveglio scatta: al load di ogni documento nell'iframe, a fine
 * animazione di ingresso della pagina (ionViewDidEnter) e, per gli iframe
 * same-origin, quando cambia l'altezza scorrevole del contenuto.
 */
export function wakeIframe(iframe: HTMLIFrameElement | null): void {
  if (!iframe) return;
  requestAnimationFrame(() => {
    const prev = iframe.style.height;
    const h = iframe.getBoundingClientRect().height;
    if (h < 2) return; // pagina non visibile (es. in uscita)
    iframe.style.height = `${h - 1}px`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        iframe.style.height = prev;
        try {
          iframe.contentWindow?.focus();
        } catch {
          /* noop */
        }
      });
    });
  });
}

/** Ignora le variazioni minime (es. il ridimensionamento di 1px di wakeIframe). */
const SOGLIA_PX = 2;

export function useIframeScrollWake(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const roRef = useRef<ResizeObserver | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const stopObserver = useCallback(() => {
    roRef.current?.disconnect();
    roRef.current = null;
    window.clearTimeout(timerRef.current);
  }, []);

  /** Da chiamare nell'onLoad dell'iframe (scatta a ogni documento caricato). */
  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    wakeIframe(iframe);
    stopObserver();

    // Solo same-origin: osserva l'altezza del contenuto e risveglia lo scroll
    // quando il documento cambia dimensione dopo il primo render.
    try {
      const win = iframe?.contentWindow as (Window & typeof globalThis) | null;
      const doc = iframe?.contentDocument;
      if (!win || !doc?.documentElement || typeof win.ResizeObserver !== 'function') return;
      let last = doc.documentElement.scrollHeight;
      const ro = new win.ResizeObserver(() => {
        const h = doc.documentElement.scrollHeight;
        if (Math.abs(h - last) <= SOGLIA_PX) return;
        last = h;
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => wakeIframe(iframeRef.current), 150);
      });
      ro.observe(doc.documentElement);
      if (doc.body) ro.observe(doc.body);
      roRef.current = ro;
    } catch {
      /* cross-origin: restano i risvegli su load e ionViewDidEnter */
    }
  }, [iframeRef, stopObserver]);

  useIonViewDidEnter(() => {
    wakeIframe(iframeRef.current);
  });

  useEffect(() => stopObserver, [stopObserver]);

  return onIframeLoad;
}
