import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import VesselTankNode, { VesselShape, VesselOrientation, VesselHeadType } from './VesselTankNode';
import type { VesselTankNodeData } from './VesselTankNode';


/**
 * Storage tank specific variants
 */
export enum StorageTankVariant {
  ATMOSPHERIC = 'atmospheric',
  PRESSURIZED = 'pressurized',
  CRYOGENIC = 'cryogenic',
  UNDERGROUND = 'underground',
  ELEVATED = 'elevated',
}

/**
 * Storage tank data interface
 */
export interface StorageTankNodeData extends VesselTankNodeData {
  storageVariant?: StorageTankVariant;

  // Storage-specific properties
  maxWorkingPressure?: number;
  designPressure?: number;
  vaporPressure?: number;
  breathingDevice?: boolean;
  emergencyVent?: boolean;
  foamChamber?: boolean;

  // Tank features
  floatingRoof?: boolean;
  fixedRoof?: boolean;
  geodesicDome?: boolean;
  windGirder?: boolean;

  // Foundation/mounting
  ringWall?: boolean;
  dykeEnclosure?: boolean;
  anchorBolts?: boolean;
}

type StorageTankNodeProps = NodeProps<StorageTankNodeData>;

/**
 * StorageTankNode Component
 * Specialized implementation for storage tanks (atmospheric, pressurized, etc.)
 */
const StorageTankNode = memo<StorageTankNodeProps>(({ id, data, selected, dragging }): React.ReactElement => {
  // Set default configuration for storage tanks
  const storageVariant = data.storageVariant || StorageTankVariant.ATMOSPHERIC;

  // Configure vessel properties based on storage variant
  const vesselConfig: Partial<VesselTankNodeData> = {
    ...data,
    tankType: 'storage',
    vesselShape: VesselShape.CYLINDRICAL,

    // Configure based on storage variant
    ...(storageVariant === StorageTankVariant.ATMOSPHERIC && {
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.FLAT,
      bottomHeadType: VesselHeadType.FLAT,
      showNozzles: true,
      showLevelIndicator: true,
      supportType: 'skirt',
      showSupportStructure: true,
    }),

    ...(storageVariant === StorageTankVariant.PRESSURIZED && {
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.ELLIPTICAL,
      bottomHeadType: VesselHeadType.ELLIPTICAL,
      showNozzles: true,
      showLevelIndicator: true,
      supportType: 'legs',
      showSupportStructure: true,
      showInsulation: data.showInsulation !== undefined ? data.showInsulation : false,
    }),

    ...(storageVariant === StorageTankVariant.CRYOGENIC && {
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.ELLIPTICAL,
      bottomHeadType: VesselHeadType.ELLIPTICAL,
      showNozzles: true,
      showLevelIndicator: true,
      showInsulation: true,
      insulationType: 'double',
      supportType: 'skirt',
      showSupportStructure: true,
    }),

    ...(storageVariant === StorageTankVariant.UNDERGROUND && {
      orientation: VesselOrientation.HORIZONTAL,
      topHeadType: VesselHeadType.ELLIPTICAL,
      bottomHeadType: VesselHeadType.ELLIPTICAL,
      showNozzles: true,
      showLevelIndicator: true,
      showSupportStructure: false,
    }),

    ...(storageVariant === StorageTankVariant.ELEVATED && {
      orientation: VesselOrientation.VERTICAL,
      topHeadType: VesselHeadType.FLAT,
      bottomHeadType: VesselHeadType.CONICAL,
      showNozzles: true,
      showLevelIndicator: true,
      supportType: 'legs',
      showSupportStructure: true,
    }),
  };

  return (
    <VesselTankNode
      id={id}
      data={vesselConfig as VesselTankNodeData}
      selected={selected}
      dragging={dragging}
    />
  );
});

StorageTankNode.displayName = 'StorageTankNode';

export default StorageTankNode;