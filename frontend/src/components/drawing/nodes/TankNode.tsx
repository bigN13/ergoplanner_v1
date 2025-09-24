import React, { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export interface TankNodeData {
  label: string;
  type: "storage" | "pressure" | "mixing" | "buffer";
  capacity?: string;
  level?: number; // 0-100 percentage
  material?: string;
}

const TankNode = memo(({ data, selected }: NodeProps<TankNodeData>) => {
  const level = data.level || 50;

  return (
    <div
      className={`relative flex h-32 w-24 items-center justify-center transition-all ${
        selected ? "scale-105" : ""
      }`}
    >
      {/* Top connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
        style={{ left: "50%" }}
      />

      {/* Left connection */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-in"
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
        style={{ top: "30%" }}
      />

      {/* Right connection */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-out"
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
        style={{ top: "30%" }}
      />

      {/* Bottom connection */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
        style={{ left: "50%" }}
      />

      <svg
        width="80"
        height="120"
        viewBox="0 0 80 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {/* Tank body */}
        <rect
          x="10"
          y="20"
          width="60"
          height="80"
          rx="5"
          stroke={selected ? "#3B82F6" : "currentColor"}
          strokeWidth="2"
          fill="white"
        />

        {/* Liquid level */}
        <rect
          x="12"
          y={100 - level * 0.78}
          width="56"
          height={level * 0.78}
          rx="3"
          fill={selected ? "#93C5FD" : "#E0E7FF"}
          opacity="0.7"
        />

        {/* Top dome for pressure tanks */}
        {data.type === "pressure" && (
          <ellipse
            cx="40"
            cy="20"
            rx="30"
            ry="10"
            stroke={selected ? "#3B82F6" : "currentColor"}
            strokeWidth="2"
            fill="white"
          />
        )}

        {/* Level indicator lines */}
        <line x1="5" y1="40" x2="10" y2="40" stroke="currentColor" strokeWidth="1" />
        <line x1="5" y1="60" x2="10" y2="60" stroke="currentColor" strokeWidth="1" />
        <line x1="5" y1="80" x2="10" y2="80" stroke="currentColor" strokeWidth="1" />
      </svg>

      {data.label && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
          {data.label}
        </div>
      )}

      {data.capacity && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-gray-600">
          {data.capacity}
        </div>
      )}
    </div>
  );
});

TankNode.displayName = "TankNode";

export default TankNode;
