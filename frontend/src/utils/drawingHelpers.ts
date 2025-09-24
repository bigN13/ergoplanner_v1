import type { Node, Edge } from "reactflow";

/**
 * Generate a unique ID for nodes and edges
 */
export const generateId = (prefix: string = "node"): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate if a connection between two nodes is valid
 */
export const isValidConnection = (source: Node, target: Node): boolean => {
  // Prevent self-connections
  if (source.id === target.id) {
    return false;
  }

  // Add custom validation rules based on node types
  // For example, certain node types may not connect to others
  const invalidConnections: { [key: string]: string[] } = {
    // Example: tanks cannot directly connect to tanks
    tank: ["tank"],
  };

  const sourceType = source.type || "default";
  const targetType = target.type || "default";

  if (invalidConnections[sourceType]?.includes(targetType)) {
    return false;
  }

  return true;
};

/**
 * Calculate the Bill of Quantities from the current diagram
 */
export interface BoQItem {
  type: string;
  label: string;
  quantity: number;
  specifications: Record<string, any>;
}

export const calculateBoQ = (nodes: Node[]): BoQItem[] => {
  const boqMap = new Map<string, BoQItem>();

  nodes.forEach((node) => {
    const key = `${node.type}-${JSON.stringify(node.data)}`;

    if (boqMap.has(key)) {
      const item = boqMap.get(key)!;
      item.quantity += 1;
    } else {
      boqMap.set(key, {
        type: node.type || "unknown",
        label: node.data.label || "Unnamed Component",
        quantity: 1,
        specifications: { ...node.data },
      });
    }
  });

  return Array.from(boqMap.values()).sort((a, b) => {
    // Sort by type, then by label
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return a.label.localeCompare(b.label);
  });
};

/**
 * Export drawing data in different formats
 */
export const exportToJSON = (nodes: Node[], edges: Edge[]): string => {
  return JSON.stringify(
    {
      nodes,
      edges,
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
};

/**
 * Import drawing data from JSON
 */
export const importFromJSON = (jsonString: string): { nodes: Node[]; edges: Edge[] } | null => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.nodes || !data.edges) {
      throw new Error("Invalid drawing format");
    }

    // Validate and sanitize imported data
    const nodes = data.nodes.map((node: any) => ({
      ...node,
      id: node.id || generateId("imported-node"),
      position: node.position || { x: 0, y: 0 },
      data: node.data || {},
    }));

    const edges = data.edges.map((edge: any) => ({
      ...edge,
      id: edge.id || generateId("imported-edge"),
    }));

    return { nodes, edges };
  } catch (error) {
    console.error("Failed to import drawing:", error);
    return null;
  }
};

/**
 * Snap position to grid
 */
export const snapToGrid = (
  position: { x: number; y: number },
  gridSize: number = 20
): { x: number; y: number } => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
};

/**
 * Get bounding box of nodes
 */
export const getNodesBounds = (
  nodes: Node[]
): {
  x: number;
  y: number;
  width: number;
  height: number;
} => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const nodeWidth = node.width || 100;
    const nodeHeight = node.height || 100;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Auto-layout nodes
 */
export const autoLayout = (nodes: Node[]): Node[] => {
  // Simple grid-based auto-layout
  const gridCols = Math.ceil(Math.sqrt(nodes.length));
  const spacing = 150;
  const startX = 100;
  const startY = 100;

  return nodes.map((node, index) => {
    const col = index % gridCols;
    const row = Math.floor(index / gridCols);

    return {
      ...node,
      position: {
        x: startX + col * spacing,
        y: startY + row * spacing,
      },
    };
  });
};

/**
 * Validate P&ID diagram for common issues
 */
export interface ValidationIssue {
  type: "warning" | "error";
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export const validateDiagram = (nodes: Node[], edges: Edge[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  nodes.forEach((node) => {
    if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
      issues.push({
        type: "warning",
        message: `Node "${node.data.label || node.id}" is not connected to any other component`,
        nodeId: node.id,
      });
    }

    // Check for missing labels on important components
    if (!node.data.label && ["pump", "valve", "tank"].includes(node.type || "")) {
      issues.push({
        type: "warning",
        message: `${node.type} component is missing a label`,
        nodeId: node.id,
      });
    }

    // Check for missing critical properties
    if (node.type === "pump" && !node.data.flowRate) {
      issues.push({
        type: "warning",
        message: `Pump "${node.data.label || node.id}" is missing flow rate specification`,
        nodeId: node.id,
      });
    }

    if (node.type === "tank" && !node.data.capacity) {
      issues.push({
        type: "warning",
        message: `Tank "${node.data.label || node.id}" is missing capacity specification`,
        nodeId: node.id,
      });
    }
  });

  // Check for duplicate labels
  const labels = new Map<string, string[]>();
  nodes.forEach((node) => {
    if (node.data.label) {
      if (!labels.has(node.data.label)) {
        labels.set(node.data.label, []);
      }
      labels.get(node.data.label)!.push(node.id);
    }
  });

  labels.forEach((nodeIds, label) => {
    if (nodeIds.length > 1) {
      issues.push({
        type: "error",
        message: `Duplicate label "${label}" found on multiple components`,
        nodeId: nodeIds[0],
      });
    }
  });

  return issues;
};
