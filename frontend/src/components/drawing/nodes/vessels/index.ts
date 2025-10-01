/**
 * Vessel and Tank Symbols - Comprehensive Export
 * Exports all vessel/tank node components and utilities
 */

// Base vessel component
export { default as VesselTankNode } from './VesselTankNode';
export type { VesselTankNodeData } from './VesselTankNode';
export { VesselShape, VesselOrientation, VesselHeadType } from './VesselTankNode';

// Specialized tank types
export { default as StorageTankNode } from './StorageTankNode';
export type { StorageTankNodeData } from './StorageTankNode';
export { StorageTankVariant } from './StorageTankNode';

export { default as MixingTankNode } from './MixingTankNode';
export type { MixingTankNodeData } from './MixingTankNode';
export { AgitatorType, MixingIntensity } from './MixingTankNode';

export { default as SeparatorNode } from './SeparatorNode';
export type { SeparatorNodeData } from './SeparatorNode';
export { SeparatorType, SeparationMethod } from './SeparatorNode';

// Specialized tanks (single export file)
export {
  KnockoutDrumNode,
  FlashDrumNode,
  SurgeTankNode,
  AccumulatorNode,
  BufferTankNode,
} from './SpecializedTanks';
export type {
  KnockoutDrumNodeData,
  FlashDrumNodeData,
  SurgeTankNodeData,
  AccumulatorNodeData,
  BufferTankNodeData,
} from './SpecializedTanks';

// Reactors and columns
export {
  ReactorNode,
  ColumnNode,
} from './ReactorColumnNodes';
export type {
  ReactorNodeData,
  ColumnNodeData,
} from './ReactorColumnNodes';
export {
  ReactorType,
  ReactorOperationMode,
  ColumnType,
  InternalsType,
} from './ReactorColumnNodes';

// Internal components
export {
  BaffleComponent,
  AgitatorComponent,
  HeatingCoilComponent,
  DipTubeComponent,
  SprayNozzleComponent,
  PackingComponent,
  TrayComponent,
} from './InternalComponents';
export type {
  InternalComponentProps,
  BaffleComponentProps,
  AgitatorComponentProps,
  HeatingCoilComponentProps,
  DipTubeComponentProps,
  SprayNozzleComponentProps,
  PackingComponentProps,
  TrayComponentProps,
} from './InternalComponents';

// Internal component manager
export { default as InternalComponentManager } from './InternalComponentManager';
export {
  InternalComponentFactory,
  useInternalComponents,
} from './InternalComponentManager';
export type {
  InternalComponentConfig,
  InternalComponentManagerProps,
} from './InternalComponentManager';

// Visual features
export {
  InsulationRenderer,
  SupportStructureRenderer,
  LevelIndicatorComponent,
  ConnectionNozzleComponent,
  DimensionalAnnotationComponent,
  StateIndicatorComponent,
} from './VisualFeatures';
export type {
  VisualFeatureProps,
  InsulationRendererProps,
  SupportStructureRendererProps,
  LevelIndicatorProps,
  ConnectionNozzleProps,
  DimensionalAnnotationProps,
  StateIndicatorProps,
} from './VisualFeatures';

// Legacy vessel node (if exists)
export { default as VesselNode } from './VesselNode';
export { default as HeatExchangerNode } from './HeatExchangerNode';

/**
 * Vessel type registry for easy lookup
 */
export const VesselTypes = {
  // Base
  VESSEL_TANK: 'vessel-tank',

  // Storage variants
  STORAGE_ATMOSPHERIC: 'storage-atmospheric',
  STORAGE_PRESSURIZED: 'storage-pressurized',
  STORAGE_CRYOGENIC: 'storage-cryogenic',
  STORAGE_UNDERGROUND: 'storage-underground',
  STORAGE_ELEVATED: 'storage-elevated',

  // Process vessels
  MIXING_TANK: 'mixing-tank',
  SEPARATOR_TWO_PHASE: 'separator-two-phase',
  SEPARATOR_THREE_PHASE: 'separator-three-phase',
  SEPARATOR_LIQUID_LIQUID: 'separator-liquid-liquid',
  SEPARATOR_GAS_LIQUID: 'separator-gas-liquid',
  SEPARATOR_CYCLONE: 'separator-cyclone',

  // Specialized tanks
  KNOCKOUT_DRUM: 'knockout-drum',
  FLASH_DRUM: 'flash-drum',
  SURGE_TANK: 'surge-tank',
  ACCUMULATOR: 'accumulator',
  BUFFER_TANK: 'buffer-tank',

  // Reactors
  REACTOR_BATCH: 'reactor-batch',
  REACTOR_CSTR: 'reactor-cstr',
  REACTOR_PFR: 'reactor-pfr',
  REACTOR_FIXED_BED: 'reactor-fixed-bed',
  REACTOR_FLUIDIZED_BED: 'reactor-fluidized-bed',
  REACTOR_PACKED_BED: 'reactor-packed-bed',

  // Columns
  COLUMN_DISTILLATION: 'column-distillation',
  COLUMN_ABSORPTION: 'column-absorption',
  COLUMN_STRIPPING: 'column-stripping',
  COLUMN_EXTRACTION: 'column-extraction',
  COLUMN_PACKED: 'column-packed',
  COLUMN_TRAY: 'column-tray',

  // Heat exchangers
  HEAT_EXCHANGER: 'heat-exchanger',
} as const;

export type VesselTypeKey = typeof VesselTypes[keyof typeof VesselTypes];

/**
 * Vessel category organization
 */
export const VesselCategories = {
  STORAGE: {
    id: 'storage-vessels',
    name: 'Storage Vessels',
    description: 'Atmospheric and pressurized storage tanks',
    types: [
      VesselTypes.STORAGE_ATMOSPHERIC,
      VesselTypes.STORAGE_PRESSURIZED,
      VesselTypes.STORAGE_CRYOGENIC,
      VesselTypes.STORAGE_UNDERGROUND,
      VesselTypes.STORAGE_ELEVATED,
    ],
  },
  PROCESS: {
    id: 'process-vessels',
    name: 'Process Vessels',
    description: 'Mixing, separation, and processing equipment',
    types: [
      VesselTypes.MIXING_TANK,
      VesselTypes.SEPARATOR_TWO_PHASE,
      VesselTypes.SEPARATOR_THREE_PHASE,
      VesselTypes.SEPARATOR_LIQUID_LIQUID,
      VesselTypes.HEAT_EXCHANGER,
    ],
  },
  SPECIALIZED: {
    id: 'specialized-vessels',
    name: 'Specialized Equipment',
    description: 'Knockout drums, flash drums, surge tanks, accumulators',
    types: [
      VesselTypes.KNOCKOUT_DRUM,
      VesselTypes.FLASH_DRUM,
      VesselTypes.SURGE_TANK,
      VesselTypes.ACCUMULATOR,
      VesselTypes.BUFFER_TANK,
    ],
  },
  REACTORS: {
    id: 'reactors',
    name: 'Reactors',
    description: 'Chemical reaction vessels',
    types: [
      VesselTypes.REACTOR_BATCH,
      VesselTypes.REACTOR_CSTR,
      VesselTypes.REACTOR_PFR,
      VesselTypes.REACTOR_FIXED_BED,
      VesselTypes.REACTOR_FLUIDIZED_BED,
      VesselTypes.REACTOR_PACKED_BED,
    ],
  },
  COLUMNS: {
    id: 'columns',
    name: 'Columns',
    description: 'Distillation, absorption, and stripping columns',
    types: [
      VesselTypes.COLUMN_DISTILLATION,
      VesselTypes.COLUMN_ABSORPTION,
      VesselTypes.COLUMN_STRIPPING,
      VesselTypes.COLUMN_EXTRACTION,
      VesselTypes.COLUMN_PACKED,
      VesselTypes.COLUMN_TRAY,
    ],
  },
} as const;