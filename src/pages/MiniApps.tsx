import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonText,
} from '@ionic/react';
import { chevronForwardOutline, cloudOfflineOutline, wifiOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { MINIAPPS } from '../config/miniapps';
import { groupByJurisdiction } from '../config/jurisdictions';

const MiniAppsPage: React.FC = () => {
  const history = useHistory();
  const groups = groupByJurisdiction(MINIAPPS);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Strumenti</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {MINIAPPS.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <IonText color="medium">Nessuno strumento disponibile al momento.</IonText>
          </div>
        )}

        <div style={{ padding: '12px 16px 0', fontSize: 12, color: 'var(--ion-color-medium)' }}>
          <IonIcon icon={cloudOfflineOutline} /> = funziona offline (incluso nell'app)
          <span style={{ display: 'inline-block', marginLeft: 12 }}>
            <IonIcon icon={wifiOutline} /> = serve internet
          </span>
        </div>

        <IonList lines="full">
          {groups.map(g => (
            <div key={g.meta.id}>
              <IonItemDivider color="light" sticky>
                <IonLabel><strong>{g.meta.label}</strong></IonLabel>
              </IonItemDivider>
              {g.items.map(app => (
                <IonItem
                  key={app.id}
                  button
                  detail={false}
                  onClick={() => history.push(`/miniapps/${app.id}`)}
                >
                  <IonIcon slot="start" icon={app.icon} color="primary" />
                  <IonLabel>
                    <h3>
                      {app.title}
                      <IonIcon
                        icon={app.offlineReady ? cloudOfflineOutline : wifiOutline}
                        color={app.offlineReady ? 'success' : 'warning'}
                        style={{ verticalAlign: 'middle', marginLeft: 6, fontSize: 14 }}
                        title={app.offlineReady ? 'Funziona offline' : 'Richiede internet'}
                      />
                    </h3>
                    <p>{app.subtitle}</p>
                  </IonLabel>
                  <IonIcon slot="end" icon={chevronForwardOutline} color="medium" />
                </IonItem>
              ))}
            </div>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MiniAppsPage;
