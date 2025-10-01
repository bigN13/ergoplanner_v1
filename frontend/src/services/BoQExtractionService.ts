// BoQ Component Extraction Service
// Automatically extracts Bill of Quantities items from ReactFlow diagrams

import type { Node, Edge } from 'reactflow';
import type {
  BoQItem,
  BoQCategory,
  BoQExtractionConfig,
} from '../types/boq';
import type { PIDNodeData } from '../types/drawing';
import { getBoQDatabase } from '../lib/boq-database';

interface ExtractionContext {
  projectId?: string;
  drawingId?: string;
  extractionConfig: BoQExtractionConfig;
  categories: BoQCategory[];
}

interface ExtractionResult {
  items: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[];
  warnings: ExtractionWarning[];
  statistics: ExtractionStatistics;
}

interface ExtractionWarning {
  type: 'missing-data' | 'validation-error' | 'mapping-conflict' | 'unknown-type';
  nodeId: string;
  message: string;
  suggestion?: string;
}

interface ExtractionStatistics {
  totalNodes: number;
  extractedItems: number;
  skippedNodes: number;
  categoryCounts: Record<string, number>;
  totalEstimatedValue: number;
  averageItemValue: number;
  extractionTime: number;
}

class BoQExtractionService {
  private config: BoQExtractionConfig | null = null;
  private categories: BoQCategory[] = [];

  constructor() {
    this.loadConfiguration();
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const db = getBoQDatabase();
      await db.initialize();

      // Load extraction config
      const allData = await db.exportData();
      const configs = allData.templates.map(t => t as any as BoQExtractionConfig).filter(c => c.enabled);
      this.config = configs.find(c => c.enabled) || configs[0] || null;

      // Load categories
      this.categories = await db.getAllCategories();
    } catch (error) {
      console.error('Failed to load BoQ extraction configuration:', error);
    }
  }

  async extractFromDrawing(
    nodes: Node[],
    edges: Edge[],
    context: Partial<ExtractionContext> = {}
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    if (!this.config || !this.config.enabled) {
      throw new Error('BoQ extraction is not configured or disabled');
    }

    const extractionContext: ExtractionContext = {
      ...context,
      extractionConfig: this.config,
      categories: this.categories,
    };

    const result: ExtractionResult = {
      items: [],
      warnings: [],
      statistics: {
        totalNodes: nodes.length,
        extractedItems: 0,
        skippedNodes: 0,
        categoryCounts: {},
        totalEstimatedValue: 0,
        averageItemValue: 0,
        extractionTime: 0,
      },
    };

    // Group nodes by type for batch processing
    const nodesByType = this.groupNodesByType(nodes);

    // Extract items from each node type
    for (const [nodeType, nodeGroup] of nodesByType.entries()) {
      const typeResults = await this.extractFromNodeType(
        nodeType,
        nodeGroup,
        edges,
        extractionContext
      );

      result.items.push(...typeResults.items);
      result.warnings.push(...typeResults.warnings);
    }

    // Apply auto-extraction rules
    const enhancedItems = await this.applyAutoExtractionRules(
      result.items,
      extractionContext
    );

    // Validate extracted items
    const validatedResults = await this.validateExtractedItems(
      enhancedItems,
      extractionContext
    );

    result.items = validatedResults.items;
    result.warnings.push(...validatedResults.warnings);

    // Calculate statistics
    this.calculateStatistics(result, Date.now() - startTime);

    return result;
  }

  private groupNodesByType(nodes: Node[]): Map<string, Node[]> {
    const grouped = new Map<string, Node[]>();

    nodes.forEach(node => {
      const nodeType = node.type || 'default';
      if (!grouped.has(nodeType)) {
        grouped.set(nodeType, []);
      }
      grouped.get(nodeType)!.push(node);
    });

    return grouped;
  }

  private async extractFromNodeType(
    nodeType: string,
    nodes: Node[],
    edges: Edge[],
    context: ExtractionContext
  ): Promise<{ items: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[]; warnings: ExtractionWarning[] }> {
    const items: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const warnings: ExtractionWarning[] = [];

    const typeMapping = context.extractionConfig.nodeTypeMappings[nodeType];
    if (!typeMapping) {
      // Skip nodes without mapping
      warnings.push({
        type: 'unknown-type',
        nodeId: nodes[0]?.id || 'unknown',
        message: `No extraction mapping found for node type: ${nodeType}`,
        suggestion: `Add mapping for '${nodeType}' in extraction configuration`,
      });
      return { items, warnings };
    }

    // Extract items based on quantity source
    if (typeMapping.quantitySource === 'count') {
      // Group similar nodes and count them
      const groupedNodes = this.groupSimilarNodes(nodes, typeMapping);

      for (const [groupKey, nodeGroup] of groupedNodes.entries()) {
        const representativeNode = nodeGroup[0];
        const item = await this.createBoQItemFromNode(
          representativeNode,
          nodeGroup.length,
          typeMapping,
          context
        );

        if (item) {
          item.linkedElements = nodeGroup.map(n => n.id);
          items.push(item);
        }
      }
    } else if (typeMapping.quantitySource === 'property') {
      // Extract quantity from node properties
      for (const node of nodes) {
        const quantity = this.extractQuantityFromNode(node, typeMapping);
        if (quantity > 0) {
          const item = await this.createBoQItemFromNode(
            node,
            quantity,
            typeMapping,
            context
          );

          if (item) {
            item.linkedElements = [node.id];
            items.push(item);
          }
        } else {
          warnings.push({
            type: 'missing-data',
            nodeId: node.id,
            message: `Could not extract quantity from property '${typeMapping.quantityProperty}'`,
            suggestion: `Ensure node has valid '${typeMapping.quantityProperty}' property`,
          });
        }
      }
    }

    return { items, warnings };
  }

  private groupSimilarNodes(
    nodes: Node[],
    typeMapping: any
  ): Map<string, Node[]> {
    const groups = new Map<string, Node[]>();

    nodes.forEach(node => {
      const key = this.generateNodeGroupKey(node, typeMapping);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(node);
    });

    return groups;
  }

  private generateNodeGroupKey(node: Node, typeMapping: any): string {
    const data = node.data as PIDNodeData;
    const keyParts: string[] = [node.type || 'default'];

    // Include relevant properties for grouping
    const groupingProperties = ['material', 'size', 'diameter', 'specification', 'model'];
    groupingProperties.forEach(prop => {
      const value = (data as any)?.[prop] || (data?.specifications as any)?.[prop];
      if (value) {
        keyParts.push(`${prop}:${value}`);
      }
    });

    return keyParts.join('|');
  }

  private extractQuantityFromNode(node: Node, typeMapping: any): number {
    const data = node.data as PIDNodeData;
    const propertyPath = typeMapping.quantityProperty;

    if (!propertyPath) return 1;

    let value: any = data;
    const path = propertyPath.split('.');
    for (const key of path) {
      value = value?.[key];
    }

    const quantity = Number(value);
    return isNaN(quantity) ? 0 : Math.max(0, quantity);
  }

  private async createBoQItemFromNode(
    node: Node,
    quantity: number,
    typeMapping: any,
    context: ExtractionContext
  ): Promise<Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'> | null> {
    const data = node.data as PIDNodeData;

    // Extract basic information
    const description = this.extractDescription(node, typeMapping);
    const specification = this.extractSpecification(node, typeMapping);
    const unit = this.extractUnit(node, typeMapping);
    const unitPrice = await this.extractUnitPrice(node, typeMapping, context);
    const category = this.extractCategory(node, typeMapping, context);

    if (!description) return null;

    // Extract additional properties
    const dimensions = this.extractDimensions(node);
    const materialGrade = this.extractMaterialGrade(node);
    const supplier = this.extractSupplier(node);
    const tags = this.extractTags(node, typeMapping);

    const item: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId: context.projectId,
      drawingId: context.drawingId,
      category,
      description,
      specification,
      quantity,
      unit,
      unitPrice,
      totalPrice: quantity * unitPrice,
      linkedElements: [node.id],
      extractionMethod: 'automatic',
      elementProperties: data ? { ...data } : undefined,
      dimensions,
      materialGrade,
      supplier,
      tags,
      priority: 'medium',
      status: 'pending',
      syncStatus: 'pending',
      lastExtractedAt: new Date(),
    };

    return item;
  }

  private extractDescription(node: Node, typeMapping: any): string {
    const data = node.data as PIDNodeData;

    // Try node label first
    if (data?.label) {
      return data.label;
    }

    // Try node type with formatting
    const nodeType = node.type || 'Component';
    return nodeType.charAt(0).toUpperCase() + nodeType.slice(1).replace(/[-_]/g, ' ');
  }

  private extractSpecification(node: Node, typeMapping: any): string {
    const data = node.data as PIDNodeData;
    const template = typeMapping.specificationTemplate;

    if (!template) {
      return data?.specifications?.specification || '';
    }

    // Replace template placeholders
    return template.replace(/\$\{([^}]+)\}/g, (match: string, key: string) => {
      const value = this.getNestedProperty(data, key);
      return value !== undefined ? String(value) : match;
    });
  }

  private extractUnit(node: Node, typeMapping: any): string {
    const data = node.data as PIDNodeData;

    if (typeMapping.unitSource === 'property' && typeMapping.unitProperty) {
      const unit = this.getNestedProperty(data, typeMapping.unitProperty);
      if (unit) return String(unit);
    }

    // Use category default
    const category = this.extractCategory(node, typeMapping, { categories: this.categories } as any);
    const categoryDef = this.categories.find(c => c.id === category || c.name === category);

    return categoryDef?.defaultUnit || 'EA';
  }

  private async extractUnitPrice(
    node: Node,
    typeMapping: any,
    context: ExtractionContext
  ): Promise<number> {
    const data = node.data as PIDNodeData;

    if (typeMapping.priceSource === 'property' && typeMapping.priceProperty) {
      const price = this.getNestedProperty(data, typeMapping.priceProperty);
      const numPrice = Number(price);
      if (!isNaN(numPrice) && numPrice > 0) {
        return numPrice;
      }
    }

    if (typeMapping.priceSource === 'catalog') {
      // TODO: Implement catalog lookup
      // For now, return 0 to indicate catalog lookup needed
      return 0;
    }

    // Default pricing based on category
    const category = this.extractCategory(node, typeMapping, context);
    return this.getDefaultPriceForCategory(category);
  }

  private extractCategory(
    node: Node,
    typeMapping: any,
    context: ExtractionContext
  ): string {
    const data = node.data as PIDNodeData;

    // Check node data first
    if (data?.category) {
      return data.category;
    }

    // Use mapping default
    if (typeMapping.defaultCategory) {
      return typeMapping.defaultCategory;
    }

    // Try to infer from node type
    const nodeType = node.type || '';
    const matchingCategory = context.categories.find(cat =>
      cat.extractionRules.nodeTypes.includes(nodeType)
    );

    return matchingCategory?.id || 'equipment';
  }

  private extractDimensions(node: Node): any {
    const data = node.data as PIDNodeData;
    const specs = data?.specifications as any;

    if (!specs) return undefined;

    const dimensions: any = {};

    // Common dimension properties
    const dimensionProps = ['length', 'width', 'height', 'diameter', 'thickness', 'weight'];
    dimensionProps.forEach(prop => {
      const value = specs[prop];
      if (value !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          dimensions[prop] = numValue;
        }
      }
    });

    return Object.keys(dimensions).length > 0 ? dimensions : undefined;
  }

  private extractMaterialGrade(node: Node): string | undefined {
    const data = node.data as PIDNodeData;
    const specs = data?.specifications as any;

    return specs?.material || specs?.materialGrade || specs?.grade;
  }

  private extractSupplier(node: Node): string | undefined {
    const data = node.data as PIDNodeData;
    const specs = data?.specifications as any;

    return specs?.supplier || specs?.manufacturer || specs?.vendor;
  }

  private extractTags(node: Node, typeMapping: any): string[] {
    const data = node.data as PIDNodeData;
    const tags: string[] = [];

    // Add node type as tag
    if (node.type) {
      tags.push(node.type);
    }

    // Add category as tag
    if (typeMapping.defaultCategory) {
      tags.push(typeMapping.defaultCategory);
    }

    // Add existing tags from node data
    if (data?.tags && Array.isArray(data.tags)) {
      tags.push(...data.tags);
    }

    // Add safety-related tags
    if (this.isSafetyCritical(node)) {
      tags.push('safety-critical');
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private isSafetyCritical(node: Node): boolean {
    const data = node.data as PIDNodeData;
    const safetyKeywords = ['safety', 'emergency', 'relief', 'alarm', 'shutdown', 'interlock'];

    const searchText = [
      data?.label,
      data?.specifications?.description,
      node.type,
    ].join(' ').toLowerCase();

    return safetyKeywords.some(keyword => searchText.includes(keyword));
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getDefaultPriceForCategory(category: string): number {
    // Default prices by category (in USD)
    const defaultPrices: Record<string, number> = {
      equipment: 5000,
      piping: 50,
      instrumentation: 1500,
      electrical: 300,
      civil: 100,
    };

    return defaultPrices[category] || 0;
  }

  private async applyAutoExtractionRules(
    items: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[],
    context: ExtractionContext
  ): Promise<Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const enhancedItems = [...items];

    for (const rule of context.extractionConfig.autoExtractionRules) {
      for (const item of enhancedItems) {
        if (this.evaluateRuleConditions(item, rule.conditions)) {
          this.applyRuleActions(item, rule.actions);
        }
      }
    }

    return enhancedItems;
  }

  private evaluateRuleConditions(item: any, conditions: any[]): boolean {
    return conditions.every(condition => {
      const value = this.getNestedProperty(item, condition.property);

      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'exists':
          return value !== undefined && value !== null;
        case 'greater':
          return Number(value) > Number(condition.value);
        case 'less':
          return Number(value) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  private applyRuleActions(item: any, actions: any[]): void {
    actions.forEach(action => {
      switch (action.type) {
        case 'set-category':
          item.category = action.value;
          break;
        case 'set-unit':
          item.unit = action.value;
          break;
        case 'set-price':
          item.unitPrice = action.value;
          item.totalPrice = item.quantity * action.value;
          break;
        case 'add-tag':
          if (!item.tags) item.tags = [];
          if (!item.tags.includes(action.value)) {
            item.tags.push(action.value);
          }
          break;
        case 'ignore':
          item._ignored = true;
          break;
      }
    });
  }

  private async validateExtractedItems(
    items: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[],
    context: ExtractionContext
  ): Promise<{ items: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[]; warnings: ExtractionWarning[] }> {
    const validItems: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const warnings: ExtractionWarning[] = [];

    for (const item of items) {
      // Skip ignored items
      if ((item as any)._ignored) {
        continue;
      }

      const itemWarnings = this.validateItem(item, context);
      warnings.push(...itemWarnings);

      // Include item even with warnings (warnings are not blocking)
      validItems.push(item);
    }

    return { items: validItems, warnings };
  }

  private validateItem(
    item: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>,
    context: ExtractionContext
  ): ExtractionWarning[] {
    const warnings: ExtractionWarning[] = [];
    const linkedElementId = item.linkedElements[0] || 'unknown';

    for (const rule of context.extractionConfig.validationRules) {
      const value = (item as any)[rule.field];

      switch (rule.rule) {
        case 'required':
          if (!value) {
            warnings.push({
              type: 'validation-error',
              nodeId: linkedElementId,
              message: rule.message,
            });
          }
          break;
        case 'min':
          if (Number(value) < Number(rule.value)) {
            warnings.push({
              type: 'validation-error',
              nodeId: linkedElementId,
              message: rule.message,
            });
          }
          break;
        case 'max':
          if (Number(value) > Number(rule.value)) {
            warnings.push({
              type: 'validation-error',
              nodeId: linkedElementId,
              message: rule.message,
            });
          }
          break;
        case 'pattern':
          if (!new RegExp(rule.value).test(String(value))) {
            warnings.push({
              type: 'validation-error',
              nodeId: linkedElementId,
              message: rule.message,
            });
          }
          break;
      }
    }

    return warnings;
  }

  private calculateStatistics(result: ExtractionResult, extractionTime: number): void {
    result.statistics.extractionTime = extractionTime;
    result.statistics.extractedItems = result.items.length;
    result.statistics.skippedNodes = result.statistics.totalNodes - result.items.reduce(
      (sum, item) => sum + item.linkedElements.length, 0
    );

    // Calculate category counts
    result.items.forEach(item => {
      result.statistics.categoryCounts[item.category] =
        (result.statistics.categoryCounts[item.category] || 0) + 1;
    });

    // Calculate value statistics
    result.statistics.totalEstimatedValue = result.items.reduce(
      (sum, item) => sum + item.totalPrice, 0
    );
    result.statistics.averageItemValue = result.items.length > 0
      ? result.statistics.totalEstimatedValue / result.items.length
      : 0;
  }

  // Public utility methods
  async updateExtractionConfig(config: Partial<BoQExtractionConfig>): Promise<void> {
    if (!this.config) return;

    const updatedConfig = { ...this.config, ...config };

    const db = getBoQDatabase();
    await db.initialize();
    // Note: update method would be implemented when backend is ready
    console.log('Config update queued:', updatedConfig);

    this.config = updatedConfig;
  }

  getExtractionConfig(): BoQExtractionConfig | null {
    return this.config;
  }

  async refreshConfiguration(): Promise<void> {
    await this.loadConfiguration();
  }

  // Extract from specific node types
  async extractFromSelection(
    selectedNodes: Node[],
    allEdges: Edge[],
    context: Partial<ExtractionContext> = {}
  ): Promise<ExtractionResult> {
    return this.extractFromDrawing(selectedNodes, allEdges, context);
  }

  // Quick extraction for preview
  async previewExtraction(
    nodes: Node[],
    maxItems: number = 10
  ): Promise<Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const result = await this.extractFromDrawing(nodes, []);
    return result.items.slice(0, maxItems);
  }
}

// Singleton instance
let extractionService: BoQExtractionService | null = null;

export const getBoQExtractionService = (): BoQExtractionService => {
  if (!extractionService) {
    extractionService = new BoQExtractionService();
  }
  return extractionService;
};

export { BoQExtractionService };
export type { ExtractionResult, ExtractionWarning, ExtractionStatistics };