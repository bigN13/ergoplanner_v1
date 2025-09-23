import React, { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export interface CheckValveNodeData {
  label: string;
  type?: "swing" | "lift" | "ball";
  flowDirection?: "left-to-right" | "right-to-left";
}

const CheckValveNode = memo(({ data, selected }: NodeProps<CheckValveNodeData>) => {
  return (
    <div
      className={`relative flex h-16 w-16 items-center justify-center transition-all ${
        selected ? "scale-110" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
      />

      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {/* Check valve symbol */}
        <circle
          cx="30"
          cy="30"
          r="15"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
          fill="white"
        />

        {/* Arrow indicating flow direction */}
        <path
          d="M 20 30 L 35 30 M 35 30 L 30 25 M 35 30 L 30 35"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blocking line */}
        <line
          x1="40"
          y1="20"
          x2="40"
          y2="40"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="3"
        />
      </svg>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
      />

      {data.label && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
          {data.label}
        </div>
      )}
    </div>
  );
});

CheckValveNode.displayName = "CheckValveNode";

export default CheckValveNode;
