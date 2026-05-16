/**
 * Types du calculateur Roll-up.
 * Voir docs/SPEC_Calculateurs.md section 2.
 */

// ============================================================
// VARIABLES D'ENTRÉE (saisies par l'utilisateur)
// ============================================================

export interface RollupInput {
  /** Quantité de roll-ups commandés (≥ 1) */
  quantite: number;
  /** Largeur en cm */
  largeur_cm: number;
  /** Hauteur en cm */
  hauteur_cm: number;
  /** ID de la bâche choisie (référence le catalogue) */
  bache_id: string;
  /** ID du niveau de structure (eco / standard / premium) */
  structure_id: string;
  /** ID de la machine d'impression (réf. params.machines) */
  machine_id: string;
  /** BAT optionnel payant */
  bat: boolean;
}

// ============================================================
// PARAMÈTRES ADMIN (modifiables en backoffice)
// ============================================================

export interface BacheConfig {
  id: string;
  nom: string;
  prix_m2_ht: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface StructureConfig {
  id: string;
  nom: string;
  prix_unitaire_ht: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface MachineConfig {
  id: string;
  nom: string;
  /** Vitesse d'impression en m²/h */
  vitesse_m2_h: number;
  /** Coût horaire de la machine en €/h */
  taux_horaire_ht: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

export interface DegressifSeuil {
  /** Quantité minimum à atteindre pour cette remise */
  seuil: number;
  /** Pourcentage de remise (0-100) */
  remise_pct: number;
}

export interface RollupParams {
  baches: BacheConfig[];
  structures: StructureConfig[];
  /** Liste des machines d'impression disponibles (au moins 1) */
  machines: MachineConfig[];
  /** Frais fixes par commande (préparation, calage, etc.) */
  frais_fixes_ht: number;
  /** Prix de l'option BAT */
  bat_prix_ht: number;
  /** Marge appliquée au prix de revient (en %) */
  marge_pct: number;
  /** TVA (en %, défaut 20) */
  tva_pct: number;
  /** Grille dégressive sur quantité, triée par seuil croissant */
  degressif: DegressifSeuil[];
  /** Prix de vente HT minimum (plancher de sécurité, optionnel) */
  prix_plancher_ht?: number;
}

// ============================================================
// RÉSULTAT DU CALCUL
// ============================================================

export interface RollupResult {
  // === Métadonnées sélection ===
  /** ID de la machine utilisée */
  machine_id: string;
  /** Nom de la machine utilisée */
  machine_nom: string;

  // === Détail des coûts ===
  /** Surface unitaire en m² */
  surface_m2: number;
  /** Coût bâche unitaire HT */
  cout_bache_unitaire_ht: number;
  /** Coût machine unitaire HT */
  cout_machine_unitaire_ht: number;
  /** Coût structure unitaire HT */
  cout_structure_unitaire_ht: number;
  /** Coût unitaire total HT */
  cout_unitaire_ht: number;
  /** Coût matière et production total HT */
  cout_production_ht: number;
  /** Frais fixes HT */
  frais_fixes_ht: number;
  /** Coût BAT HT (0 si pas d'option) */
  cout_bat_ht: number;
  /** Coût de revient total HT */
  cout_revient_ht: number;

  // === Marge et prix ===
  /** Pourcentage de marge appliqué */
  marge_pct: number;
  /** Prix HT brut avant dégressif */
  prix_ht_brut: number;
  /** Pourcentage de remise dégressive appliqué (0 si pas de dégressif) */
  remise_pct: number;
  /** Prix HT final */
  prix_ht: number;
  /** Pourcentage de TVA appliqué */
  tva_pct: number;
  /** Prix TTC final */
  prix_ttc: number;

  // === Métadonnées ===
  /** Récapitulatif textuel lisible */
  recap: string;
  /** Avertissements / informations (ex. plancher appliqué) */
  warnings: string[];
}