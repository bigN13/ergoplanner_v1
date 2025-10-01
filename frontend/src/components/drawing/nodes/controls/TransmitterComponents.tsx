/**
 * Transmitter Control Elements
 * ISA-5.1 compliant transmitter symbols with communication protocols
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Communication protocols
 */
export type CommunicationProtocol =
  | '4-20mA'
  | 'HART'
  | 'Foundation Fieldbus'
  | 'Profibus PA'
  | 'Modbus'
  | 'EtherNet/IP'
  | 'WirelessHART'
  | 'IO-Link';

/**
 * Transmitter types
 */
export type TransmitterType =
  | 'analog'
  | 'smart'
  | 'wireless'
  | 'multivariable';

/**
 * Measurement variables
 */
export type MeasurementVariable =
  | 'flow'
  | 'temperature'
  | 'pressure'
  | 'level'
  | 'analytical'
  | 'multivariable';

/**
 * Base transmitter data
 */
export interface TransmitterNodeData extends BaseSymbolData {
  transmitterType?: TransmitterType;
  protocol?: CommunicationProtocol;
  measurementVariable?: MeasurementVariable;
  tagPrefix?: string; // FT, PT, LT, TT, AT
  rangeMin?: number;
  rangeMax?: number;
  units?: string;
  accuracy?: number; // % of span
  hasDiagnostics?: boolean;
  isPowered?: boolean; // Loop-powered vs separately powered
  enclosureRating?: string; // IP65, NEMA 4X, etc.
}

/**
 * Generic Transmitter Component
 * Square symbol per ISA-5.1 with protocol indication
 */
export const TransmitterNode = memo<{
  id: string;
  data: TransmitterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const protocol = data.protocol || '4-20mA';
  const transmitterType = data.transmitterType || 'analog';
  const tagPrefix = data.tagPrefix || 'XT';
  const hasDiagnostics = data.hasDiagnostics ?? (transmitterType === 'smart');

  const nodeData: TransmitterNodeData = {
    ...data,
    defaultWidth: 60,
    defaultHeight: 70,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
      { id: 'power', position: 'left', type: 'input', label: 'Power' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Transmitter housing - square per ISA-5.1 */}
      <rect
        x={15}
        y={20}
        width={30}
        height={30}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
        rx={2}
      />

      {/* Measurement variable indicator */}
      {data.measurementVariable && (
        <text
          x={30}
          y={32}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
          fill="currentColor"
        >
          {data.measurementVariable.substring(0, 1).toUpperCase()}
        </text>
      )}

      {/* Protocol label */}
      <text
        x={30}
        y={42}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        {protocol === '4-20mA' ? '4-20mA' :
         protocol === 'HART' ? 'HART' :
         protocol === 'Foundation Fieldbus' ? 'FF' :
         protocol === 'Profibus PA' ? 'PA' :
         protocol === 'Modbus' ? 'MB' :
         protocol === 'EtherNet/IP' ? 'E/IP' :
         protocol === 'WirelessHART' ? 'WH' :
         'IO-L'}
      </text>

      {/* Smart/Digital indicator */}
      {transmitterType === 'smart' && (
        <circle
          cx={42}
          cy={22}
          r={3}
          fill="#2ecc71"
          stroke="currentColor"
          strokeWidth={0.5}
        />
      )}

      {/* Wireless indicator */}
      {transmitterType === 'wireless' && (
        <g>
          <path
            d="M 38 24 Q 40 22 42 24"
            fill="none"
            stroke="#3498db"
            strokeWidth={1}
          />
          <path
            d="M 36 26 Q 40 21 44 26"
            fill="none"
            stroke="#3498db"
            strokeWidth={1}
          />
        </g>
      )}

      {/* Diagnostics indicator */}
      {hasDiagnostics && (
        <text
          x={18}
          y={48}
          fontSize={6}
          fill="#9b59b6"
          fontWeight="600"
        >
          DIAG
        </text>
      )}

      {/* Terminal connections */}
      <g>
        {/* Signal out (top) */}
        <line x1={30} y1={20} x2={30} y2={10} stroke="currentColor" strokeWidth={1.5} />
        <rect x={27} y={8} width={6} height={4} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />
        <text x={30} y={6} fontSize={6} textAnchor="middle" fill="currentColor">+</text>

        {/* Process connection (bottom) */}
        <line x1={30} y1={50} x2={30} y2={65} stroke="currentColor" strokeWidth={2} />

        {/* Power (left) - if separately powered */}
        {!data.isPowered && (
          <>
            <line x1={15} y1={35} x2={8} y2={35} stroke="currentColor" strokeWidth={1.5} />
            <text x={5} y={37} fontSize={5} fill="currentColor">PWR</text>
          </>
        )}
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={30}
          y={62}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}

      {/* Range display */}
      {data.rangeMin !== undefined && data.rangeMax !== undefined && (
        <text
          x={50}
          y={35}
          fontSize={6}
          fill="currentColor"
        >
          {data.rangeMin}-{data.rangeMax}
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

TransmitterNode.displayName = 'TransmitterNode';

/**
 * Flow Transmitter (FT)
 */
export const FlowTransmitterNode = memo<{
  id: string;
  data: TransmitterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const transmitterData: TransmitterNodeData = {
    ...data,
    measurementVariable: 'flow',
    tagPrefix: 'FT',
    tag: data.tag || 'FT-101',
  };

  return <TransmitterNode id={id} data={transmitterData} selected={selected} dragging={dragging} />;
});

FlowTransmitterNode.displayName = 'FlowTransmitterNode';

/**
 * Pressure Transmitter (PT)
 */
export const PressureTransmitterNode = memo<{
  id: string;
  data: TransmitterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const transmitterData: TransmitterNodeData = {
    ...data,
    measurementVariable: 'pressure',
    tagPrefix: 'PT',
    tag: data.tag || 'PT-201',
  };

  return <TransmitterNode id={id} data={transmitterData} selected={selected} dragging={dragging} />;
});

PressureTransmitterNode.displayName = 'PressureTransmitterNode';

/**
 * Temperature Transmitter (TT)
 */
export const TemperatureTransmitterNode = memo<{
  id: string;
  data: TransmitterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const transmitterData: TransmitterNodeData = {
    ...data,
    measurementVariable: 'temperature',
    tagPrefix: 'TT',
    tag: data.tag || 'TT-301',
  };

  return <TransmitterNode id={id} data={transmitterData} selected={selected} dragging={dragging} />;
});

TemperatureTransmitterNode.displayName = 'TemperatureTransmitterNode';

/**
 * Level Transmitter (LT)
 */
export const LevelTransmitterNode = memo<{
  id: string;
  data: TransmitterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const transmitterData: TransmitterNodeData = {
    ...data,
    measurementVariable: 'level',
    tagPrefix: 'LT',
    tag: data.tag || 'LT-401',
  };

  return <TransmitterNode id={id} data={transmitterData} selected={selected} dragging={dragging} />;
});

LevelTransmitterNode.displayName = 'LevelTransmitterNode';

/**
 * Analytical Transmitter (AT)
 */
export const AnalyticalTransmitterNode = memo<{
  id: string;
  data: TransmitterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const transmitterData: TransmitterNodeData = {
    ...data,
    measurementVariable: 'analytical',
    tagPrefix: 'AT',
    tag: data.tag || 'AT-501',
  };

  return <TransmitterNode id={id} data={transmitterData} selected={selected} dragging={dragging} />;
});

AnalyticalTransmitterNode.displayName = 'AnalyticalTransmitterNode';

/**
 * Multivariable Transmitter
 * Measures multiple variables simultaneously (e.g., mass flow)
 */
export const MultivariableTransmitterNode = memo<{
  id: string;
  data: TransmitterNodeData & {
    variables?: MeasurementVariable[];
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const variables = data.variables || ['flow', 'pressure', 'temperature'];

  const nodeData: TransmitterNodeData = {
    ...data,
    transmitterType: 'multivariable',
    defaultWidth: 70,
    defaultHeight: 80,
    tag: data.tag || 'MV-601',
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Transmitter housing - larger square */}
      <rect
        x={15}
        y={20}
        width={40}
        height={40}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
        rx={2}
      />

      {/* Multiple variable indicators */}
      <g>
        {variables.slice(0, 3).map((variable, i) => (
          <text
            key={i}
            x={22 + i * 13}
            y={35}
            fontSize={8}
            fontWeight="bold"
            textAnchor="middle"
            fill="currentColor"
          >
            {variable.substring(0, 1).toUpperCase()}
          </text>
        ))}
      </g>

      {/* Protocol */}
      <text
        x={35}
        y={50}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        {data.protocol || 'FF'}
      </text>

      {/* Smart indicator */}
      <circle
        cx={50}
        cy={23}
        r={3}
        fill="#2ecc71"
        stroke="currentColor"
        strokeWidth={0.5}
      />

      {/* Terminal connections */}
      <line x1={35} y1={20} x2={35} y2={10} stroke="currentColor" strokeWidth={1.5} />
      <rect x={32} y={8} width={6} height={4} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Process connection */}
      <line x1={35} y1={60} x2={35} y2={75} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={72}
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

MultivariableTransmitterNode.displayName = 'MultivariableTransmitterNode';
