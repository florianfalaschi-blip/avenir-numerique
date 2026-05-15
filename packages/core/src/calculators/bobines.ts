/**
 * Calculateur Bobines / Étiquettes.
 * Voir docs/SPEC_Calculateurs.md section 5.
 */

import type {
  BobinesInput,
  BobinesParams,
  BobinesResult,
  BobinesMatiereResult,
  BobinesMateriauConfig,
  BobinesFinitionConfig,
} from '../types/bobines';

export class BobinesCalcError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'BobinesCalcError';
  }
}

export function calcBobines(input: BobinesInput, params: BobinesParams): BobinesResult {
  // === 1. Validations ===
  if (input.quantite_etiquettes < 1) {
    throw new BobinesCalcError('La quantité doit être au moins 1', 'INVALID_QUANTITE');
  }

  // === 2. Calcul surface et périmètre unitaires ===
  const { surface_unitaire_mm2, perimetre_unitaire_mm, largeur_mm, hauteur_mm } =
    computeGeometry(input);

  // === 3. Résolution du matériau ===
  const materiau = params.materiaux.find((m) => m.id === input.materiau_id);
  if (!materiau) {
    throw new BobinesCalcError(`Matériau introuvable : ${input.materiau_id}`, 'MATERIAU_NOT_FOUND');
  }

  const warnings: string[] = [];
  const surface_unitaire_m2 = surface_unitaire_mm2 / 1_000_000;
  const surface_totale_brute_m2 = surface_unitaire_m2 * input.quantite_etiquettes;

  // === 4. Calcul matière (calepinage OU m²) ===
  const matiere = computeMatiere(
    materiau,
    input.quantite_etiquettes,
    largeur_mm,
    hauteur_mm,
    surface_totale_brute_m2,
    params.espace_entre_etiquettes_mm,
    params.machine_impression.gaches_pct,
    warnings
  );

  // === 5. Coût impression ===
  if (params.machine_impression.vitesse_m2_h <= 0) {
    throw new BobinesCalcError('Vitesse machine impression invalide', 'INVALID_MACHINE_SPEED');
  }
  const duree_impression_h = surface_totale_brute_m2 / params.machine_impression.vitesse_m2_h;
  const cout_impression_ht = duree_impression_h * params.machine_impression.taux_horaire_ht;
  const cout_operateur_impression_ht =
    duree_impression_h * params.machine_impression.operateur_taux_horaire_ht;

  // === 6. Coût découpe ===
  // Périmètre total à découper (en mètres)
  const metres_decoupe_total = (perimetre_unitaire_mm * input.quantite_etiquettes) / 1000;
  if (params.machine_decoupe.vitesse_m_min <= 0) {
    throw new BobinesCalcError('Vitesse machine découpe invalide', 'INVALID_CUT_SPEED');
  }
  const duree_decoupe_min = metres_decoupe_total / params.machine_decoupe.vitesse_m_min;
  const duree_decoupe_h = duree_decoupe_min / 60;
  const cout_decoupe_machine_ht = duree_decoupe_h * params.machine_decoupe.taux_horaire_ht;
  const cout_decoupe_operateur_ht =
    duree_decoupe_h * params.machine_decoupe.operateur_taux_horaire_ht;
  const cout_cliquage_ht = params.machine_decoupe.forfait_cliquage_ht;

  // === 7. Coût finitions ===
  const cout_finitions_ht = calcCoutFinitions(
    input.finitions_ids,
    params.finitions,
    input.quantite_etiquettes,
    surface_totale_brute_m2
  );

  // === 8. Coût conditionnement ===
  const cout_conditionnement_ht =
    input.conditionnement === 'rouleau_applicateur' ? params.forfait_rembobinage_ht : 0;

  // === 9. Total revient ===
  const cout_bat_ht = input.bat ? params.bat_prix_ht : 0;
  const cout_revient_ht =
    matiere.cout_matiere_ht +
    cout_impression_ht +
    cout_operateur_impression_ht +
    cout_decoupe_machine_ht +
    cout_decoupe_operateur_ht +
    cout_cliquage_ht +
    cout_finitions_ht +
    cout_conditionnement_ht +
    params.frais_fixes_ht +
    cout_bat_ht;

  // === 10. Marge ===
  const prix_ht_brut = cout_revient_ht * (1 + params.marge_pct / 100);

  // === 11. Dégressif ===
  const sortedDeg = [...params.degressif].sort((a, b) => b.seuil - a.seuil);
  const deg = sortedDeg.find((d) => input.quantite_etiquettes >= d.seuil);
  const remise_pct = deg?.remise_pct ?? 0;
  let prix_ht = prix_ht_brut * (1 - remise_pct / 100);

  // === 12. Plancher ===
  if (params.prix_plancher_ht !== undefined && prix_ht < params.prix_plancher_ht) {
    warnings.push(`Plancher appliqué : prix relevé à ${params.prix_plancher_ht.toFixed(2)} € HT`);
    prix_ht = params.prix_plancher_ht;
  }

  // === 13. TTC ===
  const prix_ttc = prix_ht * (1 + params.tva_pct / 100);

  // === 14. Récap ===
  const recap = [
    `Bobines — ${materiau.nom} — ${input.forme}`,
    `Quantité : ${input.quantite_etiquettes} étiquette(s)`,
    `Surface unitaire : ${(surface_unitaire_mm2 / 100).toFixed(2)} cm²`,
    `Périmètre unitaire : ${(perimetre_unitaire_mm / 10).toFixed(2)} cm`,
    `Méthode matière : ${matiere.methode}`,
    `Matière : ${matiere.cout_matiere_ht.toFixed(2)} € HT`,
    `Impression : ${(cout_impression_ht + cout_operateur_impression_ht).toFixed(2)} € HT`,
    `Découpe : ${(cout_decoupe_machine_ht + cout_decoupe_operateur_ht + cout_cliquage_ht).toFixed(2)} € HT`,
    `Finitions : ${cout_finitions_ht.toFixed(2)} € HT`,
    `Conditionnement : ${cout_conditionnement_ht.toFixed(2)} € HT (${input.conditionnement})`,
    `Frais fixes : ${params.frais_fixes_ht.toFixed(2)} € HT`,
    input.bat ? `BAT : ${cout_bat_ht.toFixed(2)} € HT` : 'BAT : non',
    `Revient : ${cout_revient_ht.toFixed(2)} € HT`,
    `Marge : ${params.marge_pct} %`,
    remise_pct > 0 ? `Dégressif : -${remise_pct} %` : 'Dégressif : aucun',
    `Prix HT : ${prix_ht.toFixed(2)} €`,
    `Prix TTC : ${prix_ttc.toFixed(2)} €`,
  ].join('\n');

  return {
    surface_unitaire_mm2: round(surface_unitaire_mm2, 2),
    perimetre_unitaire_mm: round(perimetre_unitaire_mm, 2),
    matiere,
    cout_impression_ht: round(cout_impression_ht, 2),
    cout_operateur_impression_ht: round(cout_operateur_impression_ht, 2),
    cout_decoupe_machine_ht: round(cout_decoupe_machine_ht, 2),
    cout_decoupe_operateur_ht: round(cout_decoupe_operateur_ht, 2),
    cout_cliquage_ht: round(cout_cliquage_ht, 2),
    cout_finitions_ht: round(cout_finitions_ht, 2),
    cout_conditionnement_ht: round(cout_conditionnement_ht, 2),
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

// ============================================================
// HELPERS INTERNES
// ============================================================

/**
 * Calcule la surface et le périmètre unitaires selon la forme.
 * Renvoie aussi la largeur/hauteur de la bounding box (pour calepinage).
 */
function computeGeometry(input: BobinesInput): {
  surface_unitaire_mm2: number;
  perimetre_unitaire_mm: number;
  largeur_mm: number;
  hauteur_mm: number;
} {
  switch (input.forme) {
    case 'rectangle': {
      if (
        !input.largeur_mm ||
        !input.hauteur_mm ||
        input.largeur_mm <= 0 ||
        input.hauteur_mm <= 0
      ) {
        throw new BobinesCalcError(
          'Rectangle : largeur et hauteur > 0 requises',
          'INVALID_RECTANGLE_DIMS'
        );
      }
      return {
        surface_unitaire_mm2: input.largeur_mm * input.hauteur_mm,
        perimetre_unitaire_mm: 2 * (input.largeur_mm + input.hauteur_mm),
        largeur_mm: input.largeur_mm,
        hauteur_mm: input.hauteur_mm,
      };
    }
    case 'rond': {
      if (!input.diametre_mm || input.diametre_mm <= 0) {
        throw new BobinesCalcError('Rond : diamètre > 0 requis', 'INVALID_ROND_DIM');
      }
      const rayon = input.diametre_mm / 2;
      return {
        surface_unitaire_mm2: Math.PI * rayon * rayon,
        perimetre_unitaire_mm: 2 * Math.PI * rayon,
        largeur_mm: input.diametre_mm,
        hauteur_mm: input.diametre_mm,
      };
    }
    case 'ovale': {
      if (
        !input.largeur_mm ||
        !input.hauteur_mm ||
        input.largeur_mm <= 0 ||
        input.hauteur_mm <= 0
      ) {
        throw new BobinesCalcError(
          'Ovale : largeur et hauteur > 0 requises',
          'INVALID_OVALE_DIMS'
        );
      }
      const a = input.largeur_mm / 2;
      const b = input.hauteur_mm / 2;
      // Surface : π × a × b
      const surface = Math.PI * a * b;
      // Périmètre : approximation de Ramanujan
      const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
      const perimetre = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      return {
        surface_unitaire_mm2: surface,
        perimetre_unitaire_mm: perimetre,
        largeur_mm: input.largeur_mm,
        hauteur_mm: input.hauteur_mm,
      };
    }
    case 'forme_libre': {
      if (
        !input.surface_libre_mm2 ||
        input.surface_libre_mm2 <= 0 ||
        !input.perimetre_libre_mm ||
        input.perimetre_libre_mm <= 0
      ) {
        throw new BobinesCalcError(
          'Forme libre : surface_libre_mm2 et perimetre_libre_mm requis',
          'MISSING_FORME_LIBRE'
        );
      }
      if (!input.largeur_mm || !input.hauteur_mm) {
        throw new BobinesCalcError(
          'Forme libre : largeur_mm et hauteur_mm requis pour le calepinage',
          'MISSING_FORME_LIBRE_BBOX'
        );
      }
      return {
        surface_unitaire_mm2: input.surface_libre_mm2,
        perimetre_unitaire_mm: input.perimetre_libre_mm,
        largeur_mm: input.largeur_mm,
        hauteur_mm: input.hauteur_mm,
      };
    }
  }
}

/**
 * Calcule le coût matière selon la méthode du matériau :
 * - calepinage : optimise nb étiquettes par largeur rouleau, prend le rouleau le moins cher
 * - m² : multiplie surface totale × prix m² × (1 + gâches)
 */
function computeMatiere(
  materiau: BobinesMateriauConfig,
  quantite: number,
  largeur_mm: number,
  hauteur_mm: number,
  surface_totale_brute_m2: number,
  espace_mm: number,
  gaches_pct: number,
  warnings: string[]
): BobinesMatiereResult {
  let methode = materiau.methode_calcul;

  // Auto : décide selon ce qui est disponible
  if (methode === 'auto') {
    if (materiau.rouleaux.length > 0) methode = 'calepinage';
    else if (materiau.prix_m2_ht !== undefined) methode = 'm2';
    else {
      throw new BobinesCalcError(
        `Matériau ${materiau.nom} : ni rouleaux ni prix m² configurés`,
        'NO_PRICE_CONFIG'
      );
    }
  }

  if (methode === 'calepinage') {
    if (materiau.rouleaux.length === 0) {
      throw new BobinesCalcError(
        `Méthode calepinage demandée mais aucun rouleau configuré pour ${materiau.nom}`,
        'NO_ROULEAUX'
      );
    }

    // Pour chaque rouleau, calcule le coût total et garde le moins cher
    let best: BobinesMatiereResult['rouleau'] | null = null;
    let best_cout = Infinity;

    for (const rouleau of materiau.rouleaux) {
      // Combien d'étiquettes peut-on caler sur la largeur du rouleau ?
      const largeur_avec_espace = largeur_mm + espace_mm;
      const nb_horiz = Math.floor((rouleau.largeur_mm + espace_mm) / largeur_avec_espace);

      if (nb_horiz === 0) {
        warnings.push(
          `Rouleau ${rouleau.largeur_mm}mm trop étroit pour étiquette ${largeur_mm}mm (ignoré)`
        );
        continue;
      }

      // Longueur nécessaire pour produire toutes les étiquettes
      const hauteur_avec_espace = hauteur_mm + espace_mm;
      const nb_lignes = Math.ceil(quantite / nb_horiz);
      const longueur_necessaire_mm = nb_lignes * hauteur_avec_espace;
      // Application des gâches
      const longueur_necessaire_m =
        (longueur_necessaire_mm / 1000) * (1 + gaches_pct / 100);
      const nb_rouleaux = Math.ceil(longueur_necessaire_m / rouleau.longueur_m);
      const cout = nb_rouleaux * rouleau.prix_rouleau_ht;

      if (cout < best_cout) {
        best_cout = cout;
        best = {
          largeur_mm: rouleau.largeur_mm,
          longueur_m: rouleau.longueur_m,
          prix_rouleau_ht: rouleau.prix_rouleau_ht,
          nb_etiquettes_par_largeur: nb_horiz,
          longueur_necessaire_m: round(longueur_necessaire_m, 2),
          nb_rouleaux,
        };
      }
    }

    if (!best) {
      throw new BobinesCalcError(
        `Aucun rouleau ne peut accueillir une étiquette de ${largeur_mm}mm de large`,
        'NO_ROULEAU_COMPATIBLE'
      );
    }

    return {
      methode: 'calepinage',
      cout_matiere_ht: round(best_cout, 2),
      rouleau: best,
    };
  }

  // methode === 'm2'
  if (materiau.prix_m2_ht === undefined) {
    throw new BobinesCalcError(
      `Méthode m² demandée mais prix_m2_ht non configuré pour ${materiau.nom}`,
      'NO_PRICE_M2'
    );
  }

  const surface_totale_avec_gaches_m2 = surface_totale_brute_m2 * (1 + gaches_pct / 100);
  const cout = surface_totale_avec_gaches_m2 * materiau.prix_m2_ht;
  return {
    methode: 'm2',
    cout_matiere_ht: round(cout, 2),
    surface_totale_m2: round(surface_totale_avec_gaches_m2, 4),
  };
}

function calcCoutFinitions(
  finitions_ids: string[],
  catalogue: BobinesFinitionConfig[],
  quantite: number,
  surface_totale_m2: number
): number {
  let total = 0;
  for (const id of finitions_ids) {
    const f = catalogue.find((c) => c.id === id);
    if (!f) {
      throw new BobinesCalcError(`Finition introuvable : ${id}`, 'FINITION_NOT_FOUND');
    }

    let cout = 0;
    switch (f.type) {
      case 'forfait':
        cout = f.prix_ht;
        break;
      case 'unitaire':
        cout = f.prix_ht * quantite;
        break;
      case 'm2':
        cout = f.prix_ht * surface_totale_m2;
        break;
    }

    if (f.sous_traite) {
      if (f.cout_fournisseur_ht === undefined || f.marge_sous_traitance_pct === undefined) {
        throw new BobinesCalcError(
          `Finition sous-traitée mal configurée : ${f.nom}`,
          'INVALID_SOUS_TRAITANCE'
        );
      }
      cout = f.cout_fournisseur_ht * (1 + f.marge_sous_traitance_pct / 100);
    }

    total += cout;
  }
  return total;
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}