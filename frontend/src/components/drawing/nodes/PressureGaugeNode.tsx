import React, { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export interface PressureGaugeNodeData {
  label: string;
  unit?: string;
  value?: string;
  maxPressure?: string;
}

const PressureGaugeNode = memo(({ data, selected }: NodeProps<PressureGaugeNodeData>) => {
  return (
    <div
      className={`relative flex h-16 w-16 items-center justify-center transition-all ${
        selected ? "scale-110" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Bottom}
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
        {/* Pressure gauge symbol - circle with PI indicator */}
        <circle
          cx="30"
          cy="25"
          r="20"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
          fill="white"
        />
        <text
          x="30"
          y="30"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={selected ? "#3B82F6" : "currentColor"}
        >
          PI
        </text>

        {/* Stem */}
        <line
          x1="30"
          y1="45"
          x2="30"
          y2="55"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
        />
      </svg>

      {data.label && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
          {data.label}
        </div>
      )}

      {data.value && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-green-600">
          {data.value} {data.unit || "bar"}
        </div>
      )}
    </div>
  );
});

PressureGaugeNode.displayName = "PressureGaugeNode";

export default PressureGaugeNode;
