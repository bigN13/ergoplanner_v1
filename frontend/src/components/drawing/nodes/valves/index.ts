/**
 * Valve Symbol Library - Comprehensive Export
 * Exports all valve types with actuator support and state indicators
 */

// Base/Manual valve types
export { default as GateValveNode } from './GateValveNode';
export { default as GlobeValveNode } from './GlobeValveNode';
export { default as BallValveNode } from './BallValveNode';
export { default as ButterflyValveNode } from './ButterflyValveNode';
export { default as ControlValveNode } from './ControlValveNode';
export { default as CheckValveNode } from './CheckValveNode';

// Safety and relief valves
export {
  SafetyValveNode,
  PressureReliefValveNode,
  VacuumReliefValveNode,
} from './SafetyReliefValves';

// Specialty valves
export {
  NeedleValveNode,
  DiaphragmValveNode,
  PinchValveNode,
  PlugValveNode,
} from './SpecialtyValves';

// Type exports
export type { GateValveData } from './GateValveNode';
export type { GlobeValveData } from './GlobeValveNode';
export type { BallValveData } from './BallValveNode';
export type { ButterflyValveData } from './ButterflyValveNode';
export type { ControlValveData } from './ControlValveNode';
export type { CheckValveData } from './CheckValveNode';

export type {
  SafetyValveData,
  PressureReliefValveData,
  VacuumReliefValveData,
} from './SafetyReliefValves';

export type {
  NeedleValveData,
  DiaphragmValveData,
  PinchValveData,
  PlugValveData,
} from './SpecialtyValves';

/**
 * Valve type registry
 */
export const ValveTypes = {
  // Manual on/off valves
  GATE: 'gate-valve',
  GLOBE: 'globe-valve',
  BALL: 'ball-valve',
  BUTTERFLY: 'butterfly-valve',
  PLUG: 'plug-valve',

  // Check valves
  CHECK_SWING: 'check-valve-swing',
  CHECK_LIFT: 'check-valve-lift',
  CHECK_DUAL_PLATE: 'check-valve-dual-plate',
  CHECK_TILTING_DISC: 'check-valve-tilting-disc',
  CHECK_BALL: 'check-valve-ball',

  // Control valves
  CONTROL_GLOBE: 'control-valve-globe',
  CONTROL_BUTTERFLY: 'control-valve-butterfly',
  CONTROL_BALL: 'control-valve-ball',

  // Safety and relief
  SAFETY: 'safety-valve',
  PRESSURE_RELIEF: 'pressure-relief-valve',
  VACUUM_RELIEF: 'vacuum-relief-valve',

  // Specialty valves
  NEEDLE: 'needle-valve',
  DIAPHRAGM: 'diaphragm-valve',
  PINCH: 'pinch-valve',
  DIAPHRAGM_WEIR: 'diaphragm-valve-weir',
  DIAPHRAGM_STRAIGHT: 'diaphragm-valve-straight',
  PLUG_2WAY: 'plug-valve-2way',
  PLUG_3WAY: 'plug-valve-3way',
  PLUG_4WAY: 'plug-valve-4way',
} as const;

export type ValveTypeKey = typeof ValveTypes[keyof typeof ValveTypes];

/**
 * Actuator types for valves
 */
export const ActuatorTypes = {
  MANUAL: 'manual',
  LEVER: 'lever',
  GEAR: 'gear',
  ELECTRIC: 'electric',
  PNEUMATIC: 'pneumatic',
  HYDRAULIC: 'hydraulic',
} as const;

export type ActuatorTypeKey = typeof ActuatorTypes[keyof typeof ActuatorTypes];

/**
 * Valve category organization
 */
export const ValveCategories = {
  ISOLATION: {
    id: 'isolation-valves',
    name: 'Isolation Valves',
    description: 'On/off valves for flow isolation',
    types: [
      ValveTypes.GATE,
      ValveTypes.GLOBE,
      ValveTypes.BALL,
      ValveTypes.BUTTERFLY,
      ValveTypes.PLUG,
    ],
  },
  CHECK: {
    id: 'check-valves',
    name: 'Check Valves',
    description: 'Non-return valves preventing backflow',
    types: [
      ValveTypes.CHECK_SWING,
      ValveTypes.CHECK_LIFT,
      ValveTypes.CHECK_DUAL_PLATE,
      ValveTypes.CHECK_TILTING_DISC,
      ValveTypes.CHECK_BALL,
    ],
  },
  CONTROL: {
    id: 'control-valves',
    name: 'Control Valves',
    description: 'Modulating valves for flow control',
    types: [
      ValveTypes.CONTROL_GLOBE,
      ValveTypes.CONTROL_BUTTERFLY,
      ValveTypes.CONTROL_BALL,
    ],
  },
  SAFETY_RELIEF: {
    id: 'safety-relief-valves',
    name: 'Safety & Relief Valves',
    description: 'Pressure protection devices',
    types: [
      ValveTypes.SAFETY,
      ValveTypes.PRESSURE_RELIEF,
      ValveTypes.VACUUM_RELIEF,
    ],
  },
  SPECIALTY: {
    id: 'specialty-valves',
    name: 'Specialty Valves',
    description: 'Special purpose valve types',
    types: [
      ValveTypes.NEEDLE,
      ValveTypes.DIAPHRAGM,
      ValveTypes.PINCH,
      ValveTypes.PLUG_2WAY,
      ValveTypes.PLUG_3WAY,
      ValveTypes.PLUG_4WAY,
    ],
  },
} as const;

/**
 * Valve end connection types
 */
export const EndConnectionTypes = {
  FLANGED: 'flanged',
  THREADED: 'threaded',
  SOCKET_WELD: 'socket-weld',
  BUTT_WELD: 'butt-weld',
  WAFER: 'wafer',
  LUG: 'lug',
  GROOVED: 'grooved',
  COMPRESSION: 'compression',
  TUBE: 'tube',
} as const;

/**
 * Valve state enumeration
 */
export const ValveStates = {
  OPEN: 'open',
  CLOSED: 'closed',
  THROTTLED: 'throttled',
  PARTIAL: 'partial',
  MODULATING: 'modulating',
  RELIEVING: 'relieving',
  POPPING: 'popping',
  LIFTING: 'lifting',
  CRACKING: 'cracking',
} as const;

/**
 * Fail-safe positions for automated valves
 */
export const FailPositions = {
  FAIL_OPEN: 'fail-open',
  FAIL_CLOSED: 'fail-closed',
  FAIL_IN_PLACE: 'fail-in-place',
  FAIL_LAST: 'fail-last',
} as const;
