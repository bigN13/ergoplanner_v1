/**
 * Thames Water Pumping Station Components
 *
 * Standard: Thames Water TW-STD-2023
 * Category: Pumping Systems
 *
 * Components:
 * - Wet Well with level control
 * - Pump configurations (duty/standby/assist)
 * - Valve and instrumentation layouts
 */

import React from 'react';
import { BaseSymbolNode, BaseSymbolData, BaseSymbolProps } from '../../BaseSymbolNode';

// ============================================================================
// Type Definitions
// ============================================================================

export type PumpingStationType =
  | 'wet-well'
  | 'submersible-pump-station'
  | 'dry-well-pump-station';

export type PumpConfiguration =
  | 'duty-standby'          // 1 duty + 1 standby
  | 'duty-duty-standby'     // 2 duty + 1 standby
  | 'duty-assist-standby'   // 1 duty + 1 assist + 1 standby
  | 'variable-duty';        // Variable speed drives

export type PumpType =
  | 'submersible'
  | 'vertical-turbine'
  | 'horizontal-centrifugal'
  | 'progressive-cavity'
  | 'screw';

export type LevelControlType =
  | 'float-switch'
  | 'ultrasonic'
  | 'pressure-transducer'
  | 'radar';

export type PumpStatus =
  | 'running'
  | 'standby'
  | 'fault'
  | 'maintenance';

export interface PumpingStationNodeData extends BaseSymbolData {
  stationType?: PumpingStationType;
  pumpConfiguration?: PumpConfiguration;
  pumpType?: PumpType;
  levelControlType?: LevelControlType;
  pumpStatus?: PumpStatus[];

  // Wet well dimensions
  diameter?: number;         // meters
  depth?: number;            // meters
  volume?: number;           // m³

  // Level control
  highHighLevel?: number;    // meters (overflow alarm)
  highLevel?: number;        // meters (pump start)
  lowLevel?: number;         // meters (pump stop)
  lowLowLevel?: number;      // meters (dry run protection)
  currentLevel?: number;     // meters

  // Pump parameters
  pumpCount?: number;
  pumpCapacity?: number;     // m³/hr per pump
  totalHead?: number;        // meters
  motorPower?: number;       // kW

  // Flow and instrumentation
  inflowRate?: number;       // m³/hr
  hasVFD?: boolean;          // Variable Frequency Drive
  hasBackupPower?: boolean;  // Generator/UPS
  hasTelemetry?: boolean;
}

// ============================================================================
// Wet Well with Level Control
// ============================================================================

export const WetWellNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as PumpingStationNodeData;

  const renderSymbol = () => {
    // Calculate level positions
    const wellTop = 20;
    const wellBottom = 120;
    const wellHeight = wellBottom - wellTop;

    const hhLevel = data.highHighLevel !== undefined ? wellBottom - (data.highHighLevel / (data.depth || 5)) * wellHeight : wellTop + 20;
    const hLevel = data.highLevel !== undefined ? wellBottom - (data.highLevel / (data.depth || 5)) * wellHeight : wellTop + 35;
    const lLevel = data.lowLevel !== undefined ? wellBottom - (data.lowLevel / (data.depth || 5)) * wellHeight : wellTop + 65;
    const llLevel = data.lowLowLevel !== undefined ? wellBottom - (data.lowLowLevel / (data.depth || 5)) * wellHeight : wellTop + 80;
    const currentLevel = data.currentLevel !== undefined ? wellBottom - (data.currentLevel / (data.depth || 5)) * wellHeight : wellTop + 50;

    return (
      <g>
        {/* Wet well structure */}
        <rect
          x="30"
          y={wellTop}
          width="80"
          height={wellHeight}
          fill="#4682B4"
          opacity="0.2"
          stroke="black"
          strokeWidth="2"
        />

        {/* Current water level */}
        <rect
          x="30"
          y={currentLevel}
          width="80"
          height={wellBottom - currentLevel}
          fill="#4682B4"
          opacity="0.4"
        />

        {/* Level indicators */}
        {/* HH Level - red */}
        <line x1="25" y1={hhLevel} x2="115" y2={hhLevel} stroke="red" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x="117" y={hhLevel + 3} fontSize="6" fill="red">HH</text>

        {/* H Level - orange */}
        <line x1="25" y1={hLevel} x2="115" y2={hLevel} stroke="orange" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x="117" y={hLevel + 3} fontSize="6" fill="orange">H</text>

        {/* L Level - blue */}
        <line x1="25" y1={lLevel} x2="115" y2={lLevel} stroke="blue" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x="117" y={lLevel + 3} fontSize="6" fill="blue">L</text>

        {/* LL Level - red */}
        <line x1="25" y1={llLevel} x2="115" y2={llLevel} stroke="red" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x="117" y={llLevel + 3} fontSize="6" fill="red">LL</text>

        {/* Level sensor */}
        <rect
          x="65"
          y={wellTop - 5}
          width="10"
          height="8"
          fill="yellow"
          stroke="black"
          strokeWidth="1"
        />
        <text x="70" y={wellTop + 1} fontSize="6" textAnchor="middle" fill="black">
          {data.levelControlType === 'ultrasonic' ? 'US' :
           data.levelControlType === 'radar' ? 'RD' :
           data.levelControlType === 'pressure-transducer' ? 'PT' :
           'FS'}
        </text>

        {/* Sensor cable */}
        <line x1="70" y1={wellTop + 3} x2="70" y2={currentLevel - 5} stroke="black" strokeWidth="1" strokeDasharray="2,1" />

        {/* Inlet pipe */}
        <path
          d="M 10 40 L 30 40"
          stroke="blue"
          strokeWidth="3"
          markerEnd="url(#arrowblue)"
        />
        <text x="15" y="38" fontSize="7" fill="blue">Inlet</text>

        {/* Inflow rate */}
        {data.inflowRate !== undefined && (
          <text x="15" y="48" fontSize="6" fill="blue">
            {data.inflowRate} m³/hr
          </text>
        )}

        {/* Submersible pumps at bottom */}
        {Array.from({ length: data.pumpCount || 2 }).map((_, idx) => {
          const pumpX = 45 + (idx * 25);
          const pumpY = wellBottom - 10;
          const status = data.pumpStatus?.[idx] || 'standby';

          return (
            <g key={idx}>
              {/* Pump body */}
              <rect
                x={pumpX}
                y={pumpY}
                width="15"
                height="8"
                fill={status === 'running' ? 'green' : status === 'fault' ? 'red' : 'gray'}
                opacity="0.6"
                stroke="black"
                strokeWidth="1"
              />

              {/* Pump impeller */}
              <circle
                cx={pumpX + 7.5}
                cy={pumpY + 4}
                r="3"
                fill="none"
                stroke="black"
                strokeWidth="1"
              />

              {/* Discharge pipe */}
              <path
                d={`M ${pumpX + 7.5} ${pumpY} L ${pumpX + 7.5} ${wellTop + 5}`}
                stroke="blue"
                strokeWidth="2"
              />

              {/* Check valve */}
              <circle
                cx={pumpX + 7.5}
                cy={wellTop + 15}
                r="3"
                fill="white"
                stroke="black"
                strokeWidth="1"
              />
              <polygon
                points={`${pumpX + 5.5},${wellTop + 15} ${pumpX + 9.5},${wellTop + 13} ${pumpX + 9.5},${wellTop + 17}`}
                fill="black"
              />

              {/* Pump label */}
              <text x={pumpX + 7.5} y={pumpY + 18} fontSize="6" textAnchor="middle" fill="black">
                P{idx + 1}
              </text>
            </g>
          );
        })}

        {/* Common discharge header */}
        <path
          d={`M 40 ${wellTop + 5} L 100 ${wellTop + 5}`}
          stroke="blue"
          strokeWidth="3"
        />

        {/* Outlet */}
        <path
          d={`M 100 ${wellTop + 5} L 130 ${wellTop + 5}`}
          stroke="blue"
          strokeWidth="3"
          markerEnd="url(#arrowblue)"
        />
        <text x="125" y={wellTop + 3} fontSize="7" fill="blue">Outlet</text>

        {/* Isolation valve on outlet */}
        <circle cx="110" cy={wellTop + 5} r="4" fill="white" stroke="black" strokeWidth="1.5" />
        <line x1="108" y1={wellTop + 3} x2="112" y2={wellTop + 7} stroke="black" strokeWidth="1.5" />

        {/* Title */}
        <text x="70" y="10" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
          WET WELL
        </text>

        {/* Well dimensions */}
        {data.diameter && (
          <text x="70" y="135" fontSize="7" textAnchor="middle" fill="black">
            Ø{data.diameter}m × {data.depth || 5}m deep
          </text>
        )}

        {/* Current level display */}
        <rect x="5" y="60" width="18" height="30" fill="white" stroke="black" strokeWidth="1" />
        <text x="14" y="68" fontSize="6" textAnchor="middle" fill="black">Level</text>
        <text x="14" y="78" fontSize="8" fontWeight="bold" textAnchor="middle" fill="blue">
          {data.currentLevel?.toFixed(1) || '2.5'}m
        </text>

        {/* Telemetry indicator */}
        {data.hasTelemetry && (
          <g>
            <rect x="115" y="5" width="20" height="10" fill="green" opacity="0.2" stroke="green" strokeWidth="1" />
            <text x="125" y="12" fontSize="6" textAnchor="middle" fill="green">SCADA</text>
          </g>
        )}

        {/* Backup power indicator */}
        {data.hasBackupPower && (
          <g>
            <circle cx="10" cy="10" r="4" fill="yellow" stroke="orange" strokeWidth="1" />
            <line x1="10" y1="7" x2="10" y2="13" stroke="red" strokeWidth="1.5" />
            <line x1="7" y1="10" x2="13" y2="10" stroke="red" strokeWidth="1.5" />
            <text x="15" y="12" fontSize="6" fill="orange">GEN</text>
          </g>
        )}

        {/* Arrow marker */}
        <defs>
          <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="blue" />
          </marker>
        </defs>
      </g>
    );
  };

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

WetWellNode.displayName = 'WetWellNode';

// ============================================================================
// Submersible Pump Station (Complete Assembly)
// ============================================================================

export const SubmersiblePumpStationNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as PumpingStationNodeData;
  const pumpCount = data.pumpCount || 3;

  const renderSymbol = () => (
    <g>
      {/* Station enclosure */}
      <rect
        x="10"
        y="10"
        width="140"
        height="130"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Wet well section */}
      <rect
        x="15"
        y="30"
        width="60"
        height="100"
        fill="#4682B4"
        opacity="0.2"
        stroke="black"
        strokeWidth="1.5"
      />

      {/* Water level */}
      <rect
        x="15"
        y="70"
        width="60"
        height="60"
        fill="#4682B4"
        opacity="0.4"
      />

      {/* Pumps - duty/standby configuration */}
      {Array.from({ length: pumpCount }).map((_, idx) => {
        const pumpX = 25 + (idx * 18);
        const pumpY = 120;
        const status = data.pumpStatus?.[idx] || (idx === 0 ? 'running' : 'standby');

        return (
          <g key={idx}>
            {/* Pump */}
            <rect
              x={pumpX}
              y={pumpY}
              width="12"
              height="8"
              fill={status === 'running' ? 'green' : status === 'fault' ? 'red' : 'gray'}
              opacity="0.7"
              stroke="black"
              strokeWidth="1"
            />

            {/* Discharge pipe */}
            <line
              x1={pumpX + 6}
              y1={pumpY}
              x2={pumpX + 6}
              y2="40"
              stroke="blue"
              strokeWidth="2"
            />

            {/* Check valve */}
            <circle cx={pumpX + 6} cy="50" r="2.5" fill="white" stroke="black" strokeWidth="1" />

            {/* Isolation valve */}
            <circle cx={pumpX + 6} cy="60" r="2.5" fill="white" stroke="black" strokeWidth="1" />
            <line x1={pumpX + 4} y1="58" x2={pumpX + 8} y2="62" stroke="black" strokeWidth="1" />

            {/* Pump label */}
            <text x={pumpX + 6} y="135" fontSize="6" textAnchor="middle" fill="black">
              {idx === 0 ? 'DUTY' : idx === pumpCount - 1 ? 'STBY' : 'ASST'}
            </text>
          </g>
        );
      })}

      {/* Common discharge header */}
      <line x1="20" y1="40" x2="70" y2="40" stroke="blue" strokeWidth="3" />

      {/* Flow meter */}
      <circle cx="45" cy="40" r="5" fill="white" stroke="black" strokeWidth="1.5" />
      <text x="45" y="42" fontSize="6" textAnchor="middle" fill="black">FM</text>

      {/* Discharge to dry well/valve chamber */}
      <path
        d="M 70 40 L 85 40"
        stroke="blue"
        strokeWidth="3"
      />

      {/* Valve chamber */}
      <rect
        x="85"
        y="30"
        width="55"
        height="60"
        fill="#D3D3D3"
        opacity="0.2"
        stroke="black"
        strokeWidth="1.5"
      />
      <text x="112" y="25" fontSize="7" textAnchor="middle" fill="black">Valve Chamber</text>

      {/* Reflux valve */}
      <circle cx="100" cy="50" r="4" fill="white" stroke="black" strokeWidth="1.5" />
      <text x="100" y="52" fontSize="5" textAnchor="middle" fill="black">RV</text>

      {/* Air valve */}
      <circle cx="120" cy="35" r="3" fill="white" stroke="orange" strokeWidth="1.5" />
      <text x="120" y="30" fontSize="5" textAnchor="middle" fill="orange">AV</text>

      {/* Outflow */}
      <path
        d="M 140 60 L 155 60"
        stroke="blue"
        strokeWidth="3"
        markerEnd="url(#arrowblue)"
      />
      <text x="145" y="58" fontSize="7" fill="blue">Discharge</text>

      {/* Control panel */}
      <rect
        x="85"
        y="100"
        width="55"
        height="30"
        fill="#FFD700"
        opacity="0.2"
        stroke="black"
        strokeWidth="1.5"
      />
      <text x="112" y="110" fontSize="7" textAnchor="middle" fill="black">Control Panel</text>

      {/* VFD indicator */}
      {data.hasVFD && (
        <text x="112" y="120" fontSize="6" textAnchor="middle" fill="green">VFD</text>
      )}

      {/* Inlet */}
      <path
        d="M 5 80 L 15 80"
        stroke="blue"
        strokeWidth="3"
        markerEnd="url(#arrowblue)"
      />
      <text x="7" y="78" fontSize="7" fill="blue">Inlet</text>

      {/* Level sensor */}
      <rect x="40" y="32" width="10" height="6" fill="yellow" stroke="black" strokeWidth="1" />
      <line x1="45" y1="38" x2="45" y2="70" stroke="black" strokeWidth="1" strokeDasharray="1,1" />

      {/* Title */}
      <text x="75" y="150" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
        PUMPING STATION
      </text>

      {/* Configuration label */}
      <text x="75" y="160" fontSize="7" textAnchor="middle" fill="black">
        {data.pumpConfiguration === 'duty-standby' ? '1D+1S' :
         data.pumpConfiguration === 'duty-duty-standby' ? '2D+1S' :
         data.pumpConfiguration === 'duty-assist-standby' ? '1D+1A+1S' :
         'Variable Duty'}
      </text>

      {/* Capacity */}
      {data.pumpCapacity && (
        <text x="15" y="160" fontSize="6" fill="black">
          {data.pumpCapacity} m³/hr @ {data.totalHead || 25}m
        </text>
      )}
    </g>
  );

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

SubmersiblePumpStationNode.displayName = 'SubmersiblePumpStationNode';

// ============================================================================
// Dry Well Pump Station
// ============================================================================

export const DryWellPumpStationNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as PumpingStationNodeData;
  const pumpCount = data.pumpCount || 2;

  const renderSymbol = () => (
    <g>
      {/* Wet well on left */}
      <rect
        x="10"
        y="20"
        width="50"
        height="100"
        fill="#4682B4"
        opacity="0.2"
        stroke="black"
        strokeWidth="2"
      />

      {/* Water level */}
      <rect
        x="10"
        y="60"
        width="50"
        height="60"
        fill="#4682B4"
        opacity="0.4"
      />

      {/* Suction pipes to dry well */}
      {Array.from({ length: pumpCount }).map((_, idx) => {
        const y = 100 + (idx * 15);
        return (
          <path
            key={idx}
            d={`M 60 ${y} L 75 ${y}`}
            stroke="blue"
            strokeWidth="2"
          />
        );
      })}

      {/* Dry well */}
      <rect
        x="75"
        y="20"
        width="70"
        height="100"
        fill="#E0E0E0"
        opacity="0.2"
        stroke="black"
        strokeWidth="2"
      />

      {/* Horizontal centrifugal pumps */}
      {Array.from({ length: pumpCount }).map((_, idx) => {
        const y = 100 + (idx * 15);
        const status = data.pumpStatus?.[idx] || (idx === 0 ? 'running' : 'standby');

        return (
          <g key={idx}>
            {/* Pump body */}
            <rect
              x="85"
              y={y - 4}
              width="20"
              height="8"
              fill={status === 'running' ? 'green' : status === 'fault' ? 'red' : 'gray'}
              opacity="0.6"
              stroke="black"
              strokeWidth="1"
            />

            {/* Motor */}
            <rect
              x="105"
              y={y - 3}
              width="10"
              height="6"
              fill="orange"
              opacity="0.5"
              stroke="black"
              strokeWidth="1"
            />

            {/* Coupling */}
            <line x1="105" y1={y} x2="105" y2={y} stroke="black" strokeWidth="2" />

            {/* Suction isolation valve */}
            <circle cx="78" cy={y} r="2.5" fill="white" stroke="black" strokeWidth="1" />

            {/* Discharge isolation valve */}
            <circle cx="120" cy={y} r="2.5" fill="white" stroke="black" strokeWidth="1" />

            {/* Check valve */}
            <circle cx="127" cy={y} r="2.5" fill="white" stroke="black" strokeWidth="1" />
            <polygon
              points={`${125},${y} ${129},${y - 2} ${129},${y + 2}`}
              fill="black"
            />

            {/* Discharge pipe */}
            <path
              d={`M 129.5 ${y} L 135 ${y} L 135 40`}
              stroke="blue"
              strokeWidth="2"
            />

            {/* Pump label */}
            <text x="95" y={y + 12} fontSize="6" textAnchor="middle" fill="black">
              P{idx + 1}
            </text>
          </g>
        );
      })}

      {/* Common discharge header */}
      <line x1="135" y1="35" x2="135" y2="40" stroke="blue" strokeWidth="3" />
      <path
        d="M 135 37 L 155 37"
        stroke="blue"
        strokeWidth="3"
        markerEnd="url(#arrowblue)"
      />

      {/* Pressure gauge */}
      <circle cx="145" cy="37" r="4" fill="white" stroke="black" strokeWidth="1" />
      <text x="145" y="39" fontSize="5" textAnchor="middle" fill="black">P</text>

      {/* Inlet */}
      <path
        d="M 5 80 L 10 80"
        stroke="blue"
        strokeWidth="3"
        markerEnd="url(#arrowblue)"
      />
      <text x="7" y="78" fontSize="7" fill="blue">Inlet</text>

      {/* Level sensor */}
      <rect x="30" y="22" width="10" height="6" fill="yellow" stroke="black" strokeWidth="1" />
      <line x1="35" y1="28" x2="35" y2="60" stroke="black" strokeWidth="1" strokeDasharray="1,1" />

      {/* Sump pump for drainage */}
      <rect x="80" y="110" width="8" height="6" fill="gray" stroke="black" strokeWidth="1" />
      <text x="84" y="118" fontSize="5" textAnchor="middle" fill="black">Sump</text>

      {/* Labels */}
      <text x="35" y="15" fontSize="8" fontWeight="bold" textAnchor="middle" fill="black">
        WET WELL
      </text>
      <text x="110" y="15" fontSize="8" fontWeight="bold" textAnchor="middle" fill="black">
        DRY WELL
      </text>

      {/* Title */}
      <text x="75" y="135" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
        DRY WELL PUMPING STATION
      </text>
    </g>
  );

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

DryWellPumpStationNode.displayName = 'DryWellPumpStationNode';

// ============================================================================
// Exports
// ============================================================================

export const ThamesWaterPumpingStationComponents = {
  WetWellNode,
  SubmersiblePumpStationNode,
  DryWellPumpStationNode,
};

export const ThamesWaterPumpingStationTypes = {
  WET_WELL: 'thames-wet-well',
  SUBMERSIBLE_PUMP_STATION: 'thames-submersible-pump-station',
  DRY_WELL_PUMP_STATION: 'thames-dry-well-pump-station',
} as const;
