'use client';

import type { FlyersPapierConfig } from '@avenir/core';
import { useSettings } from '@/lib/settings';

/**
 * Type unifié d'un papier partagé entre Flyers et Brochures.
 * Structurellement identique à FlyersPapierConfig et BrochuresPapierConfig
 * (mêmes champs, mêmes types).
 */
export type SharedPapierConfig = FlyersPapierConfig;

/**
 * Catalogue Papiers importé du calculateur legacy (snapshot 2026-05-17).
 * 231 papiers uniques après dédupe Flyers + Brochures par (nom, grammage).
 *
 * Champs : nom, grammage, fournisseur, main (épaisseur µm/g pour calc épaisseur
 * brochure), formats_achat avec prix/feuilles_par_paquet, compatible_techno.
 *
 * À modifier depuis /parametres/papiers.
 */
export const defaultSharedPapiers: SharedPapierConfig[] = [
  {
    id: 'arena_ew_100',
    nom: 'Arena EW',
    grammage: 100,
    fournisseur: 'Fedrigoni',
    main: 1.22,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 21,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'arena_ew_120',
    nom: 'Arena EW',
    grammage: 120,
    fournisseur: 'Fedrigoni',
    main: 1.22,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 24,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'arena_ew_170',
    nom: 'Arena EW',
    grammage: 170,
    fournisseur: 'Fedrigoni',
    main: 1.22,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 17,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'arena_ew_250',
    nom: 'Arena EW',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 1.25,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 26,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'arena_ew_300',
    nom: 'Arena EW',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1.25,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 24,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'arena_ew_350',
    nom: 'Arena EW',
    grammage: 350,
    fournisseur: 'Fedrigoni',
    main: 1.25,
    formats_achat: [
      {
        largeur_mm: 482,
        hauteur_mm: 330,
        prix_paquet_ht: 16,
        feuilles_par_paquet: 100,
      },
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 35,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'bristol_320',
    nom: 'Bristol',
    grammage: 320,
    fournisseur: 'Torraspapel',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 11.71,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_offset_90',
    nom: 'Coral Book (offset)',
    grammage: 90,
    fournisseur: 'Torraspapel',
    main: 1.2,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 618.43,
        feuilles_par_paquet: 44000,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_115',
    nom: 'Couché satin',
    grammage: 115,
    fournisseur: 'Fedrigoni',
    main: 0.82,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 16,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_130',
    nom: 'Couché satin',
    grammage: 130,
    fournisseur: 'Fedrigoni',
    main: 0.81,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 18,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_150',
    nom: 'Couché satin',
    grammage: 150,
    fournisseur: 'Fedrigoni',
    main: 0.83,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 20,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_170',
    nom: 'Couché satin',
    grammage: 170,
    fournisseur: 'Fedrigoni',
    main: 0.85,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 18,
        feuilles_par_paquet: 400,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_200',
    nom: 'Couché satin',
    grammage: 200,
    fournisseur: 'Fedrigoni',
    main: 0.87,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 22,
        feuilles_par_paquet: 400,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_250',
    nom: 'Couché satin',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 0.93,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 17,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_300',
    nom: 'Couché satin',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 0.95,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 20,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_350',
    nom: 'Couché satin',
    grammage: 350,
    fournisseur: 'Fedrigoni',
    main: 0.98,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 19,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'couche_satin_400',
    nom: 'Couché satin',
    grammage: 400,
    fournisseur: 'Fedrigoni',
    main: 1.01,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 22,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'digicop_400_400',
    nom: 'Digicop 400µ',
    grammage: 400,
    fournisseur: 'Sodinor',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 99.9,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'digilux_fd_200_200',
    nom: 'Digilux FD 200µ',
    grammage: 200,
    fournisseur: 'Sodinor',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 3800,
        feuilles_par_paquet: 20000,
      },
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 21.545,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'giroform_digital_cb_blanc_80',
    nom: 'Giroform Digital CB blanc',
    grammage: 80,
    fournisseur: 'Inapa',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 20.67,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'giroform_digital_cf_bleu_80',
    nom: 'Giroform Digital CF bleu',
    grammage: 80,
    fournisseur: 'Inapa',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 20.15,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_2_faces_300',
    nom: 'Invercote Creato (2 faces)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 13.95,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_2_faces_350',
    nom: 'Invercote Creato (2 faces)',
    grammage: 350,
    fournisseur: 'Antalis',
    main: 1.19,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 16.42,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_1_face_240',
    nom: 'Invercote G. (1 face)',
    grammage: 240,
    fournisseur: 'Antalis',
    main: 1.25,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 16.71,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_1_face_260',
    nom: 'Invercote G. (1 face)',
    grammage: 260,
    fournisseur: 'Antalis',
    main: 1.27,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 19.04,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_1_face_280',
    nom: 'Invercote G. (1 face)',
    grammage: 280,
    fournisseur: 'Antalis',
    main: 1.29,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 20.5,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_1_face_300',
    nom: 'Invercote G. (1 face)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.32,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 13.73,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'old_mill_pw_150',
    nom: 'Old Mill PW',
    grammage: 150,
    fournisseur: 'Fedrigoni',
    main: 1.45,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 31,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'old_mill_pw_300',
    nom: 'Old Mill PW',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1.45,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 38,
        feuilles_par_paquet: 150,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_castgloss_84',
    nom: 'Raflatac Castgloss',
    grammage: 84,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 70.19,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_raflabrite_86',
    nom: 'Raflatac Raflabrite',
    grammage: 86,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 65.02,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_vellum_76',
    nom: 'Raflatac Vellum',
    grammage: 76,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 59.14,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_160',
    nom: 'Splendorgel',
    grammage: 160,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 35,
        feuilles_par_paquet: 400,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_230',
    nom: 'Splendorgel',
    grammage: 230,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 30,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_270',
    nom: 'Splendorgel',
    grammage: 270,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 36,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_300',
    nom: 'Splendorgel',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 41,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_340',
    nom: 'Splendorgel',
    grammage: 340,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 37,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'tintoretto_gesso_140',
    nom: 'Tintoretto Gesso',
    grammage: 140,
    fournisseur: 'Fedrigoni',
    main: 1.4,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 28,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'tintoretto_gesso_200',
    nom: 'Tintoretto Gesso',
    grammage: 200,
    fournisseur: 'Fedrigoni',
    main: 1.4,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 39,
        feuilles_par_paquet: 250,
      },
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 90,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'tintoretto_gesso_250',
    nom: 'Tintoretto Gesso',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 1.43,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 39,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'tintoretto_gesso_300',
    nom: 'Tintoretto Gesso',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1.43,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 47,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'vinyle_adhesif_blanc_enlevable_80',
    nom: 'Vinyle adhésif blanc enlevable',
    grammage: 80,
    fournisseur: 'INAPA',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 290.2,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'vinyle_adhesif_blanc_permanent_80',
    nom: 'Vinyle adhésif blanc permanent',
    grammage: 80,
    fournisseur: 'Rhenoplastiques',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 122,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'vinyle_adhesif_transparent_permanent_80',
    nom: 'Vinyle adhésif transparent permanent',
    grammage: 80,
    fournisseur: 'Rhenoplastiques',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 122,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'bristol_surfin_taiga_320',
    nom: 'Bristol Surfin Taiga',
    grammage: 320,
    fournisseur: 'Toraspapel',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 16.83,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_digital_white_120',
    nom: 'Coral Book Digital White',
    grammage: 120,
    fournisseur: 'Toraspapel',
    main: 1.18,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 14.74,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_digital_white_140',
    nom: 'Coral Book Digital White',
    grammage: 140,
    fournisseur: 'Toraspapel',
    main: 1.17,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 8.77,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_digital_white_160',
    nom: 'Coral Book Digital White',
    grammage: 160,
    fournisseur: 'Toraspapel',
    main: 1.16,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 10.02,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_digital_white_190',
    nom: 'Coral Book Digital White',
    grammage: 190,
    fournisseur: 'Toraspapel',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 11.9,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_digital_white_250',
    nom: 'Coral Book Digital White',
    grammage: 250,
    fournisseur: 'Toraspapel',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 12.84,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_digital_white_300',
    nom: 'Coral Book Digital White',
    grammage: 300,
    fournisseur: 'Toraspapel',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 19.27,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'coral_book_digital_white_90',
    nom: 'Coral Book Digital White',
    grammage: 90,
    fournisseur: 'Toraspapel',
    main: 1.2,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 10.07,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_couche_2_faces_220',
    nom: 'Invercote Creato (couché 2 faces)',
    grammage: 220,
    fournisseur: 'Antalis',
    main: 1.05,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 23.08,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_couche_2_faces_240',
    nom: 'Invercote Creato (couché 2 faces)',
    grammage: 240,
    fournisseur: 'Antalis',
    main: 1.08,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 19.72,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_couche_2_faces_260',
    nom: 'Invercote Creato (couché 2 faces)',
    grammage: 260,
    fournisseur: 'Antalis',
    main: 1.12,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 21.36,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_couche_2_faces_280',
    nom: 'Invercote Creato (couché 2 faces)',
    grammage: 280,
    fournisseur: 'Antalis',
    main: 1.13,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 23,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_couche_2_faces_300',
    nom: 'Invercote Creato (couché 2 faces)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 15.41,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_creato_couche_2_faces_350',
    nom: 'Invercote Creato (couché 2 faces)',
    grammage: 350,
    fournisseur: 'Antalis',
    main: 1.19,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 17.97,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_couche_1_face_200',
    nom: 'Invercote G (couché 1 face)',
    grammage: 200,
    fournisseur: 'Antalis',
    main: 1.18,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 20.81,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_couche_1_face_220',
    nom: 'Invercote G (couché 1 face)',
    grammage: 220,
    fournisseur: 'Antalis',
    main: 1.18,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 22.71,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_couche_1_face_240',
    nom: 'Invercote G (couché 1 face)',
    grammage: 240,
    fournisseur: 'Antalis',
    main: 1.25,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 19.39,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_couche_1_face_260',
    nom: 'Invercote G (couché 1 face)',
    grammage: 260,
    fournisseur: 'Antalis',
    main: 1.27,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 21.01,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_couche_1_face_280',
    nom: 'Invercote G (couché 1 face)',
    grammage: 280,
    fournisseur: 'Antalis',
    main: 1.29,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 22.63,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'invercote_g_couche_1_face_300',
    nom: 'Invercote G (couché 1 face)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.32,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 15.15,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_115',
    nom: 'Novatech Digital Silk',
    grammage: 115,
    fournisseur: 'Antalis',
    main: 0.9,
    formats_achat: [
      {
        largeur_mm: 330,
        hauteur_mm: 480,
        prix_paquet_ht: 18.87,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_130',
    nom: 'Novatech Digital Silk',
    grammage: 130,
    fournisseur: 'Antalis',
    main: 0.9,
    formats_achat: [
      {
        largeur_mm: 330,
        hauteur_mm: 480,
        prix_paquet_ht: 21.34,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_150',
    nom: 'Novatech Digital Silk',
    grammage: 150,
    fournisseur: 'Antalis',
    main: 0.9,
    formats_achat: [
      {
        largeur_mm: 330,
        hauteur_mm: 480,
        prix_paquet_ht: 12.31,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_170',
    nom: 'Novatech Digital Silk',
    grammage: 170,
    fournisseur: 'Antalis',
    main: 0.95,
    formats_achat: [
      {
        largeur_mm: 330,
        hauteur_mm: 480,
        prix_paquet_ht: 13.95,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_200',
    nom: 'Novatech Digital Silk',
    grammage: 200,
    fournisseur: 'Antalis',
    main: 0.95,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 16.92,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_250',
    nom: 'Novatech Digital Silk',
    grammage: 250,
    fournisseur: 'Antalis',
    main: 0.98,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 21.14,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_300',
    nom: 'Novatech Digital Silk',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.02,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 12.31,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'novatech_digital_silk_350',
    nom: 'Novatech Digital Silk',
    grammage: 350,
    fournisseur: 'Antalis',
    main: 1.04,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 13.95,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_castgloss_il_brillant_blanc_adhesif_permanent_avec_refente_84',
    nom: 'Raflatac Castgloss IL Brillant blanc, adhésif permanent avec refente',
    grammage: 84,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 86,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_raflabrite_il_satin_blanc_adhesif_permanent_avec_refente_86',
    nom: 'Raflatac Raflabrite IL Satin blanc, adhésif permanent avec refente',
    grammage: 86,
    fournisseur: 'Antalis',
    main: 0.85,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 80.62,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_vellum_il_velin_blanc_adhesif_permanent_avec_refente_76',
    nom: 'Raflatac Vellum IL Velin blanc, adhésif permanent avec refente',
    grammage: 76,
    fournisseur: 'Antalis',
    main: 0.88,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 72.37,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sticotac_satin_adhesif_permanent_sans_refente_80',
    nom: 'Sticotac Satin, adhésif permanent sans refente',
    grammage: 80,
    fournisseur: 'Antalis',
    main: 1.08,
    formats_achat: [
      {
        largeur_mm: 350,
        hauteur_mm: 500,
        prix_paquet_ht: 57.25,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'academia_premium_w_120',
    nom: 'Academia Premium W',
    grammage: 120,
    fournisseur: 'Fedrigoni',
    main: 1.45,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 54,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'academia_premium_w_160',
    nom: 'Academia Premium W',
    grammage: 160,
    fournisseur: 'Fedrigoni',
    main: 1.29,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 116,
        feuilles_par_paquet: 400,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'academia_premium_w_320',
    nom: 'Academia Premium W',
    grammage: 320,
    fournisseur: 'Fedrigoni',
    main: 1.29,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 116,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'acquerello_avorio_240',
    nom: 'Acquerello Avorio',
    grammage: 240,
    fournisseur: 'Fedrigoni',
    main: 1.45,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 75,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'acquerello_avorio_280',
    nom: 'Acquerello Avorio',
    grammage: 280,
    fournisseur: 'Fedrigoni',
    main: 1.45,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 100,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'adestor_gloss_digital_adhesif_permanent_sans_refente_80',
    nom: 'Adestor Gloss Digital, adhésif permanent SANS refente',
    grammage: 80,
    fournisseur: 'Toraspapel',
    main: 0.93,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 44.3,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'adestor_matt_digital_adhesif_permanent_sans_refente_80',
    nom: 'Adestor Matt Digital, adhésif permanent SANS refente',
    grammage: 80,
    fournisseur: 'Toraspapel',
    main: 0.93,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 35.52,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'adhoc_adh_refendu_m_ou_b_192',
    nom: 'Adhoc (adh refendu M ou B)',
    grammage: 192,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 113,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'adhoc_tintoretto_adh_refendu_197',
    nom: 'Adhoc Tintoretto (adh refendu)',
    grammage: 197,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 149,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'arena_ew_80',
    nom: 'Arena EW',
    grammage: 80,
    fournisseur: 'Fedrigoni',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 37,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'arena_ew_90',
    nom: 'Arena EW',
    grammage: 90,
    fournisseur: 'Fedrigoni',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 43,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_cx22_digital_diamond_white_lisse_320',
    nom: 'Conqueror CX22 Digital Diamond White (lisse)',
    grammage: 320,
    fournisseur: 'Antalis',
    main: 1.03,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 68.04,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_cx22_i_tone_blanc_diamant_lisse_100',
    nom: 'Conqueror CX22 i-Tone blanc diamant lisse',
    grammage: 100,
    fournisseur: 'Antalis',
    main: 1.2,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 32.12,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_cx22_i_tone_blanc_diamant_mat_sans_filigrane_lisse_120',
    nom: 'Conqueror CX22 i-Tone blanc diamant mat sans filigrane lisse',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.14,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 48.06,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_laid_digital_brilliant_white_verge_300',
    nom: 'Conqueror Laid Digital Brilliant White (vergé)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.43,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 63.79,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_laid_i_tone_blanc_glacier_mat_sans_filigrane_verge_100',
    nom: 'Conqueror Laid i-Tone blanc glacier mat sans filigrane vergé',
    grammage: 100,
    fournisseur: 'Antalis',
    main: 1.45,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 40.04,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_laid_i_tone_blanc_glacier_verge_220',
    nom: 'Conqueror Laid i-Tone blanc glacier vergé',
    grammage: 220,
    fournisseur: 'Antalis',
    main: 1.41,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 36.58,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_wove_digital_brilliant_white_15_coton_300',
    nom: 'Conqueror Wove Digital Brilliant White (15% coton)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.17,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 63.79,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_wove_i_tone_blanc_glacier_lisse_100',
    nom: 'Conqueror Wove i-Tone blanc glacier lisse',
    grammage: 100,
    fournisseur: 'Antalis',
    main: 1.3,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 40.04,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_wove_i_tone_blanc_glacier_lisse_120',
    nom: 'Conqueror Wove i-Tone blanc glacier lisse',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.3,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 48.06,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'conqueror_wove_i_tone_blanc_glacier_lisse_350',
    nom: 'Conqueror Wove i-Tone blanc glacier lisse',
    grammage: 350,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 29.08,
        feuilles_par_paquet: 50,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'constellation_snow_170',
    nom: 'Constellation Snow',
    grammage: 170,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 78,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'constellation_snow_240',
    nom: 'Constellation Snow',
    grammage: 240,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 107,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'constellation_snow_280',
    nom: 'Constellation Snow',
    grammage: 280,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 101,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'curious_matter_toutes_teintes_mat_270',
    nom: 'Curious Matter (toutes teintes) mat',
    grammage: 270,
    fournisseur: 'Antalis',
    main: 1.35,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 58.54,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'curious_metallics_toutes_teintes_120',
    nom: 'Curious Metallics (toutes teintes)',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.35,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 45.87,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'curious_metallics_toutes_teintes_300',
    nom: 'Curious Metallics (toutes teintes)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.33,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 59.11,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'curious_skin_bleu_noir_rouge_270',
    nom: 'Curious Skin (Bleu, Noir, Rouge)',
    grammage: 270,
    fournisseur: 'Antalis',
    main: 0.96,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 66.5,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'curious_skin_grey_ou_extra_blanc_270',
    nom: 'Curious Skin (Grey ou Extra blanc)',
    grammage: 270,
    fournisseur: 'Antalis',
    main: 0.96,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 47.74,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'curious_translucents_i_tone_112',
    nom: 'Curious Translucents i-Tone',
    grammage: 112,
    fournisseur: 'Antalis',
    main: 0.87,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 470,
        prix_paquet_ht: 52.64,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'digicoat_400_400',
    nom: 'Digicoat 400µ',
    grammage: 400,
    fournisseur: 'Sodinor',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 99.9,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'fabriano_life_w_115',
    nom: 'Fabriano Life W',
    grammage: 115,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 53,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'fabriano_life_w_150',
    nom: 'Fabriano Life W',
    grammage: 150,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 69,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'fabriano_life_w_300',
    nom: 'Fabriano Life W',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 56,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'fabriano_velluto_ou_tradizione_120',
    nom: 'Fabriano Velluto ou Tradizione',
    grammage: 120,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 119,
        feuilles_par_paquet: 300,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'fabriano_velluto_ou_tradizione_240',
    nom: 'Fabriano Velluto ou Tradizione',
    grammage: 240,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 99,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'fabriano_velluto_ou_tradizione_300',
    nom: 'Fabriano Velluto ou Tradizione',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 124,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'freelife_cento_ew_120',
    nom: 'Freelife Cento EW',
    grammage: 120,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 64,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'freelife_cento_ew_170',
    nom: 'Freelife Cento EW',
    grammage: 170,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 47,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'freelife_cento_ew_260',
    nom: 'Freelife Cento EW',
    grammage: 260,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 69,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'freelife_cento_ew_350',
    nom: 'Freelife Cento EW',
    grammage: 350,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 57,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'freelife_vellum_pw_120',
    nom: 'Freelife Vellum PW',
    grammage: 120,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 64,
        feuilles_par_paquet: 150,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'freelife_vellum_pw_320',
    nom: 'Freelife Vellum PW',
    grammage: 320,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 68,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'keaykolour_i_tone_bleu_ou_rouge_300',
    nom: 'Keaykolour i-Tone (Bleu ou Rouge)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.48,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 43.29,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'keaykolour_i_tone_cygne_ou_lin_300',
    nom: 'Keaykolour i-Tone (Cygne ou Lin)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.48,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 38.54,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'keaykolour_i_tone_parchment_creme_250',
    nom: 'Keaykolour i-Tone Parchment Crème',
    grammage: 250,
    fournisseur: 'Antalis',
    main: 1.48,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 32.13,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'keaykolour_original_i_tone_bleu_ou_rouge_mat_300',
    nom: 'Keaykolour Original i-Tone (Bleu ou Rouge) mat',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.45,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 41.22,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'keaykolour_original_i_tone_lin_mat_300',
    nom: 'Keaykolour Original i-Tone Lin mat',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 0.94,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 36.73,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'keaykolour_original_i_tone_parchment_chamois_250',
    nom: 'Keaykolour Original i-Tone Parchment Chamois',
    grammage: 250,
    fournisseur: 'Antalis',
    main: 1.48,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 30.62,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'keaykolour_recycled_i_tone_camel_300',
    nom: 'Keaykolour Recycled i-Tone Camel',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.42,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 43.29,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'marina_conchiglia_175',
    nom: 'Marina Conchiglia',
    grammage: 175,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 80,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'marina_conchiglia_240',
    nom: 'Marina Conchiglia',
    grammage: 240,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 109,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'materica_clay_gesso_120',
    nom: 'Materica (Clay, Gesso)',
    grammage: 120,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 83,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'materica_clay_gesso_250',
    nom: 'Materica (Clay, Gesso)',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 87,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'materica_kraft_250',
    nom: 'Materica Kraft',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 87,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_eggshell_blanc_extra_blanc_mat_118',
    nom: 'Mohawk Superfine Eggshell (blanc, extra blanc) mat',
    grammage: 118,
    fournisseur: 'Antalis',
    main: 1.38,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 55.65,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_eggshell_blanc_extra_blanc_mat_148',
    nom: 'Mohawk Superfine Eggshell (blanc, extra blanc) mat',
    grammage: 148,
    fournisseur: 'Antalis',
    main: 1.34,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 34.9,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_eggshell_blanc_extra_blanc_mat_216',
    nom: 'Mohawk Superfine Eggshell (blanc, extra blanc) mat',
    grammage: 216,
    fournisseur: 'Antalis',
    main: 1.29,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 53.62,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_eggshell_blanc_extra_blanc_mat_270',
    nom: 'Mohawk Superfine Eggshell (blanc, extra blanc) mat',
    grammage: 270,
    fournisseur: 'Antalis',
    main: 1.36,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 30.94,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_eggshell_blanc_extra_blanc_mat_324',
    nom: 'Mohawk Superfine Eggshell (blanc, extra blanc) mat',
    grammage: 324,
    fournisseur: 'Antalis',
    main: 1.37,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 40.21,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_smooth_i_tone_extra_blanc_satine_148',
    nom: 'Mohawk Superfine Smooth i-Tone extra blanc satiné',
    grammage: 148,
    fournisseur: 'Antalis',
    main: 1.11,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 32.23,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_smooth_i_tone_extra_blanc_satine_216',
    nom: 'Mohawk Superfine Smooth i-Tone extra blanc satiné',
    grammage: 216,
    fournisseur: 'Antalis',
    main: 1.12,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 49.52,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_smooth_i_tone_extra_blanc_satine_270',
    nom: 'Mohawk Superfine Smooth i-Tone extra blanc satiné',
    grammage: 270,
    fournisseur: 'Antalis',
    main: 1.13,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 67.01,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_smooth_i_tone_extra_blanc_satine_324',
    nom: 'Mohawk Superfine Smooth i-Tone extra blanc satiné',
    grammage: 324,
    fournisseur: 'Antalis',
    main: 1.14,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 40.21,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'mohawk_superfine_smooth_i_tone_extra_blanc_satine_380',
    nom: 'Mohawk Superfine Smooth i-Tone extra blanc satiné',
    grammage: 380,
    fournisseur: 'Antalis',
    main: 1.14,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 37.71,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'munken_print_cream_1_8_digital_115',
    nom: 'Munken Print Cream 1.8 Digital',
    grammage: 115,
    fournisseur: 'Toraspapel',
    main: 1.8,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 9.26,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'munken_print_cream_1_8_digital_80',
    nom: 'Munken Print Cream 1.8 Digital',
    grammage: 80,
    fournisseur: 'Toraspapel',
    main: 1.8,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 18.7,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nature_touch_class_w_200',
    nom: 'Nature Touch Class W',
    grammage: 200,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 86,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nature_touch_class_w_300',
    nom: 'Nature Touch Class W',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 51,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nature_touch_class_w_95',
    nom: 'Nature Touch Class W',
    grammage: 95,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 82,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_120',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.08,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 12.99,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_135',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 135,
    fournisseur: 'Antalis',
    main: 1.34,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 14.61,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_160',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 160,
    fournisseur: 'Antalis',
    main: 1.25,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 17.32,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_250',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 250,
    fournisseur: 'Antalis',
    main: 1.03,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 15.41,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_300',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.3,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 18.49,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_350',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 350,
    fournisseur: 'Antalis',
    main: 1.29,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 21.57,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_80',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 80,
    fournisseur: 'Antalis',
    main: 1.3,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 17.32,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nautilus_superwhite_hp_indigo_100_recycle_90',
    nom: 'Nautilus SuperWhite HP Indigo (100% recyclé)',
    grammage: 90,
    fournisseur: 'Antalis',
    main: 1.29,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 19.48,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nettuno_bianco_artico_140',
    nom: 'Nettuno Bianco Artico',
    grammage: 140,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 70,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nettuno_bianco_artico_215',
    nom: 'Nettuno Bianco Artico',
    grammage: 215,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 106,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'nettuno_bianco_artico_280',
    nom: 'Nettuno Bianco Artico',
    grammage: 280,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 109,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'old_mill_recycle_bianco_150',
    nom: 'Old Mill Recyclé Bianco',
    grammage: 150,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 75,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'old_mill_recycle_bianco_300',
    nom: 'Old Mill Recyclé Bianco',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 63,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_design_regular_digital_ultimate_white_120',
    nom: 'Olin Design Regular Digital Ultimate White',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.36,
    formats_achat: [
      {
        largeur_mm: 330,
        hauteur_mm: 480,
        prix_paquet_ht: 19.52,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_design_regular_digital_ultimate_white_200',
    nom: 'Olin Design Regular Digital Ultimate White',
    grammage: 200,
    fournisseur: 'Antalis',
    main: 1.36,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 16.26,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_design_regular_digital_ultimate_white_240',
    nom: 'Olin Design Regular Digital Ultimate White',
    grammage: 240,
    fournisseur: 'Antalis',
    main: 1.34,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 20.5,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_design_regular_digital_ultimate_white_300',
    nom: 'Olin Design Regular Digital Ultimate White',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.33,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 25.61,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_origins_digital_cereal_120',
    nom: 'Olin Origins Digital (Cereal)',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.4,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 10.1,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_origins_digital_chalk_120',
    nom: 'Olin Origins Digital (Chalk)',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.4,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 10.1,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_origins_digital_lava_stone_120',
    nom: 'Olin Origins Digital (Lava Stone)',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.4,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 13.88,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'olin_origins_digital_pebble_120',
    nom: 'Olin Origins Digital (Pebble)',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.4,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 10.1,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'pergraphica_rough_smooth_120',
    nom: 'Pergraphica Rough - Smooth',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 460,
        prix_paquet_ht: 15.62,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'pergraphica_rough_smooth_240',
    nom: 'Pergraphica Rough - Smooth',
    grammage: 240,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 21.09,
        feuilles_par_paquet: 150,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'pergraphica_rough_smooth_300',
    nom: 'Pergraphica Rough - Smooth',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 21.95,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'print_speed_laserjet_blanc_100',
    nom: 'Print Speed Laserjet blanc',
    grammage: 100,
    fournisseur: 'Antalis',
    main: 1.18,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 13.13,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'print_speed_laserjet_blanc_120',
    nom: 'Print Speed Laserjet blanc',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.05,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 15.76,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'print_speed_laserjet_blanc_80',
    nom: 'Print Speed Laserjet blanc',
    grammage: 80,
    fournisseur: 'Antalis',
    main: 1.35,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 10.51,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'print_speed_laserjet_blanc_90',
    nom: 'Print Speed Laserjet blanc',
    grammage: 90,
    fournisseur: 'Antalis',
    main: 1.28,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 11.82,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_pe_laser_hs_mat_blanc_adhesif_permanent_avec_refente_115',
    nom: 'Raflatac PE Laser HS mat blanc, adhésif permanent avec refente',
    grammage: 115,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 130.24,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_polylaser_gloss_blanc_adhesif_permanent_sans_refente_72',
    nom: 'Raflatac Polylaser Gloss blanc adhésif, permanent sans refente',
    grammage: 72,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 157.35,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_polylaser_gloss_hs_transparent_adhesif_permanent_sans_refente_71',
    nom: 'Raflatac Polylaser Gloss HS transparent, adhésif permanent sans refente',
    grammage: 71,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 145.71,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_polylaser_matt_hs_blanc_adhesif_permanent_avec_refente_75',
    nom: 'Raflatac Polylaser Matt HS blanc, adhésif permanent avec refente',
    grammage: 75,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 145.27,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_polylaser_matt_hs_blanc_enlevable_sans_refente_75',
    nom: 'Raflatac Polylaser Matt HS blanc, enlevable sans refente',
    grammage: 75,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 149.32,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_polylaser_matt_hs_transparent_adhesif_permanent_sans_refente_56',
    nom: 'Raflatac Polylaser Matt HS transparent, adhésif permanent sans refente',
    grammage: 56,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 126.32,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_polylaser_transparent_gloss_hs_enlevable_sans_refente_71',
    nom: 'Raflatac Polylaser Transparent gloss HS, enlevable sans refente',
    grammage: 71,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 149.66,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'raflatac_polylaser_white_mat_hs_blanc_permanent_high_sans_refente_75',
    nom: 'Raflatac Polylaser White mat HS blanc, permanent High sans refente',
    grammage: 75,
    fournisseur: 'Antalis',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 450,
        prix_paquet_ht: 149.32,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'rives_tradition_digital_extra_blanc_120',
    nom: 'Rives Tradition Digital, extra blanc',
    grammage: 120,
    fournisseur: 'Antalis',
    main: 1.5,
    formats_achat: [
      {
        largeur_mm: 330,
        hauteur_mm: 480,
        prix_paquet_ht: 89,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'rives_tradition_digital_extra_blanc_250',
    nom: 'Rives Tradition Digital, extra blanc',
    grammage: 250,
    fournisseur: 'Antalis',
    main: 1.5,
    formats_achat: [
      {
        largeur_mm: 480,
        hauteur_mm: 330,
        prix_paquet_ht: 92.71,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'silverado_papier_photo_225',
    nom: 'Silverado (Papier photo)',
    grammage: 225,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 79,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_color_ultra_black_370',
    nom: 'Sirio Color Ultra Black',
    grammage: 370,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 96,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_color_290',
    nom: 'Sirio Color',
    grammage: 290,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 123,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_ice_white_300',
    nom: 'Sirio Pearl Ice White',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 105,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_ice_white_350',
    nom: 'Sirio Pearl Ice White',
    grammage: 350,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 121,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_oyster_shell_125',
    nom: 'Sirio Pearl Oyster Shell',
    grammage: 125,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 121,
        feuilles_par_paquet: 300,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_oyster_shell_300',
    nom: 'Sirio Pearl Oyster Shell',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 100,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_platinum_300',
    nom: 'Sirio Pearl Platinum',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 93,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_polar_dawn_125',
    nom: 'Sirio Pearl Polar Dawn',
    grammage: 125,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 113,
        feuilles_par_paquet: 300,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_polar_dawn_300',
    nom: 'Sirio Pearl Polar Dawn',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 98,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'sirio_pearl_silver_350',
    nom: 'Sirio Pearl Silver',
    grammage: 350,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 128,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_ew_115',
    nom: 'Splendorgel EW',
    grammage: 115,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 69,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_ew_160',
    nom: 'Splendorgel EW',
    grammage: 160,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 78,
        feuilles_par_paquet: 400,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_ew_230',
    nom: 'Splendorgel EW',
    grammage: 230,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 65,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_ew_270',
    nom: 'Splendorgel EW',
    grammage: 270,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 83,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_ew_300',
    nom: 'Splendorgel EW',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 86,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_ew_340',
    nom: 'Splendorgel EW',
    grammage: 340,
    fournisseur: 'Fedrigoni',
    main: 1.1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 83,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorgel_ew_400',
    nom: 'Splendorgel EW',
    grammage: 400,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 96,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'splendorlux_1_pw_250',
    nom: 'Splendorlux 1 PW',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 96,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_card_eco100_pw_300',
    nom: 'Symbol Card Eco100 PW',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 56,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_card_eco100_pw_360',
    nom: 'Symbol Card Eco100 PW',
    grammage: 360,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 33,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_card_pw_270',
    nom: 'Symbol Card PW',
    grammage: 270,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 61,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_card_pw_300',
    nom: 'Symbol Card PW',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 53,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_card_pw_330',
    nom: 'Symbol Card PW',
    grammage: 330,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 64,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_freelife_e33_raster_130',
    nom: 'Symbol Freelife E33 Raster',
    grammage: 130,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 72,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_freelife_e33_raster_250',
    nom: 'Symbol Freelife E33 Raster',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 73,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_freelife_satin_400',
    nom: 'Symbol Freelife Satin',
    grammage: 400,
    fournisseur: 'Fedrigoni',
    main: 1.01,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 57,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_fusion_w_200',
    nom: 'Symbol Fusion W',
    grammage: 200,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 171,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'symbol_fusion_w_300',
    nom: 'Symbol Fusion W',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 205,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'tintoretto_touch_class_gesso_200',
    nom: 'Tintoretto Touch Class Gesso',
    grammage: 200,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 99,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'tintoretto_touch_class_gesso_300',
    nom: 'Tintoretto Touch Class Gesso',
    grammage: 300,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 58,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'tintoretto_touch_class_gesso_95',
    nom: 'Tintoretto Touch Class Gesso',
    grammage: 95,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 93,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'upside_premium_couche_1_face_270',
    nom: 'Upside Premium (couché 1 face)',
    grammage: 270,
    fournisseur: 'Antalis',
    main: 1.2,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 29.74,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'upside_premium_couche_1_face_300',
    nom: 'Upside Premium (couché 1 face)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.2,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 16.52,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'upside_premium_couche_1_face_350',
    nom: 'Upside Premium (couché 1 face)',
    grammage: 350,
    fournisseur: 'Antalis',
    main: 1.21,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 19.27,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'upside_premium_couche_1_face_400',
    nom: 'Upside Premium (couché 1 face)',
    grammage: 400,
    fournisseur: 'Antalis',
    main: 1.25,
    formats_achat: [
      {
        largeur_mm: 450,
        hauteur_mm: 320,
        prix_paquet_ht: 17.62,
        feuilles_par_paquet: 100,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'upside_premium_couche_2_faces_300',
    nom: 'Upside Premium (couché 2 faces)',
    grammage: 300,
    fournisseur: 'Antalis',
    main: 1.15,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 16.89,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'upside_premium_couche_2_faces_350',
    nom: 'Upside Premium (couché 2 faces)',
    grammage: 350,
    fournisseur: 'Antalis',
    main: 1.16,
    formats_achat: [
      {
        largeur_mm: 460,
        hauteur_mm: 320,
        prix_paquet_ht: 19.7,
        feuilles_par_paquet: 125,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'woodstock_betulla_140',
    nom: 'Woodstock Betulla',
    grammage: 140,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 90,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'woodstock_betulla_285',
    nom: 'Woodstock Betulla',
    grammage: 285,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 73,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'x_per_pw_120',
    nom: 'X-Per PW',
    grammage: 120,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 62,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'x_per_pw_140',
    nom: 'X-Per PW',
    grammage: 140,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 73,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'x_per_pw_200',
    nom: 'X-Per PW',
    grammage: 200,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 51,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'x_per_pw_250',
    nom: 'X-Per PW',
    grammage: 250,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 65,
        feuilles_par_paquet: 250,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'x_per_pw_320',
    nom: 'X-Per PW',
    grammage: 320,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 67,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'x_per_w_140',
    nom: 'X-Per W',
    grammage: 140,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 320,
        hauteur_mm: 464,
        prix_paquet_ht: 73,
        feuilles_par_paquet: 500,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
  {
    id: 'x_per_w_320',
    nom: 'X-Per W',
    grammage: 320,
    fournisseur: 'Fedrigoni',
    main: 1,
    formats_achat: [
      {
        largeur_mm: 464,
        hauteur_mm: 320,
        prix_paquet_ht: 67,
        feuilles_par_paquet: 200,
      },
    ],
    compatible_techno: [
      'numerique',
      'offset',
    ],
  },
];

/** Hook React : lecture du catalogue partagé papiers (modifié via /parametres/papiers). */
export function useSharedPapiers() {
  return useSettings('shared.papiers', defaultSharedPapiers);
}
