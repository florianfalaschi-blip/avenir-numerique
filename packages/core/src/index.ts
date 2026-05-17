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

// Flyers / Affiches
export { calcFlyers, FlyersCalcError } from './calculators/flyers';
export type {
  FlyersInput,
  FlyersParams,
  FlyersResult,
  FlyersImpressionDetail,
  FlyersMachineConfig,
  FlyersPapierConfig,
  FlyersPapierFormat,
  FlyersFormatStandardConfig,
  FlyersFinitionConfig,
  FlyersFinitionType,
  FlyersDegressifSeuil,
  FlyersDimensionMode,
  FlyersTailleStandard,
  RectoVerso,
  TechnoMode,
  Techno,
} from './types/flyers';

// Bobines / Étiquettes
export { calcBobines, BobinesCalcError } from './calculators/bobines';
export type {
  BobinesInput,
  BobinesParams,
  BobinesResult,
  BobinesMatiereResult,
  BobinesMateriauConfig,
  BobinesRouleauConfig,
  BobinesMachineImpressionConfig,
  BobinesMachineDecoupeConfig,
  BobinesFinitionConfig,
  BobinesFinitionType,
  BobinesDegressifSeuil,
  BobinesForme,
  BobinesConditionnement,
  BobinesDecoupeMode,
  BobinesMethodeCalcul,
} from './types/bobines';

// Brochures
export {
  calcBrochures,
  BrochuresCalcError,
  computeBrochureThickness,
  DEFAULT_PAPIER_MAIN,
  SUPPLEMENT_RELIURE_MM,
} from './calculators/brochures';
export type {
  BrochuresInput,
  BrochuresParams,
  BrochuresResult,
  BrochuresImpressionDetail,
  BrochuresMachineImpressionConfig,
  BrochuresMachineFaconnageConfig,
  BrochuresReliureConfig,
  BrochuresPapierConfig,
  BrochuresPapierFormat,
  BrochuresFormatStandardConfig,
  BrochuresFinitionConfig,
  BrochuresFinitionType,
  BrochuresDegressifSeuil,
  BrochuresDimensionMode,
  BrochuresTailleStandard,
  BrochuresCouleur,
  BrochuresTechnoMode,
  BrochuresTechno,
  BrochuresPoste,
  BrochuresReliureType,
} from './types/brochures';

// Sous-traitance
export { calcSoustraitance, SoustraitanceCalcError } from './calculators/soustraitance';
export type {
  SoustraitanceInput,
  SoustraitanceParams,
  SoustraitanceResult,
  SoustraitanceLigne,
  SoustraitanceLigneDetail,
  SoustraitanceFournisseurConfig,
  SoustraitanceDegressifSeuil,
} from './types/soustraitance';
