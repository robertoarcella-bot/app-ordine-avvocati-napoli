import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonText,
  IonToggle, IonNote,
} from '@ionic/react';
import {
  chevronForwardOutline, openOutline,
  cloudOfflineOutline, wifiOutline, notificationsOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Browser } from '@capacitor/browser';
import { SOURCES } from '../config/sources';
import { MINIAPPS, type MiniApp } from '../config/miniapps';
import {
  getNotifyPref, setNotifyPref,
  requestNotificationPermission, checkNotificationPermission,
} from '../services/notifications';

const ProcessoTelematico: React.FC = () => {
  const history = useHistory();
  const tools = MINIAPPS.filter(a => a.jurisdiction === 'pct');
  const [notifyOn, setNotifyOn] = useState(false);

  useEffect(() => {
    (async () => {
      const pref = await getNotifyPref();
      const sysOk = await checkNotificationPermission();
      setNotifyOn(pref === 'enabled' && sysOk);
    })();
  }, []);

  const onToggleNotifications = async (next: boolean) => {
    if (next) {
      const granted = await requestNotificationPermission();
      setNotifyOn(granted);
    } else {
      await setNotifyPref('denied');
      setNotifyOn(false);
    }
  };

  const onOpenTool = (app: MiniApp) => {
    if (app.externalUrl) {
      void Browser.open({ url: app.externalUrl });
    } else if (app.webviewUrl) {
      const u = encodeURIComponent(app.webviewUrl);
      const t = encodeURIComponent(app.title);
      history.push(`/sito/view?u=${u}&t=${t}`);
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
            <IonLabel><strong>Notifiche</strong></IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonIcon slot="start" icon={notificationsOutline} color={notifyOn ? 'success' : 'medium'} />
            <IonLabel>
              <h3>Notifiche nuovi avvisi PST</h3>
              <p style={{ whiteSpace: 'normal' }}>
                Ricevi una notifica quando il Portale Servizi Telematici del
                Min. Giustizia pubblica un nuovo avviso (richiede autorizzazione).
              </p>
            </IonLabel>
            <IonToggle
              slot="end"
              checked={notifyOn}
              onIonChange={(e) => onToggleNotifications(e.detail.checked)}
            />
          </IonItem>
          {notifyOn && (
            <IonItem lines="full">
              <IonNote style={{ fontSize: 11, padding: '6px 0' }}>
                Le notifiche vengono verificate all'apertura dell'app e quando
                torna in primo piano. Per la versione background continuativa
                serve un servizio dedicato (in roadmap).
              </IonNote>
            </IonItem>
          )}

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
