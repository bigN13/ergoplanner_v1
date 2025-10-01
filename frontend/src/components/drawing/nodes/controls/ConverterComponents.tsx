/**
 * Converter and Signal Conditioner Control Elements
 * ISA-5.1 compliant converter symbols for signal conversion
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Converter types
 */
export type ConverterType =
  | 'I/P'    // Current to Pneumatic
  | 'P/I'    // Pneumatic to Current
  | 'E/P'    // Voltage to Pneumatic
  | 'P/E'    // Pneumatic to Voltage
  | 'A/D'    // Analog to Digital
  | 'D/A'    // Digital to Analog
  | 'signal-conditioner'
  | 'isolator'
  | 'repeater';

/**
 * Input signal types
 */
export type InputSignalType =
  | '4-20mA'
  | '0-10V'
  | '3-15psi'
  | '6-30psi'
  | 'digital'
  | 'HART'
  | 'Fieldbus';

/**
 * Output signal types
 */
export type OutputSignalType = InputSignalType;

/**
 * Converter data interface
 */
export interface ConverterNodeData extends BaseSymbolData {
  converterType?: ConverterType;
  inputSignal?: InputSignalType;
  outputSignal?: OutputSignalType;
  inputRange?: { min: number; max: number };
  outputRange?: { min: number; max: number };
  hasIsolation?: boolean; // Galvanic isolation
  accuracy?: number; // % of span
  responseTime?: number; // milliseconds
  powerSupply?: string;
}

/**
 * I/P Converter (Current to Pneumatic)
 * Most common in valve control applications
 */
export const IPConverterNode = memo<{
  id: string;
  data: ConverterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const inputSignal = data.inputSignal || '4-20mA';
  const outputSignal = data.outputSignal || '3-15psi';

  const nodeData: ConverterNodeData = {
    ...data,
    converterType: 'I/P',
    defaultWidth: 70,
    defaultHeight: 60,
    connectionPoints: [
      { id: 'electric-in', position: 'left', type: 'input', label: 'Electric' },
      { id: 'pneumatic-out', position: 'right', type: 'output', label: 'Pneumatic' },
      { id: 'air-supply', position: 'top', type: 'input', label: 'Supply' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Converter housing - diamond shape */}
      <path
        d="M 35 10 L 60 30 L 35 50 L 10 30 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* I/P label */}
      <text
        x={35}
        y={28}
        fontSize={11}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        I/P
      </text>

      {/* Input signal */}
      <text
        x={35}
        y={38}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
      >
        {inputSignal}
      </text>

      {/* Output signal */}
      <text
        x={35}
        y={45}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
      >
        {outputSignal}
      </text>

      {/* Electric input (left) */}
      <g>
        <line x1={10} y1={30} x2={3} y2={30} stroke="currentColor" strokeWidth={2} />
        <circle cx={5} cy={30} r={1.5} fill="currentColor" />
        <text x={1} y={27} fontSize={6} fill="currentColor">
          +
        </text>
      </g>

      {/* Pneumatic output (right) */}
      <g>
        <line x1={60} y1={30} x2={67} y2={30} stroke="currentColor" strokeWidth={2} />
        {/* Pneumatic symbol - triangle */}
        <path
          d="M 63 30 L 67 27 L 67 33 Z"
          fill="currentColor"
        />
      </g>

      {/* Air supply (top) */}
      <g>
        <line x1={35} y1={10} x2={35} y2={3} stroke="currentColor" strokeWidth={1.5} />
        <text x={35} y={1} fontSize={6} textAnchor="middle" fill="currentColor">
          AIR
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={58}
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

IPConverterNode.displayName = 'IPConverterNode';

/**
 * P/I Converter (Pneumatic to Current)
 * Converts pneumatic signal to electrical
 */
export const PIConverterNode = memo<{
  id: string;
  data: ConverterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const inputSignal = data.inputSignal || '3-15psi';
  const outputSignal = data.outputSignal || '4-20mA';

  const nodeData: ConverterNodeData = {
    ...data,
    converterType: 'P/I',
    defaultWidth: 70,
    defaultHeight: 60,
    connectionPoints: [
      { id: 'pneumatic-in', position: 'left', type: 'input', label: 'Pneumatic' },
      { id: 'electric-out', position: 'right', type: 'output', label: 'Electric' },
      { id: 'power', position: 'top', type: 'input', label: 'Power' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Converter housing - diamond shape */}
      <path
        d="M 35 10 L 60 30 L 35 50 L 10 30 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* P/I label */}
      <text
        x={35}
        y={28}
        fontSize={11}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        P/I
      </text>

      {/* Input signal */}
      <text
        x={35}
        y={38}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
      >
        {inputSignal}
      </text>

      {/* Output signal */}
      <text
        x={35}
        y={45}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
      >
        {outputSignal}
      </text>

      {/* Pneumatic input (left) */}
      <g>
        <line x1={10} y1={30} x2={3} y2={30} stroke="currentColor" strokeWidth={2} />
        <path
          d="M 7 30 L 3 27 L 3 33 Z"
          fill="currentColor"
        />
      </g>

      {/* Electric output (right) */}
      <g>
        <line x1={60} y1={30} x2={67} y2={30} stroke="currentColor" strokeWidth={2} />
        <circle cx={65} cy={30} r={1.5} fill="currentColor" />
        <text x={66} y={27} fontSize={6} fill="currentColor">
          +
        </text>
      </g>

      {/* Power supply (top) */}
      <g>
        <line x1={35} y1={10} x2={35} y2={3} stroke="currentColor" strokeWidth={1.5} />
        <text x={35} y={1} fontSize={6} textAnchor="middle" fill="currentColor">
          PWR
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={58}
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

PIConverterNode.displayName = 'PIConverterNode';

/**
 * E/P Converter (Voltage to Pneumatic)
 */
export const EPConverterNode = memo<{
  id: string;
  data: ConverterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const inputSignal = data.inputSignal || '0-10V';
  const outputSignal = data.outputSignal || '3-15psi';

  const nodeData: ConverterNodeData = {
    ...data,
    converterType: 'E/P',
    defaultWidth: 70,
    defaultHeight: 60,
    tag: data.tag || 'E/P-001',
  };

  const converterData: ConverterNodeData = {
    ...nodeData,
    inputSignal,
    outputSignal,
  };

  // Reuse I/P converter rendering with different label
  return (
    <IPConverterNode
      id={id}
      data={converterData}
      selected={selected}
      dragging={dragging}
    />
  );
});

EPConverterNode.displayName = 'EPConverterNode';

/**
 * Signal Conditioner
 * General purpose signal conditioning (amplification, filtering, isolation)
 */
export const SignalConditionerNode = memo<{
  id: string;
  data: ConverterNodeData & {
    functions?: ('amplify' | 'filter' | 'isolate' | 'linearize')[];
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const functions = data.functions || ['amplify', 'filter'];
  const hasIsolation = data.hasIsolation ?? false;

  const nodeData: ConverterNodeData = {
    ...data,
    converterType: 'signal-conditioner',
    defaultWidth: 75,
    defaultHeight: 65,
    connectionPoints: [
      { id: 'in', position: 'left', type: 'input', label: 'IN' },
      { id: 'out', position: 'right', type: 'output', label: 'OUT' },
      { id: 'power', position: 'top', type: 'input', label: 'Power' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Conditioner housing - rectangle */}
      <rect
        x={15}
        y={18}
        width={45}
        height={30}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
        rx={2}
      />

      {/* SC label */}
      <text
        x={37.5}
        y={30}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        SC
      </text>

      {/* Function indicators */}
      <g>
        {functions.includes('amplify') && (
          <text x={20} y={42} fontSize={6} fill="currentColor">
            AMP
          </text>
        )}
        {functions.includes('filter') && (
          <text x={35} y={42} fontSize={6} fill="currentColor">
            FLT
          </text>
        )}
        {functions.includes('isolate') && (
          <text x={48} y={42} fontSize={6} fill="currentColor">
            ISO
          </text>
        )}
      </g>

      {/* Isolation barrier indicator */}
      {hasIsolation && (
        <line
          x1={37.5}
          y1={20}
          x2={37.5}
          y2={46}
          stroke="#9b59b6"
          strokeWidth={2}
          strokeDasharray="2,2"
        />
      )}

      {/* Input */}
      <g>
        <line x1={15} y1={33} x2={8} y2={33} stroke="currentColor" strokeWidth={2} />
        <text x={5} y={30} fontSize={7} fill="currentColor">
          IN
        </text>
      </g>

      {/* Output */}
      <g>
        <line x1={60} y1={33} x2={67} y2={33} stroke="currentColor" strokeWidth={2} />
        <text x={63} y={30} fontSize={7} fill="currentColor">
          OUT
        </text>
      </g>

      {/* Power */}
      <g>
        <line x1={37.5} y1={18} x2={37.5} y2={10} stroke="currentColor" strokeWidth={1.5} />
        <text x={37.5} y={8} fontSize={6} textAnchor="middle" fill="currentColor">
          PWR
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={37.5}
          y={62}
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

SignalConditionerNode.displayName = 'SignalConditionerNode';

/**
 * Signal Isolator
 * Provides galvanic isolation between input and output
 */
export const SignalIsolatorNode = memo<{
  id: string;
  data: ConverterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const inputSignal = data.inputSignal || '4-20mA';
  const outputSignal = data.outputSignal || '4-20mA';

  const nodeData: ConverterNodeData = {
    ...data,
    converterType: 'isolator',
    hasIsolation: true,
    defaultWidth: 70,
    defaultHeight: 60,
    connectionPoints: [
      { id: 'in', position: 'left', type: 'input', label: 'IN' },
      { id: 'out', position: 'right', type: 'output', label: 'OUT' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Isolator housing - rectangle */}
      <rect
        x={15}
        y={20}
        width={40}
        height={25}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
        rx={2}
      />

      {/* ISO label */}
      <text
        x={35}
        y={30}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        ISO
      </text>

      {/* Isolation barrier - vertical dashed line */}
      <line
        x1={35}
        y1={22}
        x2={35}
        y2={43}
        stroke="#9b59b6"
        strokeWidth={2.5}
        strokeDasharray="2,2"
      />

      {/* Input coil (left side) */}
      <g>
        <circle cx={25} cy={32} r={6} fill="none" stroke="currentColor" strokeWidth={1} />
        <path
          d="M 22 29 Q 25 32 22 35"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        />
      </g>

      {/* Output coil (right side) */}
      <g>
        <circle cx={45} cy={32} r={6} fill="none" stroke="currentColor" strokeWidth={1} />
        <path
          d="M 48 29 Q 45 32 48 35"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        />
      </g>

      {/* Signal labels */}
      <text
        x={35}
        y={42}
        fontSize={6}
        textAnchor="middle"
        fill="currentColor"
      >
        {inputSignal} → {outputSignal}
      </text>

      {/* Input connection */}
      <line x1={15} y1={32} x2={8} y2={32} stroke="currentColor" strokeWidth={2} />

      {/* Output connection */}
      <line x1={55} y1={32} x2={62} y2={32} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={58}
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

SignalIsolatorNode.displayName = 'SignalIsolatorNode';

/**
 * Signal Repeater/Amplifier
 * Boosts or repeats signal for long distances
 */
export const SignalRepeaterNode = memo<{
  id: string;
  data: ConverterNodeData & {
    gain?: number;
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const gain = data.gain || 1.0;

  const nodeData: ConverterNodeData = {
    ...data,
    converterType: 'repeater',
    defaultWidth: 60,
    defaultHeight: 50,
    connectionPoints: [
      { id: 'in', position: 'left', type: 'input', label: 'IN' },
      { id: 'out', position: 'right', type: 'output', label: 'OUT' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Amplifier triangle */}
      <path
        d="M 15 30 L 50 18 L 50 42 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Gain label */}
      <text
        x={32}
        y={32}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        {gain === 1 ? 'RPT' : `×${gain}`}
      </text>

      {/* Input */}
      <line x1={15} y1={30} x2={8} y2={30} stroke="currentColor" strokeWidth={2} />

      {/* Output */}
      <line x1={50} y1={30} x2={57} y2={30} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={32}
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

SignalRepeaterNode.displayName = 'SignalRepeaterNode';
