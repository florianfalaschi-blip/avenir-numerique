import { describe, it, expect } from 'vitest';
import { calcBrochures, BrochuresCalcError } from './brochures';
import type { BrochuresParams, BrochuresInput } from '../types/brochures';

const baseParams: BrochuresParams = {
  machines_impression: [
    {
      id: 'hp_indigo',
      nom: 'HP Indigo',
      techno: 'numerique',
      format_max_mm: { largeur: 330, hauteur: 488 },
      vitesse_feuilles_h: 4000,
      taux_horaire_ht: 60,
      cout_calage_ht: 0,
      recto_verso_calage_unique: true,
      gaches_pct: 3,
      operateur_taux_horaire_ht: 30,
      actif: true,
    },
    {
      id: 'speedmaster',
      nom: 'Speedmaster',
      techno: 'offset',
      format_max_mm: { largeur: 520, hauteur: 740 },
      vitesse_feuilles_h: 12000,
      taux_horaire_ht: 120,
      cout_calage_ht: 50, // par couleur
      recto_verso_calage_unique: true,
      gaches_pct: 8,
      operateur_taux_horaire_ht: 35,
      actif: true,
    },
  ],
  machines_faconnage: [
    {
      id: 'agrafeuse',
      nom: 'Agrafeuse',
      type: 'agrafe',
      vitesse_h: 1500,
      taux_horaire_ht: 40,
      operateur_taux_horaire_ht: 30,
      cout_consommables_unitaire_ht: 0.01,
    },
    {
      id: 'dos_carre_machine',
      nom: 'Machine dos carré collé',
      type: 'dos_carre_colle',
      vitesse_h: 800,
      taux_horaire_ht: 60,
      operateur_taux_horaire_ht: 30,
      cout_consommables_unitaire_ht: 0.05,
    },
    {
      id: 'spirale_machine',
      nom: 'Spiraleuse',
      type: 'spirale',
      vitesse_h: 600,
      taux_horaire_ht: 50,
      operateur_taux_horaire_ht: 30,
      cout_consommables_unitaire_ht: 0.20,
    },
    {
      id: 'plieuse',
      nom: 'Plieuse',
      type: 'plieuse',
      vitesse_h: 5000,
      taux_horaire_ht: 30,
      operateur_taux_horaire_ht: 25,
      cout_consommables_unitaire_ht: 0,
    },
  ],
  reliures: [
    {
      id: 'agrafe_std',
      nom: 'Agrafé piqûre cheval',
      type: 'agrafe',
      pages_multiple: 4,
      pages_min: 8,
      pages_max: 64,
      machine_faconnage_id: 'agrafeuse',
      sous_traite: false,
    },
    {
      id: 'dos_colle_std',
      nom: 'Dos carré collé',
      type: 'dos_carre_colle',
      pages_multiple: 2,
      pages_min: 32,
      pages_max: 300,
      machine_faconnage_id: 'dos_carre_machine',
      sous_traite: false,
    },
    {
      id: 'dos_cousu_st',
      nom: 'Dos carré cousu (sous-traitance)',
      type: 'dos_carre_cousu',
      pages_multiple: 4,
      pages_min: 80,
      pages_max: 500,
      machine_faconnage_id: 'dos_carre_machine',
      sous_traite: true,
      cout_fournisseur_brochure_ht: 1.5,
      marge_sous_traitance_pct: 30,
    },
    {
      id: 'spirale_std',
      nom: 'Spirale',
      type: 'spirale',
      pages_multiple: 1,
      pages_min: 8,
      pages_max: 300,
      machine_faconnage_id: 'spirale_machine',
      sous_traite: false,
    },
  ],
  papiers: [
    {
      id: 'offset_couche_135',
      nom: 'Couché 135g',
      grammage: 135,
      formats_achat: [
        { largeur_mm: 320, hauteur_mm: 450, prix_paquet_ht: 60, feuilles_par_paquet: 500 },
        { largeur_mm: 520, hauteur_mm: 720, prix_paquet_ht: 140, feuilles_par_paquet: 500 },
      ],
      compatible_techno: ['offset', 'numerique'],
    },
    {
      id: 'offset_seul',
      nom: 'Papier offset uniquement',
      grammage: 90,
      formats_achat: [
        { largeur_mm: 520, hauteur_mm: 720, prix_paquet_ht: 100, feuilles_par_paquet: 500 },
      ],
      compatible_techno: ['offset'],
    },
    {
      id: 'num_seul',
      nom: 'Papier numérique uniquement',
      grammage: 100,
      formats_achat: [
        { largeur_mm: 320, hauteur_mm: 450, prix_paquet_ht: 50, feuilles_par_paquet: 500 },
      ],
      compatible_techno: ['numerique'],
    },
    {
      id: 'couverture_300g',
      nom: 'Couverture 300g',
      grammage: 300,
      formats_achat: [
        { largeur_mm: 320, hauteur_mm: 450, prix_paquet_ht: 90, feuilles_par_paquet: 250 },
      ],
      compatible_techno: ['offset', 'numerique'],
    },
  ],
  formats_standards: [
    { id: 'A5', largeur_mm: 148, hauteur_mm: 210 },
    { id: 'A4', largeur_mm: 210, hauteur_mm: 297 },
    { id: 'A6', largeur_mm: 105, hauteur_mm: 148 },
    { id: 'A5_paysage', largeur_mm: 210, hauteur_mm: 148 },
    { id: 'A4_paysage', largeur_mm: 297, hauteur_mm: 210 },
    { id: 'A6_paysage', largeur_mm: 148, hauteur_mm: 105 },
    { id: 'A5_carre', largeur_mm: 210, hauteur_mm: 210 },
    { id: 'A4_carre', largeur_mm: 297, hauteur_mm: 297 },
    { id: 'A6_carre', largeur_mm: 148, hauteur_mm: 148 },
  ],
  finitions: [
    {
      id: 'pelliculage_brillant',
      nom: 'Pelliculage brillant',
      type: 'par_face',
      prix_ht: 5,
      sous_traite: false,
    },
    {
      id: 'gaufrage',
      nom: 'Gaufrage',
      type: 'unitaire',
      prix_ht: 0.5,
      sous_traite: false,
    },
    {
      id: 'dorure_st',
      nom: 'Dorure à chaud (sous-traitance)',
      type: 'forfait',
      prix_ht: 0,
      sous_traite: true,
      cout_fournisseur_ht: 200,
      marge_sous_traitance_pct: 40,
    },
  ],
  seuil_offset_quantite_min: 500,
  seuil_pages_pliage: 8,
  machine_pliage_id: 'plieuse',
  frais_fixes_ht: 50,
  bat_prix_ht: 30,
  marge_pct_offset: 60,
  marge_pct_numerique: 50,
  tva_pct: 20,
  degressif: [
    { seuil: 500, remise_pct: 5 },
    { seuil: 2000, remise_pct: 10 },
    { seuil: 10000, remise_pct: 20 },
  ],
};

const baseInput: BrochuresInput = {
  quantite: 100,
  nb_pages: 16,
  dimension_mode: 'standard',
  taille_standard: 'A5',
  reliure_id: 'agrafe_std',
  papier_interieur_id: 'offset_couche_135',
  papier_couverture_id: 'couverture_300g',
  couleur_interieur: 'quadri',
  couleur_couverture: 'quadri',
  techno_mode_interieur: 'auto',
  techno_mode_couverture: 'auto',
  finitions_ids: [],
  bat: false,
};

// ============================================================
// CAS NOMINAL
// ============================================================

describe('calcBrochures — cas nominal', () => {
  it('A5 agrafée 16 pages quadri × 100 ex', () => {
    const r = calcBrochures(baseInput, baseParams);
    expect(r.largeur_finale_mm).toBe(148);
    expect(r.hauteur_finale_mm).toBe(210);
    expect(r.nb_feuilles_interieur_par_brochure).toBe(6); // (16-4)/2
    expect(r.impression_interieur).not.toBeNull();
    expect(r.impression_couverture).toBeDefined();
    expect(r.prix_ht).toBeGreaterThan(0);
    expect(r.prix_ttc).toBeCloseTo(r.prix_ht * 1.2, 2);
    expect(r.warnings).toEqual([]);
  });

  it('Récap contient les lignes attendues', () => {
    const r = calcBrochures(baseInput, baseParams);
    expect(r.recap).toContain('148×210');
    expect(r.recap).toContain('16 pages');
    expect(r.recap).toContain('Intérieur');
    expect(r.recap).toContain('Couverture');
    expect(r.recap).toContain('Façonnage');
    expect(r.recap).toContain('Prix HT');
  });
});

// ============================================================
// NB_PAGES → NB_FEUILLES INTÉRIEUR
// ============================================================

describe('calcBrochures — calcul nb_feuilles_interieur', () => {
  it('8 pages → 2 feuilles intérieur', () => {
    const r = calcBrochures({ ...baseInput, nb_pages: 8 }, baseParams);
    expect(r.nb_feuilles_interieur_par_brochure).toBe(2);
  });

  it('64 pages → 30 feuilles intérieur', () => {
    const r = calcBrochures({ ...baseInput, nb_pages: 64 }, baseParams);
    expect(r.nb_feuilles_interieur_par_brochure).toBe(30);
  });

  it('40 pages dos collé → 18 feuilles intérieur', () => {
    const r = calcBrochures(
      { ...baseInput, nb_pages: 40, reliure_id: 'dos_colle_std' },
      baseParams
    );
    expect(r.nb_feuilles_interieur_par_brochure).toBe(18);
  });
});

// ============================================================
// RELIURES
// ============================================================

describe('calcBrochures — reliures', () => {
  it('agrafé : machine agrafeuse appliquée', () => {
    const r = calcBrochures(baseInput, baseParams);
    expect(r.cout_faconnage_ht).toBeGreaterThan(0);
    expect(r.faconnage_sous_traite).toBe(false);
  });

  it('dos carré collé : machine dos carré appliquée', () => {
    const r = calcBrochures(
      { ...baseInput, nb_pages: 64, reliure_id: 'dos_colle_std' },
      baseParams
    );
    expect(r.cout_faconnage_ht).toBeGreaterThan(0);
    expect(r.faconnage_sous_traite).toBe(false);
  });

  it('dos carré cousu : sous-traitance avec marge spé', () => {
    const r = calcBrochures(
      { ...baseInput, nb_pages: 80, reliure_id: 'dos_cousu_st' },
      baseParams
    );
    // 1.5 × 100 × 1.30 = 195 €
    expect(r.cout_faconnage_ht).toBeCloseTo(195, 1);
    expect(r.faconnage_sous_traite).toBe(true);
  });

  it('spirale : multiple de pages = 1', () => {
    const r = calcBrochures(
      { ...baseInput, nb_pages: 15, reliure_id: 'spirale_std' },
      baseParams
    );
    expect(r.prix_ht).toBeGreaterThan(0);
  });
});

// ============================================================
// VALIDATIONS NB_PAGES
// ============================================================

describe('calcBrochures — validations nb_pages', () => {
  it('rejette nb_pages non multiple de 4 pour agrafé', () => {
    expect(() => calcBrochures({ ...baseInput, nb_pages: 10 }, baseParams)).toThrow(
      /multiple de 4/
    );
  });

  it('rejette nb_pages sous le min', () => {
    expect(() => calcBrochures({ ...baseInput, nb_pages: 4 }, baseParams)).toThrow(/entre 8/);
  });

  it('rejette nb_pages au-dessus du max', () => {
    expect(() => calcBrochures({ ...baseInput, nb_pages: 100 }, baseParams)).toThrow(/64/);
  });

  it('rejette nb_pages < 4', () => {
    expect(() => calcBrochures({ ...baseInput, nb_pages: 2 }, baseParams)).toThrow(
      BrochuresCalcError
    );
  });
});

// ============================================================
// TECHNO
// ============================================================

describe('calcBrochures — techno', () => {
  it('auto sous seuil (100 ex) → numérique', () => {
    const r = calcBrochures(baseInput, baseParams);
    expect(r.impression_interieur!.techno).toBe('numerique');
    expect(r.impression_couverture.techno).toBe('numerique');
  });

  it('auto au-dessus seuil (1000 ex) → offset (au moins pour intérieur)', () => {
    const r = calcBrochures({ ...baseInput, quantite: 1000 }, baseParams);
    // En offset, le coût est plus optimisé pour gros volumes
    expect(['offset', 'numerique']).toContain(r.impression_interieur!.techno);
  });

  it('switch auto si papier incompatible (intérieur)', () => {
    const r = calcBrochures(
      { ...baseInput, papier_interieur_id: 'offset_seul', techno_mode_interieur: 'numerique' },
      baseParams
    );
    expect(r.techno_switch_interieur).toBe(true);
    expect(r.impression_interieur!.techno).toBe('offset');
    expect(r.warnings.some((w) => w.includes('intérieur'))).toBe(true);
  });

  it('switch auto si papier incompatible (couverture)', () => {
    const r = calcBrochures(
      { ...baseInput, papier_couverture_id: 'num_seul', techno_mode_couverture: 'offset' },
      baseParams
    );
    expect(r.techno_switch_couverture).toBe(true);
    expect(r.impression_couverture.techno).toBe('numerique');
  });

  it('techno différente entre int et couv : ok', () => {
    const r = calcBrochures(
      {
        ...baseInput,
        quantite: 1000,
        techno_mode_interieur: 'offset',
        techno_mode_couverture: 'numerique',
      },
      baseParams
    );
    expect(r.impression_interieur!.techno).toBe('offset');
    expect(r.impression_couverture.techno).toBe('numerique');
  });
});

// ============================================================
// COULEUR (CALAGE OFFSET)
// ============================================================

describe('calcBrochures — couleur', () => {
  it('offset noir : calage moindre que quadri', () => {
    const quadri = calcBrochures(
      {
        ...baseInput,
        quantite: 1000,
        techno_mode_interieur: 'offset',
        techno_mode_couverture: 'offset',
        couleur_interieur: 'quadri',
        couleur_couverture: 'quadri',
      },
      baseParams
    );
    const noir = calcBrochures(
      {
        ...baseInput,
        quantite: 1000,
        techno_mode_interieur: 'offset',
        techno_mode_couverture: 'offset',
        couleur_interieur: 'noir',
        couleur_couverture: 'noir',
      },
      baseParams
    );
    expect(noir.impression_interieur!.cout_machine_ht).toBeLessThan(
      quadri.impression_interieur!.cout_machine_ht
    );
  });

  it('numérique : couleur quadri vs noir → coût identique', () => {
    const quadri = calcBrochures(
      { ...baseInput, couleur_interieur: 'quadri', couleur_couverture: 'quadri' },
      baseParams
    );
    const noir = calcBrochures(
      { ...baseInput, couleur_interieur: 'noir', couleur_couverture: 'noir' },
      baseParams
    );
    expect(noir.impression_interieur!.cout_machine_ht).toBe(
      quadri.impression_interieur!.cout_machine_ht
    );
  });
});

// ============================================================
// PLIAGE
// ============================================================

describe('calcBrochures — pliage', () => {
  it('nb_pages = 8 (seuil) → pas de pliage', () => {
    const r = calcBrochures({ ...baseInput, nb_pages: 8 }, baseParams);
    expect(r.cout_pliage_ht).toBe(0);
  });

  it('nb_pages = 12 (> seuil) → pliage facturé', () => {
    const r = calcBrochures({ ...baseInput, nb_pages: 12 }, baseParams);
    expect(r.cout_pliage_ht).toBeGreaterThan(0);
  });

  it('pliage requis sans machine_pliage_id → warning', () => {
    const paramsSansPlieuse = { ...baseParams, machine_pliage_id: undefined };
    const r = calcBrochures({ ...baseInput, nb_pages: 32 }, paramsSansPlieuse);
    expect(r.cout_pliage_ht).toBe(0);
    expect(r.warnings.some((w) => w.includes('Pliage requis'))).toBe(true);
  });
});

// ============================================================
// FINITIONS COUVERTURE
// ============================================================

describe('calcBrochures — finitions', () => {
  it('pelliculage par face : × 2 (couverture toujours RV)', () => {
    const r = calcBrochures(
      { ...baseInput, finitions_ids: ['pelliculage_brillant'] },
      baseParams
    );
    // Surface A5 = 148×210 / 1e6 = 0.03108 m²
    // × 100 ex = 3.108 m²
    // × 2 faces × 5 € = 31.08 €
    expect(r.cout_finitions_ht).toBeCloseTo(31.08, 1);
  });

  it('gaufrage unitaire', () => {
    const r = calcBrochures({ ...baseInput, finitions_ids: ['gaufrage'] }, baseParams);
    // 0.5 × 100 = 50 €
    expect(r.cout_finitions_ht).toBe(50);
  });

  it('dorure sous-traitée forfait : coût fournisseur × marge', () => {
    const r = calcBrochures({ ...baseInput, finitions_ids: ['dorure_st'] }, baseParams);
    // 200 × 1.40 = 280 €
    expect(r.cout_finitions_ht).toBeCloseTo(280, 1);
  });
});

// ============================================================
// MARGE PRORATA
// ============================================================

describe('calcBrochures — marge prorata techno', () => {
  it('tout offset → marge offset (60%)', () => {
    const r = calcBrochures(
      {
        ...baseInput,
        quantite: 1000,
        techno_mode_interieur: 'offset',
        techno_mode_couverture: 'offset',
      },
      baseParams
    );
    expect(r.marge_pct).toBeCloseTo(60, 1);
  });

  it('tout numérique → marge numérique (50%)', () => {
    const r = calcBrochures(
      {
        ...baseInput,
        techno_mode_interieur: 'numerique',
        techno_mode_couverture: 'numerique',
      },
      baseParams
    );
    expect(r.marge_pct).toBeCloseTo(50, 1);
  });

  it('mix offset/numérique → marge entre les deux', () => {
    const r = calcBrochures(
      {
        ...baseInput,
        quantite: 1000,
        techno_mode_interieur: 'offset',
        techno_mode_couverture: 'numerique',
      },
      baseParams
    );
    expect(r.marge_pct).toBeGreaterThan(50);
    expect(r.marge_pct).toBeLessThan(60);
  });
});

// ============================================================
// DÉGRESSIF
// ============================================================

describe('calcBrochures — dégressif', () => {
  it('100 ex : pas de remise', () => {
    const r = calcBrochures(baseInput, baseParams);
    expect(r.remise_pct).toBe(0);
  });

  it('500 ex : remise 5%', () => {
    const r = calcBrochures({ ...baseInput, quantite: 500 }, baseParams);
    expect(r.remise_pct).toBe(5);
  });

  it('5000 ex : remise 10%', () => {
    const r = calcBrochures({ ...baseInput, quantite: 5000 }, baseParams);
    expect(r.remise_pct).toBe(10);
  });
});

// ============================================================
// BAT
// ============================================================

describe('calcBrochures — BAT', () => {
  it('avec BAT : ajoute le prix BAT', () => {
    const sans = calcBrochures(baseInput, baseParams);
    const avec = calcBrochures({ ...baseInput, bat: true }, baseParams);
    expect(avec.cout_bat_ht).toBe(30);
    expect(avec.prix_ht).toBeGreaterThan(sans.prix_ht);
  });
});

// ============================================================
// PLANCHER
// ============================================================

describe('calcBrochures — plancher', () => {
  it('plancher appliqué si prix HT inférieur', () => {
    const params = { ...baseParams, prix_plancher_ht: 10000 };
    const r = calcBrochures(baseInput, params);
    expect(r.prix_ht).toBe(10000);
    expect(r.warnings.some((w) => w.includes('Plancher'))).toBe(true);
  });
});

// ============================================================
// ERREURS
// ============================================================

describe('calcBrochures — erreurs', () => {
  it('rejette quantite < 1', () => {
    expect(() => calcBrochures({ ...baseInput, quantite: 0 }, baseParams)).toThrow(
      BrochuresCalcError
    );
  });

  it('rejette reliure inconnue', () => {
    expect(() =>
      calcBrochures({ ...baseInput, reliure_id: 'inconnue' }, baseParams)
    ).toThrow(/Reliure introuvable/);
  });

  it('rejette papier intérieur inconnu', () => {
    expect(() =>
      calcBrochures({ ...baseInput, papier_interieur_id: 'inconnu' }, baseParams)
    ).toThrow(/Papier intérieur introuvable/);
  });

  it('rejette papier couverture inconnu', () => {
    expect(() =>
      calcBrochures({ ...baseInput, papier_couverture_id: 'inconnu' }, baseParams)
    ).toThrow(/Papier couverture introuvable/);
  });

  it('rejette dimensions custom invalides', () => {
    expect(() =>
      calcBrochures(
        { ...baseInput, dimension_mode: 'custom', largeur_mm: 0, hauteur_mm: 100 },
        baseParams
      )
    ).toThrow(/Dimensions custom invalides/);
  });

  it('rejette finition inconnue', () => {
    expect(() =>
      calcBrochures({ ...baseInput, finitions_ids: ['inconnu'] }, baseParams)
    ).toThrow(/Finition introuvable/);
  });
});
