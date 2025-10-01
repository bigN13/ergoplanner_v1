/**
 * Severn Trent Sewage Treatment - Sludge Handling Components
 *
 * Standard: Severn Trent Engineering Standards ST-ES-2024
 * Category: Sludge Treatment Systems
 *
 * Components:
 * - Sludge Thickener (Gravity/DAF)
 * - Centrifuge Dewatering
 * - Belt Filter Press
 */

import React from 'react';
import { BaseSymbolNode, BaseSymbolData, BaseSymbolProps } from '../../BaseSymbolNode';

// ============================================================================
// Type Definitions
// ============================================================================

export type SludgeHandlingType =
  | 'gravity-thickener'
  | 'daf-thickener'
  | 'centrifuge'
  | 'belt-press'
  | 'plate-press'
  | 'screw-press';

export type ThickenerType =
  | 'gravity'
  | 'daf'              // Dissolved Air Flotation
  | 'rotary-drum';

export type CentrifugeType =
  | 'solid-bowl'
  | 'basket'
  | 'disc-stack';

export interface SludgeHandlingNodeData extends BaseSymbolData {
  handlingType?: SludgeHandlingType;
  thickenerType?: ThickenerType;
  centrifugeType?: CentrifugeType;

  // Thickener parameters
  diameter?: number;              // meters
  feedSolids?: number;            // % solids
  underflowSolids?: number;       // % solids
  surfaceLoading?: number;        // kg/m²/hr
  polymerDose?: number;           // mg/L

  // Centrifuge parameters
  bowlSpeed?: number;             // rpm
  differentialSpeed?: number;     // rpm
  gForce?: number;                // G's
  throughput?: number;            // m³/hr
  cakeSolids?: number;            // % dry solids

  // Belt press parameters
  beltSpeed?: number;             // m/min
  pressureZones?: number;
  washWaterFlow?: number;         // L/min

  // Status
  isRunning?: boolean;
  power?: number;                 // kW
}

// ============================================================================
// Sludge Thickener (Gravity)
// ============================================================================

export const SludgeThickenerNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as SludgeHandlingNodeData;

  const renderSymbol = () => {
    const centerX = 80;
    const centerY = 80;
    const radius = 50;

    return (
      <g>
        {/* Thickener tank - circular */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="#A0522D"
          opacity="0.2"
          stroke="black"
          strokeWidth="2"
        />

        {/* Sludge blanket layer */}
        <path
          d={`M ${centerX - radius} ${centerY + 20} Q ${centerX} ${centerY + 30}, ${centerX + radius} ${centerY + 20}`}
          fill="#654321"
          opacity="0.5"
        />
        <path
          d={`M ${centerX - radius} ${centerY + 20} L ${centerX - radius} ${centerY + radius} A ${radius} ${radius} 0 0 0 ${centerX + radius} ${centerY + radius} L ${centerX + radius} ${centerY + 20}`}
          fill="#4A2511"
          opacity="0.4"
        />

        {/* Center rotating mechanism (pickets) */}
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
          const angleRad = (angle * Math.PI) / 180;
          const armLength = radius - 10;
          const endX = centerX + armLength * Math.cos(angleRad);
          const endY = centerY + armLength * Math.sin(angleRad);

          return (
            <line
              key={idx}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="gray"
              strokeWidth="2"
              opacity="0.6"
            />
          );
        })}

        {/* Center drive */}
        <circle cx={centerX} cy={centerY} r="8" fill="gray" stroke="black" strokeWidth="1.5" />
        <text x={centerX} y={centerY + 3} fontSize="6" textAnchor="middle" fill="white">DRIVE</text>

        {/* Feed inlet at center (feed well) */}
        <circle cx={centerX} cy={centerY - 15} r="10" fill="lightblue" opacity="0.3" stroke="blue" strokeWidth="1.5" />
        <path
          d={`M ${centerX} 20 L ${centerX} ${centerY - 25}`}
          stroke="blue"
          strokeWidth="3"
          markerEnd="url(#arrowblue)"
        />
        <text x={centerX + 3} y="18" fontSize="7" fill="blue">Feed</text>

        {/* Polymer addition */}
        <path
          d={`M ${centerX + 15} 25 L ${centerX + 15} ${centerY - 20}`}
          stroke="purple"
          strokeWidth="1.5"
          strokeDasharray="3,2"
          markerEnd="url(#arrowpurple)"
        />
        <text x={centerX + 18} y="23" fontSize="6" fill="purple">Polymer</text>

        {/* Overflow weir (thickened supernatant) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 5}
          fill="none"
          stroke="lightblue"
          strokeWidth="2"
          strokeDasharray="4,2"
        />

        {/* Overflow collection */}
        <path
          d={`M ${centerX + radius - 5} ${centerY - 10} L ${centerX + radius + 10} ${centerY - 10}`}
          stroke="lightblue"
          strokeWidth="2"
        />
        <path
          d={`M ${centerX + radius + 10} ${centerY - 10} L ${centerX + radius + 10} ${centerY + 10} L ${centerX + radius + 20} ${centerY + 10}`}
          stroke="lightblue"
          strokeWidth="2"
          markerEnd="url(#arrowlightblue)"
        />
        <text x={centerX + radius + 22} y={centerY + 12} fontSize="7" fill="lightblue">Overflow</text>

        {/* Underflow (thickened sludge) */}
        <path
          d={`M ${centerX} ${centerY + radius} L ${centerX} ${centerY + radius + 15}`}
          stroke="brown"
          strokeWidth="3"
          markerEnd="url(#arrowbrown)"
        />
        <text x={centerX + 3} y={centerY + radius + 13} fontSize="7" fill="brown">Underflow</text>

        {/* Rake rotation indicator */}
        {data.isRunning && (
          <path
            d={`M ${centerX + 12} ${centerY - 3} A 13 13 0 0 1 ${centerX + 3} ${centerY + 12}`}
            fill="none"
            stroke="green"
            strokeWidth="1.5"
            markerEnd="url(#arrowgreen-small)"
          />
        )}

        {/* Title */}
        <text x={centerX} y="10" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
          SLUDGE THICKENER
        </text>

        {/* Type label */}
        <text x={centerX} y="18" fontSize="7" textAnchor="middle" fill="black">
          {data.thickenerType === 'gravity' ? 'Gravity Thickener' :
           data.thickenerType === 'daf' ? 'DAF Thickener' :
           'Gravity Thickener'}
        </text>

        {/* Solids concentration */}
        <g>
          <rect x="10" y={centerY - 15} width="35" height="20" fill="blue" opacity="0.2" stroke="blue" strokeWidth="1" />
          <text x="27.5" y={centerY - 8} fontSize="7" textAnchor="middle" fill="blue">Feed</text>
          <text x="27.5" y={centerY} fontSize="8" fontWeight="bold" textAnchor="middle" fill="blue">
            {data.feedSolids || 1.5}%
          </text>
        </g>

        <g>
          <rect x={centerX + 35} y={centerY + radius - 10} width="40" height="20" fill="brown" opacity="0.2" stroke="brown" strokeWidth="1" />
          <text x={centerX + 55} y={centerY + radius - 3} fontSize="7" textAnchor="middle" fill="brown">U/F</text>
          <text x={centerX + 55} y={centerY + radius + 5} fontSize="8" fontWeight="bold" textAnchor="middle" fill="brown">
            {data.underflowSolids || 4.0}%
          </text>
        </g>

        {/* Diameter */}
        {data.diameter && (
          <text x={centerX} y={centerY + radius + 25} fontSize="7" textAnchor="middle" fill="black">
            Ø{data.diameter}m
          </text>
        )}

        {/* Arrow markers */}
        <defs>
          <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="blue" />
          </marker>
          <marker id="arrowpurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="purple" />
          </marker>
          <marker id="arrowlightblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="lightblue" />
          </marker>
          <marker id="arrowbrown" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="brown" />
          </marker>
          <marker id="arrowgreen-small" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="green" />
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

SludgeThickenerNode.displayName = 'SludgeThickenerNode';

// ============================================================================
// Centrifuge Dewatering
// ============================================================================

export const CentrifugeNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as SludgeHandlingNodeData;

  const renderSymbol = () => (
    <g>
      {/* Centrifuge bowl - horizontal */}
      <ellipse
        cx="80"
        cy="70"
        rx="60"
        ry="25"
        fill="#C0C0C0"
        opacity="0.3"
        stroke="black"
        strokeWidth="2"
      />

      {/* Bowl casing detail */}
      <ellipse
        cx="80"
        cy="70"
        rx="55"
        ry="20"
        fill="none"
        stroke="gray"
        strokeWidth="1"
      />

      {/* Conical end (solids discharge) */}
      <path
        d="M 140 70 L 155 60 L 155 80 Z"
        fill="#A9A9A9"
        stroke="black"
        strokeWidth="1.5"
      />

      {/* Feed inlet */}
      <path
        d="M 70 40 L 70 45"
        stroke="brown"
        strokeWidth="3"
        markerEnd="url(#arrowbrown)"
      />
      <text x="55" y="38" fontSize="7" fill="brown">Sludge Feed</text>

      {/* Polymer addition */}
      <path
        d="M 90 40 L 90 45"
        stroke="purple"
        strokeWidth="2"
        strokeDasharray="3,2"
        markerEnd="url(#arrowpurple)"
      />
      <text x="92" y="38" fontSize="6" fill="purple">Polymer</text>

      {/* Centrate (liquid discharge) */}
      <path
        d="M 60 95 L 60 105"
        stroke="lightblue"
        strokeWidth="2.5"
        markerEnd="url(#arrowlightblue)"
      />
      <text x="42" y="103" fontSize="7" fill="lightblue">Centrate</text>

      <path
        d="M 100 95 L 100 105"
        stroke="lightblue"
        strokeWidth="2.5"
        markerEnd="url(#arrowlightblue)"
      />

      {/* Cake discharge (solids) */}
      <path
        d="M 155 70 L 170 70"
        stroke="darkbrown"
        strokeWidth="3"
        markerEnd="url(#arrowdarkbrown)"
      />
      <text x="172" y="68" fontSize="7" fill="darkbrown">Cake</text>

      {/* Conveyor screw indication */}
      {[50, 65, 80, 95, 110, 125].map((x, idx) => (
        <line
          key={idx}
          x1={x}
          y1="65"
          x2={x}
          y2="75"
          stroke="gray"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}

      {/* Motor/drive */}
      <rect x="15" y="62" width="20" height="16" fill="red" stroke="black" strokeWidth="1.5" />
      <text x="25" y="72" fontSize="7" textAnchor="middle" fill="white">MOTOR</text>

      {/* Drive shaft */}
      <line x1="35" y1="70" x2="45" y2="70" stroke="gray" strokeWidth="3" />

      {/* Rotation indicator */}
      {data.isRunning && (
        <g>
          <circle cx="80" cy="70" r="15" fill="none" stroke="green" strokeWidth="1.5" opacity="0.6" />
          <path
            d="M 92 65 A 13 13 0 0 1 85 82"
            fill="none"
            stroke="green"
            strokeWidth="2"
            markerEnd="url(#arrowgreen)"
          />
        </g>
      )}

      {/* Title */}
      <text x="80" y="20" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
        CENTRIFUGE
      </text>

      {/* Type */}
      <text x="80" y="28" fontSize="7" textAnchor="middle" fill="black">
        {data.centrifugeType === 'solid-bowl' ? 'Solid Bowl Decanter' :
         data.centrifugeType === 'basket' ? 'Basket Centrifuge' :
         data.centrifugeType === 'disc-stack' ? 'Disc Stack' :
         'Solid Bowl Decanter'}
      </text>

      {/* Bowl speed */}
      {data.bowlSpeed !== undefined && (
        <g>
          <rect x="55" y="50" width="50" height="12" fill="green" opacity="0.2" stroke="green" strokeWidth="1" />
          <text x="80" y="58" fontSize="8" fontWeight="bold" textAnchor="middle" fill="green">
            {data.bowlSpeed} rpm
          </text>
        </g>
      )}

      {/* G-Force */}
      {data.gForce !== undefined && (
        <text x="120" y="58" fontSize="7" fill="black">
          {data.gForce} G
        </text>
      )}

      {/* Cake solids */}
      {data.cakeSolids !== undefined && (
        <g>
          <rect x="145" y="50" width="30" height="12" fill="brown" opacity="0.2" stroke="brown" strokeWidth="1" />
          <text x="160" y="58" fontSize="7" textAnchor="middle" fill="brown">
            {data.cakeSolids}% DS
          </text>
        </g>
      )}

      {/* Throughput */}
      {data.throughput !== undefined && (
        <text x="80" y="120" fontSize="7" textAnchor="middle" fill="black">
          Throughput: {data.throughput} m³/hr
        </text>
      )}

      {/* Power */}
      {data.power !== undefined && (
        <text x="20" y="85" fontSize="6" fill="red">
          {data.power} kW
        </text>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="green" />
        </marker>
        <marker id="arrowdarkbrown" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="darkbrown" />
        </marker>
      </defs>
    </g>
  );

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

CentrifugeNode.displayName = 'CentrifugeNode';

// ============================================================================
// Belt Filter Press
// ============================================================================

export const BeltFilterPressNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as SludgeHandlingNodeData;

  const renderSymbol = () => (
    <g>
      {/* Press frame */}
      <rect
        x="10"
        y="40"
        width="150"
        height="60"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Belt path - upper belt */}
      <path
        d="M 15 50 L 155 50"
        stroke="#8B4513"
        strokeWidth="4"
        fill="none"
      />

      {/* Belt path - lower belt */}
      <path
        d="M 15 90 L 155 90"
        stroke="#8B4513"
        strokeWidth="4"
        fill="none"
      />

      {/* Rollers */}
      {[25, 50, 75, 100, 125, 145].map((x, idx) => (
        <g key={idx}>
          {/* Top roller */}
          <circle cx={x} cy="50" r="5" fill="gray" stroke="black" strokeWidth="1" />

          {/* Bottom roller */}
          <circle cx={x} cy="90" r="5" fill="gray" stroke="black" strokeWidth="1" />

          {/* Pressure zone rollers (middle section) */}
          {idx >= 2 && idx <= 4 && (
            <g>
              <circle cx={x} cy="65" r="4" fill="darkgray" stroke="black" strokeWidth="1" />
              <circle cx={x} cy="75" r="4" fill="darkgray" stroke="black" strokeWidth="1" />

              {/* Pressure arrows */}
              <path d={`M ${x} 60 L ${x} 65`} stroke="red" strokeWidth="1" markerEnd="url(#arrowred-small)" />
              <path d={`M ${x} 80 L ${x} 75`} stroke="red" strokeWidth="1" markerEnd="url(#arrowred-small)" />
            </g>
          )}
        </g>
      ))}

      {/* Sludge feed (conditioning zone) */}
      <path
        d="M 30 25 L 30 40"
        stroke="brown"
        strokeWidth="3"
        markerEnd="url(#arrowbrown)"
      />
      <text x="15" y="23" fontSize="7" fill="brown">Feed</text>

      {/* Polymer addition */}
      <path
        d="M 45 25 L 45 40"
        stroke="purple"
        strokeWidth="2"
        strokeDasharray="3,2"
        markerEnd="url(#arrowpurple)"
      />
      <text x="35" y="15" fontSize="6" fill="purple">Polymer</text>

      {/* Wash water sprays */}
      {[135, 145].map((x, idx) => (
        <g key={idx}>
          <line x1={x} y1="35" x2={x} y2="42" stroke="blue" strokeWidth="2" />
          {[0, -5, 5].map((offset, sprayIdx) => (
            <line key={sprayIdx} x1={x + offset} y1="42" x2={x + offset} y2="48" stroke="lightblue" strokeWidth="1" opacity="0.6" />
          ))}
          {idx === 0 && <text x={x - 10} y="33" fontSize="6" fill="blue">Wash</text>}
        </g>
      ))}

      {/* Filtrate collection (gravity drainage zone) */}
      <path
        d="M 60 100 L 60 110"
        stroke="lightblue"
        strokeWidth="2"
        markerEnd="url(#arrowlightblue)"
      />
      <text x="45" y="108" fontSize="7" fill="lightblue">Filtrate</text>

      {/* Cake discharge */}
      <path
        d="M 160 70 L 175 70"
        stroke="darkbrown"
        strokeWidth="4"
        markerEnd="url(#arrowdarkbrown)"
      />
      <text x="177" y="68" fontSize="7" fill="darkbrown">Cake</text>

      {/* Drive motor */}
      <rect x="5" y="65" width="15" height="12" fill="red" stroke="black" strokeWidth="1" />
      <text x="12.5" y="73" fontSize="5" textAnchor="middle" fill="white">MTR</text>

      {/* Belt movement indicator */}
      {data.isRunning && (
        <g>
          {[40, 90, 140].map((x, idx) => (
            <path
              key={idx}
              d={`M ${x} 55 L ${x + 8} 55`}
              stroke="green"
              strokeWidth="1.5"
              markerEnd="url(#arrowgreen-tiny)"
            />
          ))}
        </g>
      )}

      {/* Zone labels */}
      <g>
        <text x="35" y="115" fontSize="7" textAnchor="middle" fill="black">Gravity</text>
        <text x="80" y="115" fontSize="7" textAnchor="middle" fill="black">Low Press</text>
        <text x="115" y="115" fontSize="7" textAnchor="middle" fill="black">High Press</text>
        <text x="145" y="115" fontSize="7" textAnchor="middle" fill="black">Wash</text>
      </g>

      {/* Title */}
      <text x="80" y="15" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
        BELT FILTER PRESS
      </text>

      {/* Belt speed */}
      {data.beltSpeed !== undefined && (
        <g>
          <rect x="60" y="25" width="40" height="10" fill="green" opacity="0.2" stroke="green" strokeWidth="1" />
          <text x="80" y="32" fontSize="7" textAnchor="middle" fill="green">
            {data.beltSpeed} m/min
          </text>
        </g>
      )}

      {/* Cake solids */}
      {data.cakeSolids !== undefined && (
        <text x="160" y="85" fontSize="7" fill="brown">
          {data.cakeSolids}% DS
        </text>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowred-small" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="red" />
        </marker>
        <marker id="arrowgreen-tiny" markerWidth="6" markerHeight="6" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="green" />
        </marker>
      </defs>
    </g>
  );

  return (
    <BaseSymbolNode
      {...props}
      renderSymbol={renderSymbol}
    />
  );
});

BeltFilterPressNode.displayName = 'BeltFilterPressNode';

// ============================================================================
// Exports
// ============================================================================

export const SevernTrentSludgeHandlingComponents = {
  SludgeThickenerNode,
  CentrifugeNode,
  BeltFilterPressNode,
};

export const SevernTrentSludgeHandlingTypes = {
  SLUDGE_THICKENER: 'severn-sludge-thickener',
  CENTRIFUGE: 'severn-centrifuge',
  BELT_FILTER_PRESS: 'severn-belt-filter-press',
} as const;
