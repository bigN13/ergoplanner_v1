'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Equipment } from '@/lib/store';

export default function TankNode({ data, selected }: NodeProps<Equipment>) {
  if (!data || !data.properties) {
    return null;
  }

  return (
    <div className={`px-4 py-3 shadow-md rounded-md bg-white border-2 min-w-[140px] ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-400"
      />

      <div className="flex flex-col items-center">
        <div className="w-12 h-8 bg-green-500 rounded-sm flex items-center justify-center mb-1 relative overflow-hidden">
          <span className="text-white text-xs font-bold">T</span>
          {/* Tank level indicator */}
          <div className="absolute bottom-0 left-0 right-0 bg-blue-300 opacity-60"
               style={{height: '60%'}}></div>
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
            Capacity: {data.properties.flow} m³
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
        position={Position.Bottom}
        className="w-3 h-3 bg-green-400"
      />
    </div>
  );
}