"use client";

import React, { useState, useCallback } from "react";
import type { Edge, Node, Connection } from "reactflow";
import { MarkerType } from "reactflow";

// import { useDrawingStore } from "@/store/drawingStore";

interface PipeSpec {
  diameter: string;
  material: string;
  pressure: number;
  temperature: number;
  fluidType: string;
  insulationType?: string;
  paintColor?: string;
  lineNumber?: string;
}

interface ConnectionPoint {
  id: string;
  nodeId: string;
  position: "top" | "bottom" | "left" | "right";
  type: "inlet" | "outlet" | "bidirectional";
  diameter?: string;
  connectedTo?: string;
}

interface PipeRoutingSystemProps {
  nodes: Node[];
  edges: Edge[];
  onEdgesChange: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
}

// Common pipe materials and their properties
const PIPE_MATERIALS = {
  "Carbon Steel": { maxPressure: 200, maxTemp: 400, color: "#333333" },
  "Stainless Steel": { maxPressure: 300, maxTemp: 600, color: "#C0C0C0" },
  PVC: { maxPressure: 16, maxTemp: 60, color: "#FFFFFF" },
  HDPE: { maxPressure: 25, maxTemp: 80, color: "#000000" },
  Copper: { maxPressure: 100, maxTemp: 250, color: "#B87333" },
  "Cast Iron": { maxPressure: 25, maxTemp: 100, color: "#36454F" },
};

// Standard pipe diameters (DN)
const PIPE_DIAMETERS = [
  "DN15",
  "DN20",
  "DN25",
  "DN32",
  "DN40",
  "DN50",
  "DN65",
  "DN80",
  "DN100",
  "DN125",
  "DN150",
  "DN200",
  "DN250",
  "DN300",
  "DN350",
  "DN400",
];

// Fluid types with properties
const FLUID_TYPES = {
  Water: { density: 1000, viscosity: 0.001, color: "#0066CC" },
  Steam: { density: 0.6, viscosity: 0.000012, color: "#CCCCCC" },
  Oil: { density: 850, viscosity: 0.05, color: "#8B4513" },
  Gas: { density: 1.2, viscosity: 0.000018, color: "#FFFF00" },
  Chemical: { density: 1200, viscosity: 0.002, color: "#FF6600" },
  Air: { density: 1.2, viscosity: 0.000018, color: "#87CEEB" },
};

export default function PipeRoutingSystem({
  nodes,
  edges,
  onEdgesChange: _onEdgesChange,
  onConnect,
}: PipeRoutingSystemProps): {
  handleConnection: (params: Connection) => void;
  PipeRoutingControls: () => React.ReactElement;
  validateConnection: (sourceNode: Node, targetNode: Node, pipeSpec: PipeSpec) => { valid: boolean; warnings: string[]; errors: string[] };
  getConnectionPoints: (node: Node) => ConnectionPoint[];
  PIPE_MATERIALS: typeof PIPE_MATERIALS;
  PIPE_DIAMETERS: string[];
  FLUID_TYPES: typeof FLUID_TYPES;
} {
  const [autoRouting, setAutoRouting] = useState(true);
  const [smartConnections, setSmartConnections] = useState(true);
  const [showFlowDirection, setShowFlowDirection] = useState(true);
  const [validateConnections, setValidateConnections] = useState(true);

  // Define connection points for each node type
  const getConnectionPoints = useCallback((node: Node): ConnectionPoint[] => {
    const basePoints: ConnectionPoint[] = [];

    switch (node.type) {
      case "pump":
        basePoints.push(
          {
            id: `${node.id}-inlet`,
            nodeId: node.id,
            position: "left",
            type: "inlet",
            diameter: "DN100",
          },
          {
            id: `${node.id}-outlet`,
            nodeId: node.id,
            position: "right",
            type: "outlet",
            diameter: "DN100",
          }
        );
        break;

      case "valve":
      case "controlValve":
      case "checkValve":
        basePoints.push(
          { id: `${node.id}-inlet`, nodeId: node.id, position: "left", type: "inlet" },
          { id: `${node.id}-outlet`, nodeId: node.id, position: "right", type: "outlet" }
        );
        break;

      case "tank":
        basePoints.push(
          { id: `${node.id}-inlet-top`, nodeId: node.id, position: "top", type: "inlet" },
          { id: `${node.id}-outlet-bottom`, nodeId: node.id, position: "bottom", type: "outlet" },
          { id: `${node.id}-inlet-side`, nodeId: node.id, position: "left", type: "inlet" },
          { id: `${node.id}-outlet-side`, nodeId: node.id, position: "right", type: "outlet" }
        );
        break;

      case "heatExchanger":
        basePoints.push(
          { id: `${node.id}-hot-inlet`, nodeId: node.id, position: "left", type: "inlet" },
          { id: `${node.id}-hot-outlet`, nodeId: node.id, position: "right", type: "outlet" },
          { id: `${node.id}-cold-inlet`, nodeId: node.id, position: "top", type: "inlet" },
          { id: `${node.id}-cold-outlet`, nodeId: node.id, position: "bottom", type: "outlet" }
        );
        break;

      case "compressor":
        basePoints.push(
          {
            id: `${node.id}-suction`,
            nodeId: node.id,
            position: "left",
            type: "inlet",
            diameter: "DN150",
          },
          {
            id: `${node.id}-discharge`,
            nodeId: node.id,
            position: "right",
            type: "outlet",
            diameter: "DN100",
          }
        );
        break;

      default:
        // Generic connection points
        basePoints.push(
          { id: `${node.id}-left`, nodeId: node.id, position: "left", type: "bidirectional" },
          { id: `${node.id}-right`, nodeId: node.id, position: "right", type: "bidirectional" },
          { id: `${node.id}-top`, nodeId: node.id, position: "top", type: "bidirectional" },
          { id: `${node.id}-bottom`, nodeId: node.id, position: "bottom", type: "bidirectional" }
        );
    }

    return basePoints;
  }, []);

  // Validate pipe connection compatibility
  const validateConnection = useCallback(
    (
      sourceNode: Node,
      targetNode: Node,
      pipeSpec: PipeSpec
    ): { valid: boolean; warnings: string[]; errors: string[] } => {
      const warnings: string[] = [];
      const errors: string[] = [];

      if (!validateConnections) {
        return { valid: true, warnings, errors };
      }

      // Check material compatibility
      const sourceMaterial = sourceNode.data.material;
      const targetMaterial = targetNode.data.material;

      if (sourceMaterial && targetMaterial && sourceMaterial !== targetMaterial) {
        warnings.push(`Material mismatch: ${sourceMaterial} to ${targetMaterial}`);
      }

      // Check pressure ratings
      const material = PIPE_MATERIALS[pipeSpec.material as keyof typeof PIPE_MATERIALS];
      if (material && pipeSpec.pressure > material.maxPressure) {
        errors.push(
          `Pressure ${pipeSpec.pressure} bar exceeds material limit ${material.maxPressure} bar`
        );
      }

      // Check temperature limits
      if (material && pipeSpec.temperature > material.maxTemp) {
        errors.push(
          `Temperature ${pipeSpec.temperature}°C exceeds material limit ${material.maxTemp}°C`
        );
      }

      // Check diameter compatibility
      const sourceConnectionPoint = getConnectionPoints(sourceNode).find(
        (cp) => cp.type === "outlet"
      );
      const targetConnectionPoint = getConnectionPoints(targetNode).find(
        (cp) => cp.type === "inlet"
      );

      if (sourceConnectionPoint?.diameter && targetConnectionPoint?.diameter) {
        if (sourceConnectionPoint.diameter !== targetConnectionPoint.diameter) {
          warnings.push(
            `Diameter mismatch: ${sourceConnectionPoint.diameter} to ${targetConnectionPoint.diameter}`
          );
        }
      }

      // Check equipment compatibility
      if (sourceNode.type === "pump" && targetNode.type === "checkValve") {
        const checkValveDirection = targetNode.data.flowDirection;
        if (checkValveDirection === "right-to-left") {
          errors.push("Check valve orientation prevents flow from pump");
        }
      }

      return {
        valid: errors.length === 0,
        warnings,
        errors,
      };
    },
    [validateConnections, getConnectionPoints]
  );

  // Smart pipe routing algorithm
  const calculateOptimalRoute = useCallback(
    (sourceNode: Node, targetNode: Node, obstacles: Node[]): { x: number; y: number }[] => {
      if (!autoRouting) {
        // Simple direct connection
        return [
          { x: sourceNode.position.x + 80, y: sourceNode.position.y + 20 },
          { x: targetNode.position.x, y: targetNode.position.y + 20 },
        ];
      }

      // Calculate waypoints for orthogonal routing
      const start = { x: sourceNode.position.x + 80, y: sourceNode.position.y + 20 };
      const end = { x: targetNode.position.x, y: targetNode.position.y + 20 };

      const waypoints: { x: number; y: number }[] = [start];

      // Simple L-shaped routing with obstacle avoidance
      const midX = start.x + (end.x - start.x) * 0.5;
      const midY = start.y + (end.y - start.y) * 0.5;

      // Check for obstacles and adjust routing
      let hasObstacle = false;
      for (const obstacle of obstacles) {
        if (
          obstacle.id !== sourceNode.id &&
          obstacle.id !== targetNode.id &&
          isPointInNode(midX, midY, obstacle)
        ) {
          hasObstacle = true;
          break;
        }
      }

      if (hasObstacle || Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
        // Horizontal then vertical
        waypoints.push({ x: end.x, y: start.y });
      } else {
        // Vertical then horizontal
        waypoints.push({ x: start.x, y: end.y });
      }

      waypoints.push(end);
      return waypoints;
    },
    [autoRouting]
  );

  // Check if point is inside node bounds
  const isPointInNode = (x: number, y: number, node: Node): boolean => {
    const nodeWidth = 80; // Default node width
    const nodeHeight = 40; // Default node height

    return (
      x >= node.position.x &&
      x <= node.position.x + nodeWidth &&
      y >= node.position.y &&
      y <= node.position.y + nodeHeight
    );
  };

  // Enhanced connection handler with validation and smart routing
  const handleConnection = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      // Default pipe specification
      const defaultPipeSpec: PipeSpec = {
        diameter: "DN100",
        material: "Carbon Steel",
        pressure: 10,
        temperature: 20,
        fluidType: "Water",
        lineNumber: `P-${edges.length + 1001}`,
      };

      // Validate connection
      const validation = validateConnection(sourceNode, targetNode, defaultPipeSpec);

      if (!validation.valid) {
        const message = `Connection failed:\n${validation.errors.join("\n")}`;
        // TODO: Replace with proper error modal
        // alert(message);
        console.error(message);
        return;
      }

      if (validation.warnings.length > 0) {
        // TODO: Replace with proper confirmation modal
        // const proceed = confirm(
        //   `Connection warnings:\n${validation.warnings.join("\n")}\n\nProceed anyway?`
        // );
        const proceed = true; // Temporary: always proceed
        if (!proceed) return;
      }

      // Calculate optimal route
      const waypoints = calculateOptimalRoute(sourceNode, targetNode, nodes);

      // Create enhanced edge with pipe specifications
      const newEdge: Edge = {
        ...params,
        id: `pipe-${params.source}-${params.target}-${Date.now()}`,
        source: params.source || '',
        target: params.target || '',
        type: "smoothstep",
        animated: showFlowDirection,
        style: {
          strokeWidth: getPipeStrokeWidth(defaultPipeSpec.diameter),
          stroke: getPipeColor(defaultPipeSpec),
        },
        markerEnd: showFlowDirection
          ? {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: getPipeColor(defaultPipeSpec),
            }
          : undefined,
        data: {
          pipeSpec: defaultPipeSpec,
          waypoints,
          flowDirection: getFlowDirection(sourceNode, targetNode),
          validationResult: validation,
        },
        label: `${defaultPipeSpec.lineNumber}\n${defaultPipeSpec.diameter}`,
        labelStyle: { fontSize: 10, fontWeight: "bold" },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.8 },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 2,
      };

      onConnect(newEdge as Connection);
    },
    [nodes, edges, onConnect, validateConnection, calculateOptimalRoute, showFlowDirection]
  );

  // Get pipe stroke width based on diameter
  const getPipeStrokeWidth = (diameter: string): number => {
    const sizeMap: { [key: string]: number } = {
      DN15: 2,
      DN20: 2,
      DN25: 3,
      DN32: 3,
      DN40: 4,
      DN50: 4,
      DN65: 5,
      DN80: 5,
      DN100: 6,
      DN125: 7,
      DN150: 8,
      DN200: 10,
      DN250: 12,
      DN300: 14,
      DN400: 16,
    };
    return sizeMap[diameter] || 4;
  };

  // Get pipe color based on fluid type and material
  const getPipeColor = (pipeSpec: PipeSpec): string => {
    const fluidColor = FLUID_TYPES[pipeSpec.fluidType as keyof typeof FLUID_TYPES]?.color;
    const materialColor = PIPE_MATERIALS[pipeSpec.material as keyof typeof PIPE_MATERIALS]?.color;

    return pipeSpec.paintColor || fluidColor || materialColor || "#333333";
  };

  // Determine flow direction based on equipment types
  const getFlowDirection = (
    sourceNode: Node,
    targetNode: Node
  ): "forward" | "reverse" | "bidirectional" => {
    if (sourceNode.type === "pump" || sourceNode.type === "compressor") {
      return "forward";
    }
    if (targetNode.type === "pump" || targetNode.type === "compressor") {
      return "reverse";
    }
    return "bidirectional";
  };

  // Pipe routing controls component
  const PipeRoutingControls = (): React.ReactElement => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Pipe Routing</h3>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRouting}
            onChange={(e) => setAutoRouting(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm text-gray-700">Auto Routing</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={smartConnections}
            onChange={(e) => setSmartConnections(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm text-gray-700">Smart Connections</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showFlowDirection}
            onChange={(e) => setShowFlowDirection(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm text-gray-700">Show Flow Direction</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={validateConnections}
            onChange={(e) => setValidateConnections(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm text-gray-700">Validate Connections</span>
        </label>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-3">
        <h4 className="mb-2 text-xs font-medium text-gray-600">Connection Statistics</h4>
        <div className="space-y-1 text-xs text-gray-500">
          <div>Total Pipes: {edges.length}</div>
          <div>
            Valid Connections: {edges.filter((e) => e.data?.validationResult?.valid).length}
          </div>
          <div>
            Warnings:{" "}
            {edges.reduce((sum, e) => sum + (e.data?.validationResult?.warnings?.length || 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );

  return {
    handleConnection,
    PipeRoutingControls,
    validateConnection,
    getConnectionPoints,
    PIPE_MATERIALS,
    PIPE_DIAMETERS,
    FLUID_TYPES,
  };
}
