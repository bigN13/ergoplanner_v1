import type { Node, Edge } from "reactflow";

// Base command interface
export interface Command {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  type: CommandType;
  execute(): void;
  undo(): void;
  canExecute(): boolean;
  canUndo(): boolean;
}

// Command types for visual categorization
export enum CommandType {
  NODE = "node",
  EDGE = "edge",
  SELECTION = "selection",
  TRANSFORM = "transform",
  FORMAT = "format",
  LAYOUT = "layout",
  COMPOSITE = "composite"
}

// Composite command for grouping multiple operations
export interface CompositeCommand extends Command {
  commands: Command[];
  addCommand(command: Command): void;
}

// Specific command interfaces for different operations
export interface NodeCommand extends Command {
  nodeId: string;
  node?: Node;
}

export interface EdgeCommand extends Command {
  edgeId: string;
  edge?: Edge;
}

// Command history entry with visual metadata
export interface HistoryEntry {
  command: Command;
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  type: CommandType;
  icon?: string;
  canUndo: boolean;
}

// History state for the store
export interface CommandHistory {
  commands: Command[];
  currentIndex: number;
  maxSize: number;
}

// Command context for accessing store state
export interface CommandContext {
  getNodes: () => Node[];
  setNodes: (nodes: Node[]) => void;
  getEdges: () => Edge[];
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  markDirty: () => void;
}

// Abstract base command class
export abstract class BaseCommand implements Command {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly timestamp: Date;
  public readonly type: CommandType;

  constructor(
    name: string,
    description: string,
    type: CommandType,
    id?: string
  ) {
    this.id = id || `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.description = description;
    this.timestamp = new Date();
    this.type = type;
  }

  abstract execute(): void;
  abstract undo(): void;

  canExecute(): boolean {
    return true;
  }

  canUndo(): boolean {
    return true;
  }
}

// Composite command implementation
export class CompositeCommandImpl extends BaseCommand implements CompositeCommand {
  public commands: Command[] = [];

  constructor(name: string, description: string) {
    super(name, description, CommandType.COMPOSITE);
  }

  addCommand(command: Command): void {
    this.commands.push(command);
  }

  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }

  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  canExecute(): boolean {
    return this.commands.every(cmd => cmd.canExecute());
  }

  canUndo(): boolean {
    return this.commands.every(cmd => cmd.canUndo());
  }
}

// Specific command implementations

// Add Node Command
export class AddNodeCommand extends BaseCommand implements NodeCommand {
  public readonly nodeId: string;
  public readonly node: Node;
  private context: CommandContext;

  constructor(node: Node, context: CommandContext) {
    const label = node.data?.label || node.type || "Node";
    super(
      `Add ${label}`,
      `Added ${label} at (${Math.round(node.position.x)}, ${Math.round(node.position.y)})`,
      CommandType.NODE
    );
    this.nodeId = node.id;
    this.node = node;
    this.context = context;
  }

  execute(): void {
    this.context.addNode(this.node);
    this.context.markDirty();
  }

  undo(): void {
    this.context.removeNode(this.nodeId);
    // Also remove any edges connected to this node
    const edges = this.context.getEdges();
    const connectedEdges = edges.filter(e => e.source === this.nodeId || e.target === this.nodeId);
    connectedEdges.forEach(edge => this.context.removeEdge(edge.id));
    this.context.markDirty();
  }
}

// Delete Node Command
export class DeleteNodeCommand extends BaseCommand implements NodeCommand {
  public readonly nodeId: string;
  public readonly node: Node;
  private context: CommandContext;
  private deletedEdges: Edge[] = [];

  constructor(nodeId: string, context: CommandContext) {
    const nodes = context.getNodes();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    const label = node.data?.label || node.type || "Node";
    super(
      `Delete ${label}`,
      `Deleted ${label}`,
      CommandType.NODE
    );
    this.nodeId = nodeId;
    this.node = node;
    this.context = context;
  }

  execute(): void {
    // Store connected edges for undo
    const edges = this.context.getEdges();
    this.deletedEdges = edges.filter(e => e.source === this.nodeId || e.target === this.nodeId);

    // Remove node and connected edges
    this.deletedEdges.forEach(edge => this.context.removeEdge(edge.id));
    this.context.removeNode(this.nodeId);
    this.context.markDirty();
  }

  undo(): void {
    this.context.addNode(this.node);
    this.deletedEdges.forEach(edge => this.context.addEdge(edge));
    this.context.markDirty();
  }
}

// Move Node Command
export class MoveNodeCommand extends BaseCommand implements NodeCommand {
  public readonly nodeId: string;
  private context: CommandContext;
  private oldPosition: { x: number; y: number };
  private newPosition: { x: number; y: number };

  constructor(nodeId: string, oldPosition: { x: number; y: number }, newPosition: { x: number; y: number }, context: CommandContext) {
    const nodes = context.getNodes();
    const node = nodes.find(n => n.id === nodeId);
    const label = node?.data?.label || node?.type || "Node";

    super(
      `Move ${label}`,
      `Moved ${label} from (${Math.round(oldPosition.x)}, ${Math.round(oldPosition.y)}) to (${Math.round(newPosition.x)}, ${Math.round(newPosition.y)})`,
      CommandType.TRANSFORM
    );
    this.nodeId = nodeId;
    this.oldPosition = oldPosition;
    this.newPosition = newPosition;
    this.context = context;
  }

  execute(): void {
    this.context.updateNode(this.nodeId, { position: this.newPosition });
    this.context.markDirty();
  }

  undo(): void {
    this.context.updateNode(this.nodeId, { position: this.oldPosition });
    this.context.markDirty();
  }
}

// Add Edge Command
export class AddEdgeCommand extends BaseCommand implements EdgeCommand {
  public readonly edgeId: string;
  public readonly edge: Edge;
  private context: CommandContext;

  constructor(edge: Edge, context: CommandContext) {
    super(
      "Add Connection",
      `Added connection from ${edge.source} to ${edge.target}`,
      CommandType.EDGE
    );
    this.edgeId = edge.id;
    this.edge = edge;
    this.context = context;
  }

  execute(): void {
    this.context.addEdge(this.edge);
    this.context.markDirty();
  }

  undo(): void {
    this.context.removeEdge(this.edgeId);
    this.context.markDirty();
  }
}

// Delete Edge Command
export class DeleteEdgeCommand extends BaseCommand implements EdgeCommand {
  public readonly edgeId: string;
  public readonly edge: Edge;
  private context: CommandContext;

  constructor(edgeId: string, context: CommandContext) {
    const edges = context.getEdges();
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) throw new Error(`Edge ${edgeId} not found`);

    super(
      "Delete Connection",
      `Deleted connection from ${edge.source} to ${edge.target}`,
      CommandType.EDGE
    );
    this.edgeId = edgeId;
    this.edge = edge;
    this.context = context;
  }

  execute(): void {
    this.context.removeEdge(this.edgeId);
    this.context.markDirty();
  }

  undo(): void {
    this.context.addEdge(this.edge);
    this.context.markDirty();
  }
}

// Multiple Selection Command
export class MultiSelectCommand extends BaseCommand {
  private nodeIds: string[];
  private context: CommandContext;

  constructor(nodeIds: string[], context: CommandContext) {
    super(
      "Select Multiple",
      `Selected ${nodeIds.length} items`,
      CommandType.SELECTION
    );
    this.nodeIds = nodeIds;
    this.context = context;
  }

  execute(): void {
    // This is typically handled by the UI state, not the drawing state
    // Implementation depends on how selection is managed
  }

  undo(): void {
    // Clear selection
  }

  canUndo(): boolean {
    return false; // Selection commands typically don't need undo
  }
}

// Format Command (for format painter and style changes)
export class FormatNodeCommand extends BaseCommand implements NodeCommand {
  public readonly nodeId: string;
  private context: CommandContext;
  private oldStyle: any;
  private newStyle: any;
  private oldData: any;
  private newData: any;

  constructor(nodeId: string, oldStyle: any, newStyle: any, oldData: any, newData: any, context: CommandContext) {
    const nodes = context.getNodes();
    const node = nodes.find(n => n.id === nodeId);
    const label = node?.data?.label || node?.type || "Node";

    super(
      `Format ${label}`,
      `Applied formatting to ${label}`,
      CommandType.FORMAT
    );
    this.nodeId = nodeId;
    this.oldStyle = oldStyle;
    this.newStyle = newStyle;
    this.oldData = oldData;
    this.newData = newData;
    this.context = context;
  }

  execute(): void {
    this.context.updateNode(this.nodeId, {
      style: this.newStyle,
      data: this.newData
    });
    this.context.markDirty();
  }

  undo(): void {
    this.context.updateNode(this.nodeId, {
      style: this.oldStyle,
      data: this.oldData
    });
    this.context.markDirty();
  }
}