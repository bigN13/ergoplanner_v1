import React, { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export interface ControlValveNodeData {
  label: string;
  controlType?: "pneumatic" | "electric" | "hydraulic";
  position?: number; // 0-100 percentage
  signal?: string;
}

const ControlValveNode = memo(({ data, selected }: NodeProps<ControlValveNodeData>) => {
  const position = data.position || 50;

  return (
    <div
      className={`relative flex h-20 w-20 items-center justify-center transition-all ${
        selected ? "scale-110" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="flow-in"
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
      />

      <Handle
        type="target"
        position={Position.Top}
        id="control-signal"
        className="!h-2 !w-2 !border-2 !border-blue-500 !bg-blue-200"
      />

      <svg
        width="70"
        height="70"
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {/* Control valve body */}
        <path
          d="M 20 35 L 30 25 L 30 45 Z"
          fill={selected ? "#3B82F6" : "currentColor"}
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
        />
        <path
          d="M 50 35 L 40 25 L 40 45 Z"
          fill={selected ? "#3B82F6" : "currentColor"}
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
        />

        {/* Control signal line */}
        <line
          x1="35"
          y1="15"
          x2="35"
          y2="25"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeDasharray="2 2"
        />

        {/* Actuator symbol */}
        <rect
          x="25"
          y="5"
          width="20"
          height="10"
          rx="2"
          stroke="#3B82F6"
          strokeWidth="2"
          fill="white"
        />

        {/* Position indicator */}
        <line
          x1="30"
          y1="35"
          x2="40"
          y2="35"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
        />
      </svg>

      <Handle
        type="source"
        position={Position.Right}
        id="flow-out"
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
      />

      {data.label && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
          {data.label}
        </div>
      )}

      {data.position !== undefined && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-blue-600">
          {position}%
        </div>
      )}
    </div>
  );
});

ControlValveNode.displayName = "ControlValveNode";

export default ControlValveNode;
