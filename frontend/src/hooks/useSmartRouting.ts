import { useCallback, useMemo } from "react";
import { useReactFlow, type Node, type Edge, type Connection, type XYPosition } from "reactflow";
import { MarkerType } from "reactflow";

import { PathfindingService, type RoutingMode, type RouteResult } from "@/services/PathfindingService";
import { useDrawingStore } from "@/store/drawingStore";

export interface SmartRoutingOptions {
  routingMode: RoutingMode;
  gridSize: number;
  obstacleMargin: number;
  allowDiagonal: boolean;
  weight: number;
  autoRoute: boolean;
}

export interface SmartRoutingHook {
  findOptimalPath: (start: XYPosition, end: XYPosition) => RouteResult;
  createSmartConnection: (connection: Connection) => void;
  updateRoutingOptions: (options: Partial<SmartRoutingOptions>) => void;
  getRoutingOptions: () => SmartRoutingOptions;
  canAutoRoute: (sourceNodeId: string, targetNodeId: string) => boolean;
  getConnectionPoints: (nodeId: string) => XYPosition[];
}

/**
 * Hook for smart pipe routing with A* pathfinding
 */
export function useSmartRouting(
  initialOptions: Partial<SmartRoutingOptions> = {}
): SmartRoutingHook {
  const { getNodes, getEdges } = useReactFlow();
  const { addEdge } = useDrawingStore();

  // Initialize pathfinding service with options
  const pathfindingService = useMemo(() => {
    const defaultOptions = {
      routingMode: "orthogonal" as RoutingMode,
      gridSize: 20,
      obstacleMargin: 40,
      allowDiagonal: false,
      weight: 1.0,
      autoRoute: true,
      ...initialOptions
    };

    return new PathfindingService(defaultOptions);
  }, [initialOptions]);

  /**
   * Find optimal path between two points
   */
  const findOptimalPath = useCallback((start: XYPosition, end: XYPosition): RouteResult => {
    const nodes = getNodes();
    const edges = getEdges();

    // Filter out nodes that shouldn't be obstacles (e.g., connection points)
    const obstacles = nodes.filter(node =>
      node.type !== "connection" &&
      node.draggable !== false
    );

    return pathfindingService.findPath(start, end, obstacles, edges);
  }, [getNodes, getEdges, pathfindingService]);

  /**
   * Create a smart connection with automatic routing
   */
  const createSmartConnection = useCallback((connection: Connection) => {
    // Create a direct connection as fallback
    const createDirectConnection = (connection: Connection): void => {
      const newEdge: Edge = {
        id: `${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source as string,
        target: connection.target as string,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: "straight",
        data: {
          pipeClass: "standard",
          diameter: 100,
          material: "carbon-steel"
        },
        style: {
          stroke: "#2563eb",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#2563eb"
        }
      };

      addEdge(newEdge);
    };

    if (!connection.source || !connection.target) {
      console.warn("Invalid connection: missing source or target");
      return;
    }

    const nodes = getNodes();
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) {
      console.warn("Could not find source or target node");
      return;
    }

    // Calculate connection points
    const sourcePoint = getNodeConnectionPoint(sourceNode, connection.sourceHandle);
    const targetPoint = getNodeConnectionPoint(targetNode, connection.targetHandle);

    // Find optimal path
    const routeResult = findOptimalPath(sourcePoint, targetPoint);

    if (!routeResult.success) {
      console.warn("Failed to find route:", routeResult.message);
      // Fallback to direct connection
      createDirectConnection(connection);
      return;
    }

    // Create edge with smart routing path
    const newEdge: Edge = {
      id: `${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: "smoothstep", // Use smoothstep for better pipe-like appearance
      animated: false,
      data: {
        path: routeResult.path,
        distance: routeResult.distance,
        pipeClass: "standard",
        diameter: 100,
        material: "carbon-steel"
      },
      style: {
        stroke: "#2563eb",
        strokeWidth: 3,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#2563eb"
      }
    };

    addEdge(newEdge);
  }, [getNodes, findOptimalPath, addEdge]);

  /**
   * Update routing options
   */
  const updateRoutingOptions = useCallback((options: Partial<SmartRoutingOptions>) => {
    pathfindingService.updateOptions(options);
  }, [pathfindingService]);

  /**
   * Get current routing options
   */
  const getRoutingOptions = useCallback((): SmartRoutingOptions => {
    const pathOptions = pathfindingService.getOptions();
    return {
      ...pathOptions,
      autoRoute: true // This is managed by the hook
    };
  }, [pathfindingService]);

  /**
   * Check if two nodes can be auto-routed
   */
  const canAutoRoute = useCallback((sourceNodeId: string, targetNodeId: string): boolean => {
    const nodes = getNodes();
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);

    if (!sourceNode || !targetNode) return false;

    // Check if nodes are too close (direct connection better)
    const distance = Math.sqrt(
      Math.pow(targetNode.position.x - sourceNode.position.x, 2) +
      Math.pow(targetNode.position.y - sourceNode.position.y, 2)
    );

    const minDistanceForRouting = 100;
    return distance > minDistanceForRouting;
  }, [getNodes]);

  /**
   * Get available connection points for a node
   */
  const getConnectionPoints = useCallback((nodeId: string): XYPosition[] => {
    const nodes = getNodes();
    const node = nodes.find(n => n.id === nodeId);

    if (!node) return [];

    // Return standard connection points (top, right, bottom, left)
    const nodeWidth = node.width || 100;
    const nodeHeight = node.height || 60;

    return [
      { x: node.position.x + nodeWidth / 2, y: node.position.y }, // Top
      { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight / 2 }, // Right
      { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight }, // Bottom
      { x: node.position.x, y: node.position.y + nodeHeight / 2 } // Left
    ];
  }, [getNodes]);

  /**
   * Helper function to get node connection point
   */
  const getNodeConnectionPoint = (node: Node, handle?: string | null): XYPosition => {
    const nodeWidth = node.width || 100;
    const nodeHeight = node.height || 60;
    const centerX = node.position.x + nodeWidth / 2;
    const centerY = node.position.y + nodeHeight / 2;

    // If no specific handle, return center point
    if (!handle) {
      return { x: centerX, y: centerY };
    }

    // Map handle to connection point
    switch (handle) {
      case "top":
        return { x: centerX, y: node.position.y };
      case "right":
        return { x: node.position.x + nodeWidth, y: centerY };
      case "bottom":
        return { x: centerX, y: node.position.y + nodeHeight };
      case "left":
        return { x: node.position.x, y: centerY };
      default:
        return { x: centerX, y: centerY };
    }
  };


  return {
    findOptimalPath,
    createSmartConnection,
    updateRoutingOptions,
    getRoutingOptions,
    canAutoRoute,
    getConnectionPoints
  };
}