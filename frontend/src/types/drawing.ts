import type { Node, Edge } from "reactflow";

/**
 * P&ID Symbol types based on ISA standards
 */
export type SymbolType =
  | "pump"
  | "valve"
  | "tank"
  | "pipe"
  | "instrument"
  | "compressor"
  | "heat-exchanger"
  | "filter"
  | "separator"
  | "mixer"
  | "text"
  | "group";

/**
 * Custom node data for P&ID symbols
 */
export interface PIDNodeData {
  label: string;
  symbolType: SymbolType;
  tagNumber?: string;
  description?: string;
  specifications?: Record<string, unknown>;
  rotation?: number;
  isLocked?: boolean;
  layer?: number;
}

/**
 * Custom P&ID Node type
 */
export type PIDNode = Node<PIDNodeData>;

/**
 * Custom edge data for P&ID connections
 */
export interface PIDEdgeData {
  label?: string;
  pipeClass?: string;
  diameter?: number;
  material?: string;
  flowDirection?: "forward" | "backward" | "both";
  isSignal?: boolean;
}

/**
 * Custom P&ID Edge type
 */
export type PIDEdge = Edge<PIDEdgeData>;

/**
 * Drawing canvas state
 */
export interface DrawingState {
  nodes: PIDNode[];
  edges: PIDEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  isDrawing: boolean;
  currentTool?: SymbolType;
  gridVisible: boolean;
  snapToGrid: boolean;
  layers: Layer[];
  activeLayerId: string;
}

/**
 * Layer definition
 */
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
}

/**
 * Drawing metadata
 */
export interface DrawingMetadata {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  version: number;
  status: "draft" | "review" | "approved" | "archived";
  tags: string[];
}

/**
 * Complete drawing document
 */
export interface Drawing {
  metadata: DrawingMetadata;
  state: DrawingState;
  history?: DrawingHistoryEntry[];
}

/**
 * Drawing history entry for undo/redo
 */
export interface DrawingHistoryEntry {
  timestamp: string;
  action: string;
  state: DrawingState;
  userId: string;
}

/**
 * Symbol library item
 */
export interface SymbolLibraryItem {
  id: string;
  type: SymbolType;
  category: string;
  name: string;
  description: string;
  icon: string;
  defaultData: Partial<PIDNodeData>;
  standards: string[]; // e.g., ["ISA-5.1", "ISO 14617"]
}

/**
 * Connection validation result
 */
export interface ConnectionValidation {
  isValid: boolean;
  message?: string;
  suggestedFix?: string;
}

/**
 * Export format options
 */
export type ExportFormat = "pdf" | "svg" | "png" | "dxf" | "json";

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  scale?: number;
  quality?: number;
  includeMetadata?: boolean;
  layers?: string[];
}