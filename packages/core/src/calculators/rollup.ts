/**
 * Calculateur Roll-up.
 *
 * Architecture : fonction pure (pas d'effet de bord, sortie déterministe).
 * Voir docs/SPEC_Calculateurs.md section 2 pour la spécification complète.
 */

import type { RollupInput, RollupParams, RollupResult } from '../types/rollup';

/**
 * Erreurs métier remontées par le calculateur.
 * On utilise une classe dédiée pour faciliter la gestion côté UI.
 */
export class RollupCalcError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'RollupCalcError';
  }
}

/**
 * Calcule le prix d'une commande de roll-ups.
 *
 * @param input - Variables saisies par l'utilisateur
 * @param params - Paramètres admin (machines, prix, marges...)
 * @returns Détail complet du calcul
 * @throws {RollupCalcError} Si une donnée est manquante ou invalide
 */
export function calcRollup(input: RollupInput, params: RollupParams): RollupResult {
  // === 1. Validation des entrées ===
  if (input.quantite < 1) {
    throw new RollupCalcError('La quantité doit être au moins 1', 'INVALID_QUANTITE');
  }
  if (input.largeur_cm <= 0 || input.hauteur_cm <= 0) {
    throw new RollupCalcError('Les dimensions doivent être strictement positives', 'INVALID_DIMENSIONS');
  }

  // === 2. Résolution des références (bâche, structure) ===
  const bache = params.baches.find((b) => b.id === input.bache_id);
  if (!bache) {
    throw new RollupCalcError(`Bâche introuvable : ${input.bache_id}`, 'BACHE_NOT_FOUND');
  }

  const structure = params.structures.find((s) => s.id === input.structure_id);
  if (!structure) {
    throw new RollupCalcError(`Structure introuvable : ${input.structure_id}`, 'STRUCTURE_NOT_FOUND');
  }

  // === 3. Validation des paramètres machine ===
  if (params.machine.vitesse_m2_h <= 0) {
    throw new RollupCalcError(
      `Vitesse machine invalide pour ${params.machine.nom}`,
      'INVALID_MACHINE_SPEED'
    );
  }

  const warnings: string[] = [];

  // === 4. Calcul de la surface unitaire (en m²) ===
  const surface_m2 = (input.largeur_cm * input.hauteur_cm) / 10_000;

  // === 5. Coûts unitaires ===
  const cout_bache_unitaire_ht = surface_m2 * bache.prix_m2_ht;
  const cout_machine_unitaire_ht =
    (surface_m2 / params.machine.vitesse_m2_h) * params.machine.taux_horaire_ht;
  const cout_structure_unitaire_ht = structure.prix_unitaire_ht;

  const cout_unitaire_ht =
    cout_bache_unitaire_ht + cout_machine_unitaire_ht + cout_structure_unitaire_ht;

  // === 6. Coût production total ===
  const cout_production_ht = cout_unitaire_ht * input.quantite;

  // === 7. Frais fixes + BAT optionnel ===
  const cout_bat_ht = input.bat ? params.bat_prix_ht : 0;

  const cout_revient_ht = cout_production_ht + params.frais_fixes_ht + cout_bat_ht;

  // === 8. Application de la marge ===
  const prix_ht_brut = cout_revient_ht * (1 + params.marge_pct / 100);

  // === 9. Application du dégressif ===
  // On prend la remise correspondant au seuil le plus élevé atteint
  const sortedDegressif = [...params.degressif].sort((a, b) => b.seuil - a.seuil);
  const degressifApplied = sortedDegressif.find((d) => input.quantite >= d.seuil);
  const remise_pct = degressifApplied?.remise_pct ?? 0;

  let prix_ht = prix_ht_brut * (1 - remise_pct / 100);

  // === 10. Plancher de sécurité ===
  if (params.prix_plancher_ht !== undefined && prix_ht < params.prix_plancher_ht) {
    warnings.push(
      `Plancher appliqué : prix relevé à ${params.prix_plancher_ht.toFixed(2)} € HT (calculé : ${prix_ht.toFixed(2)} €)`
    );
    prix_ht = params.prix_plancher_ht;
  }

  // === 11. TTC ===
  const prix_ttc = prix_ht * (1 + params.tva_pct / 100);

  // === 12. Récapitulatif lisible ===
  const recap = [
    `Roll-up ${input.largeur_cm} × ${input.hauteur_cm} cm`,
    `Bâche : ${bache.nom}`,
    `Structure : ${structure.nom}`,
    `Quantité : ${input.quantite}`,
    `Surface unitaire : ${surface_m2.toFixed(4)} m²`,
    `Coût unitaire : ${cout_unitaire_ht.toFixed(2)} € HT`,
    `Coût production : ${cout_production_ht.toFixed(2)} € HT`,
    `Frais fixes : ${params.frais_fixes_ht.toFixed(2)} € HT`,
    input.bat ? `BAT : ${cout_bat_ht.toFixed(2)} € HT` : 'BAT : non',
    `Coût de revient : ${cout_revient_ht.toFixed(2)} € HT`,
    `Marge : ${params.marge_pct} %`,
    `Prix HT brut : ${prix_ht_brut.toFixed(2)} €`,
    remise_pct > 0 ? `Dégressif : -${remise_pct} %` : 'Dégressif : aucun',
    `Prix HT final : ${prix_ht.toFixed(2)} €`,
    `TVA : ${params.tva_pct} %`,
    `Prix TTC : ${prix_ttc.toFixed(2)} €`,
  ].join('\n');

  // === 13. Arrondi final à 2 décimales (centimes) ===
  // Les valeurs intermédiaires gardent leur précision pour permettre l'audit,
  // mais les prix finaux affichés sont arrondis au centime.
  return {
    surface_m2: round(surface_m2, 4),
    cout_bache_unitaire_ht: round(cout_bache_unitaire_ht, 4),
    cout_machine_unitaire_ht: round(cout_machine_unitaire_ht, 4),
    cout_structure_unitaire_ht: round(cout_structure_unitaire_ht, 2),
    cout_unitaire_ht: round(cout_unitaire_ht, 4),
    cout_production_ht: round(cout_production_ht, 2),
    frais_fixes_ht: round(params.frais_fixes_ht, 2),
    cout_bat_ht: round(cout_bat_ht, 2),
    cout_revient_ht: round(cout_revient_ht, 2),
    marge_pct: params.marge_pct,
    prix_ht_brut: round(prix_ht_brut, 2),
    remise_pct,
    prix_ht: round(prix_ht, 2),
    tva_pct: params.tva_pct,
    prix_ttc: round(prix_ttc, 2),
    recap,
    warnings,
  };
}

/** Arrondi mathématique à N décimales. */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}