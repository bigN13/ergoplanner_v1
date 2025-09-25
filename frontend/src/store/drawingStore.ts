import type { Node, Edge, Connection, NodeChange, EdgeChange } from "reactflow";
import { MarkerType, applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CommandManager, DrawingStoreContext, NodeCommandFactory } from "@/services/commands";
import type { HistoryItem } from "@/types/commands";
import type { Layer } from "@/types/drawing";

// Tool types for the drawing toolbar
export type ToolGroup = "selection" | "drawing" | "annotation";
export type SelectionTool = "select" | "pan" | "multiSelect";
export type DrawingTool = "addNode" | "drawEdge" | "freehand";
export type AnnotationTool = "text" | "measurement" | "callout";
export type DrawingTool_Type = SelectionTool | DrawingTool | AnnotationTool;

export interface ToolState {
  activeToolGroup: ToolGroup;
  activeTool: DrawingTool_Type;
  toolOptions: {
    lineStyle?: "solid" | "dashed" | "dotted";
    lineWeight?: number;
    arrowStyle?: "none" | "arrow" | "diamond";
    snapEnabled?: boolean;
    multiSelectMode?: boolean;
  };
}

// Clipboard data interface
export interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
  timestamp: Date;
  sourceDrawingId: string;
}

// Format painter data
export interface FormatData {
  style?: React.CSSProperties;
  nodeType?: string;
  edgeType?: string;
  data?: Record<string, unknown>;
}

export interface DrawingState {
  // Core state
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Command-based history (replaces old history system)
  commandManager: CommandManager | null;

  // Clipboard state
  clipboardData: ClipboardData | null;

  // Format painter state
  formatPainterData: FormatData | null;
  isFormatPainterActive: boolean;

  // Drawing metadata
  drawingId: string | null;
  drawingName: string;
  lastSaved: Date | null;
  isDirty: boolean;

  // UI state
  isGridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoom: number;

  // Layer management
  layers: Layer[];
  activeLayerId: string;

  // Tool management
  toolState: ToolState;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  deleteNode: (nodeId: string) => void;
  deleteSelectedNode: () => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  deleteEdge: (edgeId: string) => void;
  deleteSelectedEdge: () => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;

  // Command-based history actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistoryItems: () => HistoryItem[];
  clearHistory: () => void;
  initializeCommandManager: () => void;
  getHistoryDescription: (index: number) => string;

  // Clipboard actions
  copyToClipboard: (nodes: Node[], edges: Edge[]) => void;
  cutToClipboard: (nodes: Node[], edges: Edge[]) => void;
  pasteFromClipboard: (position?: { x: number; y: number }) => void;
  pasteSpecial: (mode: "formatting" | "values" | "duplicate") => void;
  clearClipboard: () => void;
  hasClipboardData: () => boolean;

  // Format painter actions
  setFormatPainter: (data: FormatData | null) => void;
  applyFormat: (targetIds: string[]) => void;
  toggleFormatPainter: () => void;

  // Drawing management
  newDrawing: () => void;
  saveDrawing: () => void;
  loadDrawing: (drawingIdOrContent: string) => void;
  exportDrawing: (format: "json" | "svg" | "png") => Promise<void>;
  importDrawing: (data: string) => void;

  // UI actions
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  toggleSnap: () => void; // Alias for toggleSnapToGrid
  setGridSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setDrawingName: (name: string) => void;
  markDirty: () => void;
  markClean: () => void;

  // Layer management actions
  addLayer: (layer: Layer) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  deleteLayer: (layerId: string) => void;
  setActiveLayer: (layerId: string) => void;
  moveLayer: (layerId: string, direction: 'up' | 'down') => void;
  getVisibleNodes: () => Node[];
  getVisibleEdges: () => Edge[];
  assignElementToLayer: (elementId: string, layerId: string, elementType: 'node' | 'edge') => void;

  // Tool management actions
  setActiveTool: (tool: DrawingTool_Type) => void;
  setActiveToolGroup: (group: ToolGroup) => void;
  updateToolOptions: (options: Partial<ToolState['toolOptions']>) => void;
  getActiveToolConfig: () => { group: ToolGroup; tool: DrawingTool_Type; options: ToolState['toolOptions'] };
}

const defaultLayers: Layer[] = [
  {
    id: "main",
    name: "Main",
    visible: true,
    locked: false,
    opacity: 1.0,
    order: 0,
  },
  {
    id: "equipment",
    name: "Equipment",
    visible: true,
    locked: false,
    opacity: 1.0,
    order: 1,
  },
  {
    id: "piping",
    name: "Piping",
    visible: true,
    locked: false,
    opacity: 1.0,
    order: 2,
  },
  {
    id: "instruments",
    name: "Instruments",
    visible: true,
    locked: false,
    opacity: 1.0,
    order: 3,
  },
  {
    id: "annotations",
    name: "Annotations",
    visible: true,
    locked: false,
    opacity: 1.0,
    order: 4,
  },
];

const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  commandManager: null,
  clipboardData: null,
  formatPainterData: null,
  isFormatPainterActive: false,
  drawingId: null,
  drawingName: "Untitled Drawing",
  lastSaved: null,
  isDirty: false,
  isGridVisible: true,
  snapToGrid: true,
  gridSize: 20,
  zoom: 1,
  layers: defaultLayers,
  activeLayerId: "main",
  toolState: {
    activeToolGroup: "selection" as ToolGroup,
    activeTool: "select" as DrawingTool_Type,
    toolOptions: {
      lineStyle: "solid",
      lineWeight: 1,
      arrowStyle: "none",
      snapEnabled: true,
      multiSelectMode: false,
    },
  },
};

export const useDrawingStore = create<DrawingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initializeCommandManager: () => {
        const state = get();
        if (!state.commandManager) {
          const context = new DrawingStoreContext(state);
          const commandManager = new CommandManager(context, {
            maxHistorySize: 50,
            enableAutoBatching: true,
            batchTimeWindow: 1000,
            userId: 'current-user',
          });
          set({ commandManager });
        }
      },

      setNodes: (nodes) => {
        set({ nodes, isDirty: true });
      },

      setEdges: (edges) => {
        set({ edges, isDirty: true });
      },

      onNodesChange: (changes) => {
        const { nodes } = get();
        const updatedNodes = applyNodeChanges(changes, nodes);
        set({ nodes: updatedNodes, isDirty: true });
      },

      onEdgesChange: (changes) => {
        const { edges } = get();
        const updatedEdges = applyEdgeChanges(changes, edges);
        set({ edges: updatedEdges, isDirty: true });
      },

      onConnect: (connection) => {
        const { edges, activeLayerId } = get();
        const newEdge = {
          ...connection,
          id: `edge-${Date.now()}`,
          type: "smoothstep",
          data: { layer: activeLayerId },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        } as Edge;
        const updatedEdges = addEdge(newEdge, edges);
        set({ edges: updatedEdges, isDirty: true });
      },

      addNode: (node) => {
        const state = get();
        if (!state.commandManager) {
          state.initializeCommandManager();
        }

        const { activeLayerId, commandManager } = get();
        const nodeWithLayer = {
          ...node,
          data: {
            ...node.data,
            layer: node.data?.layer || activeLayerId,
          },
        };

        const context = new DrawingStoreContext(get());
        const command = NodeCommandFactory.addNode(nodeWithLayer, context);
        if (commandManager) {
          commandManager.execute(command);
        }
      },

      updateNode: (nodeId, updates) => {
        const { nodes } = get();
        const updatedNodes = nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        );
        set({ nodes: updatedNodes, isDirty: true });
      },

      deleteNode: (nodeId) => {
        const state = get();
        if (!state.commandManager) {
          state.initializeCommandManager();
        }

        const { commandManager } = get();
        const context = new DrawingStoreContext(get());
        const command = NodeCommandFactory.deleteNode(nodeId, context);
        if (commandManager) {
          commandManager.execute(command);
        }
      },

      deleteSelectedNode: () => {
        const { selectedNodeId } = get();
        if (selectedNodeId) {
          get().deleteNode(selectedNodeId);
        }
      },

      addEdge: (edge) => {
        const { edges, activeLayerId } = get();
        const edgeWithLayer = {
          ...edge,
          data: {
            ...edge.data,
            layer: edge.data?.layer || activeLayerId,
          },
        };
        set({ edges: [...edges, edgeWithLayer], isDirty: true });
      },

      updateEdge: (edgeId, updates) => {
        const { edges } = get();
        const updatedEdges = edges.map((edge) =>
          edge.id === edgeId ? { ...edge, ...updates } : edge
        );
        set({ edges: updatedEdges, isDirty: true });
      },

      deleteEdge: (edgeId) => {
        const { edges } = get();
        const filteredEdges = edges.filter((e) => e.id !== edgeId);
        set({ edges: filteredEdges, selectedEdgeId: null, isDirty: true });
      },

      deleteSelectedEdge: () => {
        const { selectedEdgeId } = get();
        if (selectedEdgeId) {
          get().deleteEdge(selectedEdgeId);
        }
      },

      setSelectedNode: (nodeId) => {
        set({ selectedNodeId: nodeId, selectedEdgeId: null });
      },

      setSelectedEdge: (edgeId) => {
        set({ selectedEdgeId: edgeId, selectedNodeId: null });
      },

      undo: () => {
        const state = get();
        if (!state.commandManager) {
          state.initializeCommandManager();
        }
        const { commandManager } = get();
        if (commandManager) {
          commandManager.undo();
        }
      },

      redo: () => {
        const state = get();
        if (!state.commandManager) {
          state.initializeCommandManager();
        }
        const { commandManager } = get();
        if (commandManager) {
          commandManager.redo();
        }
      },

      canUndo: () => {
        const { commandManager } = get();
        return commandManager ? commandManager.canUndo() : false;
      },

      canRedo: () => {
        const { commandManager } = get();
        return commandManager ? commandManager.canRedo() : false;
      },

      getHistoryItems: () => {
        const { commandManager } = get();
        return commandManager ? commandManager.getHistory() : [];
      },

      clearHistory: () => {
        const { commandManager } = get();
        if (commandManager) {
          commandManager.clearHistory();
        }
      },

      getHistoryDescription: (index) => {
        const { commandManager } = get();
        if (commandManager) {
          const history = commandManager.getHistory();
          return history[index]?.action || "";
        }
        return "";
      },

      // Clipboard actions
      copyToClipboard: (nodes, edges) => {
        const { drawingId } = get();
        const clipboardData: ClipboardData = {
          nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
          edges: JSON.parse(JSON.stringify(edges)),
          timestamp: new Date(),
          sourceDrawingId: drawingId || "",
        };
        set({ clipboardData });
      },

      cutToClipboard: (nodes, edges) => {
        const state = get();
        state.copyToClipboard(nodes, edges);

        // Remove the nodes and edges from the drawing
        const remainingNodes = state.nodes.filter(n => !nodes.find(cn => cn.id === n.id));
        const remainingEdges = state.edges.filter(e => !edges.find(ce => ce.id === e.id));
        set({
          nodes: remainingNodes,
          edges: remainingEdges,
          isDirty: true
        });
      },

      pasteFromClipboard: (position) => {
        const { clipboardData, nodes, edges } = get();
        if (!clipboardData) return;

        // Calculate offset for pasting
        const offsetX = position?.x || 50;
        const offsetY = position?.y || 50;

        // Create new nodes with offset and new IDs
        const nodeIdMap = new Map<string, string>();
        const pastedNodes = clipboardData.nodes.map(node => {
          const newId = `${node.id}-copy-${Date.now()}`;
          nodeIdMap.set(node.id, newId);
          return {
            ...node,
            id: newId,
            position: {
              x: node.position.x + offsetX,
              y: node.position.y + offsetY,
            },
          };
        });

        // Create new edges with updated source/target IDs
        const pastedEdges = clipboardData.edges.map(edge => ({
          ...edge,
          id: `${edge.id}-copy-${Date.now()}`,
          source: nodeIdMap.get(edge.source) || edge.source,
          target: nodeIdMap.get(edge.target) || edge.target,
        }));

        set({
          nodes: [...nodes, ...pastedNodes],
          edges: [...edges, ...pastedEdges],
          isDirty: true,
        });
      },

      pasteSpecial: (mode) => {
        const { clipboardData } = get();
        if (!clipboardData) return;

        switch (mode) {
          case "formatting":
            // Apply only formatting from clipboard data
            // This would apply styles, colors, etc. without data
            break;
          case "values":
            // Apply only values without formatting
            get().pasteFromClipboard();
            break;
          case "duplicate":
            // Create a duplicate with slight offset
            get().pasteFromClipboard({ x: 20, y: 20 });
            break;
        }
      },

      clearClipboard: () => {
        set({ clipboardData: null });
      },

      hasClipboardData: () => {
        const { clipboardData } = get();
        return clipboardData !== null;
      },

      // Format painter actions
      setFormatPainter: (data) => {
        set({
          formatPainterData: data,
          isFormatPainterActive: data !== null
        });
      },

      applyFormat: (targetIds) => {
        const { formatPainterData, nodes } = get();
        if (!formatPainterData) return;

        const updatedNodes = nodes.map(node => {
          if (targetIds.includes(node.id)) {
            return {
              ...node,
              type: formatPainterData.nodeType || node.type,
              style: { ...node.style, ...formatPainterData.style },
              data: { ...node.data, ...formatPainterData.data },
            };
          }
          return node;
        });

        set({ nodes: updatedNodes, isDirty: true });
      },

      toggleFormatPainter: () => {
        const { isFormatPainterActive } = get();
        set({
          isFormatPainterActive: !isFormatPainterActive,
          formatPainterData: !isFormatPainterActive ? null : get().formatPainterData
        });
      },

      newDrawing: () => {
        set({
          ...initialState,
          drawingId: `drawing-${Date.now()}`,
          drawingName: "Untitled Drawing",
        });
        // Initialize command manager for new drawing
        get().initializeCommandManager();
      },

      saveDrawing: () => {
        const { drawingId, drawingName, nodes, edges, layers, activeLayerId } = get();
        const id = drawingId || `drawing-${Date.now()}`;

        const drawingData = {
          id,
          name: drawingName,
          nodes,
          edges,
          layers,
          activeLayerId,
          savedAt: new Date().toISOString(),
        };

        // Save to localStorage
        localStorage.setItem(`ergoplanner-drawing-${id}`, JSON.stringify(drawingData));

        // Update saved drawings list
        const savedDrawings = JSON.parse(localStorage.getItem("ergoplanner-drawings") || "[]");
        const existingIndex = savedDrawings.findIndex((d: Record<string, unknown>) => d.id === id);

        if (existingIndex >= 0) {
          savedDrawings[existingIndex] = { id, name: drawingName, savedAt: drawingData.savedAt };
        } else {
          savedDrawings.push({ id, name: drawingName, savedAt: drawingData.savedAt });
        }

        localStorage.setItem("ergoplanner-drawings", JSON.stringify(savedDrawings));

        set({
          drawingId: id,
          lastSaved: new Date(),
          isDirty: false,
        });
      },

      loadDrawing: (drawingIdOrContent) => {
        try {
          // Try to parse as JSON first (content from file)
          const data = JSON.parse(drawingIdOrContent);
          if (data.nodes && data.edges) {
            // Load layers from saved data or use defaults
            const layers = data.layers || defaultLayers;
            const activeLayerId = data.activeLayerId || "main";

            set({
              drawingId: data.id || `drawing-${Date.now()}`,
              drawingName: data.name || "Imported Drawing",
              nodes: data.nodes,
              edges: data.edges,
              layers,
              activeLayerId,
              lastSaved: data.savedAt ? new Date(data.savedAt) : null,
              isDirty: false,
            });
            get().initializeCommandManager();
            return;
          }
        } catch {
          // Not JSON, treat as drawing ID
        }

        // Try to load from localStorage using ID
        const savedData = localStorage.getItem(`ergoplanner-drawing-${drawingIdOrContent}`);
        if (savedData) {
          const data = JSON.parse(savedData);
          const layers = data.layers || defaultLayers;
          const activeLayerId = data.activeLayerId || "main";

          set({
            drawingId: data.id,
            drawingName: data.name,
            nodes: data.nodes,
            edges: data.edges,
            layers,
            activeLayerId,
            lastSaved: new Date(data.savedAt),
            isDirty: false,
          });
          get().initializeCommandManager();
        }
      },

      exportDrawing: async (format) => {
        const { nodes, edges, drawingName } = get();

        if (format === "json") {
          const data = JSON.stringify({ nodes, edges }, null, 2);
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${drawingName}.json`;
          link.click();
          URL.revokeObjectURL(url);
        } else if (format === "svg" || format === "png") {
          // This will be handled by the component using html-to-image
          // TODO: Implement export functionality
          // console.log(`Export as ${format} will be handled by the component`);
        }
      },

      importDrawing: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.nodes && parsed.edges) {
            set({
              nodes: parsed.nodes,
              edges: parsed.edges,
              isDirty: true,
            });
            get().initializeCommandManager();
          }
        } catch (error) {
          console.error("Failed to import drawing:", error);
        }
      },

      toggleGrid: () => {
        const { isGridVisible } = get();
        set({ isGridVisible: !isGridVisible });
      },

      toggleSnapToGrid: () => {
        const { snapToGrid } = get();
        set({ snapToGrid: !snapToGrid });
      },

      toggleSnap: () => {
        // Alias for toggleSnapToGrid
        get().toggleSnapToGrid();
      },

      setGridSize: (size) => {
        set({ gridSize: size });
      },

      setZoom: (zoom) => {
        set({ zoom });
      },

      setDrawingName: (name) => {
        set({ drawingName: name, isDirty: true });
      },

      markDirty: () => {
        set({ isDirty: true });
      },

      markClean: () => {
        set({ isDirty: false });
      },

      // Layer management actions
      addLayer: (layer) => {
        const { layers } = get();
        const newLayer = {
          ...layer,
          order: layer.order >= 0 ? layer.order : layers.length,
        };
        set({ layers: [...layers, newLayer], isDirty: true });
      },

      updateLayer: (layerId, updates) => {
        const { layers } = get();
        const updatedLayers = layers.map((layer) =>
          layer.id === layerId ? { ...layer, ...updates } : layer
        );
        set({ layers: updatedLayers, isDirty: true });

        // Save layer state to localStorage
        localStorage.setItem('ergoplanner-layers', JSON.stringify(updatedLayers));
      },

      deleteLayer: (layerId) => {
        const { layers, activeLayerId, nodes, edges } = get();

        // Don't delete the main layer or if it's the only layer
        if (layerId === "main" || layers.length <= 1) {
          return;
        }

        // Move elements from deleted layer to main layer
        const updatedNodes = nodes.map((node) => {
          if (node.data && node.data.layer === layerId) {
            return {
              ...node,
              data: { ...node.data, layer: "main" },
            };
          }
          return node;
        });

        const updatedEdges = edges.map((edge) => {
          if (edge.data && edge.data.layer === layerId) {
            return {
              ...edge,
              data: { ...edge.data, layer: "main" },
            };
          }
          return edge;
        });

        const filteredLayers = layers.filter((l) => l.id !== layerId);
        const newActiveLayer = activeLayerId === layerId ? "main" : activeLayerId;

        set({
          layers: filteredLayers,
          activeLayerId: newActiveLayer,
          nodes: updatedNodes,
          edges: updatedEdges,
          isDirty: true,
        });
      },

      setActiveLayer: (layerId) => {
        const { layers } = get();
        const layerExists = layers.some((l) => l.id === layerId);
        if (layerExists) {
          set({ activeLayerId: layerId });
        }
      },

      moveLayer: (layerId, direction) => {
        const { layers } = get();
        const layerIndex = layers.findIndex((l) => l.id === layerId);
        if (layerIndex === -1) return;

        const newIndex = direction === "up" ? layerIndex - 1 : layerIndex + 1;
        if (newIndex < 0 || newIndex >= layers.length) return;

        const newLayers = [...layers];
        [newLayers[layerIndex], newLayers[newIndex]] = [newLayers[newIndex], newLayers[layerIndex]];

        // Update order property
        newLayers.forEach((layer, index) => {
          const updatedLayer = { ...layer, order: index };
          return updatedLayer;
        });

        set({ layers: newLayers, isDirty: true });
      },

      getVisibleNodes: () => {
        const { nodes, layers } = get();
        const visibleLayers = new Set(layers.filter((l) => l.visible).map((l) => l.id));

        return nodes.filter((node) => {
          const nodeLayer = node.data?.layer || "main";
          return visibleLayers.has(nodeLayer);
        });
      },

      getVisibleEdges: () => {
        const { edges, layers } = get();
        const visibleLayers = new Set(layers.filter((l) => l.visible).map((l) => l.id));

        return edges.filter((edge) => {
          const edgeLayer = edge.data?.layer || "main";
          return visibleLayers.has(edgeLayer);
        });
      },

      assignElementToLayer: (elementId, layerId, elementType) => {
        const { nodes, edges, layers } = get();
        const layerExists = layers.some((l) => l.id === layerId);
        if (!layerExists) return;

        if (elementType === 'node') {
          const updatedNodes = nodes.map((node) =>
            node.id === elementId
              ? { ...node, data: { ...node.data, layer: layerId } }
              : node
          );
          set({ nodes: updatedNodes, isDirty: true });
        } else if (elementType === 'edge') {
          const updatedEdges = edges.map((edge) =>
            edge.id === elementId
              ? { ...edge, data: { ...edge.data, layer: layerId } }
              : edge
          );
          set({ edges: updatedEdges, isDirty: true });
        }
      },

      // Tool management actions
      setActiveTool: (tool) => {
        const { toolState } = get();
        let newToolGroup: ToolGroup = toolState.activeToolGroup;

        // Determine the correct tool group based on the tool
        if (['select', 'pan', 'multiSelect'].includes(tool)) {
          newToolGroup = 'selection';
        } else if (['addNode', 'drawEdge', 'freehand'].includes(tool)) {
          newToolGroup = 'drawing';
        } else if (['text', 'measurement', 'callout'].includes(tool)) {
          newToolGroup = 'annotation';
        }

        set({
          toolState: {
            ...toolState,
            activeTool: tool,
            activeToolGroup: newToolGroup,
          },
          isDirty: true,
        });
      },

      setActiveToolGroup: (group) => {
        const { toolState } = get();
        let newActiveTool: DrawingTool_Type = toolState.activeTool;

        // Set default tool for each group if current tool doesn't belong to new group
        switch (group) {
          case 'selection':
            if (!['select', 'pan', 'multiSelect'].includes(toolState.activeTool)) {
              newActiveTool = 'select';
            }
            break;
          case 'drawing':
            if (!['addNode', 'drawEdge', 'freehand'].includes(toolState.activeTool)) {
              newActiveTool = 'addNode';
            }
            break;
          case 'annotation':
            if (!['text', 'measurement', 'callout'].includes(toolState.activeTool)) {
              newActiveTool = 'text';
            }
            break;
        }

        set({
          toolState: {
            ...toolState,
            activeToolGroup: group,
            activeTool: newActiveTool,
          },
          isDirty: true,
        });
      },

      updateToolOptions: (options) => {
        const { toolState } = get();
        set({
          toolState: {
            ...toolState,
            toolOptions: {
              ...toolState.toolOptions,
              ...options,
            },
          },
          isDirty: true,
        });
      },

      getActiveToolConfig: () => {
        const { toolState } = get();
        return {
          group: toolState.activeToolGroup,
          tool: toolState.activeTool,
          options: toolState.toolOptions,
        };
      },
    }),
    {
      name: "drawing-store",
    }
  )
);
