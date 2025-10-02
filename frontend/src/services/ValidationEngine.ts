import { z } from 'zod';

/**
 * Validation Engine for Ergoplanner AI Suite
 * Provides real-time validation with visual feedback and engineering constraints
 *
 * Features:
 * - Multi-level validation (required, range, pattern, custom, cross-field)
 * - Zod schema integration
 * - Engineering constraint validation
 * - Visual feedback support
 */

/**
 * Validation severity levels
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Validation result
 */
export interface IValidationResult {
  valid: boolean;
  severity: ValidationSeverity;
  message: string;
  field?: string;
  code?: string;
}

/**
 * Validation rule definition
 */
export interface IValidationRule<T = unknown> {
  name: string;
  severity: ValidationSeverity;
  validate: (value: T, context?: ValidationContext) => boolean | Promise<boolean>;
  message: string | ((value: T, context?: ValidationContext) => string);
  dependencies?: string[];
}

/**
 * Validation context for cross-field validation
 */
export type ValidationContext = Record<string, unknown>;

/**
 * Engineering material properties
 */
export interface IMaterialProperties {
  maxTemperature: number; // °C
  maxPressure: number; // bar
  minTemperature?: number; // °C
  corrosionResistance?: string;
}

/**
 * Material compatibility database
 */
export const MATERIAL_DATABASE: Record<string, IMaterialProperties> = {
  'carbon_steel': {
    maxTemperature: 400,
    maxPressure: 40,
    minTemperature: -29,
    corrosionResistance: 'Moderate',
  },
  'stainless_steel_316': {
    maxTemperature: 600,
    maxPressure: 100,
    minTemperature: -196,
    corrosionResistance: 'Excellent',
  },
  'stainless_steel_304': {
    maxTemperature: 550,
    maxPressure: 80,
    minTemperature: -196,
    corrosionResistance: 'Good',
  },
  'duplex_stainless': {
    maxTemperature: 300,
    maxPressure: 150,
    minTemperature: -50,
    corrosionResistance: 'Excellent',
  },
  'hastelloy_c276': {
    maxTemperature: 650,
    maxPressure: 120,
    minTemperature: -196,
    corrosionResistance: 'Excellent',
  },
  'titanium': {
    maxTemperature: 350,
    maxPressure: 100,
    minTemperature: -196,
    corrosionResistance: 'Excellent',
  },
};

/**
 * Validation rule builder for declarative rule definition
 */
export class ValidationRuleBuilder<T = unknown> {
  private rules: IValidationRule<T>[] = [];

  /**
   * Add required field validation
   */
  required(message = 'This field is required'): this {
    this.rules.push({
      name: 'required',
      severity: ValidationSeverity.ERROR,
      validate: (value: T) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      },
      message,
    });
    return this;
  }

  /**
   * Add range validation (min/max)
   */
  range(min?: number, max?: number, message?: string): this {
    this.rules.push({
      name: 'range',
      severity: ValidationSeverity.ERROR,
      validate: (value: T) => {
        const num = Number(value);
        if (Number.isNaN(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
      },
      message: message || (() => {
        if (min !== undefined && max !== undefined) {
          return `Value must be between ${min} and ${max}`;
        } else if (min !== undefined) {
          return `Value must be at least ${min}`;
        } else if (max !== undefined) {
          return `Value must be at most ${max}`;
        }
        return 'Invalid value';
      }),
    });
    return this;
  }

  /**
   * Add pattern validation with regex
   */
  pattern(regex: RegExp, message = 'Invalid format'): this {
    this.rules.push({
      name: 'pattern',
      severity: ValidationSeverity.ERROR,
      validate: (value: T) => {
        if (typeof value !== 'string') return false;
        return regex.test(value);
      },
      message,
    });
    return this;
  }

  /**
   * Add custom validation function
   */
  custom(
    name: string,
    validateFn: (value: T, context?: ValidationContext) => boolean | Promise<boolean>,
    message: string | ((value: T, context?: ValidationContext) => string),
    severity: ValidationSeverity = ValidationSeverity.ERROR,
    dependencies?: string[]
  ): this {
    this.rules.push({
      name,
      severity,
      validate: validateFn,
      message,
      dependencies,
    });
    return this;
  }

  /**
   * Build and return rules
   */
  build(): IValidationRule<T>[] {
    return this.rules;
  }
}

/**
 * Core Validation Engine
 */
export class ValidationEngine {
  private rules: Map<string, IValidationRule[]> = new Map();
  private schemas: Map<string, z.ZodSchema> = new Map();

  /**
   * Register validation rules for a field
   */
  registerRules(field: string, rules: IValidationRule[]): void {
    this.rules.set(field, rules);
  }

  /**
   * Register Zod schema for validation
   */
  registerSchema(name: string, schema: z.ZodSchema): void {
    this.schemas.set(name, schema);
  }

  /**
   * Validate a single field
   */
  async validateField(
    field: string,
    value: unknown,
    context?: ValidationContext
  ): Promise<IValidationResult[]> {
    const fieldRules = this.rules.get(field);
    if (!fieldRules) return [];

    const results: IValidationResult[] = [];

    for (const rule of fieldRules) {
      try {
        const isValid = await rule.validate(value, context);
        if (!isValid) {
          const message = typeof rule.message === 'function'
            ? rule.message(value, context)
            : rule.message;

          results.push({
            valid: false,
            severity: rule.severity,
            message,
            field,
            code: rule.name,
          });
        }
      } catch (error) {
        results.push({
          valid: false,
          severity: ValidationSeverity.ERROR,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          field,
          code: 'validation_error',
        });
      }
    }

    return results;
  }

  /**
   * Validate using Zod schema
   */
  validateWithSchema(schemaName: string, data: unknown): IValidationResult[] {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      return [{
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Schema '${schemaName}' not found`,
        code: 'schema_not_found',
      }];
    }

    const result = schema.safeParse(data);
    if (result.success) {
      return [];
    }

    return result.error.errors.map(err => ({
      valid: false,
      severity: ValidationSeverity.ERROR,
      message: err.message,
      field: err.path.join('.'),
      code: err.code,
    }));
  }

  /**
   * Validate entire context (all fields)
   */
  async validateContext(context: ValidationContext): Promise<IValidationResult[]> {
    const allResults: IValidationResult[] = [];

    for (const [field, value] of Object.entries(context)) {
      const results = await this.validateField(field, value, context);
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * Check if validation results contain errors
   */
  hasErrors(results: IValidationResult[]): boolean {
    return results.some(r => r.severity === ValidationSeverity.ERROR);
  }

  /**
   * Get validation state for visual feedback
   */
  getValidationState(results: IValidationResult[]): {
    borderColor: string;
    icon: string;
    messages: string[];
  } {
    const errors = results.filter(r => r.severity === ValidationSeverity.ERROR);
    const warnings = results.filter(r => r.severity === ValidationSeverity.WARNING);
    const infos = results.filter(r => r.severity === ValidationSeverity.INFO);

    if (errors.length > 0) {
      return {
        borderColor: 'border-red-500',
        icon: '❌',
        messages: errors.map(e => e.message),
      };
    } else if (warnings.length > 0) {
      return {
        borderColor: 'border-yellow-500',
        icon: '⚠️',
        messages: warnings.map(w => w.message),
      };
    } else if (infos.length > 0) {
      return {
        borderColor: 'border-blue-500',
        icon: 'ℹ️',
        messages: infos.map(i => i.message),
      };
    }

    return {
      borderColor: 'border-green-500',
      icon: '✅',
      messages: [],
    };
  }
}

/**
 * Engineering validation utilities
 */
export class EngineeringValidation {
  /**
   * Validate material compatibility with temperature
   */
  static validateMaterialTemperature(
    material: string,
    temperature: number
  ): IValidationResult {
    const props = MATERIAL_DATABASE[material];
    if (!props) {
      return {
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Unknown material: ${material}`,
        code: 'unknown_material',
      };
    }

    if (temperature > props.maxTemperature) {
      return {
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Temperature ${temperature}°C exceeds maximum for ${material} (${props.maxTemperature}°C)`,
        code: 'temperature_exceeded',
      };
    }

    if (props.minTemperature !== undefined && temperature < props.minTemperature) {
      return {
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Temperature ${temperature}°C below minimum for ${material} (${props.minTemperature}°C)`,
        code: 'temperature_below_min',
      };
    }

    // Warning for temperatures near limits (within 10%)
    const tempMargin = props.maxTemperature * 0.9;
    if (temperature > tempMargin) {
      return {
        valid: true,
        severity: ValidationSeverity.WARNING,
        message: `Temperature ${temperature}°C is close to material limit (${props.maxTemperature}°C)`,
        code: 'temperature_near_limit',
      };
    }

    return {
      valid: true,
      severity: ValidationSeverity.INFO,
      message: 'Temperature within acceptable range',
      code: 'temperature_ok',
    };
  }

  /**
   * Validate material compatibility with pressure
   */
  static validateMaterialPressure(
    material: string,
    pressure: number
  ): IValidationResult {
    const props = MATERIAL_DATABASE[material];
    if (!props) {
      return {
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Unknown material: ${material}`,
        code: 'unknown_material',
      };
    }

    if (pressure > props.maxPressure) {
      return {
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Pressure ${pressure} bar exceeds maximum for ${material} (${props.maxPressure} bar)`,
        code: 'pressure_exceeded',
      };
    }

    // Warning for pressures near limits (within 10%)
    const pressureMargin = props.maxPressure * 0.9;
    if (pressure > pressureMargin) {
      return {
        valid: true,
        severity: ValidationSeverity.WARNING,
        message: `Pressure ${pressure} bar is close to material limit (${props.maxPressure} bar)`,
        code: 'pressure_near_limit',
      };
    }

    return {
      valid: true,
      severity: ValidationSeverity.INFO,
      message: 'Pressure within acceptable range',
      code: 'pressure_ok',
    };
  }

  /**
   * Validate operating pressure vs design pressure
   */
  static validatePressureRelationship(
    operatingPressure: number,
    designPressure: number
  ): IValidationResult {
    if (operatingPressure > designPressure) {
      return {
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Operating pressure (${operatingPressure} bar) cannot exceed design pressure (${designPressure} bar)`,
        code: 'operating_pressure_exceeded',
      };
    }

    // Warning if operating pressure is too close to design pressure (>90%)
    if (operatingPressure > designPressure * 0.9) {
      return {
        valid: true,
        severity: ValidationSeverity.WARNING,
        message: `Operating pressure (${operatingPressure} bar) is close to design pressure (${designPressure} bar). Consider safety margin.`,
        code: 'pressure_margin_low',
      };
    }

    return {
      valid: true,
      severity: ValidationSeverity.INFO,
      message: 'Pressure relationship valid',
      code: 'pressure_relationship_ok',
    };
  }

  /**
   * Validate safety factor
   */
  static validateSafetyFactor(
    designValue: number,
    operatingValue: number,
    minSafetyFactor = 1.5
  ): IValidationResult {
    const safetyFactor = designValue / operatingValue;

    if (safetyFactor < minSafetyFactor) {
      return {
        valid: false,
        severity: ValidationSeverity.ERROR,
        message: `Safety factor ${safetyFactor.toFixed(2)} is below minimum ${minSafetyFactor}`,
        code: 'safety_factor_low',
      };
    }

    if (safetyFactor < minSafetyFactor * 1.1) {
      return {
        valid: true,
        severity: ValidationSeverity.WARNING,
        message: `Safety factor ${safetyFactor.toFixed(2)} is close to minimum ${minSafetyFactor}`,
        code: 'safety_factor_near_limit',
      };
    }

    return {
      valid: true,
      severity: ValidationSeverity.INFO,
      message: `Safety factor ${safetyFactor.toFixed(2)} is acceptable`,
      code: 'safety_factor_ok',
    };
  }
}

/**
 * Predefined validation schemas using Zod
 */
export const ValidationSchemas = {
  /**
   * Vessel validation schema
   */
  vessel: z.object({
    tagNumber: z.string().min(1, 'Tag number is required').regex(/^[A-Z]-\d+[A-Z]?$/, 'Invalid tag format (e.g., V-101A)'),
    volume: z.number().min(0.01, 'Volume must be positive').max(100000, 'Volume too large'),
    designPressure: z.number().min(0, 'Design pressure must be positive').max(400, 'Design pressure exceeds limits'),
    operatingPressure: z.number().min(0, 'Operating pressure must be positive'),
    designTemperature: z.number().min(-196, 'Temperature below absolute minimum').max(1000, 'Temperature exceeds limits'),
    operatingTemperature: z.number().min(-196, 'Temperature below absolute minimum'),
    material: z.enum(['carbon_steel', 'stainless_steel_316', 'stainless_steel_304', 'duplex_stainless', 'hastelloy_c276', 'titanium']),
  }).refine(data => data.operatingPressure <= data.designPressure, {
    message: 'Operating pressure must not exceed design pressure',
    path: ['operatingPressure'],
  }).refine(data => data.operatingTemperature <= data.designTemperature, {
    message: 'Operating temperature must not exceed design temperature',
    path: ['operatingTemperature'],
  }),

  /**
   * Pump validation schema
   */
  pump: z.object({
    tagNumber: z.string().regex(/^P-\d+[A-Z]?$/, 'Invalid pump tag format (e.g., P-101A)'),
    flowRate: z.number().min(0, 'Flow rate must be positive').max(10000, 'Flow rate exceeds limits'),
    head: z.number().min(0, 'Head must be positive').max(500, 'Head exceeds limits'),
    power: z.number().min(0, 'Power must be positive').max(1000, 'Power exceeds limits'),
    efficiency: z.number().min(0, 'Efficiency must be positive').max(100, 'Efficiency cannot exceed 100%'),
    npshr: z.number().min(0, 'NPSHR must be positive'),
    npsha: z.number().min(0, 'NPSHA must be positive'),
  }).refine(data => data.npsha >= data.npshr, {
    message: 'NPSHA must be greater than or equal to NPSHR',
    path: ['npsha'],
  }),

  /**
   * Piping validation schema
   */
  piping: z.object({
    lineNumber: z.string().regex(/^\d{1,3}-[A-Z]{2,4}-\d{1,4}(-[A-Z0-9]{1,3})?$/, 'Invalid line number format'),
    nominalDiameter: z.number().min(15, 'Diameter too small').max(2000, 'Diameter too large'),
    schedule: z.enum(['5S', '10S', '40', '80', '160', 'STD', 'XS', 'XXS']),
    material: z.string().min(1, 'Material required'),
    designPressure: z.number().min(0, 'Design pressure must be positive'),
    designTemperature: z.number().min(-196, 'Temperature below limits'),
    fluidService: z.string().min(1, 'Fluid service required'),
  }),
};

// Export singleton instance
export const validationEngine = new ValidationEngine();

// Register default schemas
validationEngine.registerSchema('vessel', ValidationSchemas.vessel);
validationEngine.registerSchema('pump', ValidationSchemas.pump);
validationEngine.registerSchema('piping', ValidationSchemas.piping);

export default ValidationEngine;
