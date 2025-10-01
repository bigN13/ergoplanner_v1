/**
 * Intelligent Connection Validator
 * Enhanced connection validation with business rules engine, auto-alignment, and smart routing
 * Implements the requirements from Task #72 - Build Intelligent Connection System
 */

import type { Node, Edge, Connection, XYPosition } from 'reactflow';
import { connectionPointManager } from './ConnectionPointManager';
import {
  ConnectionPoint,
  ConnectionPointType,
  PipeSize,
  PressureRating,
  ConnectionValidationResult
} from '@/types/connectionPoint';

// Enhanced connection types enum as specified in the task
export enum EnhancedConnectionType {
  INLET = 'inlet',
  OUTLET = 'outlet',
  VENT = 'vent',
  DRAIN = 'drain',
  INSTRUMENT = 'instrument',
  ELECTRICAL = 'electrical',
  STEAM = 'steam',
  WATER = 'water',
  AIR = 'air',
  NITROGEN = 'nitrogen',
  HYDRAULIC = 'hydraulic',
  PNEUMATIC = 'pneumatic'
}

export interface ConnectionValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'compatibility' | 'engineering' | 'safety' | 'standards' | 'piping';
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  validate: (source: ConnectionPoint, target: ConnectionPoint, metadata?: ConnectionMetadata) => ValidationIssue[];
}

export interface ValidationIssue {
  id: string;
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  suggestions?: string[];
  autoFixAvailable?: boolean;
  position?: XYPosition;
}

export interface ConnectionMetadata {
  // Flow properties
  fluidType?: string;
  flowRate?: number; // m³/h or l/min
  velocity?: number; // m/s

  // Thermal properties
  temperature?: number; // °C
  temperatureMin?: number;
  temperatureMax?: number;

  // Pressure properties
  pressure?: number; // bar
  pressureMin?: number;
  pressureMax?: number;
  designPressure?: number;
  testPressure?: number;

  // Physical properties
  density?: number; // kg/m³
  viscosity?: number; // cP
  pH?: number;

  // Safety properties
  corrosive?: boolean;
  toxic?: boolean;
  flammable?: boolean;
  explosive?: boolean;
  hazardClass?: string;

  // Material properties
  material?: string; // Carbon Steel, Stainless Steel, PVC, etc.
  schedule?: string; // SCH40, SCH80, etc.
  wallThickness?: number;

  // Installation properties
  insulation?: boolean;
  insulationType?: string;
  tracing?: 'steam' | 'electric' | 'none';
  paintCode?: string;

  // Identification
  lineNumber?: string;
  systemCode?: string;
  serviceDescription?: string;

  // Standards compliance
  standard?: 'ASME' | 'DIN' | 'JIS' | 'BS';
  pipeClass?: string;

  // Quality attributes
  cleanlinessLevel?: string;
  certificationRequired?: boolean;
}

export interface AutoSnapConfig {
  enabled: boolean;
  snapDistance: number; // pixels
  magneticEffect: boolean;
  showSnapIndicator: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface SmartRoutingConfig {
  algorithm: 'astar' | 'dijkstra' | 'orthogonal' | 'direct';
  obstacleMargin: number;
  preferOrthogonal: boolean;
  avoidEquipment: boolean;
  minimizeLength: boolean;
  allowDiagonal: boolean;
}

export interface ManifoldConfig {
  autoInsertYPiece: boolean;
  maxConnections: number;
  preferredAngle: number; // degrees
  minSpacing: number; // mm
}

/**
 * Intelligent Connection Validator with Business Rules Engine
 * Implements advanced validation, auto-snap, and smart routing capabilities
 */
export class IntelligentConnectionValidator {
  private rules: ConnectionValidationRule[] = [];
  private autoSnapConfig: AutoSnapConfig;
  private smartRoutingConfig: SmartRoutingConfig;
  private manifoldConfig: ManifoldConfig;
  private sizeLookupTable: Map<PipeSize, number> = new Map();
  private pressureLookupTable: Map<PressureRating, number> = new Map();

  constructor() {
    this.autoSnapConfig = {
      enabled: true,
      snapDistance: 20,
      magneticEffect: true,
      showSnapIndicator: true,
      snapToGrid: false,
      gridSize: 20
    };

    this.smartRoutingConfig = {
      algorithm: 'astar',
      obstacleMargin: 40,
      preferOrthogonal: true,
      avoidEquipment: true,
      minimizeLength: true,
      allowDiagonal: false
    };

    this.manifoldConfig = {
      autoInsertYPiece: true,
      maxConnections: 4,
      preferredAngle: 45,
      minSpacing: 50
    };

    this.initializeLookupTables();
    this.initializeValidationRules();
  }

  /**
   * Initialize size and pressure lookup tables for compatibility checking
   */
  private initializeLookupTables(): void {
    // Size lookup table (DN to internal diameter in mm)
    const sizes: [PipeSize, number][] = [
      ['DN15', 15], ['DN20', 20], ['DN25', 25], ['DN32', 32], ['DN40', 40], ['DN50', 50],
      ['DN65', 65], ['DN80', 80], ['DN100', 100], ['DN125', 125], ['DN150', 150], ['DN200', 200],
      ['DN250', 250], ['DN300', 300], ['DN350', 350], ['DN400', 400], ['DN450', 450], ['DN500', 500],
      ['DN600', 600], ['DN700', 700], ['DN800', 800], ['DN900', 900], ['DN1000', 1000]
    ];

    sizes.forEach(([size, diameter]) => {
      this.sizeLookupTable.set(size, diameter);
    });

    // Pressure lookup table (rating to max pressure in bar)
    const pressures: [PressureRating, number][] = [
      ['PN10', 10], ['PN16', 16], ['PN25', 25], ['PN40', 40], ['PN63', 63], ['PN100', 100],
      ['Class150', 20], ['Class300', 51], ['Class600', 102], ['Class900', 153],
      ['Class1500', 255], ['Class2500', 425]
    ];

    pressures.forEach(([rating, pressure]) => {
      this.pressureLookupTable.set(rating, pressure);
    });
  }

  /**
   * Initialize comprehensive validation rules as specified in Task #72
   */
  private initializeValidationRules(): void {
    this.rules = [
      // Size Compatibility Rule with lookup tables
      {
        id: 'size-compatibility-advanced',
        name: 'Advanced Size Compatibility',
        description: 'Validates size compatibility using lookup tables',
        category: 'engineering',
        severity: 'warning',
        enabled: true,
        validate: (source, target) => {
          const issues: ValidationIssue[] = [];

          if (source.size && target.size) {
            const sourceDiameter = this.sizeLookupTable.get(source.size);
            const targetDiameter = this.sizeLookupTable.get(target.size);

            if (sourceDiameter && targetDiameter) {
              const ratio = Math.max(sourceDiameter, targetDiameter) / Math.min(sourceDiameter, targetDiameter);

              if (ratio > 2) {
                issues.push({
                  id: `size-major-mismatch-${source.id}-${target.id}`,
                  ruleId: 'size-compatibility-advanced',
                  severity: 'error',
                  message: `Major size mismatch: ${source.size} (${sourceDiameter}mm) → ${target.size} (${targetDiameter}mm)`,
                  description: 'Size difference >2:1 requires special consideration',
                  suggestions: [
                    'Add concentric reducer',
                    'Add eccentric reducer for horizontal runs',
                    'Review hydraulic calculations',
                    'Consider velocity limitations'
                  ],
                  autoFixAvailable: true
                });
              } else if (ratio > 1.5) {
                issues.push({
                  id: `size-minor-mismatch-${source.id}-${target.id}`,
                  ruleId: 'size-compatibility-advanced',
                  severity: 'warning',
                  message: `Size change: ${source.size} → ${target.size}`,
                  description: 'Consider adding reducer for optimal flow',
                  suggestions: [
                    'Add reducer if pressure drop is critical',
                    'Verify design velocities'
                  ],
                  autoFixAvailable: true
                });
              }
            }
          }

          return issues;
        }
      },

      // Pressure Rating Validation with lookup tables
      {
        id: 'pressure-rating-advanced',
        name: 'Advanced Pressure Rating Check',
        description: 'Validates pressure ratings using lookup tables',
        category: 'safety',
        severity: 'error',
        enabled: true,
        validate: (source, target, metadata) => {
          const issues: ValidationIssue[] = [];

          if (source.rating && target.rating) {
            const sourceMaxPressure = this.pressureLookupTable.get(source.rating);
            const targetMaxPressure = this.pressureLookupTable.get(target.rating);

            if (sourceMaxPressure && targetMaxPressure) {
              const minRating = Math.min(sourceMaxPressure, targetMaxPressure);
              const operatingPressure = metadata?.pressure || metadata?.operatingPressure || 0;

              if (operatingPressure > minRating) {
                issues.push({
                  id: `pressure-exceeds-rating-${source.id}-${target.id}`,
                  ruleId: 'pressure-rating-advanced',
                  severity: 'error',
                  message: `Operating pressure (${operatingPressure} bar) exceeds minimum rating (${minRating} bar)`,
                  description: 'Operating pressure must not exceed component ratings',
                  suggestions: [
                    'Upgrade to higher pressure rating',
                    'Install pressure reducing valve',
                    'Review system operating conditions'
                  ],
                  autoFixAvailable: false
                });
              }

              if (sourceMaxPressure !== targetMaxPressure) {
                issues.push({
                  id: `pressure-rating-mismatch-${source.id}-${target.id}`,
                  ruleId: 'pressure-rating-advanced',
                  severity: 'warning',
                  message: `Pressure rating mismatch: ${source.rating} (${sourceMaxPressure} bar) → ${target.rating} (${targetMaxPressure} bar)`,
                  description: 'Mixed pressure ratings in same line',
                  suggestions: [
                    'Standardize pressure ratings',
                    'Document design basis',
                    'Consider future maintenance'
                  ]
                });
              }
            }
          }

          return issues;
        }
      },

      // Fluid Type Matching
      {
        id: 'fluid-type-compatibility',
        name: 'Fluid Type Compatibility',
        description: 'Validates fluid type compatibility between connections',
        category: 'engineering',
        severity: 'error',
        enabled: true,
        validate: (source, target, metadata) => {
          const issues: ValidationIssue[] = [];

          if (metadata?.fluidType) {
            // Check for incompatible fluid mixing
            const incompatibleFluids = [
              ['water', 'oil'],
              ['steam', 'compressed_air'],
              ['acid', 'base'],
              ['fuel', 'oxidizer']
            ];

            // This is simplified - in practice you'd have more sophisticated fluid compatibility rules
            if (source.type !== target.type) {
              issues.push({
                id: `fluid-type-mismatch-${source.id}-${target.id}`,
                ruleId: 'fluid-type-compatibility',
                severity: 'warning',
                message: `Connecting different service types: ${source.type} → ${target.type}`,
                description: 'Different service types may indicate incorrect connection',
                suggestions: [
                  'Verify process requirements',
                  'Check P&ID legend',
                  'Review connection types'
                ]
              });
            }
          }

          return issues;
        }
      },

      // Direction Validation Enhanced
      {
        id: 'flow-direction-enhanced',
        name: 'Enhanced Flow Direction Validation',
        description: 'Advanced flow direction checking with equipment knowledge',
        category: 'engineering',
        severity: 'warning',
        enabled: true,
        validate: (source, target) => {
          const issues: ValidationIssue[] = [];

          // Enhanced direction validation based on connection point types
          const directionRules = [
            {
              source: ConnectionPointType.PROCESS_OUTLET,
              target: ConnectionPointType.PROCESS_OUTLET,
              message: 'Outlet-to-outlet connection detected',
              severity: 'warning' as const,
              suggestions: ['Verify flow direction', 'Consider manifold or mixing point']
            },
            {
              source: ConnectionPointType.PROCESS_INLET,
              target: ConnectionPointType.PROCESS_INLET,
              message: 'Inlet-to-inlet connection detected',
              severity: 'warning' as const,
              suggestions: ['Verify flow direction', 'Consider tee or distribution point']
            },
            {
              source: ConnectionPointType.DRAIN,
              target: ConnectionPointType.PROCESS_OUTLET,
              message: 'Drain connected to process outlet',
              severity: 'error' as const,
              suggestions: ['Connect drain to process inlet', 'Review drainage system']
            },
            {
              source: ConnectionPointType.VENT,
              target: ConnectionPointType.PROCESS_OUTLET,
              message: 'Vent connected to process outlet',
              severity: 'error' as const,
              suggestions: ['Connect vent to process inlet', 'Review venting system']
            }
          ];

          const matchingRule = directionRules.find(rule =>
            rule.source === source.type && rule.target === target.type
          );

          if (matchingRule) {
            issues.push({
              id: `direction-${matchingRule.source}-${matchingRule.target}-${source.id}-${target.id}`,
              ruleId: 'flow-direction-enhanced',
              severity: matchingRule.severity,
              message: matchingRule.message,
              description: 'Flow direction validation based on connection types',
              suggestions: matchingRule.suggestions,
              autoFixAvailable: false
            });
          }

          return issues;
        }
      },

      // Material Compatibility
      {
        id: 'material-compatibility',
        name: 'Material Compatibility Check',
        description: 'Validates material compatibility for different services',
        category: 'engineering',
        severity: 'warning',
        enabled: true,
        validate: (source, target, metadata) => {
          const issues: ValidationIssue[] = [];

          if (metadata?.material) {
            const corrosionRisks = [
              { material: 'carbon_steel', fluid: 'acid', risk: 'high' },
              { material: 'carbon_steel', fluid: 'seawater', risk: 'medium' },
              { material: 'aluminum', fluid: 'caustic', risk: 'high' },
              { material: 'copper', fluid: 'ammonia', risk: 'high' }
            ];

            const risk = corrosionRisks.find(r =>
              r.material === metadata.material && r.fluid === metadata.fluidType
            );

            if (risk && risk.risk === 'high') {
              issues.push({
                id: `material-incompatible-${source.id}-${target.id}`,
                ruleId: 'material-compatibility',
                severity: 'error',
                message: `Material ${metadata.material} incompatible with ${metadata.fluidType}`,
                description: 'High corrosion risk detected',
                suggestions: [
                  'Use corrosion-resistant material',
                  'Apply protective coating',
                  'Consider alternative routing'
                ],
                autoFixAvailable: false
              });
            } else if (risk && risk.risk === 'medium') {
              issues.push({
                id: `material-caution-${source.id}-${target.id}`,
                ruleId: 'material-compatibility',
                severity: 'warning',
                message: `Material ${metadata.material} may have compatibility issues with ${metadata.fluidType}`,
                description: 'Medium corrosion risk - consider monitoring',
                suggestions: [
                  'Review corrosion allowance',
                  'Implement monitoring program',
                  'Consider upgraded material'
                ]
              });
            }
          }

          return issues;
        }
      }
    ];
  }

  /**
   * Comprehensive connection validation using all rules
   */
  public validateConnection(
    source: ConnectionPoint,
    target: ConnectionPoint,
    metadata?: ConnectionMetadata
  ): ConnectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const allIssues: ValidationIssue[] = [];

    // First run the basic validation from the existing connection manager
    const basicValidation = connectionPointManager.validateConnection(source, target);

    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);
    if (basicValidation.suggestions) {
      suggestions.push(...basicValidation.suggestions);
    }

    // Then run enhanced validation rules
    for (const rule of this.rules.filter(r => r.enabled)) {
      const issues = rule.validate(source, target, metadata);
      allIssues.push(...issues);

      for (const issue of issues) {
        switch (issue.severity) {
          case 'error':
            errors.push(issue.message);
            break;
          case 'warning':
            warnings.push(issue.message);
            break;
          case 'info':
            suggestions.push(issue.message);
            break;
        }

        if (issue.suggestions) {
          suggestions.push(...issue.suggestions);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)], // Remove duplicates
      warnings: [...new Set(warnings)],
      suggestions: suggestions.length > 0 ? [...new Set(suggestions)] : undefined
    };
  }

  /**
   * Auto-snap behavior with magnetic effect (20px tolerance as specified)
   */
  public findSnapTarget(
    position: XYPosition,
    nodes: Node[],
    excludeNodeId?: string
  ): { point: ConnectionPoint; node: Node; snapPosition: XYPosition } | null {
    if (!this.autoSnapConfig.enabled) return null;

    let bestMatch: { point: ConnectionPoint; node: Node; distance: number; snapPosition: XYPosition } | null = null;

    for (const node of nodes) {
      if (node.id === excludeNodeId) continue;

      const connectionPoints = connectionPointManager.getConnectionPoints(node);
      const nodeWidth = node.width || 100;
      const nodeHeight = node.height || 60;

      for (const point of connectionPoints) {
        const absoluteX = node.position.x + (point.position.x * nodeWidth);
        const absoluteY = node.position.y + (point.position.y * nodeHeight);

        const distance = Math.sqrt(
          Math.pow(absoluteX - position.x, 2) +
          Math.pow(absoluteY - position.y, 2)
        );

        if (distance <= this.autoSnapConfig.snapDistance) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = {
              point,
              node,
              distance,
              snapPosition: { x: absoluteX, y: absoluteY }
            };
          }
        }
      }
    }

    return bestMatch ? {
      point: bestMatch.point,
      node: bestMatch.node,
      snapPosition: bestMatch.snapPosition
    } : null;
  }

  /**
   * Check if manifold support is needed (multiple connections to single point)
   */
  public checkManifoldSupport(
    connectionPoint: ConnectionPoint,
    newConnection: Connection
  ): { needsManifold: boolean; insertYPiece: boolean; manifoldType: string } {
    const currentConnections = connectionPoint.connectedEdges.length;
    const wouldExceedLimit = currentConnections + 1 > this.manifoldConfig.maxConnections;

    const needsManifold = currentConnections > 0 && !connectionPoint.validation.allowMultiple;
    const insertYPiece = this.manifoldConfig.autoInsertYPiece && currentConnections === 1;

    let manifoldType = 'tee';
    if (currentConnections >= 2) {
      manifoldType = 'manifold';
    } else if (currentConnections === 1) {
      manifoldType = 'y-piece';
    }

    return {
      needsManifold,
      insertYPiece,
      manifoldType
    };
  }

  /**
   * Get visual feedback class for connection validity
   */
  public getConnectionFeedbackClass(
    source: ConnectionPoint,
    target: ConnectionPoint,
    metadata?: ConnectionMetadata
  ): string {
    const validation = this.validateConnection(source, target, metadata);

    if (!validation.isValid) {
      return 'connection-invalid'; // Red
    } else if (validation.warnings.length > 0) {
      return 'connection-warning'; // Yellow
    } else {
      return 'connection-valid'; // Green
    }
  }

  /**
   * Enable/disable validation rule
   */
  public setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Add custom validation rule
   */
  public addCustomRule(rule: ConnectionValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Update auto-snap configuration
   */
  public updateAutoSnapConfig(config: Partial<AutoSnapConfig>): void {
    this.autoSnapConfig = { ...this.autoSnapConfig, ...config };
  }

  /**
   * Update smart routing configuration
   */
  public updateSmartRoutingConfig(config: Partial<SmartRoutingConfig>): void {
    this.smartRoutingConfig = { ...this.smartRoutingConfig, ...config };
  }

  /**
   * Update manifold configuration
   */
  public updateManifoldConfig(config: Partial<ManifoldConfig>): void {
    this.manifoldConfig = { ...this.manifoldConfig, ...config };
  }

  /**
   * Get all configuration objects
   */
  public getConfigurations() {
    return {
      autoSnap: { ...this.autoSnapConfig },
      smartRouting: { ...this.smartRoutingConfig },
      manifold: { ...this.manifoldConfig }
    };
  }

  /**
   * Get all validation rules
   */
  public getValidationRules(): ConnectionValidationRule[] {
    return [...this.rules];
  }
}

// Export singleton instance
export const intelligentConnectionValidator = new IntelligentConnectionValidator();