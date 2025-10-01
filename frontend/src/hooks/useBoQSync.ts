/**
 * React Hook for Real-time BoQ Synchronization
 *
 * Provides bidirectional synchronization between P&ID drawings and Bill of Quantities
 * with optimistic updates, conflict resolution, and real-time SignalR integration.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Node, Edge } from 'reactflow';
import { getBoQSyncService } from '../services/BoQSyncService';
import { getBoQSignalRService } from '../services/BoQSignalRService';
import type { BoQItem, BoQProject } from '../types/boq';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  errors: string[];
  warnings: string[];
}

export interface SyncConflict {
  itemId: string;
  localVersion: BoQItem;
  serverVersion: BoQItem;
  conflictType: 'update-update' | 'update-delete' | 'delete-update';
  timestamp: Date;
}

export interface SyncResult {
  success: boolean;
  itemsAdded: number;
  itemsUpdated: number;
  itemsRemoved: number;
  conflicts: SyncConflict[];
  warnings: string[];
  errors: string[];
}

export interface OptimisticUpdate<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: T;
  timestamp: Date;
  applied: boolean;
  rollback?: () => void;
}

// ============================================================================
// Hook Options
// ============================================================================

export interface UseBoQSyncOptions {
  projectId: string;
  drawingId: string;
  nodes: Node[];
  edges: Edge[];
  enableAutoSync?: boolean;
  enableSignalR?: boolean;
  syncInterval?: number; // milliseconds
  enableOptimisticUpdates?: boolean;
  onSyncComplete?: (result: SyncResult) => void;
  onConflict?: (conflict: SyncConflict) => 'keep-local' | 'keep-server' | 'manual';
  onError?: (error: Error) => void;
}

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseBoQSyncReturn {
  // Status
  status: SyncStatus;
  conflicts: SyncConflict[];

  // BoQ Items
  boqItems: BoQItem[];

  // Manual sync operations
  sync: () => Promise<SyncResult>;
  syncFromDrawing: () => Promise<SyncResult>;
  syncToDrawing: () => Promise<void>;

  // Item operations with optimistic updates
  addBoQItem: (item: Omit<BoQItem, 'id'>) => Promise<BoQItem>;
  updateBoQItem: (id: string, updates: Partial<BoQItem>) => Promise<BoQItem>;
  deleteBoQItem: (id: string) => Promise<void>;

  // Conflict resolution
  resolveConflict: (conflictId: string, resolution: 'keep-local' | 'keep-server') => Promise<void>;
  resolveAllConflicts: (resolution: 'keep-local' | 'keep-server') => Promise<void>;

  // Rollback
  rollbackOptimisticUpdates: () => void;

  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBoQSync(options: UseBoQSyncOptions): UseBoQSyncReturn {
  const {
    projectId,
    drawingId,
    nodes,
    edges,
    enableAutoSync = true,
    enableSignalR = true,
    syncInterval = 5000,
    enableOptimisticUpdates = true,
    onSyncComplete,
    onConflict,
    onError,
  } = options;

  // Services
  const syncService = useMemo(() => getBoQSyncService(), []);
  const signalRService = useMemo(() => getBoQSignalRService(), []);

  // State
  const [boqItems, setBoqItems] = useState<BoQItem[]>([]);
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    errors: [],
    warnings: [],
  });
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  // Refs
  const optimisticUpdates = useRef<Map<string, OptimisticUpdate<BoQItem>>>(new Map());
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // ============================================================================
  // Optimistic Updates
  // ============================================================================

  const applyOptimisticUpdate = useCallback(
    <T>(update: OptimisticUpdate<T>) => {
      if (!enableOptimisticUpdates) return;

      optimisticUpdates.current.set(update.id, update as OptimisticUpdate<BoQItem>);
      setStatus((prev) => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1,
      }));
    },
    [enableOptimisticUpdates]
  );

  const rollbackOptimisticUpdate = useCallback((id: string) => {
    const update = optimisticUpdates.current.get(id);
    if (update?.rollback) {
      update.rollback();
    }
    optimisticUpdates.current.delete(id);
    setStatus((prev) => ({
      ...prev,
      pendingChanges: Math.max(0, prev.pendingChanges - 1),
    }));
  }, []);

  const rollbackOptimisticUpdates = useCallback(() => {
    optimisticUpdates.current.forEach((update) => {
      if (update.rollback) {
        update.rollback();
      }
    });
    optimisticUpdates.current.clear();
    setStatus((prev) => ({
      ...prev,
      pendingChanges: 0,
    }));
  }, []);

  // ============================================================================
  // Sync Operations
  // ============================================================================

  const performSync = useCallback(async (): Promise<SyncResult> => {
    setStatus((prev) => ({ ...prev, isSyncing: true, errors: [], warnings: [] }));

    try {
      const result = await syncService.synchronize();

      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingChanges: 0,
        warnings: result.warnings,
      }));

      // Clear successful optimistic updates
      optimisticUpdates.current.clear();

      onSyncComplete?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        errors: [errorMessage],
      }));

      onError?.(error as Error);
      throw error;
    }
  }, [syncService, onSyncComplete, onError]);

  const sync = useCallback(async (): Promise<SyncResult> => {
    return performSync();
  }, [performSync]);

  const syncFromDrawing = useCallback(async (): Promise<SyncResult> => {
    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      await syncService.syncDrawingToBoQ(nodes, edges);
      const result = await performSync();
      return result;
    } catch (error) {
      setStatus((prev) => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [syncService, nodes, edges, performSync]);

  const syncToDrawing = useCallback(async (): Promise<void> => {
    // This would update the drawing based on BoQ changes
    // Implementation depends on drawing update mechanism
    console.log('Sync to drawing not yet implemented');
  }, []);

  // ============================================================================
  // Item Operations
  // ============================================================================

  const addBoQItem = useCallback(
    async (item: Omit<BoQItem, 'id'>): Promise<BoQItem> => {
      const newItem: BoQItem = {
        ...item,
        id: `temp-${Date.now()}`,
      } as BoQItem;

      if (enableOptimisticUpdates) {
        // Optimistic update
        const previousItems = [...boqItems];
        setBoqItems([...boqItems, newItem]);

        applyOptimisticUpdate({
          id: newItem.id,
          type: 'add',
          data: newItem,
          timestamp: new Date(),
          applied: true,
          rollback: () => setBoqItems(previousItems),
        });
      }

      try {
        // Actual server update would go here
        // For now, just return the item
        return newItem;
      } catch (error) {
        if (enableOptimisticUpdates) {
          rollbackOptimisticUpdate(newItem.id);
        }
        throw error;
      }
    },
    [boqItems, enableOptimisticUpdates, applyOptimisticUpdate, rollbackOptimisticUpdate]
  );

  const updateBoQItem = useCallback(
    async (id: string, updates: Partial<BoQItem>): Promise<BoQItem> => {
      const itemIndex = boqItems.findIndex((item) => item.id === id);
      if (itemIndex === -1) {
        throw new Error(`BoQ item ${id} not found`);
      }

      const updatedItem = { ...boqItems[itemIndex], ...updates };

      if (enableOptimisticUpdates) {
        // Optimistic update
        const previousItems = [...boqItems];
        const newItems = [...boqItems];
        newItems[itemIndex] = updatedItem;
        setBoqItems(newItems);

        applyOptimisticUpdate({
          id,
          type: 'update',
          data: updatedItem,
          timestamp: new Date(),
          applied: true,
          rollback: () => setBoqItems(previousItems),
        });
      }

      try {
        // Actual server update would go here
        return updatedItem;
      } catch (error) {
        if (enableOptimisticUpdates) {
          rollbackOptimisticUpdate(id);
        }
        throw error;
      }
    },
    [boqItems, enableOptimisticUpdates, applyOptimisticUpdate, rollbackOptimisticUpdate]
  );

  const deleteBoQItem = useCallback(
    async (id: string): Promise<void> => {
      const itemIndex = boqItems.findIndex((item) => item.id === id);
      if (itemIndex === -1) {
        throw new Error(`BoQ item ${id} not found`);
      }

      if (enableOptimisticUpdates) {
        // Optimistic update
        const previousItems = [...boqItems];
        const newItems = boqItems.filter((item) => item.id !== id);
        setBoqItems(newItems);

        applyOptimisticUpdate({
          id,
          type: 'delete',
          data: boqItems[itemIndex],
          timestamp: new Date(),
          applied: true,
          rollback: () => setBoqItems(previousItems),
        });
      }

      try {
        // Actual server delete would go here
      } catch (error) {
        if (enableOptimisticUpdates) {
          rollbackOptimisticUpdate(id);
        }
        throw error;
      }
    },
    [boqItems, enableOptimisticUpdates, applyOptimisticUpdate, rollbackOptimisticUpdate]
  );

  // ============================================================================
  // Conflict Resolution
  // ============================================================================

  const resolveConflict = useCallback(
    async (conflictId: string, resolution: 'keep-local' | 'keep-server'): Promise<void> => {
      const conflict = conflicts.find((c) => c.itemId === conflictId);
      if (!conflict) return;

      const resolvedItem = resolution === 'keep-local' ? conflict.localVersion : conflict.serverVersion;

      await updateBoQItem(conflictId, resolvedItem);
      setConflicts((prev) => prev.filter((c) => c.itemId !== conflictId));
    },
    [conflicts, updateBoQItem]
  );

  const resolveAllConflicts = useCallback(
    async (resolution: 'keep-local' | 'keep-server'): Promise<void> => {
      for (const conflict of conflicts) {
        await resolveConflict(conflict.itemId, resolution);
      }
    },
    [conflicts, resolveConflict]
  );

  // ============================================================================
  // Connection Management
  // ============================================================================

  const connect = useCallback(async (): Promise<void> => {
    if (!enableSignalR) return;

    try {
      await signalRService.connect('/api/boq-hub');
      setStatus((prev) => ({ ...prev, isConnected: true }));

      // Subscribe to BoQ updates
      signalRService.on('boq-item-updated', (message) => {
        // Handle real-time updates
        console.log('BoQ item updated:', message);
      });

      signalRService.on('boq-item-deleted', (message) => {
        // Handle deletions
        console.log('BoQ item deleted:', message);
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        errors: ['Failed to connect to real-time server'],
      }));
      onError?.(error as Error);
    }
  }, [enableSignalR, signalRService, onError]);

  const disconnect = useCallback((): void => {
    if (enableSignalR) {
      signalRService.disconnect();
      setStatus((prev) => ({ ...prev, isConnected: false }));
    }
  }, [enableSignalR, signalRService]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Initialize sync service
  useEffect(() => {
    if (!isInitialized.current) {
      syncService
        .initializeSync(projectId, drawingId, nodes, edges)
        .then(() => {
          isInitialized.current = true;
          if (enableAutoSync) {
            performSync();
          }
        })
        .catch((error) => {
          console.error('Failed to initialize sync:', error);
          onError?.(error);
        });
    }

    return () => {
      syncService.stopSync();
      isInitialized.current = false;
    };
  }, [projectId, drawingId, nodes, edges, syncService, enableAutoSync, performSync, onError]);

  // Setup auto-sync interval
  useEffect(() => {
    if (enableAutoSync && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (!status.isSyncing) {
          performSync().catch(console.error);
        }
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [enableAutoSync, syncInterval, status.isSyncing, performSync]);

  // Connect to SignalR
  useEffect(() => {
    if (enableSignalR) {
      connect();
      return () => disconnect();
    }
  }, [enableSignalR, connect, disconnect]);

  // ============================================================================
  // Return
  // ============================================================================

  return useMemo(
    () => ({
      status,
      conflicts,
      boqItems,
      sync,
      syncFromDrawing,
      syncToDrawing,
      addBoQItem,
      updateBoQItem,
      deleteBoQItem,
      resolveConflict,
      resolveAllConflicts,
      rollbackOptimisticUpdates,
      connect,
      disconnect,
    }),
    [
      status,
      conflicts,
      boqItems,
      sync,
      syncFromDrawing,
      syncToDrawing,
      addBoQItem,
      updateBoQItem,
      deleteBoQItem,
      resolveConflict,
      resolveAllConflicts,
      rollbackOptimisticUpdates,
      connect,
      disconnect,
    ]
  );
}
