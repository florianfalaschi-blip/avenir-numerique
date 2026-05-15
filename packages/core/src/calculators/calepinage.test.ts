import { describe, it, expect } from 'vitest';
import { calepiner } from './calepinage';

describe('calepiner — cas simples', () => {
  it('A4 (21×29.7) sur format 305×200 : 30 poses', () => {
    // 305 / 21 = 14 horiz × 200 / 29.7 = 6 vert = 84
    // Rotation : 305 / 29.7 = 10 × 200 / 21 = 9 = 90
    const res = calepiner({
      piece_largeur_cm: 21,
      piece_hauteur_cm: 29.7,
      format_largeur_cm: 305,
      format_hauteur_cm: 200,
    });
    expect(res.nb_poses).toBe(90);
    expect(res.rotation_appliquee).toBe(true);
  });

  it('format identique à la pièce : 1 pose', () => {
    const res = calepiner({
      piece_largeur_cm: 100,
      piece_hauteur_cm: 100,
      format_largeur_cm: 100,
      format_hauteur_cm: 100,
    });
    expect(res.nb_poses).toBe(1);
  });

  it('pièce plus grande que le format : 0 pose', () => {
    const res = calepiner({
      piece_largeur_cm: 200,
      piece_hauteur_cm: 200,
      format_largeur_cm: 100,
      format_hauteur_cm: 100,
    });
    expect(res.nb_poses).toBe(0);
  });

  it('rotation 90° avantageuse', () => {
    // Format 100×50. Pièce 30×60.
    // Normal: 100/30=3 × 50/60=0 = 0
    // Rotation: 100/60=1 × 50/30=1 = 1
    const res = calepiner({
      piece_largeur_cm: 30,
      piece_hauteur_cm: 60,
      format_largeur_cm: 100,
      format_hauteur_cm: 50,
    });
    expect(res.nb_poses).toBe(1);
    expect(res.rotation_appliquee).toBe(true);
  });

  it('orientation normale plus avantageuse', () => {
    // Format 100×50, pièce 10×10 → 100/10=10 × 50/10=5 = 50 (idem en rotation)
    // Mais 100×50 et pièce 5×10 → 100/5=20 × 50/10=5 = 100 normal
    //                       rotation : 100/10=10 × 50/5=10 = 100 → égalité
    // Test avec 6×11 : normal 100/6=16 × 50/11=4 = 64
    //                  rotation 100/11=9 × 50/6=8 = 72
    // Pour avoir normal supérieur : 100/4=25 × 50/12=4 = 100, rotation 100/12=8 × 50/4=12 = 96
    const res = calepiner({
      piece_largeur_cm: 4,
      piece_hauteur_cm: 12,
      format_largeur_cm: 100,
      format_hauteur_cm: 50,
    });
    expect(res.nb_poses).toBe(100);
    expect(res.rotation_appliquee).toBe(false);
  });

  it('prise en compte espace entre pièces', () => {
    // Pièce 10×10, format 100×100, sans espace : 10×10 = 100 poses
    const sans = calepiner({
      piece_largeur_cm: 10,
      piece_hauteur_cm: 10,
      format_largeur_cm: 100,
      format_hauteur_cm: 100,
    });
    expect(sans.nb_poses).toBe(100);

    // Avec 1cm d'espace : pièce devient 11 effectifs, 100/11 = 9
    const avec = calepiner({
      piece_largeur_cm: 10,
      piece_hauteur_cm: 10,
      format_largeur_cm: 100,
      format_hauteur_cm: 100,
      espace_cm: 1,
    });
    expect(avec.nb_poses).toBeLessThan(sans.nb_poses);
  });
});