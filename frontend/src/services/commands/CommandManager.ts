import type {
  ICommand,
  ICommandContext,
  CommandManagerConfig,
  HistoryItem,
  CommandType,
} from "@/types/commands";

import { BatchCommand } from "./BatchCommand";

/**
 * Command manager that handles command execution, undo/redo operations, and history management
 */
export class CommandManager {
  private history: ICommand[] = [];
  private currentIndex: number = -1;
  private config: Required<CommandManagerConfig>;
  private context: ICommandContext;
  private batchingStartTime: number | null = null;
  private pendingBatch: BatchCommand | null = null;

  constructor(context: ICommandContext, config: CommandManagerConfig = {}) {
    this.context = context;
    this.config = {
      maxHistorySize: 50,
      enableAutoBatching: true,
      batchTimeWindow: 1000, // 1 second
      userId: 'current-user',
      ...config,
    };
  }

  /**
   * Execute a command and add it to history
   */
  public execute(command: ICommand): void {
    try {
      // Handle auto-batching
      if (this.config.enableAutoBatching && this.shouldBatch(command)) {
        this.addToBatch(command);
        return;
      }

      // Finalize any pending batch before executing new command
      this.finalizePendingBatch();

      // Execute the command
      command.execute();

      // Add to history
      this.addToHistory(command);

    } catch (error) {
      console.error('Failed to execute command:', error);
      throw error;
    }
  }

  /**
   * Execute multiple commands as a batch
   */
  public executeBatch(commands: ICommand[], description?: string): void {
    if (commands.length === 0) {
      return;
    }

    if (commands.length === 1) {
      this.execute(commands[0]);
      return;
    }

    const batchDescription = description || `Batch of ${commands.length} operations`;
    const batch = new BatchCommand(batchDescription, this.context, commands);

    this.execute(batch);
  }

  /**
   * Undo the last command
   */
  public undo(): boolean {
    this.finalizePendingBatch();

    if (!this.canUndo()) {
      return false;
    }

    try {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      return true;
    } catch (error) {
      console.error('Failed to undo command:', error);
      return false;
    }
  }

  /**
   * Redo the next command
   */
  public redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      return true;
    } catch (error) {
      console.error('Failed to redo command:', error);
      this.currentIndex--;
      return false;
    }
  }

  /**
   * Check if undo is available
   */
  public canUndo(): boolean {
    return this.currentIndex >= 0 && this.history[this.currentIndex]?.canUndo();
  }

  /**
   * Check if redo is available
   */
  public canRedo(): boolean {
    return (
      this.currentIndex < this.history.length - 1 &&
      this.history[this.currentIndex + 1]?.canRedo()
    );
  }

  /**
   * Get the current history as display items
   */
  public getHistory(): HistoryItem[] {
    return this.history.map((command, index) => ({
      id: command.id,
      type: command.type,
      action: command.description,
      timestamp: command.timestamp,
      user: this.config.userId,
      details: command.getDetails(),
      canUndo: index <= this.currentIndex && command.canUndo(),
      canRedo: index > this.currentIndex && command.canRedo(),
    }));
  }

  /**
   * Get the current history index
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    this.finalizePendingBatch();
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get specific command by index
   */
  public getCommand(index: number): ICommand | null {
    return this.history[index] || null;
  }

  /**
   * Undo to a specific point in history
   */
  public undoTo(targetIndex: number): boolean {
    if (targetIndex < -1 || targetIndex >= this.currentIndex) {
      return false;
    }

    this.finalizePendingBatch();

    const startIndex = this.currentIndex;
    let success = true;

    for (let i = startIndex; i > targetIndex; i--) {
      if (!this.undo()) {
        success = false;
        break;
      }
    }

    return success;
  }

  /**
   * Redo to a specific point in history
   */
  public redoTo(targetIndex: number): boolean {
    if (targetIndex <= this.currentIndex || targetIndex >= this.history.length) {
      return false;
    }

    const endIndex = targetIndex;
    let success = true;

    for (let i = this.currentIndex; i < endIndex; i++) {
      if (!this.redo()) {
        success = false;
        break;
      }
    }

    return success;
  }

  /**
   * Start a manual batch (disable auto-batching temporarily)
   */
  public startBatch(description: string): void {
    this.finalizePendingBatch();
    this.pendingBatch = new BatchCommand(description, this.context);
  }

  /**
   * End the manual batch and execute it
   */
  public endBatch(): void {
    if (this.pendingBatch && !this.pendingBatch.isEmpty()) {
      this.execute(this.pendingBatch);
    }
    this.pendingBatch = null;
  }

  /**
   * Cancel the current batch without executing
   */
  public cancelBatch(): void {
    this.pendingBatch = null;
  }

  /**
   * Get history statistics
   */
  public getStatistics(): {
    totalCommands: number;
    currentPosition: number;
    canUndo: boolean;
    canRedo: boolean;
    commandTypes: Record<CommandType, number>;
  } {
    const commandTypes: Record<string, number> = {};

    this.history.forEach(command => {
      commandTypes[command.type] = (commandTypes[command.type] || 0) + 1;
    });

    return {
      totalCommands: this.history.length,
      currentPosition: this.currentIndex + 1,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      commandTypes: commandTypes as Record<CommandType, number>,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<CommandManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add command to history and manage history size
   */
  private addToHistory(command: ICommand): void {
    // Remove any commands after current index (they become invalid)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new command
    this.history.push(command);
    this.currentIndex++;

    // Maintain history size limit
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Determine if a command should be batched with recent commands
   */
  private shouldBatch(command: ICommand): boolean {
    if (!this.config.enableAutoBatching) {
      return false;
    }

    const now = Date.now();

    // Check if we're within the batching time window
    if (this.batchingStartTime && (now - this.batchingStartTime) > this.config.batchTimeWindow) {
      this.finalizePendingBatch();
      return false;
    }

    // Check if this command type should be batched
    return this.isBatchableCommand(command);
  }

  /**
   * Check if a command type is suitable for batching
   */
  private isBatchableCommand(command: ICommand): boolean {
    // Commands that are typically batched together
    const batchableTypes: CommandType[] = [
      "move_node",
      "modify_node",
      "modify_edge",
      "property_change"
    ];

    return batchableTypes.includes(command.type);
  }

  /**
   * Add a command to the current batch
   */
  private addToBatch(command: ICommand): void {
    if (!this.pendingBatch) {
      this.batchingStartTime = Date.now();
      this.pendingBatch = new BatchCommand("Auto batch", this.context);
    }

    this.pendingBatch.addCommand(command);

    // Set up a timer to finalize the batch
    setTimeout(() => {
      if (this.batchingStartTime &&
          (Date.now() - this.batchingStartTime) >= this.config.batchTimeWindow) {
        this.finalizePendingBatch();
      }
    }, this.config.batchTimeWindow);
  }

  /**
   * Finalize and execute any pending batch
   */
  private finalizePendingBatch(): void {
    if (this.pendingBatch && !this.pendingBatch.isEmpty()) {
      const batch = this.pendingBatch;
      this.pendingBatch = null;
      this.batchingStartTime = null;

      // Generate a meaningful description for the auto batch
      if (batch.description === "Auto batch") {
        batch.description = this.generateBatchDescription(batch);
      }

      batch.execute();
      this.addToHistory(batch);
    } else {
      this.pendingBatch = null;
      this.batchingStartTime = null;
    }
  }

  /**
   * Generate a descriptive name for an auto batch
   */
  private generateBatchDescription(batch: BatchCommand): string {
    const summary = batch.getCommandSummary();
    const entries = Object.entries(summary);

    if (entries.length === 1) {
      const [type, count] = entries[0];
      return `${count} ${type.replace(/_/g, ' ')} operation${count > 1 ? 's' : ''}`;
    }

    return `Batch: ${batch.size()} operations`;
  }
}