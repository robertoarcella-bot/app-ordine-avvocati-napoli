# App Ordine Avvocati Napoli — Documentazione tecnica

App mobile **non ufficiale** per gli iscritti al Consiglio dell'Ordine degli Avvocati di Napoli. Distribuita inizialmente come APK Android sideload; build iOS gestita su fork separato (vedi [docs/BUILD_iOS.md](docs/BUILD_iOS.md)).

- **Autore originario**: Avv. Roberto Arcella
- **Idea e collaborazione**: Commissione Informatica del COA Napoli
- **Per conto di**: Consiglio dell'Ordine degli Avvocati di Napoli
- **Licenza/uso**: a beneficio degli iscritti al COA Napoli

---

## Sommario

1. [Stack e dipendenze](#stack-e-dipendenze)
2. [Struttura del progetto](#struttura-del-progetto)
3. [Funzionalità ed elenco schermate](#funzionalità-ed-elenco-schermate)
4. [Origine dei dati: in-app vs fonti esterne](#origine-dei-dati-in-app-vs-fonti-esterne)
5. [Configurazioni e file da revisionare periodicamente](#configurazioni-e-file-da-revisionare-periodicamente)
6. [Build e ambiente di sviluppo](#build-e-ambiente-di-sviluppo)
7. [Plugin Capacitor utilizzati](#plugin-capacitor-utilizzati)
8. [Architettura cookie / autenticazione](#architettura-cookie--autenticazione)
9. [Background fetch e notifiche](#background-fetch-e-notifiche)
10. [Branding e palette](#branding-e-palette)
11. [Add new content — guide rapide](#add-new-content--guide-rapide)
12. [Roadmap nota](#roadmap-nota)
13. [Risoluzione problemi noti](#risoluzione-problemi-noti)

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
│       │   ├── Calcolatore_parcelle_avvocati.html
│       │   ├── Calcolo_fattura_Avvocati.html
│       │   └── ...                        # ~21 file html
│       └── sedi/
│           └── Aule_sezione_lavoro.html
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
│   │   └── uffici-giudiziari-na.ts        # ⚠️ Magistrati e cancellerie Tribunale + CA Napoli
│   ├── pages/
│   │   ├── Home.tsx                       # Tile rapidi
│   │   ├── News.tsx, NewsDetail.tsx       # News COA via WP REST
│   │   ├── UfficiNews.tsx                 # News aggregate Tribunale + CA
│   │   ├── Sito.tsx, SitoView.tsx         # WebView sezioni del sito COA
│   │   ├── Documenti.tsx
│   │   ├── MiniApps.tsx, MiniAppView.tsx  # Strumenti
│   │   ├── ProcessoTelematico.tsx, SourceNews.tsx
│   │   ├── AuleUdienze.tsx, UfficioGiudiziario.tsx
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
| **Magistrati e cancellerie Tribunale di Napoli** | `src/config/uffici-giudiziari-na.ts` (oggetto `TRIBUNALE_NAPOLI`) | **Annuale** (variazioni tabellari, pensionamenti) | ~287 magistrati, 11 uffici amministrativi, dislocazione settori |
| **Magistrati e cancellerie Corte d'Appello Napoli** | `src/config/uffici-giudiziari-na.ts` (oggetto `CORTE_APPELLO_NAPOLI`) | **Annuale** | ~113 magistrati, 46 uffici/cancellerie, vertici |
| Aule Sezione Lavoro Napoli | `public/miniapps/sedi/Aule_sezione_lavoro.html` (45 giudici hardcoded) | A ogni variazione tabellare (≥1/anno) | File HTML separato (mini-webapp) |
| Calendario GdP Napoli | `public/miniapps/at/Calendario_gdp_napoli_2026.html` | **Annuale** (anno calendario nel nome) | Va sostituito a fine anno |
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

Logo: `public/logo.jpg` (321×157, fornito dall'utente). Splash sorgente: `resources/splash.png` (canvas 2732×2732 con immagine centrata).

App icon Android: `android/app/src/main/res/mipmap-*/ic_launcher.png`. Per rigenerarli da un PNG quadrato:
```bash
npx capacitor-assets generate --android --iconBackgroundColor "#0066CC"
```

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
4. Build e test sull'app

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

---

## Crediti

App sviluppata da **Avv. Roberto Arcella** su idea e con la collaborazione della **Commissione Informatica** del **Consiglio dell'Ordine degli Avvocati di Napoli**.

Strumenti professionali integrati: cortesia di **avvocatotelematico.studiolegalearcella.it** (Avv. Roberto Arcella).

Per contributi tecnici, segnalazioni, pull request: <https://github.com/robertoarcella-bot/app-ordine-avvocati-napoli>

---

*Ultimo aggiornamento di questo README: maggio 2026.*
