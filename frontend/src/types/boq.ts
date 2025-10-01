// Enhanced BoQ data models for offline-first Bill of Quantities system
// Supports automatic extraction from ReactFlow diagrams and offline storage

// Core BoQ item interface - enhanced from existing BoQItem
export interface BoQItem {
  // Core identification
  id: string;
  projectId?: string; // For multi-project support
  drawingId?: string; // Link to specific drawing

  // Item classification
  category: string;
  subcategory?: string;
  description: string;
  specification: string;

  // Quantity and measurements
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;

  // Supply chain information
  supplier?: string;
  supplierPartNumber?: string;
  leadTime?: number; // in days
  availability?: 'in-stock' | 'made-to-order' | 'discontinued' | 'unknown';

  // Technical specifications
  materialGrade?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    diameter?: number;
    thickness?: number;
    weight?: number;
  };

  // Drawing integration
  linkedElements: string[]; // ReactFlow node IDs
  extractionMethod: 'automatic' | 'manual' | 'imported';
  elementProperties?: Record<string, any>; // Properties from linked elements

  // Additional metadata
  notes?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'confirmed' | 'ordered' | 'delivered' | 'installed';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastExtractedAt?: Date; // When automatically extracted from drawing

  // Offline sync support
  syncStatus: 'synced' | 'pending' | 'conflict' | 'offline-only';
  serverVersion?: number;
  localChanges?: boolean;
}

// BoQ project structure for organization
export interface BoQProject {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  projectNumber?: string;

  // Project settings
  defaultCurrency: string;
  defaultUnit: string;
  markupPercentage?: number;
  taxRate?: number;

  // Drawing associations
  drawingIds: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Offline sync
  syncStatus: 'synced' | 'pending' | 'conflict' | 'offline-only';
  serverVersion?: number;
}

// Drawing metadata for BoQ integration
export interface BoQDrawing {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: string;

  // Drawing data
  reactFlowData: {
    nodes: any[];
    edges: any[];
    viewport: any;
  };

  // BoQ extraction metadata
  lastExtractionDate?: Date;
  extractionSettings: {
    autoExtractOnSave: boolean;
    includeCategories: string[];
    excludeNodeTypes: string[];
    quantityCalculationMethod: 'count' | 'sum-property' | 'custom';
  };

  // Statistics
  stats: {
    totalNodes: number;
    extractedItems: number;
    manualItems: number;
    totalValue: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Offline sync
  syncStatus: 'synced' | 'pending' | 'conflict' | 'offline-only';
  serverVersion?: number;
}

// Category definitions for standardized classification
export interface BoQCategory {
  id: string;
  name: string;
  parentId?: string; // For hierarchical categories
  description?: string;
  defaultUnit: string;

  // Extraction rules for automatic categorization
  extractionRules: {
    nodeTypes: string[];
    propertyMatchers: Array<{
      property: string;
      pattern: string; // regex pattern
      weight: number; // confidence weight
    }>;
  };

  // Cost calculation defaults
  costingDefaults: {
    laborMultiplier?: number;
    materialMarkup?: number;
    overheadPercentage?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Supplier information for procurement
export interface BoQSupplier {
  id: string;
  name: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };

  // Performance metrics
  ratings: {
    quality: number; // 1-5
    delivery: number; // 1-5
    cost: number; // 1-5
    service: number; // 1-5
  };

  // Catalog integration
  catalogItems: Array<{
    partNumber: string;
    description: string;
    category: string;
    unitPrice: number;
    leadTime: number;
    minimumOrderQuantity?: number;
  }>;

  createdAt: Date;
  updatedAt: Date;

  // Offline sync
  syncStatus: 'synced' | 'pending' | 'conflict' | 'offline-only';
}

// Cost calculation engine data
export interface BoQCostCalculation {
  id: string;
  projectId: string;

  // Cost breakdown
  subtotal: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  overheadCost: number;
  markup: number;
  tax: number;
  totalCost: number;

  // Calculation parameters
  parameters: {
    laborRate: number; // per hour
    equipmentRate: number; // per hour
    overheadPercentage: number;
    markupPercentage: number;
    taxPercentage: number;
    currency: string;
  };

  // Cost by category breakdown
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    subtotal: number;
    itemCount: number;
    percentage: number;
  }>;

  calculatedAt: Date;
  calculatedBy: 'system' | 'user';

  // Version tracking for cost changes
  version: number;
  previousCalculations?: string[]; // IDs of previous calculations
}

// Template system for common BoQ structures
export interface BoQTemplate {
  id: string;
  name: string;
  description?: string;
  category: string; // e.g., 'water-treatment', 'industrial', 'commercial'

  // Template items
  templateItems: Array<{
    category: string;
    description: string;
    specification: string;
    unit: string;
    estimatedQuantity?: number;
    estimatedUnitPrice?: number;
    isRequired: boolean;
    alternativeItems?: string[]; // IDs of alternative items
  }>;

  // Extraction rules for auto-applying template
  autoApplyRules: {
    drawingTypeMatchers: string[];
    nodeCountThresholds: Record<string, number>;
    propertyMatchers: Array<{
      property: string;
      value: any;
      comparison: 'equals' | 'contains' | 'greater' | 'less';
    }>;
  };

  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

// Sync queue for offline changes
export interface BoQSyncQueueItem {
  id: string;
  entityType: 'item' | 'project' | 'drawing' | 'category' | 'supplier' | 'calculation';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
  priority: 'low' | 'medium' | 'high';
}

// Export/Import formats
export interface BoQExportData {
  metadata: {
    exportDate: Date;
    exportVersion: string;
    projectName?: string;
    totalItems: number;
  };

  projects: BoQProject[];
  drawings: BoQDrawing[];
  items: BoQItem[];
  categories: BoQCategory[];
  suppliers: BoQSupplier[];
  calculations: BoQCostCalculation[];
  templates: BoQTemplate[];
}

// Search and filter interfaces
export interface BoQSearchFilters {
  categories?: string[];
  suppliers?: string[];
  status?: string[];
  priority?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  quantityRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchText?: string;
  linkedDrawings?: string[];
  syncStatus?: string[];
}

export interface BoQSearchResult {
  items: BoQItem[];
  totalCount: number;
  facets: {
    categories: Record<string, number>;
    suppliers: Record<string, number>;
    status: Record<string, number>;
    priceRanges: Array<{ range: string; count: number }>;
  };
}

// Grid configuration for Excel-like interface
export interface BoQGridColumn {
  id: string;
  title: string;
  field: keyof BoQItem | string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  formatter?: 'currency' | 'number' | 'date' | 'percentage';
  validator?: (value: any) => string | null;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface BoQGridState {
  columns: BoQGridColumn[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters: Record<string, any>;
  selectedRows: string[];
  editingCell?: {
    rowId: string;
    columnId: string;
  };
  groupBy?: string;
  showTotals: boolean;
  pageSize: number;
  currentPage: number;
}

// Analytics and reporting
export interface BoQAnalytics {
  projectId: string;
  generatedAt: Date;

  summary: {
    totalItems: number;
    totalValue: number;
    averageItemValue: number;
    categoryCount: number;
    supplierCount: number;
  };

  trends: {
    costTrend: Array<{ date: Date; value: number }>;
    itemCountTrend: Array<{ date: Date; count: number }>;
    categoryGrowth: Record<string, number>; // percentage change
  };

  insights: {
    topExpensiveItems: BoQItem[];
    underutilizedSuppliers: string[];
    costOptimizationOpportunities: Array<{
      type: 'consolidation' | 'alternative-supplier' | 'bulk-discount';
      description: string;
      potentialSavings: number;
      affectedItems: string[];
    }>;
  };
}

// Component extraction configuration
export interface BoQExtractionConfig {
  enabled: boolean;

  // Node type mappings
  nodeTypeMappings: Record<string, {
    defaultCategory: string;
    quantitySource: 'count' | 'property';
    quantityProperty?: string;
    unitSource: 'default' | 'property';
    unitProperty?: string;
    priceSource: 'default' | 'property' | 'catalog';
    priceProperty?: string;
    specificationTemplate?: string; // Template with placeholders
  }>;

  // Automatic rules
  autoExtractionRules: Array<{
    id: string;
    name: string;
    conditions: Array<{
      property: string;
      operator: 'equals' | 'contains' | 'exists' | 'greater' | 'less';
      value?: any;
    }>;
    actions: Array<{
      type: 'set-category' | 'set-unit' | 'set-price' | 'add-tag' | 'ignore';
      value: any;
    }>;
  }>;

  // Quality controls
  validationRules: Array<{
    field: keyof BoQItem;
    rule: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message: string;
  }>;
}