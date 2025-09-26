import { ComponentType, ReactElement, memo } from 'react';
import type { NodeProps, XYPosition } from 'reactflow';

/**
 * Connection point types for process equipment symbols
 */
export enum ConnectionType {
  INLET = 'inlet',
  OUTLET = 'outlet',
  VENT = 'vent',
  DRAIN = 'drain',
  INSTRUMENTATION = 'instrumentation',
  CONTROL = 'control',
  UTILITY = 'utility',
  PROCESS = 'process',
}

/**
 * Connection point interface with validation rules
 */
export interface IConnectionPoint {
  id: string;
  type: ConnectionType;
  position: XYPosition;
  direction: number; // 0-360 degrees
  compatible: ConnectionType[];
  required: boolean;
  description?: string;
  flowRate?: number;
  pressure?: number;
  temperature?: number;
  material?: string;
}

/**
 * Symbol metadata structure for equipment properties
 */
export interface ISymbolMetadata {
  // Equipment identification
  tagNumber: string;
  name: string;
  category: string;
  subCategory?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;

  // Process parameters
  capacity?: number;
  capacityUnit?: string;
  pressure?: number;
  pressureUnit?: string;
  temperature?: number;
  temperatureUnit?: string;
  flowRate?: number;
  flowRateUnit?: string;
  power?: number;
  powerUnit?: string;

  // Physical properties
  material?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };

  // Operational data
  status?: 'operating' | 'idle' | 'maintenance' | 'fault' | 'offline';
  efficiency?: number;
  utilization?: number;
  runningHours?: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;

  // Standards and compliance
  standard?: string;
  certification?: string[];
  safetyRating?: string;
  hazardClass?: string;

  // Custom properties
  customProperties?: Record<string, unknown>;
}

/**
 * Base data interface for all process equipment symbols
 */
export interface ISymbolBaseData {
  // Core properties
  id: string;
  label: string;
  symbolType: string;
  symbolSubType?: string;

  // Visual properties
  rotation?: number;
  scale?: number;
  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  animated?: boolean;

  // Connection points
  connectionPoints: IConnectionPoint[];

  // Metadata
  metadata: ISymbolMetadata;

  // Layer and grouping
  layer?: string;
  group?: string;
  locked?: boolean;
  visible?: boolean;

  // Performance optimization
  levelOfDetail?: 'high' | 'medium' | 'low';
  renderPriority?: number;
}

/**
 * Props interface for symbol components
 */
export interface ISymbolProps<T extends ISymbolBaseData = ISymbolBaseData> extends NodeProps<T> {
  onConnectionValidate?: (source: IConnectionPoint, target: IConnectionPoint) => boolean;
  onMetadataChange?: (metadata: ISymbolMetadata) => void;
  renderMode?: 'performance' | 'quality';
}

/**
 * Symbol validation result
 */
export interface ISymbolValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Abstract base class for all process equipment symbols
 */
export abstract class SymbolBase<T extends ISymbolBaseData = ISymbolBaseData> {
  protected data: T;
  protected id: string;

  constructor(data: T) {
    this.data = data;
    this.id = data.id;
  }

  /**
   * Validate symbol configuration
   */
  public validate(): ISymbolValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!this.data.id) {
      errors.push('Symbol ID is required');
    }
    if (!this.data.label) {
      warnings.push('Symbol label is missing');
    }
    if (!this.data.symbolType) {
      errors.push('Symbol type is required');
    }

    // Validate connection points
    const connectionValidation = this.validateConnectionPoints();
    errors.push(...connectionValidation.errors);
    warnings.push(...connectionValidation.warnings);

    // Validate metadata
    const metadataValidation = this.validateMetadata();
    errors.push(...metadataValidation.errors);
    warnings.push(...metadataValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate connection points
   */
  protected validateConnectionPoints(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const connectionIds = new Set<string>();

    for (const point of this.data.connectionPoints) {
      // Check for duplicate IDs
      if (connectionIds.has(point.id)) {
        errors.push(`Duplicate connection point ID: ${point.id}`);
      }
      connectionIds.add(point.id);

      // Validate required connections
      if (point.required && !point.compatible.length) {
        errors.push(`Required connection ${point.id} has no compatible types`);
      }

      // Validate direction
      if (point.direction < 0 || point.direction > 360) {
        errors.push(`Invalid direction for connection ${point.id}: ${point.direction}`);
      }

      // Check for missing descriptions on required connections
      if (point.required && !point.description) {
        warnings.push(`Required connection ${point.id} lacks description`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate metadata
   */
  protected validateMetadata(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata = this.data.metadata;

    // Validate tag number format
    if (!metadata.tagNumber || !/^[A-Z0-9-]+$/.test(metadata.tagNumber)) {
      errors.push('Invalid tag number format');
    }

    // Validate pressure/temperature ranges
    if (metadata.pressure !== undefined && metadata.pressure < 0) {
      errors.push('Pressure cannot be negative');
    }
    if (metadata.temperature !== undefined && metadata.temperature < -273.15) {
      errors.push('Temperature below absolute zero');
    }

    // Validate capacity
    if (metadata.capacity !== undefined && metadata.capacity <= 0) {
      warnings.push('Capacity should be positive');
    }

    // Check maintenance schedule
    if (metadata.lastMaintenance && metadata.nextMaintenance) {
      if (metadata.lastMaintenance > metadata.nextMaintenance) {
        errors.push('Next maintenance date is before last maintenance');
      }
    }

    return { errors, warnings };
  }

  /**
   * Check if two connection points are compatible
   */
  public static isConnectionCompatible(
    source: IConnectionPoint,
    target: IConnectionPoint
  ): boolean {
    // Check if source type is compatible with target
    if (!target.compatible.includes(source.type)) {
      return false;
    }

    // Check if target type is compatible with source
    if (!source.compatible.includes(target.type)) {
      return false;
    }

    // Additional validation for specific connection types
    if (source.type === ConnectionType.INLET && target.type === ConnectionType.INLET) {
      return false; // Cannot connect two inlets
    }
    if (source.type === ConnectionType.OUTLET && target.type === ConnectionType.OUTLET) {
      return false; // Cannot connect two outlets
    }

    return true;
  }

  /**
   * Calculate connection point position in world coordinates
   */
  public getConnectionWorldPosition(
    connectionId: string,
    nodePosition: XYPosition
  ): XYPosition | null {
    const connection = this.data.connectionPoints.find((cp) => cp.id === connectionId);
    if (!connection) {
      return null;
    }

    const scale = this.data.scale || 1;
    const rotation = this.data.rotation || 0;

    // Apply rotation transformation
    const radians = (rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const x = connection.position.x * scale;
    const y = connection.position.y * scale;

    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;

    return {
      x: nodePosition.x + rotatedX,
      y: nodePosition.y + rotatedY,
    };
  }

  /**
   * Get metadata for display
   */
  public getDisplayMetadata(): Record<string, string> {
    const metadata = this.data.metadata;
    const display: Record<string, string> = {};

    display['Tag'] = metadata.tagNumber;
    display['Name'] = metadata.name;

    if (metadata.capacity !== undefined) {
      display['Capacity'] = `${metadata.capacity} ${metadata.capacityUnit || ''}`.trim();
    }
    if (metadata.pressure !== undefined) {
      display['Pressure'] = `${metadata.pressure} ${metadata.pressureUnit || ''}`.trim();
    }
    if (metadata.temperature !== undefined) {
      display['Temperature'] = `${metadata.temperature} ${metadata.temperatureUnit || ''}`.trim();
    }
    if (metadata.flowRate !== undefined) {
      display['Flow Rate'] = `${metadata.flowRate} ${metadata.flowRateUnit || ''}`.trim();
    }
    if (metadata.status) {
      display['Status'] = metadata.status.charAt(0).toUpperCase() + metadata.status.slice(1);
    }

    return display;
  }

  /**
   * Clone symbol with new properties
   */
  public clone(overrides: Partial<T>): SymbolBase<T> {
    const clonedData = {
      ...this.data,
      ...overrides,
      id: overrides.id || `${this.data.id}_clone_${Date.now()}`,
    };
    return new (this.constructor as any)(clonedData);
  }

  /**
   * Abstract method for rendering the symbol
   */
  public abstract render(): ReactElement;

  /**
   * Get level of detail for rendering optimization
   */
  public getLevelOfDetail(zoom: number): 'high' | 'medium' | 'low' {
    if (zoom >= 1.5) {
      return 'high';
    } else if (zoom >= 0.75) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

/**
 * Create a symbol component from a base class
 */
export function createSymbolComponent<T extends ISymbolBaseData>(
  BaseClass: new (data: T) => SymbolBase<T>
): ComponentType<ISymbolProps<T>> {
  return memo<ISymbolProps<T>>((props: ISymbolProps<T>) => {
    const instance = new BaseClass(props.data);
    return instance.render();
  });
}

export default SymbolBase;