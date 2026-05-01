# App COA Napoli

App mobile (Android, in futuro iOS) del Consiglio dell'Ordine degli Avvocati di Napoli.

- **Autore:** Avv. Roberto Arcella
- **Idea e collaborazione:** Commissione Informatica del COA Napoli
- **Per conto di:** Consiglio dell'Ordine degli Avvocati di Napoli

---

## Stack tecnologico

- **Capacitor 8** (wrapper nativo cross-platform Android/iOS)
- **Ionic React 8** (componenti UI mobile-friendly)
- **React 19 + TypeScript + Vite** (build veloce, codebase tipato)
- **API REST WordPress** del sito ufficiale per le news (no scraping)

L'app è una **PWA imbustata in nativo**: tutto il codice UI è web (HTML/JS/TS), Capacitor lo esegue dentro un WebView nativo Android e fornisce accesso a API native (filesystem, preferences cifrate, share sheet, browser esterno, ecc.).

## Struttura

```
app-coa/
├── public/
│   └── miniapps/        # mini-webapp HTML autoportate (vedi sezione dedicata)
├── src/
│   ├── components/
│   │   └── AppMenu.tsx  # menu laterale
│   ├── config/
│   │   ├── site.ts      # URL, sezioni del sito, CSS mobile-friendly
│   │   └── miniapps.ts  # registry mini-webapp
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── News.tsx, NewsDetail.tsx
│   │   ├── Sito.tsx, SitoView.tsx
│   │   ├── Documenti.tsx
│   │   ├── MiniApps.tsx, MiniAppView.tsx
│   │   ├── AreaRiservata.tsx  # placeholder per fase 2 (login)
│   │   └── Info.tsx
│   ├── services/
│   │   ├── api.ts       # client API REST WordPress
│   │   ├── cache.ts     # cache locale con TTL
│   │   └── download.ts  # download e apertura file
│   ├── theme/
│   │   └── variables.css  # palette istituzionale COA
│   ├── App.tsx          # router
│   └── main.tsx
├── android/             # progetto Android nativo (generato da Capacitor)
├── capacitor.config.ts
├── index.html
├── package.json
└── vite.config.ts
```

## Sviluppo

```bash
# Avvia il dev server (browser, hot reload)
npm run dev

# Build di produzione (web)
npm run build:web

# Sync con la piattaforma Android (dopo build)
npm run cap:sync
```

L'app gira nel browser su `http://localhost:5173`. Tutto è funzionale tranne i plugin nativi puri (su browser usano fallback web — es. il download apre un nuovo tab anziché salvare nel filesystem).

## Build APK Android

### Prerequisiti

1. **JDK 17+** (già installato in `%LOCALAPPDATA%\Programs\Microsoft\jdk-17.0.10.7-hotspot`)
2. **Android SDK** con almeno: platform-tools, build-tools 34, platform android-34

Modi rapidi per installare l'SDK:

**Opzione A — Android Studio (consigliato per chi lavorerà sull'app):**
```bash
winget install Google.AndroidStudio
```
All'apertura, lasciare che scarichi l'SDK predefinito.

**Opzione B — Solo command-line tools (se non si vuole l'IDE):**
- Scaricare https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip
- Estrarre in `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest`
- Impostare `ANDROID_HOME` a `%LOCALAPPDATA%\Android\Sdk`
- Aggiungere al `Path`: `%ANDROID_HOME%\cmdline-tools\latest\bin` e `%ANDROID_HOME%\platform-tools`
- `sdkmanager --licenses` (accettare tutte)
- `sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"`

### Comando di build

```bash
npm run build:web
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

L'APK viene generato in:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Da installare con `adb install app-debug.apk` o trasferendo il file sullo smartphone (richiede "Origini sconosciute" abilitato nelle impostazioni Android).

### Build con Android Studio

`npm run android:open` apre il progetto in Android Studio, da cui fare *Build > Build Bundle(s) / APK(s) > Build APK(s)*.

## Aggiungere una nuova mini-webapp

Le mini-webapp sono pagine HTML autoportate (CSS/JS inline) che diventano voci di menu nella sezione "Strumenti".

1. Crea il file HTML in `public/miniapps/<nome>.html` (vedi `esempio.html` come template).
2. Registralo in `src/config/miniapps.ts`:
   ```ts
   {
     id: 'mio-strumento',
     title: 'Calcolatore termini',
     subtitle: 'Calcola termini processuali con sospensione feriale',
     file: 'miniapps/mio-strumento.html',
     icon: 'calendar-outline',  // nome icona ionicons
     category: 'Calcolatori',
   }
   ```
3. `npm run cap:sync` per copiare negli assets nativi.
4. Build APK.

## Roadmap / Fase 2

- **Login area riservata** (form nativo + cookie hybrid auth → vedi `pages/AreaRiservata.tsx`)
- **Notifiche push** per nuove news (richiede Firebase Cloud Messaging)
- **Build iOS** (richiede Mac + Apple Developer account)
- **Pubblicazione su Play Store / App Store**
- **Config remoto** per news selectors / mini-app registry (aggiornamento senza ridistribuire APK)

## Configurazione applicazione

Il file `capacitor.config.ts` contiene:
- `appId: it.ordineavvocatinapoli.app` — bundle id
- `appName: COA Napoli` — nome visualizzato sotto l'icona
- Splash screen verde COA, hide automatico dopo 1.5s
- Status bar dark con sfondo verde COA

Per cambiare l'icona dell'app, sostituire i file PNG in `android/app/src/main/res/mipmap-*/ic_launcher.png` (e `ic_launcher_round.png`, `ic_launcher_foreground.png`).
Generatore comodo: https://icon.kitchen oppure `npx @capacitor/assets generate` con un PNG sorgente in `assets/icon.png`.
