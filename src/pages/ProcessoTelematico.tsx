import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonText,
} from '@ionic/react';
import {
  chevronForwardOutline, openOutline,
  cloudOfflineOutline, wifiOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router';
import { Browser } from '@capacitor/browser';
import { SOURCES } from '../config/sources';
import { MINIAPPS, type MiniApp } from '../config/miniapps';

const ProcessoTelematico: React.FC = () => {
  const history = useHistory();
  const tools = MINIAPPS.filter(a => a.jurisdiction === 'pct');

  const onOpenTool = (app: MiniApp) => {
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
          <IonTitle>Processo Telematico</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '12px 16px 0' }}>
          <IonText color="medium">
            <small>
              Notizie e avvisi ufficiali sui processi telematici (PCT, PPT) e
              strumenti operativi per i depositi.
            </small>
          </IonText>
        </div>

        <IonList lines="full">
          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Fonti di news ufficiali</strong></IonLabel>
          </IonItemDivider>
          {SOURCES.map(s => (
            <IonItem
              key={s.id}
              button
              detail={false}
              onClick={() => history.push(`/processo-telematico/${s.id}`)}
            >
              <IonIcon slot="start" icon={s.icon} color="primary" />
              <IonLabel>
                <h3>{s.shortLabel}</h3>
                <p style={{ whiteSpace: 'normal' }}>{s.description}</p>
              </IonLabel>
              <IonIcon slot="end" icon={chevronForwardOutline} color="medium" />
            </IonItem>
          ))}

          {tools.length > 0 && (
            <>
              <IonItemDivider color="light" sticky>
                <IonLabel><strong>Strumenti operativi</strong></IonLabel>
              </IonItemDivider>
              {tools.map(app => (
                <IonItem key={app.id} button detail={false} onClick={() => onOpenTool(app)}>
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
                      />
                    </h3>
                    <p style={{ whiteSpace: 'normal' }}>{app.subtitle}</p>
                  </IonLabel>
                  <IonIcon slot="end" icon={app.externalUrl ? openOutline : chevronForwardOutline} color="medium" />
                </IonItem>
              ))}
            </>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ProcessoTelematico;
