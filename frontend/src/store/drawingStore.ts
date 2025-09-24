import type { Node, Edge, Connection, NodeChange, EdgeChange } from "reactflow";
import { MarkerType, applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface DrawingHistory {
  nodes: Node[];
  edges: Edge[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
  color?: string;
}

export interface DrawingState {
  // Core state
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // History for undo/redo
  history: DrawingHistory[];
  historyIndex: number;

  // Drawing metadata
  drawingId: string | null;
  drawingName: string;
  lastSaved: Date | null;
  isDirty: boolean;

  // Layer management
  layers: Layer[];
  activeLayerId: string;
  layerVisibility: Record<string, boolean>;

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

  // History actions
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

  // Layer actions
  addLayer: (name?: string) => void;
  deleteLayer: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  setActiveLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  assignNodeToLayer: (nodeId: string, layerId: string) => void;
  getNodeLayer: (nodeId: string) => string | undefined;

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

const defaultLayer: Layer = {
  id: "layer-default",
  name: "Default Layer",
  visible: true,
  locked: false,
  opacity: 1,
  order: 0,
  color: "#3b82f6",
};

const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  history: [],
  historyIndex: -1,
  drawingId: null,
  drawingName: "Untitled Drawing",
  lastSaved: null,
  isDirty: false,
  layers: [defaultLayer],
  activeLayerId: defaultLayer.id,
  layerVisibility: { [defaultLayer.id]: true },
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
        const { nodes, activeLayerId } = get();
        // Add layer info to node data
        const nodeWithLayer = {
          ...node,
          data: {
            ...node.data,
            layerId: activeLayerId,
          },
        };
        set({ nodes: [...nodes, nodeWithLayer], isDirty: true });
        get().pushHistory();
      },

      updateNode: (nodeId, updates) => {
        const { nodes } = get();
        const updatedNodes = nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        );
        set({ nodes: updatedNodes, isDirty: true });
      },

      deleteNode: (nodeId) => {
        const { nodes, edges } = get();
        const filteredNodes = nodes.filter((n) => n.id !== nodeId);
        const filteredEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        set({
          nodes: filteredNodes,
          edges: filteredEdges,
          selectedNodeId: null,
          isDirty: true,
        });
        get().pushHistory();
      },

      deleteSelectedNode: () => {
        const { selectedNodeId } = get();
        if (selectedNodeId) {
          get().deleteNode(selectedNodeId);
        }
      },

      addEdge: (edge) => {
        const { edges } = get();
        set({ edges: [...edges, edge], isDirty: true });
        get().pushHistory();
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
        get().pushHistory();
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

      // Layer management actions
      addLayer: (name) => {
        const { layers } = get();
        const newLayer: Layer = {
          id: `layer-${Date.now()}`,
          name: name || `Layer ${layers.length + 1}`,
          visible: true,
          locked: false,
          opacity: 1,
          order: layers.length,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        };
        set({
          layers: [...layers, newLayer],
          layerVisibility: { ...get().layerVisibility, [newLayer.id]: true },
          isDirty: true,
        });
      },

      deleteLayer: (layerId) => {
        const { layers, nodes, activeLayerId } = get();
        if (layers.length <= 1 || layerId === "layer-default") return;

        const filteredLayers = layers.filter((l) => l.id !== layerId);
        const layerVisibility = { ...get().layerVisibility };
        delete layerVisibility[layerId];

        // Move nodes from deleted layer to default layer
        const updatedNodes = nodes.map((node) => {
          if (node.data?.layerId === layerId) {
            return {
              ...node,
              data: { ...node.data, layerId: "layer-default" },
            };
          }
          return node;
        });

        set({
          layers: filteredLayers,
          layerVisibility,
          nodes: updatedNodes,
          activeLayerId: activeLayerId === layerId ? "layer-default" : activeLayerId,
          isDirty: true,
        });
      },

      renameLayer: (layerId, name) => {
        const { layers } = get();
        const updatedLayers = layers.map((layer) =>
          layer.id === layerId ? { ...layer, name } : layer
        );
        set({ layers: updatedLayers, isDirty: true });
      },

      setActiveLayer: (layerId) => {
        set({ activeLayerId: layerId });
      },

      toggleLayerVisibility: (layerId) => {
        const { layers, layerVisibility, nodes } = get();
        const newVisibility = !layerVisibility[layerId];

        // Update nodes visibility based on layer visibility
        const updatedNodes = nodes.map((node) => {
          if (node.data?.layerId === layerId) {
            return {
              ...node,
              hidden: !newVisibility,
            };
          }
          return node;
        });

        set({
          layerVisibility: { ...layerVisibility, [layerId]: newVisibility },
          layers: layers.map((l) =>
            l.id === layerId ? { ...l, visible: newVisibility } : l
          ),
          nodes: updatedNodes,
          isDirty: true,
        });
      },

      toggleLayerLock: (layerId) => {
        const { layers } = get();
        const updatedLayers = layers.map((layer) =>
          layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
        );
        set({ layers: updatedLayers, isDirty: true });
      },

      setLayerOpacity: (layerId, opacity) => {
        const { layers, nodes } = get();
        const updatedLayers = layers.map((layer) =>
          layer.id === layerId ? { ...layer, opacity } : layer
        );

        // Update node styles with layer opacity
        const updatedNodes = nodes.map((node) => {
          if (node.data?.layerId === layerId) {
            return {
              ...node,
              style: {
                ...node.style,
                opacity,
              },
            };
          }
          return node;
        });

        set({ layers: updatedLayers, nodes: updatedNodes, isDirty: true });
      },

      reorderLayers: (fromIndex, toIndex) => {
        const { layers } = get();
        const reordered = [...layers];
        const [moved] = reordered.splice(fromIndex, 1);
        if (moved) {
          reordered.splice(toIndex, 0, moved);
          const updatedLayers = reordered.map((layer, index) => ({
            ...layer,
            order: index,
          }));
          set({ layers: updatedLayers, isDirty: true });
        }
      },

      assignNodeToLayer: (nodeId, layerId) => {
        const { nodes } = get();
        const updatedNodes = nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, layerId } }
            : node
        );
        set({ nodes: updatedNodes, isDirty: true });
      },

      getNodeLayer: (nodeId) => {
        const { nodes } = get();
        const node = nodes.find((n) => n.id === nodeId);
        return node?.data?.layerId;
      },
    }),
    {
      name: "drawing-store",
    }
  )
);
