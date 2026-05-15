/**
 * Types du calculateur Plaques / Signalétique.
 * Voir docs/SPEC_Calculateurs.md section 3.
 */

// ============================================================
// VARIABLES D'ENTRÉE
// ============================================================

/** Mode de saisie des dimensions */
export type DimensionMode = 'standard' | 'custom';

/** Tailles standards proposées au client */
export type TailleStandard = 'A4' | 'A3' | 'A2' | 'A1' | 'A0';

/** Type de découpe demandé */
export type DecoupeMode = 'pleine_plaque' | 'forme';

export interface PlaquesInput {
  /** Quantité de plaques commandées */
  quantite: number;
  /** Mode de dimensionnement */
  dimension_mode: DimensionMode;
  /** Taille standard (si dimension_mode = 'standard') */
  taille_standard?: TailleStandard;
  /** Largeur en cm (si dimension_mode = 'custom') */
  largeur_cm?: number;
  /** Hauteur en cm (si dimension_mode = 'custom') */
  hauteur_cm?: number;
  /** ID du matériau choisi */
  materiau_id: string;
  /** Type de découpe */
  decoupe_mode: DecoupeMode;
  /**
   * Longueur de découpe forme en mètres (saisie manuelle).
   * Requise UNIQUEMENT si decoupe_mode = 'forme'.
   * Pour pleine_plaque on calcule automatiquement le périmètre.
   */
  longueur_decoupe_forme_m?: number;
  /** IDs des finitions choisies */
  finitions_ids: string[];
  /** Quantité d'œillets si l'une des finitions est de type 'par_oeillet' */
  nb_oeillets?: number;
  /** Option BAT payante */
  bat: boolean;
}

// ============================================================
// PARAMÈTRES ADMIN
// ============================================================

/** Format d'achat brut d'un matériau (plusieurs possibles par matériau) */
export interface FormatAchatMateriau {
  /** Largeur du grand format en cm */
  largeur_cm: number;
  /** Hauteur du grand format en cm */
  hauteur_cm: number;
  /** Prix unitaire HT pour 1 grand format */
  prix_unite_ht: number;
}

export interface MateriauConfig {
  id: string;
  nom: string;
  /** Liste des formats d'achat disponibles (au moins 1) */
  formats_achat: FormatAchatMateriau[];
}

/** Dimensions des tailles standards (cm) */
export interface TailleStandardConfig {
  id: TailleStandard;
  largeur_cm: number;
  hauteur_cm: number;
}

export interface MachineImpressionConfig {
  id: string;
  nom: string;
  vitesse_m2_h: number;
  taux_horaire_ht: number;
}

export interface MachineDecoupeConfig {
  id: string;
  nom: string;
  /** Prix au mètre linéaire HT */
  prix_metre_lineaire_ht: number;
  /** Forfait minimum HT (plancher) */
  forfait_minimum_ht: number;
}

/** Type de tarification d'une finition */
export type FinitionType = 'forfait' | 'unitaire' | 'm2' | 'par_oeillet';

export interface FinitionConfig {
  id: string;
  nom: string;
  type: FinitionType;
  /** Prix selon le type (forfait/unitaire/m2/par_oeillet) */
  prix_ht: number;
}

export interface DegressifSeuilPlaques {
  seuil: number;
  remise_pct: number;
}

export interface PlaquesParams {
  materiaux: MateriauConfig[];
  tailles_standards: TailleStandardConfig[];
  machine_impression: MachineImpressionConfig;
  machine_decoupe: MachineDecoupeConfig;
  finitions: FinitionConfig[];
  frais_fixes_ht: number;
  bat_prix_ht: number;
  marge_pct: number;
  tva_pct: number;
  degressif: DegressifSeuilPlaques[];
  prix_plancher_ht?: number;
}

// ============================================================
// RÉSULTAT
// ============================================================

/** Résultat du calepinage (sélection optimale du format brut) */
export interface CalepinageResult {
  /** Format brut sélectionné (cm) */
  format_brut_largeur_cm: number;
  format_brut_hauteur_cm: number;
  /** Prix unitaire HT du grand format */
  format_brut_prix_ht: number;
  /** Nombre de poses tirées d'un grand format */
  nb_poses_par_format: number;
  /** Nombre de grands formats à acheter */
  nb_formats_brut: number;
  /** Coût total matière */
  cout_matiere_ht: number;
  /** Vrai si la rotation 90° a été utilisée */
  rotation_appliquee: boolean;
}

export interface PlaquesResult {
  // Dimensions résolues
  largeur_finale_cm: number;
  hauteur_finale_cm: number;
  surface_unitaire_m2: number;

  // Calepinage
  calepinage: CalepinageResult;

  // Coûts
  cout_impression_ht: number;
  cout_decoupe_ht: number;
  cout_finitions_ht: number;
  frais_fixes_ht: number;
  cout_bat_ht: number;
  cout_revient_ht: number;

  // Marge et prix
  marge_pct: number;
  prix_ht_brut: number;
  remise_pct: number;
  prix_ht: number;
  tva_pct: number;
  prix_ttc: number;

  // Metadata
  recap: string;
  warnings: string[];
}