import { XYPosition } from 'reactflow';

/**
 * Connection point types for P&ID components
 */
export type ConnectionPointType =
  | 'input'
  | 'output'
  | 'bidirectional'
  | 'pump_inlet'
  | 'pump_outlet'
  | 'valve_inlet'
  | 'valve_outlet'
  | 'tank_inlet'
  | 'tank_outlet';

/**
 * Connection point definition
 */
export interface ConnectionPoint {
  id: string;
  nodeId: string;
  type: ConnectionPointType;
  position: XYPosition;
  /** World coordinates (node position + relative position) */
  worldPosition: XYPosition;
  /** Compatible connection types */
  compatibleTypes: ConnectionPointType[];
  /** Whether point is currently occupied */
  isOccupied: boolean;
}

/**
 * Connection compatibility rules
 */
export interface ConnectionCompatibility {
  sourceType: ConnectionPointType;
  targetTypes: ConnectionPointType[];
  bidirectional: boolean;
}

/**
 * Connection preview state
 */
export interface ConnectionPreview {
  sourcePoint: ConnectionPoint;
  targetPoint?: ConnectionPoint;
  cursorPosition: XYPosition;
  isValid: boolean;
  path?: string; // SVG path for preview line
}

/**
 * Auto-connection detection result
 */
export interface ConnectionDetectionResult {
  nearbyPoints: ConnectionPoint[];
  closestPoint?: ConnectionPoint;
  distance: number;
  isWithinSnapDistance: boolean;
}

/**
 * Connection validation result
 */
export interface ConnectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Auto-connector configuration
 */
export interface AutoConnectorConfig {
  /** Distance threshold for snap behavior (px) */
  snapDistance: number;
  /** Enable magnetic snapping */
  enableMagneticSnap: boolean;
  /** Enable connection preview */
  enablePreview: boolean;
  /** Enable automatic routing */
  enableAutoRouting: boolean;
  /** Grid size for snapping */
  gridSize: number;
}

/**
 * Connection state for store
 */
export interface ConnectionState {
  /** Available connection points indexed by node ID */
  connectionPoints: Map<string, ConnectionPoint[]>;
  /** Active connection being created */
  activeConnection?: ConnectionPreview;
  /** Configuration */
  config: AutoConnectorConfig;
  /** Compatibility rules */
  compatibilityRules: ConnectionCompatibility[];
}
