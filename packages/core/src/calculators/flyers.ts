/**
 * Calculateur Flyers / Affiches.
 * Voir docs/SPEC_Calculateurs.md section 4.
 *
 * Logique :
 * - Choix techno (auto/offset/numerique) avec switch auto si incompatible papier
 * - Sélection de la machine la moins chère pour le CLIENT (PV final mini)
 * - Calepinage automatique avec rotation 90°
 * - Sélection du format papier le moins cher par pose
 * - Pelliculage facturé par face (× 2 si RV)
 * - Sous-traitance finitions avec marge spécifique
 */

import type {
  FlyersInput,
  FlyersParams,
  FlyersResult,
  FlyersImpressionDetail,
  FlyersMachineConfig,
  FlyersPapierConfig,
  FlyersFinitionConfig,
  Techno,
} from '../types/flyers';
import { calepiner } from './calepinage';

export class FlyersCalcError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'FlyersCalcError';
  }
}

export function calcFlyers(input: FlyersInput, params: FlyersParams): FlyersResult {
  // === 1. Validations basiques ===
  if (input.quantite < 1) {
    throw new FlyersCalcError('La quantité doit être au moins 1', 'INVALID_QUANTITE');
  }

  // === 2. Résolution du papier ===
  const papier = params.papiers.find((p) => p.id === input.papier_id);
  if (!papier) {
    throw new FlyersCalcError(`Papier introuvable : ${input.papier_id}`, 'PAPIER_NOT_FOUND');
  }
  if (papier.formats_achat.length === 0) {
    throw new FlyersCalcError(
      `Aucun format d'achat configuré pour ${papier.nom}`,
      'NO_FORMAT_ACHAT'
    );
  }

  const warnings: string[] = [];

  // === 3. Choix de la techno ===
  const { techno_choisie, switch_auto } = chooseTechno(input, papier, params);
  if (switch_auto) {
    warnings.push(
      `Techno changée automatiquement vers ${techno_choisie} pour compatibilité avec le papier`
    );
  }

  // === 4. Résolution des dimensions (avec bridage format machine max) ===
  const { largeur_mm, hauteur_mm, bridee } = resolveDimensions(input, params, techno_choisie);
  if (bridee) {
    warnings.push(`Dimensions custom bridées au format machine max`);
  }

  // === 5. Sélection de la meilleure machine (la moins chère pour le client) ===
  // On évalue chaque machine compatible et garde celle qui minimise le PV final.
  const machinesCompatibles = params.machines.filter(
    (m) =>
      m.actif &&
      m.techno === techno_choisie &&
      largeur_mm <= m.format_max_mm.largeur &&
      hauteur_mm <= m.format_max_mm.hauteur
  );

  if (machinesCompatibles.length === 0) {
    throw new FlyersCalcError(
      `Aucune machine ${techno_choisie} compatible avec les dimensions ${largeur_mm}×${hauteur_mm} mm`,
      'NO_MACHINE_COMPATIBLE'
    );
  }

  let bestMachineEval: ReturnType<typeof evaluateMachine> | null = null;
  for (const machine of machinesCompatibles) {
    const ev = evaluateMachine(machine, input, params, papier, largeur_mm, hauteur_mm);
    if (!bestMachineEval || ev.prix_ht < bestMachineEval.prix_ht) {
      bestMachineEval = ev;
    }
  }

  if (!bestMachineEval) {
    throw new FlyersCalcError('Impossible de sélectionner une machine', 'NO_MACHINE_SELECTED');
  }

  // === 6. Recompose le résultat à partir de la meilleure évaluation ===
  const {
    machine,
    impression,
    cout_finitions_ht,
    cout_bat_ht,
    cout_revient_ht,
    marge_pct,
    prix_ht_brut,
    remise_pct,
    prix_ht: prix_ht_raw,
    prix_ttc: _ttc_raw,
  } = bestMachineEval;

  // === 7. Plancher de sécurité ===
  let prix_ht = prix_ht_raw;
  if (params.prix_plancher_ht !== undefined && prix_ht < params.prix_plancher_ht) {
    warnings.push(`Plancher appliqué : prix relevé à ${params.prix_plancher_ht.toFixed(2)} € HT`);
    prix_ht = params.prix_plancher_ht;
  }

  const prix_ttc = prix_ht * (1 + params.tva_pct / 100);

  // === 8. Récap ===
  const recap = [
    `Flyers ${largeur_mm}×${hauteur_mm} mm — ${papier.nom} ${papier.grammage}g`,
    `Quantité : ${input.quantite} — ${input.recto_verso === 'rv' ? 'Recto/Verso' : 'Recto seul'}`,
    `Techno : ${techno_choisie}${switch_auto ? ' (switch auto)' : ''}`,
    `Machine : ${machine.nom}`,
    `Calepinage : ${impression.nb_poses_par_feuille} pose(s)/feuille → ${impression.nb_feuilles_avec_gaches} feuille(s)`,
    `Papier : ${impression.cout_papier_ht.toFixed(2)} € HT`,
    `Machine : ${impression.cout_machine_ht.toFixed(2)} € HT`,
    `Opérateur : ${impression.cout_operateur_ht.toFixed(2)} € HT`,
    `Finitions : ${cout_finitions_ht.toFixed(2)} € HT`,
    `Frais fixes : ${params.frais_fixes_ht.toFixed(2)} € HT`,
    input.bat ? `BAT : ${cout_bat_ht.toFixed(2)} € HT` : 'BAT : non',
    `Revient : ${cout_revient_ht.toFixed(2)} € HT`,
    `Marge ${techno_choisie} : ${marge_pct} %`,
    remise_pct > 0 ? `Dégressif : -${remise_pct} %` : 'Dégressif : aucun',
    `Prix HT : ${prix_ht.toFixed(2)} €`,
    `Prix TTC : ${prix_ttc.toFixed(2)} €`,
  ].join('\n');

  return {
    largeur_finale_mm: largeur_mm,
    hauteur_finale_mm: hauteur_mm,
    techno_choisie,
    techno_switch_auto: switch_auto,
    impression,
    cout_finitions_ht: round(cout_finitions_ht, 2),
    frais_fixes_ht: round(params.frais_fixes_ht, 2),
    cout_bat_ht: round(cout_bat_ht, 2),
    cout_revient_ht: round(cout_revient_ht, 2),
    marge_pct,
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
 * Choisit la techno selon le mode demandé.
 * Si techno demandée incompatible avec le papier → switch auto vers l'autre.
 */
function chooseTechno(
  input: FlyersInput,
  papier: FlyersPapierConfig,
  params: FlyersParams
): { techno_choisie: Techno; switch_auto: boolean } {
  let techno: Techno;
  if (input.techno_mode === 'auto') {
    techno = input.quantite < params.seuil_offset_quantite_min ? 'numerique' : 'offset';
  } else {
    techno = input.techno_mode;
  }

  // Vérification compatibilité papier
  if (!papier.compatible_techno.includes(techno)) {
    // Switch auto vers l'autre
    const fallback = papier.compatible_techno[0];
    if (!fallback) {
      throw new FlyersCalcError(
        `Le papier ${papier.nom} n'a aucune techno compatible`,
        'PAPIER_NO_TECHNO'
      );
    }
    return { techno_choisie: fallback, switch_auto: true };
  }

  return { techno_choisie: techno, switch_auto: false };
}

/**
 * Résout les dimensions. Si custom, bride au format machine max si nécessaire.
 */
function resolveDimensions(
  input: FlyersInput,
  params: FlyersParams,
  techno: Techno
): { largeur_mm: number; hauteur_mm: number; bridee: boolean } {
  if (input.dimension_mode === 'standard') {
    if (!input.taille_standard) {
      throw new FlyersCalcError('Taille standard manquante', 'MISSING_TAILLE_STANDARD');
    }
    const fmt = params.formats_standards.find((f) => f.id === input.taille_standard);
    if (!fmt) {
      throw new FlyersCalcError(
        `Taille standard inconnue : ${input.taille_standard}`,
        'INVALID_TAILLE_STANDARD'
      );
    }
    return { largeur_mm: fmt.largeur_mm, hauteur_mm: fmt.hauteur_mm, bridee: false };
  }

  // Custom
  if (
    input.largeur_mm === undefined ||
    input.hauteur_mm === undefined ||
    input.largeur_mm <= 0 ||
    input.hauteur_mm <= 0
  ) {
    throw new FlyersCalcError('Dimensions custom invalides', 'INVALID_CUSTOM_DIMS');
  }

  // Bridage au format max le plus grand parmi les machines de cette techno
  const machinesDeTechno = params.machines.filter((m) => m.actif && m.techno === techno);
  if (machinesDeTechno.length === 0) {
    return { largeur_mm: input.largeur_mm, hauteur_mm: input.hauteur_mm, bridee: false };
  }

  const max_largeur = Math.max(...machinesDeTechno.map((m) => m.format_max_mm.largeur));
  const max_hauteur = Math.max(...machinesDeTechno.map((m) => m.format_max_mm.hauteur));

  const largeur_finale = Math.min(input.largeur_mm, max_largeur);
  const hauteur_finale = Math.min(input.hauteur_mm, max_hauteur);
  const bridee = largeur_finale !== input.largeur_mm || hauteur_finale !== input.hauteur_mm;

  return { largeur_mm: largeur_finale, hauteur_mm: hauteur_finale, bridee };
}

/**
 * Évalue le coût complet pour une machine donnée :
 * choix du meilleur format papier + tous les coûts + marge + dégressif.
 * Retourne tout ce qui est nécessaire pour comparer les machines entre elles.
 */
function evaluateMachine(
  machine: FlyersMachineConfig,
  input: FlyersInput,
  params: FlyersParams,
  papier: FlyersPapierConfig,
  largeur_mm: number,
  hauteur_mm: number
) {
  // Choix du meilleur format papier (le moins cher par pose)
  let bestPapierEval: {
    format: (typeof papier.formats_achat)[0];
    nb_poses: number;
    cout_papier_ht: number;
    nb_feuilles_brut: number;
    nb_feuilles_avec_gaches: number;
  } | null = null;

  for (const format of papier.formats_achat) {
    // Le format papier doit aussi tenir dans la machine
    const format_l = Math.min(format.largeur_mm, machine.format_max_mm.largeur);
    const format_h = Math.min(format.hauteur_mm, machine.format_max_mm.hauteur);

    const cal = calepiner({
      piece_largeur_cm: largeur_mm / 10,
      piece_hauteur_cm: hauteur_mm / 10,
      format_largeur_cm: format_l / 10,
      format_hauteur_cm: format_h / 10,
    });

    if (cal.nb_poses === 0) continue;

    const nb_feuilles_brut = Math.ceil(input.quantite / cal.nb_poses);
    const nb_feuilles_avec_gaches = Math.ceil(nb_feuilles_brut * (1 + machine.gaches_pct / 100));
    const prix_feuille = format.prix_paquet_ht / format.feuilles_par_paquet;
    const cout_papier_ht = nb_feuilles_avec_gaches * prix_feuille;

    if (!bestPapierEval || cout_papier_ht < bestPapierEval.cout_papier_ht) {
      bestPapierEval = {
        format,
        nb_poses: cal.nb_poses,
        cout_papier_ht,
        nb_feuilles_brut,
        nb_feuilles_avec_gaches,
      };
    }
  }

  if (!bestPapierEval) {
    throw new FlyersCalcError(
      `Aucun format papier compatible avec la machine ${machine.nom} pour les dimensions demandées`,
      'NO_PAPIER_FORMAT_COMPATIBLE'
    );
  }

  // === Coût machine ===
  const duree_impression_h = bestPapierEval.nb_feuilles_avec_gaches / machine.vitesse_feuilles_h;

  let cout_calage_total = 0;
  if (machine.techno === 'offset') {
    cout_calage_total = machine.cout_calage_ht;
    if (input.recto_verso === 'rv' && !machine.recto_verso_calage_unique) {
      cout_calage_total *= 2;
    }
  }

  let cout_machine_ht = cout_calage_total + duree_impression_h * machine.taux_horaire_ht;
  let cout_operateur_ht = duree_impression_h * machine.operateur_taux_horaire_ht;

  // Recto-verso : multiplie le coût impression (sauf si techno gère RV en un passage)
  // Hypothèse simple : RV double le temps machine et opérateur
  if (input.recto_verso === 'rv') {
    cout_machine_ht = cout_calage_total + 2 * duree_impression_h * machine.taux_horaire_ht;
    cout_operateur_ht = 2 * duree_impression_h * machine.operateur_taux_horaire_ht;
  }

  // === Coût finitions ===
  const surface_unitaire_m2 = (largeur_mm * hauteur_mm) / 1_000_000;
  const surface_totale_m2 = surface_unitaire_m2 * input.quantite;
  const cout_finitions_ht = calcCoutFinitions(
    input.finitions_ids,
    params.finitions,
    input.quantite,
    surface_totale_m2,
    input.recto_verso === 'rv'
  );

  // === Total ===
  const cout_bat_ht = input.bat ? params.bat_prix_ht : 0;
  const cout_revient_ht =
    bestPapierEval.cout_papier_ht +
    cout_machine_ht +
    cout_operateur_ht +
    cout_finitions_ht +
    params.frais_fixes_ht +
    cout_bat_ht;

  const marge_pct =
    machine.techno === 'offset' ? params.marge_pct_offset : params.marge_pct_numerique;
  const prix_ht_brut = cout_revient_ht * (1 + marge_pct / 100);

  const sortedDeg = [...params.degressif].sort((a, b) => b.seuil - a.seuil);
  const deg = sortedDeg.find((d) => input.quantite >= d.seuil);
  const remise_pct = deg?.remise_pct ?? 0;
  const prix_ht = prix_ht_brut * (1 - remise_pct / 100);
  const prix_ttc = prix_ht * (1 + params.tva_pct / 100);

  const impression: FlyersImpressionDetail = {
    machine_id: machine.id,
    machine_nom: machine.nom,
    techno: machine.techno,
    format_papier_largeur_mm: bestPapierEval.format.largeur_mm,
    format_papier_hauteur_mm: bestPapierEval.format.hauteur_mm,
    nb_poses_par_feuille: bestPapierEval.nb_poses,
    nb_feuilles_brut: bestPapierEval.nb_feuilles_brut,
    nb_feuilles_avec_gaches: bestPapierEval.nb_feuilles_avec_gaches,
    cout_papier_ht: round(bestPapierEval.cout_papier_ht, 2),
    cout_machine_ht: round(cout_machine_ht, 2),
    cout_operateur_ht: round(cout_operateur_ht, 2),
  };

  return {
    machine,
    impression,
    cout_finitions_ht,
    cout_bat_ht,
    cout_revient_ht,
    marge_pct,
    prix_ht_brut,
    remise_pct,
    prix_ht,
    prix_ttc,
  };
}

function calcCoutFinitions(
  finitions_ids: string[],
  catalogue: FlyersFinitionConfig[],
  quantite: number,
  surface_totale_m2: number,
  recto_verso: boolean
): number {
  let total = 0;
  for (const id of finitions_ids) {
    const f = catalogue.find((c) => c.id === id);
    if (!f) {
      throw new FlyersCalcError(`Finition introuvable : ${id}`, 'FINITION_NOT_FOUND');
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
        // Pelliculage par face : 1 face normalement, 2 si recto-verso
        cout = f.prix_ht * surface_totale_m2 * (recto_verso ? 2 : 1);
        break;
    }

    // Sous-traitance : on remplace le coût standard par (coût fournisseur × marge)
    if (f.sous_traite) {
      if (f.cout_fournisseur_ht === undefined || f.marge_sous_traitance_pct === undefined) {
        throw new FlyersCalcError(
          `Finition sous-traitée mal configurée : ${f.nom}`,
          'INVALID_SOUS_TRAITANCE'
        );
      }
      // On considère que cout_fournisseur_ht est forfaitaire par lot (à raffiner si besoin)
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