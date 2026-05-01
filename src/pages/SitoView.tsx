import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner, IonText,
} from '@ionic/react';
import { openOutline, refreshOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { openExternal } from '../services/download';
import { SITE } from '../config/site';

const useQuery = () => new URLSearchParams(useLocation().search);

/** Dopo X ms nascondiamo lo spinner anche se il sito non ha ancora finito */
const SPINNER_TIMEOUT_MS = 8000;
/** Dopo Y ms suggeriamo all'utente di aprire in browser esterno */
const SLOW_HINT_MS = 5000;

const SitoView: React.FC = () => {
  const q = useQuery();
  const url = q.get('u') || SITE.baseUrl;
  const title = q.get('t') || 'Ordine Avvocati Napoli';

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [slowHint, setSlowHint] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setSlowHint(false);
    const tHint = setTimeout(() => setSlowHint(true), SLOW_HINT_MS);
    const tHide = setTimeout(() => setLoading(false), SPINNER_TIMEOUT_MS);
    return () => {
      clearTimeout(tHint);
      clearTimeout(tHide);
    };
  }, [url, reloadKey]);

  const onLoad = () => {
    setLoading(false);
    setSlowHint(false);
    // Tentativo di iniettare CSS mobile-friendly nell'iframe.
    // Funziona solo se same-origin o se il sito lo permette.
    try {
      const win = iframeRef.current?.contentWindow;
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const style = doc.createElement('style');
        style.textContent = SITE.mobileFriendlyCss;
        doc.head.appendChild(style);
      }
      // Forza reflow per attivare lo scroll dell'iframe (il WebView
      // Android a volte richiede un user input per riallineare il layout
      // dopo CSS injection — qui lo simuliamo).
      const forceReflow = () => {
        try {
          const d = iframeRef.current?.contentDocument;
          const w = iframeRef.current?.contentWindow;
          if (!d || !w) return;
          const html = d.documentElement;
          const body = d.body;
          if (!html || !body) return;
          html.style.overflow = 'hidden';
          body.style.overflow = 'hidden';
          void body.offsetHeight;
          html.style.overflow = '';
          body.style.overflow = '';
          void body.offsetHeight;
          w.dispatchEvent(new Event('resize'));
        } catch { /* cross-origin */ }
      };
      setTimeout(forceReflow, 100);
      setTimeout(forceReflow, 400);
      // anche un resize sull'evento window della webview principale
      void win;
    } catch {
      // cross-origin: il sito esterno non si lascia modificare. Tutto OK.
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/sito" />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setReloadKey(k => k + 1)}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
            <IonButton onClick={() => openExternal(url)}>
              <IonIcon slot="icon-only" icon={openOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {slowHint && loading && (
          <div style={{
            background: 'var(--ion-color-warning)',
            color: '#000',
            padding: '6px 12px',
            fontSize: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}>
            <IonText>Caricamento più lento del solito…</IonText>
            <IonButton
              size="small"
              color="dark"
              fill="solid"
              onClick={() => openExternal(url)}
            >
              <IonIcon slot="start" icon={openOutline} /> Apri in browser
            </IonButton>
          </div>
        )}
      </IonHeader>
      <IonContent fullscreen scrollY={false}>
        {loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(248,248,248,0.85)', zIndex: 10,
            pointerEvents: 'none',
          }}>
            <IonSpinner name="dots" />
          </div>
        )}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={url}
          title={title}
          onLoad={onLoad}
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default SitoView;
