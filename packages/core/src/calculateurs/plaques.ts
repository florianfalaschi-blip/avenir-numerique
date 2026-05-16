/**
 * Calculateur Plaques / Signalétique
 * À implémenter par le collègue selon SPEC_Calculateurs_Avenir_Numerique.md §3
 */

import type { ParametresBase, ResultatCalcul } from '../types'

export interface InputPlaques {
  quantite: number
  dimension_mode: 'standard' | 'custom'
  largeur_cm?: number
  hauteur_cm?: number
  taille_standard?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0'
  materiau_id: string
  decoupe_mode: 'pleine_plaque' | 'forme'
  longueur_decoupe_m?: number // Requis si decoupe_mode === 'forme'
  finitions: string[]
  bat: boolean
}

export interface ParamsPlaques extends ParametresBase {
  materiaux: Array<{
    id: string
    formats: Array<{ largeur_cm: number; hauteur_cm: number; prixHT: number }>
  }>
  machine_impression: { vitesseM2H: number; tauxHoraireHT: number }
  machine_decoupe: { prixMetreLineaire: number; forfaitMinimum?: number }
  finitions: Array<{ id: string; type: string; prixUnitaireHT: number }>
}

export function calculerPlaques(
  _input: InputPlaques,
  _params: ParamsPlaques
): ResultatCalcul {
  // TODO : implémenter selon la spec §3
  throw new Error('Calculateur Plaques non encore implémenté')
}
