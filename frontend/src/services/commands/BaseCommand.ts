import type { ICommand, ICommandContext, CommandType } from "@/types/commands";

/**
 * Abstract base class for all commands
 * Provides common functionality and enforces the command pattern
 */
export abstract class BaseCommand implements ICommand {
  public readonly id: string;
  public readonly timestamp: Date;
  public readonly type: CommandType;
  protected context: ICommandContext;
  protected executed: boolean = false;

  constructor(
    type: CommandType,
    protected description: string,
    context: ICommandContext
  ) {
    this.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.type = type;
    this.context = context;
  }

  /**
   * Execute the command. Calls doExecute() template method.
   */
  public execute(): void {
    if (this.executed) {
      throw new Error(`Command ${this.id} has already been executed`);
    }

    try {
      this.doExecute();
      this.executed = true;
      this.context.markDirty();
    } catch (error) {
      console.error(`Failed to execute command ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Undo the command. Calls doUndo() template method.
   */
  public undo(): void {
    if (!this.executed) {
      throw new Error(`Command ${this.id} has not been executed yet`);
    }

    if (!this.canUndo()) {
      throw new Error(`Command ${this.id} cannot be undone`);
    }

    try {
      this.doUndo();
      this.executed = false;
      this.context.markDirty();
    } catch (error) {
      console.error(`Failed to undo command ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Check if this command can be undone
   */
  public canUndo(): boolean {
    return this.executed;
  }

  /**
   * Check if this command can be redone
   */
  public canRedo(): boolean {
    return !this.executed;
  }

  /**
   * Get the human-readable description
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * Get additional details about the command
   */
  public getDetails(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp.toISOString(),
      executed: this.executed,
      description: this.description,
    };
  }

  /**
   * Template method for command execution - implemented by subclasses
   */
  protected abstract doExecute(): void;

  /**
   * Template method for command undo - implemented by subclasses
   */
  protected abstract doUndo(): void;
}

/**
 * Utility function to generate unique IDs
 */
export function generateCommandId(type: CommandType): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}