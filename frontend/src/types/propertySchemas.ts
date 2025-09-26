import { z } from "zod";

/**
 * Unit system for measurements
 */
export type UnitSystem = "metric" | "imperial";

/**
 * Base property schema shared by all node types
 */
export const BasePropertySchema = z.object({
  // Basic Properties
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  tagNumber: z.string().optional(),
  service: z.string().optional(),

  // Position
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),

  // Layer
  layer: z.string().optional(),

  // Appearance
  rotation: z.number().min(0).max(360).optional(),
  isLocked: z.boolean().optional(),
});

/**
 * Dimensional properties
 */
export const DimensionalPropertiesSchema = z.object({
  diameter: z.string().optional(),
  length: z.string().optional(),
  height: z.string().optional(),
  width: z.string().optional(),
  thickness: z.string().optional(),
  weight: z.string().optional(),
});

/**
 * Process properties
 */
export const ProcessPropertiesSchema = z.object({
  material: z.string().optional(),
  temperature: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  density: z.string().optional(),
  viscosity: z.string().optional(),
  ph: z.string().optional(),
});

/**
 * Electrical properties
 */
export const ElectricalPropertiesSchema = z.object({
  voltage: z.string().optional(),
  current: z.string().optional(),
  power: z.string().optional(),
  frequency: z.string().optional(),
  phases: z.enum(["1", "3"]).optional(),
  connectionType: z.string().optional(),
});

/**
 * Instrumentation properties
 */
export const InstrumentationPropertiesSchema = z.object({
  range: z.string().optional(),
  unit: z.string().optional(),
  accuracy: z.string().optional(),
  calibrationDate: z.string().optional(),
  alarmLimits: z
    .object({
      high: z.string().optional(),
      low: z.string().optional(),
      highHigh: z.string().optional(),
      lowLow: z.string().optional(),
    })
    .optional(),
});

/**
 * Pump-specific properties
 */
export const PumpPropertiesSchema = BasePropertySchema.extend({
  // Pump-specific properties
  pumpType: z
    .enum(["centrifugal", "positive_displacement", "reciprocating", "gear", "screw"])
    .default("centrifugal"),
  pumpFlowRate: z.string().optional(),
  head: z.string().optional(),
  efficiency: z.string().optional(),
  npshRequired: z.string().optional(),
  impellerDiameter: z.string().optional(),
  speed: z.string().optional(),

  // Electrical properties for motor
  voltage: z.string().optional(),
  current: z.string().optional(),
  pumpPower: z.string().optional(),
  frequency: z.string().optional(),
  phases: z.enum(["1", "3"]).optional(),
  connectionType: z.string().optional(),

  // Process properties
  material: z.string().optional(),
  temperature: z.string().optional(),
  pressure: z.string().optional(),
  density: z.string().optional(),
  viscosity: z.string().optional(),
  ph: z.string().optional(),

  // Dimensional properties
  diameter: z.string().optional(),
  length: z.string().optional(),
  height: z.string().optional(),
  width: z.string().optional(),
  thickness: z.string().optional(),
  weight: z.string().optional(),
});

/**
 * Valve-specific properties
 */
export const ValvePropertiesSchema = BasePropertySchema.extend({
  // Valve-specific properties
  valveType: z
    .enum(["gate", "globe", "ball", "butterfly", "check", "relief", "control"])
    .default("gate"),
  state: z.enum(["open", "closed", "partial", "locked_open", "locked_closed"]).default("closed"),
  size: z.string().optional(),
  pressureRating: z.string().optional(),
  endConnections: z.string().optional(),
  seatMaterial: z.string().optional(),
  bodyMaterial: z.string().optional(),

  // Control valve specific
  actuatorType: z.enum(["manual", "pneumatic", "electric", "hydraulic"]).optional(),
  failPosition: z.enum(["open", "closed", "last"]).optional(),
  controlSignal: z.string().optional(),
  cvValue: z.string().optional(),

  // Process properties
  material: z.string().optional(),
  temperature: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  density: z.string().optional(),
  viscosity: z.string().optional(),
  ph: z.string().optional(),

  // Dimensional properties
  diameter: z.string().optional(),
  length: z.string().optional(),
  height: z.string().optional(),
  width: z.string().optional(),
  thickness: z.string().optional(),
  weight: z.string().optional(),
});

/**
 * Tank-specific properties
 */
export const TankPropertiesSchema = BasePropertySchema.extend({
  // Tank-specific properties
  tankType: z
    .enum(["storage", "pressure", "mixing", "buffer", "reactor", "separator"])
    .default("storage"),
  capacity: z.string().optional(),
  level: z.number().min(0).max(100).default(50),
  maxLevel: z.string().optional(),
  minLevel: z.string().optional(),
  shape: z.enum(["cylindrical", "rectangular", "spherical", "conical"]).optional(),
  orientation: z.enum(["vertical", "horizontal"]).optional(),

  // Pressure vessel properties
  designPressure: z.string().optional(),
  designTemperature: z.string().optional(),
  hydrotestPressure: z.string().optional(),

  // Construction
  shellMaterial: z.string().optional(),
  liningMaterial: z.string().optional(),
  insulation: z.string().optional(),

  // Process properties
  material: z.string().optional(),
  temperature: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  density: z.string().optional(),
  viscosity: z.string().optional(),
  ph: z.string().optional(),

  // Dimensional properties
  diameter: z.string().optional(),
  length: z.string().optional(),
  height: z.string().optional(),
  width: z.string().optional(),
  thickness: z.string().optional(),
  weight: z.string().optional(),
});

/**
 * Pipe-specific properties
 */
export const PipePropertiesSchema = BasePropertySchema.extend({
  // Pipe-specific properties
  pipeType: z.enum(["straight", "elbow", "tee", "cross", "reducer", "cap"]).default("straight"),
  diameter: z.string().optional(),
  schedule: z.string().optional(),
  pipeClass: z.string().optional(),
  insulation: z.string().optional(),
  tracing: z.enum(["none", "steam", "electric", "glycol"]).default("none"),

  // Flow properties
  flowDirection: z.enum(["forward", "backward", "both"]).optional(),
  velocity: z.string().optional(),
  reynoldsNumber: z.string().optional(),

  // Process properties
  material: z.string().optional(),
  temperature: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  density: z.string().optional(),
  viscosity: z.string().optional(),
  ph: z.string().optional(),

  // Dimensional properties (limited for pipes)
  length: z.string().optional(),
  thickness: z.string().optional(),
  weight: z.string().optional(),
});

/**
 * Instrument-specific properties
 */
export const InstrumentPropertiesSchema = BasePropertySchema.extend({
  // Instrument-specific properties
  instrumentType: z
    .enum([
      "flow_meter",
      "pressure_gauge",
      "temperature_sensor",
      "level_indicator",
      "analyzer",
      "controller",
      "transmitter",
      "indicator",
      "recorder",
      "switch",
    ])
    .default("flow_meter"),

  // Measurement properties
  ...InstrumentationPropertiesSchema.shape,

  // Control properties
  controlType: z.enum(["indicator", "controller", "transmitter", "switch", "recorder"]).optional(),
  outputSignal: z.string().optional(),
  inputSignal: z.string().optional(),

  // Installation
  mountingType: z.enum(["field", "panel", "inline", "remote"]).optional(),
  location: z.string().optional(),

  // Electrical properties
  voltage: z.string().optional(),
  current: z.string().optional(),
  power: z.string().optional(),
  frequency: z.string().optional(),
  phases: z.enum(["1", "3"]).optional(),
  connectionType: z.string().optional(),

  // Process properties
  material: z.string().optional(),
  temperature: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  density: z.string().optional(),
  viscosity: z.string().optional(),
  ph: z.string().optional(),
});

/**
 * Heat Exchanger-specific properties
 */
export const HeatExchangerPropertiesSchema = BasePropertySchema.extend({
  // Heat exchanger-specific properties
  exchangerType: z
    .enum(["shell_tube", "plate", "air_cooled", "double_pipe", "spiral"])
    .default("shell_tube"),
  heatDuty: z.string().optional(),
  area: z.string().optional(),
  overallHeatTransferCoeff: z.string().optional(),

  // Shell side properties
  shellSideFluid: z.string().optional(),
  shellSidePressure: z.string().optional(),
  shellSideTemperatureIn: z.string().optional(),
  shellSideTemperatureOut: z.string().optional(),
  shellSideFlowRate: z.string().optional(),

  // Tube side properties
  tubeSideFluid: z.string().optional(),
  tubeSidePressure: z.string().optional(),
  tubeSideTemperatureIn: z.string().optional(),
  tubeSideTemperatureOut: z.string().optional(),
  tubeSideFlowRate: z.string().optional(),

  // Construction
  shellMaterial: z.string().optional(),
  tubeMaterial: z.string().optional(),

  // Dimensional properties
  diameter: z.string().optional(),
  length: z.string().optional(),
  height: z.string().optional(),
  width: z.string().optional(),
  thickness: z.string().optional(),
  weight: z.string().optional(),
});

/**
 * Compressor-specific properties
 */
export const CompressorPropertiesSchema = BasePropertySchema.extend({
  // Compressor-specific properties
  compressorType: z
    .enum(["centrifugal", "reciprocating", "rotary", "axial", "scroll"])
    .default("centrifugal"),
  capacity: z.string().optional(),
  compressionRatio: z.string().optional(),
  suctionPressure: z.string().optional(),
  dischargePressure: z.string().optional(),
  suctionTemperature: z.string().optional(),
  dischargeTemperature: z.string().optional(),
  efficiency: z.string().optional(),

  // Driver properties
  driverType: z
    .enum(["electric_motor", "steam_turbine", "gas_turbine", "engine"])
    .default("electric_motor"),

  // Electrical properties (for electric motor)
  voltage: z.string().optional(),
  current: z.string().optional(),
  power: z.string().optional(),
  frequency: z.string().optional(),
  phases: z.enum(["1", "3"]).optional(),
  connectionType: z.string().optional(),

  // Process properties
  material: z.string().optional(),
  temperature: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  density: z.string().optional(),
  viscosity: z.string().optional(),
  ph: z.string().optional(),

  // Dimensional properties
  diameter: z.string().optional(),
  length: z.string().optional(),
  height: z.string().optional(),
  width: z.string().optional(),
  thickness: z.string().optional(),
  weight: z.string().optional(),
});

/**
 * Union type for all property schemas
 */
export type NodePropertySchema =
  | z.infer<typeof PumpPropertiesSchema>
  | z.infer<typeof ValvePropertiesSchema>
  | z.infer<typeof TankPropertiesSchema>
  | z.infer<typeof PipePropertiesSchema>
  | z.infer<typeof InstrumentPropertiesSchema>
  | z.infer<typeof HeatExchangerPropertiesSchema>
  | z.infer<typeof CompressorPropertiesSchema>;

/**
 * Schema map for each node type
 */
export const PROPERTY_SCHEMAS = {
  pump: PumpPropertiesSchema,
  valve: ValvePropertiesSchema,
  tank: TankPropertiesSchema,
  pipe: PipePropertiesSchema,
  instrument: InstrumentPropertiesSchema,
  flowMeter: InstrumentPropertiesSchema,
  pressureGauge: InstrumentPropertiesSchema,
  temperatureSensor: InstrumentPropertiesSchema,
  levelIndicator: InstrumentPropertiesSchema,
  controlValve: ValvePropertiesSchema,
  heatExchanger: HeatExchangerPropertiesSchema,
  compressor: CompressorPropertiesSchema,
  filter: BasePropertySchema.extend({
    filterType: z.enum(["bag", "cartridge", "screen", "sand", "carbon"]).default("cartridge"),
    efficiency: z.string().optional(),
    pressureDrop: z.string().optional(),
    material: z.string().optional(),
    temperature: z.string().optional(),
    pressure: z.string().optional(),
    flowRate: z.string().optional(),
    diameter: z.string().optional(),
    length: z.string().optional(),
    height: z.string().optional(),
    width: z.string().optional(),
    thickness: z.string().optional(),
    weight: z.string().optional(),
  }),
  separator: BasePropertySchema.extend({
    separatorType: z.enum(["gravity", "cyclone", "membrane", "centrifuge"]).default("gravity"),
    efficiency: z.string().optional(),
    material: z.string().optional(),
    temperature: z.string().optional(),
    pressure: z.string().optional(),
    flowRate: z.string().optional(),
    diameter: z.string().optional(),
    length: z.string().optional(),
    height: z.string().optional(),
    width: z.string().optional(),
    thickness: z.string().optional(),
    weight: z.string().optional(),
  }),
  mixer: BasePropertySchema.extend({
    mixerType: z.enum(["paddle", "turbine", "propeller", "anchor", "helical"]).default("paddle"),
    speed: z.string().optional(),
    mixerPower: z.string().optional(),
    voltage: z.string().optional(),
    current: z.string().optional(),
    frequency: z.string().optional(),
    phases: z.enum(["1", "3"]).optional(),
    connectionType: z.string().optional(),
    material: z.string().optional(),
    temperature: z.string().optional(),
    pressure: z.string().optional(),
    flowRate: z.string().optional(),
    diameter: z.string().optional(),
    length: z.string().optional(),
    height: z.string().optional(),
    width: z.string().optional(),
    thickness: z.string().optional(),
    weight: z.string().optional(),
  }),
} as const;

/**
 * Default property values for each node type
 */
export const DEFAULT_PROPERTIES = {
  pump: {
    label: "New Pump",
    pumpType: "centrifugal",
    description: "",
    tagNumber: "",
    service: "",
    flowRate: "",
    head: "",
    efficiency: "75%",
    material: "Cast Iron",
    power: "",
    voltage: "460V",
    phases: "3",
    rotation: 0,
    isLocked: false,
  },
  valve: {
    label: "New Valve",
    valveType: "gate",
    state: "closed",
    description: "",
    tagNumber: "",
    service: "",
    size: "",
    material: "Carbon Steel",
    pressureRating: "",
    actuatorType: "manual",
    rotation: 0,
    isLocked: false,
  },
  tank: {
    label: "New Tank",
    tankType: "storage",
    description: "",
    tagNumber: "",
    service: "",
    capacity: "",
    level: 50,
    shape: "cylindrical",
    orientation: "vertical",
    material: "Carbon Steel",
    rotation: 0,
    isLocked: false,
  },
  pipe: {
    label: "New Pipe",
    pipeType: "straight",
    description: "",
    tagNumber: "",
    service: "",
    diameter: "",
    schedule: "40",
    pipeClass: "",
    material: "Carbon Steel",
    insulation: "",
    tracing: "none",
    rotation: 0,
    isLocked: false,
  },
  instrument: {
    label: "New Instrument",
    instrumentType: "flow_meter",
    description: "",
    tagNumber: "",
    service: "",
    range: "",
    unit: "",
    accuracy: "±1%",
    controlType: "indicator",
    mountingType: "field",
    rotation: 0,
    isLocked: false,
  },
} as const;

export type NodeType = keyof typeof PROPERTY_SCHEMAS;
export type PropertyTemplate = typeof DEFAULT_PROPERTIES;
