import {
  ConnectionPoint,
  ConnectionCompatibility,
  ConnectionValidationResult,
  ConnectionPointType,
} from '@/types/connection';

/**
 * Connection validation service
 * Validates connections based on type compatibility and engineering rules
 */
export class ConnectionValidator {
  private compatibilityRules: ConnectionCompatibility[];

  constructor(compatibilityRules: ConnectionCompatibility[]) {
    this.compatibilityRules = compatibilityRules;
  }

  /**
   * Validate connection between two points
   */
  public validateConnection(
    sourcePoint: ConnectionPoint,
    targetPoint: ConnectionPoint
  ): ConnectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if points are from the same node
    if (sourcePoint.nodeId === targetPoint.nodeId) {
      errors.push('Cannot connect a component to itself');
    }

    // Check if target is occupied
    if (targetPoint.isOccupied) {
      errors.push(`Connection point ${targetPoint.id} is already occupied`);
    }

    // Check type compatibility
    const isCompatible = this.checkTypeCompatibility(
      sourcePoint.type,
      targetPoint.type
    );

    if (!isCompatible) {
      errors.push(
        `Incompatible connection types: ${sourcePoint.type} cannot connect to ${targetPoint.type}`
      );
    }

    // Check flow direction (warning only)
    if (sourcePoint.type === 'output' && targetPoint.type === 'output') {
      warnings.push(
        'Connecting two output points may cause flow direction issues'
      );
    }

    if (sourcePoint.type === 'input' && targetPoint.type === 'input') {
      warnings.push(
        'Connecting two input points may cause flow direction issues'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if two connection types are compatible
   */
  private checkTypeCompatibility(
    sourceType: ConnectionPointType,
    targetType: ConnectionPointType
  ): boolean {
    // Find compatibility rule for source type
    const rule = this.compatibilityRules.find(
      (r) => r.sourceType === sourceType
    );

    if (!rule) {
      // No rule defined, allow connection (permissive default)
      return true;
    }

    // Check if target type is in compatible types
    const isDirectMatch = rule.targetTypes.includes(targetType);

    // Check bidirectional compatibility if enabled
    if (!isDirectMatch && rule.bidirectional) {
      const reverseRule = this.compatibilityRules.find(
        (r) => r.sourceType === targetType
      );
      return reverseRule?.targetTypes.includes(sourceType) ?? false;
    }

    return isDirectMatch;
  }

  /**
   * Get default compatibility rules for P&ID components
   */
  public static getDefaultCompatibilityRules(): ConnectionCompatibility[] {
    return [
      {
        sourceType: 'output',
        targetTypes: ['input', 'bidirectional', 'valve_inlet', 'tank_inlet'],
        bidirectional: false,
      },
      {
        sourceType: 'input',
        targetTypes: ['output', 'bidirectional', 'pump_outlet', 'valve_outlet'],
        bidirectional: false,
      },
      {
        sourceType: 'pump_outlet',
        targetTypes: ['input', 'valve_inlet', 'tank_inlet', 'bidirectional'],
        bidirectional: false,
      },
      {
        sourceType: 'pump_inlet',
        targetTypes: ['output', 'valve_outlet', 'tank_outlet', 'bidirectional'],
        bidirectional: false,
      },
      {
        sourceType: 'valve_outlet',
        targetTypes: [
          'input',
          'pump_inlet',
          'valve_inlet',
          'tank_inlet',
          'bidirectional',
        ],
        bidirectional: false,
      },
      {
        sourceType: 'valve_inlet',
        targetTypes: [
          'output',
          'pump_outlet',
          'valve_outlet',
          'tank_outlet',
          'bidirectional',
        ],
        bidirectional: false,
      },
      {
        sourceType: 'tank_outlet',
        targetTypes: [
          'input',
          'pump_inlet',
          'valve_inlet',
          'bidirectional',
        ],
        bidirectional: false,
      },
      {
        sourceType: 'tank_inlet',
        targetTypes: [
          'output',
          'pump_outlet',
          'valve_outlet',
          'bidirectional',
        ],
        bidirectional: false,
      },
      {
        sourceType: 'bidirectional',
        targetTypes: [
          'input',
          'output',
          'pump_inlet',
          'pump_outlet',
          'valve_inlet',
          'valve_outlet',
          'tank_inlet',
          'tank_outlet',
          'bidirectional',
        ],
        bidirectional: true,
      },
    ];
  }

  /**
   * Update compatibility rules
   */
  public updateRules(rules: ConnectionCompatibility[]): void {
    this.compatibilityRules = rules;
  }
}
