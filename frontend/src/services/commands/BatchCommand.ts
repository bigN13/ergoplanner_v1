import type { ICommand, IBatchCommand, ICommandContext, CommandType } from "@/types/commands";

import { BaseCommand } from "./BaseCommand";

/**
 * Batch command that groups multiple commands together
 * Useful for operations that should be undone/redone as a single unit
 */
export class BatchCommand extends BaseCommand implements IBatchCommand {
  public readonly commands: ICommand[] = [];

  constructor(description: string, context: ICommandContext, commands: ICommand[] = []) {
    super("batch", description, context);
    this.commands = [...commands];
  }

  /**
   * Add a command to this batch
   */
  public addCommand(command: ICommand): void {
    if (this.executed) {
      throw new Error("Cannot add commands to an already executed batch");
    }
    this.commands.push(command);
  }

  /**
   * Get the number of commands in this batch
   */
  public size(): number {
    return this.commands.length;
  }

  /**
   * Check if this batch can be undone (all commands can be undone)
   */
  public override canUndo(): boolean {
    return super.canUndo() && this.commands.every((cmd) => cmd.canUndo());
  }

  /**
   * Check if this batch can be redone (all commands can be redone)
   */
  public override canRedo(): boolean {
    return super.canRedo() && this.commands.every((cmd) => cmd.canRedo());
  }

  /**
   * Execute all commands in the batch in order
   */
  protected doExecute(): void {
    const executedCommands: ICommand[] = [];

    try {
      for (const command of this.commands) {
        command.execute();
        executedCommands.push(command);
      }
    } catch (error) {
      // If any command fails, undo the ones that succeeded
      for (let i = executedCommands.length - 1; i >= 0; i--) {
        try {
          const command = executedCommands[i];
          if (command) {
            command.undo();
          }
        } catch (undoError) {
          console.error(`Failed to undo command during batch rollback:`, undoError);
        }
      }
      throw error;
    }
  }

  /**
   * Undo all commands in the batch in reverse order
   */
  protected doUndo(): void {
    const errors: Error[] = [];

    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      try {
        const command = this.commands[i];
        if (command) {
          command.undo();
        }
      } catch (error) {
        errors.push(error as Error);
        console.error(`Failed to undo command in batch:`, error);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Failed to undo batch command: ${errors.length} command(s) failed`);
    }
  }

  /**
   * Get detailed information about this batch and its commands
   */
  public override getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      commandCount: this.commands.length,
      commands: this.commands.map((cmd) => ({
        id: cmd.id,
        type: cmd.type,
        description: cmd.description,
        canUndo: cmd.canUndo(),
        canRedo: cmd.canRedo(),
      })),
    };
  }

  /**
   * Get a summary of command types in this batch
   */
  public getCommandSummary(): Record<CommandType, number> {
    const summary: Record<string, number> = {};

    this.commands.forEach((cmd) => {
      summary[cmd.type] = (summary[cmd.type] || 0) + 1;
    });

    return summary as Record<CommandType, number>;
  }

  /**
   * Check if this batch is empty
   */
  public isEmpty(): boolean {
    return this.commands.length === 0;
  }

  /**
   * Create a new batch command from a list of commands
   */
  public static create(
    description: string,
    context: ICommandContext,
    commands: ICommand[]
  ): BatchCommand {
    if (commands.length === 0) {
      throw new Error("Cannot create empty batch command");
    }

    return new BatchCommand(description, context, commands);
  }

  /**
   * Auto-generate description based on commands in the batch
   */
  public static createWithAutoDescription(
    context: ICommandContext,
    commands: ICommand[]
  ): BatchCommand {
    if (commands.length === 0) {
      throw new Error("Cannot create empty batch command");
    }

    const batch = new BatchCommand("", context, commands);
    batch.description = batch.generateAutoDescription();
    return batch;
  }

  /**
   * Generate a human-readable description based on the commands in this batch
   */
  private generateAutoDescription(): string {
    if (this.commands.length === 0) {
      return "Empty batch";
    }

    if (this.commands.length === 1) {
      const firstCommand = this.commands[0];
      return firstCommand ? firstCommand.description : "Single command";
    }

    const summary = this.getCommandSummary();
    const summaryEntries = Object.entries(summary);

    if (summaryEntries.length === 1) {
      const entry = summaryEntries[0];
      if (entry) {
        const [type, count] = entry;
        return `${count} ${type.replace(/_/g, " ")} operations`;
      }
    }

    const parts = summaryEntries.map(([type, count]) => `${count} ${type.replace(/_/g, " ")}`);

    return `Batch: ${parts.join(", ")}`;
  }
}
