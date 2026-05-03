import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonText,
  IonSegment, IonSegmentButton, IonLabel, IonSearchbar,
  IonCard, IonCardContent, IonItemDivider, IonList, IonItem,
  IonIcon, IonChip, IonNote, IonModal, IonBadge, IonButton,
} from '@ionic/react';
import { useMemo, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
  callOutline, mailOutline, locationOutline,
  ribbonOutline, businessOutline, shieldCheckmarkOutline,
  closeOutline, layersOutline, calendarOutline,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { UFFICI, type Magistrato, type UfficioInfo } from '../config/uffici-giudiziari-na';

interface RouteParams { officeId: string }

type View = 'magistrati' | 'cancellerie' | 'dislocazione' | 'vertici' | 'info';

const norm = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, "'");

const matchSezioneArea = (sezione: string, area: { sezioniPrefix?: string[]; sezioniInclude?: string[] }) => {
  if (area.sezioniPrefix && area.sezioniPrefix.some(p => sezione.startsWith(p))) return true;
  if (area.sezioniInclude && area.sezioniInclude.some(s => sezione.includes(s))) return true;
  return false;
};

const UfficioGiudiziario: React.FC = () => {
  const { officeId } = useParams<RouteParams>();
  const history = useHistory();
  const office = UFFICI[officeId];

  const [view, setView] = useState<View>('magistrati');
  const [search, setSearch] = useState('');
  const [areaId, setAreaId] = useState<string>('all');
  const [magSelected, setMagSelected] = useState<Magistrato | null>(null);

  const magistratiFiltered = useMemo(() => {
    if (!office) return [];
    let arr = office.magistrati;
    if (areaId !== 'all') {
      const area = office.magistratiAree.find(a => a.id === areaId);
      if (area) arr = arr.filter(m => matchSezioneArea(m.sezione, area));
    }
    if (search.trim()) {
      const q = norm(search.trim());
      arr = arr.filter(m =>
        norm(m.cognome).includes(q) ||
        norm(m.nome).includes(q) ||
        norm(m.sezione).includes(q));
    }
    return arr;
  }, [office, areaId, search]);

  const ufficiFiltered = useMemo(() => {
    if (!office) return [];
    if (!search.trim()) return office.uffici;
    const q = norm(search.trim());
    return office.uffici.filter(u =>
      norm(u.nome).includes(q) ||
      (u.responsabile && norm(u.responsabile).includes(q)) ||
      (u.torre && norm(u.torre).includes(q)));
  }, [office, search]);

  if (!office) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/aule-udienze" />
            </IonButtons>
            <IonTitle>Ufficio non trovato</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <IonText color="medium">L'ufficio richiesto non esiste.</IonText>
          <button onClick={() => history.goBack()}>Indietro</button>
        </IonContent>
      </IonPage>
    );
  }

  // Raggruppa magistrati per sezione
  const magBySez = magistratiFiltered.reduce<Record<string, Magistrato[]>>((acc, m) => {
    (acc[m.sezione] ||= []).push(m);
    return acc;
  }, {});
  const magSezOrdered = Object.keys(magBySez);

  // Raggruppa uffici per torre
  const uffByTorre = ufficiFiltered.reduce<Record<string, UfficioInfo[]>>((acc, u) => {
    const k = u.torre || 'Sede';
    (acc[k] ||= []).push(u);
    return acc;
  }, {});

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/aule-udienze" />
          </IonButtons>
          <IonTitle style={{ fontSize: 16 }}>{office.shortLabel}</IonTitle>
        </IonToolbar>
        <IonToolbar color="primary">
          <IonSegment value={view} onIonChange={e => setView(e.detail.value as View)} scrollable color="light">
            <IonSegmentButton value="magistrati"><IonLabel>Magistrati</IonLabel></IonSegmentButton>
            <IonSegmentButton value="cancellerie"><IonLabel>Uffici</IonLabel></IonSegmentButton>
            {office.dislocazione && (
              <IonSegmentButton value="dislocazione"><IonLabel>Dislocazione</IonLabel></IonSegmentButton>
            )}
            {office.vertici && (
              <IonSegmentButton value="vertici"><IonLabel>Vertici</IonLabel></IonSegmentButton>
            )}
            <IonSegmentButton value="info"><IonLabel>Info</IonLabel></IonSegmentButton>
          </IonSegment>
        </IonToolbar>
        {(view === 'magistrati' || view === 'cancellerie') && (
          <IonToolbar>
            <IonSearchbar
              value={search}
              onIonInput={e => setSearch(String(e.detail.value || ''))}
              placeholder={view === 'magistrati'
                ? 'Cerca magistrato per cognome o sezione…'
                : 'Cerca ufficio o responsabile…'}
              debounce={150}
            />
          </IonToolbar>
        )}
        {view === 'magistrati' && (
          <IonToolbar color="primary">
            <IonSegment value={areaId} onIonChange={e => setAreaId(String(e.detail.value || 'all'))} scrollable color="light">
              <IonSegmentButton value="all"><IonLabel>Tutti</IonLabel></IonSegmentButton>
              {office.magistratiAree.map(a => (
                <IonSegmentButton key={a.id} value={a.id}><IonLabel>{a.label}</IonLabel></IonSegmentButton>
              ))}
            </IonSegment>
          </IonToolbar>
        )}
      </IonHeader>
      <IonContent fullscreen>
        {view === 'magistrati' && (
          <>
            <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--ion-color-medium)' }}>
              {magistratiFiltered.length} magistrat{magistratiFiltered.length === 1 ? 'o' : 'i'}
            </div>
            <IonList lines="full">
              {magSezOrdered.map(sez => (
                <div key={sez}>
                  <IonItemDivider color="light" sticky>
                    <IonLabel><strong>{sez}</strong></IonLabel>
                  </IonItemDivider>
                  {magBySez[sez].map((m, i) => (
                    <IonItem
                      key={`${sez}-${i}`}
                      button
                      detail={false}
                      onClick={() => setMagSelected(m)}
                    >
                      <IonLabel>
                        <h3 style={{ fontWeight: 600 }}>
                          {m.nome} <strong>{m.cognome}</strong>
                        </h3>
                        <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <IonIcon icon={ribbonOutline} color="primary" style={{ fontSize: 13 }} />
                          {m.ruolo}
                          {m.tipo === 'Onorario' && (
                            <IonChip color="warning" outline style={{ height: 18, fontSize: 10, marginInlineStart: 4 }}>Onorario</IonChip>
                          )}
                          {m.tipo === 'Esperto' && (
                            <IonChip color="secondary" outline style={{ height: 18, fontSize: 10, marginInlineStart: 4 }}>Esperto</IonChip>
                          )}
                        </p>
                        {(m.piano || m.torre) && (
                          <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                            <IonIcon icon={layersOutline} color="medium" style={{ fontSize: 13 }} />
                            <span style={{ fontSize: 12 }}>
                              {m.torre && <>Torre {m.torre}</>}
                              {m.torre && m.piano && ' · '}
                              {m.piano && <>Piano {m.piano}</>}
                            </span>
                          </p>
                        )}
                        {m.note && <p style={{ fontSize: 11, color: 'var(--ion-color-medium)' }}><em>{m.note}</em></p>}
                      </IonLabel>
                    </IonItem>
                  ))}
                </div>
              ))}
              {magistratiFiltered.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <IonText color="medium">Nessun magistrato trovato.</IonText>
                </div>
              )}
            </IonList>
          </>
        )}

        {view === 'cancellerie' && (
          <>
            <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--ion-color-medium)' }}>
              {ufficiFiltered.length} uffici / cancellerie
            </div>
            <IonList lines="full">
              {Object.entries(uffByTorre).map(([torre, items]) => (
                <div key={torre}>
                  <IonItemDivider color="light" sticky>
                    <IonLabel><strong>{torre}</strong></IonLabel>
                  </IonItemDivider>
                  {items.map((u, i) => (
                    <IonCard key={`${torre}-${i}`} style={{
                      borderRadius: 'var(--coa-card-radius)',
                      boxShadow: 'var(--coa-card-shadow)',
                      margin: '8px 12px',
                    }}>
                      <IonCardContent>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 700, color: 'var(--ion-color-primary-shade)' }}>
                            {u.nome}
                          </div>
                          {u.piano && (
                            <IonChip color="primary" outline style={{ marginInlineStart: 0, height: 22, fontSize: 11, flex: '0 0 auto' }}>
                              Piano {u.piano}
                            </IonChip>
                          )}
                        </div>
                        {u.responsabile && (
                          <div style={{ marginTop: 6, fontSize: 13 }}>
                            <strong>Responsabile:</strong> {u.responsabile}
                          </div>
                        )}
                        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {u.telefono && (
                            <a href={`tel:${u.telefono.split(';')[0].replace(/\s/g, '')}`}
                               style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center', textDecoration: 'none', color: 'var(--ion-color-primary)' }}
                               onClick={(e) => { e.preventDefault(); void Browser.open({ url: 'tel:' + u.telefono!.split(';')[0].replace(/\s/g, '') }); }}>
                              <IonIcon icon={callOutline} /> {u.telefono}
                            </a>
                          )}
                          {u.email && (
                            <a href={`mailto:${u.email.split(';')[0].trim()}`}
                               style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'flex-start', textDecoration: 'none', color: 'var(--ion-color-primary)', wordBreak: 'break-all' }}
                               onClick={(e) => { e.preventDefault(); void Browser.open({ url: 'mailto:' + u.email!.split(';')[0].trim() }); }}>
                              <IonIcon icon={mailOutline} style={{ flex: '0 0 auto', marginTop: 2 }} /> {u.email}
                            </a>
                          )}
                          {u.pec && (
                            <a href={`mailto:${u.pec.split(';')[0].trim()}`}
                               style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'flex-start', textDecoration: 'none', color: 'var(--ion-color-primary)', wordBreak: 'break-all' }}
                               onClick={(e) => { e.preventDefault(); void Browser.open({ url: 'mailto:' + u.pec!.split(';')[0].trim() }); }}>
                              <IonIcon icon={shieldCheckmarkOutline} style={{ flex: '0 0 auto', marginTop: 2 }} /> {u.pec}
                            </a>
                          )}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
              ))}
              {ufficiFiltered.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <IonText color="medium">Nessun ufficio trovato.</IonText>
                </div>
              )}
            </IonList>
          </>
        )}

        {view === 'dislocazione' && office.dislocazione && (
          <IonList lines="full">
            <IonItemDivider color="light" sticky>
              <IonLabel><strong>Dislocazione settori</strong></IonLabel>
            </IonItemDivider>
            {office.dislocazione.map((d, i) => (
              <IonItem key={i}>
                <IonLabel>
                  <h3 style={{ fontWeight: 600 }}>{d.ufficio}</h3>
                  <p style={{ display: 'flex', gap: 8 }}>
                    <IonChip color="primary" outline style={{ marginInlineStart: 0, height: 20, fontSize: 11 }}>{d.torre}</IonChip>
                    <IonChip color="secondary" outline style={{ marginInlineStart: 0, height: 20, fontSize: 11 }}>Piano {d.piano}</IonChip>
                  </p>
                  {d.note && <p style={{ fontSize: 11, color: 'var(--ion-color-medium)' }}><em>{d.note}</em></p>}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        {view === 'vertici' && office.vertici && (
          <IonList lines="full">
            <IonItemDivider color="light" sticky>
              <IonLabel><strong>Vertici della Corte</strong></IonLabel>
            </IonItemDivider>
            {office.vertici.map((v, i) => (
              <IonItem key={i}>
                <IonLabel>
                  <h3 style={{ fontWeight: 600 }}>{v.nome} <strong>{v.cognome}</strong></h3>
                  <p>{v.ruolo}</p>
                  {v.note && <p style={{ fontSize: 11, color: 'var(--ion-color-medium)' }}><em>{v.note}</em></p>}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={magSelected !== null} onDidDismiss={() => setMagSelected(null)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Scheda magistrato</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setMagSelected(null)}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {magSelected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                  <div style={{ fontSize: 14, color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {magSelected.tipo === 'Onorario' ? 'Magistrato onorario'
                      : magSelected.tipo === 'Esperto' ? 'Esperto'
                      : 'Magistrato togato'}
                  </div>
                  <h1 style={{ margin: '8px 0 4px', fontSize: 26, fontWeight: 700, color: 'var(--ion-color-primary-shade)' }}>
                    {magSelected.nome} <span style={{ fontWeight: 800 }}>{magSelected.cognome}</span>
                  </h1>
                  {/Presidente/i.test(magSelected.ruolo) && (
                    <IonBadge color="secondary" style={{ fontSize: 12, padding: '6px 10px', marginTop: 4 }}>
                      {magSelected.ruolo}
                    </IonBadge>
                  )}
                </div>
                <IonList lines="full" style={{ background: 'transparent' }}>
                  <IonItem>
                    <IonIcon slot="start" icon={ribbonOutline} color="primary" />
                    <IonLabel>
                      <h3>Ruolo</h3>
                      <p style={{ whiteSpace: 'normal' }}>{magSelected.ruolo}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon slot="start" icon={businessOutline} color="primary" />
                    <IonLabel>
                      <h3>Sezione</h3>
                      <p style={{ whiteSpace: 'normal' }}>{magSelected.sezione}</p>
                    </IonLabel>
                  </IonItem>
                  {(magSelected.torre || magSelected.piano) && (
                    <IonItem>
                      <IonIcon slot="start" icon={layersOutline} color="primary" />
                      <IonLabel>
                        <h3>Aula d'udienza</h3>
                        <p style={{ whiteSpace: 'normal' }}>
                          {magSelected.torre && <>Torre {magSelected.torre}</>}
                          {magSelected.torre && magSelected.piano && ' · '}
                          {magSelected.piano && <>Piano {magSelected.piano}</>}
                        </p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {magSelected.giorniUdienza && (
                    <IonItem>
                      <IonIcon slot="start" icon={calendarOutline} color="primary" />
                      <IonLabel>
                        <h3>Giorni di udienza</h3>
                        <p style={{ whiteSpace: 'normal' }}>{magSelected.giorniUdienza}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {magSelected.note && (
                    <IonItem>
                      <IonLabel>
                        <h3>Note</h3>
                        <p style={{ whiteSpace: 'normal' }}><em>{magSelected.note}</em></p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </div>
            )}
          </IonContent>
        </IonModal>

        {view === 'info' && (
          <div style={{ padding: 16 }}>
            <IonCard>
              <IonCardContent>
                <h2 style={{ marginTop: 0, color: 'var(--ion-color-primary-shade)' }}>{office.label}</h2>
                <IonList lines="full" style={{ background: 'transparent' }}>
                  <IonItem button detail={false} onClick={() => Browser.open({ url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(office.sede) })}>
                    <IonIcon slot="start" icon={locationOutline} color="primary" />
                    <IonLabel><h3>Sede</h3><p style={{ whiteSpace: 'normal' }}>{office.sede}</p></IonLabel>
                  </IonItem>
                  {office.telefono && (
                    <IonItem button detail={false} onClick={() => Browser.open({ url: 'tel:' + office.telefono!.replace(/\s/g, '') })}>
                      <IonIcon slot="start" icon={callOutline} color="primary" />
                      <IonLabel><h3>Telefono</h3><p>{office.telefono}</p></IonLabel>
                    </IonItem>
                  )}
                  {office.email && (
                    <IonItem button detail={false} onClick={() => Browser.open({ url: 'mailto:' + office.email })}>
                      <IonIcon slot="start" icon={mailOutline} color="primary" />
                      <IonLabel><h3>Email</h3><p>{office.email}</p></IonLabel>
                    </IonItem>
                  )}
                  {office.pec && (
                    <IonItem button detail={false} onClick={() => Browser.open({ url: 'mailto:' + office.pec })}>
                      <IonIcon slot="start" icon={shieldCheckmarkOutline} color="primary" />
                      <IonLabel><h3>PEC</h3><p>{office.pec}</p></IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>
            <IonNote style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--ion-color-medium)' }}>
              <IonIcon icon={businessOutline} /> Dati estratti dal sito istituzionale
            </IonNote>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UfficioGiudiziario;
