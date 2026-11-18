import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
  IonCard, IonCardContent, IonText,
  IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent,
} from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/core';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useHistory } from 'react-router';
import { openExternal } from '../services/download';
import { getSource, type SourceNewsItem } from '../config/sources';
import { cacheGet, cacheSet } from '../services/cache';
import { openOutline, alertCircleOutline, refreshOutline } from 'ionicons/icons';
import SourceNewsCard from '../components/SourceNewsCard';
import { useIframeScrollWake } from '../hooks/useIframeScrollWake';

interface RouteParams { sourceId: string }

const CACHE_MINUTES = 30;

const SourceNews: React.FC = () => {
  const { sourceId } = useParams<RouteParams>();
  const history = useHistory();
  const source = getSource(sourceId);

  const [items, setItems] = useState<SourceNewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const cacheKey = `source:${sourceId}:p1`;

  const loadFirst = useCallback(async (force = false) => {
    if (!source || !source.fetchNews) return;
    setError(null);
    if (!force) {
      const cached = await cacheGet<SourceNewsItem[]>(cacheKey);
      if (cached) {
        setItems(cached);
        setPage(2);
        setHasMore(cached.length > 0);
        setLoading(false);
        return;
      }
    }
    setLoading(true);
    try {
      const data = await source.fetchNews(1);
      setItems(data);
      setPage(2);
      setHasMore(data.length > 0);
      await cacheSet(cacheKey, data, CACHE_MINUTES);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di caricamento');
    } finally {
      setLoading(false);
    }
  }, [source, cacheKey]);

  const loadMore = useCallback(async () => {
    if (!source || !source.fetchNews) return;
    try {
      const data = await source.fetchNews(page);
      const existing = new Set(items.map(i => i.id));
      const fresh = data.filter(d => !existing.has(d.id));
      if (fresh.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...fresh]);
        setPage(p => p + 1);
      }
    } catch {
      setHasMore(false);
    }
  }, [source, page, items]);

  const isWebview = source?.viewMode === 'webview';

  useEffect(() => {
    // In modalità webview non c'è nulla da caricare qui: lo spinner è
    // gestito da SourceWebView e lo stato `loading` esterno non è usato.
    if (source && source.viewMode !== 'webview') {
      // Fetch-on-mount: falso positivo noto della regola (setState post-await).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadFirst();
    }
  }, [loadFirst, source]);

  const onRefresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await loadFirst(true);
    e.detail.complete();
  };

  const openInBrowser = async (url: string) => {
    await openExternal(url);
  };

  if (!source) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/processo-telematico" />
            </IonButtons>
            <IonTitle>Fonte non trovata</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <IonText color="medium">
            La fonte richiesta non esiste. <IonButton fill="clear" onClick={() => history.goBack()}>Torna indietro</IonButton>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  // -------- WEBVIEW MODE: mostra direttamente la pagina news del sito --------
  if (isWebview) {
    return <SourceWebView source={source} reloadKey={reloadKey} bumpReload={() => setReloadKey(k => k + 1)} />;
  }

  // -------- NATIVE MODE: lista nativa con cards --------
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/processo-telematico" />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>{source.shortLabel}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent />
        </IonRefresher>

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
                    <IonButton size="small" fill="outline" color="light" onClick={() => loadFirst(true)}>
                      Riprova
                    </IonButton>
                    <IonButton size="small" fill="outline" color="light" onClick={() => openInBrowser(source.baseUrl)}>
                      Apri sul sito
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
          <SourceNewsCard key={n.id} item={n} onOpen={url => { void openInBrowser(url); }} />
        ))}

        <IonInfiniteScroll
          onIonInfinite={async (ev) => {
            await loadMore();
            (ev.target as HTMLIonInfiniteScrollElement).complete();
          }}
          disabled={!hasMore || items.length === 0}
        >
          <IonInfiniteScrollContent loadingText="Carico altre news..." />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

// ---------------------------------------------------------------------------

interface WebViewProps {
  source: NonNullable<ReturnType<typeof getSource>>;
  reloadKey: number;
  bumpReload: () => void;
}

const SourceWebView: React.FC<WebViewProps> = ({ source, reloadKey, bumpReload }) => {
  const url = source.newsUrl || source.baseUrl;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wakeOnLoad = useIframeScrollWake(iframeRef);
  const [loading, setLoading] = useState(true);

  // Rimostra lo spinner quando cambia la pagina o si ricarica: pattern React
  // "adjust state when props change" (setState durante il render).
  const viewKey = `${reloadKey}|${url}`;
  const [prevViewKey, setPrevViewKey] = useState(viewKey);
  if (prevViewKey !== viewKey) {
    setPrevViewKey(viewKey);
    setLoading(true);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/processo-telematico" />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>{source.shortLabel}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={bumpReload}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
            <IonButton onClick={() => openExternal(url)}>
              <IonIcon slot="icon-only" icon={openOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {/* scrollY=false: scorre solo l'iframe (niente scroller annidati) */}
      <IonContent scrollY={false}>
        {loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 10,
          }}>
            <IonSpinner name="dots" />
          </div>
        )}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={url}
          title={source.shortLabel}
          onLoad={() => { setLoading(false); wakeOnLoad(); }}
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

export default SourceNews;
