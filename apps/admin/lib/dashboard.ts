'use client';

import type { Devis } from './devis';
import type { Commande } from './commandes';
import type { Facture } from './factures';
import { effectivePrixHt } from './devis';
import { montantPaye, montantRestant } from './factures';
import type { CalcSlug } from './default-params';

// ============================================================
// Calculs CA
// ============================================================

/** Renvoie l'année/mois d'un timestamp Unix ms. */
function ym(ts: number): { year: number; month: number } {
  const d = new Date(ts);
  return { year: d.getFullYear(), month: d.getMonth() };
}

/** CA HT du mois donné (basé sur factures émises). */
export function caMois(factures: Facture[], year: number, month: number): number {
  return factures
    .filter((f) => {
      if (!f.date_emission) return false;
      const e = ym(f.date_emission);
      return e.year === year && e.month === month;
    })
    .reduce((acc, f) => acc + f.montant_ht, 0);
}

/** CA HT de l'année donnée. */
export function caAnnee(factures: Facture[], year: number): number {
  return factures
    .filter((f) => {
      if (!f.date_emission) return false;
      return ym(f.date_emission).year === year;
    })
    .reduce((acc, f) => acc + f.montant_ht, 0);
}

/** Delta % entre deux valeurs (positive si croissance). */
export function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Renvoie le mois précédent (year/month). */
export function previousMonth(year: number, month: number): {
  year: number;
  month: number;
} {
  if (month === 0) return { year: year - 1, month: 11 };
  return { year, month: month - 1 };
}

// ============================================================
// Sélections / classements
// ============================================================

/** Devis les plus récents (triés par date desc), tous statuts confondus. */
export function devisRecents(devis: Devis[], limit = 5): Devis[] {
  return [...devis].sort((a, b) => b.date_creation - a.date_creation).slice(0, limit);
}

/** Devis en attente de réponse (envoyés non décidés). */
export function devisEnAttente(devis: Devis[]): Devis[] {
  return devis.filter((d) => d.statut === 'envoye');
}

/** Commandes en cours de production. */
export function commandesEnProduction(commandes: Commande[]): Commande[] {
  return commandes.filter((c) =>
    ['en_preparation', 'bat_attente', 'en_production', 'finitions'].includes(c.statut)
  );
}

/** Factures avec échéance dépassée et non payées. */
export function facturesEnRetard(factures: Facture[]): Facture[] {
  return factures
    .filter(
      (f) =>
        f.date_echeance &&
        Date.now() > f.date_echeance &&
        !['payee', 'avoir', 'brouillon'].includes(f.statut)
    )
    .sort((a, b) => (a.date_echeance ?? 0) - (b.date_echeance ?? 0));
}

/** Top clients par CA cumulé (factures + devis acceptés). */
export function topClients(
  factures: Facture[],
  devis: Devis[],
  limit = 5
): Array<{ client_id: string; total: number; count: number }> {
  const map = new Map<string, { total: number; count: number }>();

  // Factures (priorité — plus représentatif)
  for (const f of factures) {
    const cur = map.get(f.client_id) ?? { total: 0, count: 0 };
    cur.total += f.montant_ht;
    cur.count += 1;
    map.set(f.client_id, cur);
  }
  // Devis acceptés sans facture associée (estimation CA pipeline)
  for (const d of devis) {
    if (d.statut !== 'accepte') continue;
    const cur = map.get(d.client_id) ?? { total: 0, count: 0 };
    cur.total += effectivePrixHt(d);
    cur.count += 1;
    map.set(d.client_id, cur);
  }

  return [...map.entries()]
    .map(([client_id, { total, count }]) => ({ client_id, total, count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ============================================================
// Totaux financiers
// ============================================================

export function totalImpaye(factures: Facture[]): number {
  return factures
    .filter((f) => !['payee', 'avoir', 'brouillon'].includes(f.statut))
    .reduce((acc, f) => acc + montantRestant(f), 0);
}

export function totalEncaisse(factures: Facture[]): number {
  return factures.reduce((acc, f) => acc + montantPaye(f), 0);
}

/** Pipeline de devis : montant cumulé des devis envoyés non décidés. */
export function pipelineDevis(devis: Devis[]): number {
  return devis
    .filter((d) => d.statut === 'envoye')
    .reduce((acc, d) => acc + effectivePrixHt(d), 0);
}

// ============================================================
// Séries pour graphes
// ============================================================

export interface MonthlySerie {
  year: number;
  month: number;
  /** Label court FR : "jan", "fév", … */
  label: string;
  /** Valeur HT du mois. */
  value: number;
}

const SHORT_MONTHS_FR = [
  'jan',
  'fév',
  'mar',
  'avr',
  'mai',
  'juin',
  'juil',
  'aoû',
  'sep',
  'oct',
  'nov',
  'déc',
];

/**
 * Renvoie une série de 12 mois glissants se terminant au mois courant.
 * Idéal pour un bar chart "CA des 12 derniers mois".
 */
export function caSur12Mois(factures: Facture[], refDate: Date = new Date()): MonthlySerie[] {
  const series: MonthlySerie[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    series.push({
      year,
      month,
      label: `${SHORT_MONTHS_FR[month]}${month === 0 ? ` ${year - 2000}` : ''}`,
      value: caMois(factures, year, month),
    });
  }
  return series;
}

/**
 * Répartition par calculateur (5 catégories) — basée sur les factures
 * + devis acceptés (pipeline complet).
 */
export function breakdownParCalculateur(
  factures: Facture[],
  devis: Devis[]
): Array<{ calculateur: string; value: number; count: number }> {
  const map = new Map<string, { value: number; count: number }>();
  for (const f of factures) {
    const cur = map.get(f.calculateur) ?? { value: 0, count: 0 };
    cur.value += f.montant_ht;
    cur.count += 1;
    map.set(f.calculateur, cur);
  }
  for (const d of devis) {
    if (d.statut !== 'accepte') continue;
    const cur = map.get(d.calculateur) ?? { value: 0, count: 0 };
    cur.value += effectivePrixHt(d);
    cur.count += 1;
    map.set(d.calculateur, cur);
  }
  return [...map.entries()]
    .map(([calculateur, { value, count }]) => ({ calculateur, value, count }))
    .sort((a, b) => b.value - a.value);
}

// ============================================================
// AGING IMPAYÉS (gestion trésorerie / recouvrement)
// ============================================================

export type AgingTranche =
  | 'a_echoir'        // échéance pas encore atteinte
  | '0_30'            // 0-30 jours de retard
  | '30_60'           // 30-60 jours
  | '60_90'           // 60-90 jours
  | 'plus_90';        // > 90 jours (créance douteuse)

export const AGING_LABELS: Record<AgingTranche, string> = {
  a_echoir: 'À échoir',
  '0_30': '0-30 j',
  '30_60': '30-60 j',
  '60_90': '60-90 j',
  plus_90: '> 90 j',
};

export const AGING_COLORS: Record<AgingTranche, string> = {
  a_echoir: 'bg-primary/15 text-primary border-primary/30',
  '0_30': 'bg-warning/15 text-warning border-warning/30',
  '30_60': 'bg-accent/15 text-accent border-accent/30',
  '60_90': 'bg-destructive/15 text-destructive border-destructive/30',
  plus_90: 'bg-destructive/30 text-destructive border-destructive/50',
};

/**
 * Classe une facture en aging tranche selon les jours de retard
 * (positif = en retard, négatif = à échoir).
 */
function agingTrancheOf(joursRetard: number, dateEcheance: number | undefined): AgingTranche {
  if (!dateEcheance) return 'a_echoir';
  if (joursRetard <= 0) return 'a_echoir';
  if (joursRetard <= 30) return '0_30';
  if (joursRetard <= 60) return '30_60';
  if (joursRetard <= 90) return '60_90';
  return 'plus_90';
}

export interface AgingBucket {
  tranche: AgingTranche;
  count: number;
  montant: number;
  factures: Facture[];
}

/**
 * Répartit les factures **non payées et non annulées** en tranches d'aging.
 * Seules les factures avec statut émise/partiellement_payée/impayée comptent.
 * Le montant de chaque tranche = somme des montants restants dus.
 */
export function agingImpayes(factures: Facture[]): AgingBucket[] {
  const buckets: Record<AgingTranche, AgingBucket> = {
    a_echoir: { tranche: 'a_echoir', count: 0, montant: 0, factures: [] },
    '0_30': { tranche: '0_30', count: 0, montant: 0, factures: [] },
    '30_60': { tranche: '30_60', count: 0, montant: 0, factures: [] },
    '60_90': { tranche: '60_90', count: 0, montant: 0, factures: [] },
    plus_90: { tranche: 'plus_90', count: 0, montant: 0, factures: [] },
  };
  const now = Date.now();
  for (const f of factures) {
    // Ne compte que les factures avec encours
    if (f.statut === 'payee' || f.statut === 'avoir' || f.statut === 'brouillon') continue;
    const restant = montantRestant(f);
    if (restant <= 0.01) continue;
    const jr = f.date_echeance
      ? Math.floor((now - f.date_echeance) / (24 * 3600 * 1000))
      : 0;
    const t = agingTrancheOf(jr, f.date_echeance);
    buckets[t].count++;
    buckets[t].montant += restant;
    buckets[t].factures.push(f);
  }
  return [
    buckets.a_echoir,
    buckets['0_30'],
    buckets['30_60'],
    buckets['60_90'],
    buckets.plus_90,
  ];
}

/**
 * DSO (Days Sales Outstanding) — moyenne pondérée des jours entre émission
 * et paiement (ou jusqu'à aujourd'hui pour les factures impayées).
 *
 * Calculé sur les 12 derniers mois pour rester pertinent. Retourne null si
 * pas assez de données.
 */
export function dsoMoyen(factures: Facture[]): number | null {
  const limite = Date.now() - 365 * 24 * 3600 * 1000;
  let totalPondere = 0;
  let totalMontant = 0;
  for (const f of factures) {
    if (!f.date_emission || f.date_emission < limite) continue;
    if (f.statut === 'avoir' || f.statut === 'brouillon') continue;
    // Si payée : utilise la date du dernier paiement
    // Sinon : compte jusqu'à aujourd'hui
    let dateRef: number;
    if (f.statut === 'payee' && f.paiements.length > 0) {
      dateRef = Math.max(...f.paiements.map((p) => p.date));
    } else {
      dateRef = Date.now();
    }
    const jours = Math.floor((dateRef - f.date_emission) / (24 * 3600 * 1000));
    if (jours < 0) continue;
    totalPondere += jours * f.montant_ttc;
    totalMontant += f.montant_ttc;
  }
  if (totalMontant === 0) return null;
  return Math.round(totalPondere / totalMontant);
}

// ============================================================
// MARGE MOYENNE PAR PRODUIT
// ============================================================

export interface MargeParCalc {
  calculateur: CalcSlug;
  /** Marge moyenne (% du prix HT) — pondérée par CA. */
  marge_pct_moy: number;
  /** CA total HT généré par ce produit (factures + devis acceptés). */
  ca_total_ht: number;
  /** Nombre de transactions agrégées. */
  count: number;
}

/**
 * Calcule la marge moyenne effective par produit/calculateur.
 *
 * On extrait la marge depuis `result.marge_pct` du snapshot calc.
 * La moyenne est pondérée par le prix HT pour que les grosses commandes
 * pèsent plus que les petites.
 *
 * Source : factures + devis statut "accepté" (pas brouillon ni refusé).
 */
export function margeParCalculateur(
  factures: Facture[],
  devis: Devis[]
): MargeParCalc[] {
  type Acc = { sumPondere: number; sumMontant: number; count: number };
  const map = new Map<CalcSlug, Acc>();

  function add(calc: CalcSlug, marge_pct: number | undefined, montant_ht: number) {
    if (marge_pct === undefined || marge_pct === null || isNaN(marge_pct)) return;
    if (montant_ht <= 0) return;
    const cur = map.get(calc) ?? { sumPondere: 0, sumMontant: 0, count: 0 };
    cur.sumPondere += marge_pct * montant_ht;
    cur.sumMontant += montant_ht;
    cur.count += 1;
    map.set(calc, cur);
  }

  for (const d of devis) {
    if (d.statut !== 'accepte') continue;
    const r = d.result as { marge_pct?: number } | null;
    add(d.calculateur, r?.marge_pct, effectivePrixHt(d));
  }
  for (const f of factures) {
    if (f.statut === 'avoir' || f.statut === 'brouillon') continue;
    // Pour les factures, on prend le tva_pct comme proxy si marge_pct absent
    // (à amélioration : stocker marge_pct dans le snapshot facture)
    const r = (f as unknown as { result?: { marge_pct?: number } }).result;
    add(f.calculateur, r?.marge_pct, f.montant_ht);
  }

  return [...map.entries()]
    .map(([calc, { sumPondere, sumMontant, count }]) => ({
      calculateur: calc,
      marge_pct_moy: sumMontant > 0 ? sumPondere / sumMontant : 0,
      ca_total_ht: sumMontant,
      count,
    }))
    .sort((a, b) => b.ca_total_ht - a.ca_total_ht);
}

// ============================================================
// COMMANDES EN RETARD DE LIVRAISON
// ============================================================

/**
 * Renvoie les commandes dont la date de livraison prévue est dépassée
 * et qui ne sont ni livrées ni annulées. Triées par retard décroissant.
 */
export function commandesEnRetardLivraison(commandes: Commande[]): Array<{
  commande: Commande;
  jours_retard: number;
}> {
  const now = Date.now();
  return commandes
    .filter((c) => {
      if (!c.date_livraison_prevue) return false;
      if (c.statut === 'livre' || c.statut === 'annule') return false;
      return now > c.date_livraison_prevue;
    })
    .map((c) => ({
      commande: c,
      jours_retard: Math.floor(
        (now - (c.date_livraison_prevue ?? now)) / (24 * 3600 * 1000)
      ),
    }))
    .sort((a, b) => b.jours_retard - a.jours_retard);
}
