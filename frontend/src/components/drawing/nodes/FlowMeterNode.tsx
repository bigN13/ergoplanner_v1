import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface FlowMeterNodeData {
  label: string;
  type: 'electromagnetic' | 'ultrasonic' | 'turbine' | 'vortex';
  unit?: string;
  value?: string;
}

const FlowMeterNode = memo(({ data, selected }: NodeProps<FlowMeterNodeData>) => {
  return (
    <div
      className={`relative flex h-16 w-16 items-center justify-center transition-all ${
        selected ? 'scale-110' : ''
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
        {/* Flow meter symbol - circle with FI indicator */}
        <circle
          cx="30"
          cy="30"
          r="20"
          stroke={selected ? '#3B82F6' : 'currentColor'}
          strokeWidth="2"
          fill="white"
        />
        <text
          x="30"
          y="35"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={selected ? '#3B82F6' : 'currentColor'}
        >
          FI
        </text>

        {/* Connection lines */}
        <line
          x1="10"
          y1="30"
          x2="50"
          y2="30"
          stroke={selected ? '#3B82F6' : 'currentColor'}
          strokeWidth="2"
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

      {data.value && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-blue-600 font-semibold">
          {data.value} {data.unit || 'm³/h'}
        </div>
      )}
    </div>
  );
});

FlowMeterNode.displayName = 'FlowMeterNode';

export default FlowMeterNode;