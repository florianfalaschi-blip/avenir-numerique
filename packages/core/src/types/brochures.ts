/**
 * Types du calculateur Brochures.
 * Voir docs/SPEC_Calculateurs.md section 6.
 */

// ============================================================
// VARIABLES D'ENTRÉE
// ============================================================

export type BrochuresDimensionMode = 'standard' | 'custom';

export type BrochuresTailleStandard =
  | 'A6'
  | 'A5'
  | 'A4'
  | 'A6_paysage'
  | 'A5_paysage'
  | 'A4_paysage'
  | 'A6_carre'
  | 'A5_carre'
  | 'A4_carre';

export type BrochuresCouleur = 'quadri' | 'noir';
export type BrochuresTechnoMode = 'auto' | 'offset' | 'numerique';
export type BrochuresTechno = 'offset' | 'numerique';
export type BrochuresPoste = 'interieur' | 'couverture';
export type BrochuresReliureType =
  | 'agrafe'
  | 'dos_carre_colle'
  | 'dos_carre_cousu'
  | 'spirale'
  | 'wire_o';

export interface BrochuresInput {
  /** Quantité de brochures */
  quantite: number;
  /** Nombre de pages total (couverture incluse) */
  nb_pages: number;
  dimension_mode: BrochuresDimensionMode;
  taille_standard?: BrochuresTailleStandard;
  /** Dimensions custom en mm (bridées au format machine max) */
  largeur_mm?: number;
  hauteur_mm?: number;
  reliure_id: string;
  papier_interieur_id: string;
  papier_couverture_id: string;
  couleur_interieur: BrochuresCouleur;
  couleur_couverture: BrochuresCouleur;
  /** Techno demandée pour l'intérieur ('auto' = système décide) */
  techno_mode_interieur: BrochuresTechnoMode;
  /** Techno demandée pour la couverture ('auto' = système décide) */
  techno_mode_couverture: BrochuresTechnoMode;
  /** Finitions appliquées sur la couverture */
  finitions_ids: string[];
  bat: boolean;
}

// ============================================================
// PARAMÈTRES ADMIN
// ============================================================

export interface BrochuresMachineImpressionConfig {
  id: string;
  nom: string;
  techno: BrochuresTechno;
  format_max_mm: {
    largeur: number;
    hauteur: number;
  };
  /** Feuilles par heure */
  vitesse_feuilles_h: number;
  taux_horaire_ht: number;
  /**
   * Forfait calage offset en € HT **par couleur**.
   * Quadri = 4 × cout_calage_ht, Noir = 1 × cout_calage_ht.
   * Non utilisé en numérique.
   */
  cout_calage_ht: number;
  /** Si true : 1 seul calage couvre RV, sinon doubler le coût calage */
  recto_verso_calage_unique: boolean;
  gaches_pct: number;
  operateur_taux_horaire_ht: number;
  actif: boolean;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface BrochuresMachineFaconnageConfig {
  id: string;
  nom: string;
  /** Type d'opération : reliures + plieuse */
  type: BrochuresReliureType | 'plieuse';
  /** Brochures par heure (reliure) OU feuilles par heure (plieuse) */
  vitesse_h: number;
  taux_horaire_ht: number;
  operateur_taux_horaire_ht: number;
  /** Coût consommables par brochure (agrafes, colle, spirale, wire-o) ou par feuille pour plieuse */
  cout_consommables_unitaire_ht: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface BrochuresReliureConfig {
  id: string;
  nom: string;
  type: BrochuresReliureType;
  /** Multiple obligatoire de pages (ex. 4 pour agrafé) */
  pages_multiple: number;
  pages_min: number;
  pages_max: number;
  machine_faconnage_id: string;
  /** Si true : reliure sous-traitée (coût fournisseur + marge spé) */
  sous_traite: boolean;
  /** Coût payé au sous-traitant par brochure */
  cout_fournisseur_brochure_ht?: number;
  /** Marge appliquée sur la prestation sous-traitée (en %) */
  marge_sous_traitance_pct?: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface BrochuresPapierFormat {
  largeur_mm: number;
  hauteur_mm: number;
  prix_paquet_ht: number;
  feuilles_par_paquet: number;
}

export interface BrochuresPapierConfig {
  id: string;
  nom: string;
  /** Nom du fournisseur / papetier (info admin, optionnel). */
  fournisseur?: string;
  grammage: number;
  formats_achat: BrochuresPapierFormat[];
  compatible_techno: BrochuresTechno[];
  /**
   * Main (bouffant) du papier en µm par g/m². Sert au calcul d'épaisseur.
   * - 1.0 = papier dense / couché brillant
   * - 1.3 = papier offset standard (défaut si absent)
   * - 1.5 = papier bouffant / éco
   * - 1.7 = bouffant épais (livre)
   */
  main?: number;
  /** Timestamp Unix ms de dernière modification (optionnel, info). */
  lastModifiedAt?: number;
}

export interface BrochuresFormatStandardConfig {
  id: BrochuresTailleStandard;
  largeur_mm: number;
  hauteur_mm: number;
}

export type BrochuresFinitionType = 'forfait' | 'unitaire' | 'm2' | 'par_face';

export interface BrochuresFinitionConfig {
  id: string;
  nom: string;
  type: BrochuresFinitionType;
  prix_ht: number;
  sous_traite: boolean;
  cout_fournisseur_ht?: number;
  marge_sous_traitance_pct?: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface BrochuresDegressifSeuil {
  seuil: number;
  remise_pct: number;
}

export interface BrochuresParams {
  machines_impression: BrochuresMachineImpressionConfig[];
  machines_faconnage: BrochuresMachineFaconnageConfig[];
  reliures: BrochuresReliureConfig[];
  papiers: BrochuresPapierConfig[];
  formats_standards: BrochuresFormatStandardConfig[];
  finitions: BrochuresFinitionConfig[];
  /** Quantité minimum pour passage en offset (mode 'auto') */
  seuil_offset_quantite_min: number;
  /** Seuil de pages au-delà duquel le pliage est nécessaire (défaut 8) */
  seuil_pages_pliage: number;
  /** ID de la machine de pliage (type 'plieuse'). Si absent, pas de pliage facturé. */
  machine_pliage_id?: string;
  frais_fixes_ht: number;
  bat_prix_ht: number;
  marge_pct_offset: number;
  marge_pct_numerique: number;
  tva_pct: number;
  degressif: BrochuresDegressifSeuil[];
  prix_plancher_ht?: number;
  /**
   * Timestamps Unix ms de dernière modification par champ scalaire racine
   * (seuil_offset_quantite_min, seuil_pages_pliage, machine_pliage_id,
   * frais_fixes_ht, bat_prix_ht, marge_pct_offset, marge_pct_numerique,
   * tva_pct, prix_plancher_ht).
   * Optionnel et rétro-compatible.
   */
  meta?: Record<string, number>;
}

// ============================================================
// RÉSULTAT
// ============================================================

export interface BrochuresImpressionDetail {
  poste: BrochuresPoste;
  machine_id: string;
  machine_nom: string;
  techno: BrochuresTechno;
  couleur: BrochuresCouleur;
  format_papier_largeur_mm: number;
  format_papier_hauteur_mm: number;
  nb_poses_par_feuille: number;
  /** Nombre de feuilles à imprimer pour ce poste (sans gâches) */
  nb_feuilles_brut: number;
  nb_feuilles_avec_gaches: number;
  cout_papier_ht: number;
  cout_machine_ht: number;
  cout_operateur_ht: number;
}

export interface BrochuresResult {
  largeur_finale_mm: number;
  hauteur_finale_mm: number;
  /** Nombre de feuilles intérieures par brochure = (nb_pages - 4) / 2 */
  nb_feuilles_interieur_par_brochure: number;

  /** Détail impression intérieur (null si nb_pages = 4, brochure sans intérieur) */
  impression_interieur: BrochuresImpressionDetail | null;
  impression_couverture: BrochuresImpressionDetail;
  /** True si la techno intérieur a été forcée pour compatibilité papier */
  techno_switch_interieur: boolean;
  techno_switch_couverture: boolean;

  /** Coût façonnage (reliure) — interne ou sous-traité */
  cout_faconnage_ht: number;
  faconnage_sous_traite: boolean;
  /** Coût pliage (si nb_pages > seuil_pages_pliage) */
  cout_pliage_ht: number;
  /**
   * Épaisseur estimée de la brochure finie (en mm).
   * Calcul : (nb_feuilles × grammage × main) / 1000 + supplément reliure.
   * Main par défaut = 1.3 µm/g (papier offset standard).
   */
  epaisseur_mm: number;
  /** Détail du calcul d'épaisseur (transparence pour le devis). */
  epaisseur_detail: {
    epaisseur_papier_interieur_mm: number;
    epaisseur_papier_couverture_mm: number;
    supplement_reliure_mm: number;
    main_utilisee: number;
  };
  cout_finitions_ht: number;
  frais_fixes_ht: number;
  cout_bat_ht: number;
  cout_revient_ht: number;

  /** Marge effective (prorata des coûts d'impression offset/numérique) */
  marge_pct: number;
  prix_ht_brut: number;
  remise_pct: number;
  prix_ht: number;
  tva_pct: number;
  prix_ttc: number;

  recap: string;
  warnings: string[];
}
