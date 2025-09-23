import React, { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export interface PipeNodeData {
  label: string;
  diameter?: string;
  material?: string;
  orientation: "horizontal" | "vertical" | "elbow" | "tee" | "cross";
}

const PipeNode = memo(({ data, selected }: NodeProps<PipeNodeData>) => {
  const renderPipeShape = () => {
    switch (data.orientation) {
      case "horizontal":
        return (
          <>
            <line
              x1="0"
              y1="25"
              x2="50"
              y2="25"
              stroke={selected ? "#3B82F6" : "currentColor"}
              strokeWidth="4"
            />
            <Handle
              type="target"
              position={Position.Left}
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="source"
              position={Position.Right}
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
          </>
        );

      case "vertical":
        return (
          <>
            <line
              x1="25"
              y1="0"
              x2="25"
              y2="50"
              stroke={selected ? "#3B82F6" : "currentColor"}
              strokeWidth="4"
            />
            <Handle
              type="target"
              position={Position.Top}
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
          </>
        );

      case "elbow":
        return (
          <>
            <path
              d="M 10 25 L 25 25 L 25 40"
              stroke={selected ? "#3B82F6" : "currentColor"}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Handle
              type="target"
              position={Position.Left}
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
          </>
        );

      case "tee":
        return (
          <>
            <line
              x1="0"
              y1="25"
              x2="50"
              y2="25"
              stroke={selected ? "#3B82F6" : "currentColor"}
              strokeWidth="4"
            />
            <line
              x1="25"
              y1="25"
              x2="25"
              y2="45"
              stroke={selected ? "#3B82F6" : "currentColor"}
              strokeWidth="4"
            />
            <Handle
              type="target"
              position={Position.Left}
              id="left"
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="right"
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id="bottom"
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
          </>
        );

      case "cross":
        return (
          <>
            <line
              x1="0"
              y1="25"
              x2="50"
              y2="25"
              stroke={selected ? "#3B82F6" : "currentColor"}
              strokeWidth="4"
            />
            <line
              x1="25"
              y1="0"
              x2="25"
              y2="50"
              stroke={selected ? "#3B82F6" : "currentColor"}
              strokeWidth="4"
            />
            <Handle
              type="target"
              position={Position.Left}
              id="left"
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="right"
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="target"
              position={Position.Top}
              id="top"
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id="bottom"
              className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative flex h-12 w-12 items-center justify-center transition-all ${
        selected ? "scale-110" : ""
      }`}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {renderPipeShape()}
      </svg>

      {data.label && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
          {data.label}
        </div>
      )}
    </div>
  );
});

PipeNode.displayName = "PipeNode";

export default PipeNode;
