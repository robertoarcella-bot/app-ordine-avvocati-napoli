import { IonCard, IonCardContent, IonChip, IonIcon } from '@ionic/react';
import { openOutline } from 'ionicons/icons';
import { format, parseISO } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import type { SourceNewsItem } from '../config/sources';

interface Props {
  item: SourceNewsItem;
  onOpen: (url: string) => void;
}

/** Data leggibile in italiano; ripiega sulla stringa raw se non è ISO */
const formatDate = (d: string): string => {
  try {
    return format(parseISO(d), 'd MMMM yyyy', { locale: itLocale });
  } catch {
    return d;
  }
};

/**
 * Card per una news di fonte esterna (PST, Giustizia Tributaria, uffici
 * giudiziari): categoria, data, titolo, excerpt e link "Apri sul sito".
 */
const SourceNewsCard: React.FC<Props> = ({ item: n, onOpen }) => (
  <IonCard
    button
    onClick={() => onOpen(n.link)}
    style={{ borderRadius: 'var(--coa-card-radius)', boxShadow: 'var(--coa-card-shadow)' }}
  >
    {n.imageUrl && (
      <img
        src={n.imageUrl}
        alt=""
        loading="lazy"
        style={{ width: '100%', maxHeight: 160, objectFit: 'cover' }}
      />
    )}
    <IonCardContent>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {n.category && (
          <IonChip color="primary" outline style={{ marginInlineStart: 0, height: 22, fontSize: 11 }}>
            {n.category}
          </IonChip>
        )}
        {n.date && (
          <span style={{ fontSize: 12, color: 'var(--ion-color-medium)' }}>
            {formatDate(n.date)}
          </span>
        )}
      </div>
      <div style={{ fontWeight: 700, marginTop: 6 }}>{n.title}</div>
      {n.excerpt && (
        <div style={{ marginTop: 6, fontSize: 14 }}>
          {n.excerpt.length > 200 ? n.excerpt.slice(0, 200) + '…' : n.excerpt}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ion-color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        Apri sul sito <IonIcon icon={openOutline} />
      </div>
    </IonCardContent>
  </IonCard>
);

export default SourceNewsCard;
