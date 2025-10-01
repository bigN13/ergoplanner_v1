import React from 'react';
import { ParametricSymbolGenerator, type IParametricConfig } from '../../ParametricSymbolGenerator';
import { ConnectionType, type ISymbolBaseData } from '../../SymbolBase';

/**
 * Compressor types
 */
export enum CompressorType {
  CENTRIFUGAL = 'centrifugal',
  AXIAL = 'axial',
  RECIPROCATING = 'reciprocating',
  ROTARY_SCREW = 'rotary-screw',
  SCROLL = 'scroll',
  VANE = 'vane',
}

/**
 * Compressor symbol metadata
 */
export interface ICompressorMetadata extends ISymbolBaseData {
  compressorType: CompressorType;
  flowRate?: number; // m³/min
  dischargePressure?: number; // bar
  power?: number; // kW
  stages?: number;
  coolingType?: 'air' | 'water' | 'none';
}

/**
 * Compressor symbol data (for compatibility)
 */
export type ICompressorSymbolData = ICompressorMetadata;

/**
 * Base configuration for compressor symbols
 */
export const COMPRESSOR_BASE_CONFIG: IParametricConfig = {
  baseWidth: 90,
  baseHeight: 90,
  minWidth: 50,
  maxWidth: 250,
  minHeight: 50,
  maxHeight: 250,
  aspectRatio: 1.0,
  capacityMin: 1,
  capacityMax: 5000,
  capacityUnit: 'm³/min',
  capacityToSizeRatio: 0.02,
  connectionRules: [
    {
      type: ConnectionType.INLET,
      count: 1,
      position: 'left',
      required: true,
    },
    {
      type: ConnectionType.OUTLET,
      count: 1,
      position: 'right',
      required: true,
    },
    {
      type: ConnectionType.INSTRUMENTATION,
      count: 3,
      position: 'top',
    },
  ],
  materials: [
    {
      id: 'carbon_steel',
      name: 'Carbon Steel',
      properties: {
        density: 7850,
        maxPressure: 100,
        maxTemperature: 400,
        cost: 1.0,
      },
      visual: {
        color: '#6B7280',
      },
    },
    {
      id: 'stainless_steel',
      name: 'Stainless Steel',
      properties: {
        density: 8000,
        maxPressure: 200,
        maxTemperature: 600,
        cost: 2.5,
      },
      visual: {
        color: '#D1D5DB',
      },
    },
  ],
  variants: [
    'single-stage',
    'multi-stage',
    'oil-free',
    'oil-flooded',
  ],
  performanceClass: 'medium',
  maxInstances: 1000,
};

/**
 * Base class for compressor symbols with parametric generation
 */
export class CompressorSymbolBase {
  protected generator: ParametricSymbolGenerator<ICompressorSymbolData>;
  protected compressorType: CompressorType;

  constructor(compressorType: CompressorType, config?: Partial<IParametricConfig>) {
    this.compressorType = compressorType;
    this.generator = new ParametricSymbolGenerator<ICompressorSymbolData>({
      ...COMPRESSOR_BASE_CONFIG,
      ...config,
    });
  }

  /**
   * Generate compressor symbol with parameters
   */
  public generate(parameters: {
    flowRate?: number;
    dischargePressure?: number;
    power?: number;
    width?: number;
    height?: number;
    variant?: string;
    material?: string;
    stages?: number;
    coolingType?: 'air' | 'water' | 'none';
  }): ICompressorSymbolData {
    const baseData = this.generator.generate({
      capacity: parameters.flowRate,
      width: parameters.width,
      height: parameters.height,
      variant: parameters.variant,
      material: parameters.material,
    });

    return {
      ...baseData,
      compressorType: this.compressorType,
      flowRate: parameters.flowRate,
      dischargePressure: parameters.dischargePressure,
      power: parameters.power,
      stages: parameters.stages,
      coolingType: parameters.coolingType,
    } as ICompressorSymbolData;
  }

  /**
   * Render compressor SVG
   */
  protected renderCompressorSVG(
    width: number,
    height: number,
    compressorType: CompressorType,
    stages = 1,
    coolingType?: 'air' | 'water' | 'none'
  ): JSX.Element {
    switch (compressorType) {
      case CompressorType.CENTRIFUGAL:
        return this.renderCentrifugal(width, height, stages, coolingType);
      case CompressorType.AXIAL:
        return this.renderAxial(width, height, stages, coolingType);
      case CompressorType.RECIPROCATING:
        return this.renderReciprocating(width, height, stages, coolingType);
      case CompressorType.ROTARY_SCREW:
        return this.renderRotaryScrew(width, height, coolingType);
      case CompressorType.SCROLL:
        return this.renderScroll(width, height, coolingType);
      case CompressorType.VANE:
        return this.renderVane(width, height, coolingType);
      default:
        return this.renderCentrifugal(width, height, stages, coolingType);
    }
  }

  /**
   * Render centrifugal compressor
   */
  private renderCentrifugal(
    width: number,
    height: number,
    stages: number,
    coolingType?: 'air' | 'water' | 'none'
  ): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2;

    return (
      <g>
        {/* Main casing */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Impeller(s) */}
        {Array.from({ length: stages }).map((_, i) => {
          const stageRadius = radius * (0.3 + (i * 0.2) / stages);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={stageRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          );
        })}

        {/* Diffuser vanes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * radius * 0.6;
          const y1 = cy + Math.sin(rad) * radius * 0.6;
          const x2 = cx + Math.cos(rad) * radius * 0.9;
          const y2 = cy + Math.sin(rad) * radius * 0.9;
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Shaft */}
        <circle cx={cx} cy={cy} r={radius * 0.15} fill="currentColor" />

        {/* Cooling */}
        {coolingType && coolingType !== 'none' && this.renderCooling(width, height, coolingType)}
      </g>
    );
  }

  /**
   * Render axial compressor
   */
  private renderAxial(
    width: number,
    height: number,
    stages: number,
    coolingType?: 'air' | 'water' | 'none'
  ): JSX.Element {
    const stageWidth = width / (stages + 2);

    return (
      <g>
        {/* Casing */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2}
          ry={height / 3}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Stages */}
        {Array.from({ length: stages }).map((_, i) => {
          const x = stageWidth * (i + 1.5);
          return (
            <g key={i}>
              {/* Rotor blades */}
              <line
                x1={x}
                y1={height * 0.2}
                x2={x}
                y2={height * 0.8}
                stroke="currentColor"
                strokeWidth={2}
              />
              {/* Stator blades */}
              <line
                x1={x + stageWidth / 2}
                y1={height * 0.25}
                x2={x + stageWidth / 2}
                y2={height * 0.75}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="3,3"
              />
            </g>
          );
        })}

        {/* Shaft */}
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={3}
        />

        {coolingType && coolingType !== 'none' && this.renderCooling(width, height, coolingType)}
      </g>
    );
  }

  /**
   * Render reciprocating compressor
   */
  private renderReciprocating(
    width: number,
    height: number,
    stages: number,
    coolingType?: 'air' | 'water' | 'none'
  ): JSX.Element {
    const cylinderWidth = width / Math.max(stages, 1);

    return (
      <g>
        {Array.from({ length: stages }).map((_, i) => {
          const x = i * cylinderWidth;
          return (
            <g key={i}>
              {/* Cylinder */}
              <rect
                x={x + cylinderWidth * 0.1}
                y={height * 0.1}
                width={cylinderWidth * 0.8}
                height={height * 0.6}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={2}
                opacity={0.1}
              />

              {/* Piston */}
              <rect
                x={x + cylinderWidth * 0.15}
                y={height * 0.35}
                width={cylinderWidth * 0.7}
                height={height * 0.2}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={2}
              />

              {/* Piston rod */}
              <line
                x1={x + cylinderWidth / 2}
                y1={height * 0.55}
                x2={x + cylinderWidth / 2}
                y2={height * 0.9}
                stroke="currentColor"
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* Crankshaft */}
        <line
          x1={0}
          y1={height * 0.9}
          x2={width}
          y2={height * 0.9}
          stroke="currentColor"
          strokeWidth={3}
        />

        {coolingType && coolingType !== 'none' && this.renderCooling(width, height, coolingType)}
      </g>
    );
  }

  /**
   * Render rotary screw compressor
   */
  private renderRotaryScrew(
    width: number,
    height: number,
    coolingType?: 'air' | 'water' | 'none'
  ): JSX.Element {
    return (
      <g>
        {/* Housing */}
        <rect
          x={width * 0.1}
          y={height * 0.2}
          width={width * 0.8}
          height={height * 0.6}
          rx={10}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Male rotor */}
        <ellipse
          cx={width * 0.4}
          cy={height / 2}
          rx={width * 0.15}
          ry={height * 0.25}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Female rotor */}
        <ellipse
          cx={width * 0.6}
          cy={height / 2}
          rx={width * 0.15}
          ry={height * 0.25}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Rotor threads */}
        <path
          d={`M ${width * 0.3},${height * 0.35} Q ${width * 0.4},${height * 0.5} ${width * 0.5},${height * 0.35}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
        <path
          d={`M ${width * 0.5},${height * 0.65} Q ${width * 0.6},${height * 0.5} ${width * 0.7},${height * 0.65}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />

        {coolingType && coolingType !== 'none' && this.renderCooling(width, height, coolingType)}
      </g>
    );
  }

  /**
   * Render scroll compressor
   */
  private renderScroll(
    width: number,
    height: number,
    coolingType?: 'air' | 'water' | 'none'
  ): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2;

    return (
      <g>
        {/* Outer casing */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Fixed scroll */}
        <path
          d={`M ${cx},${cy - radius * 0.5}
             A ${radius * 0.5},${radius * 0.5} 0 0 1 ${cx + radius * 0.5},${cy}
             A ${radius * 0.3},${radius * 0.3} 0 0 0 ${cx},${cy + radius * 0.3}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Orbiting scroll */}
        <path
          d={`M ${cx + radius * 0.2},${cy - radius * 0.4}
             A ${radius * 0.4},${radius * 0.4} 0 0 1 ${cx + radius * 0.4},${cy + radius * 0.2}
             A ${radius * 0.2},${radius * 0.2} 0 0 0 ${cx},${cy + radius * 0.2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="3,3"
        />

        {coolingType && coolingType !== 'none' && this.renderCooling(width, height, coolingType)}
      </g>
    );
  }

  /**
   * Render vane compressor
   */
  private renderVane(
    width: number,
    height: number,
    coolingType?: 'air' | 'water' | 'none'
  ): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2;
    const rotorRadius = radius * 0.6;
    const vaneCount = 6;

    return (
      <g>
        {/* Stator */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Rotor (eccentric) */}
        <circle
          cx={cx + radius * 0.2}
          cy={cy}
          r={rotorRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Vanes */}
        {Array.from({ length: vaneCount }).map((_, i) => {
          const angle = (i * 360) / vaneCount;
          const rad = (angle * Math.PI) / 180;
          const rotorX = cx + radius * 0.2;
          const x1 = rotorX + Math.cos(rad) * rotorRadius * 0.5;
          const y1 = cy + Math.sin(rad) * rotorRadius * 0.5;
          const x2 = rotorX + Math.cos(rad) * radius;
          const y2 = cy + Math.sin(rad) * radius;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={2}
            />
          );
        })}

        {coolingType && coolingType !== 'none' && this.renderCooling(width, height, coolingType)}
      </g>
    );
  }

  /**
   * Render cooling system
   */
  private renderCooling(width: number, height: number, coolingType: 'air' | 'water'): JSX.Element {
    return (
      <g>
        {/* Cooling jacket */}
        <rect
          x={-5}
          y={-5}
          width={width + 10}
          height={height + 10}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.5}
        />

        {/* Cooling type indicator */}
        <text
          x={width - 10}
          y={height - 10}
          fontSize="10"
          fill="currentColor"
          opacity={0.7}
        >
          {coolingType === 'air' ? 'AC' : 'WC'}
        </text>
      </g>
    );
  }
}

/**
 * Factory for creating compressor symbols
 */
export class CompressorSymbolFactory {
  /**
   * Create centrifugal compressor
   */
  static createCentrifugalCompressor(
    parameters: Parameters<CompressorSymbolBase['generate']>[0]
  ): ICompressorSymbolData {
    const compressor = new CompressorSymbolBase(CompressorType.CENTRIFUGAL);
    return compressor.generate({
      ...parameters,
      variant: 'multi-stage',
      stages: parameters.stages || 3,
    });
  }

  /**
   * Create axial compressor
   */
  static createAxialCompressor(
    parameters: Parameters<CompressorSymbolBase['generate']>[0]
  ): ICompressorSymbolData {
    const compressor = new CompressorSymbolBase(CompressorType.AXIAL);
    return compressor.generate({
      ...parameters,
      stages: parameters.stages || 5,
    });
  }

  /**
   * Create reciprocating compressor
   */
  static createReciprocatingCompressor(
    parameters: Parameters<CompressorSymbolBase['generate']>[0]
  ): ICompressorSymbolData {
    const compressor = new CompressorSymbolBase(CompressorType.RECIPROCATING);
    return compressor.generate({
      ...parameters,
      stages: parameters.stages || 2,
    });
  }

  /**
   * Create rotary screw compressor
   */
  static createRotaryScrewCompressor(
    parameters: Parameters<CompressorSymbolBase['generate']>[0]
  ): ICompressorSymbolData {
    const compressor = new CompressorSymbolBase(CompressorType.ROTARY_SCREW);
    return compressor.generate(parameters);
  }

  /**
   * Create scroll compressor
   */
  static createScrollCompressor(
    parameters: Parameters<CompressorSymbolBase['generate']>[0]
  ): ICompressorSymbolData {
    const compressor = new CompressorSymbolBase(CompressorType.SCROLL);
    return compressor.generate(parameters);
  }
}

export default CompressorSymbolBase;
