import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonIcon, IonNote,
} from '@ionic/react';
import {
  lockClosedOutline, openOutline, logInOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { AUTH_URLS } from '../services/auth';

/**
 * Area Riservata — apertura nel browser di sistema (Chrome Custom Tabs).
 *
 * Niente iframe headless, niente WebView interna, niente gestione cookie:
 * il browser di sistema gestisce nativamente sessione, cookie, SSL e
 * funzionalità avanzate del sito (autocompletamento password se l'utente
 * usa un password manager). E' l'approccio più affidabile e meno fragile.
 */
const AreaRiservata: React.FC = () => {

  const openLoginInBrowser = async () => {
    await Browser.open({ url: AUTH_URLS.loginPage });
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

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={lockClosedOutline} color="primary" />{' '}
              Accesso al sito ufficiale
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p style={{ marginTop: 0 }}>
                L'area riservata viene aperta nel browser di sistema, dove
                potrai effettuare il login con le credenziali del sito
                istituzionale del Consiglio dell'Ordine degli Avvocati di
                Napoli.
              </p>
              <p style={{ fontSize: 13, color: 'var(--ion-color-medium)' }}>
                Il browser di sistema mantiene la tua sessione attiva tra
                aperture diverse e supporta nativamente i password manager
                del telefono.
              </p>
            </IonText>

            <IonButton expand="block" onClick={openLoginInBrowser} color="primary">
              <IonIcon slot="start" icon={logInOutline} />
              Apri area riservata nel browser
              <IonIcon slot="end" icon={openOutline} />
            </IonButton>

            <IonNote style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              marginTop: 14, fontSize: 12, color: 'var(--ion-color-medium)',
            }}>
              <IonIcon icon={shieldCheckmarkOutline} />
              <span>
                Le credenziali vengono inserite direttamente sul sito
                ufficiale del COA: l'app non le vede e non le memorizza.
              </span>
            </IonNote>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AreaRiservata;
