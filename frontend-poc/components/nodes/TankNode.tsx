'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Equipment } from '@/lib/store';
import PIDSymbol from '../symbols/PIDSymbol';

export default function TankNode({ data, selected }: NodeProps<Equipment>) {
  if (!data || !data.properties) {
    return null;
  }

  return (
    <div className="relative">
      {/* Connection Handles - Tanks have multiple connection points */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-green-500 border-2 border-white"
        style={{ top: '-4px', left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-green-500 border-2 border-white"
        style={{ bottom: '-4px', left: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-green-500 border-2 border-white"
        style={{ left: '-4px', top: '70%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-green-500 border-2 border-white"
        style={{ right: '-4px', top: '70%' }}
      />

      {/* P&ID Symbol Only */}
      <div className={`${selected ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''}`}>
        <PIDSymbol type="vertical_tank" width={64} height={64} />
      </div>

      {/* Minimal Label on Selection */}
      {selected && (
        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md border text-xs font-medium text-gray-800 whitespace-nowrap">
          {data.properties.name}
        </div>
      )}
    </div>
  );
}