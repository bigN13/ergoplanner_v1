/**
 * Symbol Catalog - Central registry of all P&ID symbols
 * Provides metadata, categorization, and search capabilities
 */

export interface SymbolMetadata {
  id: string;
  type: string;
  label: string;
  category: string;
  subcategory?: string;
  standard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water';
  tags: string[];
  description: string;
  searchKeywords: string[];
  defaultData: Record<string, unknown>;
  component?: string; // Component name for dynamic import
  svgPath?: string; // Path to SVG file
  parametric?: boolean; // Whether symbol supports parametric generation
  convertible?: boolean; // Whether symbol can be converted between standards
  equivalents?: {
    // Equivalent symbols in other standards
    'ISA-5.1'?: string;
    'ISO-14617'?: string;
    'UK-Water'?: string;
  };
}

export const ISA51Catalog: SymbolMetadata[] = [
  // ===== PUMPS & COMPRESSORS =====
  {
    id: 'isa-centrifugal-pump',
    type: 'pump',
    label: 'Centrifugal Pump',
    category: 'Pumps & Compressors',
    subcategory: 'Pumps',
    standard: 'ISA-5.1',
    tags: ['pump', 'centrifugal', 'rotating', 'equipment', 'fluid'],
    description: 'Centrifugal pump for fluid transfer using rotating impeller',
    searchKeywords: ['pump', 'centrifugal', 'fluid', 'transfer', 'rotating', 'impeller'],
    defaultData: {
      label: 'P-101',
      type: 'centrifugal',
      flowRate: '100 m³/h',
      head: '50 m',
      power: '15 kW',
      speed: '2900 rpm'
    },
    component: 'CentrifugalPump',
    parametric: true,
    convertible: true,
    equivalents: {
      'ISO-14617': 'iso-centrifugal-pump',
      'UK-Water': 'uk-centrifugal-pump'
    }
  },
  {
    id: 'isa-positive-displacement-pump',
    type: 'pump',
    label: 'Positive Displacement Pump',
    category: 'Pumps & Compressors',
    subcategory: 'Pumps',
    standard: 'ISA-5.1',
    tags: ['pump', 'positive', 'displacement', 'volumetric'],
    description: 'Positive displacement pump for precise flow control',
    searchKeywords: ['pump', 'positive', 'displacement', 'volumetric', 'precise'],
    defaultData: {
      label: 'P-102',
      type: 'positive-displacement',
      flowRate: '50 m³/h',
      pressure: '10 bar'
    },
    component: 'PositiveDisplacementPump',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-reciprocating-pump',
    type: 'pump',
    label: 'Reciprocating Pump',
    category: 'Pumps & Compressors',
    subcategory: 'Pumps',
    standard: 'ISA-5.1',
    tags: ['pump', 'reciprocating', 'piston', 'plunger'],
    description: 'Reciprocating pump with piston or plunger mechanism',
    searchKeywords: ['pump', 'reciprocating', 'piston', 'plunger', 'displacement'],
    defaultData: {
      label: 'P-103',
      type: 'reciprocating',
      flowRate: '30 m³/h',
      pressure: '20 bar',
      strokes: '120 spm'
    },
    component: 'ReciprocatingPump',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-centrifugal-compressor',
    type: 'compressor',
    label: 'Centrifugal Compressor',
    category: 'Pumps & Compressors',
    subcategory: 'Compressors',
    standard: 'ISA-5.1',
    tags: ['compressor', 'centrifugal', 'gas', 'rotating'],
    description: 'Centrifugal compressor for gas compression',
    searchKeywords: ['compressor', 'centrifugal', 'gas', 'pressure', 'rotating'],
    defaultData: {
      label: 'C-101',
      type: 'centrifugal',
      pressure: '10 bar',
      flowRate: '1000 Nm³/h',
      power: '100 kW'
    },
    component: 'CentrifugalCompressor',
    parametric: true,
    convertible: true
  },

  // ===== VALVES =====
  {
    id: 'isa-gate-valve',
    type: 'valve',
    label: 'Gate Valve',
    category: 'Valves',
    subcategory: 'Manual Valves',
    standard: 'ISA-5.1',
    tags: ['valve', 'gate', 'isolation', 'manual', 'shutoff'],
    description: 'Gate valve for flow isolation and on/off control',
    searchKeywords: ['valve', 'gate', 'isolation', 'shutoff', 'manual', 'block'],
    defaultData: {
      label: 'V-101',
      type: 'gate',
      size: 'DN100',
      rating: 'PN16',
      state: 'open',
      material: 'CS'
    },
    component: 'GateValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-globe-valve',
    type: 'valve',
    label: 'Globe Valve',
    category: 'Valves',
    subcategory: 'Manual Valves',
    standard: 'ISA-5.1',
    tags: ['valve', 'globe', 'throttling', 'manual', 'regulation'],
    description: 'Globe valve for flow throttling and regulation',
    searchKeywords: ['valve', 'globe', 'throttling', 'regulation', 'manual', 'flow control'],
    defaultData: {
      label: 'V-102',
      type: 'globe',
      size: 'DN80',
      rating: 'PN16',
      state: 'open'
    },
    component: 'GlobeValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-ball-valve',
    type: 'valve',
    label: 'Ball Valve',
    category: 'Valves',
    subcategory: 'Manual Valves',
    standard: 'ISA-5.1',
    tags: ['valve', 'ball', 'quarter-turn', 'manual'],
    description: 'Ball valve for quick on/off control',
    searchKeywords: ['valve', 'ball', 'quarter', 'turn', 'quick', 'shutoff'],
    defaultData: {
      label: 'V-103',
      type: 'ball',
      size: 'DN50',
      rating: 'PN16',
      state: 'open',
      port: 'full'
    },
    component: 'BallValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-butterfly-valve',
    type: 'valve',
    label: 'Butterfly Valve',
    category: 'Valves',
    subcategory: 'Manual Valves',
    standard: 'ISA-5.1',
    tags: ['valve', 'butterfly', 'quarter-turn', 'wafer'],
    description: 'Butterfly valve for large diameter applications',
    searchKeywords: ['valve', 'butterfly', 'quarter', 'turn', 'wafer', 'lug'],
    defaultData: {
      label: 'V-104',
      type: 'butterfly',
      size: 'DN200',
      rating: 'PN10',
      state: 'open'
    },
    component: 'ButterflyValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-check-valve',
    type: 'checkValve',
    label: 'Check Valve',
    category: 'Valves',
    subcategory: 'Check Valves',
    standard: 'ISA-5.1',
    tags: ['valve', 'check', 'non-return', 'swing', 'lift'],
    description: 'Check valve to prevent flow reversal',
    searchKeywords: ['valve', 'check', 'non-return', 'backflow', 'prevention', 'swing'],
    defaultData: {
      label: 'CHK-101',
      type: 'swing-check',
      size: 'DN100',
      rating: 'PN16',
      flowDirection: 'left-to-right'
    },
    component: 'CheckValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-control-valve',
    type: 'controlValve',
    label: 'Control Valve',
    category: 'Valves',
    subcategory: 'Control Valves',
    standard: 'ISA-5.1',
    tags: ['valve', 'control', 'automated', 'pneumatic', 'electric'],
    description: 'Control valve for automated flow regulation',
    searchKeywords: ['valve', 'control', 'pneumatic', 'automated', 'regulation', 'modulating'],
    defaultData: {
      label: 'CV-101',
      type: 'globe-control',
      size: 'DN80',
      rating: 'PN16',
      actuator: 'pneumatic',
      position: 50,
      cv: '100'
    },
    component: 'ControlValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-safety-relief-valve',
    type: 'safetyValve',
    label: 'Safety Relief Valve',
    category: 'Valves',
    subcategory: 'Safety Valves',
    standard: 'ISA-5.1',
    tags: ['valve', 'safety', 'relief', 'pressure', 'protection'],
    description: 'Safety relief valve for overpressure protection',
    searchKeywords: ['valve', 'safety', 'relief', 'pressure', 'PSV', 'PRV', 'protection'],
    defaultData: {
      label: 'PSV-101',
      type: 'spring-loaded',
      size: 'DN50',
      setPoint: '10 barg',
      capacity: '1000 kg/h'
    },
    component: 'SafetyReliefValve',
    parametric: true,
    convertible: true
  },

  // ===== TANKS & VESSELS =====
  {
    id: 'isa-horizontal-tank',
    type: 'tank',
    label: 'Horizontal Tank',
    category: 'Tanks & Vessels',
    subcategory: 'Storage Tanks',
    standard: 'ISA-5.1',
    tags: ['tank', 'horizontal', 'storage', 'vessel', 'atmospheric'],
    description: 'Horizontal cylindrical storage tank',
    searchKeywords: ['tank', 'horizontal', 'storage', 'vessel', 'cylindrical', 'atmospheric'],
    defaultData: {
      label: 'T-101',
      type: 'horizontal-storage',
      capacity: '1000 m³',
      diameter: '3 m',
      length: '10 m',
      level: 50,
      material: 'CS'
    },
    component: 'HorizontalTank',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-vertical-tank',
    type: 'tank',
    label: 'Vertical Tank',
    category: 'Tanks & Vessels',
    subcategory: 'Storage Tanks',
    standard: 'ISA-5.1',
    tags: ['tank', 'vertical', 'storage', 'vessel', 'atmospheric'],
    description: 'Vertical cylindrical storage tank',
    searchKeywords: ['tank', 'vertical', 'storage', 'vessel', 'cylindrical', 'atmospheric'],
    defaultData: {
      label: 'T-102',
      type: 'vertical-storage',
      capacity: '500 m³',
      diameter: '5 m',
      height: '8 m',
      level: 30,
      material: 'CS'
    },
    component: 'VerticalTank',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-pressure-vessel',
    type: 'vessel',
    label: 'Pressure Vessel',
    category: 'Tanks & Vessels',
    subcategory: 'Pressure Vessels',
    standard: 'ISA-5.1',
    tags: ['vessel', 'pressure', 'tank', 'separator'],
    description: 'Pressure vessel for pressurized storage or separation',
    searchKeywords: ['vessel', 'pressure', 'tank', 'separator', 'drum', 'accumulator'],
    defaultData: {
      label: 'V-101',
      type: 'pressure-vessel',
      capacity: '100 m³',
      designPressure: '10 barg',
      designTemp: '150°C',
      material: 'CS'
    },
    component: 'PressureVessel',
    parametric: true,
    convertible: true
  },

  // ===== HEAT TRANSFER EQUIPMENT =====
  {
    id: 'isa-shell-tube-exchanger',
    type: 'heatExchanger',
    label: 'Shell & Tube Heat Exchanger',
    category: 'Heat Transfer',
    standard: 'ISA-5.1',
    tags: ['heat', 'exchanger', 'shell', 'tube', 'transfer'],
    description: 'Shell and tube heat exchanger for thermal transfer',
    searchKeywords: ['heat', 'exchanger', 'shell', 'tube', 'thermal', 'transfer', 'cooler', 'heater'],
    defaultData: {
      label: 'HX-101',
      type: 'shell-tube',
      duty: '1000 kW',
      area: '50 m²',
      shellSide: 'Steam',
      tubeSide: 'Process'
    },
    component: 'ShellTubeHeatExchanger',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-air-cooled-exchanger',
    type: 'heatExchanger',
    label: 'Air Cooled Exchanger',
    category: 'Heat Transfer',
    standard: 'ISA-5.1',
    tags: ['heat', 'exchanger', 'air', 'cooled', 'fin', 'fan'],
    description: 'Air cooled heat exchanger with finned tubes',
    searchKeywords: ['heat', 'exchanger', 'air', 'cooled', 'fin', 'fan', 'cooler'],
    defaultData: {
      label: 'ACC-101',
      type: 'air-cooled',
      duty: '500 kW',
      fanPower: '10 kW',
      tubes: '100'
    },
    component: 'AirCooledExchanger',
    parametric: true,
    convertible: true
  },

  // ===== INSTRUMENTS =====
  {
    id: 'isa-pressure-indicator',
    type: 'instrument',
    label: 'Pressure Indicator',
    category: 'Instruments',
    subcategory: 'Pressure',
    standard: 'ISA-5.1',
    tags: ['instrument', 'pressure', 'indicator', 'gauge', 'measurement'],
    description: 'Local pressure indicator/gauge',
    searchKeywords: ['pressure', 'indicator', 'gauge', 'PI', 'measurement', 'local'],
    defaultData: {
      label: 'PI-101',
      type: 'pressure-indicator',
      range: '0-10 barg',
      unit: 'bar',
      value: '0.0'
    },
    component: 'PressureIndicator',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-temperature-indicator',
    type: 'instrument',
    label: 'Temperature Indicator',
    category: 'Instruments',
    subcategory: 'Temperature',
    standard: 'ISA-5.1',
    tags: ['instrument', 'temperature', 'indicator', 'thermometer', 'measurement'],
    description: 'Local temperature indicator',
    searchKeywords: ['temperature', 'indicator', 'thermometer', 'TI', 'measurement', 'local'],
    defaultData: {
      label: 'TI-101',
      type: 'temperature-indicator',
      range: '0-200°C',
      unit: '°C',
      value: '0.0'
    },
    component: 'TemperatureIndicator',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-flow-indicator',
    type: 'instrument',
    label: 'Flow Indicator',
    category: 'Instruments',
    subcategory: 'Flow',
    standard: 'ISA-5.1',
    tags: ['instrument', 'flow', 'indicator', 'meter', 'measurement'],
    description: 'Local flow indicator',
    searchKeywords: ['flow', 'indicator', 'meter', 'FI', 'measurement', 'local'],
    defaultData: {
      label: 'FI-101',
      type: 'flow-indicator',
      range: '0-100 m³/h',
      unit: 'm³/h',
      value: '0.0'
    },
    component: 'FlowIndicator',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-level-indicator',
    type: 'instrument',
    label: 'Level Indicator',
    category: 'Instruments',
    subcategory: 'Level',
    standard: 'ISA-5.1',
    tags: ['instrument', 'level', 'indicator', 'gauge', 'measurement'],
    description: 'Local level indicator',
    searchKeywords: ['level', 'indicator', 'gauge', 'LI', 'measurement', 'local'],
    defaultData: {
      label: 'LI-101',
      type: 'level-indicator',
      range: '0-100%',
      unit: '%',
      value: '0.0'
    },
    component: 'LevelIndicator',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-orifice-plate',
    type: 'instrument',
    label: 'Orifice Plate',
    category: 'Instruments',
    subcategory: 'Flow Elements',
    standard: 'ISA-5.1',
    tags: ['instrument', 'flow', 'orifice', 'plate', 'element'],
    description: 'Orifice plate for flow measurement',
    searchKeywords: ['orifice', 'plate', 'flow', 'element', 'FE', 'restriction'],
    defaultData: {
      label: 'FE-101',
      type: 'orifice-plate',
      size: 'DN100',
      beta: '0.6',
      bore: '60 mm'
    },
    component: 'OrificePlate',
    parametric: true,
    convertible: true
  },

  // ===== PROCESS EQUIPMENT =====
  {
    id: 'isa-mixer',
    type: 'mixer',
    label: 'Mixer/Agitator',
    category: 'Process Equipment',
    standard: 'ISA-5.1',
    tags: ['mixer', 'agitator', 'stirrer', 'mixing'],
    description: 'Mixer or agitator for fluid mixing',
    searchKeywords: ['mixer', 'agitator', 'stirrer', 'mixing', 'blending'],
    defaultData: {
      label: 'MX-101',
      type: 'mixer',
      power: '5 kW',
      speed: '100 rpm',
      impellerType: 'turbine'
    },
    component: 'Mixer',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-filter',
    type: 'filter',
    label: 'Filter',
    category: 'Process Equipment',
    standard: 'ISA-5.1',
    tags: ['filter', 'strainer', 'separator', 'filtration'],
    description: 'Filter for solid-liquid separation',
    searchKeywords: ['filter', 'strainer', 'separator', 'filtration', 'basket'],
    defaultData: {
      label: 'F-101',
      type: 'filter',
      size: 'DN100',
      rating: '100 micron',
      material: 'SS316'
    },
    component: 'Filter',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-separator',
    type: 'separator',
    label: 'Separator',
    category: 'Process Equipment',
    standard: 'ISA-5.1',
    tags: ['separator', 'vessel', 'knockout', 'drum'],
    description: 'Separator vessel for phase separation',
    searchKeywords: ['separator', 'vessel', 'knockout', 'drum', 'scrubber'],
    defaultData: {
      label: 'S-101',
      type: 'separator',
      orientation: 'vertical',
      diameter: '1.5 m',
      height: '4 m'
    },
    component: 'Separator',
    parametric: true,
    convertible: true
  },
  {
    id: 'isa-column',
    type: 'column',
    label: 'Distillation Column',
    category: 'Process Equipment',
    standard: 'ISA-5.1',
    tags: ['column', 'distillation', 'tower', 'fractionation'],
    description: 'Distillation column for component separation',
    searchKeywords: ['column', 'distillation', 'tower', 'fractionation', 'trays', 'packing'],
    defaultData: {
      label: 'C-101',
      type: 'distillation-column',
      diameter: '2 m',
      height: '20 m',
      trays: '30',
      feed: '15'
    },
    component: 'Column',
    parametric: true,
    convertible: true
  }
];

export const ISO14617Catalog: SymbolMetadata[] = [
  // ISO 14617 symbols - implemented in separate file
];

export const UKWaterCatalog: SymbolMetadata[] = [
  // ===== PUMPS =====
  {
    id: 'uk-centrifugal-pump',
    type: 'pump',
    label: 'Centrifugal Pump',
    category: 'Pumps',
    standard: 'UK-Water',
    tags: ['pump', 'centrifugal', 'water', 'uk'],
    description: 'UK Water standard centrifugal pump',
    searchKeywords: ['pump', 'centrifugal', 'water', 'uk', 'thames', 'united utilities'],
    defaultData: {
      label: 'P-001',
      flowRate: '100 l/s',
      head: '50 m',
      power: '15 kW'
    },
    component: 'UKCentrifugalPump',
    parametric: true,
    convertible: true,
    equivalents: {
      'ISA-5.1': 'isa-centrifugal-pump',
      'ISO-14617': 'iso-centrifugal-pump'
    }
  },
  {
    id: 'uk-positive-pump',
    type: 'pump',
    label: 'Positive Displacement Pump',
    category: 'Pumps',
    standard: 'UK-Water',
    tags: ['pump', 'positive', 'displacement', 'uk'],
    description: 'UK Water standard positive displacement pump',
    searchKeywords: ['pump', 'positive', 'displacement', 'volumetric', 'uk'],
    defaultData: {
      label: 'P-002',
      flowRate: '50 l/s',
      pressure: '10 bar'
    },
    component: 'UKPositivePump',
    parametric: true,
    convertible: true
  },
  {
    id: 'uk-submersible-pump',
    type: 'pump',
    label: 'Submersible Pump',
    category: 'Pumps',
    standard: 'UK-Water',
    tags: ['pump', 'submersible', 'borehole', 'well'],
    description: 'Submersible pump for boreholes and wells',
    searchKeywords: ['pump', 'submersible', 'borehole', 'well', 'underwater'],
    defaultData: {
      label: 'P-003',
      flowRate: '80 l/s',
      depth: '100 m'
    },
    component: 'UKSubmersiblePump',
    parametric: true,
    convertible: false
  },

  // ===== VALVES =====
  {
    id: 'uk-gate-valve',
    type: 'valve',
    label: 'Gate Valve',
    category: 'Valves',
    standard: 'UK-Water',
    tags: ['valve', 'gate', 'isolation', 'uk'],
    description: 'UK Water standard gate valve for isolation',
    searchKeywords: ['valve', 'gate', 'isolation', 'shutoff', 'uk'],
    defaultData: {
      label: 'V-001',
      size: 'DN200',
      type: 'gate'
    },
    component: 'UKGateValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'uk-butterfly-valve',
    type: 'valve',
    label: 'Butterfly Valve',
    category: 'Valves',
    standard: 'UK-Water',
    tags: ['valve', 'butterfly', 'control', 'uk'],
    description: 'UK Water standard butterfly valve',
    searchKeywords: ['valve', 'butterfly', 'control', 'throttle', 'uk'],
    defaultData: {
      label: 'V-002',
      size: 'DN300',
      type: 'butterfly'
    },
    component: 'UKButterflyValve',
    parametric: true,
    convertible: true
  },
  {
    id: 'uk-ball-valve',
    type: 'valve',
    label: 'Ball Valve',
    category: 'Valves',
    standard: 'UK-Water',
    tags: ['valve', 'ball', 'quarter-turn', 'uk'],
    description: 'UK Water standard ball valve',
    searchKeywords: ['valve', 'ball', 'quarter', 'turn', 'uk'],
    defaultData: {
      label: 'V-003',
      size: 'DN150',
      type: 'ball'
    },
    component: 'UKBallValve',
    parametric: true,
    convertible: true
  },

  // ===== TANKS & RESERVOIRS =====
  {
    id: 'uk-storage-tank',
    type: 'tank',
    label: 'Storage Tank',
    category: 'Tanks & Reservoirs',
    standard: 'UK-Water',
    tags: ['tank', 'storage', 'water', 'uk'],
    description: 'UK Water standard storage tank',
    searchKeywords: ['tank', 'storage', 'water', 'reservoir', 'uk'],
    defaultData: {
      label: 'T-001',
      capacity: '1000 m³',
      type: 'storage'
    },
    component: 'UKStorageTank',
    parametric: true,
    convertible: true
  },
  {
    id: 'uk-service-reservoir',
    type: 'tank',
    label: 'Service Reservoir',
    category: 'Tanks & Reservoirs',
    standard: 'UK-Water',
    tags: ['reservoir', 'service', 'covered', 'uk'],
    description: 'Covered service reservoir',
    searchKeywords: ['reservoir', 'service', 'covered', 'storage', 'uk'],
    defaultData: {
      label: 'SR-001',
      capacity: '5000 m³',
      type: 'service-reservoir'
    },
    component: 'UKServiceReservoir',
    parametric: true,
    convertible: false
  },

  // ===== TREATMENT EQUIPMENT =====
  {
    id: 'uk-chlorine-dosing',
    type: 'treatment',
    label: 'Chlorine Dosing',
    category: 'Treatment Equipment',
    standard: 'UK-Water',
    tags: ['chlorine', 'dosing', 'disinfection', 'treatment'],
    description: 'Chlorine dosing system for disinfection',
    searchKeywords: ['chlorine', 'dosing', 'disinfection', 'chemical', 'treatment'],
    defaultData: {
      label: 'CL-001',
      doseRate: '2 mg/l',
      type: 'chlorine-dosing'
    },
    component: 'UKChlorineDosing',
    parametric: true,
    convertible: false
  },
  {
    id: 'uk-sand-filter',
    type: 'treatment',
    label: 'Sand Filter',
    category: 'Treatment Equipment',
    standard: 'UK-Water',
    tags: ['filter', 'sand', 'treatment', 'uk'],
    description: 'Rapid gravity sand filter',
    searchKeywords: ['filter', 'sand', 'rapid', 'gravity', 'treatment'],
    defaultData: {
      label: 'F-001',
      flowRate: '100 l/s',
      area: '25 m²'
    },
    component: 'UKSandFilter',
    parametric: true,
    convertible: false
  },
  {
    id: 'uk-uv-disinfection',
    type: 'treatment',
    label: 'UV Disinfection',
    category: 'Treatment Equipment',
    standard: 'UK-Water',
    tags: ['uv', 'disinfection', 'ultraviolet', 'treatment'],
    description: 'Ultraviolet disinfection system',
    searchKeywords: ['uv', 'ultraviolet', 'disinfection', 'treatment', 'lamp'],
    defaultData: {
      label: 'UV-001',
      dose: '40 mJ/cm²',
      flowRate: '200 l/s'
    },
    component: 'UKUVDisinfection',
    parametric: true,
    convertible: false
  },

  // ===== METERS & INSTRUMENTS =====
  {
    id: 'uk-flow-meter',
    type: 'instrument',
    label: 'Flow Meter',
    category: 'Meters & Instruments',
    standard: 'UK-Water',
    tags: ['meter', 'flow', 'measurement', 'uk'],
    description: 'UK Water standard flow meter',
    searchKeywords: ['meter', 'flow', 'measurement', 'instrument', 'uk'],
    defaultData: {
      label: 'FM-001',
      range: '0-500 l/s',
      accuracy: '±1%'
    },
    component: 'UKFlowMeter',
    parametric: true,
    convertible: true
  },
  {
    id: 'uk-pressure-gauge',
    type: 'instrument',
    label: 'Pressure Gauge',
    category: 'Meters & Instruments',
    standard: 'UK-Water',
    tags: ['gauge', 'pressure', 'measurement', 'uk'],
    description: 'UK Water standard pressure gauge',
    searchKeywords: ['gauge', 'pressure', 'measurement', 'instrument', 'uk'],
    defaultData: {
      label: 'PG-001',
      range: '0-16 bar',
      accuracy: '±0.5%'
    },
    component: 'UKPressureGauge',
    parametric: true,
    convertible: true
  },
  {
    id: 'uk-level-sensor',
    type: 'instrument',
    label: 'Level Sensor',
    category: 'Meters & Instruments',
    standard: 'UK-Water',
    tags: ['sensor', 'level', 'measurement', 'uk'],
    description: 'UK Water standard level sensor',
    searchKeywords: ['sensor', 'level', 'measurement', 'probe', 'uk'],
    defaultData: {
      label: 'LS-001',
      range: '0-10 m',
      type: 'ultrasonic'
    },
    component: 'UKLevelSensor',
    parametric: true,
    convertible: true
  },

  // ===== SPECIAL EQUIPMENT =====
  {
    id: 'uk-booster-set',
    type: 'equipment',
    label: 'Booster Set',
    category: 'Special Equipment',
    standard: 'UK-Water',
    tags: ['booster', 'pump', 'set', 'vsd'],
    description: 'Variable speed booster pump set',
    searchKeywords: ['booster', 'pump', 'set', 'variable', 'speed', 'vsd'],
    defaultData: {
      label: 'BS-001',
      pumps: 3,
      flowRate: '300 l/s',
      pressure: '6 bar'
    },
    component: 'UKBoosterSet',
    parametric: true,
    convertible: false
  },
  {
    id: 'uk-air-valve',
    type: 'valve',
    label: 'Air Valve',
    category: 'Special Equipment',
    standard: 'UK-Water',
    tags: ['valve', 'air', 'release', 'vacuum'],
    description: 'Air release and vacuum valve',
    searchKeywords: ['valve', 'air', 'release', 'vacuum', 'vent'],
    defaultData: {
      label: 'AV-001',
      size: 'DN100',
      type: 'double-air'
    },
    component: 'UKAirValve',
    parametric: true,
    convertible: false
  },
  {
    id: 'uk-washout-valve',
    type: 'valve',
    label: 'Washout Valve',
    category: 'Special Equipment',
    standard: 'UK-Water',
    tags: ['valve', 'washout', 'drain', 'flush'],
    description: 'Washout valve for pipeline flushing',
    searchKeywords: ['valve', 'washout', 'drain', 'flush', 'clean'],
    defaultData: {
      label: 'WO-001',
      size: 'DN150',
      type: 'washout'
    },
    component: 'UKWashoutValve',
    parametric: true,
    convertible: false
  }
];

// Export catalog by standard for easy filtering
export const SymbolCatalog = {
  'ISA-5.1': ISA51Catalog,
  'ISO-14617': ISO14617Catalog,
  'UK-Water': UKWaterCatalog
};

// Helper function to search symbols
export function searchSymbols(
  query: string,
  standard?: 'ISA-5.1' | 'ISO-14617' | 'UK-Water',
  category?: string,
  tags?: string[]
): SymbolMetadata[] {
  let symbols = standard
    ? SymbolCatalog[standard]
    : [...SymbolCatalog['ISA-5.1'], ...SymbolCatalog['ISO-14617'], ...SymbolCatalog['UK-Water']];

  // Filter by category
  if (category) {
    symbols = symbols.filter(s => s.category === category);
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    symbols = symbols.filter(s => tags.some(tag => s.tags.includes(tag)));
  }

  // Search by query
  if (query) {
    const lowerQuery = query.toLowerCase();
    symbols = symbols.filter(s =>
      s.label.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.searchKeywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
      s.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  return symbols;
}

// Get unique categories
export function getCategories(standard?: 'ISA-5.1' | 'ISO-14617' | 'UK-Water'): string[] {
  const symbols = standard
    ? SymbolCatalog[standard]
    : [...SymbolCatalog['ISA-5.1'], ...SymbolCatalog['ISO-14617'], ...SymbolCatalog['UK-Water']];

  const categories = new Set(symbols.map(s => s.category));
  return Array.from(categories).sort();
}

// Get all unique tags
export function getAllTags(standard?: 'ISA-5.1' | 'ISO-14617' | 'UK-Water'): string[] {
  const symbols = standard
    ? SymbolCatalog[standard]
    : [...SymbolCatalog['ISA-5.1'], ...SymbolCatalog['ISO-14617'], ...SymbolCatalog['UK-Water']];

  const tagSet = new Set<string>();
  symbols.forEach(s => s.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export default SymbolCatalog;