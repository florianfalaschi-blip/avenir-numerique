/**
 * Calculateur Brochures.
 * Voir docs/SPEC_Calculateurs.md section 6.
 *
 * Logique :
 * - 2 postes d'impression indépendants : intérieur + couverture
 * - Chaque poste choisit sa techno (auto/offset/numérique) + machine la moins chère
 *   (avec switch auto si techno incompatible papier)
 * - Couverture compte 4 pages → nb_feuilles_interieur = (nb_pages - 4) / 2
 * - Façonnage : machine de la reliure (ou sous-traitance si flag actif)
 * - Pliage : machine séparée requise si nb_pages > seuil_pages_pliage
 * - Finitions sur la couverture (pelliculage par face : × 2 si RV — toujours RV)
 * - Marge effective = prorata des coûts d'impression entre offset et numérique
 */

import type {
  BrochuresInput,
  BrochuresParams,
  BrochuresResult,
  BrochuresImpressionDetail,
  BrochuresMachineImpressionConfig,
  BrochuresPapierConfig,
  BrochuresFinitionConfig,
  BrochuresReliureConfig,
  BrochuresMachineFaconnageConfig,
  BrochuresReliureType,
  BrochuresTechno,
  BrochuresTechnoMode,
  BrochuresCouleur,
  BrochuresPoste,
} from '../types/brochures';
import { calepiner } from './calepinage';

export class BrochuresCalcError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'BrochuresCalcError';
  }
}

export function calcBrochures(input: BrochuresInput, params: BrochuresParams): BrochuresResult {
  const warnings: string[] = [];

  // === 1. Validations basiques ===
  if (input.quantite < 1) {
    throw new BrochuresCalcError('La quantité doit être au moins 1', 'INVALID_QUANTITE');
  }
  if (input.nb_pages < 4) {
    throw new BrochuresCalcError(
      'Le nombre de pages doit être au moins 4 (couverture)',
      'INVALID_NB_PAGES'
    );
  }

  // === 2. Résolution reliure + validation pages ===
  const reliure = params.reliures.find((r) => r.id === input.reliure_id);
  if (!reliure) {
    throw new BrochuresCalcError(`Reliure introuvable : ${input.reliure_id}`, 'RELIURE_NOT_FOUND');
  }
  if (input.nb_pages % reliure.pages_multiple !== 0) {
    throw new BrochuresCalcError(
      `nb_pages (${input.nb_pages}) doit être multiple de ${reliure.pages_multiple} pour ${reliure.nom}`,
      'INVALID_PAGES_MULTIPLE'
    );
  }
  if (input.nb_pages < reliure.pages_min || input.nb_pages > reliure.pages_max) {
    throw new BrochuresCalcError(
      `nb_pages (${input.nb_pages}) doit être entre ${reliure.pages_min} et ${reliure.pages_max} pour ${reliure.nom}`,
      'INVALID_PAGES_RANGE'
    );
  }

  // === 3. Résolution papiers ===
  const papier_interieur = params.papiers.find((p) => p.id === input.papier_interieur_id);
  if (!papier_interieur) {
    throw new BrochuresCalcError(
      `Papier intérieur introuvable : ${input.papier_interieur_id}`,
      'PAPIER_INTERIEUR_NOT_FOUND'
    );
  }
  const papier_couverture = params.papiers.find((p) => p.id === input.papier_couverture_id);
  if (!papier_couverture) {
    throw new BrochuresCalcError(
      `Papier couverture introuvable : ${input.papier_couverture_id}`,
      'PAPIER_COUVERTURE_NOT_FOUND'
    );
  }
  if (papier_interieur.formats_achat.length === 0) {
    throw new BrochuresCalcError(
      `Aucun format d'achat configuré pour ${papier_interieur.nom}`,
      'NO_FORMAT_ACHAT_INTERIEUR'
    );
  }
  if (papier_couverture.formats_achat.length === 0) {
    throw new BrochuresCalcError(
      `Aucun format d'achat configuré pour ${papier_couverture.nom}`,
      'NO_FORMAT_ACHAT_COUVERTURE'
    );
  }

  // === 4. Choix techno pour chaque poste ===
  const has_interior = input.nb_pages > 4;
  const techno_int_res = has_interior
    ? chooseTechno(input.techno_mode_interieur, input.quantite, papier_interieur, params)
    : { techno_choisie: null, switch_auto: false };
  if (techno_int_res.switch_auto) {
    warnings.push(`Techno intérieur changée automatiquement vers ${techno_int_res.techno_choisie}`);
  }
  const techno_couv_res = chooseTechno(
    input.techno_mode_couverture,
    input.quantite,
    papier_couverture,
    params
  );
  if (techno_couv_res.switch_auto) {
    warnings.push(`Techno couverture changée automatiquement vers ${techno_couv_res.techno_choisie}`);
  }

  // === 5. Résolution des dimensions ===
  // Bridage au max des machines des deux technos sélectionnées
  const technos_actives: BrochuresTechno[] = [];
  if (techno_int_res.techno_choisie) technos_actives.push(techno_int_res.techno_choisie);
  technos_actives.push(techno_couv_res.techno_choisie);

  const { largeur_mm, hauteur_mm, bridee } = resolveDimensions(input, params, technos_actives);
  if (bridee) {
    warnings.push(`Dimensions custom bridées au format machine max`);
  }

  // === 6. Évaluation impression intérieur ===
  const nb_feuilles_interieur_par_brochure = has_interior ? (input.nb_pages - 4) / 2 : 0;
  let impression_interieur: BrochuresImpressionDetail | null = null;
  if (has_interior && techno_int_res.techno_choisie) {
    impression_interieur = evaluatePosteImpression(
      'interieur',
      techno_int_res.techno_choisie,
      input.couleur_interieur,
      papier_interieur,
      params,
      largeur_mm,
      hauteur_mm,
      input.quantite * nb_feuilles_interieur_par_brochure
    );
  }

  // === 7. Évaluation impression couverture ===
  const impression_couverture = evaluatePosteImpression(
    'couverture',
    techno_couv_res.techno_choisie,
    input.couleur_couverture,
    papier_couverture,
    params,
    largeur_mm,
    hauteur_mm,
    input.quantite // 1 feuille couverture RV par brochure
  );

  // === 8. Coût façonnage (reliure) ===
  const { cout_faconnage_ht, sous_traite: faconnage_sous_traite } = calcCoutFaconnage(
    reliure,
    params.machines_faconnage,
    input.quantite
  );

  // === 9. Coût pliage si nb_pages > seuil ===
  let cout_pliage_ht = 0;
  if (input.nb_pages > params.seuil_pages_pliage && params.machine_pliage_id && has_interior) {
    const plieuse = params.machines_faconnage.find((m) => m.id === params.machine_pliage_id);
    if (!plieuse) {
      throw new BrochuresCalcError(
        `Machine de pliage introuvable : ${params.machine_pliage_id}`,
        'PLIAGE_MACHINE_NOT_FOUND'
      );
    }
    const nb_feuilles_a_plier = input.quantite * nb_feuilles_interieur_par_brochure;
    const duree_h = nb_feuilles_a_plier / plieuse.vitesse_h;
    cout_pliage_ht =
      duree_h * (plieuse.taux_horaire_ht + plieuse.operateur_taux_horaire_ht) +
      nb_feuilles_a_plier * plieuse.cout_consommables_unitaire_ht;
  } else if (input.nb_pages > params.seuil_pages_pliage && !params.machine_pliage_id) {
    warnings.push(
      `Pliage requis (${input.nb_pages} pages > ${params.seuil_pages_pliage}) mais aucune machine de pliage configurée`
    );
  }

  // === 10. Coût finitions (couverture, toujours RV) ===
  const surface_couverture_m2 = (largeur_mm * hauteur_mm) / 1_000_000;
  const surface_couverture_totale_m2 = surface_couverture_m2 * input.quantite;
  const cout_finitions_ht = calcCoutFinitions(
    input.finitions_ids,
    params.finitions,
    input.quantite,
    surface_couverture_totale_m2
  );

  // === 11. Cumul ===
  const cout_impression_interieur_ht = impression_interieur
    ? impression_interieur.cout_papier_ht +
      impression_interieur.cout_machine_ht +
      impression_interieur.cout_operateur_ht
    : 0;
  const cout_impression_couverture_ht =
    impression_couverture.cout_papier_ht +
    impression_couverture.cout_machine_ht +
    impression_couverture.cout_operateur_ht;

  const cout_bat_ht = input.bat ? params.bat_prix_ht : 0;
  const cout_revient_ht =
    cout_impression_interieur_ht +
    cout_impression_couverture_ht +
    cout_faconnage_ht +
    cout_pliage_ht +
    cout_finitions_ht +
    params.frais_fixes_ht +
    cout_bat_ht;

  // === 12. Marge effective : prorata coûts impression offset/num ===
  const cout_offset =
    (impression_interieur && impression_interieur.techno === 'offset'
      ? cout_impression_interieur_ht
      : 0) + (impression_couverture.techno === 'offset' ? cout_impression_couverture_ht : 0);
  const cout_num =
    (impression_interieur && impression_interieur.techno === 'numerique'
      ? cout_impression_interieur_ht
      : 0) + (impression_couverture.techno === 'numerique' ? cout_impression_couverture_ht : 0);

  let marge_pct: number;
  const total_impression = cout_offset + cout_num;
  if (total_impression === 0) {
    // Cas dégénéré (improbable) : on prend la marge numérique
    marge_pct = params.marge_pct_numerique;
  } else {
    const part_offset = cout_offset / total_impression;
    marge_pct =
      part_offset * params.marge_pct_offset + (1 - part_offset) * params.marge_pct_numerique;
  }

  // === 12bis. Calcul de l'épaisseur estimée ===
  const thickness = computeBrochureThickness(
    input.nb_pages,
    papier_interieur,
    papier_couverture,
    reliure.type
  );

  // === 13. Prix HT brut, dégressif, plancher, TTC ===
  const prix_ht_brut = cout_revient_ht * (1 + marge_pct / 100);

  const sortedDeg = [...params.degressif].sort((a, b) => b.seuil - a.seuil);
  const deg = sortedDeg.find((d) => input.quantite >= d.seuil);
  const remise_pct = deg?.remise_pct ?? 0;
  let prix_ht = prix_ht_brut * (1 - remise_pct / 100);

  if (params.prix_plancher_ht !== undefined && prix_ht < params.prix_plancher_ht) {
    warnings.push(`Plancher appliqué : prix relevé à ${params.prix_plancher_ht.toFixed(2)} € HT`);
    prix_ht = params.prix_plancher_ht;
  }

  const prix_ttc = prix_ht * (1 + params.tva_pct / 100);

  // === 14. Récap ===
  const lignes = [
    `Brochure ${largeur_mm}×${hauteur_mm} mm — ${input.nb_pages} pages — ${reliure.nom}`,
    `Quantité : ${input.quantite}`,
    `Épaisseur du dos : ${thickness.epaisseur_mm.toFixed(2)} mm (±10%)`,
  ];
  if (impression_interieur) {
    lignes.push(
      `Intérieur : ${impression_interieur.machine_nom} (${impression_interieur.techno}, ${input.couleur_interieur}) — ${nb_feuilles_interieur_par_brochure} feuilles/brochure × ${input.quantite}`,
      `  Papier ${papier_interieur.nom} ${papier_interieur.grammage}g : ${impression_interieur.cout_papier_ht.toFixed(2)} € HT`,
      `  Machine : ${impression_interieur.cout_machine_ht.toFixed(2)} € HT`,
      `  Opérateur : ${impression_interieur.cout_operateur_ht.toFixed(2)} € HT`
    );
  } else {
    lignes.push(`Intérieur : aucun (couverture seule)`);
  }
  lignes.push(
    `Couverture : ${impression_couverture.machine_nom} (${impression_couverture.techno}, ${input.couleur_couverture})`,
    `  Papier ${papier_couverture.nom} ${papier_couverture.grammage}g : ${impression_couverture.cout_papier_ht.toFixed(2)} € HT`,
    `  Machine : ${impression_couverture.cout_machine_ht.toFixed(2)} € HT`,
    `  Opérateur : ${impression_couverture.cout_operateur_ht.toFixed(2)} € HT`,
    `Façonnage (${reliure.nom}${faconnage_sous_traite ? ' — sous-traité' : ''}) : ${cout_faconnage_ht.toFixed(2)} € HT`,
    cout_pliage_ht > 0
      ? `Pliage : ${cout_pliage_ht.toFixed(2)} € HT`
      : 'Pliage : non requis',
    `Finitions : ${cout_finitions_ht.toFixed(2)} € HT`,
    `Frais fixes : ${params.frais_fixes_ht.toFixed(2)} € HT`,
    input.bat ? `BAT : ${cout_bat_ht.toFixed(2)} € HT` : 'BAT : non',
    `Revient : ${cout_revient_ht.toFixed(2)} € HT`,
    `Marge effective : ${marge_pct.toFixed(2)} % (prorata techno)`,
    remise_pct > 0 ? `Dégressif : -${remise_pct} %` : 'Dégressif : aucun',
    `Prix HT : ${prix_ht.toFixed(2)} €`,
    `Prix TTC : ${prix_ttc.toFixed(2)} €`
  );

  return {
    largeur_finale_mm: largeur_mm,
    hauteur_finale_mm: hauteur_mm,
    nb_feuilles_interieur_par_brochure,
    impression_interieur,
    impression_couverture,
    techno_switch_interieur: techno_int_res.switch_auto,
    techno_switch_couverture: techno_couv_res.switch_auto,
    cout_faconnage_ht: round(cout_faconnage_ht, 2),
    faconnage_sous_traite,
    cout_pliage_ht: round(cout_pliage_ht, 2),
    epaisseur_mm: thickness.epaisseur_mm,
    epaisseur_detail: thickness.epaisseur_detail,
    cout_finitions_ht: round(cout_finitions_ht, 2),
    frais_fixes_ht: round(params.frais_fixes_ht, 2),
    cout_bat_ht: round(cout_bat_ht, 2),
    cout_revient_ht: round(cout_revient_ht, 2),
    marge_pct: round(marge_pct, 2),
    prix_ht_brut: round(prix_ht_brut, 2),
    remise_pct,
    prix_ht: round(prix_ht, 2),
    tva_pct: params.tva_pct,
    prix_ttc: round(prix_ttc, 2),
    recap: lignes.join('\n'),
    warnings,
  };
}

// ============================================================
// HELPERS INTERNES
// ============================================================

function chooseTechno(
  mode: BrochuresTechnoMode,
  quantite: number,
  papier: BrochuresPapierConfig,
  params: BrochuresParams
): { techno_choisie: BrochuresTechno; switch_auto: boolean } {
  let techno: BrochuresTechno;
  if (mode === 'auto') {
    techno = quantite < params.seuil_offset_quantite_min ? 'numerique' : 'offset';
  } else {
    techno = mode;
  }

  if (!papier.compatible_techno.includes(techno)) {
    const fallback = papier.compatible_techno[0];
    if (!fallback) {
      throw new BrochuresCalcError(
        `Le papier ${papier.nom} n'a aucune techno compatible`,
        'PAPIER_NO_TECHNO'
      );
    }
    return { techno_choisie: fallback, switch_auto: true };
  }

  return { techno_choisie: techno, switch_auto: false };
}

function resolveDimensions(
  input: BrochuresInput,
  params: BrochuresParams,
  technos_actives: BrochuresTechno[]
): { largeur_mm: number; hauteur_mm: number; bridee: boolean } {
  if (input.dimension_mode === 'standard') {
    if (!input.taille_standard) {
      throw new BrochuresCalcError('Taille standard manquante', 'MISSING_TAILLE_STANDARD');
    }
    const fmt = params.formats_standards.find((f) => f.id === input.taille_standard);
    if (!fmt) {
      throw new BrochuresCalcError(
        `Taille standard inconnue : ${input.taille_standard}`,
        'INVALID_TAILLE_STANDARD'
      );
    }
    return { largeur_mm: fmt.largeur_mm, hauteur_mm: fmt.hauteur_mm, bridee: false };
  }

  if (
    input.largeur_mm === undefined ||
    input.hauteur_mm === undefined ||
    input.largeur_mm <= 0 ||
    input.hauteur_mm <= 0
  ) {
    throw new BrochuresCalcError('Dimensions custom invalides', 'INVALID_CUSTOM_DIMS');
  }

  const machinesDeTechnos = params.machines_impression.filter(
    (m) => m.actif && technos_actives.includes(m.techno)
  );
  if (machinesDeTechnos.length === 0) {
    return { largeur_mm: input.largeur_mm, hauteur_mm: input.hauteur_mm, bridee: false };
  }

  const max_largeur = Math.max(...machinesDeTechnos.map((m) => m.format_max_mm.largeur));
  const max_hauteur = Math.max(...machinesDeTechnos.map((m) => m.format_max_mm.hauteur));

  const largeur_finale = Math.min(input.largeur_mm, max_largeur);
  const hauteur_finale = Math.min(input.hauteur_mm, max_hauteur);
  const bridee = largeur_finale !== input.largeur_mm || hauteur_finale !== input.hauteur_mm;

  return { largeur_mm: largeur_finale, hauteur_mm: hauteur_finale, bridee };
}

/**
 * Évalue un poste d'impression (intérieur ou couverture).
 * Toutes les impressions de brochure sont en recto-verso.
 */
function evaluatePosteImpression(
  poste: BrochuresPoste,
  techno: BrochuresTechno,
  couleur: BrochuresCouleur,
  papier: BrochuresPapierConfig,
  params: BrochuresParams,
  largeur_mm: number,
  hauteur_mm: number,
  nb_feuilles_brut_total: number
): BrochuresImpressionDetail {
  const machinesCompatibles = params.machines_impression.filter(
    (m) =>
      m.actif &&
      m.techno === techno &&
      largeur_mm <= m.format_max_mm.largeur &&
      hauteur_mm <= m.format_max_mm.hauteur
  );

  if (machinesCompatibles.length === 0) {
    throw new BrochuresCalcError(
      `Aucune machine ${techno} compatible avec ${largeur_mm}×${hauteur_mm} mm pour ${poste}`,
      'NO_MACHINE_COMPATIBLE'
    );
  }

  let best: {
    machine: BrochuresMachineImpressionConfig;
    detail: BrochuresImpressionDetail;
    cout_total: number;
  } | null = null;

  for (const machine of machinesCompatibles) {
    const detail = evaluateMachineForPoste(
      machine,
      papier,
      poste,
      couleur,
      largeur_mm,
      hauteur_mm,
      nb_feuilles_brut_total
    );
    if (!detail) continue;
    const cout_total = detail.cout_papier_ht + detail.cout_machine_ht + detail.cout_operateur_ht;
    if (!best || cout_total < best.cout_total) {
      best = { machine, detail, cout_total };
    }
  }

  if (!best) {
    throw new BrochuresCalcError(
      `Aucun format papier compatible pour ${poste} sur les machines ${techno}`,
      'NO_PAPIER_FORMAT_COMPATIBLE'
    );
  }
  return best.detail;
}

function evaluateMachineForPoste(
  machine: BrochuresMachineImpressionConfig,
  papier: BrochuresPapierConfig,
  poste: BrochuresPoste,
  couleur: BrochuresCouleur,
  largeur_mm: number,
  hauteur_mm: number,
  nb_feuilles_brut_total: number
): BrochuresImpressionDetail | null {
  let bestPapierEval: {
    format: (typeof papier.formats_achat)[number];
    nb_poses: number;
    cout_papier_ht: number;
    nb_feuilles_machine_brut: number;
    nb_feuilles_machine_avec_gaches: number;
  } | null = null;

  for (const format of papier.formats_achat) {
    const format_l = Math.min(format.largeur_mm, machine.format_max_mm.largeur);
    const format_h = Math.min(format.hauteur_mm, machine.format_max_mm.hauteur);

    const cal = calepiner({
      piece_largeur_cm: largeur_mm / 10,
      piece_hauteur_cm: hauteur_mm / 10,
      format_largeur_cm: format_l / 10,
      format_hauteur_cm: format_h / 10,
    });

    if (cal.nb_poses === 0) continue;

    const nb_feuilles_machine_brut = Math.ceil(nb_feuilles_brut_total / cal.nb_poses);
    const nb_feuilles_machine_avec_gaches = Math.ceil(
      nb_feuilles_machine_brut * (1 + machine.gaches_pct / 100)
    );
    const prix_feuille = format.prix_paquet_ht / format.feuilles_par_paquet;
    const cout_papier_ht = nb_feuilles_machine_avec_gaches * prix_feuille;

    if (!bestPapierEval || cout_papier_ht < bestPapierEval.cout_papier_ht) {
      bestPapierEval = {
        format,
        nb_poses: cal.nb_poses,
        cout_papier_ht,
        nb_feuilles_machine_brut,
        nb_feuilles_machine_avec_gaches,
      };
    }
  }

  if (!bestPapierEval) return null;

  // Coût machine : RV systématique pour brochures
  const duree_impression_h = bestPapierEval.nb_feuilles_machine_avec_gaches / machine.vitesse_feuilles_h;

  let cout_calage_total = 0;
  if (machine.techno === 'offset') {
    const nb_couleurs = couleur === 'quadri' ? 4 : 1;
    cout_calage_total = machine.cout_calage_ht * nb_couleurs;
    if (!machine.recto_verso_calage_unique) {
      cout_calage_total *= 2;
    }
  }

  // RV double le temps machine et opérateur
  const cout_machine_ht = cout_calage_total + 2 * duree_impression_h * machine.taux_horaire_ht;
  const cout_operateur_ht = 2 * duree_impression_h * machine.operateur_taux_horaire_ht;

  return {
    poste,
    machine_id: machine.id,
    machine_nom: machine.nom,
    techno: machine.techno,
    couleur,
    format_papier_largeur_mm: bestPapierEval.format.largeur_mm,
    format_papier_hauteur_mm: bestPapierEval.format.hauteur_mm,
    nb_poses_par_feuille: bestPapierEval.nb_poses,
    nb_feuilles_brut: bestPapierEval.nb_feuilles_machine_brut,
    nb_feuilles_avec_gaches: bestPapierEval.nb_feuilles_machine_avec_gaches,
    cout_papier_ht: round(bestPapierEval.cout_papier_ht, 2),
    cout_machine_ht: round(cout_machine_ht, 2),
    cout_operateur_ht: round(cout_operateur_ht, 2),
  };
}

function calcCoutFaconnage(
  reliure: BrochuresReliureConfig,
  machines: BrochuresMachineFaconnageConfig[],
  quantite: number
): { cout_faconnage_ht: number; sous_traite: boolean } {
  if (reliure.sous_traite) {
    if (
      reliure.cout_fournisseur_brochure_ht === undefined ||
      reliure.marge_sous_traitance_pct === undefined
    ) {
      throw new BrochuresCalcError(
        `Reliure sous-traitée mal configurée : ${reliure.nom}`,
        'INVALID_SOUS_TRAITANCE'
      );
    }
    const cout =
      reliure.cout_fournisseur_brochure_ht *
      quantite *
      (1 + reliure.marge_sous_traitance_pct / 100);
    return { cout_faconnage_ht: cout, sous_traite: true };
  }

  const machine = machines.find((m) => m.id === reliure.machine_faconnage_id);
  if (!machine) {
    throw new BrochuresCalcError(
      `Machine façonnage introuvable : ${reliure.machine_faconnage_id}`,
      'FACONNAGE_MACHINE_NOT_FOUND'
    );
  }
  const duree_h = quantite / machine.vitesse_h;
  const cout =
    duree_h * (machine.taux_horaire_ht + machine.operateur_taux_horaire_ht) +
    quantite * machine.cout_consommables_unitaire_ht;
  return { cout_faconnage_ht: cout, sous_traite: false };
}

function calcCoutFinitions(
  finitions_ids: string[],
  catalogue: BrochuresFinitionConfig[],
  quantite: number,
  surface_totale_m2: number
): number {
  let total = 0;
  for (const id of finitions_ids) {
    const f = catalogue.find((c) => c.id === id);
    if (!f) {
      throw new BrochuresCalcError(`Finition introuvable : ${id}`, 'FINITION_NOT_FOUND');
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
      case 'par_face':
        // Couverture toujours en RV → × 2
        cout = f.prix_ht * surface_totale_m2 * 2;
        break;
    }

    if (f.sous_traite) {
      if (f.cout_fournisseur_ht === undefined || f.marge_sous_traitance_pct === undefined) {
        throw new BrochuresCalcError(
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

/**
 * Main par défaut (épaisseur en µm par g/m²) si non spécifiée sur le papier.
 * Valeur calibrée pour papier offset standard. Voir `BrochuresPapierConfig.main`.
 */
export const DEFAULT_PAPIER_MAIN = 1.3;

/**
 * Supplément d'épaisseur (en mm) apporté par la reliure.
 * - agrafe : 0 (agrafes 2 boucles ~0.5mm écrasées, négligeable)
 * - dos_carre_colle : 0.5 mm (couche de colle PUR)
 * - dos_carre_cousu : 0.5 mm (colle + fils)
 * - spirale : 1.0 mm (boucles plastique métal Ø ~6mm écrasées)
 * - wire_o : 1.0 mm (boucles métal double Ø ~6mm écrasées)
 */
export const SUPPLEMENT_RELIURE_MM: Record<BrochuresReliureType, number> = {
  agrafe: 0,
  dos_carre_colle: 0.5,
  dos_carre_cousu: 0.5,
  spirale: 1.0,
  wire_o: 1.0,
};

/**
 * Calcule l'épaisseur estimée d'une brochure finie.
 *
 * Formule :
 *   épaisseur_papier = (nb_feuilles_int × grammage_int × main_int +
 *                       1 × grammage_couv × main_couv) / 1000   [mm]
 *   épaisseur_totale = épaisseur_papier + supplément_reliure
 *
 * Où :
 *   - nb_feuilles_int = (nb_pages - 4) / 2 (4 pages couverture, 2 pages par feuille)
 *   - main = épaisseur réelle du papier en µm par g/m² (défaut 1.3)
 *
 * Précision : ±10% (la main réelle dépend de l'humidité, du calage, du satinage).
 */
export function computeBrochureThickness(
  nb_pages: number,
  papier_interieur: BrochuresPapierConfig,
  papier_couverture: BrochuresPapierConfig,
  reliure_type: BrochuresReliureType
): {
  epaisseur_mm: number;
  epaisseur_detail: {
    epaisseur_papier_interieur_mm: number;
    epaisseur_papier_couverture_mm: number;
    supplement_reliure_mm: number;
    main_utilisee: number;
  };
} {
  const main_int = papier_interieur.main ?? DEFAULT_PAPIER_MAIN;
  const main_couv = papier_couverture.main ?? DEFAULT_PAPIER_MAIN;
  const nb_feuilles_int = Math.max(0, (nb_pages - 4) / 2);

  const epaisseur_papier_interieur_mm =
    (nb_feuilles_int * papier_interieur.grammage * main_int) / 1000;
  const epaisseur_papier_couverture_mm =
    (1 * papier_couverture.grammage * main_couv) / 1000;
  const supplement_reliure_mm = SUPPLEMENT_RELIURE_MM[reliure_type] ?? 0;

  const epaisseur_mm =
    epaisseur_papier_interieur_mm +
    epaisseur_papier_couverture_mm +
    supplement_reliure_mm;

  return {
    epaisseur_mm: round(epaisseur_mm, 2),
    epaisseur_detail: {
      epaisseur_papier_interieur_mm: round(epaisseur_papier_interieur_mm, 2),
      epaisseur_papier_couverture_mm: round(epaisseur_papier_couverture_mm, 2),
      supplement_reliure_mm,
      // Si int et couv ont des mains différentes, expose la moyenne pour info
      main_utilisee:
        main_int === main_couv ? main_int : round((main_int + main_couv) / 2, 2),
    },
  };
}
