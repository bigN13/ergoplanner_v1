import React from 'react';
import { ParametricSymbolGenerator, type IParametricConfig } from '../../ParametricSymbolGenerator';
import { ConnectionType, type ISymbolBaseData } from '../../SymbolBase';

/**
 * Vessel shape types
 */
export enum VesselShape {
  CYLINDRICAL_VERTICAL = 'cylindrical-vertical',
  CYLINDRICAL_HORIZONTAL = 'cylindrical-horizontal',
  SPHERICAL = 'spherical',
  RECTANGULAR = 'rectangular',
}

/**
 * Vessel head types (for cylindrical vessels)
 */
export enum VesselHeadType {
  FLAT = 'flat',
  ELLIPTICAL = 'elliptical',
  HEMISPHERICAL = 'hemispherical',
  CONICAL = 'conical',
  TORISPHERICAL = 'torispherical',
}

/**
 * Vessel symbol metadata
 */
export interface IVesselMetadata extends ISymbolBaseData {
  shape: VesselShape;
  headType?: VesselHeadType;
  designPressure?: number; // bar
  designTemperature?: number; // °C
  volume?: number; // m³
  insulated?: boolean;
  jacketed?: boolean;
}

/**
 * Vessel symbol data (for compatibility)
 */
export type IVesselSymbolData = IVesselMetadata;

/**
 * Base configuration for vessel symbols
 */
export const VESSEL_BASE_CONFIG: IParametricConfig = {
  baseWidth: 100,
  baseHeight: 200,
  minWidth: 50,
  maxWidth: 400,
  minHeight: 100,
  maxHeight: 600,
  aspectRatio: 0.5, // width/height for vertical vessels
  capacityMin: 10,
  capacityMax: 100000,
  capacityUnit: 'm³',
  capacityToSizeRatio: 0.1,
  connectionRules: [
    {
      type: ConnectionType.INLET,
      count: 1,
      position: 'top',
      required: true,
    },
    {
      type: ConnectionType.OUTLET,
      count: 1,
      position: 'bottom',
      required: true,
    },
    {
      type: ConnectionType.VENT,
      count: 1,
      position: 'top',
      offset: 20,
    },
    {
      type: ConnectionType.DRAIN,
      count: 1,
      position: 'bottom',
      offset: 20,
    },
    {
      type: ConnectionType.INSTRUMENTATION,
      count: 2,
      position: 'right',
    },
  ],
  materials: [
    {
      id: 'carbon_steel',
      name: 'Carbon Steel',
      properties: {
        density: 7850,
        maxPressure: 40,
        maxTemperature: 400,
        corrosionResistance: 'Moderate',
        cost: 1.0,
      },
      visual: {
        color: '#9CA3AF',
        pattern: 'none',
      },
    },
    {
      id: 'stainless_steel_316',
      name: 'Stainless Steel 316',
      properties: {
        density: 8000,
        maxPressure: 100,
        maxTemperature: 600,
        corrosionResistance: 'Excellent',
        cost: 3.5,
      },
      visual: {
        color: '#D1D5DB',
        pattern: 'none',
      },
    },
  ],
  variants: [
    'atmospheric',
    'pressurized',
    'insulated',
    'jacketed',
    'mixing',
  ],
  performanceClass: 'medium',
  maxInstances: 1000,
};

/**
 * Base class for vessel symbols with parametric generation
 */
export class VesselSymbolBase {
  protected generator: ParametricSymbolGenerator<IVesselSymbolData>;
  protected shape: VesselShape;

  constructor(shape: VesselShape, config?: Partial<IParametricConfig>) {
    this.shape = shape;
    this.generator = new ParametricSymbolGenerator<IVesselSymbolData>({
      ...VESSEL_BASE_CONFIG,
      ...config,
    });
  }

  /**
   * Generate vessel symbol with parameters
   */
  public generate(parameters: {
    volume?: number;
    width?: number;
    height?: number;
    variant?: string;
    material?: string;
    designPressure?: number;
    designTemperature?: number;
    headType?: VesselHeadType;
    insulated?: boolean;
    jacketed?: boolean;
  }): IVesselSymbolData {
    const baseData = this.generator.generate({
      capacity: parameters.volume,
      width: parameters.width,
      height: parameters.height,
      variant: parameters.variant,
      material: parameters.material,
    });

    return {
      ...baseData,
      shape: this.shape,
      headType: parameters.headType,
      designPressure: parameters.designPressure,
      designTemperature: parameters.designTemperature,
      volume: parameters.volume,
      insulated: parameters.insulated,
      jacketed: parameters.jacketed,
    } as IVesselSymbolData;
  }

  /**
   * Render vessel SVG
   */
  protected renderVesselSVG(
    width: number,
    height: number,
    shape: VesselShape,
    headType?: VesselHeadType,
    insulated = false,
    jacketed = false
  ): JSX.Element {
    switch (shape) {
      case VesselShape.CYLINDRICAL_VERTICAL:
        return this.renderCylindricalVertical(width, height, headType, insulated, jacketed);
      case VesselShape.CYLINDRICAL_HORIZONTAL:
        return this.renderCylindricalHorizontal(width, height, headType, insulated, jacketed);
      case VesselShape.SPHERICAL:
        return this.renderSpherical(width, height, insulated, jacketed);
      case VesselShape.RECTANGULAR:
        return this.renderRectangular(width, height, insulated, jacketed);
      default:
        return this.renderCylindricalVertical(width, height, headType, insulated, jacketed);
    }
  }

  /**
   * Render vertical cylindrical vessel
   */
  private renderCylindricalVertical(
    width: number,
    height: number,
    headType: VesselHeadType = VesselHeadType.ELLIPTICAL,
    insulated: boolean,
    jacketed: boolean
  ): JSX.Element {
    const bodyHeight = height * 0.7;
    const headHeight = height * 0.15;

    return (
      <g>
        {/* Bottom head */}
        {this.renderHead(width, bodyHeight + headHeight, headType, 'bottom')}

        {/* Vessel body */}
        <rect
          x={0}
          y={headHeight}
          width={width}
          height={bodyHeight}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Top head */}
        {this.renderHead(width, 0, headType, 'top')}

        {/* Insulation */}
        {insulated && this.renderInsulation(width, height)}

        {/* Jacket */}
        {jacketed && this.renderJacket(width, height)}
      </g>
    );
  }

  /**
   * Render horizontal cylindrical vessel
   */
  private renderCylindricalHorizontal(
    width: number,
    height: number,
    headType: VesselHeadType = VesselHeadType.ELLIPTICAL,
    insulated: boolean,
    jacketed: boolean
  ): JSX.Element {
    const bodyWidth = width * 0.7;
    const headWidth = width * 0.15;

    return (
      <g>
        {/* Left head */}
        {this.renderHead(height, 0, headType, 'left', true)}

        {/* Vessel body */}
        <rect
          x={headWidth}
          y={0}
          width={bodyWidth}
          height={height}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Right head */}
        {this.renderHead(height, bodyWidth + headWidth, headType, 'right', true)}

        {/* Insulation */}
        {insulated && this.renderInsulation(width, height)}

        {/* Jacket */}
        {jacketed && this.renderJacket(width, height)}
      </g>
    );
  }

  /**
   * Render spherical vessel
   */
  private renderSpherical(
    width: number,
    height: number,
    insulated: boolean,
    jacketed: boolean
  ): JSX.Element {
    const radius = Math.min(width, height) / 2;
    const cx = width / 2;
    const cy = height / 2;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {insulated && (
          <circle
            cx={cx}
            cy={cy}
            r={radius + 5}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {jacketed && (
          <circle
            cx={cx}
            cy={cy}
            r={radius + 10}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          />
        )}
      </g>
    );
  }

  /**
   * Render rectangular vessel
   */
  private renderRectangular(
    width: number,
    height: number,
    insulated: boolean,
    jacketed: boolean
  ): JSX.Element {
    return (
      <g>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {insulated && this.renderInsulation(width, height)}

        {jacketed && this.renderJacket(width, height)}
      </g>
    );
  }

  /**
   * Render vessel head (elliptical, hemispherical, etc.)
   */
  private renderHead(
    size: number,
    position: number,
    type: VesselHeadType,
    orientation: 'top' | 'bottom' | 'left' | 'right',
    _horizontal = false
  ): JSX.Element {
    const isVertical = orientation === 'top' || orientation === 'bottom';

    switch (type) {
      case VesselHeadType.FLAT:
        return isVertical ? (
          <line
            x1={0}
            y1={position}
            x2={size}
            y2={position}
            stroke="currentColor"
            strokeWidth={2}
          />
        ) : (
          <line
            x1={position}
            y1={0}
            x2={position}
            y2={size}
            stroke="currentColor"
            strokeWidth={2}
          />
        );

      case VesselHeadType.ELLIPTICAL:
      case VesselHeadType.TORISPHERICAL:
        if (isVertical) {
          const ry = size * 0.15;
          const rx = size / 2;
          const cy = orientation === 'top' ? position + ry : position - ry;
          return (
            <ellipse
              cx={size / 2}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.1}
            />
          );
        } else {
          const rx = size * 0.15;
          const ry = size / 2;
          const cx = orientation === 'left' ? position + rx : position - rx;
          return (
            <ellipse
              cx={cx}
              cy={size / 2}
              rx={rx}
              ry={ry}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.1}
            />
          );
        }

      case VesselHeadType.HEMISPHERICAL:
        const radius = size / 2;
        if (isVertical) {
          return (
            <path
              d={`M 0,${position} A ${radius},${radius} 0 0 ${orientation === 'top' ? 0 : 1} ${size},${position}`}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.1}
            />
          );
        } else {
          return (
            <path
              d={`M ${position},0 A ${radius},${radius} 0 0 ${orientation === 'left' ? 1 : 0} ${position},${size}`}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.1}
            />
          );
        }

      case VesselHeadType.CONICAL:
        if (isVertical) {
          const tipOffset = size * 0.1;
          return (
            <path
              d={orientation === 'top'
                ? `M 0,${position} L ${size / 2},${position - tipOffset} L ${size},${position}`
                : `M 0,${position} L ${size / 2},${position + tipOffset} L ${size},${position}`
              }
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.1}
            />
          );
        } else {
          const tipOffset = size * 0.1;
          return (
            <path
              d={orientation === 'left'
                ? `M ${position},0 L ${position - tipOffset},${size / 2} L ${position},${size}`
                : `M ${position},0 L ${position + tipOffset},${size / 2} L ${position},${size}`
              }
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.1}
            />
          );
        }

      default:
        return <g />;
    }
  }

  /**
   * Render insulation layer
   */
  private renderInsulation(width: number, height: number): JSX.Element {
    return (
      <rect
        x={-5}
        y={-5}
        width={width + 10}
        height={height + 10}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
    );
  }

  /**
   * Render jacket layer
   */
  private renderJacket(width: number, height: number): JSX.Element {
    return (
      <rect
        x={-10}
        y={-10}
        width={width + 20}
        height={height + 20}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      />
    );
  }
}

/**
 * Factory for creating vessel symbols
 */
export class VesselSymbolFactory {
  /**
   * Create atmospheric storage tank
   */
  static createAtmosphericTank(parameters: Parameters<VesselSymbolBase['generate']>[0]): IVesselSymbolData {
    const vessel = new VesselSymbolBase(VesselShape.CYLINDRICAL_VERTICAL, {
      ...VESSEL_BASE_CONFIG,
      variants: ['atmospheric'],
    });
    return vessel.generate({
      ...parameters,
      variant: 'atmospheric',
      headType: VesselHeadType.FLAT,
      designPressure: 1.01325, // atmospheric
    });
  }

  /**
   * Create pressurized vessel
   */
  static createPressureVessel(parameters: Parameters<VesselSymbolBase['generate']>[0]): IVesselSymbolData {
    const vessel = new VesselSymbolBase(VesselShape.CYLINDRICAL_VERTICAL, {
      ...VESSEL_BASE_CONFIG,
      variants: ['pressurized'],
    });
    return vessel.generate({
      ...parameters,
      variant: 'pressurized',
      headType: VesselHeadType.ELLIPTICAL,
      designPressure: parameters.designPressure || 10,
    });
  }

  /**
   * Create spherical storage
   */
  static createSphericalStorage(parameters: Parameters<VesselSymbolBase['generate']>[0]): IVesselSymbolData {
    const vessel = new VesselSymbolBase(VesselShape.SPHERICAL, {
      ...VESSEL_BASE_CONFIG,
      aspectRatio: 1.0, // equal width/height
    });
    return vessel.generate({
      ...parameters,
      variant: 'spherical',
      designPressure: parameters.designPressure || 5,
    });
  }

  /**
   * Create horizontal vessel
   */
  static createHorizontalVessel(parameters: Parameters<VesselSymbolBase['generate']>[0]): IVesselSymbolData {
    const vessel = new VesselSymbolBase(VesselShape.CYLINDRICAL_HORIZONTAL, {
      ...VESSEL_BASE_CONFIG,
      aspectRatio: 2.0, // width/height for horizontal
    });
    return vessel.generate({
      ...parameters,
      variant: 'horizontal',
      headType: VesselHeadType.ELLIPTICAL,
    });
  }
}

export default VesselSymbolBase;
