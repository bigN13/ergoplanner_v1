/**
 * Internal Components for Vessels and Tanks
 * Components that can be rendered inside vessel/tank nodes
 */

import React from 'react';

/**
 * Base interface for internal components
 */
export interface InternalComponentProps {
  vesselWidth: number;
  vesselHeight: number;
  vesselOrientation: 'vertical' | 'horizontal';
  strokeColor?: string;
  strokeWidth?: number;
  showDetailed?: boolean;
}

// ============================================================================
// BAFFLE COMPONENT
// ============================================================================

export interface BaffleComponentProps extends InternalComponentProps {
  numberOfBaffles?: number;
  baffleWidth?: number;
  baffleType?: 'vertical' | 'horizontal' | 'disk-donut';
  baffleSpacing?: number;
}

/**
 * BaffleComponent
 * Renders baffles inside vessels for improved mixing
 */
export const BaffleComponent: React.FC<BaffleComponentProps> = ({
  vesselWidth,
  vesselHeight,
  vesselOrientation,
  strokeColor = '#374151',
  strokeWidth = 1.5,
  numberOfBaffles = 4,
  baffleType = 'vertical',
  showDetailed = true,
}) => {
  if (!showDetailed || vesselOrientation === 'horizontal') return null;

  if (baffleType === 'vertical') {
    // Vertical baffles positioned around perimeter
    const bafflePositions = Array.from({ length: numberOfBaffles }, (_, i) => {
      const angle = (i / numberOfBaffles) * Math.PI * 2;
      const radius = vesselWidth * 0.4;
      return {
        x: vesselWidth / 2 + Math.cos(angle) * radius,
        y1: vesselHeight * 0.2,
        y2: vesselHeight * 0.8,
      };
    });

    return (
      <g className="baffle-group">
        {bafflePositions.map((pos, idx) => (
          <line
            key={`baffle-${idx}`}
            x1={pos.x}
            y1={pos.y1}
            x2={pos.x}
            y2={pos.y2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray="4,2"
            opacity={0.7}
          />
        ))}
      </g>
    );
  }

  if (baffleType === 'horizontal') {
    // Horizontal baffles (disk-style)
    const spacing = vesselHeight / (numberOfBaffles + 1);
    return (
      <g className="baffle-group">
        {Array.from({ length: numberOfBaffles }, (_, i) => {
          const y = spacing * (i + 1);
          return (
            <ellipse
              key={`baffle-${i}`}
              cx={vesselWidth / 2}
              cy={y}
              rx={vesselWidth * 0.35}
              ry={vesselWidth * 0.08}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={0.6}
            />
          );
        })}
      </g>
    );
  }

  return null;
};

// ============================================================================
// AGITATOR COMPONENT
// ============================================================================

export interface AgitatorComponentProps extends InternalComponentProps {
  agitatorType?: 'turbine' | 'propeller' | 'anchor' | 'paddle' | 'ribbon' | 'helical';
  numberOfImpellers?: number;
  motorPower?: number;
  speed?: number; // RPM
}

/**
 * AgitatorComponent
 * Renders different types of agitators/mixers
 */
export const AgitatorComponent: React.FC<AgitatorComponentProps> = ({
  vesselWidth,
  vesselHeight,
  vesselOrientation,
  strokeColor = '#374151',
  strokeWidth = 2,
  agitatorType = 'turbine',
  numberOfImpellers = 1,
  showDetailed = true,
}) => {
  if (!showDetailed || vesselOrientation === 'horizontal') return null;

  const cx = vesselWidth / 2;
  const shaftTop = vesselHeight * 0.05;
  const shaftBottom = vesselHeight * 0.7;

  const renderImpeller = (y: number, type: string) => {
    switch (type) {
      case 'turbine':
        return (
          <g transform={`translate(${cx}, ${y})`}>
            {/* Disk */}
            <circle r={vesselWidth * 0.15} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Blades */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <line
                key={angle}
                x1={0}
                y1={0}
                x2={Math.cos((angle * Math.PI) / 180) * vesselWidth * 0.15}
                y2={Math.sin((angle * Math.PI) / 180) * vesselWidth * 0.15}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            ))}
          </g>
        );

      case 'propeller':
        return (
          <g transform={`translate(${cx}, ${y})`}>
            {/* Three-blade propeller */}
            {[0, 120, 240].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <ellipse
                  key={angle}
                  cx={Math.cos(rad) * vesselWidth * 0.08}
                  cy={Math.sin(rad) * vesselWidth * 0.08}
                  rx={vesselWidth * 0.12}
                  ry={vesselWidth * 0.04}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  transform={`rotate(${angle + 30})`}
                />
              );
            })}
          </g>
        );

      case 'anchor':
        return (
          <g transform={`translate(${cx}, ${y})`}>
            {/* Anchor-shaped impeller */}
            <path
              d={`M 0 ${-vesselHeight * 0.15} L ${-vesselWidth * 0.35} ${vesselHeight * 0.1} L ${-vesselWidth * 0.3} ${vesselHeight * 0.15} L 0 0 L ${vesselWidth * 0.3} ${vesselHeight * 0.15} L ${vesselWidth * 0.35} ${vesselHeight * 0.1} L 0 ${-vesselHeight * 0.15}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );

      case 'paddle':
        return (
          <g transform={`translate(${cx}, ${y})`}>
            {/* Simple paddle */}
            <line
              x1={-vesselWidth * 0.25}
              y1={0}
              x2={vesselWidth * 0.25}
              y2={0}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 1.5}
            />
            <rect
              x={-vesselWidth * 0.25}
              y={-vesselWidth * 0.05}
              width={vesselWidth * 0.5}
              height={vesselWidth * 0.1}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.5}
            />
          </g>
        );

      case 'ribbon':
        return (
          <g transform={`translate(${cx}, ${y})`}>
            {/* Helical ribbon */}
            <path
              d={`M ${-vesselWidth * 0.3} ${-vesselHeight * 0.1} Q ${vesselWidth * 0.3} 0 ${-vesselWidth * 0.3} ${vesselHeight * 0.1}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <path
              d={`M ${vesselWidth * 0.3} ${-vesselHeight * 0.1} Q ${-vesselWidth * 0.3} 0 ${vesselWidth * 0.3} ${vesselHeight * 0.1}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );

      case 'helical':
        return (
          <g transform={`translate(${cx}, ${y})`}>
            {/* Helical screw */}
            {Array.from({ length: 5 }, (_, i) => {
              const yOffset = (i - 2) * (vesselHeight * 0.03);
              return (
                <ellipse
                  key={i}
                  cy={yOffset}
                  rx={vesselWidth * 0.15}
                  ry={vesselWidth * 0.03}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth * 0.7}
                />
              );
            })}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <g className="agitator-group">
      {/* Motor housing */}
      <rect
        x={cx - vesselWidth * 0.08}
        y={shaftTop - vesselHeight * 0.03}
        width={vesselWidth * 0.16}
        height={vesselHeight * 0.06}
        fill="#6b7280"
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
        rx={vesselWidth * 0.02}
      />

      {/* Shaft */}
      <line
        x1={cx}
        y1={shaftTop + vesselHeight * 0.03}
        x2={cx}
        y2={shaftBottom}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Impellers */}
      {Array.from({ length: numberOfImpellers }, (_, i) => {
        const impellerY = shaftBottom - ((shaftBottom - shaftTop) / (numberOfImpellers + 1)) * i;
        return <g key={`impeller-${i}`}>{renderImpeller(impellerY, agitatorType)}</g>;
      })}
    </g>
  );
};

// ============================================================================
// HEATING COIL COMPONENT
// ============================================================================

export interface HeatingCoilComponentProps extends InternalComponentProps {
  coilType?: 'helical' | 'spiral' | 'serpentine';
  numberOfTurns?: number;
}

/**
 * HeatingCoilComponent
 * Renders internal heating coils
 */
export const HeatingCoilComponent: React.FC<HeatingCoilComponentProps> = ({
  vesselWidth,
  vesselHeight,
  strokeColor = '#ef4444',
  strokeWidth = 2,
  coilType = 'helical',
  numberOfTurns = 4,
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  if (coilType === 'helical') {
    const coilPath = Array.from({ length: numberOfTurns * 2 }, (_, i) => {
      const t = i / (numberOfTurns * 2);
      const y = vesselHeight * 0.3 + t * vesselHeight * 0.4;
      const x = vesselWidth / 2 + Math.sin(t * Math.PI * numberOfTurns * 2) * vesselWidth * 0.3;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <path
        d={coilPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray="3,2"
        opacity={0.7}
      />
    );
  }

  if (coilType === 'serpentine') {
    const turns = Array.from({ length: numberOfTurns }, (_, i) => {
      const y = vesselHeight * 0.3 + (i / (numberOfTurns - 1)) * vesselHeight * 0.4;
      const x1 = vesselWidth * 0.2;
      const x2 = vesselWidth * 0.8;
      return i % 2 === 0 ? `L ${x2} ${y}` : `L ${x1} ${y}`;
    });

    return (
      <path
        d={`M ${vesselWidth * 0.2} ${vesselHeight * 0.3} ${turns.join(' ')}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray="3,2"
        opacity={0.7}
      />
    );
  }

  return null;
};

// ============================================================================
// DIP TUBE COMPONENT
// ============================================================================

export interface DipTubeComponentProps extends InternalComponentProps {
  dipDepth?: number; // 0-1 (percentage of vessel height)
  tubeWidth?: number;
}

/**
 * DipTubeComponent
 * Renders dip tubes for liquid extraction
 */
export const DipTubeComponent: React.FC<DipTubeComponentProps> = ({
  vesselWidth,
  vesselHeight,
  strokeColor = '#374151',
  strokeWidth = 2,
  dipDepth = 0.8,
  tubeWidth = 4,
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const x = vesselWidth * 0.7;
  const y1 = vesselHeight * 0.1;
  const y2 = vesselHeight * dipDepth;

  return (
    <g className="dip-tube-group">
      <rect
        x={x - tubeWidth / 2}
        y={y1}
        width={tubeWidth}
        height={y2 - y1}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Strainer at bottom */}
      <circle
        cx={x}
        cy={y2}
        r={tubeWidth * 1.5}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.5}
      />
    </g>
  );
};

// ============================================================================
// SPRAY NOZZLE COMPONENT
// ============================================================================

export interface SprayNozzleComponentProps extends InternalComponentProps {
  numberOfNozzles?: number;
  nozzleType?: 'cone' | 'flat' | 'hollow-cone';
}

/**
 * SprayNozzleComponent
 * Renders spray nozzles for liquid distribution
 */
export const SprayNozzleComponent: React.FC<SprayNozzleComponentProps> = ({
  vesselWidth,
  vesselHeight,
  strokeColor = '#3b82f6',
  strokeWidth = 1.5,
  numberOfNozzles = 3,
  nozzleType = 'cone',
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  return (
    <g className="spray-nozzle-group">
      {Array.from({ length: numberOfNozzles }, (_, i) => {
        const x = (vesselWidth / (numberOfNozzles + 1)) * (i + 1);
        const y = vesselHeight * 0.15;

        return (
          <g key={`nozzle-${i}`}>
            {/* Nozzle body */}
            <circle cx={x} cy={y} r={3} fill={strokeColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Spray pattern */}
            {nozzleType === 'cone' && (
              <path
                d={`M ${x} ${y} L ${x - 10} ${y + 15} M ${x} ${y} L ${x + 10} ${y + 15}`}
                stroke={strokeColor}
                strokeWidth={strokeWidth * 0.5}
                opacity={0.4}
                strokeDasharray="2,1"
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

// ============================================================================
// PACKING COMPONENT
// ============================================================================

export interface PackingComponentProps extends InternalComponentProps {
  packingType?: 'random' | 'structured';
  packingHeight?: number; // percentage
}

/**
 * PackingComponent
 * Renders packing material in columns
 */
export const PackingComponent: React.FC<PackingComponentProps> = ({
  vesselWidth,
  vesselHeight,
  strokeColor = '#6b7280',
  packingType = 'random',
  packingHeight = 0.6,
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const startY = vesselHeight * 0.2;
  const endY = startY + vesselHeight * packingHeight;

  if (packingType === 'structured') {
    // Structured packing - diagonal crisscross pattern
    return (
      <g className="packing-group" opacity={0.3}>
        <defs>
          <pattern id="structured-packing" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="10" y2="10" stroke={strokeColor} strokeWidth="1" />
            <line x1="10" y1="0" x2="0" y2="10" stroke={strokeColor} strokeWidth="1" />
          </pattern>
        </defs>
        <rect
          x={vesselWidth * 0.15}
          y={startY}
          width={vesselWidth * 0.7}
          height={endY - startY}
          fill="url(#structured-packing)"
        />
      </g>
    );
  }

  // Random packing - dots pattern
  return (
    <g className="packing-group" opacity={0.3}>
      <defs>
        <pattern id="random-packing" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={strokeColor} />
          <circle cx="6" cy="5" r="1" fill={strokeColor} />
        </pattern>
      </defs>
      <rect
        x={vesselWidth * 0.15}
        y={startY}
        width={vesselWidth * 0.7}
        height={endY - startY}
        fill="url(#random-packing)"
      />
    </g>
  );
};

// ============================================================================
// TRAY COMPONENT
// ============================================================================

export interface TrayComponentProps extends InternalComponentProps {
  numberOfTrays?: number;
  trayType?: 'sieve' | 'valve' | 'bubble-cap';
  traySpacing?: number;
}

/**
 * TrayComponent
 * Renders distillation trays in columns
 */
export const TrayComponent: React.FC<TrayComponentProps> = ({
  vesselWidth,
  vesselHeight,
  strokeColor = '#374151',
  strokeWidth = 1,
  numberOfTrays = 10,
  trayType = 'sieve',
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const startY = vesselHeight * 0.15;
  const endY = vesselHeight * 0.85;
  const spacing = (endY - startY) / (numberOfTrays - 1);

  return (
    <g className="tray-group">
      {Array.from({ length: numberOfTrays }, (_, i) => {
        const y = startY + i * spacing;
        return (
          <line
            key={`tray-${i}`}
            x1={vesselWidth * 0.2}
            y1={y}
            x2={vesselWidth * 0.8}
            y2={y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray="3,2"
            opacity={0.5}
          />
        );
      })}
    </g>
  );
};

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

export default {
  BaffleComponent,
  AgitatorComponent,
  HeatingCoilComponent,
  DipTubeComponent,
  SprayNozzleComponent,
  PackingComponent,
  TrayComponent,
};