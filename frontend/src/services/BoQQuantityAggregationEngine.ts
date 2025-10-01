/**
 * BoQ Quantity Aggregation Engine
 *
 * Intelligently aggregates quantities from P&ID symbol properties
 * for Bill of Quantities generation with support for:
 * - Symbol-based quantity extraction
 * - Connection-based length calculations
 * - Material takeoff from specifications
 * - Unit conversion and normalization
 * - Duplicate detection and consolidation
 */

import type { Node, Edge } from 'reactflow';
import type { BoQItem } from '../types/boq';

// ============================================================================
// Type Definitions
// ============================================================================

export interface QuantityRule {
  symbolType: string;
  quantitySource: 'count' | 'property' | 'calculated' | 'connection-based';
  propertyPath?: string;
  calculation?: (node: Node, edges: Edge[]) => number;
  unit: string;
  category: string;
  description?: string;
}

export interface AggregationResult {
  items: BoQItem[];
  summary: {
    totalItems: number;
    uniqueCategories: number;
    quantityByUnit: Record<string, number>;
    quantityByCategory: Record<string, number>;
  };
  warnings: string[];
  duplicates: Array<{
    items: BoQItem[];
    suggestedMerge: BoQItem;
  }>;
}

export interface MaterialTakeoff {
  nodeId: string;
  symbolType: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  material?: string;
  specification?: string;
  manufacturer?: string;
  modelNumber?: string;
  properties: Record<string, any>;
}

// ============================================================================
// Quantity Aggregation Engine
// ============================================================================

export class BoQQuantityAggregationEngine {
  private quantityRules: Map<string, QuantityRule> = new Map();
  private unitConversions: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeUnitConversions();
  }

  // ============================================================================
  // Rule Management
  // ============================================================================

  /**
   * Register a quantity extraction rule for a symbol type
   */
  registerRule(rule: QuantityRule): void {
    this.quantityRules.set(rule.symbolType, rule);
  }

  /**
   * Get rule for symbol type
   */
  getRule(symbolType: string): QuantityRule | undefined {
    return this.quantityRules.get(symbolType);
  }

  /**
   * Initialize default quantity rules for common P&ID symbols
   */
  private initializeDefaultRules(): void {
    // Pumps - count-based
    this.registerRule({
      symbolType: 'pump',
      quantitySource: 'count',
      unit: 'each',
      category: 'Rotating Equipment',
      description: 'Pump',
    });

    this.registerRule({
      symbolType: 'centrifugal-pump',
      quantitySource: 'count',
      unit: 'each',
      category: 'Rotating Equipment',
      description: 'Centrifugal Pump',
    });

    // Valves - count-based
    this.registerRule({
      symbolType: 'valve',
      quantitySource: 'count',
      unit: 'each',
      category: 'Valves',
      description: 'Valve',
    });

    this.registerRule({
      symbolType: 'gate-valve',
      quantitySource: 'count',
      unit: 'each',
      category: 'Valves',
      description: 'Gate Valve',
    });

    this.registerRule({
      symbolType: 'control-valve',
      quantitySource: 'count',
      unit: 'each',
      category: 'Valves',
      description: 'Control Valve',
    });

    // Vessels - count with volume property
    this.registerRule({
      symbolType: 'tank',
      quantitySource: 'property',
      propertyPath: 'volume',
      unit: 'm³',
      category: 'Vessels',
      description: 'Tank',
    });

    this.registerRule({
      symbolType: 'vessel',
      quantitySource: 'property',
      propertyPath: 'volume',
      unit: 'm³',
      category: 'Vessels',
      description: 'Pressure Vessel',
    });

    // Heat Exchangers - count with area property
    this.registerRule({
      symbolType: 'heat-exchanger',
      quantitySource: 'property',
      propertyPath: 'heatTransferArea',
      unit: 'm²',
      category: 'Heat Transfer Equipment',
      description: 'Heat Exchanger',
    });

    // Instruments - count-based
    this.registerRule({
      symbolType: 'flow-meter',
      quantitySource: 'count',
      unit: 'each',
      category: 'Instrumentation',
      description: 'Flow Meter',
    });

    this.registerRule({
      symbolType: 'pressure-gauge',
      quantitySource: 'count',
      unit: 'each',
      category: 'Instrumentation',
      description: 'Pressure Gauge',
    });

    // Pipes - connection-based length calculation
    this.registerRule({
      symbolType: 'pipe',
      quantitySource: 'connection-based',
      calculation: this.calculatePipeLength.bind(this),
      unit: 'm',
      category: 'Piping',
      description: 'Piping',
    });

    // Water Treatment - Thames Water symbols
    this.registerRule({
      symbolType: 'thames-primary-clarifier',
      quantitySource: 'count',
      unit: 'each',
      category: 'Water Treatment',
      description: 'Primary Clarifier',
    });

    this.registerRule({
      symbolType: 'thames-rapid-gravity-filter',
      quantitySource: 'count',
      unit: 'each',
      category: 'Water Treatment',
      description: 'Rapid Gravity Filter',
    });

    // Sewage Treatment - Severn Trent symbols
    this.registerRule({
      symbolType: 'severn-activated-sludge-tank',
      quantitySource: 'property',
      propertyPath: 'volume',
      unit: 'm³',
      category: 'Biological Treatment',
      description: 'Activated Sludge Tank',
    });

    this.registerRule({
      symbolType: 'severn-anaerobic-digester',
      quantitySource: 'property',
      propertyPath: 'workingVolume',
      unit: 'm³',
      category: 'Sludge Treatment',
      description: 'Anaerobic Digester',
    });
  }

  /**
   * Initialize unit conversion factors
   */
  private initializeUnitConversions(): void {
    // Length conversions
    const lengthConversions = new Map<string, number>([
      ['m', 1],
      ['ft', 0.3048],
      ['in', 0.0254],
      ['mm', 0.001],
      ['km', 1000],
      ['mile', 1609.34],
    ]);
    this.unitConversions.set('length', lengthConversions);

    // Volume conversions
    const volumeConversions = new Map<string, number>([
      ['m³', 1],
      ['L', 0.001],
      ['gal', 0.00378541],
      ['ft³', 0.0283168],
      ['bbl', 0.158987],
    ]);
    this.unitConversions.set('volume', volumeConversions);

    // Area conversions
    const areaConversions = new Map<string, number>([
      ['m²', 1],
      ['ft²', 0.092903],
      ['in²', 0.00064516],
      ['cm²', 0.0001],
    ]);
    this.unitConversions.set('area', areaConversions);

    // Weight conversions
    const weightConversions = new Map<string, number>([
      ['kg', 1],
      ['lb', 0.453592],
      ['ton', 1000],
      ['oz', 0.0283495],
    ]);
    this.unitConversions.set('weight', weightConversions);
  }

  // ============================================================================
  // Quantity Extraction
  // ============================================================================

  /**
   * Extract quantity from a single node
   */
  extractQuantityFromNode(node: Node, edges: Edge[]): MaterialTakeoff | null {
    const symbolType = node.type || node.data.symbolType || 'unknown';
    const rule = this.getRule(symbolType);

    if (!rule) {
      return null;
    }

    let quantity: number;

    switch (rule.quantitySource) {
      case 'count':
        quantity = 1;
        break;

      case 'property':
        quantity = this.getPropertyValue(node, rule.propertyPath || '');
        if (quantity === 0) return null;
        break;

      case 'calculated':
        if (!rule.calculation) return null;
        quantity = rule.calculation(node, edges);
        if (quantity === 0) return null;
        break;

      case 'connection-based':
        if (!rule.calculation) return null;
        quantity = rule.calculation(node, edges);
        if (quantity === 0) return null;
        break;

      default:
        return null;
    }

    const description = this.generateDescription(node, rule);

    return {
      nodeId: node.id,
      symbolType,
      category: rule.category,
      description,
      quantity,
      unit: rule.unit,
      material: node.data.material?.material || node.data.material,
      specification: node.data.specification || node.data.spec,
      manufacturer: node.data.manufacturer,
      modelNumber: node.data.modelNumber || node.data.model,
      properties: node.data,
    };
  }

  /**
   * Generate description for BoQ item
   */
  private generateDescription(node: Node, rule: QuantityRule): string {
    const parts: string[] = [];

    if (rule.description) {
      parts.push(rule.description);
    }

    if (node.data.label) {
      parts.push(`(${node.data.label})`);
    }

    if (node.data.pipeSize) {
      const size = node.data.pipeSize;
      parts.push(`${size.nominal}${size.unit}`);
    }

    if (node.data.material) {
      const material = typeof node.data.material === 'string'
        ? node.data.material
        : node.data.material.material;
      parts.push(material);
    }

    if (node.data.pressureRating || node.data.rating) {
      parts.push(node.data.pressureRating || node.data.rating);
    }

    return parts.join(' ');
  }

  /**
   * Get property value from node data using path
   */
  private getPropertyValue(node: Node, path: string): number {
    const parts = path.split('.');
    let value: any = node.data;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return 0;
      }
    }

    return typeof value === 'number' ? value : 0;
  }

  /**
   * Calculate pipe length from edge connections
   */
  private calculatePipeLength(node: Node, edges: Edge[]): number {
    // For pipe nodes, calculate based on connected edges
    // This is a simplified calculation - real implementation would use
    // actual coordinates and routing
    const connectedEdges = edges.filter(
      (edge) => edge.source === node.id || edge.target === node.id
    );

    // Estimate 10 meters per connection as placeholder
    // Real implementation should calculate actual distance
    return connectedEdges.length * 10;
  }

  // ============================================================================
  // Aggregation
  // ============================================================================

  /**
   * Aggregate quantities from all nodes in a drawing
   */
  aggregateQuantities(nodes: Node[], edges: Edge[]): AggregationResult {
    const takeoffs: MaterialTakeoff[] = [];
    const warnings: string[] = [];

    // Extract quantities from each node
    for (const node of nodes) {
      try {
        const takeoff = this.extractQuantityFromNode(node, edges);
        if (takeoff) {
          takeoffs.push(takeoff);
        }
      } catch (error) {
        warnings.push(`Failed to extract quantity from node ${node.id}: ${error}`);
      }
    }

    // Group and aggregate by category and description
    const aggregatedMap = new Map<string, BoQItem>();

    for (const takeoff of takeoffs) {
      const key = `${takeoff.category}|${takeoff.description}|${takeoff.unit}|${takeoff.material || ''}`;

      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!;
        existing.quantity += takeoff.quantity;
        existing.sourceNodeIds = [...(existing.sourceNodeIds || []), takeoff.nodeId];
      } else {
        const boqItem: BoQItem = {
          id: `boq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          category: takeoff.category,
          description: takeoff.description,
          quantity: takeoff.quantity,
          unit: takeoff.unit,
          unitCost: 0,
          totalCost: 0,
          material: takeoff.material,
          specification: takeoff.specification,
          manufacturer: takeoff.manufacturer,
          modelNumber: takeoff.modelNumber,
          sourceNodeIds: [takeoff.nodeId],
          drawingId: '',
          projectId: '',
          lastModified: new Date(),
          createdAt: new Date(),
          createdBy: '',
        };

        aggregatedMap.set(key, boqItem);
      }
    }

    const items = Array.from(aggregatedMap.values());

    // Calculate summary
    const quantityByUnit: Record<string, number> = {};
    const quantityByCategory: Record<string, number> = {};
    const categories = new Set<string>();

    for (const item of items) {
      categories.add(item.category);

      quantityByUnit[item.unit] = (quantityByUnit[item.unit] || 0) + item.quantity;
      quantityByCategory[item.category] = (quantityByCategory[item.category] || 0) + item.quantity;
    }

    // Detect duplicates
    const duplicates = this.detectDuplicates(items);

    return {
      items,
      summary: {
        totalItems: items.length,
        uniqueCategories: categories.size,
        quantityByUnit,
        quantityByCategory,
      },
      warnings,
      duplicates,
    };
  }

  /**
   * Detect potential duplicate items
   */
  private detectDuplicates(items: BoQItem[]): Array<{ items: BoQItem[]; suggestedMerge: BoQItem }> {
    const duplicates: Array<{ items: BoQItem[]; suggestedMerge: BoQItem }> = [];
    const checked = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      if (checked.has(items[i].id)) continue;

      const similar: BoQItem[] = [items[i]];

      for (let j = i + 1; j < items.length; j++) {
        if (this.areSimilarItems(items[i], items[j])) {
          similar.push(items[j]);
          checked.add(items[j].id);
        }
      }

      if (similar.length > 1) {
        const suggestedMerge = this.mergeDuplicates(similar);
        duplicates.push({ items: similar, suggestedMerge });
      }

      checked.add(items[i].id);
    }

    return duplicates;
  }

  /**
   * Check if two items are similar (potential duplicates)
   */
  private areSimilarItems(item1: BoQItem, item2: BoQItem): boolean {
    return (
      item1.category === item2.category &&
      item1.unit === item2.unit &&
      this.calculateSimilarity(item1.description, item2.description) > 0.8
    );
  }

  /**
   * Calculate string similarity (simple Levenshtein-based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Merge duplicate items
   */
  private mergeDuplicates(items: BoQItem[]): BoQItem {
    const merged: BoQItem = { ...items[0] };

    merged.quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    merged.sourceNodeIds = items.flatMap((item) => item.sourceNodeIds || []);
    merged.totalCost = merged.quantity * merged.unitCost;

    return merged;
  }

  /**
   * Convert quantity between units
   */
  convertUnit(quantity: number, fromUnit: string, toUnit: string, unitType: string): number {
    const conversions = this.unitConversions.get(unitType);
    if (!conversions) return quantity;

    const fromFactor = conversions.get(fromUnit);
    const toFactor = conversions.get(toUnit);

    if (!fromFactor || !toFactor) return quantity;

    return (quantity * fromFactor) / toFactor;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const boqQuantityAggregationEngine = new BoQQuantityAggregationEngine();
