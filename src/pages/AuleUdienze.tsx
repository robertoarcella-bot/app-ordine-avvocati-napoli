import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider,
} from '@ionic/react';
import {
  chevronForwardOutline, openOutline,
  cloudOfflineOutline, wifiOutline, businessOutline,
  callOutline, gridOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router';
import { Browser } from '@capacitor/browser';
import { MINIAPPS, type MiniApp } from '../config/miniapps';
import { UFFICI } from '../config/uffici-giudiziari-na';

const AuleUdienze: React.FC = () => {
  const history = useHistory();
  const items = MINIAPPS.filter(a => a.jurisdiction === 'sedi');

  const onOpen = (app: MiniApp) => {
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
          <IonTitle>Dislocazione Aule e Uffici</IonTitle>
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
          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Uffici Giudiziari di Napoli</strong></IonLabel>
          </IonItemDivider>
          {Object.values(UFFICI).map(office => (
            <IonItem
              key={office.id}
              button
              detail={false}
              onClick={() => history.push(`/aule-udienze/ufficio/${office.id}`)}
            >
              <IonIcon slot="start" icon={businessOutline} color="primary" />
              <IonLabel>
                <h3>{office.label}</h3>
                <p style={{ whiteSpace: 'normal' }}>
                  Magistrati ({office.magistrati.length}), uffici e cancellerie ({office.uffici.length})
                  {office.dislocazione ? `, dislocazione (${office.dislocazione.length})` : ''}
                </p>
              </IonLabel>
              <IonIcon slot="end" icon={chevronForwardOutline} color="medium" />
            </IonItem>
          ))}
          <IonItem
            button
            detail={false}
            onClick={() => history.push('/aule-udienze/sezioni')}
          >
            <IonIcon slot="start" icon={gridOutline} color="primary" />
            <IonLabel>
              <h3>Cerca per autorità e sezione</h3>
              <p style={{ whiteSpace: 'normal' }}>
                Tribunale o Corte d'Appello → sezione → elenco completo dei magistrati con piano e Torre
              </p>
            </IonLabel>
            <IonIcon slot="end" icon={chevronForwardOutline} color="medium" />
          </IonItem>
          <IonItem
            button
            detail={false}
            onClick={() => history.push('/aule-udienze/recapiti')}
          >
            <IonIcon slot="start" icon={callOutline} color="primary" />
            <IonLabel>
              <h3>Recapiti uffici giudiziari del distretto</h3>
              <p style={{ whiteSpace: 'normal' }}>
                Indirizzi, PEC, telefoni e fax di tutti gli uffici del distretto della Corte d'Appello di Napoli — ricercabili
              </p>
            </IonLabel>
            <IonIcon slot="end" icon={chevronForwardOutline} color="medium" />
          </IonItem>

          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Calendari e canali</strong></IonLabel>
          </IonItemDivider>
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
