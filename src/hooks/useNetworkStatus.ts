import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

/**
 * Stato di connettività del dispositivo, reattivo ai cambi di rete.
 * Su web usa l'implementazione browser del plugin (navigator.onLine).
 * Parte da `true` per non mostrare avvisi spuri prima della prima lettura.
 */
export function useNetworkStatus(): boolean {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let alive = true;
    void Network.getStatus().then(s => {
      if (alive) setConnected(s.connected);
    }).catch(() => { /* plugin non disponibile: resta "connesso" */ });

    const sub = Network.addListener('networkStatusChange', s => {
      setConnected(s.connected);
    });

    return () => {
      alive = false;
      void sub.then(h => h.remove()).catch(() => { /* noop */ });
    };
  }, []);

  return connected;
}
