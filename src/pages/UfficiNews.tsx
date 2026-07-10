import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonCard, IonCardContent, IonSpinner, IonText, IonButton,
  IonRefresher, IonRefresherContent, IonIcon,
} from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/core';
import { useEffect, useState, useCallback } from 'react';
import { openExternal } from '../services/download';
import { fetchUfficiNapoliNews } from '../services/sources/uffici-napoli';
import type { SourceNewsItem } from '../config/sources';
import { cacheGet, cacheSet } from '../services/cache';
import { alertCircleOutline, businessOutline } from 'ionicons/icons';
import SourceNewsCard from '../components/SourceNewsCard';

const CACHE_KEY = 'uffici-napoli:news';
const CACHE_MIN = 30;

const UfficiNews: React.FC = () => {
  const [items, setItems] = useState<SourceNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setError(null);
    if (!force) {
      const cached = await cacheGet<SourceNewsItem[]>(CACHE_KEY);
      if (cached) {
        setItems(cached);
        setLoading(false);
        return;
      }
    }
    setLoading(true);
    try {
      const data = await fetchUfficiNapoliNews();
      setItems(data);
      await cacheSet(CACHE_KEY, data, CACHE_MIN);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch-on-mount: falso positivo noto della regola (setState post-await).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const onRefresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await load(true);
    e.detail.complete();
  };

  const open = async (url: string) => { await openExternal(url); };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>Uffici Giudiziari Napoli</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '0 0 12px', fontSize: 12, color: 'var(--ion-color-medium)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <IonIcon icon={businessOutline} />
          <span>News aggregate da Tribunale di Napoli e Corte d'Appello di Napoli, in ordine cronologico.</span>
        </div>

        {loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24 }}><IonSpinner name="dots" /></div>
        )}

        {error && (
          <IonCard color="danger">
            <IonCardContent>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <IonIcon icon={alertCircleOutline} color="light" style={{ fontSize: 22, flex: '0 0 auto' }} />
                <div>
                  <IonText color="light"><strong>Impossibile recuperare le news</strong></IonText>
                  <div style={{ marginTop: 4 }}>
                    <IonText color="light"><small>{error}</small></IonText>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <IonButton size="small" fill="outline" color="light" onClick={() => load(true)}>
                      Riprova
                    </IonButton>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {items.length === 0 && !loading && !error && (
          <IonText color="medium">
            <p style={{ textAlign: 'center', marginTop: 32 }}>Nessuna news trovata.</p>
          </IonText>
        )}

        {items.map(n => (
          <SourceNewsCard key={n.id} item={n} onOpen={url => { void open(url); }} />
        ))}
      </IonContent>
    </IonPage>
  );
};

export default UfficiNews;
