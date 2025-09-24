import type { Connection, NodeChange, EdgeChange } from "reactflow";
import { applyNodeChanges, applyEdgeChanges, addEdge, MarkerType } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type {
  PIDNode,
  PIDEdge,
  Layer,
  SymbolType,
  ConnectionValidation,
  PIDNodeData,
} from "../types/drawing";

export interface HistoryItem {
  id: string;
  type: "add" | "delete" | "modify" | "move" | "connect" | "disconnect" | "property" | "batch";
  action: string;
  timestamp: Date;
  user?: string;
  details: Record<string, unknown>;
  state: {
    nodes: PIDNode[];
    edges: PIDEdge[];
  };
}

export interface Clipboard {
  nodes: PIDNode[];
  edges: PIDEdge[];
}

export interface DrawingPreferences {
  gridSize: number;
  gridColor: string;
  snapDistance: number;
  autoSave: boolean;
  autoSaveInterval: number;
  showRulers: boolean;
  showGuides: boolean;
  defaultNodeColor: string;
  defaultEdgeColor: string;
  defaultEdgeType: "straight" | "smoothstep" | "step" | "bezier";
}

interface EnhancedDrawingStore {
  // Core state from DrawingState
  nodes: PIDNode[];
  edges: PIDEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDrawing: boolean;
  currentTool: SymbolType | undefined;
  gridVisible: boolean;
  snapToGrid: boolean;
  layers: Layer[];
  activeLayerId: string;

  // Enhanced Node actions
  addNode: (node: PIDNode) => void;
  addNodes: (nodes: PIDNode[]) => void;
  updateNode: (id: string, updates: Partial<PIDNode>) => void;
  updateNodes: (updates: Array<{ id: string; updates: Partial<PIDNode> }>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  setNodes: (nodes: PIDNode[]) => void;
  duplicateNodes: (ids: string[]) => void;
  alignNodes: (
    ids: string[],
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void;
  distributeNodes: (ids: string[], direction: "horizontal" | "vertical") => void;
  rotateNodes: (ids: string[], angle: number) => void;
  flipNodes: (ids: string[], direction: "horizontal" | "vertical") => void;

  // Enhanced Edge actions
  addEdge: (edge: PIDEdge) => void;
  addEdges: (edges: PIDEdge[]) => void;
  updateEdge: (id: string, updates: Partial<PIDEdge>) => void;
  updateEdges: (updates: Array<{ id: string; updates: Partial<PIDEdge> }>) => void;
  deleteEdge: (id: string) => void;
  deleteEdges: (ids: string[]) => void;
  setEdges: (edges: PIDEdge[]) => void;
  reconnectEdge: (edgeId: string, newSource?: string, newTarget?: string) => void;

  // Enhanced Selection
  selectedElements: { nodes: string[]; edges: string[] };
  selectNode: (id: string | null) => void;
  selectNodes: (ids: string[]) => void;
  selectEdge: (id: string | null) => void;
  selectEdges: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelectedElements: () => void;
  groupSelectedElements: () => void;
  ungroupSelectedElements: () => void;

  // Drawing Tools
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  setCurrentTool: (tool: SymbolType | undefined) => void;
  setIsDrawing: (isDrawing: boolean) => void;

  // Grid & Snap
  gridEnabled: boolean;
  gridSize: number;
  snapDistance: number;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setSnapDistance: (distance: number) => void;

  // Layers
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  reorderLayers: (layers: Layer[]) => void;
  mergeLayers: (sourceId: string, targetId: string) => void;

  // Clipboard operations
  clipboard: Clipboard;
  copy: () => void;
  cut: () => void;
  paste: (position?: { x: number; y: number }) => void;

  // History management
  history: HistoryItem[];
  currentHistoryIndex: number;
  maxHistorySize: number;
  pushHistory: (action: string, type?: HistoryItem["type"]) => void;
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ReactFlow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Utility functions
  getNodeById: (id: string) => PIDNode | undefined;
  getEdgeById: (id: string) => PIDEdge | undefined;
  getNodesInLayer: (layerId: string) => PIDNode[];
  validateConnection: (source: string, target: string) => ConnectionValidation;

  // Preferences
  preferences: DrawingPreferences;
  updatePreferences: (updates: Partial<DrawingPreferences>) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: DrawingPreferences = {
  gridSize: 20,
  gridColor: "#e0e0e0",
  snapDistance: 10,
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  showRulers: false,
  showGuides: false,
  defaultNodeColor: "#ffffff",
  defaultEdgeColor: "#333333",
  defaultEdgeType: "smoothstep",
};

const DEFAULT_LAYER: Layer = {
  id: "default",
  name: "Default Layer",
  visible: true,
  locked: false,
  opacity: 1,
  order: 0,
};

const MAX_HISTORY_SIZE = 50;

export const useEnhancedDrawingStore = create<EnhancedDrawingStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        selectedNodeId: null,
        selectedEdgeId: null,
        selectedElements: { nodes: [], edges: [] },
        isDrawing: false,
        currentTool: undefined,
        activeTool: null,
        gridVisible: true,
        gridEnabled: true,
        snapToGrid: true,
        gridSize: 20,
        snapDistance: 10,
        layers: [DEFAULT_LAYER],
        activeLayerId: "default",
        clipboard: { nodes: [], edges: [] },
        history: [],
        currentHistoryIndex: -1,
        maxHistorySize: MAX_HISTORY_SIZE,
        preferences: DEFAULT_PREFERENCES,

        // Node operations
        addNode: (node) => {
          const { nodes, activeLayerId } = get();
          const newNode = {
            ...node,
            data: {
              ...node.data,
              layer: activeLayerId,
            },
          };
          set({ nodes: [...nodes, newNode] });
          get().pushHistory("Add node", "add");
        },

        addNodes: (newNodes) => {
          const { nodes, activeLayerId } = get();
          const nodesWithLayer = newNodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              layer: activeLayerId,
            },
          }));
          set({ nodes: [...nodes, ...nodesWithLayer] });
          get().pushHistory(`Add ${newNodes.length} nodes`, "batch");
        },

        updateNode: (id, updates) => {
          const { nodes } = get();
          const updatedNodes = nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
          );
          set({ nodes: updatedNodes });
        },

        updateNodes: (updates) => {
          const { nodes } = get();
          const updateMap = new Map(updates.map((u) => [u.id, u.updates]));
          const updatedNodes = nodes.map((node) => {
            const nodeUpdates = updateMap.get(node.id);
            return nodeUpdates ? { ...node, ...nodeUpdates } : node;
          });
          set({ nodes: updatedNodes });
          get().pushHistory(`Update ${updates.length} nodes`, "batch");
        },

        deleteNode: (id) => {
          const { nodes, edges, selectedElements } = get();
          const filteredNodes = nodes.filter((n) => n.id !== id);
          const filteredEdges = edges.filter((e) => e.source !== id && e.target !== id);
          const filteredSelectedNodes = selectedElements.nodes.filter((nId) => nId !== id);

          set({
            nodes: filteredNodes,
            edges: filteredEdges,
            selectedElements: { ...selectedElements, nodes: filteredSelectedNodes },
            selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
          });
          get().pushHistory("Delete node", "delete");
        },

        deleteNodes: (ids) => {
          const { nodes, edges, selectedElements } = get();
          const idsSet = new Set(ids);
          const filteredNodes = nodes.filter((n) => !idsSet.has(n.id));
          const filteredEdges = edges.filter((e) => !idsSet.has(e.source) && !idsSet.has(e.target));
          const filteredSelectedNodes = selectedElements.nodes.filter((nId) => !idsSet.has(nId));

          set({
            nodes: filteredNodes,
            edges: filteredEdges,
            selectedElements: { ...selectedElements, nodes: filteredSelectedNodes },
          });
          get().pushHistory(`Delete ${ids.length} nodes`, "batch");
        },

        setNodes: (nodes) => {
          set({ nodes });
        },

        duplicateNodes: (ids) => {
          const { nodes, edges } = get();
          const idMap = new Map<string, string>();
          const nodesToDuplicate = nodes.filter((n) => ids.includes(n.id));

          const duplicatedNodes = nodesToDuplicate.map((node) => {
            const newId = uuidv4();
            idMap.set(node.id, newId);
            return {
              ...node,
              id: newId,
              position: {
                x: node.position.x + 50,
                y: node.position.y + 50,
              },
              selected: false,
            };
          });

          // Duplicate edges between selected nodes
          const edgesToDuplicate = edges.filter(
            (e) => ids.includes(e.source) && ids.includes(e.target)
          );

          const duplicatedEdges = edgesToDuplicate.map((edge) => ({
            ...edge,
            id: uuidv4(),
            source: idMap.get(edge.source) || edge.source,
            target: idMap.get(edge.target) || edge.target,
          }));

          set({
            nodes: [...nodes, ...duplicatedNodes],
            edges: [...edges, ...duplicatedEdges],
          });
          get().pushHistory(`Duplicate ${ids.length} nodes`, "batch");
        },

        alignNodes: (ids, alignment) => {
          const { nodes } = get();
          const selectedNodes = nodes.filter((n) => ids.includes(n.id));

          if (selectedNodes.length === 0) return;

          let alignPosition = 0;

          switch (alignment) {
            case "left":
              alignPosition = Math.min(...selectedNodes.map((n) => n.position.x));
              break;
            case "center":
              const minX = Math.min(...selectedNodes.map((n) => n.position.x));
              const maxX = Math.max(...selectedNodes.map((n) => n.position.x + (n.width || 150)));
              alignPosition = (minX + maxX) / 2;
              break;
            case "right":
              alignPosition = Math.max(
                ...selectedNodes.map((n) => n.position.x + (n.width || 150))
              );
              break;
            case "top":
              alignPosition = Math.min(...selectedNodes.map((n) => n.position.y));
              break;
            case "middle":
              const minY = Math.min(...selectedNodes.map((n) => n.position.y));
              const maxY = Math.max(...selectedNodes.map((n) => n.position.y + (n.height || 50)));
              alignPosition = (minY + maxY) / 2;
              break;
            case "bottom":
              alignPosition = Math.max(
                ...selectedNodes.map((n) => n.position.y + (n.height || 50))
              );
              break;
          }

          const updatedNodes = nodes.map((node) => {
            if (!ids.includes(node.id)) return node;

            const newPosition = { ...node.position };
            const nodeWidth = node.width || 150;
            const nodeHeight = node.height || 50;

            switch (alignment) {
              case "left":
                newPosition.x = alignPosition;
                break;
              case "center":
                newPosition.x = alignPosition - nodeWidth / 2;
                break;
              case "right":
                newPosition.x = alignPosition - nodeWidth;
                break;
              case "top":
                newPosition.y = alignPosition;
                break;
              case "middle":
                newPosition.y = alignPosition - nodeHeight / 2;
                break;
              case "bottom":
                newPosition.y = alignPosition - nodeHeight;
                break;
            }

            return { ...node, position: newPosition };
          });

          set({ nodes: updatedNodes });
          get().pushHistory(`Align ${ids.length} nodes ${alignment}`, "move");
        },

        distributeNodes: (ids, direction) => {
          const { nodes } = get();
          const selectedNodes = nodes.filter((n) => ids.includes(n.id));

          if (selectedNodes.length < 3) return;

          const sortedNodes = [...selectedNodes].sort((a, b) =>
            direction === "horizontal" ? a.position.x - b.position.x : a.position.y - b.position.y
          );

          const firstNode = sortedNodes[0];
          const lastNode = sortedNodes[sortedNodes.length - 1];

          const totalDistance =
            direction === "horizontal"
              ? lastNode.position.x - firstNode.position.x
              : lastNode.position.y - firstNode.position.y;

          const spacing = totalDistance / (sortedNodes.length - 1);

          const updatedNodes = nodes.map((node) => {
            const nodeIndex = sortedNodes.findIndex((n) => n.id === node.id);
            if (nodeIndex === -1 || nodeIndex === 0 || nodeIndex === sortedNodes.length - 1) {
              return node;
            }

            const newPosition = { ...node.position };

            if (direction === "horizontal") {
              newPosition.x = firstNode.position.x + spacing * nodeIndex;
            } else {
              newPosition.y = firstNode.position.y + spacing * nodeIndex;
            }

            return { ...node, position: newPosition };
          });

          set({ nodes: updatedNodes });
          get().pushHistory(`Distribute ${ids.length} nodes ${direction}`, "move");
        },

        rotateNodes: (ids, angle) => {
          const { nodes } = get();
          const updatedNodes = nodes.map((node) => {
            if (!ids.includes(node.id)) return node;

            const currentRotation = (node.data as PIDNodeData).rotation || 0;
            const newRotation = (currentRotation + angle) % 360;

            return {
              ...node,
              data: {
                ...node.data,
                rotation: newRotation,
              } as PIDNodeData,
            };
          });

          set({ nodes: updatedNodes });
          get().pushHistory(`Rotate ${ids.length} nodes by ${angle}°`, "modify");
        },

        flipNodes: (ids, direction) => {
          const { nodes } = get();
          const selectedNodes = nodes.filter((n) => ids.includes(n.id));

          if (selectedNodes.length === 0) return;

          // Calculate center point for flipping
          const centerX =
            selectedNodes.reduce((sum, n) => sum + n.position.x, 0) / selectedNodes.length;
          const centerY =
            selectedNodes.reduce((sum, n) => sum + n.position.y, 0) / selectedNodes.length;

          const updatedNodes = nodes.map((node) => {
            if (!ids.includes(node.id)) return node;

            const newPosition = { ...node.position };

            if (direction === "horizontal") {
              newPosition.x = 2 * centerX - node.position.x - (node.width || 150);
            } else {
              newPosition.y = 2 * centerY - node.position.y - (node.height || 50);
            }

            return { ...node, position: newPosition };
          });

          set({ nodes: updatedNodes });
          get().pushHistory(`Flip ${ids.length} nodes ${direction}`, "move");
        },

        // Edge operations
        addEdge: (edge) => {
          const { edges } = get();
          set({ edges: [...edges, edge] });
          get().pushHistory("Add edge", "connect");
        },

        addEdges: (newEdges) => {
          const { edges } = get();
          set({ edges: [...edges, ...newEdges] });
          get().pushHistory(`Add ${newEdges.length} edges`, "batch");
        },

        updateEdge: (id, updates) => {
          const { edges } = get();
          const updatedEdges = edges.map((edge) =>
            edge.id === id ? { ...edge, ...updates } : edge
          );
          set({ edges: updatedEdges });
        },

        updateEdges: (updates) => {
          const { edges } = get();
          const updateMap = new Map(updates.map((u) => [u.id, u.updates]));
          const updatedEdges = edges.map((edge) => {
            const edgeUpdates = updateMap.get(edge.id);
            return edgeUpdates ? { ...edge, ...edgeUpdates } : edge;
          });
          set({ edges: updatedEdges });
          get().pushHistory(`Update ${updates.length} edges`, "batch");
        },

        deleteEdge: (id) => {
          const { edges, selectedElements } = get();
          const filteredEdges = edges.filter((e) => e.id !== id);
          const filteredSelectedEdges = selectedElements.edges.filter((eId) => eId !== id);

          set({
            edges: filteredEdges,
            selectedElements: { ...selectedElements, edges: filteredSelectedEdges },
            selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId,
          });
          get().pushHistory("Delete edge", "disconnect");
        },

        deleteEdges: (ids) => {
          const { edges, selectedElements } = get();
          const idsSet = new Set(ids);
          const filteredEdges = edges.filter((e) => !idsSet.has(e.id));
          const filteredSelectedEdges = selectedElements.edges.filter((eId) => !idsSet.has(eId));

          set({
            edges: filteredEdges,
            selectedElements: { ...selectedElements, edges: filteredSelectedEdges },
          });
          get().pushHistory(`Delete ${ids.length} edges`, "batch");
        },

        setEdges: (edges) => {
          set({ edges });
        },

        reconnectEdge: (edgeId, newSource, newTarget) => {
          const { edges } = get();
          const updatedEdges = edges.map((edge) => {
            if (edge.id !== edgeId) return edge;

            return {
              ...edge,
              source: newSource || edge.source,
              target: newTarget || edge.target,
            };
          });

          set({ edges: updatedEdges });
          get().pushHistory("Reconnect edge", "connect");
        },

        // Selection management
        selectNode: (id) => {
          if (id === null) {
            set({
              selectedNodeId: null,
              selectedElements: { nodes: [], edges: get().selectedElements.edges },
            });
          } else {
            set({
              selectedNodeId: id,
              selectedEdgeId: null,
              selectedElements: { nodes: [id], edges: [] },
            });
          }
        },

        selectNodes: (ids) => {
          set({
            selectedElements: { nodes: ids, edges: [] },
            selectedNodeId: ids.length === 1 ? ids[0] : null,
            selectedEdgeId: null,
          });
        },

        selectEdge: (id) => {
          if (id === null) {
            set({
              selectedEdgeId: null,
              selectedElements: { nodes: get().selectedElements.nodes, edges: [] },
            });
          } else {
            set({
              selectedEdgeId: id,
              selectedNodeId: null,
              selectedElements: { nodes: [], edges: [id] },
            });
          }
        },

        selectEdges: (ids) => {
          set({
            selectedElements: { nodes: [], edges: ids },
            selectedEdgeId: ids.length === 1 ? ids[0] : null,
            selectedNodeId: null,
          });
        },

        selectAll: () => {
          const { nodes, edges } = get();
          set({
            selectedElements: {
              nodes: nodes.map((n) => n.id),
              edges: edges.map((e) => e.id),
            },
          });
        },

        clearSelection: () => {
          set({
            selectedNodeId: null,
            selectedEdgeId: null,
            selectedElements: { nodes: [], edges: [] },
          });
        },

        deleteSelectedElements: () => {
          const { selectedElements } = get();
          if (selectedElements.nodes.length > 0) {
            get().deleteNodes(selectedElements.nodes);
          }
          if (selectedElements.edges.length > 0) {
            get().deleteEdges(selectedElements.edges);
          }
          get().clearSelection();
        },

        groupSelectedElements: () => {
          const { selectedElements, nodes } = get();
          if (selectedElements.nodes.length < 2) return;

          const selectedNodes = nodes.filter((n) => selectedElements.nodes.includes(n.id));
          const bounds = {
            minX: Math.min(...selectedNodes.map((n) => n.position.x)),
            minY: Math.min(...selectedNodes.map((n) => n.position.y)),
            maxX: Math.max(...selectedNodes.map((n) => n.position.x + (n.width || 150))),
            maxY: Math.max(...selectedNodes.map((n) => n.position.y + (n.height || 50))),
          };

          const groupNode: PIDNode = {
            id: uuidv4(),
            type: "group",
            position: { x: bounds.minX - 20, y: bounds.minY - 20 },
            data: {
              label: "Group",
              symbolType: "group" as SymbolType,
              layer: get().activeLayerId,
            },
            style: {
              width: bounds.maxX - bounds.minX + 40,
              height: bounds.maxY - bounds.minY + 40,
              backgroundColor: "rgba(200, 200, 200, 0.1)",
              border: "2px dashed #888",
            },
          };

          get().addNode(groupNode);
          get().pushHistory(`Group ${selectedElements.nodes.length} elements`, "batch");
        },

        ungroupSelectedElements: () => {
          const { selectedElements, nodes } = get();
          const groupNodes = nodes.filter(
            (n) => selectedElements.nodes.includes(n.id) && n.type === "group"
          );

          if (groupNodes.length > 0) {
            get().deleteNodes(groupNodes.map((n) => n.id));
            get().pushHistory(`Ungroup ${groupNodes.length} groups`, "batch");
          }
        },

        // Drawing tools
        setActiveTool: (tool) => {
          set({ activeTool: tool });
        },

        setCurrentTool: (tool) => {
          set({ currentTool: tool, isDrawing: !!tool });
        },

        setIsDrawing: (isDrawing) => {
          set({ isDrawing });
        },

        // Grid and snap settings
        toggleGrid: () => {
          set((state) => ({ gridVisible: !state.gridVisible }));
        },

        toggleSnapToGrid: () => {
          set((state) => ({ snapToGrid: !state.snapToGrid }));
        },

        setGridSize: (size) => {
          set({ gridSize: size });
          get().updatePreferences({ gridSize: size });
        },

        setSnapDistance: (distance) => {
          set({ snapDistance: distance });
          get().updatePreferences({ snapDistance: distance });
        },

        // Layer management
        addLayer: (layer) => {
          const { layers } = get();
          const newLayer = {
            ...layer,
            order: layers.length,
          };
          set({ layers: [...layers, newLayer] });
        },

        updateLayer: (id, updates) => {
          const { layers } = get();
          const updatedLayers = layers.map((layer) =>
            layer.id === id ? { ...layer, ...updates } : layer
          );
          set({ layers: updatedLayers });
        },

        deleteLayer: (id) => {
          const { layers, nodes, activeLayerId } = get();

          // Can't delete the last layer or default layer
          if (layers.length === 1 || id === "default") return;

          // Move nodes from deleted layer to default layer
          const updatedNodes = nodes.map((node) => {
            const nodeData = node.data as PIDNodeData;
            if (nodeData.layer === parseInt(id)) {
              return {
                ...node,
                data: {
                  ...nodeData,
                  layer: 0,
                },
              };
            }
            return node;
          });

          const filteredLayers = layers.filter((l) => l.id !== id);

          set({
            layers: filteredLayers,
            nodes: updatedNodes,
            activeLayerId: activeLayerId === id ? "default" : activeLayerId,
          });
        },

        setActiveLayer: (id) => {
          set({ activeLayerId: id });
        },

        reorderLayers: (reorderedLayers) => {
          set({ layers: reorderedLayers });
        },

        mergeLayers: (sourceId, targetId) => {
          const { nodes } = get();

          // Move all nodes from source layer to target layer
          const updatedNodes = nodes.map((node) => {
            const nodeData = node.data as PIDNodeData;
            if (nodeData.layer === parseInt(sourceId)) {
              return {
                ...node,
                data: {
                  ...nodeData,
                  layer: parseInt(targetId) || 0,
                },
              };
            }
            return node;
          });

          set({ nodes: updatedNodes });
          get().deleteLayer(sourceId);
        },

        // Clipboard operations
        copy: () => {
          const { selectedElements, nodes, edges } = get();
          const selectedNodes = nodes.filter((n) => selectedElements.nodes.includes(n.id));
          const selectedEdges = edges.filter(
            (e) =>
              selectedElements.nodes.includes(e.source) && selectedElements.nodes.includes(e.target)
          );

          set({
            clipboard: {
              nodes: selectedNodes,
              edges: selectedEdges,
            },
          });
        },

        cut: () => {
          get().copy();
          get().deleteSelectedElements();
        },

        paste: (position) => {
          const { clipboard, nodes, edges } = get();

          if (clipboard.nodes.length === 0) return;

          const idMap = new Map<string, string>();
          const offset = position || { x: 20, y: 20 };

          // Calculate center of clipboard content
          const clipboardCenter = {
            x: clipboard.nodes.reduce((sum, n) => sum + n.position.x, 0) / clipboard.nodes.length,
            y: clipboard.nodes.reduce((sum, n) => sum + n.position.y, 0) / clipboard.nodes.length,
          };

          // Paste nodes with new IDs
          const pastedNodes = clipboard.nodes.map((node) => {
            const newId = uuidv4();
            idMap.set(node.id, newId);

            return {
              ...node,
              id: newId,
              position: position
                ? {
                    x: position.x + (node.position.x - clipboardCenter.x),
                    y: position.y + (node.position.y - clipboardCenter.y),
                  }
                : {
                    x: node.position.x + offset.x,
                    y: node.position.y + offset.y,
                  },
              selected: true,
            };
          });

          // Paste edges with updated references
          const pastedEdges = clipboard.edges.map((edge) => ({
            ...edge,
            id: uuidv4(),
            source: idMap.get(edge.source) || edge.source,
            target: idMap.get(edge.target) || edge.target,
          }));

          set({
            nodes: [...nodes, ...pastedNodes],
            edges: [...edges, ...pastedEdges],
            selectedElements: {
              nodes: pastedNodes.map((n) => n.id),
              edges: pastedEdges.map((e) => e.id),
            },
          });

          get().pushHistory(`Paste ${pastedNodes.length} elements`, "batch");
        },

        // History management
        pushHistory: (action, type = "modify") => {
          const { nodes, edges, history, currentHistoryIndex, maxHistorySize } = get();

          // Remove any history after current index (for redo functionality)
          const newHistory = history.slice(0, currentHistoryIndex + 1);

          // Add new history item
          newHistory.push({
            id: uuidv4(),
            type,
            action,
            timestamp: new Date(),
            details: { action },
            state: {
              nodes: [...nodes],
              edges: [...edges],
            },
          });

          // Limit history size
          if (newHistory.length > maxHistorySize) {
            newHistory.shift();
          }

          set({
            history: newHistory,
            currentHistoryIndex: newHistory.length - 1,
          });
        },

        undo: () => {
          const { history, currentHistoryIndex } = get();

          if (currentHistoryIndex > 0) {
            const previousState = history[currentHistoryIndex - 1];
            set({
              nodes: previousState?.state?.nodes || [],
              edges: previousState?.state?.edges || [],
              currentHistoryIndex: currentHistoryIndex - 1,
            });
            return true;
          }
          return false;
        },

        redo: () => {
          const { history, currentHistoryIndex } = get();

          if (currentHistoryIndex < history.length - 1) {
            const nextState = history[currentHistoryIndex + 1];
            set({
              nodes: nextState?.state?.nodes || [],
              edges: nextState?.state?.edges || [],
              currentHistoryIndex: currentHistoryIndex + 1,
            });
            return true;
          }
          return false;
        },

        clearHistory: () => {
          set({
            history: [],
            currentHistoryIndex: -1,
          });
        },

        canUndo: () => {
          const { currentHistoryIndex } = get();
          return currentHistoryIndex > 0;
        },

        canRedo: () => {
          const { history, currentHistoryIndex } = get();
          return currentHistoryIndex < history.length - 1;
        },

        // ReactFlow handlers
        onNodesChange: (changes) => {
          const { nodes } = get();
          const updatedNodes = applyNodeChanges(changes, nodes);
          set({ nodes: updatedNodes });
        },

        onEdgesChange: (changes) => {
          const { edges } = get();
          const updatedEdges = applyEdgeChanges(changes, edges);
          set({ edges: updatedEdges });
        },

        onConnect: (connection) => {
          const { edges } = get();
          const { source, target } = connection;

          if (!source || !target) return;

          const validation = get().validateConnection(source, target);
          if (!validation.isValid) {
            console.warn(validation.message);
            return;
          }

          const newEdge: PIDEdge = {
            ...connection,
            id: uuidv4(),
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            data: {
              label: "",
              flowDirection: "forward",
            },
          } as PIDEdge;

          const updatedEdges = addEdge(newEdge, edges);
          set({ edges: updatedEdges });
          get().pushHistory("Connect nodes", "connect");
        },

        // Utility functions
        getNodeById: (id) => {
          const { nodes } = get();
          return nodes.find((n) => n.id === id);
        },

        getEdgeById: (id) => {
          const { edges } = get();
          return edges.find((e) => e.id === id);
        },

        getNodesInLayer: (layerId) => {
          const { nodes } = get();
          return nodes.filter((n) => (n.data as PIDNodeData).layer === layerId);
        },

        validateConnection: (source, target) => {
          // Basic validation - prevent self-connections
          if (source === target) {
            return {
              isValid: false,
              message: "Cannot connect a node to itself",
            };
          }

          // Check if connection already exists
          const { edges } = get();
          const existingConnection = edges.find(
            (e) =>
              (e.source === source && e.target === target) ||
              (e.source === target && e.target === source)
          );

          if (existingConnection) {
            return {
              isValid: false,
              message: "Connection already exists between these nodes",
            };
          }

          // Add more validation rules based on symbol types
          const sourceNode = get().getNodeById(source);
          const targetNode = get().getNodeById(target);

          if (sourceNode && targetNode) {
            const sourceType = (sourceNode.data as PIDNodeData).symbolType;
            const targetType = (targetNode.data as PIDNodeData).symbolType;

            // Example: Instruments can't connect directly to tanks
            if (sourceType === "instrument" && targetType === "tank") {
              return {
                isValid: false,
                message: "Instruments cannot connect directly to tanks",
                suggestedFix: "Add a valve or pipe between the instrument and tank",
              };
            }
          }

          return { isValid: true };
        },

        // Preferences
        updatePreferences: (updates) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              ...updates,
            },
          }));
        },

        resetPreferences: () => {
          set({
            preferences: DEFAULT_PREFERENCES,
            gridSize: DEFAULT_PREFERENCES.gridSize,
            snapDistance: DEFAULT_PREFERENCES.snapDistance,
          });
        },
      }),
      {
        name: "enhanced-drawing-store",
        partialize: (state) => ({
          preferences: state.preferences,
          layers: state.layers,
          activeLayerId: state.activeLayerId,
        }),
      }
    ),
    {
      name: "enhanced-drawing-store",
    }
  )
);
