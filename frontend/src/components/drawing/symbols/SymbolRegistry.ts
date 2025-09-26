import type { ComponentType} from 'react';
import { lazy } from 'react';
import type { NodeProps } from 'reactflow';

import type { ISymbolBaseData, ISymbolProps } from './SymbolBase';

/**
 * Symbol category for organization
 */
export enum SymbolCategory {
  VESSELS = 'vessels',
  PUMPS = 'pumps',
  COMPRESSORS = 'compressors',
  HEAT_EXCHANGERS = 'heat_exchangers',
  VALVES = 'valves',
  INSTRUMENTS = 'instruments',
  PIPING = 'piping',
  ELECTRICAL = 'electrical',
  SAFETY = 'safety',
  CUSTOM = 'custom',
}

/**
 * Symbol registration metadata
 */
export interface ISymbolRegistration {
  id: string;
  name: string;
  category: SymbolCategory;
  subCategory?: string;
  component: ComponentType<NodeProps<any>>;
  thumbnail?: string;
  description?: string;
  tags?: string[];
  standard?: string;
  version?: string;
  lazyLoad?: boolean;
}

/**
 * Symbol factory function type
 */
export type SymbolFactory<T extends ISymbolBaseData = ISymbolBaseData> = (
  data: Partial<T>
) => ComponentType<ISymbolProps<T>>;

/**
 * Symbol Registry for managing all available symbols
 */
class SymbolRegistry {
  private static instance: SymbolRegistry;
  private symbols: Map<string, ISymbolRegistration> = new Map();
  private categories: Map<SymbolCategory, Set<string>> = new Map();
  private factories: Map<string, SymbolFactory> = new Map();
  private loadedComponents: Map<string, ComponentType<any>> = new Map();

  private constructor() {
    // Initialize categories
    Object.values(SymbolCategory).forEach((category) => {
      this.categories.set(category as SymbolCategory, new Set());
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SymbolRegistry {
    if (!SymbolRegistry.instance) {
      SymbolRegistry.instance = new SymbolRegistry();
    }
    return SymbolRegistry.instance;
  }

  /**
   * Register a new symbol
   */
  public register(registration: ISymbolRegistration): void {
    if (this.symbols.has(registration.id)) {
      console.warn(`Symbol ${registration.id} is already registered`);
      return;
    }

    this.symbols.set(registration.id, registration);

    // Add to category index
    const categorySet = this.categories.get(registration.category);
    if (categorySet) {
      categorySet.add(registration.id);
    }

    // If lazy loading, don't store the component yet
    if (!registration.lazyLoad) {
      this.loadedComponents.set(registration.id, registration.component);
    }
  }

  /**
   * Register a symbol factory
   */
  public registerFactory(id: string, factory: SymbolFactory): void {
    this.factories.set(id, factory);
  }

  /**
   * Batch register multiple symbols
   */
  public registerBatch(registrations: ISymbolRegistration[]): void {
    registrations.forEach((registration) => this.register(registration));
  }

  /**
   * Unregister a symbol
   */
  public unregister(id: string): boolean {
    const registration = this.symbols.get(id);
    if (!registration) {
      return false;
    }

    // Remove from symbols map
    this.symbols.delete(id);

    // Remove from category index
    const categorySet = this.categories.get(registration.category);
    if (categorySet) {
      categorySet.delete(id);
    }

    // Remove from loaded components
    this.loadedComponents.delete(id);

    // Remove factory if exists
    this.factories.delete(id);

    return true;
  }

  /**
   * Get a symbol by ID
   */
  public get(id: string): ISymbolRegistration | undefined {
    return this.symbols.get(id);
  }

  /**
   * Get symbol component by ID
   */
  public async getComponent(id: string): Promise<ComponentType<any> | undefined> {
    // Check if already loaded
    if (this.loadedComponents.has(id)) {
      return this.loadedComponents.get(id);
    }

    // Get registration
    const registration = this.symbols.get(id);
    if (!registration) {
      console.error(`Symbol ${id} not found in registry`);
      return undefined;
    }

    // If lazy loading, load now
    if (registration.lazyLoad) {
      try {
        // Assume component is a lazy import function
        const component = await (registration.component as any)();
        this.loadedComponents.set(id, component.default || component);
        return this.loadedComponents.get(id);
      } catch (error) {
        console.error(`Failed to load symbol ${id}:`, error);
        return undefined;
      }
    }

    return registration.component;
  }

  /**
   * Get symbol factory by ID
   */
  public getFactory(id: string): SymbolFactory | undefined {
    return this.factories.get(id);
  }

  /**
   * Get all symbols
   */
  public getAll(): ISymbolRegistration[] {
    return Array.from(this.symbols.values());
  }

  /**
   * Get symbols by category
   */
  public getByCategory(category: SymbolCategory): ISymbolRegistration[] {
    const categorySet = this.categories.get(category);
    if (!categorySet) {
      return [];
    }

    return Array.from(categorySet)
      .map((id) => this.symbols.get(id))
      .filter((s): s is ISymbolRegistration => s !== undefined);
  }

  /**
   * Search symbols by tags
   */
  public searchByTags(tags: string[]): ISymbolRegistration[] {
    return this.getAll().filter((symbol) => {
      if (!symbol.tags) {
        return false;
      }
      return tags.some((tag) => symbol.tags?.includes(tag));
    });
  }

  /**
   * Search symbols by name
   */
  public searchByName(query: string): ISymbolRegistration[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter((symbol) =>
      symbol.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get symbols by standard
   */
  public getByStandard(standard: string): ISymbolRegistration[] {
    return this.getAll().filter((symbol) => symbol.standard === standard);
  }

  /**
   * Check if a symbol is registered
   */
  public has(id: string): boolean {
    return this.symbols.has(id);
  }

  /**
   * Clear all registrations
   */
  public clear(): void {
    this.symbols.clear();
    this.categories.forEach((set) => set.clear());
    this.loadedComponents.clear();
    this.factories.clear();
  }

  /**
   * Get registry statistics
   */
  public getStats(): {
    totalSymbols: number;
    byCategory: Record<string, number>;
    loadedComponents: number;
    factories: number;
  } {
    const byCategory: Record<string, number> = {};
    this.categories.forEach((set, category) => {
      byCategory[category] = set.size;
    });

    return {
      totalSymbols: this.symbols.size,
      byCategory,
      loadedComponents: this.loadedComponents.size,
      factories: this.factories.size,
    };
  }

  /**
   * Export registry data
   */
  public export(): {
    symbols: Array<{
      id: string;
      name: string;
      category: string;
      subCategory?: string;
      tags?: string[];
      standard?: string;
    }>;
  } {
    return {
      symbols: this.getAll().map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        subCategory: s.subCategory,
        tags: s.tags,
        standard: s.standard,
      })),
    };
  }

  /**
   * Preload symbols for performance
   */
  public async preloadCategory(category: SymbolCategory): Promise<void> {
    const symbols = this.getByCategory(category);
    const promises = symbols
      .filter((s) => s.lazyLoad)
      .map((s) => this.getComponent(s.id));

    await Promise.all(promises);
  }

  /**
   * Create dynamic symbol component
   */
  public createDynamicSymbol<T extends ISymbolBaseData>(
    id: string,
    data: Partial<T>
  ): ComponentType<ISymbolProps<T>> | null {
    const factory = this.factories.get(id);
    if (!factory) {
      console.error(`No factory found for symbol ${id}`);
      return null;
    }

    return factory(data) as ComponentType<ISymbolProps<T>>;
  }
}

// Export singleton instance
export const symbolRegistry = SymbolRegistry.getInstance();

/**
 * Decorator for auto-registering symbols
 */
export function RegisterSymbol(registration: Omit<ISymbolRegistration, 'component'>) {
  return function (target: any) {
    symbolRegistry.register({
      ...registration,
      component: target,
    });
    return target;
  };
}

/**
 * Helper to lazily register a symbol
 */
export function registerLazySymbol(
  id: string,
  name: string,
  category: SymbolCategory,
  importFn: () => Promise<any>,
  options?: Partial<ISymbolRegistration>
): void {
  symbolRegistry.register({
    id,
    name,
    category,
    component: lazy(importFn) as any,
    lazyLoad: true,
    ...options,
  });
}

export default symbolRegistry;