import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface VesselNodeData extends BaseSymbolData {
  vesselType?: 'horizontal' | 'vertical' | 'spherical' | 'conical';
  vesselSubtype?:
    | 'storage_tank'
    | 'pressure_vessel'
    | 'reactor'
    | 'column'
    | 'separator'
    | 'accumulator'
    | 'buffer_tank'
    | 'surge_tank'
    | 'flash_drum'
    | 'knockout_drum';

  // Vessel specific properties
  capacity?: number;
  capacityUnit?: string;
  pressure?: number;
  pressureUnit?: string;
  temperature?: number;
  temperatureUnit?: string;
  level?: number; // 0-100%

  // Visual properties
  showInternals?: boolean;
  showNozzles?: boolean;
  showInsulation?: boolean;
  showJacket?: boolean;
  showAgitator?: boolean;
  showBaffles?: boolean;
}

type VesselNodeProps = NodeProps<VesselNodeData>;

const VesselNode = memo<VesselNodeProps>(({ id, data, selected, dragging }): React.ReactElement => {
  const renderVesselContent = (vesselData: VesselNodeData): React.ReactElement => {
    const { vesselType = 'vertical', vesselSubtype = 'storage_tank', level = 0 } = vesselData;

    // Calculate fill based on level
    const fillHeight = `${100 - level}%`;

    return (
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for liquid level */}
          <linearGradient id={`liquid-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
          </linearGradient>

          {/* Pattern for insulation */}
          {vesselData.showInsulation && (
            <pattern id={`insulation-${id}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="4" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
              <line x1="4" y1="0" x2="0" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          )}
        </defs>

        {/* Main vessel body */}
        {renderVesselShape(vesselType, vesselSubtype, vesselData)}

        {/* Liquid level */}
        {level > 0 && (
          <rect
            x={vesselType === 'horizontal' ? 15 : 20}
            y={fillHeight}
            width={vesselType === 'horizontal' ? 70 : 60}
            height={`${level}%`}
            fill={`url(#liquid-${id})`}
            clipPath={`url(#vessel-clip-${id})`}
          />
        )}

        {/* Agitator */}
        {vesselData.showAgitator && renderAgitator()}

        {/* Baffles */}
        {vesselData.showBaffles && renderBaffles()}

        {/* Nozzles */}
        {vesselData.showNozzles && renderNozzles(vesselType)}
      </svg>
    );
  };

  const renderVesselShape = (
    type: string,
    subtype: string,
    vesselData: VesselNodeData
  ): React.ReactNode => {
    const strokeWidth = vesselData.strokeWidth || 2;
    const stroke = vesselData.strokeColor || '#374151';
    const fill = vesselData.fillColor || 'white';

    switch (type) {
      case 'horizontal':
        return (
          <>
            <clipPath id={`vessel-clip-${id}`}>
              <rect x="15" y="30" width="70" height="40" rx="20" />
            </clipPath>
            <rect
              x="15"
              y="30"
              width="70"
              height="40"
              rx="20"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            {/* Support legs */}
            <line x1="25" y1="70" x2="25" y2="85" stroke={stroke} strokeWidth={strokeWidth} />
            <line x1="75" y1="70" x2="75" y2="85" stroke={stroke} strokeWidth={strokeWidth} />
          </>
        );

      case 'spherical':
        return (
          <>
            <clipPath id={`vessel-clip-${id}`}>
              <circle cx="50" cy="50" r="35" />
            </clipPath>
            <circle
              cx="50"
              cy="50"
              r="35"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            {/* Support structure */}
            <line x1="30" y1="75" x2="30" y2="90" stroke={stroke} strokeWidth={strokeWidth} />
            <line x1="70" y1="75" x2="70" y2="90" stroke={stroke} strokeWidth={strokeWidth} />
            <line x1="50" y1="80" x2="50" y2="90" stroke={stroke} strokeWidth={strokeWidth} />
          </>
        );

      case 'conical':
        return (
          <>
            <clipPath id={`vessel-clip-${id}`}>
              <path d="M 30 20 L 70 20 L 60 80 L 40 80 Z" />
            </clipPath>
            <path
              d="M 30 20 L 70 20 L 60 80 L 40 80 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </>
        );

      case 'vertical':
      default:
        // Special shapes for specific subtypes
        if (subtype === 'column') {
          return (
            <>
              <clipPath id={`vessel-clip-${id}`}>
                <rect x="30" y="10" width="40" height="80" />
              </clipPath>
              <rect
                x="30"
                y="10"
                width="40"
                height="80"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
              {/* Tray indicators */}
              {[25, 35, 45, 55, 65, 75].map((y) => (
                <line
                  key={y}
                  x1="35"
                  y1={y}
                  x2="65"
                  y2={y}
                  stroke={stroke}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}
            </>
          );
        }

        // Standard vertical vessel
        return (
          <>
            <clipPath id={`vessel-clip-${id}`}>
              <rect x="20" y="15" width="60" height="70" rx="5" />
            </clipPath>
            {/* Top head */}
            <ellipse cx="50" cy="20" rx="30" ry="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            {/* Body */}
            <rect x="20" y="20" width="60" height="60" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            {/* Bottom head */}
            <ellipse cx="50" cy="80" rx="30" ry="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

            {/* Jacket if specified */}
            {vesselData.showJacket && (
              <>
                <rect
                  x="15"
                  y="25"
                  width="70"
                  height="50"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1"
                  strokeDasharray="3,2"
                />
                {/* Jacket inlet/outlet */}
                <circle cx="15" cy="30" r="2" fill={stroke} />
                <circle cx="85" cy="70" r="2" fill={stroke} />
              </>
            )}
          </>
        );
    }
  };

  const renderAgitator = (): React.ReactNode => (
    <g>
      {/* Shaft */}
      <line x1="50" y1="10" x2="50" y2="60" stroke="#374151" strokeWidth="2" />
      {/* Impeller */}
      <g transform="translate(50, 60)">
        <line x1="-15" y1="0" x2="15" y2="0" stroke="#374151" strokeWidth="2" />
        <line x1="-10" y1="-5" x2="-10" y2="5" stroke="#374151" strokeWidth="2" />
        <line x1="10" y1="-5" x2="10" y2="5" stroke="#374151" strokeWidth="2" />
      </g>
      {/* Motor */}
      <rect x="45" y="5" width="10" height="8" fill="#6b7280" stroke="#374151" strokeWidth="1" />
    </g>
  );

  const renderBaffles = (): React.ReactNode => (
    <>
      <line x1="25" y1="25" x2="25" y2="75" stroke="#374151" strokeWidth="1" />
      <line x1="75" y1="25" x2="75" y2="75" stroke="#374151" strokeWidth="1" />
    </>
  );

  const renderNozzles = (vesselType: string): React.ReactNode => {
    const nozzles = vesselType === 'horizontal'
      ? [
          { x: 30, y: 30, label: 'N1' },
          { x: 70, y: 30, label: 'N2' },
          { x: 50, y: 70, label: 'N3' },
        ]
      : [
          { x: 50, y: 15, label: 'N1' },
          { x: 20, y: 40, label: 'N2' },
          { x: 80, y: 40, label: 'N3' },
          { x: 50, y: 85, label: 'N4' },
        ];

    return (
      <>
        {nozzles.map(({ x, y, label }) => (
          <g key={label}>
            <circle cx={x} cy={y} r="3" fill="white" stroke="#374151" strokeWidth="1.5" />
            <text x={x} y={y - 5} fontSize="6" fill="#374151" textAnchor="middle">
              {label}
            </text>
          </g>
        ))}
      </>
    );
  };

  return (
    <BaseSymbolNode
      id={id}
      data={{
        ...data,
        dimensions: data.dimensions || {
          width: 120,
          height: 120,
          originX: 60,
          originY: 60,
          scale: 1,
          minScale: 0.5,
          maxScale: 2,
          maintainAspectRatio: true,
          units: 'px'
        },
        connectionPoints: data.connectionPoints || [
          { id: 'top', type: 'inlet', x: 50, y: 0, direction: 270, compatible: ['pipe'], required: false },
          { id: 'bottom', type: 'outlet', x: 50, y: 100, direction: 90, compatible: ['pipe'], required: false },
          { id: 'left', type: 'process', x: 0, y: 50, direction: 180, compatible: ['pipe'], required: false },
          { id: 'right', type: 'process', x: 100, y: 50, direction: 0, compatible: ['pipe'], required: false },
        ]
      }}
      selected={selected}
      dragging={dragging}
      renderCustomContent={renderVesselContent}
    />
  );
});

VesselNode.displayName = 'VesselNode';

export default VesselNode;