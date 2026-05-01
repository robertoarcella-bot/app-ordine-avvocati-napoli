import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner, IonCard, IonCardContent,
} from '@ionic/react';
import { shareOutline, openOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import parse from 'html-react-parser';
import { Share } from '@capacitor/share';
import { fetchNewsById, type NewsItem } from '../services/api';
import { openExternal } from '../services/download';
import { format, parseISO } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

interface RouteParams { id: string }

const NewsDetail: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchNewsById(Number(id));
        if (alive) setItem(data);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Errore');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const onShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        title: item.title,
        text: item.title,
        url: item.link,
        dialogTitle: 'Condividi news',
      });
    } catch {
      // user dismissed
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/news" />
          </IonButtons>
          <IonTitle>News</IonTitle>
          <IonButtons slot="end">
            {item && (
              <IonButton onClick={onShare}>
                <IonIcon slot="icon-only" icon={shareOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {loading && (
          <div style={{ textAlign: 'center', padding: 24 }}><IonSpinner name="dots" /></div>
        )}

        {error && (
          <IonCard color="danger">
            <IonCardContent>{error}</IonCardContent>
          </IonCard>
        )}

        {item && (
          <article>
            {item.featuredImageUrl && (
              <img
                src={item.featuredImageUrl}
                alt=""
                style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
              />
            )}
            <div style={{ fontSize: 13, color: 'var(--ion-color-medium)' }}>
              {format(parseISO(item.date), "d MMMM yyyy", { locale: itLocale })}
            </div>
            <h1 style={{ marginTop: 8, lineHeight: 1.25 }}>{item.title}</h1>

            <div className="news-content" style={{ lineHeight: 1.6, fontSize: 16 }}>
              {item.contentHtml ? parse(item.contentHtml) : <p>{item.excerpt}</p>}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <IonButton fill="outline" onClick={() => openExternal(item.link)}>
                <IonIcon slot="start" icon={openOutline} />
                Apri sul sito
              </IonButton>
            </div>
          </article>
        )}
      </IonContent>
    </IonPage>
  );
};

export default NewsDetail;
