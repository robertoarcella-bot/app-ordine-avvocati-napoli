import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton,
  IonList, IonIcon, IonLabel, IonItemDivider, IonText,
} from '@ionic/react';
import { cloudOfflineOutline, wifiOutline } from 'ionicons/icons';
import { MINIAPPS } from '../config/miniapps';
import { groupByJurisdiction } from '../config/jurisdictions';
import MiniAppItem from '../components/MiniAppItem';
import { useOpenMiniApp } from '../hooks/useOpenMiniApp';

const MiniAppsPage: React.FC = () => {
  // "sedi" sono nella pagina "Dislocazione Aule e Uffici"; "pct" sono dentro "Processo Telematico"
  const apps = MINIAPPS.filter(a => a.jurisdiction !== 'sedi' && a.jurisdiction !== 'pct');
  const groups = groupByJurisdiction(apps);
  const onOpen = useOpenMiniApp();

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
            <IonText color="medium">Nessuno strumento disponibile al momento.</IonText>
          </div>
        )}

        <div style={{ padding: '12px 16px 0', fontSize: 12, color: 'var(--ion-color-medium)' }}>
          <IonIcon icon={cloudOfflineOutline} /> = funziona offline (incluso nell'app)
          <span style={{ display: 'inline-block', marginLeft: 12 }}>
            <IonIcon icon={wifiOutline} /> = serve internet
          </span>
        </div>

        <IonList lines="full">
          {groups.map(g => (
            <div key={g.meta.id}>
              <IonItemDivider color="light" sticky>
                <IonLabel><strong>{g.meta.label}</strong></IonLabel>
              </IonItemDivider>
              {g.items.map(app => (
                <MiniAppItem key={app.id} app={app} onOpen={onOpen} />
              ))}
            </div>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MiniAppsPage;
