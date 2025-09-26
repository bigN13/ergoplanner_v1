import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';
import BaseSymbolNode, { BaseSymbolData } from '../BaseSymbolNode';

export interface BallValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'ball';

  // Valve specifications
  size?: string; // e.g., "DN50", "2 inch"
  rating?: string; // e.g., "PN16", "Class 150"
  material?: string; // e.g., "CS", "SS316"

  // Operating characteristics
  position?: 'open' | 'closed' | 'partial';
  positionPercent?: number; // 0-100%
  operation?: 'manual' | 'lever' | 'gear' | 'electric' | 'pneumatic' | 'hydraulic';

  // Design features
  ballType?: 'floating' | 'trunnion';
  portType?: 'full-port' | 'standard-port' | 'reduced-port';
  seats?: 'soft' | 'metal';
  endConnections?: 'flanged' | 'threaded' | 'socket-weld' | 'butt-weld';

  // Control
  actuated?: boolean;
  indication?: boolean;
  positionTransmitter?: boolean;
  failPosition?: 'fail-open' | 'fail-closed' | 'fail-in-place';

  // Service conditions
  temperature?: string;
  pressure?: string;
  fluid?: string;
  fireProof?: boolean;
}

const BallValveNode = memo<NodeProps<BallValveData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for ball valve
  const defaultConnectionPoints = [
    {
      id: 'inlet',
      type: 'inlet' as const,
      x: 15,
      y: 30,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Valve inlet'
    },
    {
      id: 'outlet',
      type: 'outlet' as const,
      x: 45,
      y: 30,
      direction: 0, // Right side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Valve outlet'
    },
    ...(data.indication || data.positionTransmitter ? [{
      id: 'indication',
      type: 'instrumentation' as const,
      x: 30,
      y: 10,
      direction: 270, // Top
      compatible: ['instrumentation'],
      required: false,
      description: 'Position indication'
    }] : []),
    ...(data.actuated ? [{
      id: 'actuator',
      type: 'control' as const,
      x: 30,
      y: 10,
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
  const enhancedData: BallValveData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content for ball valve
  const renderValveContent = () => {
    const position = data.position || 'closed';
    const positionPercent = data.positionPercent || (position === 'open' ? 100 : position === 'closed' ? 0 : 50);
    const isActuated = data.actuated || false;
    const ballRotation = (positionPercent / 100) * 90; // 0-90 degrees rotation

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
          {/* Valve body (sphere) */}
          <circle
            cx="30"
            cy="30"
            r="12"
            stroke="currentColor"
            strokeWidth="2"
            fill="white"
          />

          {/* Ball with port - rotated based on position */}
          <g transform={`rotate(${ballRotation} 30 30)`}>
            {/* Ball */}
            <circle
              cx="30"
              cy="30"
              r="8"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="#f3f4f6"
              opacity="0.8"
            />

            {/* Ball port */}
            {data.portType === 'full-port' ? (
              <rect
                x="22"
                y="28"
                width="16"
                height="4"
                fill="white"
                stroke="currentColor"
                strokeWidth="1"
              />
            ) : (
              <rect
                x="24"
                y="28.5"
                width="12"
                height="3"
                fill="white"
                stroke="currentColor"
                strokeWidth="1"
              />
            )}

            {/* Ball operation indicator */}
            <line
              x1="30"
              y1="22"
              x2="30"
              y2="26"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>

          {/* Valve stem */}
          <line
            x1="30"
            y1="18"
            x2="30"
            y2={isActuated ? "8" : "12"}
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Packing/gland */}
          <rect
            x="26"
            y={isActuated ? "12" : "16"}
            width="8"
            height="4"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Actuator or handle */}
          {isActuated ? (
            <g>
              {/* Actuator body */}
              <rect
                x="22"
                y="4"
                width="16"
                height="8"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="white"
              />
              {/* Actuator type indicator */}
              {data.operation === 'electric' && (
                <text x="30" y="9" textAnchor="middle" fontSize="6" fill="currentColor">E</text>
              )}
              {data.operation === 'pneumatic' && (
                <text x="30" y="9" textAnchor="middle" fontSize="6" fill="currentColor">P</text>
              )}
              {data.operation === 'hydraulic' && (
                <text x="30" y="9" textAnchor="middle" fontSize="6" fill="currentColor">H</text>
              )}

              {/* Fail position indicator */}
              {data.failPosition && (
                <text x="30" y="2" textAnchor="middle" fontSize="4" fill="currentColor">
                  {data.failPosition === 'fail-open' ? 'FO' :
                   data.failPosition === 'fail-closed' ? 'FC' : 'FIP'}
                </text>
              )}
            </g>
          ) : data.operation === 'lever' ? (
            <g>
              {/* Lever handle */}
              <line
                x1="30"
                y1="12"
                x2={30 + (12 * Math.cos((ballRotation * Math.PI) / 180))}
                y2={12 - (12 * Math.sin((ballRotation * Math.PI) / 180))}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Lever grip */}
              <circle
                cx={30 + (12 * Math.cos((ballRotation * Math.PI) / 180))}
                cy={12 - (12 * Math.sin((ballRotation * Math.PI) / 180))}
                r="2"
                fill="currentColor"
              />
            </g>
          ) : (
            <g>
              {/* Manual handwheel */}
              <circle
                cx="30"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="white"
              />
              {/* Handwheel spokes */}
              <line x1="24" y1="8" x2="36" y2="8" stroke="currentColor" strokeWidth="1" />
              <line x1="30" y1="2" x2="30" y2="14" stroke="currentColor" strokeWidth="1" />
              {data.operation === 'gear' && (
                <circle cx="30" cy="8" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
              )}
            </g>
          )}

          {/* Inlet connection */}
          <rect
            x="10"
            y="27"
            width="12"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Outlet connection */}
          <rect
            x="38"
            y="27"
            width="12"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Flow direction indicator */}
          <path
            d="M 16 30 L 20 30"
            stroke="currentColor"
            strokeWidth="1"
            markerEnd="url(#arrowhead-ball)"
          />

          {/* Position indication */}
          {data.indication && (
            <g>
              <circle cx="45" cy="15" r="3" stroke="currentColor" strokeWidth="1" fill="white" />
              <text x="45" y="17" textAnchor="middle" fontSize="4" fill="currentColor">
                {Math.round(positionPercent)}
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

          {/* End connection type indicators */}
          {data.endConnections === 'flanged' && (
            <g>
              <rect x="8" y="25" width="2" height="10" fill="currentColor" opacity="0.3" />
              <rect x="50" y="25" width="2" height="10" fill="currentColor" opacity="0.3" />
            </g>
          )}

          {/* Trunnion mounting (if trunnion type) */}
          {data.ballType === 'trunnion' && (
            <g>
              <rect x="26" y="42" width="8" height="2" fill="currentColor" opacity="0.5" />
            </g>
          )}

          {/* Fire proof indicator */}
          {data.fireProof && (
            <circle cx="45" cy="45" r="2" fill="#ff6b6b" opacity="0.7" />
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead-ball"
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

BallValveNode.displayName = 'BallValveNode';

export default BallValveNode;