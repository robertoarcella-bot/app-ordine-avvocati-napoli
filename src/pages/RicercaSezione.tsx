import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonSegment, IonSegmentButton,
  IonLabel, IonSearchbar, IonList, IonItem, IonIcon, IonChip,
  IonItemDivider, IonText,
} from '@ionic/react';
import { useMemo, useState } from 'react';
import { ribbonOutline, layersOutline, businessOutline } from 'ionicons/icons';
import { UFFICI, type Magistrato } from '../config/uffici-giudiziari-na';

type AutoritaId = 'tribunale-napoli' | 'corte-appello-napoli';

const norm = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, "'");

const RicercaSezione: React.FC = () => {
  const [autorita, setAutorita] = useState<AutoritaId>('tribunale-napoli');
  const [filtroSez, setFiltroSez] = useState('');

  const office = UFFICI[autorita];

  // Elenco sezioni dell'autorità con conteggio magistrati
  const sezioni = useMemo(() => {
    const map = new Map<string, Magistrato[]>();
    for (const m of office.magistrati) {
      if (!map.has(m.sezione)) map.set(m.sezione, []);
      map.get(m.sezione)!.push(m);
    }
    const arr = Array.from(map.entries()).map(([nome, magistrati]) => ({
      nome,
      magistrati,
      torre: magistrati.find(m => m.torre)?.torre,
      piano: magistrati.find(m => m.piano)?.piano,
    }));
    return arr.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [office]);

  const filtered = useMemo(() => {
    const q = norm(filtroSez.trim());
    if (!q) return sezioni;
    return sezioni.filter(s => norm(s.nome).includes(q));
  }, [sezioni, filtroSez]);

  const [sezioneAperta, setSezioneAperta] = useState<string | null>(null);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/aule-udienze" />
          </IonButtons>
          <IonTitle>Ricerca per sezione</IonTitle>
        </IonToolbar>
        <IonToolbar color="primary">
          <IonSegment
            value={autorita}
            onIonChange={e => { setAutorita(e.detail.value as AutoritaId); setSezioneAperta(null); }}
            color="light"
          >
            <IonSegmentButton value="tribunale-napoli">
              <IonLabel>Tribunale</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="corte-appello-napoli">
              <IonLabel>Corte d'Appello</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={filtroSez}
            onIonInput={e => setFiltroSez(String(e.detail.value || ''))}
            placeholder="Filtra le sezioni…"
            debounce={150}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '8px 16px 0', fontSize: 12, color: 'var(--ion-color-medium)' }}>
          {filtered.length} sezion{filtered.length === 1 ? 'e' : 'i'} — {office.label}
        </div>
        <IonList lines="full">
          {filtered.map(s => {
            const aperta = sezioneAperta === s.nome;
            return (
              <div key={s.nome}>
                <IonItem
                  button
                  detail={false}
                  onClick={() => setSezioneAperta(aperta ? null : s.nome)}
                  color={aperta ? 'light' : undefined}
                >
                  <IonIcon slot="start" icon={businessOutline} color="primary" />
                  <IonLabel>
                    <h3 style={{ fontWeight: 600 }}>{s.nome}</h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {s.magistrati.length} magistrat{s.magistrati.length === 1 ? 'o' : 'i'}
                      {(s.torre || s.piano) && (
                        <IonChip color="primary" outline style={{ marginInlineStart: 4, height: 20, fontSize: 11 }}>
                          {s.torre && <>Torre {s.torre}</>}
                          {s.torre && s.piano && ' · '}
                          {s.piano && <>Piano {s.piano}</>}
                        </IonChip>
                      )}
                    </p>
                  </IonLabel>
                </IonItem>
                {aperta && (
                  <div style={{ background: 'var(--ion-color-light)' }}>
                    {s.magistrati.map((m, i) => (
                      <IonItem key={i} lines="inset" style={{ '--background': 'transparent' } as React.CSSProperties}>
                        <IonLabel>
                          <h3>
                            {m.nome} <strong>{m.cognome}</strong>
                            {/Presidente/i.test(m.ruolo) && (
                              <IonChip color="secondary" outline style={{ marginInlineStart: 6, height: 18, fontSize: 10 }}>
                                Presidente
                              </IonChip>
                            )}
                          </h3>
                          <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <IonIcon icon={ribbonOutline} color="primary" style={{ fontSize: 13 }} />
                            <span style={{ fontSize: 12 }}>{m.ruolo}</span>
                            {m.tipo === 'Onorario' && (
                              <IonChip color="warning" outline style={{ height: 18, fontSize: 10 }}>Onorario</IonChip>
                            )}
                            {(m.torre || m.piano) && (
                              <IonChip color="primary" outline style={{ height: 18, fontSize: 10 }}>
                                <IonIcon icon={layersOutline} style={{ fontSize: 11, marginInlineEnd: 3 }} />
                                {m.torre && <>Torre {m.torre}</>}
                                {m.torre && m.piano && ' · '}
                                {m.piano && <>Piano {m.piano}</>}
                              </IonChip>
                            )}
                            {m.giorniUdienza && (
                              <IonChip color="tertiary" outline style={{ height: 18, fontSize: 10 }}>
                                {m.giorniUdienza}
                              </IonChip>
                            )}
                          </p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <IonText color="medium">Nessuna sezione trovata.</IonText>
            </div>
          )}
        </IonList>
        <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ion-color-medium)', textAlign: 'center' }}>
          Tocca una sezione per espandere l'elenco dei magistrati assegnati.
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RicercaSezione;
