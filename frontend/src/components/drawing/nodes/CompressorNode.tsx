import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface CompressorNodeData {
  label: string;
  type?: 'centrifugal' | 'reciprocating' | 'screw';
  pressure?: string;
  power?: string;
}

const CompressorNode = memo(({ data, selected }: NodeProps<CompressorNodeData>) => {
  return (
    <div
      className={`relative flex h-20 w-20 items-center justify-center transition-all ${
        selected ? 'scale-110' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-gray-700 !bg-white"
      />

      <svg
        width="70"
        height="70"
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {/* Compressor symbol - circle with C */}
        <circle
          cx="35"
          cy="35"
          r="25"
          stroke={selected ? '#3B82F6' : 'currentColor'}
          strokeWidth="2"
          fill="white"
        />

        {/* Compressor blades/impeller */}
        <path
          d="M 35 20 L 30 35 L 35 50 M 35 20 L 40 35 L 35 50"
          stroke={selected ? '#3B82F6' : 'currentColor'}
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 20 35 L 35 30 L 50 35 M 20 35 L 35 40 L 50 35"
          stroke={selected ? '#3B82F6' : 'currentColor'}
          strokeWidth="2"
          fill="none"
        />

        {/* Type indicator */}
        <text
          x="35"
          y="55"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={selected ? '#3B82F6' : 'currentColor'}
        >
          C
        </text>
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

      {data.pressure && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-orange-600 font-semibold">
          {data.pressure}
        </div>
      )}
    </div>
  );
});

CompressorNode.displayName = 'CompressorNode';

export default CompressorNode;