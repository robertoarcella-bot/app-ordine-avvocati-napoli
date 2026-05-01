import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonMenuButton, IonText,
  IonList, IonItem, IonIcon, IonLabel, IonNote, IonCard, IonCardContent,
} from '@ionic/react';
import {
  documentTextOutline, openOutline, downloadOutline,
} from 'ionicons/icons';
import { downloadAndOpen, openExternal } from '../services/download';

interface DocLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'pdf' | 'page' | 'external';
}

/**
 * Catalogo documenti pubblici di rilievo del COA Napoli.
 * Manualmente curato per ora; in futuro può essere alimentato da
 * una pagina dedicata del sito o un endpoint JSON.
 */
const DOCS: DocLink[] = [
  {
    id: 'modulistica',
    title: 'Modulistica Ordine Professionale',
    description: 'Tutti i moduli per iscrizioni, cancellazioni, certificati',
    url: 'https://www.ordineavvocatinapoli.it/modulistica-ordine-professionale/',
    type: 'page',
  },
  {
    id: 'albo',
    title: 'Albo ed Elenchi',
    description: 'Albo avvocati, praticanti, elenchi specialistici',
    url: 'https://www.ordineavvocatinapoli.it/albo-elenchi/',
    type: 'page',
  },
  {
    id: 'regolamenti',
    title: 'Compiti e regolamenti',
    description: 'Statuto, regolamenti interni, codici deontologici',
    url: 'https://www.ordineavvocatinapoli.it/componenti-c-o-a/compiti-e-regolamenti/',
    type: 'page',
  },
  {
    id: 'verbali',
    title: 'Verbali sedute consiliari',
    description: 'Delibere e verbali del Consiglio',
    url: 'https://www.ordineavvocatinapoli.it/category/delibere-consiglio-dell-ordine-degli-avvocati-di-napoli/',
    type: 'page',
  },
  {
    id: 'trasparenza',
    title: 'Amministrazione Trasparente',
    description: 'Documenti ai sensi del d.lgs. 33/2013',
    url: 'https://www.ordineavvocatinapoli.it/amministrazione-trasparente/',
    type: 'page',
  },
];

const DocumentiPage: React.FC = () => {
  const onClick = async (d: DocLink) => {
    if (d.type === 'pdf') {
      await downloadAndOpen(d.url);
    } else {
      await openExternal(d.url);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Documenti</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard color="light">
          <IonCardContent>
            <IonText>
              <small>
                I documenti contrassegnati con <IonIcon icon={downloadOutline} />
                vengono scaricati nella cartella Documenti del telefono. Quelli con
                {' '}<IonIcon icon={openOutline} /> aprono la relativa pagina del sito.
              </small>
            </IonText>
          </IonCardContent>
        </IonCard>
        <IonList lines="full">
          {DOCS.map(d => (
            <IonItem key={d.id} button detail={false} onClick={() => onClick(d)}>
              <IonIcon slot="start" icon={documentTextOutline} color="primary" />
              <IonLabel>
                <h3>{d.title}</h3>
                {d.description && <p>{d.description}</p>}
              </IonLabel>
              <IonNote slot="end">
                <IonIcon icon={d.type === 'pdf' ? downloadOutline : openOutline} color="medium" />
              </IonNote>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default DocumentiPage;
