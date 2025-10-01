/**
 * Visual Features and Annotations for Vessels
 * Insulation, support structures, level indicators, nozzles, and dimensional annotations
 */

import React from 'react';

/**
 * Base props for visual feature components
 */
export interface VisualFeatureProps {
  vesselWidth: number;
  vesselHeight: number;
  vesselOrientation: 'vertical' | 'horizontal';
  strokeColor?: string;
  strokeWidth?: number;
  showDetailed?: boolean;
}

// ============================================================================
// INSULATION RENDERER
// ============================================================================

export interface InsulationRendererProps extends VisualFeatureProps {
  insulationType?: 'single' | 'double';
  insulationThickness?: number;
  vesselShape?: 'cylindrical' | 'spherical' | 'rectangular' | 'conical';
}

/**
 * InsulationRenderer Component
 * Renders insulation patterns around vessels
 */
export const InsulationRenderer: React.FC<InsulationRendererProps> = ({
  vesselWidth,
  vesselHeight,
  vesselOrientation,
  strokeColor = '#94a3b8',
  strokeWidth = 0.5,
  insulationType = 'single',
  insulationThickness = 8,
  vesselShape = 'cylindrical',
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const renderInsulationPattern = () => {
    if (vesselOrientation === 'vertical') {
      const margin = vesselWidth * 0.05;
      const x = margin;
      const y = vesselHeight * 0.15;
      const width = vesselWidth - margin * 2;
      const height = vesselHeight * 0.7;

      return (
        <>
          <defs>
            <pattern
              id="insulation-pattern-single"
              x="0"
              y="0"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="6" y2="6" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="6" y1="0" x2="0" y2="6" stroke={strokeColor} strokeWidth={strokeWidth} />
            </pattern>
            <pattern
              id="insulation-pattern-double"
              x="0"
              y="0"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="8" y2="8" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="8" y1="0" x2="0" y2="8" stroke={strokeColor} strokeWidth={strokeWidth} />
              <circle cx="4" cy="4" r="1" fill={strokeColor} />
            </pattern>
          </defs>

          {/* Outer insulation layer */}
          <rect
            x={x - insulationThickness}
            y={y}
            width={width + insulationThickness * 2}
            height={height}
            fill={insulationType === 'double' ? 'url(#insulation-pattern-double)' : 'url(#insulation-pattern-single)'}
            opacity={0.4}
            rx="5"
          />

          {/* Insulation boundary lines */}
          <rect
            x={x - insulationThickness}
            y={y}
            width={width + insulationThickness * 2}
            height={height}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth * 2}
            strokeDasharray="5,3"
            rx="5"
          />

          {/* Double insulation - inner layer */}
          {insulationType === 'double' && (
            <rect
              x={x - insulationThickness / 2}
              y={y + insulationThickness / 2}
              width={width + insulationThickness}
              height={height - insulationThickness}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray="3,2"
              rx="3"
            />
          )}
        </>
      );
    }

    // Horizontal orientation
    const margin = vesselHeight * 0.05;
    const x = vesselWidth * 0.15;
    const y = margin;
    const width = vesselWidth * 0.7;
    const height = vesselHeight - margin * 2;

    return (
      <>
        <defs>
          <pattern
            id="insulation-pattern-horizontal"
            x="0"
            y="0"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="6" y2="6" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="6" y1="0" x2="0" y2="6" stroke={strokeColor} strokeWidth={strokeWidth} />
          </pattern>
        </defs>

        <rect
          x={x}
          y={y - insulationThickness}
          width={width}
          height={height + insulationThickness * 2}
          fill="url(#insulation-pattern-horizontal)"
          opacity={0.4}
          rx="10"
        />
        <rect
          x={x}
          y={y - insulationThickness}
          width={width}
          height={height + insulationThickness * 2}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 2}
          strokeDasharray="5,3"
          rx="10"
        />
      </>
    );
  };

  return <g className="insulation-renderer">{renderInsulationPattern()}</g>;
};

// ============================================================================
// SUPPORT STRUCTURE RENDERER
// ============================================================================

export interface SupportStructureRendererProps extends VisualFeatureProps {
  supportType?: 'legs' | 'saddle' | 'skirt' | 'lug';
  numberOfSupports?: number;
}

/**
 * SupportStructureRenderer Component
 * Renders vessel support structures
 */
export const SupportStructureRenderer: React.FC<SupportStructureRendererProps> = ({
  vesselWidth,
  vesselHeight,
  vesselOrientation,
  strokeColor = '#374151',
  strokeWidth = 2,
  supportType = 'legs',
  numberOfSupports = 2,
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const renderSupport = () => {
    switch (supportType) {
      case 'legs':
        if (vesselOrientation === 'vertical') {
          const legPositions = Array.from({ length: numberOfSupports }, (_, i) => {
            const spacing = vesselWidth / (numberOfSupports + 1);
            return spacing * (i + 1);
          });

          return (
            <g>
              {legPositions.map((x, idx) => (
                <g key={`leg-${idx}`}>
                  {/* Leg */}
                  <line
                    x1={x}
                    y1={vesselHeight * 0.9}
                    x2={x}
                    y2={vesselHeight * 1.05}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  {/* Base plate */}
                  <rect
                    x={x - vesselWidth * 0.03}
                    y={vesselHeight * 1.03}
                    width={vesselWidth * 0.06}
                    height={vesselHeight * 0.02}
                    fill={strokeColor}
                  />
                </g>
              ))}
            </g>
          );
        } else {
          // Horizontal legs
          return (
            <g>
              <line
                x1={vesselWidth * 0.25}
                y1={vesselHeight * 0.85}
                x2={vesselWidth * 0.25}
                y2={vesselHeight}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              <line
                x1={vesselWidth * 0.75}
                y1={vesselHeight * 0.85}
                x2={vesselWidth * 0.75}
                y2={vesselHeight}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            </g>
          );
        }

      case 'saddle':
        if (vesselOrientation === 'horizontal') {
          return (
            <g>
              {/* Left saddle */}
              <path
                d={`M ${vesselWidth * 0.25} ${vesselHeight * 0.65} Q ${vesselWidth * 0.28} ${vesselHeight * 0.8} ${vesselWidth * 0.32} ${vesselHeight * 0.95}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              <path
                d={`M ${vesselWidth * 0.25} ${vesselHeight * 0.65} Q ${vesselWidth * 0.22} ${vesselHeight * 0.8} ${vesselWidth * 0.18} ${vesselHeight * 0.95}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              {/* Right saddle */}
              <path
                d={`M ${vesselWidth * 0.75} ${vesselHeight * 0.65} Q ${vesselWidth * 0.78} ${vesselHeight * 0.8} ${vesselWidth * 0.82} ${vesselHeight * 0.95}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              <path
                d={`M ${vesselWidth * 0.75} ${vesselHeight * 0.65} Q ${vesselWidth * 0.72} ${vesselHeight * 0.8} ${vesselWidth * 0.68} ${vesselHeight * 0.95}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            </g>
          );
        }
        return null;

      case 'skirt':
        if (vesselOrientation === 'vertical') {
          return (
            <g>
              <path
                d={`M ${vesselWidth * 0.3} ${vesselHeight * 0.88} L ${vesselWidth * 0.25} ${vesselHeight * 1.05} L ${vesselWidth * 0.75} ${vesselHeight * 1.05} L ${vesselWidth * 0.7} ${vesselHeight * 0.88} Z`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              {/* Anchor bolts */}
              <circle cx={vesselWidth * 0.3} cy={vesselHeight * 1.03} r={2} fill={strokeColor} />
              <circle cx={vesselWidth * 0.7} cy={vesselHeight * 1.03} r={2} fill={strokeColor} />
            </g>
          );
        }
        return null;

      case 'lug':
        return (
          <g>
            {/* Left lug */}
            <rect
              x={vesselWidth * 0.02}
              y={vesselHeight * 0.45}
              width={vesselWidth * 0.08}
              height={vesselHeight * 0.1}
              fill={strokeColor}
              opacity={0.6}
              rx="2"
            />
            <circle cx={vesselWidth * 0.06} cy={vesselHeight * 0.5} r={3} fill="white" stroke={strokeColor} />
            {/* Right lug */}
            <rect
              x={vesselWidth * 0.9}
              y={vesselHeight * 0.45}
              width={vesselWidth * 0.08}
              height={vesselHeight * 0.1}
              fill={strokeColor}
              opacity={0.6}
              rx="2"
            />
            <circle cx={vesselWidth * 0.94} cy={vesselHeight * 0.5} r={3} fill="white" stroke={strokeColor} />
          </g>
        );

      default:
        return null;
    }
  };

  return <g className="support-structure-renderer">{renderSupport()}</g>;
};

// ============================================================================
// LEVEL INDICATOR COMPONENT
// ============================================================================

export interface LevelIndicatorProps extends VisualFeatureProps {
  level?: number; // 0-100
  indicatorType?: 'gauge' | 'magnetic' | 'radar' | 'simple';
  position?: 'left' | 'right';
  showPercentage?: boolean;
}

/**
 * LevelIndicatorComponent
 * Renders level measurement indicators
 */
export const LevelIndicatorComponent: React.FC<LevelIndicatorProps> = ({
  vesselWidth,
  vesselHeight,
  strokeColor = '#374151',
  strokeWidth = 1,
  level = 0,
  indicatorType = 'simple',
  position = 'right',
  showPercentage = true,
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const x = position === 'right' ? vesselWidth * 0.95 : vesselWidth * 0.05;
  const indicatorTop = vesselHeight * 0.2;
  const indicatorBottom = vesselHeight * 0.8;
  const indicatorHeight = indicatorBottom - indicatorTop;
  const levelY = indicatorBottom - (indicatorHeight * level) / 100;

  const renderIndicator = () => {
    switch (indicatorType) {
      case 'gauge':
        return (
          <g>
            {/* Gauge glass body */}
            <rect
              x={x - 3}
              y={indicatorTop}
              width={6}
              height={indicatorHeight}
              fill="white"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={0.8}
            />
            {/* Level fill */}
            <rect
              x={x - 2}
              y={levelY}
              width={4}
              height={indicatorBottom - levelY}
              fill="#3b82f6"
              opacity={0.6}
            />
            {/* Scale marks */}
            {[0, 25, 50, 75, 100].map((mark) => {
              const y = indicatorBottom - (indicatorHeight * mark) / 100;
              return (
                <g key={mark}>
                  <line
                    x1={x - 3}
                    y1={y}
                    x2={x - 6}
                    y2={y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={x - 10}
                    y={y + 2}
                    fontSize="6"
                    fill={strokeColor}
                    textAnchor="end"
                  >
                    {mark}
                  </text>
                </g>
              );
            })}
          </g>
        );

      case 'magnetic':
        return (
          <g>
            {/* Magnetic level indicator chamber */}
            <rect
              x={x - 2}
              y={indicatorTop}
              width={4}
              height={indicatorHeight}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Float indicator */}
            <rect
              x={x - 4}
              y={levelY - 3}
              width={8}
              height={6}
              fill="#ef4444"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.5}
              rx="1"
            />
            {/* Upper section (red) */}
            <rect
              x={x - 1}
              y={indicatorTop}
              width={2}
              height={levelY - indicatorTop}
              fill="#ef4444"
              opacity={0.3}
            />
            {/* Lower section (green) */}
            <rect
              x={x - 1}
              y={levelY}
              width={2}
              height={indicatorBottom - levelY}
              fill="#10b981"
              opacity={0.3}
            />
          </g>
        );

      case 'radar':
        return (
          <g>
            {/* Radar sensor housing */}
            <rect
              x={x - 5}
              y={indicatorTop - 10}
              width={10}
              height={8}
              fill="#6b7280"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              rx="2"
            />
            {/* Antenna */}
            <circle cx={x} cy={indicatorTop - 6} r={2} fill="#3b82f6" />
            {/* Measurement beam (dashed) */}
            <line
              x1={x}
              y1={indicatorTop - 2}
              x2={x}
              y2={levelY}
              stroke="#3b82f6"
              strokeWidth={strokeWidth * 0.5}
              strokeDasharray="2,2"
              opacity={0.5}
            />
            {/* Level reflection */}
            <ellipse
              cx={x}
              cy={levelY}
              rx="8"
              ry="2"
              fill="#3b82f6"
              opacity={0.3}
            />
          </g>
        );

      case 'simple':
      default:
        return (
          <g>
            {/* Simple level gauge */}
            <rect
              x={x - 2}
              y={indicatorTop}
              width={4}
              height={indicatorHeight}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Level marker */}
            <circle cx={x} cy={levelY} r={2} fill="#3b82f6" stroke={strokeColor} strokeWidth={0.5} />
          </g>
        );
    }
  };

  return (
    <g className="level-indicator">
      {renderIndicator()}
      {/* Percentage text */}
      {showPercentage && (
        <text
          x={position === 'right' ? x + 8 : x - 8}
          y={levelY + 2}
          fontSize="7"
          fill={strokeColor}
          fontWeight="bold"
          textAnchor={position === 'right' ? 'start' : 'end'}
        >
          {level.toFixed(0)}%
        </text>
      )}
    </g>
  );
};

// ============================================================================
// CONNECTION NOZZLE COMPONENT
// ============================================================================

export interface ConnectionNozzleProps {
  x: number;
  y: number;
  label: string;
  size?: string; // e.g., "DN50", "2\""
  direction: 'top' | 'bottom' | 'left' | 'right';
  strokeColor?: string;
  strokeWidth?: number;
  showDetailed?: boolean;
}

/**
 * ConnectionNozzleComponent
 * Renders labeled connection nozzles with size indicators
 */
export const ConnectionNozzleComponent: React.FC<ConnectionNozzleProps> = ({
  x,
  y,
  label,
  size,
  direction,
  strokeColor = '#374151',
  strokeWidth = 1.5,
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const nozzleLength = 10;
  const flangeSize = 8;

  const getNozzleEndpoint = () => {
    switch (direction) {
      case 'top':
        return { x, y: y - nozzleLength };
      case 'bottom':
        return { x, y: y + nozzleLength };
      case 'left':
        return { x: x - nozzleLength, y };
      case 'right':
        return { x: x + nozzleLength, y };
    }
  };

  const endpoint = getNozzleEndpoint();

  return (
    <g className="connection-nozzle">
      {/* Nozzle pipe */}
      <line
        x1={x}
        y1={y}
        x2={endpoint.x}
        y2={endpoint.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth * 2}
      />
      {/* Flange */}
      <circle
        cx={endpoint.x}
        cy={endpoint.y}
        r={flangeSize / 2}
        fill="white"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Label */}
      <text
        x={endpoint.x + (direction === 'right' ? 10 : direction === 'left' ? -10 : 0)}
        y={endpoint.y + (direction === 'bottom' ? 12 : direction === 'top' ? -8 : 3)}
        fontSize="7"
        fill={strokeColor}
        fontWeight="bold"
        textAnchor={direction === 'left' ? 'end' : direction === 'right' ? 'start' : 'middle'}
      >
        {label}
      </text>
      {/* Size indicator */}
      {size && (
        <text
          x={endpoint.x + (direction === 'right' ? 10 : direction === 'left' ? -10 : 0)}
          y={endpoint.y + (direction === 'bottom' ? 20 : direction === 'top' ? -15 : 10)}
          fontSize="5"
          fill={strokeColor}
          textAnchor={direction === 'left' ? 'end' : direction === 'right' ? 'start' : 'middle'}
        >
          {size}
        </text>
      )}
    </g>
  );
};

// ============================================================================
// DIMENSIONAL ANNOTATIONS
// ============================================================================

export interface DimensionalAnnotationProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  value: number;
  unit: string;
  label?: string;
  strokeColor?: string;
  strokeWidth?: number;
  showDetailed?: boolean;
}

/**
 * DimensionalAnnotationComponent
 * Renders dimensional annotations with values and units
 */
export const DimensionalAnnotationComponent: React.FC<DimensionalAnnotationProps> = ({
  startX,
  startY,
  endX,
  endY,
  value,
  unit,
  label,
  strokeColor = '#6b7280',
  strokeWidth = 0.5,
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const isHorizontal = Math.abs(endY - startY) < Math.abs(endX - startX);
  const offset = 5;

  return (
    <g className="dimensional-annotation">
      {/* Dimension line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray="3,2"
      />
      {/* End arrows */}
      <polygon
        points={isHorizontal ? `${startX},${startY} ${startX + 3},${startY - 2} ${startX + 3},${startY + 2}` : `${startX},${startY} ${startX - 2},${startY + 3} ${startX + 2},${startY + 3}`}
        fill={strokeColor}
      />
      <polygon
        points={isHorizontal ? `${endX},${endY} ${endX - 3},${endY - 2} ${endX - 3},${endY + 2}` : `${endX},${endY} ${endX - 2},${endY - 3} ${endX + 2},${endY - 3}`}
        fill={strokeColor}
      />
      {/* Dimension text */}
      <text
        x={midX}
        y={midY + (isHorizontal ? -offset : 0)}
        fontSize="6"
        fill={strokeColor}
        textAnchor="middle"
        fontWeight="bold"
      >
        {label ? `${label}: ` : ''}{value.toFixed(1)} {unit}
      </text>
    </g>
  );
};

// ============================================================================
// STATE INDICATORS
// ============================================================================

export interface StateIndicatorProps {
  x: number;
  y: number;
  type: 'pressure' | 'temperature' | 'flow';
  value: number;
  unit: string;
  status?: 'normal' | 'warning' | 'critical';
  strokeColor?: string;
  showDetailed?: boolean;
}

/**
 * StateIndicatorComponent
 * Renders real-time state indicators for process parameters
 */
export const StateIndicatorComponent: React.FC<StateIndicatorProps> = ({
  x,
  y,
  type,
  value,
  unit,
  status = 'normal',
  strokeColor = '#374151',
  showDetailed = true,
}) => {
  if (!showDetailed) return null;

  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      case 'normal':
      default:
        return '#10b981';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'pressure':
        return 'P';
      case 'temperature':
        return 'T';
      case 'flow':
        return 'F';
    }
  };

  return (
    <g className="state-indicator">
      {/* Indicator badge */}
      <circle cx={x} cy={y} r={8} fill={getStatusColor()} opacity={0.2} />
      <circle cx={x} cy={y} r={8} fill="none" stroke={getStatusColor()} strokeWidth={1.5} />
      {/* Icon */}
      <text x={x} y={y + 3} fontSize="7" fill={strokeColor} textAnchor="middle" fontWeight="bold">
        {getIcon()}
      </text>
      {/* Value display */}
      <text
        x={x}
        y={y + 18}
        fontSize="6"
        fill={strokeColor}
        textAnchor="middle"
        fontWeight="bold"
      >
        {value.toFixed(1)} {unit}
      </text>
    </g>
  );
};

export default {
  InsulationRenderer,
  SupportStructureRenderer,
  LevelIndicatorComponent,
  ConnectionNozzleComponent,
  DimensionalAnnotationComponent,
  StateIndicatorComponent,
};