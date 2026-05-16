'use client';

import type { CalcSlug } from './default-params';
import { useSettings } from './settings';

// ============================================================
// TYPES
// ============================================================

export type DevisStatut = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'archive';

export interface Devis {
  id: string;
  /** Numéro auto-incrémenté de type "DV-2026-0042". */
  numero: string;
  client_id: string;
  calculateur: CalcSlug;
  /** Snapshot des entrées du calcul (typé à l'usage). */
  input: unknown;
  /** Snapshot du résultat du calcul (typé à l'usage). */
  result: unknown;
  /** Snapshot textuel lisible du résultat (récap). */
  recap?: string;
  /** Prix HT final figé au moment du save (pour tri/affichage rapide). */
  prix_ht: number;
  /** Prix TTC final figé. */
  prix_ttc: number;
  /** Quantité figée (extrait du input pour tri). */
  quantite: number;

  statut: DevisStatut;
  date_creation: number;
  date_envoi?: number;
  date_validite?: number;
  notes?: string;

  /** Override manuel du prix HT (si commercial négocie). */
  prix_ht_override?: number;
  /** Remise manuelle supplémentaire en %. */
  remise_manuelle_pct?: number;
}

// ============================================================
// HELPERS
// ============================================================

export const STATUT_LABELS: Record<DevisStatut, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  archive: 'Archivé',
};

export const STATUT_COLORS: Record<DevisStatut, string> = {
  brouillon: 'bg-secondary text-secondary-foreground border border-border',
  envoye: 'bg-primary/15 text-primary border border-primary/30',
  accepte: 'bg-green-100 text-green-800 border border-green-300',
  refuse: 'bg-destructive/15 text-destructive border border-destructive/30',
  archive: 'bg-muted text-muted-foreground border border-border',
};

/** Génère le prochain numéro de devis (ex. "DV-2026-0042"). */
export function generateDevisNumero(existing: Devis[]): string {
  const year = new Date().getFullYear();
  const prefix = `DV-${year}-`;
  const last = existing
    .filter((d) => d.numero.startsWith(prefix))
    .map((d) => parseInt(d.numero.slice(prefix.length), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => b - a)[0];
  const next = (last ?? 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

/** ID Devis. */
export function newDevisId(): string {
  return `devis_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/** Prix HT effectif après override manuel. */
export function effectivePrixHt(devis: Devis): number {
  if (devis.prix_ht_override !== undefined) return devis.prix_ht_override;
  if (devis.remise_manuelle_pct !== undefined && devis.remise_manuelle_pct > 0) {
    return devis.prix_ht * (1 - devis.remise_manuelle_pct / 100);
  }
  return devis.prix_ht;
}

// ============================================================
// HOOK
// ============================================================

export function useDevis() {
  const { value, update, reset, hydrated } = useSettings<Devis[]>('data.devis', []);

  const addDevis = (devis: Devis) => {
    update([devis, ...value]);
  };

  const updateDevis = (id: string, changes: Partial<Devis>) => {
    update(value.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  };

  const deleteDevis = (id: string) => {
    update(value.filter((d) => d.id !== id));
  };

  const getDevis = (id: string): Devis | undefined => value.find((d) => d.id === id);

  const devisForClient = (clientId: string): Devis[] =>
    value.filter((d) => d.client_id === clientId);

  const nextNumero = () => generateDevisNumero(value);

  return {
    devis: value,
    addDevis,
    updateDevis,
    deleteDevis,
    getDevis,
    devisForClient,
    nextNumero,
    resetAll: reset,
    hydrated,
  };
}
