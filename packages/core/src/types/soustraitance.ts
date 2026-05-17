/**
 * Types du calculateur Sous-traitance.
 *
 * Concept : devis multi-postes sous-traités. Chaque ligne porte
 * un fournisseur + prix d'achat HT + marge % → prix de vente HT.
 * Le résultat agrège toutes les lignes.
 *
 * Cas d'usage : tampons caoutchouc gravés, packaging spécial, dorure
 * artisanale, sérigraphie textile, etc. — tout ce qu'Avenir ne produit
 * pas en interne et confie à un partenaire (RPS, SIPAP, LGI…).
 */

// ============================================================
// VARIABLES D'ENTRÉE
// ============================================================

export interface SoustraitanceLigne {
  /** Identifiant unique de la ligne (pour React keys). */
  id: string;
  /** ID du fournisseur dans le catalogue. */
  fournisseur_id: string;
  /** Référence du devis fournisseur (texte libre, optionnel). */
  ref_devis_fournisseur?: string;
  /** Prix d'achat HT en € (ce que le sous-traitant facture à Avenir). */
  prix_achat_ht: number;
  /** Marge appliquée en % (prix vente = prix_achat × (1 + marge/100)). */
  marge_pct: number;
  /** Notes libres sur la ligne (descriptif court). */
  notes?: string;
}

export interface SoustraitanceInput {
  /** Nom du job global (ex. "Tampon caoutchouc client X"). */
  nom_job: string;
  /** Lignes de sous-traitance (au moins 1). */
  lignes: SoustraitanceLigne[];
  /** Descriptif détaillé du produit (max 750 char). Optionnel. */
  descriptif?: string;
  /** Quantité globale du job (info pour le devis ; n'impacte pas le prix). Défaut 1. */
  quantite: number;
  /** Option BAT payante. */
  bat: boolean;
}

// ============================================================
// PARAMÈTRES ADMIN
// ============================================================

export interface SoustraitanceFournisseurConfig {
  id: string;
  /** Nom commercial du fournisseur (ex. "RPS", "SIPAP", "LGI"). */
  nom: string;
  /** Notes admin (ex. "Anciennement Agence de Fab"). */
  notes?: string;
  /**
   * Marge habituelle pratiquée avec ce fournisseur en % (override le default).
   * Optionnelle — sinon utilise `params.default_marge_pct`.
   */
  marge_habituelle_pct?: number;
  /** Catégorie / spécialité (ex. "Tampons", "Packaging", "Sérigraphie"). */
  categorie?: string;
  /** Email de contact (optionnel, info). */
  email?: string;
  /** Téléphone (optionnel). */
  telephone?: string;
  /** Timestamp Unix ms de dernière modif. */
  lastModifiedAt?: number;
}

export interface SoustraitanceDegressifSeuil {
  /** Seuil de prix d'achat HT à partir duquel la remise s'applique. */
  seuil_achat_ht: number;
  /** Pourcentage de remise sur le prix de vente final. */
  remise_pct: number;
}

export interface SoustraitanceParams {
  /** Catalogue des fournisseurs. */
  fournisseurs: SoustraitanceFournisseurConfig[];
  /** Marge par défaut en % (si pas d'override fournisseur ni de ligne). */
  default_marge_pct: number;
  /** Frais fixes par devis (préparation, gestion fournisseur, etc.). */
  frais_fixes_ht: number;
  /** Prix de l'option BAT. */
  bat_prix_ht: number;
  /** TVA (%, défaut 20). */
  tva_pct: number;
  /** Dégressif éventuel sur gros montants d'achat. */
  degressif: SoustraitanceDegressifSeuil[];
  /** Prix de vente HT minimum (plancher de sécurité, optionnel). */
  prix_plancher_ht?: number;
  /**
   * Timestamps de dernière modif par champ scalaire racine (default_marge_pct,
   * frais_fixes_ht, bat_prix_ht, tva_pct, prix_plancher_ht). Optionnel.
   */
  meta?: Record<string, number>;
}

// ============================================================
// RÉSULTAT DU CALCUL
// ============================================================

export interface SoustraitanceLigneDetail {
  ligne_id: string;
  fournisseur_id: string;
  fournisseur_nom: string;
  ref_devis_fournisseur?: string;
  prix_achat_ht: number;
  marge_pct: number;
  /** Prix de vente HT = prix_achat × (1 + marge_pct/100). */
  prix_vente_ht: number;
  /** Marge en € = prix_vente_ht - prix_achat_ht. */
  marge_eur: number;
  notes?: string;
}

export interface SoustraitanceResult {
  // === Lignes calculées ===
  lignes_detail: SoustraitanceLigneDetail[];
  /** Nombre de lignes. */
  nb_lignes: number;
  /** Nombre de fournisseurs distincts. */
  nb_fournisseurs_distincts: number;

  // === Totaux ===
  /** Somme des prix d'achat HT (coût total à payer aux sous-traitants). */
  total_achat_ht: number;
  /** Somme des prix de vente HT des lignes. */
  total_vente_lignes_ht: number;
  /** Somme des marges en €. */
  total_marge_eur: number;
  /** Marge moyenne pondérée par achat (en %). */
  marge_moy_pct: number;

  // === Coûts annexes ===
  frais_fixes_ht: number;
  cout_bat_ht: number;
  /** Coût de revient total HT (= total_achat + frais_fixes + bat). */
  cout_revient_ht: number;

  // === Prix final ===
  /** Prix HT brut avant dégressif (= total_vente_lignes_ht + frais_fixes + bat). */
  prix_ht_brut: number;
  /** Pourcentage de remise dégressive appliqué (0 si pas de dégressif). */
  remise_pct: number;
  /** Prix HT final. */
  prix_ht: number;
  tva_pct: number;
  prix_ttc: number;

  // === Métadonnées ===
  recap: string;
  warnings: string[];
}
