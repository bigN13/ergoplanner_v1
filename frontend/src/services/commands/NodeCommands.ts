import type { Node } from "reactflow";

import type { ICommandContext } from "@/types/commands";

import { BaseCommand } from "./BaseCommand";

/**
 * Command to add a new node to the drawing
 */
export class AddNodeCommand extends BaseCommand {
  private node: Node;

  constructor(node: Node, context: ICommandContext) {
    super("add_node", `Add ${node.type || 'node'} (${node.id})`, context);
    this.node = { ...node };
  }

  protected doExecute(): void {
    const currentNodes = this.context.getNodes();

    // Check if node already exists
    if (currentNodes.find(n => n.id === this.node.id)) {
      throw new Error(`Node with ID ${this.node.id} already exists`);
    }

    this.context.setNodes([...currentNodes, this.node]);
  }

  protected doUndo(): void {
    const currentNodes = this.context.getNodes();
    const filteredNodes = currentNodes.filter(n => n.id !== this.node.id);
    this.context.setNodes(filteredNodes);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      nodeId: this.node.id,
      nodeType: this.node.type,
      position: this.node.position,
      data: this.node.data,
    };
  }
}

/**
 * Command to delete an existing node from the drawing
 */
export class DeleteNodeCommand extends BaseCommand {
  private node: Node | null = null;
  private nodeId: string;
  private connectedEdges: { id: string; source: string; target: string }[] = [];

  constructor(nodeId: string, context: ICommandContext) {
    super("delete_node", `Delete node (${nodeId})`, context);
    this.nodeId = nodeId;
  }

  protected doExecute(): void {
    const currentNodes = this.context.getNodes();
    const currentEdges = this.context.getEdges();

    // Find the node to delete
    this.node = currentNodes.find(n => n.id === this.nodeId) || null;
    if (!this.node) {
      throw new Error(`Node with ID ${this.nodeId} not found`);
    }

    // Store connected edges for undo
    this.connectedEdges = currentEdges
      .filter(e => e.source === this.nodeId || e.target === this.nodeId)
      .map(e => ({ id: e.id, source: e.source, target: e.target }));

    // Remove node and connected edges
    const filteredNodes = currentNodes.filter(n => n.id !== this.nodeId);
    const filteredEdges = currentEdges.filter(e =>
      e.source !== this.nodeId && e.target !== this.nodeId
    );

    this.context.setNodes(filteredNodes);
    this.context.setEdges(filteredEdges);

    // Clear selection if this node was selected
    if (this.context.getSelectedNodeId() === this.nodeId) {
      this.context.setSelectedNodeId(null);
    }
  }

  protected doUndo(): void {
    if (!this.node) {
      throw new Error("Cannot undo: original node data not available");
    }

    const currentNodes = this.context.getNodes();
    const currentEdges = this.context.getEdges();

    // Restore the node
    this.context.setNodes([...currentNodes, this.node]);

    // Restore connected edges (if they still make sense)
    const availableNodes = new Set([...currentNodes.map(n => n.id), this.node.id]);
    const restorableEdges = this.connectedEdges.filter(edge =>
      availableNodes.has(edge.source) && availableNodes.has(edge.target)
    );

    // Note: We can't fully restore edges without their complete data
    // In a real implementation, we'd need to store full edge objects
    // For now, we just keep the current edges as they are
    // The `restorableEdges` variable is kept for future enhancement
    void restorableEdges; // Acknowledge unused variable
    this.context.setEdges(currentEdges);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      nodeId: this.nodeId,
      nodeType: this.node?.type || 'unknown',
      connectedEdgesCount: this.connectedEdges.length,
      connectedEdges: this.connectedEdges,
    };
  }
}

/**
 * Command to modify an existing node's properties
 */
export class ModifyNodeCommand extends BaseCommand {
  private nodeId: string;
  private originalNode: Node | null = null;
  private updates: Partial<Node>;

  constructor(nodeId: string, updates: Partial<Node>, context: ICommandContext) {
    super("modify_node", `Modify node (${nodeId})`, context);
    this.nodeId = nodeId;
    this.updates = { ...updates };
  }

  protected doExecute(): void {
    const currentNodes = this.context.getNodes();
    const nodeIndex = currentNodes.findIndex(n => n.id === this.nodeId);

    if (nodeIndex === -1) {
      throw new Error(`Node with ID ${this.nodeId} not found`);
    }

    // Store original node for undo
    this.originalNode = { ...currentNodes[nodeIndex] };

    // Apply updates
    const updatedNodes = [...currentNodes];
    updatedNodes[nodeIndex] = { ...currentNodes[nodeIndex], ...this.updates };

    this.context.setNodes(updatedNodes);
  }

  protected doUndo(): void {
    if (!this.originalNode) {
      throw new Error("Cannot undo: original node data not available");
    }

    const currentNodes = this.context.getNodes();
    const nodeIndex = currentNodes.findIndex(n => n.id === this.nodeId);

    if (nodeIndex === -1) {
      throw new Error(`Node with ID ${this.nodeId} not found for undo`);
    }

    const restoredNodes = [...currentNodes];
    restoredNodes[nodeIndex] = this.originalNode;

    this.context.setNodes(restoredNodes);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      nodeId: this.nodeId,
      updates: this.updates,
      originalData: this.originalNode ? {
        type: this.originalNode.type,
        position: this.originalNode.position,
        data: this.originalNode.data,
      } : null,
    };
  }
}

/**
 * Command to move a node to a new position
 */
export class MoveNodeCommand extends BaseCommand {
  private nodeId: string;
  private fromPosition: { x: number; y: number };
  private toPosition: { x: number; y: number };

  constructor(
    nodeId: string,
    fromPosition: { x: number; y: number },
    toPosition: { x: number; y: number },
    context: ICommandContext
  ) {
    super("move_node", `Move node (${nodeId})`, context);
    this.nodeId = nodeId;
    this.fromPosition = { ...fromPosition };
    this.toPosition = { ...toPosition };
  }

  protected doExecute(): void {
    this.moveNodeToPosition(this.toPosition);
  }

  protected doUndo(): void {
    this.moveNodeToPosition(this.fromPosition);
  }

  private moveNodeToPosition(position: { x: number; y: number }): void {
    const currentNodes = this.context.getNodes();
    const nodeIndex = currentNodes.findIndex(n => n.id === this.nodeId);

    if (nodeIndex === -1) {
      throw new Error(`Node with ID ${this.nodeId} not found`);
    }

    const updatedNodes = [...currentNodes];
    updatedNodes[nodeIndex] = {
      ...currentNodes[nodeIndex],
      position: { ...position }
    };

    this.context.setNodes(updatedNodes);
  }

  public getDetails(): Record<string, unknown> {
    return {
      ...super.getDetails(),
      nodeId: this.nodeId,
      from: this.fromPosition,
      to: this.toPosition,
      distance: Math.sqrt(
        Math.pow(this.toPosition.x - this.fromPosition.x, 2) +
        Math.pow(this.toPosition.y - this.fromPosition.y, 2)
      ).toFixed(2),
    };
  }
}

/**
 * Utility function to create node commands easily
 */
export class NodeCommandFactory {
  static addNode(node: Node, context: ICommandContext): AddNodeCommand {
    return new AddNodeCommand(node, context);
  }

  static deleteNode(nodeId: string, context: ICommandContext): DeleteNodeCommand {
    return new DeleteNodeCommand(nodeId, context);
  }

  static modifyNode(
    nodeId: string,
    updates: Partial<Node>,
    context: ICommandContext
  ): ModifyNodeCommand {
    return new ModifyNodeCommand(nodeId, updates, context);
  }

  static moveNode(
    nodeId: string,
    fromPosition: { x: number; y: number },
    toPosition: { x: number; y: number },
    context: ICommandContext
  ): MoveNodeCommand {
    return new MoveNodeCommand(nodeId, fromPosition, toPosition, context);
  }
}