import React from "react";

/**
 * ISO 14617 Standard Symbol Components
 * International standard for graphical symbols in technical documentation
 */

export interface ISOSymbolProps {
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

// ===== PUMPS (ISO 14617-6) =====

export const ISO_CentrifugalPump: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="30" cy="30" r="18" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 30 12 L 25 30 L 30 48" stroke={color} strokeWidth={strokeWidth * 1.5} fill="none" />
    <path d="M 30 12 L 35 30 L 30 48" stroke={color} strokeWidth={strokeWidth * 1.5} fill="none" />
    <line x1="5" y1="30" x2="12" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="48" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_GearPump: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="25" cy="30" r="12" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="35" cy="30" r="12" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="25" cy="30" r="6" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <circle cx="35" cy="30" r="6" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <line x1="5" y1="30" x2="13" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="47" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_ScrewPump: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="15"
      y="20"
      width="30"
      height="20"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <path
      d="M 20 25 Q 25 30 30 25 Q 35 20 40 25 Q 45 30 40 35 Q 35 40 30 35 Q 25 30 20 35"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
    />
    <line x1="5" y1="30" x2="15" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="45" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== VALVES (ISO 14617-7) =====

export const ISO_ShutoffValve: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="20"
      width="20"
      height="20"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <line x1="20" y1="20" x2="40" y2="40" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="20" x2="20" y2="40" stroke={color} strokeWidth={strokeWidth} />
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_ThrottleValve: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M 20 20 L 20 40 L 40 30 Z" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 40 20 L 40 40 L 20 30 Z" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_NonReturnValve: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="30" cy="30" r="10" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <line x1="30" y1="20" x2="30" y2="40" stroke={color} strokeWidth={strokeWidth * 2} />
    <path d="M 35 25 L 40 30 L 35 35" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_SafetyValve: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 20 35 L 30 25 L 30 45 Z M 40 35 L 30 25 L 30 45 Z"
      fill={fillColor}
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path d="M 30 25 L 30 15" stroke={color} strokeWidth={strokeWidth} />
    <path d="M 25 10 L 35 10 L 30 15 Z" fill={color} />
    <line x1="5" y1="35" x2="20" y2="35" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_ControlValve: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 20 30 L 30 20 L 30 40 Z M 40 30 L 30 20 L 30 40 Z"
      fill={fillColor}
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <rect
      x="25"
      y="5"
      width="10"
      height="15"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <line
      x1="30"
      y1="5"
      x2="30"
      y2="20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray="2 2"
    />
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== VESSELS (ISO 14617-8) =====

export const ISO_PressureVessel: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 80,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse
      cx="30"
      cy="20"
      rx="18"
      ry="8"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <rect x="12" y="20" width="36" height="40" stroke="none" fill={fillColor} />
    <line x1="12" y1="20" x2="12" y2="60" stroke={color} strokeWidth={strokeWidth} />
    <line x1="48" y1="20" x2="48" y2="60" stroke={color} strokeWidth={strokeWidth} />
    <ellipse
      cx="30"
      cy="60"
      rx="18"
      ry="8"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
  </svg>
);

export const ISO_StorageTank: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="15"
      width="40"
      height="35"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <path d="M 10 15 Q 30 10 50 15" stroke={color} strokeWidth={strokeWidth} fill="none" />
    <rect x="12" y="35" width="36" height="13" fill="#E0E7FF" opacity="0.5" />
  </svg>
);

export const ISO_OpenTank: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor: _fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 10 15 L 10 50 L 50 50 L 50 15"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
    />
    <rect x="12" y="35" width="36" height="13" fill="#E0E7FF" opacity="0.5" />
  </svg>
);

// ===== HEAT EXCHANGERS (ISO 14617-9) =====

export const ISO_HeatExchanger: React.FC<ISOSymbolProps> = ({
  width = 80,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 80 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="40" cy="30" r="20" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 25 30 L 55 30" stroke={color} strokeWidth={strokeWidth * 2} />
    <path d="M 40 15 L 40 45" stroke={color} strokeWidth={strokeWidth} strokeDasharray="3 3" />
    <line x1="5" y1="20" x2="20" y2="20" stroke="#EF4444" strokeWidth={strokeWidth} />
    <line x1="60" y1="20" x2="75" y2="20" stroke="#EF4444" strokeWidth={strokeWidth} />
    <line x1="5" y1="40" x2="20" y2="40" stroke="#3B82F6" strokeWidth={strokeWidth} />
    <line x1="60" y1="40" x2="75" y2="40" stroke="#3B82F6" strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_Condenser: React.FC<ISOSymbolProps> = ({
  width = 80,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 80 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="15"
      y="15"
      width="50"
      height="30"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <path
      d="M 20 20 L 60 20 M 20 25 L 60 25 M 20 30 L 60 30 M 20 35 L 60 35 M 20 40 L 60 40"
      stroke={color}
      strokeWidth={strokeWidth * 0.5}
    />
    <path d="M 40 10 L 40 15" stroke={color} strokeWidth={strokeWidth} />
    <path d="M 40 45 L 40 50" stroke={color} strokeWidth={strokeWidth} />
    <line x1="5" y1="30" x2="15" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="65" y1="30" x2="75" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== MEASUREMENT DEVICES (ISO 14617-10) =====

export const ISO_FlowMeter: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
  label = "FE",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="20"
      width="20"
      height="20"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <text x="30" y="35" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>
      {label}
    </text>
    <line x1="5" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_PressureGauge: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
  label = "PI",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="30" cy="25" r="12" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <text x="30" y="29" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>
      {label}
    </text>
    <line x1="30" y1="37" x2="30" y2="50" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="30" cy="50" r="2" fill={color} />
  </svg>
);

export const ISO_TemperatureSensor: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
  label = "TE",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="25"
      y="15"
      width="10"
      height="25"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <circle cx="30" cy="45" r="8" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <text x="30" y="49" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>
      {label}
    </text>
  </svg>
);

export const ISO_LevelGauge: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
  label = "LG",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="10"
      width="20"
      height="40"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <rect x="22" y="30" width="16" height="18" fill="#E0E7FF" opacity="0.5" />
    <text x="30" y="25" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>
      {label}
    </text>
    <line x1="15" y1="30" x2="20" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="30" x2="45" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== COMPRESSORS & FANS (ISO 14617-6) =====

export const ISO_Compressor: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M 15 15 L 15 45 L 45 30 Z" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="30" cy="30" r="3" fill={color} />
    <line x1="5" y1="30" x2="15" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="45" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_Fan: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="30" cy="30" r="15" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <circle cx="30" cy="30" r="3" fill={color} />
    <path d="M 30 15 Q 25 25 30 30 Q 35 25 30 15" fill={color} />
    <path d="M 15 30 Q 25 35 30 30 Q 25 25 15 30" fill={color} />
    <path d="M 30 45 Q 35 35 30 30 Q 25 35 30 45" fill={color} />
    <path d="M 45 30 Q 35 25 30 30 Q 35 35 45 30" fill={color} />
  </svg>
);

export const ISO_Blower: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="30" cy="30" r="18" stroke={color} strokeWidth={strokeWidth} fill={fillColor} />
    <path d="M 30 12 Q 20 30 30 48 Q 40 30 30 12" fill={color} opacity="0.3" />
    <path d="M 12 30 Q 30 40 48 30 Q 30 20 12 30" fill={color} opacity="0.3" />
    <circle cx="30" cy="30" r="5" fill={color} />
    <line x1="5" y1="30" x2="12" y2="30" stroke={color} strokeWidth={strokeWidth} />
    <line x1="48" y1="30" x2="55" y2="30" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// ===== FILTERS & SEPARATORS (ISO 14617-11) =====

export const ISO_Filter: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 60,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="15"
      width="20"
      height="30"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <line
      x1="20"
      y1="30"
      x2="40"
      y2="30"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray="2 2"
    />
    <circle cx="30" cy="30" r="2" fill={color} />
    <line x1="5" y1="20" x2="20" y2="20" stroke={color} strokeWidth={strokeWidth} />
    <line x1="40" y1="20" x2="55" y2="20" stroke={color} strokeWidth={strokeWidth} />
    <line x1="30" y1="45" x2="30" y2="55" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const ISO_Separator: React.FC<ISOSymbolProps> = ({
  width = 60,
  height = 80,
  color = "#000",
  fillColor = "#fff",
  strokeWidth = 1.5,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 10 20 L 10 60 Q 10 70 30 70 Q 50 70 50 60 L 50 20 Q 50 10 30 10 Q 10 10 10 20"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
    <line
      x1="10"
      y1="40"
      x2="50"
      y2="40"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray="3 3"
    />
    <line x1="5" y1="25" x2="10" y2="25" stroke={color} strokeWidth={strokeWidth} />
    <line x1="50" y1="25" x2="55" y2="25" stroke={color} strokeWidth={strokeWidth} />
    <line x1="30" y1="70" x2="30" y2="75" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// Symbol registry for ISO 14617
export const ISO14617Symbols = {
  // Pumps
  ISO_CentrifugalPump,
  ISO_GearPump,
  ISO_ScrewPump,

  // Valves
  ISO_ShutoffValve,
  ISO_ThrottleValve,
  ISO_NonReturnValve,
  ISO_SafetyValve,
  ISO_ControlValve,

  // Vessels
  ISO_PressureVessel,
  ISO_StorageTank,
  ISO_OpenTank,

  // Heat Exchangers
  ISO_HeatExchanger,
  ISO_Condenser,

  // Measurement
  ISO_FlowMeter,
  ISO_PressureGauge,
  ISO_TemperatureSensor,
  ISO_LevelGauge,

  // Compressors & Fans
  ISO_Compressor,
  ISO_Fan,
  ISO_Blower,

  // Filters & Separators
  ISO_Filter,
  ISO_Separator,
};

export default ISO14617Symbols;
