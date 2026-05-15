/**
 * Script de test manuel.
 * Lance avec : pnpm tsx test-manuel.ts
 * (ou : pnpm vitest run test-manuel.ts si on l'écrit comme un test)
 *
 * Permet de tester les calculateurs avec des configurations réelles
 * et de voir le récap complet dans la console.
 */

import { calcRollup } from './src/calculators/rollup';
import { calcPlaques } from './src/calculators/plaques';
import { calcFlyers } from './src/calculators/flyers';
import type { RollupParams } from './src/types/rollup';
import type { PlaquesParams } from './src/types/plaques';
import type { FlyersParams } from './src/types/flyers';

// ============================================================
// PARAMÈTRES RÉELS AVENIR NUMÉRIQUE
// ⚠️ Valeurs à remplacer par les vraies (laissées en estimations)
// ============================================================

const rollupParams: RollupParams = {
  baches: [
    { id: 'pvc_440g', nom: 'Bâche PVC 440g', prix_m2_ht: 8.5 },
  ],
  structures: [
    { id: 'eco', nom: 'Économique', prix_unitaire_ht: 35 },
    { id: 'standard', nom: 'Standard', prix_unitaire_ht: 55 },
    { id: 'premium', nom: 'Premium', prix_unitaire_ht: 95 },
  ],
  machine: {
    id: 'epson',
    nom: 'Epson solvant',
    vitesse_m2_h: 8,
    taux_horaire_ht: 40,
  },
  frais_fixes_ht: 15,
  bat_prix_ht: 25,
  marge_pct: 50,
  tva_pct: 20,
  degressif: [
    { seuil: 3, remise_pct: 10 },
    { seuil: 5, remise_pct: 15 },
    { seuil: 10, remise_pct: 20 },
  ],
};

const plaquesParams: PlaquesParams = {
  materiaux: [
    {
      id: 'forex_5mm',
      nom: 'PVC expansé 5mm',
      formats_achat: [
        { largeur_cm: 305, hauteur_cm: 200, prix_unite_ht: 60 },
        { largeur_cm: 244, hauteur_cm: 122, prix_unite_ht: 30 },
      ],
    },
    {
      id: 'dibond_3mm',
      nom: 'Dibond 3mm',
      formats_achat: [{ largeur_cm: 305, hauteur_cm: 150, prix_unite_ht: 180 }],
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
    id: 'mutoh', nom: 'Mutoh UV LED',
    vitesse_m2_h: 5, taux_horaire_ht: 60,
  },
  machine_decoupe: {
    id: 'zund', nom: 'Zund',
    prix_metre_lineaire_ht: 1.5, forfait_minimum_ht: 15,
  },
  finitions: [
    { id: 'oeillets', nom: 'Œillets 4 coins', type: 'forfait', prix_ht: 8 },
    { id: 'support', nom: 'Support mural', type: 'unitaire', prix_ht: 6 },
    { id: 'vernis', nom: 'Vernis protection', type: 'm2', prix_ht: 10 },
  ],
  frais_fixes_ht: 20,
  bat_prix_ht: 25,
  marge_pct: 60,
  tva_pct: 20,
  degressif: [
    { seuil: 5, remise_pct: 5 },
    { seuil: 10, remise_pct: 10 },
  ],
};

const flyersParams: FlyersParams = {
  machines: [
    {
      id: 'hp_indigo',
      nom: 'HP Indigo',
      techno: 'numerique',
      format_max_mm: { largeur: 330, hauteur: 480 },
      vitesse_feuilles_h: 1500,
      taux_horaire_ht: 60,
      cout_calage_ht: 0,
      recto_verso_calage_unique: true,
      gaches_pct: 2,
      operateur_taux_horaire_ht: 30,
      actif: true,
    },
    {
      id: 'offset_speedmaster',
      nom: 'Offset Speedmaster',
      techno: 'offset',
      format_max_mm: { largeur: 720, hauteur: 1020 },
      vitesse_feuilles_h: 12000,
      taux_horaire_ht: 80,
      cout_calage_ht: 40,
      recto_verso_calage_unique: true,
      gaches_pct: 5,
      operateur_taux_horaire_ht: 35,
      actif: true,
    },
  ],
  papiers: [
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
  ],
  formats_standards: [
    { id: 'A6', largeur_mm: 105, hauteur_mm: 148 },
    { id: 'A5', largeur_mm: 148, hauteur_mm: 210 },
    { id: 'A4', largeur_mm: 210, hauteur_mm: 297 },
    { id: 'A3', largeur_mm: 297, hauteur_mm: 420 },
    { id: 'DL', largeur_mm: 99, hauteur_mm: 210 },
    { id: 'CV', largeur_mm: 85, hauteur_mm: 55 },
  ],
  finitions: [
    { id: 'pelliculage_brillant', nom: 'Pelliculage brillant', type: 'par_face', prix_ht: 5, sous_traite: false },
    { id: 'coins_ronds', nom: 'Coins ronds', type: 'unitaire', prix_ht: 0.05, sous_traite: false },
  ],
  seuil_offset_quantite_min: 500,
  frais_fixes_ht: 25,
  bat_prix_ht: 30,
  marge_pct_offset: 40,
  marge_pct_numerique: 60,
  tva_pct: 20,
  degressif: [
    { seuil: 500, remise_pct: 5 },
    { seuil: 1000, remise_pct: 10 },
    { seuil: 5000, remise_pct: 15 },
  ],
};

// ============================================================
// SCÉNARIOS DE TEST
// ============================================================

function separator(title: string) {
  console.log('\n' + '═'.repeat(60));
  console.log('  ' + title);
  console.log('═'.repeat(60) + '\n');
}

// --- Scénario 1 : Roll-up classique ---
separator('SCÉNARIO 1 : Roll-up 85×200 standard, quantité 1');
const r1 = calcRollup(
  {
    quantite: 1,
    largeur_cm: 85,
    hauteur_cm: 200,
    bache_id: 'pvc_440g',
    structure_id: 'standard',
    bat: false,
  },
  rollupParams
);
console.log(r1.recap);
console.log('\n>>> Prix TTC:', r1.prix_ttc, '€');

// --- Scénario 2 : 5 roll-ups premium + BAT ---
separator('SCÉNARIO 2 : 5 roll-ups premium + BAT');
const r2 = calcRollup(
  {
    quantite: 5,
    largeur_cm: 85,
    hauteur_cm: 200,
    bache_id: 'pvc_440g',
    structure_id: 'premium',
    bat: true,
  },
  rollupParams
);
console.log(r2.recap);
console.log('\n>>> Prix TTC:', r2.prix_ttc, '€ (avec remise', r2.remise_pct + '%)');

// --- Scénario 3 : Plaque A3 en Dibond + vernis ---
separator('SCÉNARIO 3 : 10 plaques A3 Dibond + vernis');
const r3 = calcPlaques(
  {
    quantite: 10,
    dimension_mode: 'standard',
    taille_standard: 'A3',
    materiau_id: 'dibond_3mm',
    decoupe_mode: 'pleine_plaque',
    finitions_ids: ['vernis'],
    bat: true,
  },
  plaquesParams
);
console.log(r3.recap);
console.log('\n>>> Calepinage:', r3.calepinage.nb_poses_par_format, 'poses/format');
console.log('>>> Prix TTC:', r3.prix_ttc, '€');

// --- Scénario 4 : 1000 flyers A5 quadri RV pelliculés ---
separator('SCÉNARIO 4 : 1000 flyers A5 RV pelliculés brillants');
const r4 = calcFlyers(
  {
    quantite: 1000,
    dimension_mode: 'standard',
    taille_standard: 'A5',
    papier_id: 'couche_brillant_135',
    recto_verso: 'rv',
    techno_mode: 'auto',
    finitions_ids: ['pelliculage_brillant'],
    bat: false,
  },
  flyersParams
);
console.log(r4.recap);
console.log('\n>>> Machine choisie:', r4.impression.machine_nom);
console.log('>>> Prix TTC:', r4.prix_ttc, '€');

// --- Scénario 5 : 5000 cartes de visite RV ---
separator('SCÉNARIO 5 : 5000 cartes de visite RV');
const r5 = calcFlyers(
  {
    quantite: 5000,
    dimension_mode: 'standard',
    taille_standard: 'CV',
    papier_id: 'couche_brillant_135',
    recto_verso: 'rv',
    techno_mode: 'auto',
    finitions_ids: [],
    bat: false,
  },
  flyersParams
);
console.log(r5.recap);
console.log('\n>>> Machine choisie:', r5.impression.machine_nom);
console.log('>>> Prix TTC:', r5.prix_ttc, '€');

console.log('\n' + '═'.repeat(60));
console.log('  Tous les scénarios exécutés avec succès');
console.log('═'.repeat(60) + '\n');