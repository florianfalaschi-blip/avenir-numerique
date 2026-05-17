/**
 * Types du calculateur Flyers / Affiches.
 * Voir docs/SPEC_Calculateurs.md section 4.
 */

// ============================================================
// VARIABLES D'ENTRÉE
// ============================================================

export type FlyersDimensionMode = 'standard' | 'custom';
export type FlyersTailleStandard = 'A6' | 'A5' | 'A4' | 'A3' | 'DL' | 'CV';
export type RectoVerso = 'recto' | 'rv';
export type TechnoMode = 'auto' | 'offset' | 'numerique';
export type Techno = 'offset' | 'numerique';

export interface FlyersInput {
  /** Quantité d'exemplaires */
  quantite: number;
  /** Mode de dimensionnement */
  dimension_mode: FlyersDimensionMode;
  taille_standard?: FlyersTailleStandard;
  /** Dimensions custom en mm (bridées au format machine max) */
  largeur_mm?: number;
  hauteur_mm?: number;
  /** ID du papier choisi */
  papier_id: string;
  recto_verso: RectoVerso;
  /** Choix techno : 'auto' = système décide selon seuil */
  techno_mode: TechnoMode;
  /** IDs des finitions choisies */
  finitions_ids: string[];
  bat: boolean;
}

// ============================================================
// PARAMÈTRES ADMIN
// ============================================================

export interface FlyersMachineConfig {
  id: string;
  nom: string;
  techno: Techno;
  /** Format max imprimable */
  format_max_mm: {
    largeur: number;
    hauteur: number;
  };
  /** Feuilles par heure */
  vitesse_feuilles_h: number;
  /** Coût horaire machine */
  taux_horaire_ht: number;
  /** Forfait calage (offset) en € HT par calage */
  cout_calage_ht: number;
  /** Si true : 1 seul calage pour RV, sinon doubler le coût calage */
  recto_verso_calage_unique: boolean;
  /** % de gâches feuilles */
  gaches_pct: number;
  /** Taux horaire opérateur (séparé de la machine) */
  operateur_taux_horaire_ht: number;
  actif: boolean;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

/** Un format d'achat de papier */
export interface FlyersPapierFormat {
  largeur_mm: number;
  hauteur_mm: number;
  /** Prix d'un paquet de feuilles */
  prix_paquet_ht: number;
  feuilles_par_paquet: number;
}

export interface FlyersPapierConfig {
  id: string;
  nom: string;
  /** Nom du fournisseur / papetier (info admin, optionnel). */
  fournisseur?: string;
  grammage: number;
  /** Liste des formats d'achat (≥ 1) */
  formats_achat: FlyersPapierFormat[];
  /** Quelles technos ce papier supporte */
  compatible_techno: Techno[];
  /**
   * Main (bouffant) du papier en µm par g/m². Utilisé par le calc Brochures
   * pour estimer l'épaisseur de la brochure finie.
   * - 1.0 = papier dense / couché brillant
   * - 1.3 = papier offset standard (défaut si absent)
   * - 1.5 = papier bouffant / éco
   * - 1.7 = bouffant épais (livre)
   */
  main?: number;
  /** Timestamp Unix ms de dernière modification (optionnel, info). */
  lastModifiedAt?: number;
}

export interface FlyersFormatStandardConfig {
  id: FlyersTailleStandard;
  largeur_mm: number;
  hauteur_mm: number;
}

/** Type de tarification d'une finition flyers */
export type FlyersFinitionType =
  | 'forfait'
  | 'unitaire'
  | 'm2'
  | 'par_face' // pelliculage : × 2 si recto-verso
  ;

export interface FlyersFinitionConfig {
  id: string;
  nom: string;
  type: FlyersFinitionType;
  /** Prix selon le type */
  prix_ht: number;
  /** Si true : finition sous-traitée (coût fournisseur + marge spé) */
  sous_traite: boolean;
  /** Coût payé au sous-traitant (si sous_traite) */
  cout_fournisseur_ht?: number;
  /** Marge appliquée sur la prestation sous-traitée (en %) */
  marge_sous_traitance_pct?: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface FlyersDegressifSeuil {
  seuil: number;
  remise_pct: number;
}

export interface FlyersParams {
  machines: FlyersMachineConfig[];
  papiers: FlyersPapierConfig[];
  formats_standards: FlyersFormatStandardConfig[];
  finitions: FlyersFinitionConfig[];
  /** Quantité minimum pour passage en offset (mode 'auto') */
  seuil_offset_quantite_min: number;
  frais_fixes_ht: number;
  bat_prix_ht: number;
  /** Marge offset (en %) */
  marge_pct_offset: number;
  /** Marge numérique (en %) */
  marge_pct_numerique: number;
  tva_pct: number;
  degressif: FlyersDegressifSeuil[];
  prix_plancher_ht?: number;
  /**
   * Timestamps Unix ms de dernière modification par champ scalaire racine
   * (seuil_offset_quantite_min, frais_fixes_ht, bat_prix_ht,
   * marge_pct_offset, marge_pct_numerique, tva_pct, prix_plancher_ht).
   * Optionnel et rétro-compatible.
   */
  meta?: Record<string, number>;
}

// ============================================================
// RÉSULTAT
// ============================================================

export interface FlyersImpressionDetail {
  machine_id: string;
  machine_nom: string;
  techno: Techno;
  /** Format papier sélectionné (le moins cher) */
  format_papier_largeur_mm: number;
  format_papier_hauteur_mm: number;
  /** Nombre de poses par feuille de papier */
  nb_poses_par_feuille: number;
  /** Nombre de feuilles à imprimer (sans gâches) */
  nb_feuilles_brut: number;
  /** Nombre de feuilles avec gâches */
  nb_feuilles_avec_gaches: number;
  /** Coût matière papier */
  cout_papier_ht: number;
  /** Coût machine (calage + roule) */
  cout_machine_ht: number;
  /** Coût opérateur */
  cout_operateur_ht: number;
}

export interface FlyersResult {
  // Résolution des entrées
  largeur_finale_mm: number;
  hauteur_finale_mm: number;
  techno_choisie: Techno;
  techno_switch_auto: boolean; // true si techno a été forcée pour compatibilité

  // Détail impression
  impression: FlyersImpressionDetail;

  // Autres coûts
  cout_finitions_ht: number;
  frais_fixes_ht: number;
  cout_bat_ht: number;
  cout_revient_ht: number;

  // Marge & prix
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