import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonList, IonItem, IonIcon, IonLabel,
} from '@ionic/react';
import {
  chevronForwardOutline, openOutline,
  cloudOfflineOutline, wifiOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router';
import { Browser } from '@capacitor/browser';
import { MINIAPPS, type MiniApp } from '../config/miniapps';

const AuleUdienze: React.FC = () => {
  const history = useHistory();
  const items = MINIAPPS.filter(a => a.jurisdiction === 'sedi');

  const onOpen = (app: MiniApp) => {
    if (app.externalUrl) {
      void Browser.open({ url: app.externalUrl });
    } else {
      history.push(`/miniapps/${app.id}`);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Aule Udienze Napoli</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '12px 16px 0' }}>
          <IonText color="medium">
            <small>
              Calendari delle udienze, dislocazione delle aule e canali di
              segnalazione in tempo reale per gli uffici giudiziari di Napoli.
            </small>
          </IonText>
        </div>
        <IonList lines="full">
          {items.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <IonText color="medium">Nessuna voce disponibile.</IonText>
            </div>
          )}
          {items.map(app => (
            <IonItem key={app.id} button detail={false} onClick={() => onOpen(app)}>
              <IonIcon slot="start" icon={app.icon} color="primary" />
              <IonLabel>
                <h3>
                  {app.title}
                  <IonIcon
                    icon={app.externalUrl ? openOutline
                          : app.offlineReady ? cloudOfflineOutline
                          : wifiOutline}
                    color={app.externalUrl ? 'medium'
                           : app.offlineReady ? 'success'
                           : 'warning'}
                    style={{ verticalAlign: 'middle', marginLeft: 6, fontSize: 14 }}
                    title={app.externalUrl ? 'Apre in app esterna'
                           : app.offlineReady ? 'Funziona offline'
                           : 'Richiede internet'}
                  />
                </h3>
                <p style={{ whiteSpace: 'normal' }}>{app.subtitle}</p>
              </IonLabel>
              <IonIcon slot="end" icon={app.externalUrl ? openOutline : chevronForwardOutline} color="medium" />
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AuleUdienze;
