/**
 * Pressure Measurement Instruments
 * ISA-5.1 compliant pressure instrument symbols
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Pressure gauge types
 */
export type PressureGaugeType = 'bourdon' | 'diaphragm' | 'capsule' | 'bellows';

/**
 * Pressure ranges and units
 */
export type PressureUnit = 'psi' | 'bar' | 'kPa' | 'MPa' | 'mmHg' | 'inH2O';

/**
 * Mounting types
 */
export type PressureMounting = 'direct' | 'remote-seal' | 'manifold' | 'panel';

/**
 * Process connection types
 */
export type ProcessConnection = 'threaded' | 'flanged' | 'tri-clamp' | 'compression';

/**
 * Bourdon tube gauge data
 */
export interface BourdonGaugeNodeData extends BaseSymbolData {
  gaugeType?: PressureGaugeType;
  pressureRange?: { min: number; max: number };
  unit?: PressureUnit;
  dialSize?: number; // mm
  accuracy?: number; // % of full scale
  mounting?: PressureMounting;
  connection?: ProcessConnection;
}

/**
 * Electronic pressure transmitter data
 */
export interface PressureTransmitterNodeData extends BaseSymbolData {
  sensorType?: 'strain-gauge' | 'capacitance' | 'piezoelectric' | 'resonant';
  pressureRange?: { min: number; max: number };
  unit?: PressureUnit;
  outputSignal?: '4-20mA' | '0-10V' | 'HART' | 'fieldbus' | 'wireless';
  hasDiaphragmSeal?: boolean;
  sealFluid?: string;
  connection?: ProcessConnection;
}

/**
 * Differential pressure transmitter data
 */
export interface DifferentialPressureNodeData extends BaseSymbolData {
  sensorType?: 'capacitance' | 'differential-capacitance' | 'strain-gauge';
  pressureRange?: { min: number; max: number };
  unit?: PressureUnit;
  outputSignal?: '4-20mA' | '0-10V' | 'HART' | 'fieldbus';
  hasManifold?: boolean;
  manifoldType?: '3-valve' | '5-valve';
  application?: 'flow' | 'level' | 'filter-dp' | 'general';
}

/**
 * Diaphragm seal data
 */
export interface DiaphragmSealNodeData extends BaseSymbolData {
  diaphragmMaterial?: string;
  fillFluid?: string;
  connection?: ProcessConnection;
  hasCapillary?: boolean;
  capillaryLength?: number; // meters
  hasFlushing?: boolean;
}

/**
 * Bourdon Tube Pressure Gauge
 */
export const BourdonGaugeNode = memo<{
  id: string;
  data: BourdonGaugeNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const pressureRange = data.pressureRange || { min: 0, max: 100 };
  const unit = data.unit || 'psi';
  const mounting = data.mounting || 'direct';

  const nodeData: BourdonGaugeNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 80,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Gauge dial */}
      <circle cx={35} cy={35} r={22} fill="white" stroke="currentColor" strokeWidth={2.5} />

      {/* Pressure scale */}
      {[0, 45, 90, 135, 180, 225, 270].map((angle) => {
        const rad = ((angle - 45) * Math.PI) / 180;
        const x1 = 35 + 20 * Math.cos(rad);
        const y1 = 35 + 20 * Math.sin(rad);
        const x2 = 35 + 17 * Math.cos(rad);
        const y2 = 35 + 17 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={angle % 90 === 0 ? 1.5 : 1}
          />
        );
      })}

      {/* Minor tick marks */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = -45 + i * (270 / 13);
        const rad = (angle * Math.PI) / 180;
        const x1 = 35 + 20 * Math.cos(rad);
        const y1 = 35 + 20 * Math.sin(rad);
        const x2 = 35 + 18.5 * Math.cos(rad);
        const y2 = 35 + 18.5 * Math.sin(rad);
        return (
          <line
            key={`minor-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Pointer - showing at 45% of range */}
      <line
        x1={35}
        y1={35}
        x2={35 + 14 * Math.cos((45 * Math.PI) / 180)}
        y2={35 + 14 * Math.sin((45 * Math.PI) / 180)}
        stroke="#e74c3c"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Center pivot */}
      <circle cx={35} cy={35} r={2.5} fill="currentColor" />

      {/* Range label */}
      <text x={35} y={52} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
        0-{pressureRange.max}
      </text>
      <text x={35} y={59} fontSize={6} textAnchor="middle" fill="currentColor">
        {unit}
      </text>

      {/* Connection based on mounting */}
      {mounting === 'direct' && (
        <>
          <line x1={35} y1={57} x2={35} y2={65} stroke="currentColor" strokeWidth={3} />
          {/* Thread representation */}
          <rect x={32} y={63} width={6} height={7} fill="none" stroke="currentColor" strokeWidth={1} />
        </>
      )}
      {mounting === 'remote-seal' && (
        <>
          <line x1={35} y1={57} x2={35} y2={62} stroke="currentColor" strokeWidth={2} />
          {/* Capillary */}
          <path
            d="M 35 62 Q 30 65 35 68 Q 40 71 35 74"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        </>
      )}
      {mounting === 'panel' && (
        <>
          {/* Panel mounting flange */}
          <rect x={28} y={55} width={14} height={3} fill="currentColor" opacity={0.3} />
          <line x1={35} y1={58} x2={35} y2={65} stroke="currentColor" strokeWidth={2} />
        </>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
          y={12}
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

BourdonGaugeNode.displayName = 'BourdonGaugeNode';

/**
 * Electronic Pressure Transmitter
 */
export const PressureTransmitterNode = memo<{
  id: string;
  data: PressureTransmitterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const sensorType = data.sensorType || 'strain-gauge';
  const outputSignal = data.outputSignal || '4-20mA';
  const hasDiaphragmSeal = data.hasDiaphragmSeal ?? false;
  const pressureRange = data.pressureRange || { min: 0, max: 100 };
  const unit = data.unit || 'psi';

  const nodeData: PressureTransmitterNodeData = {
    ...data,
    defaultWidth: 60,
    defaultHeight: hasDiaphragmSeal ? 90 : 70,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => {
    let yOffset = 0;

    return (
      <g>
        {/* Diaphragm seal if present */}
        {hasDiaphragmSeal && (
          <g>
            {/* Seal body */}
            <rect
              x={20}
              y={55}
              width={20}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              rx={2}
            />
            {/* Diaphragm */}
            <ellipse cx={30} cy={67} rx={8} ry={3} fill="none" stroke="currentColor" strokeWidth={1.5} />
            {/* Capillary */}
            <line x1={30} y1={55} x2={30} y2={50} stroke="currentColor" strokeWidth={2} />
            <text x={42} y={62} fontSize={6} fill="currentColor">
              SEAL
            </text>
            {yOffset = 20}
          </g>
        )}

        {/* Transmitter housing */}
        <rect
          x={15}
          y={25 + yOffset}
          width={30}
          height={25}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          rx={3}
        />

        {/* Sensor indicator based on type */}
        {sensorType === 'strain-gauge' && (
          <>
            {/* Diaphragm with strain gauges */}
            <circle cx={30} cy={37.5 + yOffset} r={6} fill="none" stroke="currentColor" strokeWidth={1} />
            <path
              d={`M ${30 - 4} ${37.5 + yOffset} L ${30 + 4} ${37.5 + yOffset}`}
              stroke="currentColor"
              strokeWidth={1}
            />
            <path
              d={`M ${30} ${37.5 + yOffset - 4} L ${30} ${37.5 + yOffset + 4}`}
              stroke="currentColor"
              strokeWidth={1}
            />
          </>
        )}
        {sensorType === 'capacitance' && (
          <>
            {/* Capacitor plates */}
            <line x1={27} y1={33 + yOffset} x2={27} y2={42 + yOffset} stroke="currentColor" strokeWidth={1.5} />
            <line x1={33} y1={33 + yOffset} x2={33} y2={42 + yOffset} stroke="currentColor" strokeWidth={1.5} />
          </>
        )}
        {sensorType === 'piezoelectric' && (
          <>
            {/* Crystal symbol */}
            <path
              d={`M ${25} ${37.5 + yOffset} L ${30} ${33 + yOffset} L ${35} ${37.5 + yOffset} L ${30} ${42 + yOffset} Z`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            />
          </>
        )}

        {/* Output signal label */}
        <text
          x={30}
          y={46 + yOffset}
          fontSize={7}
          textAnchor="middle"
          fill="currentColor"
          fontWeight="600"
        >
          {outputSignal}
        </text>

        {/* Range label */}
        <text
          x={30}
          y={20 + yOffset}
          fontSize={7}
          textAnchor="middle"
          fill="currentColor"
        >
          {pressureRange.min}-{pressureRange.max} {unit}
        </text>

        {/* Process connection */}
        <line
          x1={30}
          y1={50 + yOffset}
          x2={30}
          y2={hasDiaphragmSeal ? 55 : 65}
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Signal wire to top */}
        <line x1={30} y1={25 + yOffset} x2={30} y2={15} stroke="currentColor" strokeWidth={1.5} />

        {/* Terminal block */}
        <rect
          x={26}
          y={12}
          width={8}
          height={6}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          rx={1}
        />

        {/* Tag label */}
        {data.tag && (
          <text
            x={30}
            y={8}
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
  };

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

PressureTransmitterNode.displayName = 'PressureTransmitterNode';

/**
 * Differential Pressure Transmitter
 */
export const DifferentialPressureNode = memo<{
  id: string;
  data: DifferentialPressureNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const hasManifold = data.hasManifold ?? true;
  const manifoldType = data.manifoldType || '3-valve';
  const outputSignal = data.outputSignal || '4-20mA';
  const application = data.application || 'general';

  const nodeData: DifferentialPressureNodeData = {
    ...data,
    defaultWidth: 80,
    defaultHeight: hasManifold ? 100 : 75,
    connectionPoints: [
      { id: 'high', position: 'bottom', type: 'input', label: 'High' },
      { id: 'low', position: 'bottom', type: 'input', label: 'Low' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Manifold if present */}
      {hasManifold && (
        <g transform="translate(0, 55)">
          {/* Manifold body */}
          <rect
            x={15}
            y={0}
            width={50}
            height={20}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={2}
          />

          {/* Valve indicators */}
          {manifoldType === '3-valve' && (
            <>
              {/* High side valve */}
              <circle cx={25} cy={10} r={4} fill="none" stroke="currentColor" strokeWidth={1.5} />
              {/* Low side valve */}
              <circle cx={55} cy={10} r={4} fill="none" stroke="currentColor" strokeWidth={1.5} />
              {/* Equalizing valve */}
              <circle cx={40} cy={10} r={4} fill="none" stroke="currentColor" strokeWidth={1.5} />

              {/* Valve stems */}
              <line x1={25} y1={6} x2={25} y2={2} stroke="currentColor" strokeWidth={1} />
              <line x1={55} y1={6} x2={55} y2={2} stroke="currentColor" strokeWidth={1} />
              <line x1={40} y1={6} x2={40} y2={2} stroke="currentColor" strokeWidth={1} />
            </>
          )}
          {manifoldType === '5-valve' && (
            <>
              {/* 5 valve positions */}
              {[20, 30, 40, 50, 60].map((x) => (
                <g key={x}>
                  <circle cx={x} cy={10} r={3.5} fill="none" stroke="currentColor" strokeWidth={1.5} />
                  <line x1={x} y1={6.5} x2={x} y2={2} stroke="currentColor" strokeWidth={1} />
                </g>
              ))}
            </>
          )}

          {/* Process connections */}
          <line x1={25} y1={20} x2={25} y2={30} stroke="currentColor" strokeWidth={2} />
          <line x1={55} y1={20} x2={55} y2={30} stroke="currentColor" strokeWidth={2} />

          {/* Labels */}
          <text x={25} y={38} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
            H
          </text>
          <text x={55} y={38} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
            L
          </text>

          {/* Connection to transmitter */}
          <line x1={40} y1={0} x2={40} y2={-5} stroke="currentColor" strokeWidth={2} />
        </g>
      )}

      {/* Transmitter housing */}
      <rect
        x={25}
        y={hasManifold ? 20 : 30}
        width={30}
        height={25}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* DP symbol - two chambers with diaphragm */}
      <g transform={`translate(0, ${hasManifold ? 20 : 30})`}>
        {/* Left chamber (high) */}
        <circle cx={32} cy={12.5} r={5} fill="none" stroke="currentColor" strokeWidth={1} />
        {/* Right chamber (low) */}
        <circle cx={48} cy={12.5} r={5} fill="none" stroke="currentColor" strokeWidth={1} />
        {/* Sensing diaphragm */}
        <line x1={37} y1={12.5} x2={43} y2={12.5} stroke="currentColor" strokeWidth={2} />

        {/* Output signal label */}
        <text x={40} y={22} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
          {outputSignal}
        </text>
      </g>

      {/* Signal connection to top */}
      <line
        x1={40}
        y1={hasManifold ? 20 : 30}
        x2={40}
        y2={15}
        stroke="currentColor"
        strokeWidth={1.5}
      />

      {/* Terminal block */}
      <rect x={36} y={12} width={8} height={6} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Application label */}
      {application !== 'general' && (
        <text
          x={40}
          y={hasManifold ? 18 : 28}
          fontSize={6}
          textAnchor="middle"
          fill="currentColor"
        >
          {application.toUpperCase()}
        </text>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={40}
          y={8}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle"
          fill="#0066cc"
        >
          {data.tag}
        </text>
      )}

      {/* Direct connections if no manifold */}
      {!hasManifold && (
        <>
          <line x1={32} y1={55} x2={32} y2={70} stroke="currentColor" strokeWidth={2} />
          <line x1={48} y1={55} x2={48} y2={70} stroke="currentColor" strokeWidth={2} />
          <text x={32} y={68} fontSize={7} textAnchor="middle" fill="currentColor">
            H
          </text>
          <text x={48} y={68} fontSize={7} textAnchor="middle" fill="currentColor">
            L
          </text>
        </>
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

DifferentialPressureNode.displayName = 'DifferentialPressureNode';

/**
 * Diaphragm Seal (Remote Seal)
 */
export const DiaphragmSealNode = memo<{
  id: string;
  data: DiaphragmSealNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const hasCapillary = data.hasCapillary ?? true;
  const hasFlushing = data.hasFlushing ?? false;
  const connection = data.connection || 'flanged';

  const nodeData: DiaphragmSealNodeData = {
    ...data,
    defaultWidth: 60,
    defaultHeight: 70,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'instrument', position: 'top', type: 'output', label: 'Instrument' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Seal body */}
      <rect
        x={20}
        y={30}
        width={20}
        height={15}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={2}
      />

      {/* Fill fluid chamber */}
      <rect
        x={22}
        y={32}
        width={16}
        height={8}
        fill="currentColor"
        opacity={0.2}
      />

      {/* Diaphragm */}
      <ellipse
        cx={30}
        cy={45}
        rx={9}
        ry={3}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Diaphragm deflection indication */}
      <path
        d="M 23 45 Q 30 47 37 45"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="2,1"
      />

      {/* Capillary connection */}
      {hasCapillary && (
        <>
          {/* Capillary tube */}
          <path
            d="M 30 30 Q 26 25 30 20 Q 34 15 30 10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
          {/* Capillary fitting */}
          <rect x={28} y={8} width={4} height={4} fill="currentColor" />
        </>
      )}

      {/* Flushing connection */}
      {hasFlushing && (
        <>
          <line x1={40} y1={37} x2={48} y2={37} stroke="currentColor" strokeWidth={1.5} />
          <circle cx={50} cy={37} r={2} fill="none" stroke="currentColor" strokeWidth={1.5} />
          <text x={52} y={39} fontSize={6} fill="currentColor">
            FL
          </text>
        </>
      )}

      {/* Process connection based on type */}
      {connection === 'flanged' && (
        <g>
          <rect x={22} y={48} width={16} height={5} fill="none" stroke="currentColor" strokeWidth={1.5} />
          {/* Bolt holes */}
          <circle cx={24} cy={50.5} r={1} fill="currentColor" />
          <circle cx={36} cy={50.5} r={1} fill="currentColor" />
          <line x1={30} y1={53} x2={30} y2={65} stroke="currentColor" strokeWidth={2} />
        </g>
      )}
      {connection === 'threaded' && (
        <g>
          <rect x={27} y={48} width={6} height={8} fill="none" stroke="currentColor" strokeWidth={1.5} />
          {/* Thread lines */}
          {[0, 2, 4, 6].map((offset) => (
            <line
              key={offset}
              x1={27}
              y1={48 + offset}
              x2={33}
              y2={48 + offset}
              stroke="currentColor"
              strokeWidth={0.5}
            />
          ))}
          <line x1={30} y1={56} x2={30} y2={65} stroke="currentColor" strokeWidth={2} />
        </g>
      )}
      {connection === 'tri-clamp' && (
        <g>
          {/* Tri-clamp ferrule */}
          <path
            d="M 22 48 L 22 53 L 30 56 L 38 53 L 38 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <line x1={30} y1={56} x2={30} y2={65} stroke="currentColor" strokeWidth={2} />
        </g>
      )}

      {/* Material label */}
      {data.diaphragmMaterial && (
        <text x={42} y={38} fontSize={6} fill="currentColor">
          {data.diaphragmMaterial}
        </text>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={30}
          y={8}
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

DiaphragmSealNode.displayName = 'DiaphragmSealNode';
