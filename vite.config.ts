import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version: string };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    /** Unica fonte della versione mostrata in app: package.json */
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
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
      '/proxy/tnna': {
        target: 'https://tribunale-napoli.giustizia.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/tnna/, ''),
        secure: true,
      },
      '/proxy/cana': {
        target: 'https://ca-napoli.giustizia.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/cana/, ''),
        secure: true,
      },
      '/proxy/pst': {
        target: 'https://pst.giustizia.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/pst/, ''),
        secure: true,
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
