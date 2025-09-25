import type { Edge } from "reactflow";

import type { ICommandContext } from "@/types/commands";

import { BaseCommand } from "./BaseCommand";

/**
 * Command to add a new edge to the drawing
 */
export class AddEdgeCommand extends BaseCommand {
  private edge: Edge;

  constructor(edge: Edge, context: ICommandContext) {
    super("add_edge", `Add edge (${edge.source} → ${edge.target})`, context);
    this.edge = { ...edge };
  }

  protected doExecute(): void {
    const currentEdges = this.context.getEdges();

    // Check if edge already exists
    if (currentEdges.find(e => e.id === this.edge.id)) {
      throw new Error(`Edge with ID ${this.edge.id} already exists`);
    }

    // Validate that source and target nodes exist
    const currentNodes = this.context.getNodes();
    const sourceExists = currentNodes.some(n => n.id === this.edge.source);
    const targetExists = currentNodes.some(n => n.id === this.edge.target);

    if (!sourceExists) {
      throw new Error(`Source node ${this.edge.source} not found`);
    }

    if (!targetExists) {
      throw new Error(`Target node ${this.edge.target} not found`);
    }

    this.context.setEdges([...currentEdges, this.edge]);
  }

  protected doUndo(): void {
    const currentEdges = this.context.getEdges();
    const filteredEdges = currentEdges.filter(e => e.id !== this.edge.id);
    this.context.setEdges(filteredEdges);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      edgeId: this.edge.id,
      edgeType: this.edge.type,
      source: this.edge.source,
      target: this.edge.target,
      sourceHandle: this.edge.sourceHandle,
      targetHandle: this.edge.targetHandle,
      data: this.edge.data,
    };
  }
}

/**
 * Command to delete an existing edge from the drawing
 */
export class DeleteEdgeCommand extends BaseCommand {
  private edge: Edge | null = null;
  private edgeId: string;

  constructor(edgeId: string, context: ICommandContext) {
    super("delete_edge", `Delete edge (${edgeId})`, context);
    this.edgeId = edgeId;
  }

  protected doExecute(): void {
    const currentEdges = this.context.getEdges();

    // Find the edge to delete
    this.edge = currentEdges.find(e => e.id === this.edgeId) || null;
    if (!this.edge) {
      throw new Error(`Edge with ID ${this.edgeId} not found`);
    }

    // Remove edge
    const filteredEdges = currentEdges.filter(e => e.id !== this.edgeId);
    this.context.setEdges(filteredEdges);

    // Clear selection if this edge was selected
    if (this.context.getSelectedEdgeId() === this.edgeId) {
      this.context.setSelectedEdgeId(null);
    }
  }

  protected doUndo(): void {
    if (!this.edge) {
      throw new Error("Cannot undo: original edge data not available");
    }

    const currentEdges = this.context.getEdges();

    // Verify that source and target nodes still exist
    const currentNodes = this.context.getNodes();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sourceExists = currentNodes.some(n => n.id === this.edge!.source);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const targetExists = currentNodes.some(n => n.id === this.edge!.target);

    if (!sourceExists || !targetExists) {
      throw new Error("Cannot restore edge: source or target node no longer exists");
    }

    // Restore the edge
    this.context.setEdges([...currentEdges, this.edge]);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      edgeId: this.edgeId,
      source: this.edge?.source || 'unknown',
      target: this.edge?.target || 'unknown',
      edgeType: this.edge?.type || 'unknown',
    };
  }
}

/**
 * Command to modify an existing edge's properties
 */
export class ModifyEdgeCommand extends BaseCommand {
  private edgeId: string;
  private originalEdge: Edge | null = null;
  private updates: Partial<Edge>;

  constructor(edgeId: string, updates: Partial<Edge>, context: ICommandContext) {
    super("modify_edge", `Modify edge (${edgeId})`, context);
    this.edgeId = edgeId;
    this.updates = { ...updates };
  }

  protected doExecute(): void {
    const currentEdges = this.context.getEdges();
    const edgeIndex = currentEdges.findIndex(e => e.id === this.edgeId);

    if (edgeIndex === -1) {
      throw new Error(`Edge with ID ${this.edgeId} not found`);
    }

    // Store original edge for undo
    this.originalEdge = { ...currentEdges[edgeIndex] };

    // Apply updates
    const updatedEdges = [...currentEdges];
    updatedEdges[edgeIndex] = { ...currentEdges[edgeIndex], ...this.updates };

    this.context.setEdges(updatedEdges);
  }

  protected doUndo(): void {
    if (!this.originalEdge) {
      throw new Error("Cannot undo: original edge data not available");
    }

    const currentEdges = this.context.getEdges();
    const edgeIndex = currentEdges.findIndex(e => e.id === this.edgeId);

    if (edgeIndex === -1) {
      throw new Error(`Edge with ID ${this.edgeId} not found for undo`);
    }

    const restoredEdges = [...currentEdges];
    restoredEdges[edgeIndex] = this.originalEdge;

    this.context.setEdges(restoredEdges);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      edgeId: this.edgeId,
      updates: this.updates,
      originalData: this.originalEdge ? {
        type: this.originalEdge.type,
        source: this.originalEdge.source,
        target: this.originalEdge.target,
        data: this.originalEdge.data,
      } : null,
    };
  }
}

/**
 * Command to reconnect an edge (change source or target)
 */
export class ReconnectEdgeCommand extends BaseCommand {
  private edgeId: string;
  private originalConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null };
  private newConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null };

  constructor(
    edgeId: string,
    originalConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null },
    newConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null },
    context: ICommandContext
  ) {
    super("modify_edge", `Reconnect edge (${edgeId})`, context);
    this.edgeId = edgeId;
    this.originalConnection = { ...originalConnection };
    this.newConnection = { ...newConnection };
  }

  protected doExecute(): void {
    this.reconnectEdge(this.newConnection);
  }

  protected doUndo(): void {
    this.reconnectEdge(this.originalConnection);
  }

  private reconnectEdge(connection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }): void {
    const currentEdges = this.context.getEdges();
    const edgeIndex = currentEdges.findIndex(e => e.id === this.edgeId);

    if (edgeIndex === -1) {
      throw new Error(`Edge with ID ${this.edgeId} not found`);
    }

    // Verify that source and target nodes exist
    const currentNodes = this.context.getNodes();
    const sourceExists = currentNodes.some(n => n.id === connection.source);
    const targetExists = currentNodes.some(n => n.id === connection.target);

    if (!sourceExists) {
      throw new Error(`Source node ${connection.source} not found`);
    }

    if (!targetExists) {
      throw new Error(`Target node ${connection.target} not found`);
    }

    const updatedEdges = [...currentEdges];
    updatedEdges[edgeIndex] = {
      ...currentEdges[edgeIndex],
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    };

    this.context.setEdges(updatedEdges);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      edgeId: this.edgeId,
      from: this.originalConnection,
      to: this.newConnection,
    };
  }
}

/**
 * Utility function to create edge commands easily
 */
export class EdgeCommandFactory {
  static addEdge(edge: Edge, context: ICommandContext): AddEdgeCommand {
    return new AddEdgeCommand(edge, context);
  }

  static deleteEdge(edgeId: string, context: ICommandContext): DeleteEdgeCommand {
    return new DeleteEdgeCommand(edgeId, context);
  }

  static modifyEdge(
    edgeId: string,
    updates: Partial<Edge>,
    context: ICommandContext
  ): ModifyEdgeCommand {
    return new ModifyEdgeCommand(edgeId, updates, context);
  }

  static reconnectEdge(
    edgeId: string,
    originalConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null },
    newConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null },
    context: ICommandContext
  ): ReconnectEdgeCommand {
    return new ReconnectEdgeCommand(edgeId, originalConnection, newConnection, context);
  }
}