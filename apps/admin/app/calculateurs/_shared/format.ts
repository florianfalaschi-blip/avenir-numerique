/**
 * Formatage des valeurs monétaires en euros (FR).
 * Ex: 1234.5 → "1 234,50 €"
 */
export const fmtEur = (v: number) =>
  v.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

/** Formatage en pourcentage entier. */
export const fmtPct = (v: number) => `${v.toLocaleString('fr-FR')} %`;

/** Formatage d'un nombre entier avec espace de groupe. */
export const fmtInt = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
