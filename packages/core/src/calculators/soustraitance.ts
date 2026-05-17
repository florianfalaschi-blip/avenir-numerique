/**
 * Calculateur Sous-traitance.
 *
 * Logique :
 * - Pour chaque ligne : prix_vente_ht = prix_achat × (1 + marge_pct/100)
 * - Total vente = somme des prix_vente_ht
 * - Cout revient = total_achat + frais_fixes + BAT
 * - Prix HT brut = total vente + frais_fixes + BAT
 * - Dégressif éventuel sur prix_achat global
 * - Plancher de prix appliqué si configuré
 */

import type {
  SoustraitanceInput,
  SoustraitanceParams,
  SoustraitanceResult,
  SoustraitanceLigneDetail,
} from '../types/soustraitance';

export class SoustraitanceCalcError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'SoustraitanceCalcError';
  }
}

export function calcSoustraitance(
  input: SoustraitanceInput,
  params: SoustraitanceParams
): SoustraitanceResult {
  const warnings: string[] = [];

  // === 1. Validations ===
  if (!input.lignes || input.lignes.length === 0) {
    throw new SoustraitanceCalcError(
      'Au moins une ligne de sous-traitance est requise.',
      'NO_LIGNES'
    );
  }
  if (input.quantite < 1) {
    throw new SoustraitanceCalcError(
      'La quantité doit être au moins 1.',
      'INVALID_QUANTITE'
    );
  }

  // === 2. Détail par ligne ===
  const lignes_detail: SoustraitanceLigneDetail[] = [];
  const fournisseursUtilises = new Set<string>();

  for (const ligne of input.lignes) {
    const fournisseur = params.fournisseurs.find((f) => f.id === ligne.fournisseur_id);
    if (!fournisseur) {
      warnings.push(
        `Fournisseur inconnu pour la ligne ${ligne.id} (id=${ligne.fournisseur_id})`
      );
    }
    const fournisseur_nom = fournisseur?.nom ?? `(supprimé ${ligne.fournisseur_id})`;
    fournisseursUtilises.add(ligne.fournisseur_id);

    if (ligne.prix_achat_ht < 0) {
      warnings.push(`Prix d'achat négatif pour la ligne ${ligne.id}, mis à 0.`);
    }
    if (ligne.marge_pct < 0) {
      warnings.push(`Marge négative pour la ligne ${ligne.id}, mise à 0.`);
    }
    const prix_achat_ht = Math.max(0, ligne.prix_achat_ht);
    const marge_pct = Math.max(0, ligne.marge_pct);
    const prix_vente_ht = prix_achat_ht * (1 + marge_pct / 100);
    const marge_eur = prix_vente_ht - prix_achat_ht;

    lignes_detail.push({
      ligne_id: ligne.id,
      fournisseur_id: ligne.fournisseur_id,
      fournisseur_nom,
      ref_devis_fournisseur: ligne.ref_devis_fournisseur,
      prix_achat_ht: round(prix_achat_ht, 2),
      marge_pct,
      prix_vente_ht: round(prix_vente_ht, 2),
      marge_eur: round(marge_eur, 2),
      notes: ligne.notes,
    });
  }

  // === 3. Totaux ===
  const total_achat_ht = lignes_detail.reduce((acc, l) => acc + l.prix_achat_ht, 0);
  const total_vente_lignes_ht = lignes_detail.reduce(
    (acc, l) => acc + l.prix_vente_ht,
    0
  );
  const total_marge_eur = total_vente_lignes_ht - total_achat_ht;
  const marge_moy_pct = total_achat_ht > 0 ? (total_marge_eur / total_achat_ht) * 100 : 0;

  // === 4. Coûts annexes ===
  const frais_fixes_ht = params.frais_fixes_ht;
  const cout_bat_ht = input.bat ? params.bat_prix_ht : 0;
  const cout_revient_ht = total_achat_ht + frais_fixes_ht + cout_bat_ht;

  // === 5. Prix HT brut, dégressif, plancher ===
  const prix_ht_brut = total_vente_lignes_ht + frais_fixes_ht + cout_bat_ht;

  // Dégressif basé sur le total d'achat
  const sortedDeg = [...params.degressif].sort(
    (a, b) => b.seuil_achat_ht - a.seuil_achat_ht
  );
  const deg = sortedDeg.find((d) => total_achat_ht >= d.seuil_achat_ht);
  const remise_pct = deg?.remise_pct ?? 0;
  let prix_ht = prix_ht_brut * (1 - remise_pct / 100);

  if (params.prix_plancher_ht !== undefined && prix_ht < params.prix_plancher_ht) {
    warnings.push(
      `Plancher appliqué : prix relevé à ${params.prix_plancher_ht.toFixed(2)} € HT`
    );
    prix_ht = params.prix_plancher_ht;
  }

  const prix_ttc = prix_ht * (1 + params.tva_pct / 100);

  // === 6. Récap ===
  const lignesRecap: string[] = [
    `Sous-traitance : ${input.nom_job || '(sans nom)'}`,
    `${lignes_detail.length} poste${lignes_detail.length > 1 ? 's' : ''} · ${fournisseursUtilises.size} fournisseur${fournisseursUtilises.size > 1 ? 's' : ''} distinct${fournisseursUtilises.size > 1 ? 's' : ''}`,
    '',
  ];
  lignes_detail.forEach((l, i) => {
    lignesRecap.push(
      `${i + 1}. ${l.fournisseur_nom}${l.ref_devis_fournisseur ? ` (réf. ${l.ref_devis_fournisseur})` : ''}`
    );
    lignesRecap.push(
      `   Achat ${l.prix_achat_ht.toFixed(2)} € + ${l.marge_pct}% → Vente ${l.prix_vente_ht.toFixed(2)} € HT`
    );
    if (l.notes) lignesRecap.push(`   ${l.notes}`);
  });
  lignesRecap.push('');
  lignesRecap.push(
    `Total achats : ${total_achat_ht.toFixed(2)} € HT`,
    `Marge moyenne : ${marge_moy_pct.toFixed(1)} %`,
    `Frais fixes : ${frais_fixes_ht.toFixed(2)} € HT`,
    input.bat ? `BAT : ${cout_bat_ht.toFixed(2)} € HT` : 'BAT : non',
    remise_pct > 0 ? `Dégressif : -${remise_pct} %` : '',
    `Prix HT : ${prix_ht.toFixed(2)} €`,
    `Prix TTC : ${prix_ttc.toFixed(2)} €`
  );
  if (input.descriptif) {
    lignesRecap.push('', '--- Descriptif ---', input.descriptif);
  }

  return {
    lignes_detail,
    nb_lignes: lignes_detail.length,
    nb_fournisseurs_distincts: fournisseursUtilises.size,
    total_achat_ht: round(total_achat_ht, 2),
    total_vente_lignes_ht: round(total_vente_lignes_ht, 2),
    total_marge_eur: round(total_marge_eur, 2),
    marge_moy_pct: round(marge_moy_pct, 2),
    frais_fixes_ht: round(frais_fixes_ht, 2),
    cout_bat_ht: round(cout_bat_ht, 2),
    cout_revient_ht: round(cout_revient_ht, 2),
    prix_ht_brut: round(prix_ht_brut, 2),
    remise_pct,
    prix_ht: round(prix_ht, 2),
    tva_pct: params.tva_pct,
    prix_ttc: round(prix_ttc, 2),
    recap: lignesRecap.filter((l) => l !== undefined).join('\n'),
    warnings,
  };
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
