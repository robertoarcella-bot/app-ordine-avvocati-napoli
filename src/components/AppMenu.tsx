import {
  IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonMenu, IonMenuToggle, IonNote, IonTitle, IonToolbar,
} from '@ionic/react';
import {
  homeOutline, newspaperOutline, globeOutline, documentsOutline,
  appsOutline, lockClosedOutline, informationCircleOutline,
} from 'ionicons/icons';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

const ITEMS: MenuItem[] = [
  { title: 'Home', url: '/home', icon: homeOutline },
  { title: 'News', url: '/news', icon: newspaperOutline },
  { title: 'Sito COA', url: '/sito', icon: globeOutline },
  { title: 'Documenti', url: '/documenti', icon: documentsOutline },
  { title: 'Strumenti', url: '/miniapps', icon: appsOutline },
  { title: 'Area Riservata', url: '/area-riservata', icon: lockClosedOutline },
  { title: 'Info & Crediti', url: '/info', icon: informationCircleOutline },
];

const AppMenu: React.FC = () => {
  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>COA Napoli</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonNote style={{ padding: '16px', display: 'block' }}>
            Consiglio dell'Ordine<br />
            degli Avvocati di Napoli
          </IonNote>
          {ITEMS.map(item => (
            <IonMenuToggle key={item.url} autoHide={false}>
              <IonItem
                routerLink={item.url}
                routerDirection="root"
                lines="none"
                detail={false}
              >
                <IonIcon slot="start" icon={item.icon} color="primary" />
                <IonLabel>{item.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default AppMenu;
