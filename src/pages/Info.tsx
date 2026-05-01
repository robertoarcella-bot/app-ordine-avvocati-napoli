import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonList, IonItem, IonIcon, IonLabel, IonNote,
} from '@ionic/react';
import {
  globeOutline, mailOutline, openOutline, codeSlashOutline,
  bulbOutline, ribbonOutline,
} from 'ionicons/icons';
import { openExternal } from '../services/download';

const APP_VERSION = '0.1.0';

const Info: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Info & Crediti</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
          <div style={{
            width: 96, height: 96, margin: '0 auto 12px',
            borderRadius: 16,
            background: 'var(--ion-color-primary)',
            color: 'var(--ion-color-primary-contrast)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, fontFamily: 'serif',
          }}>
            COA<br />NA
          </div>
          <h2 style={{ marginBottom: 4 }}>App COA Napoli</h2>
          <IonText color="medium">
            <small>Versione {APP_VERSION}</small>
          </IonText>
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Crediti</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none" style={{ background: 'transparent' }}>
              <IonItem lines="none">
                <IonIcon slot="start" icon={codeSlashOutline} color="primary" />
                <IonLabel>
                  <h3>Autore</h3>
                  <p>Avv. Roberto Arcella</p>
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={bulbOutline} color="secondary" />
                <IonLabel>
                  <h3>Idea e collaborazione</h3>
                  <p>Commissione Informatica del Consiglio dell'Ordine degli Avvocati di Napoli</p>
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={ribbonOutline} color="tertiary" />
                <IonLabel>
                  <h3>Per conto di</h3>
                  <p>Consiglio dell'Ordine degli Avvocati di Napoli</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Contatti istituzionali</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="full">
              <IonItem button detail={false} onClick={() => openExternal('https://www.ordineavvocatinapoli.it/')}>
                <IonIcon slot="start" icon={globeOutline} color="primary" />
                <IonLabel>
                  <h3>Sito ufficiale</h3>
                  <p>ordineavvocatinapoli.it</p>
                </IonLabel>
                <IonNote slot="end"><IonIcon icon={openOutline} /></IonNote>
              </IonItem>
              <IonItem button detail={false} onClick={() => openExternal('https://www.ordineavvocatinapoli.it/contatti-2/')}>
                <IonIcon slot="start" icon={mailOutline} color="primary" />
                <IonLabel>
                  <h3>Contatti</h3>
                  <p>Telefono, PEC, email</p>
                </IonLabel>
                <IonNote slot="end"><IonIcon icon={openOutline} /></IonNote>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <div style={{ padding: '8px 24px 32px', textAlign: 'center' }}>
          <IonText color="medium">
            <small>
              Quest'app è uno strumento informativo non ufficiale realizzato a beneficio
              degli iscritti. I contenuti sono attinti dal sito istituzionale del COA Napoli.
            </small>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Info;
