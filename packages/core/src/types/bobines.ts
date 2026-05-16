/**
 * Types du calculateur Bobines / Étiquettes.
 * Voir docs/SPEC_Calculateurs.md section 5.
 */

// ============================================================
// VARIABLES D'ENTRÉE
// ============================================================

export type BobinesForme = 'rectangle' | 'rond' | 'ovale' | 'forme_libre';
export type BobinesConditionnement = 'planches_plat' | 'rouleau_applicateur';
export type BobinesDecoupeMode = 'forme_simple' | 'forme_libre';

export interface BobinesInput {
  /** Quantité d'étiquettes commandées */
  quantite_etiquettes: number;
  /** Forme des étiquettes */
  forme: BobinesForme;
  /** Largeur en mm (rectangle / ovale / forme_libre) */
  largeur_mm?: number;
  /** Hauteur en mm (rectangle / ovale / forme_libre) */
  hauteur_mm?: number;
  /** Diamètre en mm (forme rond) */
  diametre_mm?: number;
  /**
   * Surface unitaire en mm² (forme_libre uniquement).
   * Saisie manuelle (ou calculée depuis fichier vectoriel).
   */
  surface_libre_mm2?: number;
  /**
   * Périmètre unitaire en mm (forme_libre uniquement).
   * Saisie manuelle.
   */
  perimetre_libre_mm?: number;
  /** ID du matériau choisi */
  materiau_id: string;
  /** Type de découpe */
  decoupe_mode: BobinesDecoupeMode;
  /** Mode de livraison */
  conditionnement: BobinesConditionnement;
  /** IDs des finitions */
  finitions_ids: string[];
  bat: boolean;
}

// ============================================================
// PARAMÈTRES ADMIN
// ============================================================

/** Un rouleau de matière disponible à l'achat */
export interface BobinesRouleauConfig {
  largeur_mm: number;
  longueur_m: number;
  prix_rouleau_ht: number;
}

/**
 * Méthode de calcul matière :
 * - 'calepinage' : optimisation nb étiquettes par largeur rouleau
 * - 'm2' : calcul direct à la surface (matières au m²)
 * - 'auto' : calepinage si rouleaux dispo, sinon m²
 */
export type BobinesMethodeCalcul = 'calepinage' | 'm2' | 'auto';

export interface BobinesMateriauConfig {
  id: string;
  nom: string;
  /** Type de matière (info, ex. 'adhesif', 'film', 'papier') */
  type: string;
  /** Rouleaux disponibles (vide si vendu uniquement au m²) */
  rouleaux: BobinesRouleauConfig[];
  /** Prix au m² HT (si vendu au m²) */
  prix_m2_ht?: number;
  /** Méthode de calcul à utiliser */
  methode_calcul: BobinesMethodeCalcul;
  /** Timestamp Unix ms de dernière modification (optionnel, info). */
  lastModifiedAt?: number;
}

export interface BobinesMachineImpressionConfig {
  id: string;
  nom: string;
  vitesse_m2_h: number;
  taux_horaire_ht: number;
  operateur_taux_horaire_ht: number;
  /** % de gâches matière */
  gaches_pct: number;
}

export interface BobinesMachineDecoupeConfig {
  id: string;
  nom: string;
  /** Vitesse de découpe en m/min */
  vitesse_m_min: number;
  taux_horaire_ht: number;
  operateur_taux_horaire_ht: number;
  /** Forfait de cliquage / préparation par référence (modifiable par devis) */
  forfait_cliquage_ht: number;
}

export type BobinesFinitionType = 'forfait' | 'unitaire' | 'm2';

export interface BobinesFinitionConfig {
  id: string;
  nom: string;
  type: BobinesFinitionType;
  prix_ht: number;
  /** Sous-traitance (effet 3D, dorure spéciale...) */
  sous_traite: boolean;
  cout_fournisseur_ht?: number;
  marge_sous_traitance_pct?: number;
}

export interface BobinesDegressifSeuil {
  seuil: number;
  remise_pct: number;
}

export interface BobinesParams {
  materiaux: BobinesMateriauConfig[];
  machine_impression: BobinesMachineImpressionConfig;
  machine_decoupe: BobinesMachineDecoupeConfig;
  finitions: BobinesFinitionConfig[];
  /** Espace entre étiquettes en mm (défaut 3mm) */
  espace_entre_etiquettes_mm: number;
  /** Forfait rembobinage si conditionnement = rouleau_applicateur */
  forfait_rembobinage_ht: number;
  frais_fixes_ht: number;
  bat_prix_ht: number;
  marge_pct: number;
  tva_pct: number;
  degressif: BobinesDegressifSeuil[];
  prix_plancher_ht?: number;
}

// ============================================================
// RÉSULTAT
// ============================================================

export interface BobinesMatiereResult {
  /** Méthode utilisée (calepinage ou m²) */
  methode: BobinesMethodeCalcul;
  /** Coût matière HT */
  cout_matiere_ht: number;
  /** Détails calepinage (si applicable) */
  rouleau?: {
    largeur_mm: number;
    longueur_m: number;
    prix_rouleau_ht: number;
    nb_etiquettes_par_largeur: number;
    longueur_necessaire_m: number;
    nb_rouleaux: number;
  };
  /** Détails m² (si applicable) */
  surface_totale_m2?: number;
}

export interface BobinesResult {
  // Surface et périmètre unitaires
  surface_unitaire_mm2: number;
  perimetre_unitaire_mm: number;

  // Matière
  matiere: BobinesMatiereResult;

  // Coûts
  cout_impression_ht: number;
  cout_operateur_impression_ht: number;
  cout_decoupe_machine_ht: number;
  cout_decoupe_operateur_ht: number;
  cout_cliquage_ht: number;
  cout_finitions_ht: number;
  cout_conditionnement_ht: number;
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