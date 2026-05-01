import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonIcon, IonNote,
} from '@ionic/react';
import {
  lockClosedOutline, openOutline, logInOutline, logOutOutline,
  shieldCheckmarkOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useIonViewWillEnter } from '@ionic/react';
import {
  markLoggedIn, clearLoggedIn, isLoggedIn,
  AUTH_URLS,
} from '../services/auth';

/**
 * Area Riservata — approccio "WebView pura".
 *
 * Perche' non un form nativo: il login del sito Profile Builder usa cookie
 * di sessione che, su Android WebView, vengono memorizzati con storage
 * partitioning. Un iframe nascosto cross-origin salva i cookie in una
 * partition diversa rispetto a quella usata quando il sito e' caricato
 * come top-frame: l'utente, dopo aver "loggato" via form nativo, in WebView
 * si ritrova ancora sloggato perche' i cookie non sono visibili.
 *
 * Soluzione: l'utente fa il login direttamente nella WebView interna che
 * mostra la pagina ufficiale del sito. I cookie sono first-party, persistono
 * nel CookieManager Android per le successive aperture di pagine riservate.
 *
 * L'app non vede e non tocca mai username/password.
 */
const AreaRiservata: React.FC = () => {
  const history = useHistory();
  const [seen, setSeen] = useState(false);

  const refresh = async () => setSeen(await isLoggedIn());
  useEffect(() => { void refresh(); }, []);
  useIonViewWillEnter(() => { void refresh(); });

  const openLoginPage = () => {
    const u = encodeURIComponent(AUTH_URLS.loginPage);
    const t = encodeURIComponent('Area Riservata');
    history.push(`/sito/view?u=${u}&t=${t}`);
    // Marchiamo localmente "l'utente ha visitato la pagina di login" come
    // hint UX (non e' una vera autenticazione, solo per cambiare l'aspetto
    // della home dell'area riservata)
    void markLoggedIn('', false);
  };

  const openLogoutPage = async () => {
    await clearLoggedIn();
    const u = encodeURIComponent(AUTH_URLS.logoutPage);
    const t = encodeURIComponent('Logout');
    history.push(`/sito/view?u=${u}&t=${t}`);
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
                L'area riservata viene aperta direttamente sul sito ufficiale
                del Consiglio dell'Ordine degli Avvocati di Napoli, dentro
                il browser interno dell'app.
              </p>
              <p style={{ fontSize: 13, color: 'var(--ion-color-medium)' }}>
                Effettua il login con le tue credenziali del sito; la sessione
                resta attiva finché non esegui il logout o non chiudi del
                tutto l'app.
              </p>
            </IonText>

            <IonButton expand="block" onClick={openLoginPage} color="primary">
              <IonIcon slot="start" icon={logInOutline} />
              {seen ? 'Apri area riservata' : 'Accedi all\'area riservata'}
            </IonButton>

            {seen && (
              <IonButton
                expand="block"
                fill="outline"
                color="medium"
                onClick={openLogoutPage}
                style={{ marginTop: 8 }}
              >
                <IonIcon slot="start" icon={logOutOutline} />
                Esci dal sito
              </IonButton>
            )}

            {seen && (
              <div style={{
                marginTop: 12, padding: 10, borderRadius: 8,
                background: 'rgba(45, 211, 111, 0.1)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <IonIcon icon={checkmarkCircleOutline} color="success" style={{ flex: '0 0 auto', marginTop: 2 }} />
                <IonText color="success">
                  <small>Sessione attiva nel browser interno dell'app.</small>
                </IonText>
              </div>
            )}

            <IonNote style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              marginTop: 14, fontSize: 12, color: 'var(--ion-color-medium)',
            }}>
              <IonIcon icon={shieldCheckmarkOutline} />
              <span>
                Le credenziali vengono inserite direttamente sul sito ufficiale
                del COA: l'app non le vede e non le memorizza.
              </span>
            </IonNote>
          </IonCardContent>
        </IonCard>

        <IonCard color="light">
          <IonCardContent>
            <IonText>
              <small>
                Se preferisci, puoi anche aprire l'area riservata in Chrome
                Custom Tabs (browser di sistema). In quel caso però, dopo il
                logout, dovrai ripetere l'accesso.
              </small>
            </IonText>
            <div style={{ marginTop: 12 }}>
              <IonButton
                size="small"
                fill="outline"
                onClick={() => window.open(AUTH_URLS.loginPage, '_blank')}
              >
                <IonIcon slot="start" icon={openOutline} />
                Apri in browser di sistema
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AreaRiservata;
