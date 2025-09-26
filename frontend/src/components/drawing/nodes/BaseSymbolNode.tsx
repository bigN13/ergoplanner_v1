import React, { memo, useMemo, useRef } from 'react';
import { Handle, Position, useViewport } from 'reactflow';

import type { PIDNodeData } from '../../../types/drawing';

// Connection point interface matching backend domain model
interface ConnectionPoint {
  id: string;
  type: 'inlet' | 'outlet' | 'process' | 'utility' | 'instrumentation' | 'control';
  x: number;
  y: number;
  direction: number; // 0-360 degrees
  compatible: string[];
  required: boolean;
  description?: string;
}

// Symbol dimensions from backend domain model
interface SymbolDimensions {
  width: number;
  height: number;
  originX: number;
  originY: number;
  scale: number;
  minScale: number;
  maxScale: number;
  maintainAspectRatio: boolean;
  units: string;
}

// Enhanced symbol data extending PIDNodeData
export interface BaseSymbolData extends PIDNodeData {
  // Symbol metadata
  symbolId?: string;
  categoryId?: string;
  version?: number;

  // Visual properties
  dimensions: SymbolDimensions;
  connectionPoints: ConnectionPoint[];
  svgContent?: string;
  state?: 'operating' | 'idle' | 'fault' | 'maintenance';
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;

  // Standards compliance
  standard?: 'ISA-5.1' | 'ISO-14617' | 'UK-Water';
  standardVersion?: string;

  // Display properties
  minZoomLevel?: number;
  maxDetailZoom?: number;
  showLabel?: boolean;
  showProperties?: boolean;

  // Animation properties
  animated?: boolean;
  pulsing?: boolean;

  // Metadata
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface BaseSymbolNodeProps {
  id: string;
  data: BaseSymbolData;
  selected?: boolean;
  dragging?: boolean;
  onConnectionPointHover?: (pointId: string, hover: boolean) => void;
  onStateChange?: (nodeId: string, state: BaseSymbolData['state']) => void;
  renderCustomContent?: (data: BaseSymbolData) => React.ReactNode;
}

const BaseSymbolNode = memo<BaseSymbolNodeProps>(({
  data,
  selected,
  dragging,
  onConnectionPointHover,
  renderCustomContent
}) => {
  const viewport = useViewport();
  const nodeRef = useRef<HTMLDivElement>(null);

  // Determine if symbol should show full detail based on zoom level
  const showFullDetail = useMemo(() => {
    const minZoom = data.minZoomLevel || 0.5;
    const maxDetailZoom = data.maxDetailZoom || 2.0;
    return viewport.zoom >= minZoom && viewport.zoom <= maxDetailZoom;
  }, [viewport.zoom, data.minZoomLevel, data.maxDetailZoom]);

  // Calculate actual dimensions with zoom-based scaling
  const actualDimensions = useMemo(() => {
    const scale = Math.max(
      data.dimensions.minScale,
      Math.min(data.dimensions.maxScale, data.dimensions.scale * (viewport.zoom / 1.0))
    );

    return {
      width: data.dimensions.width * scale,
      height: data.dimensions.height * scale,
      scale
    };
  }, [data.dimensions, viewport.zoom]);

  // Generate connection point handles
  const connectionHandles = useMemo(() => {
    if (!showFullDetail) return [];

    return data.connectionPoints.map((point) => {
      const isSource = point.type === 'outlet';
      const position = getPositionFromDirection(point.direction);

      // Calculate relative position within the symbol
      const relativeX = (point.x / data.dimensions.width) * 100;
      const relativeY = (point.y / data.dimensions.height) * 100;

      return (
        <Handle
          key={point.id}
          id={point.id}
          type={isSource ? 'source' : 'target'}
          position={position}
          style={{
            left: `${relativeX}%`,
            top: `${relativeY}%`,
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '2px solid #374151',
            backgroundColor: getConnectionPointColor(point.type),
            opacity: showFullDetail ? 1 : 0,
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={() => onConnectionPointHover?.(point.id, true)}
          onMouseLeave={() => onConnectionPointHover?.(point.id, false)}
        />
      );
    });
  }, [data.connectionPoints, data.dimensions, showFullDetail, onConnectionPointHover]);

  // Get state-based styling
  const stateStyles = useMemo(() => {
    const baseStyle = {
      transition: 'all 0.3s ease-in-out'
    };

    switch (data.state) {
      case 'operating':
        return {
          ...baseStyle,
          borderColor: '#10b981',
          boxShadow: selected ? '0 0 0 2px #10b981' : undefined,
          animation: data.animated ? 'pulse 2s infinite' : undefined
        };
      case 'fault':
        return {
          ...baseStyle,
          borderColor: '#ef4444',
          boxShadow: '0 0 0 2px #ef4444',
          animation: 'pulse 1s infinite'
        };
      case 'maintenance':
        return {
          ...baseStyle,
          borderColor: '#f59e0b',
          boxShadow: selected ? '0 0 0 2px #f59e0b' : undefined
        };
      case 'idle':
      default:
        return {
          ...baseStyle,
          borderColor: selected ? '#3b82f6' : '#6b7280',
          boxShadow: selected ? '0 0 0 2px #3b82f6' : undefined
        };
    }
  }, [data.state, data.animated, selected]);

  // Render symbol content
  const symbolContent = useMemo(() => {
    if (renderCustomContent) {
      return renderCustomContent(data);
    }

    if (data.svgContent) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: data.svgContent }}
          className="pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            transform: data.rotation ? `rotate(${data.rotation}deg)` : undefined
          }}
        />
      );
    }

    // Fallback: simple geometric representation
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          className={`rounded border-2 bg-white ${
            data.symbolType === 'pump' ? 'rounded-full' :
            data.symbolType === 'valve' ? 'rounded-sm' :
            data.symbolType === 'tank' ? 'rounded-lg' :
            'rounded-md'
          }`}
          style={{
            width: '80%',
            height: '80%',
            borderColor: 'currentColor'
          }}
        >
          <span className="text-xs font-medium">{data.symbolType}</span>
        </div>
      </div>
    );
  }, [data, renderCustomContent]);

  return (
    <div
      ref={nodeRef}
      className={`relative bg-white transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500' : ''
      } ${dragging ? 'shadow-lg' : 'shadow-sm'} ${
        data.isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-move'
      }`}
      style={{
        width: actualDimensions.width,
        height: actualDimensions.height,
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        ...stateStyles
      }}
    >
      {/* Connection point handles */}
      {connectionHandles}

      {/* Main symbol content */}
      <div className="h-full w-full p-1">
        {symbolContent}
      </div>

      {/* Symbol label */}
      {data.showLabel !== false && data.label && (
        <div
          className="absolute text-xs font-medium text-gray-700 whitespace-nowrap"
          style={{
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: showFullDetail ? '12px' : '10px',
            opacity: showFullDetail ? 1 : 0.7
          }}
        >
          {data.label}
        </div>
      )}

      {/* Tag number */}
      {data.tagNumber && showFullDetail && (
        <div
          className="absolute text-xs font-bold text-blue-600 whitespace-nowrap"
          style={{
            top: '-18px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {data.tagNumber}
        </div>
      )}

      {/* State indicator */}
      {data.state && data.state !== 'idle' && (
        <div
          className={`absolute top-1 right-1 h-2 w-2 rounded-full ${
            data.state === 'operating' ? 'bg-green-500' :
            data.state === 'fault' ? 'bg-red-500' :
            data.state === 'maintenance' ? 'bg-yellow-500' :
            'bg-gray-400'
          }`}
          style={{
            animation: data.state === 'fault' ? 'pulse 1s infinite' : undefined
          }}
        />
      )}

      {/* Properties panel trigger (only at high zoom) */}
      {showFullDetail && data.showProperties && (
        <button
          className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-blue-500 text-white opacity-0 transition-opacity hover:opacity-100"
          style={{ fontSize: '10px' }}
          onClick={(e) => {
            e.stopPropagation();
            // Trigger properties panel
          }}
        >
          i
        </button>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
});

BaseSymbolNode.displayName = 'BaseSymbolNode';

// Helper functions
function getPositionFromDirection(direction: number): Position {
  // Convert 0-360 degree direction to ReactFlow position
  const normalizedDir = ((direction % 360) + 360) % 360;

  if (normalizedDir >= 315 || normalizedDir < 45) return Position.Right;
  if (normalizedDir >= 45 && normalizedDir < 135) return Position.Bottom;
  if (normalizedDir >= 135 && normalizedDir < 225) return Position.Left;
  return Position.Top;
}

function getConnectionPointColor(type: string): string {
  switch (type) {
    case 'inlet': return '#3b82f6';     // Blue
    case 'outlet': return '#10b981';    // Green
    case 'process': return '#8b5cf6';   // Purple
    case 'utility': return '#f59e0b';   // Yellow
    case 'instrumentation': return '#ef4444'; // Red
    case 'control': return '#6366f1';   // Indigo
    default: return '#6b7280';          // Gray
  }
}

export default BaseSymbolNode;