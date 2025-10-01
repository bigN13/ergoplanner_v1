/**
 * Severn Trent Sewage Treatment - Anaerobic Digester Components
 *
 * Standard: Severn Trent Engineering Standards ST-ES-2024
 * Category: Sludge Treatment Systems
 *
 * Components:
 * - Anaerobic Digester with gas collection
 * - Storm Tank with overflow weir
 */

import React from 'react';
import { BaseSymbolNode, BaseSymbolData, BaseSymbolProps } from '../../BaseSymbolNode';

// ============================================================================
// Type Definitions
// ============================================================================

export type DigesterType =
  | 'mesophilic'      // 35°C operation
  | 'thermophilic'    // 55°C operation
  | 'psychrophilic';  // 20°C operation

export type MixingSystem =
  | 'gas-recirculation'
  | 'mechanical-mixer'
  | 'draft-tube'
  | 'external-pump';

export interface AnaerobicDigesterNodeData extends BaseSymbolData {
  digesterType?: DigesterType;
  mixingSystem?: MixingSystem;

  // Dimensions
  diameter?: number;              // meters
  height?: number;                // meters
  workingVolume?: number;         // m³

  // Operating parameters
  temperature?: number;           // °C
  hrt?: number;                   // days (Hydraulic Retention Time)
  organicLoading?: number;        // kg VS/m³/day
  gasProduction?: number;         // m³/day
  methaneContent?: number;        // % CH₄

  // Status
  sludgeLevel?: number;           // meters
  pressure?: number;              // kPa
  isHeated?: boolean;
  isMixing?: boolean;
}

export interface StormTankNodeData extends BaseSymbolData {
  tankType?: 'storm' | 'emergency';

  // Dimensions
  length?: number;                // meters
  width?: number;                 // meters
  depth?: number;                 // meters
  volume?: number;                // m³

  // Operating parameters
  currentLevel?: number;          // meters
  overflowLevel?: number;         // meters
  alarmLevel?: number;            // meters
  inflowRate?: number;            // m³/hr
}

// ============================================================================
// Anaerobic Digester
// ============================================================================

export const AnaerobicDigesterNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as AnaerobicDigesterNodeData;

  const renderSymbol = () => {
    const centerX = 80;
    const topY = 30;
    const bodyHeight = 80;
    const bottomY = topY + bodyHeight;

    return (
      <g>
        {/* Digester dome top */}
        <path
          d={`M 30 ${topY} Q 30 ${topY - 20}, 80 ${topY - 20} T 130 ${topY}`}
          fill="#8B7355"
          opacity="0.3"
          stroke="black"
          strokeWidth="2"
        />

        {/* Digester cylindrical body */}
        <rect
          x="30"
          y={topY}
          width="100"
          height={bodyHeight}
          fill="#654321"
          opacity="0.3"
          stroke="black"
          strokeWidth="2"
        />

        {/* Sludge level */}
        {data.sludgeLevel !== undefined && (
          <rect
            x="30"
            y={topY + (bodyHeight * (1 - data.sludgeLevel / (data.height || 10)))}
            width="100"
            height={bodyHeight * (data.sludgeLevel / (data.height || 10))}
            fill="#4A2511"
            opacity="0.5"
          />
        )}

        {/* Conical bottom */}
        <path
          d={`M 30 ${bottomY} L 80 ${bottomY + 15} L 130 ${bottomY}`}
          fill="#4A2511"
          opacity="0.4"
          stroke="black"
          strokeWidth="2"
        />

        {/* Gas collection dome - internal */}
        <ellipse
          cx={centerX}
          cy={topY}
          rx="45"
          ry="15"
          fill="#FFD700"
          opacity="0.3"
          stroke="orange"
          strokeWidth="1"
          strokeDasharray="3,2"
        />

        {/* Biogas outlet pipe */}
        <path
          d={`M ${centerX} ${topY - 20} L ${centerX} ${topY - 30}`}
          stroke="orange"
          strokeWidth="3"
          markerStart="url(#arroworange-up)"
        />
        <text x={centerX + 3} y={topY - 25} fontSize="7" fill="orange" fontWeight="bold">BIOGAS</text>

        {/* Gas production rate */}
        {data.gasProduction !== undefined && (
          <text x={centerX + 20} y={topY - 32} fontSize="6" fill="orange">
            {data.gasProduction} m³/d
          </text>
        )}

        {/* Methane content */}
        {data.methaneContent !== undefined && (
          <text x={centerX - 40} y={topY - 32} fontSize="6" fill="orange">
            CH₄: {data.methaneContent}%
          </text>
        )}

        {/* Mixing system */}
        {data.mixingSystem === 'gas-recirculation' && (
          <g>
            {/* Gas recirculation pipes */}
            <path
              d={`M 140 ${topY + 10} L 150 ${topY + 10} L 150 ${topY + 50} L 140 ${topY + 50}`}
              stroke="orange"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arroworange)"
            />
            <text x="152" y={topY + 30} fontSize="6" fill="orange">Gas Recirc</text>

            {/* Internal gas lances */}
            {[50, 80, 110].map((x, idx) => (
              <g key={idx}>
                <line x1={x} y1={topY + 60} x2={x} y2={topY + 80} stroke="orange" strokeWidth="1.5" />
                {data.isMixing && (
                  <g>
                    <circle cx={x - 3} cy={topY + 75} r="1" fill="orange" opacity="0.6" />
                    <circle cx={x + 3} cy={topY + 72} r="1" fill="orange" opacity="0.6" />
                    <circle cx={x} cy={topY + 68} r="1" fill="orange" opacity="0.6" />
                  </g>
                )}
              </g>
            ))}
          </g>
        )}

        {data.mixingSystem === 'mechanical-mixer' && (
          <g>
            {/* Mechanical mixer shaft */}
            <line x1={centerX} y1={topY - 10} x2={centerX} y2={topY + 50} stroke="gray" strokeWidth="3" />

            {/* Impeller */}
            <line x1={centerX - 15} y1={topY + 50} x2={centerX + 15} y2={topY + 50} stroke="gray" strokeWidth="4" />

            {/* Motor */}
            <rect x={centerX - 10} y={topY - 15} width="20" height="8" fill="red" stroke="black" strokeWidth="1" />
            <text x={centerX - 15} y={topY - 17} fontSize="6" fill="red">Motor</text>
          </g>
        )}

        {/* Sludge feed inlet */}
        <path
          d={`M 20 ${topY + 30} L 30 ${topY + 30}`}
          stroke="brown"
          strokeWidth="3"
          markerEnd="url(#arrowbrown)"
        />
        <text x="5" y={topY + 28} fontSize="7" fill="brown">Sludge Feed</text>

        {/* Digested sludge outlet */}
        <path
          d={`M 80 ${bottomY + 15} L 80 ${bottomY + 25}`}
          stroke="darkbrown"
          strokeWidth="3"
          markerEnd="url(#arrowdarkbrown)"
        />
        <text x="48" y={bottomY + 30} fontSize="7" fill="darkbrown">Digested Sludge</text>

        {/* Supernatant outlet */}
        <path
          d={`M 130 ${topY + 20} L 145 ${topY + 20}`}
          stroke="gray"
          strokeWidth="2"
          markerEnd="url(#arrowgray)"
        />
        <text x="147" y={topY + 22} fontSize="6" fill="gray">Supernatant</text>

        {/* Heating system indicator */}
        {data.isHeated && (
          <g>
            {/* Heating coil representation */}
            <path
              d={`M 35 ${topY + 70} Q 45 ${topY + 72}, 55 ${topY + 70} T 75 ${topY + 70} T 95 ${topY + 70} T 115 ${topY + 70} T 125 ${topY + 68}`}
              stroke="red"
              strokeWidth="2"
              fill="none"
            />

            {/* Heating circuit */}
            <circle cx="20" cy={topY + 70} r="5" fill="red" opacity="0.3" stroke="red" strokeWidth="1.5" />
            <text x="12" y={topY + 73} fontSize="6" fill="red">HX</text>
          </g>
        )}

        {/* Title */}
        <text x={centerX} y="15" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
          ANAEROBIC DIGESTER
        </text>

        {/* Digester type */}
        <text x={centerX} y="23" fontSize="7" textAnchor="middle" fill="black">
          {data.digesterType === 'mesophilic' ? 'Mesophilic (35°C)' :
           data.digesterType === 'thermophilic' ? 'Thermophilic (55°C)' :
           data.digesterType === 'psychrophilic' ? 'Psychrophilic (20°C)' :
           'Mesophilic (35°C)'}
        </text>

        {/* Temperature indicator */}
        {data.temperature !== undefined && (
          <g>
            <rect x="10" y={topY + 5} width="35" height="12" fill="red" opacity="0.2" stroke="red" strokeWidth="1" />
            <text x="27.5" y={topY + 13} fontSize="8" fontWeight="bold" textAnchor="middle" fill="red">
              {data.temperature}°C
            </text>
          </g>
        )}

        {/* HRT (Hydraulic Retention Time) */}
        {data.hrt !== undefined && (
          <text x="135" y={topY + 90} fontSize="7" fill="black">
            HRT: {data.hrt} days
          </text>
        )}

        {/* Pressure gauge */}
        {data.pressure !== undefined && (
          <g>
            <circle cx="145" cy={topY + 10} r="6" fill="white" stroke="black" strokeWidth="1" />
            <text x="145" y={topY + 12} fontSize="5" textAnchor="middle" fill="black">
              {data.pressure}kPa
            </text>
          </g>
        )}

        {/* Volume */}
        {data.workingVolume && (
          <text x={centerX} y={bottomY + 40} fontSize="7" textAnchor="middle" fill="black">
            Volume: {data.workingVolume} m³ | Ø{data.diameter || 20}m × {data.height || 10}m H
          </text>
        )}

        {/* Arrow markers */}
        <defs>
          <marker id="arroworange-up" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
            <polygon points="10 0, 0 3, 10 6" fill="orange" />
          </marker>
          <marker id="arroworange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="orange" />
          </marker>
          <marker id="arrowbrown" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="brown" />
          </marker>
          <marker id="arrowdarkbrown" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="darkbrown" />
          </marker>
          <marker id="arrowgray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="gray" />
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

AnaerobicDigesterNode.displayName = 'AnaerobicDigesterNode';

// ============================================================================
// Storm Tank with Overflow Weir
// ============================================================================

export const StormTankNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as StormTankNodeData;

  const renderSymbol = () => {
    const tankTop = 30;
    const tankBottom = 120;
    const tankHeight = tankBottom - tankTop;

    // Calculate levels
    const overflowY = data.overflowLevel !== undefined
      ? tankBottom - (data.overflowLevel / (data.depth || 5)) * tankHeight
      : tankTop + 20;
    const alarmY = data.alarmLevel !== undefined
      ? tankBottom - (data.alarmLevel / (data.depth || 5)) * tankHeight
      : tankTop + 30;
    const currentY = data.currentLevel !== undefined
      ? tankBottom - (data.currentLevel / (data.depth || 5)) * tankHeight
      : tankTop + 60;

    return (
      <g>
        {/* Storm tank body */}
        <rect
          x="20"
          y={tankTop}
          width="120"
          height={tankHeight}
          fill="none"
          stroke="black"
          strokeWidth="2"
        />

        {/* Current water level */}
        <rect
          x="20"
          y={currentY}
          width="120"
          height={tankBottom - currentY}
          fill="#4682B4"
          opacity="0.4"
        />

        {/* Overflow weir */}
        <g>
          {/* Weir wall */}
          <line x1="140" y1={overflowY} x2="160" y2={overflowY} stroke="black" strokeWidth="3" />
          <line x1="140" y1={overflowY} x2="140" y2={overflowY + 20} stroke="black" strokeWidth="2" />

          {/* Overflow channel */}
          <path
            d={`M 160 ${overflowY} L 160 ${overflowY + 15} L 170 ${overflowY + 15}`}
            stroke="blue"
            strokeWidth="2"
            fill="none"
          />

          {/* Overflow discharge */}
          <path
            d={`M 170 ${overflowY + 15} L 180 ${overflowY + 15}`}
            stroke="blue"
            strokeWidth="3"
            markerEnd="url(#arrowblue)"
          />
          <text x="182" y={overflowY + 17} fontSize="7" fill="blue">Overflow</text>

          {/* Water spilling over weir if level is high */}
          {data.currentLevel !== undefined && data.overflowLevel !== undefined &&
           data.currentLevel >= data.overflowLevel && (
            <g>
              {/* Cascading water */}
              <path
                d={`M 140 ${overflowY} Q 145 ${overflowY + 5}, 150 ${overflowY + 10} T 160 ${overflowY + 15}`}
                stroke="lightblue"
                strokeWidth="3"
                fill="none"
                opacity="0.7"
              />
            </g>
          )}
        </g>

        {/* Inlet */}
        <path
          d="M 5 60 L 20 60"
          stroke="blue"
          strokeWidth="3"
          markerEnd="url(#arrowblue)"
        />
        <text x="2" y="58" fontSize="7" fill="blue">Storm</text>
        <text x="2" y="66" fontSize="7" fill="blue">Inflow</text>

        {/* Outlet (to treatment) */}
        <path
          d="M 80 120 L 80 135"
          stroke="blue"
          strokeWidth="3"
          markerEnd="url(#arrowblue)"
        />
        <text x="50" y="133" fontSize="7" fill="blue">To Treatment</text>

        {/* Outlet valve */}
        <circle cx="80" cy="125" r="4" fill="white" stroke="black" strokeWidth="1.5" />
        <line x1="77" y1="123" x2="83" y2="127" stroke="black" strokeWidth="1.5" />

        {/* Level indicators */}
        {/* Overflow level - red */}
        <line x1="15" y1={overflowY} x2="145" y2={overflowY} stroke="red" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x="147" y={overflowY + 3} fontSize="7" fill="red">OFL</text>

        {/* Alarm level - orange */}
        <line x1="15" y1={alarmY} x2="145" y2={alarmY} stroke="orange" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x="147" y={alarmY + 3} fontSize="7" fill="orange">AL</text>

        {/* Level sensor */}
        <rect x="70" y={tankTop - 5} width="10" height="8" fill="yellow" stroke="black" strokeWidth="1" />
        <text x="75" y={tankTop + 1} fontSize="5" textAnchor="middle" fill="black">LT</text>
        <line x1="75" y1={tankTop + 3} x2="75" y2={currentY - 5} stroke="black" strokeWidth="1" strokeDasharray="1,1" />

        {/* Title */}
        <text x="80" y="20" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
          STORM TANK
        </text>

        {/* Level display */}
        <rect x="5" y="70" width="20" height="35" fill="white" stroke="black" strokeWidth="1" />
        <text x="15" y="78" fontSize="6" textAnchor="middle" fill="black">Level</text>
        <text x="15" y="90" fontSize="10" fontWeight="bold" textAnchor="middle" fill={
          data.currentLevel && data.alarmLevel && data.currentLevel >= data.alarmLevel ? 'red' : 'blue'
        }>
          {data.currentLevel?.toFixed(1) || '2.5'}m
        </text>

        {/* Alarm indicator */}
        {data.currentLevel !== undefined && data.alarmLevel !== undefined &&
         data.currentLevel >= data.alarmLevel && (
          <g>
            <circle cx="15" cy="50" r="6" fill="red" opacity="0.8" />
            <text x="15" y="53" fontSize="8" fontWeight="bold" textAnchor="middle" fill="white">!</text>
            <text x="23" y="52" fontSize="6" fill="red">ALARM</text>
          </g>
        )}

        {/* Tank dimensions */}
        {data.length && (
          <text x="80" y="145" fontSize="7" textAnchor="middle" fill="black">
            {data.length}m × {data.width}m × {data.depth}m | {data.volume} m³
          </text>
        )}

        {/* Inflow rate */}
        {data.inflowRate !== undefined && (
          <text x="5" y="75" fontSize="6" fill="blue">
            {data.inflowRate} m³/hr
          </text>
        )}

        {/* Arrow markers */}
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

StormTankNode.displayName = 'StormTankNode';

// ============================================================================
// Exports
// ============================================================================

export const SevernTrentAnaerobicDigesterComponents = {
  AnaerobicDigesterNode,
  StormTankNode,
};

export const SevernTrentAnaerobicDigesterTypes = {
  ANAEROBIC_DIGESTER: 'severn-anaerobic-digester',
  STORM_TANK: 'severn-storm-tank',
} as const;
