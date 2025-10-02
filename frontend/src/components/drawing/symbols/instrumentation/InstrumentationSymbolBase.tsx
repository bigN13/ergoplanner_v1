import React from 'react';
import { ParametricSymbolGenerator, type IParametricConfig } from '../ParametricSymbolGenerator';
import { ConnectionType, type ISymbolBaseData } from '../SymbolBase';

/**
 * ISA-5.1-2022 Instrumentation Symbol Library
 * Implements core instrumentation symbols following ISA-5.1 standard
 *
 * MVP Implementation: 15 core symbols
 * - Primary elements: 5 types (orifice, thermowell, pressure tap, level probe, analytical)
 * - Transmitters: 5 types (FT, PT, LT, TT, AT)
 * - Controllers/Indicators: 5 types (FIC, PIC, LIC, TIC, indicator)
 */

/**
 * ISA-5.1 instrument function codes
 */
export enum InstrumentFunction {
  // Measured Variables
  FLOW = 'F',
  PRESSURE = 'P',
  LEVEL = 'L',
  TEMPERATURE = 'T',
  ANALYTICAL = 'A',

  // Readout/Passive Functions
  INDICATOR = 'I',
  RECORDER = 'R',

  // Control Functions
  CONTROLLER = 'C',
}

/**
 * ISA-5.1 bubble shapes
 */
export enum BubbleShape {
  CIRCLE = 'circle', // Field mounted, primary location
  SQUARE = 'square', // Panel mounted, auxiliary location
  HEXAGON = 'hexagon', // Computer function
  DIAMOND = 'diamond', // Shared control/display
}

/**
 * ISA-5.1 signal line types
 */
export enum SignalLineType {
  PNEUMATIC = 'pneumatic', // Solid line
  ELECTRIC = 'electric', // Dashed line
  CAPILLARY = 'capillary', // Dotted line
  ELECTROMAGNETIC = 'electromagnetic', // Wireless/radio
  HYDRAULIC = 'hydraulic', // Solid with H
  FIBER_OPTIC = 'fiber-optic', // Dashed with F
}

/**
 * Primary element types
 */
export enum PrimaryElementType {
  ORIFICE_PLATE = 'orifice-plate',
  THERMOWELL = 'thermowell',
  PRESSURE_TAP = 'pressure-tap',
  LEVEL_PROBE = 'level-probe',
  ANALYTICAL_PROBE = 'analytical-probe',
}

/**
 * Instrumentation symbol metadata
 */
export interface IInstrumentationMetadata extends ISymbolBaseData {
  tagNumber: string; // ISA-5.1 tag format: XX-YYYY (e.g., FT-101, PIC-202)
  function: InstrumentFunction;
  bubbleShape: BubbleShape;
  signalType: SignalLineType;
  primaryElement?: PrimaryElementType;
  processVariable?: string;
  setpoint?: number;
  range?: { min: number; max: number };
  units?: string;
  loopNumber?: string;
  location?: 'field' | 'panel' | 'room';
  failSafe?: 'fail-open' | 'fail-closed' | 'fail-last';
}

/**
 * Instrumentation symbol data (for compatibility)
 */
export type IInstrumentationSymbolData = IInstrumentationMetadata;

/**
 * Base configuration for instrumentation symbols
 */
export const INSTRUMENTATION_BASE_CONFIG: IParametricConfig = {
  baseWidth: 50,
  baseHeight: 50,
  minWidth: 30,
  maxWidth: 100,
  minHeight: 30,
  maxHeight: 100,
  aspectRatio: 1.0, // Square bubbles
  capacityMin: 0,
  capacityMax: 100,
  capacityUnit: '%',
  capacityToSizeRatio: 0.5,
  connectionRules: [
    {
      type: ConnectionType.PROCESS,
      count: 1,
      position: 'bottom',
      required: true,
    },
    {
      type: ConnectionType.SIGNAL,
      count: 1,
      position: 'top',
      required: true,
    },
  ],
  materials: [],
  variants: [
    'field-mounted',
    'panel-mounted',
    'rack-mounted',
    'computer-function',
  ],
  performanceClass: 'medium',
  maxInstances: 1000,
};

/**
 * Base class for ISA-5.1 instrumentation symbols
 */
export class InstrumentationSymbolBase {
  protected generator: ParametricSymbolGenerator<IInstrumentationSymbolData>;
  protected function: InstrumentFunction;

  constructor(functionCode: InstrumentFunction, config?: Partial<IParametricConfig>) {
    this.function = functionCode;
    this.generator = new ParametricSymbolGenerator<IInstrumentationSymbolData>({
      ...INSTRUMENTATION_BASE_CONFIG,
      ...config,
    });
  }

  /**
   * Generate instrumentation symbol with parameters
   */
  public generate(parameters: {
    tagNumber: string;
    bubbleShape?: BubbleShape;
    signalType?: SignalLineType;
    primaryElement?: PrimaryElementType;
    processVariable?: string;
    setpoint?: number;
    range?: { min: number; max: number };
    units?: string;
    loopNumber?: string;
    location?: 'field' | 'panel' | 'room';
    failSafe?: 'fail-open' | 'fail-closed' | 'fail-last';
    width?: number;
    height?: number;
  }): IInstrumentationSymbolData {
    const baseData = this.generator.generate({
      width: parameters.width || 50,
      height: parameters.height || 50,
      variant: parameters.location === 'panel' ? 'panel-mounted' : 'field-mounted',
    });

    // Determine bubble shape from location if not specified
    const { bubbleShape: paramBubbleShape, location } = parameters;
    const bubbleShape = paramBubbleShape ||
      (location === 'panel' ? BubbleShape.SQUARE : BubbleShape.CIRCLE);

    return {
      ...baseData,
      tagNumber: parameters.tagNumber,
      function: this.function,
      bubbleShape,
      signalType: parameters.signalType || SignalLineType.ELECTRIC,
      primaryElement: parameters.primaryElement,
      processVariable: parameters.processVariable,
      setpoint: parameters.setpoint,
      range: parameters.range,
      units: parameters.units,
      loopNumber: parameters.loopNumber,
      location: parameters.location || 'field',
      failSafe: parameters.failSafe,
    } as IInstrumentationSymbolData;
  }

  /**
   * Render instrumentation bubble SVG
   */
  protected renderBubbleSVG(
    width: number,
    height: number,
    shape: BubbleShape,
    tagNumber: string
  ): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 2;

    return (
      <g>
        {/* Bubble shape */}
        {this.renderBubbleShape(cx, cy, radius, shape)}

        {/* Tag number text */}
        <text
          x={cx}
          y={cy}
          fontSize={radius * 0.4}
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
        >
          {tagNumber}
        </text>
      </g>
    );
  }

  /**
   * Render bubble shape based on ISA-5.1 standard
   */
  private renderBubbleShape(
    cx: number,
    cy: number,
    radius: number,
    shape: BubbleShape
  ): JSX.Element {
    switch (shape) {
      case BubbleShape.CIRCLE:
        return (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="white"
            stroke="currentColor"
            strokeWidth={2}
          />
        );

      case BubbleShape.SQUARE:
        return (
          <rect
            x={cx - radius}
            y={cy - radius}
            width={radius * 2}
            height={radius * 2}
            fill="white"
            stroke="currentColor"
            strokeWidth={2}
          />
        );

      case BubbleShape.HEXAGON:
        return (
          <polygon
            points={this.getHexagonPoints(cx, cy, radius)}
            fill="white"
            stroke="currentColor"
            strokeWidth={2}
          />
        );

      case BubbleShape.DIAMOND:
        return (
          <polygon
            points={`${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`}
            fill="white"
            stroke="currentColor"
            strokeWidth={2}
          />
        );

      default:
        return (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="white"
            stroke="currentColor"
            strokeWidth={2}
          />
        );
    }
  }

  /**
   * Generate hexagon points
   */
  private getHexagonPoints(cx: number, cy: number, radius: number): string {
    const points: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push([
        cx + radius * Math.cos(angle),
        cy + radius * Math.sin(angle),
      ]);
    }
    return points.map(p => p.join(',')).join(' ');
  }

  /**
   * Render primary element
   */
  protected renderPrimaryElement(
    width: number,
    height: number,
    elementType: PrimaryElementType
  ): JSX.Element {
    switch (elementType) {
      case PrimaryElementType.ORIFICE_PLATE:
        return this.renderOrificePlate(width, height);
      case PrimaryElementType.THERMOWELL:
        return this.renderThermowell(width, height);
      case PrimaryElementType.PRESSURE_TAP:
        return this.renderPressureTap(width, height);
      case PrimaryElementType.LEVEL_PROBE:
        return this.renderLevelProbe(width, height);
      case PrimaryElementType.ANALYTICAL_PROBE:
        return this.renderAnalyticalProbe(width, height);
      default:
        return <g />;
    }
  }

  /**
   * Render orifice plate
   */
  private renderOrificePlate(width: number, height: number): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;
    const plateRadius = Math.min(width, height) * 0.4;
    const orificeRadius = plateRadius * 0.3;

    return (
      <g>
        {/* Plate */}
        <circle
          cx={cx}
          cy={cy}
          r={plateRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
        {/* Orifice */}
        <circle
          cx={cx}
          cy={cy}
          r={orificeRadius}
          fill="currentColor"
          opacity={0.3}
        />
        {/* Flanges */}
        <line
          x1={cx - plateRadius - 5}
          y1={cy - plateRadius * 0.5}
          x2={cx - plateRadius - 5}
          y2={cy + plateRadius * 0.5}
          stroke="currentColor"
          strokeWidth={3}
        />
        <line
          x1={cx + plateRadius + 5}
          y1={cy - plateRadius * 0.5}
          x2={cx + plateRadius + 5}
          y2={cy + plateRadius * 0.5}
          stroke="currentColor"
          strokeWidth={3}
        />
      </g>
    );
  }

  /**
   * Render thermowell
   */
  private renderThermowell(width: number, height: number): JSX.Element {
    const cx = width / 2;
    const wellWidth = width * 0.15;
    const wellLength = height * 0.6;

    return (
      <g>
        {/* Well body */}
        <rect
          x={cx - wellWidth / 2}
          y={height * 0.2}
          width={wellWidth}
          height={wellLength}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.3}
        />
        {/* Tip */}
        <polygon
          points={`${cx - wellWidth / 2},${height * 0.2 + wellLength} ${cx},${height * 0.9} ${cx + wellWidth / 2},${height * 0.2 + wellLength}`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
        />
        {/* Connection */}
        <rect
          x={cx - wellWidth}
          y={height * 0.15}
          width={wellWidth * 2}
          height={height * 0.1}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.3}
        />
      </g>
    );
  }

  /**
   * Render pressure tap
   */
  private renderPressureTap(width: number, height: number): JSX.Element {
    const cx = width / 2;
    const cy = height / 2;

    return (
      <g>
        {/* Pipe wall */}
        <line
          x1={0}
          y1={cy}
          x2={width}
          y2={cy}
          stroke="currentColor"
          strokeWidth={3}
        />
        {/* Tap point */}
        <circle
          cx={cx}
          cy={cy}
          r={width * 0.08}
          fill="currentColor"
        />
        {/* Tap line */}
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={0}
          stroke="currentColor"
          strokeWidth={2}
        />
        {/* Connection */}
        <circle
          cx={cx}
          cy={height * 0.1}
          r={width * 0.1}
          fill="white"
          stroke="currentColor"
          strokeWidth={2}
        />
      </g>
    );
  }

  /**
   * Render level probe
   */
  private renderLevelProbe(width: number, height: number): JSX.Element {
    const cx = width / 2;
    const probeWidth = width * 0.1;

    return (
      <g>
        {/* Probe shaft */}
        <rect
          x={cx - probeWidth / 2}
          y={height * 0.15}
          width={probeWidth}
          height={height * 0.7}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.3}
        />
        {/* Float/sensor */}
        <ellipse
          cx={cx}
          cy={height * 0.6}
          rx={width * 0.2}
          ry={height * 0.15}
          fill="white"
          stroke="currentColor"
          strokeWidth={2}
        />
        {/* Connection housing */}
        <rect
          x={cx - width * 0.25}
          y={0}
          width={width * 0.5}
          height={height * 0.2}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.3}
        />
      </g>
    );
  }

  /**
   * Render analytical probe
   */
  private renderAnalyticalProbe(width: number, height: number): JSX.Element {
    const cx = width / 2;
    const probeWidth = width * 0.15;

    return (
      <g>
        {/* Probe body */}
        <rect
          x={cx - probeWidth / 2}
          y={height * 0.2}
          width={probeWidth}
          height={height * 0.5}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.3}
        />
        {/* Sensor tip */}
        <circle
          cx={cx}
          cy={height * 0.75}
          r={width * 0.12}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
        />
        {/* Reference electrode */}
        <line
          x1={cx - width * 0.15}
          y1={height * 0.6}
          x2={cx - width * 0.3}
          y2={height * 0.7}
          stroke="currentColor"
          strokeWidth={2}
        />
        <circle
          cx={cx - width * 0.3}
          cy={height * 0.7}
          r={width * 0.08}
          fill="white"
          stroke="currentColor"
          strokeWidth={2}
        />
        {/* Connection */}
        <rect
          x={cx - width * 0.2}
          y={0}
          width={width * 0.4}
          height={height * 0.25}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.3}
        />
      </g>
    );
  }

  /**
   * Render signal line
   */
  protected renderSignalLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    signalType: SignalLineType
  ): JSX.Element {
    const strokeDasharray = this.getSignalLineStyle(signalType);

    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray={strokeDasharray}
      />
    );
  }

  /**
   * Get signal line style based on ISA-5.1
   */
  private getSignalLineStyle(signalType: SignalLineType): string {
    switch (signalType) {
      case SignalLineType.PNEUMATIC:
        return ''; // Solid
      case SignalLineType.ELECTRIC:
        return '5,5'; // Dashed
      case SignalLineType.CAPILLARY:
        return '2,2'; // Dotted
      case SignalLineType.ELECTROMAGNETIC:
        return '10,5,2,5'; // Dash-dot
      case SignalLineType.HYDRAULIC:
        return ''; // Solid (labeled with H)
      case SignalLineType.FIBER_OPTIC:
        return '5,5'; // Dashed (labeled with F)
      default:
        return '5,5'; // Default to electric
    }
  }
}

/**
 * Factory for creating ISA-5.1 instrumentation symbols
 */
export class InstrumentationSymbolFactory {
  /**
   * Create Flow Transmitter (FT)
   */
  static createFlowTransmitter(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.FLOW);
    return instrument.generate({
      ...parameters,
      primaryElement: parameters.primaryElement || PrimaryElementType.ORIFICE_PLATE,
    });
  }

  /**
   * Create Pressure Transmitter (PT)
   */
  static createPressureTransmitter(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.PRESSURE);
    return instrument.generate({
      ...parameters,
      primaryElement: parameters.primaryElement || PrimaryElementType.PRESSURE_TAP,
    });
  }

  /**
   * Create Level Transmitter (LT)
   */
  static createLevelTransmitter(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.LEVEL);
    return instrument.generate({
      ...parameters,
      primaryElement: parameters.primaryElement || PrimaryElementType.LEVEL_PROBE,
    });
  }

  /**
   * Create Temperature Transmitter (TT)
   */
  static createTemperatureTransmitter(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.TEMPERATURE);
    return instrument.generate({
      ...parameters,
      primaryElement: parameters.primaryElement || PrimaryElementType.THERMOWELL,
    });
  }

  /**
   * Create Analytical Transmitter (AT)
   */
  static createAnalyticalTransmitter(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.ANALYTICAL);
    return instrument.generate({
      ...parameters,
      primaryElement: parameters.primaryElement || PrimaryElementType.ANALYTICAL_PROBE,
    });
  }

  /**
   * Create Flow Indicator Controller (FIC)
   */
  static createFlowIndicatorController(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.FLOW);
    return instrument.generate({
      ...parameters,
      bubbleShape: BubbleShape.SQUARE,
      location: parameters.location || 'panel',
    });
  }

  /**
   * Create Pressure Indicator Controller (PIC)
   */
  static createPressureIndicatorController(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.PRESSURE);
    return instrument.generate({
      ...parameters,
      bubbleShape: BubbleShape.SQUARE,
      location: parameters.location || 'panel',
    });
  }

  /**
   * Create Level Indicator Controller (LIC)
   */
  static createLevelIndicatorController(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.LEVEL);
    return instrument.generate({
      ...parameters,
      bubbleShape: BubbleShape.SQUARE,
      location: parameters.location || 'panel',
    });
  }

  /**
   * Create Temperature Indicator Controller (TIC)
   */
  static createTemperatureIndicatorController(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0]
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(InstrumentFunction.TEMPERATURE);
    return instrument.generate({
      ...parameters,
      bubbleShape: BubbleShape.SQUARE,
      location: parameters.location || 'panel',
    });
  }

  /**
   * Create generic Indicator
   */
  static createIndicator(
    parameters: Parameters<InstrumentationSymbolBase['generate']>[0] & { function: InstrumentFunction }
  ): IInstrumentationSymbolData {
    const instrument = new InstrumentationSymbolBase(parameters.function);
    return instrument.generate({
      ...parameters,
      bubbleShape: BubbleShape.CIRCLE,
      location: parameters.location || 'field',
    });
  }
}

export default InstrumentationSymbolBase;
