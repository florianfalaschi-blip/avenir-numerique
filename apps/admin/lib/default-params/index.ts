export { defaultRollupParams } from './rollup';
export { defaultPlaquesParams } from './plaques';
export { defaultFlyersParams } from './flyers';
export { defaultBobinesParams } from './bobines';
export { defaultBrochuresParams } from './brochures';
export { defaultSoustraitanceParams } from './soustraitance';

/** Slugs typés pour la navigation et les clés de settings. */
export type CalcSlug =
  | 'rollup'
  | 'plaques'
  | 'flyers'
  | 'bobines'
  | 'brochures'
  | 'soustraitance';

export const CALC_SLUGS: readonly CalcSlug[] = [
  'rollup',
  'plaques',
  'flyers',
  'bobines',
  'brochures',
  'soustraitance',
] as const;

export const CALC_LABELS: Record<CalcSlug, string> = {
  rollup: 'Roll-up',
  plaques: 'Plaques / Signalétique',
  flyers: 'Flyers / Affiches',
  bobines: 'Bobines / Étiquettes',
  brochures: 'Brochures',
  soustraitance: 'Sous-traitance',
};
