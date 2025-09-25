import type { NodeType } from "@/types/propertySchemas";

/**
 * Form field types for dynamic form generation
 */
export type FormFieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "slider"
  | "textarea"
  | "color"
  | "date";

/**
 * Form field configuration
 */
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  tooltip?: string;
  unit?: string;
  section: string;
}

/**
 * Property section configuration
 */
export interface PropertySection {
  id: string;
  label: string;
  icon?: string;
  defaultExpanded: boolean;
  order: number;
}

/**
 * Default property sections
 */
export const DEFAULT_SECTIONS: PropertySection[] = [
  {
    id: "basic",
    label: "Basic Properties",
    icon: "Info",
    defaultExpanded: true,
    order: 0,
  },
  {
    id: "dimensional",
    label: "Dimensions",
    icon: "Ruler",
    defaultExpanded: false,
    order: 1,
  },
  {
    id: "process",
    label: "Process Conditions",
    icon: "Activity",
    defaultExpanded: false,
    order: 2,
  },
  {
    id: "electrical",
    label: "Electrical Properties",
    icon: "Zap",
    defaultExpanded: false,
    order: 3,
  },
  {
    id: "instrumentation",
    label: "Instrumentation",
    icon: "Gauge",
    defaultExpanded: false,
    order: 4,
  },
  {
    id: "construction",
    label: "Construction",
    icon: "Wrench",
    defaultExpanded: false,
    order: 5,
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: "Settings",
    defaultExpanded: false,
    order: 6,
  },
];

/**
 * Common field configurations
 */
const COMMON_FIELDS = {
  label: {
    name: "label",
    label: "Label",
    type: "text" as const,
    required: true,
    section: "basic",
    placeholder: "Enter label...",
  },
  description: {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    section: "basic",
    placeholder: "Enter description...",
    rows: 3,
  },
  tagNumber: {
    name: "tagNumber",
    label: "Tag Number",
    type: "text" as const,
    section: "basic",
    placeholder: "e.g., P-101",
    tooltip: "Unique identifier for this equipment",
  },
  service: {
    name: "service",
    label: "Service",
    type: "text" as const,
    section: "basic",
    placeholder: "e.g., Cooling Water",
    tooltip: "Service or fluid being handled",
  },
  material: {
    name: "material",
    label: "Material",
    type: "select" as const,
    section: "construction",
    options: [
      { value: "", label: "Select material..." },
      { value: "carbon_steel", label: "Carbon Steel" },
      { value: "stainless_steel_304", label: "Stainless Steel 304" },
      { value: "stainless_steel_316", label: "Stainless Steel 316" },
      { value: "cast_iron", label: "Cast Iron" },
      { value: "ductile_iron", label: "Ductile Iron" },
      { value: "bronze", label: "Bronze" },
      { value: "brass", label: "Brass" },
      { value: "pvc", label: "PVC" },
      { value: "cpvc", label: "CPVC" },
      { value: "hdpe", label: "HDPE" },
      { value: "fiberglass", label: "Fiberglass" },
    ],
  },
  temperature: {
    name: "temperature",
    label: "Temperature",
    type: "text" as const,
    section: "process",
    placeholder: "e.g., 25°C",
    unit: "°C",
    tooltip: "Operating temperature",
  },
  pressure: {
    name: "pressure",
    label: "Pressure",
    type: "text" as const,
    section: "process",
    placeholder: "e.g., 5 bar",
    unit: "bar",
    tooltip: "Operating pressure",
  },
  flowRate: {
    name: "flowRate",
    label: "Flow Rate",
    type: "text" as const,
    section: "process",
    placeholder: "e.g., 100 m³/h",
    unit: "m³/h",
    tooltip: "Volumetric flow rate",
  },
  diameter: {
    name: "diameter",
    label: "Diameter",
    type: "text" as const,
    section: "dimensional",
    placeholder: "e.g., DN100",
    unit: "mm",
    tooltip: "Nominal diameter",
  },
  power: {
    name: "power",
    label: "Power",
    type: "text" as const,
    section: "electrical",
    placeholder: "e.g., 15 kW",
    unit: "kW",
    tooltip: "Electrical power rating",
  },
  voltage: {
    name: "voltage",
    label: "Voltage",
    type: "select" as const,
    section: "electrical",
    options: [
      { value: "", label: "Select voltage..." },
      { value: "110V", label: "110V" },
      { value: "220V", label: "220V" },
      { value: "380V", label: "380V" },
      { value: "460V", label: "460V" },
      { value: "575V", label: "575V" },
      { value: "690V", label: "690V" },
    ],
  },
  phases: {
    name: "phases",
    label: "Phases",
    type: "select" as const,
    section: "electrical",
    options: [
      { value: "", label: "Select phases..." },
      { value: "1", label: "Single Phase" },
      { value: "3", label: "Three Phase" },
    ],
  },
};

/**
 * Property templates for each node type
 */
export const PROPERTY_TEMPLATES: Record<NodeType, FormField[]> = {
  pump: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "pumpType",
      label: "Pump Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "centrifugal", label: "Centrifugal" },
        { value: "positive_displacement", label: "Positive Displacement" },
        { value: "reciprocating", label: "Reciprocating" },
        { value: "gear", label: "Gear" },
        { value: "screw", label: "Screw" },
      ],
    },
    COMMON_FIELDS.flowRate,
    {
      name: "head",
      label: "Total Head",
      type: "text",
      section: "process",
      placeholder: "e.g., 50 m",
      unit: "m",
      tooltip: "Total dynamic head",
    },
    {
      name: "efficiency",
      label: "Efficiency",
      type: "text",
      section: "process",
      placeholder: "e.g., 75%",
      unit: "%",
      tooltip: "Pump efficiency",
    },
    {
      name: "npshRequired",
      label: "NPSH Required",
      type: "text",
      section: "process",
      placeholder: "e.g., 3 m",
      unit: "m",
      tooltip: "Net Positive Suction Head Required",
    },
    {
      name: "speed",
      label: "Speed",
      type: "text",
      section: "process",
      placeholder: "e.g., 1450 RPM",
      unit: "RPM",
      tooltip: "Rotational speed",
    },
    COMMON_FIELDS.power,
    COMMON_FIELDS.voltage,
    COMMON_FIELDS.phases,
    COMMON_FIELDS.material,
    COMMON_FIELDS.temperature,
    COMMON_FIELDS.pressure,
  ],

  valve: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "valveType",
      label: "Valve Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "gate", label: "Gate Valve" },
        { value: "globe", label: "Globe Valve" },
        { value: "ball", label: "Ball Valve" },
        { value: "butterfly", label: "Butterfly Valve" },
        { value: "check", label: "Check Valve" },
        { value: "relief", label: "Relief Valve" },
        { value: "control", label: "Control Valve" },
      ],
    },
    {
      name: "state",
      label: "State",
      type: "select",
      section: "basic",
      options: [
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
        { value: "partial", label: "Partial" },
        { value: "locked_open", label: "Locked Open" },
        { value: "locked_closed", label: "Locked Closed" },
      ],
    },
    {
      name: "size",
      label: "Size",
      type: "text",
      section: "dimensional",
      placeholder: "e.g., DN100",
      tooltip: "Nominal valve size",
    },
    {
      name: "pressureRating",
      label: "Pressure Rating",
      type: "text",
      section: "process",
      placeholder: "e.g., PN16",
      tooltip: "Maximum operating pressure rating",
    },
    {
      name: "actuatorType",
      label: "Actuator Type",
      type: "select",
      section: "construction",
      options: [
        { value: "manual", label: "Manual" },
        { value: "pneumatic", label: "Pneumatic" },
        { value: "electric", label: "Electric" },
        { value: "hydraulic", label: "Hydraulic" },
      ],
    },
    {
      name: "bodyMaterial",
      label: "Body Material",
      type: "select",
      section: "construction",
      options: COMMON_FIELDS.material.options,
    },
    {
      name: "seatMaterial",
      label: "Seat Material",
      type: "text",
      section: "construction",
      placeholder: "e.g., PTFE",
      tooltip: "Valve seat material",
    },
    COMMON_FIELDS.temperature,
    COMMON_FIELDS.pressure,
  ],

  tank: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "tankType",
      label: "Tank Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "storage", label: "Storage Tank" },
        { value: "pressure", label: "Pressure Vessel" },
        { value: "mixing", label: "Mixing Tank" },
        { value: "buffer", label: "Buffer Tank" },
        { value: "reactor", label: "Reactor" },
        { value: "separator", label: "Separator" },
      ],
    },
    {
      name: "capacity",
      label: "Capacity",
      type: "text",
      section: "dimensional",
      placeholder: "e.g., 1000 m³",
      unit: "m³",
      tooltip: "Total tank capacity",
    },
    {
      name: "level",
      label: "Current Level",
      type: "slider",
      section: "process",
      min: 0,
      max: 100,
      unit: "%",
      tooltip: "Current liquid level percentage",
    },
    {
      name: "shape",
      label: "Shape",
      type: "select",
      section: "dimensional",
      options: [
        { value: "cylindrical", label: "Cylindrical" },
        { value: "rectangular", label: "Rectangular" },
        { value: "spherical", label: "Spherical" },
        { value: "conical", label: "Conical" },
      ],
    },
    {
      name: "orientation",
      label: "Orientation",
      type: "select",
      section: "dimensional",
      options: [
        { value: "vertical", label: "Vertical" },
        { value: "horizontal", label: "Horizontal" },
      ],
    },
    {
      name: "designPressure",
      label: "Design Pressure",
      type: "text",
      section: "process",
      placeholder: "e.g., 10 bar",
      unit: "bar",
      tooltip: "Maximum allowable working pressure",
    },
    {
      name: "designTemperature",
      label: "Design Temperature",
      type: "text",
      section: "process",
      placeholder: "e.g., 200°C",
      unit: "°C",
      tooltip: "Maximum operating temperature",
    },
    {
      name: "shellMaterial",
      label: "Shell Material",
      type: "select",
      section: "construction",
      options: COMMON_FIELDS.material.options,
    },
    {
      name: "liningMaterial",
      label: "Lining Material",
      type: "text",
      section: "construction",
      placeholder: "e.g., Rubber",
      tooltip: "Internal lining material",
    },
    {
      name: "insulation",
      label: "Insulation",
      type: "text",
      section: "construction",
      placeholder: "e.g., Mineral Wool",
      tooltip: "Thermal insulation type",
    },
    COMMON_FIELDS.temperature,
    COMMON_FIELDS.pressure,
  ],

  pipe: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "pipeType",
      label: "Pipe Type",
      type: "select",
      section: "basic",
      options: [
        { value: "straight", label: "Straight Pipe" },
        { value: "elbow", label: "Elbow" },
        { value: "tee", label: "Tee" },
        { value: "cross", label: "Cross" },
        { value: "reducer", label: "Reducer" },
        { value: "cap", label: "Cap" },
      ],
    },
    COMMON_FIELDS.diameter,
    {
      name: "schedule",
      label: "Schedule",
      type: "select",
      section: "dimensional",
      options: [
        { value: "", label: "Select schedule..." },
        { value: "5S", label: "5S" },
        { value: "10S", label: "10S" },
        { value: "20", label: "20" },
        { value: "40", label: "40 (STD)" },
        { value: "80", label: "80 (XS)" },
        { value: "120", label: "120" },
        { value: "160", label: "160 (XXS)" },
      ],
      tooltip: "Pipe wall thickness schedule",
    },
    {
      name: "pipeClass",
      label: "Pipe Class",
      type: "text",
      section: "dimensional",
      placeholder: "e.g., 150#",
      tooltip: "Piping class specification",
    },
    {
      name: "length",
      label: "Length",
      type: "text",
      section: "dimensional",
      placeholder: "e.g., 10 m",
      unit: "m",
    },
    {
      name: "insulation",
      label: "Insulation",
      type: "text",
      section: "construction",
      placeholder: "e.g., Mineral Wool",
      tooltip: "Thermal insulation type",
    },
    {
      name: "tracing",
      label: "Heat Tracing",
      type: "select",
      section: "construction",
      options: [
        { value: "none", label: "None" },
        { value: "steam", label: "Steam Tracing" },
        { value: "electric", label: "Electric Tracing" },
        { value: "glycol", label: "Glycol Tracing" },
      ],
    },
    COMMON_FIELDS.material,
    COMMON_FIELDS.temperature,
    COMMON_FIELDS.pressure,
    COMMON_FIELDS.flowRate,
  ],

  instrument: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "instrumentType",
      label: "Instrument Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "flow_meter", label: "Flow Meter" },
        { value: "pressure_gauge", label: "Pressure Gauge" },
        { value: "temperature_sensor", label: "Temperature Sensor" },
        { value: "level_indicator", label: "Level Indicator" },
        { value: "analyzer", label: "Analyzer" },
        { value: "controller", label: "Controller" },
        { value: "transmitter", label: "Transmitter" },
        { value: "indicator", label: "Indicator" },
        { value: "recorder", label: "Recorder" },
        { value: "switch", label: "Switch" },
      ],
    },
    {
      name: "range",
      label: "Measurement Range",
      type: "text",
      section: "instrumentation",
      placeholder: "e.g., 0-100",
      tooltip: "Measurement range",
    },
    {
      name: "unit",
      label: "Unit",
      type: "text",
      section: "instrumentation",
      placeholder: "e.g., m³/h, bar, °C",
      tooltip: "Measurement unit",
    },
    {
      name: "accuracy",
      label: "Accuracy",
      type: "text",
      section: "instrumentation",
      placeholder: "e.g., ±1%",
      tooltip: "Measurement accuracy",
    },
    {
      name: "controlType",
      label: "Control Type",
      type: "select",
      section: "instrumentation",
      options: [
        { value: "indicator", label: "Indicator Only" },
        { value: "controller", label: "Controller" },
        { value: "transmitter", label: "Transmitter" },
        { value: "switch", label: "Switch" },
        { value: "recorder", label: "Recorder" },
      ],
    },
    {
      name: "mountingType",
      label: "Mounting",
      type: "select",
      section: "construction",
      options: [
        { value: "field", label: "Field Mounted" },
        { value: "panel", label: "Panel Mounted" },
        { value: "inline", label: "Inline" },
        { value: "remote", label: "Remote" },
      ],
    },
    {
      name: "outputSignal",
      label: "Output Signal",
      type: "select",
      section: "electrical",
      options: [
        { value: "", label: "Select signal..." },
        { value: "4-20mA", label: "4-20 mA" },
        { value: "0-10V", label: "0-10 V" },
        { value: "digital", label: "Digital" },
        { value: "pneumatic", label: "Pneumatic 3-15 psi" },
      ],
    },
    COMMON_FIELDS.voltage,
  ],

  // Additional node types with basic configurations
  flowMeter: [
    ...PROPERTY_TEMPLATES.instrument.filter(field =>
      field.name !== "instrumentType"
    ),
    {
      name: "instrumentType",
      label: "Flow Meter Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "orifice", label: "Orifice Plate" },
        { value: "venturi", label: "Venturi" },
        { value: "magnetic", label: "Magnetic" },
        { value: "ultrasonic", label: "Ultrasonic" },
        { value: "turbine", label: "Turbine" },
        { value: "vortex", label: "Vortex" },
      ],
    },
  ],

  pressureGauge: [
    ...PROPERTY_TEMPLATES.instrument.filter(field =>
      field.name !== "instrumentType"
    ),
    {
      name: "instrumentType",
      label: "Pressure Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "gauge", label: "Gauge Pressure" },
        { value: "absolute", label: "Absolute Pressure" },
        { value: "differential", label: "Differential Pressure" },
        { value: "vacuum", label: "Vacuum" },
      ],
    },
  ],

  temperatureSensor: [
    ...PROPERTY_TEMPLATES.instrument.filter(field =>
      field.name !== "instrumentType"
    ),
    {
      name: "instrumentType",
      label: "Sensor Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "rtd", label: "RTD (PT100)" },
        { value: "thermocouple", label: "Thermocouple" },
        { value: "thermistor", label: "Thermistor" },
        { value: "bimetal", label: "Bimetal" },
      ],
    },
  ],

  levelIndicator: [
    ...PROPERTY_TEMPLATES.instrument.filter(field =>
      field.name !== "instrumentType"
    ),
    {
      name: "instrumentType",
      label: "Level Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "sight_glass", label: "Sight Glass" },
        { value: "float", label: "Float" },
        { value: "ultrasonic", label: "Ultrasonic" },
        { value: "radar", label: "Radar" },
        { value: "dp_cell", label: "DP Cell" },
      ],
    },
  ],

  controlValve: [
    ...PROPERTY_TEMPLATES.valve,
    {
      name: "cvValue",
      label: "Cv Value",
      type: "text",
      section: "process",
      placeholder: "e.g., 50",
      tooltip: "Flow coefficient",
    },
    {
      name: "controlSignal",
      label: "Control Signal",
      type: "select",
      section: "electrical",
      options: [
        { value: "4-20mA", label: "4-20 mA" },
        { value: "pneumatic", label: "Pneumatic 3-15 psi" },
        { value: "digital", label: "Digital" },
      ],
    },
    {
      name: "failPosition",
      label: "Fail Position",
      type: "select",
      section: "construction",
      options: [
        { value: "open", label: "Fail Open" },
        { value: "closed", label: "Fail Closed" },
        { value: "last", label: "Fail Last Position" },
      ],
    },
  ],

  heatExchanger: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "exchangerType",
      label: "Exchanger Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "shell_tube", label: "Shell & Tube" },
        { value: "plate", label: "Plate" },
        { value: "air_cooled", label: "Air Cooled" },
        { value: "double_pipe", label: "Double Pipe" },
        { value: "spiral", label: "Spiral" },
      ],
    },
    {
      name: "heatDuty",
      label: "Heat Duty",
      type: "text",
      section: "process",
      placeholder: "e.g., 1000 kW",
      unit: "kW",
      tooltip: "Heat transfer duty",
    },
    {
      name: "area",
      label: "Heat Transfer Area",
      type: "text",
      section: "dimensional",
      placeholder: "e.g., 100 m²",
      unit: "m²",
      tooltip: "Total heat transfer area",
    },
  ],

  compressor: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "compressorType",
      label: "Compressor Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "centrifugal", label: "Centrifugal" },
        { value: "reciprocating", label: "Reciprocating" },
        { value: "rotary", label: "Rotary" },
        { value: "axial", label: "Axial" },
        { value: "scroll", label: "Scroll" },
      ],
    },
    {
      name: "capacity",
      label: "Capacity",
      type: "text",
      section: "process",
      placeholder: "e.g., 1000 m³/h",
      unit: "m³/h",
      tooltip: "Volumetric capacity",
    },
    {
      name: "compressionRatio",
      label: "Compression Ratio",
      type: "text",
      section: "process",
      placeholder: "e.g., 3.5",
      tooltip: "Discharge/Suction pressure ratio",
    },
    COMMON_FIELDS.power,
    COMMON_FIELDS.voltage,
    COMMON_FIELDS.phases,
  ],

  filter: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "filterType",
      label: "Filter Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "bag", label: "Bag Filter" },
        { value: "cartridge", label: "Cartridge Filter" },
        { value: "screen", label: "Screen Filter" },
        { value: "sand", label: "Sand Filter" },
        { value: "carbon", label: "Carbon Filter" },
      ],
    },
  ],

  separator: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "separatorType",
      label: "Separator Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "gravity", label: "Gravity Separator" },
        { value: "cyclone", label: "Cyclone" },
        { value: "membrane", label: "Membrane" },
        { value: "centrifuge", label: "Centrifuge" },
      ],
    },
  ],

  mixer: [
    COMMON_FIELDS.label,
    COMMON_FIELDS.description,
    COMMON_FIELDS.tagNumber,
    COMMON_FIELDS.service,
    {
      name: "mixerType",
      label: "Mixer Type",
      type: "select",
      section: "basic",
      required: true,
      options: [
        { value: "paddle", label: "Paddle" },
        { value: "turbine", label: "Turbine" },
        { value: "propeller", label: "Propeller" },
        { value: "anchor", label: "Anchor" },
        { value: "helical", label: "Helical" },
      ],
    },
    COMMON_FIELDS.power,
    COMMON_FIELDS.voltage,
    COMMON_FIELDS.phases,
  ],
};

/**
 * Get form fields for a specific node type
 */
export function getFormFieldsForNodeType(nodeType: string): FormField[] {
  return PROPERTY_TEMPLATES[nodeType as NodeType] || PROPERTY_TEMPLATES.instrument;
}

/**
 * Group form fields by section
 */
export function groupFieldsBySection(fields: FormField[]): Record<string, FormField[]> {
  return fields.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {} as Record<string, FormField[]>);
}

/**
 * Get sections that have fields
 */
export function getSectionsWithFields(fields: FormField[]): PropertySection[] {
  const usedSections = new Set(fields.map(f => f.section));
  return DEFAULT_SECTIONS.filter(section => usedSections.has(section.id));
}