/**
 * Types partagés entre tous les calculateurs
 */

export type FamilleCalculateur =
  | 'rollup'
  | 'plaques'
  | 'flyers'
  | 'bobines'
  | 'brochures'

/** Résultat détaillé d'un calcul */
export interface ResultatCalcul {
  familleCalculateur: FamilleCalculateur

  // Coûts détaillés par poste
  couts: {
    matiere: number
    impression: number
    operateur: number
    faconnage: number
    finitions: number
    fraisFixes: number
    bat: number
    sousTraitance: number
  }

  // Totaux
  coutDeRevient: number
  margeAppliquee: number       // en %
  remiseAppliquee: number      // en %
  prixHtBrut: number
  prixHtFinal: number
  tvaAppliquee: number         // en %
  prixTtc: number

  // Traçabilité
  parametresUtilises: Record<string, unknown>
  avertissements: string[]
}

/** Paramètres admin partagés */
export interface ParametresBase {
  margePercent: number
  tvaPercent: number
  batPrix: number
  fraisFixes: number
  degressif: Array<{ seuil: number; remisePct: number }>
}
