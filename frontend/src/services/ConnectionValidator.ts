/**
 * Smart Connection Validation Engine
 *
 * Provides real-time validation for P&ID symbol connections with:
 * - Size compatibility checks
 * - Service type matching
 * - Pressure rating validation
 * - Material compatibility
 * - Flow direction validation
 *
 * Uses Strategy pattern for extensible validation rules.
 */

import type { Node, Edge, Connection } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export type ValidationSeverity = 'valid' | 'warning' | 'error';

export interface ValidationResult {
  isValid: boolean;
  severity: ValidationSeverity;
  messages: string[];
  warnings: string[];
  errors: string[];
}

export interface ConnectionData {
  sourceNode: Node;
  targetNode: Node;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface PipeSize {
  nominal: number;        // Nominal pipe size (inches or mm)
  unit: 'inch' | 'mm';
  schedule?: string;      // Pipe schedule (e.g., '40', '80', 'STD')
}

export interface ServiceType {
  fluid: string;          // e.g., 'water', 'steam', 'air', 'gas', 'oil'
  phase: 'liquid' | 'gas' | 'two-phase';
  temperature?: number;   // °C
  pressure?: number;      // kPa or psi
  corrosive?: boolean;
}

export interface MaterialSpec {
  material: string;       // e.g., 'carbon-steel', 'stainless-steel', 'pvc'
  rating?: string;        // e.g., 'ANSI 150', 'ANSI 300'
}

export interface ConnectionProperties {
  pipeSize?: PipeSize;
  serviceType?: ServiceType;
  material?: MaterialSpec;
  flowDirection?: 'inlet' | 'outlet' | 'bidirectional';
  maxPressure?: number;
  maxTemperature?: number;
}

// ============================================================================
// Validation Rules Interface
// ============================================================================

export interface IValidationRule {
  name: string;
  description: string;
  validate(data: ConnectionData, props: {
    source: ConnectionProperties;
    target: ConnectionProperties;
  }): ValidationResult;
}

// ============================================================================
// Validation Rules Implementation
// ============================================================================

/**
 * Size Compatibility Rule
 * Validates that pipe sizes are matching or compatible
 */
export class SizeCompatibilityRule implements IValidationRule {
  name = 'Size Compatibility';
  description = 'Validates pipe size compatibility';

  validate(data: ConnectionData, props: {
    source: ConnectionProperties;
    target: ConnectionProperties;
  }): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      severity: 'valid',
      messages: [],
      warnings: [],
      errors: [],
    };

    const sourceSize = props.source.pipeSize;
    const targetSize = props.target.pipeSize;

    if (!sourceSize || !targetSize) {
      result.warnings.push('Pipe size information not available for validation');
      result.severity = 'warning';
      return result;
    }

    // Convert to common unit for comparison
    const sourceNominal = sourceSize.unit === 'mm' ? sourceSize.nominal / 25.4 : sourceSize.nominal;
    const targetNominal = targetSize.unit === 'mm' ? targetSize.nominal / 25.4 : targetSize.nominal;

    // Exact match
    if (Math.abs(sourceNominal - targetNominal) < 0.1) {
      result.messages.push(`✓ Pipe sizes match: ${sourceSize.nominal} ${sourceSize.unit}`);
      return result;
    }

    // Size reduction/increase tolerance
    const ratio = Math.max(sourceNominal, targetNominal) / Math.min(sourceNominal, targetNominal);

    if (ratio <= 1.5) {
      // Minor size change - warning
      result.severity = 'warning';
      result.warnings.push(
        `⚠ Size change from ${sourceSize.nominal}${sourceSize.unit} to ${targetSize.nominal}${targetSize.unit}. Consider reducer/expander.`
      );
    } else if (ratio <= 2.0) {
      // Moderate size change - warning
      result.severity = 'warning';
      result.warnings.push(
        `⚠ Significant size change (${ratio.toFixed(1)}x). Verify reducer/expander requirements.`
      );
    } else {
      // Large size change - error
      result.isValid = false;
      result.severity = 'error';
      result.errors.push(
        `✗ Incompatible pipe sizes: ${sourceSize.nominal}${sourceSize.unit} to ${targetSize.nominal}${targetSize.unit} (${ratio.toFixed(1)}x ratio)`
      );
    }

    return result;
  }
}

/**
 * Service Type Matching Rule
 * Validates fluid/service compatibility
 */
export class ServiceTypeMatchingRule implements IValidationRule {
  name = 'Service Type Matching';
  description = 'Validates fluid and service type compatibility';

  private readonly incompatibleCombinations: Map<string, string[]> = new Map([
    ['steam', ['water', 'oil', 'refrigerant']],
    ['oxygen', ['oil', 'grease', 'flammable']],
    ['chlorine', ['ammonia', 'hydrogen']],
    ['acid', ['caustic', 'alkali']],
  ]);

  validate(data: ConnectionData, props: {
    source: ConnectionProperties;
    target: ConnectionProperties;
  }): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      severity: 'valid',
      messages: [],
      warnings: [],
      errors: [],
    };

    const sourceService = props.source.serviceType;
    const targetService = props.target.serviceType;

    if (!sourceService || !targetService) {
      result.warnings.push('Service type information not available');
      result.severity = 'warning';
      return result;
    }

    // Exact match
    if (sourceService.fluid === targetService.fluid && sourceService.phase === targetService.phase) {
      result.messages.push(`✓ Service types match: ${sourceService.fluid} (${sourceService.phase})`);
    } else {
      // Check for incompatible combinations
      const incompatible = this.incompatibleCombinations.get(sourceService.fluid.toLowerCase());
      if (incompatible?.includes(targetService.fluid.toLowerCase())) {
        result.isValid = false;
        result.severity = 'error';
        result.errors.push(
          `✗ Incompatible fluids: ${sourceService.fluid} cannot connect to ${targetService.fluid}`
        );
        return result;
      }

      // Phase mismatch
      if (sourceService.phase !== targetService.phase) {
        result.severity = 'warning';
        result.warnings.push(
          `⚠ Phase mismatch: ${sourceService.phase} to ${targetService.phase}`
        );
      }

      // Different fluids but potentially compatible
      result.severity = 'warning';
      result.warnings.push(
        `⚠ Different service types: ${sourceService.fluid} to ${targetService.fluid}. Verify compatibility.`
      );
    }

    return result;
  }
}

/**
 * Pressure Rating Validation Rule
 * Validates pressure compatibility
 */
export class PressureRatingRule implements IValidationRule {
  name = 'Pressure Rating';
  description = 'Validates pressure rating compatibility';

  validate(data: ConnectionData, props: {
    source: ConnectionProperties;
    target: ConnectionProperties;
  }): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      severity: 'valid',
      messages: [],
      warnings: [],
      errors: [],
    };

    const sourcePressure = props.source.maxPressure || props.source.serviceType?.pressure;
    const targetPressure = props.target.maxPressure || props.target.serviceType?.pressure;

    if (!sourcePressure && !targetPressure) {
      result.warnings.push('Pressure information not available');
      result.severity = 'warning';
      return result;
    }

    if (sourcePressure && targetPressure) {
      const minRating = Math.min(sourcePressure, targetPressure);
      const maxRating = Math.max(sourcePressure, targetPressure);

      if (sourcePressure === targetPressure) {
        result.messages.push(`✓ Pressure ratings match: ${sourcePressure} kPa`);
      } else if (maxRating / minRating <= 1.5) {
        result.severity = 'warning';
        result.warnings.push(
          `⚠ Different pressure ratings: ${sourcePressure} kPa to ${targetPressure} kPa`
        );
      } else {
        result.isValid = false;
        result.severity = 'error';
        result.errors.push(
          `✗ Incompatible pressure ratings: ${sourcePressure} kPa to ${targetPressure} kPa`
        );
      }
    }

    return result;
  }
}

/**
 * Material Compatibility Rule
 * Validates material compatibility
 */
export class MaterialCompatibilityRule implements IValidationRule {
  name = 'Material Compatibility';
  description = 'Validates material compatibility';

  private readonly compatibleMaterials: Map<string, string[]> = new Map([
    ['carbon-steel', ['carbon-steel', 'stainless-steel', 'cast-iron']],
    ['stainless-steel', ['stainless-steel', 'carbon-steel']],
    ['pvc', ['pvc', 'cpvc', 'polypropylene']],
    ['copper', ['copper', 'brass', 'bronze']],
  ]);

  validate(data: ConnectionData, props: {
    source: ConnectionProperties;
    target: ConnectionProperties;
  }): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      severity: 'valid',
      messages: [],
      warnings: [],
      errors: [],
    };

    const sourceMaterial = props.source.material;
    const targetMaterial = props.target.material;

    if (!sourceMaterial || !targetMaterial) {
      result.warnings.push('Material information not available');
      result.severity = 'warning';
      return result;
    }

    if (sourceMaterial.material === targetMaterial.material) {
      result.messages.push(`✓ Materials match: ${sourceMaterial.material}`);
      return result;
    }

    // Check compatibility
    const compatible = this.compatibleMaterials.get(sourceMaterial.material.toLowerCase());
    if (compatible?.includes(targetMaterial.material.toLowerCase())) {
      result.severity = 'warning';
      result.warnings.push(
        `⚠ Different but compatible materials: ${sourceMaterial.material} to ${targetMaterial.material}`
      );
    } else {
      result.severity = 'warning';
      result.warnings.push(
        `⚠ Verify material compatibility: ${sourceMaterial.material} to ${targetMaterial.material}`
      );
    }

    return result;
  }
}

/**
 * Flow Direction Validation Rule
 * Validates flow direction compatibility
 */
export class FlowDirectionRule implements IValidationRule {
  name = 'Flow Direction';
  description = 'Validates flow direction compatibility';

  validate(data: ConnectionData, props: {
    source: ConnectionProperties;
    target: ConnectionProperties;
  }): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      severity: 'valid',
      messages: [],
      warnings: [],
      errors: [],
    };

    const sourceDirection = props.source.flowDirection;
    const targetDirection = props.target.flowDirection;

    if (!sourceDirection || !targetDirection) {
      result.warnings.push('Flow direction information not available');
      result.severity = 'warning';
      return result;
    }

    // Validate outlet to inlet connection
    if (sourceDirection === 'outlet' && targetDirection === 'inlet') {
      result.messages.push('✓ Flow direction valid: outlet → inlet');
    } else if (sourceDirection === 'bidirectional' || targetDirection === 'bidirectional') {
      result.messages.push('✓ Bidirectional connection allowed');
    } else if (sourceDirection === 'inlet' && targetDirection === 'outlet') {
      result.isValid = false;
      result.severity = 'error';
      result.errors.push('✗ Invalid flow direction: inlet → outlet (reverse flow)');
    } else {
      result.severity = 'warning';
      result.warnings.push(`⚠ Verify flow direction: ${sourceDirection} → ${targetDirection}`);
    }

    return result;
  }
}

// ============================================================================
// Connection Validator
// ============================================================================

export class ConnectionValidator {
  private rules: IValidationRule[] = [];

  constructor() {
    // Register default validation rules
    this.registerRule(new SizeCompatibilityRule());
    this.registerRule(new ServiceTypeMatchingRule());
    this.registerRule(new PressureRatingRule());
    this.registerRule(new MaterialCompatibilityRule());
    this.registerRule(new FlowDirectionRule());
  }

  /**
   * Register a new validation rule
   */
  registerRule(rule: IValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove a validation rule by name
   */
  unregisterRule(ruleName: string): void {
    this.rules = this.rules.filter((rule) => rule.name !== ruleName);
  }

  /**
   * Get all registered rules
   */
  getRules(): IValidationRule[] {
    return [...this.rules];
  }

  /**
   * Extract connection properties from node data
   */
  private extractConnectionProperties(node: Node, handleId?: string | null): ConnectionProperties {
    const data = node.data as any;

    // Extract properties from node data
    return {
      pipeSize: data.pipeSize || data.nominalSize ? {
        nominal: data.pipeSize?.nominal || data.nominalSize || 0,
        unit: data.pipeSize?.unit || 'inch',
        schedule: data.pipeSize?.schedule || data.schedule,
      } : undefined,
      serviceType: data.serviceType || data.fluid ? {
        fluid: data.serviceType?.fluid || data.fluid || 'unknown',
        phase: data.serviceType?.phase || data.phase || 'liquid',
        temperature: data.serviceType?.temperature || data.temperature,
        pressure: data.serviceType?.pressure || data.pressure,
        corrosive: data.serviceType?.corrosive || data.corrosive,
      } : undefined,
      material: data.material ? {
        material: data.material.material || data.material,
        rating: data.material.rating || data.pressureRating,
      } : undefined,
      flowDirection: data.flowDirection || (handleId?.includes('source') ? 'outlet' : handleId?.includes('target') ? 'inlet' : undefined),
      maxPressure: data.maxPressure || data.pressureRating,
      maxTemperature: data.maxTemperature || data.temperatureRating,
    };
  }

  /**
   * Validate a connection between two nodes
   */
  validateConnection(connection: Connection, nodes: Node[]): ValidationResult {
    // Find source and target nodes
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    if (!sourceNode || !targetNode) {
      return {
        isValid: false,
        severity: 'error',
        messages: [],
        warnings: [],
        errors: ['Connection validation failed: Node not found'],
      };
    }

    const connectionData: ConnectionData = {
      sourceNode,
      targetNode,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    };

    // Extract connection properties
    const sourceProps = this.extractConnectionProperties(sourceNode, connection.sourceHandle);
    const targetProps = this.extractConnectionProperties(targetNode, connection.targetHandle);

    // Run all validation rules
    const results: ValidationResult[] = this.rules.map((rule) =>
      rule.validate(connectionData, { source: sourceProps, target: targetProps })
    );

    // Combine results
    const combinedResult: ValidationResult = {
      isValid: results.every((r) => r.isValid),
      severity: this.determineSeverity(results),
      messages: results.flatMap((r) => r.messages),
      warnings: results.flatMap((r) => r.warnings),
      errors: results.flatMap((r) => r.errors),
    };

    return combinedResult;
  }

  /**
   * Determine overall severity from multiple results
   */
  private determineSeverity(results: ValidationResult[]): ValidationSeverity {
    if (results.some((r) => r.severity === 'error')) {
      return 'error';
    }
    if (results.some((r) => r.severity === 'warning')) {
      return 'warning';
    }
    return 'valid';
  }

  /**
   * Format validation result as tooltip message
   */
  formatValidationMessage(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.errors.length > 0) {
      lines.push('ERRORS:', ...result.errors);
    }

    if (result.warnings.length > 0) {
      if (lines.length > 0) lines.push('');
      lines.push('WARNINGS:', ...result.warnings);
    }

    if (result.messages.length > 0 && result.severity === 'valid') {
      if (lines.length > 0) lines.push('');
      lines.push(...result.messages);
    }

    return lines.join('\n');
  }

  /**
   * Get color coding for validation severity
   */
  getSeverityColor(severity: ValidationSeverity): string {
    switch (severity) {
      case 'valid':
        return '#4CAF50'; // Green
      case 'warning':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const connectionValidator = new ConnectionValidator();
