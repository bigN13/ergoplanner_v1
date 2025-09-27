"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";


export interface FreehandNodeData {
  label?: string;
  path?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
  strokeDasharray?: string;
  fill?: string;
  opacity?: number;
}

const FreehandNode = memo(({ data, selected }: NodeProps<FreehandNodeData>) => {
  // selectedNode removed from store
  const isSelected = selected;

  const path = data.path ?? "";
  const stroke = data.stroke ?? "#333333";
  const strokeWidth = data.strokeWidth ?? 2;
  const strokeLinecap = data.strokeLinecap ?? "round";
  const strokeLinejoin = data.strokeLinejoin ?? "round";
  const strokeDasharray = data.strokeDasharray ?? "";
  const fill = data.fill ?? "none";
  const opacity = data.opacity ?? 1;

  // Calculate bounding box from path
  const [viewBoxWidth, viewBoxHeight] = [200, 200]; // Default size, should be calculated from path

  return (
    <div
      className={`relative ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
      style={{ width: viewBoxWidth, height: viewBoxHeight }}
    >
      <svg
        width={viewBoxWidth}
        height={viewBoxHeight}
        className="absolute inset-0"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      >
        <path
          d={path}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          strokeDasharray={strokeDasharray}
          fill={fill}
          opacity={opacity}
        />
      </svg>

      {/* Connection handles (optional for freehand) */}
      <div className="opacity-0 hover:opacity-100 transition-opacity">
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ top: -4, left: "50%" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ right: -4, top: "50%" }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ bottom: -4, left: "50%" }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className="!bg-blue-500 !w-2 !h-2"
          style={{ left: -4, top: "50%" }}
        />
      </div>
    </div>
  );
});

FreehandNode.displayName = "FreehandNode";

export default FreehandNode;
