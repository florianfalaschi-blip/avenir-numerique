import type { PlaquesParams } from '@avenir/core';

export const defaultPlaquesParams: PlaquesParams = {
  materiaux: [
    {
      id: 'carton_micro_cannelure_blanc_1mm',
      nom: 'Carton Micro cannelure blanc 1mm',
      fournisseur: 'Antalis',
      formats_achat: [
        {
          largeur_cm: 80,
          hauteur_cm: 120,
          prix_unite_ht: 2,
        },
      ],
    },
    {
      id: 'dibond_alu_3_3mm',
      nom: 'Dibond Alu 3 3mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 122,
          hauteur_cm: 244,
          prix_unite_ht: 60,
        },
      ],
    },
    {
      id: 'dibond_blanc_3_3mm',
      nom: 'Dibond blanc 3 3mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 125,
          hauteur_cm: 255,
          prix_unite_ht: 40,
        },
      ],
    },
    {
      id: 'dispa_3_8mm',
      nom: 'Dispa 3.8mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 125,
          hauteur_cm: 184,
          prix_unite_ht: 12,
        },
      ],
    },
    {
      id: 'kapaline_10_10mm',
      nom: 'Kapaline 10 10mm',
      fournisseur: 'Antalis',
      formats_achat: [
        {
          largeur_cm: 140,
          hauteur_cm: 300,
          prix_unite_ht: 48,
        },
      ],
    },
    {
      id: 'kapaline_5_5mm',
      nom: 'Kapaline 5 5mm',
      fournisseur: 'Antalis',
      formats_achat: [
        {
          largeur_cm: 122,
          hauteur_cm: 230,
          prix_unite_ht: 27,
        },
      ],
    },
    {
      id: 'plexi_10_10mm',
      nom: 'Plexi 10 10mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 152,
          hauteur_cm: 203,
          prix_unite_ht: 175,
        },
      ],
    },
    {
      id: 'plexi_2_2mm',
      nom: 'Plexi 2 2mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 152,
          hauteur_cm: 203,
          prix_unite_ht: 36,
        },
      ],
    },
    {
      id: 'plexi_3_3mm',
      nom: 'Plexi 3 3mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 152,
          hauteur_cm: 205,
          prix_unite_ht: 65,
        },
      ],
    },
    {
      id: 'plexi_5_5mm',
      nom: 'Plexi 5 5mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 152,
          hauteur_cm: 203,
          prix_unite_ht: 79,
        },
      ],
    },
    {
      id: 'pvc_blanc_10_10mm',
      nom: 'PVC blanc 10 10mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 122,
          hauteur_cm: 244,
          prix_unite_ht: 61,
        },
      ],
    },
    {
      id: 'pvc_blanc_3_3mm',
      nom: 'PVC blanc 3 3mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 122,
          hauteur_cm: 244,
          prix_unite_ht: 16,
        },
      ],
    },
    {
      id: 'pvc_blanc_5_5mm',
      nom: 'PVC blanc 5 5mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 122,
          hauteur_cm: 244,
          prix_unite_ht: 30,
        },
      ],
    },
    {
      id: 'pvc_noir_3_3mm',
      nom: 'PVC noir 3 3mm',
      fournisseur: 'Thyssen Krupp',
      formats_achat: [
        {
          largeur_cm: 205,
          hauteur_cm: 305,
          prix_unite_ht: 56,
        },
      ],
    },
    {
      id: 'silkboard_2_2mm',
      nom: 'Silkboard 2 2mm',
      fournisseur: 'Antalis',
      formats_achat: [
        {
          largeur_cm: 82,
          hauteur_cm: 122,
          prix_unite_ht: 5,
        },
      ],
    },
  ],
  tailles_standards: [
    { id: 'A4', largeur_cm: 21, hauteur_cm: 29.7 },
    { id: 'A3', largeur_cm: 29.7, hauteur_cm: 42 },
    { id: 'A2', largeur_cm: 42, hauteur_cm: 59.4 },
    { id: 'A1', largeur_cm: 59.4, hauteur_cm: 84.1 },
    { id: 'A0', largeur_cm: 84.1, hauteur_cm: 118.9 },
  ],
  machine_impression: {
    id: 'mutoh',
    nom: 'Mutoh UV LED',
    vitesse_m2_h: 5,
    taux_horaire_ht: 11,
  },
  machine_decoupe: {
    id: 'zund',
    nom: 'Zund (découpe forme/plaque)',
    prix_metre_lineaire_ht: 1.5,
    forfait_minimum_ht: 10,
  },
  finitions: [
    { id: 'oeillets_4coins', nom: 'Œillets 4 coins (forfait)', type: 'forfait', prix_ht: 8 },
    { id: 'oeillet_unitaire', nom: 'Œillet à l\'unité', type: 'par_oeillet', prix_ht: 2 },
    { id: 'support_mural', nom: 'Support pose murale', type: 'unitaire', prix_ht: 6 },
    { id: 'vernis_protection', nom: 'Vernis protection (m²)', type: 'm2', prix_ht: 10 },
    { id: 'lamination_brillante', nom: 'Lamination brillante (m²)', type: 'm2', prix_ht: 15 },
  ],
  frais_fixes_ht: 20,
  bat_prix_ht: 25,
  marge_pct: 60,
  tva_pct: 20,
  degressif: [
    { seuil: 5, remise_pct: 5 },
    { seuil: 10, remise_pct: 10 },
    { seuil: 25, remise_pct: 15 },
  ],
};
