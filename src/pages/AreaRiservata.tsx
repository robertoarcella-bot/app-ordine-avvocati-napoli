import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonIcon, IonNote,
} from '@ionic/react';
import {
  lockClosedOutline, openOutline, logInOutline, ribbonOutline,
  shieldCheckmarkOutline, alertCircleOutline,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { AUTH_URLS } from '../services/auth';

/**
 * Area Riservata — apertura nel browser di sistema (Chrome Custom Tabs)
 * con flusso a 2 step esplicito.
 *
 * Il sito istituzionale ha un piccolo difetto di progettazione: dopo il
 * login il sistema NON redirige automaticamente all'area riservata
 * Consiglieri, ma resta sulla pagina di login con un link che l'utente
 * deve cliccare manualmente per entrare. Per evitare confusione,
 * questa pagina propone i due passaggi separatamente, con il secondo
 * URL ben evidenziato.
 */
const AreaRiservata: React.FC = () => {

  const openLogin = async () => {
    await Browser.open({ url: AUTH_URLS.loginPage });
  };

  const openConsiglieri = async () => {
    await Browser.open({ url: AUTH_URLS.areaConsiglieri });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Area Riservata</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        <IonCard color="warning">
          <IonCardContent>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: 22, flex: '0 0 auto' }} />
              <IonText>
                <strong>Attenzione</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                  Per accedere all'Area Riservata Consiglieri sono necessari
                  due passaggi: prima il login, poi un secondo tocco sul link
                  qui sotto. Senza il secondo tocco la sessione resta nel
                  browser ma non si entra nell'area vera e propria.
                </p>
              </IonText>
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={lockClosedOutline} color="primary" />{' '}
              Step 1 — Login al sito
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p style={{ marginTop: 0, fontSize: 14 }}>
                Apre la pagina di login del sito istituzionale del Consiglio
                nel browser di sistema. Compila il modulo con le tue
                credenziali di accesso.
              </p>
            </IonText>
            <IonButton expand="block" onClick={openLogin} color="primary">
              <IonIcon slot="start" icon={logInOutline} />
              Apri pagina di login
              <IonIcon slot="end" icon={openOutline} />
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard color="primary">
          <IonCardHeader>
            <IonCardTitle style={{ color: 'white' }}>
              <IonIcon icon={ribbonOutline} />{' '}
              Step 2 — Entra nell'Area Riservata Consiglieri
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="light">
              <p style={{ marginTop: 0, fontSize: 14 }}>
                <strong>Dopo aver effettuato il login</strong>, torna in app e
                tocca il pulsante qui sotto per entrare nell'area Consiglieri:
              </p>
            </IonText>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              color: 'white',
              wordBreak: 'break-all',
              marginBottom: 10,
            }}>
              {AUTH_URLS.areaConsiglieri}
            </div>
            <IonButton expand="block" onClick={openConsiglieri} color="light">
              <IonIcon slot="start" icon={ribbonOutline} color="primary" />
              Vai all'Area Riservata Consiglieri
              <IonIcon slot="end" icon={openOutline} color="primary" />
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonNote style={{
          display: 'flex', gap: 8, alignItems: 'flex-start',
          marginTop: 14, fontSize: 12, color: 'var(--ion-color-medium)',
          padding: '0 4px',
        }}>
          <IonIcon icon={shieldCheckmarkOutline} />
          <span>
            Le credenziali vengono inserite direttamente sul sito ufficiale
            del COA dentro il browser di sistema: l'app non le vede e non le
            memorizza. La sessione resta attiva nel browser anche tra
            aperture successive.
          </span>
        </IonNote>
      </IonContent>
    </IonPage>
  );
};

export default AreaRiservata;
