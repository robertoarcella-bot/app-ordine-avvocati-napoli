import { readFileSync, cpSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version: string };

/**
 * Copia public/ in dist/ escludendo i desktop.ini che Google Drive per
 * desktop crea in ogni cartella: Drive non consente ad altre applicazioni
 * di scriverli, per cui la copia standard di Vite fallisce (ENOENT), e
 * comunque non devono finire nell'APK.
 */
const copyPublicSenzaDesktopIni = (): Plugin => ({
  name: 'copy-public-senza-desktop-ini',
  apply: 'build',
  closeBundle() {
    const root = fileURLToPath(new URL('.', import.meta.url));
    cpSync(resolve(root, 'public'), resolve(root, 'dist'), {
      recursive: true,
      filter: (src) => basename(src).toLowerCase() !== 'desktop.ini',
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyPublicSenzaDesktopIni()],
  build: {
    copyPublicDir: false, // vedi copyPublicSenzaDesktopIni
  },
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
