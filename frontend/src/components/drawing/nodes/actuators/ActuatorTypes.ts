/**
 * Actuator Types and Interfaces
 * Defines all actuator-related types for valve and damper actuation
 */

export enum ActuatorType {
  MANUAL = 'manual',
  LEVER = 'lever',
  HANDWHEEL = 'handwheel',
  GEAR = 'gear',
  CHAINWHEEL = 'chainwheel',
  ELECTRIC = 'electric',
  PNEUMATIC = 'pneumatic',
  HYDRAULIC = 'hydraulic',
  ELECTRO_PNEUMATIC = 'electro-pneumatic',
  ELECTRO_HYDRAULIC = 'electro-hydraulic',
}

export enum ActuatorAction {
  SINGLE_ACTING = 'single-acting', // Spring return
  DOUBLE_ACTING = 'double-acting', // Powered both directions
  SPRING_RETURN = 'spring-return',
  SPRING_DIAPHRAGM = 'spring-diaphragm',
  PISTON = 'piston',
  RACK_PINION = 'rack-pinion',
  SCOTCH_YOKE = 'scotch-yoke',
  QUARTER_TURN = 'quarter-turn',
  LINEAR = 'linear',
}

export enum FailSafePosition {
  FAIL_OPEN = 'fail-open', // FO
  FAIL_CLOSED = 'fail-closed', // FC
  FAIL_IN_PLACE = 'fail-in-place', // FIP or FL (Fail Last)
  FAIL_LOCKED = 'fail-locked', // FL
  NO_FAIL_SAFE = 'none',
}

export enum ActuatorState {
  IDLE = 'idle',
  ENERGIZED = 'energized',
  DE_ENERGIZED = 'de-energized',
  MOVING = 'moving',
  STALLED = 'stalled',
  FAULTED = 'faulted',
  MANUAL_OVERRIDE = 'manual-override',
}

export enum ActuatorMountingOrientation {
  TOP = 'top',
  SIDE = 'side',
  BOTTOM = 'bottom',
  INLINE = 'inline',
}

export enum PowerSupply {
  ELECTRIC_24VDC = '24VDC',
  ELECTRIC_48VDC = '48VDC',
  ELECTRIC_110VAC = '110VAC',
  ELECTRIC_230VAC = '230VAC',
  ELECTRIC_480VAC = '480VAC',
  PNEUMATIC_3_15PSI = '3-15 PSI',
  PNEUMATIC_6BAR = '6 bar',
  HYDRAULIC_3000PSI = '3000 PSI',
}

/**
 * Base actuator data interface
 */
export interface ActuatorData {
  // Type and configuration
  type: ActuatorType;
  action?: ActuatorAction;
  failSafe?: FailSafePosition;

  // State
  state?: ActuatorState;
  position?: number; // 0-100%

  // Power and control
  powerSupply?: PowerSupply;
  controlSignal?: '4-20mA' | '0-10V' | 'digital' | 'modbus' | 'profibus';

  // Features
  positioner?: boolean; // Has valve positioner
  limitswitches?: boolean; // Has position limit switches
  solenoid?: boolean; // Has solenoid valve
  handwheel?: boolean; // Has manual override

  // Physical
  mounting?: ActuatorMountingOrientation;
  torque?: number; // Nm or lb-ft
  thrust?: number; // N or lbf (for linear actuators)

  // Timing
  strokeTime?: number; // seconds for full stroke

  // Indication
  showState?: boolean;
  showPosition?: boolean;
  showFailSafe?: boolean;
}

/**
 * Pneumatic actuator specific data
 */
export interface PneumaticActuatorData extends ActuatorData {
  type: ActuatorType.PNEUMATIC;
  action: ActuatorAction.SINGLE_ACTING | ActuatorAction.DOUBLE_ACTING | ActuatorAction.SPRING_DIAPHRAGM;
  supplyPressure?: number; // PSI or bar
  springRange?: { min: number; max: number }; // PSI or bar
  diaphragmSize?: number; // inches or mm
}

/**
 * Electric actuator specific data
 */
export interface ElectricActuatorData extends ActuatorData {
  type: ActuatorType.ELECTRIC;
  motorType?: 'AC' | 'DC' | 'stepper' | 'servo';
  voltage?: number;
  current?: number;
  phases?: 1 | 3;
  dutyCycle?: 'intermittent' | 'continuous';
}

/**
 * Hydraulic actuator specific data
 */
export interface HydraulicActuatorData extends ActuatorData {
  type: ActuatorType.HYDRAULIC;
  action: ActuatorAction.SINGLE_ACTING | ActuatorAction.DOUBLE_ACTING | ActuatorAction.PISTON;
  cylinderSize?: number; // bore diameter
  rodSize?: number;
  pressure?: number; // PSI or bar
}

/**
 * Manual actuator specific data
 */
export interface ManualActuatorData extends ActuatorData {
  type: ActuatorType.MANUAL | ActuatorType.LEVER | ActuatorType.HANDWHEEL | ActuatorType.GEAR | ActuatorType.CHAINWHEEL;
  gearRatio?: number;
  numberOfTurns?: number; // Full stroke turns
  chainLength?: number; // For chainwheel
  leverLength?: number; // For lever operators
}

/**
 * Actuator overlay rendering props
 */
export interface ActuatorOverlayProps {
  data: ActuatorData;
  width: number;
  height: number;
  position?: { x: number; y: number };
  scale?: number;
  showLabels?: boolean;
  compact?: boolean;
}

/**
 * Actuator configuration for different valve types
 */
export interface ActuatorConfiguration {
  defaultType: ActuatorType;
  allowedTypes: ActuatorType[];
  defaultAction?: ActuatorAction;
  defaultFailSafe?: FailSafePosition;
  recommendedStrokeTime?: number;
}

/**
 * Valve type to actuator configuration mapping
 */
export const ValveActuatorConfigurations: Record<string, ActuatorConfiguration> = {
  'gate': {
    defaultType: ActuatorType.ELECTRIC,
    allowedTypes: [
      ActuatorType.MANUAL,
      ActuatorType.HANDWHEEL,
      ActuatorType.GEAR,
      ActuatorType.ELECTRIC,
      ActuatorType.PNEUMATIC,
      ActuatorType.HYDRAULIC,
    ],
    defaultAction: ActuatorAction.LINEAR,
    recommendedStrokeTime: 30,
  },
  'globe': {
    defaultType: ActuatorType.PNEUMATIC,
    allowedTypes: [
      ActuatorType.MANUAL,
      ActuatorType.HANDWHEEL,
      ActuatorType.PNEUMATIC,
      ActuatorType.ELECTRIC,
      ActuatorType.HYDRAULIC,
    ],
    defaultAction: ActuatorAction.SPRING_DIAPHRAGM,
    defaultFailSafe: FailSafePosition.FAIL_CLOSED,
    recommendedStrokeTime: 3,
  },
  'ball': {
    defaultType: ActuatorType.PNEUMATIC,
    allowedTypes: [
      ActuatorType.MANUAL,
      ActuatorType.LEVER,
      ActuatorType.GEAR,
      ActuatorType.PNEUMATIC,
      ActuatorType.ELECTRIC,
      ActuatorType.HYDRAULIC,
    ],
    defaultAction: ActuatorAction.QUARTER_TURN,
    defaultFailSafe: FailSafePosition.FAIL_CLOSED,
    recommendedStrokeTime: 2,
  },
  'butterfly': {
    defaultType: ActuatorType.PNEUMATIC,
    allowedTypes: [
      ActuatorType.MANUAL,
      ActuatorType.LEVER,
      ActuatorType.GEAR,
      ActuatorType.PNEUMATIC,
      ActuatorType.ELECTRIC,
      ActuatorType.HYDRAULIC,
    ],
    defaultAction: ActuatorAction.RACK_PINION,
    defaultFailSafe: FailSafePosition.FAIL_CLOSED,
    recommendedStrokeTime: 5,
  },
  'plug': {
    defaultType: ActuatorType.PNEUMATIC,
    allowedTypes: [
      ActuatorType.MANUAL,
      ActuatorType.LEVER,
      ActuatorType.GEAR,
      ActuatorType.PNEUMATIC,
      ActuatorType.ELECTRIC,
    ],
    defaultAction: ActuatorAction.QUARTER_TURN,
    recommendedStrokeTime: 3,
  },
  'control': {
    defaultType: ActuatorType.PNEUMATIC,
    allowedTypes: [
      ActuatorType.PNEUMATIC,
      ActuatorType.ELECTRIC,
      ActuatorType.ELECTRO_PNEUMATIC,
      ActuatorType.HYDRAULIC,
    ],
    defaultAction: ActuatorAction.SPRING_DIAPHRAGM,
    defaultFailSafe: FailSafePosition.FAIL_CLOSED,
    recommendedStrokeTime: 2,
  },
};

/**
 * Get actuator configuration for a valve type
 */
export function getActuatorConfig(valveType: string): ActuatorConfiguration {
  return ValveActuatorConfigurations[valveType] || {
    defaultType: ActuatorType.MANUAL,
    allowedTypes: Object.values(ActuatorType),
    recommendedStrokeTime: 10,
  };
}

/**
 * Validate actuator configuration for a valve type
 */
export function validateActuatorConfig(
  valveType: string,
  actuatorType: ActuatorType
): boolean {
  const config = getActuatorConfig(valveType);
  return config.allowedTypes.includes(actuatorType);
}

/**
 * Get fail-safe abbreviation for display
 */
export function getFailSafeAbbreviation(failSafe: FailSafePosition): string {
  const abbreviations: Record<FailSafePosition, string> = {
    [FailSafePosition.FAIL_OPEN]: 'FO',
    [FailSafePosition.FAIL_CLOSED]: 'FC',
    [FailSafePosition.FAIL_IN_PLACE]: 'FIP',
    [FailSafePosition.FAIL_LOCKED]: 'FL',
    [FailSafePosition.NO_FAIL_SAFE]: '',
  };
  return abbreviations[failSafe] || '';
}

/**
 * Get actuator type abbreviation for display
 */
export function getActuatorTypeAbbreviation(type: ActuatorType): string {
  const abbreviations: Record<ActuatorType, string> = {
    [ActuatorType.MANUAL]: 'M',
    [ActuatorType.LEVER]: 'L',
    [ActuatorType.HANDWHEEL]: 'HW',
    [ActuatorType.GEAR]: 'G',
    [ActuatorType.CHAINWHEEL]: 'CW',
    [ActuatorType.ELECTRIC]: 'E',
    [ActuatorType.PNEUMATIC]: 'P',
    [ActuatorType.HYDRAULIC]: 'H',
    [ActuatorType.ELECTRO_PNEUMATIC]: 'EP',
    [ActuatorType.ELECTRO_HYDRAULIC]: 'EH',
  };
  return abbreviations[type] || '';
}

/**
 * Get state color for visual indication
 */
export function getActuatorStateColor(state: ActuatorState): string {
  const colors: Record<ActuatorState, string> = {
    [ActuatorState.IDLE]: '#6b7280', // Gray
    [ActuatorState.ENERGIZED]: '#10b981', // Green
    [ActuatorState.DE_ENERGIZED]: '#ef4444', // Red
    [ActuatorState.MOVING]: '#3b82f6', // Blue
    [ActuatorState.STALLED]: '#f59e0b', // Amber
    [ActuatorState.FAULTED]: '#dc2626', // Red
    [ActuatorState.MANUAL_OVERRIDE]: '#8b5cf6', // Purple
  };
  return colors[state] || colors[ActuatorState.IDLE];
}
