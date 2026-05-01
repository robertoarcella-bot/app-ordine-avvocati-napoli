import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonList, IonItem, IonIcon, IonLabel, IonItemDivider,
  IonAvatar,
} from '@ionic/react';
import {
  starOutline, ribbonOutline, personOutline,
} from 'ionicons/icons';

interface Member {
  name: string;
  surname: string;
  role: 'Delegato all\'informatica e all\'innovazione' | 'Coordinatore' | 'Componente';
  prefix?: string;  // es. "Cons. Avv." per il Delegato
}

const PRIMARY: Member[] = [
  {
    name: 'Roberto',
    surname: 'Arcella',
    role: "Delegato all'informatica e all'innovazione",
    prefix: 'Cons. Avv.',
  },
  {
    name: 'Leonardo',
    surname: 'Scinto',
    role: 'Coordinatore',
    prefix: 'Avv.',
  },
];

/** Componenti in ordine alfabetico per cognome */
const COMPONENTI: Member[] = [
  { name: 'Alessio', surname: 'Borgo', role: 'Componente', prefix: 'Avv.' },
  { name: 'Bruno', surname: 'Botti', role: 'Componente', prefix: 'Avv.' },
  { name: 'Fabrizio', surname: 'Cesare', role: 'Componente', prefix: 'Avv.' },
  { name: 'Raffaele', surname: 'De Cicco', role: 'Componente', prefix: 'Avv.' },
  { name: 'Francesco', surname: 'Migliarotti', role: 'Componente', prefix: 'Avv.' },
  { name: 'Raffaele', surname: 'Monaco', role: 'Componente', prefix: 'Avv.' },
  { name: 'Pierluigi', surname: 'Serra', role: 'Componente', prefix: 'Avv.' },
  { name: 'Orso Maria', surname: 'Soporso', role: 'Componente', prefix: 'Avv.' },
  { name: 'Davide', surname: 'Villani', role: 'Componente', prefix: 'Avv.' },
];

const fullName = (m: Member) =>
  `${m.prefix ? m.prefix + ' ' : ''}${m.name} ${m.surname}`;

const initials = (m: Member) =>
  (m.name.charAt(0) + m.surname.charAt(0)).toUpperCase();

const colorForRole = (r: Member['role']) =>
  r === "Delegato all'informatica e all'innovazione" ? 'primary'
  : r === 'Coordinatore' ? 'secondary'
  : 'medium';

const iconForRole = (r: Member['role']) =>
  r === "Delegato all'informatica e all'innovazione" ? starOutline
  : r === 'Coordinatore' ? ribbonOutline
  : personOutline;

const renderMember = (m: Member) => (
  <IonItem key={`${m.surname}-${m.name}`} lines="full">
    <IonAvatar slot="start" style={{
      background: `var(--ion-color-${colorForRole(m.role)})`,
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 14,
    }}>
      {initials(m)}
    </IonAvatar>
    <IonLabel>
      <h3 style={{ fontWeight: 600 }}>{fullName(m)}</h3>
      <p style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IonIcon icon={iconForRole(m.role)} color={colorForRole(m.role)} style={{ fontSize: 14 }} />
        {m.role}
      </p>
    </IonLabel>
  </IonItem>
);

const Commissione: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/info" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>Commissione Informatica</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '20px 16px 8px', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0, marginBottom: 4 }}>Commissione Informatica</h2>
          <IonText color="medium">
            <small>Consiglio dell'Ordine degli Avvocati di Napoli</small>
          </IonText>
        </div>

        <IonList lines="full">
          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Delegato</strong></IonLabel>
          </IonItemDivider>
          {renderMember(PRIMARY[0])}

          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Coordinatore</strong></IonLabel>
          </IonItemDivider>
          {renderMember(PRIMARY[1])}

          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Componenti</strong></IonLabel>
          </IonItemDivider>
          {COMPONENTI.map(renderMember)}
        </IonList>

        <div style={{ padding: '16px 24px 32px', textAlign: 'center' }}>
          <IonText color="medium">
            <small>
              La Commissione Informatica del Consiglio dell'Ordine degli Avvocati di Napoli promuove la digitalizzazione
              della professione forense, supporta l'innovazione tecnologica negli studi
              legali e nei servizi telematici della giustizia, e ha ideato questa app
              come strumento informativo a beneficio degli iscritti.
            </small>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Commissione;
