# App Ordine Avvocati Napoli

App mobile ufficiale (Android, in futuro iOS) del Consiglio dell'Ordine degli Avvocati di Napoli.

- **Autore:** Avv. Roberto Arcella
- **Idea e collaborazione:** Commissione Informatica del COA Napoli
- **Per conto di:** Consiglio dell'Ordine degli Avvocati di Napoli

Palette istituzionale **AgID** (blu `#0066CC`), allineata alle linee guida per i siti della PA italiana.

---

## Funzionalità

| Sezione | Cosa contiene |
|---------|---------------|
| **Home** | Tile rapidi di accesso e ultime 3 news del COA |
| **News** | Tutte le news del sito COA via API REST WordPress, cache 30 min, ricerca full-text, infinite scroll, condivisione |
| **Sito COA** | 10 sezioni del sito ufficiale in WebView nativa (Albo, Modulistica, Trasparenza, Verbali, ecc.) |
| **Documenti** | Accesso rapido a Modulistica, Albo, Regolamenti, Verbali, Trasparenza |
| **Strumenti** | 23 mini-webapp di Avv. Roberto Arcella, raggruppate per giurisdizione (vedi sotto) |
| **Processo Telematico** | Notizie aggregate da fonti istituzionali (PST Min. Giustizia, Giustizia Amministrativa, Giustizia Tributaria) |
| **Area Riservata** | (placeholder fase 2) login al sito COA |
| **Info & Crediti** | Logo, autori, contatti |

### Strumenti inclusi (23)

Tutte le app provengono da [avvocatotelematico.studiolegalearcella.it](https://avvocatotelematico.studiolegalearcella.it/) (Avv. Roberto Arcella) e sono incluse nel bundle dell'APK; quelle marcate ☁️ funzionano completamente offline.

**Comuni** — Parametri Forensi DM 147/2022, Calcolo Fattura, Preventivo professionale, CU Civ/Trib/Amm, Interessi Legali e Moratori, Procura alle liti, Anonimizzatore atti, MD→PDF, InvoicyLex Dashboard.

**Civile** — Termini c.p.c. (Cartabia), Termini Esecuzioni Civili, Danno alla Persona TUN 2025, Danno Micropermanenti, CU Famiglia, Piano Genitoriale, Analizzatore atti DM 110/2023, Calendario GdP Napoli 2026, Analisi Verbale Ricerca Beni, Depositi CCII, Mappa XSD Depositi PCT.

**Penale** — Calcolo Prescrizione Penale, Patrocinio S.S. Penale (Protocollo Napoli), PEC Uffici Giudiziari (PPT).

### Fonti news Processo Telematico

- **PST — Min. Giustizia** (`comuni`): scraping HTML di `pst.giustizia.it/PST/it/news.page` (PCT + PPT)
- **Giustizia Amministrativa** (`amministrativo`): scraping HTML di `giustizia-amministrativa.it/news`
- **Giustizia Tributaria** (`tributario`): RSS feed `dgt.mef.gov.it/gt/c/portal/news/rss?idrss=1`

L'apertura di una news avviene in browser esterno (la pagina di dettaglio è gestita dal sito di origine).

## Stack tecnologico

- **Capacitor 8** (wrapper nativo cross-platform Android/iOS, plugin nativi per filesystem, preferences cifrate, share, browser, splash, status bar, haptics)
- **Ionic React 8** (componenti UI mobile-friendly, dark mode automatico)
- **React 19 + TypeScript + Vite** (build veloce, codebase tipato)
- **cheerio** per il parsing HTML delle fonti che non espongono API
- **CapacitorHttp** per richieste native cross-origin (bypass CORS dal WebView)
- **API REST WordPress** del sito COA per le news (no scraping)

## Sviluppo

```bash
npm run dev          # dev server browser, hot reload (localhost:5173)
npm run build:web    # build di produzione web
npm run cap:sync     # sync con la piattaforma Android
npm run android:build  # build APK debug completo
npm run android:open   # apri Android Studio
```

In dev mode i siti esterni (PST, GA, GT) sono raggiunti via i proxy Vite configurati in `vite.config.ts`. In produzione (Capacitor) le richieste passano direttamente via `CapacitorHttp` bypassando CORS.

## Build APK Android

### Prerequisiti

- **JDK 21** (i plugin Capacitor 8 lo richiedono)
- **Android SDK** (build-tools 35+36, platforms android-35+36, platform-tools)
- Variabili d'ambiente `JAVA_HOME` e `ANDROID_HOME` configurate

Setup completo:
```bash
# JDK 21 (Adoptium Temurin)
curl -L -o jdk.zip "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk"

# Android SDK command-line tools
curl -L -o sdk.zip "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
# estrarre in %LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\
sdkmanager "platform-tools" "platforms;android-35" "platforms;android-36" "build-tools;35.0.0" "build-tools;36.0.0"
sdkmanager --licenses  # accettare tutte
```

### Comando

```bash
npm run build:web
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

APK generato in `android/app/build/outputs/apk/debug/app-debug.apk` (~6.5 MB).

## Aggiungere strumenti

### Mini-webapp HTML autoportata

1. Crea il file in `public/miniapps/<nome>.html` (single-file HTML con CSS/JS inline)
2. Registralo in `src/config/miniapps.ts`:
   ```ts
   {
     id: 'mio-strumento',
     title: 'Calcolatore X',
     subtitle: 'Descrizione breve',
     file: 'miniapps/<nome>.html',
     icon: 'calculator-outline',
     jurisdiction: 'civile',  // 'comuni' | 'civile' | 'penale' | 'amministrativo' | 'tributario'
     offlineReady: true,      // false se carica risorse esterne (CDN, font Google)
   }
   ```
3. `npm run cap:sync && build APK`

### Nuova fonte news (sezione Processo Telematico)

1. Crea `src/services/sources/<id>.ts` che esporta `fetchNews(page?): Promise<SourceNewsItem[]>`
2. Registra in `src/config/sources.ts` con jurisdiction appropriata
3. Per dev mode aggiungi un proxy in `vite.config.ts` per evitare CORS

Esempi di pattern già implementati: scraping HTML con cheerio (PST, GA), parser RSS XML (GT).

## Roadmap

- **Fase 2 — Area Riservata**: form di login nativo + cookie hybrid auth con cookie di sessione catturati e iniettati nella WebView
- **Notifiche push** per nuove news (richiede Firebase Cloud Messaging)
- **Build iOS** (richiede Mac + Apple Developer)
- **Pubblicazione Play Store / App Store**
- **Config remoto** (selettori scraping + registry mini-app aggiornabili senza ridistribuire APK)
- **Icona launcher dedicata**: il logo COA è 321×157 (orizzontale) — per un'icona Android di qualità servirebbe un PNG quadrato (almeno 1024×1024). Per ora l'icona launcher è un placeholder Capacitor su sfondo blu istituzionale; sostituire i file PNG in `android/app/src/main/res/mipmap-*/ic_launcher*.png` quando si avrà l'asset (oppure rigenerare con `npx capacitor-assets generate --android` mettendo `resources/icon.png` quadrato).
