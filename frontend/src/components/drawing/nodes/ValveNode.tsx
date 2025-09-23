import React, { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export interface ValveNodeData {
  label: string;
  type: "gate" | "ball" | "butterfly" | "globe";
  state?: "open" | "closed" | "partial";
  size?: string;
}

const ValveNode = memo(({ data, selected }: NodeProps<ValveNodeData>) => {
  const isOpen = data.state === "open";

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
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {/* Valve symbol - bow tie shape */}
        <path
          d="M 15 25 L 25 15 L 25 35 Z"
          fill={selected ? "#3B82F6" : "currentColor"}
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
        />
        <path
          d="M 35 25 L 25 15 L 25 35 Z"
          fill={selected ? "#3B82F6" : "currentColor"}
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
        />

        {/* Valve stem */}
        {data.type === "gate" && (
          <line
            x1="25"
            y1="15"
            x2="25"
            y2="5"
            stroke={selected ? "#3B82F6" : "currentColor"}
            strokeWidth="2"
          />
        )}

        {/* State indicator */}
        {!isOpen && (
          <line
            x1="15"
            y1="15"
            x2="35"
            y2="35"
            stroke="red"
            strokeWidth="2"
            strokeDasharray="2 2"
          />
        )}
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

ValveNode.displayName = "ValveNode";

export default ValveNode;
