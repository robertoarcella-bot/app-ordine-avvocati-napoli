import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonSegment, IonSegmentButton,
  IonLabel, IonSearchbar, IonList, IonItem, IonIcon, IonChip,
  IonText, IonModal, IonButton, IonCard, IonCardContent,
  IonItemDivider, IonBadge,
} from '@ionic/react';
import { useMemo, useState } from 'react';
import {
  layersOutline, callOutline, mailOutline, shieldCheckmarkOutline,
  closeOutline, businessOutline, personOutline, locationOutline,
  homeOutline, alertCircleOutline,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import {
  UFFICI_PENALI, ENTI_PENALI,
  type EntePenale, type UfficioPenale,
} from '../config/uffici-penali-na';

const norm = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, "'");

const firstFromList = (s: string | undefined) =>
  (s || '').split(/[;,]/)[0].trim();

const UfficiPenali: React.FC = () => {
  const [enteFilter, setEnteFilter] = useState<EntePenale | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UfficioPenale | null>(null);

  const filtered = useMemo(() => {
    let arr = UFFICI_PENALI;
    if (enteFilter !== 'all') {
      arr = arr.filter(u => u.ente === enteFilter);
    }
    const q = norm(search.trim());
    if (q) {
      arr = arr.filter(u =>
        norm([
          u.ufficio, u.macroArea, u.enteLabel, u.sede,
          u.torre, u.piano, u.stanza,
          u.email, u.pec, u.telResp,
        ].filter(Boolean).join(' ')).includes(q)
      );
    }
    return arr;
  }, [enteFilter, search]);

  // Raggruppa per ente (quando "all"), altrimenti per macro-area
  const groups = useMemo(() => {
    const map = new Map<string, UfficioPenale[]>();
    for (const u of filtered) {
      const k = enteFilter === 'all' ? u.enteLabel : u.macroArea || '—';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(u);
    }
    return Array.from(map.entries()).map(([k, items]) => ({ key: k, items }));
  }, [filtered, enteFilter]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/aule-udienze" />
          </IonButtons>
          <IonTitle>Cancellerie e uffici penali</IonTitle>
        </IonToolbar>
        <IonToolbar color="primary">
          <IonSegment
            value={enteFilter}
            onIonChange={e => setEnteFilter(e.detail.value as EntePenale | 'all')}
            color="light"
            scrollable
          >
            <IonSegmentButton value="all"><IonLabel>Tutti</IonLabel></IonSegmentButton>
            {ENTI_PENALI.map(e => (
              <IonSegmentButton key={e.id} value={e.id}>
                <IonLabel>{e.short}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={search}
            onIonInput={e => setSearch(String(e.detail.value || ''))}
            placeholder="Cerca per ufficio, sezione, torre, piano…"
            debounce={150}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '8px 16px 0', fontSize: 12, color: 'var(--ion-color-medium)' }}>
          {filtered.length} ufficio/i — Nuovo Palazzo di Giustizia di Napoli
        </div>

        {groups.map(g => (
          <IonList key={g.key} lines="full">
            <IonItemDivider color="light" sticky>
              <IonLabel><strong>{g.key}</strong></IonLabel>
            </IonItemDivider>
            {g.items.map(u => (
              <IonItem
                key={u.id}
                button
                detail={false}
                onClick={() => setSelected(u)}
              >
                <IonIcon slot="start" icon={businessOutline} color="primary" />
                <IonLabel>
                  <h3 style={{ fontWeight: 600 }}>{u.ufficio}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {u.macroArea && (
                      <IonChip color="tertiary" outline style={{ height: 18, fontSize: 10 }}>
                        {u.macroArea}
                      </IonChip>
                    )}
                    {(u.torre || u.piano) && (
                      <IonChip color="primary" outline style={{ height: 18, fontSize: 10 }}>
                        <IonIcon icon={layersOutline} style={{ fontSize: 11, marginInlineEnd: 3 }} />
                        {u.torre && <>{u.torre}</>}
                        {u.torre && u.piano && ' · '}
                        {u.piano && <>Piano {u.piano}</>}
                      </IonChip>
                    )}
                    {u.stanza && (
                      <IonChip color="secondary" outline style={{ height: 18, fontSize: 10 }}>
                        Stanza {u.stanza}
                      </IonChip>
                    )}
                  </p>
                </IonLabel>
              </IonItem>
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
          Dati estratti dai siti istituzionali (Tribunale, Corte d'Appello, Sorveglianza, Procura, PG).
        </div>

        {/* Modal-riquadro: scheda dettaglio ufficio */}
        <IonModal isOpen={selected !== null} onDidDismiss={() => setSelected(null)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Scheda ufficio</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setSelected(null)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selected && (
              <IonCard style={{
                borderRadius: 'var(--coa-card-radius)',
                boxShadow: 'var(--coa-card-shadow)',
                margin: 0,
                border: '1px solid var(--ion-color-light-shade)',
              }}>
                <IonCardContent>
                  <div style={{ marginBottom: 8 }}>
                    <IonBadge color="primary" style={{ fontSize: 11, padding: '4px 8px' }}>
                      {selected.enteLabel}
                    </IonBadge>
                    {selected.macroArea && (
                      <IonBadge color="tertiary" style={{ fontSize: 11, padding: '4px 8px', marginInlineStart: 6 }}>
                        {selected.macroArea}
                      </IonBadge>
                    )}
                  </div>

                  <h1 style={{
                    margin: '6px 0 12px',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--ion-color-primary-shade)',
                  }}>
                    {selected.ufficio}
                  </h1>

                  <IonList lines="full" style={{ background: 'transparent' }}>
                    <IonItem>
                      <IonIcon slot="start" icon={homeOutline} color="primary" />
                      <IonLabel>
                        <h3>Sede</h3>
                        <p style={{ whiteSpace: 'normal' }}>{selected.sede}</p>
                      </IonLabel>
                    </IonItem>
                    {(selected.torre || selected.piano || selected.stanza || selected.ingresso) && (
                      <IonItem>
                        <IonIcon slot="start" icon={layersOutline} color="primary" />
                        <IonLabel>
                          <h3>Ubicazione</h3>
                          <p style={{ whiteSpace: 'normal' }}>
                            {selected.torre && <><strong>{selected.torre}</strong></>}
                            {selected.torre && selected.piano && ' · '}
                            {selected.piano && <>Piano <strong>{selected.piano}</strong></>}
                            {(selected.torre || selected.piano) && selected.stanza && ' · '}
                            {selected.stanza && <>Stanza <strong>{selected.stanza}</strong></>}
                            {selected.ingresso && <><br />Ingresso: {selected.ingresso}</>}
                          </p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selected.telResp && (
                      <IonItem>
                        <IonIcon slot="start" icon={personOutline} color="primary" />
                        <IonLabel>
                          <h3>Responsabile / Telefono</h3>
                          <p style={{ whiteSpace: 'normal' }}>{selected.telResp}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selected.email && (
                      <IonItem
                        button
                        detail={false}
                        onClick={() => { void Browser.open({ url: 'mailto:' + firstFromList(selected.email) }); }}
                      >
                        <IonIcon slot="start" icon={mailOutline} color="primary" />
                        <IonLabel>
                          <h3>E-mail</h3>
                          <p style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{selected.email}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selected.pec && (
                      <IonItem
                        button
                        detail={false}
                        onClick={() => { void Browser.open({ url: 'mailto:' + firstFromList(selected.pec) }); }}
                      >
                        <IonIcon slot="start" icon={shieldCheckmarkOutline} color="primary" />
                        <IonLabel>
                          <h3>PEC</h3>
                          <p style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{selected.pec}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selected.note && (
                      <IonItem>
                        <IonIcon slot="start" icon={alertCircleOutline} color="warning" />
                        <IonLabel>
                          <h3>Note di verifica</h3>
                          <p style={{ whiteSpace: 'normal', fontStyle: 'italic' }}>{selected.note}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                </IonCardContent>
              </IonCard>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default UfficiPenali;
