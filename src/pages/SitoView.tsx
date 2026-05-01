import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
} from '@ionic/react';
import { openOutline, refreshOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { openExternal } from '../services/download';
import { SITE } from '../config/site';

const useQuery = () => new URLSearchParams(useLocation().search);

const SitoView: React.FC = () => {
  const q = useQuery();
  const url = q.get('u') || SITE.baseUrl;
  const title = q.get('t') || 'Ordine Avvocati Napoli';

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
  }, [url, reloadKey]);

  const onLoad = () => {
    setLoading(false);
    // Tentativo di iniettare CSS mobile-friendly nell'iframe.
    // Funziona solo se same-origin o se il sito lo permette.
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const style = doc.createElement('style');
        style.textContent = SITE.mobileFriendlyCss;
        doc.head.appendChild(style);
      }
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
      </IonHeader>
      <IonContent fullscreen>
        {loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(248,248,248,0.85)', zIndex: 10,
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
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default SitoView;
