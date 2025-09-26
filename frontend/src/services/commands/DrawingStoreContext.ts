import type { Node, Edge } from "reactflow";

import type { DrawingState } from "@/store/drawingStore";
import type { ICommandContext } from "@/types/commands";

/**
 * Context adapter that connects the command system with the drawing store
 * This bridges the command pattern with Zustand store operations
 */
export class DrawingStoreContext implements ICommandContext {
  private store: DrawingState;

  constructor(store: DrawingState) {
    this.store = store;
  }

  /**
   * Get current nodes from the store
   */
  public getNodes(): Node[] {
    return this.store.nodes;
  }

  /**
   * Set nodes in the store
   */
  public setNodes(nodes: Node[]): void {
    this.store.setNodes(nodes);
  }

  /**
   * Get current edges from the store
   */
  public getEdges(): Edge[] {
    return this.store.edges;
  }

  /**
   * Set edges in the store
   */
  public setEdges(edges: Edge[]): void {
    this.store.setEdges(edges);
  }

  /**
   * Mark the drawing as dirty
   */
  public markDirty(): void {
    this.store.markDirty();
  }

  /**
   * Get current active layer ID
   */
  public getActiveLayerId(): string {
    return this.store.activeLayerId;
  }

  /**
   * Set active layer ID
   */
  public setActiveLayerId(layerId: string): void {
    this.store.setActiveLayer(layerId);
  }

  /**
   * Get selected node ID
   */
  public getSelectedNodeId(): string | null {
    return this.store.selectedNodeId;
  }

  /**
   * Set selected node ID
   */
  public setSelectedNodeId(nodeId: string | null): void {
    this.store.setSelectedNode(nodeId);
  }

  /**
   * Get selected edge ID
   */
  public getSelectedEdgeId(): string | null {
    return this.store.selectedEdgeId;
  }

  /**
   * Set selected edge ID
   */
  public setSelectedEdgeId(edgeId: string | null): void {
    this.store.setSelectedEdge(edgeId);
  }

  /**
   * Directly access the drawing store if needed
   */
  public getStore(): DrawingState {
    return this.store;
  }
}
