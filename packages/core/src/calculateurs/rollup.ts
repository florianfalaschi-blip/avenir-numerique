/**
 * Calculateur Roll-up
 * À implémenter par le collègue selon SPEC_Calculateurs_Avenir_Numerique.md §2
 */

import type { ParametresBase, ResultatCalcul } from '../types'

export interface InputRollup {
  quantite: number
  largeur_cm: number
  hauteur_cm: number
  bache_id: string
  structure_id: 'eco' | 'standard' | 'premium'
  bat: boolean
}

export interface ParamsRollup extends ParametresBase {
  baches: Array<{ id: string; prixM2HT: number }>
  structures: Array<{ id: string; prixUnitaireHT: number }>
  machine: { vitesseM2H: number; tauxHoraireHT: number }
}

export function calculerRollup(
  _input: InputRollup,
  _params: ParamsRollup
): ResultatCalcul {
  // TODO : implémenter selon la spec §2
  throw new Error('Calculateur Roll-up non encore implémenté')
}
