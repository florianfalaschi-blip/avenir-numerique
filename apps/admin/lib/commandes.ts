'use client';

import { useEffect } from 'react';
import type { Database } from '@avenir/db';
import { useAuth } from './auth';
import type { CalcSlug } from './default-params';
import { createTableStore } from './table-store';

// ============================================================
// TYPES
// ============================================================

export type CommandeStatut =
  | 'en_preparation'
  | 'bat_attente'
  | 'en_production'
  | 'finitions'
  | 'expedie'
  | 'livre'
  | 'annule';

export type EtapeStatut = 'todo' | 'en_cours' | 'done';

export interface EtapeProduction {
  id: string;
  nom: string;
  ordre: number;
  statut: EtapeStatut;
  date_done?: number;
  /** Opérateur assigné (texte libre). */
  operateur?: string;
  notes?: string;
}

export interface Commande {
  id: string;
  /** Numéro auto-incrémenté de type "CMD-2026-0042". */
  numero: string;
  /** ID du devis source (référence). */
  devis_id: string;
  /** Numéro de devis source (snapshot, pour affichage rapide). */
  devis_numero: string;
  client_id: string;
  calculateur: CalcSlug;

  date_creation: number;
  date_livraison_prevue?: number;
  date_livraison_reelle?: number;

  statut: CommandeStatut;
  etapes: EtapeProduction[];

  notes_production?: string;
  /** Numéro de suivi transporteur (si expédié). */
  numero_suivi?: string;
  transporteur?: string;

  /** Snapshot du devis au moment de la conversion (price + qty + recap). */
  snapshot_prix_ht: number;
  snapshot_prix_ttc: number;
  snapshot_quantite: number;
  snapshot_recap?: string;
}

type CommandeRow = Database['public']['Tables']['commandes']['Row'];

// ============================================================
// HELPERS
// ============================================================

export const STATUT_LABELS: Record<CommandeStatut, string> = {
  en_preparation: 'En préparation',
  bat_attente: 'En attente BAT',
  en_production: 'En production',
  finitions: 'Finitions',
  expedie: 'Expédié',
  livre: 'Livré',
  annule: 'Annulé',
};

export const STATUT_COLORS: Record<CommandeStatut, string> = {
  en_preparation: 'bg-secondary text-secondary-foreground border border-border',
  bat_attente: 'bg-warning/15 text-warning border border-warning/30',
  en_production: 'bg-primary/15 text-primary border border-primary/30',
  finitions: 'bg-primary/15 text-primary border border-primary/30',
  expedie: 'bg-accent/15 text-accent border border-accent/30',
  livre: 'bg-green-100 text-green-800 border border-green-300',
  annule: 'bg-destructive/15 text-destructive border border-destructive/30',
};

export const ETAPE_LABELS: Record<EtapeStatut, string> = {
  todo: 'À faire',
  en_cours: 'En cours',
  done: 'Terminée',
};

/** Génère le prochain numéro de commande (ex. "CMD-2026-0042"). */
export function generateCommandeNumero(existing: Commande[]): string {
  const year = new Date().getFullYear();
  const prefix = `CMD-${year}-`;
  const last = existing
    .filter((c) => c.numero.startsWith(prefix))
    .map((c) => parseInt(c.numero.slice(prefix.length), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => b - a)[0];
  const next = (last ?? 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export function newCommandeId(): string {
  return `commande_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function newEtapeId(): string {
  return `etape_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Workflow d'étapes de production par défaut selon le calculateur.
 * Source : docs/WORKFLOWS.md section 4 (variations par produit).
 * Phase 3b : ces workflows seront stockables/modifiables côté admin.
 */
export function defaultEtapesFor(calculateur: CalcSlug): Omit<EtapeProduction, 'id'>[] {
  const base: Record<CalcSlug, string[]> = {
    rollup: [
      'Réception fichier client',
      'Préparation BAT électronique',
      'Validation BAT (client + interne)',
      'Impression Epson solvant',
      'Assemblage structure',
      'Conditionnement (sac + scratchs)',
      'Préparation expédition',
      'Expédition / retrait',
    ],
    plaques: [
      'Réception fichier client + BAT',
      'Validation BAT',
      'Impression Mutoh UV LED',
      'Découpe Zund',
      'Pose finitions (œillets, supports, vernis…)',
      'Conditionnement',
      'Expédition',
    ],
    flyers: [
      'Réception fichier client + BAT',
      'Validation BAT',
      'Impression (offset ou numérique)',
      'Massicotage (coupe au format)',
      'Finitions (pelliculage, vernis, dorure…)',
      'Conditionnement',
      'Expédition',
    ],
    bobines: [
      'Réception fichier client + BAT',
      'Validation BAT',
      'Impression solvant / éco-solvant',
      'Découpe Zund / Summa',
      'Conditionnement (planches à plat ou rouleau applicateur)',
      'Expédition',
    ],
    brochures: [
      'Réception fichier client + BAT',
      'Validation BAT',
      'Impression intérieur (offset ou numérique)',
      'Impression couverture',
      'Massicotage feuilles',
      'Pliage (si nécessaire)',
      'Reliure (agrafage / dos carré / spirale / wire-o)',
      'Finitions couverture (pelliculage, vernis…)',
      'Massicotage final brochure',
      'Conditionnement',
      'Expédition',
    ],
  };
  return (base[calculateur] ?? []).map((nom, i) => ({
    nom,
    ordre: i,
    statut: 'todo' as EtapeStatut,
  }));
}

/** Construit les étapes complètes (avec IDs) pour un nouveau workflow. */
export function buildEtapesFor(calculateur: CalcSlug): EtapeProduction[] {
  return defaultEtapesFor(calculateur).map((e, i) => ({
    ...e,
    id: `etape_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
  }));
}

/** Compte les étapes done / total. */
export function etapesProgress(c: Commande): { done: number; total: number; pct: number } {
  const total = c.etapes.length;
  const done = c.etapes.filter((e) => e.statut === 'done').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

// ============================================================
// MAPPERS Row ↔ Commande
// ============================================================

/** Convertit un timestamp ms vers une string ISO (ou null si undefined). */
function dateToIso(n: number | undefined): string | null {
  return n === undefined ? null : new Date(n).toISOString();
}

/** Convertit une string ISO vers un timestamp ms (ou undefined si null). */
function isoToDate(s: string | null): number | undefined {
  return s === null ? undefined : new Date(s).getTime();
}

/** Champs « plats » de la commande qui sont stockés en colonnes dédiées dans la table. */
const FLAT_FIELDS = [
  'id',
  'numero',
  'devis_id',
  'client_id',
  'snapshot_prix_ht',
  'statut',
  'date_creation',
  'date_livraison_prevue',
] as const;

function rowToCommande(row: CommandeRow): Commande {
  const data = (row.data as Record<string, unknown>) ?? {};
  return {
    id: row.id,
    numero: row.numero,
    devis_id: row.devis_id ?? '',
    client_id: row.client_id ?? '',
    snapshot_prix_ht: row.prix_ht,
    statut: row.statut as CommandeStatut,
    date_creation: new Date(row.date_creation).getTime(),
    date_livraison_prevue: isoToDate(row.date_livraison_prevue),
    // Le reste est dans data jsonb
    devis_numero: (data.devis_numero as string) ?? '',
    calculateur: data.calculateur as CalcSlug,
    date_livraison_reelle: data.date_livraison_reelle as number | undefined,
    etapes: (data.etapes as EtapeProduction[]) ?? [],
    notes_production: data.notes_production as string | undefined,
    numero_suivi: data.numero_suivi as string | undefined,
    transporteur: data.transporteur as string | undefined,
    snapshot_prix_ttc: (data.snapshot_prix_ttc as number) ?? 0,
    snapshot_quantite: (data.snapshot_quantite as number) ?? 1,
    snapshot_recap: data.snapshot_recap as string | undefined,
  };
}

function commandeToInsertRow(c: Commande): Record<string, unknown> {
  const {
    id,
    numero,
    devis_id,
    client_id,
    snapshot_prix_ht,
    statut,
    date_creation,
    date_livraison_prevue,
    ...rest
  } = c;
  return {
    id,
    numero,
    devis_id: devis_id || null,
    client_id: client_id || null,
    prix_ht: snapshot_prix_ht,
    statut,
    date_creation: new Date(date_creation).toISOString(),
    date_livraison_prevue: dateToIso(date_livraison_prevue),
    data: rest as unknown,
  };
}

function commandeChangesToUpdateRow(
  changes: Partial<Commande>,
  current: Commande
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  // Champs plats : copie directe avec conversion si besoin
  if (changes.numero !== undefined) out.numero = changes.numero;
  if (changes.devis_id !== undefined) out.devis_id = changes.devis_id || null;
  if (changes.client_id !== undefined) out.client_id = changes.client_id || null;
  if (changes.snapshot_prix_ht !== undefined) out.prix_ht = changes.snapshot_prix_ht;
  if (changes.statut !== undefined) out.statut = changes.statut;
  if (changes.date_creation !== undefined) {
    out.date_creation = new Date(changes.date_creation).toISOString();
  }
  if (changes.date_livraison_prevue !== undefined) {
    out.date_livraison_prevue = dateToIso(changes.date_livraison_prevue);
  }
  // Recompose data jsonb si un champ non-plat change
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
    const {
      id: _id,
      numero: _n,
      devis_id: _di,
      client_id: _ci,
      snapshot_prix_ht: _sp,
      statut: _s,
      date_creation: _dc,
      date_livraison_prevue: _dlp,
      ...currentData
    } = current;
    out.data = { ...currentData, ...dataChanges };
  }
  return out;
}

// ============================================================
// STORE
// ============================================================

const commandesStore = createTableStore<Commande, CommandeRow>({
  table: 'commandes',
  rowToEntity: rowToCommande,
  entityToInsertRow: commandeToInsertRow,
  changesToUpdateRow: commandeChangesToUpdateRow,
});

/** Permet à `migration.ts` (ou autre) de déclencher un re-fetch. */
export const commandesStoreRefresh = commandesStore.refresh;

// ============================================================
// HOOK
// ============================================================

export function useCommandes() {
  const { user } = useAuth();
  const state = commandesStore.useStore();

  useEffect(() => {
    commandesStore.ensureLoadedFor(user);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addCommande = (commande: Commande) => commandesStore.addItem(commande);

  const updateCommande = (id: string, changes: Partial<Commande>) =>
    commandesStore.updateItem(id, changes);

  const deleteCommande = (id: string) => commandesStore.deleteItem(id);

  const getCommande = (id: string): Commande | undefined =>
    state.items.find((c) => c.id === id);

  const commandesForClient = (clientId: string): Commande[] =>
    state.items.filter((c) => c.client_id === clientId);

  const commandeForDevis = (devisId: string): Commande | undefined =>
    state.items.find((c) => c.devis_id === devisId);

  const nextNumero = () => generateCommandeNumero(state.items);

  return {
    commandes: state.items,
    addCommande,
    updateCommande,
    deleteCommande,
    getCommande,
    commandesForClient,
    commandeForDevis,
    nextNumero,
    /** @deprecated — purge locale uniquement, ne supprime pas dans Supabase. */
    resetAll: commandesStore.reset,
    hydrated: state.hydrated,
    /** Force un re-fetch depuis Supabase. */
    refresh: () => commandesStore.refresh(user),
  };
}
