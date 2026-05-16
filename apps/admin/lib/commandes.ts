'use client';

import type { CalcSlug } from './default-params';
import { useSettings } from './settings';

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
// HOOK
// ============================================================

export function useCommandes() {
  const { value, update, reset, hydrated } = useSettings<Commande[]>('data.commandes', []);

  const addCommande = (commande: Commande) => {
    update([commande, ...value]);
  };

  const updateCommande = (id: string, changes: Partial<Commande>) => {
    update(value.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  };

  const deleteCommande = (id: string) => {
    update(value.filter((c) => c.id !== id));
  };

  const getCommande = (id: string): Commande | undefined => value.find((c) => c.id === id);

  const commandesForClient = (clientId: string): Commande[] =>
    value.filter((c) => c.client_id === clientId);

  const commandeForDevis = (devisId: string): Commande | undefined =>
    value.find((c) => c.devis_id === devisId);

  const nextNumero = () => generateCommandeNumero(value);

  return {
    commandes: value,
    addCommande,
    updateCommande,
    deleteCommande,
    getCommande,
    commandesForClient,
    commandeForDevis,
    nextNumero,
    resetAll: reset,
    hydrated,
  };
}
