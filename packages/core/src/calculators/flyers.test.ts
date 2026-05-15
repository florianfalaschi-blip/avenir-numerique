import { describe, it, expect } from 'vitest';
import { calcFlyers, FlyersCalcError } from './flyers';
import type { FlyersParams } from '../types/flyers';

const baseParams: FlyersParams = {
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
        {
          largeur_mm: 320,
          hauteur_mm: 464,
          prix_paquet_ht: 21,
          feuilles_par_paquet: 500,
        },
        {
          largeur_mm: 720,
          hauteur_mm: 1020,
          prix_paquet_ht: 90,
          feuilles_par_paquet: 250,
        },
      ],
      compatible_techno: ['numerique', 'offset'],
    },
    {
      id: 'recycle_350',
      nom: 'Recyclé 350g',
      grammage: 350,
      formats_achat: [
        {
          largeur_mm: 320,
          hauteur_mm: 464,
          prix_paquet_ht: 60,
          feuilles_par_paquet: 250,
        },
      ],
      compatible_techno: ['numerique'], // pas offset (trop épais)
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
    {
      id: 'pelliculage_brillant',
      nom: 'Pelliculage brillant',
      type: 'par_face',
      prix_ht: 5, // €/m²/face
      sous_traite: false,
    },
    {
      id: 'vernis_uv',
      nom: 'Vernis UV sélectif',
      type: 'm2',
      prix_ht: 12,
      sous_traite: false,
    },
    {
      id: 'coins_ronds',
      nom: 'Coins ronds',
      type: 'unitaire',
      prix_ht: 0.05,
      sous_traite: false,
    },
    {
      id: 'soft_touch',
      nom: 'Soft-touch (sous-traité)',
      type: 'forfait',
      prix_ht: 0,
      sous_traite: true,
      cout_fournisseur_ht: 80,
      marge_sous_traitance_pct: 30,
    },
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
// CHOIX TECHNO
// ============================================================

describe('calcFlyers — choix techno', () => {
  it('petite quantité = numérique en mode auto', () => {
    const r = calcFlyers(
      {
        quantite: 100,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.techno_choisie).toBe('numerique');
    expect(r.techno_switch_auto).toBe(false);
  });

  it('grande quantité = offset en mode auto', () => {
    const r = calcFlyers(
      {
        quantite: 2000,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.techno_choisie).toBe('offset');
  });

  it('override manuel offset respecté', () => {
    const r = calcFlyers(
      {
        quantite: 100,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'offset',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.techno_choisie).toBe('offset');
  });

  it('switch auto si techno demandée incompatible avec papier', () => {
    // Recyclé 350g compatible numérique seulement
    const r = calcFlyers(
      {
        quantite: 5000, // grande quantité → auto = offset
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'recycle_350',
        recto_verso: 'recto',
        techno_mode: 'offset',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.techno_choisie).toBe('numerique');
    expect(r.techno_switch_auto).toBe(true);
    expect(r.warnings.some((w) => w.includes('changée automatiquement'))).toBe(true);
  });
});

// ============================================================
// FORMATS & DIMENSIONS
// ============================================================

describe('calcFlyers — dimensions', () => {
  it('A5 standard fonctionne', () => {
    const r = calcFlyers(
      {
        quantite: 500,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.largeur_finale_mm).toBe(148);
    expect(r.hauteur_finale_mm).toBe(210);
  });

  it('custom valide passe', () => {
    const r = calcFlyers(
      {
        quantite: 100,
        dimension_mode: 'custom',
        largeur_mm: 100,
        hauteur_mm: 150,
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.largeur_finale_mm).toBe(100);
    expect(r.hauteur_finale_mm).toBe(150);
  });

  it('bridage si dépasse format machine max', () => {
    // Force numérique avec une dimension > 330 (max HP Indigo)
    const r = calcFlyers(
      {
        quantite: 100,
        dimension_mode: 'custom',
        largeur_mm: 500,
        hauteur_mm: 600,
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'offset', // l'offset peut tenir 720×1020
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.largeur_finale_mm).toBe(500);
    expect(r.hauteur_finale_mm).toBe(600);
  });
});

// ============================================================
// RECTO / VERSO
// ============================================================

describe('calcFlyers — recto-verso', () => {
  it('RV plus cher que recto', () => {
    const base = {
      quantite: 500,
      dimension_mode: 'standard' as const,
      taille_standard: 'A5' as const,
      papier_id: 'couche_brillant_135',
      techno_mode: 'auto' as const,
      finitions_ids: [],
      bat: false,
    };

    const recto = calcFlyers({ ...base, recto_verso: 'recto' }, baseParams);
    const rv = calcFlyers({ ...base, recto_verso: 'rv' }, baseParams);

    expect(rv.prix_ht).toBeGreaterThan(recto.prix_ht);
  });

  it('pelliculage RV : prix × 2', () => {
    const base = {
      quantite: 100,
      dimension_mode: 'standard' as const,
      taille_standard: 'A5' as const,
      papier_id: 'couche_brillant_135',
      techno_mode: 'auto' as const,
      finitions_ids: ['pelliculage_brillant'],
      bat: false,
    };

    const recto = calcFlyers({ ...base, recto_verso: 'recto' }, baseParams);
    const rv = calcFlyers({ ...base, recto_verso: 'rv' }, baseParams);

    expect(rv.cout_finitions_ht).toBeCloseTo(recto.cout_finitions_ht * 2, 1);
  });
});

// ============================================================
// FINITIONS
// ============================================================

describe('calcFlyers — finitions', () => {
  it('coins ronds = unitaire × quantité', () => {
    const r = calcFlyers(
      {
        quantite: 1000,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: ['coins_ronds'],
        bat: false,
      },
      baseParams
    );
    expect(r.cout_finitions_ht).toBeCloseTo(50, 1); // 0.05 × 1000
  });

  it('sous-traitance : coût fournisseur + marge', () => {
    const r = calcFlyers(
      {
        quantite: 100,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: ['soft_touch'],
        bat: false,
      },
      baseParams
    );
    // 80 × 1.30 = 104
    expect(r.cout_finitions_ht).toBeCloseTo(104, 1);
  });

  it('finition inconnue : erreur', () => {
    expect(() =>
      calcFlyers(
        {
          quantite: 100,
          dimension_mode: 'standard',
          taille_standard: 'A5',
          papier_id: 'couche_brillant_135',
          recto_verso: 'recto',
          techno_mode: 'auto',
          finitions_ids: ['inconnu'],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Finition introuvable/);
  });
});

// ============================================================
// MARGES OFFSET vs NUMÉRIQUE
// ============================================================

describe('calcFlyers — marges distinctes', () => {
  it('marge offset différente de numérique', () => {
    const base = {
      quantite: 2000,
      dimension_mode: 'standard' as const,
      taille_standard: 'A5' as const,
      papier_id: 'couche_brillant_135',
      recto_verso: 'recto' as const,
      finitions_ids: [],
      bat: false,
    };

    const num = calcFlyers({ ...base, techno_mode: 'numerique' }, baseParams);
    const off = calcFlyers({ ...base, techno_mode: 'offset' }, baseParams);

    expect(num.marge_pct).toBe(60); // marge_pct_numerique
    expect(off.marge_pct).toBe(40); // marge_pct_offset
  });
});

// ============================================================
// DÉGRESSIF
// ============================================================

describe('calcFlyers — dégressif', () => {
  it('500 ex : remise 5%', () => {
    const r = calcFlyers(
      {
        quantite: 500,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.remise_pct).toBe(5);
  });

  it('5000 ex : remise 15%', () => {
    const r = calcFlyers(
      {
        quantite: 5000,
        dimension_mode: 'standard',
        taille_standard: 'A5',
        papier_id: 'couche_brillant_135',
        recto_verso: 'recto',
        techno_mode: 'auto',
        finitions_ids: [],
        bat: false,
      },
      baseParams
    );
    expect(r.remise_pct).toBe(15);
  });
});

// ============================================================
// ERREURS
// ============================================================

describe('calcFlyers — erreurs', () => {
  it('rejette quantité < 1', () => {
    expect(() =>
      calcFlyers(
        {
          quantite: 0,
          dimension_mode: 'standard',
          taille_standard: 'A5',
          papier_id: 'couche_brillant_135',
          recto_verso: 'recto',
          techno_mode: 'auto',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(FlyersCalcError);
  });

  it('rejette papier inconnu', () => {
    expect(() =>
      calcFlyers(
        {
          quantite: 100,
          dimension_mode: 'standard',
          taille_standard: 'A5',
          papier_id: 'inconnu',
          recto_verso: 'recto',
          techno_mode: 'auto',
          finitions_ids: [],
          bat: false,
        },
        baseParams
      )
    ).toThrow(/Papier introuvable/);
  });
});