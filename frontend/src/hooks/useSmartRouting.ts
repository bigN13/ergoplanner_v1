import { useCallback, useMemo, useState } from "react";
import { useReactFlow, type Node, type Edge, type Connection, type XYPosition } from "reactflow";
import { MarkerType } from "reactflow";

import { useEnhancedDrawingStore as useDrawingStore } from "@/store/enhanced-drawing-store";

export type RoutingMode = "orthogonal" | "straight" | "smooth" | "auto";

export interface RouteResult {
  path: XYPosition[];
  segments: Array<{ start: XYPosition; end: XYPosition }>;
  length: number;
  isValid: boolean;
  success: boolean;
  distance?: number;
  message?: string;
}

export interface SmartRoutingOptions {
  routingMode?: RoutingMode;
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
  const { getNodes } = useReactFlow();
  const { addEdge } = useDrawingStore();

  const [options, setOptions] = useState<SmartRoutingOptions>({
    routingMode: "orthogonal",
    gridSize: 20,
    obstacleMargin: 40,
    allowDiagonal: false,
    weight: 1.0,
    autoRoute: true,
    ...initialOptions,
  });

  /**
   * Simple pathfinding implementation
   */
  const findPath = useCallback(
    (start: XYPosition, end: XYPosition, _obstacles: Node[]): RouteResult => {
      // For now, return a simple orthogonal path
      const path: XYPosition[] = [];

      if (options.routingMode === "straight") {
        path.push(start, end);
      } else if (options.routingMode === "orthogonal") {
        // Simple orthogonal routing
        path.push(start);

        // Determine if horizontal or vertical first based on positions
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);

        if (dx > dy) {
          // Move horizontally first
          path.push({ x: end.x, y: start.y });
        } else {
          // Move vertically first
          path.push({ x: start.x, y: end.y });
        }

        path.push(end);
      } else {
        // Smooth or auto mode - just use straight for now
        path.push(start, end);
      }

      const segments: Array<{ start: XYPosition; end: XYPosition }> = [];
      for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];
        if (start && end) {
          segments.push({ start, end });
        }
      }

      const length = path.reduce((total, point, index) => {
        if (index === 0) return 0;
        const prev = path[index - 1];
        if (!prev) return total;
        return (
          total +
          Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2))
        );
      }, 0);

      return {
        path,
        segments,
        length,
        isValid: true,
        success: true,
        distance: length,
      };
    },
    [options.routingMode]
  );

  /**
   * Find optimal path between two points
   */
  const findOptimalPath = useCallback(
    (start: XYPosition, end: XYPosition): RouteResult => {
      const nodes = getNodes();

      // Filter out nodes that shouldn't be obstacles (e.g., connection points)
      const obstacles = nodes.filter(
        (node) => node.type !== "connection" && node.draggable !== false
      );

      return findPath(start, end, obstacles);
    },
    [getNodes, findPath]
  );

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

    // Parse handle position (e.g., "target-top", "source-right")
    const position = handle.toLowerCase();

    if (position.includes("top")) {
      return { x: centerX, y: node.position.y };
    } else if (position.includes("bottom")) {
      return { x: centerX, y: node.position.y + nodeHeight };
    } else if (position.includes("left")) {
      return { x: node.position.x, y: centerY };
    } else if (position.includes("right")) {
      return { x: node.position.x + nodeWidth, y: centerY };
    }

    // Default to center if no matching position
    return { x: centerX, y: centerY };
  };

  /**
   * Create a smart connection with automatic routing
   */
  const createSmartConnection = useCallback(
    (connection: Connection) => {
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
            material: "carbon-steel",
          },
          style: {
            stroke: "#2563eb",
            strokeWidth: 3,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#2563eb",
          },
        };

        addEdge(newEdge);
      };

      if (!connection.source || !connection.target) {
        console.warn("Invalid connection: missing source or target");
        return;
      }

      const nodes = getNodes();
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

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
          material: "carbon-steel",
        },
        style: {
          stroke: "#2563eb",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#2563eb",
        },
      };

      addEdge(newEdge);
    },
    [getNodes, findOptimalPath, addEdge]
  );

  /**
   * Update routing options
   */
  const updateRoutingOptions = useCallback(
    (newOptions: Partial<SmartRoutingOptions>) => {
      setOptions((prev) => ({ ...prev, ...newOptions }));
    },
    []
  );

  /**
   * Get current routing options
   */
  const getRoutingOptions = useCallback((): SmartRoutingOptions => {
    return options;
  }, [options]);

  /**
   * Check if two nodes can be auto-routed
   */
  const canAutoRoute = useCallback(
    (sourceNodeId: string, targetNodeId: string): boolean => {
      const nodes = getNodes();
      const sourceNode = nodes.find((n) => n.id === sourceNodeId);
      const targetNode = nodes.find((n) => n.id === targetNodeId);

      if (!sourceNode || !targetNode) return false;

      // Check if nodes are too close (direct connection better)
      const distance = Math.sqrt(
        Math.pow(targetNode.position.x - sourceNode.position.x, 2) +
          Math.pow(targetNode.position.y - sourceNode.position.y, 2)
      );

      const minDistanceForRouting = 100;
      return distance > minDistanceForRouting;
    },
    [getNodes]
  );

  /**
   * Get available connection points for a node
   */
  const getConnectionPoints = useCallback(
    (nodeId: string): XYPosition[] => {
      const nodes = getNodes();
      const node = nodes.find((n) => n.id === nodeId);

      if (!node) return [];

      // Return standard connection points (top, right, bottom, left)
      const nodeWidth = node.width || 100;
      const nodeHeight = node.height || 60;

      return [
        { x: node.position.x + nodeWidth / 2, y: node.position.y }, // Top
        { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight / 2 }, // Right
        { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight }, // Bottom
        { x: node.position.x, y: node.position.y + nodeHeight / 2 }, // Left
      ];
    },
    [getNodes]
  );

  return useMemo(
    () => ({
      findOptimalPath,
      createSmartConnection,
      updateRoutingOptions,
      getRoutingOptions,
      canAutoRoute,
      getConnectionPoints,
    }),
    [
      findOptimalPath,
      createSmartConnection,
      updateRoutingOptions,
      getRoutingOptions,
      canAutoRoute,
      getConnectionPoints,
    ]
  );
}