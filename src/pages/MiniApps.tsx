import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonText,
} from '@ionic/react';
import { chevronForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { MINIAPPS } from '../config/miniapps';

const MiniAppsPage: React.FC = () => {
  const history = useHistory();

  // Raggruppa per categoria
  const grouped = MINIAPPS.reduce<Record<string, typeof MINIAPPS>>((acc, m) => {
    const k = m.category || 'Strumenti';
    (acc[k] ||= []).push(m);
    return acc;
  }, {});

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Strumenti</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {MINIAPPS.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <IonText color="medium">
              Nessuno strumento disponibile al momento.
            </IonText>
          </div>
        )}
        <IonList lines="full">
          {Object.entries(grouped).map(([cat, apps]) => (
            <div key={cat}>
              <IonItemDivider color="light" sticky>{cat}</IonItemDivider>
              {apps.map(app => (
                <IonItem
                  key={app.id}
                  button
                  detail={false}
                  onClick={() => history.push(`/miniapps/${app.id}`)}
                >
                  <IonIcon slot="start" icon={app.icon} color="primary" />
                  <IonLabel>
                    <h3>{app.title}</h3>
                    <p>{app.subtitle}</p>
                  </IonLabel>
                  <IonIcon slot="end" icon={chevronForwardOutline} color="medium" />
                </IonItem>
              ))}
            </div>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MiniAppsPage;
