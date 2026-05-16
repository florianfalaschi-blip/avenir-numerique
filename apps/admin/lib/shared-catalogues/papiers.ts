'use client';

import type { FlyersPapierConfig } from '@avenir/core';
import { useSettings } from '@/lib/settings';

/**
 * Type unifié d'un papier partagé entre Flyers et Brochures.
 * Structurellement identique à `FlyersPapierConfig` et `BrochuresPapierConfig`
 * (mêmes champs, mêmes types).
 */
export type SharedPapierConfig = FlyersPapierConfig;

/**
 * Catalogue partagé par défaut : merge de l'ancien defaultFlyersParams.papiers
 * et defaultBrochuresParams.papiers, dédupliqué et harmonisé.
 *
 * Avant le refactor : papiers vivaient dans `FlyersParams` et `BrochuresParams`
 * séparément.
 * Après : un seul catalogue partagé, modifié via /parametres/papiers.
 */
export const defaultSharedPapiers: SharedPapierConfig[] = [
  {
    id: 'couche_brillant_135',
    nom: 'Couché brillant 135g',
    grammage: 135,
    formats_achat: [
      { largeur_mm: 320, hauteur_mm: 464, prix_paquet_ht: 21, feuilles_par_paquet: 500 },
      { largeur_mm: 720, hauteur_mm: 1020, prix_paquet_ht: 90, feuilles_par_paquet: 250 },
    ],
    compatible_techno: ['numerique', 'offset'],
  },
  {
    id: 'couche_mat_135',
    nom: 'Couché mat 135g',
    grammage: 135,
    formats_achat: [
      { largeur_mm: 320, hauteur_mm: 464, prix_paquet_ht: 22, feuilles_par_paquet: 500 },
    ],
    compatible_techno: ['numerique', 'offset'],
  },
  {
    id: 'couche_brillant_170',
    nom: 'Couché brillant 170g',
    grammage: 170,
    formats_achat: [
      { largeur_mm: 320, hauteur_mm: 464, prix_paquet_ht: 27, feuilles_par_paquet: 500 },
      { largeur_mm: 720, hauteur_mm: 1020, prix_paquet_ht: 108, feuilles_par_paquet: 250 },
    ],
    compatible_techno: ['numerique', 'offset'],
  },
  {
    id: 'couche_mat_170',
    nom: 'Couché mat 170g',
    grammage: 170,
    formats_achat: [
      { largeur_mm: 320, hauteur_mm: 464, prix_paquet_ht: 28, feuilles_par_paquet: 500 },
      { largeur_mm: 720, hauteur_mm: 1020, prix_paquet_ht: 110, feuilles_par_paquet: 250 },
    ],
    compatible_techno: ['numerique', 'offset'],
  },
  {
    id: 'couverture_300',
    nom: 'Couché 300g (couverture brochure)',
    grammage: 300,
    formats_achat: [
      { largeur_mm: 320, hauteur_mm: 450, prix_paquet_ht: 90, feuilles_par_paquet: 250 },
    ],
    compatible_techno: ['numerique', 'offset'],
  },
  {
    id: 'recycle_350',
    nom: 'Recyclé 350g (numérique uniquement)',
    grammage: 350,
    formats_achat: [
      { largeur_mm: 320, hauteur_mm: 464, prix_paquet_ht: 60, feuilles_par_paquet: 250 },
    ],
    compatible_techno: ['numerique'],
  },
];

/** Hook React : lecture du catalogue partagé papiers (modifié via /parametres/papiers). */
export function useSharedPapiers() {
  return useSettings('shared.papiers', defaultSharedPapiers);
}
