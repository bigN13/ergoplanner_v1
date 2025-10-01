import React from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { Node, Edge, XYPosition } from 'reactflow';
import type { ConnectionPoint } from '@/types/connectionPoint';

export interface CollaborativeUser {
  userId: string;
  userName: string;
  joinedAt: Date;
  currentCursor?: { x: number; y: number };
  isEditing: boolean;
  editingTarget?: string;
}

export interface CollaborativeConnection {
  connectionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePointId: string;
  targetPointId: string;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  path?: { x: number; y: number }[];
  metadata?: Record<string, any>;
  validationResult?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    feedbackClass?: string;
  };
}

export interface ConnectionValidationBroadcast {
  sourceNodeId: string;
  targetNodeId: string;
  sourcePointId: string;
  targetPointId: string;
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    feedbackClass?: string;
  };
  mouseX: number;
  mouseY: number;
}

export interface DrawingCollaborationCallbacks {
  onUserJoined?: (user: { userId: string; userName: string; joinedAt: Date }) => void;
  onUserLeft?: (user: { userId: string; userName?: string }) => void;
  onUserDisconnected?: (user: { userId: string; userName: string; timestamp: Date }) => void;
  onCursorMoved?: (cursor: { userId: string; x: number; y: number; timestamp: Date }) => void;
  onConnectionCreated?: (data: { connectionId: string; connection: CollaborativeConnection; createdBy: string; timestamp: Date }) => void;
  onConnectionUpdated?: (data: { connectionId: string; connection: CollaborativeConnection; updatedBy: string; changes: any; timestamp: Date }) => void;
  onConnectionDeleted?: (data: { connectionId: string; deletedBy: string; timestamp: Date }) => void;
  onConnectionEditStarted?: (data: { connectionId: string; editedBy: string; timestamp: Date }) => void;
  onConnectionEditStopped?: (data: { connectionId: string; editedBy: string; timestamp: Date }) => void;
  onValidationResult?: (data: { userId: string; validationData: ConnectionValidationBroadcast; timestamp: Date }) => void;
  onSessionState?: (data: { drawingId: string; users: CollaborativeUser[]; activeConnections: CollaborativeConnection[] }) => void;
}

export class DrawingCollaborationService {
  private connection: HubConnection | null = null;
  private currentDrawingId: string | null = null;
  private isConnected = false;
  private callbacks: DrawingCollaborationCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    private getAccessToken?: () => string | null
  ) {}

  /**
   * Initialize connection to SignalR hub
   */
  public async initialize(): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/drawing-collaboration`, {
        accessTokenFactory: () => this.getAccessToken?.() || '',
        skipNegotiation: true,
        transport: 1 // WebSockets
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 3) {
            return 1000; // 1 second
          } else if (retryContext.previousRetryCount < 6) {
            return 5000; // 5 seconds
          }
          return 10000; // 10 seconds
        }
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();

    try {
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Connected to DrawingCollaborationHub');
    } catch (error) {
      console.error('❌ Failed to connect to DrawingCollaborationHub:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Set up event handlers for SignalR messages
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // User management events
    this.connection.on('UserJoined', (data) => {
      console.log('👤 User joined:', data);
      this.callbacks.onUserJoined?.(data);
    });

    this.connection.on('UserLeft', (data) => {
      console.log('👋 User left:', data);
      this.callbacks.onUserLeft?.(data);
    });

    this.connection.on('UserDisconnected', (data) => {
      console.log('🔌 User disconnected:', data);
      this.callbacks.onUserDisconnected?.(data);
    });

    // Cursor tracking
    this.connection.on('CursorMoved', (data) => {
      this.callbacks.onCursorMoved?.(data);
    });

    // Connection events
    this.connection.on('ConnectionCreated', (data) => {
      console.log('🔗 Connection created:', data);
      this.callbacks.onConnectionCreated?.(data);
    });

    this.connection.on('ConnectionUpdated', (data) => {
      console.log('📝 Connection updated:', data);
      this.callbacks.onConnectionUpdated?.(data);
    });

    this.connection.on('ConnectionDeleted', (data) => {
      console.log('🗑️ Connection deleted:', data);
      this.callbacks.onConnectionDeleted?.(data);
    });

    // Editing events
    this.connection.on('ConnectionEditStarted', (data) => {
      console.log('✏️ Connection edit started:', data);
      this.callbacks.onConnectionEditStarted?.(data);
    });

    this.connection.on('ConnectionEditStopped', (data) => {
      console.log('✅ Connection edit stopped:', data);
      this.callbacks.onConnectionEditStopped?.(data);
    });

    // Validation events
    this.connection.on('ValidationResult', (data) => {
      this.callbacks.onValidationResult?.(data);
    });

    // Session state
    this.connection.on('SessionState', (data) => {
      console.log('📊 Session state received:', data);
      this.callbacks.onSessionState?.(data);
    });

    // Connection management
    this.connection.onreconnecting((error) => {
      console.log('🔄 Reconnecting to DrawingCollaborationHub...', error);
      this.isConnected = false;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ Reconnected to DrawingCollaborationHub:', connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Rejoin current drawing session if any
      if (this.currentDrawingId) {
        this.joinDrawingSession(this.currentDrawingId, 'User'); // You'd get actual username
      }
    });

    this.connection.onclose((error) => {
      console.log('❌ Connection to DrawingCollaborationHub closed:', error);
      this.isConnected = false;

      // Attempt manual reconnection if not already handled
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.initialize().catch(console.error);
        }, 5000);
      }
    });
  }

  /**
   * Set callbacks for collaboration events
   */
  public setCallbacks(callbacks: DrawingCollaborationCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Join a drawing session for collaboration
   */
  public async joinDrawingSession(drawingId: string, userName: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('JoinDrawingSession', drawingId, userName);
      this.currentDrawingId = drawingId;
      console.log(`✅ Joined drawing session: ${drawingId}`);
    } catch (error) {
      console.error('❌ Failed to join drawing session:', error);
      throw error;
    }
  }

  /**
   * Leave the current drawing session
   */
  public async leaveDrawingSession(): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      return;
    }

    try {
      await this.connection.invoke('LeaveDrawingSession', this.currentDrawingId);
      console.log(`👋 Left drawing session: ${this.currentDrawingId}`);
      this.currentDrawingId = null;
    } catch (error) {
      console.error('❌ Failed to leave drawing session:', error);
    }
  }

  /**
   * Update cursor position for real-time tracking
   */
  public async updateCursor(x: number, y: number): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      return;
    }

    try {
      await this.connection.invoke('UpdateCursor', this.currentDrawingId, x, y);
    } catch (error) {
      console.error('❌ Failed to update cursor:', error);
    }
  }

  /**
   * Create a new connection
   */
  public async createConnection(
    sourceNodeId: string,
    targetNodeId: string,
    sourcePointId: string,
    targetPointId: string,
    path?: XYPosition[],
    metadata?: Record<string, any>,
    validationResult?: any
  ): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      throw new Error('SignalR connection not established');
    }

    const connectionData = {
      sourceNodeId,
      targetNodeId,
      sourcePointId,
      targetPointId,
      path: path?.map(p => ({ x: p.x, y: p.y })),
      metadata,
      validationResult
    };

    try {
      await this.connection.invoke('CreateConnection', this.currentDrawingId, connectionData);
      console.log('✅ Connection created via SignalR');
    } catch (error) {
      console.error('❌ Failed to create connection:', error);
      throw error;
    }
  }

  /**
   * Update an existing connection
   */
  public async updateConnection(
    connectionId: string,
    updateData: {
      path?: XYPosition[];
      metadata?: Record<string, any>;
      validationResult?: any;
    }
  ): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      throw new Error('SignalR connection not established');
    }

    const formattedData = {
      path: updateData.path?.map(p => ({ x: p.x, y: p.y })),
      metadata: updateData.metadata,
      validationResult: updateData.validationResult
    };

    try {
      await this.connection.invoke('UpdateConnection', this.currentDrawingId, connectionId, formattedData);
      console.log('✅ Connection updated via SignalR');
    } catch (error) {
      console.error('❌ Failed to update connection:', error);
      throw error;
    }
  }

  /**
   * Delete a connection
   */
  public async deleteConnection(connectionId: string): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('DeleteConnection', this.currentDrawingId, connectionId);
      console.log('✅ Connection deleted via SignalR');
    } catch (error) {
      console.error('❌ Failed to delete connection:', error);
      throw error;
    }
  }

  /**
   * Start editing a connection
   */
  public async startEditingConnection(connectionId: string): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      return;
    }

    try {
      await this.connection.invoke('StartEditingConnection', this.currentDrawingId, connectionId);
    } catch (error) {
      console.error('❌ Failed to start editing connection:', error);
    }
  }

  /**
   * Stop editing a connection
   */
  public async stopEditingConnection(connectionId: string): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      return;
    }

    try {
      await this.connection.invoke('StopEditingConnection', this.currentDrawingId, connectionId);
    } catch (error) {
      console.error('❌ Failed to stop editing connection:', error);
    }
  }

  /**
   * Broadcast validation result to other users
   */
  public async broadcastValidation(validationData: ConnectionValidationBroadcast): Promise<void> {
    if (!this.connection || !this.isConnected || !this.currentDrawingId) {
      return;
    }

    try {
      await this.connection.invoke('BroadcastValidation', this.currentDrawingId, validationData);
    } catch (error) {
      console.error('❌ Failed to broadcast validation:', error);
    }
  }

  /**
   * Check if currently connected
   */
  public isSignalRConnected(): boolean {
    return this.isConnected && this.connection?.state === 'Connected';
  }

  /**
   * Get current drawing ID
   */
  public getCurrentDrawingId(): string | null {
    return this.currentDrawingId;
  }

  /**
   * Disconnect from SignalR hub
   */
  public async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        if (this.currentDrawingId) {
          await this.leaveDrawingSession();
        }
        await this.connection.stop();
        console.log('👋 Disconnected from DrawingCollaborationHub');
      } catch (error) {
        console.error('❌ Error during disconnect:', error);
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.currentDrawingId = null;
      }
    }
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.disconnect().catch(console.error);
    this.callbacks = {};
  }
}

// Singleton instance for global usage
export const drawingCollaborationService = new DrawingCollaborationService();

// React hook for using the collaboration service
export function useDrawingCollaboration(
  drawingId?: string,
  userName?: string,
  callbacks?: DrawingCollaborationCallbacks
) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [users, setUsers] = React.useState<CollaborativeUser[]>([]);
  const [activeConnections, setActiveConnections] = React.useState<CollaborativeConnection[]>([]);

  React.useEffect(() => {
    const service = drawingCollaborationService;

    // Set up callbacks
    if (callbacks) {
      service.setCallbacks({
        ...callbacks,
        onSessionState: (data) => {
          setUsers(data.users);
          setActiveConnections(data.activeConnections);
          callbacks.onSessionState?.(data);
        }
      });
    }

    // Initialize connection
    const initializeConnection = async () => {
      try {
        if (!service.isSignalRConnected()) {
          await service.initialize();
        }
        setIsConnected(true);

        if (drawingId && userName) {
          await service.joinDrawingSession(drawingId, userName);
        }
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    return () => {
      if (drawingId) {
        service.leaveDrawingSession().catch(console.error);
      }
    };
  }, [drawingId, userName]);

  return {
    isConnected,
    users,
    activeConnections,
    service: drawingCollaborationService,
    updateCursor: drawingCollaborationService.updateCursor.bind(drawingCollaborationService),
    createConnection: drawingCollaborationService.createConnection.bind(drawingCollaborationService),
    updateConnection: drawingCollaborationService.updateConnection.bind(drawingCollaborationService),
    deleteConnection: drawingCollaborationService.deleteConnection.bind(drawingCollaborationService),
    startEditingConnection: drawingCollaborationService.startEditingConnection.bind(drawingCollaborationService),
    stopEditingConnection: drawingCollaborationService.stopEditingConnection.bind(drawingCollaborationService),
    broadcastValidation: drawingCollaborationService.broadcastValidation.bind(drawingCollaborationService)
  };
}