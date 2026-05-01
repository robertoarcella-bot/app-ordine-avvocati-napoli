import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText, IonButton, IonIcon,
  IonInput, IonLabel, IonItem, IonList, IonCheckbox, IonSpinner, IonNote,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  lockClosedOutline, openOutline, logInOutline, logOutOutline,
  alertCircleOutline, checkmarkCircleOutline, eyeOutline, eyeOffOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Browser } from '@capacitor/browser';
import {
  fetchCsrfToken, performLogin, performLogout,
  markLoggedIn, clearLoggedIn, isLoggedIn, getRememberedUsername,
  AUTH_URLS,
} from '../services/auth';

const AreaRiservata: React.FC = () => {
  const headlessIframeRef = useRef<HTMLIFrameElement>(null);
  const history = useHistory();

  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshState = async () => {
    setLogged(await isLoggedIn());
    const u = await getRememberedUsername();
    if (u) {
      setUsername(u);
      setRemember(true);
    }
  };

  useEffect(() => { void refreshState(); }, []);
  useIonViewWillEnter(() => { void refreshState(); });

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    if (!username.trim() || !password) {
      setError('Inserisci nome utente e password.');
      return;
    }
    if (!headlessIframeRef.current) {
      setError('Errore interno: iframe non pronto.');
      return;
    }
    setBusy(true);
    try {
      const token = await fetchCsrfToken();
      if (!token) {
        setError('Impossibile contattare il sito (token di sicurezza non ottenuto). Verifica la connessione.');
        setBusy(false);
        return;
      }
      const result = await performLogin(headlessIframeRef.current, {
        username: username.trim(),
        password,
        remember,
      }, token);

      if (result.ok) {
        await markLoggedIn(username.trim(), remember);
        setLogged(true);
        setSuccess('Accesso effettuato.');
        // Per sicurezza svuotiamo la password dal componente subito dopo
        setPassword('');
      } else {
        if (result.reason === 'invalid_credentials') {
          setError('Credenziali non corrette.');
        } else if (result.reason === 'network') {
          setError('Impossibile completare il login (timeout di rete).');
        } else if (result.reason === 'csrf') {
          setError('Token di sicurezza scaduto, riprova.');
        } else {
          setError('Login non riuscito. Riprova.');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore inatteso durante il login.');
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setError(null);
    setBusy(true);
    try {
      if (headlessIframeRef.current) {
        await performLogout(headlessIframeRef.current);
      }
      await clearLoggedIn();
      setLogged(false);
      setSuccess('Disconnessione effettuata.');
    } finally {
      setBusy(false);
    }
  };

  const openReservedArea = (url: string = AUTH_URLS.reservedHome, title: string = 'Area Riservata') => {
    // Apre l'area riservata DENTRO l'app (SitoView), non in Custom Tabs:
    // Chrome Custom Tabs ha un cookie jar separato dal WebView, quindi
    // i cookie wordpress_logged_in_* impostati durante il login B-bis
    // sono visibili SOLO al WebView interno dell'app.
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    history.push(`/sito/view?u=${u}&t=${t}`);
  };

  const openExternalBrowser = async (url: string) => {
    // Solo se proprio l'utente vuole aprire fuori — per l'area riservata
    // sconsigliato (Custom Tabs non ha la sessione).
    await Browser.open({ url });
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

        {/* Iframe headless per il flusso login/logout (sempre presente, nascosto) */}
        <iframe
          ref={headlessIframeRef}
          title="auth"
          style={{ display: 'none' }}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />

        {!logged && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={lockClosedOutline} color="primary" /> Accesso al sito
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText color="medium">
                  <p style={{ marginTop: 0 }}>
                    Effettua il login con le credenziali del sito ufficiale del
                    Consiglio dell'Ordine degli Avvocati di Napoli.
                  </p>
                </IonText>

                <form onSubmit={onSubmit}>
                  <IonList lines="full" style={{ background: 'transparent' }}>
                    <IonItem>
                      <IonLabel position="stacked">Nome utente</IonLabel>
                      <IonInput
                        value={username}
                        onIonInput={e => setUsername(String(e.detail.value ?? ''))}
                        autocomplete="username"
                        autocapitalize="off"
                        spellcheck={false}
                        disabled={busy}
                        required
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Password</IonLabel>
                      <IonInput
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onIonInput={e => setPassword(String(e.detail.value ?? ''))}
                        autocomplete="current-password"
                        disabled={busy}
                        required
                      />
                      <IonButton
                        slot="end"
                        fill="clear"
                        color="medium"
                        size="small"
                        type="button"
                        onClick={() => setShowPwd(s => !s)}
                        aria-label={showPwd ? 'Nascondi password' : 'Mostra password'}
                      >
                        <IonIcon slot="icon-only" icon={showPwd ? eyeOffOutline : eyeOutline} />
                      </IonButton>
                    </IonItem>
                    <IonItem lines="none">
                      <IonCheckbox
                        slot="start"
                        checked={remember}
                        onIonChange={e => setRemember(e.detail.checked)}
                        disabled={busy}
                      />
                      <IonLabel>Ricorda nome utente</IonLabel>
                    </IonItem>
                  </IonList>

                  {error && (
                    <IonCard color="danger" style={{ margin: '12px 0' }}>
                      <IonCardContent>
                        <IonIcon icon={alertCircleOutline} color="light" /> {error}
                      </IonCardContent>
                    </IonCard>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <IonButton expand="block" type="submit" disabled={busy}>
                      {busy ? <IonSpinner name="dots" /> : <>
                        <IonIcon slot="start" icon={logInOutline} /> Accedi
                      </>}
                    </IonButton>
                  </div>
                </form>

                <IonNote style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
                  <IonIcon icon={shieldCheckmarkOutline} /> La password non viene salvata
                  dall'app. La sessione resta attiva nel browser interno fino al logout.
                </IonNote>
              </IonCardContent>
            </IonCard>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <IonButton fill="outline" size="small" onClick={() => openExternalBrowser(AUTH_URLS.loginPage)}>
                <IonIcon slot="start" icon={openOutline} />
                Apri sito di login nel browser
              </IonButton>
            </div>
          </>
        )}

        {logged && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={checkmarkCircleOutline} color="success" /> Accesso effettuato
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {username && (
                <IonText>
                  <p>Sei collegato come <strong>{username}</strong>.</p>
                </IonText>
              )}
              {success && (
                <IonText color="success"><p>{success}</p></IonText>
              )}
              <IonButton
                expand="block"
                onClick={() => openReservedArea(AUTH_URLS.reservedHome, 'Area Riservata Consiglieri')}
              >
                <IonIcon slot="start" icon={openOutline} /> Apri area riservata
              </IonButton>
              <IonNote style={{ display: 'block', marginTop: 8, fontSize: 11, textAlign: 'center' }}>
                L'area riservata viene aperta nel browser interno dell'app per
                preservare la sessione di accesso.
              </IonNote>
              <IonButton expand="block" fill="outline" color="medium" onClick={onLogout} disabled={busy} style={{ marginTop: 8 }}>
                {busy ? <IonSpinner name="dots" /> : <>
                  <IonIcon slot="start" icon={logOutOutline} /> Esci
                </>}
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AreaRiservata;
