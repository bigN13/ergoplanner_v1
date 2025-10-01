// IndexedDB wrapper for offline-first BoQ data storage
// Provides a clean async interface over IndexedDB for Ergoplanner BoQ system

interface DatabaseSchema {
  name: string;
  version: number;
  stores: StoreDefinition[];
}

interface StoreDefinition {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: IndexDefinition[];
}

interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
}

interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filter?: (item: any) => boolean;
}

class IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private schema: DatabaseSchema;

  constructor(schema: DatabaseSchema) {
    this.dbName = schema.name;
    this.version = schema.version;
    this.schema = schema;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create or update object stores
        this.schema.stores.forEach(storeDefinition => {
          if (db.objectStoreNames.contains(storeDefinition.name)) {
            // For upgrades, we might need to delete and recreate
            // In production, implement proper migration logic
            if (event.oldVersion > 0) {
              db.deleteObjectStore(storeDefinition.name);
            }
          }

          const store = db.createObjectStore(storeDefinition.name, {
            keyPath: storeDefinition.keyPath,
            autoIncrement: storeDefinition.autoIncrement || false,
          });

          // Create indexes
          if (storeDefinition.indexes) {
            storeDefinition.indexes.forEach(indexDef => {
              store.createIndex(indexDef.name, indexDef.keyPath, {
                unique: indexDef.unique || false,
              });
            });
          }
        });
      };
    });
  }

  private ensureConnection(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  private getTransaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): IDBTransaction {
    this.ensureConnection();
    return this.db!.transaction(storeNames, mode);
  }

  // Generic CRUD operations
  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addMany<T>(storeName: string, items: T[]): Promise<IDBValidKey[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const results: IDBValidKey[] = [];
      let completed = 0;

      if (items.length === 0) {
        resolve([]);
        return;
      }

      transaction.oncomplete = () => resolve(results);
      transaction.onerror = () => reject(transaction.error);

      items.forEach((item, index) => {
        const request = store.add(item);
        request.onsuccess = () => {
          results[index] = request.result;
          completed++;
        };
      });
    });
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName);
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string, options?: QueryOptions): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName);
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as T[];

        // Apply filters
        if (options?.filter) {
          results = results.filter(options.filter);
        }

        // Apply sorting
        if (options?.orderBy) {
          results.sort((a, b) => {
            const aVal = (a as any)[options.orderBy!];
            const bVal = (b as any)[options.orderBy!];

            let comparison = 0;
            if (aVal > bVal) comparison = 1;
            if (aVal < bVal) comparison = -1;

            return options.orderDirection === 'desc' ? -comparison : comparison;
          });
        }

        // Apply pagination
        if (options?.offset || options?.limit) {
          const start = options.offset || 0;
          const end = options.limit ? start + options.limit : undefined;
          results = results.slice(start, end);
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex<T>(storeName: string, indexName: string, key: IDBValidKey): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName);
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMany<T>(storeName: string, items: T[]): Promise<IDBValidKey[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const results: IDBValidKey[] = [];
      let completed = 0;

      if (items.length === 0) {
        resolve([]);
        return;
      }

      transaction.oncomplete = () => resolve(results);
      transaction.onerror = () => reject(transaction.error);

      items.forEach((item, index) => {
        const request = store.put(item);
        request.onsuccess = () => {
          results[index] = request.result;
          completed++;
        };
      });
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMany(storeName: string, keys: IDBValidKey[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      let completed = 0;

      if (keys.length === 0) {
        resolve();
        return;
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      keys.forEach(key => {
        const request = store.delete(key);
        request.onsuccess = () => {
          completed++;
        };
      });
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction(storeName);
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Advanced query methods
  async query<T>(
    storeName: string,
    predicate: (item: T) => boolean,
    options?: QueryOptions
  ): Promise<T[]> {
    const allItems = await this.getAll<T>(storeName);
    let results = allItems.filter(predicate);

    // Apply additional options if provided
    if (options) {
      if (options.orderBy) {
        results.sort((a, b) => {
          const aVal = (a as any)[options.orderBy!];
          const bVal = (b as any)[options.orderBy!];

          let comparison = 0;
          if (aVal > bVal) comparison = 1;
          if (aVal < bVal) comparison = -1;

          return options.orderDirection === 'desc' ? -comparison : comparison;
        });
      }

      if (options.offset || options.limit) {
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        results = results.slice(start, end);
      }
    }

    return results;
  }

  // Batch operations for better performance
  async batch(operations: Array<{
    type: 'add' | 'update' | 'delete';
    storeName: string;
    data?: any;
    key?: IDBValidKey;
  }>): Promise<void> {
    const storeNames = Array.from(new Set(operations.map(op => op.storeName)));
    const transaction = this.getTransaction(storeNames, 'readwrite');

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      operations.forEach(operation => {
        const store = transaction.objectStore(operation.storeName);

        switch (operation.type) {
          case 'add':
            store.add(operation.data);
            break;
          case 'update':
            store.put(operation.data);
            break;
          case 'delete':
            if (operation.key) {
              store.delete(operation.key);
            }
            break;
        }
      });
    });
  }

  // Export/Import for data migration
  async export(): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = {};

    for (const storeDefinition of this.schema.stores) {
      result[storeDefinition.name] = await this.getAll(storeDefinition.name);
    }

    return result;
  }

  async import(data: Record<string, any[]>): Promise<void> {
    const operations: Array<{
      type: 'add';
      storeName: string;
      data: any;
    }> = [];

    // Clear existing data and prepare import operations
    for (const storeName of Object.keys(data)) {
      await this.clear(storeName);

      data[storeName].forEach(item => {
        operations.push({
          type: 'add',
          storeName,
          data: item,
        });
      });
    }

    // Execute batch import
    await this.batch(operations);
  }

  // Close the database connection
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Check if database is available
  static isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  // Get database info
  getInfo(): { name: string; version: number; stores: string[] } {
    return {
      name: this.dbName,
      version: this.version,
      stores: this.schema.stores.map(s => s.name),
    };
  }
}

export { IndexedDBWrapper };
export type { DatabaseSchema, StoreDefinition, IndexDefinition, QueryOptions };