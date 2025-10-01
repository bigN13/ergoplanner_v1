/**
 * Valve Positioner Control Elements
 * ISA-5.1 compliant positioner symbols with feedback control
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Positioner types
 */
export type PositionerType =
  | 'pneumatic'
  | 'electro-pneumatic'
  | 'digital'
  | 'smart'
  | 'analog';

/**
 * Feedback mechanism
 */
export type FeedbackMechanism =
  | 'mechanical'
  | 'electronic'
  | 'magnetic'
  | 'optical';

/**
 * Positioner mode
 */
export type PositionerMode =
  | 'position'
  | 'pressure'
  | 'split-range';

/**
 * Positioner data interface
 */
export interface PositionerNodeData extends BaseSymbolData {
  positionerType?: PositionerType;
  feedbackMechanism?: FeedbackMechanism;
  mode?: PositionerMode;
  inputSignal?: string; // e.g., '4-20mA', '3-15psi'
  outputPressure?: { min: number; max: number }; // PSI
  hasBooster?: boolean;
  hasDiagnostics?: boolean;
  positionAccuracy?: number; // % of span
  deadband?: number; // %
}

/**
 * Pneumatic Valve Positioner
 * Classic pneumatic positioner with mechanical feedback
 */
export const PneumaticPositionerNode = memo<{
  id: string;
  data: PositionerNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const feedbackMechanism = data.feedbackMechanism || 'mechanical';

  const nodeData: PositionerNodeData = {
    ...data,
    positionerType: 'pneumatic',
    defaultWidth: 70,
    defaultHeight: 75,
    connectionPoints: [
      { id: 'signal-in', position: 'left', type: 'input', label: 'Signal' },
      { id: 'air-supply', position: 'top', type: 'input', label: 'Supply' },
      { id: 'air-out', position: 'right', type: 'output', label: 'To Actuator' },
      { id: 'feedback', position: 'bottom', type: 'input', label: 'Feedback' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Positioner housing - diamond with feedback loop */}
      <path
        d="M 35 10 L 60 35 L 35 60 L 10 35 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* VP label (Valve Positioner) */}
      <text
        x={35}
        y={32}
        fontSize={11}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        VP
      </text>

      {/* Positioner type */}
      <text
        x={35}
        y={42}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        PNEU
      </text>

      {/* Feedback loop indicator */}
      <g>
        <circle
          cx={35}
          cy={50}
          r={6}
          fill="none"
          stroke="#3498db"
          strokeWidth={1.5}
          strokeDasharray="2,2"
        />
        <path
          d="M 35 44 L 35 56 M 32 50 L 35 53 L 38 50"
          stroke="#3498db"
          strokeWidth={1.2}
          fill="none"
        />
      </g>

      {/* Input signal (pneumatic) */}
      <g>
        <line x1={10} y1={35} x2={3} y2={35} stroke="currentColor" strokeWidth={2} />
        <path d="M 7 35 L 3 32 L 3 38 Z" fill="currentColor" />
        <text x={1} y={32} fontSize={6} fill="currentColor">
          IN
        </text>
      </g>

      {/* Air supply (top) */}
      <g>
        <line x1={35} y1={10} x2={35} y2={3} stroke="currentColor" strokeWidth={2} />
        <text x={35} y={1} fontSize={6} textAnchor="middle" fill="currentColor">
          AIR
        </text>
      </g>

      {/* Output to actuator (right) */}
      <g>
        <line x1={60} y1={35} x2={67} y2={35} stroke="currentColor" strokeWidth={2} />
        <path d="M 63 35 L 67 32 L 67 38 Z" fill="currentColor" />
        <text x={62} y={32} fontSize={6} fill="currentColor">
          OUT
        </text>
      </g>

      {/* Mechanical feedback from valve stem (bottom) */}
      <g>
        <line x1={35} y1={60} x2={35} y2={70} stroke="#3498db" strokeWidth={2} />
        <text x={35} y={72} fontSize={6} textAnchor="middle" fill="#3498db" fontWeight="600">
          STEM
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={73}
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

PneumaticPositionerNode.displayName = 'PneumaticPositionerNode';

/**
 * Electro-Pneumatic Positioner
 * Electric input signal with pneumatic output
 */
export const ElectroPneumaticPositionerNode = memo<{
  id: string;
  data: PositionerNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const inputSignal = data.inputSignal || '4-20mA';
  const hasDiagnostics = data.hasDiagnostics ?? false;

  const nodeData: PositionerNodeData = {
    ...data,
    positionerType: 'electro-pneumatic',
    defaultWidth: 75,
    defaultHeight: 80,
    connectionPoints: [
      { id: 'electric-in', position: 'left', type: 'input', label: 'Electric' },
      { id: 'air-supply', position: 'top', type: 'input', label: 'Supply' },
      { id: 'air-out', position: 'right', type: 'output', label: 'To Actuator' },
      { id: 'feedback', position: 'bottom', type: 'input', label: 'Feedback' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Positioner housing */}
      <path
        d="M 37.5 10 L 65 37.5 L 37.5 65 L 10 37.5 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* E/P label */}
      <text
        x={37.5}
        y={30}
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        E/P
      </text>

      {/* VP label */}
      <text
        x={37.5}
        y={42}
        fontSize={9}
        fontWeight="600"
        textAnchor="middle"
        fill="currentColor"
      >
        VP
      </text>

      {/* Input signal label */}
      <text
        x={37.5}
        y={50}
        fontSize={6}
        textAnchor="middle"
        fill="currentColor"
      >
        {inputSignal}
      </text>

      {/* Feedback loop */}
      <circle
        cx={37.5}
        cy={55}
        r={5}
        fill="none"
        stroke="#3498db"
        strokeWidth={1.5}
        strokeDasharray="2,2"
      />

      {/* Diagnostics indicator */}
      {hasDiagnostics && (
        <circle
          cx={58}
          cy={18}
          r={3}
          fill="#9b59b6"
          stroke="currentColor"
          strokeWidth={0.5}
        />
      )}

      {/* Electric input (left) */}
      <g>
        <line x1={10} y1={37.5} x2={3} y2={37.5} stroke="currentColor" strokeWidth={2} />
        <circle cx={5} cy={37.5} r={1.5} fill="currentColor" />
        <text x={1} y={34} fontSize={6} fill="currentColor">
          +
        </text>
      </g>

      {/* Air supply (top) */}
      <g>
        <line x1={37.5} y1={10} x2={37.5} y2={3} stroke="currentColor" strokeWidth={2} />
        <text x={37.5} y={1} fontSize={6} textAnchor="middle" fill="currentColor">
          AIR
        </text>
      </g>

      {/* Pneumatic output (right) */}
      <g>
        <line x1={65} y1={37.5} x2={72} y2={37.5} stroke="currentColor" strokeWidth={2} />
        <path d="M 68 37.5 L 72 34.5 L 72 40.5 Z" fill="currentColor" />
      </g>

      {/* Mechanical feedback (bottom) */}
      <g>
        <line x1={37.5} y1={65} x2={37.5} y2={75} stroke="#3498db" strokeWidth={2} />
        <text x={37.5} y={77} fontSize={6} textAnchor="middle" fill="#3498db" fontWeight="600">
          STEM
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={37.5}
          y={78}
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

ElectroPneumaticPositionerNode.displayName = 'ElectroPneumaticPositionerNode';

/**
 * Digital Smart Positioner
 * Digital communication with advanced diagnostics
 */
export const DigitalPositionerNode = memo<{
  id: string;
  data: PositionerNodeData & {
    protocol?: 'HART' | 'Foundation Fieldbus' | 'Profibus PA';
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const protocol = data.protocol || 'HART';
  const hasDiagnostics = data.hasDiagnostics ?? true;

  const nodeData: PositionerNodeData = {
    ...data,
    positionerType: 'digital',
    defaultWidth: 80,
    defaultHeight: 85,
    connectionPoints: [
      { id: 'digital-in', position: 'left', type: 'input', label: 'Digital' },
      { id: 'air-supply', position: 'top', type: 'input', label: 'Supply' },
      { id: 'air-out', position: 'right', type: 'output', label: 'To Actuator' },
      { id: 'feedback', position: 'bottom', type: 'input', label: 'Feedback' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Positioner housing - larger for digital */}
      <path
        d="M 40 10 L 70 40 L 40 70 L 10 40 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* SMART VP label */}
      <text
        x={40}
        y={32}
        fontSize={11}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        SMART
      </text>

      <text
        x={40}
        y={42}
        fontSize={9}
        fontWeight="600"
        textAnchor="middle"
        fill="currentColor"
      >
        VP
      </text>

      {/* Protocol label */}
      <text
        x={40}
        y={50}
        fontSize={6}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        {protocol === 'Foundation Fieldbus' ? 'FF' : protocol}
      </text>

      {/* Digital communication indicator */}
      <g>
        <rect
          x={32}
          y={52}
          width={16}
          height={8}
          fill="#2ecc71"
          opacity={0.3}
          rx={2}
        />
        <text
          x={40}
          y={58}
          fontSize={6}
          textAnchor="middle"
          fill="currentColor"
          fontWeight="600"
        >
          DIAG
        </text>
      </g>

      {/* Wireless/Digital indicator */}
      <g>
        <path
          d="M 58 18 Q 62 15 66 18"
          fill="none"
          stroke="#3498db"
          strokeWidth={1}
        />
        <path
          d="M 56 22 Q 62 17 68 22"
          fill="none"
          stroke="#3498db"
          strokeWidth={1}
        />
      </g>

      {/* Digital input */}
      <g>
        <line x1={10} y1={40} x2={3} y2={40} stroke="currentColor" strokeWidth={2} />
        <rect x={5} y={38} width={6} height={4} fill="none" stroke="currentColor" strokeWidth={1} />
      </g>

      {/* Air supply */}
      <g>
        <line x1={40} y1={10} x2={40} y2={3} stroke="currentColor" strokeWidth={2} />
        <text x={40} y={1} fontSize={6} textAnchor="middle" fill="currentColor">
          AIR
        </text>
      </g>

      {/* Pneumatic output */}
      <g>
        <line x1={70} y1={40} x2={77} y2={40} stroke="currentColor" strokeWidth={2} />
        <path d="M 73 40 L 77 37 L 77 43 Z" fill="currentColor" />
      </g>

      {/* Electronic feedback */}
      <g>
        <line x1={40} y1={70} x2={40} y2={80} stroke="#3498db" strokeWidth={2} />
        <rect x={37} y={77} width={6} height={4} fill="none" stroke="#3498db" strokeWidth={1} />
        <text x={40} y={82} fontSize={6} textAnchor="middle" fill="#3498db" fontWeight="600">
          POS
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={40}
          y={83}
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

DigitalPositionerNode.displayName = 'DigitalPositionerNode';

/**
 * Positioner with Booster
 * For high flow applications requiring air volume amplification
 */
export const PositionerWithBoosterNode = memo<{
  id: string;
  data: PositionerNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const nodeData: PositionerNodeData = {
    ...data,
    hasBooster: true,
    defaultWidth: 85,
    defaultHeight: 90,
    connectionPoints: [
      { id: 'signal-in', position: 'left', type: 'input', label: 'Signal' },
      { id: 'air-supply', position: 'top', type: 'input', label: 'Supply' },
      { id: 'booster-supply', position: 'top', type: 'input', label: 'Booster' },
      { id: 'air-out', position: 'right', type: 'output', label: 'To Actuator' },
      { id: 'feedback', position: 'bottom', type: 'input', label: 'Feedback' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Positioner section */}
      <g>
        <path
          d="M 30 15 L 50 35 L 30 55 L 10 35 Z"
          fill="white"
          stroke="currentColor"
          strokeWidth={2}
        />
        <text
          x={30}
          y={38}
          fontSize={9}
          fontWeight="bold"
          textAnchor="middle"
          fill="currentColor"
        >
          VP
        </text>
      </g>

      {/* Booster section */}
      <g transform="translate(30, 0)">
        <rect
          x={20}
          y={25}
          width={25}
          height={20}
          fill="white"
          stroke="currentColor"
          strokeWidth={2}
          rx={2}
        />
        <text
          x={32.5}
          y={38}
          fontSize={8}
          fontWeight="bold"
          textAnchor="middle"
          fill="currentColor"
        >
          BST
        </text>

        {/* Booster air supply */}
        <line x1={32.5} y1={25} x2={32.5} y2={15} stroke="currentColor" strokeWidth={2} />
        <text x={32.5} y={13} fontSize={6} textAnchor="middle" fill="currentColor">
          BOOST
        </text>
      </g>

      {/* Connection between positioner and booster */}
      <line x1={50} y1={35} x2={50} y2={35} stroke="currentColor" strokeWidth={2} />

      {/* Input signal */}
      <g>
        <line x1={10} y1={35} x2={3} y2={35} stroke="currentColor" strokeWidth={2} />
        <text x={1} y={32} fontSize={6} fill="currentColor">
          IN
        </text>
      </g>

      {/* Positioner air supply */}
      <g>
        <line x1={30} y1={15} x2={30} y2={8} stroke="currentColor" strokeWidth={2} />
        <text x={30} y={6} fontSize={6} textAnchor="middle" fill="currentColor">
          AIR
        </text>
      </g>

      {/* Boosted output */}
      <g>
        <line x1={75} y1={35} x2={82} y2={35} stroke="currentColor" strokeWidth={2.5} />
        <path d="M 78 35 L 82 32 L 82 38 Z" fill="currentColor" />
        <text x={77} y={32} fontSize={6} fill="currentColor" fontWeight="600">
          OUT
        </text>
      </g>

      {/* Feedback */}
      <g>
        <line x1={30} y1={55} x2={30} y2={85} stroke="#3498db" strokeWidth={2} />
        <text x={30} y={87} fontSize={6} textAnchor="middle" fill="#3498db" fontWeight="600">
          STEM
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={42}
          y={88}
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

PositionerWithBoosterNode.displayName = 'PositionerWithBoosterNode';
