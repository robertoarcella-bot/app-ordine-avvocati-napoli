import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider,
} from '@ionic/react';
import {
  chevronForwardOutline, businessOutline,
  callOutline, gridOutline, shieldHalfOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router';
import { MINIAPPS } from '../config/miniapps';
import { UFFICI } from '../config/uffici-giudiziari-na';
import MiniAppItem from '../components/MiniAppItem';
import { useOpenMiniApp } from '../hooks/useOpenMiniApp';

const AuleUdienze: React.FC = () => {
  const history = useHistory();
  const items = MINIAPPS.filter(a => a.jurisdiction === 'sedi');
  const onOpen = useOpenMiniApp();

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
            onClick={() => history.push('/aule-udienze/penali')}
          >
            <IonIcon slot="start" icon={shieldHalfOutline} color="primary" />
            <IonLabel>
              <h3>Cancellerie e uffici penali</h3>
              <p style={{ whiteSpace: 'normal' }}>
                Tribunale, Corte d'Appello, Sorveglianza, Procura e Procura Generale — Nuovo Palazzo di Giustizia, ricercabili per torre/piano
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
            <MiniAppItem key={app.id} app={app} onOpen={onOpen} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AuleUdienze;
