/**
 * Connection Point Management System
 * Defines types and interfaces for symbol connection points in P&ID diagrams
 */

import { Position } from 'reactflow';

/**
 * Connection point types based on P&ID standards
 */
export enum ConnectionPointType {
  // Process connections
  PROCESS_INLET = 'process_inlet',
  PROCESS_OUTLET = 'process_outlet',

  // Utility connections
  UTILITY_STEAM = 'utility_steam',
  UTILITY_WATER = 'utility_water',
  UTILITY_AIR = 'utility_air',
  UTILITY_NITROGEN = 'utility_nitrogen',
  UTILITY_POWER = 'utility_power',

  // Signal connections
  SIGNAL_ANALOG = 'signal_analog',
  SIGNAL_DIGITAL = 'signal_digital',
  SIGNAL_PNEUMATIC = 'signal_pneumatic',

  // Mechanical connections
  MECHANICAL_SHAFT = 'mechanical_shaft',
  MECHANICAL_COUPLING = 'mechanical_coupling',

  // Drainage and venting
  DRAIN = 'drain',
  VENT = 'vent',

  // Generic connections
  GENERIC = 'generic'
}

/**
 * Connection point direction/orientation
 */
export enum ConnectionDirection {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
  NORTHEAST = 'northeast',
  NORTHWEST = 'northwest',
  SOUTHEAST = 'southeast',
  SOUTHWEST = 'southwest'
}

/**
 * Pressure ratings following international standards
 */
export enum PressureRating {
  PN10 = 'PN10',
  PN16 = 'PN16',
  PN25 = 'PN25',
  PN40 = 'PN40',
  PN63 = 'PN63',
  PN100 = 'PN100',
  CLASS_150 = 'Class150',
  CLASS_300 = 'Class300',
  CLASS_600 = 'Class600',
  CLASS_900 = 'Class900',
  CLASS_1500 = 'Class1500',
  CLASS_2500 = 'Class2500'
}

/**
 * Standard pipe sizes (DN - Nominal Diameter)
 */
export type PipeSize =
  | 'DN15' | 'DN20' | 'DN25' | 'DN32' | 'DN40' | 'DN50'
  | 'DN65' | 'DN80' | 'DN100' | 'DN125' | 'DN150' | 'DN200'
  | 'DN250' | 'DN300' | 'DN350' | 'DN400' | 'DN450' | 'DN500'
  | 'DN600' | 'DN700' | 'DN800' | 'DN900' | 'DN1000';

/**
 * Connection point validation rules
 */
export interface ConnectionValidation {
  /** Allowed connection types that can connect to this point */
  compatibleTypes: ConnectionPointType[];
  /** Minimum pipe size allowed */
  minSize?: PipeSize;
  /** Maximum pipe size allowed */
  maxSize?: PipeSize;
  /** Required pressure rating */
  requiredRating?: PressureRating;
  /** Whether this connection is mandatory */
  isRequired: boolean;
  /** Whether multiple connections are allowed */
  allowMultiple: boolean;
  /** Custom validation function */
  customValidator?: (source: ConnectionPoint, target: ConnectionPoint) => boolean;
}

/**
 * Main ConnectionPoint interface
 */
export interface ConnectionPoint {
  /** Unique identifier for the connection point */
  id: string;

  /** Display label for the connection point */
  label?: string;

  /** Type of connection */
  type: ConnectionPointType;

  /** Position relative to the symbol (0-1 range) */
  position: {
    x: number; // 0 = left edge, 0.5 = center, 1 = right edge
    y: number; // 0 = top edge, 0.5 = center, 1 = bottom edge
  };

  /** Direction the connection faces */
  direction: ConnectionDirection;

  /** Pipe/connection size */
  size?: PipeSize;

  /** Pressure rating */
  rating?: PressureRating;

  /** Validation rules for this connection point */
  validation: ConnectionValidation;

  /** Whether this connection point is currently connected */
  isConnected: boolean;

  /** IDs of connected edges */
  connectedEdges: string[];

  /** Visual styling for the connection point */
  style?: ConnectionPointStyle;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Visual styling for connection points
 */
export interface ConnectionPointStyle {
  /** Color of the connection point indicator */
  color?: string;
  /** Size of the connection point (radius in pixels) */
  size?: number;
  /** Whether to show label */
  showLabel?: boolean;
  /** Label position relative to point */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Custom CSS classes */
  className?: string;
  /** Whether to animate the connection point */
  animated?: boolean;
  /** Icon to display (if any) */
  icon?: string;
}

/**
 * Connection point configuration for a symbol
 */
export interface SymbolConnectionConfig {
  /** Symbol type identifier */
  symbolType: string;
  /** Array of connection points for this symbol */
  connectionPoints: ConnectionPoint[];
  /** Default connection point style for this symbol */
  defaultStyle?: ConnectionPointStyle;
  /** Whether to auto-generate connection points based on symbol type */
  autoGenerate?: boolean;
}

/**
 * Connection compatibility matrix entry
 */
export interface ConnectionCompatibility {
  source: ConnectionPointType;
  target: ConnectionPointType;
  isCompatible: boolean;
  requiresAdapter?: boolean;
  adapterType?: string;
}

/**
 * Connection point manager configuration
 */
export interface ConnectionManagerConfig {
  /** Whether to show connection points on hover */
  showOnHover: boolean;
  /** Whether to show connection points when selected */
  showOnSelect: boolean;
  /** Whether to snap connections to points */
  snapToPoint: boolean;
  /** Snap distance in pixels */
  snapDistance: number;
  /** Whether to validate connections */
  validateConnections: boolean;
  /** Whether to highlight valid connection points */
  highlightValidPoints: boolean;
  /** Default connection point style */
  defaultStyle: ConnectionPointStyle;
}

/**
 * Connection validation result
 */
export interface ConnectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

/**
 * Helper function to calculate absolute position from relative position
 */
export function calculateAbsolutePosition(
  relativePos: { x: number; y: number },
  nodeWidth: number,
  nodeHeight: number,
  nodePosition: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: nodePosition.x + (relativePos.x * nodeWidth),
    y: nodePosition.y + (relativePos.y * nodeHeight)
  };
}

/**
 * Helper function to get ReactFlow handle position from ConnectionDirection
 */
export function getHandlePosition(direction: ConnectionDirection): Position {
  const positionMap: Record<ConnectionDirection, Position> = {
    [ConnectionDirection.NORTH]: Position.Top,
    [ConnectionDirection.SOUTH]: Position.Bottom,
    [ConnectionDirection.EAST]: Position.Right,
    [ConnectionDirection.WEST]: Position.Left,
    [ConnectionDirection.NORTHEAST]: Position.Top,
    [ConnectionDirection.NORTHWEST]: Position.Top,
    [ConnectionDirection.SOUTHEAST]: Position.Bottom,
    [ConnectionDirection.SOUTHWEST]: Position.Bottom,
  };
  return positionMap[direction];
}

/**
 * Helper to generate unique connection point ID
 */
export function generateConnectionPointId(nodeId: string, index: number): string {
  return `${nodeId}_cp_${index}`;
}

/**
 * Default connection validation rules by type
 */
export const DEFAULT_VALIDATION_RULES: Record<ConnectionPointType, Partial<ConnectionValidation>> = {
  [ConnectionPointType.PROCESS_INLET]: {
    compatibleTypes: [ConnectionPointType.PROCESS_OUTLET, ConnectionPointType.GENERIC],
    isRequired: true,
    allowMultiple: false
  },
  [ConnectionPointType.PROCESS_OUTLET]: {
    compatibleTypes: [ConnectionPointType.PROCESS_INLET, ConnectionPointType.GENERIC],
    isRequired: true,
    allowMultiple: false
  },
  [ConnectionPointType.SIGNAL_ANALOG]: {
    compatibleTypes: [ConnectionPointType.SIGNAL_ANALOG],
    isRequired: false,
    allowMultiple: true
  },
  [ConnectionPointType.SIGNAL_DIGITAL]: {
    compatibleTypes: [ConnectionPointType.SIGNAL_DIGITAL],
    isRequired: false,
    allowMultiple: true
  },
  [ConnectionPointType.SIGNAL_PNEUMATIC]: {
    compatibleTypes: [ConnectionPointType.SIGNAL_PNEUMATIC],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.UTILITY_STEAM]: {
    compatibleTypes: [ConnectionPointType.UTILITY_STEAM],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.UTILITY_WATER]: {
    compatibleTypes: [ConnectionPointType.UTILITY_WATER],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.UTILITY_AIR]: {
    compatibleTypes: [ConnectionPointType.UTILITY_AIR],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.UTILITY_NITROGEN]: {
    compatibleTypes: [ConnectionPointType.UTILITY_NITROGEN],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.UTILITY_POWER]: {
    compatibleTypes: [ConnectionPointType.UTILITY_POWER],
    isRequired: false,
    allowMultiple: true
  },
  [ConnectionPointType.MECHANICAL_SHAFT]: {
    compatibleTypes: [ConnectionPointType.MECHANICAL_SHAFT, ConnectionPointType.MECHANICAL_COUPLING],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.MECHANICAL_COUPLING]: {
    compatibleTypes: [ConnectionPointType.MECHANICAL_SHAFT, ConnectionPointType.MECHANICAL_COUPLING],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.DRAIN]: {
    compatibleTypes: [ConnectionPointType.PROCESS_INLET],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.VENT]: {
    compatibleTypes: [ConnectionPointType.PROCESS_INLET],
    isRequired: false,
    allowMultiple: false
  },
  [ConnectionPointType.GENERIC]: {
    compatibleTypes: Object.values(ConnectionPointType),
    isRequired: false,
    allowMultiple: true
  }
};