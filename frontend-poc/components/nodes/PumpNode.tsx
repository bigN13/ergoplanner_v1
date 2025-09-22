'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Equipment } from '@/lib/store';

export default function PumpNode({ data, selected }: NodeProps<Equipment>) {
  if (!data || !data.properties) {
    return null;
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[120px] ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400"
      />

      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1">
          <span className="text-white text-xs font-bold">P</span>
        </div>

        <div className="text-xs font-medium text-gray-800 text-center">
          {data.properties.name}
        </div>

        {data.properties.model && (
          <div className="text-xs text-gray-500 text-center">
            {data.properties.model}
          </div>
        )}

        {data.properties.flow && (
          <div className="text-xs text-blue-600 text-center">
            {data.properties.flow} m³/h
          </div>
        )}

        {data.properties.power && (
          <div className="text-xs text-green-600 text-center">
            {data.properties.power} kW
          </div>
        )}

        <div className={`text-xs px-1 py-0.5 rounded mt-1 ${
          data.properties.status === 'online' ? 'bg-green-100 text-green-800' :
          data.properties.status === 'offline' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {data.properties.status || 'offline'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400"
      />
    </div>
  );
}