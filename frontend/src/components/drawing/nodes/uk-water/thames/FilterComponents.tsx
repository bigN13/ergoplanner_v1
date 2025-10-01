/**
 * Thames Water Treatment Plant Filter Components
 *
 * Standard: Thames Water TW-STD-2023
 * Category: Filtration Systems
 *
 * Components:
 * - Rapid Gravity Filter with backwash system
 * - GAC (Granular Activated Carbon) Filter
 * - Sand Filter with air scour
 * - Membrane Filter with CIP
 */

import React from 'react';
import { BaseSymbolNode, BaseSymbolData, BaseSymbolProps } from '../../BaseSymbolNode';

// ============================================================================
// Type Definitions
// ============================================================================

export type FilterType =
  | 'rapid-gravity'
  | 'gac'
  | 'sand'
  | 'membrane';

export type BackwashSystem =
  | 'water-only'
  | 'air-scour-water'
  | 'surface-wash';

export type MediaConfiguration =
  | 'single-media'      // Sand only
  | 'dual-media'        // Anthracite + Sand
  | 'multi-media'       // Anthracite + Sand + Garnet
  | 'gac';              // Granulated Activated Carbon

export type MembraneType =
  | 'hollow-fiber'
  | 'spiral-wound'
  | 'tubular'
  | 'flat-sheet';

export type FilterMode =
  | 'filtration'
  | 'backwash'
  | 'rinse'
  | 'standby';

export interface FilterNodeData extends BaseSymbolData {
  filterType?: FilterType;
  backwashSystem?: BackwashSystem;
  mediaConfiguration?: MediaConfiguration;
  membraneType?: MembraneType;
  mode?: FilterMode;

  // Dimensions
  length?: number;          // meters
  width?: number;           // meters
  mediaDepth?: number;      // meters

  // Operating parameters
  filtrationRate?: number;  // m³/m²/hr
  backwashRate?: number;    // m³/m²/hr
  backwashDuration?: number; // minutes
  airScourRate?: number;    // m³/m²/hr (if applicable)

  // Membrane specific
  membraneArea?: number;    // m²
  permeateFlux?: number;    // LMH (L/m²/hr)
  tmpOperating?: number;    // TMP (kPa)

  // Status indicators
  headloss?: number;        // meters
  turbidity?: number;       // NTU
  hasAirScour?: boolean;
  hasCIP?: boolean;         // Clean-In-Place (membranes)
}

// ============================================================================
// Rapid Gravity Filter
// ============================================================================

export const RapidGravityFilterNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as FilterNodeData;

  const renderSymbol = () => (
    <g>
      {/* Filter tank body - rectangular */}
      <rect
        x="10"
        y="10"
        width="80"
        height="100"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Media layers - dual media (anthracite + sand) */}
      <rect x="15" y="50" width="70" height="20" fill="#4A4A4A" opacity="0.3" />
      <text x="50" y="63" fontSize="8" textAnchor="middle" fill="black">Anthracite</text>

      <rect x="15" y="70" width="70" height="25" fill="#C2B280" opacity="0.4" />
      <text x="50" y="85" fontSize="8" textAnchor="middle" fill="black">Sand</text>

      {/* Underdrain system */}
      <line x1="15" y1="95" x2="85" y2="95" stroke="black" strokeWidth="1.5" />
      <circle cx="25" cy="95" r="2" fill="black" />
      <circle cx="50" cy="95" r="2" fill="black" />
      <circle cx="75" cy="95" r="2" fill="black" />

      {/* Inlet channel at top */}
      <path
        d="M 30 10 L 30 5 L 70 5 L 70 10"
        fill="none"
        stroke="blue"
        strokeWidth="2"
      />
      <text x="50" y="4" fontSize="7" textAnchor="middle" fill="blue">Inlet</text>

      {/* Filtered water outlet */}
      <path
        d="M 50 110 L 50 120"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="55" y="118" fontSize="7" fill="blue">Filtrate</text>

      {/* Backwash inlet */}
      <path
        d="M 5 100 L 10 100"
        stroke="red"
        strokeWidth="1.5"
        markerEnd="url(#arrowred)"
      />
      <text x="2" y="98" fontSize="6" fill="red">BW</text>

      {/* Backwash waste outlet */}
      <path
        d="M 90 15 L 95 15"
        stroke="red"
        strokeWidth="1.5"
        markerEnd="url(#arrowred)"
      />
      <text x="92" y="13" fontSize="6" fill="red">Waste</text>

      {/* Air scour line */}
      <path
        d="M 5 105 L 10 105"
        stroke="orange"
        strokeWidth="1.5"
        markerEnd="url(#arroworange)"
      />
      <text x="2" y="110" fontSize="6" fill="orange">Air</text>

      {/* Filter mode indicator */}
      {data.mode && (
        <text x="50" y="25" fontSize="9" fontWeight="bold" textAnchor="middle" fill="green">
          {data.mode.toUpperCase()}
        </text>
      )}

      {/* Headloss indicator */}
      {data.headloss !== undefined && (
        <text x="90" y="50" fontSize="7" fill="red">
          ΔH: {data.headloss.toFixed(1)}m
        </text>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="blue" />
        </marker>
        <marker id="arrowred" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="red" />
        </marker>
        <marker id="arroworange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="orange" />
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

RapidGravityFilterNode.displayName = 'RapidGravityFilterNode';

// ============================================================================
// GAC (Granular Activated Carbon) Filter
// ============================================================================

export const GACFilterNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as FilterNodeData;

  const renderSymbol = () => (
    <g>
      {/* Filter tank body */}
      <rect
        x="10"
        y="10"
        width="80"
        height="100"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* GAC media bed - darker for carbon */}
      <rect x="15" y="40" width="70" height="50" fill="#1A1A1A" opacity="0.5" />
      <text x="50" y="60" fontSize="10" fontWeight="bold" textAnchor="middle" fill="white">GAC</text>
      <text x="50" y="72" fontSize="7" textAnchor="middle" fill="white">
        {data.mediaDepth ? `${data.mediaDepth}m depth` : '2.5m depth'}
      </text>

      {/* Support gravel layer */}
      <rect x="15" y="90" width="70" height="8" fill="#808080" opacity="0.4" />
      <text x="50" y="96" fontSize="6" textAnchor="middle" fill="black">Gravel</text>

      {/* Underdrain */}
      <line x1="15" y1="98" x2="85" y2="98" stroke="black" strokeWidth="1.5" />
      <circle cx="30" cy="98" r="2" fill="black" />
      <circle cx="50" cy="98" r="2" fill="black" />
      <circle cx="70" cy="98" r="2" fill="black" />

      {/* Inlet */}
      <path
        d="M 50 10 L 50 0"
        stroke="blue"
        strokeWidth="2"
        markerStart="url(#arrowblue-up)"
      />
      <text x="55" y="5" fontSize="7" fill="blue">Inlet</text>

      {/* Filtrate outlet */}
      <path
        d="M 50 110 L 50 120"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="55" y="118" fontSize="7" fill="blue">Filtrate</text>

      {/* Backwash lines */}
      <path
        d="M 5 100 L 10 100"
        stroke="red"
        strokeWidth="1.5"
        markerEnd="url(#arrowred)"
      />
      <text x="2" y="98" fontSize="6" fill="red">BW</text>

      <path
        d="M 90 20 L 95 20"
        stroke="red"
        strokeWidth="1.5"
        markerEnd="url(#arrowred)"
      />
      <text x="92" y="18" fontSize="6" fill="red">Waste</text>

      {/* Regeneration connection (for spent carbon) */}
      <path
        d="M 90 50 L 95 50"
        stroke="purple"
        strokeWidth="1.5"
        strokeDasharray="3,2"
      />
      <text x="92" y="48" fontSize="6" fill="purple">Regen</text>

      {/* GAC label */}
      <text x="50" y="25" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
        GAC FILTER
      </text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowblue-up" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
          <polygon points="10 0, 0 3, 10 6" fill="blue" />
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

GACFilterNode.displayName = 'GACFilterNode';

// ============================================================================
// Sand Filter with Air Scour
// ============================================================================

export const SandFilterNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as FilterNodeData;

  const renderSymbol = () => (
    <g>
      {/* Filter tank */}
      <rect
        x="10"
        y="10"
        width="80"
        height="100"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Sand media layer */}
      <rect x="15" y="45" width="70" height="45" fill="#C2B280" opacity="0.5" />
      <text x="50" y="68" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">SAND</text>
      <text x="50" y="78" fontSize="7" textAnchor="middle" fill="black">
        Effective size: 0.5-1.0mm
      </text>

      {/* Support gravel */}
      <rect x="15" y="90" width="70" height="8" fill="#696969" opacity="0.4" />
      <text x="50" y="96" fontSize="6" textAnchor="middle" fill="black">Support</text>

      {/* Underdrain with air distribution */}
      <line x1="15" y1="98" x2="85" y2="98" stroke="black" strokeWidth="2" />
      <circle cx="25" cy="98" r="2" fill="black" />
      <circle cx="40" cy="98" r="2" fill="black" />
      <circle cx="55" cy="98" r="2" fill="black" />
      <circle cx="70" cy="98" r="2" fill="black" />

      {/* Air distribution manifold */}
      <line x1="15" y1="103" x2="85" y2="103" stroke="orange" strokeWidth="1.5" />

      {/* Inlet */}
      <path
        d="M 35 10 L 35 5 L 65 5 L 65 10"
        fill="none"
        stroke="blue"
        strokeWidth="2"
      />
      <text x="50" y="4" fontSize="7" textAnchor="middle" fill="blue">Inlet</text>

      {/* Filtrate outlet */}
      <path
        d="M 50 110 L 50 120"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="55" y="118" fontSize="7" fill="blue">Filtrate</text>

      {/* Water backwash */}
      <path
        d="M 5 100 L 10 100"
        stroke="red"
        strokeWidth="2"
        markerEnd="url(#arrowred)"
      />
      <text x="2" y="98" fontSize="7" fontWeight="bold" fill="red">BW</text>

      {/* Air scour line - highlighted */}
      <path
        d="M 5 105 L 10 105"
        stroke="orange"
        strokeWidth="2"
        markerEnd="url(#arroworange)"
      />
      <text x="2" y="110" fontSize="7" fontWeight="bold" fill="orange">AIR</text>

      {/* Waste outlet */}
      <path
        d="M 90 20 L 95 20"
        stroke="red"
        strokeWidth="2"
        markerEnd="url(#arrowred)"
      />
      <text x="92" y="18" fontSize="7" fill="red">Waste</text>

      {/* Surface wash system */}
      <line x1="20" y1="40" x2="80" y2="40" stroke="blue" strokeWidth="1" strokeDasharray="2,2" />
      <circle cx="30" cy="40" r="1.5" fill="blue" />
      <circle cx="50" cy="40" r="1.5" fill="blue" />
      <circle cx="70" cy="40" r="1.5" fill="blue" />
      <text x="85" y="42" fontSize="6" fill="blue">SW</text>

      {/* Filter title */}
      <text x="50" y="25" fontSize="9" fontWeight="bold" textAnchor="middle" fill="black">
        SAND FILTER
      </text>

      {/* Air scour indicator */}
      {data.hasAirScour && (
        <rect x="65" y="30" width="20" height="8" fill="orange" opacity="0.3" stroke="orange" strokeWidth="1" />
      )}
      {data.hasAirScour && (
        <text x="75" y="36" fontSize="6" textAnchor="middle" fill="orange">AIR ON</text>
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

SandFilterNode.displayName = 'SandFilterNode';

// ============================================================================
// Membrane Filter with CIP
// ============================================================================

export const MembraneFilterNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as FilterNodeData;

  const renderSymbol = () => (
    <g>
      {/* Membrane vessel */}
      <rect
        x="10"
        y="10"
        width="80"
        height="110"
        rx="5"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Membrane module representation - hollow fiber bundles */}
      <g>
        {/* 5 membrane fiber bundles */}
        {[30, 40, 50, 60, 70].map((y, idx) => (
          <g key={idx}>
            <rect
              x="20"
              y={y}
              width="60"
              height="8"
              fill="#4682B4"
              opacity="0.4"
              stroke="#2E5C8A"
              strokeWidth="1"
            />
            {/* Hollow fiber lines */}
            <line x1="22" y1={y+2} x2="22" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
            <line x1="30" y1={y+2} x2="30" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
            <line x1="38" y1={y+2} x2="38" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
            <line x1="46" y1={y+2} x2="46" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
            <line x1="54" y1={y+2} x2="54" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
            <line x1="62" y1={y+2} x2="62" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
            <line x1="70" y1={y+2} x2="70" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
            <line x1="78" y1={y+2} x2="78" y2={y+6} stroke="#1E3A5F" strokeWidth="0.5" />
          </g>
        ))}
      </g>

      {/* Feed inlet */}
      <path
        d="M 5 30 L 10 30"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="2" y="28" fontSize="7" fill="blue">Feed</text>

      {/* Permeate outlet (through membrane) */}
      <path
        d="M 90 60 L 95 60"
        stroke="green"
        strokeWidth="2"
        markerEnd="url(#arrowgreen)"
      />
      <text x="92" y="58" fontSize="7" fill="green">Permeate</text>

      {/* Concentrate/Retentate outlet */}
      <path
        d="M 50 120 L 50 130"
        stroke="red"
        strokeWidth="2"
        markerEnd="url(#arrowred)"
      />
      <text x="55" y="128" fontSize="7" fill="red">Concentrate</text>

      {/* CIP (Clean-In-Place) connection */}
      <path
        d="M 5 90 L 10 90"
        stroke="purple"
        strokeWidth="1.5"
        strokeDasharray="3,2"
        markerEnd="url(#arrowpurple)"
      />
      <text x="2" y="88" fontSize="6" fill="purple">CIP</text>

      {/* Backwash line */}
      <path
        d="M 5 100 L 10 100"
        stroke="orange"
        strokeWidth="1.5"
        markerEnd="url(#arroworange)"
      />
      <text x="2" y="98" fontSize="6" fill="orange">BW</text>

      {/* Membrane type label */}
      <text x="50" y="20" fontSize="9" fontWeight="bold" textAnchor="middle" fill="black">
        MEMBRANE
      </text>
      <text x="50" y="28" fontSize="7" textAnchor="middle" fill="black">
        {data.membraneType === 'hollow-fiber' ? 'Hollow Fiber' :
         data.membraneType === 'spiral-wound' ? 'Spiral Wound' :
         data.membraneType === 'tubular' ? 'Tubular' :
         data.membraneType === 'flat-sheet' ? 'Flat Sheet' :
         'Hollow Fiber'}
      </text>

      {/* TMP (Trans-Membrane Pressure) indicator */}
      {data.tmpOperating !== undefined && (
        <g>
          <rect x="60" y="95" width="25" height="12" fill="yellow" opacity="0.3" stroke="black" strokeWidth="0.5" />
          <text x="72.5" y="103" fontSize="7" textAnchor="middle" fill="black">
            TMP: {data.tmpOperating}kPa
          </text>
        </g>
      )}

      {/* Permeate flux indicator */}
      {data.permeateFlux !== undefined && (
        <text x="90" y="70" fontSize="6" fill="green">
          {data.permeateFlux} LMH
        </text>
      )}

      {/* CIP active indicator */}
      {data.hasCIP && data.mode === 'backwash' && (
        <g>
          <rect x="15" y="103" width="20" height="8" fill="purple" opacity="0.3" stroke="purple" strokeWidth="1" />
          <text x="25" y="109" fontSize="6" textAnchor="middle" fill="purple">CIP</text>
        </g>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="green" />
        </marker>
        <marker id="arrowpurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="purple" />
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

MembraneFilterNode.displayName = 'MembraneFilterNode';

// ============================================================================
// Exports
// ============================================================================

export const ThamesWaterFilterComponents = {
  RapidGravityFilterNode,
  GACFilterNode,
  SandFilterNode,
  MembraneFilterNode,
};

export const ThamesWaterFilterTypes = {
  RAPID_GRAVITY_FILTER: 'thames-rapid-gravity-filter',
  GAC_FILTER: 'thames-gac-filter',
  SAND_FILTER: 'thames-sand-filter',
  MEMBRANE_FILTER: 'thames-membrane-filter',
} as const;
