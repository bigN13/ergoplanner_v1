/**
 * UK Water Industry Standards Symbols
 * Based on Water UK, Thames Water, United Utilities, and Severn Trent standards
 */

import React from 'react';

export interface UKWaterSymbolProps {
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
}

// ============================================
// PUMPS - UK Water Standard
// ============================================

export const UKCentrifugalPump: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60">
    {/* UK standard uses filled circle with directional arrow */}
    <circle cx="30" cy="30" r="22" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="30" cy="30" r="15" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.3" />
    {/* Direction arrow */}
    <path d="M 15 30 L 45 30 M 38 25 L 45 30 L 38 35" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

export const UKPositivePump: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60">
    {/* Rectangular body for positive displacement */}
    <rect x="15" y="20" width="30" height="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Piston indicator */}
    <rect x="25" y="25" width="10" height="10" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.3" />
    {/* Flow ports */}
    <line x1="5" y1="30" x2="15" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="45" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const UKSubmersiblePump: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60">
    {/* Submersible pump body */}
    <ellipse cx="30" cy="35" rx="15" ry="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Motor section */}
    <rect x="20" y="15" width="20" height="15" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.2" />
    {/* Water level indicator */}
    <path d="M 10 10 L 50 10" stroke={color} strokeWidth={strokeWidth} strokeDasharray="3,2" />
  </svg>
);

// ============================================
// VALVES - UK Water Standard
// ============================================

export const UKGateValve: React.FC<UKWaterSymbolProps> = ({
  width = 50,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 50 50">
    {/* UK gate valve with actuator wheel */}
    <rect x="20" y="15" width="10" height="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="25" cy="10" r="5" stroke={color} strokeWidth={strokeWidth} fill="none" />
    {/* Flow line */}
    <line x1="5" y1="25" x2="20" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
    <line x1="30" y1="25" x2="45" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

export const UKButterflyValve: React.FC<UKWaterSymbolProps> = ({
  width = 50,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Butterfly disc */}
    <ellipse cx="25" cy="25" rx="8" ry="2" transform="rotate(45 25 25)" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.3" />
    {/* Flow lines */}
    <line x1="5" y1="25" x2="15" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
    <line x1="35" y1="25" x2="45" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

export const UKBallValve: React.FC<UKWaterSymbolProps> = ({
  width = 50,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Ball indicator */}
    <circle cx="25" cy="25" r="6" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.5" />
    {/* Handle */}
    <line x1="25" y1="15" x2="25" y2="5" stroke={color} strokeWidth={strokeWidth * 1.5} />
    <line x1="20" y1="5" x2="30" y2="5" stroke={color} strokeWidth={strokeWidth * 1.5} />
    {/* Flow lines */}
    <line x1="5" y1="25" x2="15" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
    <line x1="35" y1="25" x2="45" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

export const UKPressureReducingValve: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 50">
    {/* PRV body */}
    <polygon points="20,15 40,15 45,25 40,35 20,35 15,25" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Spring indicator */}
    <path d="M 25 20 Q 30 25 25 30 Q 30 25 35 30" stroke={color} strokeWidth={strokeWidth} fill="none" />
    {/* Flow direction */}
    <path d="M 5 25 L 15 25 M 45 25 L 55 25" stroke={color} strokeWidth={strokeWidth * 2} />
    {/* Pressure indicator */}
    <circle cx="30" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

// ============================================
// TANKS & RESERVOIRS - UK Water Standard
// ============================================

export const UKStorageTank: React.FC<UKWaterSymbolProps> = ({
  width = 70,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 70 60">
    {/* Rectangular tank */}
    <rect x="10" y="15" width="50" height="35" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Water level */}
    <rect x="10" y="30" width="50" height="20" fill={color} fillOpacity="0.2" />
    {/* Overflow */}
    <path d="M 60 20 L 65 20 L 65 35" stroke={color} strokeWidth={strokeWidth} fill="none" />
    {/* Inlet */}
    <line x1="5" y1="20" x2="10" y2="20" stroke={color} strokeWidth={strokeWidth} />
    {/* Outlet */}
    <line x1="10" y1="45" x2="5" y2="45" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const UKServiceReservoir: React.FC<UKWaterSymbolProps> = ({
  width = 80,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 80 60">
    {/* Covered reservoir */}
    <path d="M 10 40 L 10 50 L 70 50 L 70 40" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 5 40 L 40 15 L 75 40" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Water level */}
    <path d="M 15 45 L 65 45" stroke={color} strokeWidth={strokeWidth} strokeDasharray="3,2" />
    {/* Access hatch */}
    <rect x="35" y="25" width="10" height="8" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
  </svg>
);

export const UKBreakTank: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 50">
    {/* Break tank with ball valve */}
    <rect x="10" y="15" width="40" height="30" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Water level */}
    <rect x="10" y="30" width="40" height="15" fill={color} fillOpacity="0.2" />
    {/* Ball valve */}
    <circle cx="20" cy="20" r="3" stroke={color} strokeWidth={strokeWidth} fill={color} />
    <line x1="20" y1="20" x2="35" y2="25" stroke={color} strokeWidth={strokeWidth} />
    {/* Float */}
    <ellipse cx="35" cy="27" rx="5" ry="3" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
  </svg>
);

// ============================================
// TREATMENT EQUIPMENT - UK Water Standard
// ============================================

export const UKChlorineDosing: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60">
    {/* Dosing tank */}
    <rect x="20" y="10" width="20" height="30" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Chemical symbol */}
    <text x="30" y="28" textAnchor="middle" fontSize="12" fill={color}>Cl₂</text>
    {/* Dosing pump */}
    <circle cx="30" cy="45" r="5" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Injection point */}
    <line x1="30" y1="40" x2="30" y2="50" stroke={color} strokeWidth={strokeWidth} />
    <line x1="5" y1="50" x2="55" y2="50" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

export const UKSandFilter: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 70,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 70">
    {/* Filter vessel */}
    <rect x="15" y="10" width="30" height="40" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Sand media layers */}
    <rect x="15" y="30" width="30" height="20" fill={color} fillOpacity="0.15" />
    <rect x="15" y="35" width="30" height="15" fill={color} fillOpacity="0.25" />
    <rect x="15" y="40" width="30" height="10" fill={color} fillOpacity="0.35" />
    {/* Support gravel */}
    <circle cx="20" cy="47" r="2" fill={color} fillOpacity="0.5" />
    <circle cx="30" cy="48" r="2" fill={color} fillOpacity="0.5" />
    <circle cx="40" cy="47" r="2" fill={color} fillOpacity="0.5" />
    {/* Inlet/outlet */}
    <line x1="5" y1="20" x2="15" y2="20" stroke={color} strokeWidth={strokeWidth} />
    <line x1="45" y1="45" x2="55" y2="45" stroke={color} strokeWidth={strokeWidth} />
    {/* Backwash */}
    <line x1="30" y1="50" x2="30" y2="60" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2,2" />
  </svg>
);

export const UKUVDisinfection: React.FC<UKWaterSymbolProps> = ({
  width = 70,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 70 50">
    {/* UV chamber */}
    <rect x="15" y="15" width="40" height="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* UV lamps */}
    <line x1="25" y1="20" x2="25" y2="30" stroke={color} strokeWidth={strokeWidth * 2} strokeLinecap="round" />
    <line x1="35" y1="20" x2="35" y2="30" stroke={color} strokeWidth={strokeWidth * 2} strokeLinecap="round" />
    <line x1="45" y1="20" x2="45" y2="30" stroke={color} strokeWidth={strokeWidth * 2} strokeLinecap="round" />
    {/* UV rays */}
    <path d="M 25 25 L 20 22 M 25 25 L 20 28 M 35 25 L 30 22 M 35 25 L 30 28" stroke={color} strokeWidth={0.5} opacity="0.5" />
    {/* Flow */}
    <line x1="5" y1="25" x2="15" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
    <line x1="55" y1="25" x2="65" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

// ============================================
// METERS & INSTRUMENTS - UK Water Standard
// ============================================

export const UKFlowMeter: React.FC<UKWaterSymbolProps> = ({
  width = 50,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 50 50">
    {/* Meter body */}
    <circle cx="25" cy="25" r="12" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Display */}
    <circle cx="25" cy="25" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <text x="25" y="28" textAnchor="middle" fontSize="8" fill={color}>m³/h</text>
    {/* Flow lines */}
    <line x1="5" y1="25" x2="13" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
    <line x1="37" y1="25" x2="45" y2="25" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

export const UKPressureGauge: React.FC<UKWaterSymbolProps> = ({
  width = 50,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 50 50">
    {/* Gauge body */}
    <circle cx="25" cy="25" r="15" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Dial */}
    <circle cx="25" cy="25" r="12" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" />
    {/* Needle */}
    <line x1="25" y1="25" x2="35" y2="15" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="25" cy="25" r="2" fill={color} />
    {/* Scale marks */}
    <line x1="25" y1="13" x2="25" y2="10" stroke={color} strokeWidth={strokeWidth * 0.5} />
    <line x1="37" y1="25" x2="40" y2="25" stroke={color} strokeWidth={strokeWidth * 0.5} />
    <line x1="25" y1="37" x2="25" y2="40" stroke={color} strokeWidth={strokeWidth * 0.5} />
    <line x1="13" y1="25" x2="10" y2="25" stroke={color} strokeWidth={strokeWidth * 0.5} />
    {/* Connection */}
    <line x1="25" y1="40" x2="25" y2="45" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const UKLevelSensor: React.FC<UKWaterSymbolProps> = ({
  width = 50,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 50 60">
    {/* Sensor housing */}
    <rect x="20" y="10" width="10" height="15" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Probe */}
    <line x1="25" y1="25" x2="25" y2="50" stroke={color} strokeWidth={strokeWidth * 2} />
    {/* Level indicators */}
    <line x1="22" y1="35" x2="28" y2="35" stroke={color} strokeWidth={strokeWidth} />
    <line x1="22" y1="40" x2="28" y2="40" stroke={color} strokeWidth={strokeWidth} />
    <line x1="22" y1="45" x2="28" y2="45" stroke={color} strokeWidth={strokeWidth} />
    {/* Signal wire */}
    <line x1="25" y1="10" x2="25" y2="5" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="25" cy="5" r="2" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

// ============================================
// PIPEWORK - UK Water Standard
// ============================================

export const UKWaterMain: React.FC<UKWaterSymbolProps> = ({
  width = 80,
  height = 20,
  color = '#0066CC',
  strokeWidth = 4
}) => (
  <svg width={width} height={height} viewBox="0 0 80 20">
    <line x1="0" y1="10" x2="80" y2="10" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const UKServicePipe: React.FC<UKWaterSymbolProps> = ({
  width = 80,
  height = 20,
  color = '#0066CC',
  strokeWidth = 2
}) => (
  <svg width={width} height={height} viewBox="0 0 80 20">
    <line x1="0" y1="10" x2="80" y2="10" stroke={color} strokeWidth={strokeWidth} strokeDasharray="10,5" />
  </svg>
);

export const UKDrainPipe: React.FC<UKWaterSymbolProps> = ({
  width = 80,
  height = 20,
  color = '#8B4513',
  strokeWidth = 3
}) => (
  <svg width={width} height={height} viewBox="0 0 80 20">
    <line x1="0" y1="10" x2="80" y2="10" stroke={color} strokeWidth={strokeWidth} strokeDasharray="5,3" />
  </svg>
);

// ============================================
// SPECIAL EQUIPMENT - UK Water Standard
// ============================================

export const UKBoosterSet: React.FC<UKWaterSymbolProps> = ({
  width = 80,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 80 60">
    {/* Manifold */}
    <rect x="10" y="25" width="60" height="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Pumps */}
    <circle cx="25" cy="30" r="8" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="45" cy="30" r="8" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="65" cy="30" r="8" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Motors */}
    <rect x="20" y="15" width="10" height="8" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.2" />
    <rect x="40" y="15" width="10" height="8" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.2" />
    <rect x="60" y="15" width="10" height="8" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.2" />
    {/* Control panel */}
    <rect x="35" y="5" width="20" height="8" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <text x="45" y="10" textAnchor="middle" fontSize="6" fill={color}>VSD</text>
  </svg>
);

export const UKAirValve: React.FC<UKWaterSymbolProps> = ({
  width = 50,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 50 60">
    {/* Valve body */}
    <circle cx="25" cy="40" r="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Air chamber */}
    <rect x="20" y="15" width="10" height="25" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Float ball */}
    <circle cx="25" cy="35" r="4" stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity="0.3" />
    {/* Vent */}
    <line x1="25" y1="15" x2="25" y2="10" stroke={color} strokeWidth={strokeWidth} />
    <path d="M 22 10 L 28 10" stroke={color} strokeWidth={strokeWidth * 2} />
    {/* Connection */}
    <line x1="25" y1="50" x2="25" y2="55" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

export const UKWashoutValve: React.FC<UKWaterSymbolProps> = ({
  width = 60,
  height = 50,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 50">
    {/* Main pipe */}
    <line x1="5" y1="25" x2="55" y2="25" stroke={color} strokeWidth={strokeWidth * 3} />
    {/* Washout branch */}
    <line x1="30" y1="25" x2="30" y2="40" stroke={color} strokeWidth={strokeWidth * 2} />
    {/* Washout valve */}
    <rect x="25" y="35" width="10" height="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="30" cy="40" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
    {/* End cap */}
    <line x1="27" y1="45" x2="33" y2="45" stroke={color} strokeWidth={strokeWidth * 2} />
  </svg>
);

// Export all UK Water symbols
export const UKWaterSymbols = {
  // Pumps
  UKCentrifugalPump,
  UKPositivePump,
  UKSubmersiblePump,

  // Valves
  UKGateValve,
  UKButterflyValve,
  UKBallValve,
  UKPressureReducingValve,

  // Tanks & Reservoirs
  UKStorageTank,
  UKServiceReservoir,
  UKBreakTank,

  // Treatment Equipment
  UKChlorineDosing,
  UKSandFilter,
  UKUVDisinfection,

  // Meters & Instruments
  UKFlowMeter,
  UKPressureGauge,
  UKLevelSensor,

  // Pipework
  UKWaterMain,
  UKServicePipe,
  UKDrainPipe,

  // Special Equipment
  UKBoosterSet,
  UKAirValve,
  UKWashoutValve
};

export default UKWaterSymbols;