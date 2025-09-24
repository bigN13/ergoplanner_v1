import type { Command, CommandHistory, HistoryEntry, CommandContext, CommandType } from "@/types/commands";
import { useDrawingStore } from "@/store/drawingStore";

export class CommandManager {
  private static instance: CommandManager | null = null;
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;
  private listeners: Set<(history: HistoryEntry[]) => void> = new Set();
  private batchMode: boolean = false;
  private batchCommands: Command[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): CommandManager {
    if (!CommandManager.instance) {
      CommandManager.instance = new CommandManager();
    }
    return CommandManager.instance;
  }

  /**
   * Execute a command and add it to history
   */
  execute(command: Command): void {
    if (this.batchMode) {
      this.batchCommands.push(command);
      return;
    }

    try {
      // Execute the command
      command.execute();

      // Remove any commands after current index (for branching history)
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Add command to history
      this.history.push(command);

      // Trim history if it exceeds max size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      } else {
        this.currentIndex++;
      }

      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to execute command:", error);
      throw error;
    }
  }

  /**
   * Start batch mode for grouping multiple commands
   */
  startBatch(): void {
    this.batchMode = true;
    this.batchCommands = [];
  }

  /**
   * End batch mode and execute all batched commands as one
   */
  endBatch(name: string, description: string): void {
    if (!this.batchMode || this.batchCommands.length === 0) {
      this.batchMode = false;
      return;
    }

    // Create a composite command from batched commands
    const compositeCommand: Command = {
      id: `batch-${Date.now()}`,
      name,
      description,
      timestamp: new Date(),
      type: "composite" as CommandType,
      execute: () => {
        this.batchCommands.forEach(cmd => cmd.execute());
      },
      undo: () => {
        // Undo in reverse order
        for (let i = this.batchCommands.length - 1; i >= 0; i--) {
          this.batchCommands[i].undo();
        }
      },
      canExecute: () => this.batchCommands.every(cmd => cmd.canExecute()),
      canUndo: () => this.batchCommands.every(cmd => cmd.canUndo()),
    };

    this.batchMode = false;
    this.execute(compositeCommand);
    this.batchCommands = [];
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    try {
      const command = this.history[this.currentIndex];
      if (command && command.canUndo()) {
        command.undo();
        this.currentIndex--;
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error("Failed to undo command:", error);
    }
    return false;
  }

  /**
   * Redo the next command
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    try {
      const command = this.history[this.currentIndex + 1];
      if (command && command.canExecute()) {
        command.execute();
        this.currentIndex++;
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error("Failed to redo command:", error);
    }
    return false;
  }

  /**
   * Jump to a specific point in history
   */
  jumpToIndex(index: number): void {
    if (index < -1 || index >= this.history.length) {
      return;
    }

    // Undo commands from current to target
    while (this.currentIndex > index) {
      this.undo();
    }

    // Redo commands from current to target
    while (this.currentIndex < index) {
      this.redo();
    }
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex >= 0 &&
           this.currentIndex < this.history.length &&
           this.history[this.currentIndex]?.canUndo();
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1 &&
           this.history[this.currentIndex + 1]?.canExecute();
  }

  /**
   * Get the history as displayable entries
   */
  getHistory(): HistoryEntry[] {
    return this.history.map((cmd, index) => ({
      command: cmd,
      id: cmd.id,
      name: cmd.name,
      description: cmd.description,
      timestamp: cmd.timestamp,
      type: cmd.type,
      icon: this.getIconForCommandType(cmd.type),
      canUndo: cmd.canUndo(),
    }));
  }

  /**
   * Get the current history index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.batchCommands = [];
    this.batchMode = false;
    this.notifyListeners();
  }

  /**
   * Subscribe to history changes
   */
  subscribe(callback: (history: HistoryEntry[]) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of history changes
   */
  private notifyListeners(): void {
    const history = this.getHistory();
    this.listeners.forEach(listener => listener(history));
  }

  /**
   * Get icon for command type
   */
  private getIconForCommandType(type: CommandType): string {
    switch (type) {
      case "node" as CommandType:
        return "Circle";
      case "edge" as CommandType:
        return "GitBranch";
      case "selection" as CommandType:
        return "MousePointer";
      case "transform" as CommandType:
        return "Move";
      case "format" as CommandType:
        return "Palette";
      case "layout" as CommandType:
        return "Layout";
      case "composite" as CommandType:
        return "Layers";
      default:
        return "Command";
    }
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    if (this.history.length > this.maxHistorySize) {
      const overflow = this.history.length - this.maxHistorySize;
      this.history = this.history.slice(overflow);
      this.currentIndex = Math.max(-1, this.currentIndex - overflow);
      this.notifyListeners();
    }
  }

  /**
   * Get command context for command execution
   */
  static getCommandContext(): CommandContext {
    const store = useDrawingStore.getState();

    return {
      getNodes: () => store.nodes,
      setNodes: (nodes) => store.setNodes(nodes),
      getEdges: () => store.edges,
      setEdges: (edges) => store.setEdges(edges),
      addNode: (node) => store.addNode(node),
      removeNode: (nodeId) => store.deleteNode(nodeId),
      updateNode: (nodeId, updates) => store.updateNode(nodeId, updates),
      addEdge: (edge) => store.addEdge(edge),
      removeEdge: (edgeId) => store.deleteEdge(edgeId),
      updateEdge: (edgeId, updates) => store.updateEdge(edgeId, updates),
      markDirty: () => store.markDirty(),
    };
  }
}

// Export singleton instance
export const commandManager = CommandManager.getInstance();