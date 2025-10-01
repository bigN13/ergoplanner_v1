/**
 * Thames Water Treatment Plant Disinfection Components
 *
 * Standard: Thames Water TW-STD-2023
 * Category: Disinfection Systems
 *
 * Components:
 * - Chlorine Contact Tank with baffle walls
 * - UV Disinfection Chamber with lamp banks
 * - Ozone Generator and Contact Vessel
 */

import React from 'react';
import { BaseSymbolNode, BaseSymbolData, BaseSymbolProps } from '../../BaseSymbolNode';

// ============================================================================
// Type Definitions
// ============================================================================

export type DisinfectionType =
  | 'chlorine-contact'
  | 'uv-chamber'
  | 'ozone-contact';

export type ChlorineType =
  | 'gas-chlorine'
  | 'sodium-hypochlorite'
  | 'calcium-hypochlorite'
  | 'chlorine-dioxide';

export type UVLampType =
  | 'low-pressure'
  | 'low-pressure-high-output'
  | 'medium-pressure';

export type OzoneGenerationType =
  | 'corona-discharge'
  | 'uv-generation'
  | 'electrolytic';

export type DisinfectionMode =
  | 'active'
  | 'standby'
  | 'cleaning'
  | 'maintenance';

export interface DisinfectionNodeData extends BaseSymbolData {
  disinfectionType?: DisinfectionType;
  chlorineType?: ChlorineType;
  uvLampType?: UVLampType;
  ozoneGenerationType?: OzoneGenerationType;
  mode?: DisinfectionMode;

  // Chlorine contact tank
  baffleCount?: number;          // Number of baffle walls
  contactTime?: number;          // minutes (typically 30-60 min)
  chlorineDose?: number;         // mg/L
  residualChlorine?: number;     // mg/L

  // UV system
  lampCount?: number;            // Number of UV lamps
  uvIntensity?: number;          // mJ/cm² (typically 40-400)
  uvTransmittance?: number;      // % UVT
  lampBanks?: number;            // Number of lamp banks

  // Ozone system
  ozoneDose?: number;            // mg/L
  ozoneConcentration?: number;   // g/m³
  contactTime_ozone?: number;    // minutes
  offGasDestruction?: boolean;   // Off-gas destruction unit

  // Dimensions
  length?: number;               // meters
  width?: number;                // meters
  depth?: number;                // meters

  // Status
  flowRate?: number;             // m³/hr
  hasAlarm?: boolean;
}

// ============================================================================
// Chlorine Contact Tank
// ============================================================================

export const ChlorineContactTankNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as DisinfectionNodeData;
  const baffleCount = data.baffleCount || 6;

  const renderSymbol = () => (
    <g>
      {/* Main tank body */}
      <rect
        x="10"
        y="20"
        width="140"
        height="80"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Baffle walls - serpentine flow pattern */}
      {Array.from({ length: baffleCount }).map((_, idx) => {
        const x = 25 + (idx * 18);
        const fromTop = idx % 2 === 0;
        return (
          <line
            key={idx}
            x1={x}
            y1={fromTop ? 25 : 60}
            x2={x}
            y2={fromTop ? 60 : 95}
            stroke="black"
            strokeWidth="2"
          />
        );
      })}

      {/* Inlet */}
      <path
        d="M 5 50 L 10 50"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="2" y="48" fontSize="7" fill="blue">Inlet</text>

      {/* Chlorine injection point */}
      <circle cx="15" cy="40" r="3" fill="yellow" stroke="orange" strokeWidth="1.5" />
      <path
        d="M 15 35 L 15 30"
        stroke="orange"
        strokeWidth="1.5"
        markerStart="url(#arroworange-up)"
      />
      <text x="18" y="32" fontSize="6" fill="orange">Cl₂</text>

      {/* Outlet */}
      <path
        d="M 150 70 L 155 70"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="152" y="68" fontSize="7" fill="blue">Outlet</text>

      {/* Flow path indication - serpentine arrows */}
      <path
        d="M 18 30 Q 22 35 22 45"
        fill="none"
        stroke="lightblue"
        strokeWidth="1"
        strokeDasharray="2,1"
        opacity="0.6"
      />
      <path
        d="M 40 85 Q 44 75 44 50"
        fill="none"
        stroke="lightblue"
        strokeWidth="1"
        strokeDasharray="2,1"
        opacity="0.6"
      />
      <path
        d="M 58 30 Q 62 40 62 60"
        fill="none"
        stroke="lightblue"
        strokeWidth="1"
        strokeDasharray="2,1"
        opacity="0.6"
      />

      {/* Title */}
      <text x="80" y="15" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
        CHLORINE CONTACT TANK
      </text>

      {/* Contact time label */}
      {data.contactTime && (
        <text x="80" y="110" fontSize="8" textAnchor="middle" fill="black">
          Contact Time: {data.contactTime} min
        </text>
      )}

      {/* Chlorine dose */}
      {data.chlorineDose !== undefined && (
        <text x="15" y="110" fontSize="7" fill="orange">
          Dose: {data.chlorineDose} mg/L
        </text>
      )}

      {/* Residual chlorine */}
      {data.residualChlorine !== undefined && (
        <text x="120" y="110" fontSize="7" fill="green">
          Residual: {data.residualChlorine} mg/L
        </text>
      )}

      {/* Chlorine type indicator */}
      <rect x="55" y="25" width="50" height="10" fill="yellow" opacity="0.2" stroke="orange" strokeWidth="1" />
      <text x="80" y="32" fontSize="7" textAnchor="middle" fill="orange">
        {data.chlorineType === 'gas-chlorine' ? 'Cl₂ Gas' :
         data.chlorineType === 'sodium-hypochlorite' ? 'NaOCl' :
         data.chlorineType === 'calcium-hypochlorite' ? 'Ca(OCl)₂' :
         data.chlorineType === 'chlorine-dioxide' ? 'ClO₂' :
         'Cl₂ Gas'}
      </text>

      {/* Sampling point */}
      <circle cx="145" cy="60" r="2.5" fill="red" stroke="darkred" strokeWidth="1" />
      <text x="147" y="58" fontSize="6" fill="red">SP</text>

      {/* Arrow markers */}
      <defs>
        <marker id="arroworange-up" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
          <polygon points="10 0, 0 3, 10 6" fill="orange" />
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

ChlorineContactTankNode.displayName = 'ChlorineContactTankNode';

// ============================================================================
// UV Disinfection Chamber
// ============================================================================

export const UVDisinfectionChamberNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as DisinfectionNodeData;
  const lampBanks = data.lampBanks || 3;

  const renderSymbol = () => (
    <g>
      {/* UV chamber housing */}
      <rect
        x="10"
        y="20"
        width="120"
        height="80"
        fill="#E6E6FA"
        opacity="0.3"
        stroke="black"
        strokeWidth="2"
      />

      {/* UV lamp banks - horizontal orientation */}
      {Array.from({ length: lampBanks }).map((_, bankIdx) => {
        const y = 35 + (bankIdx * 20);
        return (
          <g key={bankIdx}>
            {/* Lamp bank housing */}
            <rect
              x="20"
              y={y}
              width="100"
              height="12"
              fill="#9370DB"
              opacity="0.4"
              stroke="#4B0082"
              strokeWidth="1"
            />

            {/* Individual UV lamps */}
            {[30, 50, 70, 90, 110].map((lampX, lampIdx) => (
              <g key={lampIdx}>
                <line
                  x1={lampX}
                  y1={y + 3}
                  x2={lampX}
                  y2={y + 9}
                  stroke="#8A2BE2"
                  strokeWidth="2"
                />
                {/* UV glow effect */}
                {data.mode === 'active' && (
                  <circle
                    cx={lampX}
                    cy={y + 6}
                    r="4"
                    fill="#DA70D6"
                    opacity="0.5"
                  />
                )}
              </g>
            ))}

            {/* Bank label */}
            <text x="125" y={y + 8} fontSize="6" fill="#4B0082">
              Bank {bankIdx + 1}
            </text>
          </g>
        );
      })}

      {/* Inlet */}
      <path
        d="M 5 60 L 10 60"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="2" y="58" fontSize="7" fill="blue">Inlet</text>

      {/* Outlet */}
      <path
        d="M 130 60 L 135 60"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue)"
      />
      <text x="132" y="58" fontSize="7" fill="blue">Outlet</text>

      {/* Flow direction arrows */}
      <path
        d="M 35 75 L 45 75"
        stroke="lightblue"
        strokeWidth="1"
        markerEnd="url(#arrowlightblue)"
        opacity="0.6"
      />
      <path
        d="M 65 75 L 75 75"
        stroke="lightblue"
        strokeWidth="1"
        markerEnd="url(#arrowlightblue)"
        opacity="0.6"
      />
      <path
        d="M 95 75 L 105 75"
        stroke="lightblue"
        strokeWidth="1"
        markerEnd="url(#arrowlightblue)"
        opacity="0.6"
      />

      {/* Title */}
      <text x="70" y="15" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
        UV DISINFECTION
      </text>

      {/* UV intensity indicator */}
      {data.uvIntensity !== undefined && (
        <g>
          <rect x="15" y="85" width="40" height="10" fill="purple" opacity="0.2" stroke="purple" strokeWidth="1" />
          <text x="35" y="92" fontSize="7" textAnchor="middle" fill="purple">
            {data.uvIntensity} mJ/cm²
          </text>
        </g>
      )}

      {/* UVT (UV Transmittance) */}
      {data.uvTransmittance !== undefined && (
        <text x="70" y="110" fontSize="7" textAnchor="middle" fill="black">
          UVT: {data.uvTransmittance}%
        </text>
      )}

      {/* Lamp type */}
      <rect x="85" y="85" width="40" height="10" fill="blue" opacity="0.2" stroke="blue" strokeWidth="1" />
      <text x="105" y="92" fontSize="6" textAnchor="middle" fill="blue">
        {data.uvLampType === 'low-pressure' ? 'LP' :
         data.uvLampType === 'low-pressure-high-output' ? 'LP-HO' :
         data.uvLampType === 'medium-pressure' ? 'MP' :
         'LP'}
      </text>

      {/* Lamp status indicator */}
      {data.mode === 'active' && (
        <g>
          <circle cx="135" cy="25" r="4" fill="#DA70D6" opacity="0.8" />
          <text x="140" y="27" fontSize="6" fill="purple">ON</text>
        </g>
      )}

      {/* Quartz sleeve cleaning indicator */}
      {data.mode === 'cleaning' && (
        <g>
          <rect x="40" y="22" width="30" height="8" fill="orange" opacity="0.3" stroke="orange" strokeWidth="1" />
          <text x="55" y="28" fontSize="6" textAnchor="middle" fill="orange">CLEANING</text>
        </g>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowlightblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="lightblue" />
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

UVDisinfectionChamberNode.displayName = 'UVDisinfectionChamberNode';

// ============================================================================
// Ozone Generator and Contact Vessel
// ============================================================================

export const OzoneContactVesselNode = React.memo((props: BaseSymbolProps) => {
  const data = props.data as DisinfectionNodeData;

  const renderSymbol = () => (
    <g>
      {/* Ozone generator unit */}
      <rect
        x="10"
        y="10"
        width="50"
        height="40"
        fill="#87CEEB"
        opacity="0.3"
        stroke="black"
        strokeWidth="2"
      />
      <text x="35" y="25" fontSize="8" fontWeight="bold" textAnchor="middle" fill="black">
        O₃ GEN
      </text>
      <text x="35" y="35" fontSize="6" textAnchor="middle" fill="black">
        {data.ozoneGenerationType === 'corona-discharge' ? 'Corona' :
         data.ozoneGenerationType === 'uv-generation' ? 'UV' :
         data.ozoneGenerationType === 'electrolytic' ? 'Electrolytic' :
         'Corona'}
      </text>

      {/* Ozone concentration */}
      {data.ozoneConcentration !== undefined && (
        <text x="35" y="45" fontSize="6" textAnchor="middle" fill="blue">
          {data.ozoneConcentration} g/m³
        </text>
      )}

      {/* Ozone feed line to contact vessel */}
      <path
        d="M 60 30 L 80 30"
        stroke="cyan"
        strokeWidth="2"
        strokeDasharray="4,2"
        markerEnd="url(#arrowcyan)"
      />
      <text x="68" y="28" fontSize="6" fill="cyan">O₃</text>

      {/* Contact vessel - tall cylinder */}
      <rect
        x="80"
        y="10"
        width="60"
        height="100"
        rx="5"
        fill="#E0FFFF"
        opacity="0.3"
        stroke="black"
        strokeWidth="2"
      />

      {/* Diffuser at bottom */}
      <line x1="85" y1="100" x2="135" y2="100" stroke="cyan" strokeWidth="2" />
      <circle cx="92" cy="100" r="2" fill="cyan" />
      <circle cx="103" cy="100" r="2" fill="cyan" />
      <circle cx="114" cy="100" r="2" fill="cyan" />
      <circle cx="128" cy="100" r="2" fill="cyan" />

      {/* Rising bubbles */}
      {data.mode === 'active' && (
        <g>
          {[95, 75, 55, 35].map((y, idx) => (
            <g key={idx}>
              <circle cx="95" cy={y} r="1.5" fill="cyan" opacity="0.6" />
              <circle cx="110" cy={y + 5} r="1.5" fill="cyan" opacity="0.6" />
              <circle cx="125" cy={y + 2} r="1.5" fill="cyan" opacity="0.6" />
            </g>
          ))}
        </g>
      )}

      {/* Water inlet */}
      <path
        d="M 110 115 L 110 120"
        stroke="blue"
        strokeWidth="2"
        markerEnd="url(#arrowblue-down)"
      />
      <text x="113" y="118" fontSize="7" fill="blue">Inlet</text>

      {/* Treated water outlet */}
      <path
        d="M 110 10 L 110 5"
        stroke="blue"
        strokeWidth="2"
        markerStart="url(#arrowblue-up)"
      />
      <text x="113" y="7" fontSize="7" fill="blue">Outlet</text>

      {/* Off-gas destruction unit */}
      {data.offGasDestruction && (
        <g>
          <rect
            x="145"
            y="15"
            width="30"
            height="25"
            fill="orange"
            opacity="0.2"
            stroke="orange"
            strokeWidth="1.5"
          />
          <text x="160" y="25" fontSize="6" textAnchor="middle" fill="orange">OFF-GAS</text>
          <text x="160" y="33" fontSize="6" textAnchor="middle" fill="orange">DESTRUCT</text>

          {/* Off-gas line */}
          <path
            d="M 140 20 L 145 20"
            stroke="orange"
            strokeWidth="1.5"
            markerEnd="url(#arroworange)"
          />
        </g>
      )}

      {/* Contact time label */}
      <text x="110" y="130" fontSize="7" textAnchor="middle" fill="black">
        Contact: {data.contactTime_ozone || 10} min
      </text>

      {/* Ozone dose */}
      {data.ozoneDose !== undefined && (
        <text x="85" y="130" fontSize="7" fill="cyan">
          Dose: {data.ozoneDose} mg/L
        </text>
      )}

      {/* Title */}
      <text x="70" y="145" fontSize="10" fontWeight="bold" textAnchor="middle" fill="black">
        OZONE CONTACTOR
      </text>

      {/* Oxygen feed to generator */}
      <path
        d="M 5 25 L 10 25"
        stroke="green"
        strokeWidth="1.5"
        markerEnd="url(#arrowgreen)"
      />
      <text x="2" y="23" fontSize="6" fill="green">O₂</text>

      {/* Power indicator */}
      {data.mode === 'active' && (
        <g>
          <circle cx="25" cy="15" r="3" fill="yellow" stroke="orange" strokeWidth="1" />
          <line x1="25" y1="12" x2="25" y2="18" stroke="red" strokeWidth="1" />
          <line x1="22" y1="15" x2="28" y2="15" stroke="red" strokeWidth="1" />
        </g>
      )}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowcyan" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="cyan" />
        </marker>
        <marker id="arrowblue-down" markerWidth="10" markerHeight="10" refX="3" refY="1" orient="auto">
          <polygon points="0 0, 6 10, 3 0" fill="blue" />
        </marker>
        <marker id="arrowblue-up" markerWidth="10" markerHeight="10" refX="3" refY="9" orient="auto">
          <polygon points="0 10, 6 0, 3 10" fill="blue" />
        </marker>
        <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="green" />
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

OzoneContactVesselNode.displayName = 'OzoneContactVesselNode';

// ============================================================================
// Exports
// ============================================================================

export const ThamesWaterDisinfectionComponents = {
  ChlorineContactTankNode,
  UVDisinfectionChamberNode,
  OzoneContactVesselNode,
};

export const ThamesWaterDisinfectionTypes = {
  CHLORINE_CONTACT_TANK: 'thames-chlorine-contact-tank',
  UV_DISINFECTION_CHAMBER: 'thames-uv-disinfection-chamber',
  OZONE_CONTACT_VESSEL: 'thames-ozone-contact-vessel',
} as const;
