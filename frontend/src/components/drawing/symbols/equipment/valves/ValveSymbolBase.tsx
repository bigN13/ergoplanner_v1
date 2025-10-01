import React from 'react';
import { ParametricSymbolGenerator, type IParametricConfig } from '../../ParametricSymbolGenerator';
import { ConnectionType, type ISymbolBaseData } from '../../SymbolBase';

/**
 * Valve types
 */
export enum ValveType {
  GATE = 'gate',
  GLOBE = 'globe',
  BALL = 'ball',
  BUTTERFLY = 'butterfly',
  CHECK = 'check',
  CONTROL = 'control',
  PLUG = 'plug',
  DIAPHRAGM = 'diaphragm',
  SAFETY_RELIEF = 'safety-relief',
  THREE_WAY = 'three-way',
}

/**
 * Actuator types
 */
export enum ActuatorType {
  MANUAL = 'manual',
  PNEUMATIC = 'pneumatic',
  ELECTRIC = 'electric',
  HYDRAULIC = 'hydraulic',
  SOLENOID = 'solenoid',
}

/**
 * Valve symbol metadata
 */
export interface IValveMetadata extends ISymbolBaseData {
  valveType: ValveType;
  actuatorType?: ActuatorType;
  size?: string; // DN15, DN20, etc.
  pressureRating?: string; // PN10, PN16, Class 150, etc.
  material?: string;
  cvValue?: number; // Flow coefficient
  position?: 'open' | 'closed' | 'throttled';
  failPosition?: 'fail-open' | 'fail-closed' | 'fail-last';
}

/**
 * Valve symbol data (for compatibility)
 */
export type IValveSymbolData = IValveMetadata;

/**
 * Base configuration for valve symbols
 */
export const VALVE_BASE_CONFIG: IParametricConfig = {
  baseWidth: 60,
  baseHeight: 60,
  minWidth: 30,
  maxWidth: 150,
  minHeight: 30,
  maxHeight: 150,
  aspectRatio: 1.0, // Square by default
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
      count: 1,
      position: 'top',
    },
  ],
  materials: [
    {
      id: 'cast_steel',
      name: 'Cast Steel',
      properties: {
        maxPressure: 25,
        maxTemperature: 450,
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
        maxPressure: 64,
        maxTemperature: 600,
        cost: 2.5,
      },
      visual: {
        color: '#D1D5DB',
      },
    },
    {
      id: 'bronze',
      name: 'Bronze',
      properties: {
        maxPressure: 20,
        maxTemperature: 250,
        cost: 2.0,
      },
      visual: {
        color: '#D97706',
      },
    },
  ],
  variants: ['flanged', 'threaded', 'welded', 'wafer'],
  performanceClass: 'light',
  maxInstances: 5000,
};

/**
 * Base class for valve symbols with parametric generation
 */
export class ValveSymbolBase {
  protected generator: ParametricSymbolGenerator<IValveSymbolData>;
  protected valveType: ValveType;

  constructor(valveType: ValveType, config?: Partial<IParametricConfig>) {
    this.valveType = valveType;
    this.generator = new ParametricSymbolGenerator<IValveSymbolData>({
      ...VALVE_BASE_CONFIG,
      ...config,
    });
  }

  /**
   * Generate valve symbol with parameters
   */
  public generate(parameters: {
    size?: string;
    width?: number;
    height?: number;
    variant?: string;
    material?: string;
    actuatorType?: ActuatorType;
    pressureRating?: string;
    cvValue?: number;
    position?: 'open' | 'closed' | 'throttled';
    failPosition?: 'fail-open' | 'fail-closed' | 'fail-last';
  }): IValveSymbolData {
    const baseData = this.generator.generate({
      width: parameters.width,
      height: parameters.height,
      variant: parameters.variant,
      material: parameters.material,
    });

    return {
      ...baseData,
      valveType: this.valveType,
      actuatorType: parameters.actuatorType,
      size: parameters.size,
      pressureRating: parameters.pressureRating,
      cvValue: parameters.cvValue,
      position: parameters.position,
      failPosition: parameters.failPosition,
    } as IValveSymbolData;
  }

  /**
   * Render valve SVG
   */
  protected renderValveSVG(
    width: number,
    height: number,
    valveType: ValveType,
    actuatorType?: ActuatorType,
    position: 'open' | 'closed' | 'throttled' = 'open'
  ): JSX.Element {
    return (
      <g>
        {this.renderValveBody(width, height, valveType, position)}
        {actuatorType && this.renderActuator(width, height, actuatorType)}
      </g>
    );
  }

  /**
   * Render valve body based on type
   */
  private renderValveBody(
    width: number,
    height: number,
    valveType: ValveType,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    switch (valveType) {
      case ValveType.GATE:
        return this.renderGateValve(width, height, position);
      case ValveType.GLOBE:
        return this.renderGlobeValve(width, height, position);
      case ValveType.BALL:
        return this.renderBallValve(width, height, position);
      case ValveType.BUTTERFLY:
        return this.renderButterflyValve(width, height, position);
      case ValveType.CHECK:
        return this.renderCheckValve(width, height);
      case ValveType.CONTROL:
        return this.renderControlValve(width, height, position);
      case ValveType.PLUG:
        return this.renderPlugValve(width, height, position);
      case ValveType.DIAPHRAGM:
        return this.renderDiaphragmValve(width, height, position);
      case ValveType.SAFETY_RELIEF:
        return this.renderSafetyReliefValve(width, height);
      case ValveType.THREE_WAY:
        return this.renderThreeWayValve(width, height, position);
      default:
        return this.renderGateValve(width, height, position);
    }
  }

  /**
   * Render gate valve (wedge or gate)
   */
  private renderGateValve(
    width: number,
    height: number,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    const centerY = height / 2;
    const gateHeight = position === 'closed' ? height * 0.4 : position === 'throttled' ? height * 0.2 : 0;

    return (
      <g>
        {/* Body - diamond shape */}
        <path
          d={`M ${width / 2},0 L ${width},${centerY} L ${width / 2},${height} L 0,${centerY} Z`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Gate/wedge */}
        {gateHeight > 0 && (
          <rect
            x={width * 0.4}
            y={centerY - gateHeight / 2}
            width={width * 0.2}
            height={gateHeight}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={2}
          />
        )}

        {/* Stem */}
        <line
          x1={width / 2}
          y1={0}
          x2={width / 2}
          y2={-height * 0.3}
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render globe valve
   */
  private renderGlobeValve(
    width: number,
    height: number,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    const centerX = width / 2;
    const centerY = height / 2;
    const plugY = position === 'closed' ? centerY : position === 'throttled' ? centerY * 0.7 : centerY * 0.3;

    return (
      <g>
        {/* Body - spherical */}
        <circle
          cx={centerX}
          cy={centerY}
          r={Math.min(width, height) / 2}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Seat */}
        <circle cx={centerX} cy={centerY} r={width * 0.15} fill="none" stroke="currentColor" strokeWidth={2} />

        {/* Plug/disc */}
        <circle cx={centerX} cy={plugY} r={width * 0.1} fill="currentColor" />

        {/* Stem */}
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={plugY}
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render ball valve
   */
  private renderBallValve(
    width: number,
    height: number,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    const centerX = width / 2;
    const centerY = height / 2;
    const rotation = position === 'closed' ? 90 : position === 'throttled' ? 45 : 0;

    return (
      <g>
        {/* Body */}
        <rect
          x={width * 0.2}
          y={height * 0.2}
          width={width * 0.6}
          height={height * 0.6}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Ball */}
        <circle
          cx={centerX}
          cy={centerY}
          r={Math.min(width, height) * 0.25}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Port through ball */}
        <line
          x1={centerX - width * 0.2}
          y1={centerY}
          x2={centerX + width * 0.2}
          y2={centerY}
          stroke="currentColor"
          strokeWidth={3}
          transform={`rotate(${rotation} ${centerX} ${centerY})`}
        />

        {/* Stem */}
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={height * 0.2}
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render butterfly valve
   */
  private renderButterflyValve(
    width: number,
    height: number,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    const centerX = width / 2;
    const centerY = height / 2;
    const rotation = position === 'closed' ? 0 : position === 'throttled' ? 45 : 90;

    return (
      <g>
        {/* Body - circular */}
        <circle
          cx={centerX}
          cy={centerY}
          r={Math.min(width, height) / 2}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Disc */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={width * 0.4}
          ry={height * 0.05}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          transform={`rotate(${rotation} ${centerX} ${centerY})`}
        />

        {/* Shaft */}
        <line
          x1={0}
          y1={centerY}
          x2={width}
          y2={centerY}
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render check valve (non-return)
   */
  private renderCheckValve(width: number, height: number): JSX.Element {
    const centerY = height / 2;

    return (
      <g>
        {/* Body - diamond */}
        <path
          d={`M ${width / 2},0 L ${width},${centerY} L ${width / 2},${height} L 0,${centerY} Z`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Disc/flapper */}
        <ellipse
          cx={width * 0.6}
          cy={centerY}
          rx={width * 0.15}
          ry={height * 0.3}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Hinge */}
        <circle cx={width * 0.6} cy={centerY * 0.5} r={3} fill="currentColor" />

        {/* Arrow indicating flow direction */}
        <path
          d={`M ${width * 0.3},${centerY} L ${width * 0.45},${centerY} L ${width * 0.4},${centerY - 5} M ${width * 0.45},${centerY} L ${width * 0.4},${centerY + 5}`}
          stroke="currentColor"
          strokeWidth={1.5}
          fill="none"
        />
      </g>
    );
  }

  /**
   * Render control valve
   */
  private renderControlValve(
    width: number,
    height: number,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    return (
      <g>
        {/* Use globe valve body */}
        {this.renderGlobeValve(width, height, position)}

        {/* Control symbol - X in circle */}
        <circle
          cx={width * 0.8}
          cy={height * 0.2}
          r={width * 0.12}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
        <text
          x={width * 0.8}
          y={height * 0.2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={width * 0.15}
          fill="currentColor"
        >
          C
        </text>
      </g>
    );
  }

  /**
   * Render plug valve
   */
  private renderPlugValve(
    width: number,
    height: number,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    const centerX = width / 2;
    const centerY = height / 2;
    const rotation = position === 'closed' ? 90 : position === 'throttled' ? 45 : 0;

    return (
      <g>
        {/* Body - tapered */}
        <path
          d={`M ${width * 0.2},${height * 0.3} L ${width * 0.8},${height * 0.3} L ${width * 0.7},${height * 0.7} L ${width * 0.3},${height * 0.7} Z`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Plug - tapered cylinder */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={width * 0.2}
          ry={height * 0.15}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Port */}
        <rect
          x={centerX - width * 0.05}
          y={centerY - height * 0.25}
          width={width * 0.1}
          height={height * 0.5}
          fill="currentColor"
          transform={`rotate(${rotation} ${centerX} ${centerY})`}
          opacity={0.7}
        />

        {/* Stem */}
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={height * 0.3}
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render diaphragm valve
   */
  private renderDiaphragmValve(
    width: number,
    height: number,
    position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    const centerX = width / 2;
    const diaphragmY = position === 'closed' ? height * 0.5 : position === 'throttled' ? height * 0.35 : height * 0.2;

    return (
      <g>
        {/* Body - weir type */}
        <path
          d={`M 0,${height * 0.7} L 0,${height} L ${width},${height} L ${width},${height * 0.7} L ${width * 0.8},${height * 0.5} L ${centerX},${height * 0.4} L ${width * 0.2},${height * 0.5} Z`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Diaphragm */}
        <path
          d={`M ${width * 0.2},${height * 0.2} Q ${centerX},${diaphragmY} ${width * 0.8},${height * 0.2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="3,3"
        />

        {/* Compressor/stem */}
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={diaphragmY}
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render safety relief valve
   */
  private renderSafetyReliefValve(width: number, height: number): JSX.Element {
    const centerX = width / 2;

    return (
      <g>
        {/* Body */}
        <path
          d={`M ${width * 0.3},${height * 0.6} L ${width * 0.3},${height} L ${width * 0.7},${height} L ${width * 0.7},${height * 0.6} L ${centerX},${height * 0.4} Z`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Spring */}
        <path
          d={`M ${centerX},${height * 0.1} L ${centerX - 5},${height * 0.15} L ${centerX + 5},${height * 0.2} L ${centerX - 5},${height * 0.25} L ${centerX + 5},${height * 0.3} L ${centerX},${height * 0.35}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />

        {/* Disc */}
        <circle cx={centerX} cy={height * 0.5} r={width * 0.1} fill="currentColor" />

        {/* PSV symbol */}
        <text
          x={width * 0.85}
          y={height * 0.3}
          fontSize={width * 0.15}
          fill="currentColor"
        >
          PSV
        </text>
      </g>
    );
  }

  /**
   * Render three-way valve
   */
  private renderThreeWayValve(
    width: number,
    height: number,
    _position: 'open' | 'closed' | 'throttled'
  ): JSX.Element {
    const centerX = width / 2;
    const centerY = height / 2;

    return (
      <g>
        {/* Body - T-shape */}
        <circle
          cx={centerX}
          cy={centerY}
          r={Math.min(width, height) * 0.4}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.1}
        />

        {/* Ball with L-port */}
        <circle
          cx={centerX}
          cy={centerY}
          r={Math.min(width, height) * 0.2}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* L-port visualization */}
        <path
          d={`M ${centerX - width * 0.15},${centerY} L ${centerX},${centerY} L ${centerX},${centerY + height * 0.15}`}
          stroke="currentColor"
          strokeWidth={3}
        />

        {/* Bottom connection point */}
        <line
          x1={centerX}
          y1={centerY + height * 0.4}
          x2={centerX}
          y2={height}
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render actuator on top of valve
   */
  private renderActuator(width: number, height: number, actuatorType: ActuatorType): JSX.Element {
    const centerX = width / 2;
    const actuatorY = -height * 0.4;
    const actuatorSize = width * 0.4;

    switch (actuatorType) {
      case ActuatorType.MANUAL:
        return (
          <g>
            {/* Handwheel */}
            <circle
              cx={centerX}
              cy={actuatorY}
              r={actuatorSize / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
            {/* Spokes */}
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x = centerX + Math.cos(rad) * (actuatorSize / 2);
              const y = actuatorY + Math.sin(rad) * (actuatorSize / 2);
              return (
                <line
                  key={angle}
                  x1={centerX}
                  y1={actuatorY}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        );

      case ActuatorType.PNEUMATIC:
        return (
          <g>
            {/* Cylinder */}
            <rect
              x={centerX - actuatorSize / 2}
              y={actuatorY - actuatorSize}
              width={actuatorSize}
              height={actuatorSize}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.2}
            />
            {/* Air supply indicator */}
            <text
              x={centerX}
              y={actuatorY - actuatorSize / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={actuatorSize * 0.4}
              fill="currentColor"
            >
              A
            </text>
          </g>
        );

      case ActuatorType.ELECTRIC:
        return (
          <g>
            {/* Motor */}
            <rect
              x={centerX - actuatorSize / 2}
              y={actuatorY - actuatorSize}
              width={actuatorSize}
              height={actuatorSize}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.2}
            />
            {/* Motor symbol */}
            <text
              x={centerX}
              y={actuatorY - actuatorSize / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={actuatorSize * 0.4}
              fill="currentColor"
            >
              M
            </text>
          </g>
        );

      case ActuatorType.HYDRAULIC:
        return (
          <g>
            {/* Hydraulic cylinder */}
            <rect
              x={centerX - actuatorSize / 2}
              y={actuatorY - actuatorSize}
              width={actuatorSize}
              height={actuatorSize}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.2}
            />
            {/* Hydraulic symbol */}
            <text
              x={centerX}
              y={actuatorY - actuatorSize / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={actuatorSize * 0.4}
              fill="currentColor"
            >
              H
            </text>
          </g>
        );

      case ActuatorType.SOLENOID:
        return (
          <g>
            {/* Solenoid coil */}
            <rect
              x={centerX - actuatorSize / 3}
              y={actuatorY - actuatorSize * 0.8}
              width={actuatorSize * 0.66}
              height={actuatorSize * 0.6}
              rx={5}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.2}
            />
            {/* Coil windings */}
            <path
              d={`M ${centerX - actuatorSize * 0.2},${actuatorY - actuatorSize * 0.6} Q ${centerX},${actuatorY - actuatorSize * 0.7} ${centerX + actuatorSize * 0.2},${actuatorY - actuatorSize * 0.6}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </g>
        );

      default:
        return <g />;
    }
  }
}

/**
 * Factory for creating valve symbols
 */
export class ValveSymbolFactory {
  /**
   * Create gate valve
   */
  static createGateValve(parameters: Parameters<ValveSymbolBase['generate']>[0]): IValveSymbolData {
    const valve = new ValveSymbolBase(ValveType.GATE);
    return valve.generate({
      ...parameters,
      variant: 'flanged',
    });
  }

  /**
   * Create globe valve
   */
  static createGlobeValve(parameters: Parameters<ValveSymbolBase['generate']>[0]): IValveSymbolData {
    const valve = new ValveSymbolBase(ValveType.GLOBE);
    return valve.generate(parameters);
  }

  /**
   * Create ball valve
   */
  static createBallValve(parameters: Parameters<ValveSymbolBase['generate']>[0]): IValveSymbolData {
    const valve = new ValveSymbolBase(ValveType.BALL);
    return valve.generate(parameters);
  }

  /**
   * Create butterfly valve
   */
  static createButterflyValve(parameters: Parameters<ValveSymbolBase['generate']>[0]): IValveSymbolData {
    const valve = new ValveSymbolBase(ValveType.BUTTERFLY);
    return valve.generate({
      ...parameters,
      variant: 'wafer',
    });
  }

  /**
   * Create check valve
   */
  static createCheckValve(parameters: Parameters<ValveSymbolBase['generate']>[0]): IValveSymbolData {
    const valve = new ValveSymbolBase(ValveType.CHECK);
    return valve.generate(parameters);
  }

  /**
   * Create control valve
   */
  static createControlValve(parameters: Parameters<ValveSymbolBase['generate']>[0]): IValveSymbolData {
    const valve = new ValveSymbolBase(ValveType.CONTROL);
    return valve.generate({
      ...parameters,
      actuatorType: parameters.actuatorType || ActuatorType.PNEUMATIC,
      failPosition: parameters.failPosition || 'fail-closed',
    });
  }

  /**
   * Create safety relief valve
   */
  static createSafetyReliefValve(parameters: Parameters<ValveSymbolBase['generate']>[0]): IValveSymbolData {
    const valve = new ValveSymbolBase(ValveType.SAFETY_RELIEF);
    return valve.generate(parameters);
  }
}

export default ValveSymbolBase;
