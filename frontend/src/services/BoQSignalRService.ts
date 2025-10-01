// BoQ SignalR Service
// Prepares real-time communication infrastructure for future server integration

import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { BoQItem, BoQProject, BoQSyncQueueItem } from '../types/boq';
import { getBoQDatabase } from '../lib/boq-database';
import { getBoQSyncService } from './BoQSyncService';

interface SignalRConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionId: string | null;
  lastReconnectAttempt: Date | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

interface SignalRMessage {
  type: 'boq-item-updated' | 'boq-item-deleted' | 'boq-project-updated' | 'cost-calculation-updated' | 'sync-request' | 'sync-response';
  payload: any;
  timestamp: Date;
  userId?: string;
  projectId?: string;
  drawingId?: string;
}

interface ServerSyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
  conflictCount: number;
}

type SignalREventListener = (message: SignalRMessage) => void;

class BoQSignalRService {
  private connection: HubConnection | null = null;
  private connectionState: SignalRConnectionState = {
    isConnected: false,
    isConnecting: false,
    connectionId: null,
    lastReconnectAttempt: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
  };

  private eventListeners: Map<string, SignalREventListener[]> = new Map();
  private serverSyncStatus: ServerSyncStatus = {
    isOnline: false,
    lastSync: null,
    pendingUploads: 0,
    pendingDownloads: 0,
    conflictCount: 0,
  };

  private currentUserId: string | null = null;
  private currentProjectId: string | null = null;
  private offlineQueue: SignalRMessage[] = [];
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupOfflineDetection();
  }

  // Initialize SignalR connection
  async initialize(hubUrl: string, userId: string, accessToken?: string): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    this.currentUserId = userId;

    // Build SignalR connection
    const connectionBuilder = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken || '',
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then 30s
          if (retryContext.previousRetryCount < 5) {
            return Math.pow(2, retryContext.previousRetryCount) * 1000;
          }
          return 30000; // 30 seconds for subsequent attempts
        },
      })
      .configureLogging(LogLevel.Information);

    this.connection = connectionBuilder.build();
    this.setupConnectionHandlers();

    try {
      this.connectionState.isConnecting = true;
      await this.connection.start();
      this.connectionState.isConnected = true;
      this.connectionState.isConnecting = false;
      this.connectionState.connectionId = this.connection.connectionId || null;
      this.serverSyncStatus.isOnline = true;

      console.log('BoQ SignalR connection established');

      // Process any queued offline messages
      await this.processOfflineQueue();

      // Start ping to maintain connection
      this.startPing();

    } catch (error) {
      this.connectionState.isConnecting = false;
      console.error('Failed to start SignalR connection:', error);
      throw error;
    }
  }

  // Disconnect from SignalR hub
  async disconnect(): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }

      this.connection = null;
      this.connectionState.isConnected = false;
      this.connectionState.connectionId = null;
      this.serverSyncStatus.isOnline = false;
    }
  }

  // Join a project room for real-time updates
  async joinProject(projectId: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('SignalR connection not established');
    }

    this.currentProjectId = projectId;

    try {
      await this.connection!.invoke('JoinProject', projectId);
      console.log(`Joined project room: ${projectId}`);
    } catch (error) {
      console.error('Failed to join project room:', error);
      throw error;
    }
  }

  // Leave the current project room
  async leaveProject(): Promise<void> {
    if (!this.isConnected() || !this.currentProjectId) {
      return;
    }

    try {
      await this.connection!.invoke('LeaveProject', this.currentProjectId);
      console.log(`Left project room: ${this.currentProjectId}`);
      this.currentProjectId = null;
    } catch (error) {
      console.error('Failed to leave project room:', error);
    }
  }

  // Send BoQ item update to server
  async sendBoQItemUpdate(item: BoQItem): Promise<void> {
    const message: SignalRMessage = {
      type: 'boq-item-updated',
      payload: item,
      timestamp: new Date(),
      userId: this.currentUserId,
      projectId: this.currentProjectId,
      drawingId: item.drawingId,
    };

    await this.sendMessage(message);
  }

  // Send BoQ item deletion to server
  async sendBoQItemDeleted(itemId: string, projectId: string, drawingId?: string): Promise<void> {
    const message: SignalRMessage = {
      type: 'boq-item-deleted',
      payload: { itemId },
      timestamp: new Date(),
      userId: this.currentUserId,
      projectId,
      drawingId,
    };

    await this.sendMessage(message);
  }

  // Send project update to server
  async sendProjectUpdate(project: BoQProject): Promise<void> {
    const message: SignalRMessage = {
      type: 'boq-project-updated',
      payload: project,
      timestamp: new Date(),
      userId: this.currentUserId,
      projectId: project.id,
    };

    await this.sendMessage(message);
  }

  // Request sync with server
  async requestSync(projectId: string): Promise<void> {
    const db = getBoQDatabase();
    await db.initialize();

    const syncQueue = await db.getSyncQueue();
    const pendingChanges = syncQueue.filter(item =>
      !projectId || item.entityType === 'project' ||
      (item.data && item.data.projectId === projectId)
    );

    const message: SignalRMessage = {
      type: 'sync-request',
      payload: {
        projectId,
        pendingChanges: pendingChanges.length,
        lastSync: this.serverSyncStatus.lastSync,
        changes: pendingChanges,
      },
      timestamp: new Date(),
      userId: this.currentUserId,
      projectId,
    };

    await this.sendMessage(message);
  }

  // Upload pending changes to server
  async uploadPendingChanges(): Promise<void> {
    if (!this.isConnected()) {
      console.log('Cannot upload changes: not connected to server');
      return;
    }

    const db = getBoQDatabase();
    await db.initialize();

    const syncQueue = await db.getSyncQueue();

    if (syncQueue.length === 0) {
      console.log('No pending changes to upload');
      return;
    }

    this.serverSyncStatus.pendingUploads = syncQueue.length;

    // Upload in batches
    const batchSize = 10;
    for (let i = 0; i < syncQueue.length; i += batchSize) {
      const batch = syncQueue.slice(i, i + batchSize);

      try {
        await this.connection!.invoke('UploadChanges', {
          changes: batch,
          userId: this.currentUserId,
          timestamp: new Date(),
        });

        // Remove uploaded items from sync queue
        await Promise.all(batch.map(item =>
          db.delete('boq_sync_queue', item.id)
        ));

        this.serverSyncStatus.pendingUploads = Math.max(0, this.serverSyncStatus.pendingUploads - batch.length);

      } catch (error) {
        console.error('Failed to upload batch:', error);
        // Mark items as failed and increment retry count
        await Promise.all(batch.map(item =>
          db.update('boq_sync_queue', {
            ...item,
            retryCount: item.retryCount + 1,
            lastError: error instanceof Error ? error.message : 'Upload failed',
          })
        ));
      }
    }

    console.log('Pending changes upload completed');
    this.serverSyncStatus.lastSync = new Date();
  }

  // Event subscription methods
  addEventListener(eventType: string, listener: SignalREventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  removeEventListener(eventType: string, listener: SignalREventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Status and utility methods
  isConnected(): boolean {
    return this.connectionState.isConnected && this.connection?.state === 'Connected';
  }

  getConnectionState(): SignalRConnectionState {
    return { ...this.connectionState };
  }

  getServerSyncStatus(): ServerSyncStatus {
    return { ...this.serverSyncStatus };
  }

  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  // Private helper methods
  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    // Connection state handlers
    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionState.isConnected = false;
      this.serverSyncStatus.isOnline = false;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected with connection ID:', connectionId);
      this.connectionState.isConnected = true;
      this.connectionState.connectionId = connectionId || null;
      this.connectionState.reconnectAttempts = 0;
      this.serverSyncStatus.isOnline = true;

      // Rejoin project if we were in one
      if (this.currentProjectId) {
        this.joinProject(this.currentProjectId).catch(console.error);
      }

      // Process any queued messages
      this.processOfflineQueue().catch(console.error);
    });

    this.connection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      this.connectionState.isConnected = false;
      this.connectionState.connectionId = null;
      this.serverSyncStatus.isOnline = false;

      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    });

    // Message handlers
    this.connection.on('BoQItemUpdated', (data: any) => {
      this.handleIncomingMessage({
        type: 'boq-item-updated',
        payload: data,
        timestamp: new Date(),
      });
    });

    this.connection.on('BoQItemDeleted', (data: any) => {
      this.handleIncomingMessage({
        type: 'boq-item-deleted',
        payload: data,
        timestamp: new Date(),
      });
    });

    this.connection.on('ProjectUpdated', (data: any) => {
      this.handleIncomingMessage({
        type: 'boq-project-updated',
        payload: data,
        timestamp: new Date(),
      });
    });

    this.connection.on('CostCalculationUpdated', (data: any) => {
      this.handleIncomingMessage({
        type: 'cost-calculation-updated',
        payload: data,
        timestamp: new Date(),
      });
    });

    this.connection.on('SyncResponse', (data: any) => {
      this.handleIncomingMessage({
        type: 'sync-response',
        payload: data,
        timestamp: new Date(),
      });
    });

    // Server initiated sync
    this.connection.on('RequestClientSync', async (data: any) => {
      console.log('Server requested client sync');
      try {
        const syncService = getBoQSyncService();
        await syncService.synchronize();
      } catch (error) {
        console.error('Failed to perform requested sync:', error);
      }
    });
  }

  private handleIncomingMessage(message: SignalRMessage): void {
    // Ignore messages from self
    if (message.userId === this.currentUserId) {
      return;
    }

    console.log('Received SignalR message:', message.type);

    // Notify event listeners
    const listeners = this.eventListeners.get(message.type) || [];
    listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in SignalR event listener:', error);
      }
    });

    // Handle message based on type
    this.processIncomingMessage(message).catch(console.error);
  }

  private async processIncomingMessage(message: SignalRMessage): Promise<void> {
    const db = getBoQDatabase();
    await db.initialize();

    try {
      switch (message.type) {
        case 'boq-item-updated':
          await this.handleBoQItemUpdate(message.payload, db);
          break;

        case 'boq-item-deleted':
          await this.handleBoQItemDeletion(message.payload, db);
          break;

        case 'boq-project-updated':
          await this.handleProjectUpdate(message.payload, db);
          break;

        case 'sync-response':
          await this.handleSyncResponse(message.payload, db);
          break;

        case 'cost-calculation-updated':
          await this.handleCostCalculationUpdate(message.payload, db);
          break;
      }
    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  private async handleBoQItemUpdate(itemData: any, db: any): Promise<void> {
    // Check if we have this item locally
    const existingItem = await db.getBoQItem(itemData.id);

    if (existingItem) {
      // Check for conflicts (both local and server versions modified)
      if (existingItem.localChanges && existingItem.serverVersion !== itemData.version) {
        // Mark as conflict for user resolution
        await db.updateBoQItem(itemData.id, {
          syncStatus: 'conflict',
          serverVersion: itemData.version,
        });
        this.serverSyncStatus.conflictCount++;
      } else {
        // Apply server changes
        await db.updateBoQItem(itemData.id, {
          ...itemData,
          syncStatus: 'synced',
          localChanges: false,
          serverVersion: itemData.version,
        });
      }
    } else {
      // New item from server
      await db.createBoQItem({
        ...itemData,
        syncStatus: 'synced',
        serverVersion: itemData.version,
      });
    }
  }

  private async handleBoQItemDeletion(data: any, db: any): Promise<void> {
    const { itemId } = data;
    const existingItem = await db.getBoQItem(itemId);

    if (existingItem) {
      if (existingItem.localChanges) {
        // Mark as conflict - item was modified locally but deleted on server
        await db.updateBoQItem(itemId, {
          syncStatus: 'conflict',
        });
        this.serverSyncStatus.conflictCount++;
      } else {
        // Apply deletion
        await db.deleteBoQItem(itemId);
      }
    }
  }

  private async handleProjectUpdate(projectData: any, db: any): Promise<void> {
    const existingProject = await db.getProject(projectData.id);

    if (existingProject) {
      await db.updateProject(projectData.id, {
        ...projectData,
        syncStatus: 'synced',
        serverVersion: projectData.version,
      });
    } else {
      await db.createProject({
        ...projectData,
        syncStatus: 'synced',
        serverVersion: projectData.version,
      });
    }
  }

  private async handleSyncResponse(data: any, db: any): Promise<void> {
    const { success, errors, updatedItems, deletedItems } = data;

    if (success) {
      console.log('Server sync completed successfully');
      this.serverSyncStatus.lastSync = new Date();
      this.serverSyncStatus.pendingUploads = 0;

      // Clear successfully synced items from queue
      await db.clearSyncQueue();
    } else {
      console.error('Server sync failed:', errors);
      // Handle sync errors
    }
  }

  private async handleCostCalculationUpdate(calculationData: any, db: any): Promise<void> {
    // Store updated cost calculation
    await db.add('boq_calculations', {
      ...calculationData,
      syncStatus: 'synced',
    });
  }

  private async sendMessage(message: SignalRMessage): Promise<void> {
    if (!this.isConnected()) {
      // Queue message for later delivery
      this.offlineQueue.push(message);
      console.log('Message queued for offline delivery:', message.type);
      return;
    }

    try {
      switch (message.type) {
        case 'boq-item-updated':
          await this.connection!.invoke('UpdateBoQItem', message.payload);
          break;

        case 'boq-item-deleted':
          await this.connection!.invoke('DeleteBoQItem', message.payload);
          break;

        case 'boq-project-updated':
          await this.connection!.invoke('UpdateProject', message.payload);
          break;

        case 'sync-request':
          await this.connection!.invoke('RequestSync', message.payload);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to send SignalR message:', error);
      // Re-queue message for retry
      this.offlineQueue.push(message);
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0 || !this.isConnected()) {
      return;
    }

    console.log(`Processing ${this.offlineQueue.length} queued messages`);

    const messages = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const message of messages) {
      try {
        await this.sendMessage(message);
      } catch (error) {
        console.error('Failed to send queued message:', error);
        // Re-queue failed message
        this.offlineQueue.push(message);
      }
    }
  }

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      if (!this.isConnected() && this.connection) {
        // Attempt to reconnect
        this.connection.start().catch(console.error);
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.serverSyncStatus.isOnline = false;
    });
  }

  private startPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(async () => {
      if (this.isConnected()) {
        try {
          await this.connection!.invoke('Ping');
        } catch (error) {
          console.error('Ping failed:', error);
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  // Auto-sync with server when enabled
  async enableAutoSync(projectId: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Cannot enable auto-sync: not connected to server');
    }

    try {
      await this.connection!.invoke('EnableAutoSync', projectId);
      console.log(`Auto-sync enabled for project: ${projectId}`);
    } catch (error) {
      console.error('Failed to enable auto-sync:', error);
      throw error;
    }
  }

  async disableAutoSync(projectId: string): Promise<void> {
    if (!this.isConnected()) {
      return; // Already disconnected
    }

    try {
      await this.connection!.invoke('DisableAutoSync', projectId);
      console.log(`Auto-sync disabled for project: ${projectId}`);
    } catch (error) {
      console.error('Failed to disable auto-sync:', error);
    }
  }

  // Conflict resolution
  async resolveConflict(itemId: string, resolution: 'use-local' | 'use-server' | 'merge'): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Cannot resolve conflict: not connected to server');
    }

    const db = getBoQDatabase();
    await db.initialize();

    const item = await db.getBoQItem(itemId);
    if (!item || item.syncStatus !== 'conflict') {
      throw new Error('Item not found or not in conflict state');
    }

    try {
      await this.connection!.invoke('ResolveConflict', {
        itemId,
        resolution,
        localVersion: item,
        userId: this.currentUserId,
      });

      // Update local item based on resolution
      await db.updateBoQItem(itemId, {
        syncStatus: 'synced',
        localChanges: false,
      });

      this.serverSyncStatus.conflictCount = Math.max(0, this.serverSyncStatus.conflictCount - 1);

    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }
}

// Singleton instance
let signalRService: BoQSignalRService | null = null;

export const getBoQSignalRService = (): BoQSignalRService => {
  if (!signalRService) {
    signalRService = new BoQSignalRService();
  }
  return signalRService;
};

export { BoQSignalRService };
export type {
  SignalRConnectionState,
  SignalRMessage,
  ServerSyncStatus,
  SignalREventListener,
};