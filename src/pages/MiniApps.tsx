import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonText,
} from '@ionic/react';
import { chevronForwardOutline, cloudOfflineOutline, wifiOutline, openOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { Browser } from '@capacitor/browser';
import { MINIAPPS, type MiniApp } from '../config/miniapps';
import { groupByJurisdiction } from '../config/jurisdictions';

const MiniAppsPage: React.FC = () => {
  const history = useHistory();
  // "sedi" sono nella pagina "Aule Udienze Napoli"; "pct" sono dentro "Processo Telematico"
  const apps = MINIAPPS.filter(a => a.jurisdiction !== 'sedi' && a.jurisdiction !== 'pct');
  const groups = groupByJurisdiction(apps);

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
                  onClick={() => onOpen(app)}
                >
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
                    <p>{app.subtitle}</p>
                  </IonLabel>
                  <IonIcon slot="end" icon={app.externalUrl ? openOutline : chevronForwardOutline} color="medium" />
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
