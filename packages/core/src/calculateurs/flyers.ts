/**
 * Calculateur Flyers / Affiches
 * À implémenter par le collègue selon SPEC_Calculateurs_Avenir_Numerique.md §4
 */

import type { ParametresBase, ResultatCalcul } from '../types'

export interface InputFlyers {
  quantite: number
  dimension_mode: 'standard' | 'custom'
  largeur_mm?: number
  hauteur_mm?: number
  taille_standard?: 'A6' | 'A5' | 'A4' | 'A3' | 'DL' | 'carte_visite'
  papier_id: string
  recto_verso: 'recto' | 'rv'
  techno_mode: 'auto' | 'offset' | 'numerique'
  finitions: string[]
  bat: boolean
}

export interface ParamsFlyers extends ParametresBase {
  margeOffsetPercent: number
  margeNumeriquePercent: number
  seuilOffset: number
  machines: Array<{
    id: string
    techno: 'offset' | 'numerique'
    formatMaxMm: { largeur: number; hauteur: number }
    vitesseFH: number
    tauxHoraireHT: number
    coutCalage?: number
    gachesPercent: number
    tauxHoraireOperateur: number
  }>
  papiers: Array<{
    id: string
    compatible_techno: ('offset' | 'numerique')[]
    formats: Array<{ largeur_mm: number; hauteur_mm: number; prixHT: number }>
  }>
  finitions: Array<{
    id: string
    applicable_to: string[]
    type: 'forfait' | 'unitaire' | 'm2' | 'par_face'
    prixHT: number
    sous_traite?: boolean
    cout_fournisseur?: number
    marge_sous_traitance?: number
  }>
}

export function calculerFlyers(
  _input: InputFlyers,
  _params: ParamsFlyers
): ResultatCalcul {
  // TODO : implémenter selon la spec §4
  throw new Error('Calculateur Flyers non encore implémenté')
}
