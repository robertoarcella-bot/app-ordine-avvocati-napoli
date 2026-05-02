import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.ordineavvocatinapoli.app',
  appName: 'Ordine Avvocati Napoli',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#FDF9F5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'FIT_CENTER',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0066CC',
    },
    Keyboard: {
      resize: 'body',
      style: 'LIGHT',
      resizeOnFullScreen: true,
    },
    /**
     * Fa passare le chiamate fetch/XHR attraverso il bridge nativo,
     * bypassando i limiti CORS del WebView. Indispensabile per fare
     * scraping di siti come pst.giustizia.it che non espongono API.
     */
    CapacitorHttp: {
      enabled: true,
    },
    /**
     * Background Runner: esegue il file JS specificato in background a
     * intervalli (Android decide il timing in base alle policy di
     * risparmio batteria, di solito ogni 15+ min). Il runner controlla
     * se ci sono nuove news PST e schedula una LocalNotification.
     */
    BackgroundRunner: {
      label: 'pst-news-watcher',
      src: 'background-pst.js',
      event: 'checkPstNews',
      repeat: true,
      interval: 60,            // ogni 60 minuti (in pratica >= 15 min)
      autoStart: true,
    },
  },
};

export default config;
