import type { BobinesParams } from '@avenir/core';

/**
 * Paramètres de démo (valeurs estimées).
 * ⚠️ À calibrer plus tard depuis Supabase.
 */
export const demoBobinesParams: BobinesParams = {
  materiaux: [
    {
      id: 'vinyle_blanc',
      nom: 'Vinyle blanc adhésif',
      type: 'adhesif',
      methode_calcul: 'calepinage',
      rouleaux: [
        { largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 60 },
        { largeur_mm: 1370, longueur_m: 50, prix_rouleau_ht: 80 },
      ],
    },
    {
      id: 'vinyle_transparent',
      nom: 'Vinyle transparent adhésif',
      type: 'adhesif',
      methode_calcul: 'calepinage',
      rouleaux: [{ largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 75 }],
    },
    {
      id: 'papier_simple',
      nom: 'Papier adhésif standard (m²)',
      type: 'papier',
      methode_calcul: 'm2',
      rouleaux: [],
      prix_m2_ht: 4,
    },
    {
      id: 'polyester_metallise',
      nom: 'Polyester métallisé',
      type: 'film',
      methode_calcul: 'auto',
      rouleaux: [{ largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 140 }],
    },
  ],
  machine_impression: {
    id: 'solvant',
    nom: 'Solvant / éco-solvant',
    vitesse_m2_h: 10,
    taux_horaire_ht: 50,
    operateur_taux_horaire_ht: 25,
    gaches_pct: 5,
  },
  machine_decoupe: {
    id: 'summa',
    nom: 'Summa (découpe roll)',
    vitesse_m_min: 30,
    taux_horaire_ht: 40,
    operateur_taux_horaire_ht: 25,
    forfait_cliquage_ht: 25,
  },
  finitions: [
    { id: 'vernis_brillant', nom: 'Vernis brillant (m²)', type: 'm2', prix_ht: 8, sous_traite: false },
    {
      id: 'lamination',
      nom: 'Lamination protection (m²)',
      type: 'm2',
      prix_ht: 6,
      sous_traite: false,
    },
    { id: 'dorure_unitaire', nom: 'Dorure à chaud (unitaire)', type: 'unitaire', prix_ht: 0.1, sous_traite: false },
    {
      id: 'effet_3d',
      nom: 'Effet 3D (sous-traité)',
      type: 'forfait',
      prix_ht: 0,
      sous_traite: true,
      cout_fournisseur_ht: 150,
      marge_sous_traitance_pct: 40,
    },
  ],
  espace_entre_etiquettes_mm: 3,
  forfait_rembobinage_ht: 15,
  frais_fixes_ht: 30,
  bat_prix_ht: 25,
  marge_pct: 70,
  tva_pct: 20,
  degressif: [
    { seuil: 500, remise_pct: 5 },
    { seuil: 2000, remise_pct: 10 },
    { seuil: 10000, remise_pct: 20 },
  ],
};
