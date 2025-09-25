import React from 'react';

/**
 * ISA-5.1 Standard Symbol Components
 * Comprehensive library of P&ID symbols following ISA-5.1 standards
 */

// Symbol Base Types
export interface ISASymbolProps {
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

// ===== PUMPS & COMPRESSORS =====

export const CentrifugalPump: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 20 30 L 40 20 L 40 40 Z" fill={color} />
    <line x1="5" y1="30" x2="10" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="50" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const PositiveDisplacementPump: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="30" height="30" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="30" cy="30" r="10" stroke={color} strokeWidth={strokeWidth} fill={color} />
    <line x1="5" y1="30" x2="15" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="45" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ReciprocatingPump: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="30" height="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <rect x="25" y="10" width="10" height="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <line x1="30" y1="10" x2="30" y2="5" stroke={color} strokeWidth={strokeWidth} />
    <line x1="5" y1="30" x2="15" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="45" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const CentrifugalCompressor: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 30 15 L 25 30 L 30 45 M 30 15 L 35 30 L 30 45" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <line x1="5" y1="30" x2="10" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="50" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== VALVES =====

export const GateValve: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 30 L 30 20 L 30 40 Z M 40 30 L 30 20 L 30 40 Z"
          fill={color} stroke={color} strokeWidth={strokeWidth} />
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const GlobeValve: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="12" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 30 18 L 30 42" stroke={color} strokeWidth={strokeWidth} />
    <line x1="5" y1="30" x2="18" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="42" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const BallValve: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 20 L 20 40 L 40 40 L 40 20 Z" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="30" cy="30" r="6" stroke={color} strokeWidth={strokeWidth} fill={color} />
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ButterflyValve: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="12" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <ellipse cx="30" cy="30" rx="2" ry="12" stroke={color} strokeWidth={strokeWidth} fill={color} />
    <line x1="5" y1="30" x2="18" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="42" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const CheckValve: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="12" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 22 30 L 38 30 M 38 30 L 33 25 M 38 30 L 33 35"
          stroke={color} strokeWidth={strokeWidth} fill="none" />
    <line x1="5" y1="30" x2="18" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="42" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ControlValve: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 30 L 30 20 L 30 40 Z M 40 30 L 30 20 L 30 40 Z"
          fill={fillColor} stroke={color} strokeWidth={strokeWidth} />
    <rect x="20" y="5" width="20" height="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <line x1="30" y1="15" x2="30" y2="20" stroke={color} strokeWidth={strokeWidth} />
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const SafetyReliefValve: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 35 L 30 25 L 30 45 Z M 40 35 L 30 25 L 30 45 Z"
          fill={fillColor} stroke={color} strokeWidth={strokeWidth} />
    <path d="M 30 25 L 30 15 L 35 10" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <line x1="5" y1="35" x2="20" y2="35" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== TANKS & VESSELS =====

export const HorizontalTank: React.FC<ISASymbolProps> = ({
  width = 80,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="30" rx="10" ry="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <rect x="20" y="10" width="40" height="40" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <ellipse cx="60" cy="30" rx="10" ry="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
  </svg>
);

export const VerticalTank: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 80,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="15" rx="20" ry="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <rect x="10" y="15" width="40" height="50" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <ellipse cx="30" cy="65" rx="20" ry="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
  </svg>
);

export const PressureVessel: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 80,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 25 Q 10 15 30 15 Q 50 15 50 25 L 50 55 Q 50 65 30 65 Q 10 65 10 55 Z"
          stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <ellipse cx="30" cy="25" rx="20" ry="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <rect x="28" y="5" width="4" height="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
  </svg>
);

// ===== HEAT TRANSFER EQUIPMENT =====

export const ShellTubeHeatExchanger: React.FC<ISASymbolProps> = ({
  width = 100,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="80" height="30" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <line x1="20" y1="22" x2="80" y2="22" stroke="#EF4444" strokeWidth={strokeWidth} />
    <line x1="20" y1="30" x2="80" y2="30" stroke="#EF4444" strokeWidth={strokeWidth} />
    <line x1="20" y1="38" x2="80" y2="38" stroke="#3B82F6" strokeWidth={strokeWidth} />
    <line x1="5" y1="25" x2="10" y2="25" stroke="#EF4444" strokeWidth={strokeWidth} />
    <line x1="90" y1="25" x2="95" y2="25" stroke="#EF4444" strokeWidth={strokeWidth} />
    <line x1="5" y1="35" x2="10" y2="35" stroke="#3B82F6" strokeWidth={strokeWidth} />
    <line x1="90" y1="35" x2="95" y2="35" stroke="#3B82F6" strokeWidth={strokeWidth} />
  </svg>
);

export const AirCooledExchanger: React.FC<ISASymbolProps> = ({
  width = 80,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="60" height="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 10 40 L 15 50 L 25 50 L 30 40 M 30 40 L 35 50 L 45 50 L 50 40 M 50 40 L 55 50 L 65 50 L 70 40"
          stroke={color} strokeWidth={strokeWidth} fill="none" />
    <circle cx="40" cy="10" r="8" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 40 10 L 36 6 M 40 10 L 44 6 M 40 10 L 36 14 M 40 10 L 44 14"
          stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== INSTRUMENTS =====

export const PressureIndicator: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5,
  label = 'PI'
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="25" r="15" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <text x="30" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>
      {label}
    </text>
    <line x1="30" y1="40" x2="30" y2="55" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const TemperatureIndicator: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5,
  label = 'TI'
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="25" r="15" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <text x="30" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>
      {label}
    </text>
    <line x1="30" y1="40" x2="30" y2="55" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const FlowIndicator: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5,
  label = 'FI'
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="15" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <text x="30" y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>
      {label}
    </text>
  </svg>
);

export const LevelIndicator: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5,
  label = 'LI'
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="15" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <text x="30" y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>
      {label}
    </text>
  </svg>
);

export const OrificePlate: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="30" x2="25" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="35" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="30" cy="30" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <circle cx="30" cy="30" r="3" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
  </svg>
);

// ===== PIPING COMPONENTS =====

export const Elbow90: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  strokeWidth = 2
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 30 L 30 30 L 30 10" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

export const Tee: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  strokeWidth = 2
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="10" y1="30" x2="50" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="30" y1="30" x2="30" y2="10" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const Reducer: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 25 L 25 25 L 35 28 L 50 28 L 50 32 L 35 32 L 25 35 L 10 35 Z"
          stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
  </svg>
);

export const Flange: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="10" y1="30" x2="25" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="35" y1="30" x2="50" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <rect x="25" y="20" width="10" height="20" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

// ===== PROCESS EQUIPMENT =====

export const Mixer: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="35" r="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <rect x="28" y="5" width="4" height="20" stroke={color} strokeWidth={strokeWidth} fill={color} />
    <path d="M 20 30 L 30 35 L 40 30 M 20 40 L 30 35 L 40 40"
          stroke={color} strokeWidth={strokeWidth} fill="none" />
  </svg>
);

export const Filter: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 60,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15 20 L 45 20 L 35 40 L 25 40 Z"
          stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <line x1="20" y1="30" x2="40" y2="30" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 2" />
    <line x1="5" y1="20" x2="15" y2="20" stroke={color} strokeWidth={strokeWidth} />
    <line x1="45" y1="20" x2="55" y2="20" stroke={color} strokeWidth={strokeWidth} />
    <line x1="30" y1="40" x2="30" y2="50" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const Separator: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 80,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="20" rx="20" ry="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <rect x="10" y="20" width="40" height="40" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <ellipse cx="30" cy="60" rx="20" ry="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <line x1="30" y1="35" x2="30" y2="45" stroke={color} strokeWidth={strokeWidth} strokeDasharray="3 3" />
    <line x1="5" y1="25" x2="10" y2="25" stroke={color} strokeWidth={strokeWidth} />
    <line x1="50" y1="25" x2="55" y2="25" stroke={color} strokeWidth={strokeWidth} />
    <line x1="30" y1="70" x2="30" y2="75" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const Column: React.FC<ISASymbolProps> = ({
  width = 60,
  height = 100,
  color = '#000',
  fillColor = '#fff',
  strokeWidth = 1.5
}) => (
  <svg width={width} height={height} viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="15" rx="20" ry="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <rect x="10" y="15" width="40" height="70" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <ellipse cx="30" cy="85" rx="20" ry="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    {/* Trays */}
    <line x1="15" y1="30" x2="45" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="15" y1="45" x2="45" y2="45" stroke={color} strokeWidth={strokeWidth} />
    <line x1="15" y1="60" x2="45" y2="60" stroke={color} strokeWidth={strokeWidth} />
    <line x1="15" y1="75" x2="45" y2="75" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// Symbol registry for easy access
export const ISA51Symbols = {
  // Pumps & Compressors
  CentrifugalPump,
  PositiveDisplacementPump,
  ReciprocatingPump,
  CentrifugalCompressor,

  // Valves
  GateValve,
  GlobeValve,
  BallValve,
  ButterflyValve,
  CheckValve,
  ControlValve,
  SafetyReliefValve,

  // Tanks & Vessels
  HorizontalTank,
  VerticalTank,
  PressureVessel,

  // Heat Transfer
  ShellTubeHeatExchanger,
  AirCooledExchanger,

  // Instruments
  PressureIndicator,
  TemperatureIndicator,
  FlowIndicator,
  LevelIndicator,
  OrificePlate,

  // Piping
  Elbow90,
  Tee,
  Reducer,
  Flange,

  // Process Equipment
  Mixer,
  Filter,
  Separator,
  Column
};

export default ISA51Symbols;