import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonText,
} from '@ionic/react';
import { chevronForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { SOURCES } from '../config/sources';
import { groupByJurisdiction } from '../config/jurisdictions';

const ProcessoTelematico: React.FC = () => {
  const history = useHistory();
  const groups = groupByJurisdiction(SOURCES);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Processo Telematico</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '12px 16px 0' }}>
          <IonText color="medium">
            <small>
              Notizie e avvisi ufficiali sui processi telematici, organizzati per area di competenza.
              Sfiora una fonte per leggerne le ultime news.
            </small>
          </IonText>
        </div>
        <IonList lines="full">
          {groups.map(g => (
            <div key={g.meta.id}>
              <IonItemDivider color="light" sticky>
                <IonLabel><strong>{g.meta.label}</strong></IonLabel>
              </IonItemDivider>
              {g.items.map(s => (
                <IonItem
                  key={s.id}
                  button
                  detail={false}
                  onClick={() => history.push(`/processo-telematico/${s.id}`)}
                >
                  <IonIcon slot="start" icon={s.icon} color="primary" />
                  <IonLabel>
                    <h3>{s.shortLabel}</h3>
                    <p style={{ whiteSpace: 'normal' }}>{s.description}</p>
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

export default ProcessoTelematico;
