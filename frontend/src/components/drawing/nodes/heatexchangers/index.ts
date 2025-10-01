/**
 * Heat Exchanger Symbols - Comprehensive Export
 * Exports all heat exchanger types including TEMA standards and specialty equipment
 */

// Base heat exchanger
export { default as HeatExchangerNode } from '../vessels/HeatExchangerNode';
export type { HeatExchangerNodeData } from '../vessels/HeatExchangerNode';

// TEMA Standard exchangers
export {
  BEMHeatExchanger,
  AESHeatExchanger,
  BKUHeatExchanger,
  AEUHeatExchanger,
  AEPHeatExchanger,
  AFUHeatExchanger,
} from './TEMAHeatExchangers';
export type { TEMAHeatExchangerData } from './TEMAHeatExchangers';
export {
  TEMAFrontHead,
  TEMAShellType,
  TEMARearHead,
  getTEMADescription,
  getTEMAApplications,
  calculateTEMADimensions,
} from './TEMAHeatExchangers';

// Specialty heat exchangers
export {
  // Plate exchangers
  GaskettedPlateHeatExchanger,
  BrazedPlateHeatExchanger,

  // Air cooled
  ForcedDraftAirCooler,
  InducedDraftAirCooler,

  // Condensers
  SurfaceCondenser,
  AirCooledCondenser,

  // Reboilers
  KettleReboiler,
  ThermosiphonReboiler,
  ForcedCirculationReboiler,

  // Specialty
  SpiralHeatExchanger,
  DoublePipeHeatExchanger,
  ScrapedSurfaceHeatExchanger,
  PrintedCircuitHeatExchanger,

  // Other
  Economizer,
  Vaporizer,
  Cooler,
  Heater,
} from './SpecialtyHeatExchangers';

export type {
  PlateHeatExchangerData,
  AirCooledHeatExchangerData,
  CondenserData,
  ReboilerData,
} from './SpecialtyHeatExchangers';

export {
  getHeatExchangerRecommendations,
  calculateDuty,
  calculateLMTD,
} from './SpecialtyHeatExchangers';

/**
 * Heat exchanger type registry
 */
export const HeatExchangerTypes = {
  // TEMA shell and tube
  BEM: 'tema-bem',
  AES: 'tema-aes',
  BKU: 'tema-bku',
  AEU: 'tema-aeu',
  AEP: 'tema-aep',
  AFU: 'tema-afu',

  // Plate
  GASKETED_PLATE: 'plate-gasketed',
  BRAZED_PLATE: 'plate-brazed',
  WELDED_PLATE: 'plate-welded',

  // Air cooled
  FORCED_DRAFT_AIR: 'air-forced-draft',
  INDUCED_DRAFT_AIR: 'air-induced-draft',

  // Condensers
  SURFACE_CONDENSER: 'condenser-surface',
  AIR_COOLED_CONDENSER: 'condenser-air',

  // Reboilers
  KETTLE_REBOILER: 'reboiler-kettle',
  THERMOSIPHON_REBOILER: 'reboiler-thermosiphon',
  FORCED_CIRCULATION_REBOILER: 'reboiler-forced',

  // Specialty
  SPIRAL: 'spiral',
  DOUBLE_PIPE: 'double-pipe',
  SCRAPED_SURFACE: 'scraped-surface',
  PRINTED_CIRCUIT: 'printed-circuit',

  // Other
  ECONOMIZER: 'economizer',
  VAPORIZER: 'vaporizer',
  COOLER: 'cooler',
  HEATER: 'heater',
} as const;

export type HeatExchangerTypeKey = typeof HeatExchangerTypes[keyof typeof HeatExchangerTypes];

/**
 * Heat exchanger category organization
 */
export const HeatExchangerCategories = {
  SHELL_AND_TUBE: {
    id: 'shell-and-tube',
    name: 'Shell and Tube (TEMA)',
    description: 'TEMA standard shell and tube heat exchangers',
    types: [
      HeatExchangerTypes.BEM,
      HeatExchangerTypes.AES,
      HeatExchangerTypes.BKU,
      HeatExchangerTypes.AEU,
      HeatExchangerTypes.AEP,
      HeatExchangerTypes.AFU,
    ],
  },
  PLATE: {
    id: 'plate',
    name: 'Plate Heat Exchangers',
    description: 'Gasketed, brazed, and welded plate exchangers',
    types: [
      HeatExchangerTypes.GASKETED_PLATE,
      HeatExchangerTypes.BRAZED_PLATE,
      HeatExchangerTypes.WELDED_PLATE,
    ],
  },
  AIR_COOLED: {
    id: 'air-cooled',
    name: 'Air Cooled Exchangers',
    description: 'Forced and induced draft air coolers',
    types: [
      HeatExchangerTypes.FORCED_DRAFT_AIR,
      HeatExchangerTypes.INDUCED_DRAFT_AIR,
      HeatExchangerTypes.AIR_COOLED_CONDENSER,
    ],
  },
  CONDENSERS_REBOILERS: {
    id: 'condensers-reboilers',
    name: 'Condensers & Reboilers',
    description: 'Phase change equipment',
    types: [
      HeatExchangerTypes.SURFACE_CONDENSER,
      HeatExchangerTypes.AIR_COOLED_CONDENSER,
      HeatExchangerTypes.KETTLE_REBOILER,
      HeatExchangerTypes.THERMOSIPHON_REBOILER,
      HeatExchangerTypes.FORCED_CIRCULATION_REBOILER,
    ],
  },
  SPECIALTY: {
    id: 'specialty',
    name: 'Specialty Exchangers',
    description: 'Spiral, double-pipe, and specialty heat exchangers',
    types: [
      HeatExchangerTypes.SPIRAL,
      HeatExchangerTypes.DOUBLE_PIPE,
      HeatExchangerTypes.SCRAPED_SURFACE,
      HeatExchangerTypes.PRINTED_CIRCUIT,
      HeatExchangerTypes.ECONOMIZER,
      HeatExchangerTypes.VAPORIZER,
    ],
  },
} as const;