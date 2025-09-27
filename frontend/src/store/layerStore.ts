import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";

// Layer types
export type LayerType = "main" | "equipment" | "piping" | "instrumentation" | "annotation" | "custom";
export type VisibilityMode = "normal" | "solo" | "isolation" | "fade";

// Layer properties
export interface LayerProperties {
  lineStyle: "solid" | "dashed" | "dotted";
  lineWeight: number;
  color: string;
  fillColor?: string;
  opacity: number;
  strokeDasharray?: string;
  blendMode?: string;
  filter?: string;
}

// Layer metadata
export interface LayerMetadata {
  createdAt: Date;
  modifiedAt: Date;
  createdBy?: string;
  modifiedBy?: string;
  tags?: string[];
  description?: string;
  category?: string;
  standard?: string;  // e.g., "ISA-5.1", "ISO 14617"
}

// Layer template for quick creation
export interface LayerTemplate {
  id: string;
  name: string;
  type: LayerType;
  properties: LayerProperties;
  description?: string;
  icon?: string;
}

// Layer filter criteria
export interface LayerFilter {
  byType?: LayerType[];
  byName?: string;
  byProperty?: Partial<LayerProperties>;
  byTag?: string[];
  byVisibility?: boolean;
  byLocked?: boolean;
  byStandard?: string;
}

// Enhanced Layer interface with hierarchical support
export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  parentId?: string | null;
  childIds: string[];
  hierarchyPath: string;  // e.g., "main.equipment.pumps"
  hierarchyLevel: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
  properties: LayerProperties;
  metadata: LayerMetadata;
  elementIds: {
    nodes: string[];
    edges: string[];
  };
}

// Layer command for undo/redo
export interface LayerCommand {
  id: string;
  type: "add" | "delete" | "update" | "move" | "visibility" | "lock" | "reorder" | "batch";
  timestamp: Date;
  previousState?: Partial<Layer> | Layer[];
  newState?: Partial<Layer> | Layer[];
  layerId?: string;
  layerIds?: string[];
  description: string;
}

// Layer state interface
export interface LayerState {
  // Core layer data
  layers: Record<string, Layer>;
  layerOrder: string[];  // Array of layer IDs in display order
  activeLayerId: string;

  // Visibility modes
  visibilityMode: VisibilityMode;
  soloLayerId: string | null;
  isolatedLayerIds: string[];
  fadedLayerIds: string[];

  // Layer templates
  templates: LayerTemplate[];
  customTemplates: LayerTemplate[];

  // Filters
  activeFilters: LayerFilter;

  // History for undo/redo
  history: LayerCommand[];
  historyIndex: number;
  maxHistorySize: number;

  // UI preferences
  layerPanelCollapsed: boolean;
  showLayerThumbnails: boolean;
  autoSelectNewLayers: boolean;
  preserveLayerStateOnSave: boolean;

  // Optimistic update tracking
  pendingOperations: Map<string, LayerCommand>;
  failedOperations: Map<string, { command: LayerCommand; error: Error }>;
}

// Layer actions interface
export interface LayerActions {
  // Layer CRUD operations
  addLayer: (layer: Partial<Layer>, parentId?: string) => string;
  deleteLayer: (layerId: string, moveElementsTo?: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  duplicateLayer: (layerId: string, includeElements?: boolean) => string;

  // Hierarchical operations
  moveLayer: (layerId: string, newParentId: string | null, position?: number) => void;
  reorderLayers: (layerIds: string[]) => void;
  collapseLayer: (layerId: string) => void;
  expandLayer: (layerId: string) => void;

  // Visibility operations
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  toggleLayerVisibility: (layerId: string) => void;
  showOnlyLayer: (layerId: string) => void;  // Solo mode
  isolateLayers: (layerIds: string[]) => void;
  fadeLayers: (layerIds: string[], fadeOpacity?: number) => void;
  resetVisibility: () => void;

  // Lock operations
  setLayerLocked: (layerId: string, locked: boolean) => void;
  toggleLayerLock: (layerId: string) => void;
  lockAllLayers: () => void;
  unlockAllLayers: () => void;

  // Active layer operations
  setActiveLayer: (layerId: string) => void;

  // Element assignment
  assignElementsToLayer: (elementIds: string[], layerId: string, elementType: "node" | "edge") => void;
  moveElementsBetweenLayers: (elementIds: string[], fromLayerId: string, toLayerId: string, elementType: "node" | "edge") => void;

  // Filter operations
  setFilter: (filter: LayerFilter) => void;
  clearFilters: () => void;
  applyFilterPreset: (presetName: "all" | "visible" | "locked" | "equipment" | "piping") => void;

  // Template operations
  createTemplate: (layer: Layer, name: string) => void;
  applyTemplate: (templateId: string, layerName?: string) => string;
  deleteTemplate: (templateId: string) => void;

  // Batch operations
  batchUpdateLayers: (updates: Array<{ layerId: string; changes: Partial<Layer> }>) => void;
  mergeLayers: (sourceLayerIds: string[], targetLayerId: string) => void;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;

  // Selectors
  getLayer: (layerId: string) => Layer | undefined;
  getVisibleLayers: () => Layer[];
  getLayersByType: (type: LayerType) => Layer[];
  getLayerHierarchy: (rootId?: string) => Layer[];
  getLayerPath: (layerId: string) => Layer[];
  getLayerElements: (layerId: string) => { nodes: string[]; edges: string[] };
  getFilteredLayers: () => Layer[];

  // Optimistic updates
  applyOptimisticUpdate: (command: LayerCommand) => void;
  confirmOptimisticUpdate: (operationId: string) => void;
  rollbackOptimisticUpdate: (operationId: string, error?: Error) => void;

  // Persistence
  saveLayerState: () => void;
  loadLayerState: (state?: Partial<LayerState>) => void;
  exportLayers: () => string;
  importLayers: (data: string) => void;

  // UI preferences
  setLayerPanelCollapsed: (collapsed: boolean) => void;
  setShowLayerThumbnails: (show: boolean) => void;
  setAutoSelectNewLayers: (autoSelect: boolean) => void;
}

export type LayerStore = LayerState & LayerActions;

// Default layer templates
const defaultTemplates: LayerTemplate[] = [
  {
    id: "template-equipment",
    name: "Equipment Layer",
    type: "equipment",
    properties: {
      lineStyle: "solid",
      lineWeight: 2,
      color: "#2563eb",
      fillColor: "#dbeafe",
      opacity: 1,
    },
    description: "Standard equipment layer",
  },
  {
    id: "template-piping",
    name: "Piping Layer",
    type: "piping",
    properties: {
      lineStyle: "solid",
      lineWeight: 1.5,
      color: "#16a34a",
      fillColor: "#dcfce7",
      opacity: 1,
    },
    description: "Standard piping layer",
  },
  {
    id: "template-instrumentation",
    name: "Instrumentation Layer",
    type: "instrumentation",
    properties: {
      lineStyle: "dashed",
      lineWeight: 1,
      color: "#dc2626",
      fillColor: "#fee2e2",
      opacity: 1,
      strokeDasharray: "5,5",
    },
    description: "Standard instrumentation layer",
  },
  {
    id: "template-annotation",
    name: "Annotation Layer",
    type: "annotation",
    properties: {
      lineStyle: "dotted",
      lineWeight: 0.5,
      color: "#6b7280",
      opacity: 0.8,
      strokeDasharray: "1,3",
    },
    description: "Standard annotation layer",
  },
];

// Create default layers
const createDefaultLayers = (): Record<string, Layer> => {
  const now = new Date();
  return {
    main: {
      id: "main",
      name: "Main",
      type: "main",
      parentId: null,
      childIds: [],
      hierarchyPath: "main",
      hierarchyLevel: 0,
      visible: true,
      locked: false,
      opacity: 1,
      order: 0,
      properties: {
        lineStyle: "solid",
        lineWeight: 1,
        color: "#000000",
        opacity: 1,
      },
      metadata: {
        createdAt: now,
        modifiedAt: now,
        tags: ["default", "base"],
      },
      elementIds: {
        nodes: [],
        edges: [],
      },
    },
  };
};

// Initial state
const initialState: LayerState = {
  layers: createDefaultLayers(),
  layerOrder: ["main"],
  activeLayerId: "main",
  visibilityMode: "normal",
  soloLayerId: null,
  isolatedLayerIds: [],
  fadedLayerIds: [],
  templates: defaultTemplates,
  customTemplates: [],
  activeFilters: {},
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  layerPanelCollapsed: false,
  showLayerThumbnails: true,
  autoSelectNewLayers: true,
  preserveLayerStateOnSave: true,
  pendingOperations: new Map(),
  failedOperations: new Map(),
};

export const useLayerStore = create<LayerStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Layer CRUD operations
        addLayer: (layerData, parentId) => {
          const id = layerData.id || `layer-${uuidv4()}`;
          const now = new Date();
          const state = get();

          // Determine parent and hierarchy
          const parent = parentId ? state.layers[parentId] : null;
          const hierarchyPath = parent ? `${parent.hierarchyPath}.${id}` : id;
          const hierarchyLevel = parent ? parent.hierarchyLevel + 1 : 0;

          // Create new layer
          const newLayer: Layer = {
            id,
            name: layerData.name || `Layer ${Object.keys(state.layers).length}`,
            type: layerData.type || "custom",
            parentId: parentId || null,
            childIds: [],
            hierarchyPath,
            hierarchyLevel,
            visible: layerData.visible ?? true,
            locked: layerData.locked ?? false,
            opacity: layerData.opacity ?? 1,
            order: state.layerOrder.length,
            properties: layerData.properties || {
              lineStyle: "solid",
              lineWeight: 1,
              color: "#000000",
              opacity: 1,
            },
            metadata: layerData.metadata || {
              createdAt: now,
              modifiedAt: now,
            },
            elementIds: layerData.elementIds || {
              nodes: [],
              edges: [],
            },
          };

          // Add to history
          const command: LayerCommand = {
            id: `cmd-${Date.now()}`,
            type: "add",
            timestamp: now,
            layerId: id,
            newState: newLayer,
            description: `Add layer: ${newLayer.name}`,
          };

          set((draft) => {
            // Add layer
            draft.layers[id] = newLayer;
            draft.layerOrder.push(id);

            // Update parent's childIds if applicable
            if (parent && parentId) {
              draft.layers[parentId]!.childIds.push(id);
            }

            // Add to history
            draft.history = draft.history.slice(0, draft.historyIndex + 1);
            draft.history.push(command);
            draft.historyIndex++;

            // Limit history size
            if (draft.history.length > draft.maxHistorySize) {
              draft.history.shift();
              draft.historyIndex--;
            }

            // Auto-select if enabled
            if (draft.autoSelectNewLayers) {
              draft.activeLayerId = id;
            }
          });

          return id;
        },

        deleteLayer: (layerId, _moveElementsTo = "main") => {
          const state = get();
          const layer = state.layers[layerId];

          if (!layer || layerId === "main") {
            console.warn("Cannot delete main layer or non-existent layer");
            return;
          }

          const command: LayerCommand = {
            id: `cmd-${Date.now()}`,
            type: "delete",
            timestamp: new Date(),
            layerId,
            previousState: layer,
            description: `Delete layer: ${layer.name}`,
          };

          set((draft) => {
            // Move child layers to parent or main
            const parentId = layer.parentId || "main";
            layer.childIds.forEach((childId) => {
              if (draft.layers[childId]) {
                draft.layers[childId]!.parentId = parentId;
                draft.layers[parentId]?.childIds.push(childId);
              }
            });

            // Remove from parent's childIds
            if (layer.parentId && draft.layers[layer.parentId]) {
              const parent = draft.layers[layer.parentId]!;
              parent.childIds = parent.childIds.filter((id: string) => id !== layerId);
            }

            // Remove layer
            delete draft.layers[layerId];
            draft.layerOrder = draft.layerOrder.filter((id: string) => id !== layerId);

            // Update active layer if needed
            if (draft.activeLayerId === layerId) {
              draft.activeLayerId = "main";
            }

            // Add to history
            draft.history = draft.history.slice(0, draft.historyIndex + 1);
            draft.history.push(command);
            draft.historyIndex++;
          });
        },

        updateLayer: (layerId, updates) => {
          const state = get();
          const layer = state.layers[layerId];

          if (!layer) {
            console.warn(`Layer ${layerId} not found`);
            return;
          }

          const command: LayerCommand = {
            id: `cmd-${Date.now()}`,
            type: "update",
            timestamp: new Date(),
            layerId,
            previousState: { ...layer },
            newState: updates,
            description: `Update layer: ${layer.name}`,
          };

          set((draft) => {
            const targetLayer = draft.layers[layerId];
            if (!targetLayer) return;

            // Apply updates
            Object.assign(targetLayer, updates);
            targetLayer.metadata.modifiedAt = new Date();

            // Add to history
            draft.history = draft.history.slice(0, draft.historyIndex + 1);
            draft.history.push(command);
            draft.historyIndex++;
          });
        },

        duplicateLayer: (layerId, includeElements = false) => {
          const state = get();
          const sourceLayer = state.layers[layerId];

          if (!sourceLayer) {
            console.warn(`Layer ${layerId} not found`);
            return "";
          }

          const newId = `layer-${uuidv4()}`;
          const newLayer: Layer = {
            ...sourceLayer,
            id: newId,
            name: `${sourceLayer.name} (Copy)`,
            hierarchyPath: sourceLayer.hierarchyPath.replace(layerId, newId),
            childIds: [],  // Don't duplicate children
            elementIds: includeElements ? { ...sourceLayer.elementIds } : { nodes: [], edges: [] },
            metadata: {
              ...sourceLayer.metadata,
              createdAt: new Date(),
              modifiedAt: new Date(),
            },
          };

          return get().addLayer(newLayer, sourceLayer.parentId ?? undefined);
        },

        // Visibility operations
        setLayerVisibility: (layerId, visible) => {
          get().updateLayer(layerId, { visible });
        },

        toggleLayerVisibility: (layerId) => {
          const layer = get().layers[layerId];
          if (layer) {
            get().updateLayer(layerId, { visible: !layer.visible });
          }
        },

        showOnlyLayer: (layerId) => {
          set((draft) => {
            draft.visibilityMode = "solo";
            draft.soloLayerId = layerId;

            // Hide all layers except the solo layer
            Object.keys(draft.layers).forEach((id) => {
              draft.layers[id]!.visible = id === layerId;
            });
          });
        },

        isolateLayers: (layerIds) => {
          set((draft) => {
            draft.visibilityMode = "isolation";
            draft.isolatedLayerIds = layerIds;

            // Show only isolated layers
            Object.keys(draft.layers).forEach((id) => {
              draft.layers[id]!.visible = layerIds.includes(id);
            });
          });
        },

        fadeLayers: (layerIds, fadeOpacity = 0.3) => {
          set((draft) => {
            draft.visibilityMode = "fade";
            draft.fadedLayerIds = layerIds;

            // Fade specified layers
            layerIds.forEach((id) => {
              if (draft.layers[id]) {
                draft.layers[id]!.opacity = fadeOpacity;
              }
            });
          });
        },

        resetVisibility: () => {
          set((draft) => {
            draft.visibilityMode = "normal";
            draft.soloLayerId = null;
            draft.isolatedLayerIds = [];
            draft.fadedLayerIds = [];

            // Reset all layers to default visibility
            (Object.values(draft.layers) as Layer[]).forEach((layer: Layer) => {
              layer.visible = true;
              layer.opacity = layer.properties.opacity || 1;
            });
          });
        },

        // Lock operations
        setLayerLocked: (layerId, locked) => {
          get().updateLayer(layerId, { locked });
        },

        toggleLayerLock: (layerId) => {
          const layer = get().layers[layerId];
          if (layer) {
            get().updateLayer(layerId, { locked: !layer.locked });
          }
        },

        lockAllLayers: () => {
          get().batchUpdateLayers(
            Object.keys(get().layers).map((id) => ({
              layerId: id,
              changes: { locked: true },
            }))
          );
        },

        unlockAllLayers: () => {
          get().batchUpdateLayers(
            Object.keys(get().layers).map((id) => ({
              layerId: id,
              changes: { locked: false },
            }))
          );
        },

        // Active layer
        setActiveLayer: (layerId) => {
          const layer = get().layers[layerId];
          if (layer) {
            set({ activeLayerId: layerId });
          }
        },

        // Element assignment
        assignElementsToLayer: (elementIds, layerId, elementType) => {
          const layer = get().layers[layerId];
          if (!layer) return;

          set((draft) => {
            const targetLayer = draft.layers[layerId];
            if (!targetLayer) return;

            if (elementType === "node") {
              targetLayer.elementIds.nodes = [
                ...new Set([...targetLayer.elementIds.nodes, ...elementIds]),
              ];
            } else {
              targetLayer.elementIds.edges = [
                ...new Set([...targetLayer.elementIds.edges, ...elementIds]),
              ];
            }
          });
        },

        moveElementsBetweenLayers: (elementIds, fromLayerId, toLayerId, elementType) => {
          set((draft) => {
            const fromLayer = draft.layers[fromLayerId];
            const toLayer = draft.layers[toLayerId];

            if (!fromLayer || !toLayer) return;

            if (elementType === "node") {
              fromLayer.elementIds.nodes = fromLayer.elementIds.nodes.filter(
                (id: string) => !elementIds.includes(id)
              );
              toLayer.elementIds.nodes = [
                ...new Set([...toLayer.elementIds.nodes, ...elementIds]),
              ];
            } else {
              fromLayer.elementIds.edges = fromLayer.elementIds.edges.filter(
                (id: string) => !elementIds.includes(id)
              );
              toLayer.elementIds.edges = [
                ...new Set([...toLayer.elementIds.edges, ...elementIds]),
              ];
            }
          });
        },

        // Hierarchical operations
        moveLayer: (layerId, newParentId, position) => {
          const state = get();
          const layer = state.layers[layerId];

          if (!layer || layerId === "main") return;

          set((draft) => {
            const movingLayer = draft.layers[layerId];
            if (!movingLayer) return;

            // Remove from old parent
            if (movingLayer.parentId && draft.layers[movingLayer.parentId]) {
              const oldParent = draft.layers[movingLayer.parentId]!;
              oldParent.childIds = oldParent.childIds.filter((id: string) => id !== layerId);
            }

            // Add to new parent
            movingLayer.parentId = newParentId;
            if (newParentId && draft.layers[newParentId]) {
              const newParent = draft.layers[newParentId]!;
              if (position !== undefined && position >= 0 && position <= newParent.childIds.length) {
                newParent.childIds.splice(position, 0, layerId);
              } else {
                newParent.childIds.push(layerId);
              }
              movingLayer.hierarchyPath = `${newParent.hierarchyPath}.${layerId}`;
              movingLayer.hierarchyLevel = newParent.hierarchyLevel + 1;
            } else {
              movingLayer.hierarchyPath = layerId;
              movingLayer.hierarchyLevel = 0;
            }
          });
        },

        reorderLayers: (layerIds) => {
          set((draft) => {
            draft.layerOrder = layerIds;

            // Update order property
            layerIds.forEach((id, index) => {
              if (draft.layers[id]) {
                draft.layers[id]!.order = index;
              }
            });
          });
        },

        collapseLayer: (_layerId) => {
          // This would be handled by UI component state
          // This would be handled by UI component state
        },

        expandLayer: (_layerId) => {
          // This would be handled by UI component state
          // This would be handled by UI component state
        },

        // Filter operations
        setFilter: (filter) => {
          set({ activeFilters: filter });
        },

        clearFilters: () => {
          set({ activeFilters: {} });
        },

        applyFilterPreset: (presetName) => {
          const filters: Record<string, LayerFilter> = {
            all: {},
            visible: { byVisibility: true },
            locked: { byLocked: true },
            equipment: { byType: ["equipment"] },
            piping: { byType: ["piping"] },
          };

          get().setFilter(filters[presetName] || {});
        },

        // Template operations
        createTemplate: (layer, name) => {
          const template: LayerTemplate = {
            id: `template-${uuidv4()}`,
            name,
            type: layer.type,
            properties: { ...layer.properties },
            description: `Template based on ${layer.name}`,
          };

          set((draft) => {
            draft.customTemplates.push(template);
          });
        },

        applyTemplate: (templateId, layerName) => {
          const state = get();
          const template = [...state.templates, ...state.customTemplates].find(
            (t) => t.id === templateId
          );

          if (!template) {
            console.warn(`Template ${templateId} not found`);
            return "";
          }

          return get().addLayer({
            name: layerName || template.name,
            type: template.type,
            properties: { ...template.properties },
          });
        },

        deleteTemplate: (templateId) => {
          set((draft) => {
            draft.customTemplates = draft.customTemplates.filter((t: LayerTemplate) => t.id !== templateId);
          });
        },

        // Batch operations
        batchUpdateLayers: (updates) => {
          set((draft) => {
            updates.forEach(({ layerId, changes }: { layerId: string; changes: Partial<Layer> }) => {
              const layer = draft.layers[layerId];
              if (layer) {
                Object.assign(layer, changes);
                layer.metadata.modifiedAt = new Date();
              }
            });
          });
        },

        mergeLayers: (sourceLayerIds, targetLayerId) => {
          const state = get();
          const targetLayer = state.layers[targetLayerId];

          if (!targetLayer) return;

          set((draft) => {
            const target = draft.layers[targetLayerId];
            if (!target) return;

            sourceLayerIds.forEach((sourceId) => {
              const source = draft.layers[sourceId];
              if (!source || sourceId === targetLayerId) return;

              // Merge elements
              target.elementIds.nodes.push(...source.elementIds.nodes);
              target.elementIds.edges.push(...source.elementIds.edges);

              // Remove duplicates
              target.elementIds.nodes = [...new Set(target.elementIds.nodes)];
              target.elementIds.edges = [...new Set(target.elementIds.edges)];

              // Delete source layer
              delete draft.layers[sourceId];
              draft.layerOrder = draft.layerOrder.filter((id: string) => id !== sourceId);
            });
          });
        },

        // History operations
        undo: () => {
          const state = get();
          if (!state.canUndo()) return;

          const command = state.history[state.historyIndex];
          if (!command) return;

          set((draft) => {
            // Implement undo logic based on command type
            switch (command.type) {
              case "add":
                if (command.layerId && draft.layers[command.layerId]) {
                  delete draft.layers[command.layerId];
                  draft.layerOrder = draft.layerOrder.filter((id: string) => id !== command.layerId);
                }
                break;

              case "delete":
                if (command.layerId && command.previousState) {
                  draft.layers[command.layerId] = command.previousState as Layer;
                  draft.layerOrder.push(command.layerId);
                }
                break;

              case "update":
                if (command.layerId && command.previousState && draft.layers[command.layerId]) {
                  Object.assign(draft.layers[command.layerId]!, command.previousState);
                }
                break;
            }

            draft.historyIndex--;
          });
        },

        redo: () => {
          const state = get();
          if (!state.canRedo()) return;

          const command = state.history[state.historyIndex + 1];
          if (!command) return;

          set((draft) => {
            // Implement redo logic based on command type
            switch (command.type) {
              case "add":
                if (command.layerId && command.newState) {
                  draft.layers[command.layerId] = command.newState as Layer;
                  draft.layerOrder.push(command.layerId);
                }
                break;

              case "delete":
                if (command.layerId) {
                  delete draft.layers[command.layerId];
                  draft.layerOrder = draft.layerOrder.filter((id: string) => id !== command.layerId);
                }
                break;

              case "update":
                if (command.layerId && command.newState && draft.layers[command.layerId]) {
                  Object.assign(draft.layers[command.layerId]!, command.newState);
                }
                break;
            }

            draft.historyIndex++;
          });
        },

        canUndo: () => {
          const state = get();
          return state.historyIndex >= 0;
        },

        canRedo: () => {
          const state = get();
          return state.historyIndex < state.history.length - 1;
        },

        clearHistory: () => {
          set({
            history: [],
            historyIndex: -1,
          });
        },

        // Selectors
        getLayer: (layerId) => {
          return get().layers[layerId];
        },

        getVisibleLayers: () => {
          return Object.values(get().layers).filter((layer) => layer.visible);
        },

        getLayersByType: (type) => {
          return Object.values(get().layers).filter((layer) => layer.type === type);
        },

        getLayerHierarchy: (rootId) => {
          const state = get();
          const root = rootId ? state.layers[rootId] : null;
          // const startLevel = root ? root.hierarchyLevel : 0;

          return Object.values(state.layers)
            .filter((layer: Layer) => {
              if (rootId) {
                return layer.hierarchyPath.startsWith(root!.hierarchyPath);
              }
              return layer.hierarchyLevel === 0;
            })
            .sort((a, b) => a.order - b.order);
        },

        getLayerPath: (layerId) => {
          const state = get();
          const layer = state.layers[layerId];
          if (!layer) return [];

          const path: Layer[] = [];
          const parts = layer.hierarchyPath.split(".");

          parts.forEach((_, index) => {
            const pathId = parts.slice(0, index + 1).join(".");
            const pathLayer = Object.values(state.layers).find(
              (l) => l.hierarchyPath === pathId
            );
            if (pathLayer) {
              path.push(pathLayer);
            }
          });

          return path;
        },

        getLayerElements: (layerId) => {
          const layer = get().layers[layerId];
          return layer ? layer.elementIds : { nodes: [], edges: [] };
        },

        getFilteredLayers: () => {
          const state = get();
          const filters = state.activeFilters;
          let layers = Object.values(state.layers);

          // Apply filters
          if (filters.byType && filters.byType.length > 0) {
            layers = layers.filter((l: Layer) => filters.byType!.includes(l.type));
          }

          if (filters.byName) {
            layers = layers.filter((l: Layer) =>
              l.name.toLowerCase().includes(filters.byName!.toLowerCase())
            );
          }

          if (filters.byVisibility !== undefined) {
            layers = layers.filter((l: Layer) => l.visible === filters.byVisibility);
          }

          if (filters.byLocked !== undefined) {
            layers = layers.filter((l: Layer) => l.locked === filters.byLocked);
          }

          if (filters.byTag && filters.byTag.length > 0) {
            layers = layers.filter((l: Layer) =>
              filters.byTag!.some((tag) => l.metadata.tags?.includes(tag))
            );
          }

          if (filters.byStandard) {
            layers = layers.filter((l: Layer) => l.metadata.standard === filters.byStandard);
          }

          return layers.sort((a, b) => a.order - b.order);
        },

        // Optimistic updates
        applyOptimisticUpdate: (command) => {
          const operationId = `op-${Date.now()}`;

          set((draft) => {
            // Store pending operation
            draft.pendingOperations.set(operationId, command);

            // Apply the update immediately
            switch (command.type) {
              case "update":
                if (command.layerId && command.newState && draft.layers[command.layerId]) {
                  Object.assign(draft.layers[command.layerId]!, command.newState);
                }
                break;
              // Add more cases as needed
            }
          });

          // Simulate API call (would be replaced with actual API call)
          setTimeout(() => {
            const success = Math.random() > 0.1;  // 90% success rate for demo
            if (success) {
              get().confirmOptimisticUpdate(operationId);
            } else {
              get().rollbackOptimisticUpdate(operationId, new Error("API call failed"));
            }
          }, 1000);
        },

        confirmOptimisticUpdate: (operationId) => {
          set((draft) => {
            draft.pendingOperations.delete(operationId);
          });
        },

        rollbackOptimisticUpdate: (operationId, error) => {
          const state = get();
          const command = state.pendingOperations.get(operationId);

          if (!command) return;

          set((draft) => {
            // Store failed operation
            if (error) {
              draft.failedOperations.set(operationId, { command, error });
            }

            // Rollback the update
            switch (command.type) {
              case "update":
                if (command.layerId && command.previousState && draft.layers[command.layerId]) {
                  Object.assign(draft.layers[command.layerId]!, command.previousState);
                }
                break;
              // Add more cases as needed
            }

            draft.pendingOperations.delete(operationId);
          });
        },

        // Persistence
        saveLayerState: () => {
          const state = get();
          const data = {
            layers: state.layers,
            layerOrder: state.layerOrder,
            activeLayerId: state.activeLayerId,
            templates: state.customTemplates,
          };

          localStorage.setItem("ergoplanner-layer-state", JSON.stringify(data));
        },

        loadLayerState: (state) => {
          if (state) {
            set(state);
          } else {
            const saved = localStorage.getItem("ergoplanner-layer-state");
            if (saved) {
              try {
                const data = JSON.parse(saved);
                set((draft) => {
                  if (data.layers) draft.layers = data.layers;
                  if (data.layerOrder) draft.layerOrder = data.layerOrder;
                  if (data.activeLayerId) draft.activeLayerId = data.activeLayerId;
                  if (data.templates) draft.customTemplates = data.templates;
                });
              } catch (error) {
                console.error("Failed to load layer state:", error);
              }
            }
          }
        },

        exportLayers: () => {
          const state = get();
          return JSON.stringify({
            layers: state.layers,
            layerOrder: state.layerOrder,
            templates: state.customTemplates,
            version: "1.0.0",
            exportedAt: new Date().toISOString(),
          }, null, 2);
        },

        importLayers: (data) => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.layers && parsed.layerOrder) {
              set((draft) => {
                draft.layers = parsed.layers;
                draft.layerOrder = parsed.layerOrder;
                if (parsed.templates) {
                  draft.customTemplates = parsed.templates;
                }
              });
            }
          } catch (error) {
            console.error("Failed to import layers:", error);
          }
        },

        // UI preferences
        setLayerPanelCollapsed: (collapsed) => {
          set({ layerPanelCollapsed: collapsed });
        },

        setShowLayerThumbnails: (show) => {
          set({ showLayerThumbnails: show });
        },

        setAutoSelectNewLayers: (autoSelect) => {
          set({ autoSelectNewLayers: autoSelect });
        },
      })),
      {
        name: "layer-store",
        partialize: (state) => ({
          layers: state.layers,
          layerOrder: state.layerOrder,
          activeLayerId: state.activeLayerId,
          customTemplates: state.customTemplates,
          layerPanelCollapsed: state.layerPanelCollapsed,
          showLayerThumbnails: state.showLayerThumbnails,
          autoSelectNewLayers: state.autoSelectNewLayers,
          preserveLayerStateOnSave: state.preserveLayerStateOnSave,
        }),
      }
    ),
    {
      name: "LayerStore",
    }
  )
);

// Selector hooks for performance optimization
export const useActiveLayer = () =>
  useLayerStore((state) => state.layers[state.activeLayerId]);

export const useVisibleLayers = () =>
  useLayerStore((state) => state.getVisibleLayers());

export const useLayerById = (layerId: string) =>
  useLayerStore((state) => state.layers[layerId]);

export const useLayerFilters = () =>
  useLayerStore((state) => state.activeFilters);

export const useLayerHistory = () =>
  useLayerStore((state) => ({
    canUndo: state.canUndo(),
    canRedo: state.canRedo(),
    historyLength: state.history.length,
    currentIndex: state.historyIndex,
  }));

export default useLayerStore;