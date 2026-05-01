import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonText,
} from '@ionic/react';
import { useParams } from 'react-router';
import { MINIAPPS } from '../config/miniapps';

interface RouteParams { id: string }

const MiniAppView: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const app = MINIAPPS.find(a => a.id === id);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/miniapps" />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>{app?.title || 'Strumento'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {!app ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <IonText color="medium">Strumento non trovato.</IonText>
          </div>
        ) : (
          <iframe
            src={`/${app.file}`}
            title={app.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ border: 'none', width: '100%', height: '100%' }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default MiniAppView;
