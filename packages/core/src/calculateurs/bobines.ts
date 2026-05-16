/**
 * Calculateur Bobines / Étiquettes
 * À implémenter par le collègue selon SPEC_Calculateurs_Avenir_Numerique.md §5
 */

import type { ParametresBase, ResultatCalcul } from '../types'

export interface InputBobines {
  quantite_etiquettes: number
  forme: 'rectangle' | 'rond' | 'ovale' | 'forme_libre'
  largeur_mm?: number
  hauteur_mm?: number
  diametre_mm?: number
  surface_manuelle_mm2?: number
  perimetre_manuel_mm?: number
  materiau_id: string
  conditionnement: 'planches_plat' | 'rouleau_applicateur'
  decoupe_mode: 'forme_simple' | 'forme_libre'
  finitions: string[]
  bat: boolean
}

export interface ParamsBobines extends ParametresBase {
  materiaux: Array<{
    id: string
    methode_calcul: 'calepinage' | 'm2' | 'auto'
    rouleaux?: Array<{ largeur_mm: number; longueur_m: number; prixHT: number }>
    prixM2HT?: number
    gachesPercent: number
  }>
  machine_impression: { vitesseM2H: number; tauxHoraireHT: number }
  machine_decoupe: {
    vitesse: number
    tauxHoraireHT: number
    forfaitCliquage: number
  }
  espace_entre_etiquettes_mm: number
  forfait_rembobinage: number
  finitions: Array<{ id: string; type: string; prixHT: number }>
}

export function calculerBobines(
  _input: InputBobines,
  _params: ParamsBobines
): ResultatCalcul {
  // TODO : implémenter selon la spec §5
  throw new Error('Calculateur Bobines non encore implémenté')
}
