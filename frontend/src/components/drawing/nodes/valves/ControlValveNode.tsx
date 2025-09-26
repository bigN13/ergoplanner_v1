import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';
import BaseSymbolNode, { BaseSymbolData } from '../BaseSymbolNode';

export interface ControlValveData extends BaseSymbolData {
  symbolType: 'valve';
  valveType: 'control';

  // Valve specifications
  size?: string; // e.g., "DN80", "3 inch"
  rating?: string; // e.g., "PN16", "Class 150"
  cv?: string; // Flow coefficient
  rangeability?: string; // e.g., "50:1"

  // Control characteristics
  position?: number; // 0-100% opening
  controlSignal?: string; // e.g., "4-20mA", "3-15psi"
  characteristicCurve?: 'linear' | 'equal-percentage' | 'quick-opening' | 'parabolic';

  // Design features
  bodyStyle?: 'globe' | 'angle' | 'butterfly' | 'ball' | 'diaphragm';
  trim?: 'single-seat' | 'double-seat' | 'cage' | 'eccentric-disc';
  packing?: 'tfe' | 'graphite' | 'live-loading';

  // Actuator
  actuatorType?: 'pneumatic' | 'electric' | 'hydraulic' | 'electro-hydraulic';
  failPosition?: 'fail-open' | 'fail-closed' | 'fail-in-place';
  positioner?: boolean;
  booster?: boolean;

  // Accessories
  handwheel?: boolean;
  bypassValve?: boolean;
  pressureTaps?: boolean;
  silencer?: boolean;

  // Control loop
  tagNumber?: string;
  controlMode?: 'automatic' | 'manual' | 'cascade' | 'ratio';
  setpoint?: string;
  processVariable?: string;

  // Service conditions
  temperature?: string;
  pressure?: string;
  fluid?: string;
  corrosive?: boolean;
}

const ControlValveNode = memo<NodeProps<ControlValveData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for control valve
  const defaultConnectionPoints = [
    {
      id: 'inlet',
      type: 'inlet' as const,
      x: 15,
      y: 35,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Process inlet'
    },
    {
      id: 'outlet',
      type: 'outlet' as const,
      x: 45,
      y: 35,
      direction: 0, // Right side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Process outlet'
    },
    {
      id: 'control-signal',
      type: 'control' as const,
      x: 30,
      y: 8,
      direction: 270, // Top
      compatible: ['instrumentation', 'control'],
      required: true,
      description: 'Control signal input'
    },
    ...(data.positioner ? [{
      id: 'positioner-supply',
      type: 'utility' as const,
      x: 25,
      y: 12,
      direction: 225, // Top-left
      compatible: ['utility', 'air'],
      required: false,
      description: 'Instrument air supply'
    }] : []),
    ...(data.pressureTaps ? [{
      id: 'pressure-upstream',
      type: 'instrumentation' as const,
      x: 20,
      y: 20,
      direction: 180, // Left
      compatible: ['instrumentation'],
      required: false,
      description: 'Upstream pressure tap'
    }, {
      id: 'pressure-downstream',
      type: 'instrumentation' as const,
      x: 40,
      y: 20,
      direction: 0, // Right
      compatible: ['instrumentation'],
      required: false,
      description: 'Downstream pressure tap'
    }] : []),
    ...(data.bypassValve ? [{
      id: 'bypass',
      type: 'process' as const,
      x: 30,
      y: 50,
      direction: 90, // Bottom
      compatible: ['pipe', 'valve'],
      required: false,
      description: 'Bypass valve connection'
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
  const enhancedData: ControlValveData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content for control valve
  const renderControlValveContent = () => {
    const position = data.position || 0;
    const bodyStyle = data.bodyStyle || 'globe';

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
          {/* Valve body based on style */}
          {bodyStyle === 'globe' && (
            <g>
              {/* Globe body */}
              <ellipse
                cx="30"
                cy="35"
                rx="12"
                ry="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="white"
              />
              {/* Seat ring */}
              <ellipse
                cx="30"
                cy="35"
                rx="8"
                ry="3"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </g>
          )}

          {bodyStyle === 'butterfly' && (
            <g>
              {/* Butterfly body (wafer style) */}
              <ellipse
                cx="30"
                cy="35"
                rx="15"
                ry="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="white"
              />
              {/* Disc */}
              <ellipse
                cx="30"
                cy="35"
                rx="12"
                ry="2"
                fill="currentColor"
                opacity="0.7"
                transform={`rotate(${position * 0.9} 30 35)`}
              />
            </g>
          )}

          {bodyStyle === 'ball' && (
            <g>
              {/* Ball body */}
              <circle
                cx="30"
                cy="35"
                r="12"
                stroke="currentColor"
                strokeWidth="2"
                fill="white"
              />
              {/* Ball port */}
              <rect
                x="22"
                y="33"
                width="16"
                height="4"
                fill="white"
                stroke="currentColor"
                strokeWidth="1"
                transform={`rotate(${position * 0.9} 30 35)`}
              />
            </g>
          )}

          {/* Default to globe if not specified */}
          {!['globe', 'butterfly', 'ball'].includes(bodyStyle) && (
            <ellipse
              cx="30"
              cy="35"
              rx="12"
              ry="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />
          )}

          {/* Valve plug/stem (for globe valves) */}
          {bodyStyle === 'globe' && (
            <g>
              <line
                x1="30"
                y1={35 - (position * 0.08)}
                x2="30"
                y2="20"
                stroke="currentColor"
                strokeWidth="2"
              />
              {/* Plug */}
              <ellipse
                cx="30"
                cy={35 - (position * 0.08)}
                rx="3"
                ry="4"
                fill="currentColor"
                opacity="0.8"
              />
            </g>
          )}

          {/* Actuator */}
          <rect
            x="22"
            y="8"
            width="16"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Actuator type indicator */}
          {data.actuatorType === 'pneumatic' && (
            <text x="30" y="15" textAnchor="middle" fontSize="6" fill="currentColor">P</text>
          )}
          {data.actuatorType === 'electric' && (
            <text x="30" y="15" textAnchor="middle" fontSize="6" fill="currentColor">E</text>
          )}
          {data.actuatorType === 'hydraulic' && (
            <text x="30" y="15" textAnchor="middle" fontSize="6" fill="currentColor">H</text>
          )}

          {/* Fail position indicator */}
          {data.failPosition && (
            <text x="30" y="6" textAnchor="middle" fontSize="4" fill="currentColor">
              {data.failPosition === 'fail-open' ? 'FO' :
               data.failPosition === 'fail-closed' ? 'FC' : 'FIP'}
            </text>
          )}

          {/* Positioner */}
          {data.positioner && (
            <rect
              x="20"
              y="12"
              width="8"
              height="4"
              rx="1"
              stroke="currentColor"
              strokeWidth="1"
              fill="white"
            />
          )}

          {/* Booster */}
          {data.booster && (
            <circle
              cx="35"
              cy="10"
              r="2"
              stroke="currentColor"
              strokeWidth="1"
              fill="white"
            />
          )}

          {/* Inlet connection */}
          <rect
            x="8"
            y="32"
            width="12"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Outlet connection */}
          <rect
            x="40"
            y="32"
            width="12"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Handwheel (if manual override) */}
          {data.handwheel && (
            <g>
              <circle
                cx="45"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1"
                fill="white"
              />
              <line x1="41" y1="12" x2="49" y2="12" stroke="currentColor" strokeWidth="0.5" />
              <line x1="45" y1="8" x2="45" y2="16" stroke="currentColor" strokeWidth="0.5" />
            </g>
          )}

          {/* Pressure taps */}
          {data.pressureTaps && (
            <g>
              <circle cx="20" cy="20" r="1.5" stroke="currentColor" strokeWidth="1" fill="white" />
              <circle cx="40" cy="20" r="1.5" stroke="currentColor" strokeWidth="1" fill="white" />
            </g>
          )}

          {/* Bypass valve */}
          {data.bypassValve && (
            <g>
              <rect x="26" y="48" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1" fill="white" />
              <line x1="18" y1="50" x2="26" y2="50" stroke="currentColor" strokeWidth="1" />
              <line x1="34" y1="50" x2="42" y2="50" stroke="currentColor" strokeWidth="1" />
            </g>
          )}

          {/* Flow direction indicator */}
          <path
            d="M 14 35 L 18 35"
            stroke="currentColor"
            strokeWidth="1"
            markerEnd="url(#arrowhead-control)"
          />

          {/* Position indication */}
          <g>
            <rect x="48" y="25" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="white" />
            <text x="52" y="29" textAnchor="middle" fontSize="4" fill="currentColor">
              {Math.round(position)}%
            </text>
          </g>

          {/* Control signal indicator */}
          <path
            d="M 30 8 L 30 2"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2,2"
            markerEnd="url(#arrowhead-signal)"
          />

          {/* Arrow marker definitions */}
          <defs>
            <marker
              id="arrowhead-control"
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
            <marker
              id="arrowhead-signal"
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <polygon
                points="0 0, 4 2, 0 4"
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
      renderCustomContent={renderControlValveContent}
    />
  );
});

ControlValveNode.displayName = 'ControlValveNode';

export default ControlValveNode;