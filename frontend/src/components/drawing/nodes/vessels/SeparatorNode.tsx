import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import VesselTankNode, { VesselShape, VesselOrientation, VesselHeadType } from './VesselTankNode';
import type { VesselTankNodeData } from './VesselTankNode';


/**
 * Separator types
 */
export enum SeparatorType {
  TWO_PHASE = 'two_phase', // Gas-liquid
  THREE_PHASE = 'three_phase', // Gas-oil-water
  LIQUID_LIQUID = 'liquid_liquid',
  GAS_LIQUID = 'gas_liquid',
  CYCLONE = 'cyclone',
}

/**
 * Separation method
 */
export enum SeparationMethod {
  GRAVITY = 'gravity',
  CENTRIFUGAL = 'centrifugal',
  COALESCENCE = 'coalescence',
  FILTRATION = 'filtration',
  DEMISTING = 'demisting',
}

/**
 * Separator data interface
 */
export interface SeparatorNodeData extends VesselTankNodeData {
  // Separator configuration
  separatorType?: SeparatorType;
  separationMethod?: SeparationMethod;

  // Phases
  numberOfPhases?: number;
  heavyPhaseOutlet?: boolean;
  lightPhaseOutlet?: boolean;
  gasOutlet?: boolean;

  // Internal components
  demisterPad?: boolean;
  vortexBreaker?: boolean;
  weirPlate?: boolean;
  coalescerPack?: boolean;
  distributorPlate?: boolean;

  // Performance parameters
  separationEfficiency?: number; // 0-100%
  retentionTime?: number; // seconds
  dropletSize?: number; // microns

  // Operating conditions
  operatingPressure?: number;
  operatingTemperature?: number;
}

type SeparatorNodeProps = NodeProps<SeparatorNodeData>;

/**
 * SeparatorNode Component
 * Specialized implementation for phase separator vessels (horizontal/vertical)
 */
const SeparatorNode = memo<SeparatorNodeProps>(({ id, data, selected, dragging }): React.ReactElement => {
  // Set default configuration for separators
  const separatorType = data.separatorType || SeparatorType.TWO_PHASE;
  const numberOfPhases = data.numberOfPhases || 2;

  // Determine orientation based on separator type
  const isHorizontal =
    separatorType === SeparatorType.TWO_PHASE ||
    separatorType === SeparatorType.THREE_PHASE ||
    separatorType === SeparatorType.LIQUID_LIQUID;

  // Configure vessel properties for separator
  const separatorConfig: Partial<VesselTankNodeData> = {
    ...data,
    tankType: 'separator',
    vesselShape: separatorType === SeparatorType.CYCLONE ? VesselShape.CONICAL : VesselShape.CYLINDRICAL,
    orientation: isHorizontal ? VesselOrientation.HORIZONTAL : VesselOrientation.VERTICAL,
    topHeadType: VesselHeadType.ELLIPTICAL,
    bottomHeadType: VesselHeadType.ELLIPTICAL,

    // Enable separator-specific features
    showNozzles: true,
    showLevelIndicator: true,
    showSupportStructure: true,
    supportType: isHorizontal ? 'saddle' : 'skirt',

    // Connection points configuration based on separator type
    connectionPoints: generateSeparatorConnectionPoints(
      separatorType,
      isHorizontal,
      data.dimensions?.width || 120,
      data.dimensions?.height || 120
    ),
  };

  return (
    <VesselTankNode
      id={id}
      data={separatorConfig as VesselTankNodeData}
      selected={selected}
      dragging={dragging}
    />
  );
});

/**
 * Generate connection points based on separator type
 */
function generateSeparatorConnectionPoints(
  separatorType: SeparatorType,
  isHorizontal: boolean,
  width: number,
  height: number
): Array<{
  id: string;
  type: 'inlet' | 'outlet' | 'process' | 'vent' | 'drain';
  x: number;
  y: number;
  direction: number;
  compatible: string[];
  required: boolean;
}> {
  const points = [];

  if (isHorizontal) {
    // Horizontal separator configuration
    switch (separatorType) {
      case SeparatorType.TWO_PHASE:
      case SeparatorType.GAS_LIQUID:
        points.push(
          {
            id: 'feed',
            type: 'inlet' as const,
            x: width * 0.2,
            y: height / 2,
            direction: 180,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'gas-outlet',
            type: 'outlet' as const,
            x: width * 0.9,
            y: height * 0.25,
            direction: 0,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'liquid-outlet',
            type: 'outlet' as const,
            x: width * 0.9,
            y: height * 0.75,
            direction: 0,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'drain',
            type: 'drain' as const,
            x: width * 0.5,
            y: height,
            direction: 90,
            compatible: ['pipe', 'drain'],
            required: false,
          }
        );
        break;

      case SeparatorType.THREE_PHASE:
        points.push(
          {
            id: 'feed',
            type: 'inlet' as const,
            x: width * 0.2,
            y: height / 2,
            direction: 180,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'gas-outlet',
            type: 'outlet' as const,
            x: width * 0.9,
            y: height * 0.2,
            direction: 0,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'light-liquid-outlet',
            type: 'outlet' as const,
            x: width * 0.9,
            y: height * 0.5,
            direction: 0,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'heavy-liquid-outlet',
            type: 'outlet' as const,
            x: width * 0.9,
            y: height * 0.8,
            direction: 0,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'drain',
            type: 'drain' as const,
            x: width * 0.5,
            y: height,
            direction: 90,
            compatible: ['pipe', 'drain'],
            required: false,
          }
        );
        break;

      case SeparatorType.LIQUID_LIQUID:
        points.push(
          {
            id: 'feed',
            type: 'inlet' as const,
            x: width * 0.2,
            y: height / 2,
            direction: 180,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'light-phase-outlet',
            type: 'outlet' as const,
            x: width * 0.9,
            y: height * 0.3,
            direction: 0,
            compatible: ['pipe', 'process'],
            required: true,
          },
          {
            id: 'heavy-phase-outlet',
            type: 'outlet' as const,
            x: width * 0.9,
            y: height * 0.7,
            direction: 0,
            compatible: ['pipe', 'process'],
            required: true,
          }
        );
        break;
    }
  } else {
    // Vertical separator configuration
    if (separatorType === SeparatorType.CYCLONE) {
      points.push(
        {
          id: 'feed',
          type: 'inlet' as const,
          x: width * 0.8,
          y: height * 0.3,
          direction: 0,
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
          id: 'solids-outlet',
          type: 'outlet' as const,
          x: width / 2,
          y: height,
          direction: 90,
          compatible: ['pipe', 'process'],
          required: true,
        }
      );
    } else {
      points.push(
        {
          id: 'feed',
          type: 'inlet' as const,
          x: width * 0.2,
          y: height * 0.3,
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
          id: 'liquid-outlet',
          type: 'outlet' as const,
          x: width / 2,
          y: height,
          direction: 90,
          compatible: ['pipe', 'process'],
          required: true,
        }
      );
    }
  }

  return points;
}

SeparatorNode.displayName = 'SeparatorNode';

export default SeparatorNode;