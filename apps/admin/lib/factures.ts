'use client';

import type { CalcSlug } from './default-params';
import type { DelaiPaiement, ModePaiement } from './clients';
import { useSettings } from './settings';

// ============================================================
// TYPES
// ============================================================

export type FactureStatut =
  | 'brouillon'
  | 'emise'
  | 'partiellement_payee'
  | 'payee'
  | 'impayee'
  | 'avoir';

export interface Paiement {
  id: string;
  /** Date de réception du paiement (Unix ms). */
  date: number;
  /** Montant reçu en € TTC. */
  montant: number;
  mode?: ModePaiement;
  /** Référence (n° virement, ticket CB, n° chèque…). */
  reference?: string;
  notes?: string;
}

export interface Facture {
  id: string;
  /** Numéro auto-incrémenté de type "FCT-2026-0042". */
  numero: string;
  /** ID de la commande source (référence). */
  commande_id: string;
  /** N° de commande source (snapshot, affichage rapide). */
  commande_numero: string;
  /** N° de devis source (snapshot, info). */
  devis_numero?: string;
  client_id: string;
  calculateur: CalcSlug;

  date_creation: number;
  /** Date d'émission (passage de brouillon à émise). */
  date_emission?: number;
  /** Date d'échéance (calculée auto au passage à émise selon délai client). */
  date_echeance?: number;

  statut: FactureStatut;

  // Snapshot des montants
  montant_ht: number;
  montant_ttc: number;
  tva_pct: number;
  quantite: number;

  /** Paiements reçus (acompte + solde, ou plusieurs versements). */
  paiements: Paiement[];

  notes?: string;
  /** Récap du devis (snapshot, pour le PDF facture). */
  snapshot_recap?: string;
}

// ============================================================
// HELPERS
// ============================================================

export const STATUT_LABELS: Record<FactureStatut, string> = {
  brouillon: 'Brouillon',
  emise: 'Émise',
  partiellement_payee: 'Partiellement payée',
  payee: 'Payée',
  impayee: 'Impayée',
  avoir: 'Avoir',
};

export const STATUT_COLORS: Record<FactureStatut, string> = {
  brouillon: 'bg-secondary text-secondary-foreground border border-border',
  emise: 'bg-primary/15 text-primary border border-primary/30',
  partiellement_payee: 'bg-warning/15 text-warning border border-warning/30',
  payee: 'bg-green-100 text-green-800 border border-green-300',
  impayee: 'bg-destructive/15 text-destructive border border-destructive/30',
  avoir: 'bg-accent/15 text-accent border border-accent/30',
};

export function generateFactureNumero(existing: Facture[]): string {
  const year = new Date().getFullYear();
  const prefix = `FCT-${year}-`;
  const last = existing
    .filter((f) => f.numero.startsWith(prefix))
    .map((f) => parseInt(f.numero.slice(prefix.length), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => b - a)[0];
  const next = (last ?? 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export function newFactureId(): string {
  return `facture_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function newPaiementId(): string {
  return `paiement_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/** Montant total déjà payé (somme des paiements). */
export function montantPaye(f: Facture): number {
  return f.paiements.reduce((acc, p) => acc + p.montant, 0);
}

/** Montant restant dû (peut être négatif si trop-payé). */
export function montantRestant(f: Facture): number {
  return f.montant_ttc - montantPaye(f);
}

/** Vrai si la facture est entièrement réglée (au moins 99% pour absorber arrondis). */
export function estPayee(f: Facture): boolean {
  return montantPaye(f) >= f.montant_ttc - 0.01;
}

/** Vrai si paiement partiel (au moins un paiement mais incomplet). */
export function estPartiellementPayee(f: Facture): boolean {
  const paye = montantPaye(f);
  return paye > 0.01 && paye < f.montant_ttc - 0.01;
}

/**
 * Calcule la date d'échéance selon le délai de paiement du client.
 * Si pas de délai défini : 30 jours par défaut.
 */
export function calculerDateEcheance(
  emission: number,
  delai?: DelaiPaiement
): number {
  const date = new Date(emission);
  switch (delai) {
    case 'comptant':
      return emission;
    case '30j':
      return emission + 30 * 24 * 3600 * 1000;
    case '45j':
      return emission + 45 * 24 * 3600 * 1000;
    case '60j':
      return emission + 60 * 24 * 3600 * 1000;
    case '30j_fin_mois':
      // 30 jours après émission, puis fin du mois suivant
      date.setDate(date.getDate() + 30);
      date.setMonth(date.getMonth() + 1, 0);
      return date.getTime();
    case '45j_fin_mois':
      date.setDate(date.getDate() + 45);
      date.setMonth(date.getMonth() + 1, 0);
      return date.getTime();
    case '60j_fin_mois':
      date.setDate(date.getDate() + 60);
      date.setMonth(date.getMonth() + 1, 0);
      return date.getTime();
    case 'autre':
    default:
      return emission + 30 * 24 * 3600 * 1000;
  }
}

/**
 * Détermine automatiquement le statut d'une facture émise selon les paiements
 * et la date d'échéance. Garde brouillon/avoir intact (non auto).
 */
export function statutAuto(f: Facture): FactureStatut {
  if (f.statut === 'brouillon' || f.statut === 'avoir') return f.statut;
  if (estPayee(f)) return 'payee';
  if (estPartiellementPayee(f)) return 'partiellement_payee';
  // Émise : check si en retard
  if (f.date_echeance && Date.now() > f.date_echeance) return 'impayee';
  return 'emise';
}

// ============================================================
// HOOK
// ============================================================

export function useFactures() {
  const { value, update, reset, hydrated } = useSettings<Facture[]>('data.factures', []);

  const addFacture = (facture: Facture) => {
    update([facture, ...value]);
  };

  const updateFacture = (id: string, changes: Partial<Facture>) => {
    update(value.map((f) => (f.id === id ? { ...f, ...changes } : f)));
  };

  const deleteFacture = (id: string) => {
    update(value.filter((f) => f.id !== id));
  };

  const getFacture = (id: string): Facture | undefined => value.find((f) => f.id === id);

  const factureForCommande = (commandeId: string): Facture | undefined =>
    value.find((f) => f.commande_id === commandeId);

  const facturesForClient = (clientId: string): Facture[] =>
    value.filter((f) => f.client_id === clientId);

  const nextNumero = () => generateFactureNumero(value);

  return {
    factures: value,
    addFacture,
    updateFacture,
    deleteFacture,
    getFacture,
    factureForCommande,
    facturesForClient,
    nextNumero,
    resetAll: reset,
    hydrated,
  };
}
