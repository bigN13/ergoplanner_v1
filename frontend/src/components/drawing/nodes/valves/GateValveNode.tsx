import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';
import BaseSymbolNode, { BaseSymbolData } from '../BaseSymbolNode';

export interface GateValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'gate';

  // Valve specifications
  size?: string; // e.g., "DN100", "4 inch"
  rating?: string; // e.g., "PN16", "Class 150"
  material?: string; // e.g., "CS", "SS316", "Bronze"

  // Operating characteristics
  position?: 'open' | 'closed' | 'partial';
  positionPercent?: number; // 0-100%
  operation?: 'manual' | 'gear' | 'electric' | 'pneumatic' | 'hydraulic';

  // Design features
  gateType?: 'solid-wedge' | 'flexible-wedge' | 'parallel-slide' | 'expanding-gate';
  endConnections?: 'flanged' | 'threaded' | 'socket-weld' | 'butt-weld';
  bonnet?: 'bolted' | 'welded' | 'pressure-seal';
  stem?: 'rising' | 'non-rising';

  // Control
  actuated?: boolean;
  indication?: boolean;
  positionTransmitter?: boolean;

  // Service conditions
  temperature?: string;
  pressure?: string;
  fluid?: string;
}

const GateValveNode = memo<NodeProps<GateValveData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for gate valve
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
    ...(data.indication ? [{
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
  const enhancedData: GateValveData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content for gate valve
  const renderValveContent = () => {
    const position = data.position || 'closed';
    const positionPercent = data.positionPercent || (position === 'open' ? 100 : position === 'closed' ? 0 : 50);
    const isActuated = data.actuated || false;
    const stemType = data.stem || 'rising';

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
          {/* Valve body */}
          <path
            d="M 20 25 L 30 15 L 40 25 L 40 35 L 30 45 L 20 35 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="white"
          />

          {/* Gate (wedge) - position based on opening percentage */}
          <g>
            {/* Gate wedge */}
            <path
              d={`M 25 ${35 - (positionPercent * 0.15)} L 30 ${25 - (positionPercent * 0.1)} L 35 ${35 - (positionPercent * 0.15)} Z`}
              fill="currentColor"
              opacity="0.7"
              stroke="currentColor"
              strokeWidth="1"
            />
          </g>

          {/* Valve stem */}
          {stemType === 'rising' ? (
            // Rising stem - extends when valve opens
            <line
              x1="30"
              y1={25 - (positionPercent * 0.1)}
              x2="30"
              y2={isActuated ? "8" : "12"}
              stroke="currentColor"
              strokeWidth="2"
            />
          ) : (
            // Non-rising stem - fixed height
            <line
              x1="30"
              y1="25"
              x2="30"
              y2={isActuated ? "8" : "12"}
              stroke="currentColor"
              strokeWidth="2"
            />
          )}

          {/* Bonnet/packing box */}
          <rect
            x="26"
            y={isActuated ? "12" : "16"}
            width="8"
            height="6"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Handwheel or actuator */}
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
            markerEnd="url(#arrowhead-gate)"
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

          {data.endConnections === 'threaded' && (
            <g>
              <line x1="8" y1="27" x2="12" y2="27" stroke="currentColor" strokeWidth="0.5" />
              <line x1="8" y1="29" x2="12" y2="29" stroke="currentColor" strokeWidth="0.5" />
              <line x1="8" y1="31" x2="12" y2="31" stroke="currentColor" strokeWidth="0.5" />
              <line x1="8" y1="33" x2="12" y2="33" stroke="currentColor" strokeWidth="0.5" />

              <line x1="48" y1="27" x2="52" y2="27" stroke="currentColor" strokeWidth="0.5" />
              <line x1="48" y1="29" x2="52" y2="29" stroke="currentColor" strokeWidth="0.5" />
              <line x1="48" y1="31" x2="52" y2="31" stroke="currentColor" strokeWidth="0.5" />
              <line x1="48" y1="33" x2="52" y2="33" stroke="currentColor" strokeWidth="0.5" />
            </g>
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead-gate"
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

GateValveNode.displayName = 'GateValveNode';

export default GateValveNode;