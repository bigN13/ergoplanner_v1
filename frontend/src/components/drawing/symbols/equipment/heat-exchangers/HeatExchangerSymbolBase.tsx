import React from 'react';
import { ParametricSymbolGenerator, type IParametricConfig } from '../../ParametricSymbolGenerator';
import { ConnectionType, type ISymbolBaseData } from '../../SymbolBase';

/**
 * Heat exchanger types (TEMA standards)
 */
export enum HeatExchangerType {
  SHELL_AND_TUBE = 'shell-and-tube',
  PLATE = 'plate',
  PLATE_FIN = 'plate-fin',
  AIR_COOLED = 'air-cooled',
  DOUBLE_PIPE = 'double-pipe',
  SPIRAL = 'spiral',
  BRAZED_PLATE = 'brazed-plate',
}

/**
 * TEMA shell types
 */
export enum TEMAShellType {
  E = 'E', // One-pass shell
  F = 'F', // Two-pass shell with longitudinal baffle
  G = 'G', // Split flow
  H = 'H', // Double split flow
  J = 'J', // Divided flow
  K = 'K', // Kettle reboiler
  X = 'X', // Cross flow
}

/**
 * Flow arrangement
 */
export enum FlowArrangement {
  COUNTER_FLOW = 'counter-flow',
  PARALLEL_FLOW = 'parallel-flow',
  CROSS_FLOW = 'cross-flow',
}

/**
 * Heat exchanger metadata
 */
export interface IHeatExchangerMetadata extends ISymbolBaseData {
  heatExchangerType: HeatExchangerType;
  shellType?: TEMAShellType;
  flowArrangement?: FlowArrangement;
  heatTransferArea?: number; // m²
  uValue?: number; // W/m²·K
  hotSideFluid?: string;
  coldSideFluid?: string;
  maxPressure?: number; // bar
  maxTemperature?: number; // °C
  tubeCount?: number;
  passes?: number;
}

/**
 * Heat exchanger symbol data (for compatibility)
 */
export type IHeatExchangerSymbolData = IHeatExchangerMetadata;

/**
 * Base configuration for heat exchanger symbols
 */
export const HEAT_EXCHANGER_BASE_CONFIG: IParametricConfig = {
  baseWidth: 120,
  baseHeight: 80,
  minWidth: 60,
  maxWidth: 300,
  minHeight: 40,
  maxHeight: 200,
  aspectRatio: 1.5, // width/height
  capacityMin: 10,
  capacityMax: 10000,
  capacityUnit: 'm²',
  capacityToSizeRatio: 0.05,
  connectionRules: [
    {
      type: ConnectionType.INLET,
      count: 2, // Hot and cold inlets
      position: 'left',
      required: true,
    },
    {
      type: ConnectionType.OUTLET,
      count: 2, // Hot and cold outlets
      position: 'right',
      required: true,
    },
    {
      type: ConnectionType.INSTRUMENTATION,
      count: 2,
      position: 'top',
    },
  ],
  materials: [
    {
      id: 'carbon_steel_tubes',
      name: 'Carbon Steel Tubes',
      properties: {
        density: 7850,
        maxPressure: 40,
        maxTemperature: 400,
        cost: 1.0,
      },
      visual: {
        color: '#6B7280',
      },
    },
    {
      id: 'stainless_steel_316',
      name: 'Stainless Steel 316',
      properties: {
        density: 8000,
        maxPressure: 100,
        maxTemperature: 600,
        cost: 3.0,
      },
      visual: {
        color: '#D1D5DB',
      },
    },
    {
      id: 'titanium',
      name: 'Titanium',
      properties: {
        density: 4500,
        maxPressure: 100,
        maxTemperature: 400,
        cost: 8.0,
      },
      visual: {
        color: '#C0C0C0',
      },
    },
  ],
  variants: [
    'fixed-tubesheet',
    'floating-head',
    'u-tube',
    'kettle-reboiler',
  ],
  performanceClass: 'medium',
  maxInstances: 1000,
};

/**
 * Base class for heat exchanger symbols
 */
export class HeatExchangerSymbolBase {
  protected generator: ParametricSymbolGenerator<IHeatExchangerSymbolData>;
  protected heatExchangerType: HeatExchangerType;

  constructor(heatExchangerType: HeatExchangerType, config?: Partial<IParametricConfig>) {
    this.heatExchangerType = heatExchangerType;
    this.generator = new ParametricSymbolGenerator<IHeatExchangerSymbolData>({
      ...HEAT_EXCHANGER_BASE_CONFIG,
      ...config,
    });
  }

  /**
   * Generate heat exchanger symbol
   */
  public generate(parameters: {
    heatTransferArea?: number;
    width?: number;
    height?: number;
    variant?: string;
    material?: string;
    shellType?: TEMAShellType;
    flowArrangement?: FlowArrangement;
    uValue?: number;
    hotSideFluid?: string;
    coldSideFluid?: string;
    maxPressure?: number;
    maxTemperature?: number;
    tubeCount?: number;
    passes?: number;
  }): IHeatExchangerSymbolData {
    const baseData = this.generator.generate({
      capacity: parameters.heatTransferArea,
      width: parameters.width,
      height: parameters.height,
      variant: parameters.variant,
      material: parameters.material,
    });

    return {
      ...baseData,
      heatExchangerType: this.heatExchangerType,
      shellType: parameters.shellType,
      flowArrangement: parameters.flowArrangement,
      heatTransferArea: parameters.heatTransferArea,
      uValue: parameters.uValue,
      hotSideFluid: parameters.hotSideFluid,
      coldSideFluid: parameters.coldSideFluid,
      maxPressure: parameters.maxPressure,
      maxTemperature: parameters.maxTemperature,
      tubeCount: parameters.tubeCount,
      passes: parameters.passes,
    } as IHeatExchangerSymbolData;
  }

  /**
   * Render heat exchanger SVG
   */
  protected renderHeatExchangerSVG(
    width: number,
    height: number,
    type: HeatExchangerType,
    flowArrangement: FlowArrangement = FlowArrangement.COUNTER_FLOW,
    passes = 1
  ): JSX.Element {
    switch (type) {
      case HeatExchangerType.SHELL_AND_TUBE:
        return this.renderShellAndTube(width, height, flowArrangement, passes);
      case HeatExchangerType.PLATE:
        return this.renderPlate(width, height, flowArrangement);
      case HeatExchangerType.PLATE_FIN:
        return this.renderPlateFin(width, height, flowArrangement);
      case HeatExchangerType.AIR_COOLED:
        return this.renderAirCooled(width, height);
      case HeatExchangerType.DOUBLE_PIPE:
        return this.renderDoublePipe(width, height, flowArrangement);
      case HeatExchangerType.SPIRAL:
        return this.renderSpiral(width, height);
      case HeatExchangerType.BRAZED_PLATE:
        return this.renderBrazedPlate(width, height);
      default:
        return this.renderShellAndTube(width, height, flowArrangement, passes);
    }
  }

  /**
   * Render shell and tube heat exchanger
   */
  private renderShellAndTube(
    width: number,
    height: number,
    flowArrangement: FlowArrangement,
    passes: number
  ): JSX.Element {
    const tubeCount = Math.floor(height / 8);

    return (
      <g>
        {/* Shell */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={height / 4}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Tubes */}
        {Array.from({ length: tubeCount }).map((_, i) => {
          const y = (height / (tubeCount + 1)) * (i + 1);
          return (
            <line
              key={i}
              x1={width * 0.1}
              y1={y}
              x2={width * 0.9}
              y2={y}
              stroke="currentColor"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Baffles */}
        {passes > 1 &&
          Array.from({ length: passes - 1 }).map((_, i) => {
            const x = width * ((i + 1) / passes);
            return (
              <line
                key={i}
                x1={x}
                y1={height * 0.2}
                x2={x}
                y2={height * 0.8}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="3,3"
              />
            );
          })}

        {/* Flow direction arrows */}
        {this.renderFlowArrows(width, height, flowArrangement)}
      </g>
    );
  }

  /**
   * Render plate heat exchanger
   */
  private renderPlate(
    width: number,
    height: number,
    flowArrangement: FlowArrangement
  ): JSX.Element {
    const plateCount = 8;
    const plateSpacing = width / (plateCount + 1);

    return (
      <g>
        {/* Frame */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.05}
        />

        {/* Plates */}
        {Array.from({ length: plateCount }).map((_, i) => {
          const x = plateSpacing * (i + 1);
          return (
            <line
              key={i}
              x1={x}
              y1={height * 0.1}
              x2={x}
              y2={height * 0.9}
              stroke="currentColor"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Port connections */}
        <circle cx={width * 0.1} cy={height * 0.2} r={5} fill="currentColor" />
        <circle cx={width * 0.1} cy={height * 0.8} r={5} fill="currentColor" />
        <circle cx={width * 0.9} cy={height * 0.2} r={5} fill="currentColor" />
        <circle cx={width * 0.9} cy={height * 0.8} r={5} fill="currentColor" />

        {this.renderFlowArrows(width, height, flowArrangement)}
      </g>
    );
  }

  /**
   * Render plate-fin heat exchanger
   */
  private renderPlateFin(
    width: number,
    height: number,
    flowArrangement: FlowArrangement
  ): JSX.Element {
    return (
      <g>
        {/* Core */}
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

        {/* Horizontal plates */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = (height / 6) * (i + 1);
          return (
            <line
              key={`h-${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
            />
          );
        })}

        {/* Vertical fins */}
        {Array.from({ length: 15 }).map((_, i) => {
          const x = (width / 16) * (i + 1);
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.5}
            />
          );
        })}

        {this.renderFlowArrows(width, height, flowArrangement)}
      </g>
    );
  }

  /**
   * Render air-cooled heat exchanger
   */
  private renderAirCooled(width: number, height: number): JSX.Element {
    return (
      <g>
        {/* Tube bundle */}
        <rect
          x={0}
          y={height * 0.3}
          width={width}
          height={height * 0.4}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Tubes */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = height * 0.3 + (height * 0.4) / 7 * (i + 1);
          return (
            <line
              key={i}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="currentColor"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Fins */}
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (width / 21) * (i + 1);
          return (
            <line
              key={i}
              x1={x}
              y1={height * 0.2}
              x2={x}
              y2={height * 0.8}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.5}
            />
          );
        })}

        {/* Fan */}
        <circle
          cx={width / 2}
          cy={height * 0.1}
          r={height * 0.08}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const r = height * 0.08;
          const x = width / 2 + Math.cos(rad) * r * 0.7;
          const y = height * 0.1 + Math.sin(rad) * r * 0.7;
          return (
            <line
              key={angle}
              x1={width / 2}
              y1={height * 0.1}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
            />
          );
        })}
      </g>
    );
  }

  /**
   * Render double-pipe heat exchanger
   */
  private renderDoublePipe(
    width: number,
    height: number,
    flowArrangement: FlowArrangement
  ): JSX.Element {
    return (
      <g>
        {/* Outer pipe */}
        <rect
          x={0}
          y={height * 0.2}
          width={width}
          height={height * 0.6}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Inner pipe */}
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={3}
        />

        {this.renderFlowArrows(width, height, flowArrangement)}
      </g>
    );
  }

  /**
   * Render spiral heat exchanger
   */
  private renderSpiral(width: number, height: number): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    const turns = 3;

    return (
      <g>
        {/* Spiral path */}
        {Array.from({ length: turns }).map((_, i) => {
          const radius = maxRadius * ((i + 1) / turns);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          );
        })}

        {/* Housing */}
        <circle
          cx={cx}
          cy={cy}
          r={maxRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.3}
        />
      </g>
    );
  }

  /**
   * Render brazed plate heat exchanger
   */
  private renderBrazedPlate(width: number, height: number): JSX.Element {
    const plateCount = 6;
    const plateSpacing = width / (plateCount + 1);

    return (
      <g>
        {/* Compact frame */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={5}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Brazed plates */}
        {Array.from({ length: plateCount }).map((_, i) => {
          const x = plateSpacing * (i + 1);
          return (
            <line
              key={i}
              x1={x}
              y1={height * 0.15}
              x2={x}
              y2={height * 0.85}
              stroke="currentColor"
              strokeWidth={2}
            />
          );
        })}

        {/* Brazing indicators */}
        {Array.from({ length: plateCount - 1 }).map((_, i) => {
          const x = plateSpacing * (i + 1.5);
          return (
            <React.Fragment key={i}>
              <circle cx={x} cy={height * 0.2} r={2} fill="currentColor" opacity={0.7} />
              <circle cx={x} cy={height * 0.8} r={2} fill="currentColor" opacity={0.7} />
            </React.Fragment>
          );
        })}
      </g>
    );
  }

  /**
   * Render flow direction arrows
   */
  private renderFlowArrows(
    width: number,
    height: number,
    arrangement: FlowArrangement
  ): JSX.Element {
    switch (arrangement) {
      case FlowArrangement.COUNTER_FLOW:
        return (
          <g>
            {/* Hot side (left to right, top) */}
            <path
              d={`M ${width * 0.2},${height * 0.25} L ${width * 0.8},${height * 0.25} L ${width * 0.75},${height * 0.2} M ${width * 0.8},${height * 0.25} L ${width * 0.75},${height * 0.3}`}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              opacity={0.6}
            />
            {/* Cold side (right to left, bottom) */}
            <path
              d={`M ${width * 0.8},${height * 0.75} L ${width * 0.2},${height * 0.75} L ${width * 0.25},${height * 0.7} M ${width * 0.2},${height * 0.75} L ${width * 0.25},${height * 0.8}`}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              opacity={0.6}
            />
          </g>
        );

      case FlowArrangement.PARALLEL_FLOW:
        return (
          <g>
            {/* Hot side (left to right, top) */}
            <path
              d={`M ${width * 0.2},${height * 0.25} L ${width * 0.8},${height * 0.25} L ${width * 0.75},${height * 0.2} M ${width * 0.8},${height * 0.25} L ${width * 0.75},${height * 0.3}`}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              opacity={0.6}
            />
            {/* Cold side (left to right, bottom) */}
            <path
              d={`M ${width * 0.2},${height * 0.75} L ${width * 0.8},${height * 0.75} L ${width * 0.75},${height * 0.7} M ${width * 0.8},${height * 0.75} L ${width * 0.75},${height * 0.8}`}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              opacity={0.6}
            />
          </g>
        );

      case FlowArrangement.CROSS_FLOW:
        return (
          <g>
            {/* Hot side (left to right) */}
            <path
              d={`M ${width * 0.1},${height / 2} L ${width * 0.9},${height / 2} L ${width * 0.85},${height / 2 - 5} M ${width * 0.9},${height / 2} L ${width * 0.85},${height / 2 + 5}`}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              opacity={0.6}
            />
            {/* Cold side (bottom to top) */}
            <path
              d={`M ${width / 2},${height * 0.9} L ${width / 2},${height * 0.1} L ${width / 2 - 5},${height * 0.15} M ${width / 2},${height * 0.1} L ${width / 2 + 5},${height * 0.15}`}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              opacity={0.6}
            />
          </g>
        );

      default:
        return <g />;
    }
  }
}

/**
 * Factory for creating heat exchanger symbols
 */
export class HeatExchangerSymbolFactory {
  /**
   * Create shell and tube heat exchanger
   */
  static createShellAndTube(
    parameters: Parameters<HeatExchangerSymbolBase['generate']>[0]
  ): IHeatExchangerSymbolData {
    const hx = new HeatExchangerSymbolBase(HeatExchangerType.SHELL_AND_TUBE);
    return hx.generate({
      ...parameters,
      variant: 'fixed-tubesheet',
      shellType: TEMAShellType.E,
      flowArrangement: FlowArrangement.COUNTER_FLOW,
    });
  }

  /**
   * Create plate heat exchanger
   */
  static createPlateHeatExchanger(
    parameters: Parameters<HeatExchangerSymbolBase['generate']>[0]
  ): IHeatExchangerSymbolData {
    const hx = new HeatExchangerSymbolBase(HeatExchangerType.PLATE);
    return hx.generate({
      ...parameters,
      flowArrangement: FlowArrangement.COUNTER_FLOW,
    });
  }

  /**
   * Create air-cooled heat exchanger
   */
  static createAirCooled(
    parameters: Parameters<HeatExchangerSymbolBase['generate']>[0]
  ): IHeatExchangerSymbolData {
    const hx = new HeatExchangerSymbolBase(HeatExchangerType.AIR_COOLED);
    return hx.generate(parameters);
  }

  /**
   * Create double-pipe heat exchanger
   */
  static createDoublePipe(
    parameters: Parameters<HeatExchangerSymbolBase['generate']>[0]
  ): IHeatExchangerSymbolData {
    const hx = new HeatExchangerSymbolBase(HeatExchangerType.DOUBLE_PIPE);
    return hx.generate({
      ...parameters,
      flowArrangement: FlowArrangement.COUNTER_FLOW,
    });
  }
}

export default HeatExchangerSymbolBase;
