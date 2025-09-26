import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

export interface HeatExchangerNodeData extends BaseSymbolData {
  exchangerType?:
    | 'shell_and_tube'
    | 'plate'
    | 'air_cooled'
    | 'spiral'
    | 'double_pipe'
    | 'kettle'
    | 'u_tube'
    | 'fixed_head'
    | 'floating_head';

  // Process parameters
  duty?: number;
  dutyUnit?: string;
  hotInletTemp?: number;
  hotOutletTemp?: number;
  coldInletTemp?: number;
  coldOutletTemp?: number;
  tempUnit?: string;

  // Design parameters
  shellPasses?: number;
  tubePasses?: number;
  area?: number;
  areaUnit?: string;

  // Visual properties
  showFlowDirection?: boolean;
  showBaffles?: boolean;
  showFins?: boolean;
  animated?: boolean;
}

type HeatExchangerNodeProps = NodeProps<HeatExchangerNodeData>;

const HeatExchangerNode = memo<HeatExchangerNodeProps>(({ id, data, selected, dragging }): React.ReactElement => {
  const renderExchangerContent = (exchangerData: HeatExchangerNodeData): React.ReactElement => {
    const { exchangerType = 'shell_and_tube', animated = false } = exchangerData;

    return (
      <svg
        viewBox="0 0 120 80"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Hot fluid gradient */}
          <linearGradient id={`hot-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 0.4 }} />
          </linearGradient>

          {/* Cold fluid gradient */}
          <linearGradient id={`cold-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 0.4 }} />
          </linearGradient>

          {/* Animation for flow */}
          {animated && (
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              from="0 0"
              to="10 0"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </defs>

        {renderExchangerType(exchangerType, exchangerData)}
      </svg>
    );
  };

  const renderExchangerType = (
    type: string,
    exchangerData: HeatExchangerNodeData
  ): React.ReactNode => {
    const strokeWidth = exchangerData.strokeWidth || 2;
    const stroke = exchangerData.strokeColor || '#374151';

    switch (type) {
      case 'plate':
        return renderPlateExchanger(stroke, strokeWidth, exchangerData);

      case 'air_cooled':
        return renderAirCooledExchanger(stroke, strokeWidth, exchangerData);

      case 'spiral':
        return renderSpiralExchanger(stroke, strokeWidth);

      case 'double_pipe':
        return renderDoublePipeExchanger(stroke, strokeWidth);

      case 'kettle':
        return renderKettleExchanger(stroke, strokeWidth);

      case 'shell_and_tube':
      default:
        return renderShellAndTubeExchanger(stroke, strokeWidth, exchangerData);
    }
  };

  const renderShellAndTubeExchanger = (
    stroke: string,
    strokeWidth: number,
    data: HeatExchangerNodeData
  ): React.ReactNode => (
    <g>
      {/* Shell */}
      <rect
        x="20"
        y="25"
        width="80"
        height="30"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx="15"
      />

      {/* Tube bundle */}
      {[30, 40, 50, 60, 70, 80, 90].map((x) => (
        <line
          key={x}
          x1={x}
          y1="30"
          x2={x}
          y2="50"
          stroke={stroke}
          strokeWidth="1"
          opacity="0.6"
        />
      ))}

      {/* Baffles */}
      {data.showBaffles && [35, 55, 75].map((x) => (
        <rect
          key={x}
          x={x}
          y="28"
          width="2"
          height="24"
          fill={stroke}
          opacity="0.3"
        />
      ))}

      {/* Shell side inlet/outlet */}
      <circle cx="20" cy="35" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="100" cy="45" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Tube side inlet/outlet */}
      <circle cx="25" cy="25" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="95" cy="55" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />

      {/* Flow arrows if enabled */}
      {data.showFlowDirection && (
        <>
          {/* Hot flow */}
          <path
            d="M 10 35 L 15 35 M 12 33 L 15 35 L 12 37"
            stroke="#ef4444"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 105 45 L 110 45 M 107 43 L 110 45 L 107 47"
            stroke="#f97316"
            strokeWidth="2"
            fill="none"
          />

          {/* Cold flow */}
          <path
            d="M 15 25 L 20 25 M 17 23 L 20 25 L 17 27"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 100 55 L 105 55 M 102 53 L 105 55 L 102 57"
            stroke="#60a5fa"
            strokeWidth="2"
            fill="none"
          />
        </>
      )}

      {/* Temperature indicators */}
      {data.hotInletTemp && (
        <text x="10" y="30" fontSize="8" fill="#ef4444">
          {data.hotInletTemp}°
        </text>
      )}
      {data.hotOutletTemp && (
        <text x="105" y="50" fontSize="8" fill="#f97316">
          {data.hotOutletTemp}°
        </text>
      )}
    </g>
  );

  const renderPlateExchanger = (
    stroke: string,
    strokeWidth: number,
    _data: HeatExchangerNodeData
  ): React.ReactNode => (
    <g>
      {/* Frame */}
      <rect
        x="30"
        y="20"
        width="60"
        height="40"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Plates */}
      {[35, 42, 49, 56, 63, 70, 77, 84].map((x, i) => (
        <rect
          key={x}
          x={x}
          y="25"
          width="3"
          height="30"
          fill={i % 2 === 0 ? '#e5e7eb' : '#d1d5db'}
          stroke={stroke}
          strokeWidth="0.5"
        />
      ))}

      {/* Ports */}
      <circle cx="30" cy="25" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="90" cy="55" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="30" cy="55" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="90" cy="25" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderAirCooledExchanger = (
    stroke: string,
    strokeWidth: number,
    data: HeatExchangerNodeData
  ): React.ReactNode => (
    <g>
      {/* Tube bundle */}
      <rect
        x="25"
        y="20"
        width="70"
        height="25"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Fins */}
      {data.showFins !== false && [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90].map((x) => (
        <line
          key={x}
          x1={x}
          y1="20"
          x2={x}
          y2="45"
          stroke={stroke}
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}

      {/* Fan */}
      <g transform="translate(60, 55)">
        <circle cx="0" cy="0" r="12" fill="white" stroke={stroke} strokeWidth={strokeWidth} />
        {/* Fan blades */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <path
            key={angle}
            d="M 0 0 L 8 0 L 6 -3 Z"
            fill="#6b7280"
            stroke={stroke}
            strokeWidth="0.5"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="2" fill={stroke} />
      </g>

      {/* Headers */}
      <circle cx="25" cy="32" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="95" cy="32" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderSpiralExchanger = (stroke: string, strokeWidth: number): React.ReactNode => (
    <g>
      {/* Spiral channels */}
      <path
        d="M 60 40 Q 80 40 80 20 T 60 0 T 40 20 T 60 40 T 80 60 T 60 80 T 40 60 T 60 40"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <path
        d="M 60 35 Q 75 35 75 20 T 60 5 T 45 20 T 60 35 T 75 50 T 60 65 T 45 50 T 60 35"
        fill="none"
        stroke="#6b7280"
        strokeWidth="1"
        strokeDasharray="2,2"
      />

      {/* Center core */}
      <circle cx="60" cy="40" r="5" fill="white" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Connections */}
      <circle cx="35" cy="40" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="85" cy="40" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderDoublePipeExchanger = (stroke: string, strokeWidth: number): React.ReactNode => (
    <g>
      {/* Outer pipe */}
      <rect
        x="20"
        y="30"
        width="80"
        height="20"
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Inner pipe */}
      <rect
        x="25"
        y="35"
        width="70"
        height="10"
        fill="#f3f4f6"
        stroke={stroke}
        strokeWidth="1"
      />

      {/* Connections */}
      <circle cx="20" cy="35" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="100" cy="45" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="25" cy="40" r="2.5" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="95" cy="40" r="2.5" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  const renderKettleExchanger = (stroke: string, strokeWidth: number): React.ReactNode => (
    <g>
      {/* Kettle body */}
      <ellipse cx="60" cy="45" rx="40" ry="25" fill="white" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Tube bundle */}
      <rect x="30" y="40" width="60" height="10" fill="#e5e7eb" stroke={stroke} strokeWidth="1" />
      {[35, 42, 49, 56, 63, 70, 77, 84].map((x) => (
        <line
          key={x}
          x1={x}
          y1="42"
          x2={x}
          y2="48"
          stroke={stroke}
          strokeWidth="0.5"
        />
      ))}

      {/* Vapor outlet */}
      <circle cx="60" cy="20" r="4" fill="white" stroke={stroke} strokeWidth="1.5" />
      <line x1="60" y1="24" x2="60" y2="35" stroke={stroke} strokeWidth={strokeWidth} />

      {/* Liquid level */}
      <path
        d="M 25 50 Q 60 52 95 50"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1"
        strokeDasharray="3,2"
      />

      {/* Connections */}
      <circle cx="20" cy="45" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="100" cy="45" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="60" cy="65" r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={{
        ...data,
        dimensions: data.dimensions || {
          width: 140,
          height: 100,
          originX: 70,
          originY: 50,
          scale: 1,
          minScale: 0.5,
          maxScale: 2,
          maintainAspectRatio: true,
          units: 'px'
        },
        connectionPoints: data.connectionPoints || [
          { id: 'hot-in', type: 'inlet', x: 10, y: 35, direction: 180, compatible: ['pipe'], required: true, description: 'Hot fluid inlet' },
          { id: 'hot-out', type: 'outlet', x: 110, y: 45, direction: 0, compatible: ['pipe'], required: true, description: 'Hot fluid outlet' },
          { id: 'cold-in', type: 'inlet', x: 10, y: 55, direction: 180, compatible: ['pipe'], required: true, description: 'Cold fluid inlet' },
          { id: 'cold-out', type: 'outlet', x: 110, y: 25, direction: 0, compatible: ['pipe'], required: true, description: 'Cold fluid outlet' },
        ]
      }}
      selected={selected}
      dragging={dragging}
      renderCustomContent={renderExchangerContent}
    />
  );
});

HeatExchangerNode.displayName = 'HeatExchangerNode';

export default HeatExchangerNode;