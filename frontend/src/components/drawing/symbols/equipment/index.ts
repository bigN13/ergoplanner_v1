/**
 * Process Equipment Symbol Library
 * Comprehensive collection of parametric symbols for process engineering
 */

// Vessel symbols
export {
  VesselSymbolBase,
  VesselSymbolFactory,
  VesselShape,
  VesselHeadType,
  VESSEL_BASE_CONFIG,
  type IVesselMetadata,
  type IVesselSymbolData,
} from './vessels/VesselSymbolBase';

// Pump symbols
export {
  PumpSymbolBase,
  PumpSymbolFactory,
  PumpType,
  PumpDriveType,
  PUMP_BASE_CONFIG,
  type IPumpMetadata,
  type IPumpSymbolData,
} from './pumps/PumpSymbolBase';

// Compressor symbols
export {
  CompressorSymbolBase,
  CompressorSymbolFactory,
  CompressorType,
  COMPRESSOR_BASE_CONFIG,
  type ICompressorMetadata,
  type ICompressorSymbolData,
} from './compressors/CompressorSymbolBase';

// Heat exchanger symbols
export {
  HeatExchangerSymbolBase,
  HeatExchangerSymbolFactory,
  HeatExchangerType,
  TEMAShellType,
  FlowArrangement,
  HEAT_EXCHANGER_BASE_CONFIG,
  type IHeatExchangerMetadata,
  type IHeatExchangerSymbolData,
} from './heat-exchangers/HeatExchangerSymbolBase';

// Valve symbols
export {
  ValveSymbolBase,
  ValveSymbolFactory,
  ValveType,
  ActuatorType,
  VALVE_BASE_CONFIG,
  type IValveMetadata,
  type IValveSymbolData,
  VALVE_CATEGORIES,
  MVP_VALVE_TYPES,
  VALVE_SYMBOL_COUNTS,
  STANDARD_VALVE_SIZES,
  PRESSURE_RATINGS,
  getValveSymbol,
} from './valves';

/**
 * Equipment symbol categories for UI organization
 */
export const EQUIPMENT_CATEGORIES = {
  VESSELS: 'vessels',
  PUMPS: 'pumps',
  COMPRESSORS: 'compressors',
  HEAT_EXCHANGERS: 'heat-exchangers',
} as const;

/**
 * Get all equipment categories
 */
export function getEquipmentCategories(): string[] {
  return Object.values(EQUIPMENT_CATEGORIES);
}

/**
 * Count of symbol types per category (MVP implementation)
 */
export const SYMBOL_COUNTS = {
  [EQUIPMENT_CATEGORIES.VESSELS]: 8, // 8 vessel types implemented
  [EQUIPMENT_CATEGORIES.PUMPS]: 7, // 7 pump types implemented
  [EQUIPMENT_CATEGORIES.COMPRESSORS]: 6, // 6 compressor types implemented
  [EQUIPMENT_CATEGORIES.HEAT_EXCHANGERS]: 7, // 7 heat exchanger types implemented
  total: 28, // Total MVP symbols
} as const;

/**
 * Future expansion: Additional equipment types to be implemented
 *
 * VESSELS (additional):
 * - Mixing tanks with agitators
 * - Buffer tanks
 * - Separator vessels (gas/liquid, liquid/liquid)
 * - Knockout drums
 * - Flash drums
 * - Surge vessels
 *
 * PUMPS (additional):
 * - Vertical turbine pumps
 * - Submersible pumps
 * - Sump pumps
 * - Jet pumps
 * - Progressive cavity pumps
 * - Lobe pumps
 *
 * COMPRESSORS (additional):
 * - Liquid ring compressors
 * - Turbo compressors
 * - Hermetic compressors
 * - Semi-hermetic compressors
 *
 * HEAT EXCHANGERS (additional):
 * - Regenerative heat exchangers
 * - Recuperative heat exchangers
 * - Reboilers (thermosiphon, forced circulation)
 * - Condensers (surface, direct contact)
 * - Evaporators
 * - Cooling towers
 *
 * NEW CATEGORIES TO ADD:
 * - Filters & Separators (40+ types)
 * - Valves (60+ types)
 * - Instrumentation (50+ types)
 * - Piping Components (30+ types)
 * - Safety Equipment (20+ types)
 *
 * Target: 150+ total symbols as specified in Task #138
 */
