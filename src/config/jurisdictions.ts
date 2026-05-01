/**
 * Tassonomia condivisa per organizzare strumenti, mini-webapp e fonti
 * di news per area di competenza professionale.
 * Usata sia da `config/miniapps.ts` sia da `config/sources.ts`.
 */

export type Jurisdiction =
  | 'sedi'
  | 'comuni'
  | 'civile'
  | 'penale'
  | 'amministrativo'
  | 'tributario';

export interface JurisdictionMeta {
  id: Jurisdiction;
  label: string;
  /** Ordine di visualizzazione (più basso = prima) */
  order: number;
  /** Etichetta breve, opzionale, per chip / pill */
  short?: string;
}

export const JURISDICTIONS: Record<Jurisdiction, JurisdictionMeta> = {
  sedi:           { id: 'sedi',           label: 'Sedi e dislocazione uffici', short: 'Sedi',          order: -1 },
  comuni:         { id: 'comuni',         label: 'Comuni a tutti gli avvocati', short: 'Comuni',       order: 0 },
  civile:         { id: 'civile',         label: 'Civile',                                             order: 1 },
  penale:         { id: 'penale',         label: 'Penale',                                             order: 2 },
  amministrativo: { id: 'amministrativo', label: 'Amministrativo',                                     order: 3 },
  tributario:     { id: 'tributario',     label: 'Tributario',                                         order: 4 },
};

/**
 * Raggruppa una lista di item per giurisdizione, restituendo
 * un array ordinato di gruppi (saltando le giurisdizioni vuote).
 */
export function groupByJurisdiction<T extends { jurisdiction: Jurisdiction }>(
  items: T[]
): Array<{ meta: JurisdictionMeta; items: T[] }> {
  const groups: Partial<Record<Jurisdiction, T[]>> = {};
  for (const it of items) {
    (groups[it.jurisdiction] ||= []).push(it);
  }
  return (Object.keys(JURISDICTIONS) as Jurisdiction[])
    .filter(k => (groups[k]?.length ?? 0) > 0)
    .sort((a, b) => JURISDICTIONS[a].order - JURISDICTIONS[b].order)
    .map(k => ({ meta: JURISDICTIONS[k], items: groups[k]! }));
}
