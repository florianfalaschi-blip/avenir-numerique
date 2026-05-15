import { describe, it, expect } from 'vitest';
import { calcPlaques, PlaquesCalcError } from './plaques';
import type { PlaquesParams } from '../types/plaques';

const baseParams: PlaquesParams = {
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
    id: 'mutoh',
    nom: 'Mutoh UV LED',
    vitesse_m2_h: 5,
    taux_horaire_ht: 60,
  },
  machine_decoupe: {
    id: 'zund',
    nom: 'Zund',
    prix_metre_lineaire_ht: 1.5,
    forfait_minimum_ht: 15,
  },
  finitions: [
    { id: 'oeillets', nom: 'Œillets 4 coins', type: 'forfait', prix_ht: 8 },
    { id: 'oeillet_unit', nom: 'Œillet à l\'unité', type: 'par_oeillet', prix_ht: 2 },
    { id: 'support', nom: 'Support pose murale', type: 'unitaire', prix_ht: 6 },
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

// ============================================================
// CAS STANDARDS
// ============================================================

describe('calcPlaques — taille standard', () => {
  it('1 plaque A4 en Forex pleine plaque', () => {
    const r = calcPlaques(
      {
        quantite: 1,
        dimension_mode: 'standard',
        taille_standard: 'A4',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );

    expect(r.largeur_finale_cm).toBe(21);
    expect(r.hauteur_finale_cm).toBe(29.7);
    expect(r.surface_unitaire_m2).toBeCloseTo(0.0624, 3);
    expect(r.calepinage.nb_poses_par_format).toBeGreaterThan(0);
    expect(r.calepinage.nb_formats_brut).toBe(1);
    expect(r.prix_ht).toBeGreaterThan(0);
  });

  it('A0 grand format', () => {
    const r = calcPlaques(
      {
        quantite: 1,
        dimension_mode: 'standard',
        taille_standard: 'A0',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.calepinage.nb_poses_par_format).toBeGreaterThan(0);
  });
});

// ============================================================
// CALEPINAGE
// ============================================================

describe('calcPlaques — calepinage', () => {
  it('choisit le format le moins cher quand 2 sont possibles', () => {
    // A4 (21×29.7) sur Forex : 305×200 (60€) et 244×122 (30€)
    // 244×122 sera meilleur prix/pose vu son faible coût
    const r = calcPlaques(
      {
        quantite: 1,
        dimension_mode: 'standard',
        taille_standard: 'A4',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.calepinage.format_brut_prix_ht).toBe(30);
  });

  it('augmente le nb de formats brut si quantité grande', () => {
    const r = calcPlaques(
      {
        quantite: 100,
        dimension_mode: 'standard',
        taille_standard: 'A4',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.calepinage.nb_formats_brut).toBeGreaterThan(0);
    expect(r.calepinage.cout_matiere_ht).toBeGreaterThan(0);
  });

  it('refuse une pièce trop grande pour tous les formats', () => {
    expect(() =>
      calcPlaques(
        {
          quantite: 1,
          dimension_mode: 'custom',
          largeur_cm: 400, // > tous les formats
          hauteur_cm: 250,
          materiau_id: 'forex_5mm',
          decoupe_mode: 'pleine_plaque',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Aucun format/);
  });
});

// ============================================================
// FINITIONS
// ============================================================

describe('calcPlaques — finitions', () => {
  it('œillets forfait + support unitaire', () => {
    const sans = calcPlaques(
      {
        quantite: 2,
        dimension_mode: 'standard',
        taille_standard: 'A3',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    const avec = calcPlaques(
      {
        quantite: 2,
        dimension_mode: 'standard',
        taille_standard: 'A3',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: ['oeillets', 'support'],
        bat: false,
      },
      baseParams
    );

    // Œillets = 8 forfait, support = 6 × 2 = 12 → +20 € HT
    expect(avec.cout_finitions_ht).toBe(20);
    expect(avec.prix_ht).toBeGreaterThan(sans.prix_ht);
  });

  it('œillets unitaires requièrent nb_oeillets', () => {
    expect(() =>
      calcPlaques(
        {
          quantite: 1,
          dimension_mode: 'standard',
          taille_standard: 'A3',
          materiau_id: 'forex_5mm',
          decoupe_mode: 'pleine_plaque',
          finitions_ids: ['oeillet_unit'],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/nb_oeillets requis/);
  });

  it('finition au m² appliquée correctement', () => {
    const r = calcPlaques(
      {
        quantite: 1,
        dimension_mode: 'standard',
        taille_standard: 'A2',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: ['vernis'],
        bat: false,
      },
      baseParams
    );
    // A2 = 0.42 × 0.594 = 0.24948 m² × 10€ = ~2.49€
    expect(r.cout_finitions_ht).toBeCloseTo(2.49, 1);
  });
});

// ============================================================
// DÉCOUPE
// ============================================================

describe('calcPlaques — découpe', () => {
  it('pleine plaque : périmètre calculé auto', () => {
    const r = calcPlaques(
      {
        quantite: 1,
        dimension_mode: 'custom',
        largeur_cm: 100,
        hauteur_cm: 50,
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    // Périmètre = 2×(100+50) = 300cm = 3m
    // Coût = 3 × 1.5 = 4.5€ < forfait minimum 15€ → 15€
    expect(r.cout_decoupe_ht).toBe(15);
  });

  it('forme : utilise longueur_decoupe_forme_m', () => {
    const r = calcPlaques(
      {
        quantite: 10,
        dimension_mode: 'standard',
        taille_standard: 'A4',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'forme',
        longueur_decoupe_forme_m: 2,
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    // 2m × 10 plaques = 20m × 1.5€/m = 30€
    expect(r.cout_decoupe_ht).toBe(30);
  });

  it('forme : refuse si longueur manquante', () => {
    expect(() =>
      calcPlaques(
        {
          quantite: 1,
          dimension_mode: 'standard',
          taille_standard: 'A4',
          materiau_id: 'forex_5mm',
          decoupe_mode: 'forme',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/longueur en mètres/);
  });
});

// ============================================================
// DÉGRESSIF
// ============================================================

describe('calcPlaques — dégressif', () => {
  it('applique remise dès 5 plaques', () => {
    const r = calcPlaques(
      {
        quantite: 5,
        dimension_mode: 'standard',
        taille_standard: 'A4',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.remise_pct).toBe(5);
  });

  it('applique remise plus forte dès 10 plaques', () => {
    const r = calcPlaques(
      {
        quantite: 10,
        dimension_mode: 'standard',
        taille_standard: 'A4',
        materiau_id: 'forex_5mm',
        decoupe_mode: 'pleine_plaque',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.remise_pct).toBe(10);
  });
});

// ============================================================
// ERREURS
// ============================================================

describe('calcPlaques — erreurs', () => {
  it('rejette quantité < 1', () => {
    expect(() =>
      calcPlaques(
        {
          quantite: 0,
          dimension_mode: 'standard',
          taille_standard: 'A4',
          materiau_id: 'forex_5mm',
          decoupe_mode: 'pleine_plaque',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(PlaquesCalcError);
  });

  it('rejette matériau inconnu', () => {
    expect(() =>
      calcPlaques(
        {
          quantite: 1,
          dimension_mode: 'standard',
          taille_standard: 'A4',
          materiau_id: 'inconnu',
          decoupe_mode: 'pleine_plaque',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Matériau introuvable/);
  });

  it('rejette dimensions custom manquantes', () => {
    expect(() =>
      calcPlaques(
        {
          quantite: 1,
          dimension_mode: 'custom',
          materiau_id: 'forex_5mm',
          decoupe_mode: 'pleine_plaque',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Dimensions custom invalides/);
  });
});