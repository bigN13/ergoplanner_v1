'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ShapeNodeData {
  shape: 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note';
  label?: string;
  color?: string;
  width?: number;
  height?: number;
}

export default function ShapeNode({ data, selected }: NodeProps<ShapeNodeData>) {
  const width = data.width || 100;
  const height = data.height || 60;
  const color = data.color || '#3B82F6';

  const renderShape = () => {
    switch (data.shape) {
      case 'rectangle':
        return (
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="white"
            stroke={selected ? '#2563EB' : color}
            strokeWidth={selected ? 2 : 1}
            rx="4"
          />
        );
      case 'circle':
        const radius = Math.min(width, height) / 2;
        return (
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="white"
            stroke={selected ? '#2563EB' : color}
            strokeWidth={selected ? 2 : 1}
          />
        );
      case 'diamond':
        return (
          <path
            d={`M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`}
            fill="white"
            stroke={selected ? '#2563EB' : color}
            strokeWidth={selected ? 2 : 1}
          />
        );
      case 'triangle':
        return (
          <path
            d={`M ${width / 2} 0 L ${width} ${height} L 0 ${height} Z`}
            fill="white"
            stroke={selected ? '#2563EB' : color}
            strokeWidth={selected ? 2 : 1}
          />
        );
      case 'line':
        return (
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={selected ? '#2563EB' : color}
            strokeWidth={selected ? 3 : 2}
          />
        );
      case 'note':
        return (
          <>
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill="#FEF3C7"
              stroke={selected ? '#2563EB' : '#F59E0B'}
              strokeWidth={selected ? 2 : 1}
              rx="2"
            />
            {/* Folded corner */}
            <path
              d={`M ${width - 15} 0 L ${width} 15 L ${width - 15} 15 Z`}
              fill="#FDE68A"
              stroke={selected ? '#2563EB' : '#F59E0B'}
              strokeWidth={selected ? 2 : 1}
            />
          </>
        );
      default:
        return (
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="white"
            stroke={selected ? '#2563EB' : color}
            strokeWidth={selected ? 2 : 1}
            rx="4"
          />
        );
    }
  };

  return (
    <div className="relative">
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-gray-500 border-2 border-white"
        style={{ left: '-4px', top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-gray-500 border-2 border-white"
        style={{ right: '-4px', top: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-gray-500 border-2 border-white"
        style={{ top: '-4px', left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-gray-500 border-2 border-white"
        style={{ bottom: '-4px', left: '50%' }}
      />

      {/* Shape SVG */}
      <svg width={width} height={height}>
        {renderShape()}
        {data.label && data.shape !== 'line' && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fill="#374151"
          >
            {data.label}
          </text>
        )}
      </svg>
    </div>
  );
}