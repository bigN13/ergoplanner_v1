import React, { memo, useMemo } from 'react';
import type { NodeProps } from 'reactflow';

import type { BaseSymbolData } from '../BaseSymbolNode';
import BaseSymbolNode from '../BaseSymbolNode';
import type { IParametricConfig } from '../../symbols/ParametricSymbolGenerator';
import { ParametricSymbolGenerator } from '../../symbols/ParametricSymbolGenerator';
import { ConnectionType } from '../../symbols/SymbolBase';

/**
 * Vessel head types following ASME/PED standards
 */
export enum VesselHeadType {
  ELLIPTICAL = 'elliptical',
  HEMISPHERICAL = 'hemispherical',
  FLAT = 'flat',
  CONICAL = 'conical',
  TORISPHERICAL = 'torispherical',
}

/**
 * Vessel orientation types
 */
export enum VesselOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

/**
 * Vessel shape types
 */
export enum VesselShape {
  CYLINDRICAL = 'cylindrical',
  SPHERICAL = 'spherical',
  RECTANGULAR = 'rectangular',
  CONICAL = 'conical',
}

/**
 * Extended vessel/tank data interface
 */
export interface VesselTankNodeData extends BaseSymbolData {
  // Vessel configuration
  vesselShape: VesselShape;
  orientation: VesselOrientation;
  topHeadType?: VesselHeadType;
  bottomHeadType?: VesselHeadType;

  // Parametric dimensions
  diameter?: number; // For cylindrical/spherical vessels
  length?: number; // For horizontal vessels
  height?: number; // For vertical vessels
  wallThickness?: number;

  // Tank specifications
  tankType?:
    | 'atmospheric'
    | 'pressurized'
    | 'storage'
    | 'mixing'
    | 'buffer'
    | 'separator'
    | 'knockout_drum'
    | 'flash_drum'
    | 'surge_tank'
    | 'accumulator'
    | 'reactor'
    | 'column';

  // Internal components (as child symbols)
  hasAgitator?: boolean;
  hasBaffles?: boolean;
  hasHeatingCoil?: boolean;
  hasCoolingJacket?: boolean;
  hasDipTube?: boolean;

  // Visual features
  showInsulation?: boolean;
  insulationType?: 'single' | 'double';
  showSupportStructure?: boolean;
  supportType?: 'legs' | 'saddle' | 'skirt' | 'lug';
  showNozzles?: boolean;
  showLevelIndicator?: boolean;

  // Operating parameters
  capacity?: number;
  capacityUnit?: string;
  pressure?: number;
  pressureUnit?: string;
  temperature?: number;
  temperatureUnit?: string;
  level?: number; // 0-100%
  fluidType?: string;

  // Material properties
  material?: string;
  liningMaterial?: string;
  insulationMaterial?: string;
}

type VesselTankNodeProps = NodeProps<VesselTankNodeData>;

/**
 * Vessel/Tank parametric configuration factory
 */
export const createVesselParametricConfig = (
  vesselShape: VesselShape,
  orientation: VesselOrientation
): IParametricConfig => {
  const baseConfig: IParametricConfig = {
    baseWidth: 120,
    baseHeight: 120,
    minWidth: 60,
    maxWidth: 300,
    minHeight: 60,
    maxHeight: 400,
    aspectRatio: orientation === VesselOrientation.VERTICAL ? 0.5 : 2.0,
    scaleStep: 10,
    capacityMin: 100,
    capacityMax: 10000,
    capacityUnit: 'L',
    capacityToSizeRatio: 0.1,
    performanceClass: 'medium',
  };

  // Shape-specific adjustments
  switch (vesselShape) {
    case VesselShape.SPHERICAL:
      return {
        ...baseConfig,
        aspectRatio: 1.0,
        baseWidth: 100,
        baseHeight: 100,
      };
    case VesselShape.RECTANGULAR:
      return {
        ...baseConfig,
        aspectRatio: orientation === VesselOrientation.VERTICAL ? 0.6 : 1.8,
      };
    case VesselShape.CONICAL:
      return {
        ...baseConfig,
        aspectRatio: 0.4,
        baseHeight: 150,
      };
    case VesselShape.CYLINDRICAL:
    default:
      return baseConfig;
  }
};

/**
 * VesselTankNode Component
 * Renders vessels and tanks with parametric sizing and standard vessel shapes
 */
const VesselTankNode = memo<VesselTankNodeProps>(({ id, data, selected, dragging }): React.ReactElement => {
  // Initialize parametric generator for this vessel configuration
  const parametricGenerator = useMemo(() => {
    const config = createVesselParametricConfig(
      data.vesselShape || VesselShape.CYLINDRICAL,
      data.orientation || VesselOrientation.VERTICAL
    );
    return new ParametricSymbolGenerator(config);
  }, [data.vesselShape, data.orientation]);

  // Calculate actual dimensions based on capacity or explicit sizes
  const actualDimensions = useMemo(() => {
    if (data.diameter && data.height) {
      return {
        width: data.orientation === VesselOrientation.HORIZONTAL ? data.height : data.diameter,
        height: data.orientation === VesselOrientation.HORIZONTAL ? data.diameter : data.height,
      };
    }

    // Use parametric generator to calculate from capacity
    const generated = parametricGenerator.generate({
      capacity: data.capacity,
      width: data.dimensions?.width,
      height: data.dimensions?.height,
    });

    return {
      width: generated.metadata?.dimensions?.width || 120,
      height: generated.metadata?.dimensions?.height || 120,
    };
  }, [data.diameter, data.height, data.capacity, data.orientation, data.dimensions, parametricGenerator]);

  /**
   * Render vessel content based on shape and orientation
   */
  const renderVesselContent = (vesselData: VesselTankNodeData): React.ReactElement => {
    const {
      vesselShape = VesselShape.CYLINDRICAL,
      orientation = VesselOrientation.VERTICAL,
      topHeadType = VesselHeadType.ELLIPTICAL,
      bottomHeadType = VesselHeadType.ELLIPTICAL,
      level = 0,
      strokeWidth = 2,
      strokeColor = '#374151',
      fillColor = 'white',
    } = vesselData;

    const {width} = actualDimensions;
    const {height} = actualDimensions;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Liquid level gradient */}
          <linearGradient id={`liquid-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
          </linearGradient>

          {/* Insulation pattern */}
          {vesselData.showInsulation && (
            <pattern id={`insulation-${id}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="4" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
              <line x1="4" y1="0" x2="0" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          )}
        </defs>

        {/* Render vessel shape */}
        {renderVesselShape(vesselShape, orientation, topHeadType, bottomHeadType, width, height, strokeWidth, stroke, fillColor)}

        {/* Liquid level indicator */}
        {level > 0 && renderLiquidLevel(vesselShape, orientation, level, width, height)}

        {/* Internal components */}
        {vesselData.hasAgitator && renderAgitator(width, height, orientation)}
        {vesselData.hasBaffles && renderBaffles(width, height, orientation, strokeColor)}
        {vesselData.hasHeatingCoil && renderHeatingCoil(width, height, strokeColor)}
        {vesselData.hasCoolingJacket && renderCoolingJacket(width, height, strokeColor, strokeWidth)}

        {/* Support structure */}
        {vesselData.showSupportStructure && renderSupportStructure(vesselData.supportType || 'legs', width, height, strokeColor, strokeWidth)}

        {/* Nozzles */}
        {vesselData.showNozzles && renderNozzles(orientation, width, height, strokeColor)}

        {/* Level indicator */}
        {vesselData.showLevelIndicator && renderLevelIndicator(width, height, level, strokeColor)}

        {/* Insulation representation */}
        {vesselData.showInsulation && renderInsulation(vesselShape, orientation, width, height, vesselData.insulationType || 'single')}
      </svg>
    );
  };

  /**
   * Render vessel shape based on type, orientation, and head types
   */
  const renderVesselShape = (
    shape: VesselShape,
    orientation: VesselOrientation,
    topHead: VesselHeadType,
    bottomHead: VesselHeadType,
    width: number,
    height: number,
    strokeWidth: number,
    stroke: string,
    fill: string
  ): React.ReactNode => {
    const cx = width / 2;
    const cy = height / 2;

    switch (shape) {
      case VesselShape.CYLINDRICAL:
        return renderCylindricalVessel(orientation, topHead, bottomHead, width, height, strokeWidth, stroke, fill);

      case VesselShape.SPHERICAL:
        return renderSphericalVessel(cx, cy, Math.min(width, height) / 2 - 5, strokeWidth, stroke, fill);

      case VesselShape.RECTANGULAR:
        return renderRectangularVessel(width, height, strokeWidth, stroke, fill);

      case VesselShape.CONICAL:
        return renderConicalVessel(width, height, strokeWidth, stroke, fill);

      default:
        return null;
    }
  };

  /**
   * Render cylindrical vessel with different head types
   */
  const renderCylindricalVessel = (
    orientation: VesselOrientation,
    topHead: VesselHeadType,
    bottomHead: VesselHeadType,
    width: number,
    height: number,
    strokeWidth: number,
    stroke: string,
    fill: string
  ): React.ReactNode => {
    if (orientation === VesselOrientation.VERTICAL) {
      const bodyMarginTop = 15;
      const bodyMarginBottom = 15;
      const bodyHeight = height - bodyMarginTop - bodyMarginBottom;
      const rx = width * 0.4;
      const ry = 8;

      return (
        <g>
          {/* Vessel clip path for liquid */}
          <clipPath id={`vessel-clip-${id}`}>
            <rect x={width * 0.1} y={bodyMarginTop} width={width * 0.8} height={bodyHeight} rx="5" />
          </clipPath>

          {/* Top head */}
          {renderVerticalHead(topHead, width / 2, bodyMarginTop, rx, ry, strokeWidth, stroke, fill, 'top')}

          {/* Cylindrical body */}
          <rect
            x={width * 0.1}
            y={bodyMarginTop}
            width={width * 0.8}
            height={bodyHeight}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />

          {/* Bottom head */}
          {renderVerticalHead(bottomHead, width / 2, height - bodyMarginBottom, rx, ry, strokeWidth, stroke, fill, 'bottom')}
        </g>
      );
    } else {
      // Horizontal orientation
      const bodyMarginLeft = 20;
      const bodyMarginRight = 20;
      const bodyWidth = width - bodyMarginLeft - bodyMarginRight;

      return (
        <g>
          <clipPath id={`vessel-clip-${id}`}>
            <rect x={bodyMarginLeft} y={height * 0.25} width={bodyWidth} height={height * 0.5} rx="10" />
          </clipPath>

          {/* Left head */}
          <ellipse
            cx={bodyMarginLeft}
            cy={height / 2}
            rx="10"
            ry={height * 0.25}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />

          {/* Cylindrical body */}
          <rect
            x={bodyMarginLeft}
            y={height * 0.25}
            width={bodyWidth}
            height={height * 0.5}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />

          {/* Right head */}
          <ellipse
            cx={width - bodyMarginRight}
            cy={height / 2}
            rx="10"
            ry={height * 0.25}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </g>
      );
    }
  };

  /**
   * Render vertical vessel head based on type
   */
  const renderVerticalHead = (
    headType: VesselHeadType,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    strokeWidth: number,
    stroke: string,
    fill: string,
    position: 'top' | 'bottom'
  ): React.ReactNode => {
    switch (headType) {
      case VesselHeadType.ELLIPTICAL:
        return (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case VesselHeadType.HEMISPHERICAL:
        const path = position === 'top'
          ? `M ${cx - rx} ${cy} A ${rx} ${rx * 1.5} 0 0 1 ${cx + rx} ${cy}`
          : `M ${cx - rx} ${cy} A ${rx} ${rx * 1.5} 0 0 0 ${cx + rx} ${cy}`;
        return (
          <path
            d={path}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case VesselHeadType.FLAT:
        return (
          <line
            x1={cx - rx}
            y1={cy}
            x2={cx + rx}
            y2={cy}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case VesselHeadType.CONICAL:
        const conicalPath = position === 'top'
          ? `M ${cx - rx} ${cy} L ${cx} ${cy - ry * 2} L ${cx + rx} ${cy}`
          : `M ${cx - rx} ${cy} L ${cx} ${cy + ry * 2} L ${cx + rx} ${cy}`;
        return (
          <path
            d={conicalPath}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case VesselHeadType.TORISPHERICAL:
        // Simplified torispherical head representation
        return (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry * 0.8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      default:
        return null;
    }
  };

  /**
   * Render spherical vessel
   */
  const renderSphericalVessel = (
    cx: number,
    cy: number,
    radius: number,
    strokeWidth: number,
    stroke: string,
    fill: string
  ): React.ReactNode => (
    <>
      <clipPath id={`vessel-clip-${id}`}>
        <circle cx={cx} cy={cy} r={radius} />
      </clipPath>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </>
  );

  /**
   * Render rectangular vessel
   */
  const renderRectangularVessel = (
    width: number,
    height: number,
    strokeWidth: number,
    stroke: string,
    fill: string
  ): React.ReactNode => (
    <>
      <clipPath id={`vessel-clip-${id}`}>
        <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.8} rx="5" />
      </clipPath>
      <rect
        x={width * 0.1}
        y={height * 0.1}
        width={width * 0.8}
        height={height * 0.8}
        rx="5"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </>
  );

  /**
   * Render conical vessel
   */
  const renderConicalVessel = (
    width: number,
    height: number,
    strokeWidth: number,
    stroke: string,
    fill: string
  ): React.ReactNode => {
    const topWidth = width * 0.7;
    const bottomWidth = width * 0.3;
    const leftTop = (width - topWidth) / 2;
    const leftBottom = (width - bottomWidth) / 2;

    return (
      <>
        <clipPath id={`vessel-clip-${id}`}>
          <path d={`M ${leftTop} ${height * 0.1} L ${leftTop + topWidth} ${height * 0.1} L ${leftBottom + bottomWidth} ${height * 0.9} L ${leftBottom} ${height * 0.9} Z`} />
        </clipPath>
        <path
          d={`M ${leftTop} ${height * 0.1} L ${leftTop + topWidth} ${height * 0.1} L ${leftBottom + bottomWidth} ${height * 0.9} L ${leftBottom} ${height * 0.9} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </>
    );
  };

  /**
   * Render liquid level
   */
  const renderLiquidLevel = (
    shape: VesselShape,
    orientation: VesselOrientation,
    level: number,
    width: number,
    height: number
  ): React.ReactNode => {
    const fillHeight = height * (level / 100);

    return (
      <rect
        x={0}
        y={height - fillHeight}
        width={width}
        height={fillHeight}
        fill={`url(#liquid-${id})`}
        clipPath={`url(#vessel-clip-${id})`}
      />
    );
  };

  /**
   * Render agitator
   */
  const renderAgitator = (width: number, height: number, orientation: VesselOrientation): React.ReactNode => {
    if (orientation === VesselOrientation.HORIZONTAL) return null;

    const cx = width / 2;
    return (
      <g>
        {/* Motor */}
        <rect x={cx - 8} y={5} width={16} height={10} fill="#6b7280" stroke="#374151" strokeWidth="1" rx="2" />
        {/* Shaft */}
        <line x1={cx} y1={15} x2={cx} y2={height * 0.6} stroke="#374151" strokeWidth="2" />
        {/* Impeller */}
        <g transform={`translate(${cx}, ${height * 0.6})`}>
          <line x1="-15" y1="0" x2="15" y2="0" stroke="#374151" strokeWidth="2.5" />
          <line x1="-12" y1="-6" x2="-12" y2="6" stroke="#374151" strokeWidth="2" />
          <line x1="12" y1="-6" x2="12" y2="6" stroke="#374151" strokeWidth="2" />
        </g>
      </g>
    );
  };

  /**
   * Render baffles
   */
  const renderBaffles = (width: number, height: number, orientation: VesselOrientation, stroke: string): React.ReactNode => {
    if (orientation === VesselOrientation.HORIZONTAL) return null;

    const bafflePositions = [width * 0.2, width * 0.8];
    return (
      <>
        {bafflePositions.map((x, idx) => (
          <line
            key={`baffle-${idx}`}
            x1={x}
            y1={height * 0.2}
            x2={x}
            y2={height * 0.8}
            stroke={stroke}
            strokeWidth="1.5"
            strokeDasharray="4,2"
          />
        ))}
      </>
    );
  };

  /**
   * Render heating coil
   */
  const renderHeatingCoil = (width: number, height: number, stroke: string): React.ReactNode => {
    const coilPath = `M ${width * 0.2} ${height * 0.7} Q ${width * 0.3} ${height * 0.65} ${width * 0.4} ${height * 0.7} Q ${width * 0.5} ${height * 0.75} ${width * 0.6} ${height * 0.7} Q ${width * 0.7} ${height * 0.65} ${width * 0.8} ${height * 0.7}`;

    return (
      <path
        d={coilPath}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeDasharray="3,2"
      />
    );
  };

  /**
   * Render cooling jacket
   */
  const renderCoolingJacket = (width: number, height: number, stroke: string, strokeWidth: number): React.ReactNode => (
    <>
      <rect
        x={width * 0.05}
        y={height * 0.25}
        width={width * 0.9}
        height={height * 0.5}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="4,2"
        rx="5"
      />
      {/* Inlet/outlet ports */}
      <circle cx={width * 0.05} cy={height * 0.3} r="2" fill={stroke} />
      <circle cx={width * 0.95} cy={height * 0.7} r="2" fill={stroke} />
    </>
  );

  /**
   * Render support structure
   */
  const renderSupportStructure = (
    supportType: string,
    width: number,
    height: number,
    stroke: string,
    strokeWidth: number
  ): React.ReactNode => {
    switch (supportType) {
      case 'legs':
        return (
          <>
            <line x1={width * 0.25} y1={height * 0.9} x2={width * 0.25} y2={height} stroke={stroke} strokeWidth={strokeWidth} />
            <line x1={width * 0.75} y1={height * 0.9} x2={width * 0.75} y2={height} stroke={stroke} strokeWidth={strokeWidth} />
            {/* Base plates */}
            <rect x={width * 0.22} y={height * 0.98} width={width * 0.06} height={height * 0.02} fill={stroke} />
            <rect x={width * 0.72} y={height * 0.98} width={width * 0.06} height={height * 0.02} fill={stroke} />
          </>
        );

      case 'saddle':
        return (
          <>
            <path
              d={`M ${width * 0.2} ${height * 0.7} Q ${width * 0.25} ${height * 0.85} ${width * 0.3} ${height * 0.9}`}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            <path
              d={`M ${width * 0.8} ${height * 0.7} Q ${width * 0.75} ${height * 0.85} ${width * 0.7} ${height * 0.9}`}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </>
        );

      case 'skirt':
        return (
          <path
            d={`M ${width * 0.3} ${height * 0.85} L ${width * 0.25} ${height} L ${width * 0.75} ${height} L ${width * 0.7} ${height * 0.85} Z`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case 'lug':
        return (
          <>
            <rect x={width * 0.05} y={height * 0.45} width={width * 0.1} height={height * 0.1} fill={stroke} opacity="0.6" />
            <rect x={width * 0.85} y={height * 0.45} width={width * 0.1} height={height * 0.1} fill={stroke} opacity="0.6" />
          </>
        );

      default:
        return null;
    }
  };

  /**
   * Render nozzles
   */
  const renderNozzles = (
    orientation: VesselOrientation,
    width: number,
    height: number,
    stroke: string
  ): React.ReactNode => {
    const nozzles = orientation === VesselOrientation.VERTICAL
      ? [
          { x: width / 2, y: height * 0.1, label: 'N1' },
          { x: width * 0.1, y: height * 0.4, label: 'N2' },
          { x: width * 0.9, y: height * 0.4, label: 'N3' },
          { x: width / 2, y: height * 0.9, label: 'N4' },
        ]
      : [
          { x: width * 0.15, y: height * 0.3, label: 'N1' },
          { x: width * 0.85, y: height * 0.3, label: 'N2' },
          { x: width / 2, y: height * 0.75, label: 'N3' },
        ];

    return (
      <>
        {nozzles.map(({ x, y, label }) => (
          <g key={label}>
            <circle cx={x} cy={y} r="3" fill="white" stroke={stroke} strokeWidth="1.5" />
            <text x={x} y={y - 6} fontSize="6" fill={stroke} textAnchor="middle" fontWeight="bold">
              {label}
            </text>
          </g>
        ))}
      </>
    );
  };

  /**
   * Render level indicator
   */
  const renderLevelIndicator = (width: number, height: number, level: number, stroke: string): React.ReactNode => {
    const indicatorX = width * 0.95;
    const indicatorTop = height * 0.2;
    const indicatorBottom = height * 0.8;
    const indicatorHeight = indicatorBottom - indicatorTop;
    const levelY = indicatorBottom - (indicatorHeight * level / 100);

    return (
      <g>
        {/* Level gauge body */}
        <rect
          x={indicatorX - 2}
          y={indicatorTop}
          width={4}
          height={indicatorHeight}
          fill="none"
          stroke={stroke}
          strokeWidth="1"
        />
        {/* Level indicator */}
        <circle cx={indicatorX} cy={levelY} r="2" fill="#3b82f6" stroke={stroke} strokeWidth="0.5" />
        {/* Level text */}
        <text x={indicatorX + 6} y={levelY + 2} fontSize="6" fill={stroke}>
          {level}%
        </text>
      </g>
    );
  };

  /**
   * Render insulation
   */
  const renderInsulation = (
    shape: VesselShape,
    orientation: VesselOrientation,
    width: number,
    height: number,
    insulationType: 'single' | 'double'
  ): React.ReactNode => {
    const offset = insulationType === 'double' ? 8 : 4;

    if (shape === VesselShape.CYLINDRICAL && orientation === VesselOrientation.VERTICAL) {
      return (
        <rect
          x={width * 0.05}
          y={height * 0.15}
          width={width * 0.9}
          height={height * 0.7}
          fill={`url(#insulation-${id})`}
          stroke="none"
          opacity="0.3"
        />
      );
    }

    return null;
  };

  // Generate connection points based on vessel orientation
  const connectionPoints = useMemo(() => {
    const basePoints =
      data.orientation === VesselOrientation.VERTICAL
        ? [
            {
              id: 'top',
              type: 'inlet' as const,
              x: actualDimensions.width / 2,
              y: 0,
              direction: 270,
              compatible: ['pipe', 'process'],
              required: false,
            },
            {
              id: 'bottom',
              type: 'outlet' as const,
              x: actualDimensions.width / 2,
              y: actualDimensions.height,
              direction: 90,
              compatible: ['pipe', 'process'],
              required: false,
            },
            {
              id: 'left',
              type: 'process' as const,
              x: 0,
              y: actualDimensions.height * 0.4,
              direction: 180,
              compatible: ['pipe', 'process'],
              required: false,
            },
            {
              id: 'right',
              type: 'process' as const,
              x: actualDimensions.width,
              y: actualDimensions.height * 0.4,
              direction: 0,
              compatible: ['pipe', 'process'],
              required: false,
            },
          ]
        : [
            {
              id: 'left',
              type: 'inlet' as const,
              x: 0,
              y: actualDimensions.height / 2,
              direction: 180,
              compatible: ['pipe', 'process'],
              required: false,
            },
            {
              id: 'right',
              type: 'outlet' as const,
              x: actualDimensions.width,
              y: actualDimensions.height / 2,
              direction: 0,
              compatible: ['pipe', 'process'],
              required: false,
            },
            {
              id: 'top',
              type: 'process' as const,
              x: actualDimensions.width / 2,
              y: 0,
              direction: 270,
              compatible: ['pipe', 'vent'],
              required: false,
            },
            {
              id: 'bottom',
              type: 'drain' as const,
              x: actualDimensions.width / 2,
              y: actualDimensions.height,
              direction: 90,
              compatible: ['pipe', 'drain'],
              required: false,
            },
          ];

    return data.connectionPoints || basePoints;
  }, [data.connectionPoints, data.orientation, actualDimensions]);

  return (
    <BaseSymbolNode
      id={id}
      data={{
        ...data,
        dimensions: {
          width: actualDimensions.width,
          height: actualDimensions.height,
          originX: actualDimensions.width / 2,
          originY: actualDimensions.height / 2,
          scale: data.dimensions?.scale || 1,
          minScale: data.dimensions?.minScale || 0.5,
          maxScale: data.dimensions?.maxScale || 2,
          maintainAspectRatio: true,
          units: 'px',
        },
        connectionPoints,
      }}
      selected={selected}
      dragging={dragging}
      renderCustomContent={renderVesselContent}
    />
  );
});

VesselTankNode.displayName = 'VesselTankNode';

export default VesselTankNode;