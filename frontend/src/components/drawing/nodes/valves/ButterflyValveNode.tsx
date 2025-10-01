import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface ButterflyValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'butterfly';

  // Valve specifications
  size?: string; // e.g., "DN300", "12 inch"
  rating?: string; // e.g., "PN10", "Class 150"
  material?: string; // e.g., "CS", "SS316", "Ductile Iron"

  // Operating characteristics
  position?: 'open' | 'closed' | 'throttled';
  positionPercent?: number; // 0-100%
  operation?: 'manual' | 'lever' | 'gear' | 'electric' | 'pneumatic' | 'hydraulic';

  // Design features
  discType?: 'concentric' | 'double-offset' | 'triple-offset' | 'high-performance';
  seatType?: 'resilient' | 'metal';
  shaftType?: 'through-shaft' | 'stub-shaft';
  endConnections?: 'wafer' | 'lug' | 'flanged' | 'grooved';

  // Control
  actuated?: boolean;
  indication?: boolean;
  positionTransmitter?: boolean;
  bidirectional?: boolean;

  // Service conditions
  temperature?: string;
  pressure?: string;
  fluid?: string;
}

const ButterflyValveNode = memo<NodeProps<ButterflyValveData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for butterfly valve
  const defaultConnectionPoints = [
    {
      id: 'inlet',
      type: 'inlet' as const,
      x: 10,
      y: 30,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Valve inlet'
    },
    {
      id: 'outlet',
      type: 'outlet' as const,
      x: 50,
      y: 30,
      direction: 0, // Right side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Valve outlet'
    },
    ...(data.indication ? [{
      id: 'indication',
      type: 'instrumentation' as const,
      x: 30,
      y: 8,
      direction: 270, // Top
      compatible: ['instrumentation'],
      required: false,
      description: 'Position indication'
    }] : []),
    ...(data.actuated ? [{
      id: 'actuator',
      type: 'control' as const,
      x: 30,
      y: 8,
      direction: 270, // Top
      compatible: ['control', 'actuator'],
      required: false,
      description: 'Actuator connection'
    }] : [])
  ];

  // Default dimensions
  const defaultDimensions = {
    width: 60,
    height: 60,
    originX: 30,
    originY: 30,
    scale: 1.0,
    minScale: 0.5,
    maxScale: 3.0,
    maintainAspectRatio: true,
    units: 'px'
  };

  // Enhanced data with defaults
  const enhancedData: ButterflyValveData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content for butterfly valve
  const renderValveContent = (): React.JSX.Element => {
    const position = data.position || 'closed';
    const positionPercent = data.positionPercent || (position === 'open' ? 100 : position === 'closed' ? 0 : 50);
    const isActuated = data.actuated || false;

    // Disc rotation: 0° = closed (vertical), 90° = open (horizontal)
    const discRotation = (positionPercent / 100) * 90;

    return (
      <div className="flex h-full w-full items-center justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none"
        >
          {/* Valve body (circular) */}
          <circle
            cx="30"
            cy="30"
            r="15"
            stroke="currentColor"
            strokeWidth="2"
            fill="white"
          />

          {/* Seat ring */}
          {data.seatType === 'resilient' ? (
            <circle
              cx="30"
              cy="30"
              r="13"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          ) : (
            <circle
              cx="30"
              cy="30"
              r="13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              fill="none"
              opacity="0.4"
            />
          )}

          {/* Butterfly disc - rotates based on position */}
          <g transform={`rotate(${discRotation} 30 30)`}>
            {/* Disc */}
            <ellipse
              cx="30"
              cy="30"
              rx="12"
              ry="1.5"
              fill="currentColor"
              opacity="0.7"
              stroke="currentColor"
              strokeWidth="1"
            />

            {/* Disc center line */}
            <line
              x1="18"
              y1="30"
              x2="42"
              y2="30"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Shaft attachment points */}
            <circle cx="30" cy="30" r="2" fill="currentColor" />
          </g>

          {/* Shaft (vertical) */}
          <line
            x1="30"
            y1="15"
            x2="30"
            y2={isActuated ? "8" : "12"}
            stroke="currentColor"
            strokeWidth="2.5"
          />

          {/* Shaft bearing/packing */}
          <rect
            x="27"
            y={isActuated ? "12" : "14"}
            width="6"
            height="3"
            rx="0.5"
            fill="currentColor"
            opacity="0.5"
          />

          {/* Actuator or lever */}
          {isActuated ? (
            <g>
              {/* Actuator body */}
              <rect
                x="22"
                y="2"
                width="16"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="white"
              />
              {/* Actuator type indicator */}
              {data.operation === 'electric' && (
                <text x="30" y="8" textAnchor="middle" fontSize="6" fill="currentColor">E</text>
              )}
              {data.operation === 'pneumatic' && (
                <text x="30" y="8" textAnchor="middle" fontSize="6" fill="currentColor">P</text>
              )}
              {data.operation === 'hydraulic' && (
                <text x="30" y="8" textAnchor="middle" fontSize="6" fill="currentColor">H</text>
              )}
            </g>
          ) : data.operation === 'lever' ? (
            <g>
              {/* Lever handle - rotates with disc */}
              <line
                x1="30"
                y1="12"
                x2={30 + (15 * Math.cos((discRotation * Math.PI) / 180))}
                y2={12 - (15 * Math.sin((discRotation * Math.PI) / 180))}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Lever grip */}
              <circle
                cx={30 + (15 * Math.cos((discRotation * Math.PI) / 180))}
                cy={12 - (15 * Math.sin((discRotation * Math.PI) / 180))}
                r="2.5"
                fill="currentColor"
              />
            </g>
          ) : (
            <g>
              {/* Manual handwheel or gear operator */}
              <circle
                cx="30"
                cy="6"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="white"
              />
              {data.operation === 'gear' ? (
                <g>
                  <circle cx="30" cy="6" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
                  <text x="30" y="8" textAnchor="middle" fontSize="4" fill="currentColor">G</text>
                </g>
              ) : (
                <g>
                  <line x1="25" y1="6" x2="35" y2="6" stroke="currentColor" strokeWidth="1" />
                  <line x1="30" y1="1" x2="30" y2="11" stroke="currentColor" strokeWidth="1" />
                </g>
              )}
            </g>
          )}

          {/* Connection ends */}
          {data.endConnections === 'wafer' ? (
            /* Wafer style - thin body */
            <g>
              <line x1="15" y1="30" x2="10" y2="30" stroke="currentColor" strokeWidth="3" />
              <line x1="45" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="3" />
            </g>
          ) : data.endConnections === 'lug' ? (
            /* Lug style - bolt holes */
            <g>
              <circle cx="15" cy="20" r="1.5" fill="currentColor" opacity="0.5" />
              <circle cx="15" cy="40" r="1.5" fill="currentColor" opacity="0.5" />
              <circle cx="45" cy="20" r="1.5" fill="currentColor" opacity="0.5" />
              <circle cx="45" cy="40" r="1.5" fill="currentColor" opacity="0.5" />
            </g>
          ) : (
            /* Flanged connections */
            <g>
              <rect x="8" y="25" width="2" height="10" fill="currentColor" opacity="0.3" />
              <rect x="50" y="25" width="2" height="10" fill="currentColor" opacity="0.3" />
            </g>
          )}

          {/* Flow direction indicator (bidirectional if specified) */}
          {data.bidirectional ? (
            <g>
              <path d="M 8 30 L 12 30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead-butterfly)" />
              <path d="M 52 30 L 48 30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead-butterfly)" />
            </g>
          ) : (
            <path d="M 12 30 L 16 30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead-butterfly)" />
          )}

          {/* Position indication */}
          {data.indication && (
            <g>
              <rect x="43" y="12" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="white" />
              <text x="48" y="16.5" textAnchor="middle" fontSize="4" fill="currentColor">
                {Math.round(positionPercent)}%
              </text>
            </g>
          )}

          {/* Valve state color indicator */}
          <circle
            cx="15"
            cy="15"
            r="2"
            fill={
              position === 'open' ? '#10b981' :
              position === 'closed' ? '#ef4444' :
              '#f59e0b'
            }
            opacity="0.8"
          />

          {/* Disc type indicator */}
          {data.discType === 'triple-offset' && (
            <text x="30" y="52" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">
              3-O
            </text>
          )}
          {data.discType === 'double-offset' && (
            <text x="30" y="52" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">
              2-O
            </text>
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead-butterfly"
              markerWidth="6"
              markerHeight="4"
              refX="5"
              refY="2"
              orient="auto"
            >
              <polygon
                points="0 0, 6 2, 0 4"
                fill="currentColor"
              />
            </marker>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <BaseSymbolNode
      id={id}
      data={enhancedData}
      selected={selected}
      dragging={dragging}
      renderCustomContent={renderValveContent}
    />
  );
});

ButterflyValveNode.displayName = 'ButterflyValveNode';

export default ButterflyValveNode;
