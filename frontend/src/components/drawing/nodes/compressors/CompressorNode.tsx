import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface CompressorNodeData extends BaseSymbolData {
  compressorType?:
    | 'centrifugal'
    | 'reciprocating'
    | 'screw'
    | 'scroll'
    | 'axial'
    | 'rotary_vane'
    | 'diaphragm'
    | 'turbo'
    | 'roots_blower'
    | 'liquid_ring'
    | 'piston'
    | 'multistage_centrifugal'
    | 'integrally_geared'
    | 'single_acting'
    | 'double_acting'
    | 'oil_free'
    | 'oil_flooded'
    | 'magnetic_bearing'
    | 'hermetic'
    | 'semi_hermetic';

  // Process parameters
  suctionPressure?: number;
  dischargePressure?: number;
  pressureUnit?: string;
  flowRate?: number;
  flowRateUnit?: string;
  power?: number;
  powerUnit?: string;
  speed?: number;
  speedUnit?: string;

  // Design parameters
  stages?: number;
  compressionRatio?: number;
  efficiency?: number;
  coolingType?: 'air' | 'water' | 'oil' | 'none';

  // Visual properties
  showCooling?: boolean;
  showVibration?: boolean;
  showBypass?: boolean;
  showSurgeControl?: boolean;
  animated?: boolean;
}

type CompressorNodeProps = NodeProps<CompressorNodeData>;

const CompressorNode = memo<CompressorNodeProps>(({ id, data, selected, dragging }): React.ReactElement => {
  const renderCompressorContent = (compressorData: CompressorNodeData) => {
    const { compressorType = 'centrifugal', animated = false } = compressorData;

    return (
      <svg
        viewBox="0 0 120 100"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for compression indication */}
          <linearGradient id={`pressure-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
          </linearGradient>

          {/* Animation for rotation */}
          {animated && (
            <animateTransform
              id={`rotation-${id}`}
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 60 50"
              to="360 60 50"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </defs>

        {renderCompressorType(compressorType, compressorData)}
      </svg>
    );
  };

  const renderCompressorType = (
    type: string,
    compressorData: CompressorNodeData
  ): React.ReactNode => {
    const strokeWidth = compressorData.strokeWidth || 2;
    const stroke = compressorData.strokeColor || '#374151';

    switch (type) {
      case 'reciprocating':
      case 'piston':
      case 'single_acting':
      case 'double_acting':
        return renderReciprocatingCompressor(stroke, strokeWidth, compressorData);

      case 'screw':
      case 'oil_flooded':
        return renderScrewCompressor(stroke, strokeWidth, compressorData);

      case 'scroll':
        return renderScrollCompressor(stroke, strokeWidth, compressorData);

      case 'axial':
      case 'turbo':
        return renderAxialCompressor(stroke, strokeWidth, compressorData);

      case 'rotary_vane':
        return renderRotaryVaneCompressor(stroke, strokeWidth);

      case 'diaphragm':
        return renderDiaphragmCompressor(stroke, strokeWidth);

      case 'roots_blower':
        return renderRootsBlower(stroke, strokeWidth, compressorData);

      case 'liquid_ring':
        return renderLiquidRingCompressor(stroke, strokeWidth);

      case 'multistage_centrifugal':
      case 'integrally_geared':
        return renderMultistageCompressor(stroke, strokeWidth, compressorData);

      case 'centrifugal':
      default:
        return renderCentrifugalCompressor(stroke, strokeWidth, compressorData);
    }
  };

  const renderCentrifugalCompressor = (
    stroke: string,
    strokeWidth: number,
    data: CompressorNodeData
  ): React.ReactNode => (
    <g>
      {/* Casing */}
      <circle
        cx="60"
        cy="50"
        r="30"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Impeller */}
      <g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <path
            key={angle}
            d="M 60 50 L 75 50 Q 80 52 82 55"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
            transform={`rotate(${angle} 60 50)`}
          />
        ))}
        <circle cx="60" cy="50" r="8" fill={stroke} />
        {data.animated && (
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 60 50"
            to="360 60 50"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </g>

      {/* Inlet */}
      <rect x="20" y="45" width="15" height="10" fill="white" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="20" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Outlet */}
      <rect x="85" y="45" width="15" height="10" fill="white" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="100" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Cooling fins if enabled */}
      {data.showCooling && data.coolingType === 'air' && (
        <g>
          {[35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85].map((y) => (
            <line
              key={y}
              x1="30"
              y1={y}
              x2="90"
              y2={y}
              stroke={stroke}
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
        </g>
      )}

      {/* Surge control valve if enabled */}
      {data.showSurgeControl && (
        <g>
          <path
            d="M 85 40 Q 85 30 75 30 L 45 30 Q 35 30 35 40"
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <rect x="55" y="28" width="10" height="5" fill="white" stroke={stroke} strokeWidth="1" />
        </g>
      )}

      {/* Pressure indicators */}
      {data.suctionPressure && (
        <text x="20" y="40" fontSize="8" fill="#3b82f6">
          {data.suctionPressure}
        </text>
      )}
      {data.dischargePressure && (
        <text x="85" y="40" fontSize="8" fill="#ef4444">
          {data.dischargePressure}
        </text>
      )}
    </g>
  );

  const renderReciprocatingCompressor = (
    stroke: string,
    strokeWidth: number,
    data: CompressorNodeData
  ): React.ReactNode => (
    <g>
      {/* Cylinder */}
      <rect
        x="40"
        y="30"
        width="40"
        height="40"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Piston */}
      <rect
        x="50"
        y="40"
        width="20"
        height="20"
        fill="#e5e7eb"
        stroke={stroke}
        strokeWidth="1"
      />

      {/* Connecting rod */}
      <line x1="60" y1="60" x2="60" y2="80" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Crankshaft */}
      <circle cx="60" cy="85" r="8" fill="white" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="60" cy="85" r="3" fill={stroke} />

      {/* Valves */}
      <circle cx="45" cy="30" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="75" cy="30" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Inlet and outlet */}
      <circle cx="30" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="90" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Double acting indicator */}
      {data.compressorType === 'double_acting' && (
        <>
          <rect x="50" y="15" width="20" height="10" fill="#e5e7eb" stroke={stroke} strokeWidth="1" />
          <circle cx="45" cy="70" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
          <circle cx="75" cy="70" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
        </>
      )}
    </g>
  );

  const renderScrewCompressor = (
    stroke: string,
    strokeWidth: number,
    data: CompressorNodeData
  ): React.ReactNode => (
    <g>
      {/* Casing */}
      <rect
        x="30"
        y="35"
        width="60"
        height="30"
        rx="15"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Male rotor */}
      <g transform="translate(50, 50)">
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="#e5e7eb" stroke={stroke} strokeWidth="1" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d="M 0 0 L 8 0 Q 10 2 8 4 L 0 4"
            fill="#9ca3af"
            stroke={stroke}
            strokeWidth="0.5"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>

      {/* Female rotor */}
      <g transform="translate(70, 50)">
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="#e5e7eb" stroke={stroke} strokeWidth="1" />
        {[36, 108, 180, 252, 324].map((angle) => (
          <path
            key={angle}
            d="M 0 0 L 8 0 Q 10 -2 8 -4 L 0 -4"
            fill="#9ca3af"
            stroke={stroke}
            strokeWidth="0.5"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>

      {/* Oil injection if oil-flooded */}
      {data.compressorType === 'oil_flooded' && (
        <>
          <circle cx="60" cy="30" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
          <text x="55" y="25" fontSize="6" fill={stroke}>
            OIL
          </text>
        </>
      )}

      {/* Inlet and outlet */}
      <circle cx="25" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="95" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderScrollCompressor = (
    stroke: string,
    strokeWidth: number,
    data: CompressorNodeData
  ): React.ReactNode => (
    <g>
      {/* Fixed scroll */}
      <path
        d="M 60 50 Q 80 50 80 30 T 60 10 T 40 30 T 60 50 T 80 70 T 60 90 T 40 70 T 60 50"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Orbiting scroll */}
      <path
        d="M 60 45 Q 75 45 75 30 T 60 15 T 45 30 T 60 45 T 75 60 T 60 75 T 45 60 T 60 45"
        fill="none"
        stroke="#6b7280"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Center hub */}
      <circle cx="60" cy="50" r="5" fill="white" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Hermetic shell if specified */}
      {data.compressorType === 'hermetic' && (
        <circle cx="60" cy="50" r="45" fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
      )}

      {/* Inlet and outlet */}
      <circle cx="30" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="90" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderAxialCompressor = (
    stroke: string,
    strokeWidth: number,
    _data: CompressorNodeData
  ): React.ReactNode => (
    <g>
      {/* Casing with taper */}
      <path
        d="M 20 40 L 20 60 L 100 65 L 100 35 Z"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Rotor stages */}
      {[30, 45, 60, 75, 90].map((x, i) => (
        <g key={x}>
          {/* Rotor blades */}
          <ellipse cx={x} cy="50" rx="3" ry="12 - i" fill="#6b7280" stroke={stroke} strokeWidth="0.5" />
          {/* Stator blades */}
          {i < 4 && (
            <>
              <line x1={x + 7} y1="38" x2={x + 7} y2="42" stroke={stroke} strokeWidth="1" />
              <line x1={x + 7} y1="58" x2={x + 7} y2="62" stroke={stroke} strokeWidth="1" />
            </>
          )}
        </g>
      ))}

      {/* Shaft */}
      <line x1="25" y1="50" x2="95" y2="50" stroke={stroke} strokeWidth="1" />

      {/* Inlet guide vanes */}
      <g transform="translate(25, 50)">
        {[-10, -5, 0, 5, 10].map((y) => (
          <line key={y} x1="-5" y1={y} x2="0" y2={y} stroke={stroke} strokeWidth="0.5" />
        ))}
      </g>

      {/* Inlet and outlet */}
      <circle cx="15" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="105" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderRotaryVaneCompressor = (
    stroke: string,
    strokeWidth: number
  ): React.ReactNode => (
    <g>
      {/* Casing */}
      <circle cx="60" cy="50" r="30" fill="white" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Rotor (eccentric) */}
      <circle cx="55" cy="50" r="20" fill="#f3f4f6" stroke={stroke} strokeWidth="1" />

      {/* Vanes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x="-2"
          y="-15"
          width="4"
          height="15"
          fill="#6b7280"
          stroke={stroke}
          strokeWidth="0.5"
          transform={`translate(55, 50) rotate(${angle})`}
        />
      ))}

      {/* Inlet and outlet */}
      <circle cx="30" cy="40" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="85" cy="60" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderDiaphragmCompressor = (
    stroke: string,
    strokeWidth: number
  ): React.ReactNode => (
    <g>
      {/* Compression chamber */}
      <circle cx="60" cy="45" r="25" fill="white" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Diaphragm */}
      <path
        d="M 35 45 Q 60 40 85 45"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeDasharray="1,1"
      />

      {/* Hydraulic chamber */}
      <rect x="40" y="55" width="40" height="20" fill="#e0f2fe" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Piston */}
      <rect x="50" y="60" width="20" height="10" fill="#6b7280" stroke={stroke} strokeWidth="1" />

      {/* Valves */}
      <circle cx="45" cy="25" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="75" cy="25" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Inlet and outlet */}
      <circle cx="35" cy="30" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="85" cy="30" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderRootsBlower = (
    stroke: string,
    strokeWidth: number,
    data: CompressorNodeData
  ): React.ReactNode => (
    <g>
      {/* Casing */}
      <rect
        x="30"
        y="30"
        width="60"
        height="40"
        rx="5"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* First lobe rotor */}
      <g transform="translate(50, 50)">
        <circle cx="0" cy="0" r="12" fill="#f3f4f6" stroke={stroke} strokeWidth="1" />
        <ellipse cx="0" cy="-8" rx="8" ry="6" fill="#6b7280" stroke={stroke} strokeWidth="0.5" />
        <ellipse cx="0" cy="8" rx="8" ry="6" fill="#6b7280" stroke={stroke} strokeWidth="0.5" />
      </g>

      {/* Second lobe rotor */}
      <g transform="translate(70, 50) rotate(90)">
        <circle cx="0" cy="0" r="12" fill="#f3f4f6" stroke={stroke} strokeWidth="1" />
        <ellipse cx="0" cy="-8" rx="8" ry="6" fill="#6b7280" stroke={stroke} strokeWidth="0.5" />
        <ellipse cx="0" cy="8" rx="8" ry="6" fill="#6b7280" stroke={stroke} strokeWidth="0.5" />
      </g>

      {/* Inlet and outlet */}
      <circle cx="25" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="95" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Bypass if enabled */}
      {data.showBypass && (
        <path
          d="M 90 45 Q 90 25 60 25 Q 30 25 30 45"
          fill="none"
          stroke={stroke}
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      )}
    </g>
  );

  const renderLiquidRingCompressor = (
    stroke: string,
    strokeWidth: number
  ): React.ReactNode => (
    <g>
      {/* Casing */}
      <ellipse cx="60" cy="50" rx="35" ry="30" fill="white" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Liquid ring */}
      <path
        d="M 30 50 A 30 25 0 0 1 90 50 A 25 20 0 0 0 30 50"
        fill="#3b82f6"
        fillOpacity="0.3"
        stroke="#3b82f6"
        strokeWidth="1"
      />

      {/* Impeller */}
      <g transform="translate(55, 50)">
        <circle cx="0" cy="0" r="15" fill="white" stroke={stroke} strokeWidth="1" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <line
            key={angle}
            x1="0"
            y1="0"
            x2="15"
            y2="0"
            stroke={stroke}
            strokeWidth="1"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="3" fill={stroke} />
      </g>

      {/* Ports */}
      <circle cx="60" cy="20" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="60" cy="80" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Service liquid inlet */}
      <circle cx="25" cy="50" r="3" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
    </g>
  );

  const renderMultistageCompressor = (
    stroke: string,
    strokeWidth: number,
    data: CompressorNodeData
  ): React.ReactNode => {
    const stages = data.stages || 3;
    return (
      <g>
        {/* Casing */}
        <rect
          x="20"
          y="35"
          width="80"
          height="30"
          fill="white"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />

        {/* Multiple impeller stages */}
        {Array.from({ length: stages }, (_, i) => {
          const x = 30 + (60 / stages) * i;
          const size = 12 - i * 2;
          return (
            <g key={i}>
              {/* Stage separator */}
              {i > 0 && (
                <line x1={x - 5} y1="35" x2={x - 5} y2="65" stroke={stroke} strokeWidth="1" />
              )}
              {/* Impeller */}
              <circle cx={x + 5} cy="50" r={size} fill="#e5e7eb" stroke={stroke} strokeWidth="1" />
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <line
                  key={angle}
                  x1={x + 5}
                  y1="50"
                  x2={x + 5 + size * Math.cos((angle * Math.PI) / 180)}
                  y2={50 + size * Math.sin((angle * Math.PI) / 180)}
                  stroke={stroke}
                  strokeWidth="0.5"
                />
              ))}
            </g>
          );
        })}

        {/* Intercoolers between stages */}
        {data.showCooling && Array.from({ length: stages - 1 }, (_, i) => {
          const x = 35 + (60 / stages) * (i + 1);
          return (
            <g key={i}>
              <rect x={x - 3} y="25" width="6" height="8" fill="#60a5fa" fillOpacity="0.3" stroke={stroke} strokeWidth="0.5" />
              <text x={x} y="22" fontSize="5" fill={stroke} textAnchor="middle">
                C
              </text>
            </g>
          );
        })}

        {/* Inlet and outlet */}
        <circle cx="15" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
        <circle cx="105" cy="50" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />

        {/* Integrally geared indicator */}
        {data.compressorType === 'integrally_geared' && (
          <g>
            <circle cx="60" cy="75" r="8" fill="white" stroke={stroke} strokeWidth="1" />
            <circle cx="60" cy="75" r="5" fill="none" stroke={stroke} strokeWidth="0.5" />
            {[0, 72, 144, 216, 288].map((angle) => (
              <line
                key={angle}
                x1="60"
                y1="75"
                x2={60 + 5 * Math.cos((angle * Math.PI) / 180)}
                y2={75 + 5 * Math.sin((angle * Math.PI) / 180)}
                stroke={stroke}
                strokeWidth="0.5"
              />
            ))}
          </g>
        )}
      </g>
    );
  };

  return (
    <BaseSymbolNode
      id={id}
      data={{
        ...data,
        dimensions: data.dimensions || {
          width: 140,
          height: 120,
          originX: 70,
          originY: 60,
          scale: 1,
          minScale: 0.5,
          maxScale: 2,
          maintainAspectRatio: true,
          units: 'px'
        },
        connectionPoints: data.connectionPoints || [
          { id: 'suction', type: 'inlet', x: 10, y: 50, direction: 180, compatible: ['pipe'], required: true, description: 'Suction inlet' },
          { id: 'discharge', type: 'outlet', x: 110, y: 50, direction: 0, compatible: ['pipe'], required: true, description: 'Discharge outlet' },
          { id: 'cooling-in', type: 'inlet', x: 60, y: 10, direction: 270, compatible: ['pipe'], required: false, description: 'Cooling inlet' },
          { id: 'cooling-out', type: 'outlet', x: 60, y: 110, direction: 90, compatible: ['pipe'], required: false, description: 'Cooling outlet' },
        ]
      }}
      selected={selected}
      dragging={dragging}
      renderCustomContent={renderCompressorContent}
    />
  );
});

CompressorNode.displayName = 'CompressorNode';

export default CompressorNode;