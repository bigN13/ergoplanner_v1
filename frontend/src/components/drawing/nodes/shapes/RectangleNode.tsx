"use client";

import React, { memo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";


export interface RectangleNodeData {
  label?: string;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  text?: string;
}

const RectangleNode = memo(({ data, selected }: NodeProps<RectangleNodeData>) => {
  // selectedNode removed from store
  const isSelected = selected;

  const width = data.width ?? 100;
  const height = data.height ?? 60;
  const fill = data.fill ?? "#ffffff";
  const stroke = data.stroke ?? "#333333";
  const strokeWidth = data.strokeWidth ?? 2;
  const cornerRadius = data.cornerRadius ?? 0;

  return (
    <div
      className={`relative ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
      style={{ width, height }}
    >
      <svg width={width} height={height} className="absolute inset-0">
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={width - strokeWidth}
          height={height - strokeWidth}
          rx={cornerRadius}
          ry={cornerRadius}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>

      {data.text && (
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <span className="text-sm text-center break-words">{data.text}</span>
        </div>
      )}

      {/* Connection handles */}
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
  );
});

RectangleNode.displayName = "RectangleNode";

export default RectangleNode;