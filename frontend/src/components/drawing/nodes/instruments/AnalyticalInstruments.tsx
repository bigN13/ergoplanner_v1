/**
 * Analytical Measurement Instruments
 * ISA-5.1 compliant analytical instrument symbols
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * pH electrode types
 */
export type pHElectrodeType = 'glass' | 'combination' | 'differential' | 'antimony' | 'ISFET';

/**
 * Conductivity cell types
 */
export type ConductivityCellType = 'contacting' | 'toroidal' | 'electrodeless';

/**
 * Oxygen analyzer types
 */
export type OxygenAnalyzerType = 'dissolved' | 'trace' | 'combustion' | 'paramagnetic';

/**
 * Turbidity measurement methods
 */
export type TurbidityMethod = 'nephelometric' | 'transmissive' | 'backscatter' | 'ratiometric';

/**
 * pH Meter instrument data
 */
export interface pHMeterNodeData extends BaseSymbolData {
  electrodeType?: pHElectrodeType;
  hasTemperatureCompensation?: boolean;
  temperatureSensor?: 'PT100' | 'PT1000' | 'thermistor';
  mounting?: 'insertion' | 'flow-through' | 'submersion' | 'retractable';
  bufferSolution?: number[]; // pH values for calibration
  hasAutomaticCleaning?: boolean;
}

/**
 * Conductivity analyzer data
 */
export interface ConductivityAnalyzerNodeData extends BaseSymbolData {
  cellType?: ConductivityCellType;
  cellConstant?: number; // cm⁻¹
  range?: { min: number; max: number }; // μS/cm or mS/cm
  hasTemperatureCompensation?: boolean;
  temperatureSensor?: 'PT100' | 'PT1000';
  material?: string;
  application?: 'water' | 'acids' | 'caustics' | 'general';
}

/**
 * Oxygen analyzer data
 */
export interface OxygenAnalyzerNodeData extends BaseSymbolData {
  analyzerType?: OxygenAnalyzerType;
  measurement?: 'ppm' | 'ppb' | '%' | 'mg/L';
  range?: { min: number; max: number };
  hasPressureCompensation?: boolean;
  hasTemperatureCompensation?: boolean;
  sensorType?: 'galvanic' | 'polarographic' | 'optical' | 'zirconia';
}

/**
 * Turbidity meter data
 */
export interface TurbidityMeterNodeData extends BaseSymbolData {
  method?: TurbidityMethod;
  units?: 'NTU' | 'FNU' | 'FAU' | 'FTU';
  range?: { min: number; max: number };
  lightSource?: 'tungsten' | 'LED' | 'laser';
  wavelength?: number; // nm
  hasWiper?: boolean;
  hasAutoClean?: boolean;
}

/**
 * pH Meter / Analyzer
 */
export const pHMeterNode = memo<{
  id: string;
  data: pHMeterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const electrodeType = data.electrodeType || 'combination';
  const hasTemperatureCompensation = data.hasTemperatureCompensation ?? true;
  const mounting = data.mounting || 'insertion';

  const nodeData: pHMeterNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 95,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Analyzer/transmitter housing */}
      <rect
        x={20}
        y={15}
        width={30}
        height={25}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* pH symbol */}
      <text x={35} y={25} fontSize={9} fontWeight="bold" textAnchor="middle" fill="currentColor">
        pH
      </text>
      <text x={35} y={35} fontSize={7} textAnchor="middle" fill="currentColor">
        0-14
      </text>

      {/* Terminal block */}
      <rect x={31} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Mounting adapter */}
      <rect
        x={28}
        y={40}
        width={14}
        height={10}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        rx={2}
      />

      {/* Electrode assembly */}
      <g>
        {/* Electrode body */}
        <rect
          x={31}
          y={50}
          width={8}
          height={28}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          rx={1}
        />

        {/* Glass bulb indicator */}
        {electrodeType === 'glass' || electrodeType === 'combination' ? (
          <ellipse
            cx={35}
            cy={76}
            rx={3.5}
            ry={4}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        ) : null}

        {/* Reference junction */}
        {electrodeType === 'combination' && (
          <>
            <line x1={31} y1={65} x2={39} y2={65} stroke="currentColor" strokeWidth={1} />
            <circle cx={33} cy={65} r={1} fill="currentColor" />
            <circle cx={37} cy={65} r={1} fill="currentColor" />
          </>
        )}

        {/* ISFET indicator */}
        {electrodeType === 'ISFET' && (
          <rect
            x={32}
            y={72}
            width={6}
            height={4}
            fill="currentColor"
            opacity={0.3}
          />
        )}

        {/* Internal fill */}
        <rect
          x={32}
          y={52}
          width={6}
          height={18}
          fill="currentColor"
          opacity={0.1}
        />
      </g>

      {/* Temperature sensor if present */}
      {hasTemperatureCompensation && (
        <g>
          {/* Temperature probe */}
          <rect
            x={41}
            y={56}
            width={3}
            height={18}
            fill="none"
            stroke="#e74c3c"
            strokeWidth={1.5}
          />
          {/* PT100/thermistor symbol */}
          <path
            d="M 41 60 L 44 60 L 44 70 L 41 70"
            fill="none"
            stroke="#e74c3c"
            strokeWidth={0.8}
          />
          <text x={46} y={67} fontSize={5} fill="#e74c3c">
            T
          </text>
        </g>
      )}

      {/* Automatic cleaning indicator */}
      {data.hasAutomaticCleaning && (
        <text x={50} y={45} fontSize={6} fill="currentColor" fontWeight="600">
          AUTO
        </text>
      )}

      {/* Process connection */}
      <line x1={35} y1={78} x2={35} y2={90} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
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

pHMeterNode.displayName = 'pHMeterNode';

/**
 * Conductivity Analyzer
 */
export const ConductivityAnalyzerNode = memo<{
  id: string;
  data: ConductivityAnalyzerNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const cellType = data.cellType || 'contacting';
  const hasTemperatureCompensation = data.hasTemperatureCompensation ?? true;

  const nodeData: ConductivityAnalyzerNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 90,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Analyzer/transmitter housing */}
      <rect
        x={20}
        y={15}
        width={30}
        height={25}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* Conductivity symbol */}
      <text x={35} y={25} fontSize={8} fontWeight="bold" textAnchor="middle" fill="currentColor">
        COND
      </text>
      {data.cellConstant && (
        <text x={35} y={35} fontSize={6} textAnchor="middle" fill="currentColor">
          K={data.cellConstant}
        </text>
      )}

      {/* Terminal block */}
      <rect x={31} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Mounting adapter */}
      <rect
        x={28}
        y={40}
        width={14}
        height={10}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        rx={2}
      />

      {/* Cell based on type */}
      {cellType === 'contacting' && (
        <g>
          {/* Cell body */}
          <rect
            x={30}
            y={50}
            width={10}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={1}
          />

          {/* Electrodes */}
          <g>
            {/* Top electrode */}
            <rect x={31} y={54} width={8} height={3} fill="currentColor" opacity={0.7} />
            {/* Bottom electrode */}
            <rect x={31} y={68} width={8} height={3} fill="currentColor" opacity={0.7} />

            {/* Connections */}
            <line x1={35} y1={54} x2={35} y2={52} stroke="currentColor" strokeWidth={1} />
            <line x1={35} y1={71} x2={35} y2={73} stroke="currentColor" strokeWidth={1} />
          </g>

          {/* Flow path */}
          <rect
            x={31}
            y={58}
            width={8}
            height={9}
            fill="currentColor"
            opacity={0.1}
          />
        </g>
      )}

      {cellType === 'toroidal' && (
        <g>
          {/* Sensor body */}
          <rect
            x={28}
            y={50}
            width={14}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={2}
          />

          {/* Toroidal cores */}
          <g>
            {/* Drive coil */}
            <ellipse cx={32} cy={62.5} rx={2} ry={8} fill="none" stroke="currentColor" strokeWidth={1.5} />
            {/* Receive coil */}
            <ellipse cx={38} cy={62.5} rx={2} ry={8} fill="none" stroke="currentColor" strokeWidth={1.5} />

            {/* Windings */}
            {Array.from({ length: 5 }).map((_, i) => (
              <React.Fragment key={i}>
                <line
                  x1={30}
                  y1={56 + i * 3}
                  x2={34}
                  y2={56 + i * 3}
                  stroke="currentColor"
                  strokeWidth={0.5}
                />
                <line
                  x1={36}
                  y1={56 + i * 3}
                  x2={40}
                  y2={56 + i * 3}
                  stroke="currentColor"
                  strokeWidth={0.5}
                />
              </React.Fragment>
            ))}
          </g>
        </g>
      )}

      {cellType === 'electrodeless' && (
        <g>
          {/* Cell body */}
          <rect
            x={30}
            y={50}
            width={10}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={1}
          />

          {/* Inductive coils */}
          <g>
            {/* Primary coil */}
            <ellipse cx={35} cy={58} rx={3} ry={2} fill="none" stroke="currentColor" strokeWidth={1} />
            {/* Secondary coil */}
            <ellipse cx={35} cy={67} rx={3} ry={2} fill="none" stroke="currentColor" strokeWidth={1} />

            {/* Coil windings */}
            {Array.from({ length: 3 }).map((_, i) => (
              <React.Fragment key={i}>
                <line
                  x1={32}
                  y1={56 + i * 1.5}
                  x2={38}
                  y2={56 + i * 1.5}
                  stroke="currentColor"
                  strokeWidth={0.5}
                />
                <line
                  x1={32}
                  y1={65 + i * 1.5}
                  x2={38}
                  y2={65 + i * 1.5}
                  stroke="currentColor"
                  strokeWidth={0.5}
                />
              </React.Fragment>
            ))}
          </g>
        </g>
      )}

      {/* Temperature sensor if present */}
      {hasTemperatureCompensation && (
        <g>
          <rect
            x={42}
            y={58}
            width={3}
            height={12}
            fill="none"
            stroke="#e74c3c"
            strokeWidth={1.5}
          />
          <text x={46} y={66} fontSize={5} fill="#e74c3c">
            T
          </text>
        </g>
      )}

      {/* Process connection */}
      <line x1={35} y1={75} x2={35} y2={87} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
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

ConductivityAnalyzerNode.displayName = 'ConductivityAnalyzerNode';

/**
 * Oxygen Analyzer
 */
export const OxygenAnalyzerNode = memo<{
  id: string;
  data: OxygenAnalyzerNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const analyzerType = data.analyzerType || 'dissolved';
  const sensorType = data.sensorType || 'optical';
  const measurement = data.measurement || 'mg/L';

  const nodeData: OxygenAnalyzerNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 90,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Analyzer/transmitter housing */}
      <rect
        x={20}
        y={15}
        width={30}
        height={25}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* O2 symbol */}
      <text x={35} y={25} fontSize={9} fontWeight="bold" textAnchor="middle" fill="currentColor">
        O<tspan fontSize={7} baselineShift="sub">2</tspan>
      </text>
      <text x={35} y={35} fontSize={6} textAnchor="middle" fill="currentColor">
        {measurement}
      </text>

      {/* Terminal block */}
      <rect x={31} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Mounting adapter */}
      <rect
        x={28}
        y={40}
        width={14}
        height={10}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        rx={2}
      />

      {/* Sensor based on type */}
      {(sensorType === 'galvanic' || sensorType === 'polarographic') && (
        <g>
          {/* Sensor body */}
          <rect
            x={30}
            y={50}
            width={10}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={1}
          />

          {/* Membrane */}
          <ellipse
            cx={35}
            cy={73}
            rx={4}
            ry={2.5}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />

          {/* Electrodes */}
          <g>
            {/* Cathode */}
            <line x1={35} y1={70} x2={35} y2={60} stroke="currentColor" strokeWidth={2} />
            <circle cx={35} cy={68} r={2} fill="none" stroke="currentColor" strokeWidth={1.5} />

            {/* Anode */}
            <circle cx={35} cy={58} r={3} fill="none" stroke="currentColor" strokeWidth={1.5} />
            <line x1={32} y1={58} x2={38} y2={58} stroke="currentColor" strokeWidth={1} />
          </g>

          {/* Electrolyte */}
          <rect
            x={31}
            y={53}
            width={8}
            height={15}
            fill="currentColor"
            opacity={0.1}
          />

          {/* Type label */}
          <text x={45} y={62} fontSize={5} fill="currentColor">
            {sensorType === 'galvanic' ? 'GAL' : 'POL'}
          </text>
        </g>
      )}

      {sensorType === 'optical' && (
        <g>
          {/* Sensor body */}
          <rect
            x={30}
            y={50}
            width={10}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={1}
          />

          {/* Optical window */}
          <ellipse
            cx={35}
            cy={72}
            rx={4}
            ry={2.5}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />

          {/* Sensing film */}
          <rect
            x={31}
            y={68}
            width={8}
            height={2}
            fill="#9b59b6"
            opacity={0.5}
          />

          {/* LED and photodetector */}
          <g>
            {/* LED */}
            <path
              d="M 32 58 L 34 60 L 32 62 Z"
              fill="#e74c3c"
              stroke="currentColor"
              strokeWidth={0.5}
            />
            {/* Light rays */}
            <line x1={34} y1={60} x2={36} y2={60} stroke="#e74c3c" strokeWidth={0.5} strokeDasharray="1,1" />

            {/* Photodetector */}
            <rect
              x={37}
              y={58}
              width={2}
              height={4}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.8}
            />
          </g>

          <text x={45} y={62} fontSize={5} fill="currentColor">
            OPT
          </text>
        </g>
      )}

      {sensorType === 'zirconia' && (
        <g>
          {/* Heated sensor body */}
          <rect
            x={30}
            y={50}
            width={10}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={1}
          />

          {/* Zirconia element */}
          <rect
            x={32}
            y={58}
            width={6}
            height={12}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />

          {/* Electrodes */}
          <line x1={32} y1={62} x2={28} y2={62} stroke="currentColor" strokeWidth={1} />
          <line x1={38} y1={66} x2={42} y2={66} stroke="currentColor" strokeWidth={1} />

          {/* Heater */}
          <path
            d="M 32 54 Q 33 54 33 55 Q 33 56 34 56 Q 34 57 35 57 Q 35 56 36 56 Q 36 55 37 55 Q 37 54 38 54"
            fill="none"
            stroke="#e74c3c"
            strokeWidth={1}
          />

          <text x={45} y={62} fontSize={5} fill="currentColor">
            ZrO<tspan fontSize={4} baselineShift="sub">2</tspan>
          </text>
        </g>
      )}

      {/* Process connection */}
      <line x1={35} y1={75} x2={35} y2={87} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
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

OxygenAnalyzerNode.displayName = 'OxygenAnalyzerNode';

/**
 * Turbidity Meter
 */
export const TurbidityMeterNode = memo<{
  id: string;
  data: TurbidityMeterNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const method = data.method || 'nephelometric';
  const units = data.units || 'NTU';
  const hasWiper = data.hasWiper ?? false;

  const nodeData: TurbidityMeterNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 85,
    connectionPoints: [
      { id: 'process', position: 'bottom', type: 'input', label: 'Process' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Analyzer/transmitter housing */}
      <rect
        x={20}
        y={15}
        width={30}
        height={25}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* Turbidity label */}
      <text x={35} y={25} fontSize={8} fontWeight="bold" textAnchor="middle" fill="currentColor">
        TURB
      </text>
      <text x={35} y={35} fontSize={6} textAnchor="middle" fill="currentColor">
        {units}
      </text>

      {/* Terminal block */}
      <rect x={31} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Mounting adapter */}
      <rect
        x={28}
        y={40}
        width={14}
        height={8}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        rx={2}
      />

      {/* Sensor body */}
      <rect
        x={28}
        y={48}
        width={14}
        height={25}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={2}
      />

      {/* Optical window */}
      <rect
        x={29}
        y={65}
        width={12}
        height={7}
        fill="white"
        stroke="currentColor"
        strokeWidth={1.5}
        rx={1}
      />

      {/* Light source and detector based on method */}
      {method === 'nephelometric' && (
        <g>
          {/* Light source (LED) at bottom */}
          <g transform="translate(35, 68)">
            <path
              d="M -2 0 L 0 2 L 2 0 Z"
              fill="#f39c12"
              stroke="currentColor"
              strokeWidth={0.5}
            />
            {/* Light beam upward */}
            <line x1={0} y1={-2} x2={0} y2={-6} stroke="#f39c12" strokeWidth={1} strokeDasharray="1,1" />
          </g>

          {/* 90° detector */}
          <g transform="translate(38, 57)">
            <rect
              x={0}
              y={0}
              width={3}
              height={2}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.8}
            />
            {/* Scattered light */}
            <line x1={-2} y1={1} x2={0} y2={1} stroke="#f39c12" strokeWidth={0.5} strokeDasharray="0.5,0.5" />
          </g>

          <text x={45} y={58} fontSize={5} fill="currentColor">
            90°
          </text>
        </g>
      )}

      {method === 'transmissive' && (
        <g>
          {/* Light source */}
          <g transform="translate(30, 57)">
            <path
              d="M 0 -1 L 2 0 L 0 1 Z"
              fill="#f39c12"
              stroke="currentColor"
              strokeWidth={0.5}
            />
            {/* Light beam across */}
            <line x1={2} y1={0} x2={8} y2={0} stroke="#f39c12" strokeWidth={1} strokeDasharray="1,1" />
          </g>

          {/* Detector opposite */}
          <g transform="translate(38, 56)">
            <rect
              x={0}
              y={0}
              width={2}
              height={2}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.8}
            />
          </g>

          <text x={45} y={58} fontSize={5} fill="currentColor">
            180°
          </text>
        </g>
      )}

      {method === 'backscatter' && (
        <g>
          {/* Light source and detector colocated */}
          <g transform="translate(35, 55)">
            {/* LED */}
            <path
              d="M -1.5 0 L 0 1.5 L 1.5 0 Z"
              fill="#f39c12"
              stroke="currentColor"
              strokeWidth={0.5}
            />
            {/* Detector */}
            <rect
              x={-1}
              y={2}
              width={2}
              height={1.5}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
            />
            {/* Beam */}
            <line x1={0} y1={1.5} x2={0} y2={6} stroke="#f39c12" strokeWidth={0.5} strokeDasharray="0.5,0.5" />
          </g>

          <text x={45} y={58} fontSize={5} fill="currentColor">
            BS
          </text>
        </g>
      )}

      {/* Wiper mechanism if present */}
      {hasWiper && (
        <g>
          {/* Wiper blade */}
          <path
            d="M 29 64 L 32 64 L 34 67 L 32 67"
            fill="none"
            stroke="#95a5a6"
            strokeWidth={1}
          />
          <text x={45} y={66} fontSize={5} fill="currentColor">
            W
          </text>
        </g>
      )}

      {/* Process connection */}
      <line x1={35} y1={73} x2={35} y2={82} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={35}
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

TurbidityMeterNode.displayName = 'TurbidityMeterNode';
