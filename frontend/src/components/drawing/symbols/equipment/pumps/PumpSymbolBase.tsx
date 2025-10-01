import React from 'react';
import { ParametricSymbolGenerator, type IParametricConfig } from '../../ParametricSymbolGenerator';
import { ConnectionType, type ISymbolBaseData } from '../../SymbolBase';

/**
 * Pump types
 */
export enum PumpType {
  CENTRIFUGAL = 'centrifugal',
  POSITIVE_DISPLACEMENT = 'positive-displacement',
  RECIPROCATING = 'reciprocating',
  GEAR = 'gear',
  SCREW = 'screw',
  DIAPHRAGM = 'diaphragm',
  PERISTALTIC = 'peristaltic',
}

/**
 * Pump drive types
 */
export enum PumpDriveType {
  ELECTRIC_MOTOR = 'electric-motor',
  DIESEL_ENGINE = 'diesel-engine',
  STEAM_TURBINE = 'steam-turbine',
  HYDRAULIC = 'hydraulic',
  PNEUMATIC = 'pneumatic',
}

/**
 * Pump symbol metadata
 */
export interface IPumpMetadata extends ISymbolBaseData {
  pumpType: PumpType;
  driveType?: PumpDriveType;
  flowRate?: number; // m³/h
  head?: number; // m
  power?: number; // kW
  speed?: number; // RPM
  efficiency?: number; // %
  sealType?: string;
}

/**
 * Pump symbol data (for compatibility)
 */
export type IPumpSymbolData = IPumpMetadata;

/**
 * Base configuration for pump symbols
 */
export const PUMP_BASE_CONFIG: IParametricConfig = {
  baseWidth: 80,
  baseHeight: 80,
  minWidth: 40,
  maxWidth: 200,
  minHeight: 40,
  maxHeight: 200,
  aspectRatio: 1.0, // Square by default
  capacityMin: 1,
  capacityMax: 10000,
  capacityUnit: 'm³/h',
  capacityToSizeRatio: 0.01,
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
      count: 2,
      position: 'top',
    },
  ],
  materials: [
    {
      id: 'cast_iron',
      name: 'Cast Iron',
      properties: {
        density: 7200,
        maxPressure: 16,
        maxTemperature: 200,
        corrosionResistance: 'Moderate',
        cost: 1.0,
      },
      visual: {
        color: '#6B7280',
        pattern: 'none',
      },
    },
    {
      id: 'stainless_steel_316',
      name: 'Stainless Steel 316',
      properties: {
        density: 8000,
        maxPressure: 40,
        maxTemperature: 400,
        corrosionResistance: 'Excellent',
        cost: 3.0,
      },
      visual: {
        color: '#D1D5DB',
        pattern: 'none',
      },
    },
    {
      id: 'bronze',
      name: 'Bronze',
      properties: {
        density: 8700,
        maxPressure: 25,
        maxTemperature: 250,
        corrosionResistance: 'Good',
        cost: 2.5,
      },
      visual: {
        color: '#D97706',
        pattern: 'none',
      },
    },
  ],
  variants: [
    'single-stage',
    'multi-stage',
    'inline',
    'end-suction',
    'split-case',
  ],
  performanceClass: 'light',
  maxInstances: 2000,
};

/**
 * Base class for pump symbols with parametric generation
 */
export class PumpSymbolBase {
  protected generator: ParametricSymbolGenerator<IPumpSymbolData>;
  protected pumpType: PumpType;

  constructor(pumpType: PumpType, config?: Partial<IParametricConfig>) {
    this.pumpType = pumpType;
    this.generator = new ParametricSymbolGenerator<IPumpSymbolData>({
      ...PUMP_BASE_CONFIG,
      ...config,
    });
  }

  /**
   * Generate pump symbol with parameters
   */
  public generate(parameters: {
    flowRate?: number;
    head?: number;
    power?: number;
    width?: number;
    height?: number;
    variant?: string;
    material?: string;
    driveType?: PumpDriveType;
    speed?: number;
    efficiency?: number;
    sealType?: string;
  }): IPumpSymbolData {
    const baseData = this.generator.generate({
      capacity: parameters.flowRate,
      width: parameters.width,
      height: parameters.height,
      variant: parameters.variant,
      material: parameters.material,
    });

    return {
      ...baseData,
      pumpType: this.pumpType,
      driveType: parameters.driveType,
      flowRate: parameters.flowRate,
      head: parameters.head,
      power: parameters.power,
      speed: parameters.speed,
      efficiency: parameters.efficiency,
      sealType: parameters.sealType,
    } as IPumpSymbolData;
  }

  /**
   * Render pump SVG
   */
  protected renderPumpSVG(
    width: number,
    height: number,
    pumpType: PumpType,
    driveType?: PumpDriveType
  ): JSX.Element {
    switch (pumpType) {
      case PumpType.CENTRIFUGAL:
        return this.renderCentrifugal(width, height, driveType);
      case PumpType.POSITIVE_DISPLACEMENT:
        return this.renderPositiveDisplacement(width, height, driveType);
      case PumpType.RECIPROCATING:
        return this.renderReciprocating(width, height, driveType);
      case PumpType.GEAR:
        return this.renderGear(width, height, driveType);
      case PumpType.SCREW:
        return this.renderScrew(width, height, driveType);
      case PumpType.DIAPHRAGM:
        return this.renderDiaphragm(width, height, driveType);
      case PumpType.PERISTALTIC:
        return this.renderPeristaltic(width, height, driveType);
      default:
        return this.renderCentrifugal(width, height, driveType);
    }
  }

  /**
   * Render centrifugal pump (circular volute)
   */
  private renderCentrifugal(width: number, height: number, driveType?: PumpDriveType): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2;

    return (
      <g>
        {/* Volute casing */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Impeller */}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.6}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Impeller blades */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * radius * 0.2;
          const y1 = cy + Math.sin(rad) * radius * 0.2;
          const x2 = cx + Math.cos(rad) * radius * 0.6;
          const y2 = cy + Math.sin(rad) * radius * 0.6;
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

        {/* Drive motor */}
        {driveType && this.renderDrive(width, height, driveType)}
      </g>
    );
  }

  /**
   * Render positive displacement pump
   */
  private renderPositiveDisplacement(width: number, height: number, driveType?: PumpDriveType): JSX.Element {
    return (
      <g>
        {/* Pump body */}
        <rect
          x={width * 0.2}
          y={height * 0.2}
          width={width * 0.6}
          height={height * 0.6}
          rx={5}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Rotor */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.25}
          ry={height * 0.25}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {driveType && this.renderDrive(width, height, driveType)}
      </g>
    );
  }

  /**
   * Render reciprocating pump
   */
  private renderReciprocating(width: number, height: number, driveType?: PumpDriveType): JSX.Element {
    return (
      <g>
        {/* Cylinder */}
        <rect
          x={width * 0.25}
          y={height * 0.1}
          width={width * 0.5}
          height={height * 0.8}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Piston */}
        <rect
          x={width * 0.3}
          y={height * 0.4}
          width={width * 0.4}
          height={height * 0.2}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Piston rod */}
        <line
          x1={width / 2}
          y1={height * 0.5}
          x2={width / 2}
          y2={height}
          stroke="currentColor"
          strokeWidth={2}
        />

        {driveType && this.renderDrive(width, height, driveType)}
      </g>
    );
  }

  /**
   * Render gear pump
   */
  private renderGear(width: number, height: number, driveType?: PumpDriveType): JSX.Element {
    const cx1 = width * 0.4;
    const cx2 = width * 0.6;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.25;

    return (
      <g>
        {/* Housing */}
        <rect
          x={width * 0.2}
          y={height * 0.2}
          width={width * 0.6}
          height={height * 0.6}
          rx={5}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Gear 1 */}
        <circle cx={cx1} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth={2} />
        {this.renderGearTeeth(cx1, cy, radius, 8)}

        {/* Gear 2 */}
        <circle cx={cx2} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth={2} />
        {this.renderGearTeeth(cx2, cy, radius, 8)}

        {driveType && this.renderDrive(width, height, driveType)}
      </g>
    );
  }

  /**
   * Render screw pump
   */
  private renderScrew(width: number, height: number, driveType?: PumpDriveType): JSX.Element {
    return (
      <g>
        {/* Housing */}
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

        {/* Screw threads */}
        <path
          d={`M 0,${height * 0.4} Q ${width * 0.25},${height * 0.3} ${width * 0.5},${height * 0.5} T ${width},${height * 0.4}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
        <path
          d={`M 0,${height * 0.6} Q ${width * 0.25},${height * 0.7} ${width * 0.5},${height * 0.5} T ${width},${height * 0.6}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {driveType && this.renderDrive(width, height, driveType)}
      </g>
    );
  }

  /**
   * Render diaphragm pump
   */
  private renderDiaphragm(width: number, height: number, driveType?: PumpDriveType): JSX.Element {
    return (
      <g>
        {/* Pump chamber */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.4}
          ry={height * 0.4}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Diaphragm */}
        <path
          d={`M ${width * 0.2},${height / 2} Q ${width / 2},${height * 0.3} ${width * 0.8},${height / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="3,3"
        />

        {driveType && this.renderDrive(width, height, driveType)}
      </g>
    );
  }

  /**
   * Render peristaltic pump
   */
  private renderPeristaltic(width: number, height: number, driveType?: PumpDriveType): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2;

    return (
      <g>
        {/* Rotor */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Tube path */}
        <path
          d={`M ${cx - radius * 0.8},${cy} A ${radius * 0.8},${radius * 0.8} 0 1 1 ${cx + radius * 0.8},${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          opacity={0.3}
        />

        {/* Rollers */}
        {[0, 120, 240].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = cx + Math.cos(rad) * radius * 0.7;
          const y = cy + Math.sin(rad) * radius * 0.7;
          return <circle key={angle} cx={x} cy={y} r={radius * 0.15} fill="currentColor" />;
        })}

        {driveType && this.renderDrive(width, height, driveType)}
      </g>
    );
  }

  /**
   * Render gear teeth
   */
  private renderGearTeeth(cx: number, cy: number, radius: number, teethCount: number): JSX.Element[] {
    const teeth: JSX.Element[] = [];
    const angleStep = 360 / teethCount;

    for (let i = 0; i < teethCount; i++) {
      const angle = i * angleStep;
      const rad = (angle * Math.PI) / 180;
      const x = cx + Math.cos(rad) * radius;
      const y = cy + Math.sin(rad) * radius;

      teeth.push(
        <rect
          key={i}
          x={x - 2}
          y={y - 2}
          width={4}
          height={4}
          fill="currentColor"
          transform={`rotate(${angle} ${x} ${y})`}
        />
      );
    }

    return teeth;
  }

  /**
   * Render drive motor/engine
   */
  private renderDrive(width: number, height: number, _driveType: PumpDriveType): JSX.Element {
    const motorX = width + 10;
    const motorY = height / 2 - 15;
    const motorWidth = 30;
    const motorHeight = 30;

    return (
      <g>
        {/* Coupling shaft */}
        <line
          x1={width}
          y1={height / 2}
          x2={motorX}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Motor */}
        <rect
          x={motorX}
          y={motorY}
          width={motorWidth}
          height={motorHeight}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.2}
        />

        {/* Motor label */}
        <text
          x={motorX + motorWidth / 2}
          y={motorY + motorHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="currentColor"
        >
          M
        </text>
      </g>
    );
  }
}

/**
 * Factory for creating pump symbols
 */
export class PumpSymbolFactory {
  /**
   * Create centrifugal pump
   */
  static createCentrifugalPump(parameters: Parameters<PumpSymbolBase['generate']>[0]): IPumpSymbolData {
    const pump = new PumpSymbolBase(PumpType.CENTRIFUGAL);
    return pump.generate({
      ...parameters,
      variant: 'single-stage',
      driveType: PumpDriveType.ELECTRIC_MOTOR,
    });
  }

  /**
   * Create positive displacement pump
   */
  static createPositiveDisplacementPump(parameters: Parameters<PumpSymbolBase['generate']>[0]): IPumpSymbolData {
    const pump = new PumpSymbolBase(PumpType.POSITIVE_DISPLACEMENT);
    return pump.generate(parameters);
  }

  /**
   * Create gear pump
   */
  static createGearPump(parameters: Parameters<PumpSymbolBase['generate']>[0]): IPumpSymbolData {
    const pump = new PumpSymbolBase(PumpType.GEAR);
    return pump.generate(parameters);
  }

  /**
   * Create screw pump
   */
  static createScrewPump(parameters: Parameters<PumpSymbolBase['generate']>[0]): IPumpSymbolData {
    const pump = new PumpSymbolBase(PumpType.SCREW);
    return pump.generate(parameters);
  }

  /**
   * Create diaphragm pump
   */
  static createDiaphragmPump(parameters: Parameters<PumpSymbolBase['generate']>[0]): IPumpSymbolData {
    const pump = new PumpSymbolBase(PumpType.DIAPHRAGM);
    return pump.generate(parameters);
  }
}

export default PumpSymbolBase;
