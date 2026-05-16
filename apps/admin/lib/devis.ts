'use client';

import { useEffect } from 'react';
import type { Database } from '@avenir/db';
import { useAuth } from './auth';
import type { CalcSlug } from './default-params';
import { createTableStore } from './table-store';

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

type DevisRow = Database['public']['Tables']['devis']['Row'];

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
// MAPPERS Row ↔ Devis
// ============================================================

/** Champs « plats » du devis qui sont stockés en colonnes dédiées dans la table. */
const FLAT_FIELDS = [
  'id',
  'numero',
  'client_id',
  'prix_ht',
  'prix_ttc',
  'statut',
  'date_creation',
] as const;

function rowToDevis(row: DevisRow): Devis {
  const data = (row.data as Record<string, unknown>) ?? {};
  return {
    id: row.id,
    numero: row.numero,
    client_id: row.client_id ?? '',
    prix_ht: row.prix_ht,
    prix_ttc: row.prix_ttc,
    statut: row.statut as DevisStatut,
    date_creation: new Date(row.date_creation).getTime(),
    // Le reste est dans data jsonb
    calculateur: data.calculateur as CalcSlug,
    input: data.input,
    result: data.result,
    recap: data.recap as string | undefined,
    quantite: (data.quantite as number) ?? 1,
    date_envoi: data.date_envoi as number | undefined,
    date_validite: data.date_validite as number | undefined,
    notes: data.notes as string | undefined,
    prix_ht_override: data.prix_ht_override as number | undefined,
    remise_manuelle_pct: data.remise_manuelle_pct as number | undefined,
  };
}

function devisToInsertRow(d: Devis): Record<string, unknown> {
  const {
    id,
    numero,
    client_id,
    prix_ht,
    prix_ttc,
    statut,
    date_creation,
    ...rest
  } = d;
  return {
    id,
    numero,
    client_id: client_id || null,
    prix_ht,
    prix_ttc,
    statut,
    date_creation: new Date(date_creation).toISOString(),
    data: rest as unknown,
  };
}

function devisChangesToUpdateRow(
  changes: Partial<Devis>,
  current: Devis
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  // Champs plats : copie directe avec conversion si besoin
  if (changes.numero !== undefined) out.numero = changes.numero;
  if (changes.client_id !== undefined) out.client_id = changes.client_id || null;
  if (changes.prix_ht !== undefined) out.prix_ht = changes.prix_ht;
  if (changes.prix_ttc !== undefined) out.prix_ttc = changes.prix_ttc;
  if (changes.statut !== undefined) out.statut = changes.statut;
  if (changes.date_creation !== undefined) {
    out.date_creation = new Date(changes.date_creation).toISOString();
  }
  // Si un seul champ non-plat change → recompose le data jsonb complet
  const flatKeys = new Set<string>(FLAT_FIELDS);
  const dataChanges: Record<string, unknown> = {};
  let hasDataChange = false;
  for (const [k, v] of Object.entries(changes)) {
    if (!flatKeys.has(k)) {
      dataChanges[k] = v;
      hasDataChange = true;
    }
  }
  if (hasDataChange) {
    const { id, numero, client_id, prix_ht, prix_ttc, statut, date_creation, ...currentData } =
      current;
    out.data = { ...currentData, ...dataChanges };
  }
  return out;
}

// ============================================================
// STORE
// ============================================================

const devisStore = createTableStore<Devis, DevisRow>({
  table: 'devis',
  rowToEntity: rowToDevis,
  entityToInsertRow: devisToInsertRow,
  changesToUpdateRow: devisChangesToUpdateRow,
});

/** Permet à `migration.ts` (ou autre) de déclencher un re-fetch. */
export const devisStoreRefresh = devisStore.refresh;

// ============================================================
// HOOK
// ============================================================

export function useDevis() {
  const { user } = useAuth();
  const state = devisStore.useStore();

  // Charge depuis Supabase au montage + quand user change
  useEffect(() => {
    devisStore.ensureLoadedFor(user);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addDevis = (devis: Devis) => devisStore.addItem(devis);
  const updateDevis = (id: string, changes: Partial<Devis>) =>
    devisStore.updateItem(id, changes);
  const deleteDevis = (id: string) => devisStore.deleteItem(id);

  const getDevis = (id: string): Devis | undefined =>
    state.items.find((d) => d.id === id);

  const devisForClient = (clientId: string): Devis[] =>
    state.items.filter((d) => d.client_id === clientId);

  const nextNumero = () => generateDevisNumero(state.items);

  return {
    devis: state.items,
    addDevis,
    updateDevis,
    deleteDevis,
    getDevis,
    devisForClient,
    nextNumero,
    /** @deprecated — purge locale uniquement, ne supprime pas dans Supabase. Pour purge réelle, utilise le SQL editor. */
    resetAll: devisStore.reset,
    hydrated: state.hydrated,
    /** Force un re-fetch depuis Supabase. */
    refresh: () => devisStore.refresh(user),
  };
}
