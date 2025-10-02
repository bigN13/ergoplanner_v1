/**
 * ISA-5.1-2022 Instrumentation Symbol Library
 * MVP Implementation with 15 core symbols and expansion path to 85+ symbols
 */

export {
  InstrumentationSymbolBase,
  InstrumentationSymbolFactory,
  InstrumentFunction,
  BubbleShape,
  SignalLineType,
  PrimaryElementType,
  INSTRUMENTATION_BASE_CONFIG,
  type IInstrumentationMetadata,
  type IInstrumentationSymbolData,
} from './InstrumentationSymbolBase';

/**
 * ISA-5.1 function categories
 */
export const INSTRUMENT_CATEGORIES = {
  TRANSMITTERS: 'transmitters',
  CONTROLLERS: 'controllers',
  INDICATORS: 'indicators',
  RECORDERS: 'recorders',
  PRIMARY_ELEMENTS: 'primary-elements',
  FINAL_ELEMENTS: 'final-elements',
} as const;

/**
 * MVP Implementation - 15 core instrument types
 */
export const MVP_INSTRUMENT_TYPES = [
  // Transmitters (5)
  'flow-transmitter',
  'pressure-transmitter',
  'level-transmitter',
  'temperature-transmitter',
  'analytical-transmitter',
  // Controllers (4)
  'flow-indicator-controller',
  'pressure-indicator-controller',
  'level-indicator-controller',
  'temperature-indicator-controller',
  // Indicators (1)
  'indicator',
  // Primary Elements (5)
  'orifice-plate',
  'thermowell',
  'pressure-tap',
  'level-probe',
  'analytical-probe',
] as const;

/**
 * Instrument symbol counts
 */
export const INSTRUMENT_SYMBOL_COUNTS = {
  mvp: 15,
  target: 85,
} as const;

/**
 * Future expansion: Additional instrument types to be implemented
 *
 * TRANSMITTERS (additional 10+ types):
 * - Differential pressure transmitters (DPT)
 * - Multivariable transmitters (MVT)
 * - Wireless transmitters (WT)
 * - Smart transmitters with HART protocol
 * - Density transmitters
 * - Conductivity transmitters
 * - pH transmitters
 * - ORP transmitters
 * - Turbidity transmitters
 * - Dissolved oxygen transmitters
 *
 * CONTROLLERS (additional 15+ types):
 * - Programmable logic controllers (PLC)
 * - Distributed control systems (DCS)
 * - Ratio controllers
 * - Cascade controllers
 * - Split range controllers
 * - Feedforward controllers
 * - PID controllers with auto-tuning
 * - Fuzzy logic controllers
 * - Model predictive controllers
 * - On/off controllers
 * - Multi-loop controllers
 * - Batch controllers
 * - Sequence controllers
 * - Emergency shutdown systems (ESD)
 * - Safety instrumented systems (SIS)
 *
 * INDICATORS (additional 10+ types):
 * - Digital indicators
 * - Analog indicators
 * - Multi-point indicators
 * - Alarm indicators
 * - Status indicators
 * - Position indicators
 * - Trend indicators
 * - Bar graph indicators
 * - LED indicators
 * - LCD indicators
 *
 * RECORDERS (additional 10+ types):
 * - Chart recorders (circular, strip)
 * - Paperless recorders
 * - Data loggers
 * - Event recorders
 * - Multi-pen recorders
 * - Digital recorders
 * - Video recorders
 * - Batch recorders
 * - Alarm recorders
 * - Historian systems
 *
 * PRIMARY ELEMENTS (additional 35+ types):
 * - Flow elements (20+ types):
 *   - Venturi meters
 *   - Flow nozzles
 *   - Pitot tubes
 *   - Rotameters
 *   - Turbine meters
 *   - Magnetic flow meters
 *   - Ultrasonic flow meters
 *   - Coriolis flow meters
 *   - Vortex flow meters
 *   - Positive displacement meters
 *   - Thermal mass flow meters
 *   - Target meters
 *   - Elbow meters
 *   - Wedge meters
 *   - V-cone meters
 *   - Averaging pitot tubes
 *   - Open channel flow meters
 *   - Weirs
 *   - Flumes
 *   - Venturi channels
 *
 * - Temperature elements (8+ types):
 *   - RTD sensors (Pt100, Pt1000)
 *   - Thermocouples (J, K, T, E, R, S, B, N)
 *   - Thermistors
 *   - Bimetallic thermometers
 *   - Filled-system thermometers
 *   - Infrared sensors
 *   - Radiation pyrometers
 *   - Fiber optic sensors
 *
 * - Pressure elements (7+ types):
 *   - Bourdon tube gauges
 *   - Diaphragm seals
 *   - Bellows elements
 *   - Capsule elements
 *   - Strain gauge sensors
 *   - Piezoelectric sensors
 *   - Capacitive sensors
 *
 * FINAL CONTROL ELEMENTS (additional 15+ types):
 * - Control valves (various types)
 * - Variable speed drives (VFD)
 * - Dampers
 * - Louvers
 * - Positioners
 * - I/P converters
 * - P/I converters
 * - Current-to-pneumatic converters
 * - Solenoid valves
 * - Relay valves
 * - Volume boosters
 * - Quick exhaust valves
 * - Lock-up valves
 * - Filter regulators
 * - Pressure regulators
 *
 * ANALYTICAL INSTRUMENTS (additional 20+ types):
 * - Gas chromatographs
 * - Mass spectrometers
 * - Infrared analyzers
 * - Oxygen analyzers
 * - Combustible gas detectors
 * - Toxic gas detectors
 * - Moisture analyzers
 * - Dew point analyzers
 * - TOC analyzers
 * - COD analyzers
 * - BOD analyzers
 * - Chlorine analyzers
 * - Ammonia analyzers
 * - Nitrate analyzers
 * - Phosphate analyzers
 * - Silica analyzers
 * - Turbidity analyzers
 * - Color analyzers
 * - Suspended solids analyzers
 * - Oil-in-water analyzers
 *
 * SIGNAL PROCESSING (additional 10+ types):
 * - Computing relays
 * - Totalizers
 * - Integrators
 * - Differentiators
 * - Square root extractors
 * - Signal conditioners
 * - Isolators
 * - Converters
 * - Splitters
 * - Multiplexers
 *
 * Total target: 85+ instrument symbols
 */

/**
 * ISA-5.1 tag number format: [First Letter][Succeeding Letters]-[Loop Number]
 *
 * First Letter - Measured or Initiating Variable:
 * - A: Analysis
 * - B: Burner, Combustion
 * - C: Conductivity
 * - D: Density or Specific Gravity
 * - E: Voltage
 * - F: Flow
 * - G: Gauging (dimensional)
 * - H: Hand (manually initiated)
 * - I: Current (electric)
 * - J: Power
 * - K: Time or Time Schedule
 * - L: Level
 * - M: Moisture or Humidity
 * - N: User's choice
 * - O: User's choice
 * - P: Pressure or Vacuum
 * - Q: Quantity or Event
 * - R: Radiation
 * - S: Speed or Frequency
 * - T: Temperature
 * - U: Multivariable
 * - V: Vibration or Mechanical Analysis
 * - W: Weight or Force
 * - X: Unclassified
 * - Y: Event, State, or Presence
 * - Z: Position or Dimension
 *
 * Succeeding Letters - Readout or Passive Function:
 * - A: Alarm
 * - C: Controller
 * - E: Sensor (primary element)
 * - G: Glass, Gauge, or Viewing Device
 * - I: Indicator
 * - K: Time Rate of Change
 * - L: Light (pilot)
 * - O: Orifice, Restriction
 * - P: Point (test connection)
 * - R: Recorder
 * - S: Switch
 * - T: Transmitter
 * - U: Multivariable
 * - V: Valve, Damper, Louver
 * - W: Well
 * - X: Unclassified
 * - Y: Relay, Compute, Convert
 * - Z: Driver, Actuator, Unclassified Final Control Element
 *
 * Examples:
 * - FT-101: Flow Transmitter, loop 101
 * - PIC-202: Pressure Indicator Controller, loop 202
 * - LT-303: Level Transmitter, loop 303
 * - TIC-404: Temperature Indicator Controller, loop 404
 * - FE-101A: Flow Element (orifice), loop 101A
 * - PSV-505: Pressure Safety Valve, loop 505
 */

/**
 * Standard instrument ranges by variable type
 */
export const STANDARD_RANGES = {
  FLOW: [
    { min: 0, max: 100, units: 'm³/h' },
    { min: 0, max: 1000, units: 'm³/h' },
    { min: 0, max: 10000, units: 'm³/h' },
    { min: 0, max: 100, units: 'kg/h' },
    { min: 0, max: 1000, units: 'kg/h' },
    { min: 0, max: 100, units: 'L/min' },
  ],
  PRESSURE: [
    { min: 0, max: 10, units: 'bar' },
    { min: 0, max: 25, units: 'bar' },
    { min: 0, max: 100, units: 'bar' },
    { min: 0, max: 400, units: 'bar' },
    { min: -1, max: 1, units: 'bar' },
    { min: 0, max: 10, units: 'kPa' },
  ],
  LEVEL: [
    { min: 0, max: 100, units: '%' },
    { min: 0, max: 5, units: 'm' },
    { min: 0, max: 10, units: 'm' },
    { min: 0, max: 20, units: 'm' },
    { min: 0, max: 1000, units: 'mm' },
  ],
  TEMPERATURE: [
    { min: -50, max: 150, units: '°C' },
    { min: 0, max: 100, units: '°C' },
    { min: 0, max: 200, units: '°C' },
    { min: 0, max: 500, units: '°C' },
    { min: 0, max: 1000, units: '°C' },
  ],
  ANALYTICAL: [
    { min: 0, max: 14, units: 'pH' },
    { min: 0, max: 100, units: 'ppm' },
    { min: 0, max: 100, units: '%' },
    { min: 0, max: 20, units: 'mg/L' },
    { min: 0, max: 1000, units: 'µS/cm' },
  ],
} as const;

/**
 * Get instrument symbol by type
 */
export function getInstrumentSymbol(
  type: typeof MVP_INSTRUMENT_TYPES[number],
  parameters: Parameters<typeof InstrumentationSymbolFactory.createFlowTransmitter>[0]
) {
  switch (type) {
    case 'flow-transmitter':
      return InstrumentationSymbolFactory.createFlowTransmitter(parameters);
    case 'pressure-transmitter':
      return InstrumentationSymbolFactory.createPressureTransmitter(parameters);
    case 'level-transmitter':
      return InstrumentationSymbolFactory.createLevelTransmitter(parameters);
    case 'temperature-transmitter':
      return InstrumentationSymbolFactory.createTemperatureTransmitter(parameters);
    case 'analytical-transmitter':
      return InstrumentationSymbolFactory.createAnalyticalTransmitter(parameters);
    case 'flow-indicator-controller':
      return InstrumentationSymbolFactory.createFlowIndicatorController(parameters);
    case 'pressure-indicator-controller':
      return InstrumentationSymbolFactory.createPressureIndicatorController(parameters);
    case 'level-indicator-controller':
      return InstrumentationSymbolFactory.createLevelIndicatorController(parameters);
    case 'temperature-indicator-controller':
      return InstrumentationSymbolFactory.createTemperatureIndicatorController(parameters);
    default:
      return InstrumentationSymbolFactory.createIndicator({
        ...parameters,
        function: InstrumentFunction.INDICATOR,
      });
  }
}

/**
 * Generate ISA-5.1 tag number
 */
export function generateTagNumber(
  measuredVariable: string,
  functionCode: string,
  loopNumber: number | string
): string {
  return `${measuredVariable}${functionCode}-${loopNumber}`;
}

/**
 * Parse ISA-5.1 tag number
 */
export function parseTagNumber(tagNumber: string): {
  measuredVariable: string;
  functionCode: string;
  loopNumber: string;
} | null {
  const match = tagNumber.match(/^([A-Z])([A-Z]+)-(.+)$/);
  if (!match) return null;

  return {
    measuredVariable: match[1],
    functionCode: match[2],
    loopNumber: match[3],
  };
}
