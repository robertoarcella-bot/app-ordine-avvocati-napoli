import {
  IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonMenu, IonMenuToggle, IonTitle, IonToolbar,
} from '@ionic/react';
import {
  homeOutline, newspaperOutline, globeOutline, documentsOutline,
  appsOutline, lockClosedOutline, informationCircleOutline,
  shieldHalfOutline, peopleOutline, businessOutline, bookOutline,
} from 'ionicons/icons';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

const ALBO_URL = '/sito/view?u=' + encodeURIComponent('https://www.ordineavvocatinapoli.it/albo-elenchi/') + '&t=' + encodeURIComponent('Albo Avvocati');

const ITEMS: MenuItem[] = [
  { title: 'Home', url: '/home', icon: homeOutline },
  { title: 'Consiglio dell\'Ordine', url: '/consiglio', icon: peopleOutline },
  { title: 'News dal Consiglio', url: '/news', icon: newspaperOutline },
  { title: 'News dagli Uffici Giudiziari', url: '/news-uffici', icon: businessOutline },
  { title: 'Sito Ordine Avvocati', url: '/sito', icon: globeOutline },
  { title: 'Albo Avvocati', url: ALBO_URL, icon: bookOutline },
  { title: 'Documenti', url: '/documenti', icon: documentsOutline },
  { title: 'Strumenti', url: '/miniapps', icon: appsOutline },
  { title: 'Aule Udienze Napoli', url: '/aule-udienze', icon: businessOutline },
  { title: 'Processo Telematico', url: '/processo-telematico', icon: shieldHalfOutline },
  { title: 'Area Riservata', url: '/area-riservata', icon: lockClosedOutline },
  { title: 'Commissione Informatica', url: '/commissione', icon: peopleOutline },
  { title: 'Info & Crediti', url: '/info', icon: informationCircleOutline },
];

const AppMenu: React.FC = () => {
  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ fontSize: 16 }}>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px 16px 8px', textAlign: 'center', borderBottom: '1px solid var(--ion-color-light-shade)' }}>
          <img
            src="/logo.jpg"
            alt="Consiglio dell'Ordine degli Avvocati di Napoli"
            style={{ maxWidth: 200, width: '90%', height: 'auto' }}
          />
          <div style={{ fontSize: 13, color: 'var(--ion-color-medium)', marginTop: 4 }}>
            Consiglio dell'Ordine<br />degli Avvocati di Napoli
          </div>
        </div>
        <IonList>
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
