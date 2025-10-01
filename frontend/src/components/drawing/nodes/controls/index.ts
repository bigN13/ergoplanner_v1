/**
 * Control Elements System - Comprehensive Export
 * ISA-5.1 compliant control and final control elements
 */

// ============================================================================
// TRANSMITTERS
// ============================================================================
export {
  TransmitterNode,
  FlowTransmitterNode,
  PressureTransmitterNode,
  TemperatureTransmitterNode,
  LevelTransmitterNode,
  AnalyticalTransmitterNode,
  MultivariableTransmitterNode,
} from './TransmitterComponents';

export type {
  TransmitterNodeData,
  CommunicationProtocol,
  TransmitterType,
  MeasurementVariable,
} from './TransmitterComponents';

// ============================================================================
// CONTROLLERS
// ============================================================================
export {
  PIDControllerNode,
  CascadeControllerNode,
  RatioControllerNode,
  SelectorControllerNode,
  SplitRangeControllerNode,
} from './ControllerComponents';

export type {
  ControllerNodeData,
  ControllerType,
  ControlAction,
  ControllerMode,
  TuningMethod,
} from './ControllerComponents';

// ============================================================================
// INDICATORS
// ============================================================================
export {
  LocalIndicatorNode,
  PanelIndicatorNode,
  DigitalIndicatorNode,
  AnalogGaugeIndicatorNode,
  RecorderIndicatorNode,
  TotalizerIndicatorNode,
} from './IndicatorComponents';

export type {
  IndicatorNodeData,
  IndicatorType,
  DisplayFormat,
  MeasurementUnits,
} from './IndicatorComponents';

// ============================================================================
// CONVERTERS & SIGNAL CONDITIONERS
// ============================================================================
export {
  IPConverterNode,
  PIConverterNode,
  EPConverterNode,
  SignalConditionerNode,
  SignalIsolatorNode,
  SignalRepeaterNode,
} from './ConverterComponents';

export type {
  ConverterNodeData,
  ConverterType,
  InputSignalType,
  OutputSignalType,
} from './ConverterComponents';

// ============================================================================
// VALVE POSITIONERS
// ============================================================================
export {
  PneumaticPositionerNode,
  ElectroPneumaticPositionerNode,
  DigitalPositionerNode,
  PositionerWithBoosterNode,
} from './PositionerComponents';

export type {
  PositionerNodeData,
  PositionerType,
  FeedbackMechanism,
  PositionerMode,
} from './PositionerComponents';

// ============================================================================
// CONTROL ELEMENT TYPE REGISTRY
// ============================================================================

/**
 * Complete control element type registry
 */
export const ControlElementTypes = {
  // Transmitters
  TRANSMITTER_GENERIC: 'transmitter-generic',
  TRANSMITTER_FLOW: 'transmitter-flow',
  TRANSMITTER_PRESSURE: 'transmitter-pressure',
  TRANSMITTER_TEMPERATURE: 'transmitter-temperature',
  TRANSMITTER_LEVEL: 'transmitter-level',
  TRANSMITTER_ANALYTICAL: 'transmitter-analytical',
  TRANSMITTER_MULTIVARIABLE: 'transmitter-multivariable',

  // Controllers
  CONTROLLER_PID: 'controller-pid',
  CONTROLLER_CASCADE: 'controller-cascade',
  CONTROLLER_RATIO: 'controller-ratio',
  CONTROLLER_SELECTOR: 'controller-selector',
  CONTROLLER_SPLIT_RANGE: 'controller-split-range',

  // Indicators
  INDICATOR_LOCAL: 'indicator-local',
  INDICATOR_PANEL: 'indicator-panel',
  INDICATOR_DIGITAL: 'indicator-digital',
  INDICATOR_ANALOG_GAUGE: 'indicator-analog-gauge',
  INDICATOR_RECORDER: 'indicator-recorder',
  INDICATOR_TOTALIZER: 'indicator-totalizer',

  // Converters
  CONVERTER_IP: 'converter-ip',
  CONVERTER_PI: 'converter-pi',
  CONVERTER_EP: 'converter-ep',
  SIGNAL_CONDITIONER: 'signal-conditioner',
  SIGNAL_ISOLATOR: 'signal-isolator',
  SIGNAL_REPEATER: 'signal-repeater',

  // Positioners
  POSITIONER_PNEUMATIC: 'positioner-pneumatic',
  POSITIONER_ELECTRO_PNEUMATIC: 'positioner-electro-pneumatic',
  POSITIONER_DIGITAL: 'positioner-digital',
  POSITIONER_WITH_BOOSTER: 'positioner-with-booster',
} as const;

export type ControlElementTypeKey = typeof ControlElementTypes[keyof typeof ControlElementTypes];

/**
 * Control element categories
 */
export const ControlElementCategories = {
  TRANSMITTER: 'transmitter',
  CONTROLLER: 'controller',
  INDICATOR: 'indicator',
  CONVERTER: 'converter',
  POSITIONER: 'positioner',
} as const;

export type ControlElementCategory = typeof ControlElementCategories[keyof typeof ControlElementCategories];

/**
 * Control element metadata
 */
export interface ControlElementMetadata {
  id: ControlElementTypeKey;
  name: string;
  category: ControlElementCategory;
  description: string;
  standards: string[];
  applications: string[];
  signals: string[];
}

/**
 * Complete control element metadata registry
 */
export const ControlElementMetadataRegistry: Record<ControlElementTypeKey, ControlElementMetadata> = {
  // Transmitters
  [ControlElementTypes.TRANSMITTER_GENERIC]: {
    id: ControlElementTypes.TRANSMITTER_GENERIC,
    name: 'Generic Transmitter',
    category: ControlElementCategories.TRANSMITTER,
    description: 'Square transmitter symbol with protocol indication',
    standards: ['ISA-5.1', 'IEC-61326'],
    applications: ['Process measurement', 'Signal transmission'],
    signals: ['4-20mA', 'HART', 'Fieldbus'],
  },
  [ControlElementTypes.TRANSMITTER_FLOW]: {
    id: ControlElementTypes.TRANSMITTER_FLOW,
    name: 'Flow Transmitter (FT)',
    category: ControlElementCategories.TRANSMITTER,
    description: 'Flow measurement transmitter with tag prefix FT',
    standards: ['ISA-5.1', 'ISO-5167'],
    applications: ['Flow measurement', 'Flow control'],
    signals: ['4-20mA', 'HART', 'Pulse'],
  },
  [ControlElementTypes.TRANSMITTER_PRESSURE]: {
    id: ControlElementTypes.TRANSMITTER_PRESSURE,
    name: 'Pressure Transmitter (PT)',
    category: ControlElementCategories.TRANSMITTER,
    description: 'Pressure measurement transmitter with tag prefix PT',
    standards: ['ISA-5.1', 'IEC-61326'],
    applications: ['Pressure measurement', 'Pressure control'],
    signals: ['4-20mA', 'HART', 'Profibus'],
  },
  [ControlElementTypes.TRANSMITTER_TEMPERATURE]: {
    id: ControlElementTypes.TRANSMITTER_TEMPERATURE,
    name: 'Temperature Transmitter (TT)',
    category: ControlElementCategories.TRANSMITTER,
    description: 'Temperature measurement transmitter with tag prefix TT',
    standards: ['ISA-5.1', 'IEC-60751'],
    applications: ['Temperature measurement', 'Temperature control'],
    signals: ['4-20mA', 'HART'],
  },
  [ControlElementTypes.TRANSMITTER_LEVEL]: {
    id: ControlElementTypes.TRANSMITTER_LEVEL,
    name: 'Level Transmitter (LT)',
    category: ControlElementCategories.TRANSMITTER,
    description: 'Level measurement transmitter with tag prefix LT',
    standards: ['ISA-5.1', 'API-2350'],
    applications: ['Level measurement', 'Tank level control'],
    signals: ['4-20mA', 'HART', 'WirelessHART'],
  },
  [ControlElementTypes.TRANSMITTER_ANALYTICAL]: {
    id: ControlElementTypes.TRANSMITTER_ANALYTICAL,
    name: 'Analytical Transmitter (AT)',
    category: ControlElementCategories.TRANSMITTER,
    description: 'Analytical measurement transmitter with tag prefix AT',
    standards: ['ISA-5.1', 'ISO-10523'],
    applications: ['Water quality', 'Chemical analysis'],
    signals: ['4-20mA', 'HART', 'Modbus'],
  },
  [ControlElementTypes.TRANSMITTER_MULTIVARIABLE]: {
    id: ControlElementTypes.TRANSMITTER_MULTIVARIABLE,
    name: 'Multivariable Transmitter',
    category: ControlElementCategories.TRANSMITTER,
    description: 'Transmitter measuring multiple variables simultaneously',
    standards: ['ISA-5.1', 'ISO-5167'],
    applications: ['Mass flow', 'Density compensation'],
    signals: ['Foundation Fieldbus', 'Profibus PA'],
  },

  // Controllers
  [ControlElementTypes.CONTROLLER_PID]: {
    id: ControlElementTypes.CONTROLLER_PID,
    name: 'PID Controller',
    category: ControlElementCategories.CONTROLLER,
    description: 'Proportional-Integral-Derivative controller with circular symbol',
    standards: ['ISA-5.1', 'IEC-61131'],
    applications: ['Process control', 'Temperature control', 'Flow control'],
    signals: ['4-20mA', 'HART', 'Fieldbus'],
  },
  [ControlElementTypes.CONTROLLER_CASCADE]: {
    id: ControlElementTypes.CONTROLLER_CASCADE,
    name: 'Cascade Controller',
    category: ControlElementCategories.CONTROLLER,
    description: 'Primary and secondary controller in cascade arrangement',
    standards: ['ISA-5.1'],
    applications: ['Temperature cascade', 'Flow cascade', 'Pressure cascade'],
    signals: ['4-20mA', 'HART'],
  },
  [ControlElementTypes.CONTROLLER_RATIO]: {
    id: ControlElementTypes.CONTROLLER_RATIO,
    name: 'Ratio Controller',
    category: ControlElementCategories.CONTROLLER,
    description: 'Maintains ratio between two variables',
    standards: ['ISA-5.1'],
    applications: ['Blending', 'Mixing', 'Fuel/air ratio'],
    signals: ['4-20mA', 'HART'],
  },
  [ControlElementTypes.CONTROLLER_SELECTOR]: {
    id: ControlElementTypes.CONTROLLER_SELECTOR,
    name: 'Selector Controller',
    category: ControlElementCategories.CONTROLLER,
    description: 'Selects high, low, middle, or average of multiple inputs',
    standards: ['ISA-5.1'],
    applications: ['Override control', 'Constraint control', 'Redundancy'],
    signals: ['4-20mA', 'HART'],
  },
  [ControlElementTypes.CONTROLLER_SPLIT_RANGE]: {
    id: ControlElementTypes.CONTROLLER_SPLIT_RANGE,
    name: 'Split-Range Controller',
    category: ControlElementCategories.CONTROLLER,
    description: 'Single input controlling multiple outputs at different ranges',
    standards: ['ISA-5.1'],
    applications: ['Heating/cooling', 'Multiple valve control'],
    signals: ['4-20mA', 'HART'],
  },

  // Indicators
  [ControlElementTypes.INDICATOR_LOCAL]: {
    id: ControlElementTypes.INDICATOR_LOCAL,
    name: 'Local Indicator',
    category: ControlElementCategories.INDICATOR,
    description: 'Field-mounted indicator with hexagon symbol',
    standards: ['ISA-5.1', 'ASME-B40.100'],
    applications: ['Local indication', 'Field verification'],
    signals: ['None - Local only'],
  },
  [ControlElementTypes.INDICATOR_PANEL]: {
    id: ControlElementTypes.INDICATOR_PANEL,
    name: 'Panel Indicator',
    category: ControlElementCategories.INDICATOR,
    description: 'Control room panel-mounted indicator',
    standards: ['ISA-5.1'],
    applications: ['Control room indication', 'Operator interface'],
    signals: ['4-20mA', 'HART'],
  },
  [ControlElementTypes.INDICATOR_DIGITAL]: {
    id: ControlElementTypes.INDICATOR_DIGITAL,
    name: 'Digital Display',
    category: ControlElementCategories.INDICATOR,
    description: 'Digital numeric display with LED/LCD',
    standards: ['ISA-5.1'],
    applications: ['Precise indication', 'Process monitoring'],
    signals: ['4-20mA', 'HART', 'Modbus'],
  },
  [ControlElementTypes.INDICATOR_ANALOG_GAUGE]: {
    id: ControlElementTypes.INDICATOR_ANALOG_GAUGE,
    name: 'Analog Gauge',
    category: ControlElementCategories.INDICATOR,
    description: 'Analog dial gauge with needle',
    standards: ['ISA-5.1', 'ASME-B40.100'],
    applications: ['Visual indication', 'Trend observation'],
    signals: ['4-20mA', 'Pneumatic'],
  },
  [ControlElementTypes.INDICATOR_RECORDER]: {
    id: ControlElementTypes.INDICATOR_RECORDER,
    name: 'Recorder',
    category: ControlElementCategories.INDICATOR,
    description: 'Chart recorder for trend recording',
    standards: ['ISA-5.1'],
    applications: ['Trend recording', 'Compliance documentation'],
    signals: ['4-20mA', 'Multiple inputs'],
  },
  [ControlElementTypes.INDICATOR_TOTALIZER]: {
    id: ControlElementTypes.INDICATOR_TOTALIZER,
    name: 'Totalizer',
    category: ControlElementCategories.INDICATOR,
    description: 'Integrating/totalizing indicator',
    standards: ['ISA-5.1'],
    applications: ['Flow totalizing', 'Energy metering', 'Batch counting'],
    signals: ['Pulse', '4-20mA'],
  },

  // Converters
  [ControlElementTypes.CONVERTER_IP]: {
    id: ControlElementTypes.CONVERTER_IP,
    name: 'I/P Converter',
    category: ControlElementCategories.CONVERTER,
    description: 'Current to pneumatic signal converter',
    standards: ['ISA-5.1', 'NEMA-250'],
    applications: ['Valve control', 'Pneumatic actuators'],
    signals: ['4-20mA to 3-15psi', '4-20mA to 6-30psi'],
  },
  [ControlElementTypes.CONVERTER_PI]: {
    id: ControlElementTypes.CONVERTER_PI,
    name: 'P/I Converter',
    category: ControlElementCategories.CONVERTER,
    description: 'Pneumatic to current signal converter',
    standards: ['ISA-5.1', 'NEMA-250'],
    applications: ['Signal transmission', 'DCS integration'],
    signals: ['3-15psi to 4-20mA', '6-30psi to 4-20mA'],
  },
  [ControlElementTypes.CONVERTER_EP]: {
    id: ControlElementTypes.CONVERTER_EP,
    name: 'E/P Converter',
    category: ControlElementCategories.CONVERTER,
    description: 'Voltage to pneumatic signal converter',
    standards: ['ISA-5.1'],
    applications: ['Valve control', 'Pneumatic actuators'],
    signals: ['0-10V to 3-15psi'],
  },
  [ControlElementTypes.SIGNAL_CONDITIONER]: {
    id: ControlElementTypes.SIGNAL_CONDITIONER,
    name: 'Signal Conditioner',
    category: ControlElementCategories.CONVERTER,
    description: 'Signal amplification, filtering, and conditioning',
    standards: ['ISA-5.1', 'IEC-61326'],
    applications: ['Signal amplification', 'Noise filtering', 'Linearization'],
    signals: ['Various analog signals'],
  },
  [ControlElementTypes.SIGNAL_ISOLATOR]: {
    id: ControlElementTypes.SIGNAL_ISOLATOR,
    name: 'Signal Isolator',
    category: ControlElementCategories.CONVERTER,
    description: 'Galvanic isolation between input and output',
    standards: ['ISA-5.1', 'IEC-61326'],
    applications: ['Ground loop elimination', 'Protection', 'Safety'],
    signals: ['4-20mA', '0-10V'],
  },
  [ControlElementTypes.SIGNAL_REPEATER]: {
    id: ControlElementTypes.SIGNAL_REPEATER,
    name: 'Signal Repeater',
    category: ControlElementCategories.CONVERTER,
    description: 'Signal amplification for long distances',
    standards: ['ISA-5.1'],
    applications: ['Long cable runs', 'Multiple loads', 'Signal distribution'],
    signals: ['4-20mA', '0-10V'],
  },

  // Positioners
  [ControlElementTypes.POSITIONER_PNEUMATIC]: {
    id: ControlElementTypes.POSITIONER_PNEUMATIC,
    name: 'Pneumatic Positioner',
    category: ControlElementCategories.POSITIONER,
    description: 'Pneumatic valve positioner with mechanical feedback',
    standards: ['ISA-5.1', 'IEC-60534'],
    applications: ['Valve positioning', 'Process control'],
    signals: ['3-15psi input/output'],
  },
  [ControlElementTypes.POSITIONER_ELECTRO_PNEUMATIC]: {
    id: ControlElementTypes.POSITIONER_ELECTRO_PNEUMATIC,
    name: 'Electro-Pneumatic Positioner',
    category: ControlElementCategories.POSITIONER,
    description: 'Electric input with pneumatic output positioner',
    standards: ['ISA-5.1', 'IEC-60534'],
    applications: ['Valve positioning', 'DCS integration'],
    signals: ['4-20mA input', '3-15psi output'],
  },
  [ControlElementTypes.POSITIONER_DIGITAL]: {
    id: ControlElementTypes.POSITIONER_DIGITAL,
    name: 'Digital Smart Positioner',
    category: ControlElementCategories.POSITIONER,
    description: 'Digital communication positioner with diagnostics',
    standards: ['ISA-5.1', 'IEC-60534', 'NAMUR-NE107'],
    applications: ['Precision control', 'Predictive maintenance', 'Diagnostics'],
    signals: ['HART', 'Foundation Fieldbus', 'Profibus PA'],
  },
  [ControlElementTypes.POSITIONER_WITH_BOOSTER]: {
    id: ControlElementTypes.POSITIONER_WITH_BOOSTER,
    name: 'Positioner with Booster',
    category: ControlElementCategories.POSITIONER,
    description: 'Positioner with air volume booster for large actuators',
    standards: ['ISA-5.1', 'IEC-60534'],
    applications: ['Large valves', 'Fast stroking', 'High flow requirements'],
    signals: ['4-20mA input', 'Boosted pneumatic output'],
  },
};

/**
 * Get control elements by category
 */
export function getControlElementsByCategory(category: ControlElementCategory): ControlElementMetadata[] {
  return Object.values(ControlElementMetadataRegistry).filter(
    (element) => element.category === category
  );
}

/**
 * Get control element metadata by ID
 */
export function getControlElementMetadata(id: ControlElementTypeKey): ControlElementMetadata | undefined {
  return ControlElementMetadataRegistry[id];
}

/**
 * Search control elements by application
 */
export function searchControlElementsByApplication(application: string): ControlElementMetadata[] {
  const searchTerm = application.toLowerCase();
  return Object.values(ControlElementMetadataRegistry).filter((element) =>
    element.applications.some((app) => app.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get control elements by signal type
 */
export function getControlElementsBySignal(signal: string): ControlElementMetadata[] {
  const searchTerm = signal.toLowerCase();
  return Object.values(ControlElementMetadataRegistry).filter((element) =>
    element.signals.some((sig) => sig.toLowerCase().includes(searchTerm))
  );
}

/**
 * Control element presets for common configurations
 */
export const ControlElementPresets = {
  // Transmitter presets
  SMART_TRANSMITTER_HART: {
    transmitterType: 'smart' as const,
    protocol: 'HART' as const,
    hasDiagnostics: true,
    isPowered: true,
  },
  WIRELESS_TRANSMITTER: {
    transmitterType: 'wireless' as const,
    protocol: 'WirelessHART' as const,
    hasDiagnostics: true,
  },

  // Controller presets
  PID_REVERSE_ACTION: {
    controllerType: 'PID' as const,
    controlAction: 'reverse' as const,
    mode: 'auto' as const,
    hasAutoTune: true,
    hasBumpless: true,
  },
  PID_DIRECT_ACTION: {
    controllerType: 'PID' as const,
    controlAction: 'direct' as const,
    mode: 'auto' as const,
    hasAutoTune: true,
    hasBumpless: true,
  },

  // Indicator presets
  LOCAL_HEXAGON_INDICATOR: {
    indicatorType: 'local' as const,
    hasAlarm: false,
  },
  PANEL_SQUARE_INDICATOR: {
    indicatorType: 'panel' as const,
    displayFormat: 'numeric' as const,
  },
  DIGITAL_DISPLAY_4DIGIT: {
    indicatorType: 'digital' as const,
    digits: 4,
    hasBacklight: true,
  },

  // Converter presets
  IP_CONVERTER_4_20MA_TO_3_15PSI: {
    converterType: 'I/P' as const,
    inputSignal: '4-20mA' as const,
    outputSignal: '3-15psi' as const,
  },
  SIGNAL_ISOLATOR_4_20MA: {
    converterType: 'isolator' as const,
    inputSignal: '4-20mA' as const,
    outputSignal: '4-20mA' as const,
    hasIsolation: true,
  },

  // Positioner presets
  DIGITAL_POSITIONER_HART: {
    positionerType: 'digital' as const,
    protocol: 'HART' as const,
    hasDiagnostics: true,
    positionAccuracy: 0.5,
  },
  ELECTRO_PNEUMATIC_POSITIONER: {
    positionerType: 'electro-pneumatic' as const,
    inputSignal: '4-20mA',
    outputPressure: { min: 3, max: 15 },
  },
} as const;

/**
 * Default export for convenience
 */
export default {
  ControlElementTypes,
  ControlElementCategories,
  ControlElementMetadataRegistry,
  ControlElementPresets,
  getControlElementsByCategory,
  getControlElementMetadata,
  searchControlElementsByApplication,
  getControlElementsBySignal,
};
