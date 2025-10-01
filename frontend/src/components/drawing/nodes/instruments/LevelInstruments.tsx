/**
 * Level Measurement Instruments
 * ISA-5.1 compliant level instrument symbols
 */

import React, { memo } from 'react';
import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';

/**
 * Level measurement technologies
 */
export type LevelTechnology =
  | 'float'
  | 'displacer'
  | 'radar'
  | 'ultrasonic'
  | 'capacitance'
  | 'hydrostatic'
  | 'laser'
  | 'guided-wave-radar';

/**
 * Mounting configurations
 */
export type LevelMounting = 'top' | 'side' | 'bottom' | 'external-cage';

/**
 * Float level instrument data
 */
export interface FloatLevelNodeData extends BaseSymbolData {
  floatType?: 'ball' | 'cylindrical' | 'magnetic';
  mounting?: LevelMounting;
  cableLength?: number; // meters
  hasTransmitter?: boolean;
  outputSignal?: '4-20mA' | 'switch' | 'HART';
  application?: 'interface' | 'continuous' | 'point';
}

/**
 * Displacer level instrument data
 */
export interface DisplacerLevelNodeData extends BaseSymbolData {
  displacerLength?: number; // mm
  displacerDiameter?: number; // mm
  mounting?: 'top' | 'side' | 'external-chamber';
  hasTransmitter?: boolean;
  specificGravity?: number;
  application?: 'interface' | 'level';
}

/**
 * Radar level instrument data
 */
export interface RadarLevelNodeData extends BaseSymbolData {
  radarType?: 'non-contact' | 'guided-wave' | 'fmcw' | 'pulse';
  antennaType?: 'horn' | 'rod' | 'parabolic' | 'planar';
  frequency?: '6GHz' | '26GHz' | '80GHz';
  probeLength?: number; // meters (for guided wave)
  hasStillpipe?: boolean;
  maxRange?: number; // meters
}

/**
 * Ultrasonic level instrument data
 */
export interface UltrasonicLevelNodeData extends BaseSymbolData {
  ultrasonicType?: 'non-contact' | 'submersible';
  beamAngle?: number; // degrees
  maxRange?: number; // meters
  deadBand?: number; // mm
  temperature?: { min: number; max: number }; // Celsius
}

/**
 * Capacitance level instrument data
 */
export interface CapacitanceLevelNodeData extends BaseSymbolData {
  probeType?: 'rod' | 'cable' | 'coaxial';
  probeLength?: number; // mm
  probeMaterial?: string;
  coating?: 'PTFE' | 'PFA' | 'none';
  application?: 'continuous' | 'point' | 'interface';
  dielectricConstant?: number;
}

/**
 * Float Level Instrument
 */
export const FloatLevelNode = memo<{
  id: string;
  data: FloatLevelNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const floatType = data.floatType || 'ball';
  const mounting = data.mounting || 'top';
  const hasTransmitter = data.hasTransmitter ?? true;
  const application = data.application || 'continuous';

  const nodeData: FloatLevelNodeData = {
    ...data,
    defaultWidth: 60,
    defaultHeight: hasTransmitter ? 90 : 70,
    connectionPoints: [
      { id: 'vessel', position: 'bottom', type: 'input', label: 'Vessel' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Cable/arm */}
      {mounting === 'top' && (
        <line x1={30} y1={hasTransmitter ? 45 : 20} x2={30} y2={55} stroke="currentColor" strokeWidth={1.5} />
      )}
      {mounting === 'side' && (
        <line x1={20} y1={45} x2={30} y2={45} stroke="currentColor" strokeWidth={1.5} />
      )}

      {/* Float based on type */}
      {floatType === 'ball' && (
        <circle
          cx={30}
          cy={55}
          r={8}
          fill="white"
          stroke="currentColor"
          strokeWidth={2}
        />
      )}
      {floatType === 'cylindrical' && (
        <rect
          x={24}
          y={50}
          width={12}
          height={18}
          fill="white"
          stroke="currentColor"
          strokeWidth={2}
          rx={2}
        />
      )}
      {floatType === 'magnetic' && (
        <g>
          <rect
            x={24}
            y={50}
            width={12}
            height={18}
            fill="white"
            stroke="currentColor"
            strokeWidth={2}
            rx={2}
          />
          {/* Magnet indicators */}
          <text x={30} y={61} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#e74c3c">
            N
          </text>
          <text x={30} y={66} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#3498db">
            S
          </text>
        </g>
      )}

      {/* Transmitter if enabled */}
      {hasTransmitter && (
        <g>
          {/* Transmitter housing */}
          <rect
            x={18}
            y={15}
            width={24}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={3}
          />

          {/* Output signal */}
          <text x={30} y={32} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
            {data.outputSignal || '4-20mA'}
          </text>

          {/* Connection to float */}
          <line x1={30} y1={40} x2={30} y2={45} stroke="currentColor" strokeWidth={1.5} />

          {/* Terminal block */}
          <rect x={26} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />
        </g>
      )}

      {/* Application indicator */}
      {application === 'interface' && (
        <text x={45} y={50} fontSize={6} fill="currentColor" fontWeight="600">
          IF
        </text>
      )}

      {/* Vessel connection */}
      <line x1={30} y1={68} x2={30} y2={hasTransmitter ? 85 : 68} stroke="currentColor" strokeWidth={2} />

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

FloatLevelNode.displayName = 'FloatLevelNode';

/**
 * Displacer Level Instrument
 */
export const DisplacerLevelNode = memo<{
  id: string;
  data: DisplacerLevelNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const mounting = data.mounting || 'top';
  const hasTransmitter = data.hasTransmitter ?? true;

  const nodeData: DisplacerLevelNodeData = {
    ...data,
    defaultWidth: 65,
    defaultHeight: 95,
    connectionPoints: [
      { id: 'vessel', position: 'bottom', type: 'input', label: 'Vessel' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Transmitter housing */}
      {hasTransmitter && (
        <g>
          <rect
            x={20}
            y={15}
            width={25}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={3}
          />
          <text x={32.5} y={32} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
            4-20mA
          </text>

          {/* Terminal block */}
          <rect x={28} y={12} width={9} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />
        </g>
      )}

      {/* Torque tube/spring mechanism */}
      <rect
        x={28}
        y={hasTransmitter ? 40 : 20}
        width={9}
        height={15}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />

      {/* Spring coils */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={i}
          x1={28}
          y1={(hasTransmitter ? 40 : 20) + 2 + i * 2}
          x2={37}
          y2={(hasTransmitter ? 40 : 20) + 2 + i * 2}
          stroke="currentColor"
          strokeWidth={0.5}
        />
      ))}

      {/* Connection rod */}
      <line
        x1={32.5}
        y1={hasTransmitter ? 55 : 35}
        x2={32.5}
        y2={60}
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Displacer body */}
      <rect
        x={27}
        y={60}
        width={11}
        height={22}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={1}
      />

      {/* Displacer fill pattern */}
      <rect
        x={28.5}
        y={62}
        width={8}
        height={18}
        fill="currentColor"
        opacity={0.2}
      />

      {/* Mounting based on type */}
      {mounting === 'external-chamber' && (
        <g>
          {/* Chamber outline */}
          <rect
            x={22}
            y={58}
            width={21}
            height={26}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="2,2"
            rx={2}
          />
          {/* Process connections */}
          <line x1={22} y1={62} x2={15} y2={62} stroke="currentColor" strokeWidth={1.5} />
          <line x1={22} y1={80} x2={15} y2={80} stroke="currentColor" strokeWidth={1.5} />
        </g>
      )}

      {/* Vessel connection */}
      <line x1={32.5} y1={82} x2={32.5} y2={90} stroke="currentColor" strokeWidth={2} />

      {/* Tag label */}
      {data.tag && (
        <text
          x={32.5}
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

DisplacerLevelNode.displayName = 'DisplacerLevelNode';

/**
 * Radar Level Instrument
 */
export const RadarLevelNode = memo<{
  id: string;
  data: RadarLevelNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const radarType = data.radarType || 'non-contact';
  const antennaType = data.antennaType || 'horn';

  const nodeData: RadarLevelNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: radarType === 'guided-wave' ? 100 : 80,
    connectionPoints: [
      { id: 'vessel', position: 'bottom', type: 'input', label: 'Vessel' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Transmitter housing */}
      <rect
        x={20}
        y={15}
        width={30}
        height={30}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* Electronics indicator */}
      <text x={35} y={32} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
        RADAR
      </text>
      {data.frequency && (
        <text x={35} y={40} fontSize={6} textAnchor="middle" fill="currentColor">
          {data.frequency}
        </text>
      )}

      {/* Terminal block */}
      <rect x={31} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Antenna based on type */}
      {radarType === 'non-contact' && (
        <g>
          {antennaType === 'horn' && (
            <>
              {/* Horn antenna */}
              <path
                d="M 30 45 L 25 55 L 25 60 L 45 60 L 45 55 L 40 45 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              />
              {/* Waveguide */}
              <rect x={32} y={45} width={6} height={8} fill="currentColor" opacity={0.1} />
            </>
          )}
          {antennaType === 'rod' && (
            <rect
              x={32}
              y={45}
              width={6}
              height={20}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          )}
          {antennaType === 'parabolic' && (
            <path
              d="M 25 60 Q 35 48 45 60"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          )}

          {/* Beam pattern */}
          <path
            d="M 30 60 L 22 75 M 35 60 L 35 75 M 40 60 L 48 75"
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.6}
          />
        </g>
      )}

      {radarType === 'guided-wave' && (
        <g>
          {/* Process connection */}
          <rect
            x={28}
            y={45}
            width={14}
            height={8}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            rx={2}
          />

          {/* Probe/cable */}
          {data.probeLength && data.probeLength > 3 ? (
            // Cable probe
            <g>
              <line x1={33} y1={53} x2={33} y2={90} stroke="currentColor" strokeWidth={1.5} />
              <line x1={37} y1={53} x2={37} y2={90} stroke="currentColor" strokeWidth={1.5} />
              {/* Weight */}
              <circle cx={35} cy={92} r={3} fill="currentColor" />
            </g>
          ) : (
            // Rod probe
            <rect
              x={32}
              y={53}
              width={6}
              height={37}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          )}

          {/* Probe label */}
          <text x={50} y={60} fontSize={6} fill="currentColor">
            GWR
          </text>
        </g>
      )}

      {/* Vessel connection */}
      <line
        x1={35}
        y1={radarType === 'guided-wave' ? 90 : 75}
        x2={35}
        y2={radarType === 'guided-wave' ? 95 : 78}
        stroke="currentColor"
        strokeWidth={2}
      />

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

RadarLevelNode.displayName = 'RadarLevelNode';

/**
 * Ultrasonic Level Instrument
 */
export const UltrasonicLevelNode = memo<{
  id: string;
  data: UltrasonicLevelNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const ultrasonicType = data.ultrasonicType || 'non-contact';
  const beamAngle = data.beamAngle || 8;

  const nodeData: UltrasonicLevelNodeData = {
    ...data,
    defaultWidth: 70,
    defaultHeight: 75,
    connectionPoints: [
      { id: 'vessel', position: 'bottom', type: 'input', label: 'Vessel' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Transmitter housing */}
      <rect
        x={22}
        y={15}
        width={26}
        height={25}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* Electronics */}
      <text x={35} y={30} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
        ULTRA
      </text>
      <text x={35} y={37} fontSize={6} textAnchor="middle" fill="currentColor">
        SONIC
      </text>

      {/* Terminal block */}
      <rect x={31} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Transducer */}
      {ultrasonicType === 'non-contact' && (
        <g>
          {/* Transducer housing */}
          <path
            d="M 30 40 L 26 48 L 26 53 L 44 53 L 44 48 L 40 40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />

          {/* Piezo element */}
          <rect
            x={30}
            y={47}
            width={10}
            height={3}
            fill="currentColor"
            opacity={0.3}
          />

          {/* Beam pattern */}
          {(() => {
            const beamRad = (beamAngle * Math.PI) / 180;
            const x1 = 35 - 15 * Math.tan(beamRad / 2);
            const x2 = 35 + 15 * Math.tan(beamRad / 2);
            return (
              <>
                <line x1={35} y1={53} x2={x1} y2={68} stroke="currentColor" strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
                <line x1={35} y1={53} x2={35} y2={70} stroke="currentColor" strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
                <line x1={35} y1={53} x2={x2} y2={68} stroke="currentColor" strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
              </>
            );
          })()}

          {/* Beam angle label */}
          <text x={50} y={56} fontSize={6} fill="currentColor">
            {beamAngle}°
          </text>
        </g>
      )}

      {ultrasonicType === 'submersible' && (
        <g>
          {/* Submersible housing */}
          <rect
            x={30}
            y={40}
            width={10}
            height={25}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            rx={2}
          />

          {/* Transducer face */}
          <ellipse cx={35} cy={63} rx={4} ry={2} fill="currentColor" opacity={0.3} />

          {/* Cable */}
          <line x1={35} y1={40} x2={35} y2={20} stroke="currentColor" strokeWidth={1.5} />
        </g>
      )}

      {/* Vessel connection */}
      <line x1={35} y1={68} x2={35} y2={73} stroke="currentColor" strokeWidth={2} />

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

UltrasonicLevelNode.displayName = 'UltrasonicLevelNode';

/**
 * Capacitance Level Probe
 */
export const CapacitanceLevelNode = memo<{
  id: string;
  data: CapacitanceLevelNodeData;
  selected?: boolean;
  dragging?: boolean;
}>(({ id, data, selected, dragging }): React.ReactElement => {
  const probeType = data.probeType || 'rod';
  const application = data.application || 'continuous';

  const nodeData: CapacitanceLevelNodeData = {
    ...data,
    defaultWidth: 60,
    defaultHeight: 90,
    connectionPoints: [
      { id: 'vessel', position: 'bottom', type: 'input', label: 'Vessel' },
      { id: 'signal', position: 'top', type: 'output', label: 'Signal' },
    ],
  };

  const renderContent = () => (
    <g>
      {/* Transmitter housing */}
      <rect
        x={20}
        y={15}
        width={20}
        height={20}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        rx={3}
      />

      {/* Electronics */}
      <text x={30} y={28} fontSize={7} textAnchor="middle" fill="currentColor" fontWeight="600">
        CAP
      </text>

      {/* Terminal block */}
      <rect x={26} y={12} width={8} height={5} fill="none" stroke="currentColor" strokeWidth={1} rx={1} />

      {/* Process connection */}
      <rect
        x={25}
        y={35}
        width={10}
        height={8}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        rx={2}
      />

      {/* Probe based on type */}
      {probeType === 'rod' && (
        <rect
          x={28}
          y={43}
          width={4}
          height={40}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
      )}
      {probeType === 'cable' && (
        <g>
          <line x1={30} y1={43} x2={30} y2={80} stroke="currentColor" strokeWidth={2} />
          {/* Weight at bottom */}
          <rect
            x={26}
            y={80}
            width={8}
            height={5}
            fill="currentColor"
          />
        </g>
      )}
      {probeType === 'coaxial' && (
        <g>
          {/* Inner conductor */}
          <rect
            x={29}
            y={43}
            width={2}
            height={40}
            fill="currentColor"
          />
          {/* Outer conductor */}
          <rect
            x={27}
            y={43}
            width={6}
            height={40}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
          {/* Dielectric indication */}
          <rect
            x={28}
            y={45}
            width={4}
            height={36}
            fill="currentColor"
            opacity={0.1}
          />
        </g>
      )}

      {/* Coating indicator */}
      {data.coating && data.coating !== 'none' && (
        <text x={40} y={55} fontSize={6} fill="currentColor">
          {data.coating}
        </text>
      )}

      {/* Application indicator */}
      {application === 'interface' && (
        <text x={40} y={45} fontSize={6} fill="currentColor" fontWeight="600">
          IF
        </text>
      )}
      {application === 'point' && (
        <text x={40} y={45} fontSize={6} fill="currentColor" fontWeight="600">
          PT
        </text>
      )}

      {/* Vessel connection */}
      <line x1={30} y1={83} x2={30} y2={88} stroke="currentColor" strokeWidth={2} />

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

CapacitanceLevelNode.displayName = 'CapacitanceLevelNode';
