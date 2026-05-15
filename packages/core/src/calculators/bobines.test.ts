import { describe, it, expect } from 'vitest';
import { calcBobines, BobinesCalcError } from './bobines';
import type { BobinesParams } from '../types/bobines';

const baseParams: BobinesParams = {
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
      id: 'papier_simple',
      nom: 'Papier adhésif simple',
      type: 'papier',
      methode_calcul: 'm2',
      rouleaux: [],
      prix_m2_ht: 4,
    },
    {
      id: 'polyester_auto',
      nom: 'Polyester (auto)',
      type: 'film',
      methode_calcul: 'auto',
      rouleaux: [{ largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 120 }],
    },
  ],
  machine_impression: {
    id: 'solvant',
    nom: 'Solvant',
    vitesse_m2_h: 10,
    taux_horaire_ht: 50,
    operateur_taux_horaire_ht: 25,
    gaches_pct: 5,
  },
  machine_decoupe: {
    id: 'summa',
    nom: 'Summa',
    vitesse_m_min: 30,
    taux_horaire_ht: 40,
    operateur_taux_horaire_ht: 25,
    forfait_cliquage_ht: 25,
  },
  finitions: [
    { id: 'vernis_brillant', nom: 'Vernis brillant', type: 'm2', prix_ht: 8, sous_traite: false },
    { id: 'dorure', nom: 'Dorure', type: 'unitaire', prix_ht: 0.10, sous_traite: false },
    {
      id: 'effet_3d',
      nom: 'Effet 3D',
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

// ============================================================
// FORMES
// ============================================================

describe('calcBobines — forme rectangle', () => {
  it('rectangle 80×40mm × 500 étiquettes', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 500,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    // Surface = 80 × 40 = 3200 mm²
    expect(r.surface_unitaire_mm2).toBe(3200);
    // Périmètre = 2 × (80 + 40) = 240 mm
    expect(r.perimetre_unitaire_mm).toBe(240);
    expect(r.prix_ht).toBeGreaterThan(0);
    expect(r.matiere.methode).toBe('calepinage');
  });
});

describe('calcBobines — forme rond', () => {
  it('étiquette ronde 30mm × 1000', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 1000,
        forme: 'rond',
        diametre_mm: 30,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    // Surface = π × 15² = 706.86 mm²
    expect(r.surface_unitaire_mm2).toBeCloseTo(706.86, 1);
    // Périmètre = 2 × π × 15 = 94.25 mm
    expect(r.perimetre_unitaire_mm).toBeCloseTo(94.25, 1);
  });

  it('rond : refuse diamètre manquant', () => {
    expect(() =>
      calcBobines(
        {
          quantite_etiquettes: 100,
          forme: 'rond',
          materiau_id: 'vinyle_blanc',
          decoupe_mode: 'forme_simple',
          conditionnement: 'planches_plat',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/diamètre/);
  });
});

describe('calcBobines — forme ovale', () => {
  it('ovale 60×40mm', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 100,
        forme: 'ovale',
        largeur_mm: 60,
        hauteur_mm: 40,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    // Surface = π × 30 × 20 = 1884.96 mm²
    expect(r.surface_unitaire_mm2).toBeCloseTo(1884.96, 1);
    // Périmètre Ramanujan ≈ 158.65 mm
    expect(r.perimetre_unitaire_mm).toBeGreaterThan(150);
    expect(r.perimetre_unitaire_mm).toBeLessThan(170);
  });
});

describe('calcBobines — forme libre', () => {
  it('forme libre avec saisie manuelle surface + périmètre', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 200,
        forme: 'forme_libre',
        largeur_mm: 50,
        hauteur_mm: 50,
        surface_libre_mm2: 1500,
        perimetre_libre_mm: 180,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_libre',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.surface_unitaire_mm2).toBe(1500);
    expect(r.perimetre_unitaire_mm).toBe(180);
  });

  it('forme libre : refuse si surface/périmètre manquants', () => {
    expect(() =>
      calcBobines(
        {
          quantite_etiquettes: 100,
          forme: 'forme_libre',
          largeur_mm: 50,
          hauteur_mm: 50,
          materiau_id: 'vinyle_blanc',
          decoupe_mode: 'forme_libre',
          conditionnement: 'planches_plat',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/surface_libre_mm2/);
  });
});

// ============================================================
// MÉTHODE DE CALCUL MATIÈRE
// ============================================================

describe('calcBobines — méthode matière', () => {
  it('calepinage : choisit le rouleau le moins cher', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 500,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.matiere.methode).toBe('calepinage');
    expect(r.matiere.rouleau).toBeDefined();
    expect(r.matiere.rouleau!.nb_etiquettes_par_largeur).toBeGreaterThan(0);
  });

  it('m² : calcul direct si méthode m²', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 500,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'papier_simple',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.matiere.methode).toBe('m2');
    expect(r.matiere.surface_totale_m2).toBeDefined();
  });

  it('auto : utilise calepinage si rouleaux dispo', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 500,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'polyester_auto',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.matiere.methode).toBe('calepinage');
  });
});

// ============================================================
// CONDITIONNEMENT
// ============================================================

describe('calcBobines — conditionnement', () => {
  it('rouleau applicateur : ajoute forfait rembobinage', () => {
    const base = {
      quantite_etiquettes: 500,
      forme: 'rectangle' as const,
      largeur_mm: 80,
      hauteur_mm: 40,
      materiau_id: 'vinyle_blanc',
      decoupe_mode: 'forme_simple' as const,
      finitions_ids: [],
      bat: false,
    };

    const plat = calcBobines({ ...base, conditionnement: 'planches_plat' }, baseParams);
    const rouleau = calcBobines({ ...base, conditionnement: 'rouleau_applicateur' }, baseParams);

    expect(plat.cout_conditionnement_ht).toBe(0);
    expect(rouleau.cout_conditionnement_ht).toBe(15);
    expect(rouleau.prix_ht).toBeGreaterThan(plat.prix_ht);
  });
});

// ============================================================
// FINITIONS
// ============================================================

describe('calcBobines — finitions', () => {
  it('vernis m² appliqué sur surface totale', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 1000,
        forme: 'rectangle',
        largeur_mm: 100,
        hauteur_mm: 50,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: ['vernis_brillant'],
        bat: false,
      },
      baseParams
    );
    // Surface unit = 100 × 50 / 1e6 = 0.005 m²
    // Surface totale brute = 0.005 × 1000 = 5 m²
    // Vernis = 5 × 8 = 40 €
    expect(r.cout_finitions_ht).toBeCloseTo(40, 1);
  });

  it('dorure unitaire', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 500,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: ['dorure'],
        bat: false,
      },
      baseParams
    );
    // 0.10 × 500 = 50 €
    expect(r.cout_finitions_ht).toBe(50);
  });

  it('effet 3D sous-traité : coût fournisseur + marge', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 100,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: ['effet_3d'],
        bat: false,
      },
      baseParams
    );
    // 150 × 1.40 = 210 €
    expect(r.cout_finitions_ht).toBeCloseTo(210, 1);
  });
});

// ============================================================
// DÉGRESSIF
// ============================================================

describe('calcBobines — dégressif', () => {
  it('500 étiquettes : remise 5%', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 500,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.remise_pct).toBe(5);
  });

  it('10000 étiquettes : remise 20%', () => {
    const r = calcBobines(
      {
        quantite_etiquettes: 10000,
        forme: 'rectangle',
        largeur_mm: 80,
        hauteur_mm: 40,
        materiau_id: 'vinyle_blanc',
        decoupe_mode: 'forme_simple',
        conditionnement: 'planches_plat',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.remise_pct).toBe(20);
  });
});

// ============================================================
// ERREURS
// ============================================================

describe('calcBobines — erreurs', () => {
  it('rejette quantité < 1', () => {
    expect(() =>
      calcBobines(
        {
          quantite_etiquettes: 0,
          forme: 'rectangle',
          largeur_mm: 80,
          hauteur_mm: 40,
          materiau_id: 'vinyle_blanc',
          decoupe_mode: 'forme_simple',
          conditionnement: 'planches_plat',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(BobinesCalcError);
  });

  it('rejette matériau inconnu', () => {
    expect(() =>
      calcBobines(
        {
          quantite_etiquettes: 100,
          forme: 'rectangle',
          largeur_mm: 80,
          hauteur_mm: 40,
          materiau_id: 'inconnu',
          decoupe_mode: 'forme_simple',
          conditionnement: 'planches_plat',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Matériau introuvable/);
  });

  it('rejette rectangle sans dimensions', () => {
    expect(() =>
      calcBobines(
        {
          quantite_etiquettes: 100,
          forme: 'rectangle',
          materiau_id: 'vinyle_blanc',
          decoupe_mode: 'forme_simple',
          conditionnement: 'planches_plat',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/largeur et hauteur/);
  });
});