/**
 * Actuator System - Comprehensive Export
 * Actuator overlays, state management, and configuration utilities
 */

// Types and enums
export type {
  ActuatorData,
  PneumaticActuatorData,
  ElectricActuatorData,
  HydraulicActuatorData,
  ManualActuatorData,
  ActuatorOverlayProps,
  ActuatorConfiguration,
} from './ActuatorTypes';

export {
  ActuatorType,
  ActuatorAction,
  FailSafePosition,
  ActuatorState,
  ActuatorMountingOrientation,
  PowerSupply,
  ValveActuatorConfigurations,
  getActuatorConfig,
  validateActuatorConfig,
  getFailSafeAbbreviation,
  getActuatorTypeAbbreviation,
  getActuatorStateColor,
} from './ActuatorTypes';

// Overlay components
export {
  ActuatorOverlay,
  PneumaticActuatorOverlay,
  ElectricActuatorOverlay,
  HydraulicActuatorOverlay,
  ManualHandwheelOverlay,
  LeverOperatorOverlay,
  ChainwheelOperatorOverlay,
} from './ActuatorOverlays';

// State management
export {
  useActuatorState,
  type ActuatorStateManager,
  type UseActuatorStateOptions,
} from './useActuatorState';

/**
 * Quick actuator presets for common configurations
 */
export const ActuatorPresets = {
  // Pneumatic presets
  PNEUMATIC_SPRING_RETURN_FC: {
    type: ActuatorType.PNEUMATIC,
    action: ActuatorAction.SPRING_RETURN,
    failSafe: FailSafePosition.FAIL_CLOSED,
    showFailSafe: true,
  },
  PNEUMATIC_SPRING_RETURN_FO: {
    type: ActuatorType.PNEUMATIC,
    action: ActuatorAction.SPRING_RETURN,
    failSafe: FailSafePosition.FAIL_OPEN,
    showFailSafe: true,
  },
  PNEUMATIC_DOUBLE_ACTING: {
    type: ActuatorType.PNEUMATIC,
    action: ActuatorAction.DOUBLE_ACTING,
    failSafe: FailSafePosition.NO_FAIL_SAFE,
  },
  PNEUMATIC_DIAPHRAGM_FC: {
    type: ActuatorType.PNEUMATIC,
    action: ActuatorAction.SPRING_DIAPHRAGM,
    failSafe: FailSafePosition.FAIL_CLOSED,
    showFailSafe: true,
  },

  // Electric presets
  ELECTRIC_MODULATING: {
    type: ActuatorType.ELECTRIC,
    motorType: 'AC',
    phases: 3,
    limitswitches: true,
    positioner: true,
  },
  ELECTRIC_ON_OFF: {
    type: ActuatorType.ELECTRIC,
    motorType: 'DC',
    limitswitches: true,
  },

  // Hydraulic presets
  HYDRAULIC_DOUBLE_ACTING: {
    type: ActuatorType.HYDRAULIC,
    action: ActuatorAction.DOUBLE_ACTING,
  },
  HYDRAULIC_SPRING_RETURN: {
    type: ActuatorType.HYDRAULIC,
    action: ActuatorAction.SPRING_RETURN,
    failSafe: FailSafePosition.FAIL_CLOSED,
  },

  // Manual presets
  MANUAL_HANDWHEEL: {
    type: ActuatorType.HANDWHEEL,
  },
  MANUAL_LEVER: {
    type: ActuatorType.LEVER,
  },
  MANUAL_GEAR_OPERATOR: {
    type: ActuatorType.GEAR,
    gearRatio: 10,
  },
  MANUAL_CHAINWHEEL: {
    type: ActuatorType.CHAINWHEEL,
  },
} as const;

/**
 * Utility function to create actuator data with defaults
 */
export function createActuatorData(
  type: ActuatorType,
  overrides?: Partial<ActuatorData>
): ActuatorData {
  const baseData: ActuatorData = {
    type,
    state: ActuatorState.IDLE,
    position: 0,
    showState: true,
    showPosition: false,
    showFailSafe: true,
    ...overrides,
  };

  return baseData;
}

/**
 * Utility function to get recommended actuator for valve type
 */
export function getRecommendedActuator(valveType: string): ActuatorData {
  const config = ValveActuatorConfigurations[valveType];

  if (!config) {
    return createActuatorData(ActuatorType.MANUAL);
  }

  return createActuatorData(config.defaultType, {
    action: config.defaultAction,
    failSafe: config.defaultFailSafe,
  });
}

export default {
  ActuatorType,
  ActuatorAction,
  FailSafePosition,
  ActuatorState,
  ActuatorPresets,
  createActuatorData,
  getRecommendedActuator,
};
