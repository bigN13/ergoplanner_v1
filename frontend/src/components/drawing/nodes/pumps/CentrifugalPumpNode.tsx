import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface CentrifugalPumpData extends BaseSymbolData {
  symbolType: 'pump';
  pumpType: 'centrifugal';

  // Pump specifications
  flowRate?: string;
  head?: string;
  power?: string;
  speed?: string;
  efficiency?: string;

  // Pump characteristics
  impellerDiameter?: string;
  stages?: number;
  casing?: 'volute' | 'diffuser';

  // Operating conditions
  suctionPressure?: string;
  dischargePressure?: string;
  temperature?: string;
  fluid?: string;

  // Control
  vfdControlled?: boolean;
  startStop?: boolean;
}

const CentrifugalPumpNode = memo<NodeProps<CentrifugalPumpData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for centrifugal pump
  const defaultConnectionPoints = [
    {
      id: 'suction',
      type: 'inlet' as const,
      x: 10,
      y: 30,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Suction inlet'
    },
    {
      id: 'discharge',
      type: 'outlet' as const,
      x: 50,
      y: 30,
      direction: 0, // Right side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Discharge outlet'
    },
    ...(data.vfdControlled ? [{
      id: 'control',
      type: 'control' as const,
      x: 30,
      y: 10,
      direction: 270, // Top
      compatible: ['instrumentation', 'control'],
      required: false,
      description: 'VFD control signal'
    }] : [])
  ];

  // Default dimensions for centrifugal pump
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
  const enhancedData: CentrifugalPumpData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content for centrifugal pump
  const renderPumpContent = (): React.JSX.Element => (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        {/* Pump casing (circular) */}
        <circle
          cx="30"
          cy="30"
          r="20"
          stroke="currentColor"
          strokeWidth="2"
          fill="white"
        />

        {/* Impeller (triangle indicating rotation) */}
        <path
          d="M 22 30 L 32 22 L 32 38 Z"
          fill="currentColor"
          opacity="0.7"
        />

        {/* Suction nozzle */}
        <rect
          x="5"
          y="27"
          width="10"
          height="6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="white"
        />

        {/* Discharge nozzle */}
        <rect
          x="45"
          y="27"
          width="10"
          height="6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="white"
        />

        {/* Volute indicator (spiral) */}
        {data.casing === 'volute' && (
          <path
            d="M 35 20 Q 42 25 40 35 Q 38 40 32 38"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        )}

        {/* VFD indicator */}
        {data.vfdControlled && (
          <rect
            x="26"
            y="6"
            width="8"
            height="4"
            stroke="currentColor"
            strokeWidth="1"
            fill="white"
          />
        )}

        {/* Rotation direction indicator */}
        <path
          d="M 36 24 Q 40 28 36 32"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          markerEnd="url(#arrowhead)"
          opacity="0.6"
        />

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="currentColor"
              opacity="0.6"
            />
          </marker>
        </defs>
      </svg>
    </div>
  );

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

CentrifugalPumpNode.displayName = 'CentrifugalPumpNode';

export default CentrifugalPumpNode;