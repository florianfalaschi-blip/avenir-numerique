import type { RollupParams } from '@avenir/core';

/**
 * Paramètres de démo (valeurs estimées).
 *
 * ⚠️ Ces valeurs seront remplacées plus tard par les vraies données
 * provenant de Supabase (table `app_settings`, clé `calc_rollup_settings_v1`).
 * Source : estimations métier de Florian, à calibrer sur devis Excel réels.
 */
export const demoRollupParams: RollupParams = {
  baches: [
    { id: 'pvc_440', nom: 'PVC 440g (standard)', prix_m2_ht: 8 },
    { id: 'pvc_510', nom: 'PVC 510g (épais)', prix_m2_ht: 10 },
    { id: 'tissu', nom: 'Tissu polyester', prix_m2_ht: 14 },
  ],
  structures: [
    { id: 'eco', nom: 'Économique', prix_unitaire_ht: 35 },
    { id: 'standard', nom: 'Standard', prix_unitaire_ht: 55 },
    { id: 'premium', nom: 'Premium (alu brossé)', prix_unitaire_ht: 90 },
  ],
  machine: {
    id: 'epson',
    nom: 'Epson solvant',
    vitesse_m2_h: 12,
    taux_horaire_ht: 50,
  },
  frais_fixes_ht: 15,
  bat_prix_ht: 25,
  marge_pct: 50,
  tva_pct: 20,
  degressif: [
    { seuil: 3, remise_pct: 5 },
    { seuil: 10, remise_pct: 10 },
    { seuil: 25, remise_pct: 15 },
  ],
};
