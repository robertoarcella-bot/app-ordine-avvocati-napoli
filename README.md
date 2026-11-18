# App Ordine Avvocati Napoli — Documentazione tecnica

App mobile **ufficiale** del Consiglio dell'Ordine degli Avvocati di Napoli, a beneficio degli iscritti. Distribuita inizialmente come APK Android sideload; build iOS gestita su fork separato (vedi [docs/BUILD_iOS.md](docs/BUILD_iOS.md)).

- **Autore originario**: Avv. Roberto Arcella
- **Idea e collaborazione**: Commissione Informatica del COA Napoli
- **Per conto di**: Consiglio dell'Ordine degli Avvocati di Napoli
- **Licenza/uso**: a beneficio degli iscritti al COA Napoli

---

## Identificativi del package

| Contesto | Nome / ID |
|---|---|
| **Android `applicationId` / `namespace`** (identificativo univoco dell'app sul dispositivo e sugli store) | `it.ordineavvocatinapoli.app` |
| **App display name** (etichetta sotto l'icona, definita in `capacitor.config.ts → appName`) | `Ordine Avvocati Napoli` |
| **npm package** (`package.json → name`) | `app-coa` |
| **Repository GitHub** | [`robertoarcella-bot/app-ordine-avvocati-napoli`](https://github.com/robertoarcella-bot/app-ordine-avvocati-napoli) |

> L'ID Android `it.ordineavvocatinapoli.app` è quello da utilizzare per ogni riferimento "ufficiale" all'app installata (autorizzazioni TestFlight/Play, deep link, integrazioni esterne, segnalazioni di abusi). Una volta pubblicato l'app deve mantenere questo identificativo: cambiarlo equivale a creare una nuova app distinta agli occhi degli store.

### Dove sta la repo (dal 18/11/2026)

| Copia | Percorso | Uso |
|---|---|---|
| **Repo di lavoro** | `C:\dev\APP_COA\app-coa` | modifiche, build, commit, push |
| Copia su Google Drive | `G:\Il mio Drive\002_APPLICAZIONI\12_APP_COA\app-coa` | duplicato speculare (anche `.git`), **non modificarlo** |

Google Drive per desktop crea `desktop.ini` in ogni cartella, anche dentro `.git/refs` (git fetch/pull falliscono con `bad object refs/desktop.ini`), e altera i file durante le build: per questo si lavora su disco locale. La copia su Drive si aggiorna con `scripts/sync-gdrive.ps1` (robocopy `/MIR`, esclusi `node_modules`, output di build e `desktop.ini`), lanciato in automatico dagli hook git `post-commit` / `post-merge` / `post-checkout`. Su un nuovo clone installare gli hook una volta:

```powershell
powershell -File scripts\install-git-hooks.ps1   # hook → sync automatico su Drive dopo ogni commit
powershell -File scripts\sync-gdrive.ps1         # sync manuale (log in C:\dev\APP_COA\sync-gdrive.log)
```

---

## Sommario

1. [Changelog](#changelog)
2. [Stack e dipendenze](#stack-e-dipendenze)
3. [Struttura del progetto](#struttura-del-progetto)
4. [Funzionalità ed elenco schermate](#funzionalità-ed-elenco-schermate)
5. [Origine dei dati: in-app vs fonti esterne](#origine-dei-dati-in-app-vs-fonti-esterne)
6. [Configurazioni e file da revisionare periodicamente](#configurazioni-e-file-da-revisionare-periodicamente)
7. [Build e ambiente di sviluppo](#build-e-ambiente-di-sviluppo)
8. [Plugin Capacitor utilizzati](#plugin-capacitor-utilizzati)
9. [Architettura cookie / autenticazione](#architettura-cookie--autenticazione)
10. [Background fetch e notifiche](#background-fetch-e-notifiche)
11. [Branding e palette](#branding-e-palette)
12. [Add new content — guide rapide](#add-new-content--guide-rapide)
13. [Roadmap nota](#roadmap-nota)
14. [Risoluzione problemi noti](#risoluzione-problemi-noti)

---

## Changelog

### v1.2.6 (novembre 2026)

**Android 15+ (edge-to-edge, WebView ≥ 140)**
- Fondo delle pagine non più nascosto dietro la barra di navigazione di sistema: `ion-content` riceve `--ion-content-safe-area-padding-bottom` dall'inset inferiore (`src/theme/variables.css`). Su WebView precedenti l'inset vale 0, nessun doppio margine
- Mini-app, siti e news delle fonti in iframe (`MiniAppView`, `SitoView`, `SourceNews`): l'iframe finisce sopra la barra di navigazione e non parte più sotto l'intestazione (tolto `fullscreen` da `IonContent`, che nascondeva il titolo della mini-app)

**Scroll bloccato finché non si tocca lo schermo**
- Nuovo hook `src/hooks/useIframeScrollWake.ts`: ridimensiona l'iframe di 1 px per un frame e gli dà il focus al caricamento, a fine animazione di ingresso della pagina e (same-origin) quando cambia l'altezza del contenuto. Sostituisce i vecchi "reflow" sincroni, che il compositor del WebView non vedeva
- `SourceNews`: niente più due scroller annidati (`IonContent` + iframe)

**Commissione Informatica**
- Corretto il cognome: Avv. Orso Maria **Siporso**

**Repo**: si lavora in `C:\dev\APP_COA\app-coa`; la copia su Google Drive si aggiorna da sola dopo ogni commit (`scripts/sync-gdrive.ps1`, `scripts/install-git-hooks.ps1`)

**Build**: versionName `1.2.6`, versionCode `126`

### v1.2.5 (novembre 2026)

**Codici Italiani**
- I 9 codici e la home sostituiti con la versione di `avvocatotelematico.studiolegalearcella.it/codici/` (vigenza **15/10/2026** per tutti; prima 22/10/2023 – 04/03/2026), sempre inclusi nell'app per la consultazione offline. CAD e CPA invariati (30/01/2025, 08/10/2025); schede reinserite nella home
- Nuovo `scripts/aggiorna_codici.mjs`: download validato + schede CAD/CPA + data footer + tema COA + patch v1.2.3 + indice di ricerca globale in un solo comando
- `scripts/patch_codici_v123.mjs` ripristinato (necessario a ogni aggiornamento); `restyle_codici_coa.mjs` reso idempotente sulla home; `aggiorna_search_index.mjs` usa un replacer a funzione (niente interpretazione di `$&`/`$1` nei testi)

**Magistrati e uffici Tribunale / Corte d'Appello** (`src/config/uffici-giudiziari-na.ts`, rilevazione 17/11/2026 dai siti ufficiali)
- `T_MAG`/`CA_MAG` rigenerati: Tribunale civile 166 assegnazioni, lavoro 45, penale 167; CA civile 84, lavoro 26, penale 62 (ora con Corte di Assise di Appello e Misure di Prevenzione)
- Nuove sezioni Corte di Assise Prima/Seconda/Terza; `tAdd` accetta `note` come `cAdd`; CA: Presidente Vicario Papa, Petruzziello presidente V civile
- `CA_UFF` 47 uffici (+ Ufficio Esecuzione Maxi Processi, 19 PEC aggiunte); `T_DISL` sostituito con la tabella completa del sito (59 voci)
- `T_SEZ_PIANO_CIV` / `T_LAVORO_BY_COGNOME` invariati (la fonte non pubblica i piani d'aula): Guglielmo, Perpetua, Pigrini senza piano
- Dettaglio: `../Magistrati_Napoli/VARIAZIONI_2026-05-17_vs_2026-11-17.md`; nuovo Excel `../Tribunale_e_CorteAppello_Napoli_2026-11-17.xlsx`

**Interessi**
- `Calcolo_Interessi.html`: mora II semestre 2026 al **10,40%** (BCE 2,40% + 8, Comunicato MEF G.U. n. 163 del 16/07/2026); il I semestre 2026 (10,15%) ora termina il 30/06/2026. Tasso legale 2026 (1,6%) già allineato al pacchetto `dati_forensi_ISTAT_MEF`

**Commissione Informatica**
- Aggiunto l'Avv. Bruno Spagna Musso tra i componenti

**Build**: versionName `1.2.5`, versionCode `125`

### v1.2.4 (luglio 2026)

**Pulizia catalogo Strumenti**
- Rimossi 5 strumenti (con relativi HTML da `public/miniapps/at/`): Parametri Forensi (D.M. 147/2022), Procura alle liti, Piano Genitoriale, Analizzatore atti D.M. 110/2023, Analisi Verbale Ricerca Beni

**Correzioni**
- La versione mostrata in "Info & Crediti" è ora derivata da `package.json` a build-time (define Vite `__APP_VERSION__`); era hardcoded "1.0.1"
- Notifiche PST: baseline foreground/background sincronizzati via `dispatchEvent` (`getLastSeen`/`setLastSeen`) + ID notifica deterministico dal numero avviso → niente più notifiche duplicate; rimossa `smallIcon` inesistente
- Sicurezza: `webContentsDebuggingEnabled` ora `false` di default (riattivabile con `CAP_WEBVIEW_DEBUG=1` al sync)
- Fix errori TypeScript/ESLint (tipo `SiteSection` con `external?`, import inutilizzati); `capacitor.config.ts` incluso nel typecheck
- `Preventivo_Avvocati.html` reso davvero offline (rimosse Google Fonts da CDN)

**Prestazioni**
- Code splitting per route: tutte le pagine tranne Home sono `React.lazy` con `Suspense` dentro ciascuna `Route` (pattern compatibile con `IonRouterOutlet`); `cheerio` caricato con `await import()` solo quando serve il parsing — chunk iniziale molto più piccolo

**Offline e robustezza**
- Gestione offline reale con `@capacitor/network`: hook `useNetworkStatus`, banner globale `OfflineBanner`, e avviso/blocco all'apertura di strumenti online-only senza rete (`useOpenMiniApp`)
- `openExternal` non lancia mai (fallback `window.open`); tutti i `Browser.open` sparsi ora passano da lì
- `NewsDetail` mostra "Notizia non trovata" con Riprova invece della pagina bianca su 404/errore

**Refactoring e codice morto**
- Rimossi: vecchio login in-app via iframe (~250 righe in `auth.ts`, restano i 2 URL usati), scraper Giustizia Amministrativa irraggiungibile (la fonte GA è in webview), `SITE.loginUrl`, `resetNotificationState`, proxy Vite `/proxy/ga`, `public/miniapps/esempio.html`, `scripts/patch_codici_v123.mjs`
- Deduplicati: `norm()` e `stripTags()` in `utils/text.ts`; `parseItalianDate`/`extractContentId`/`toAbsoluteUrl` in `services/sources/scrape.ts` (e `pst.ts` usa il `fetchText` condiviso); componenti `MiniAppItem` e `SourceNewsCard`; handler apertura miniapp in `hooks/useOpenMiniApp.ts`

**Store readiness**
- Firma release Android da `android/key.properties` (gitignorato) + script `android:release` che produce l'AAB per il Play Store; nuova sezione README "Pubblicazione sugli store"
- Fix asset iOS (AppIcon sgranata + splash-screenshot) rigenerati dagli asset ufficiali: branch `fix/ios-app-icon` da mergiare sul fork iOS; avvertenza in `docs/BUILD_iOS.md`

**Tooling**
- `cap:sync`/`android:build`/`android:open` ora passano per `npm run build` (typecheck incluso); nuovo script `type-check`
- ESLint pulito (0 errori/warning); config con `ignores` per `android/` e `argsIgnorePattern: '^_'`
- `npm audit`: 0 vulnerabilità (aggiornamenti via `npm audit fix` + rimossa devDependency `@capacitor/assets`, richiamabile con `npx`)
- Build: versionName `1.2.4`, versionCode `124`

### v1.2.3 (maggio 2026)

**Codici Italiani**
- Fix scroll bloccato all'apertura di un codice su Android (tickle di scroll post-render)
- Menu a discesa "Vai a articolo" raggruppato per Libri/Titoli in cima a ogni codice
- Pulsante "Tutti i codici" per tornare alla ricerca globale
- Build: versionName `1.2.3`, versionCode `123`

### v1.1.0 (maggio 2026)

**Sedi e dislocazione uffici**
- Header dell'ufficio giudiziario: testo bianco su blu istituzionale (era blu scuro su blu, scarsa leggibilità)
- **Modal scheda magistrato**: tap su qualsiasi giudice apre un riquadro a tutto schermo con nome grande, badge "Presidente di Sezione" se applicabile, ruolo, sezione, **Torre + Piano** dell'aula d'udienza e (per la sezione lavoro) **giorni d'udienza**
- **Dislocazione aule giudici Tribunale Napoli (Torre A)**: chip Torre/Piano direttamente nella card di ogni magistrato. Sezioni civili 1-14 mappate per sezione (es. Sez. 8 → piano 21); sezione lavoro I/II/III per singolo magistrato (es. Coppola → piano 11; Ghionni Crivelli Visconti → piano 11; Cardellicchio → piano 7). Lookup robusto per cognomi composti
- **Nuova pagina "Cerca per autorità e sezione"** (`/aule-udienze/sezioni`): segment Tribunale / Corte d'Appello → searchbar sezioni → tap espande l'elenco completo dei magistrati con piano/torre e giorni
- **Nuova pagina "Recapiti uffici giudiziari del distretto"** (`/aule-udienze/recapiti`): 80+ uffici (Corte d'Appello, Procura Generale, Tribunali di tutti i circondari — Ariano Irpino, Avellino, Benevento, Giugliano, Napoli, Nola, Sant'Angelo dei Lombardi, S. Maria Capua Vetere, Torre Annunziata —, Procure, Giudici di Pace, Sezioni distaccate, Tribunale per i Minorenni, Sorveglianza, Tribunale delle Acque). Searchbar per nome/comune/circondario/tipo, link tap-to-call/maps/email

**Codici Italiani — nuova mini-webapp offline** (`Servizi di interesse generale → Codici Italiani`)
- **11 codici** integrati e ricercabili offline: Costituzione, Codice civile, Disp. att. c.c., c.p.c., Disp. att. c.p.c., Codice penale, Codice di procedura penale, Norme att. c.p.p., Reg. esec. c.p.p., **CAD** (Codice dell'amministrazione digitale), **CPA** (Codice del processo amministrativo)
- CAD e CPA generati dagli XML AkomaNtoso di Normattiva via parser dedicato (`scripts/genera_codici_aggiuntivi.mjs`); CPA include Allegato 1 (Codice) + Allegato 2 (Norme di attuazione) + Allegato 3 (Norme transitorie) + Allegato 4 (Disposizioni abrogative)
- **Tema istituzionale COA** (blu `#0066CC` + bianco) sostituendo il dark theme della webapp originale (`scripts/restyle_codici_coa.mjs`)
- **Copia + condivisione WhatsApp** dell'articolo (preservato dal template), search globale che include CAD/CPA
- Origine: `avvocatotelematico.studiolegalearcella.it/codici/` (Avv. Roberto Arcella) integrata localmente in `public/miniapps/codici/`

**Build**
- versionName `1.1.0`, versionCode `110`
- APK: `OrdineAvvocatiNapoli-1.1.0-debug.apk` (~22 MB)

### v1.0.1 (maggio 2026)
- Back button strumenti, branding "App ufficiale", nuova icona/splash quadrata.

### v1.0.0 (maggio 2026)
- Prima release pubblica: rimossi 3 strumenti non-mobile, manuale aggiornato.

---

## Stack e dipendenze

| Layer | Tecnologia | Versione | Ruolo |
|------|------------|----------|-------|
| Bundler | Vite | ^8 | Build web assets |
| UI Framework | Ionic React | ^8 | Componenti mobile-friendly |
| App framework | React | ^19 | UI |
| Tipi | TypeScript | ~6 | Tipo sicurezza |
| Wrapper nativo | Capacitor | ^8 | Bridge JS↔nativo |
| Routing | react-router (v5, NON v6) | ^5 | Ionic richiede v5 |
| Parsing HTML | cheerio | ^1 | Scraping fonti senza API |
| Date | date-fns + locale `it` | ^4 | Formattazione date IT |

**Nota architetturale**: Capacitor 8 richiede **JDK 21** per la build Android (per via di alcuni plugin tipo `@capacitor/filesystem`); JDK 17 NON basta. Vedi [Build](#build-e-ambiente-di-sviluppo).

---

## Struttura del progetto

```
app-coa/
├── public/
│   ├── logo.jpg                           # Logo COA usato in Home/Menu/Info
│   ├── favicon.svg
│   ├── background-pst.js                  # Runner JS per background fetch PST
│   └── miniapps/                          # Mini-webapp HTML autoportate
│       ├── at/                            # App di Avv. Roberto Arcella (avvocatotelematico)
│       │   ├── Calcolatore_termini_cpc.html
│       │   ├── Calcolo_fattura_Avvocati.html
│       │   └── ...                        # ~16 file html
│       ├── sedi/
│       │   └── Aule_sezione_lavoro.html
│       └── codici/                        # ★ v1.1 — Codici italiani offline
│           ├── home.html                  # Indice + global search (include CAD/CPA)
│           ├── costituzione.html, codice-civile.html, codice-penale.html, ...
│           ├── cad.html                   # CAD generato da AkomaNtoso (script)
│           └── codice-processo-amministrativo.html
├── resources/
│   └── splash.png                         # Splash sorgente 2732x2732 (sorgente generato da Apertura_app)
├── src/
│   ├── components/
│   │   └── AppMenu.tsx                    # Menu hamburger laterale
│   ├── config/
│   │   ├── site.ts                        # URL sito COA, sezioni di "Sito Ordine Avvocati"
│   │   ├── miniapps.ts                    # Registry mini-webapp (con jurisdiction, offlineReady)
│   │   ├── jurisdictions.ts               # Tassonomia: sedi/pct/comuni/civile/penale/amm/trib
│   │   ├── sources.ts                     # Fonti news Processo Telematico
│   │   ├── uffici-giudiziari-na.ts        # ⚠️ Magistrati Tribunale + CA Napoli + dislocazione aule (Torre A)
│   │   └── recapiti-uffici-na.ts          # ★ v1.1 — Recapiti uffici del distretto (80+)
│   ├── pages/
│   │   ├── Home.tsx                       # Tile rapidi
│   │   ├── News.tsx, NewsDetail.tsx       # News COA via WP REST
│   │   ├── UfficiNews.tsx                 # News aggregate Tribunale + CA
│   │   ├── Sito.tsx, SitoView.tsx         # WebView sezioni del sito COA
│   │   ├── Documenti.tsx
│   │   ├── MiniApps.tsx, MiniAppView.tsx  # Strumenti
│   │   ├── ProcessoTelematico.tsx, SourceNews.tsx
│   │   ├── AuleUdienze.tsx, UfficioGiudiziario.tsx
│   │   ├── RecapitiUffici.tsx             # ★ v1.1 — Recapiti uffici del distretto (searchbar)
│   │   ├── RicercaSezione.tsx             # ★ v1.1 — Cerca per autorità → sezione → magistrati
│   │   ├── AreaRiservata.tsx              # Login → browser di sistema
│   │   ├── Consiglio.tsx                  # ⚠️ Composizione Consiglio (in-app)
│   │   ├── Commissione.tsx                # ⚠️ Componenti Commissione Informatica (in-app)
│   │   └── Info.tsx                       # ⚠️ Contatti del COA (in-app)
│   ├── services/
│   │   ├── api.ts                         # Client WP REST (news COA)
│   │   ├── cache.ts                       # Cache TTL su Preferences
│   │   ├── download.ts                    # File download / openExternal
│   │   ├── auth.ts                        # URL login + URL area Consiglieri
│   │   ├── notifications.ts               # Local notif + sync con runner
│   │   └── sources/
│   │       ├── http.ts                    # Helper fetch (CapacitorHttp/proxy)
│   │       ├── pst.ts                     # Scraper PST giustizia
│   │       ├── giustizia-amministrativa.ts
│   │       ├── giustizia-tributaria.ts    # Parser RSS
│   │       └── uffici-napoli.ts           # Scraper aggregato Tribunale + CA
│   ├── theme/variables.css                # Palette istituzionale AgID
│   ├── App.tsx                            # Routing + polling foreground
│   └── main.tsx
├── android/                               # Progetto Android Studio (committato)
├── capacitor.config.ts                    # Config plugin nativi (splash, status bar, runner)
├── vite.config.ts                         # Proxy dev per le 5 fonti esterne
├── docs/
│   └── BUILD_iOS.md                       # Guida fork iOS
├── scripts/
│   ├── test-pst.mjs                       # Test isolato scraper PST
│   ├── test-ga.mjs                        # Test isolato scraper GA
│   ├── genera-manuale.py                  # Genera Manuale_App.docx + wireframe
│   ├── genera_codici_aggiuntivi.mjs       # ★ v1.1 — Parser AkomaNtoso → CAD/CPA HTML
│   ├── restyle_codici_coa.mjs             # ★ v1.1 — Tema COA blu/bianco sui codici
│   ├── aggiorna_search_index.mjs          # ★ v1.1 — Aggiorna search globale codici
│   ├── patch_codici_v123.mjs              # ★ v1.2.3 — Menu "Vai a articolo", "Tutti i codici", sblocco scroll
│   ├── aggiorna_codici.mjs                # ★ v1.2.5 — Scarica i codici dal sito e applica tutti gli adattamenti
│   └── manual-images/                     # Wireframe PNG generati
└── README.md                              # Questo file
```

I file marcati ⚠️ contengono **dati hardcoded** che vanno aggiornati periodicamente (vedi sezione dedicata).

---

## Funzionalità ed elenco schermate

| Schermata | Path | Origine dati | Cache |
|-----------|------|--------------|-------|
| Home | `/home` | Tile statici + ultime 3 news (WP REST) | 30 min |
| Consiglio dell'Ordine | `/consiglio` | **In-app** (Consiglio.tsx) | — |
| News dal Consiglio | `/news`, `/news/:id` | **WP REST** del sito COA | 30 min |
| News dagli Uffici Giudiziari | `/news-uffici` | **Scraping HTML** Tribunale + CA Napoli | 30 min |
| Sito Ordine Avvocati | `/sito`, `/sito/view` | WebView esterna (sito COA) | — |
| Albo Avvocati Napoli | menu → `/sito/view?u=…/albo-elenchi/` | WebView esterna | — |
| Albo Nazionale Avvocati | menu → Browser.open CNF | Custom Tabs (CNF blocca iframe per X-Frame-Options) | — |
| Documenti | `/documenti` | **In-app** (lista hardcoded di link) | — |
| Strumenti | `/miniapps`, `/miniapps/:id` | **In-app** (file HTML in `public/miniapps/at/`) | sempre disponibili |
| Aule Udienze Napoli | `/aule-udienze` | **In-app** (lista) | — |
| → Tribunale di Napoli | `/aule-udienze/tribunale-napoli` | **In-app** (`config/uffici-giudiziari-na.ts`) | — |
| → Corte d'Appello | `/aule-udienze/corte-appello-napoli` | **In-app** | — |
| → Cerca per autorità e sezione | `/aule-udienze/sezioni` | **In-app** — autorità → sezione → magistrati con piano/torre | — |
| → Recapiti uffici del distretto | `/aule-udienze/recapiti` | **In-app** (`config/recapiti-uffici-na.ts`) — 80+ uffici ricercabili | — |
| Processo Telematico | `/processo-telematico`, `/.../:sourceId` | Scraping/RSS 3 fonti istituzionali | 30 min |
| Riconosco | Home tile → Browser.open | Custom Tabs (sito DCS) | — |
| Area Riservata | `/area-riservata` | Solo bottone → browser di sistema | — |
| Commissione Informatica | `/commissione` | **In-app** (Commissione.tsx) | — |
| Info & Crediti | `/info` | **In-app** (contatti del COA) | — |

---

## Origine dei dati: in-app vs fonti esterne

### 🔴 Dati IN-APP (richiedono revisione periodica)

Questi dati sono **hardcoded** nel codice TypeScript dell'app e finiscono nel bundle dell'APK. Vanno aggiornati al cambio composizione, sede o numerazione, ricompilando l'APK.

| Dato | File | Cadenza tipica di revisione | Note |
|------|------|------------------------------|------|
| Composizione del Consiglio dell'Ordine | `src/pages/Consiglio.tsx` | A ogni rinnovo (4 anni) o sostituzione | Presidenza + 17 Consiglieri |
| Componenti Commissione Informatica | `src/pages/Commissione.tsx` | A ogni rinnovo Commissione | Delegato + Coordinatore + Componenti |
| Contatti del COA (sede, tel, fax, email, PEC, orari, codice fiscale, codice univoco) | `src/pages/Info.tsx` | A ogni cambio infrastrutturale | Dati offline-first |
| Lista documenti pubblici di rilievo | `src/pages/Documenti.tsx` | All'aggiunta/rimozione di sezioni del sito | Solo titoli + URL |
| Sezioni del sito COA mostrate in "Sito Ordine Avvocati" | `src/config/site.ts` (`SITE.sections`) | A ogni ristrutturazione del sito | URL + label |
| **Magistrati e cancellerie Tribunale di Napoli** | `src/config/uffici-giudiziari-na.ts` (oggetto `TRIBUNALE_NAPOLI`) | **Annuale** (variazioni tabellari, pensionamenti) | ~378 assegnazioni (civile 166, lavoro 45, penale 167 — nov. 2026), uffici amministrativi, dislocazione completa (59 voci) |
| **Magistrati e cancellerie Corte d'Appello Napoli** | `src/config/uffici-giudiziari-na.ts` (oggetto `CORTE_APPELLO_NAPOLI`) | **Annuale** | ~172 assegnazioni (civile 84, lavoro 26, penale 62 — nov. 2026), 47 uffici/cancellerie, vertici. Script di estrazione in `../Magistrati_Napoli/script/` |
| **Dislocazione aule giudici Tribunale Napoli (Torre A)** | `src/config/uffici-giudiziari-na.ts` (`T_SEZ_PIANO_CIV`, `T_LAVORO_BY_COGNOME`) | A ogni variazione tabellare | Mappa sezione→piano per le 14 sezioni civili; mappa cognome→piano+giorni d'udienza per i magistrati delle 3 sezioni lavoro |
| **Recapiti uffici giudiziari del distretto** | `src/config/recapiti-uffici-na.ts` | A ogni variazione strutturale (chiusura/apertura sedi, riassetto Procure) | 80+ uffici: Tribunali, Procure, GdP, Sezioni distaccate, Sorveglianza, Minorenni, Tribunale Acque |
| **Codici Italiani offline** | `public/miniapps/codici/*.html` | A ogni aggiornamento normativo significativo | 11 codici autoportati con search globale; CAD/CPA generati via script da AkomaNtoso |
| Aule Sezione Lavoro Napoli | `public/miniapps/sedi/Aule_sezione_lavoro.html` (45 giudici hardcoded) | A ogni variazione tabellare (≥1/anno) | File HTML separato (mini-webapp) |
| Calendario GdP Napoli | `public/miniapps/at/Calendario_gdp_napoli_2026.html` | **Annuale** (anno calendario nel nome) | Va sostituito a fine anno |
| **Tassi interessi legali e moratori** | `public/miniapps/at/Calcolo_Interessi.html` (array `legalInterestRates`, `defaultInterestRates`) | **Dicembre** (D.M. MEF saggio legale per l'anno successivo) e **gennaio/luglio** (comunicato MEF tasso BCE semestrale ex D.Lgs. 231/2002) | L'ultimo periodo di ciascun array ha `endDate: '9999-12-31'`: chiuderlo e aggiungere il nuovo. Fonte di controllo: pacchetto `../dati_forensi_ISTAT_MEF/` |
| Mini-webapp di Avv. Arcella | `public/miniapps/at/*.html` | Quando il sito di origine cambia il file | Origine: `avvocatotelematico.studiolegalearcella.it` |
| Registry mini-webapp con metadati | `src/config/miniapps.ts` | Quando si aggiunge/rimuove uno strumento | jurisdiction, offlineReady, autore |
| URL aree (Area Riservata, login, area Consiglieri) | `src/services/auth.ts` (`AUTH_URLS`) | Se il sito cambia struttura | Tipicamente stabile |

#### Fonte dei dati Tribunale + CA

I dati di `src/config/uffici-giudiziari-na.ts` sono stati estratti dallo script Python `genera_excel_napoli.py` (in cartella di lavoro, non nel repo) che a sua volta li ha presi dai siti istituzionali:
- <https://tribunale-napoli.giustizia.it/it/uffici_e_cancellerie.page>
- <https://ca-napoli.giustizia.it/it/uff_e_cancel_cort_app.page>

**Procedura consigliata di revisione annuale**:
1. Eseguire lo script Python aggiornato sui siti istituzionali → genera Excel aggiornato
2. Confrontare Excel con `uffici-giudiziari-na.ts` (sezioni, magistrati, cancellerie)
3. Aggiornare il file TS con le variazioni
4. Ricompilare APK e ridistribuire

### 🟢 Dati da FONTI ESTERNE (sempre attuali, dipendono dalla rete)

Questi dati vengono recuperati a runtime via HTTP. Sono sempre aggiornati ma richiedono connessione (con cache di 30 min per ridurre il consumo dati).

| Fonte | URL | Tipo | File scraper |
|-------|-----|------|--------------|
| Sito COA Napoli — News | `https://www.ordineavvocatinapoli.it/wp-json/wp/v2/posts` | **API REST WordPress** (no scraping) | `src/services/api.ts` |
| Sito COA Napoli — Sezioni | <https://www.ordineavvocatinapoli.it/...> | WebView (SitoView) | `src/pages/SitoView.tsx` |
| PST Min. Giustizia (PCT + PPT) | `https://pst.giustizia.it/PST/it/news.page` | Scraping HTML (JSF) | `src/services/sources/pst.ts` |
| Tribunale di Napoli — News | `https://tribunale-napoli.giustizia.it/it/news.page` | Scraping HTML (JSF) | `src/services/sources/uffici-napoli.ts` |
| Corte d'Appello Napoli — News | `https://ca-napoli.giustizia.it/it/news.page` | Scraping HTML (JSF) | `src/services/sources/uffici-napoli.ts` |
| Giustizia Amministrativa | `https://www.giustizia-amministrativa.it/news` | WebView interna (SSL custom blocca scraping) | `src/services/sources/giustizia-amministrativa.ts` (fallback) |
| Dipartimento Giustizia Tributaria (MEF) | `https://www.dgt.mef.gov.it/gt/c/portal/news/rss?idrss=1` | **RSS XML** ufficiale | `src/services/sources/giustizia-tributaria.ts` |
| Albo Nazionale Avvocati (CNF) | `https://www.consiglionazionaleforense.it/ricerca-avvocati` | Browser di sistema (X-Frame-Options blocca iframe) | menu/AppMenu.tsx |
| Riconosco (DCS) | `https://riconosco.dcssrl.it/` | Browser di sistema | Home tile |
| Area Riservata Consiglieri | `https://www.ordineavvocatinapoli.it/area-riservata-consiglieri/` | Browser di sistema | AreaRiservata.tsx |
| SIGP Giudice di Pace | `https://gdp.giustizia.it/index.php?pagina=cambiaufficio` | Browser di sistema (sito XHTML 1.0 legacy) | miniapps.ts |
| Aule Penali Napoli (canale Telegram) | `https://t.me/AulePenaliNapoli` | Browser/Telegram | miniapps.ts |

#### Cosa fare se una fonte cambia struttura HTML

Lo scraping è **fragile per definizione**: se il sito cambia template, lo scraper può rompersi. Ogni scraper è testabile in isolamento:

```bash
node scripts/test-pst.mjs    # verifica scraper PST
node scripts/test-ga.mjs     # verifica scraper Giustizia Amministrativa
```

I selettori CSS/regex sono nei file `src/services/sources/*.ts`. La logica di base è:
- `pst.ts` cerca `a[href*="contentId=NWS"]` e risale al `.card`
- `uffici-napoli.ts` cerca `a[href*="contentId=CTM"]`

Se cambia la nomenclatura `NWS`/`CTM` o la struttura `.card` → adattare lo scraper.

Per la Giustizia Amministrativa è in modalità `viewMode: 'webview'` per scelta (problemi SSL su molti runtime), lo scraper è solo fallback. Se l'utente segnala che la WebView non funziona più, valutare il passaggio a `Browser.open` (CustomTabs).

---

## Configurazioni e file da revisionare periodicamente

Riassunto rapido per chi deve mantenere l'app nel tempo:

| Frequenza | File | Cosa fare |
|-----------|------|-----------|
| **Annuale** | `src/config/uffici-giudiziari-na.ts` | Aggiornare magistrati e cancellerie da Excel del Tribunale e CA |
| **Annuale** | `public/miniapps/at/Calendario_gdp_napoli_2026.html` | Sostituire col nuovo anno (rinominare e aggiornare `miniapps.ts`) |
| **Annuale o ad ogni variazione tabellare** | `public/miniapps/sedi/Aule_sezione_lavoro.html` | Aggiornare lista giudici sez. Lavoro |
| **Ad ogni rinnovo Consiglio (4 anni)** | `src/pages/Consiglio.tsx` | Aggiornare elenco Presidenza + Consiglieri |
| **Ad ogni rinnovo Commissione** | `src/pages/Commissione.tsx` | Aggiornare componenti |
| **Quando il COA pubblica un cambio** | `src/pages/Info.tsx` | Contatti, orari, codici |
| **Continuo (a ogni release)** | `package.json`, `capacitor.config.ts` | dipendenze, version |
| **A ogni nuovo strumento di Avv. Arcella** | `public/miniapps/at/<file>.html` + `src/config/miniapps.ts` | Vedi guida sotto |
| **Se uno scraper si rompe** | `src/services/sources/<id>.ts` | Aggiornare regex/selettori |
| **A ogni release** | Test funzionali manuali su device | Le 3 cose critiche: news COA, news PST, area riservata |

---

## Build e ambiente di sviluppo

### Setup macchina (una sola volta)

```bash
# Node + npm
# Windows: scaricare da nodejs.org
# Mac: brew install node

# JDK 21 (NON 17, non basta per build Android)
# Scaricare Eclipse Temurin o Microsoft OpenJDK
# Impostare JAVA_HOME alla cartella del JDK 21

# Android SDK
# Scaricare Android command-line tools da developer.android.com
# Impostare ANDROID_HOME, installare:
#   sdkmanager "platform-tools" "platforms;android-35" "platforms;android-36" "build-tools;35.0.0" "build-tools;36.0.0"
#   sdkmanager --licenses
```

### Sviluppo

```bash
npm install                  # installa dipendenze
npm run dev                  # dev server browser (localhost:5173)
npm run build:web            # build di produzione web
npm run cap:sync             # sync con Android nativo
npm run android:build        # build APK debug completo (npm run build:web + cap sync + gradle)
npm run android:open         # apre Android Studio
```

In dev mode, le fonti esterne (PST, GA, GT, CA, Tribunale, COA) vengono raggiunte tramite **proxy Vite** configurati in `vite.config.ts` (per evitare CORS dal browser). Su nativo, le richieste passano via `CapacitorHttp` che bypassa CORS.

### Build APK manuale

```bash
npm run build:web
npx cap sync android
cd android
./gradlew.bat assembleDebug   # Windows
# oppure ./gradlew assembleDebug  # macOS/Linux
```

APK generato in `android/app/build/outputs/apk/debug/app-debug.apk`.

### Build iOS

Vedi documento dedicato: [`docs/BUILD_iOS.md`](docs/BUILD_iOS.md).

### Pubblicazione sugli store

> ⚠️ **L'APK `-debug` NON è pubblicabile sul Play Store**: è firmato con la
> chiave di debug. Per Google Play serve una build **release** firmata con
> keystore proprio, in formato **AAB** (obbligatorio per le nuove app).

**1. Creare il keystore di upload (una sola volta, conservarlo con cura):**
```bash
keytool -genkeypair -v -keystore coa-napoli-upload.keystore -alias coa-napoli \
  -keyalg RSA -keysize 2048 -validity 10000
```
Custodire il file `.keystore` e le password FUORI dal repository (password
manager + backup). Se si perde l'upload key, va richiesto il reset a Google.

**2. Creare `android/key.properties`** (già in `.gitignore`, mai committarlo):
```properties
storeFile=C:\\percorso\\sicuro\\coa-napoli-upload.keystore
storePassword=***
keyAlias=coa-napoli
keyPassword=***
```

**3. Generare l'AAB firmato:**
```bash
npm run android:release
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`, da
caricare su Play Console (con Play App Signing attivo, raccomandato).

**Requisiti Play Console oltre all'AAB**: account sviluppatore (25 USD una
tantum; per un ente conviene account organizzazione verificato), privacy
policy pubblica (URL), scheda store (descrizioni, screenshot, icona 512×512,
feature graphic 1024×500), questionari Data Safety e Content Rating,
`targetSdk` recente (già a 36 ✓).

**iOS / App Store**: build gestita sul fork `app-ordine-avvocati-napoli-ios`
(vedi `docs/BUILD_iOS.md`); richiede Apple Developer Program e — prima della
submission — il merge del fix icona/splash rigenerati dagli asset ufficiali.

---

## Plugin Capacitor utilizzati

| Plugin | Versione | Funzione |
|--------|----------|----------|
| `@capacitor/app` | ^8 | Eventi foreground/background dell'app |
| `@capacitor/browser` | ^8 | Apre URL in Custom Tabs / SafariViewController |
| `@capacitor/filesystem` | ^8 | Download e salvataggio file |
| `@capacitor/preferences` | ^8 | Storage chiavi/valore (cookie, last-seen) |
| `@capacitor/share` | ^8 | Share sheet nativo per condivisione news |
| `@capacitor/network` | ^8 | Stato rete |
| `@capacitor/splash-screen` | ^8 | Splash screen all'avvio |
| `@capacitor/status-bar` | ^8 | Colore status bar |
| `@capacitor/haptics` | ^8 | Feedback tattile |
| `@capacitor/keyboard` | ^8 | Eventi tastiera |
| `@capacitor/local-notifications` | ^8 | Notifiche locali (foreground + da background runner) |
| `@capacitor/background-runner` | ^3 | Runner JS isolato per polling PST in background |

Plugin Capacitor abilitati in `capacitor.config.ts`:
- `CapacitorHttp` (bypass CORS)
- `BackgroundRunner` con script `background-pst.js`

---

## Architettura cookie / autenticazione

### Pattern adottato per Area Riservata

**Apertura nel browser di sistema** (Chrome Custom Tabs su Android, SafariViewController su iOS), NON in WebView interna. Motivo: lunghi tentativi falliti di altre architetture per Storage Partitioning di Android WebView (cookie tra iframe e top-frame in partition diverse).

L'app non vede e non memorizza credenziali. La sessione resta nel browser di sistema, persistente tra aperture.

⚠️ **Difetto noto del sito**: dopo il login il sito NON redirige automaticamente all'area Consiglieri. La pagina `AreaRiservata.tsx` propone un workflow esplicito a 2 step:
1. Tap "Apri pagina di login" → completa login
2. Tap "Vai all'Area Riservata Consiglieri" → entra (URL diretto a `/area-riservata-consiglieri/`)

### Cookie WebView interno (per Sito Ordine, sezioni)

`MainActivity.java` Android è custom: abilita `setAcceptThirdPartyCookies(true)` + `setDomStorageEnabled(true)` + chiama `CookieManager.flush()` su `onPause` per persistere cookie consenso privacy tra sessioni.

---

## Background fetch e notifiche

### Notifiche foreground

`src/services/notifications.ts` — controllata in `App.tsx` su evento `appStateChange.isActive`:
1. Se l'utente ha attivato il toggle, ad ogni ritorno in foreground fa fetch delle news PST
2. Confronta col `pst:last-seen-id` salvato in `Preferences`
3. Se ci sono news nuove, schedula `LocalNotifications.schedule(...)`
4. Prima esecuzione: imposta solo il baseline senza notificare

### Notifiche background

`public/background-pst.js` — runner JS standalone eseguito da `@capacitor/background-runner`:
- Frequenza: ~60 min (Android decide il timing reale, di solito 15-180 min)
- Scope ridotto: usa `fetch` + regex (no cheerio, no react)
- Storage isolato: `CapacitorKV` (separato da `Preferences` dell'app)
- Sync con app: l'app dispatcha `setNotifyEnabled` per propagare la preferenza utente

⚠️ **Limiti noti**:
- Su device con risparmio batteria aggressivo (Xiaomi, Huawei) il task può essere ucciso
- iOS via `BGTaskScheduler` è ancora più restrittivo (1-3 esecuzioni/giorno)
- Per notifiche realtime servirebbe FCM + server backend (roadmap fase 3)

---

## Branding e palette

Palette istituzionale **AgID** per siti della PA italiana, definita in `src/theme/variables.css`:

| Token | Valore | Uso |
|-------|--------|-----|
| `--ion-color-primary` | `#0066CC` | Blu istituzionale, toolbar, CTA primari |
| `--ion-color-primary-shade` | `#003F7F` | Blu scuro, dark mode |
| `--ion-color-secondary` | `#C9A24A` | Oro, accenti, badge sezione |
| `--ion-color-tertiary` | `#6B1E2A` | Bordeaux toga, CTA secondari |
| Splash background | `#FDF9F5` | Crema (sfondo immagine "Apertura_app") |

Logo: `public/logo.jpg` (600×600, stemma quadrato COA Napoli). Sorgenti per generare gli asset nativi: `resources/icon.png` (1024×1024) e `resources/splash.png` (canvas 2732×2732 su sfondo crema `#FDF9F5` con stemma centrato).

App icon Android: `android/app/src/main/res/mipmap-*/ic_launcher.png`. Per rigenerarli dopo aver aggiornato le sorgenti:
```bash
npx capacitor-assets generate --android --iconBackgroundColor "#FDF9F5" --splashBackgroundColor "#FDF9F5"
```
> Nota: `@capacitor/assets` non è più tra le devDependencies (dal v1.2.4, per vulnerabilità senza fix nel suo albero di dipendenze dev-only): `npx` lo scarica al volo quando serve.

---

## Add new content — guide rapide

### Aggiungere una mini-webapp

1. Copia il file HTML in `public/miniapps/at/<nome>.html` (deve essere autoportato: CSS/JS inline)
2. Registra in `src/config/miniapps.ts`:
   ```ts
   {
     id: 'mio-strumento',
     title: 'Calcolatore X',
     subtitle: 'Descrizione breve',
     file: 'miniapps/at/<nome>.html',
     icon: 'calculator-outline',
     jurisdiction: 'civile',
     offlineReady: true,
     author: AT_AUTHOR,
     origin: AT_ORIGIN,
   }
   ```
3. `npm run cap:sync` + ricompila APK

Per shortcut esterno (apre Telegram/web): usa `externalUrl` invece di `file`.
Per WebView interna su sito esterno: usa `webviewUrl`.

### Aggiungere una nuova fonte news Processo Telematico

1. Crea `src/services/sources/<id>.ts` che esporta `fetchNews(page?: number): Promise<SourceNewsItem[]>`
2. Registra in `src/config/sources.ts` con `jurisdiction` appropriata
3. Per dev mode, aggiungi proxy in `vite.config.ts`
4. (Opzionale) Crea uno script di test `scripts/test-<id>.mjs` per validare il parsing

### Aggiornare Tribunale o CA

1. Apri `src/config/uffici-giudiziari-na.ts`
2. Aggiungi/modifica magistrati con `tAdd(sezione, "Nome Cognome", "Ruolo")` per il Tribunale o `cAdd(...)` per la CA
3. Modifica gli array `T_UFF`/`CA_UFF` per le cancellerie
4. Per la **dislocazione aule** (Torre A): aggiorna `T_SEZ_PIANO_CIV` (sezioni civili) o `T_LAVORO_BY_COGNOME` (giudici sezione lavoro, key = cognome, anche composto)
5. Build e test sull'app

### Aggiornare i recapiti uffici del distretto

`src/config/recapiti-uffici-na.ts` — array piatto `RECAPITI_UFFICI`. Ogni voce ha `tipo`, `tipoLabel`, `denominazione`, `circondario`, `comune`, `provincia`, `indirizzo`, `cap`, `telefono`, `email`, `fax`, `note`. La pagina `RecapitiUffici.tsx` raggruppa automaticamente per circondario (gli uffici distrettuali in cima).

### Aggiornare i 9 codici dalla versione online

I codici restano **sempre inclusi nell'app** (offline): la fonte è `https://avvocatotelematico.studiolegalearcella.it/codici/home.html`. Quando il sito viene aggiornato:

```bash
node scripts/aggiorna_codici.mjs              # download + schede CAD/CPA in home + tema COA + patch v1.2.3 + search index
npm run cap:sync && cd android && ./gradlew.bat assembleDebug
```

Lo script scarica e valida tutti i file prima di scriverne uno; `cad.html` e `codice-processo-amministrativo.html` (presenti solo nell'app) non vengono toccati e le loro schede vengono reinserite nella home scaricata. Tutti gli script di adattamento sono idempotenti.

### Rigenerare CAD/CPA da nuovi XML AkomaNtoso

Quando esce una nuova versione consolidata su Normattiva:

```bash
# Sostituire gli XML in C:/Users/rober/kDrive/__CODING_PROVVISORIA/CODICI XML/
node scripts/genera_codici_aggiuntivi.mjs    # CAD + CPA
node scripts/restyle_codici_coa.mjs           # Tema COA blu/bianco
node scripts/patch_codici_v123.mjs            # Menu "Vai a articolo" + sblocco scroll
node scripts/aggiorna_search_index.mjs        # Search globale home.html
npm run cap:sync && cd android && ./gradlew.bat assembleDebug
```

Dopo la rigenerazione aggiornare a mano la data `agg. gg/mm/aaaa` della relativa scheda in `home.html` (o rilanciare `aggiorna_codici.mjs`, che la ricava dal campo `vigenza`).

Il parser preserva lo stile della webapp originale: ogni comma in un proprio `<p>`, note di aggiornamento separate in `notesHtml`, `<ref>` flatten a testo, copia/condivisione WhatsApp via template.

### Aggiungere voce hamburger menu

`src/components/AppMenu.tsx` — array `ITEMS`. Per voce esterna (browser di sistema): aggiungere prefisso `EXTERNAL:` all'URL e flag `external: true`.

---

## Roadmap nota

- **Fase 3**: notifiche push reali via Firebase Cloud Messaging + server di polling PST
- **iOS**: build su fork separato (vedi BUILD_iOS.md)
- **Pubblicazione Play Store**: richiede package signing release, account Google Play Console (~25 € una tantum)
- **Config remoto**: portare i selettori scraping e il registry mini-app su un JSON pubblicato remotamente, per aggiornare l'app senza ridistribuire APK
- **Icona launcher dedicata**: il logo COA è 321×157 (orizzontale). Per un'icona Android quadrata serve un PNG ad-hoc (≥1024×1024); attualmente uso un placeholder Capacitor su sfondo blu
- **Dark mode tile Home**: testare la leggibilità delle pillole nei tile sul dark mode

---

## Risoluzione problemi noti

| Sintomo | Causa | Fix |
|---------|-------|-----|
| Build Android fallisce con "Cannot find Java 21" | JDK installato è 17 o inferiore | Installa JDK 21 + JAVA_HOME |
| `npx cap sync` lento al primo run | Capacitor scarica le dipendenze native | normale, ~1 min al primo run |
| Banner cookie ricorrente sul sito Ordine | Storage Partitioning Android | `CookieManager.flush()` in MainActivity onPause |
| Albo Nazionale (CNF) errore in iframe | `X-Frame-Options: SAMEORIGIN` | aprire in Browser.open (già fatto) |
| Riconosco banner non si chiude | iframe cookie partition | aprire in Browser.open (già fatto) |
| Mini-app non scorre subito | WebView Android richiede reflow forzato | sequenza reflow nei `setTimeout` di MiniAppView |
| Login PST non riesce (test) | `CapacitorHttp` ha cookie jar separato dal WebView | usare WebView intera per login (Area Riservata) |
| Notifiche non arrivano in background | Risparmio batteria aggressivo del device | escludere app da ottimizzazione batteria |
| `npm run build` fallisce con `ENOENT ... copyfile 'public\desktop.ini'` | Google Drive per desktop crea `desktop.ini` in ogni cartella e non permette ad altri programmi di scriverli | Già gestito in `vite.config.ts` (plugin `copyPublicSenzaDesktopIni`, `copyPublicDir: false`) |

---

## Crediti

App sviluppata da **Avv. Roberto Arcella** su idea e con la collaborazione della **Commissione Informatica** del **Consiglio dell'Ordine degli Avvocati di Napoli**.

Strumenti professionali integrati: cortesia di **avvocatotelematico.studiolegalearcella.it** (Avv. Roberto Arcella).

Per contributi tecnici, segnalazioni, pull request: <https://github.com/robertoarcella-bot/app-ordine-avvocati-napoli>

---

*Ultimo aggiornamento di questo README: maggio 2026 (v1.1.0).*
