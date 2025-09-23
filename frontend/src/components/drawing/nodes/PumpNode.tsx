import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface PumpNodeData {
  label: string;
  type: 'centrifugal' | 'positive-displacement' | 'vacuum';
  flowRate?: string;
  head?: string;
  power?: string;
}

const PumpNode = memo(({ data, selected }: NodeProps<PumpNodeData>) => {
  return (
    <div
      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 bg-white transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-700'
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
        {/* Pump symbol - circle with triangle */}
        <circle
          cx="30"
          cy="30"
          r="25"
          stroke="currentColor"
          strokeWidth="2"
          fill="white"
        />
        <path
          d="M 20 30 L 40 20 L 40 40 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
      />

      {data.label && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
          {data.label}
        </div>
      )}
    </div>
  );
});

PumpNode.displayName = 'PumpNode';

export default PumpNode;