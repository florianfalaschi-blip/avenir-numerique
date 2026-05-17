'use client';

import { useEffect } from 'react';
import type { Database } from '@avenir/db';
import { useAuth } from './auth';
import type { CalcSlug } from './default-params';
import type { DelaiPaiement, ModePaiement } from './clients';
import type { DevisLigne } from './devis';
import { createTableStore } from './table-store';

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

/** Type de relance (canal utilisé). */
export type RelanceType = 'email' | 'telephone' | 'lettre' | 'sms' | 'autre';

export const RELANCE_LABELS: Record<RelanceType, string> = {
  email: 'Email',
  telephone: 'Téléphone',
  lettre: 'Lettre',
  sms: 'SMS',
  autre: 'Autre',
};

/** Trace d'une relance effectuée pour une facture impayée. */
export interface Relance {
  id: string;
  /** Date de la relance (Unix ms). */
  date: number;
  type: RelanceType;
  /** Notes libres (réponse client, prochaine échéance promise, etc.). */
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

  /** Historique des relances effectuées (factures impayées). */
  relances?: Relance[];

  /** Référence à la facture originale si c'est un avoir. */
  avoir_de_facture_id?: string;
  /** N° de la facture originale (snapshot, info). */
  avoir_de_facture_numero?: string;

  notes?: string;
  /** Récap du devis (snapshot, pour le PDF facture). */
  snapshot_recap?: string;

  /**
   * Lignes facturées (snapshot multi-produits, optionnel pour compat avec les
   * factures pré-existantes). Si absent → 1 ligne implicite reconstruite à
   * partir des champs montant_* / snapshot_recap via {@link getFactureLignes}.
   */
  lignes?: DevisLigne[];
}

type FactureRow = Database['public']['Tables']['factures']['Row'];

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

export function newRelanceId(): string {
  return `relance_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/** Nombre de jours de retard d'une facture (positif si en retard). */
export function joursRetard(f: Facture): number {
  if (!f.date_echeance) return 0;
  const diff = Date.now() - f.date_echeance;
  return Math.max(0, Math.floor(diff / (24 * 3600 * 1000)));
}

/** Vrai si la facture est en retard (échéance dépassée, non payée, non annulée). */
export function estEnRetard(f: Facture): boolean {
  if (f.statut === 'payee' || f.statut === 'avoir' || f.statut === 'brouillon') return false;
  if (!f.date_echeance) return false;
  return Date.now() > f.date_echeance;
}

/** Date de la dernière relance effectuée (undefined si aucune). */
export function derniereRelance(f: Facture): Relance | undefined {
  if (!f.relances || f.relances.length === 0) return undefined;
  return [...f.relances].sort((a, b) => b.date - a.date)[0];
}

/**
 * Vrai si la facture est à relancer maintenant :
 * - elle est en retard
 * - ET (pas encore de relance OU dernière relance > 7 jours)
 */
export function aRelancer(f: Facture): boolean {
  if (!estEnRetard(f)) return false;
  const last = derniereRelance(f);
  if (!last) return true;
  const joursDepuis = (Date.now() - last.date) / (24 * 3600 * 1000);
  return joursDepuis > 7;
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

/**
 * Retourne les lignes facturées sous forme normalisée :
 * - Si `lignes[]` présent (facture multi-lignes) → renvoie tel quel
 * - Sinon (facture legacy 1-ligne) → construit 1 ligne implicite à partir
 *   des champs montant_* + snapshot_recap (factures pré-multi-lignes).
 *
 * Pour la ligne legacy, le TTC est déduit du ratio montant_ttc / montant_ht.
 */
export function getFactureLignes(f: Facture): DevisLigne[] {
  if (f.lignes && f.lignes.length > 0) return f.lignes;
  // Legacy : 1 ligne implicite reconstruite depuis le snapshot.
  return [
    {
      id: `${f.id}_ligne_unique`,
      calculateur: f.calculateur,
      designation:
        f.snapshot_recap?.split('\n')[0]?.slice(0, 80) ??
        CALC_LABEL_DESIGNATION(f.calculateur),
      quantite: f.quantite,
      input: null,
      result: null,
      recap: f.snapshot_recap,
      prix_ht: f.montant_ht,
      prix_ttc: f.montant_ttc,
      date_ajout: f.date_creation,
    },
  ];
}

/** Désignation par défaut quand on n'a pas mieux. */
function CALC_LABEL_DESIGNATION(calc: CalcSlug): string {
  const m: Record<CalcSlug, string> = {
    rollup: 'Roll-up',
    plaques: 'Plaques / Signalétique',
    flyers: 'Flyers / Affiches',
    bobines: 'Bobines / Étiquettes',
    brochures: 'Brochures',
    soustraitance: 'Sous-traitance',
  };
  return m[calc] ?? 'Produit';
}

// ============================================================
// MAPPERS Row ↔ Facture
// ============================================================

/** Convertit un timestamp ms vers une string ISO (ou null si undefined). */
function dateToIso(n: number | undefined): string | null {
  return n === undefined ? null : new Date(n).toISOString();
}

/** Convertit une string ISO vers un timestamp ms (ou undefined si null). */
function isoToDate(s: string | null): number | undefined {
  return s === null ? undefined : new Date(s).getTime();
}

/** Champs « plats » de la facture qui sont stockés en colonnes dédiées dans la table. */
const FLAT_FIELDS = [
  'id',
  'numero',
  'commande_id',
  'client_id',
  'montant_ht',
  'montant_ttc',
  'statut',
  'date_creation',
  'date_emission',
  'date_echeance',
] as const;

function rowToFacture(row: FactureRow): Facture {
  const data = (row.data as Record<string, unknown>) ?? {};
  return {
    id: row.id,
    numero: row.numero,
    commande_id: row.commande_id ?? '',
    client_id: row.client_id ?? '',
    montant_ht: row.montant_ht,
    montant_ttc: row.montant_ttc,
    statut: row.statut as FactureStatut,
    date_creation: new Date(row.date_creation).getTime(),
    date_emission: isoToDate(row.date_emission),
    date_echeance: isoToDate(row.date_echeance),
    // Le reste est dans data jsonb
    commande_numero: (data.commande_numero as string) ?? '',
    devis_numero: data.devis_numero as string | undefined,
    calculateur: data.calculateur as CalcSlug,
    tva_pct: (data.tva_pct as number) ?? 0,
    quantite: (data.quantite as number) ?? 1,
    paiements: (data.paiements as Paiement[]) ?? [],
    relances: data.relances as Relance[] | undefined,
    avoir_de_facture_id: data.avoir_de_facture_id as string | undefined,
    avoir_de_facture_numero: data.avoir_de_facture_numero as string | undefined,
    notes: data.notes as string | undefined,
    snapshot_recap: data.snapshot_recap as string | undefined,
    lignes: data.lignes as DevisLigne[] | undefined,
  };
}

function factureToInsertRow(f: Facture): Record<string, unknown> {
  const {
    id,
    numero,
    commande_id,
    client_id,
    montant_ht,
    montant_ttc,
    statut,
    date_creation,
    date_emission,
    date_echeance,
    ...rest
  } = f;
  return {
    id,
    numero,
    commande_id: commande_id || null,
    client_id: client_id || null,
    montant_ht,
    montant_ttc,
    statut,
    date_creation: new Date(date_creation).toISOString(),
    date_emission: dateToIso(date_emission),
    date_echeance: dateToIso(date_echeance),
    data: rest as unknown,
  };
}

function factureChangesToUpdateRow(
  changes: Partial<Facture>,
  current: Facture
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (changes.numero !== undefined) out.numero = changes.numero;
  if (changes.commande_id !== undefined) out.commande_id = changes.commande_id || null;
  if (changes.client_id !== undefined) out.client_id = changes.client_id || null;
  if (changes.montant_ht !== undefined) out.montant_ht = changes.montant_ht;
  if (changes.montant_ttc !== undefined) out.montant_ttc = changes.montant_ttc;
  if (changes.statut !== undefined) out.statut = changes.statut;
  if (changes.date_creation !== undefined) {
    out.date_creation = new Date(changes.date_creation).toISOString();
  }
  if (changes.date_emission !== undefined) {
    out.date_emission = dateToIso(changes.date_emission);
  }
  if (changes.date_echeance !== undefined) {
    out.date_echeance = dateToIso(changes.date_echeance);
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
      commande_id: _coi,
      client_id: _ci,
      montant_ht: _mh,
      montant_ttc: _mt,
      statut: _s,
      date_creation: _dc,
      date_emission: _de,
      date_echeance: _dech,
      ...currentData
    } = current;
    out.data = { ...currentData, ...dataChanges };
  }
  return out;
}

// ============================================================
// STORE
// ============================================================

const facturesStore = createTableStore<Facture, FactureRow>({
  table: 'factures',
  rowToEntity: rowToFacture,
  entityToInsertRow: factureToInsertRow,
  changesToUpdateRow: factureChangesToUpdateRow,
});

/** Permet à `migration.ts` (ou autre) de déclencher un re-fetch. */
export const facturesStoreRefresh = facturesStore.refresh;

// ============================================================
// HOOK
// ============================================================

export function useFactures() {
  const { user } = useAuth();
  const state = facturesStore.useStore();

  useEffect(() => {
    facturesStore.ensureLoadedFor(user);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addFacture = (facture: Facture) => facturesStore.addItem(facture);

  const updateFacture = (id: string, changes: Partial<Facture>) =>
    facturesStore.updateItem(id, changes);

  const deleteFacture = (id: string) => facturesStore.deleteItem(id);

  const getFacture = (id: string): Facture | undefined =>
    state.items.find((f) => f.id === id);

  const factureForCommande = (commandeId: string): Facture | undefined =>
    state.items.find((f) => f.commande_id === commandeId);

  const facturesForClient = (clientId: string): Facture[] =>
    state.items.filter((f) => f.client_id === clientId);

  const nextNumero = () => generateFactureNumero(state.items);

  return {
    factures: state.items,
    addFacture,
    updateFacture,
    deleteFacture,
    getFacture,
    factureForCommande,
    facturesForClient,
    nextNumero,
    /** @deprecated — purge locale uniquement, ne supprime pas dans Supabase. */
    resetAll: facturesStore.reset,
    hydrated: state.hydrated,
    /** Force un re-fetch depuis Supabase. */
    refresh: () => facturesStore.refresh(user),
  };
}
