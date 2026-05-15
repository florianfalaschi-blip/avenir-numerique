/**
 * @avenir/core — Moteurs de calcul métier
 */

export const VERSION = '0.1.0';

// Calepinage (helper partagé)
export { calepiner } from './calculators/calepinage';
export type { CalepinageInput, CalepinageOutput } from './calculators/calepinage';

// Roll-up
export { calcRollup, RollupCalcError } from './calculators/rollup';
export type {
  RollupInput,
  RollupParams,
  RollupResult,
  BacheConfig,
  StructureConfig,
  MachineConfig,
  DegressifSeuil,
} from './types/rollup';

// Plaques
export { calcPlaques, PlaquesCalcError } from './calculators/plaques';
export type {
  PlaquesInput,
  PlaquesParams,
  PlaquesResult,
  CalepinageResult,
  MateriauConfig,
  FormatAchatMateriau,
  MachineImpressionConfig,
  MachineDecoupeConfig,
  FinitionConfig,
  FinitionType,
  TailleStandard,
  TailleStandardConfig,
  DegressifSeuilPlaques,
  DimensionMode,
  DecoupeMode,
} from './types/plaques';

// À venir : flyers, bobines, brochures