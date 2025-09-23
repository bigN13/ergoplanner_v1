import React, { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export interface HeatExchangerNodeData {
  label: string;
  type?: "shell-tube" | "plate" | "spiral";
  duty?: string;
  hotSide?: string;
  coldSide?: string;
}

const HeatExchangerNode = memo(({ data, selected }: NodeProps<HeatExchangerNodeData>) => {
  return (
    <div
      className={`relative flex h-24 w-32 items-center justify-center transition-all ${
        selected ? "scale-105" : ""
      }`}
    >
      {/* Hot side connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="hot-in"
        className="!h-3 !w-3 !border-2 !border-red-500 !bg-red-200"
        style={{ top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="hot-out"
        className="!h-3 !w-3 !border-2 !border-red-500 !bg-red-200"
        style={{ top: "30%" }}
      />

      {/* Cold side connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="cold-in"
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-200"
        style={{ top: "70%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="cold-out"
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-200"
        style={{ top: "70%" }}
      />

      <svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {/* Heat exchanger body */}
        <rect
          x="20"
          y="15"
          width="80"
          height="50"
          rx="5"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
          fill="white"
        />

        {/* Internal tubes representation */}
        <line x1="30" y1="25" x2="90" y2="25" stroke="#EF4444" strokeWidth="2" />
        <line x1="30" y1="35" x2="90" y2="35" stroke="#EF4444" strokeWidth="2" />

        <line x1="30" y1="45" x2="90" y2="45" stroke="#3B82F6" strokeWidth="2" />
        <line x1="30" y1="55" x2="90" y2="55" stroke="#3B82F6" strokeWidth="2" />

        {/* Zigzag pattern for heat transfer */}
        <path
          d="M 50 30 L 55 40 L 60 30 L 65 40 L 70 30"
          stroke="#FCA5A5"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {data.label && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
          {data.label}
        </div>
      )}

      {data.duty && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-gray-600">
          {data.duty}
        </div>
      )}
    </div>
  );
});

HeatExchangerNode.displayName = "HeatExchangerNode";

export default HeatExchangerNode;
