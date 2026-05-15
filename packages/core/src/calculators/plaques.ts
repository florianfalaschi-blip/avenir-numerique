/**
 * Calculateur Plaques / Signalétique.
 * Voir docs/SPEC_Calculateurs.md section 3.
 */

import type {
  PlaquesInput,
  PlaquesParams,
  PlaquesResult,
  CalepinageResult,
  FinitionConfig,
  TailleStandard,
  MateriauConfig,
} from '../types/plaques';
import { calepiner } from './calepinage';

export class PlaquesCalcError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'PlaquesCalcError';
  }
}

export function calcPlaques(input: PlaquesInput, params: PlaquesParams): PlaquesResult {
  // === 1. Validations basiques ===
  if (input.quantite < 1) {
    throw new PlaquesCalcError('La quantité doit être au moins 1', 'INVALID_QUANTITE');
  }

  // === 2. Résolution des dimensions ===
  const { largeur_cm, hauteur_cm } = resolveDimensions(input, params);

  // === 3. Résolution du matériau ===
  const materiau = params.materiaux.find((m) => m.id === input.materiau_id);
  if (!materiau) {
    throw new PlaquesCalcError(`Matériau introuvable : ${input.materiau_id}`, 'MATERIAU_NOT_FOUND');
  }
  if (materiau.formats_achat.length === 0) {
    throw new PlaquesCalcError(
      `Aucun format d'achat configuré pour ${materiau.nom}`,
      'NO_FORMAT_ACHAT'
    );
  }

  // === 4. Validations machines ===
  if (params.machine_impression.vitesse_m2_h <= 0) {
    throw new PlaquesCalcError('Vitesse machine impression invalide', 'INVALID_MACHINE_SPEED');
  }

  // === 5. Calepinage : choix du format d'achat optimal ===
  const calepinage = chooseBestCalepinage(largeur_cm, hauteur_cm, input.quantite, materiau);

  // === 6. Coût impression (durée × taux) ===
  const surface_unitaire_m2 = (largeur_cm * hauteur_cm) / 10_000;
  const surface_totale_m2 = surface_unitaire_m2 * input.quantite;
  const duree_impression_h = surface_totale_m2 / params.machine_impression.vitesse_m2_h;
  const cout_impression_ht = duree_impression_h * params.machine_impression.taux_horaire_ht;

  // === 7. Coût découpe ===
  const cout_decoupe_ht = calcCoutDecoupe(input, largeur_cm, hauteur_cm, params);

  // === 8. Coût finitions ===
  const cout_finitions_ht = calcCoutFinitions(
    input,
    params.finitions,
    surface_totale_m2
  );

  // === 9. Total revient ===
  const cout_bat_ht = input.bat ? params.bat_prix_ht : 0;
  const cout_revient_ht =
    calepinage.cout_matiere_ht +
    cout_impression_ht +
    cout_decoupe_ht +
    cout_finitions_ht +
    params.frais_fixes_ht +
    cout_bat_ht;

  // === 10. Marge ===
  const prix_ht_brut = cout_revient_ht * (1 + params.marge_pct / 100);

  // === 11. Dégressif ===
  const sortedDegressif = [...params.degressif].sort((a, b) => b.seuil - a.seuil);
  const degressifApplied = sortedDegressif.find((d) => input.quantite >= d.seuil);
  const remise_pct = degressifApplied?.remise_pct ?? 0;
  let prix_ht = prix_ht_brut * (1 - remise_pct / 100);

  // === 12. Plancher ===
  const warnings: string[] = [];
  if (params.prix_plancher_ht !== undefined && prix_ht < params.prix_plancher_ht) {
    warnings.push(
      `Plancher appliqué : prix relevé à ${params.prix_plancher_ht.toFixed(2)} € HT`
    );
    prix_ht = params.prix_plancher_ht;
  }

  // === 13. TTC ===
  const prix_ttc = prix_ht * (1 + params.tva_pct / 100);

  // === 14. Récap ===
  const recap = [
    `Plaques ${largeur_cm} × ${hauteur_cm} cm — ${materiau.nom}`,
    `Quantité : ${input.quantite}`,
    `Calepinage : ${calepinage.nb_poses_par_format} pose(s)/format → ${calepinage.nb_formats_brut} format(s) acheté(s)`,
    `Matière : ${calepinage.cout_matiere_ht.toFixed(2)} € HT`,
    `Impression : ${cout_impression_ht.toFixed(2)} € HT`,
    `Découpe : ${cout_decoupe_ht.toFixed(2)} € HT`,
    `Finitions : ${cout_finitions_ht.toFixed(2)} € HT`,
    `Frais fixes : ${params.frais_fixes_ht.toFixed(2)} € HT`,
    input.bat ? `BAT : ${cout_bat_ht.toFixed(2)} € HT` : 'BAT : non',
    `Revient : ${cout_revient_ht.toFixed(2)} € HT`,
    `Marge : ${params.marge_pct} %`,
    remise_pct > 0 ? `Dégressif : -${remise_pct} %` : 'Dégressif : aucun',
    `Prix HT : ${prix_ht.toFixed(2)} €`,
    `Prix TTC : ${prix_ttc.toFixed(2)} €`,
  ].join('\n');

  return {
    largeur_finale_cm: largeur_cm,
    hauteur_finale_cm: hauteur_cm,
    surface_unitaire_m2: round(surface_unitaire_m2, 4),
    calepinage,
    cout_impression_ht: round(cout_impression_ht, 2),
    cout_decoupe_ht: round(cout_decoupe_ht, 2),
    cout_finitions_ht: round(cout_finitions_ht, 2),
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

function resolveDimensions(
  input: PlaquesInput,
  params: PlaquesParams
): { largeur_cm: number; hauteur_cm: number } {
  if (input.dimension_mode === 'standard') {
    if (!input.taille_standard) {
      throw new PlaquesCalcError('Taille standard manquante', 'MISSING_TAILLE_STANDARD');
    }
    const taille = params.tailles_standards.find((t) => t.id === input.taille_standard);
    if (!taille) {
      throw new PlaquesCalcError(
        `Taille standard inconnue : ${input.taille_standard}`,
        'INVALID_TAILLE_STANDARD'
      );
    }
    return { largeur_cm: taille.largeur_cm, hauteur_cm: taille.hauteur_cm };
  }
  // custom
  if (
    input.largeur_cm === undefined ||
    input.hauteur_cm === undefined ||
    input.largeur_cm <= 0 ||
    input.hauteur_cm <= 0
  ) {
    throw new PlaquesCalcError(
      'Dimensions custom invalides ou manquantes',
      'INVALID_CUSTOM_DIMS'
    );
  }
  return { largeur_cm: input.largeur_cm, hauteur_cm: input.hauteur_cm };
}

/**
 * Pour chaque format d'achat disponible, calcule le coût total
 * et retient le format avec le meilleur ratio prix/quantité produite.
 */
function chooseBestCalepinage(
  piece_largeur_cm: number,
  piece_hauteur_cm: number,
  quantite: number,
  materiau: MateriauConfig
): CalepinageResult {
  let best: CalepinageResult | null = null;

  for (const format of materiau.formats_achat) {
    const cal = calepiner({
      piece_largeur_cm,
      piece_hauteur_cm,
      format_largeur_cm: format.largeur_cm,
      format_hauteur_cm: format.hauteur_cm,
    });

    if (cal.nb_poses === 0) continue; // pièce trop grande pour ce format

    const nb_formats_brut = Math.ceil(quantite / cal.nb_poses);
    const cout_matiere_ht = nb_formats_brut * format.prix_unite_ht;

    const candidate: CalepinageResult = {
      format_brut_largeur_cm: format.largeur_cm,
      format_brut_hauteur_cm: format.hauteur_cm,
      format_brut_prix_ht: format.prix_unite_ht,
      nb_poses_par_format: cal.nb_poses,
      nb_formats_brut,
      cout_matiere_ht,
      rotation_appliquee: cal.rotation_appliquee,
    };

    if (!best || candidate.cout_matiere_ht < best.cout_matiere_ht) {
      best = candidate;
    }
  }

  if (!best) {
    throw new PlaquesCalcError(
      `Aucun format d'achat ne permet de produire la pièce demandée (${piece_largeur_cm}×${piece_hauteur_cm} cm)`,
      'CALEPINAGE_IMPOSSIBLE'
    );
  }

  return best;
}

function calcCoutDecoupe(
  input: PlaquesInput,
  largeur_cm: number,
  hauteur_cm: number,
  params: PlaquesParams
): number {
  let metres_decoupe = 0;

  if (input.decoupe_mode === 'pleine_plaque') {
    // Périmètre = 2 × (L + H), converti en mètres
    const perimetre_m = (2 * (largeur_cm + hauteur_cm)) / 100;
    metres_decoupe = perimetre_m * input.quantite;
  } else {
    // forme : saisie manuelle obligatoire
    if (input.longueur_decoupe_forme_m === undefined || input.longueur_decoupe_forme_m < 0) {
      throw new PlaquesCalcError(
        'Découpe forme : longueur en mètres obligatoire',
        'MISSING_DECOUPE_FORME'
      );
    }
    metres_decoupe = input.longueur_decoupe_forme_m * input.quantite;
  }

  const cout = metres_decoupe * params.machine_decoupe.prix_metre_lineaire_ht;
  return Math.max(cout, params.machine_decoupe.forfait_minimum_ht);
}

function calcCoutFinitions(
  input: PlaquesInput,
  catalogue: FinitionConfig[],
  surface_totale_m2: number
): number {
  let total = 0;
  for (const id of input.finitions_ids) {
    const f = catalogue.find((c) => c.id === id);
    if (!f) {
      throw new PlaquesCalcError(`Finition introuvable : ${id}`, 'FINITION_NOT_FOUND');
    }
    switch (f.type) {
      case 'forfait':
        total += f.prix_ht;
        break;
      case 'unitaire':
        total += f.prix_ht * input.quantite;
        break;
      case 'm2':
        total += f.prix_ht * surface_totale_m2;
        break;
      case 'par_oeillet':
        if (input.nb_oeillets === undefined || input.nb_oeillets < 0) {
          throw new PlaquesCalcError(
            `Finition "${f.nom}" : nb_oeillets requis`,
            'MISSING_NB_OEILLETS'
          );
        }
        total += f.prix_ht * input.nb_oeillets;
        break;
    }
  }
  return total;
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}