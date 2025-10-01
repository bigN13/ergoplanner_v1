// BoQ Database Service - Offline-first data layer for Bill of Quantities
// Provides high-level interface over IndexedDB for BoQ operations

import { IndexedDBWrapper, type DatabaseSchema, type QueryOptions } from './indexeddb';
import type {
  BoQItem,
  BoQProject,
  BoQDrawing,
  BoQCategory,
  BoQSupplier,
  BoQCostCalculation,
  BoQTemplate,
  BoQSyncQueueItem,
  BoQExportData,
  BoQSearchFilters,
  BoQSearchResult,
  BoQAnalytics,
  BoQExtractionConfig,
} from '../types/boq';

// Database schema for BoQ system
const BOQ_DATABASE_SCHEMA: DatabaseSchema = {
  name: 'ErgoPlannerBoQ',
  version: 1,
  stores: [
    {
      name: 'boq_items',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'drawingId', keyPath: 'drawingId' },
        { name: 'category', keyPath: 'category' },
        { name: 'supplier', keyPath: 'supplier' },
        { name: 'status', keyPath: 'status' },
        { name: 'syncStatus', keyPath: 'syncStatus' },
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'updatedAt', keyPath: 'updatedAt' },
        { name: 'totalPrice', keyPath: 'totalPrice' },
        { name: 'compound_category_status', keyPath: ['category', 'status'] },
        { name: 'compound_project_category', keyPath: ['projectId', 'category'] },
      ],
    },
    {
      name: 'boq_projects',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'clientName', keyPath: 'clientName' },
        { name: 'projectNumber', keyPath: 'projectNumber' },
        { name: 'syncStatus', keyPath: 'syncStatus' },
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'updatedAt', keyPath: 'updatedAt' },
      ],
    },
    {
      name: 'boq_drawings',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'name', keyPath: 'name' },
        { name: 'version', keyPath: 'version' },
        { name: 'syncStatus', keyPath: 'syncStatus' },
        { name: 'lastExtractionDate', keyPath: 'lastExtractionDate' },
        { name: 'compound_project_version', keyPath: ['projectId', 'version'] },
      ],
    },
    {
      name: 'boq_categories',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'parentId', keyPath: 'parentId' },
        { name: 'defaultUnit', keyPath: 'defaultUnit' },
      ],
    },
    {
      name: 'boq_suppliers',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'syncStatus', keyPath: 'syncStatus' },
      ],
    },
    {
      name: 'boq_calculations',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'calculatedAt', keyPath: 'calculatedAt' },
        { name: 'version', keyPath: 'version' },
        { name: 'compound_project_version', keyPath: ['projectId', 'version'] },
      ],
    },
    {
      name: 'boq_templates',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'category', keyPath: 'category' },
        { name: 'usageCount', keyPath: 'usageCount' },
      ],
    },
    {
      name: 'boq_sync_queue',
      keyPath: 'id',
      indexes: [
        { name: 'entityType', keyPath: 'entityType' },
        { name: 'entityId', keyPath: 'entityId' },
        { name: 'operation', keyPath: 'operation' },
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'priority', keyPath: 'priority' },
        { name: 'retryCount', keyPath: 'retryCount' },
      ],
    },
    {
      name: 'boq_extraction_config',
      keyPath: 'id',
      indexes: [
        { name: 'enabled', keyPath: 'enabled' },
      ],
    },
  ],
};

class BoQDatabaseService {
  private db: IndexedDBWrapper;
  private isInitialized: boolean = false;

  constructor() {
    this.db = new IndexedDBWrapper(BOQ_DATABASE_SCHEMA);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.db.initialize();
    await this.initializeDefaultData();
    this.isInitialized = true;
  }

  private async initializeDefaultData(): Promise<void> {
    // Initialize default categories if none exist
    const categoryCount = await this.db.count('boq_categories');
    if (categoryCount === 0) {
      await this.initializeDefaultCategories();
    }

    // Initialize default extraction config
    const configCount = await this.db.count('boq_extraction_config');
    if (configCount === 0) {
      await this.initializeDefaultExtractionConfig();
    }
  }

  private async initializeDefaultCategories(): Promise<void> {
    const defaultCategories: BoQCategory[] = [
      {
        id: 'equipment',
        name: 'Equipment',
        description: 'Process equipment and machinery',
        defaultUnit: 'EA',
        extractionRules: {
          nodeTypes: ['tank', 'pump', 'compressor', 'heat-exchanger'],
          propertyMatchers: [
            { property: 'type', pattern: 'equipment|machinery', weight: 0.8 },
            { property: 'category', pattern: 'equipment', weight: 0.9 },
          ],
        },
        costingDefaults: {
          laborMultiplier: 0.3,
          materialMarkup: 0.15,
          overheadPercentage: 0.1,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'piping',
        name: 'Piping',
        description: 'Pipes, fittings, and connections',
        defaultUnit: 'LM',
        extractionRules: {
          nodeTypes: ['pipe', 'fitting', 'valve'],
          propertyMatchers: [
            { property: 'type', pattern: 'pipe|fitting|valve', weight: 0.9 },
            { property: 'category', pattern: 'piping', weight: 0.9 },
          ],
        },
        costingDefaults: {
          laborMultiplier: 0.4,
          materialMarkup: 0.2,
          overheadPercentage: 0.08,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'instrumentation',
        name: 'Instrumentation',
        description: 'Instruments and control devices',
        defaultUnit: 'EA',
        extractionRules: {
          nodeTypes: ['instrument', 'sensor', 'transmitter', 'controller'],
          propertyMatchers: [
            { property: 'type', pattern: 'instrument|sensor|transmitter|controller', weight: 0.9 },
            { property: 'category', pattern: 'instrumentation', weight: 0.9 },
          ],
        },
        costingDefaults: {
          laborMultiplier: 0.5,
          materialMarkup: 0.1,
          overheadPercentage: 0.12,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'electrical',
        name: 'Electrical',
        description: 'Electrical equipment and components',
        defaultUnit: 'EA',
        extractionRules: {
          nodeTypes: ['motor', 'panel', 'cable', 'junction-box'],
          propertyMatchers: [
            { property: 'type', pattern: 'motor|electrical|panel|cable', weight: 0.8 },
            { property: 'category', pattern: 'electrical', weight: 0.9 },
          ],
        },
        costingDefaults: {
          laborMultiplier: 0.35,
          materialMarkup: 0.18,
          overheadPercentage: 0.1,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'civil',
        name: 'Civil/Structural',
        description: 'Civil and structural components',
        defaultUnit: 'M3',
        extractionRules: {
          nodeTypes: ['foundation', 'structure', 'building'],
          propertyMatchers: [
            { property: 'type', pattern: 'foundation|structure|building|civil', weight: 0.8 },
            { property: 'category', pattern: 'civil|structural', weight: 0.9 },
          ],
        },
        costingDefaults: {
          laborMultiplier: 0.6,
          materialMarkup: 0.25,
          overheadPercentage: 0.15,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await this.db.addMany('boq_categories', defaultCategories);
  }

  private async initializeDefaultExtractionConfig(): Promise<void> {
    const defaultConfig: BoQExtractionConfig = {
      id: 'default',
      enabled: true,
      nodeTypeMappings: {
        tank: {
          defaultCategory: 'equipment',
          quantitySource: 'count',
          unitSource: 'default',
          priceSource: 'default',
          specificationTemplate: 'Tank - ${material} ${volume}L ${pressure}bar',
        },
        pump: {
          defaultCategory: 'equipment',
          quantitySource: 'count',
          unitSource: 'default',
          priceSource: 'property',
          priceProperty: 'unitPrice',
          specificationTemplate: 'Pump - ${type} ${flow}L/min ${head}m',
        },
        valve: {
          defaultCategory: 'piping',
          quantitySource: 'count',
          unitSource: 'default',
          priceSource: 'catalog',
          specificationTemplate: 'Valve - ${type} ${size}" ${material}',
        },
        pipe: {
          defaultCategory: 'piping',
          quantitySource: 'property',
          quantityProperty: 'length',
          unitSource: 'default',
          priceSource: 'catalog',
          specificationTemplate: 'Pipe - ${material} ${diameter}" ${schedule}',
        },
        instrument: {
          defaultCategory: 'instrumentation',
          quantitySource: 'count',
          unitSource: 'default',
          priceSource: 'catalog',
          specificationTemplate: 'Instrument - ${type} ${range} ${accuracy}%',
        },
      },
      autoExtractionRules: [
        {
          id: 'high-value-equipment',
          name: 'High Value Equipment',
          conditions: [
            { property: 'category', operator: 'equals', value: 'equipment' },
            { property: 'unitPrice', operator: 'greater', value: 10000 },
          ],
          actions: [
            { type: 'set-category', value: 'equipment' },
            { type: 'add-tag', value: 'high-value' },
          ],
        },
        {
          id: 'safety-critical',
          name: 'Safety Critical Items',
          conditions: [
            { property: 'tags', operator: 'contains', value: 'safety' },
          ],
          actions: [
            { type: 'add-tag', value: 'safety-critical' },
          ],
        },
      ],
      validationRules: [
        {
          field: 'description',
          rule: 'required',
          message: 'Description is required',
        },
        {
          field: 'quantity',
          rule: 'min',
          value: 0,
          message: 'Quantity must be positive',
        },
        {
          field: 'unitPrice',
          rule: 'min',
          value: 0,
          message: 'Unit price must be positive',
        },
      ],
    };

    await this.db.add('boq_extraction_config', defaultConfig);
  }

  // BoQ Items CRUD operations
  async createBoQItem(item: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const boqItem: BoQItem = {
      ...item,
      id: `boq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      totalPrice: item.quantity * item.unitPrice,
    };

    await this.db.add('boq_items', boqItem);
    await this.addToSyncQueue('item', boqItem.id, 'create', boqItem);
    return boqItem.id;
  }

  async updateBoQItem(id: string, updates: Partial<BoQItem>): Promise<void> {
    const existingItem = await this.db.get<BoQItem>('boq_items', id);
    if (!existingItem) {
      throw new Error(`BoQ item with id ${id} not found`);
    }

    const updatedItem: BoQItem = {
      ...existingItem,
      ...updates,
      updatedAt: new Date(),
      syncStatus: 'pending',
      localChanges: true,
    };

    // Recalculate total price if quantity or unit price changed
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
    }

    await this.db.update('boq_items', updatedItem);
    await this.addToSyncQueue('item', id, 'update', updatedItem);
  }

  async deleteBoQItem(id: string): Promise<void> {
    const item = await this.db.get<BoQItem>('boq_items', id);
    if (!item) {
      throw new Error(`BoQ item with id ${id} not found`);
    }

    await this.db.delete('boq_items', id);
    await this.addToSyncQueue('item', id, 'delete', { id });
  }

  async getBoQItem(id: string): Promise<BoQItem | undefined> {
    return await this.db.get<BoQItem>('boq_items', id);
  }

  async getBoQItemsByProject(projectId: string, options?: QueryOptions): Promise<BoQItem[]> {
    return await this.db.getAllByIndex<BoQItem>('boq_items', 'projectId', projectId);
  }

  async getBoQItemsByDrawing(drawingId: string): Promise<BoQItem[]> {
    return await this.db.getAllByIndex<BoQItem>('boq_items', 'drawingId', drawingId);
  }

  async getBoQItemsByCategory(category: string): Promise<BoQItem[]> {
    return await this.db.getAllByIndex<BoQItem>('boq_items', 'category', category);
  }

  async searchBoQItems(filters: BoQSearchFilters): Promise<BoQSearchResult> {
    let items = await this.db.getAll<BoQItem>('boq_items');

    // Apply filters
    if (filters.categories?.length) {
      items = items.filter(item => filters.categories!.includes(item.category));
    }

    if (filters.suppliers?.length) {
      items = items.filter(item =>
        item.supplier && filters.suppliers!.includes(item.supplier)
      );
    }

    if (filters.status?.length) {
      items = items.filter(item =>
        item.status && filters.status!.includes(item.status)
      );
    }

    if (filters.priceRange) {
      items = items.filter(item =>
        item.totalPrice >= filters.priceRange!.min &&
        item.totalPrice <= filters.priceRange!.max
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      items = items.filter(item =>
        item.description.toLowerCase().includes(searchLower) ||
        item.specification.toLowerCase().includes(searchLower) ||
        (item.notes && item.notes.toLowerCase().includes(searchLower))
      );
    }

    // Calculate facets
    const facets = {
      categories: {} as Record<string, number>,
      suppliers: {} as Record<string, number>,
      status: {} as Record<string, number>,
      priceRanges: [] as Array<{ range: string; count: number }>,
    };

    items.forEach(item => {
      // Category facets
      facets.categories[item.category] = (facets.categories[item.category] || 0) + 1;

      // Supplier facets
      if (item.supplier) {
        facets.suppliers[item.supplier] = (facets.suppliers[item.supplier] || 0) + 1;
      }

      // Status facets
      if (item.status) {
        facets.status[item.status] = (facets.status[item.status] || 0) + 1;
      }
    });

    return {
      items,
      totalCount: items.length,
      facets,
    };
  }

  // Project operations
  async createProject(project: Omit<BoQProject, 'id' | 'createdAt' | 'updatedAt' | 'drawingIds'>): Promise<string> {
    const now = new Date();
    const boqProject: BoQProject = {
      ...project,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      drawingIds: [],
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await this.db.add('boq_projects', boqProject);
    await this.addToSyncQueue('project', boqProject.id, 'create', boqProject);
    return boqProject.id;
  }

  async getProject(id: string): Promise<BoQProject | undefined> {
    return await this.db.get<BoQProject>('boq_projects', id);
  }

  async getAllProjects(): Promise<BoQProject[]> {
    return await this.db.getAll<BoQProject>('boq_projects');
  }

  async updateProject(id: string, updates: Partial<BoQProject>): Promise<void> {
    const existingProject = await this.db.get<BoQProject>('boq_projects', id);
    if (!existingProject) {
      throw new Error(`Project with id ${id} not found`);
    }

    const updatedProject: BoQProject = {
      ...existingProject,
      ...updates,
      updatedAt: new Date(),
      syncStatus: 'pending',
    };

    await this.db.update('boq_projects', updatedProject);
    await this.addToSyncQueue('project', id, 'update', updatedProject);
  }

  // Category operations
  async getAllCategories(): Promise<BoQCategory[]> {
    return await this.db.getAll<BoQCategory>('boq_categories');
  }

  async createCategory(category: Omit<BoQCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const boqCategory: BoQCategory = {
      ...category,
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.add('boq_categories', boqCategory);
    return boqCategory.id;
  }

  // Supplier operations
  async getAllSuppliers(): Promise<BoQSupplier[]> {
    return await this.db.getAll<BoQSupplier>('boq_suppliers');
  }

  async createSupplier(supplier: Omit<BoQSupplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const boqSupplier: BoQSupplier = {
      ...supplier,
      id: `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await this.db.add('boq_suppliers', boqSupplier);
    await this.addToSyncQueue('supplier', boqSupplier.id, 'create', boqSupplier);
    return boqSupplier.id;
  }

  // Cost calculation operations
  async calculateProjectCosts(projectId: string): Promise<BoQCostCalculation> {
    const items = await this.getBoQItemsByProject(projectId);
    const project = await this.getProject(projectId);

    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    // Calculate costs
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const laborCost = subtotal * 0.3; // 30% labor
    const materialCost = subtotal * 0.7; // 70% material
    const equipmentCost = subtotal * 0.1; // 10% equipment
    const overheadCost = subtotal * (project.markupPercentage || 15) / 100;
    const markup = subtotal * 0.15; // 15% markup
    const tax = (subtotal + overheadCost + markup) * (project.taxRate || 10) / 100;
    const totalCost = subtotal + laborCost + equipmentCost + overheadCost + markup + tax;

    // Category breakdown
    const categoryMap = new Map<string, { subtotal: number; count: number }>();
    items.forEach(item => {
      const existing = categoryMap.get(item.category) || { subtotal: 0, count: 0 };
      categoryMap.set(item.category, {
        subtotal: existing.subtotal + item.totalPrice,
        count: existing.count + 1,
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: categoryId, // TODO: lookup actual category name
      subtotal: data.subtotal,
      itemCount: data.count,
      percentage: (data.subtotal / subtotal) * 100,
    }));

    const calculation: BoQCostCalculation = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      subtotal,
      laborCost,
      materialCost,
      equipmentCost,
      overheadCost,
      markup,
      tax,
      totalCost,
      parameters: {
        laborRate: 50, // $50/hour
        equipmentRate: 25, // $25/hour
        overheadPercentage: project.markupPercentage || 15,
        markupPercentage: 15,
        taxPercentage: project.taxRate || 10,
        currency: project.defaultCurrency,
      },
      categoryBreakdown,
      calculatedAt: new Date(),
      calculatedBy: 'system',
      version: 1,
    };

    await this.db.add('boq_calculations', calculation);
    return calculation;
  }

  // Sync queue operations
  private async addToSyncQueue(
    entityType: BoQSyncQueueItem['entityType'],
    entityId: string,
    operation: BoQSyncQueueItem['operation'],
    data: any
  ): Promise<void> {
    const queueItem: BoQSyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      operation,
      data,
      timestamp: new Date(),
      retryCount: 0,
      priority: 'medium',
    };

    await this.db.add('boq_sync_queue', queueItem);
  }

  async getSyncQueue(): Promise<BoQSyncQueueItem[]> {
    return await this.db.getAll<BoQSyncQueueItem>('boq_sync_queue', {
      orderBy: 'timestamp',
      orderDirection: 'asc',
    });
  }

  async clearSyncQueue(): Promise<void> {
    await this.db.clear('boq_sync_queue');
  }

  // Export/Import operations
  async exportData(): Promise<BoQExportData> {
    const [projects, drawings, items, categories, suppliers, calculations, templates] = await Promise.all([
      this.db.getAll<BoQProject>('boq_projects'),
      this.db.getAll<BoQDrawing>('boq_drawings'),
      this.db.getAll<BoQItem>('boq_items'),
      this.db.getAll<BoQCategory>('boq_categories'),
      this.db.getAll<BoQSupplier>('boq_suppliers'),
      this.db.getAll<BoQCostCalculation>('boq_calculations'),
      this.db.getAll<BoQTemplate>('boq_templates'),
    ]);

    return {
      metadata: {
        exportDate: new Date(),
        exportVersion: '1.0',
        totalItems: items.length,
      },
      projects,
      drawings,
      items,
      categories,
      suppliers,
      calculations,
      templates,
    };
  }

  async importData(data: BoQExportData): Promise<void> {
    // Clear existing data (in production, implement merge strategy)
    await Promise.all([
      this.db.clear('boq_projects'),
      this.db.clear('boq_drawings'),
      this.db.clear('boq_items'),
      this.db.clear('boq_suppliers'),
      this.db.clear('boq_calculations'),
      this.db.clear('boq_templates'),
    ]);

    // Import data
    await Promise.all([
      this.db.addMany('boq_projects', data.projects),
      this.db.addMany('boq_drawings', data.drawings),
      this.db.addMany('boq_items', data.items),
      this.db.addMany('boq_suppliers', data.suppliers),
      this.db.addMany('boq_calculations', data.calculations),
      this.db.addMany('boq_templates', data.templates),
    ]);
  }

  // Utility methods
  async getDatabaseInfo(): Promise<any> {
    const [
      itemCount,
      projectCount,
      drawingCount,
      categoryCount,
      supplierCount,
    ] = await Promise.all([
      this.db.count('boq_items'),
      this.db.count('boq_projects'),
      this.db.count('boq_drawings'),
      this.db.count('boq_categories'),
      this.db.count('boq_suppliers'),
    ]);

    return {
      ...this.db.getInfo(),
      counts: {
        items: itemCount,
        projects: projectCount,
        drawings: drawingCount,
        categories: categoryCount,
        suppliers: supplierCount,
      },
    };
  }

  async clearAllData(): Promise<void> {
    const storeNames = BOQ_DATABASE_SCHEMA.stores.map(store => store.name);
    await Promise.all(storeNames.map(name => this.db.clear(name)));
    await this.initializeDefaultData();
  }

  close(): void {
    this.db.close();
    this.isInitialized = false;
  }

  // Additional utility methods for compatibility
  async getAll<T>(storeName: string, options?: any): Promise<T[]> {
    return await this.db.getAll<T>(storeName, options);
  }

  async getAllByIndex<T>(storeName: string, indexName: string, key: IDBValidKey): Promise<T[]> {
    return await this.db.getAllByIndex<T>(storeName, indexName, key);
  }

  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return await this.db.add(storeName, data);
  }

  async update<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return await this.db.update(storeName, data);
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return await this.db.delete(storeName, key);
  }
}

// Singleton instance
let boqDatabase: BoQDatabaseService | null = null;

export const getBoQDatabase = (): BoQDatabaseService => {
  if (!boqDatabase) {
    boqDatabase = new BoQDatabaseService();
  }
  return boqDatabase;
};

export { BoQDatabaseService };