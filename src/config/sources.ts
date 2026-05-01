/**
 * Registry delle fonti esterne di news per la sezione "Processo Telematico".
 *
 * Ogni fonte è un sito istituzionale di cui scrapiamo (o consumiamo via API)
 * la lista news e mostriamo nativamente. Per aggiungerne una nuova:
 *   1. Implementa un fetcher in `src/services/sources/<id>.ts` che esponga
 *      `fetchNews(page?: number): Promise<SourceNewsItem[]>`
 *   2. Aggiungi qui sotto una entry con id, label, descrizione, icona, fetcher
 *
 * Domani: PPT-only, Cassazione telematica, Portale Procedure Concorsuali, ecc.
 */

import { fetchPstNews } from '../services/sources/pst';
import { fetchGiustiziaAmministrativaNews } from '../services/sources/giustizia-amministrativa';
import { fetchGiustiziaTributariaNews } from '../services/sources/giustizia-tributaria';
import type { Jurisdiction } from './jurisdictions';

export interface SourceNewsItem {
  id: string;          // identificatore univoco (es. "pst:NWS4803")
  sourceId: string;    // id della fonte (es. "pst")
  title: string;
  date?: string;       // ISO 8601 se possibile, altrimenti stringa raw
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  link: string;        // URL assoluto al dettaglio
}

export interface Source {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;        // ionicons name
  baseUrl: string;
  jurisdiction: Jurisdiction;
  /** Funzione che recupera la lista news della fonte */
  fetchNews: (page?: number) => Promise<SourceNewsItem[]>;
}

export const SOURCES: Source[] = [
  {
    id: 'pst',
    label: 'Portale Servizi Telematici (Min. Giustizia)',
    shortLabel: 'PST — Min. Giustizia',
    description: 'Avvisi ufficiali su PCT, PPT, malfunzionamenti e aggiornamenti dei sistemi telematici della giustizia (ordinari e penali)',
    icon: 'shield-half-outline',
    baseUrl: 'https://pst.giustizia.it/PST/',
    jurisdiction: 'comuni',
    fetchNews: fetchPstNews,
  },
  {
    id: 'ga',
    label: 'Giustizia Amministrativa (Consiglio di Stato e TAR)',
    shortLabel: 'Giustizia Amministrativa',
    description: 'News e segnalazioni di pronunce del Consiglio di Stato e dei TAR pubblicate su giustizia-amministrativa.it',
    icon: 'business-outline',
    baseUrl: 'https://www.giustizia-amministrativa.it/news',
    jurisdiction: 'amministrativo',
    fetchNews: fetchGiustiziaAmministrativaNews,
  },
  {
    id: 'gt',
    label: 'Dipartimento Giustizia Tributaria (MEF)',
    shortLabel: 'Giustizia Tributaria',
    description: 'Avvisi, rassegne sentenze, statistiche e novità del processo tributario telematico (feed RSS ufficiale)',
    icon: 'wallet-outline',
    baseUrl: 'https://www.dgt.mef.gov.it/gt/',
    jurisdiction: 'tributario',
    fetchNews: fetchGiustiziaTributariaNews,
  },
];

export const getSource = (id: string): Source | undefined =>
  SOURCES.find(s => s.id === id);
