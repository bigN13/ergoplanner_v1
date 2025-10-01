/**
 * Indicator Control Elements
 * ISA-5.1 compliant indicator symbols (hexagon for local, square for remote)
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Indicator types
 */
export type IndicatorType =
  | 'local'
  | 'panel'
  | 'digital'
  | 'analog'
  | 'recorder'
  | 'totalizer';

/**
 * Display format
 */
export type DisplayFormat =
  | 'numeric'
  | 'bar-graph'
  | 'trend'
  | 'multi-variable';

/**
 * Measurement units
 */
export type MeasurementUnits = string; // e.g., 'psi', 'GPM', '°F', '%'

/**
 * Indicator data interface
 */
export interface IndicatorNodeData extends BaseSymbolData {
  indicatorType?: IndicatorType;
  displayFormat?: DisplayFormat;
  measurementVariable?: string; // F, P, T, L, A
  units?: MeasurementUnits;
  currentValue?: number;
  hasAlarm?: boolean;
  alarmHigh?: number;
  alarmLow?: number;
  digits?: number; // Number of display digits
  hasBacklight?: boolean;
}

/**
 * Local Indicator
 * Hexagon symbol per ISA-5.1 for field-mounted indicators
 */
export const LocalIndicatorNode = memo<{
  id: string;
  data: IndicatorNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const measurementVariable = data.measurementVariable || 'I';
  const displayFormat = data.displayFormat || 'numeric';

  const nodeData: IndicatorNodeData = {
    ...data,
    indicatorType: 'local',
    defaultWidth: 60,
    defaultHeight: 60,
    connectionPoints: [
      { id: 'signal', position: 'bottom', type: 'input', label: 'Signal' },
    ],
  };

  // Hexagon points (inscribed in circle of radius 20)
  const hexagonPoints = (() => {
    const r = 20;
    const cx = 30;
    const cy = 30;
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6; // Start at 30° for flat top
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  })();

  const renderContent = () => (
    <g>
      {/* Hexagon - local indicator per ISA-5.1 */}
      <polygon
        points={hexagonPoints}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Measurement variable */}
      <text
        x={30}
        y={28}
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        {measurementVariable}
      </text>

      {/* I for Indicator */}
      <text
        x={30}
        y={38}
        fontSize={10}
        fontWeight="600"
        textAnchor="middle"
        fill="currentColor"
      >
        I
      </text>

      {/* Current value display if available */}
      {data.currentValue !== undefined && (
        <text
          x={30}
          y={46}
          fontSize={6}
          textAnchor="middle"
          fill="#2ecc71"
          fontWeight="600"
        >
          {data.currentValue.toFixed(1)}
        </text>
      )}

      {/* Alarm indicator */}
      {data.hasAlarm && (
        <circle
          cx={45}
          cy={15}
          r={3}
          fill="#e74c3c"
          stroke="currentColor"
          strokeWidth={0.5}
        />
      )}

      {/* Signal connection */}
      <line x1={30} y1={50} x2={30} y2={58} stroke="currentColor" strokeWidth={1.5} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={30}
          y={57}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

LocalIndicatorNode.displayName = 'LocalIndicatorNode';

/**
 * Panel Indicator
 * Square symbol for control room/panel mounted indicators
 */
export const PanelIndicatorNode = memo<{
  id: string;
  data: IndicatorNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const measurementVariable = data.measurementVariable || 'I';
  const displayFormat = data.displayFormat || 'numeric';

  const nodeData: IndicatorNodeData = {
    ...data,
    indicatorType: 'panel',
    defaultWidth: 65,
    defaultHeight: 65,
    connectionPoints: [
      { id: 'signal', position: 'bottom', type: 'input', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Square - panel indicator */}
      <rect
        x={15}
        y={15}
        width={35}
        height={35}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
        rx={2}
      />

      {/* Measurement variable */}
      <text
        x={32.5}
        y={30}
        fontSize={13}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        {measurementVariable}
      </text>

      {/* I for Indicator */}
      <text
        x={32.5}
        y={42}
        fontSize={9}
        fontWeight="600"
        textAnchor="middle"
        fill="currentColor"
      >
        I
      </text>

      {/* Display format indicator */}
      {displayFormat === 'digital' && (
        <rect
          x={18}
          y={43}
          width={29}
          height={5}
          fill="#2ecc71"
          opacity={0.3}
          rx={1}
        />
      )}

      {/* Alarm indicator */}
      {data.hasAlarm && (
        <circle
          cx={46}
          cy={18}
          r={3}
          fill="#e74c3c"
          stroke="currentColor"
          strokeWidth={0.5}
        />
      )}

      {/* Signal connection */}
      <line x1={32.5} y1={50} x2={32.5} y2={62} stroke="currentColor" strokeWidth={1.5} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={32.5}
          y={60}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

PanelIndicatorNode.displayName = 'PanelIndicatorNode';

/**
 * Digital Display Indicator
 * Modern digital display with numeric readout
 */
export const DigitalIndicatorNode = memo<{
  id: string;
  data: IndicatorNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const digits = data.digits || 4;
  const currentValue = data.currentValue ?? 0;
  const units = data.units || '';

  const nodeData: IndicatorNodeData = {
    ...data,
    indicatorType: 'digital',
    displayFormat: 'numeric',
    defaultWidth: 80,
    defaultHeight: 50,
    connectionPoints: [
      { id: 'signal', position: 'left', type: 'input', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Display housing */}
      <rect
        x={10}
        y={15}
        width={60}
        height={25}
        fill="#1a1a1a"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* LCD/LED screen */}
      <rect
        x={13}
        y={18}
        width={54}
        height={19}
        fill="#2d5016"
        stroke="#444"
        strokeWidth={1}
        rx={2}
      />

      {/* Digital readout */}
      <text
        x={40}
        y={32}
        fontSize={12}
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="middle"
        fill="#7dff33"
      >
        {currentValue.toFixed(digits - Math.floor(currentValue).toString().length)}
      </text>

      {/* Units */}
      {units && (
        <text
          x={65}
          y={32}
          fontSize={8}
          fontWeight="600"
          fill="#7dff33"
        >
          {units}
        </text>
      )}

      {/* Alarm LEDs */}
      {data.hasAlarm && (
        <g>
          {/* High alarm LED */}
          <circle
            cx={15}
            cy={20}
            r={2}
            fill={currentValue > (data.alarmHigh || 100) ? '#e74c3c' : '#555'}
          />
          {/* Low alarm LED */}
          <circle
            cx={15}
            cy={35}
            r={2}
            fill={currentValue < (data.alarmLow || 0) ? '#e74c3c' : '#555'}
          />
        </g>
      )}

      {/* Backlight indicator */}
      {data.hasBacklight && (
        <circle
          cx={65}
          cy={20}
          r={1.5}
          fill="#3498db"
        />
      )}

      {/* Signal connection */}
      <line x1={10} y1={27} x2={3} y2={27} stroke="currentColor" strokeWidth={1.5} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={40}
          y={48}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

DigitalIndicatorNode.displayName = 'DigitalIndicatorNode';

/**
 * Analog Gauge Indicator
 * Traditional dial gauge with needle
 */
export const AnalogGaugeIndicatorNode = memo<{
  id: string;
  data: IndicatorNodeData & {
    minScale?: number;
    maxScale?: number;
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const minScale = data.minScale || 0;
  const maxScale = data.maxScale || 100;
  const currentValue = data.currentValue ?? 50;

  // Calculate needle angle (-45° to 225°)
  const valuePercent = (currentValue - minScale) / (maxScale - minScale);
  const needleAngle = -45 + valuePercent * 270;

  const nodeData: IndicatorNodeData = {
    ...data,
    indicatorType: 'analog',
    displayFormat: 'numeric',
    defaultWidth: 70,
    defaultHeight: 70,
    connectionPoints: [
      { id: 'signal', position: 'bottom', type: 'input', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Gauge bezel */}
      <circle
        cx={35}
        cy={35}
        r={24}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Scale markings */}
      {Array.from({ length: 11 }).map((_, i) => {
        const angle = -45 + i * 27; // 270° range / 10 divisions
        const rad = (angle * Math.PI) / 180;
        const x1 = 35 + 20 * Math.cos(rad);
        const y1 = 35 + 20 * Math.sin(rad);
        const x2 = 35 + (i % 2 === 0 ? 17 : 18) * Math.cos(rad);
        const y2 = 35 + (i % 2 === 0 ? 17 : 18) * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={i % 2 === 0 ? 1.5 : 1}
          />
        );
      })}

      {/* Min/max labels */}
      <text x={20} y={52} fontSize={6} fill="currentColor">
        {minScale}
      </text>
      <text x={45} y={52} fontSize={6} fill="currentColor">
        {maxScale}
      </text>

      {/* Needle */}
      <line
        x1={35}
        y1={35}
        x2={35 + 15 * Math.cos((needleAngle * Math.PI) / 180)}
        y2={35 + 15 * Math.sin((needleAngle * Math.PI) / 180)}
        stroke="#e74c3c"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Center pivot */}
      <circle cx={35} cy={35} r={2.5} fill="currentColor" />

      {/* Units label */}
      {data.units && (
        <text
          x={35}
          y={48}
          fontSize={6}
          textAnchor="middle"
          fill="currentColor"
        >
          {data.units}
        </text>
      )}

      {/* Signal connection */}
      <line x1={35} y1={59} x2={35} y2={68} stroke="currentColor" strokeWidth={1.5} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={67}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

AnalogGaugeIndicatorNode.displayName = 'AnalogGaugeIndicatorNode';

/**
 * Recorder Indicator
 * Circular chart recorder symbol
 */
export const RecorderIndicatorNode = memo<{
  id: string;
  data: IndicatorNodeData & {
    numberOfPens?: number;
    chartSpeed?: string;
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const numberOfPens = data.numberOfPens || 1;
  const measurementVariable = data.measurementVariable || 'R';

  const nodeData: IndicatorNodeData = {
    ...data,
    indicatorType: 'recorder',
    defaultWidth: 70,
    defaultHeight: 70,
    connectionPoints: Array.from({ length: numberOfPens }, (_, i) => ({
      id: `pen${i + 1}`,
      position: 'left' as const,
      type: 'input' as const,
      label: `Pen ${i + 1}`,
    })),
  };

  const renderContent = () => (
    <g>
      {/* Recorder circle */}
      <circle
        cx={35}
        cy={35}
        r={22}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Chart pattern */}
      <g opacity={0.3}>
        {/* Grid lines */}
        <line x1={15} y1={35} x2={55} y2={35} stroke="currentColor" strokeWidth={0.5} />
        <line x1={35} y1={15} x2={35} y2={55} stroke="currentColor" strokeWidth={0.5} />
        {/* Trend lines */}
        <path
          d="M 18 40 Q 25 30 32 35 Q 39 38 46 32"
          fill="none"
          stroke="#e74c3c"
          strokeWidth={1.5}
        />
      </g>

      {/* Measurement variable */}
      <text
        x={35}
        y={28}
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        {measurementVariable}
      </text>

      {/* R for Recorder */}
      <text
        x={35}
        y={48}
        fontSize={10}
        fontWeight="600"
        textAnchor="middle"
        fill="currentColor"
      >
        R
      </text>

      {/* Number of pens indicator */}
      {numberOfPens > 1 && (
        <text
          x={50}
          y={20}
          fontSize={7}
          fill="currentColor"
          fontWeight="600"
        >
          ×{numberOfPens}
        </text>
      )}

      {/* Input connections */}
      {Array.from({ length: Math.min(numberOfPens, 3) }).map((_, i) => {
        const y = 25 + i * 10;
        return (
          <line
            key={i}
            x1={13}
            y1={y}
            x2={8}
            y2={y}
            stroke="currentColor"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={67}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

RecorderIndicatorNode.displayName = 'RecorderIndicatorNode';

/**
 * Totalizer Indicator
 * Integrating/totaling indicator for flow, energy, etc.
 */
export const TotalizerIndicatorNode = memo<{
  id: string;
  data: IndicatorNodeData & {
    totalValue?: number;
    resetable?: boolean;
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const totalValue = data.totalValue ?? 0;
  const resetable = data.resetable ?? true;

  const nodeData: IndicatorNodeData = {
    ...data,
    indicatorType: 'totalizer',
    defaultWidth: 70,
    defaultHeight: 65,
    connectionPoints: [
      { id: 'signal', position: 'left', type: 'input', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Totalizer housing */}
      <rect
        x={15}
        y={15}
        width={40}
        height={35}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* Sigma symbol (summation) */}
      <text
        x={35}
        y={28}
        fontSize={16}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        Σ
      </text>

      {/* Total value display */}
      <rect
        x={18}
        y={32}
        width={34}
        height={14}
        fill="#1a1a1a"
        stroke="#444"
        strokeWidth={1}
        rx={2}
      />

      <text
        x={35}
        y={42}
        fontSize={8}
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="middle"
        fill="#7dff33"
      >
        {totalValue.toFixed(0)}
      </text>

      {/* Reset button indicator */}
      {resetable && (
        <rect
          x={46}
          y={18}
          width={6}
          height={6}
          fill="#e74c3c"
          stroke="currentColor"
          strokeWidth={0.5}
          rx={1}
        />
      )}

      {/* Signal connection */}
      <line x1={15} y1={32} x2={8} y2={32} stroke="currentColor" strokeWidth={1.5} />

      {/* Units */}
      {data.units && (
        <text
          x={35}
          y={56}
          fontSize={7}
          textAnchor="middle"
          fill="currentColor"
        >
          {data.units}
        </text>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={63}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      id={id}
      data={nodeData}
      selected={selected}
      dragging={dragging}
      renderContent={renderContent}
    />
  );
});

TotalizerIndicatorNode.displayName = 'TotalizerIndicatorNode';
