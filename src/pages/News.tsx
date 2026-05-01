import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonCard, IonCardContent, IonSpinner, IonText, IonButton,
  IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent,
  IonSearchbar,
} from '@ionic/react';
import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router';
import type { RefresherEventDetail } from '@ionic/core';
import { fetchNews, type NewsItem } from '../services/api';
import { cacheGet, cacheSet } from '../services/cache';
import { NEWS_CACHE_MINUTES, NEWS_PER_PAGE } from '../config/site';
import { format, parseISO } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

const CACHE_KEY = 'news:list:page1';

const NewsPage: React.FC = () => {
  const history = useHistory();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadFirst = useCallback(async (force = false, query = '') => {
    setError(null);
    if (!force && !query) {
      const cached = await cacheGet<NewsItem[]>(CACHE_KEY);
      if (cached) {
        setItems(cached);
        setPage(2);
        setHasMore(cached.length >= NEWS_PER_PAGE);
        setLoading(false);
        return;
      }
    }
    setLoading(true);
    try {
      const data = await fetchNews({ page: 1, search: query || undefined });
      setItems(data);
      setPage(2);
      setHasMore(data.length >= NEWS_PER_PAGE);
      if (!query) await cacheSet(CACHE_KEY, data, NEWS_CACHE_MINUTES);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    try {
      const data = await fetchNews({ page, search: search || undefined });
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...data]);
        setPage(p => p + 1);
        if (data.length < NEWS_PER_PAGE) setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }
  }, [page, search]);

  useEffect(() => { void loadFirst(); }, [loadFirst]);

  const onRefresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await loadFirst(true, search);
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>News</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder="Cerca nelle news..."
            value={search}
            onIonInput={e => setSearch(e.detail.value || '')}
            onIonChange={() => loadFirst(true, search)}
            debounce={500}
          />
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
              <IonText color="light">{error}</IonText>
              <div style={{ marginTop: 8 }}>
                <IonButton size="small" fill="outline" color="light" onClick={() => loadFirst(true, search)}>
                  Riprova
                </IonButton>
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
          <IonCard
            key={n.id}
            button
            onClick={() => history.push(`/news/${n.id}`)}
            style={{ borderRadius: 'var(--coa-card-radius)', boxShadow: 'var(--coa-card-shadow)' }}
          >
            {n.featuredImageUrl && (
              <img
                src={n.featuredImageUrl}
                alt=""
                style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }}
              />
            )}
            <IonCardContent>
              <div style={{ fontSize: 12, color: 'var(--ion-color-medium)' }}>
                {format(parseISO(n.date), "d MMMM yyyy", { locale: itLocale })}
              </div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{n.title}</div>
              {n.excerpt && (
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  {n.excerpt.length > 220 ? n.excerpt.slice(0, 220) + '…' : n.excerpt}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        ))}

        <IonInfiniteScroll
          onIonInfinite={async (ev) => {
            await loadMore();
            (ev.target as HTMLIonInfiniteScrollElement).complete();
          }}
          disabled={!hasMore}
        >
          <IonInfiniteScrollContent loadingText="Carico altre news..." />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default NewsPage;
