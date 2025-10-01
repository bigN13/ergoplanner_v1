/**
 * Controller Control Elements
 * ISA-5.1 compliant controller symbols (circular per standard)
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Controller types
 */
export type ControllerType =
  | 'PID'
  | 'PI'
  | 'PD'
  | 'P'
  | 'cascade'
  | 'ratio'
  | 'selector'
  | 'split-range'
  | 'feedforward'
  | 'adaptive'
  | 'model-predictive';

/**
 * Control action
 */
export type ControlAction = 'direct' | 'reverse';

/**
 * Controller mode
 */
export type ControllerMode = 'auto' | 'manual' | 'cascade' | 'ratio' | 'remote';

/**
 * Tuning method
 */
export type TuningMethod =
  | 'Ziegler-Nichols'
  | 'Cohen-Coon'
  | 'Lambda'
  | 'IMC'
  | 'Manual';

/**
 * Controller data interface
 */
export interface ControllerNodeData extends BaseSymbolData {
  controllerType?: ControllerType;
  controlAction?: ControlAction;
  mode?: ControllerMode;
  setpoint?: number;
  processVariable?: number;
  output?: number;
  kp?: number; // Proportional gain
  ki?: number; // Integral time
  kd?: number; // Derivative time
  tuningMethod?: TuningMethod;
  hasAutoTune?: boolean;
  hasBumpless?: boolean; // Bumpless transfer
  trackingEnabled?: boolean;
}

/**
 * Generic PID Controller
 * Circular symbol per ISA-5.1
 */
export const PIDControllerNode = memo<{
  id: string;
  data: ControllerNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const controllerType = data.controllerType || 'PID';
  const controlAction = data.controlAction || 'reverse';
  const mode = data.mode || 'auto';

  const nodeData: ControllerNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 70,
    connectionPoints: [
      { id: 'pv', position: 'left', type: 'input', label: 'PV' },
      { id: 'sp', position: 'top', type: 'input', label: 'SP' },
      { id: 'out', position: 'right', type: 'output', label: 'OUT' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Controller circle - per ISA-5.1 */}
      <circle
        cx={35}
        cy={35}
        r={22}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Controller type label */}
      <text
        x={35}
        y={32}
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        {controllerType}
      </text>

      {/* Control action indicator */}
      <text
        x={35}
        y={42}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        {controlAction === 'direct' ? 'DIR' : 'REV'}
      </text>

      {/* Mode indicator */}
      <g>
        <rect
          x={23}
          y={47}
          width={24}
          height={8}
          fill={mode === 'auto' ? '#2ecc71' : mode === 'manual' ? '#f39c12' : '#3498db'}
          stroke="currentColor"
          strokeWidth={1}
          rx={2}
          opacity={0.8}
        />
        <text
          x={35}
          y={53}
          fontSize={7}
          fontWeight="bold"
          textAnchor="middle"
          fill="white"
        >
          {mode.toUpperCase()}
        </text>
      </g>

      {/* Auto-tune indicator */}
      {data.hasAutoTune && (
        <circle
          cx={52}
          cy={20}
          r={3}
          fill="#9b59b6"
          stroke="currentColor"
          strokeWidth={0.5}
        />
      )}

      {/* Process Variable input (left) */}
      <g>
        <line x1={13} y1={35} x2={8} y2={35} stroke="currentColor" strokeWidth={2} />
        <text x={5} y={32} fontSize={7} fill="currentColor" fontWeight="600">
          PV
        </text>
      </g>

      {/* Setpoint input (top) */}
      <g>
        <line x1={35} y1={13} x2={35} y2={8} stroke="currentColor" strokeWidth={2} />
        <text x={35} y={5} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
          SP
        </text>
      </g>

      {/* Output (right) */}
      <g>
        <line x1={57} y1={35} x2={62} y2={35} stroke="currentColor" strokeWidth={2} />
        <text x={64} y={38} fontSize={7} fill="currentColor" fontWeight="600">
          OUT
        </text>
      </g>

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

PIDControllerNode.displayName = 'PIDControllerNode';

/**
 * Cascade Controller
 * Primary and secondary controller with cascade connection
 */
export const CascadeControllerNode = memo<{
  id: string;
  data: ControllerNodeData & {
    primaryTag?: string;
    secondaryTag?: string;
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const nodeData: ControllerNodeData = {
    ...data,
    controllerType: 'cascade',
    defaultWidth: 90,
    defaultHeight: 90,
    connectionPoints: [
      { id: 'pv1', position: 'left', type: 'input', label: 'PV1' },
      { id: 'pv2', position: 'left', type: 'input', label: 'PV2' },
      { id: 'sp', position: 'top', type: 'input', label: 'SP' },
      { id: 'out', position: 'right', type: 'output', label: 'OUT' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Primary controller (outer circle) */}
      <circle
        cx={45}
        cy={35}
        r={25}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Secondary controller (inner circle, overlapping) */}
      <circle
        cx={45}
        cy={50}
        r={18}
        fill="white"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Primary label */}
      <text
        x={45}
        y={22}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        PRI
      </text>

      {/* Secondary label */}
      <text
        x={45}
        y={53}
        fontSize={9}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        SEC
      </text>

      {/* Cascade connection indicator */}
      <line
        x1={45}
        y1={35}
        x2={45}
        y2={42}
        stroke="#3498db"
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
      />

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#3498db" />
        </marker>
      </defs>

      {/* Process Variable 1 (Primary) */}
      <line x1={20} y1={25} x2={10} y2={25} stroke="currentColor" strokeWidth={2} />
      <text x={7} y={22} fontSize={6} fill="currentColor">PV1</text>

      {/* Process Variable 2 (Secondary) */}
      <line x1={27} y1={50} x2={10} y2={50} stroke="currentColor" strokeWidth={2} />
      <text x={7} y={53} fontSize={6} fill="currentColor">PV2</text>

      {/* Setpoint */}
      <line x1={45} y1={10} x2={45} y2={5} stroke="currentColor" strokeWidth={2} />
      <text x={45} y={3} fontSize={7} textAnchor="middle" fill="currentColor">SP</text>

      {/* Output */}
      <line x1={63} y1={50} x2={80} y2={50} stroke="currentColor" strokeWidth={2} />
      <text x={72} y={53} fontSize={7} fill="currentColor">OUT</text>

      {/* Tag label */}
      {data.tag && (
        <text
          x={45}
          y={85}
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

CascadeControllerNode.displayName = 'CascadeControllerNode';

/**
 * Ratio Controller
 * Maintains ratio between two flows or variables
 */
export const RatioControllerNode = memo<{
  id: string;
  data: ControllerNodeData & {
    ratio?: number;
    wildFlow?: string;
    controlledFlow?: string;
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const ratio = data.ratio || 1.0;

  const nodeData: ControllerNodeData = {
    ...data,
    controllerType: 'ratio',
    defaultWidth: 75,
    defaultHeight: 75,
    connectionPoints: [
      { id: 'wild', position: 'left', type: 'input', label: 'Wild' },
      { id: 'controlled', position: 'left', type: 'input', label: 'Ctrl' },
      { id: 'out', position: 'right', type: 'output', label: 'OUT' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Controller circle */}
      <circle
        cx={37}
        cy={37}
        r={22}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Ratio label */}
      <text
        x={37}
        y={33}
        fontSize={11}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        RATIO
      </text>

      {/* Ratio value */}
      <text
        x={37}
        y={44}
        fontSize={9}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        {ratio.toFixed(2)}:1
      </text>

      {/* Wild flow input (top-left) */}
      <g>
        <line x1={22} y1={22} x2={10} y2={15} stroke="currentColor" strokeWidth={2} />
        <text x={5} y={13} fontSize={6} fill="currentColor" fontWeight="600">
          WILD
        </text>
      </g>

      {/* Controlled flow input (bottom-left) */}
      <g>
        <line x1={22} y1={52} x2={10} y2={59} stroke="currentColor" strokeWidth={2} />
        <text x={5} y={67} fontSize={6} fill="currentColor" fontWeight="600">
          CTRL
        </text>
      </g>

      {/* Output */}
      <g>
        <line x1={59} y1={37} x2={70} y2={37} stroke="currentColor" strokeWidth={2} />
        <text x={62} y={40} fontSize={7} fill="currentColor" fontWeight="600">
          OUT
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={37}
          y={70}
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

RatioControllerNode.displayName = 'RatioControllerNode';

/**
 * Selector Controller
 * High/Low/Middle selector with multiple inputs
 */
export const SelectorControllerNode = memo<{
  id: string;
  data: ControllerNodeData & {
    selectorType?: 'high' | 'low' | 'middle' | 'average';
    numberOfInputs?: number;
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const selectorType = data.selectorType || 'high';
  const numberOfInputs = data.numberOfInputs || 3;

  const nodeData: ControllerNodeData = {
    ...data,
    controllerType: 'selector',
    defaultWidth: 70,
    defaultHeight: 80,
    connectionPoints: [
      { id: 'in1', position: 'left', type: 'input', label: 'IN1' },
      { id: 'in2', position: 'left', type: 'input', label: 'IN2' },
      { id: 'in3', position: 'left', type: 'input', label: 'IN3' },
      { id: 'out', position: 'right', type: 'output', label: 'OUT' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Controller circle */}
      <circle
        cx={35}
        cy={40}
        r={22}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Selector type label */}
      <text
        x={35}
        y={37}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        {selectorType === 'high' ? 'HIGH' :
         selectorType === 'low' ? 'LOW' :
         selectorType === 'middle' ? 'MID' :
         'AVG'}
      </text>

      {/* SELECT label */}
      <text
        x={35}
        y={48}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        SELECT
      </text>

      {/* Input connections */}
      {Array.from({ length: Math.min(numberOfInputs, 4) }).map((_, i) => {
        const y = 20 + i * 15;
        return (
          <g key={i}>
            <line
              x1={13}
              y1={y}
              x2={8}
              y2={y}
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <text x={5} y={y + 3} fontSize={6} fill="currentColor">
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Output */}
      <g>
        <line x1={57} y1={40} x2={65} y2={40} stroke="currentColor" strokeWidth={2} />
        <text x={60} y={43} fontSize={7} fill="currentColor" fontWeight="600">
          OUT
        </text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={75}
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

SelectorControllerNode.displayName = 'SelectorControllerNode';

/**
 * Split-Range Controller
 * Single input controlling multiple outputs with different ranges
 */
export const SplitRangeControllerNode = memo<{
  id: string;
  data: ControllerNodeData & {
    splitPoint?: number; // % where split occurs
  };
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const splitPoint = data.splitPoint || 50;

  const nodeData: ControllerNodeData = {
    ...data,
    controllerType: 'split-range',
    defaultWidth: 75,
    defaultHeight: 75,
    connectionPoints: [
      { id: 'pv', position: 'left', type: 'input', label: 'PV' },
      { id: 'sp', position: 'top', type: 'input', label: 'SP' },
      { id: 'out1', position: 'right', type: 'output', label: 'OUT1' },
      { id: 'out2', position: 'right', type: 'output', label: 'OUT2' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Controller circle */}
      <circle
        cx={37}
        cy={37}
        r={22}
        fill="white"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* SPLIT label */}
      <text
        x={37}
        y={34}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        SPLIT
      </text>

      {/* Split point */}
      <text
        x={37}
        y={44}
        fontSize={7}
        textAnchor="middle"
        fill="currentColor"
        fontWeight="600"
      >
        @{splitPoint}%
      </text>

      {/* Process Variable input */}
      <line x1={15} y1={37} x2={8} y2={37} stroke="currentColor" strokeWidth={2} />
      <text x={5} y={34} fontSize={7} fill="currentColor">PV</text>

      {/* Setpoint input */}
      <line x1={37} y1={15} x2={37} y2={8} stroke="currentColor" strokeWidth={2} />
      <text x={37} y={5} fontSize={7} textAnchor="middle" fill="currentColor">SP</text>

      {/* Output 1 (top-right) */}
      <g>
        <line x1={54} y1={25} x2={68} y2={18} stroke="currentColor" strokeWidth={2} />
        <text x={62} y={15} fontSize={7} fill="currentColor">OUT1</text>
      </g>

      {/* Output 2 (bottom-right) */}
      <g>
        <line x1={54} y1={49} x2={68} y2={56} stroke="currentColor" strokeWidth={2} />
        <text x={62} y={65} fontSize={7} fill="currentColor">OUT2</text>
      </g>

      {/* Tag label */}
      {data.tag && (
        <text
          x={37}
          y={70}
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

SplitRangeControllerNode.displayName = 'SplitRangeControllerNode';
