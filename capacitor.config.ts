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
      androidScaleType: 'CENTER_INSIDE',
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
  },
};

export default config;
