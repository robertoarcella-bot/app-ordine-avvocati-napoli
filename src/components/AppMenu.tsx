import {
  IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonMenu, IonMenuToggle, IonTitle, IonToolbar,
} from '@ionic/react';
import {
  homeOutline, newspaperOutline, globeOutline, documentsOutline,
  appsOutline, lockClosedOutline, informationCircleOutline,
  shieldHalfOutline, peopleOutline, businessOutline, bookOutline,
  openOutline, createOutline,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';

interface MenuItem {
  title: string;
  /**
   * URL della rotta interna (es. /home) oppure prefisso 'EXTERNAL:<url>'
   * per aprire l'URL nel browser di sistema.
   */
  url: string;
  icon: string;
  /** true se apre in browser di sistema (mostra l'icona ↗ a destra) */
  external?: boolean;
}

const ALBO_NA_URL = '/sito/view?u=' + encodeURIComponent('https://www.ordineavvocatinapoli.it/albo-elenchi/') + '&t=' + encodeURIComponent('Albo Avvocati Napoli');
/**
 * L'Albo Nazionale (CNF) ha X-Frame-Options: SAMEORIGIN: non si lascia
 * embeddare in iframe. Apriamo in browser di sistema (Chrome Custom Tabs).
 */
const ALBO_NAZ_URL = 'EXTERNAL:https://www.consiglionazionaleforense.it/ricerca-avvocati';

const ITEMS: MenuItem[] = [
  { title: 'Home', url: '/home', icon: homeOutline },
  { title: 'Consiglio dell\'Ordine', url: '/consiglio', icon: peopleOutline },
  { title: 'News dal Consiglio', url: '/news', icon: newspaperOutline },
  { title: 'News dagli Uffici Giudiziari', url: '/news-uffici', icon: businessOutline },
  { title: 'Sito Ordine Avvocati', url: '/sito', icon: globeOutline },
  { title: 'Albo Avvocati Napoli', url: ALBO_NA_URL, icon: bookOutline },
  { title: 'Albo Nazionale Avvocati', url: ALBO_NAZ_URL, icon: bookOutline, external: true },
  { title: 'Documenti', url: '/documenti', icon: documentsOutline },
  { title: 'Strumenti', url: '/miniapps', icon: appsOutline },
  { title: 'Note di Udienza (Diritto Pratico)', url: '/sito/view?u=' + encodeURIComponent('https://note.dirittopratico.it/') + '&t=' + encodeURIComponent('Note di Udienza'), icon: createOutline },
  { title: 'Dislocazione Aule e Uffici', url: '/aule-udienze', icon: businessOutline },
  { title: 'Processo Telematico', url: '/processo-telematico', icon: shieldHalfOutline },
  { title: 'Area Riservata', url: '/area-riservata', icon: lockClosedOutline },
  { title: 'Commissione Informatica', url: '/commissione', icon: peopleOutline },
  { title: 'Info & Crediti', url: '/info', icon: informationCircleOutline },
];

const AppMenu: React.FC = () => {
  const onItemClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.external || item.url.startsWith('EXTERNAL:')) {
      e.preventDefault();
      const url = item.url.startsWith('EXTERNAL:') ? item.url.slice(9) : item.url;
      void Browser.open({ url });
    }
    // altrimenti il routerLink di Ionic gestisce la navigazione interna
  };

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
                routerLink={item.external ? undefined : item.url}
                routerDirection="root"
                lines="none"
                detail={false}
                button
                onClick={(e) => onItemClick(item, e)}
              >
                <IonIcon slot="start" icon={item.icon} color="primary" />
                <IonLabel>{item.title}</IonLabel>
                {item.external && (
                  <IonIcon slot="end" icon={openOutline} color="medium" />
                )}
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default AppMenu;
