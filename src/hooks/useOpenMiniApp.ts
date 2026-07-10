import { useIonToast } from '@ionic/react';
import { useHistory } from 'react-router';
import type { MiniApp } from '../config/miniapps';
import { openExternal } from '../services/download';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Handler condiviso per l'apertura di una miniapp (usato da Strumenti,
 * Processo Telematico e Dislocazione Aule):
 *  - `externalUrl` → app/browser esterno;
 *  - `webviewUrl`  → WebView interna (SitoView);
 *  - `file`        → pagina MiniAppView (iframe del bundle).
 *
 * Se il dispositivo è offline, blocca (con avviso) gli strumenti che non
 * possono funzionare senza rete e avverte per quelli inclusi nel bundle
 * ma non completamente offline.
 */
export function useOpenMiniApp(): (app: MiniApp) => void {
  const history = useHistory();
  const connected = useNetworkStatus();
  const [presentToast] = useIonToast();

  return (app: MiniApp) => {
    if (!connected) {
      if (app.externalUrl || app.webviewUrl) {
        void presentToast({
          message: `«${app.title}» richiede una connessione internet.`,
          duration: 2500,
          color: 'warning',
          position: 'bottom',
        });
        return;
      }
      if (!app.offlineReady) {
        // Il contenuto è nel bundle: apriamo comunque, ma avvisiamo che
        // le funzioni che scaricano dati potrebbero non essere disponibili.
        void presentToast({
          message: 'Sei offline: alcune funzioni di questo strumento potrebbero non essere disponibili.',
          duration: 2500,
          color: 'warning',
          position: 'bottom',
        });
      }
    }

    if (app.externalUrl) {
      void openExternal(app.externalUrl);
    } else if (app.webviewUrl) {
      const u = encodeURIComponent(app.webviewUrl);
      const t = encodeURIComponent(app.title);
      history.push(`/sito/view?u=${u}&t=${t}`);
    } else {
      history.push(`/miniapps/${app.id}`);
    }
  };
}
