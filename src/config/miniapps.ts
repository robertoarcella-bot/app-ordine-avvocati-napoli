/**
 * Registry delle mini-webapp HTML autoportate.
 *
 * Ogni mini-webapp è un singolo file .html (con CSS e JS inline o referenziati)
 * collocato in `public/miniapps/`. Per aggiungerne una nuova:
 *   1. Copia il file html in `public/miniapps/<id>.html`
 *   2. Aggiungi una entry qui sotto
 *   3. Ricompila l'app
 *
 * In una versione futura questo registry può essere caricato da remoto
 * (JSON pubblicato dal COA), così nuove mini-app si aggiungono senza
 * ridistribuire l'APK.
 */

export interface MiniApp {
  id: string;
  title: string;
  subtitle: string;
  /** Path relativo al webDir, es. 'miniapps/calcolatore-ferie.html' */
  file: string;
  /** Nome icona ionicons */
  icon: string;
  /** Categoria per raggruppamento */
  category?: string;
}

export const MINIAPPS: MiniApp[] = [
  {
    id: 'esempio',
    title: 'Mini-app di esempio',
    subtitle: 'Template di partenza per nuove mini-app',
    file: 'miniapps/esempio.html',
    icon: 'sparkles-outline',
    category: 'Esempi',
  },
];
