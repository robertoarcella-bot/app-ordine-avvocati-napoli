# Build iOS — Istruzioni per la versione iPhone

> **Repo principale (Android)**: <https://github.com/robertoarcella-bot/app-ordine-avvocati-napoli>
>
> **Repo fork iOS**: da creare come `app-ordine-avvocati-napoli-ios` (vedi sezione [Setup del fork iOS](#setup-del-fork-ios))

Questo documento è destinato a chi ha un **Mac** e si occuperà di produrre la versione iPhone dell'app a partire dal codice sorgente comune.

L'app è basata su [Capacitor 8](https://capacitorjs.com/) + Ionic React: lo stesso codice JavaScript/TypeScript viene impacchettato dentro un guscio nativo Android (sulla repo principale) o iOS (sul fork). I plugin nativi che usiamo hanno tutti supporto iOS ufficiale, quindi non servono porting di codice.

---

## Architettura repo

| Repo | Branch | Contiene | Chi la mantiene |
|------|--------|----------|-----------------|
| **app-ordine-avvocati-napoli** (principale) | `main` | Sorgente comune + cartella `android/` | Avv. Roberto Arcella (PC Windows) |
| **app-ordine-avvocati-napoli-ios** (fork) | `ios` | Stesso sorgente + cartella `ios/` | Amico con Mac |

Il **fork iOS** contiene tutto il sorgente della repo principale + la cartella `ios/` generata da Xcode (project file, signing config, asset iOS, ecc.). Quando la repo principale rilascia nuove funzionalità, basta fare `git pull` dal fork per riallineare e ricompilare.

---

## Cosa serve sul Mac

| Componente | Note | Comando d'installazione |
|------------|------|--------------------------|
| **macOS** | Sonoma (14) o Sequoia (15), per supportare Xcode 16 | preinstallato |
| **Xcode** | Gratis su App Store, ~15 GB | `mas install 497799835` (con `mas` CLI) o da App Store |
| **Apple ID** | Per "personal team" (gratis, 7 giorni di firma) | già presente |
| **Apple Developer Program** ($99/anno) | Necessario per **TestFlight** e App Store. Senza, l'app si installa solo sull'iPhone dell'amico via cavo per 7 giorni alla volta | iscrizione su <https://developer.apple.com/programs/> |
| **Homebrew** | Gestore pacchetti macOS | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| **Node.js 20+** | Build delle web assets | `brew install node` |
| **CocoaPods** | Gestore dipendenze iOS (richiesto da Capacitor) | `sudo gem install cocoapods` |
| **Git** | preinstallato su macOS |  |

---

## Setup del fork iOS

Da fare **una sola volta**, dall'amico Mac.

### 1. Creazione del fork su GitHub

1. Andare su <https://github.com/robertoarcella-bot/app-ordine-avvocati-napoli>
2. Cliccare **"Fork"** in alto a destra
3. Nominare il fork `app-ordine-avvocati-napoli-ios`
4. (Opzionale) Spuntare "Copy the `main` branch only"

### 2. Clonazione locale e setup

```bash
# Clona il fork (sostituisce <suoutente> col proprio username GitHub)
git clone https://github.com/<suoutente>/app-ordine-avvocati-napoli-ios.git
cd app-ordine-avvocati-napoli-ios

# Aggiunge il remote upstream per sincronizzare con la repo principale
git remote add upstream https://github.com/robertoarcella-bot/app-ordine-avvocati-napoli.git
git fetch upstream

# Crea il branch ios dedicato
git checkout -b ios

# Installa le dipendenze JavaScript
npm install

# Installa CocoaPods (se non già fatto a livello globale)
sudo gem install cocoapods
```

### 3. Generazione cartella iOS

```bash
# Aggiunge la piattaforma iOS al progetto Capacitor
npx cap add ios

# Genera icone e splash screen iOS dall'immagine sorgente
npx capacitor-assets generate --ios --splashBackgroundColor "#FDF9F5"

# Build delle web assets + sync con il progetto iOS
npm run build:web
npx cap sync ios
```

A questo punto esiste la cartella `ios/`.

### 4. Primo commit del progetto iOS

```bash
# Verifica che .gitignore non escluda la cartella ios (deve essere committata sul fork)
# (sulla repo principale Android è irrilevante, sul fork iOS è essenziale)
cat .gitignore | grep -i ios   # se serve, rimuovere eventuali esclusioni di /ios

git add -A
git commit -m "Aggiunta piattaforma iOS — cartella ios/ generata da Capacitor"
git push -u origin ios
```

Da questo punto in poi, ogni volta che vuoi rilasciare una nuova versione iOS basta fare i passi della sezione [Aggiornamento da repo principale](#aggiornamento-da-repo-principale).

---

## Configurazione in Xcode

Aprire il progetto:

```bash
npx cap open ios
```

Xcode si apre con `App.xcworkspace`. Da fare **una sola volta** per ogni Mac:

1. Sidebar sinistra → seleziona il progetto **App** (l'icona blu)
2. Tab **Signing & Capabilities**
3. **Team**: scegli il proprio Apple ID (o l'organizzazione del Developer Program)
4. **Bundle Identifier**: già impostato a `it.ordineavvocatinapoli.app`. Se Apple lo segnala come "Already used", cambialo aggiungendo un suffisso (es. `it.ordineavvocatinapoli.app.beta` o le proprie iniziali)
5. Lascia Xcode risolvere automaticamente eventuali problemi di firma ("Automatically manage signing" attivo)

### Build su iPhone fisico (test rapido)

1. Connetti l'iPhone al Mac via cavo USB
2. Sblocca l'iPhone, conferma "Fidati di questo computer"
3. In alto in Xcode, accanto al pulsante **▶ Run**, seleziona il proprio iPhone come target
4. Premi **▶ Run** (o `Cmd + R`)
5. Xcode compila, firma e installa l'app sul telefono

> ⚠️ Con Apple ID gratis (Personal Team), l'app resta installata e funzionante per **7 giorni**, poi va re-firmata. Con Apple Developer Program ($99/anno) la firma dura **1 anno**.

### Build per distribuzione (TestFlight / App Store)

1. In alto in Xcode → **Product → Archive**
2. Aspetta il build (qualche minuto). Si apre la finestra **Organizer**
3. Seleziona l'archive appena creato → **Distribute App** → **App Store Connect** → **Upload**
4. Xcode firma l'archivio col certificato di distribuzione e lo invia ad Apple
5. Vai su <https://appstoreconnect.apple.com>:
   - **TestFlight**: dopo qualche minuto vedi la build disponibile per i tester. Aggiungi gli email degli iscritti.
   - **App Store**: compila la scheda app (descrizione, screenshot, classificazione) e invia per la review (1-3 giorni).

---

## Aggiornamento da repo principale

Quando la repo principale rilascia nuove funzionalità (nuove pagine, nuove news, fix), per riallineare il fork iOS:

```bash
cd app-ordine-avvocati-napoli-ios

# Scarica i nuovi commit dalla repo principale
git fetch upstream

# Merge sul branch ios (potrebbero esserci conflitti su capacitor.config.ts — risolvi)
git merge upstream/main

# Re-installa eventuali nuovi pacchetti npm
npm install

# Rebuild web assets + sync
npm run build:web
npx cap sync ios

# Apri Xcode per build/release
npx cap open ios
```

Pubblica le nuove modifiche specifiche iOS:

```bash
git push origin ios
```

---

## Note specifiche per questa app

### Plugin nativi (tutti supportati su iOS)

- `@capacitor/app` — eventi app foreground/background ✅
- `@capacitor/browser` — apre URL in **SafariViewController** (equivalente iOS dei Custom Tabs Android) ✅
- `@capacitor/filesystem` — file storage ✅
- `@capacitor/preferences` — chiavi/valore (UserDefaults) ✅
- `@capacitor/share` — share sheet iOS ✅
- `@capacitor/network` — stato rete ✅
- `@capacitor/splash-screen` — launch screen ✅
- `@capacitor/status-bar` — colore status bar ✅
- `@capacitor/haptics` — vibrazione tattile ✅
- `@capacitor/keyboard` — eventi tastiera ✅
- `@capacitor/local-notifications` — notifiche locali ✅
- `@capacitor/background-runner` — background fetch ⚠️ usa `BGTaskScheduler` di iOS che è **molto più restrittivo** di Android: tipicamente esegue 1-3 volte al giorno e solo se il sistema lo decide opportuno. È una limitazione Apple non aggirabile.

### File NON necessari su iOS

`MainActivity.java` (cookie WebView Android, splash native) è specifico Android — su iOS l'equivalente è `AppDelegate.swift` ma non serve modificarlo: i cookie nel `WKWebView` di iOS funzionano già come ci aspettiamo, e la maggior parte delle configurazioni Capacitor passa via `capacitor.config.ts` (file condiviso).

### File specifici iOS che il fork conterrà

```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist           ← qui Bundle ID, permessi, capabilities
│   │   ├── Assets.xcassets/     ← icone e splash generate
│   │   └── ...
│   ├── App.xcodeproj/
│   ├── App.xcworkspace/         ← APRIRE QUESTO con Xcode (NON .xcodeproj)
│   └── Podfile                  ← dipendenze CocoaPods
└── ...
```

### Bundle ID e App ID Apple

Il `Bundle Identifier` è `it.ordineavvocatinapoli.app`. Se l'amico vuole pubblicare con il proprio account, è probabile che debba creare l'App ID corrispondente sul portale developer Apple oppure cambiarlo. Per evitare conflitti, una convenzione è:

- **Sviluppo personale**: `it.ordineavvocatinapoli.app.dev` (firma Apple ID gratis)
- **Distribuzione TestFlight/App Store**: `it.ordineavvocatinapoli.app` (richiede App ID registrato sotto un Apple Developer Program)

Va modificato in **Xcode → Signing & Capabilities → Bundle Identifier** e sincronizzato in `capacitor.config.ts` se serve.

---

## Costi e tempi

| Attività | Costo | Tempo |
|---------|-------|-------|
| Setup iniziale (clone + npm install + cap add ios + Xcode signing) | 0 € | ~30 min |
| Build di test su iPhone fisico (Apple ID gratis) | 0 € | 5 min/build, dura 7 giorni |
| Apple Developer Program | 99 € / anno | iscrizione 1-2 giorni |
| TestFlight (beta a 100 tester) | incluso nei 99 €/anno | upload 5 min, review 24-48h |
| Pubblicazione App Store | incluso nei 99 €/anno | review Apple 1-3 giorni |

---

## Risoluzione problemi frequenti

### `pod install` fallisce
- Aggiornare CocoaPods: `sudo gem install cocoapods`
- Da `ios/App/`: `pod repo update && pod install`

### "No signing certificate found"
- Settings di Xcode → Accounts → aggiungi Apple ID → "Manage Certificates" → crea un Developer Certificate

### Build OK ma app crash all'avvio sull'iPhone
- Verifica in `Info.plist` che siano impostate le `usage descriptions` per i permessi che usiamo. Capacitor le aggiunge in automatico ma se uno è mancante l'app crasha. Quelle minime per la nostra app:
  - `NSUserNotificationsUsageDescription` (notifiche locali)
  - `NSAppTransportSecurity` (per https su domini self-signed eventualmente)

### "App not for sale in this region" dopo upload TestFlight
- App Store Connect → l'app → **Pricing and Availability** → seleziona Italia (e altri paesi)

---

## Riferimenti

- Capacitor iOS docs: <https://capacitorjs.com/docs/ios>
- Apple Developer Program: <https://developer.apple.com/programs/>
- TestFlight: <https://developer.apple.com/testflight/>
- App Store Connect: <https://appstoreconnect.apple.com>

---

*Documento mantenuto su repo principale (`app-ordine-avvocati-napoli`) in `app-coa/docs/BUILD_iOS.md`. Aggiornare questo file ad ogni modifica al processo di build iOS.*
