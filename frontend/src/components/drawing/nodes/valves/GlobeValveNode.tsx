import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface GlobeValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'globe';

  // Valve specifications
  size?: string; // e.g., "DN50", "2 inch"
  rating?: string; // e.g., "PN16", "Class 150"
  material?: string; // e.g., "CS", "SS316", "Bronze"

  // Operating characteristics
  position?: 'open' | 'closed' | 'throttled';
  positionPercent?: number; // 0-100%
  operation?: 'manual' | 'gear' | 'electric' | 'pneumatic' | 'hydraulic';

  // Design features
  bodyType?: 'Z-body' | 'Y-body' | 'angle';
  discType?: 'plug' | 'composition' | 'needle';
  bonnet?: 'bolted' | 'union' | 'welded' | 'pressure-seal';
  stem?: 'rising' | 'non-rising' | 'outside-screw-yoke';
  endConnections?: 'flanged' | 'threaded' | 'socket-weld' | 'butt-weld';

  // Control
  actuated?: boolean;
  indication?: boolean;
  positionTransmitter?: boolean;
  throttling?: boolean;

  // Service conditions
  temperature?: string;
  pressure?: string;
  fluid?: string;
}

const GlobeValveNode = memo<NodeProps<GlobeValveData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for globe valve
  const defaultConnectionPoints = [
    {
      id: 'inlet',
      type: 'inlet' as const,
      x: 15,
      y: 35,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Valve inlet'
    },
    {
      id: 'outlet',
      type: 'outlet' as const,
      x: 45,
      y: 35,
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
    height: 70,
    originX: 30,
    originY: 35,
    scale: 1.0,
    minScale: 0.5,
    maxScale: 3.0,
    maintainAspectRatio: true,
    units: 'px'
  };

  // Enhanced data with defaults
  const enhancedData: GlobeValveData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content for globe valve
  const renderValveContent = (): React.JSX.Element => {
    const position = data.position || 'closed';
    const positionPercent = data.positionPercent || (position === 'open' ? 100 : position === 'closed' ? 0 : 50);
    const isActuated = data.actuated || false;
    const bodyType = data.bodyType || 'Z-body';

    // Disc position calculation (vertical movement)
    const discOffset = (100 - positionPercent) * 0.08; // Lower = more open

    return (
      <div className="flex h-full w-full items-center justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 60 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none"
        >
          {bodyType === 'Y-body' ? (
            /* Y-Body design (angled inlet) */
            <g>
              {/* Body */}
              <circle cx="30" cy="35" r="12" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Inlet at angle */}
              <path d="M 18 40 L 10 48" stroke="currentColor" strokeWidth="2" />
              <rect x="7" y="46" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

              {/* Outlet */}
              <rect x="38" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
            </g>
          ) : bodyType === 'angle' ? (
            /* Angle valve design */
            <g>
              {/* Body */}
              <circle cx="30" cy="35" r="12" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Inlet from bottom */}
              <rect x="27" y="48" width="6" height="12" stroke="currentColor" strokeWidth="1.5" fill="white" />

              {/* Outlet to side */}
              <rect x="38" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
            </g>
          ) : (
            /* Standard Z-Body design */
            <g>
              {/* Valve body (globe shape) */}
              <circle cx="30" cy="35" r="12" stroke="currentColor" strokeWidth="2" fill="white" />

              {/* Inlet connection */}
              <rect x="10" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

              {/* Outlet connection */}
              <rect x="38" y="32" width="12" height="6" stroke="currentColor" strokeWidth="1.5" fill="white" />

              {/* Flow baffle */}
              <path d="M 30 28 L 30 35" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            </g>
          )}

          {/* Seat */}
          <ellipse cx="30" cy="35" rx="4" ry="2" fill="currentColor" opacity="0.3" />

          {/* Disc/Plug - moves vertically */}
          <g>
            {data.discType === 'needle' ? (
              /* Needle disc */
              <path
                d={`M 28 ${30 + discOffset} L 30 ${28 + discOffset} L 32 ${30 + discOffset}`}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              />
            ) : data.discType === 'composition' ? (
              /* Composition disc */
              <ellipse
                cx="30"
                cy={30 + discOffset}
                rx="3"
                ry="2"
                fill="currentColor"
                opacity="0.7"
              />
            ) : (
              /* Standard plug disc */
              <path
                d={`M 26 ${32 + discOffset} L 30 ${28 + discOffset} L 34 ${32 + discOffset} Z`}
                fill="currentColor"
                opacity="0.7"
                stroke="currentColor"
                strokeWidth="1"
              />
            )}
          </g>

          {/* Valve stem */}
          <line
            x1="30"
            y1={28 + discOffset}
            x2="30"
            y2={isActuated ? "8" : "12"}
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Bonnet */}
          <g>
            {data.stem === 'outside-screw-yoke' ? (
              /* OS&Y style bonnet */
              <g>
                <rect x="26" y="18" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="white" />
                <rect x="24" y="16" width="12" height="2" fill="currentColor" opacity="0.3" />
              </g>
            ) : (
              /* Standard bonnet */
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
            )}
          </g>

          {/* Actuator or handwheel */}
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

          {/* Flow direction indicator */}
          <path
            d="M 16 35 L 20 35"
            stroke="currentColor"
            strokeWidth="1"
            markerEnd="url(#arrowhead-globe)"
          />

          {/* Position indication */}
          {data.indication && (
            <g>
              <circle cx="50" cy="15" r="3" stroke="currentColor" strokeWidth="1" fill="white" />
              <text x="50" y="17" textAnchor="middle" fontSize="4" fill="currentColor">
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

          {/* Throttling indicator */}
          {data.throttling && position === 'throttled' && (
            <text x="30" y="50" textAnchor="middle" fontSize="5" fill="#f59e0b" fontWeight="bold">
              THR
            </text>
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead-globe"
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

GlobeValveNode.displayName = 'GlobeValveNode';

export default GlobeValveNode;
