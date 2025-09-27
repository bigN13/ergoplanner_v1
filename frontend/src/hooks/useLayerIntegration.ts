import { useEffect, useCallback } from "react";
import type { Node, Edge } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";
import { useLayerStore } from "@/store/layerStore";
import type { LayerType } from "@/store/layerStore";

/**
 * Hook to integrate layer store with drawing store
 * Provides synchronized layer management between both stores
 */
export function useLayerIntegration() {
  const drawingStore = useDrawingStore();
  const layerStore = useLayerStore();

  // Sync layer assignment when nodes/edges are added
  useEffect(() => {
    const syncElementLayers = () => {
      const { nodes, edges } = drawingStore;
      const { layers } = layerStore;

      // Build element-to-layer mapping
      const nodeLayerMap = new Map<string, string>();
      const edgeLayerMap = new Map<string, string>();

      // First, clear all element assignments
      Object.values(layers).forEach((layer) => {
        layer.elementIds.nodes = [];
        layer.elementIds.edges = [];
      });

      // Assign nodes to layers
      nodes.forEach((node) => {
        const layerId = (node.data?.layer as string) || "main";
        if (layers[layerId]) {
          const layer = layers[layerId];
          if (layer) {
            layer.elementIds.nodes.push(node.id);
            nodeLayerMap.set(node.id, layerId);
          }
        }
      });

      // Assign edges to layers
      edges.forEach((edge) => {
        const layerId = (edge.data?.layer as string) || "main";
        if (layers[layerId]) {
          const layer = layers[layerId];
          if (layer) {
            layer.elementIds.edges.push(edge.id);
            edgeLayerMap.set(edge.id, layerId);
          }
        }
      });
    };

    syncElementLayers();
  }, [drawingStore.nodes, drawingStore.edges, layerStore.layers]);

  // Create layer from selection
  const createLayerFromSelection = useCallback(
    (name: string, type: LayerType = "custom") => {
      const selectedNodes = drawingStore.nodes.filter(
        (node) => node.selected || node.id === drawingStore.selectedNodeId
      );
      const selectedEdges = drawingStore.edges.filter(
        (edge) => edge.selected || edge.id === drawingStore.selectedEdgeId
      );

      if (selectedNodes.length === 0 && selectedEdges.length === 0) {
        console.warn("No elements selected");
        return null;
      }

      // Create new layer
      const layerId = layerStore.addLayer({
        name,
        type,
        elementIds: {
          nodes: selectedNodes.map((n) => n.id),
          edges: selectedEdges.map((e) => e.id),
        },
      });

      // Update elements with new layer assignment
      const updatedNodes = drawingStore.nodes.map((node) => {
        if (selectedNodes.find((n) => n.id === node.id)) {
          return { ...node, data: { ...node.data, layer: layerId } };
        }
        return node;
      });

      const updatedEdges = drawingStore.edges.map((edge) => {
        if (selectedEdges.find((e) => e.id === edge.id)) {
          return { ...edge, data: { ...edge.data, layer: layerId } };
        }
        return edge;
      });

      drawingStore.setNodes(updatedNodes);
      drawingStore.setEdges(updatedEdges);

      return layerId;
    },
    [drawingStore, layerStore]
  );

  // Move selected elements to layer
  const moveSelectionToLayer = useCallback(
    (targetLayerId: string) => {
      const selectedNodes = drawingStore.nodes.filter(
        (node) => node.selected || node.id === drawingStore.selectedNodeId
      );
      const selectedEdges = drawingStore.edges.filter(
        (edge) => edge.selected || edge.id === drawingStore.selectedEdgeId
      );

      if (!layerStore.layers[targetLayerId]) {
        console.warn(`Layer ${targetLayerId} not found`);
        return;
      }

      // Update nodes
      const updatedNodes = drawingStore.nodes.map((node) => {
        if (selectedNodes.find((n) => n.id === node.id)) {
          const currentLayerId = (node.data?.layer as string) || "main";

          // Update layer store
          if (currentLayerId !== targetLayerId) {
            layerStore.moveElementsBetweenLayers(
              [node.id],
              currentLayerId,
              targetLayerId,
              "node"
            );
          }

          return { ...node, data: { ...node.data, layer: targetLayerId } };
        }
        return node;
      });

      // Update edges
      const updatedEdges = drawingStore.edges.map((edge) => {
        if (selectedEdges.find((e) => e.id === edge.id)) {
          const currentLayerId = (edge.data?.layer as string) || "main";

          // Update layer store
          if (currentLayerId !== targetLayerId) {
            layerStore.moveElementsBetweenLayers(
              [edge.id],
              currentLayerId,
              targetLayerId,
              "edge"
            );
          }

          return { ...edge, data: { ...edge.data, layer: targetLayerId } };
        }
        return edge;
      });

      drawingStore.setNodes(updatedNodes);
      drawingStore.setEdges(updatedEdges);
    },
    [drawingStore, layerStore]
  );

  // Get filtered nodes based on layer visibility
  const getFilteredNodes = useCallback((): Node[] => {
    const visibleLayers = layerStore.getVisibleLayers();
    const visibleLayerIds = new Set(visibleLayers.map((l) => l.id));

    return drawingStore.nodes.filter((node) => {
      const nodeLayer = (node.data?.layer as string) || "main";
      return visibleLayerIds.has(nodeLayer);
    });
  }, [drawingStore.nodes, layerStore]);

  // Get filtered edges based on layer visibility
  const getFilteredEdges = useCallback((): Edge[] => {
    const visibleLayers = layerStore.getVisibleLayers();
    const visibleLayerIds = new Set(visibleLayers.map((l) => l.id));

    return drawingStore.edges.filter((edge) => {
      const edgeLayer = (edge.data?.layer as string) || "main";
      return visibleLayerIds.has(edgeLayer);
    });
  }, [drawingStore.edges, layerStore]);

  // Select all elements in a layer
  const selectLayerElements = useCallback(
    (layerId: string) => {
      const layer = layerStore.layers[layerId];
      if (!layer) return;

      const updatedNodes = drawingStore.nodes.map((node) =>
        layer.elementIds.nodes.includes(node.id)
          ? { ...node, selected: true }
          : { ...node, selected: false }
      );

      const updatedEdges = drawingStore.edges.map((edge) =>
        layer.elementIds.edges.includes(edge.id)
          ? { ...edge, selected: true }
          : { ...edge, selected: false }
      );

      drawingStore.setNodes(updatedNodes);
      drawingStore.setEdges(updatedEdges);
    },
    [drawingStore, layerStore]
  );

  // Delete layer and its elements
  const deleteLayerWithElements = useCallback(
    (layerId: string) => {
      const layer = layerStore.layers[layerId];
      if (!layer) return;

      // Remove elements from drawing
      const remainingNodes = drawingStore.nodes.filter(
        (node) => !layer.elementIds.nodes.includes(node.id)
      );
      const remainingEdges = drawingStore.edges.filter(
        (edge) => !layer.elementIds.edges.includes(edge.id)
      );

      drawingStore.setNodes(remainingNodes);
      drawingStore.setEdges(remainingEdges);

      // Delete layer
      layerStore.deleteLayer(layerId);
    },
    [drawingStore, layerStore]
  );

  // Merge selected layers
  const mergeSelectedLayers = useCallback(
    (sourceLayerIds: string[], targetLayerId: string) => {
      // Get all elements from source layers
      const nodesToMove: string[] = [];
      const edgesToMove: string[] = [];

      sourceLayerIds.forEach((layerId) => {
        const layer = layerStore.layers[layerId];
        if (layer) {
          nodesToMove.push(...layer.elementIds.nodes);
          edgesToMove.push(...layer.elementIds.edges);
        }
      });

      // Update elements with target layer
      const updatedNodes = drawingStore.nodes.map((node) =>
        nodesToMove.includes(node.id)
          ? { ...node, data: { ...node.data, layer: targetLayerId } }
          : node
      );

      const updatedEdges = drawingStore.edges.map((edge) =>
        edgesToMove.includes(edge.id)
          ? { ...edge, data: { ...edge.data, layer: targetLayerId } }
          : edge
      );

      drawingStore.setNodes(updatedNodes);
      drawingStore.setEdges(updatedEdges);

      // Merge layers in layer store
      layerStore.mergeLayers(sourceLayerIds, targetLayerId);
    },
    [drawingStore, layerStore]
  );

  // Apply layer style to elements
  const applyLayerStyle = useCallback(
    (layerId: string) => {
      const layer = layerStore.layers[layerId];
      if (!layer) return;

      const { properties } = layer;

      // Apply style to nodes
      const updatedNodes = drawingStore.nodes.map((node) => {
        if (layer.elementIds.nodes.includes(node.id)) {
          return {
            ...node,
            style: {
              ...node.style,
              opacity: properties.opacity,
              stroke: properties.color,
              strokeWidth: properties.lineWeight,
              strokeDasharray: properties.strokeDasharray,
            },
          };
        }
        return node;
      });

      // Apply style to edges
      const updatedEdges = drawingStore.edges.map((edge) => {
        if (layer.elementIds.edges.includes(edge.id)) {
          return {
            ...edge,
            style: {
              ...edge.style,
              opacity: properties.opacity,
              stroke: properties.color,
              strokeWidth: properties.lineWeight,
              strokeDasharray: properties.strokeDasharray,
            },
          };
        }
        return edge;
      });

      drawingStore.setNodes(updatedNodes);
      drawingStore.setEdges(updatedEdges);
    },
    [drawingStore, layerStore]
  );

  // Duplicate layer with its elements
  const duplicateLayerWithElements = useCallback(
    (layerId: string, offset = { x: 50, y: 50 }) => {
      const layer = layerStore.layers[layerId];
      if (!layer) return null;

      // Duplicate layer first
      const newLayerId = layerStore.duplicateLayer(layerId, false);

      // Duplicate elements
      const nodeIdMap = new Map<string, string>();
      const newNodes: Node[] = [];

      // Duplicate nodes
      drawingStore.nodes.forEach((node) => {
        if (layer.elementIds.nodes.includes(node.id)) {
          const newNodeId = `${node.id}-copy-${Date.now()}`;
          nodeIdMap.set(node.id, newNodeId);

          newNodes.push({
            ...node,
            id: newNodeId,
            position: {
              x: node.position.x + offset.x,
              y: node.position.y + offset.y,
            },
            data: { ...node.data, layer: newLayerId },
            selected: false,
          });
        }
      });

      // Duplicate edges
      const newEdges: Edge[] = [];
      drawingStore.edges.forEach((edge) => {
        if (layer.elementIds.edges.includes(edge.id)) {
          const newSource = nodeIdMap.get(edge.source) || edge.source;
          const newTarget = nodeIdMap.get(edge.target) || edge.target;

          // Only duplicate edge if both endpoints exist in the new layer
          if (nodeIdMap.has(edge.source) && nodeIdMap.has(edge.target)) {
            newEdges.push({
              ...edge,
              id: `${edge.id}-copy-${Date.now()}`,
              source: newSource,
              target: newTarget,
              data: { ...edge.data, layer: newLayerId },
              selected: false,
            });
          }
        }
      });

      // Add new elements to drawing
      drawingStore.setNodes([...drawingStore.nodes, ...newNodes]);
      drawingStore.setEdges([...drawingStore.edges, ...newEdges]);

      // Update layer store with new element IDs
      layerStore.updateLayer(newLayerId, {
        elementIds: {
          nodes: newNodes.map((n) => n.id),
          edges: newEdges.map((e) => e.id),
        },
      });

      return newLayerId;
    },
    [drawingStore, layerStore]
  );

  return {
    // Layer operations
    createLayerFromSelection,
    moveSelectionToLayer,
    selectLayerElements,
    deleteLayerWithElements,
    mergeSelectedLayers,
    duplicateLayerWithElements,
    applyLayerStyle,

    // Filtered elements
    getFilteredNodes,
    getFilteredEdges,

    // Store references
    layers: layerStore.layers,
    activeLayerId: layerStore.activeLayerId,
    visibleLayers: layerStore.getVisibleLayers(),

    // Layer actions
    setActiveLayer: layerStore.setActiveLayer,
    toggleLayerVisibility: layerStore.toggleLayerVisibility,
    setLayerLocked: layerStore.setLayerLocked,
    showOnlyLayer: layerStore.showOnlyLayer,
    resetVisibility: layerStore.resetVisibility,

    // History
    undo: layerStore.undo,
    redo: layerStore.redo,
    canUndo: layerStore.canUndo(),
    canRedo: layerStore.canRedo(),
  };
}

export default useLayerIntegration;