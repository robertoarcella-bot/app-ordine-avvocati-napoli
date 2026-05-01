import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText, IonButton, IonIcon,
} from '@ionic/react';
import { lockClosedOutline, openOutline, constructOutline } from 'ionicons/icons';
import { openExternal } from '../services/download';
import { SITE } from '../config/site';

const AreaRiservata: React.FC = () => {
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
              <IonIcon icon={constructOutline} color="warning" /> In sviluppo
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>
                Il modulo nativo di accesso all'area riservata è in fase di sviluppo
                e verrà rilasciato in un prossimo aggiornamento, non appena saranno
                disponibili le credenziali di test.
              </p>
              <p>
                Nel frattempo è possibile accedere all'area riservata tramite il
                sito ufficiale del Consiglio.
              </p>
            </IonText>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <IonButton expand="block" onClick={() => openExternal(SITE.loginUrl)}>
                <IonIcon slot="start" icon={lockClosedOutline} />
                Accedi sul sito
                <IonIcon slot="end" icon={openOutline} />
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AreaRiservata;
