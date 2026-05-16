/**
 * Tests unitaires du calculateur Roll-up.
 * Lance avec : pnpm test
 */

import { describe, it, expect } from 'vitest';
import { calcRollup, RollupCalcError } from './rollup';
import type { RollupParams } from '../types/rollup';

// ============================================================
// FIXTURES : paramètres de test réutilisés
// ============================================================

const baseParams: RollupParams = {
  baches: [
    { id: 'pvc_440g', nom: 'Bâche PVC 440g', prix_m2_ht: 8.5 },
  ],
  structures: [
    { id: 'eco', nom: 'Économique', prix_unitaire_ht: 35.0 },
    { id: 'standard', nom: 'Standard', prix_unitaire_ht: 55.0 },
    { id: 'premium', nom: 'Premium', prix_unitaire_ht: 95.0 },
  ],
  machines: [
    {
      id: 'epson',
      nom: 'Epson solvant',
      vitesse_m2_h: 8,
      taux_horaire_ht: 40,
    },
    {
      id: 'mimaki',
      nom: 'Mimaki (plus rapide)',
      vitesse_m2_h: 15,
      taux_horaire_ht: 55,
    },
  ],
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

// ============================================================
// TESTS DE BASE
// ============================================================

describe('calcRollup — cas standard', () => {
  it('calcule correctement 1 roll-up standard 85×200', () => {
    const result = calcRollup(
      {
        quantite: 1,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'epson',
        bat: false,
      },
      baseParams
    );

    // Surface = 85 × 200 / 10000 = 1.7 m²
    expect(result.surface_m2).toBe(1.7);

    // Coût bâche = 1.7 × 8.5 = 14.45 €
    expect(result.cout_bache_unitaire_ht).toBeCloseTo(14.45, 2);

    // Coût machine = (1.7 / 8) × 40 = 8.5 €
    expect(result.cout_machine_unitaire_ht).toBeCloseTo(8.5, 2);

    // Coût structure standard = 55 €
    expect(result.cout_structure_unitaire_ht).toBe(55);

    // Cout unitaire = 14.45 + 8.5 + 55 = 77.95 €
    expect(result.cout_unitaire_ht).toBeCloseTo(77.95, 2);

    // Cout production = 77.95 × 1 = 77.95 €
    expect(result.cout_production_ht).toBeCloseTo(77.95, 2);

    // Revient = 77.95 + 15 + 0 = 92.95 €
    expect(result.cout_revient_ht).toBeCloseTo(92.95, 2);

    // Prix HT brut = 92.95 × 1.5 = 139.425 → arrondi 139.43
    expect(result.prix_ht_brut).toBeCloseTo(139.43, 2);

    // Pas de dégressif (quantité 1 < 3)
    expect(result.remise_pct).toBe(0);
    expect(result.prix_ht).toBeCloseTo(139.43, 2);

    // TTC = 139.425 × 1.20 = 167.31 (arrondi sur la valeur non-arrondie pour préserver la précision)
    expect(result.prix_ttc).toBeCloseTo(167.31, 2);
  });

  it('applique le BAT optionnel quand demandé', () => {
    const result = calcRollup(
      {
        quantite: 1,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'epson',
        bat: true,
      },
      baseParams
    );

    expect(result.cout_bat_ht).toBe(25);
    // Coût revient = 77.95 + 15 + 25 = 117.95 €
    expect(result.cout_revient_ht).toBeCloseTo(117.95, 2);
  });
});

// ============================================================
// TESTS DÉGRESSIF
// ============================================================

describe('calcRollup — dégressif', () => {
  it('applique 10% de remise à partir de 3 pièces', () => {
    const result = calcRollup(
      {
        quantite: 3,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'epson',
        bat: false,
      },
      baseParams
    );

    expect(result.remise_pct).toBe(10);
  });

  it('applique 15% de remise à partir de 5 pièces', () => {
    const result = calcRollup(
      {
        quantite: 5,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'epson',
        bat: false,
      },
      baseParams
    );

    expect(result.remise_pct).toBe(15);
  });

  it('applique 20% de remise à partir de 10 pièces', () => {
    const result = calcRollup(
      {
        quantite: 10,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'epson',
        bat: false,
      },
      baseParams
    );

    expect(result.remise_pct).toBe(20);
  });

  it('pas de dégressif en dessous du premier seuil', () => {
    const result = calcRollup(
      {
        quantite: 2,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'epson',
        bat: false,
      },
      baseParams
    );

    expect(result.remise_pct).toBe(0);
  });
});

// ============================================================
// TESTS STRUCTURES
// ============================================================

describe('calcRollup — niveaux de structure', () => {
  it('eco moins cher que premium', () => {
    const inputBase = {
      quantite: 1,
      largeur_cm: 85,
      hauteur_cm: 200,
      bache_id: 'pvc_440g',
      machine_id: 'epson',
      bat: false,
    } as const;

    const eco = calcRollup({ ...inputBase, structure_id: 'eco' }, baseParams);
    const premium = calcRollup({ ...inputBase, structure_id: 'premium' }, baseParams);

    expect(eco.prix_ht).toBeLessThan(premium.prix_ht);
  });
});

// ============================================================
// TESTS ERREURS / VALIDATION
// ============================================================

describe('calcRollup — validation des entrées', () => {
  it('rejette une quantité < 1', () => {
    expect(() =>
      calcRollup(
        {
          quantite: 0,
          largeur_cm: 85,
          hauteur_cm: 200,
          bache_id: 'pvc_440g',
          structure_id: 'standard',
          machine_id: 'epson',
          bat: false,
        },
        baseParams
      )
    ).toThrow(RollupCalcError);
  });

  it('rejette une dimension négative ou nulle', () => {
    expect(() =>
      calcRollup(
        {
          quantite: 1,
          largeur_cm: 0,
          hauteur_cm: 200,
          bache_id: 'pvc_440g',
          structure_id: 'standard',
          machine_id: 'epson',
          bat: false,
        },
        baseParams
      )
    ).toThrow(RollupCalcError);
  });

  it('rejette une bâche inconnue', () => {
    expect(() =>
      calcRollup(
        {
          quantite: 1,
          largeur_cm: 85,
          hauteur_cm: 200,
          bache_id: 'inconnu',
          structure_id: 'standard',
          machine_id: 'epson',
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Bâche introuvable/);
  });

  it('rejette une structure inconnue', () => {
    expect(() =>
      calcRollup(
        {
          quantite: 1,
          largeur_cm: 85,
          hauteur_cm: 200,
          bache_id: 'pvc_440g',
          structure_id: 'inconnu',
          machine_id: 'epson',
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Structure introuvable/);
  });

  it('rejette une machine inconnue', () => {
    expect(() =>
      calcRollup(
        {
          quantite: 1,
          largeur_cm: 85,
          hauteur_cm: 200,
          bache_id: 'pvc_440g',
          structure_id: 'standard',
          machine_id: 'inconnu',
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Machine introuvable/);
  });
});

// ============================================================
// TESTS MULTI-MACHINES
// ============================================================

describe('calcRollup — sélection de machine', () => {
  it('utilise la machine spécifiée et la mentionne dans le résultat', () => {
    const epson = calcRollup(
      {
        quantite: 1,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'epson',
        bat: false,
      },
      baseParams
    );
    expect(epson.machine_id).toBe('epson');
    expect(epson.machine_nom).toBe('Epson solvant');

    const mimaki = calcRollup(
      {
        quantite: 1,
        largeur_cm: 85,
        hauteur_cm: 200,
        bache_id: 'pvc_440g',
        structure_id: 'standard',
        machine_id: 'mimaki',
        bat: false,
      },
      baseParams
    );
    expect(mimaki.machine_id).toBe('mimaki');
    // Mimaki est plus rapide (15 m²/h) mais taux 55 €/h vs Epson 8 m²/h × 40 €/h
    // → temps Mimaki = 1.7/15 × 55 = 6.23 € < Epson = 1.7/8 × 40 = 8.5 €
    expect(mimaki.cout_machine_unitaire_ht).toBeLessThan(epson.cout_machine_unitaire_ht);
  });
});

// ============================================================
// TEST PLANCHER DE SÉCURITÉ
// ============================================================

describe('calcRollup — plancher de sécurité', () => {
  it('relève le prix si en dessous du plancher', () => {
    const result = calcRollup(
      {
        quantite: 1,
        largeur_cm: 10,
        hauteur_cm: 10, // petit format → prix faible
        bache_id: 'pvc_440g',
        structure_id: 'eco',
        machine_id: 'epson',
        bat: false,
      },
      { ...baseParams, prix_plancher_ht: 100 }
    );

    expect(result.prix_ht).toBe(100);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Plancher');
  });
});