import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonList, IonItem, IonLabel, IonItemDivider, IonAvatar,
  IonIcon,
} from '@ionic/react';
import { ribbonOutline, starOutline } from 'ionicons/icons';

interface Member {
  name: string;       // Nome
  surname: string;    // Cognome
  role: string;       // titolo (Presidente, Segretario, Vice Presidente, Consigliere…)
  isPresidency: boolean;
}

/**
 * Composizione del Consiglio dell'Ordine degli Avvocati di Napoli
 * (ordine come pubblicato sul sito istituzionale).
 */
const COUNCIL: Member[] = [
  // Ufficio di Presidenza
  { name: 'Carmine',   surname: 'Foreste',    role: 'Presidente',     isPresidency: true },
  { name: 'Antonio',   surname: 'Valentino',  role: 'Segretario',     isPresidency: true },
  { name: 'Loredana',  surname: 'Capocelli',  role: 'Tesoriera',      isPresidency: true },
  { name: 'Alfredo',   surname: 'Sorge',      role: 'Vice Presidente', isPresidency: true },
  { name: 'Gabriele',  surname: 'Esposito',   role: 'Vice Presidente', isPresidency: true },
  { name: 'Hilarry',   surname: 'Sedu',       role: 'Vice Presidente', isPresidency: true },
  // Consiglieri
  { name: 'Sergio',     surname: 'Longhi',           role: 'Consigliere', isPresidency: false },
  { name: 'Stefania',   surname: 'Armiero',          role: 'Consigliera', isPresidency: false },
  { name: 'Roberto',    surname: 'Arcella',          role: 'Consigliere', isPresidency: false },
  { name: 'Luigi',      surname: 'Aprea',            role: 'Consigliere', isPresidency: false },
  { name: 'Giovanni',   surname: 'Carini',           role: 'Consigliere', isPresidency: false },
  { name: 'Manuela',    surname: 'Palombi',          role: 'Consigliera', isPresidency: false },
  { name: 'Alessandro', surname: 'Numis',            role: 'Consigliere', isPresidency: false },
  { name: 'Dina',       surname: 'Cavalli',          role: 'Consigliera', isPresidency: false },
  { name: 'Federica',   surname: 'Mariottino',       role: 'Consigliera', isPresidency: false },
  { name: 'Ilaria',     surname: 'Imparato',         role: 'Consigliera', isPresidency: false },
  { name: 'Roberta',    surname: 'Foglia Manzillo',  role: 'Consigliera', isPresidency: false },
  { name: 'Giuseppe',   surname: 'Landolfo',         role: 'Consigliere', isPresidency: false },
  { name: 'Maria',      surname: 'Prisco',           role: 'Consigliera', isPresidency: false },
  { name: 'Luca',       surname: 'Zanchini',         role: 'Consigliere', isPresidency: false },
  { name: 'Antonella',  surname: 'Santoro',          role: 'Consigliera', isPresidency: false },
  { name: 'Roberta',    surname: 'Nobile',           role: 'Consigliera', isPresidency: false },
  { name: 'Felice',     surname: 'Ciruzzi',          role: 'Consigliere', isPresidency: false },
];

const initials = (m: Member) =>
  (m.name.charAt(0) + m.surname.charAt(0)).toUpperCase();

const colorForRole = (m: Member): 'primary' | 'secondary' | 'tertiary' | 'medium' => {
  if (m.role === 'Presidente') return 'primary';
  if (m.role === 'Segretario' || m.role === 'Tesoriera' || m.role === 'Tesoriere') return 'secondary';
  if (m.role.startsWith('Vice')) return 'tertiary';
  return 'medium';
};

const renderMember = (m: Member, idx: number) => (
  <IonItem key={`${m.surname}-${m.name}-${idx}`} lines="full">
    <IonAvatar slot="start" style={{
      background: `var(--ion-color-${colorForRole(m)})`,
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 14,
      flex: '0 0 auto',
    }}>
      {initials(m)}
    </IonAvatar>
    <IonLabel>
      <h3 style={{ fontWeight: 600 }}>Avv. {m.name} {m.surname}</h3>
      <p style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {m.isPresidency
          ? <IonIcon icon={starOutline} color={colorForRole(m)} style={{ fontSize: 14 }} />
          : <IonIcon icon={ribbonOutline} color="medium" style={{ fontSize: 14 }} />}
        {m.role}
      </p>
    </IonLabel>
  </IonItem>
);

const Consiglio: React.FC = () => {
  const presidency = COUNCIL.filter(m => m.isPresidency);
  const consiglieri = COUNCIL.filter(m => !m.isPresidency);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>Consiglio dell'Ordine</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '20px 16px 8px', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0, marginBottom: 4, lineHeight: 1.2 }}>
            Consiglio dell'Ordine
          </h2>
          <IonText color="medium">
            <small>degli Avvocati di Napoli — Composizione</small>
          </IonText>
        </div>

        <IonList lines="full">
          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Ufficio di Presidenza</strong></IonLabel>
          </IonItemDivider>
          {presidency.map((m, i) => renderMember(m, i))}

          <IonItemDivider color="light" sticky>
            <IonLabel><strong>Consiglieri</strong></IonLabel>
          </IonItemDivider>
          {consiglieri.map((m, i) => renderMember(m, i + 100))}
        </IonList>

        <div style={{ padding: '16px 24px 32px', textAlign: 'center' }}>
          <IonText color="medium">
            <small>
              Composizione del Consiglio in carica come pubblicata sul sito
              istituzionale dell'Ordine degli Avvocati di Napoli.
            </small>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Consiglio;
