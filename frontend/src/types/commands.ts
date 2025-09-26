import type { Node, Edge } from "reactflow";

/**
 * Base interface for all commands in the drawing system
 */
export interface ICommand {
  /**
   * Unique identifier for this command
   */
  id: string;

  /**
   * Timestamp when the command was created
   */
  timestamp: Date;

  /**
   * Human-readable description of the command
   */
  description: string;

  /**
   * Type of operation this command performs
   */
  type: CommandType;

  /**
   * Execute the command
   */
  execute(): void;

  /**
   * Undo the command (reverse its effects)
   */
  undo(): void;

  /**
   * Check if this command can be undone
   */
  canUndo(): boolean;

  /**
   * Check if this command can be redone
   */
  canRedo(): boolean;

  /**
   * Get additional details about the command for display
   */
  getDetails(): Record<string, unknown>;
}

/**
 * Types of commands that can be performed
 */
export type CommandType =
  | "add_node"
  | "delete_node"
  | "modify_node"
  | "move_node"
  | "add_edge"
  | "delete_edge"
  | "modify_edge"
  | "batch"
  | "layer_change"
  | "property_change";

/**
 * Interface for batch commands that contain multiple sub-commands
 */
export interface IBatchCommand extends ICommand {
  /**
   * List of commands that make up this batch
   */
  commands: ICommand[];

  /**
   * Add a command to this batch
   */
  addCommand(command: ICommand): void;

  /**
   * Get the number of commands in this batch
   */
  size(): number;
}

/**
 * Command execution context interface
 */
export interface ICommandContext {
  /**
   * Get current nodes
   */
  getNodes(): Node[];

  /**
   * Set nodes
   */
  setNodes(nodes: Node[]): void;

  /**
   * Get current edges
   */
  getEdges(): Edge[];

  /**
   * Set edges
   */
  setEdges(edges: Edge[]): void;

  /**
   * Mark the drawing as dirty
   */
  markDirty(): void;

  /**
   * Get current active layer ID
   */
  getActiveLayerId(): string;

  /**
   * Set active layer ID
   */
  setActiveLayerId(layerId: string): void;

  /**
   * Get selected node ID
   */
  getSelectedNodeId(): string | null;

  /**
   * Set selected node ID
   */
  setSelectedNodeId(nodeId: string | null): void;

  /**
   * Get selected edge ID
   */
  getSelectedEdgeId(): string | null;

  /**
   * Set selected edge ID
   */
  setSelectedEdgeId(edgeId: string | null): void;
}

/**
 * History item for display in the UI
 */
export interface HistoryItem {
  id: string;
  type: CommandType;
  action: string;
  timestamp: Date;
  user?: string;
  details: Record<string, unknown>;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Command manager configuration
 */
export interface CommandManagerConfig {
  /**
   * Maximum number of commands to keep in history
   */
  maxHistorySize?: number;

  /**
   * Whether to automatically group rapid commands into batches
   */
  enableAutoBatching?: boolean;

  /**
   * Time window (ms) for auto-batching related commands
   */
  batchTimeWindow?: number;

  /**
   * User identifier for command attribution
   */
  userId?: string;
}
