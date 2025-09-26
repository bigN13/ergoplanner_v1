import type { BaseSymbolData } from '../BaseSymbolNode';

/**
 * Pipe size standards
 */
export enum PipeSizeStandard {
  DN = 'DN', // Metric (Diameter Nominal)
  NPS = 'NPS', // Imperial (Nominal Pipe Size)
  OD = 'OD', // Outside Diameter
}

/**
 * Pressure rating standards
 */
export enum PressureRatingStandard {
  PN = 'PN', // Pressure Nominal (bar)
  CLASS = 'CLASS', // ANSI/ASME Class (150, 300, 600, etc.)
  SDR = 'SDR', // Standard Dimension Ratio
  SCHEDULE = 'SCHEDULE', // Pipe Schedule (40, 80, 160, etc.)
}

/**
 * Connection types for piping components
 */
export enum PipingConnectionType {
  FLANGED = 'flanged',
  THREADED = 'threaded',
  SOCKET_WELD = 'socket-weld',
  BUTT_WELD = 'butt-weld',
  COMPRESSION = 'compression',
  GROOVED = 'grooved',
  PUSH_FIT = 'push-fit',
  SOLVENT_WELD = 'solvent-weld',
  BRAZED = 'brazed',
  SOLDERED = 'soldered',
}

/**
 * Piping material specifications
 */
export interface PipingMaterial {
  code: string; // e.g., "CS", "SS316", "PVC"
  name: string; // e.g., "Carbon Steel", "Stainless Steel 316"
  specification?: string; // e.g., "ASTM A106 Gr.B"
  corrosionAllowance?: number; // mm
  maxTemperature?: number; // °C
  minTemperature?: number; // °C
  maxPressure?: number; // bar
  compatibility?: string[]; // Compatible fluids
}

/**
 * Pipe size specification
 */
export interface PipeSize {
  nominal: number; // Nominal size value
  standard: PipeSizeStandard;
  outerDiameter?: number; // mm
  innerDiameter?: number; // mm
  wallThickness?: number; // mm
  schedule?: string; // e.g., "40", "80", "STD", "XS"
}

/**
 * Pressure rating specification
 */
export interface PressureRating {
  value: number;
  standard: PressureRatingStandard;
  temperature?: number; // Reference temperature °C
  material?: string; // Material for rating
}

/**
 * Flow characteristics
 */
export interface FlowCharacteristics {
  flowCoefficient?: number; // Cv or Kv
  pressureDrop?: number; // bar
  flowRate?: number; // m³/h
  velocity?: number; // m/s
  reynoldsNumber?: number;
  flowPattern?: 'laminar' | 'transitional' | 'turbulent';
}

/**
 * Base interface for all piping components
 */
export interface IPipingComponent extends BaseSymbolData {
  // Component classification
  componentType: 'valve' | 'fitting' | 'flange' | 'instrument' | 'specialty';
  subType: string; // e.g., 'ball-valve', 'elbow-90', 'weld-neck-flange'

  // Size and rating
  size: PipeSize;
  rating: PressureRating;

  // Material specifications
  material: PipingMaterial;

  // Connection specifications
  inletConnection: PipingConnectionType;
  outletConnection: PipingConnectionType;

  // Operating conditions
  operatingPressure?: number; // bar
  operatingTemperature?: number; // °C
  designPressure?: number; // bar
  designTemperature?: number; // °C
  testPressure?: number; // bar

  // Flow characteristics
  flowCharacteristics?: FlowCharacteristics;

  // Installation details
  orientation?: 'horizontal' | 'vertical' | 'any';
  flowDirection?: 'unidirectional' | 'bidirectional';
  installationNotes?: string;

  // Standards and compliance
  designStandard?: string; // e.g., "API 6D", "ASME B16.34"
  testingStandard?: string; // e.g., "API 598", "EN 12266"
  certification?: string[]; // e.g., ["CE", "PED", "API"]

  // Maintenance
  lastInspection?: Date;
  nextInspection?: Date;
  maintenanceInterval?: number; // hours
  serviceLife?: number; // years

  // Documentation
  datasheet?: string; // URL or reference
  drawingNumber?: string;
  purchaseOrder?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
}

/**
 * Valve-specific interface
 */
export interface IValveComponent extends IPipingComponent {
  componentType: 'valve';

  // Valve operation
  operation: 'manual' | 'gear' | 'electric' | 'pneumatic' | 'hydraulic';
  position: 'open' | 'closed' | 'throttled';
  positionPercent?: number; // 0-100%

  // Valve characteristics
  valvePattern?: 'straight' | 'angle' | 'y-pattern';
  portConfiguration?: 'full-port' | 'reduced-port' | 'multi-port';
  trimMaterial?: string;
  seatMaterial?: string;
  packingMaterial?: string;

  // Actuation
  actuated: boolean;
  actuatorType?: string;
  failPosition?: 'fail-open' | 'fail-closed' | 'fail-in-place' | 'fail-last';
  actuatorPower?: number; // W or bar
  strokeTime?: number; // seconds

  // Control features
  positioner?: boolean;
  limitSwitch?: boolean;
  solenoid?: boolean;
  handwheel?: boolean;
  lockout?: boolean;

  // Performance
  leakageClass?: string; // e.g., "Class VI", "Class IV"
  rangeability?: number; // Turndown ratio
  characteristicCurve?: 'linear' | 'equal-percentage' | 'quick-opening' | 'modified';
}

/**
 * Fitting-specific interface
 */
export interface IFittingComponent extends IPipingComponent {
  componentType: 'fitting';

  // Fitting geometry
  angle?: number; // degrees (for elbows, bends)
  radius?: string; // e.g., "1.5D", "3D" for bend radius
  branches?: number; // Number of branches (for tees, crosses)
  reduction?: {
    inletSize: PipeSize;
    outletSize: PipeSize;
  };

  // Branch connections (for tees, crosses)
  branchConnections?: Array<{
    id: string;
    size: PipeSize;
    angle: number;
    connectionType: PipingConnectionType;
  }>;
}

/**
 * Flange-specific interface
 */
export interface IFlangeComponent extends IPipingComponent {
  componentType: 'flange';

  // Flange type
  flangeType: 'weld-neck' | 'slip-on' | 'socket-weld' | 'lap-joint' | 'threaded' | 'blind';

  // Flange face
  faceType: 'raised-face' | 'flat-face' | 'ring-joint' | 'tongue-groove' | 'male-female';
  faceFinish?: string; // e.g., "125-250 μin", "serrated"

  // Bolting
  boltHoles: number;
  boltSize: string; // e.g., "M20", "3/4 inch"
  boltCircleDiameter: number; // mm
  boltMaterial?: string;

  // Gasket
  gasketType?: string; // e.g., "spiral-wound", "ring-joint", "soft"
  gasketMaterial?: string;
  gasketDimensions?: {
    outerDiameter: number;
    innerDiameter: number;
    thickness: number;
  };

  // Dimensions
  outerDiameter: number; // mm
  thickness: number; // mm
  hubDiameter?: number; // mm (for weld-neck)
  hubLength?: number; // mm (for weld-neck)
}

/**
 * Connection validation result
 */
export interface ConnectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations?: string[];
}

/**
 * Connection validator interface
 */
export interface IPipingConnectionValidator {
  validateConnection(
    source: IPipingComponent,
    target: IPipingComponent,
    connectionPoint?: string
  ): ConnectionValidationResult;

  validateSize(
    sourceSize: PipeSize,
    targetSize: PipeSize,
    allowReduction?: boolean
  ): boolean;

  validateRating(
    sourceRating: PressureRating,
    targetRating: PressureRating
  ): boolean;

  validateMaterial(
    sourceMaterial: PipingMaterial,
    targetMaterial: PipingMaterial,
    allowDissimilar?: boolean
  ): boolean;

  validateConnectionType(
    sourceType: PipingConnectionType,
    targetType: PipingConnectionType
  ): boolean;
}