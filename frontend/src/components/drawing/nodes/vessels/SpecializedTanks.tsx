/**
 * Specialized Tank Node Components
 * KnockoutDrum, FlashDrum, SurgeTank, Accumulator, BufferTank
 */

import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import VesselTankNode, { VesselShape, VesselOrientation, VesselHeadType } from './VesselTankNode';
import type { VesselTankNodeData } from './VesselTankNode';


// ============================================================================
// KNOCKOUT DRUM
// ============================================================================

/**
 * Knockout drum data interface
 */
export interface KnockoutDrumNodeData extends VesselTankNodeData {
  // Knockout drum specific
  demisterType?: 'mesh' | 'vane' | 'cyclone';
  dropletSize?: number; // microns
  carryoverLimit?: number; // ppm or percentage
}

type KnockoutDrumNodeProps = NodeProps<KnockoutDrumNodeData>;

/**
 * KnockoutDrumNode Component
 * Used for removing entrained liquid droplets from gas streams
 */
export const KnockoutDrumNode = memo<KnockoutDrumNodeProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const knockoutConfig: Partial<VesselTankNodeData> = {
      ...data,
      tankType: 'knockout_drum',
      vesselShape: VesselShape.CYLINDRICAL,
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.ELLIPTICAL,
      bottomHeadType: VesselHeadType.ELLIPTICAL,
      showNozzles: true,
      showLevelIndicator: true,
      supportType: 'legs',
      showSupportStructure: true,

      connectionPoints: data.connectionPoints || [
        {
          id: 'gas-inlet',
          type: 'inlet' as const,
          x: data.dimensions?.width ? data.dimensions.width * 0.2 : 24,
          y: data.dimensions?.height ? data.dimensions.height * 0.4 : 48,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'gas-outlet',
          type: 'outlet' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: 0,
          direction: 270,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'liquid-drain',
          type: 'drain' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: data.dimensions?.height || 120,
          direction: 90,
          compatible: ['pipe', 'drain'],
          required: true,
        },
      ],
    };

    return (
      <VesselTankNode
        id={id}
        data={knockoutConfig as VesselTankNodeData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

KnockoutDrumNode.displayName = 'KnockoutDrumNode';

// ============================================================================
// FLASH DRUM
// ============================================================================

/**
 * Flash drum data interface
 */
export interface FlashDrumNodeData extends VesselTankNodeData {
  // Flash drum specific
  flashType?: 'adiabatic' | 'isothermal';
  vaporFraction?: number; // 0-1
  flashTemperature?: number;
  flashPressure?: number;
}

type FlashDrumNodeProps = NodeProps<FlashDrumNodeData>;

/**
 * FlashDrumNode Component
 * Used for flash evaporation/separation processes
 */
export const FlashDrumNode = memo<FlashDrumNodeProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const flashConfig: Partial<VesselTankNodeData> = {
      ...data,
      tankType: 'flash_drum',
      vesselShape: VesselShape.CYLINDRICAL,
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.ELLIPTICAL,
      bottomHeadType: VesselHeadType.ELLIPTICAL,
      showNozzles: true,
      showLevelIndicator: true,
      showInsulation: data.showInsulation !== undefined ? data.showInsulation : true,
      supportType: 'skirt',
      showSupportStructure: true,

      connectionPoints: data.connectionPoints || [
        {
          id: 'feed',
          type: 'inlet' as const,
          x: data.dimensions?.width ? data.dimensions.width * 0.2 : 24,
          y: data.dimensions?.height ? data.dimensions.height * 0.5 : 60,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'vapor-outlet',
          type: 'outlet' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: 0,
          direction: 270,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'liquid-outlet',
          type: 'outlet' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: data.dimensions?.height || 120,
          direction: 90,
          compatible: ['pipe', 'process'],
          required: true,
        },
      ],
    };

    return (
      <VesselTankNode
        id={id}
        data={flashConfig as VesselTankNodeData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

FlashDrumNode.displayName = 'FlashDrumNode';

// ============================================================================
// SURGE TANK
// ============================================================================

/**
 * Surge tank data interface
 */
export interface SurgeTankNodeData extends VesselTankNodeData {
  // Surge tank specific
  surgeVolume?: number;
  normalLevel?: number; // percentage
  highLevel?: number; // percentage
  lowLevel?: number; // percentage
  responseTime?: number; // seconds
}

type SurgeTankNodeProps = NodeProps<SurgeTankNodeData>;

/**
 * SurgeTankNode Component
 * Used for absorbing flow surges and maintaining steady flow
 */
export const SurgeTankNode = memo<SurgeTankNodeProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const surgeConfig: Partial<VesselTankNodeData> = {
      ...data,
      tankType: 'surge_tank',
      vesselShape: VesselShape.CYLINDRICAL,
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.FLAT,
      bottomHeadType: VesselHeadType.ELLIPTICAL,
      showNozzles: true,
      showLevelIndicator: true,
      supportType: 'legs',
      showSupportStructure: true,

      connectionPoints: data.connectionPoints || [
        {
          id: 'inlet',
          type: 'inlet' as const,
          x: data.dimensions?.width ? data.dimensions.width * 0.2 : 24,
          y: data.dimensions?.height ? data.dimensions.height * 0.3 : 36,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'outlet',
          type: 'outlet' as const,
          x: data.dimensions?.width ? data.dimensions.width * 0.8 : 96,
          y: data.dimensions?.height ? data.dimensions.height * 0.7 : 84,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'overflow',
          type: 'outlet' as const,
          x: data.dimensions?.width ? data.dimensions.width * 0.8 : 96,
          y: data.dimensions?.height ? data.dimensions.height * 0.2 : 24,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: false,
        },
        {
          id: 'drain',
          type: 'drain' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: data.dimensions?.height || 120,
          direction: 90,
          compatible: ['pipe', 'drain'],
          required: false,
        },
      ],
    };

    return (
      <VesselTankNode
        id={id}
        data={surgeConfig as VesselTankNodeData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

SurgeTankNode.displayName = 'SurgeTankNode';

// ============================================================================
// ACCUMULATOR
// ============================================================================

/**
 * Accumulator data interface
 */
export interface AccumulatorNodeData extends VesselTankNodeData {
  // Accumulator specific
  accumulatorType?: 'bladder' | 'piston' | 'diaphragm' | 'gas_charged';
  prechargesPressure?: number;
  workingVolume?: number;
  gasType?: string;
}

type AccumulatorNodeProps = NodeProps<AccumulatorNodeData>;

/**
 * AccumulatorNode Component
 * Used for hydraulic/pneumatic energy storage and pressure stabilization
 */
export const AccumulatorNode = memo<AccumulatorNodeProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const accumulatorType = data.accumulatorType || 'gas_charged';

    const accumulatorConfig: Partial<VesselTankNodeData> = {
      ...data,
      tankType: 'accumulator',
      vesselShape: VesselShape.CYLINDRICAL,
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.HEMISPHERICAL,
      bottomHeadType: VesselHeadType.HEMISPHERICAL,
      showNozzles: true,
      showLevelIndicator: false,
      supportType: 'lug',
      showSupportStructure: true,

      connectionPoints: data.connectionPoints || [
        {
          id: 'gas-charge',
          type: 'inlet' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: 0,
          direction: 270,
          compatible: ['pipe', 'utility'],
          required: true,
        },
        {
          id: 'liquid-port',
          type: 'process' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: data.dimensions?.height || 120,
          direction: 90,
          compatible: ['pipe', 'process'],
          required: true,
        },
      ],
    };

    return (
      <VesselTankNode
        id={id}
        data={accumulatorConfig as VesselTankNodeData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

AccumulatorNode.displayName = 'AccumulatorNode';

// ============================================================================
// BUFFER TANK
// ============================================================================

/**
 * Buffer tank data interface
 */
export interface BufferTankNodeData extends VesselTankNodeData {
  // Buffer tank specific
  bufferCapacity?: number;
  residenceTime?: number; // seconds
  mixingRequired?: boolean;
}

type BufferTankNodeProps = NodeProps<BufferTankNodeData>;

/**
 * BufferTankNode Component
 * Used for temporary storage and flow buffering
 */
export const BufferTankNode = memo<BufferTankNodeProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const bufferConfig: Partial<VesselTankNodeData> = {
      ...data,
      tankType: 'buffer_tank',
      vesselShape: VesselShape.CYLINDRICAL,
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.FLAT,
      bottomHeadType: VesselHeadType.ELLIPTICAL,
      showNozzles: true,
      showLevelIndicator: true,
      hasAgitator: data.mixingRequired || false,
      supportType: 'legs',
      showSupportStructure: true,

      connectionPoints: data.connectionPoints || [
        {
          id: 'inlet',
          type: 'inlet' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: data.dimensions?.height ? data.dimensions.height * 0.2 : 24,
          direction: 270,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'outlet',
          type: 'outlet' as const,
          x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
          y: data.dimensions?.height || 120,
          direction: 90,
          compatible: ['pipe', 'process'],
          required: true,
        },
        {
          id: 'recirculation',
          type: 'process' as const,
          x: data.dimensions?.width ? data.dimensions.width * 0.8 : 96,
          y: data.dimensions?.height ? data.dimensions.height * 0.5 : 60,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: false,
        },
      ],
    };

    return (
      <VesselTankNode
        id={id}
        data={bufferConfig as VesselTankNodeData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

BufferTankNode.displayName = 'BufferTankNode';

// Export all components
export default {
  KnockoutDrumNode,
  FlashDrumNode,
  SurgeTankNode,
  AccumulatorNode,
  BufferTankNode,
};