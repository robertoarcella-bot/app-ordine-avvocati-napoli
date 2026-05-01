import type { Jurisdiction } from './jurisdictions';

export interface MiniApp {
  id: string;
  title: string;
  subtitle: string;
  /** Path relativo al webDir, es. 'miniapps/at/Calcolo_Interessi.html' */
  file: string;
  /** Nome icona ionicons */
  icon: string;
  /** Giurisdizione di competenza */
  jurisdiction: Jurisdiction;
  /**
   * true se l'app non ha dipendenze CDN esterne e funziona completamente offline.
   * false se carica risorse esterne (font, librerie) e potrebbe richiedere internet
   * almeno alla prima apertura (poi vanno in cache del WebView).
   */
  offlineReady: boolean;
  /** Autore originale, se diverso dall'app COA */
  author?: string;
  /** Sito di origine, se applicabile */
  origin?: string;
}

const AT_BASE = 'miniapps/at/';
const AT_AUTHOR = 'Avv. Roberto Arcella';
const AT_ORIGIN = 'avvocatotelematico.studiolegalearcella.it';

/**
 * Le app da `avvocatotelematico.studiolegalearcella.it` (Avv. Roberto Arcella)
 * sono incluse nel bundle dell'APK e funzionano in larga parte offline.
 */
export const MINIAPPS: MiniApp[] = [
  // ============ COMUNI ============
  {
    id: 'parametri-forensi',
    title: 'Parametri Forensi (D.M. 147/2022)',
    subtitle: 'Calcolatore parcelle forensi secondo i parametri ministeriali',
    file: AT_BASE + 'Calcolatore_parcelle_avvocati.html',
    icon: 'cash-outline',
    jurisdiction: 'comuni',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'fattura-avvocato',
    title: 'Calcolo Fattura Avvocato',
    subtitle: 'Calcolo fattura con CPA, IVA, ritenuta',
    file: AT_BASE + 'Calcolo_fattura_Avvocati.html',
    icon: 'receipt-outline',
    jurisdiction: 'comuni',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'preventivo-avvocato',
    title: 'Preventivo professionale',
    subtitle: 'Generatore di preventivi per avvocati',
    file: AT_BASE + 'Preventivo_Avvocati.html',
    icon: 'document-text-outline',
    jurisdiction: 'comuni',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'cu-civ-trib-amm',
    title: 'Contributo Unificato (Civ/Trib/Amm)',
    subtitle: 'Calcolo contributo unificato per processi civili, tributari, amministrativi',
    file: AT_BASE + 'Calcolo_Contributo_Unificato.html',
    icon: 'calculator-outline',
    jurisdiction: 'comuni',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'interessi-legali',
    title: 'Interessi Legali e Moratori',
    subtitle: 'Calcolo interessi (tasso legale, moratori, BCE)',
    file: AT_BASE + 'Calcolo_Interessi.html',
    icon: 'trending-up-outline',
    jurisdiction: 'comuni',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'procura',
    title: 'Procura alle liti',
    subtitle: 'Generatore di procura alle liti',
    file: AT_BASE + 'procura.html',
    icon: 'create-outline',
    jurisdiction: 'comuni',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'anonimizzatore',
    title: 'Anonimizzatore atti',
    subtitle: 'Rimuove dati personali da atti e provvedimenti',
    file: AT_BASE + 'Anonimizzatore.html',
    icon: 'eye-off-outline',
    jurisdiction: 'comuni',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'md-to-pdf',
    title: 'Markdown → PDF',
    subtitle: 'Convertitore da Markdown a PDF (premium edition)',
    file: AT_BASE + 'md_to_pdf.html',
    icon: 'document-attach-outline',
    jurisdiction: 'comuni',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'invoicy-lex',
    title: 'InvoicyLex — Dashboard Fiscale',
    subtitle: 'Dashboard fiscale per professionisti',
    file: AT_BASE + 'InvoicyLex.html',
    icon: 'analytics-outline',
    jurisdiction: 'comuni',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },

  // ============ CIVILE ============
  {
    id: 'termini-cpc-cartabia',
    title: 'Termini c.p.c. (Cartabia)',
    subtitle: 'Calcolo termini processuali civili - rito post-Cartabia',
    file: AT_BASE + 'Calcolatore_termini_cpc.html',
    icon: 'time-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'termini-esecuzioni',
    title: 'Termini Esecuzioni Civili',
    subtitle: 'Calcolo termini per le procedure esecutive civili',
    file: AT_BASE + 'Calcolo_termini_esecuzioni_civili.html',
    icon: 'hourglass-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'danno-tun-2025',
    title: 'Danno alla persona — TUN 2025',
    subtitle: 'Tabella Unica Nazionale (D.P.R. 12/2025)',
    file: AT_BASE + 'Danno_biologico_Tabella_Unica_Nazionale_2025.html',
    icon: 'medkit-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'danno-micropermanenti',
    title: 'Danno Micropermanenti',
    subtitle: 'Calcolo danno biologico micropermanenti (metodo coefficienti)',
    file: AT_BASE + 'Calcolo_Danno_Micropermanenti.html',
    icon: 'pulse-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'cu-famiglia',
    title: 'Contributo Unificato Famiglia',
    subtitle: 'CU per i procedimenti di famiglia',
    file: AT_BASE + 'CU_Famiglia.html',
    icon: 'people-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'piano-genitoriale',
    title: 'Piano Genitoriale',
    subtitle: 'Redazione assistita del piano genitoriale',
    file: AT_BASE + 'Piano_Genitoriale.html',
    icon: 'home-outline',
    jurisdiction: 'civile',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'analizzatore-dm-110',
    title: 'Analizzatore atti D.M. 110/2023',
    subtitle: 'Analisi della sintesi degli atti secondo il decreto Cartabia',
    file: AT_BASE + 'Analizzatore_DM_110_2023.html',
    icon: 'search-outline',
    jurisdiction: 'civile',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'calendario-gdp-na',
    title: 'Calendario GdP Napoli 2026',
    subtitle: 'Calendario delle udienze del Giudice di Pace di Napoli',
    file: AT_BASE + 'Calendario_gdp_napoli_2026.html',
    icon: 'calendar-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'analisi-verbale-rb',
    title: 'Analisi Verbale Ricerca Beni',
    subtitle: 'Analisi del verbale e scelta beni (esecuzioni)',
    file: AT_BASE + 'Analisi_VerbaleRB.html',
    icon: 'list-outline',
    jurisdiction: 'civile',
    offlineReady: false,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'depositi-ccii',
    title: 'Depositi CCII (Crisi d\'impresa)',
    subtitle: 'Selettore atto-ruolo per i depositi nel Codice della Crisi',
    file: AT_BASE + 'Depositi_ccii.html',
    icon: 'briefcase-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'mappa-xsd-pct',
    title: 'Mappa XSD Depositi PCT',
    subtitle: 'Schemi XSD per depositi SICID/SIECIC + CCII',
    file: AT_BASE + 'Mappa_XSD_Depositi_telematici.html',
    icon: 'git-network-outline',
    jurisdiction: 'civile',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },

  // ============ PENALE ============
  {
    id: 'prescrizione-penale',
    title: 'Calcolo Prescrizione Penale',
    subtitle: 'Calcolatore avanzato della prescrizione (revisione 2)',
    file: AT_BASE + 'Calcolo_prescrizione_Penale.html',
    icon: 'alarm-outline',
    jurisdiction: 'penale',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'pss-penale-na',
    title: 'Patrocinio S.S. Penale (Napoli)',
    subtitle: 'Istanza di liquidazione - Protocollo Napoli',
    file: AT_BASE + 'Istanza_liquidazione_PSS_Penale.html',
    icon: 'reader-outline',
    jurisdiction: 'penale',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
  {
    id: 'pec-uffici-ppt',
    title: 'PEC Uffici Giudiziari (PPT)',
    subtitle: 'Ricerca PEC degli uffici giudiziari per depositi PPT',
    file: AT_BASE + 'PEC_Uffici_Giudiziari_depositi_PPT.html',
    icon: 'mail-outline',
    jurisdiction: 'penale',
    offlineReady: true,
    author: AT_AUTHOR,
    origin: AT_ORIGIN,
  },
];
