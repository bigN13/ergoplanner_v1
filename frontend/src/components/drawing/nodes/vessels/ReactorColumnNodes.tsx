/**
 * Reactor and Column Node Components
 * ReactorNode (batch/continuous) and ColumnNode (distillation/absorption)
 */

import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import VesselTankNode, { type VesselTankNodeData, VesselShape, VesselOrientation, VesselHeadType } from './VesselTankNode';

// ============================================================================
// REACTOR NODE
// ============================================================================

/**
 * Reactor types
 */
export enum ReactorType {
  BATCH = 'batch',
  CONTINUOUS_STIRRED = 'continuous_stirred', // CSTR
  PLUG_FLOW = 'plug_flow', // PFR
  FIXED_BED = 'fixed_bed',
  FLUIDIZED_BED = 'fluidized_bed',
  PACKED_BED = 'packed_bed',
}

/**
 * Reactor operation mode
 */
export enum ReactorOperationMode {
  BATCH = 'batch',
  SEMI_BATCH = 'semi_batch',
  CONTINUOUS = 'continuous',
}

/**
 * Reactor data interface
 */
export interface ReactorNodeData extends VesselTankNodeData {
  // Reactor configuration
  reactorType?: ReactorType;
  operationMode?: ReactorOperationMode;

  // Process parameters
  reactionTemperature?: number;
  reactionPressure?: number;
  conversionRate?: number; // 0-100%
  residenceTime?: number; // seconds
  spaceVelocity?: number; // LHSV or GHSV

  // Reactor features
  catalystBed?: boolean;
  numberOfBeds?: number;
  heatExchangeJacket?: boolean;
  internalCoils?: boolean;
  temperatureControl?: boolean;
  pressureControl?: boolean;

  // Safety features
  reliefValve?: boolean;
  ruptureDisc?: boolean;
  emergencyQuench?: boolean;
}

type ReactorNodeProps = NodeProps<ReactorNodeData>;

/**
 * ReactorNode Component
 * Chemical reactor vessels for various reaction types
 */
export const ReactorNode = memo<ReactorNodeProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const reactorType = data.reactorType || ReactorType.BATCH;
    const operationMode = data.operationMode || ReactorOperationMode.BATCH;

    // Configure based on reactor type
    const isBatch = operationMode === ReactorOperationMode.BATCH || reactorType === ReactorType.BATCH;
    const isCSTR = reactorType === ReactorType.CONTINUOUS_STIRRED;

    const reactorConfig: Partial<VesselTankNodeData> = {
      ...data,
      tankType: 'reactor',
      vesselShape: VesselShape.CYLINDRICAL,
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.ELLIPTICAL,
      bottomHeadType: VesselHeadType.ELLIPTICAL,

      // Reactor-specific features
      hasAgitator: isBatch || isCSTR,
      hasBaffles: isBatch || isCSTR,
      hasCoolingJacket: data.heatExchangeJacket !== undefined ? data.heatExchangeJacket : true,
      hasHeatingCoil: data.internalCoils !== undefined ? data.internalCoils : false,

      showNozzles: true,
      showLevelIndicator: true,
      showInsulation: true,
      supportType: 'skirt',
      showSupportStructure: true,

      connectionPoints: generateReactorConnectionPoints(
        reactorType,
        operationMode,
        data.dimensions?.width || 120,
        data.dimensions?.height || 120
      ),
    };

    return (
      <VesselTankNode
        id={id}
        data={reactorConfig as VesselTankNodeData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

ReactorNode.displayName = 'ReactorNode';

/**
 * Generate connection points for reactor based on type
 */
function generateReactorConnectionPoints(
  reactorType: ReactorType,
  operationMode: ReactorOperationMode,
  width: number,
  height: number
): Array<{
  id: string;
  type: 'inlet' | 'outlet' | 'process' | 'vent' | 'utility';
  x: number;
  y: number;
  direction: number;
  compatible: string[];
  required: boolean;
}> {
  const points = [];

  if (operationMode === ReactorOperationMode.BATCH) {
    // Batch reactor connections
    points.push(
      {
        id: 'feed-1',
        type: 'inlet' as const,
        x: width * 0.2,
        y: height * 0.3,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'feed-2',
        type: 'inlet' as const,
        x: width * 0.8,
        y: height * 0.4,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: false,
      },
      {
        id: 'discharge',
        type: 'outlet' as const,
        x: width / 2,
        y: height,
        direction: 90,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'vent',
        type: 'vent' as const,
        x: width / 2,
        y: 0,
        direction: 270,
        compatible: ['pipe', 'vent'],
        required: true,
      },
      {
        id: 'sample',
        type: 'process' as const,
        x: width * 0.9,
        y: height * 0.6,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: false,
      }
    );
  } else {
    // Continuous reactor connections
    points.push(
      {
        id: 'feed',
        type: 'inlet' as const,
        x: width * 0.2,
        y: height * 0.5,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'product',
        type: 'outlet' as const,
        x: width * 0.8,
        y: height * 0.5,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'vent',
        type: 'vent' as const,
        x: width / 2,
        y: 0,
        direction: 270,
        compatible: ['pipe', 'vent'],
        required: true,
      }
    );
  }

  // Add utility connections (cooling/heating)
  points.push(
    {
      id: 'cooling-in',
      type: 'utility' as const,
      x: width * 0.1,
      y: height * 0.7,
      direction: 180,
      compatible: ['pipe', 'utility'],
      required: false,
    },
    {
      id: 'cooling-out',
      type: 'utility' as const,
      x: width * 0.9,
      y: height * 0.8,
      direction: 0,
      compatible: ['pipe', 'utility'],
      required: false,
    }
  );

  return points;
}

// ============================================================================
// COLUMN NODE
// ============================================================================

/**
 * Column types
 */
export enum ColumnType {
  DISTILLATION = 'distillation',
  ABSORPTION = 'absorption',
  STRIPPING = 'stripping',
  EXTRACTION = 'extraction',
  PACKED = 'packed',
  TRAY = 'tray',
}

/**
 * Tray/Packing types
 */
export enum InternalsType {
  SIEVE_TRAY = 'sieve_tray',
  VALVE_TRAY = 'valve_tray',
  BUBBLE_CAP = 'bubble_cap',
  RANDOM_PACKING = 'random_packing',
  STRUCTURED_PACKING = 'structured_packing',
}

/**
 * Column data interface
 */
export interface ColumnNodeData extends VesselTankNodeData {
  // Column configuration
  columnType?: ColumnType;
  internalsType?: InternalsType;

  // Column specifications
  numberOfTrays?: number;
  traySpacing?: number; // mm
  packingHeight?: number; // m
  diameter?: number; // m
  columnHeight?: number; // m

  // Operating parameters
  refluxRatio?: number;
  boilupRatio?: number;
  topTemperature?: number;
  bottomTemperature?: number;
  topPressure?: number;
  bottomPressure?: number;

  // Performance
  numberOfTheoreticalPlates?: number;
  efficiency?: number; // 0-100%
  separationFactor?: number;

  // Features
  reboilerType?: 'thermosiphon' | 'kettle' | 'forced_circulation';
  condenserType?: 'total' | 'partial';
  hasRefluxDrum?: boolean;
  hasBottomsSump?: boolean;
}

type ColumnNodeProps = NodeProps<ColumnNodeData>;

/**
 * ColumnNode Component
 * Distillation, absorption, and stripping columns
 */
export const ColumnNode = memo<ColumnNodeProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const columnType = data.columnType || ColumnType.DISTILLATION;
    const _numberOfTrays = data.numberOfTrays || 20;

    const columnConfig: Partial<VesselTankNodeData> = {
      ...data,
      tankType: 'column',
      vesselShape: VesselShape.CYLINDRICAL,
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.ELLIPTICAL,
      bottomHeadType: VesselHeadType.ELLIPTICAL,

      // Make column taller and narrower
      dimensions: {
        width: data.dimensions?.width || 80,
        height: data.dimensions?.height || 200,
        originX: (data.dimensions?.width || 80) / 2,
        originY: (data.dimensions?.height || 200) / 2,
        scale: data.dimensions?.scale || 1,
        minScale: data.dimensions?.minScale || 0.5,
        maxScale: data.dimensions?.maxScale || 2,
        maintainAspectRatio: true,
        units: 'px',
      },

      showNozzles: true,
      showLevelIndicator: false, // Columns don't typically show level
      showInsulation: true,
      supportType: 'skirt',
      showSupportStructure: true,

      connectionPoints: generateColumnConnectionPoints(
        columnType,
        data.dimensions?.width || 80,
        data.dimensions?.height || 200
      ),
    };

    return (
      <VesselTankNode
        id={id}
        data={columnConfig as VesselTankNodeData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

ColumnNode.displayName = 'ColumnNode';

/**
 * Generate connection points for column based on type
 */
function generateColumnConnectionPoints(
  columnType: ColumnType,
  width: number,
  height: number
): Array<{
  id: string;
  type: 'inlet' | 'outlet' | 'process' | 'vent' | 'utility';
  x: number;
  y: number;
  direction: number;
  compatible: string[];
  required: boolean;
}> {
  const points = [];

  if (columnType === ColumnType.DISTILLATION) {
    points.push(
      {
        id: 'feed',
        type: 'inlet' as const,
        x: 0,
        y: height * 0.5,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'distillate',
        type: 'outlet' as const,
        x: width,
        y: height * 0.1,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'bottoms',
        type: 'outlet' as const,
        x: width,
        y: height * 0.9,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'reflux',
        type: 'inlet' as const,
        x: 0,
        y: height * 0.15,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'vapor-to-condenser',
        type: 'outlet' as const,
        x: width / 2,
        y: 0,
        direction: 270,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'reboiler-return',
        type: 'inlet' as const,
        x: 0,
        y: height * 0.95,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      }
    );
  } else if (columnType === ColumnType.ABSORPTION) {
    points.push(
      {
        id: 'gas-inlet',
        type: 'inlet' as const,
        x: width / 2,
        y: height,
        direction: 90,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'solvent-inlet',
        type: 'inlet' as const,
        x: 0,
        y: height * 0.1,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'gas-outlet',
        type: 'outlet' as const,
        x: width / 2,
        y: 0,
        direction: 270,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'rich-solvent',
        type: 'outlet' as const,
        x: width,
        y: height * 0.9,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
      }
    );
  } else if (columnType === ColumnType.STRIPPING) {
    points.push(
      {
        id: 'feed',
        type: 'inlet' as const,
        x: 0,
        y: height * 0.2,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'overhead-vapor',
        type: 'outlet' as const,
        x: width / 2,
        y: 0,
        direction: 270,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'bottoms',
        type: 'outlet' as const,
        x: width,
        y: height * 0.95,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: true,
      },
      {
        id: 'reboiler-return',
        type: 'inlet' as const,
        x: 0,
        y: height * 0.9,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: true,
      }
    );
  }

  return points;
}

// Export all components
const ReactorColumnComponents = {
  ReactorNode,
  ColumnNode,
};

export default ReactorColumnComponents;