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

/**
 * Une ligne d'un devis. Un devis peut en avoir N — chaque ligne porte son
 * propre produit (issue d'un calculateur), avec sa quantité et son prix.
 *
 * Compat : les devis pré-existants n'ont pas de `lignes[]` ; on les traite
 * comme un devis 1-ligne implicite via `getDevisLignes()`.
 */
export interface DevisLigne {
  id: string;
  /** Produit (calculateur) d'origine de la ligne. */
  calculateur: CalcSlug;
  /** Libellé court de la ligne (modifiable, par défaut auto depuis le recap). */
  designation: string;
  /** Quantité commandée. */
  quantite: number;
  /** Snapshot des entrées du calcul. */
  input: unknown;
  /** Snapshot du résultat du calcul. */
  result: unknown;
  /** Récap textuel lisible (multi-ligne) du résultat. */
  recap?: string;
  /** Prix HT total de la ligne (qté × unitaire), figé au moment du save. */
  prix_ht: number;
  /** Prix TTC total de la ligne (incluant TVA). */
  prix_ttc: number;
  /** Override manuel du prix HT total de la ligne (commercial négocie). */
  prix_ht_override?: number;
  /** Notes spécifiques à cette ligne (ex: "vernis sélectif côté recto"). */
  notes?: string;
  /** Date d'ajout de la ligne. */
  date_ajout?: number;
}

export interface Devis {
  id: string;
  /** Numéro auto-incrémenté de type "DV-2026-0042". */
  numero: string;
  client_id: string;

  // --- Multi-lignes (nouveau) ---
  /** Lignes du devis (1 ou plus). Si absent → devis legacy 1-ligne. */
  lignes?: DevisLigne[];

  // --- Champs legacy + dénormalisations pour tri/index ---
  /** Calculateur de la 1re ligne (ou unique pour legacy). Sert au filtrage liste. */
  calculateur: CalcSlug;
  /** Snapshot des entrées (legacy 1-ligne uniquement). */
  input: unknown;
  /** Snapshot du résultat (legacy 1-ligne uniquement). */
  result: unknown;
  /** Récap textuel (legacy 1-ligne uniquement). */
  recap?: string;
  /** Prix HT TOTAL du devis (somme des lignes pour multi). */
  prix_ht: number;
  /** Prix TTC TOTAL du devis. */
  prix_ttc: number;
  /** Quantité (legacy 1-ligne ; pour multi-lignes, c'est la qté totale = somme). */
  quantite: number;

  statut: DevisStatut;
  date_creation: number;
  date_envoi?: number;
  date_validite?: number;
  notes?: string;

  /** Override manuel du prix HT TOTAL (si commercial négocie sur le total). */
  prix_ht_override?: number;
  /** Remise manuelle supplémentaire en % appliquée au total. */
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

/** ID DevisLigne. */
export function newLigneId(): string {
  return `ligne_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Retourne les lignes d'un devis sous forme normalisée :
 * - Si `lignes[]` présent → renvoie tel quel
 * - Sinon (legacy 1-ligne) → construit 1 ligne à partir des champs top-level
 */
export function getDevisLignes(d: Devis): DevisLigne[] {
  if (d.lignes && d.lignes.length > 0) return d.lignes;
  // Legacy : 1 seule ligne implicite
  return [
    {
      id: `${d.id}_ligne_unique`,
      calculateur: d.calculateur,
      designation: d.recap?.split('\n')[0]?.slice(0, 80) ?? CALC_LABEL_DESIGNATION(d.calculateur),
      quantite: d.quantite,
      input: d.input,
      result: d.result,
      recap: d.recap,
      prix_ht: d.prix_ht,
      prix_ttc: d.prix_ttc,
      date_ajout: d.date_creation,
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
  };
  return m[calc] ?? 'Produit';
}

/**
 * Recompose les totaux d'un devis depuis ses lignes (multi) :
 * - prix_ht = somme des prix_ht_override ?? prix_ht de chaque ligne
 * - prix_ttc = idem (proratisé si pas d'override sur ligne)
 *
 * Retourne aussi `quantite` totale (somme des qté lignes) et le calculateur
 * principal (celui de la 1re ligne).
 */
export function computeDevisTotals(lignes: DevisLigne[]): {
  prix_ht: number;
  prix_ttc: number;
  quantite: number;
  calculateur: CalcSlug;
} {
  if (lignes.length === 0) {
    return { prix_ht: 0, prix_ttc: 0, quantite: 0, calculateur: 'rollup' };
  }
  let ht = 0;
  let ttc = 0;
  let qte = 0;
  for (const l of lignes) {
    const effHt = l.prix_ht_override ?? l.prix_ht;
    // Garde le ratio TTC/HT de la ligne pour calculer le TTC effectif
    const ratio = l.prix_ht > 0 ? l.prix_ttc / l.prix_ht : 1.2;
    const effTtc = effHt * ratio;
    ht += effHt;
    ttc += effTtc;
    qte += l.quantite;
  }
  return {
    prix_ht: ht,
    prix_ttc: ttc,
    quantite: qte,
    calculateur: lignes[0]!.calculateur,
  };
}

/**
 * Ajoute une ligne à un devis et recalcule les totaux dénormalisés.
 * Renvoie un nouveau Devis (immutable).
 */
export function addLigneToDevis(devis: Devis, ligne: DevisLigne): Devis {
  const currentLignes = getDevisLignes(devis);
  // Si on était en legacy 1-ligne, la 1re ligne devient la "implicite" + on add
  // Pour ne pas duppliquer, on convertit explicitement
  const allLignes = devis.lignes && devis.lignes.length > 0
    ? [...devis.lignes, ligne]
    : [...currentLignes, ligne];
  const totals = computeDevisTotals(allLignes);
  return {
    ...devis,
    lignes: allLignes,
    prix_ht: totals.prix_ht,
    prix_ttc: totals.prix_ttc,
    quantite: totals.quantite,
    calculateur: totals.calculateur,
  };
}

/** Met à jour une ligne d'un devis et recalcule les totaux. */
export function updateLigneInDevis(
  devis: Devis,
  ligneId: string,
  changes: Partial<DevisLigne>
): Devis {
  const lignes = getDevisLignes(devis).map((l) =>
    l.id === ligneId ? { ...l, ...changes } : l
  );
  const totals = computeDevisTotals(lignes);
  return {
    ...devis,
    lignes,
    prix_ht: totals.prix_ht,
    prix_ttc: totals.prix_ttc,
    quantite: totals.quantite,
    calculateur: totals.calculateur,
  };
}

/** Supprime une ligne d'un devis et recalcule. Refuse si c'est la dernière. */
export function removeLigneFromDevis(devis: Devis, ligneId: string): Devis {
  const lignes = getDevisLignes(devis).filter((l) => l.id !== ligneId);
  if (lignes.length === 0) {
    throw new Error('Un devis doit conserver au moins une ligne.');
  }
  const totals = computeDevisTotals(lignes);
  return {
    ...devis,
    lignes,
    prix_ht: totals.prix_ht,
    prix_ttc: totals.prix_ttc,
    quantite: totals.quantite,
    calculateur: totals.calculateur,
  };
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
    lignes: data.lignes as DevisLigne[] | undefined,
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
