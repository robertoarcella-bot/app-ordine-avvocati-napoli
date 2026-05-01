import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonText,
  IonRefresher, IonRefresherContent, IonSpinner, IonButton, IonButtons, IonMenuButton,
} from '@ionic/react';
import {
  newspaperOutline, globeOutline, documentsOutline,
  appsOutline, lockClosedOutline,
  shieldHalfOutline,
} from 'ionicons/icons';
import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router';
import type { RefresherEventDetail } from '@ionic/core';
import { fetchNews, type NewsItem } from '../services/api';
import { cacheGet, cacheSet } from '../services/cache';
import { NEWS_CACHE_MINUTES } from '../config/site';
import { format, parseISO } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

const QUICK_TILES = [
  { label: 'News', icon: newspaperOutline, route: '/news', color: 'primary' },
  { label: 'Sito', icon: globeOutline, route: '/sito', color: 'secondary' },
  { label: 'Documenti', icon: documentsOutline, route: '/documenti', color: 'tertiary' },
  { label: 'Strumenti', icon: appsOutline, route: '/miniapps', color: 'primary' },
  { label: 'Processo Telematico', icon: shieldHalfOutline, route: '/processo-telematico', color: 'secondary' },
  { label: 'Area riservata', icon: lockClosedOutline, route: '/area-riservata', color: 'tertiary' },
];

const CACHE_KEY_LATEST = 'home:latest-news';

const Home: React.FC = () => {
  const history = useHistory();
  const [latest, setLatest] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setError(null);
    if (!force) {
      const cached = await cacheGet<NewsItem[]>(CACHE_KEY_LATEST);
      if (cached) {
        setLatest(cached);
        setLoading(false);
        return;
      }
    }
    setLoading(true);
    try {
      const items = await fetchNews({ perPage: 3 });
      setLatest(items);
      await cacheSet(CACHE_KEY_LATEST, items, NEWS_CACHE_MINUTES);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await load(true);
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle style={{ fontSize: 16 }}>Consiglio dell'Ordine</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <img
            src="/logo.jpg"
            alt="Consiglio dell'Ordine degli Avvocati di Napoli"
            style={{ maxWidth: 260, width: '70%', height: 'auto' }}
          />
        </div>
        <IonText>
          <h1 style={{ marginTop: 0, lineHeight: 1.2, fontSize: 20, textAlign: 'center' }}>
            Consiglio dell'Ordine degli Avvocati di Napoli
          </h1>
        </IonText>

        <IonGrid>
          <IonRow>
            {QUICK_TILES.map(t => (
              <IonCol size="6" sizeMd="4" key={t.route}>
                <IonCard
                  button
                  onClick={() => history.push(t.route)}
                  style={{ textAlign: 'center', borderRadius: 'var(--coa-card-radius)', boxShadow: 'var(--coa-card-shadow)' }}
                >
                  <IonCardContent>
                    <IonIcon icon={t.icon} color={t.color} style={{ fontSize: 36 }} />
                    <div style={{ marginTop: 8, fontWeight: 600 }}>{t.label}</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <h3 style={{ marginTop: 24, marginBottom: 8 }}>Ultime news</h3>
        {loading && !latest && (
          <div style={{ textAlign: 'center', padding: 24 }}><IonSpinner name="dots" /></div>
        )}
        {error && (
          <IonCard color="danger">
            <IonCardContent>
              {error}
              <div style={{ marginTop: 8 }}>
                <IonButton size="small" fill="outline" color="light" onClick={() => load(true)}>Riprova</IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}
        {latest?.map(n => (
          <IonCard
            key={n.id}
            button
            onClick={() => history.push(`/news/${n.id}`)}
            style={{ borderRadius: 'var(--coa-card-radius)', boxShadow: 'var(--coa-card-shadow)' }}
          >
            <IonCardContent>
              <div style={{ fontSize: 12, color: 'var(--ion-color-medium)' }}>
                {format(parseISO(n.date), "d MMMM yyyy", { locale: itLocale })}
              </div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{n.title}</div>
              {n.excerpt && (
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  {n.excerpt.length > 140 ? n.excerpt.slice(0, 140) + '…' : n.excerpt}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        ))}
        {latest && latest.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <IonButton fill="clear" onClick={() => history.push('/news')}>
              Vedi tutte le news
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
