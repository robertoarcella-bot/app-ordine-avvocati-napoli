import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonText, IonSearchbar,
  IonList, IonItem, IonLabel, IonItemDivider, IonIcon,
  IonChip, IonCard, IonCardContent,
} from '@ionic/react';
import { useMemo, useState } from 'react';
import {
  callOutline, mailOutline, locationOutline,
  shieldCheckmarkOutline, businessOutline, printOutline,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { RECAPITI_UFFICI, type RecapitoUfficio } from '../config/recapiti-uffici-na';

const norm = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, "'");

const groupKey = (r: RecapitoUfficio) =>
  r.circondario ? `Circondario di ${r.circondario}` : 'Uffici distrettuali';

const RecapitiUffici: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = norm(search.trim());
    if (!q) return RECAPITI_UFFICI;
    return RECAPITI_UFFICI.filter(r => {
      const hay = norm([
        r.denominazione,
        r.tipoLabel,
        r.comune,
        r.provincia,
        r.circondario || '',
        r.indirizzo,
        r.email || '',
        r.telefono || '',
      ].join(' '));
      return hay.includes(q);
    });
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, RecapitoUfficio[]>();
    for (const r of filtered) {
      const k = groupKey(r);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    // Distrettuali in cima, poi i circondari in ordine alfabetico
    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === 'Uffici distrettuali') return -1;
      if (b === 'Uffici distrettuali') return 1;
      return a.localeCompare(b);
    });
    return keys.map(k => ({ key: k, items: map.get(k)! }));
  }, [filtered]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/aule-udienze" />
          </IonButtons>
          <IonTitle>Recapiti uffici</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={search}
            onIonInput={e => setSearch(String(e.detail.value || ''))}
            placeholder="Cerca per nome, comune, circondario, tipo…"
            debounce={150}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '8px 16px 0', fontSize: 12, color: 'var(--ion-color-medium)' }}>
          {filtered.length} {filtered.length === 1 ? 'ufficio' : 'uffici'} — Distretto Corte d'Appello di Napoli
        </div>
        {grouped.map(g => (
          <IonList key={g.key} lines="full">
            <IonItemDivider color="light" sticky>
              <IonLabel><strong>{g.key}</strong></IonLabel>
            </IonItemDivider>
            {g.items.map(r => (
              <IonCard key={r.id} style={{ borderRadius: 'var(--coa-card-radius)', boxShadow: 'var(--coa-card-shadow)', margin: '8px 12px' }}>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, color: 'var(--ion-color-primary-shade)', flex: 1, minWidth: 200 }}>
                      {r.denominazione}
                    </div>
                    <IonChip color="primary" outline style={{ marginInlineStart: 0, height: 22, fontSize: 11, flex: '0 0 auto' }}>
                      {r.tipoLabel}
                    </IonChip>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ion-color-medium)' }}>
                    {r.comune} ({r.provincia}){r.cap ? ` — ${r.cap}` : ''}
                  </div>
                  {r.note && (
                    <div style={{ marginTop: 4, fontSize: 12, fontStyle: 'italic', color: 'var(--ion-color-medium)' }}>
                      {r.note}
                    </div>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {r.indirizzo && (
                      <a
                        onClick={(e) => { e.preventDefault(); void Browser.open({ url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${r.indirizzo}, ${r.cap || ''} ${r.comune}`) }); }}
                        href="#"
                        style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'flex-start', textDecoration: 'none', color: 'var(--ion-color-primary)' }}>
                        <IonIcon icon={locationOutline} style={{ flex: '0 0 auto', marginTop: 2 }} />
                        <span style={{ wordBreak: 'break-word' }}>{r.indirizzo}</span>
                      </a>
                    )}
                    {r.telefono && (
                      <a
                        onClick={(e) => { e.preventDefault(); void Browser.open({ url: 'tel:' + r.telefono!.split(/[—;\/]/)[0].replace(/\s/g, '') }); }}
                        href="#"
                        style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'flex-start', textDecoration: 'none', color: 'var(--ion-color-primary)' }}>
                        <IonIcon icon={callOutline} style={{ flex: '0 0 auto', marginTop: 2 }} />
                        <span style={{ wordBreak: 'break-word' }}>{r.telefono}</span>
                      </a>
                    )}
                    {r.email && (
                      <a
                        onClick={(e) => { e.preventDefault(); void Browser.open({ url: 'mailto:' + r.email!.split(/[;,]/)[0].trim() }); }}
                        href="#"
                        style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'flex-start', textDecoration: 'none', color: 'var(--ion-color-primary)', wordBreak: 'break-all' }}>
                        <IonIcon icon={mailOutline} style={{ flex: '0 0 auto', marginTop: 2 }} />
                        <span>{r.email}</span>
                      </a>
                    )}
                    {r.fax && (
                      <div style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'flex-start', color: 'var(--ion-color-medium)' }}>
                        <IonIcon icon={printOutline} style={{ flex: '0 0 auto', marginTop: 2 }} />
                        <span style={{ wordBreak: 'break-word' }}>Fax {r.fax}</span>
                      </div>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <IonIcon icon={businessOutline} style={{ fontSize: 32, color: 'var(--ion-color-medium)' }} />
            <IonText color="medium"><p>Nessun ufficio trovato.</p></IonText>
          </div>
        )}
        <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ion-color-medium)', textAlign: 'center' }}>
          <IonIcon icon={shieldCheckmarkOutline} /> Dati estratti dal Ministero della Giustizia.
          Verificare sempre l'attualità dei recapiti.
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RecapitiUffici;
