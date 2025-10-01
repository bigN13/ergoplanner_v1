/**
 * Instrumentation System - Comprehensive Export
 * Primary measurement instruments for P&ID applications
 * ISA-5.1 compliant instrumentation symbols
 */

// ============================================================================
// FLOW INSTRUMENTS
// ============================================================================
export {
  OrificePlateNode,
  VenturiMeterNode,
  MagneticFlowmeterNode,
  VortexFlowmeterNode,
} from './FlowInstruments';

export type {
  OrificePlateNodeData,
  VenturiMeterNodeData,
  MagneticFlowmeterNodeData,
  VortexFlowmeterNodeData,
  OrificeType,
  TapType,
} from './FlowInstruments';

// ============================================================================
// TEMPERATURE INSTRUMENTS
// ============================================================================
export {
  ThermocoupleNode,
  RTDNode,
  ThermowellNode,
  BimetallicThermometerNode,
} from './TemperatureInstruments';

export type {
  ThermocoupleNodeData,
  RTDNodeData,
  ThermowellNodeData,
  BimetallicThermometerNodeData,
  ThermocoupleType,
  RTDType,
  ThermowellMounting,
  TemperatureScale,
} from './TemperatureInstruments';

// ============================================================================
// PRESSURE INSTRUMENTS
// ============================================================================
export {
  BourdonGaugeNode,
  PressureTransmitterNode,
  DifferentialPressureNode,
  DiaphragmSealNode,
} from './PressureInstruments';

export type {
  BourdonGaugeNodeData,
  PressureTransmitterNodeData,
  DifferentialPressureNodeData,
  DiaphragmSealNodeData,
  PressureGaugeType,
  PressureUnit,
  PressureMounting,
  ProcessConnection,
} from './PressureInstruments';

// ============================================================================
// LEVEL INSTRUMENTS
// ============================================================================
export {
  FloatLevelNode,
  DisplacerLevelNode,
  RadarLevelNode,
  UltrasonicLevelNode,
  CapacitanceLevelNode,
} from './LevelInstruments';

export type {
  FloatLevelNodeData,
  DisplacerLevelNodeData,
  RadarLevelNodeData,
  UltrasonicLevelNodeData,
  CapacitanceLevelNodeData,
  LevelTechnology,
  LevelMounting,
} from './LevelInstruments';

// ============================================================================
// ANALYTICAL INSTRUMENTS
// ============================================================================
export {
  pHMeterNode,
  ConductivityAnalyzerNode,
  OxygenAnalyzerNode,
  TurbidityMeterNode,
} from './AnalyticalInstruments';

export type {
  pHMeterNodeData,
  ConductivityAnalyzerNodeData,
  OxygenAnalyzerNodeData,
  TurbidityMeterNodeData,
  pHElectrodeType,
  ConductivityCellType,
  OxygenAnalyzerType,
  TurbidityMethod,
} from './AnalyticalInstruments';

// ============================================================================
// INSTRUMENT TYPE REGISTRY
// ============================================================================

/**
 * Complete instrument type registry for symbol library
 */
export const InstrumentTypes = {
  // Flow instruments
  ORIFICE_PLATE: 'orifice-plate',
  VENTURI_METER: 'venturi-meter',
  MAGNETIC_FLOWMETER: 'magnetic-flowmeter',
  VORTEX_FLOWMETER: 'vortex-flowmeter',

  // Temperature instruments
  THERMOCOUPLE: 'thermocouple',
  RTD: 'rtd',
  THERMOWELL: 'thermowell',
  BIMETALLIC_THERMOMETER: 'bimetallic-thermometer',

  // Pressure instruments
  BOURDON_GAUGE: 'bourdon-gauge',
  PRESSURE_TRANSMITTER: 'pressure-transmitter',
  DIFFERENTIAL_PRESSURE: 'differential-pressure',
  DIAPHRAGM_SEAL: 'diaphragm-seal',

  // Level instruments
  FLOAT_LEVEL: 'float-level',
  DISPLACER_LEVEL: 'displacer-level',
  RADAR_LEVEL: 'radar-level',
  ULTRASONIC_LEVEL: 'ultrasonic-level',
  CAPACITANCE_LEVEL: 'capacitance-level',

  // Analytical instruments
  PH_METER: 'ph-meter',
  CONDUCTIVITY_ANALYZER: 'conductivity-analyzer',
  OXYGEN_ANALYZER: 'oxygen-analyzer',
  TURBIDITY_METER: 'turbidity-meter',
} as const;

export type InstrumentTypeKey = typeof InstrumentTypes[keyof typeof InstrumentTypes];

/**
 * Instrument categories for organization
 */
export const InstrumentCategories = {
  FLOW: 'flow',
  TEMPERATURE: 'temperature',
  PRESSURE: 'pressure',
  LEVEL: 'level',
  ANALYTICAL: 'analytical',
} as const;

export type InstrumentCategory = typeof InstrumentCategories[keyof typeof InstrumentCategories];

/**
 * Instrument metadata for each type
 */
export interface InstrumentMetadata {
  id: InstrumentTypeKey;
  name: string;
  category: InstrumentCategory;
  description: string;
  standards: string[];
  applications: string[];
  outputSignals: string[];
}

/**
 * Complete instrument metadata registry
 */
export const InstrumentMetadataRegistry: Record<InstrumentTypeKey, InstrumentMetadata> = {
  // Flow instruments
  [InstrumentTypes.ORIFICE_PLATE]: {
    id: InstrumentTypes.ORIFICE_PLATE,
    name: 'Orifice Plate',
    category: InstrumentCategories.FLOW,
    description: 'Differential pressure flow measurement using orifice restriction',
    standards: ['ISO 5167', 'ASME MFC-3M', 'AGA-3'],
    applications: ['Gas flow', 'Liquid flow', 'Steam flow', 'Custody transfer'],
    outputSignals: ['4-20mA', 'HART', 'Fieldbus'],
  },
  [InstrumentTypes.VENTURI_METER]: {
    id: InstrumentTypes.VENTURI_METER,
    name: 'Venturi Meter',
    category: InstrumentCategories.FLOW,
    description: 'Low pressure drop flow measurement using venturi effect',
    standards: ['ISO 5167', 'ASME MFC-3M'],
    applications: ['High flow rate', 'Slurries', 'Low pressure drop required'],
    outputSignals: ['4-20mA', 'HART'],
  },
  [InstrumentTypes.MAGNETIC_FLOWMETER]: {
    id: InstrumentTypes.MAGNETIC_FLOWMETER,
    name: 'Magnetic Flowmeter',
    category: InstrumentCategories.FLOW,
    description: 'Electromagnetic induction flow measurement for conductive liquids',
    standards: ['ISO 9104', 'ASME MFC-5M'],
    applications: ['Water', 'Wastewater', 'Slurries', 'Acids/caustics'],
    outputSignals: ['4-20mA', 'HART', 'Profibus', 'Modbus'],
  },
  [InstrumentTypes.VORTEX_FLOWMETER]: {
    id: InstrumentTypes.VORTEX_FLOWMETER,
    name: 'Vortex Flowmeter',
    category: InstrumentCategories.FLOW,
    description: 'Vortex shedding frequency flow measurement',
    standards: ['ISO 10790', 'JIS Z 8766'],
    applications: ['Steam', 'Gas', 'Clean liquids', 'Multi-phase'],
    outputSignals: ['4-20mA', 'Pulse', 'HART', 'Fieldbus'],
  },

  // Temperature instruments
  [InstrumentTypes.THERMOCOUPLE]: {
    id: InstrumentTypes.THERMOCOUPLE,
    name: 'Thermocouple',
    category: InstrumentCategories.TEMPERATURE,
    description: 'Seebeck effect temperature measurement',
    standards: ['IEC 60584', 'ASTM E230'],
    applications: ['High temperature', 'Fast response', 'Wide range'],
    outputSignals: ['mV', '4-20mA (with transmitter)', 'HART'],
  },
  [InstrumentTypes.RTD]: {
    id: InstrumentTypes.RTD,
    name: 'RTD (Resistance Temperature Detector)',
    category: InstrumentCategories.TEMPERATURE,
    description: 'Resistance-based precision temperature measurement',
    standards: ['IEC 60751', 'ASTM E1137'],
    applications: ['Precision measurement', 'Process control', 'Laboratory'],
    outputSignals: ['Ω', '4-20mA (with transmitter)', 'HART', 'Fieldbus'],
  },
  [InstrumentTypes.THERMOWELL]: {
    id: InstrumentTypes.THERMOWELL,
    name: 'Thermowell',
    category: InstrumentCategories.TEMPERATURE,
    description: 'Protective sheath for temperature sensors',
    standards: ['ASME PTC 19.3', 'ISO 2847'],
    applications: ['High pressure', 'Corrosive service', 'Sensor protection'],
    outputSignals: ['N/A - Mechanical protection'],
  },
  [InstrumentTypes.BIMETALLIC_THERMOMETER]: {
    id: InstrumentTypes.BIMETALLIC_THERMOMETER,
    name: 'Bimetallic Thermometer',
    category: InstrumentCategories.TEMPERATURE,
    description: 'Mechanical dial thermometer using bimetallic strip',
    standards: ['ASME B40.200', 'EN 13190'],
    applications: ['Local indication', 'Simple temperature monitoring'],
    outputSignals: ['None - Local indication only'],
  },

  // Pressure instruments
  [InstrumentTypes.BOURDON_GAUGE]: {
    id: InstrumentTypes.BOURDON_GAUGE,
    name: 'Bourdon Tube Gauge',
    category: InstrumentCategories.PRESSURE,
    description: 'Mechanical pressure gauge using bourdon tube',
    standards: ['ASME B40.100', 'EN 837'],
    applications: ['Local pressure indication', 'General purpose'],
    outputSignals: ['None - Local indication only'],
  },
  [InstrumentTypes.PRESSURE_TRANSMITTER]: {
    id: InstrumentTypes.PRESSURE_TRANSMITTER,
    name: 'Pressure Transmitter',
    category: InstrumentCategories.PRESSURE,
    description: 'Electronic pressure measurement and transmission',
    standards: ['IEC 61326', 'ASME B40.100'],
    applications: ['Process control', 'Remote monitoring', 'Data acquisition'],
    outputSignals: ['4-20mA', 'HART', 'Profibus', 'Foundation Fieldbus'],
  },
  [InstrumentTypes.DIFFERENTIAL_PRESSURE]: {
    id: InstrumentTypes.DIFFERENTIAL_PRESSURE,
    name: 'Differential Pressure Transmitter',
    category: InstrumentCategories.PRESSURE,
    description: 'Measures pressure difference between two points',
    standards: ['IEC 61326', 'ISA-51.1'],
    applications: ['Flow measurement', 'Level measurement', 'Filter ΔP'],
    outputSignals: ['4-20mA', 'HART', 'Fieldbus'],
  },
  [InstrumentTypes.DIAPHRAGM_SEAL]: {
    id: InstrumentTypes.DIAPHRAGM_SEAL,
    name: 'Diaphragm Seal (Remote Seal)',
    category: InstrumentCategories.PRESSURE,
    description: 'Isolates process fluid from pressure sensor',
    standards: ['ASME B40.100', 'DIN 16086'],
    applications: ['Corrosive fluids', 'High temperature', 'Viscous media'],
    outputSignals: ['N/A - Used with transmitter'],
  },

  // Level instruments
  [InstrumentTypes.FLOAT_LEVEL]: {
    id: InstrumentTypes.FLOAT_LEVEL,
    name: 'Float Level Indicator',
    category: InstrumentCategories.LEVEL,
    description: 'Buoyancy-based level measurement',
    standards: ['API 12K', 'ISA-5.1'],
    applications: ['Tanks', 'Vessels', 'Interface measurement'],
    outputSignals: ['4-20mA', 'Switch contact', 'HART'],
  },
  [InstrumentTypes.DISPLACER_LEVEL]: {
    id: InstrumentTypes.DISPLACER_LEVEL,
    name: 'Displacer Level Transmitter',
    category: InstrumentCategories.LEVEL,
    description: 'Archimedes principle level measurement',
    standards: ['API 2350', 'ISA-5.1'],
    applications: ['Interface measurement', 'High pressure', 'Boiler drums'],
    outputSignals: ['4-20mA', 'HART'],
  },
  [InstrumentTypes.RADAR_LEVEL]: {
    id: InstrumentTypes.RADAR_LEVEL,
    name: 'Radar Level Transmitter',
    category: InstrumentCategories.LEVEL,
    description: 'Microwave radar time-of-flight level measurement',
    standards: ['IEC 61326', 'NAMUR NE21'],
    applications: ['Non-contact', 'Dusty environment', 'High temperature'],
    outputSignals: ['4-20mA', 'HART', 'Profibus', 'Modbus'],
  },
  [InstrumentTypes.ULTRASONIC_LEVEL]: {
    id: InstrumentTypes.ULTRASONIC_LEVEL,
    name: 'Ultrasonic Level Transmitter',
    category: InstrumentCategories.LEVEL,
    description: 'Acoustic time-of-flight level measurement',
    standards: ['IEC 61326', 'ISO 4787'],
    applications: ['Open vessels', 'Water treatment', 'Tanks'],
    outputSignals: ['4-20mA', 'HART', 'Modbus'],
  },
  [InstrumentTypes.CAPACITANCE_LEVEL]: {
    id: InstrumentTypes.CAPACITANCE_LEVEL,
    name: 'Capacitance Level Probe',
    category: InstrumentCategories.LEVEL,
    description: 'Dielectric constant-based level measurement',
    standards: ['IEC 61326', 'ISA-5.1'],
    applications: ['Solids', 'Liquids', 'Interface', 'Point level'],
    outputSignals: ['4-20mA', 'Switch contact', 'HART'],
  },

  // Analytical instruments
  [InstrumentTypes.PH_METER]: {
    id: InstrumentTypes.PH_METER,
    name: 'pH Meter',
    category: InstrumentCategories.ANALYTICAL,
    description: 'Electrochemical pH measurement (0-14 scale)',
    standards: ['ISO 10523', 'ASTM D1293'],
    applications: ['Water treatment', 'Chemical processing', 'Wastewater'],
    outputSignals: ['4-20mA', 'HART', 'Profibus', 'Modbus'],
  },
  [InstrumentTypes.CONDUCTIVITY_ANALYZER]: {
    id: InstrumentTypes.CONDUCTIVITY_ANALYZER,
    name: 'Conductivity Analyzer',
    category: InstrumentCategories.ANALYTICAL,
    description: 'Electrical conductivity measurement',
    standards: ['ISO 7888', 'ASTM D1125'],
    applications: ['Water purity', 'Concentration monitoring', 'Leakage detection'],
    outputSignals: ['4-20mA', 'HART', 'Profibus'],
  },
  [InstrumentTypes.OXYGEN_ANALYZER]: {
    id: InstrumentTypes.OXYGEN_ANALYZER,
    name: 'Oxygen Analyzer',
    category: InstrumentCategories.ANALYTICAL,
    description: 'Dissolved or trace oxygen measurement',
    standards: ['ISO 5814', 'ASTM D888'],
    applications: ['Boiler water', 'Fermentation', 'Combustion control'],
    outputSignals: ['4-20mA', 'HART', 'Profibus'],
  },
  [InstrumentTypes.TURBIDITY_METER]: {
    id: InstrumentTypes.TURBIDITY_METER,
    name: 'Turbidity Meter',
    category: InstrumentCategories.ANALYTICAL,
    description: 'Optical measurement of water clarity/suspended solids',
    standards: ['ISO 7027', 'EPA Method 180.1'],
    applications: ['Drinking water', 'Wastewater', 'Process water'],
    outputSignals: ['4-20mA', 'HART', 'Modbus'],
  },
};

/**
 * Get instruments by category
 */
export function getInstrumentsByCategory(category: InstrumentCategory): InstrumentMetadata[] {
  return Object.values(InstrumentMetadataRegistry).filter(
    (instrument) => instrument.category === category
  );
}

/**
 * Get instrument metadata by ID
 */
export function getInstrumentMetadata(id: InstrumentTypeKey): InstrumentMetadata | undefined {
  return InstrumentMetadataRegistry[id];
}

/**
 * Search instruments by application
 */
export function searchInstrumentsByApplication(application: string): InstrumentMetadata[] {
  const searchTerm = application.toLowerCase();
  return Object.values(InstrumentMetadataRegistry).filter((instrument) =>
    instrument.applications.some((app) => app.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get all instruments supporting a specific output signal
 */
export function getInstrumentsByOutputSignal(signal: string): InstrumentMetadata[] {
  const searchTerm = signal.toLowerCase();
  return Object.values(InstrumentMetadataRegistry).filter((instrument) =>
    instrument.outputSignals.some((sig) => sig.toLowerCase().includes(searchTerm))
  );
}

/**
 * Instrument presets for common configurations
 */
export const InstrumentPresets = {
  // Flow measurement presets
  STANDARD_ORIFICE_PLATE: {
    orificeType: 'concentric' as const,
    tapType: 'flange' as const,
    betaRatio: 0.5,
    showDifferentialPressure: true,
  },
  MAGMETER_WATER: {
    linerMaterial: 'PTFE',
    electrodeType: '316SS',
    showFlowDirection: true,
  },

  // Temperature measurement presets
  TYPE_K_THERMOCOUPLE: {
    thermocoupleType: 'K' as const,
    junctionType: 'grounded' as const,
    hasTransmitter: true,
  },
  PT100_3WIRE: {
    rtdType: 'Pt100' as const,
    wireConfiguration: '3-wire' as const,
    hasTransmitter: true,
  },

  // Pressure measurement presets
  GAUGE_PRESSURE_0_100PSI: {
    pressureRange: { min: 0, max: 100 },
    unit: 'psi' as const,
    mounting: 'direct' as const,
  },
  SMART_PRESSURE_TRANSMITTER: {
    sensorType: 'strain-gauge' as const,
    outputSignal: 'HART' as const,
    hasDiaphragmSeal: false,
  },

  // Level measurement presets
  RADAR_LEVEL_NON_CONTACT: {
    radarType: 'non-contact' as const,
    antennaType: 'horn' as const,
    frequency: '26GHz' as const,
  },
  GUIDED_WAVE_RADAR: {
    radarType: 'guided-wave' as const,
    probeLength: 5,
  },

  // Analytical measurement presets
  PROCESS_PH_METER: {
    electrodeType: 'combination' as const,
    hasTemperatureCompensation: true,
    temperatureSensor: 'PT100' as const,
  },
  DISSOLVED_OXYGEN_OPTICAL: {
    analyzerType: 'dissolved' as const,
    sensorType: 'optical' as const,
    measurement: 'mg/L' as const,
  },
} as const;

/**
 * Default export for convenience
 */
export default {
  InstrumentTypes,
  InstrumentCategories,
  InstrumentMetadataRegistry,
  InstrumentPresets,
  getInstrumentsByCategory,
  getInstrumentMetadata,
  searchInstrumentsByApplication,
  getInstrumentsByOutputSignal,
};
