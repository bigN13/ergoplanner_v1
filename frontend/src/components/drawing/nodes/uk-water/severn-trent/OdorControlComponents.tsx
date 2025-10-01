/**
 * Severn Trent Sewage Treatment - Odor Control Components
 *
 * Standard: Severn Trent Engineering Standards ST-ES-2024
 * Category: Odor Control Systems
 *
 * Components:
 * - Biofilter for biological odor treatment
 * - Chemical Scrubber for acid gas removal
 */

import React from 'react';
import { BaseSymbolNode, BaseSymbolData, BaseSymbolProps } from '../../BaseSymbolNode';

// ============================================================================
// Type Definitions
// ============================================================================

export type OdorControlType =
  | 'biofilter'
  | 'chemical-scrubber'
  | 'carbon-adsorber'
  | 'thermal-oxidizer';

export type BiofilterMedia =
  | 'compost'
  | 'wood-chips'
  | 'lava-rock'
  | 'synthetic';

export type ScrubberType =
  | 'single-stage'
  | 'two-stage'
  | 'packed-tower';

export type ScrubberChemical =
  | 'sodium-hydroxide'    // NaOH for H2S
  | 'hypochlorite'        // NaOCl
  | 'sulfuric-acid'       // H2SO4 for ammonia
  | 'water';              // Water wash

export interface OdorControlNodeData extends BaseSymbolData {
  controlType?: OdorControlType;
  biofilterMedia?: BiofilterMedia;
  scrubberType?: ScrubberType;
  scrubberChemical?: ScrubberChemical;

  // Biofilter parameters
  mediaDepth?: number;            // meters
  bedArea?: number;               // m²
  emptyBedContactTime?: number;   // seconds
  moistureContent?: number;       // %
  temperature?: number;           // °C

  // Scrubber parameters
  liquidFlowRate?: number;        // L/min
  gasFlowRate?: number;           // m³/hr
  pHSetpoint?: number;
  currentpH?: number;
  pressureDrop?: number;          // Pa

  // Performance
  h2sInlet?: number;              // ppm
  h2sOutlet?: number;             // ppm
  removalEfficiency?: number;     // %

  // Status
  isRunning?: boolean;
  fanSpeed?: number;              // %
}

// ============================================================================
// Biofilter
// ============================================================================

export const BiofilterNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as OdorControlNodeData;

  const renderSymbol = () => (
    <g>
      {/* Biofilter vessel */}
      <rect
        x="20"
        y="30"
        width="120"
        height="90"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Media bed layers */}
      {/* Top layer - newer media */}
      <rect x="25" y="35" width="110" height="25" fill="#8B7355" opacity="0.5" />
      <text x="80" y="50" fontSize="7" textAnchor="middle" fill="black">
        {data.biofilterMedia === 'compost' ? 'Compost Media' :
         data.biofilterMedia === 'wood-chips' ? 'Wood Chip Media' :
         data.biofilterMedia === 'lava-rock' ? 'Lava Rock Media' :
         data.biofilterMedia === 'synthetic' ? 'Synthetic Media' :
         'Compost Media'}
      </text>

      {/* Bottom layer - mature media */}
      <rect x="25" y="60" width="110" height="30" fill="#654321" opacity="0.6" />

      {/* Support layer */}
      <rect x="25" y="90" width="110" height="10" fill="#808080" opacity="0.5" />
      <text x="80" y="97" fontSize="6" textAnchor="middle" fill="black">Support/Drainage</text>

      {/* Air distribution plenum */}
      <rect x="25" y="100" width="110" height="15" fill="#E0E0E0" opacity="0.3" stroke="black" strokeWidth="1" />
      <text x="80" y="110" fontSize="7" textAnchor="middle" fill="black">Air Plenum</text>

      {/* Foul air inlet */}
      <path
        d="M 80 130 L 80 115"
        stroke="red"
        strokeWidth="3"
        markerStart="url(#arrowred-up)"
      />
      <text x="65" y="128" fontSize="7" fill="red">Foul Air</text>

      {/* H2S concentration at inlet */}
      {data.h2sInlet !== undefined && (
        <text x="85" y="128" fontSize="6" fill="red">
          ({data.h2sInlet} ppm)
        </text>
      )}

      {/* Clean air outlet */}
      <path
        d="M 80 30 L 80 15"
        stroke="green"
        strokeWidth="3"
        markerStart="url(#arrowgreen-up)"
      />
      <text x="65" y="13" fontSize="7" fill="green">Clean Air</text>

      {/* H2S concentration at outlet */}
      {data.h2sOutlet !== undefined && (
        <text x="85" y="13" fontSize="6" fill="green">
          ({data.h2sOutlet} ppm)
        </text>
      )}

      {/* Air flow arrows through media */}
      {data.isRunning && (
        <g>
          {[50, 80, 110].map((x, idx) => (
            <g key={idx}>
              <path d={`M ${x} 105 L ${x} 95`} stroke="lightblue" strokeWidth="1" opacity="0.5" markerEnd="url(#arrowlightblue-up)" />
              <path d={`M ${x} 90 L ${x} 75`} stroke="lightblue" strokeWidth="1" opacity="0.5" markerEnd="url(#arrowlightblue-up)" />
              <path d={`M ${x} 70 L ${x} 50`} stroke="lightblue" strokeWidth="1" opacity="0.5" markerEnd="url(#arrowlightblue-up)" />
              <path d={`M ${x} 45 L ${x} 35`} stroke="lightblue" strokeWidth="1" opacity="0.5" markerEnd="url(#arrowlightblue-up)" />
            </g>
          ))}
        </g>
      )}

      {/* Moisture spray nozzles */}
      <g>
        {[40, 70, 100, 130].map((x, idx) => (
          <g key={idx}>
            <line x1={x} y1="25" x2={x} y2="30" stroke="blue" strokeWidth="1.5" />
            <circle cx={x} cy="30" r="2" fill="blue" />

            {/* Water droplets */}
            {data.moistureContent && data.moistureContent > 40 && (
              <g>
                <circle cx={x - 2} cy="35" r="0.5" fill="lightblue" opacity="0.6" />
                <circle cx={x + 2} cy="37" r="0.5" fill="lightblue" opacity="0.6" />
                <circle cx={x} cy="40" r="0.5" fill="lightblue" opacity="0.6" />
              </g>
            )}
          </g>
        ))}

        {/* Irrigation header */}
        <line x1="30" y1="25" x2="140" y2="25" stroke="blue" strokeWidth="2" />
        <text x="145" y="27" fontSize="6" fill="blue">Irrigation</text>
      </g>

      {/* Blower/Fan */}
      <g>
        <circle cx="80" cy="140" r="10" fill="orange" opacity="0.3" stroke="black" strokeWidth="1.5" />
        <text x="80" y="143" fontSize="7" textAnchor="middle" fill="black">FAN</text>

        {/* Fan rotation */}
        {data.isRunning && (
          <path
            d="M 85 135 A 7 7 0 0 1 75 145"
            fill="none"
            stroke="orange"
            strokeWidth="1.5"
            markerEnd="url(#arroworange-small)"
          />
        )}
      </g>

      {/* Title */}
      <text x="80" y="165" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
        BIOFILTER
      </text>

      {/* Media depth */}
      <g>
        <line x1="15" y1="35" x2="15" y2="90" stroke="black" strokeWidth="1" />
        <line x1="13" y1="35" x2="17" y2="35" stroke="black" strokeWidth="1" />
        <line x1="13" y1="90" x2="17" y2="90" stroke="black" strokeWidth="1" />
        <text x="8" y="65" fontSize="7" fill="black" transform="rotate(-90 8 65)">
          {data.mediaDepth || 1.5}m
        </text>
      </g>

      {/* Performance indicators */}
      {data.removalEfficiency !== undefined && (
        <g>
          <rect x="145" y="55" width="40" height="15" fill="green" opacity="0.2" stroke="green" strokeWidth="1" />
          <text x="165" y="65" fontSize="8" fontWeight="bold" textAnchor="middle" fill="green">
            {data.removalEfficiency}% Removal
          </text>
        </g>
      )}

      {/* Moisture content */}
      {data.moistureContent !== undefined && (
        <text x="145" y="45" fontSize="7" fill="blue">
          MC: {data.moistureContent}%
        </text>
      )}

      {/* Temperature */}
      {data.temperature !== undefined && (
        <text x="145" y="85" fontSize="7" fill="red">
          Temp: {data.temperature}°C
        </text>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowred-up" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
          <polygon points="10 0, 0 3, 10 6" fill="red" />
        </marker>
        <marker id="arrowgreen-up" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
          <polygon points="10 0, 0 3, 10 6" fill="green" />
        </marker>
        <marker id="arrowlightblue-up" markerWidth="6" markerHeight="6" refX="1" refY="2" orient="auto">
          <polygon points="6 0, 0 2, 6 4" fill="lightblue" />
        </marker>
        <marker id="arroworange-small" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="orange" />
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

BiofilterNode.displayName = 'BiofilterNode';

// ============================================================================
// Chemical Scrubber
// ============================================================================

export const ChemicalScrubberNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as OdorControlNodeData;

  const renderSymbol = () => (
    <g>
      {/* Scrubber tower */}
      <rect
        x="50"
        y="20"
        width="60"
        height="100"
        fill="#E0F7FA"
        opacity="0.3"
        stroke="black"
        strokeWidth="2"
      />

      {/* Packing material */}
      {[35, 50, 65, 80].map((y, idx) => (
        <g key={idx}>
          <line x1="55" y1={y} x2="105" y2={y} stroke="gray" strokeWidth="1" opacity="0.4" />
          <line x1="60" y1={y + 5} x2="100" y2={y + 5} stroke="gray" strokeWidth="1" opacity="0.4" />
          <line x1="57" y1={y + 10} x2="103" y2={y + 10} stroke="gray" strokeWidth="1" opacity="0.4" />
        </g>
      ))}

      {/* Packing label */}
      <text x="80" y="60" fontSize="7" textAnchor="middle" fill="gray">Packing</text>

      {/* Liquid distribution header */}
      <line x1="55" y1="30" x2="105" y2="30" stroke="blue" strokeWidth="2.5" />

      {/* Spray nozzles */}
      {[65, 80, 95].map((x, idx) => (
        <g key={idx}>
          <circle cx={x} cy="30" r="2" fill="blue" />

          {/* Liquid droplets */}
          {data.isRunning && (
            <g>
              {[40, 50, 60, 70, 80, 90].map((y, dropIdx) => (
                <circle key={dropIdx} cx={x + (dropIdx % 2 === 0 ? -2 : 2)} cy={y} r="1" fill="lightblue" opacity="0.5" />
              ))}
            </g>
          )}
        </g>
      ))}

      {/* Foul air inlet at bottom */}
      <path
        d="M 80 130 L 80 120"
        stroke="red"
        strokeWidth="3"
        markerStart="url(#arrowred-up)"
      />
      <text x="65" y="128" fontSize="7" fill="red">Foul Air</text>

      {/* Rising air flow */}
      {data.isRunning && (
        <g>
          {[60, 80, 100].map((x, idx) => (
            <g key={idx}>
              {[110, 90, 70, 50].map((y, arrowIdx) => (
                <path
                  key={arrowIdx}
                  d={`M ${x} ${y} L ${x} ${y - 12}`}
                  stroke="pink"
                  strokeWidth="1"
                  opacity="0.4"
                  markerEnd="url(#arrowpink-up)"
                />
              ))}
            </g>
          ))}
        </g>
      )}

      {/* Clean air outlet at top */}
      <path
        d="M 80 20 L 80 10"
        stroke="green"
        strokeWidth="3"
        markerStart="url(#arrowgreen-up)"
      />
      <text x="65" y="8" fontSize="7" fill="green">Clean Air</text>

      {/* Mist eliminator */}
      <rect x="55" y="22" width="50" height="5" fill="yellow" opacity="0.3" stroke="orange" strokeWidth="1" />
      <text x="110" y="26" fontSize="6" fill="orange">ME</text>

      {/* Liquid recirculation */}
      <g>
        {/* Sump at bottom */}
        <rect x="55" y="95" width="50" height="20" fill="lightblue" opacity="0.4" stroke="blue" strokeWidth="1.5" />
        <text x="80" y="107" fontSize="7" textAnchor="middle" fill="blue">Sump</text>

        {/* Recirculation pump */}
        <circle cx="30" cy="105" r="8" fill="blue" opacity="0.3" stroke="black" strokeWidth="1.5" />
        <text x="30" y="108" fontSize="6" textAnchor="middle" fill="black">PMP</text>

        {/* Recirculation line */}
        <path
          d="M 38 105 L 45 105 L 45 25 L 50 25"
          stroke="blue"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowblue)"
        />

        {/* Suction line */}
        <path
          d="M 55 105 L 38 105"
          stroke="blue"
          strokeWidth="2"
          markerEnd="url(#arrowblue)"
        />
      </g>

      {/* Chemical dosing */}
      <g>
        <rect x="5" y="45" width="20" height="30" fill="yellow" opacity="0.2" stroke="orange" strokeWidth="1.5" />
        <text x="15" y="55" fontSize="7" textAnchor="middle" fill="orange">
          {data.scrubberChemical === 'sodium-hydroxide' ? 'NaOH' :
           data.scrubberChemical === 'hypochlorite' ? 'NaOCl' :
           data.scrubberChemical === 'sulfuric-acid' ? 'H₂SO₄' :
           'NaOH'}
        </text>
        <text x="15" y="65" fontSize="6" textAnchor="middle" fill="orange">Tank</text>

        {/* Dosing pump */}
        <circle cx="15" cy="85" r="5" fill="purple" opacity="0.3" stroke="black" strokeWidth="1" />
        <text x="15" y="87" fontSize="5" textAnchor="middle" fill="black">DP</text>

        {/* Dosing line */}
        <path
          d="M 20 85 L 30 85 L 30 100"
          stroke="purple"
          strokeWidth="1.5"
          strokeDasharray="3,2"
          markerEnd="url(#arrowpurple)"
        />
      </g>

      {/* pH sensor */}
      <g>
        <circle cx="115" cy="105" r="4" fill="yellow" stroke="black" strokeWidth="1" />
        <text x="115" y="107" fontSize="5" textAnchor="middle" fill="black">pH</text>

        {/* pH value display */}
        {data.currentpH !== undefined && (
          <text x="120" y="108" fontSize="7" fill="black">
            {data.currentpH.toFixed(1)}
          </text>
        )}
      </g>

      {/* Makeup water */}
      <path
        d="M 10 100 L 30 100"
        stroke="lightblue"
        strokeWidth="1.5"
        markerEnd="url(#arrowlightblue)"
      />
      <text x="5" y="98" fontSize="6" fill="lightblue">MU</text>

      {/* Blowdown */}
      <path
        d="M 80 115 L 80 130"
        stroke="brown"
        strokeWidth="2"
        markerEnd="url(#arrowbrown)"
      />
      <text x="83" y="128" fontSize="6" fill="brown">BD</text>

      {/* Title */}
      <text x="80" y="150" fontSize="11" fontWeight="bold" textAnchor="middle" fill="black">
        CHEMICAL SCRUBBER
      </text>

      {/* Scrubber type */}
      <text x="80" y="158" fontSize="7" textAnchor="middle" fill="black">
        {data.scrubberType === 'single-stage' ? 'Single Stage' :
         data.scrubberType === 'two-stage' ? 'Two Stage' :
         data.scrubberType === 'packed-tower' ? 'Packed Tower' :
         'Packed Tower'}
      </text>

      {/* Performance */}
      {data.h2sInlet !== undefined && data.h2sOutlet !== undefined && (
        <g>
          <rect x="125" y="50" width="50" height="25" fill="white" stroke="black" strokeWidth="1" />
          <text x="150" y="58" fontSize="6" textAnchor="middle" fill="red">In: {data.h2sInlet} ppm</text>
          <text x="150" y="66" fontSize="6" textAnchor="middle" fill="green">Out: {data.h2sOutlet} ppm</text>
          <text x="150" y="73" fontSize="7" fontWeight="bold" textAnchor="middle" fill="blue">
            {((1 - data.h2sOutlet / data.h2sInlet) * 100).toFixed(1)}%
          </text>
        </g>
      )}

      {/* Liquid flow rate */}
      {data.liquidFlowRate !== undefined && (
        <text x="40" y="20" fontSize="6" fill="blue">
          {data.liquidFlowRate} L/min
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
        <marker id="arrowpink-up" markerWidth="6" markerHeight="6" refX="1" refY="2" orient="auto">
          <polygon points="6 0, 0 2, 6 4" fill="pink" />
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

ChemicalScrubberNode.displayName = 'ChemicalScrubberNode';

// ============================================================================
// Exports
// ============================================================================

export const SevernTrentOdorControlComponents = {
  BiofilterNode,
  ChemicalScrubberNode,
};

export const SevernTrentOdorControlTypes = {
  BIOFILTER: 'severn-biofilter',
  CHEMICAL_SCRUBBER: 'severn-chemical-scrubber',
} as const;
