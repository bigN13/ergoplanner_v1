import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import VesselTankNode, { VesselShape, VesselOrientation, VesselHeadType } from './VesselTankNode';
import type { VesselTankNodeData } from './VesselTankNode';


/**
 * Agitator types for mixing tanks
 */
export enum AgitatorType {
  TURBINE = 'turbine',
  PROPELLER = 'propeller',
  ANCHOR = 'anchor',
  PADDLE = 'paddle',
  RIBBON = 'ribbon',
  HELICAL = 'helical',
}

/**
 * Mixing intensity levels
 */
export enum MixingIntensity {
  GENTLE = 'gentle',
  MODERATE = 'moderate',
  VIGOROUS = 'vigorous',
  HIGH_SHEAR = 'high_shear',
}

/**
 * Mixing tank data interface
 */
export interface MixingTankNodeData extends VesselTankNodeData {
  // Agitator configuration
  agitatorType?: AgitatorType;
  agitatorSpeed?: number; // RPM
  agitatorPower?: number; // kW
  mixingIntensity?: MixingIntensity;
  numberOfImpellers?: number;

  // Baffle configuration
  numberOfBaffles?: number;
  baffleWidth?: number;

  // Mixing properties
  blendingTime?: number; // seconds
  reynoldsNumber?: number;
  powerNumber?: number;

  // Process parameters
  viscosity?: number;
  viscosityUnit?: string;
  mixingQuality?: number; // 0-100%

  // Additional features
  topEntryAgitator?: boolean;
  sideEntryAgitator?: boolean;
  bottomEntryAgitator?: boolean;
}

type MixingTankNodeProps = NodeProps<MixingTankNodeData>;

/**
 * MixingTankNode Component
 * Specialized implementation for mixing/blending tanks with agitator visualization
 */
const MixingTankNode = memo<MixingTankNodeProps>(({ id, data, selected, dragging }): React.ReactElement => {
  // Set default configuration for mixing tanks
  const agitatorType = data.agitatorType || AgitatorType.TURBINE;
  const numberOfBaffles = data.numberOfBaffles || 4;
  const numberOfImpellers = data.numberOfImpellers || 1;
  const topEntry = data.topEntryAgitator !== false; // Default to true

  // Configure vessel properties for mixing tank
  const mixingConfig: Partial<VesselTankNodeData> = {
    ...data,
    tankType: 'mixing',
    vesselShape: VesselShape.CYLINDRICAL,
    orientation: VesselOrientation.VERTICAL,
    topHeadType: VesselHeadType.FLAT,
    bottomHeadType: VesselHeadType.ELLIPTICAL,

    // Enable mixing-specific features
    hasAgitator: true,
    hasBaffles: numberOfBaffles > 0,
    showNozzles: true,
    showLevelIndicator: true,

    // Support structure
    supportType: 'legs',
    showSupportStructure: true,

    // Connection points for feeds and discharge
    connectionPoints: data.connectionPoints || [
      {
        id: 'feed-top',
        type: 'inlet' as const,
        x: data.dimensions?.width ? data.dimensions.width * 0.7 : 84,
        y: 10,
        direction: 270,
        compatible: ['pipe', 'process'],
        required: false,
      },
      {
        id: 'discharge',
        type: 'outlet' as const,
        x: data.dimensions?.width ? data.dimensions.width / 2 : 60,
        y: data.dimensions?.height || 120,
        direction: 90,
        compatible: ['pipe', 'process'],
        required: false,
      },
      {
        id: 'side-feed',
        type: 'inlet' as const,
        x: 0,
        y: data.dimensions?.height ? data.dimensions.height * 0.4 : 48,
        direction: 180,
        compatible: ['pipe', 'process'],
        required: false,
      },
      {
        id: 'overflow',
        type: 'outlet' as const,
        x: data.dimensions?.width || 120,
        y: data.dimensions?.height ? data.dimensions.height * 0.3 : 36,
        direction: 0,
        compatible: ['pipe', 'process'],
        required: false,
      },
    ],
  };

  return (
    <VesselTankNode
      id={id}
      data={mixingConfig as VesselTankNodeData}
      selected={selected}
      dragging={dragging}
    />
  );
});

MixingTankNode.displayName = 'MixingTankNode';

export default MixingTankNode;