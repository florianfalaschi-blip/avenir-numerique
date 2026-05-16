'use client';

import type { Devis } from './devis';
import type { Commande } from './commandes';
import type { Facture } from './factures';
import { effectivePrixHt } from './devis';
import { montantPaye, montantRestant } from './factures';

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
