/**
 * Temperature Measurement Instruments
 * ISA-5.1 compliant temperature instrument symbols
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Thermocouple types following IEC 60584
 */
export type ThermocoupleType = 'J' | 'K' | 'T' | 'E' | 'N' | 'R' | 'S' | 'B';

/**
 * RTD sensor types
 */
export type RTDType = 'Pt100' | 'Pt1000' | 'Pt500' | 'Ni100' | 'Cu10';

/**
 * Thermowell mounting types
 */
export type ThermowellMounting = 'threaded' | 'flanged' | 'welded' | 'socket' | 'sanitary';

/**
 * Temperature scale types
 */
export type TemperatureScale = 'celsius' | 'fahrenheit' | 'kelvin';

/**
 * Thermocouple instrument data
 */
export interface ThermocoupleNodeData extends BaseSymbolData {
  thermocoupleType?: ThermocoupleType;
  junctionType?: 'exposed' | 'grounded' | 'ungrounded';
  hasTransmitter?: boolean;
  temperatureRange?: { min: number; max: number };
  scale?: TemperatureScale;
  wireColor?: string;
}

/**
 * RTD instrument data
 */
export interface RTDNodeData extends BaseSymbolData {
  rtdType?: RTDType;
  wireConfiguration?: '2-wire' | '3-wire' | '4-wire';
  hasTransmitter?: boolean;
  temperatureRange?: { min: number; max: number };
  scale?: TemperatureScale;
}

/**
 * Thermowell instrument data
 */
export interface ThermowellNodeData extends BaseSymbolData {
  mounting?: ThermowellMounting;
  material?: string;
  insertionLength?: number; // mm
  laggingExtension?: number; // mm
  hasSensor?: boolean;
  sensorType?: 'thermocouple' | 'rtd' | 'bimetal';
}

/**
 * Bimetallic thermometer data
 */
export interface BimetallicThermometerNodeData extends BaseSymbolData {
  dialSize?: number; // mm
  stemLength?: number; // mm
  mounting?: 'straight' | 'angle' | 'adjustable';
  temperatureRange?: { min: number; max: number };
  scale?: TemperatureScale;
  accuracy?: number; // ±degrees
}

/**
 * Thermocouple Temperature Element
 */
export const ThermocoupleNode = memo<{
  id: string;
  data: ThermocoupleNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const thermocoupleType = data.thermocoupleType || 'K';
  const junctionType = data.junctionType || 'grounded';
  const hasTransmitter = data.hasTransmitter ?? true;

  const nodeData: ThermocoupleNodeData = {
    ...data,
    defaultWidth: 50,
    defaultHeight: hasTransmitter ? 80 : 50,
    connectionPoints: [
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Thermocouple junction */}
      <circle cx={25} cy={25} r={8} fill="none" stroke="currentColor" strokeWidth={2} />

      {/* Junction type indicator */}
      {junctionType === 'exposed' && (
        <line x1={25} y1={17} x2={25} y2={33} stroke="currentColor" strokeWidth={2} />
      )}
      {junctionType === 'grounded' && (
        <>
          <line x1={25} y1={17} x2={25} y2={33} stroke="currentColor" strokeWidth={2} />
          <line x1={18} y1={25} x2={32} y2={25} stroke="currentColor" strokeWidth={2} />
        </>
      )}
      {junctionType === 'ungrounded' && (
        <circle cx={25} cy={25} r={4} fill="none" stroke="currentColor" strokeWidth={1.5} />
      )}

      {/* Thermocouple type label */}
      <text
        x={25}
        y={42}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        TC-{thermocoupleType}
      </text>

      {/* Transmitter if enabled */}
      {hasTransmitter && (
        <g transform="translate(0, 45)">
          {/* Transmitter box */}
          <rect
            x={10}
            y={0}
            width={30}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            rx={2}
          />
          <text x={25} y={15} fontSize={8} textAnchor="middle" fill="currentColor">
            4-20mA
          </text>

          {/* Connection line from junction to transmitter */}
          <line x1={25} y1={-12} x2={25} y2={0} stroke="currentColor" strokeWidth={1} />
        </g>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={25}
          y={hasTransmitter ? 75 : 48}
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

ThermocoupleNode.displayName = 'ThermocoupleNode';

/**
 * RTD (Resistance Temperature Detector) Element
 */
export const RTDNode = memo<{
  id: string;
  data: RTDNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const rtdType = data.rtdType || 'Pt100';
  const wireConfig = data.wireConfiguration || '3-wire';
  const hasTransmitter = data.hasTransmitter ?? true;

  const nodeData: RTDNodeData = {
    ...data,
    defaultWidth: 50,
    defaultHeight: hasTransmitter ? 80 : 50,
    connectionPoints: [
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* RTD element - rectangular symbol */}
      <rect
        x={15}
        y={18}
        width={20}
        height={14}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Resistance symbol inside */}
      <path
        d="M 18 25 L 20 21 L 22 29 L 24 21 L 26 29 L 28 21 L 30 29 L 32 25"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />

      {/* Wire configuration indicator */}
      {wireConfig === '2-wire' && (
        <>
          <line x1={15} y1={22} x2={10} y2={22} stroke="currentColor" strokeWidth={1} />
          <line x1={35} y1={28} x2={40} y2={28} stroke="currentColor" strokeWidth={1} />
        </>
      )}
      {wireConfig === '3-wire' && (
        <>
          <line x1={15} y1={22} x2={10} y2={22} stroke="currentColor" strokeWidth={1} />
          <line x1={35} y1={22} x2={40} y2={22} stroke="currentColor" strokeWidth={1} />
          <line x1={35} y1={28} x2={40} y2={28} stroke="currentColor" strokeWidth={1} />
        </>
      )}
      {wireConfig === '4-wire' && (
        <>
          <line x1={15} y1={20} x2={10} y2={20} stroke="currentColor" strokeWidth={1} />
          <line x1={15} y1={24} x2={10} y2={24} stroke="currentColor" strokeWidth={1} />
          <line x1={35} y1={26} x2={40} y2={26} stroke="currentColor" strokeWidth={1} />
          <line x1={35} y1={30} x2={40} y2={30} stroke="currentColor" strokeWidth={1} />
        </>
      )}

      {/* RTD type label */}
      <text
        x={25}
        y={42}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        {rtdType}
      </text>

      {/* Transmitter if enabled */}
      {hasTransmitter && (
        <g transform="translate(0, 45)">
          {/* Transmitter box */}
          <rect
            x={10}
            y={0}
            width={30}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            rx={2}
          />
          <text x={25} y={15} fontSize={8} textAnchor="middle" fill="currentColor">
            4-20mA
          </text>

          {/* Connection line from element to transmitter */}
          <line x1={25} y1={-3} x2={25} y2={0} stroke="currentColor" strokeWidth={1} />
        </g>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={25}
          y={hasTransmitter ? 75 : 48}
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

RTDNode.displayName = 'RTDNode';

/**
 * Thermowell with Sensor
 */
export const ThermowellNode = memo<{
  id: string;
  data: ThermowellNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const mounting = data.mounting || 'threaded';
  const hasSensor = data.hasSensor ?? true;
  const sensorType = data.sensorType || 'rtd';

  const nodeData: ThermowellNodeData = {
    ...data,
    defaultWidth: 60,
    defaultHeight: 90,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Thermowell body - tapered tube */}
      <path
        d="M 25 20 L 22 50 L 22 65 L 28 65 L 28 50 L 30 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Mounting connection */}
      {mounting === 'threaded' && (
        <>
          <rect x={18} y={15} width={19} height={5} fill="none" stroke="currentColor" strokeWidth={1.5} />
          {/* Thread lines */}
          {[0, 2, 4].map((offset) => (
            <line
              key={offset}
              x1={18}
              y1={15 + offset}
              x2={37}
              y2={15 + offset}
              stroke="currentColor"
              strokeWidth={0.5}
            />
          ))}
        </>
      )}
      {mounting === 'flanged' && (
        <>
          <rect x={15} y={15} width={25} height={5} fill="none" stroke="currentColor" strokeWidth={1.5} />
          {/* Bolt holes */}
          <circle cx={18} cy={17.5} r={1} fill="currentColor" />
          <circle cx={37} cy={17.5} r={1} fill="currentColor" />
        </>
      )}
      {mounting === 'welded' && (
        <>
          <line x1={20} y1={20} x2={15} y2={15} stroke="currentColor" strokeWidth={1.5} />
          <line x1={35} y1={20} x2={40} y2={15} stroke="currentColor" strokeWidth={1.5} />
          {/* Weld symbol */}
          <path d="M 15 15 Q 27.5 12 40 15" fill="none" stroke="currentColor" strokeWidth={1} />
        </>
      )}

      {/* Sensor inside thermowell */}
      {hasSensor && (
        <g>
          {sensorType === 'thermocouple' && (
            <>
              <circle cx={25} cy={55} r={5} fill="none" stroke="#e74c3c" strokeWidth={1.5} />
              <line x1={25} y1={50} x2={25} y2={25} stroke="#e74c3c" strokeWidth={1} />
            </>
          )}
          {sensorType === 'rtd' && (
            <>
              <rect x={22} y={48} width={6} height={10} fill="none" stroke="#3498db" strokeWidth={1.5} />
              <line x1={25} y1={48} x2={25} y2={25} stroke="#3498db" strokeWidth={1} />
            </>
          )}
          {sensorType === 'bimetal' && (
            <>
              <path
                d="M 23 58 L 23 50 L 27 50 L 27 58"
                fill="none"
                stroke="#95a5a6"
                strokeWidth={1.5}
              />
              <line x1={25} y1={50} x2={25} y2={25} stroke="#95a5a6" strokeWidth={1} />
            </>
          )}

          {/* Head connection */}
          <rect x={20} y={20} width={10} height={8} fill="none" stroke="currentColor" strokeWidth={1.5} rx={1} />
        </g>
      )}

      {/* Material label */}
      {data.material && (
        <text
          x={30}
          y={75}
          fontSize={7}
          textAnchor="start"
          fill="currentColor"
        >
          {data.material}
        </text>
      )}

      {/* Tag label */}
      {data.tag && (
        <text
          x={30}
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

ThermowellNode.displayName = 'ThermowellNode';

/**
 * Bimetallic Thermometer
 */
export const BimetallicThermometerNode = memo<{
  id: string;
  data: BimetallicThermometerNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const mounting = data.mounting || 'straight';
  const dialSize = data.dialSize || 100;
  const temperatureRange = data.temperatureRange || { min: 0, max: 100 };

  const nodeData: BimetallicThermometerNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 80,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Dial */}
      <circle cx={35} cy={30} r={20} fill="white" stroke="currentColor" strokeWidth={2} />

      {/* Scale markings */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = 35 + 18 * Math.cos(rad);
        const y1 = 30 + 18 * Math.sin(rad);
        const x2 = 35 + 15 * Math.cos(rad);
        const y2 = 30 + 15 * Math.sin(rad);
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

      {/* Pointer */}
      <line
        x1={35}
        y1={30}
        x2={35 + 12 * Math.cos(-Math.PI / 4)}
        y2={30 + 12 * Math.sin(-Math.PI / 4)}
        stroke="#e74c3c"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={35} cy={30} r={2} fill="currentColor" />

      {/* Temperature range labels */}
      <text x={35} y={48} fontSize={7} textAnchor="middle" fill="currentColor">
        {temperatureRange.min}°-{temperatureRange.max}°
      </text>

      {/* Stem based on mounting type */}
      {mounting === 'straight' && (
        <line x1={35} y1={50} x2={35} y2={75} stroke="currentColor" strokeWidth={3} />
      )}
      {mounting === 'angle' && (
        <path
          d="M 35 50 L 35 60 Q 35 65 40 65 L 50 65"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
      )}
      {mounting === 'adjustable' && (
        <>
          <line x1={35} y1={50} x2={35} y2={60} stroke="currentColor" strokeWidth={3} />
          <rect x={30} y={58} width={10} height={8} fill="none" stroke="currentColor" strokeWidth={1.5} />
          <line x1={35} y1={66} x2={35} y2={75} stroke="currentColor" strokeWidth={3} />
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

BimetallicThermometerNode.displayName = 'BimetallicThermometerNode';
