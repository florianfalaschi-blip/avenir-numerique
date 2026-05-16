import type { PlaquesParams } from '@avenir/core';

export const defaultPlaquesParams: PlaquesParams = {
  materiaux: [
    {
      id: 'pvc_3mm',
      nom: 'PVC expansé 3mm',
      fournisseur: '3A Composites',
      formats_achat: [
        { largeur_cm: 244, hauteur_cm: 122, prix_unite_ht: 22 },
        { largeur_cm: 305, hauteur_cm: 200, prix_unite_ht: 48 },
      ],
    },
    {
      id: 'forex_5mm',
      nom: 'Forex (PVC expansé) 5mm',
      fournisseur: '3A Composites',
      formats_achat: [
        { largeur_cm: 244, hauteur_cm: 122, prix_unite_ht: 30 },
        { largeur_cm: 305, hauteur_cm: 200, prix_unite_ht: 60 },
      ],
    },
    {
      id: 'dibond_3mm',
      nom: 'Dibond 3mm (alu composite)',
      fournisseur: '3A Composites',
      formats_achat: [
        { largeur_cm: 305, hauteur_cm: 150, prix_unite_ht: 180 },
        { largeur_cm: 200, hauteur_cm: 100, prix_unite_ht: 90 },
      ],
    },
    {
      id: 'plexi_5mm',
      nom: 'Plexiglas 5mm transparent',
      fournisseur: 'Evonik',
      formats_achat: [
        { largeur_cm: 200, hauteur_cm: 100, prix_unite_ht: 110 },
        { largeur_cm: 305, hauteur_cm: 200, prix_unite_ht: 280 },
      ],
    },
    {
      id: 'carton_plume_5mm',
      nom: 'Carton plume 5mm',
      fournisseur: 'Bachmann',
      formats_achat: [{ largeur_cm: 100, hauteur_cm: 140, prix_unite_ht: 12 }],
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
    taux_horaire_ht: 60,
  },
  machine_decoupe: {
    id: 'zund',
    nom: 'Zund (découpe forme/plaque)',
    prix_metre_lineaire_ht: 1.5,
    forfait_minimum_ht: 15,
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
