// BoQ Bidirectional Sync Service
// Manages real-time synchronization between ReactFlow drawings and BoQ data

import type { Node, Edge } from 'reactflow';
import type { BoQItem, BoQDrawing } from '../types/boq';
import { getBoQDatabase } from '../lib/boq-database';
import { getBoQExtractionService } from './BoQExtractionService';

interface SyncState {
  isActive: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncDirection: 'drawing-to-boq' | 'boq-to-drawing' | 'bidirectional';
  autoSyncEnabled: boolean;
}

interface SyncEvent {
  type: 'node-added' | 'node-removed' | 'node-modified' | 'edge-added' | 'edge-removed' | 'boq-item-added' | 'boq-item-removed' | 'boq-item-modified';
  entityId: string;
  data: any;
  timestamp: Date;
}

interface SyncResult {
  success: boolean;
  itemsAdded: number;
  itemsUpdated: number;
  itemsRemoved: number;
  warnings: string[];
  errors: string[];
}

type SyncEventListener = (event: SyncEvent) => void;

class BoQSyncService {
  private syncState: SyncState = {
    isActive: false,
    lastSync: null,
    pendingChanges: 0,
    syncDirection: 'bidirectional',
    autoSyncEnabled: true,
  };

  private eventListeners: SyncEventListener[] = [];
  private syncQueue: SyncEvent[] = [];
  private syncTimer: NodeJS.Timeout | null = null;
  private isProcessingSync: boolean = false;

  private currentDrawingId: string | null = null;
  private currentProjectId: string | null = null;
  private lastKnownNodes: Node[] = [];
  private lastKnownEdges: Edge[] = [];
  private lastKnownBoQItems: BoQItem[] = [];

  constructor() {
    this.setupPeriodicSync();
  }

  // Initialize sync for a drawing
  async initializeSync(projectId: string, drawingId: string, nodes: Node[], edges: Edge[]): Promise<void> {
    this.currentProjectId = projectId;
    this.currentDrawingId = drawingId;
    this.lastKnownNodes = [...nodes];
    this.lastKnownEdges = [...edges];

    // Load existing BoQ items for this drawing
    const db = getBoQDatabase();
    await db.initialize();
    this.lastKnownBoQItems = await db.getBoQItemsByDrawing(drawingId);

    this.syncState.isActive = true;
    this.syncState.lastSync = new Date();

    // Perform initial sync if needed
    if (this.syncState.autoSyncEnabled) {
      await this.performFullSync();
    }
  }

  // Stop sync and cleanup
  stopSync(): void {
    this.syncState.isActive = false;
    this.currentDrawingId = null;
    this.currentProjectId = null;
    this.clearSyncQueue();

    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // Manual sync trigger
  async synchronize(): Promise<SyncResult> {
    if (!this.syncState.isActive) {
      throw new Error('Sync service is not active. Call initializeSync first.');
    }

    return await this.performFullSync();
  }

  // Drawing to BoQ sync
  async syncDrawingToBoQ(nodes: Node[], edges: Edge[]): Promise<SyncResult> {
    if (!this.currentDrawingId || !this.currentProjectId) {
      throw new Error('Sync not initialized');
    }

    const result: SyncResult = {
      success: true,
      itemsAdded: 0,
      itemsUpdated: 0,
      itemsRemoved: 0,
      warnings: [],
      errors: [],
    };

    try {
      // Extract new BoQ items from drawing
      const extractionService = getBoQExtractionService();
      const extractionResult = await extractionService.extractFromDrawing(nodes, edges, {
        projectId: this.currentProjectId,
        drawingId: this.currentDrawingId,
      });

      if (extractionResult.warnings.length > 0) {
        result.warnings.push(...extractionResult.warnings.map(w => w.message));
      }

      const db = getBoQDatabase();
      const existingItems = await db.getBoQItemsByDrawing(this.currentDrawingId);

      // Create maps for efficient lookup
      const existingItemsMap = new Map(existingItems.map(item => [
        this.generateItemKey(item),
        item
      ]));

      const extractedItemsMap = new Map(extractionResult.items.map(item => [
        this.generateExtractedItemKey(item),
        item
      ]));

      // Add new items
      for (const [key, extractedItem] of extractedItemsMap) {
        if (!existingItemsMap.has(key)) {
          try {
            await db.createBoQItem(extractedItem);
            result.itemsAdded++;
          } catch (error) {
            result.errors.push(`Failed to create item: ${error}`);
            result.success = false;
          }
        }
      }

      // Update existing items
      for (const [key, existingItem] of existingItemsMap) {
        const extractedItem = extractedItemsMap.get(key);
        if (extractedItem) {
          // Check if update is needed
          if (this.needsUpdate(existingItem, extractedItem)) {
            try {
              await db.updateBoQItem(existingItem.id, {
                description: extractedItem.description,
                specification: extractedItem.specification,
                quantity: extractedItem.quantity,
                unit: extractedItem.unit,
                linkedElements: extractedItem.linkedElements,
                elementProperties: extractedItem.elementProperties,
                lastExtractedAt: new Date(),
              });
              result.itemsUpdated++;
            } catch (error) {
              result.errors.push(`Failed to update item ${existingItem.id}: ${error}`);
              result.success = false;
            }
          }
        } else {
          // Item no longer exists in drawing - mark for potential removal
          if (existingItem.extractionMethod === 'automatic') {
            // Only remove automatically extracted items
            try {
              await db.deleteBoQItem(existingItem.id);
              result.itemsRemoved++;
            } catch (error) {
              result.errors.push(`Failed to remove item ${existingItem.id}: ${error}`);
              result.success = false;
            }
          }
        }
      }

      // Update cache
      this.lastKnownNodes = [...nodes];
      this.lastKnownEdges = [...edges];
      this.lastKnownBoQItems = await db.getBoQItemsByDrawing(this.currentDrawingId);

    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    }

    this.syncState.lastSync = new Date();
    return result;
  }

  // BoQ to Drawing sync (updates node properties based on BoQ changes)
  async syncBoQToDrawing(boqItems: BoQItem[]): Promise<{ updatedNodes: Node[]; warnings: string[] }> {
    const updatedNodes: Node[] = [];
    const warnings: string[] = [];

    // Create map of BoQ items by linked elements
    const boqByElement = new Map<string, BoQItem[]>();
    boqItems.forEach(item => {
      item.linkedElements.forEach(elementId => {
        if (!boqByElement.has(elementId)) {
          boqByElement.set(elementId, []);
        }
        boqByElement.get(elementId)!.push(item);
      });
    });

    // Update nodes with BoQ information
    this.lastKnownNodes.forEach(node => {
      const linkedItems = boqByElement.get(node.id);
      if (linkedItems && linkedItems.length > 0) {
        const updatedNode = { ...node };
        let hasChanges = false;

        // Update node data with BoQ information
        const boqInfo = {
          boqItems: linkedItems.map(item => ({
            id: item.id,
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            status: item.status,
          })),
          totalValue: linkedItems.reduce((sum, item) => sum + item.totalPrice, 0),
          totalQuantity: linkedItems.reduce((sum, item) => sum + item.quantity, 0),
        };

        // Update node data
        updatedNode.data = {
          ...updatedNode.data,
          boqInfo,
        };

        // Update node styling based on BoQ status
        const hasHighValueItems = linkedItems.some(item => item.totalPrice > 10000);
        const hasCriticalItems = linkedItems.some(item => item.priority === 'critical');

        if (hasHighValueItems || hasCriticalItems) {
          updatedNode.style = {
            ...updatedNode.style,
            border: hasCriticalItems ? '2px solid #ef4444' : '2px solid #f59e0b',
            backgroundColor: hasCriticalItems ? '#fef2f2' : '#fffbeb',
          };
          hasChanges = true;
        }

        if (hasChanges || JSON.stringify(node.data.boqInfo) !== JSON.stringify(boqInfo)) {
          updatedNodes.push(updatedNode);
        }
      }
    });

    this.lastKnownBoQItems = [...boqItems];
    return { updatedNodes, warnings };
  }

  // Event-driven sync methods
  onDrawingChange(nodes: Node[], edges: Edge[]): void {
    if (!this.syncState.isActive || !this.syncState.autoSyncEnabled) return;

    // Detect changes
    const nodeChanges = this.detectNodeChanges(this.lastKnownNodes, nodes);
    const edgeChanges = this.detectEdgeChanges(this.lastKnownEdges, edges);

    // Queue sync events
    [...nodeChanges, ...edgeChanges].forEach(event => {
      this.queueSyncEvent(event);
    });

    // Trigger sync if significant changes
    if (nodeChanges.length > 0 || edgeChanges.length > 0) {
      this.debouncedSync();
    }
  }

  onBoQChange(boqItems: BoQItem[]): void {
    if (!this.syncState.isActive || !this.syncState.autoSyncEnabled) return;

    const changes = this.detectBoQChanges(this.lastKnownBoQItems, boqItems);
    changes.forEach(event => this.queueSyncEvent(event));

    if (changes.length > 0) {
      this.debouncedSync();
    }
  }

  // Configuration methods
  setAutoSync(enabled: boolean): void {
    this.syncState.autoSyncEnabled = enabled;
  }

  setSyncDirection(direction: SyncState['syncDirection']): void {
    this.syncState.syncDirection = direction;
  }

  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  // Event subscription
  addEventListener(listener: SyncEventListener): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: SyncEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // Private helper methods
  private async performFullSync(): Promise<SyncResult> {
    if (this.isProcessingSync) {
      return {
        success: false,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsRemoved: 0,
        warnings: ['Sync already in progress'],
        errors: [],
      };
    }

    this.isProcessingSync = true;

    try {
      const result = await this.syncDrawingToBoQ(this.lastKnownNodes, this.lastKnownEdges);

      // Update drawing with BoQ information if bidirectional
      if (this.syncState.syncDirection === 'bidirectional' || this.syncState.syncDirection === 'boq-to-drawing') {
        const db = getBoQDatabase();
        const updatedItems = await db.getBoQItemsByDrawing(this.currentDrawingId!);
        await this.syncBoQToDrawing(updatedItems);
      }

      this.syncState.pendingChanges = 0;
      return result;
    } finally {
      this.isProcessingSync = false;
    }
  }

  private generateItemKey(item: BoQItem): string {
    return `${item.category}|${item.description}|${item.specification}|${item.unit}`;
  }

  private generateExtractedItemKey(item: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>): string {
    return `${item.category}|${item.description}|${item.specification}|${item.unit}`;
  }

  private needsUpdate(existing: BoQItem, extracted: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    return (
      existing.description !== extracted.description ||
      existing.specification !== extracted.specification ||
      existing.quantity !== extracted.quantity ||
      existing.unit !== extracted.unit ||
      JSON.stringify(existing.linkedElements.sort()) !== JSON.stringify(extracted.linkedElements.sort())
    );
  }

  private detectNodeChanges(oldNodes: Node[], newNodes: Node[]): SyncEvent[] {
    const events: SyncEvent[] = [];
    const oldNodeMap = new Map(oldNodes.map(n => [n.id, n]));
    const newNodeMap = new Map(newNodes.map(n => [n.id, n]));

    // Detect added nodes
    newNodes.forEach(node => {
      if (!oldNodeMap.has(node.id)) {
        events.push({
          type: 'node-added',
          entityId: node.id,
          data: node,
          timestamp: new Date(),
        });
      }
    });

    // Detect removed nodes
    oldNodes.forEach(node => {
      if (!newNodeMap.has(node.id)) {
        events.push({
          type: 'node-removed',
          entityId: node.id,
          data: node,
          timestamp: new Date(),
        });
      }
    });

    // Detect modified nodes
    newNodes.forEach(node => {
      const oldNode = oldNodeMap.get(node.id);
      if (oldNode && JSON.stringify(oldNode) !== JSON.stringify(node)) {
        events.push({
          type: 'node-modified',
          entityId: node.id,
          data: { old: oldNode, new: node },
          timestamp: new Date(),
        });
      }
    });

    return events;
  }

  private detectEdgeChanges(oldEdges: Edge[], newEdges: Edge[]): SyncEvent[] {
    const events: SyncEvent[] = [];
    const oldEdgeMap = new Map(oldEdges.map(e => [e.id, e]));
    const newEdgeMap = new Map(newEdges.map(e => [e.id, e]));

    // Detect added edges
    newEdges.forEach(edge => {
      if (!oldEdgeMap.has(edge.id)) {
        events.push({
          type: 'edge-added',
          entityId: edge.id,
          data: edge,
          timestamp: new Date(),
        });
      }
    });

    // Detect removed edges
    oldEdges.forEach(edge => {
      if (!newEdgeMap.has(edge.id)) {
        events.push({
          type: 'edge-removed',
          entityId: edge.id,
          data: edge,
          timestamp: new Date(),
        });
      }
    });

    return events;
  }

  private detectBoQChanges(oldItems: BoQItem[], newItems: BoQItem[]): SyncEvent[] {
    const events: SyncEvent[] = [];
    const oldItemMap = new Map(oldItems.map(i => [i.id, i]));
    const newItemMap = new Map(newItems.map(i => [i.id, i]));

    // Detect added items
    newItems.forEach(item => {
      if (!oldItemMap.has(item.id)) {
        events.push({
          type: 'boq-item-added',
          entityId: item.id,
          data: item,
          timestamp: new Date(),
        });
      }
    });

    // Detect removed items
    oldItems.forEach(item => {
      if (!newItemMap.has(item.id)) {
        events.push({
          type: 'boq-item-removed',
          entityId: item.id,
          data: item,
          timestamp: new Date(),
        });
      }
    });

    // Detect modified items
    newItems.forEach(item => {
      const oldItem = oldItemMap.get(item.id);
      if (oldItem && oldItem.updatedAt !== item.updatedAt) {
        events.push({
          type: 'boq-item-modified',
          entityId: item.id,
          data: { old: oldItem, new: item },
          timestamp: new Date(),
        });
      }
    });

    return events;
  }

  private queueSyncEvent(event: SyncEvent): void {
    this.syncQueue.push(event);
    this.syncState.pendingChanges++;

    // Notify listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync event listener:', error);
      }
    });
  }

  private debouncedSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(async () => {
      try {
        await this.performFullSync();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 1000); // 1 second debounce
  }

  private setupPeriodicSync(): void {
    // Set up periodic sync every 30 seconds
    setInterval(async () => {
      if (this.syncState.isActive && this.syncState.autoSyncEnabled && this.syncState.pendingChanges > 0) {
        try {
          await this.performFullSync();
        } catch (error) {
          console.error('Periodic sync failed:', error);
        }
      }
    }, 30000);
  }

  private clearSyncQueue(): void {
    this.syncQueue = [];
    this.syncState.pendingChanges = 0;
  }

  // Public utility methods
  async forceDiagnosticSync(): Promise<{
    drawingNodes: number;
    drawingEdges: number;
    boqItems: number;
    syncResult: SyncResult;
  }> {
    const db = getBoQDatabase();
    await db.initialize();

    const boqItems = this.currentDrawingId
      ? await db.getBoQItemsByDrawing(this.currentDrawingId)
      : [];

    const syncResult = await this.performFullSync();

    return {
      drawingNodes: this.lastKnownNodes.length,
      drawingEdges: this.lastKnownEdges.length,
      boqItems: boqItems.length,
      syncResult,
    };
  }

  getPendingEvents(): SyncEvent[] {
    return [...this.syncQueue];
  }

  clearPendingEvents(): void {
    this.clearSyncQueue();
  }
}

// Singleton instance
let syncService: BoQSyncService | null = null;

export const getBoQSyncService = (): BoQSyncService => {
  if (!syncService) {
    syncService = new BoQSyncService();
  }
  return syncService;
};

export { BoQSyncService };
export type { SyncState, SyncEvent, SyncResult, SyncEventListener };