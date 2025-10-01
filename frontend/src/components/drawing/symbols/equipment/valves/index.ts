/**
 * Valve Symbol Library for P&ID Diagrams
 * MVP Implementation with expansion path to 60+ valve types
 */

export {
  ValveSymbolBase,
  ValveSymbolFactory,
  ValveType,
  ActuatorType,
  VALVE_BASE_CONFIG,
  type IValveMetadata,
  type IValveSymbolData,
} from './ValveSymbolBase';

/**
 * Valve categories for UI organization
 */
export const VALVE_CATEGORIES = {
  ISOLATION: 'isolation', // Gate, globe, ball, butterfly, plug
  NON_RETURN: 'non-return', // Check valves
  CONTROL: 'control', // Control valves, throttle valves
  PRESSURE_RELIEF: 'pressure-relief', // Safety relief, pressure relief
  SPECIALTY: 'specialty', // Diaphragm, pinch, needle, three-way, four-way
} as const;

/**
 * MVP Implementation - 10 core valve types
 */
export const MVP_VALVE_TYPES = [
  'gate',
  'globe',
  'ball',
  'butterfly',
  'check',
  'control',
  'plug',
  'diaphragm',
  'safety-relief',
  'three-way',
] as const;

/**
 * Valve symbol counts
 */
export const VALVE_SYMBOL_COUNTS = {
  mvp: 10,
  target: 60,
} as const;

/**
 * Future expansion: Additional valve types to be implemented
 *
 * ISOLATION VALVES (additional 15+ types):
 * - Knife gate valves
 * - Y-pattern globe valves
 * - Three-piece ball valves
 * - V-port ball valves
 * - Trunnion mounted ball valves
 * - High-performance butterfly valves
 * - Wafer check valves
 * - Swing check valves
 * - Tilting disc check valves
 * - Dual plate check valves
 *
 * CONTROL VALVES (additional 15+ types):
 * - Angle control valves
 * - Cage-guided control valves
 * - Split-body control valves
 * - High-pressure control valves
 * - Cryogenic control valves
 * - Severe service control valves
 * - Digital control valves
 * - Electro-hydraulic control valves
 *
 * PRESSURE RELIEF (additional 10+ types):
 * - Pilot-operated relief valves
 * - Balanced bellows relief valves
 * - Rupture discs
 * - Vacuum relief valves
 * - Thermal relief valves
 * - Breather valves
 *
 * SPECIALTY VALVES (additional 20+ types):
 * - Pinch valves
 * - Needle valves
 * - Four-way valves
 * - Multi-port valves
 * - Sampling valves
 * - Drain valves
 * - Vent valves
 * - Bleed valves
 * - Throttle valves
 * - Isolation/bypass manifolds
 * - Double block and bleed valves
 * - Lined valves (PTFE, rubber)
 * - Cryogenic valves
 * - Bellows seal valves
 * - Fire-safe valves
 * - High-temperature valves
 * - Wafer-style valves
 * - Lug-style valves
 * - Flanged end valves
 * - Threaded end valves
 *
 * ACTUATOR VARIANTS (5 types implemented):
 * - Manual (handwheel, lever, gear operator)
 * - Pneumatic (spring return, double-acting)
 * - Electric (motor operated, multi-turn, quarter-turn)
 * - Hydraulic (single-acting, double-acting)
 * - Solenoid (direct-acting, pilot-operated)
 *
 * Additional actuator features to implement:
 * - Position indicators
 * - Limit switches
 * - Positioners
 * - Fail-safe spring assemblies
 * - Manual override mechanisms
 * - Visual position indicators
 * - Remote position feedback
 *
 * VALVE ACCESSORIES TO ADD:
 * - Position transmitters
 * - Limit switches (open/closed)
 * - Solenoid valves for pneumatic actuation
 * - Air filter regulators
 * - Quick exhaust valves
 * - Volume boosters
 * - Lock-out devices
 * - Chain operators for manual valves
 * - Extension stems
 *
 * Total target: 60+ valve symbol variants
 */

/**
 * Common valve sizes (DN/NPS)
 */
export const STANDARD_VALVE_SIZES = [
  'DN15',
  'DN20',
  'DN25',
  'DN32',
  'DN40',
  'DN50',
  'DN65',
  'DN80',
  'DN100',
  'DN125',
  'DN150',
  'DN200',
  'DN250',
  'DN300',
  'DN350',
  'DN400',
  'DN450',
  'DN500',
  'DN600',
] as const;

/**
 * Standard pressure ratings
 */
export const PRESSURE_RATINGS = [
  'PN10',
  'PN16',
  'PN25',
  'PN40',
  'PN64',
  'PN100',
  'Class 150',
  'Class 300',
  'Class 600',
  'Class 900',
  'Class 1500',
  'Class 2500',
] as const;

/**
 * Get valve by type
 */
export function getValveSymbol(
  type: typeof MVP_VALVE_TYPES[number],
  parameters: Parameters<typeof ValveSymbolFactory.createGateValve>[0]
) {
  switch (type) {
    case 'gate':
      return ValveSymbolFactory.createGateValve(parameters);
    case 'globe':
      return ValveSymbolFactory.createGlobeValve(parameters);
    case 'ball':
      return ValveSymbolFactory.createBallValve(parameters);
    case 'butterfly':
      return ValveSymbolFactory.createButterflyValve(parameters);
    case 'check':
      return ValveSymbolFactory.createCheckValve(parameters);
    case 'control':
      return ValveSymbolFactory.createControlValve(parameters);
    case 'safety-relief':
      return ValveSymbolFactory.createSafetyReliefValve(parameters);
    default:
      return ValveSymbolFactory.createGateValve(parameters);
  }
}
