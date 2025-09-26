import type { ISymbolBaseData, IConnectionPoint } from './SymbolBase';
import { ConnectionType } from './SymbolBase';

/**
 * Parametric symbol configuration
 */
export interface IParametricConfig {
  // Size parameters
  baseWidth: number;
  baseHeight: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  scaleStep?: number;

  // Capacity parameters
  capacityMin?: number;
  capacityMax?: number;
  capacityUnit?: string;
  capacityToSizeRatio?: number;

  // Visual variations
  variants?: string[];
  defaultVariant?: string;

  // Connection rules
  connectionRules?: IConnectionRule[];

  // Material options
  materials?: IMaterialOption[];

  // Performance parameters
  performanceClass?: 'light' | 'medium' | 'heavy';
  maxInstances?: number;
}

/**
 * Connection generation rule
 */
export interface IConnectionRule {
  type: ConnectionType;
  count: number | ((size: number) => number);
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  spacing?: number;
  offset?: number;
  required?: boolean;
}

/**
 * Material option for equipment
 */
export interface IMaterialOption {
  id: string;
  name: string;
  properties: {
    density?: number;
    maxPressure?: number;
    maxTemperature?: number;
    corrosionResistance?: string;
    cost?: number;
  };
  visual: {
    color?: string;
    pattern?: string;
    texture?: string;
  };
}

/**
 * Parametric symbol generator for creating dynamic symbols
 */
export class ParametricSymbolGenerator<T extends ISymbolBaseData = ISymbolBaseData> {
  private config: IParametricConfig;

  constructor(config: IParametricConfig) {
    this.config = config;
  }

  /**
   * Generate symbol with specific parameters
   */
  public generate(parameters: {
    capacity?: number;
    width?: number;
    height?: number;
    variant?: string;
    material?: string;
  }): Partial<T> {
    const { capacity, width, height, variant, material } = parameters;

    // Calculate dimensions
    const dimensions = this.calculateDimensions(capacity, width, height);

    // Generate connection points
    const connectionPoints = this.generateConnectionPoints(dimensions);

    // Get material properties
    const materialProps = this.getMaterialProperties(material);

    // Create base symbol data
    const symbolData: Partial<T> = {
      connectionPoints,
      metadata: {
        tagNumber: this.generateTagNumber(),
        name: this.generateName(variant),
        category: 'process-equipment',
        capacity,
        capacityUnit: this.config.capacityUnit,
        material: materialProps?.name,
        dimensions: {
          width: dimensions.width,
          height: dimensions.height,
          depth: dimensions.width * 0.8, // Default depth ratio
          unit: 'mm',
        },
      } as T['metadata'],
      // Visual properties based on material
      fillColor: materialProps?.visual.color,
      strokeColor: '#374151',
      strokeWidth: 2,
    } as Partial<T>;

    return symbolData;
  }

  /**
   * Calculate dimensions based on capacity or explicit size
   */
  private calculateDimensions(
    capacity?: number,
    width?: number,
    height?: number
  ): { width: number; height: number } {
    // If explicit dimensions provided, use them
    if (width && height) {
      return {
        width: this.clampWidth(width),
        height: this.clampHeight(height),
      };
    }

    // Calculate from capacity if provided
    if (capacity && this.config.capacityToSizeRatio) {
      const baseSize = Math.pow(capacity * this.config.capacityToSizeRatio, 1 / 3);

      if (this.config.aspectRatio) {
        return {
          width: this.clampWidth(baseSize),
          height: this.clampHeight(baseSize / this.config.aspectRatio),
        };
      }

      return {
        width: this.clampWidth(baseSize),
        height: this.clampHeight(baseSize),
      };
    }

    // Use base dimensions
    return {
      width: this.config.baseWidth,
      height: this.config.baseHeight,
    };
  }

  /**
   * Clamp width to valid range
   */
  private clampWidth(width: number): number {
    const min = this.config.minWidth || 50;
    const max = this.config.maxWidth || 500;
    return Math.max(min, Math.min(max, width));
  }

  /**
   * Clamp height to valid range
   */
  private clampHeight(height: number): number {
    const min = this.config.minHeight || 50;
    const max = this.config.maxHeight || 500;
    return Math.max(min, Math.min(max, height));
  }

  /**
   * Generate connection points based on rules
   */
  private generateConnectionPoints(dimensions: {
    width: number;
    height: number;
  }): IConnectionPoint[] {
    const points: IConnectionPoint[] = [];

    if (!this.config.connectionRules) {
      // Default connection points
      points.push(
        {
          id: 'inlet',
          type: ConnectionType.INLET,
          position: { x: 0, y: dimensions.height / 2 },
          direction: 180,
          compatible: [ConnectionType.OUTLET, ConnectionType.PROCESS],
          required: true,
          description: 'Main inlet',
        },
        {
          id: 'outlet',
          type: ConnectionType.OUTLET,
          position: { x: dimensions.width, y: dimensions.height / 2 },
          direction: 0,
          compatible: [ConnectionType.INLET, ConnectionType.PROCESS],
          required: true,
          description: 'Main outlet',
        }
      );
      return points;
    }

    // Generate based on rules
    this.config.connectionRules.forEach((rule, ruleIndex) => {
      const count = typeof rule.count === 'function'
        ? rule.count(Math.max(dimensions.width, dimensions.height))
        : rule.count;

      for (let i = 0; i < count; i++) {
        const point = this.createConnectionPoint(rule, i, count, dimensions, ruleIndex);
        points.push(point);
      }
    });

    return points;
  }

  /**
   * Create a single connection point based on rule
   */
  private createConnectionPoint(
    rule: IConnectionRule,
    index: number,
    total: number,
    dimensions: { width: number; height: number },
    ruleIndex: number
  ): IConnectionPoint {
    const offset = rule.offset || 0;

    let x = 0;
    let y = 0;
    let direction = 0;

    switch (rule.position) {
      case 'top':
        x = offset + (dimensions.width - offset * 2) * ((index + 1) / (total + 1));
        y = 0;
        direction = 270;
        break;
      case 'bottom':
        x = offset + (dimensions.width - offset * 2) * ((index + 1) / (total + 1));
        y = dimensions.height;
        direction = 90;
        break;
      case 'left':
        x = 0;
        y = offset + (dimensions.height - offset * 2) * ((index + 1) / (total + 1));
        direction = 180;
        break;
      case 'right':
        x = dimensions.width;
        y = offset + (dimensions.height - offset * 2) * ((index + 1) / (total + 1));
        direction = 0;
        break;
      case 'auto':
        // Distribute around perimeter
        const perimeter = 2 * (dimensions.width + dimensions.height);
        const position = (index / total) * perimeter;

        if (position < dimensions.width) {
          // Top edge
          x = position;
          y = 0;
          direction = 270;
        } else if (position < dimensions.width + dimensions.height) {
          // Right edge
          x = dimensions.width;
          y = position - dimensions.width;
          direction = 0;
        } else if (position < 2 * dimensions.width + dimensions.height) {
          // Bottom edge
          x = dimensions.width - (position - dimensions.width - dimensions.height);
          y = dimensions.height;
          direction = 90;
        } else {
          // Left edge
          x = 0;
          y = dimensions.height - (position - 2 * dimensions.width - dimensions.height);
          direction = 180;
        }
        break;
    }

    return {
      id: `${rule.type}_${ruleIndex}_${index}`,
      type: rule.type,
      position: { x, y },
      direction,
      compatible: this.getCompatibleTypes(rule.type),
      required: rule.required || false,
      description: `${rule.type} connection ${index + 1}`,
    };
  }

  /**
   * Get compatible connection types
   */
  private getCompatibleTypes(type: ConnectionType): ConnectionType[] {
    switch (type) {
      case ConnectionType.INLET:
        return [ConnectionType.OUTLET, ConnectionType.PROCESS];
      case ConnectionType.OUTLET:
        return [ConnectionType.INLET, ConnectionType.PROCESS];
      case ConnectionType.VENT:
        return [ConnectionType.OUTLET, ConnectionType.PROCESS];
      case ConnectionType.DRAIN:
        return [ConnectionType.INLET, ConnectionType.PROCESS];
      case ConnectionType.INSTRUMENTATION:
        return [ConnectionType.CONTROL];
      case ConnectionType.CONTROL:
        return [ConnectionType.INSTRUMENTATION];
      default:
        return [ConnectionType.PROCESS];
    }
  }

  /**
   * Get material properties
   */
  private getMaterialProperties(materialId?: string): IMaterialOption | undefined {
    if (!materialId || !this.config.materials) {
      return undefined;
    }

    return this.config.materials.find((m) => m.id === materialId);
  }

  /**
   * Generate unique tag number
   */
  private generateTagNumber(): string {
    const prefix = 'V'; // Vessel prefix
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate symbol name
   */
  private generateName(variant?: string): string {
    const baseName = 'Process Equipment';
    return variant ? `${baseName} - ${variant}` : baseName;
  }

  /**
   * Create symbol variations
   */
  public createVariations(): Map<string, Partial<T>> {
    const variations = new Map<string, Partial<T>>();

    // Create standard sizes
    const sizes = [
      { name: 'small', capacity: 100 },
      { name: 'medium', capacity: 500 },
      { name: 'large', capacity: 1000 },
      { name: 'xlarge', capacity: 5000 },
    ];

    sizes.forEach((size) => {
      const variants = this.config.variants || ['standard'];

      variants.forEach((variant) => {
        const key = `${size.name}_${variant}`;
        variations.set(
          key,
          this.generate({
            capacity: size.capacity,
            variant,
          })
        );
      });
    });

    return variations;
  }

  /**
   * Batch generate symbols with different parameters
   */
  public batchGenerate(parameterSets: Array<Parameters<typeof this.generate>[0]>): Array<Partial<T>> {
    return parameterSets.map((params) => this.generate(params));
  }

  /**
   * Export configuration for persistence
   */
  public exportConfig(): IParametricConfig {
    return { ...this.config };
  }

  /**
   * Import configuration
   */
  public importConfig(config: IParametricConfig): void {
    this.config = { ...config };
  }

  /**
   * Validate generated symbol
   */
  public validate(symbolData: Partial<T>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate connection points
    if (!symbolData.connectionPoints || symbolData.connectionPoints.length === 0) {
      errors.push('No connection points defined');
    }

    // Validate metadata
    if (!symbolData.metadata) {
      errors.push('Metadata is missing');
    } else {
      if (!symbolData.metadata.tagNumber) {
        errors.push('Tag number is missing');
      }
      if (!symbolData.metadata.name) {
        errors.push('Name is missing');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Factory for creating parametric symbol generators
 */
export class ParametricSymbolFactory {
  private generators: Map<string, ParametricSymbolGenerator> = new Map();

  /**
   * Register a parametric generator
   */
  public register(id: string, config: IParametricConfig): void {
    this.generators.set(id, new ParametricSymbolGenerator(config));
  }

  /**
   * Get a generator by ID
   */
  public get(id: string): ParametricSymbolGenerator | undefined {
    return this.generators.get(id);
  }

  /**
   * Create symbol using generator
   */
  public create<T extends ISymbolBaseData>(
    generatorId: string,
    parameters: Parameters<ParametricSymbolGenerator['generate']>[0]
  ): Partial<T> | null {
    const generator = this.generators.get(generatorId);
    if (!generator) {
      console.error(`Generator ${generatorId} not found`);
      return null;
    }

    return generator.generate(parameters) as Partial<T>;
  }

  /**
   * Create multiple variations
   */
  public createVariations<T extends ISymbolBaseData>(
    generatorId: string
  ): Map<string, Partial<T>> | null {
    const generator = this.generators.get(generatorId);
    if (!generator) {
      console.error(`Generator ${generatorId} not found`);
      return null;
    }

    return generator.createVariations() as Map<string, Partial<T>>;
  }

  /**
   * Export all generator configs
   */
  public exportAll(): Record<string, IParametricConfig> {
    const configs: Record<string, IParametricConfig> = {};

    this.generators.forEach((generator, id) => {
      configs[id] = generator.exportConfig();
    });

    return configs;
  }

  /**
   * Import generator configs
   */
  public importAll(configs: Record<string, IParametricConfig>): void {
    Object.entries(configs).forEach(([id, config]) => {
      this.register(id, config);
    });
  }
}

// Export singleton factory
export const parametricSymbolFactory = new ParametricSymbolFactory();

export default parametricSymbolFactory;