import type { Node, Edge, Connection, NodeChange, EdgeChange } from "reactflow";
import { MarkerType, applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { commandManager, CommandManager } from "@/services/commandManager";
import {
  AddNodeCommand,
  DeleteNodeCommand,
  MoveNodeCommand,
  AddEdgeCommand,
  DeleteEdgeCommand,
  FormatNodeCommand,
} from "@/types/commands";

export interface DrawingHistory {
  nodes: Node[];
  edges: Edge[];
}

export interface DrawingState {
  // Core state
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Command history (managed by CommandManager)
  commandHistory: {
    entries: Array<{ id: string; name: string; timestamp: Date }>;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
  };

  // Legacy history for undo/redo (will be deprecated)
  history: DrawingHistory[];
  historyIndex: number;

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

  // Command pattern actions
  executeCommand: (command: any) => void;
  undoCommand: () => void;
  redoCommand: () => void;
  canUndoCommand: () => boolean;
  canRedoCommand: () => boolean;
  getCommandHistory: () => Array<{ id: string; name: string; timestamp: Date }>;
  jumpToCommand: (index: number) => void;
  clearCommandHistory: () => void;

  // Legacy history actions (will be deprecated)
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

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
}

const MAX_HISTORY = 50;

const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  commandHistory: {
    entries: [],
    currentIndex: -1,
    canUndo: false,
    canRedo: false,
  },
  history: [],
  historyIndex: -1,
  drawingId: null,
  drawingName: "Untitled Drawing",
  lastSaved: null,
  isDirty: false,
  isGridVisible: true,
  snapToGrid: true,
  gridSize: 20,
  zoom: 1,
};

export const useDrawingStore = create<DrawingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

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
        const { edges } = get();
        const newEdge = {
          ...connection,
          id: `edge-${Date.now()}`,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        } as Edge;
        const updatedEdges = addEdge(newEdge, edges);
        set({ edges: updatedEdges, isDirty: true });
        get().pushHistory();
      },

      addNode: (node) => {
        const context = CommandManager.getCommandContext();
        const command = new AddNodeCommand(node, context);
        commandManager.execute(command);
        get().updateCommandHistory();
      },

      updateNode: (nodeId, updates) => {
        const { nodes } = get();
        const updatedNodes = nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        );
        set({ nodes: updatedNodes, isDirty: true });
      },

      deleteNode: (nodeId) => {
        const context = CommandManager.getCommandContext();
        const command = new DeleteNodeCommand(nodeId, context);
        commandManager.execute(command);
        get().updateCommandHistory();
      },

      deleteSelectedNode: () => {
        const { selectedNodeId } = get();
        if (selectedNodeId) {
          get().deleteNode(selectedNodeId);
        }
      },

      addEdge: (edge) => {
        const context = CommandManager.getCommandContext();
        const command = new AddEdgeCommand(edge, context);
        commandManager.execute(command);
        get().updateCommandHistory();
      },

      updateEdge: (edgeId, updates) => {
        const { edges } = get();
        const updatedEdges = edges.map((edge) =>
          edge.id === edgeId ? { ...edge, ...updates } : edge
        );
        set({ edges: updatedEdges, isDirty: true });
      },

      deleteEdge: (edgeId) => {
        const context = CommandManager.getCommandContext();
        const command = new DeleteEdgeCommand(edgeId, context);
        commandManager.execute(command);
        get().updateCommandHistory();
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

      pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: [...nodes], edges: [...edges] });

        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const prevState = history[historyIndex - 1];
          if (prevState) {
            set({
              nodes: prevState.nodes,
              edges: prevState.edges,
              historyIndex: historyIndex - 1,
              isDirty: true,
            });
          }
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const nextState = history[historyIndex + 1];
          if (nextState) {
            set({
              nodes: nextState.nodes,
              edges: nextState.edges,
              historyIndex: historyIndex + 1,
              isDirty: true,
            });
          }
        }
      },

      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      newDrawing: () => {
        set({
          ...initialState,
          drawingId: `drawing-${Date.now()}`,
          drawingName: "Untitled Drawing",
          history: [{ nodes: [], edges: [] }],
          historyIndex: 0,
        });
      },

      saveDrawing: () => {
        const { drawingId, drawingName, nodes, edges } = get();
        const id = drawingId || `drawing-${Date.now()}`;

        const drawingData = {
          id,
          name: drawingName,
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        };

        // Save to localStorage
        localStorage.setItem(`ergoplanner-drawing-${id}`, JSON.stringify(drawingData));

        // Update saved drawings list
        const savedDrawings = JSON.parse(localStorage.getItem("ergoplanner-drawings") || "[]");
        const existingIndex = savedDrawings.findIndex((d: any) => d.id === id);

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
            set({
              drawingId: data.id || `drawing-${Date.now()}`,
              drawingName: data.name || "Imported Drawing",
              nodes: data.nodes,
              edges: data.edges,
              lastSaved: data.savedAt ? new Date(data.savedAt) : null,
              isDirty: false,
              history: [{ nodes: data.nodes, edges: data.edges }],
              historyIndex: 0,
            });
            get().pushHistory();
            return;
          }
        } catch {
          // Not JSON, treat as drawing ID
        }

        // Try to load from localStorage using ID
        const savedData = localStorage.getItem(`ergoplanner-drawing-${drawingIdOrContent}`);
        if (savedData) {
          const data = JSON.parse(savedData);
          set({
            drawingId: data.id,
            drawingName: data.name,
            nodes: data.nodes,
            edges: data.edges,
            lastSaved: new Date(data.savedAt),
            isDirty: false,
            history: [{ nodes: data.nodes, edges: data.edges }],
            historyIndex: 0,
          });
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
          console.log(`Export as ${format} will be handled by the component`);
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
              history: [{ nodes: parsed.nodes, edges: parsed.edges }],
              historyIndex: 0,
            });
            get().pushHistory();
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

      // Command pattern implementation
      executeCommand: (command) => {
        commandManager.execute(command);
        get().updateCommandHistory();
      },

      undoCommand: () => {
        const success = commandManager.undo();
        if (success) {
          get().updateCommandHistory();
        }
        return success;
      },

      redoCommand: () => {
        const success = commandManager.redo();
        if (success) {
          get().updateCommandHistory();
        }
        return success;
      },

      canUndoCommand: () => commandManager.canUndo(),

      canRedoCommand: () => commandManager.canRedo(),

      getCommandHistory: () => {
        return commandManager.getHistory().map(entry => ({
          id: entry.id,
          name: entry.name,
          timestamp: entry.timestamp,
        }));
      },

      jumpToCommand: (index) => {
        commandManager.jumpToIndex(index);
        get().updateCommandHistory();
      },

      clearCommandHistory: () => {
        commandManager.clear();
        get().updateCommandHistory();
      },

      updateCommandHistory: () => {
        const history = commandManager.getHistory();
        set({
          commandHistory: {
            entries: history.map(h => ({
              id: h.id,
              name: h.name,
              timestamp: h.timestamp,
            })),
            currentIndex: commandManager.getCurrentIndex(),
            canUndo: commandManager.canUndo(),
            canRedo: commandManager.canRedo(),
          },
        });
      },
    }),
    {
      name: "drawing-store",
    }
  )
);
