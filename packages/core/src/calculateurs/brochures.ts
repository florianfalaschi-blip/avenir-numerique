/**
 * Calculateur Brochures
 * À implémenter par le collègue selon SPEC_Calculateurs_Avenir_Numerique.md §6
 */

import type { ParametresBase, ResultatCalcul } from '../types'

export interface InputBrochures {
  quantite: number
  nb_pages: number
  dimension_mode: 'standard' | 'custom'
  taille_standard?: 'A6' | 'A5' | 'A4'
  largeur_mm?: number
  hauteur_mm?: number
  reliure_id: string
  papier_interieur_id: string
  papier_couverture_id: string
  couleur_interieur: 'quadri' | 'noir'
  couleur_couverture: 'quadri' | 'noir'
  techno_mode: 'auto' | 'offset' | 'numerique'
  finitions: string[]
  bat: boolean
}

export interface ParamsBrochures extends ParametresBase {
  margeOffsetPercent: number
  margeNumeriquePercent: number
  seuilOffset: number
  reliures: Array<{
    id: string
    pages_multiple: number
    pages_min: number
    pages_max: number
    machine_faconnage_id: string
    consommables_unitaire_ht: number
  }>
  machines_impression: Array<{
    id: string
    techno: 'offset' | 'numerique'
    formatMaxMm: { largeur: number; hauteur: number }
    vitesseFH: number
    tauxHoraireHT: number
    coutCalage?: number
    gachesPercent: number
    tauxHoraireOperateur: number
  }>
  machines_faconnage: Array<{
    id: string
    vitesseFH: number
    tauxHoraireHT: number
    tauxHoraireOperateur: number
  }>
  papiers: Array<{
    id: string
    compatible_techno: ('offset' | 'numerique')[]
    formats: Array<{ largeur_mm: number; hauteur_mm: number; prixHT: number }>
  }>
  finitions: Array<{ id: string; type: string; prixHT: number }>
  frais_fixes_brochure: number
}

export function calculerBrochures(
  _input: InputBrochures,
  _params: ParamsBrochures
): ResultatCalcul {
  // TODO : implémenter selon la spec §6
  throw new Error('Calculateur Brochures non encore implémenté')
}
