import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface PositiveDisplacementPumpData extends BaseSymbolData {
  symbolType: 'pump';
  pumpType: 'positive-displacement';

  // Pump specifications
  flowRate?: string;
  pressure?: string;
  power?: string;
  speed?: string;
  displacement?: string;

  // Pump characteristics
  type?: 'gear' | 'screw' | 'lobe' | 'vane' | 'piston';
  chambers?: number;
  viscosity?: string;

  // Operating conditions
  inletPressure?: string;
  outletPressure?: string;
  temperature?: string;
  fluid?: string;

  // Control
  speedControlled?: boolean;
  bypassValve?: boolean;
}

const PositiveDisplacementPumpNode = memo<NodeProps<PositiveDisplacementPumpData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for positive displacement pump
  const defaultConnectionPoints = [
    {
      id: 'inlet',
      type: 'inlet' as const,
      x: 10,
      y: 30,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Pump inlet'
    },
    {
      id: 'outlet',
      type: 'outlet' as const,
      x: 50,
      y: 30,
      direction: 0, // Right side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Pump outlet'
    },
    ...(data.bypassValve ? [{
      id: 'bypass',
      type: 'process' as const,
      x: 30,
      y: 50,
      direction: 90, // Bottom
      compatible: ['pipe', 'process'],
      required: false,
      description: 'Bypass line'
    }] : []),
    ...(data.speedControlled ? [{
      id: 'control',
      type: 'control' as const,
      x: 30,
      y: 10,
      direction: 270, // Top
      compatible: ['instrumentation', 'control'],
      required: false,
      description: 'Speed control signal'
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
  const enhancedData: PositiveDisplacementPumpData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content based on pump type
  const renderPumpContent = (): React.JSX.Element => {
    const pumpType = data.type || 'gear';

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
          {/* Pump housing */}
          <rect
            x="15"
            y="20"
            width="30"
            height="20"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="white"
          />

          {/* Inlet connection */}
          <rect
            x="5"
            y="27"
            width="12"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Outlet connection */}
          <rect
            x="43"
            y="27"
            width="12"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Pump mechanism based on type */}
          {pumpType === 'gear' && (
            <g>
              {/* Gear wheels */}
              <circle cx="25" cy="30" r="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
              <circle cx="35" cy="30" r="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
              {/* Gear teeth indication */}
              <circle cx="25" cy="30" r="3" fill="currentColor" opacity="0.3" />
              <circle cx="35" cy="30" r="3" fill="currentColor" opacity="0.3" />
            </g>
          )}

          {pumpType === 'screw' && (
            <g>
              {/* Screw threads */}
              <path
                d="M 20 30 Q 25 25 30 30 Q 35 35 40 30"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 20 30 Q 25 35 30 30 Q 35 25 40 30"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
            </g>
          )}

          {pumpType === 'lobe' && (
            <g>
              {/* Lobe rotors */}
              <ellipse cx="25" cy="30" rx="4" ry="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
              <ellipse cx="35" cy="30" rx="4" ry="6" stroke="currentColor" strokeWidth="1.5" fill="white" />
            </g>
          )}

          {pumpType === 'vane' && (
            <g>
              {/* Rotor and vanes */}
              <circle cx="30" cy="30" r="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
              <circle cx="30" cy="30" r="4" fill="currentColor" opacity="0.3" />
              {/* Vanes */}
              <line x1="26" y1="26" x2="34" y2="34" stroke="currentColor" strokeWidth="1" />
              <line x1="34" y1="26" x2="26" y2="34" stroke="currentColor" strokeWidth="1" />
            </g>
          )}

          {pumpType === 'piston' && (
            <g>
              {/* Piston chambers */}
              <rect x="22" y="25" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="white" />
              <rect x="32" y="25" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="white" />
              {/* Pistons */}
              <rect x="23" y="28" width="4" height="4" fill="currentColor" opacity="0.6" />
              <rect x="33" y="32" width="4" height="4" fill="currentColor" opacity="0.6" />
            </g>
          )}

          {/* Flow direction indicators */}
          <path
            d="M 18 30 L 22 30"
            stroke="currentColor"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead-pd)"
          />
          <path
            d="M 38 30 L 42 30"
            stroke="currentColor"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead-pd)"
          />

          {/* Bypass valve indication */}
          {data.bypassValve && (
            <g>
              <line x1="30" y1="40" x2="30" y2="45" stroke="currentColor" strokeWidth="1" />
              <circle cx="30" cy="47" r="2" stroke="currentColor" strokeWidth="1" fill="white" />
            </g>
          )}

          {/* Speed control indication */}
          {data.speedControlled && (
            <rect
              x="26"
              y="8"
              width="8"
              height="4"
              stroke="currentColor"
              strokeWidth="1"
              fill="white"
            />
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead-pd"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
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
      renderCustomContent={renderPumpContent}
    />
  );
});

PositiveDisplacementPumpNode.displayName = 'PositiveDisplacementPumpNode';

export default PositiveDisplacementPumpNode;