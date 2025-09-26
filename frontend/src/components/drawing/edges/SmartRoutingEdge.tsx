"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { EdgeProps } from "reactflow";
import { useNodes } from "reactflow";

import {
  PathfindingService,
  type RoutingMode,
  type PathfindingConfig,
  type Point
} from "@/services/PathfindingService";

/**
 * Extended edge data with pathfinding configuration
 */
export interface SmartRoutingEdgeData {
  sourceId?: string;
  targetId?: string;
  label?: string;
  color?: string;
  animated?: boolean;
  routingMode?: RoutingMode;
  obstacleBuffer?: number;
  smoothPath?: boolean;
  showDebugPath?: boolean;
}

/**
 * Smart routing edge component using A* pathfinding
 * Automatically routes around obstacles (nodes) for clean pipe layouts
 */
export default function SmartRoutingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition: _sourcePosition,
  targetPosition: _targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}: EdgeProps<SmartRoutingEdgeData>): React.JSX.Element {
  const nodes = useNodes();
  const [pathfindingService] = useState(() => new PathfindingService());

  // Update pathfinding configuration when data changes
  useEffect(() => {
    if (data) {
      const config: Partial<PathfindingConfig> = {};
      if (data.routingMode) config.routingMode = data.routingMode;
      if (data.obstacleBuffer !== undefined) config.obstacleBuffer = data.obstacleBuffer;
      pathfindingService.updateConfig(config);
    }
  }, [data, pathfindingService]);

  // Calculate the path using A* algorithm
  const { edgePath, pathPoints } = useMemo(() => {
    // Filter out source and target nodes from obstacles
    const obstacles = nodes.filter(
      (node) =>
        node.id !== data?.sourceId &&
        node.id !== data?.targetId &&
        node.width &&
        node.height
    );

    // Set obstacles in pathfinding service
    pathfindingService.setObstaclesFromNodes(
      obstacles,
      [data?.sourceId, data?.targetId].filter(Boolean) as string[]
    );

    const start: Point = { x: sourceX, y: sourceY };
    const end: Point = { x: targetX, y: targetY };

    // Find path using A* algorithm
    const points = pathfindingService.findPath(start, end);

    // Convert to SVG path
    let path: string;
    if (data?.smoothPath) {
      // Use smooth bezier curves
      path = pathfindingService.findSmoothPath(start, end);
    } else {
      // Use straight line segments
      path = pathfindingService.pathToSvg(points);
    }

    return { edgePath: path, pathPoints: points };
  }, [sourceX, sourceY, targetX, targetY, nodes, data, pathfindingService]);

  // Calculate label position (middle of the path)
  const labelPosition = useMemo(() => {
    if (pathPoints.length >= 2) {
      const midIndex = Math.floor(pathPoints.length / 2);
      const midPoint = pathPoints[midIndex];
      return midPoint ? { x: midPoint.x, y: midPoint.y } : { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 };
    }
    return { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 };
  }, [pathPoints, sourceX, sourceY, targetX, targetY]);

  return (
    <>
      {/* Main edge path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: data?.color || "#64748B",
          strokeDasharray: data?.animated ? "5 5" : undefined,
          fill: "none",
          transition: "stroke-width 0.2s ease",
        }}
      />

      {/* Debug path visualization */}
      {data?.showDebugPath && pathPoints.map((point, index) => (
        <circle
          key={`debug-${index}`}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="red"
          opacity="0.5"
        />
      ))}

      {/* Animated flow indicator */}
      {data?.animated && (
        <circle r="4" fill={data?.color || "#64748B"}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Edge label */}
      {data?.label && (
        <g transform={`translate(${labelPosition.x}, ${labelPosition.y})`}>
          <rect
            x={-20}
            y={-10}
            width="40"
            height="20"
            rx="3"
            fill="white"
            stroke={data?.color || "#64748B"}
            strokeWidth="1"
          />
          <text
            style={{
              fontSize: 11,
              fill: "#374151",
              pointerEvents: "none",
              userSelect: "none",
            }}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {data.label}
          </text>
        </g>
      )}

      {/* Selection highlight */}
      {selected && (
        <path
          d={edgePath}
          style={{
            stroke: "#3B82F6",
            strokeWidth: 5,
            fill: "none",
            strokeOpacity: 0.3,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}