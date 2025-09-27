/**
 * PropertyManager Service
 * Manages property metadata, tag number generation, calculated properties, and validation
 */

import type { Node } from 'reactflow';
import { z } from 'zod';

import type { NodeType } from '@/types/propertySchemas';
import { PROPERTY_SCHEMAS, DEFAULT_PROPERTIES } from '@/types/propertySchemas';

/**
 * Tag number configuration for auto-generation
 */
interface TagNumberConfig {
  prefix: string;
  separator: string;
  currentNumber: number;
  format: string; // e.g., "{prefix}{separator}{number:03d}"
  scope: 'global' | 'project' | 'sheet';
}

/**
 * Calculated property definition
 */
interface CalculatedProperty {
  id: string;
  name: string;
  formula: (values: Record<string, any>) => any;
  dependencies: string[];
  unit?: string;
}

/**
 * Property metadata for enhanced functionality
 */
interface PropertyMetadata {
  id: string;
  displayName: string;
  category: 'identification' | 'process' | 'mechanical' | 'electrical' | 'material' | 'maintenance' | 'safety';
  unit?: string;
  isCalculated?: boolean;
  isRequired?: boolean;
  displayOrder?: number;
  helpText?: string;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: (value: any) => boolean;
  };
}

/**
 * Property template for symbol families
 */
interface PropertyTemplate {
  id: string;
  name: string;
  symbolType: string;
  inheritsFrom?: string;
  properties: PropertyMetadata[];
  calculatedProperties?: CalculatedProperty[];
}

/**
 * Property Manager Service
 */
export class PropertyManager {
  private tagNumberConfigs: Map<string, TagNumberConfig>;
  private usedTagNumbers: Set<string>;
  private propertyTemplates: Map<string, PropertyTemplate>;
  private calculatedProperties: Map<string, CalculatedProperty[]>;
  private propertyCache: Map<string, any>;

  constructor() {
    this.tagNumberConfigs = new Map();
    this.usedTagNumbers = new Set();
    this.propertyTemplates = new Map();
    this.calculatedProperties = new Map();
    this.propertyCache = new Map();
    this.initializeDefaults();
  }

  /**
   * Initialize default configurations
   */
  private initializeDefaults(): void {
    // Initialize tag number configurations
    this.tagNumberConfigs.set('pump', {
      prefix: 'P',
      separator: '-',
      currentNumber: 1,
      format: '{prefix}{separator}{number:03d}',
      scope: 'project'
    });

    this.tagNumberConfigs.set('valve', {
      prefix: 'V',
      separator: '-',
      currentNumber: 1,
      format: '{prefix}{separator}{number:03d}',
      scope: 'project'
    });

    this.tagNumberConfigs.set('tank', {
      prefix: 'TK',
      separator: '-',
      currentNumber: 1,
      format: '{prefix}{separator}{number:03d}',
      scope: 'project'
    });

    this.tagNumberConfigs.set('instrument', {
      prefix: 'I',
      separator: '-',
      currentNumber: 1,
      format: '{prefix}{separator}{number:03d}',
      scope: 'project'
    });

    this.tagNumberConfigs.set('heatExchanger', {
      prefix: 'HX',
      separator: '-',
      currentNumber: 1,
      format: '{prefix}{separator}{number:03d}',
      scope: 'project'
    });

    this.tagNumberConfigs.set('compressor', {
      prefix: 'C',
      separator: '-',
      currentNumber: 1,
      format: '{prefix}{separator}{number:03d}',
      scope: 'project'
    });

    // Initialize calculated properties
    this.initializeCalculatedProperties();

    // Initialize property templates
    this.initializePropertyTemplates();
  }

  /**
   * Initialize calculated properties for different node types
   */
  private initializeCalculatedProperties(): void {
    // Pump calculated properties
    this.calculatedProperties.set('pump', [
      {
        id: 'hydraulicPower',
        name: 'Hydraulic Power',
        formula: (values) => {
          const flowRate = parseFloat(values.pumpFlowRate) || 0;
          const head = parseFloat(values.head) || 0;
          const density = parseFloat(values.density) || 1000; // kg/m³
          const gravity = 9.81;
          return (flowRate * head * density * gravity) / 3600000; // kW
        },
        dependencies: ['pumpFlowRate', 'head', 'density'],
        unit: 'kW'
      },
      {
        id: 'shaftPower',
        name: 'Shaft Power',
        formula: (values) => {
          const hydraulicPower = values.hydraulicPower || 0;
          const efficiency = parseFloat(values.efficiency) || 75;
          return hydraulicPower / (efficiency / 100);
        },
        dependencies: ['hydraulicPower', 'efficiency'],
        unit: 'kW'
      },
      {
        id: 'npshAvailable',
        name: 'NPSH Available',
        formula: (values) => {
          const atmosphericPressure = 10.33; // m of water at sea level
          const staticHead = parseFloat(values.staticHead) || 0;
          const vaporPressure = parseFloat(values.vaporPressure) || 0.5;
          const frictionLoss = parseFloat(values.frictionLoss) || 0;
          return atmosphericPressure + staticHead - vaporPressure - frictionLoss;
        },
        dependencies: ['staticHead', 'vaporPressure', 'frictionLoss'],
        unit: 'm'
      }
    ]);

    // Valve calculated properties
    this.calculatedProperties.set('valve', [
      {
        id: 'pressureDrop',
        name: 'Pressure Drop',
        formula: (values) => {
          const flowRate = parseFloat(values.flowRate) || 0;
          const cvValue = parseFloat(values.cvValue) || 1;
          const specificGravity = parseFloat(values.specificGravity) || 1;
          return Math.pow(flowRate / cvValue, 2) * specificGravity;
        },
        dependencies: ['flowRate', 'cvValue', 'specificGravity'],
        unit: 'bar'
      }
    ]);

    // Heat exchanger calculated properties
    this.calculatedProperties.set('heatExchanger', [
      {
        id: 'lmtd',
        name: 'Log Mean Temperature Difference',
        formula: (values) => {
          const hotIn = parseFloat(values.shellSideTemperatureIn) || 0;
          const hotOut = parseFloat(values.shellSideTemperatureOut) || 0;
          const coldIn = parseFloat(values.tubeSideTemperatureIn) || 0;
          const coldOut = parseFloat(values.tubeSideTemperatureOut) || 0;

          const deltaT1 = hotIn - coldOut;
          const deltaT2 = hotOut - coldIn;

          if (deltaT1 === deltaT2) return deltaT1;
          return (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
        },
        dependencies: [
          'shellSideTemperatureIn',
          'shellSideTemperatureOut',
          'tubeSideTemperatureIn',
          'tubeSideTemperatureOut'
        ],
        unit: '°C'
      },
      {
        id: 'calculatedHeatDuty',
        name: 'Calculated Heat Duty',
        formula: (values) => {
          const area = parseFloat(values.area) || 0;
          const overallHTC = parseFloat(values.overallHeatTransferCoeff) || 0;
          const lmtd = values.lmtd || 0;
          return area * overallHTC * lmtd;
        },
        dependencies: ['area', 'overallHeatTransferCoeff', 'lmtd'],
        unit: 'kW'
      }
    ]);

    // Pipe calculated properties
    this.calculatedProperties.set('pipe', [
      {
        id: 'reynoldsNumber',
        name: 'Reynolds Number',
        formula: (values) => {
          const velocity = parseFloat(values.velocity) || 0;
          const diameter = parseFloat(values.diameter) || 0;
          const viscosity = parseFloat(values.viscosity) || 0.001; // Pa·s
          const density = parseFloat(values.density) || 1000; // kg/m³
          return (density * velocity * (diameter / 1000)) / viscosity;
        },
        dependencies: ['velocity', 'diameter', 'viscosity', 'density'],
        unit: ''
      },
      {
        id: 'flowRegime',
        name: 'Flow Regime',
        formula: (values) => {
          const re = values.reynoldsNumber || 0;
          if (re < 2000) return 'Laminar';
          if (re < 4000) return 'Transitional';
          return 'Turbulent';
        },
        dependencies: ['reynoldsNumber'],
        unit: ''
      }
    ]);
  }

  /**
   * Initialize property templates
   */
  private initializePropertyTemplates(): void {
    // Pump template
    this.propertyTemplates.set('pump', {
      id: 'pump_template',
      name: 'Pump Properties',
      symbolType: 'pump',
      properties: [
        {
          id: 'tagNumber',
          displayName: 'Tag Number',
          category: 'identification',
          isRequired: true,
          displayOrder: 1
        },
        {
          id: 'pumpFlowRate',
          displayName: 'Flow Rate',
          category: 'process',
          unit: 'm³/h',
          displayOrder: 2,
          validationRules: { min: 0 }
        },
        {
          id: 'head',
          displayName: 'Head',
          category: 'process',
          unit: 'm',
          displayOrder: 3,
          validationRules: { min: 0 }
        },
        {
          id: 'efficiency',
          displayName: 'Efficiency',
          category: 'mechanical',
          unit: '%',
          displayOrder: 4,
          validationRules: { min: 0, max: 100 }
        }
      ]
    });

    // Additional templates can be added here
  }

  /**
   * Generate a new tag number for a node type
   */
  public generateTagNumber(nodeType: NodeType): string {
    const config = this.tagNumberConfigs.get(nodeType);
    if (!config) {
      return `${nodeType.toUpperCase()}-001`;
    }

    let tagNumber: string;
    let isUnique = false;

    while (!isUnique) {
      // Format the tag number
      const paddedNumber = config.currentNumber.toString().padStart(3, '0');
      tagNumber = config.format
        .replace('{prefix}', config.prefix)
        .replace('{separator}', config.separator)
        .replace('{number:03d}', paddedNumber);

      // Check if it's unique
      if (!this.usedTagNumbers.has(tagNumber)) {
        isUnique = true;
        this.usedTagNumbers.add(tagNumber);
        config.currentNumber++;
      } else {
        config.currentNumber++;
      }
    }

    return tagNumber!;
  }

  /**
   * Reserve a tag number to prevent duplicates
   */
  public reserveTagNumber(tagNumber: string): boolean {
    if (this.usedTagNumbers.has(tagNumber)) {
      return false;
    }
    this.usedTagNumbers.add(tagNumber);
    return true;
  }

  /**
   * Release a tag number when a node is deleted
   */
  public releaseTagNumber(tagNumber: string): void {
    this.usedTagNumbers.delete(tagNumber);
  }

  /**
   * Get property schema for a node type
   */
  public getPropertySchema(nodeType: NodeType): z.ZodSchema | null {
    return PROPERTY_SCHEMAS[nodeType] || null;
  }

  /**
   * Get default properties for a node type
   */
  public getDefaultProperties(nodeType: NodeType): any {
    const defaults = { ...(DEFAULT_PROPERTIES as any)[nodeType] };

    // Auto-generate tag number if not present
    if (!defaults.tagNumber) {
      defaults.tagNumber = this.generateTagNumber(nodeType);
    }

    return defaults;
  }

  /**
   * Calculate all calculated properties for a node
   */
  public calculateProperties(node: Node): Record<string, any> {
    const nodeType = node.type as NodeType;
    const calculatedProps = this.calculatedProperties.get(nodeType) || [];
    const results: Record<string, any> = {};

    // Start with existing properties
    const currentProps = { ...node.data };

    // Calculate each property
    for (const prop of calculatedProps) {
      try {
        // Check if all dependencies are available
        const hasAllDependencies = prop.dependencies.every(
          dep => currentProps[dep] !== undefined && currentProps[dep] !== ''
        );

        if (hasAllDependencies) {
          const value = prop.formula(currentProps);
          results[prop.id] = value;
          currentProps[prop.id] = value; // Update for dependent calculations
        }
      } catch (error) {
        console.error(`Error calculating ${prop.id}:`, error);
        results[prop.id] = null;
      }
    }

    return results;
  }

  /**
   * Validate properties against schema
   */
  public validateProperties(nodeType: NodeType, properties: any): {
    valid: boolean;
    errors: Array<{ path: string; message: string }>;
  } {
    const schema = this.getPropertySchema(nodeType);
    if (!schema) {
      return { valid: true, errors: [] };
    }

    try {
      schema.parse(properties);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.issues.map((e: z.ZodIssue) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        };
      }
      return {
        valid: false,
        errors: [{ path: '', message: 'Unknown validation error' }]
      };
    }
  }

  /**
   * Get property template for a node type
   */
  public getPropertyTemplate(nodeType: string): PropertyTemplate | undefined {
    return this.propertyTemplates.get(nodeType);
  }

  /**
   * Create custom property template
   */
  public createPropertyTemplate(template: PropertyTemplate): void {
    this.propertyTemplates.set(template.id, template);
  }

  /**
   * Get calculated properties for a node type
   */
  public getCalculatedProperties(nodeType: string): CalculatedProperty[] {
    return this.calculatedProperties.get(nodeType) || [];
  }

  /**
   * Add custom calculated property
   */
  public addCalculatedProperty(nodeType: string, property: CalculatedProperty): void {
    const existing = this.calculatedProperties.get(nodeType) || [];
    existing.push(property);
    this.calculatedProperties.set(nodeType, existing);
  }

  /**
   * Export property data for persistence
   */
  public exportPropertyData(): {
    tagNumbers: string[];
    templates: PropertyTemplate[];
    tagConfigs: Record<string, TagNumberConfig>;
  } {
    return {
      tagNumbers: Array.from(this.usedTagNumbers),
      templates: Array.from(this.propertyTemplates.values()),
      tagConfigs: Object.fromEntries(this.tagNumberConfigs)
    };
  }

  /**
   * Import property data
   */
  public importPropertyData(data: {
    tagNumbers?: string[];
    templates?: PropertyTemplate[];
    tagConfigs?: Record<string, TagNumberConfig>;
  }): void {
    if (data.tagNumbers) {
      this.usedTagNumbers = new Set(data.tagNumbers);
    }
    if (data.templates) {
      data.templates.forEach(template => {
        this.propertyTemplates.set(template.id, template);
      });
    }
    if (data.tagConfigs) {
      Object.entries(data.tagConfigs).forEach(([key, config]) => {
        this.tagNumberConfigs.set(key, config);
      });
    }
  }

  /**
   * Clear all data
   */
  public clear(): void {
    this.usedTagNumbers.clear();
    this.propertyCache.clear();
    // Reset tag number counters
    this.tagNumberConfigs.forEach(config => {
      config.currentNumber = 1;
    });
  }

  /**
   * Get property metadata for enhanced UI
   */
  public getPropertyMetadata(nodeType: NodeType, propertyId: string): PropertyMetadata | null {
    const template = this.propertyTemplates.get(nodeType);
    if (!template) return null;

    return template.properties.find(p => p.id === propertyId) || null;
  }

  /**
   * Batch update properties with validation
   */
  public batchUpdateProperties(
    nodes: Node[],
    updates: Record<string, any>
  ): Array<{ nodeId: string; success: boolean; errors?: string[] }> {
    const results: Array<{ nodeId: string; success: boolean; errors?: string[] }> = [];

    for (const node of nodes) {
      const nodeType = node.type as NodeType;
      const newProps = { ...node.data, ...updates };

      const validation = this.validateProperties(nodeType, newProps);

      if (validation.valid) {
        // Calculate any dependent properties
        const calculated = this.calculateProperties({
          ...node,
          data: newProps
        });

        Object.assign(newProps, calculated);
        node.data = newProps;

        results.push({ nodeId: node.id, success: true });
      } else {
        results.push({
          nodeId: node.id,
          success: false,
          errors: validation.errors.map(e => e.message)
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const propertyManager = new PropertyManager();