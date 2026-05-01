import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonItem, IonIcon, IonLabel,
} from '@ionic/react';
import { openOutline, chevronForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { SITE } from '../config/site';
import { openExternal } from '../services/download';

const Sito: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Sito COA</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList lines="full">
          {SITE.sections.map(s => (
            <IonItem
              key={s.id}
              button
              detail={false}
              onClick={() => {
                if (s.external) {
                  void openExternal(s.url);
                } else {
                  history.push(`/sito/view?u=${encodeURIComponent(s.url)}&t=${encodeURIComponent(s.label)}`);
                }
              }}
            >
              <IonIcon slot="start" icon={s.icon} color="primary" />
              <IonLabel>
                <h3>{s.label}</h3>
                <p style={{ fontSize: 12, opacity: 0.7 }}>{s.url.replace('https://', '')}</p>
              </IonLabel>
              <IonIcon slot="end" icon={s.external ? openOutline : chevronForwardOutline} color="medium" />
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Sito;
