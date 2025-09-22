import React from 'react';

interface PIDSymbolProps {
  type: 'centrifugal_pump' | 'gate_valve' | 'globe_valve' | 'check_valve' | 'ball_valve' | 'vertical_tank' | 'horizontal_tank' | 'pressure_vessel';
  width?: number;
  height?: number;
  className?: string;
}

export default function PIDSymbol({ type, width = 40, height = 40, className = '' }: PIDSymbolProps) {
  const getSymbolPath = () => {
    switch (type) {
      case 'centrifugal_pump':
        return (
          <g>
            {/* Centrifugal pump - circle with impeller lines */}
            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M 8 20 L 32 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 20 8 L 20 32" stroke="currentColor" strokeWidth="2"/>
            <path d="M 12 12 L 28 28" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M 28 12 L 12 28" stroke="currentColor" strokeWidth="1.5"/>
            {/* Inlet/outlet connections */}
            <path d="M 4 20 L 8 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 32 20 L 36 20" stroke="currentColor" strokeWidth="2"/>
          </g>
        );

      case 'gate_valve':
        return (
          <g>
            {/* Gate valve - rectangular body with gate */}
            <rect x="12" y="14" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M 4 20 L 12 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 28 20 L 36 20" stroke="currentColor" strokeWidth="2"/>
            {/* Gate mechanism */}
            <path d="M 20 14 L 20 8" stroke="currentColor" strokeWidth="2"/>
            <rect x="18" y="6" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            {/* Gate */}
            <path d="M 14 20 L 26 20" stroke="currentColor" strokeWidth="2"/>
          </g>
        );

      case 'globe_valve':
        return (
          <g>
            {/* Globe valve - circular body with plug */}
            <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M 4 20 L 12 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 28 20 L 36 20" stroke="currentColor" strokeWidth="2"/>
            {/* Valve stem */}
            <path d="M 20 12 L 20 6" stroke="currentColor" strokeWidth="2"/>
            <rect x="18" y="4" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            {/* Plug */}
            <circle cx="20" cy="18" r="3" fill="currentColor"/>
          </g>
        );

      case 'check_valve':
        return (
          <g>
            {/* Check valve - angled body with flap */}
            <path d="M 4 20 L 12 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 28 20 L 36 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 12 20 L 20 12 L 28 20 L 20 28 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
            {/* Check mechanism */}
            <path d="M 16 16 L 22 22" stroke="currentColor" strokeWidth="2"/>
            <circle cx="22" cy="22" r="1.5" fill="currentColor"/>
          </g>
        );

      case 'ball_valve':
        return (
          <g>
            {/* Ball valve - circular body with quarter turn */}
            <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M 4 20 L 12 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 28 20 L 36 20" stroke="currentColor" strokeWidth="2"/>
            {/* Ball and handle */}
            <circle cx="20" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M 20 12 L 20 8" stroke="currentColor" strokeWidth="2"/>
            <path d="M 18 8 L 22 8" stroke="currentColor" strokeWidth="2"/>
            {/* Flow path */}
            <path d="M 16 20 L 24 20" stroke="currentColor" strokeWidth="1"/>
          </g>
        );

      case 'vertical_tank':
        return (
          <g>
            {/* Vertical cylindrical tank */}
            <rect x="8" y="6" width="24" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
            {/* Tank connections */}
            <path d="M 8 30 L 4 30" stroke="currentColor" strokeWidth="2"/>
            <path d="M 32 30 L 36 30" stroke="currentColor" strokeWidth="2"/>
            <path d="M 20 34 L 20 38" stroke="currentColor" strokeWidth="2"/>
            {/* Level indication */}
            <path d="M 10 12 L 30 12" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
            <path d="M 10 20 L 30 20" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          </g>
        );

      case 'horizontal_tank':
        return (
          <g>
            {/* Horizontal cylindrical tank */}
            <rect x="6" y="12" width="28" height="16" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            {/* Tank connections */}
            <path d="M 6 20 L 2 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 34 20 L 38 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 20 28 L 20 32" stroke="currentColor" strokeWidth="2"/>
            {/* Level indication */}
            <path d="M 10 20 L 30 20" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
          </g>
        );

      case 'pressure_vessel':
        return (
          <g>
            {/* Pressure vessel with dished ends */}
            <path d="M 8 20 Q 8 12 12 12 L 28 12 Q 32 12 32 20 Q 32 28 28 28 L 12 28 Q 8 28 8 20 Z"
                  fill="none" stroke="currentColor" strokeWidth="2"/>
            {/* Connections */}
            <path d="M 8 20 L 4 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 32 20 L 36 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M 20 12 L 20 8" stroke="currentColor" strokeWidth="2"/>
            {/* Pressure indication */}
            <circle cx="20" cy="20" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
          </g>
        );

      default:
        return (
          <rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"/>
        );
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      className={className}
      fill="none"
    >
      {getSymbolPath()}
    </svg>
  );
}