import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface ReciprocatingPumpData extends BaseSymbolData {
  symbolType: 'pump';
  pumpType: 'reciprocating';

  // Pump specifications
  flowRate?: string;
  pressure?: string;
  power?: string;
  strokeLength?: string;
  strokesPerMinute?: string;

  // Pump characteristics
  type?: 'piston' | 'plunger' | 'diaphragm';
  cylinders?: number;
  acting?: 'single' | 'double';

  // Operating conditions
  suctionPressure?: string;
  dischargePressure?: string;
  temperature?: string;
  fluid?: string;
  viscosity?: string;

  // Features
  pulsationDampener?: boolean;
  variableStroke?: boolean;
  relief?: boolean;
}

const ReciprocatingPumpNode = memo<NodeProps<ReciprocatingPumpData>>(({
  id,
  data,
  selected,
  dragging
}) => {
  // Default connection points for reciprocating pump
  const defaultConnectionPoints = [
    {
      id: 'suction',
      type: 'inlet' as const,
      x: 10,
      y: 35,
      direction: 180, // Left side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Suction line'
    },
    {
      id: 'discharge',
      type: 'outlet' as const,
      x: 50,
      y: 25,
      direction: 0, // Right side
      compatible: ['pipe', 'process'],
      required: true,
      description: 'Discharge line'
    },
    ...(data.pulsationDampener ? [{
      id: 'dampener-suction',
      type: 'process' as const,
      x: 15,
      y: 50,
      direction: 135, // Bottom-left
      compatible: ['pipe', 'vessel'],
      required: false,
      description: 'Suction pulsation dampener'
    }, {
      id: 'dampener-discharge',
      type: 'process' as const,
      x: 45,
      y: 10,
      direction: 45, // Top-right
      compatible: ['pipe', 'vessel'],
      required: false,
      description: 'Discharge pulsation dampener'
    }] : []),
    ...(data.relief ? [{
      id: 'relief',
      type: 'process' as const,
      x: 30,
      y: 10,
      direction: 270, // Top
      compatible: ['pipe', 'valve'],
      required: false,
      description: 'Relief valve connection'
    }] : []),
    ...(data.variableStroke ? [{
      id: 'control',
      type: 'control' as const,
      x: 55,
      y: 45,
      direction: 45, // Bottom-right
      compatible: ['instrumentation', 'control'],
      required: false,
      description: 'Stroke control'
    }] : [])
  ];

  // Default dimensions
  const defaultDimensions = {
    width: 70,
    height: 60,
    originX: 35,
    originY: 30,
    scale: 1.0,
    minScale: 0.5,
    maxScale: 3.0,
    maintainAspectRatio: true,
    units: 'px'
  };

  // Enhanced data with defaults
  const enhancedData: ReciprocatingPumpData = {
    ...data,
    dimensions: data.dimensions || defaultDimensions,
    connectionPoints: data.connectionPoints || defaultConnectionPoints,
    minZoomLevel: data.minZoomLevel || 0.3,
    maxDetailZoom: data.maxDetailZoom || 2.5,
    standard: data.standard || 'ISA-5.1'
  };

  // Custom SVG content based on pump type
  const renderPumpContent = (): React.JSX.Element => {
    const pumpType = data.type || 'piston';
    const cylinders = data.cylinders || 1;
    const isDouble = data.acting === 'double';

    return (
      <div className="flex h-full w-full items-center justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 70 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none"
        >
          {/* Pump frame/base */}
          <rect
            x="20"
            y="40"
            width="30"
            height="8"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Cylinder(s) */}
          {Array.from({ length: cylinders }).map((_, i) => {
            const xOffset = cylinders > 1 ? (i * 15) + 15 : 25;
            const yOffset = 20;

            return (
              <g key={i}>
                {/* Cylinder */}
                <rect
                  x={xOffset}
                  y={yOffset}
                  width="12"
                  height="20"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="white"
                />

                {pumpType === 'piston' && (
                  <g>
                    {/* Piston */}
                    <rect
                      x={xOffset + 2}
                      y={yOffset + 8}
                      width="8"
                      height="4"
                      fill="currentColor"
                      opacity="0.7"
                    />
                    {/* Piston rod */}
                    <line
                      x1={xOffset + 6}
                      y1={yOffset + 12}
                      x2={xOffset + 6}
                      y2="40"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {pumpType === 'plunger' && (
                  <g>
                    {/* Plunger */}
                    <rect
                      x={xOffset + 4}
                      y={yOffset + 6}
                      width="4"
                      height="8"
                      fill="currentColor"
                      opacity="0.7"
                    />
                    {/* Plunger rod */}
                    <line
                      x1={xOffset + 6}
                      y1={yOffset + 14}
                      x2={xOffset + 6}
                      y2="40"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {pumpType === 'diaphragm' && (
                  <g>
                    {/* Diaphragm (curved line) */}
                    <path
                      d={`M ${xOffset + 2} ${yOffset + 12} Q ${xOffset + 6} ${yOffset + 8} ${xOffset + 10} ${yOffset + 12}`}
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Actuator rod */}
                    <line
                      x1={xOffset + 6}
                      y1={yOffset + 12}
                      x2={xOffset + 6}
                      y2="40"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </g>
                )}

                {/* Valves (inlet and outlet per cylinder) */}
                {/* Inlet valve */}
                <circle
                  cx={xOffset + 3}
                  cy={yOffset - 2}
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="white"
                />
                {/* Outlet valve */}
                <circle
                  cx={xOffset + 9}
                  cy={yOffset - 2}
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="white"
                />

                {/* Double acting - additional connections */}
                {isDouble && (
                  <g>
                    <circle
                      cx={xOffset + 3}
                      cy={yOffset + 42}
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="white"
                    />
                    <circle
                      cx={xOffset + 9}
                      cy={yOffset + 42}
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="white"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Crankcase/drive mechanism */}
          <ellipse
            cx="35"
            cy="48"
            rx="8"
            ry="4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Suction manifold */}
          <rect
            x="5"
            y="32"
            width="18"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Discharge manifold */}
          <rect
            x="47"
            y="22"
            width="18"
            height="6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />

          {/* Pulsation dampeners */}
          {data.pulsationDampener && (
            <g>
              {/* Suction dampener */}
              <circle
                cx="12"
                cy="50"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="white"
              />
              <line x1="12" y1="46" x2="12" y2="38" stroke="currentColor" strokeWidth="1" />

              {/* Discharge dampener */}
              <circle
                cx="58"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="white"
              />
              <line x1="58" y1="16" x2="58" y2="22" stroke="currentColor" strokeWidth="1" />
            </g>
          )}

          {/* Relief valve */}
          {data.relief && (
            <g>
              <path
                d="M 30 10 L 35 15 L 40 10"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <line x1="35" y1="15" x2="35" y2="18" stroke="currentColor" strokeWidth="1" />
            </g>
          )}

          {/* Variable stroke control */}
          {data.variableStroke && (
            <rect
              x="52"
              y="42"
              width="6"
              height="6"
              stroke="currentColor"
              strokeWidth="1"
              fill="white"
            />
          )}

          {/* Flow direction arrows */}
          <path
            d="M 8 35 L 18 35"
            stroke="currentColor"
            strokeWidth="1"
            markerEnd="url(#arrowhead-recip)"
          />
          <path
            d="M 47 25 L 57 25"
            stroke="currentColor"
            strokeWidth="1"
            markerEnd="url(#arrowhead-recip)"
          />

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead-recip"
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
      renderCustomContent={renderPumpContent}
    />
  );
});

ReciprocatingPumpNode.displayName = 'ReciprocatingPumpNode';

export default ReciprocatingPumpNode;