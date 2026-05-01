import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    /**
     * Proxy per dev mode (browser). In produzione (Capacitor)
     * le richieste vanno via CapacitorHttp e non passano da qui.
     */
    proxy: {
      '/proxy/coa': {
        target: 'https://www.ordineavvocatinapoli.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/coa/, ''),
        secure: true,
      },
      '/proxy/pst': {
        target: 'https://pst.giustizia.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/pst/, ''),
        secure: true,
      },
      '/proxy/ga': {
        target: 'https://www.giustizia-amministrativa.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/ga/, ''),
        secure: false,
      },
      '/proxy/gt': {
        target: 'https://www.dgt.mef.gov.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gt/, ''),
        secure: true,
      },
    },
  },
});
