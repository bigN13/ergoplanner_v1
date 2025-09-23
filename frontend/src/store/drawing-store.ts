import type { Connection } from "reactflow";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type {
  PIDNode,
  PIDEdge,
  DrawingState,
  Layer,
  SymbolType,
  ConnectionValidation,
} from "@/types/drawing";

interface DrawingStore extends DrawingState {
  // Node actions
  addNode: (node: PIDNode) => void;
  updateNode: (id: string, updates: Partial<PIDNode>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: PIDNode[]) => void;

  // Edge actions
  addEdge: (edge: PIDEdge) => void;
  updateEdge: (id: string, updates: Partial<PIDEdge>) => void;
  deleteEdge: (id: string) => void;
  setEdges: (edges: PIDEdge[]) => void;

  // Selection actions
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  clearSelection: () => void;

  // Drawing actions
  setCurrentTool: (tool: SymbolType | undefined) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;

  // Layer actions
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  reorderLayers: (layers: Layer[]) => void;

  // Viewport actions
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;

  // Validation
  validateConnection: (connection: Connection) => ConnectionValidation;

  // History (for undo/redo)
  history: DrawingState[];
  historyIndex: number;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Reset
  reset: () => void;
}

const initialState: DrawingState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,
  selectedEdgeId: null,
  isDrawing: false,
  currentTool: undefined,
  gridVisible: true,
  snapToGrid: true,
  layers: [
    {
      id: "default",
      name: "Default",
      visible: true,
      locked: false,
      opacity: 1,
      order: 0,
    },
  ],
  activeLayerId: "default",
};

export const useDrawingStore = create<DrawingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      history: [initialState],
      historyIndex: 0,

      // Node actions
      addNode: (node) => {
        set((state) => ({
          nodes: [...state.nodes, node],
        }));
        get().saveToHistory();
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)),
        }));
        get().saveToHistory();
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        }));
        get().saveToHistory();
      },

      setNodes: (nodes) => {
        set({ nodes });
        get().saveToHistory();
      },

      // Edge actions
      addEdge: (edge) => {
        set((state) => ({
          edges: [...state.edges, edge],
        }));
        get().saveToHistory();
      },

      updateEdge: (id, updates) => {
        set((state) => ({
          edges: state.edges.map((edge) => (edge.id === id ? { ...edge, ...updates } : edge)),
        }));
        get().saveToHistory();
      },

      deleteEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== id),
          selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
        }));
        get().saveToHistory();
      },

      setEdges: (edges) => {
        set({ edges });
        get().saveToHistory();
      },

      // Selection actions
      selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
      selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
      clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

      // Drawing actions
      setCurrentTool: (tool) => set({ currentTool: tool }),
      setIsDrawing: (isDrawing) => set({ isDrawing }),
      toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
      toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

      // Layer actions
      addLayer: (layer) =>
        set((state) => ({
          layers: [...state.layers, layer],
        })),

      updateLayer: (id, updates) =>
        set((state) => ({
          layers: state.layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)),
        })),

      deleteLayer: (id) => {
        const state = get();
        if (state.layers.length <= 1 || id === "default") return;

        set((state) => ({
          layers: state.layers.filter((layer) => layer.id !== id),
          activeLayerId: state.activeLayerId === id ? "default" : state.activeLayerId,
        }));
      },

      setActiveLayer: (id) => set({ activeLayerId: id }),

      reorderLayers: (layers) => set({ layers }),

      // Viewport actions
      setViewport: (viewport) => set({ viewport }),

      // Connection validation
      validateConnection: (connection) => {
        const { nodes } = get();
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) {
          return {
            isValid: false,
            message: "Invalid connection: Node not found",
          };
        }

        // Add custom validation logic based on symbol types
        // For example, prevent connecting incompatible symbol types
        const incompatiblePairs = [
          ["tank", "tank"],
          ["instrument", "instrument"],
        ];

        for (const [type1, type2] of incompatiblePairs) {
          if (
            (sourceNode.data.symbolType === type1 && targetNode.data.symbolType === type2) ||
            (sourceNode.data.symbolType === type2 && targetNode.data.symbolType === type1)
          ) {
            return {
              isValid: false,
              message: `Cannot connect ${type1} to ${type2}`,
              suggestedFix: "Use a pipe or valve between these components",
            };
          }
        }

        return { isValid: true };
      },

      // History management
      saveToHistory: () => {
        const currentState = get();
        const newHistoryState: DrawingState = {
          nodes: currentState.nodes,
          edges: currentState.edges,
          viewport: currentState.viewport,
          selectedNodeId: currentState.selectedNodeId,
          selectedEdgeId: currentState.selectedEdgeId,
          isDrawing: currentState.isDrawing,
          currentTool: currentState.currentTool,
          gridVisible: currentState.gridVisible,
          snapToGrid: currentState.snapToGrid,
          layers: currentState.layers,
          activeLayerId: currentState.activeLayerId,
        };

        set((state) => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newHistoryState);

          // Limit history size
          if (newHistory.length > 50) {
            newHistory.shift();
          }

          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const previousState = history[historyIndex - 1];
          if (previousState) {
            set({
              ...previousState,
              historyIndex: historyIndex - 1,
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
              ...nextState,
              historyIndex: historyIndex + 1,
            });
          }
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      // Reset
      reset: () => set({ ...initialState, history: [initialState], historyIndex: 0 }),
    }),
    {
      name: "drawing-store",
    }
  )
);
