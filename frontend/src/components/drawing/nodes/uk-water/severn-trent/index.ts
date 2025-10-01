/**
 * Severn Trent Sewage Treatment Symbol Library
 *
 * Standard: Severn Trent Engineering Standards ST-ES-2024
 * Category: UK Water Industry Symbols
 *
 * This module provides a comprehensive set of P&ID symbols specifically
 * for Severn Trent sewage treatment facilities including biological treatment,
 * anaerobic digestion, sludge handling, and odor control systems.
 */

// ============================================================================
// Component Exports
// ============================================================================

export {
  // Biological Treatment Components
  ActivatedSludgeTankNode,
  TricklingFilterNode,
  SBRReactorNode,
  SevernTrentBiologicalTreatmentComponents,
  SevernTrentBiologicalTreatmentTypes,
  type BiologicalTreatmentNodeData,
  type BiologicalTreatmentType,
  type AerationSystem,
  type TricklingFilterType,
  type SBRPhase,
} from './BiologicalTreatmentComponents';

export {
  // Anaerobic Digester Components
  AnaerobicDigesterNode,
  StormTankNode,
  SevernTrentAnaerobicDigesterComponents,
  SevernTrentAnaerobicDigesterTypes,
  type AnaerobicDigesterNodeData,
  type StormTankNodeData,
  type DigesterType,
  type MixingSystem,
} from './AnaerobicDigesterComponents';

export {
  // Sludge Handling Components
  SludgeThickenerNode,
  CentrifugeNode,
  BeltFilterPressNode,
  SevernTrentSludgeHandlingComponents,
  SevernTrentSludgeHandlingTypes,
  type SludgeHandlingNodeData,
  type SludgeHandlingType,
  type ThickenerType,
  type CentrifugeType,
} from './SludgeHandlingComponents';

export {
  // Odor Control Components
  BiofilterNode,
  ChemicalScrubberNode,
  SevernTrentOdorControlComponents,
  SevernTrentOdorControlTypes,
  type OdorControlNodeData,
  type OdorControlType,
  type BiofilterMedia,
  type ScrubberType,
  type ScrubberChemical,
} from './OdorControlComponents';

// ============================================================================
// Symbol Type Registry
// ============================================================================

import { SevernTrentBiologicalTreatmentTypes ,
  ActivatedSludgeTankNode,
  TricklingFilterNode,
  SBRReactorNode,
} from './BiologicalTreatmentComponents';
import { SevernTrentAnaerobicDigesterTypes ,
  AnaerobicDigesterNode,
  StormTankNode,
} from './AnaerobicDigesterComponents';
import { SevernTrentSludgeHandlingTypes ,
  SludgeThickenerNode,
  CentrifugeNode,
  BeltFilterPressNode,
} from './SludgeHandlingComponents';
import { SevernTrentOdorControlTypes ,
  BiofilterNode,
  ChemicalScrubberNode,
} from './OdorControlComponents';

export const SevernTrentSymbolTypes = {
  // Biological Treatment (3 types)
  ...SevernTrentBiologicalTreatmentTypes,

  // Anaerobic Digester (2 types)
  ...SevernTrentAnaerobicDigesterTypes,

  // Sludge Handling (3 types)
  ...SevernTrentSludgeHandlingTypes,

  // Odor Control (2 types)
  ...SevernTrentOdorControlTypes,
} as const;

// ============================================================================
// Component Registry
// ============================================================================









export const SevernTrentComponentRegistry = {
  // Biological Treatment
  [SevernTrentBiologicalTreatmentTypes.ACTIVATED_SLUDGE_TANK]: ActivatedSludgeTankNode,
  [SevernTrentBiologicalTreatmentTypes.TRICKLING_FILTER]: TricklingFilterNode,
  [SevernTrentBiologicalTreatmentTypes.SBR_REACTOR]: SBRReactorNode,

  // Anaerobic Digester
  [SevernTrentAnaerobicDigesterTypes.ANAEROBIC_DIGESTER]: AnaerobicDigesterNode,
  [SevernTrentAnaerobicDigesterTypes.STORM_TANK]: StormTankNode,

  // Sludge Handling
  [SevernTrentSludgeHandlingTypes.SLUDGE_THICKENER]: SludgeThickenerNode,
  [SevernTrentSludgeHandlingTypes.CENTRIFUGE]: CentrifugeNode,
  [SevernTrentSludgeHandlingTypes.BELT_FILTER_PRESS]: BeltFilterPressNode,

  // Odor Control
  [SevernTrentOdorControlTypes.BIOFILTER]: BiofilterNode,
  [SevernTrentOdorControlTypes.CHEMICAL_SCRUBBER]: ChemicalScrubberNode,
} as const;

// ============================================================================
// Metadata Registry
// ============================================================================

export interface SevernTrentSymbolMetadata {
  id: string;
  name: string;
  category: 'Biological Treatment' | 'Anaerobic Digestion' | 'Sludge Handling' | 'Odor Control';
  description: string;
  component: React.ComponentType<any>;
  defaultData: Record<string, any>;
  dimensions: {
    width: number;
    height: number;
  };
  tags: string[];
  standard: 'ST-ES-2024';
  applications: string[];
  typicalCapacity?: string;
}

export const SevernTrentMetadataRegistry: Record<string, SevernTrentSymbolMetadata> = {
  // Biological Treatment
  [SevernTrentBiologicalTreatmentTypes.ACTIVATED_SLUDGE_TANK]: {
    id: SevernTrentBiologicalTreatmentTypes.ACTIVATED_SLUDGE_TANK,
    name: 'Activated Sludge Tank',
    category: 'Biological Treatment',
    description: 'Activated sludge aeration tank with fine bubble diffused aeration system',
    component: ActivatedSludgeTankNode,
    defaultData: {
      treatmentType: 'activated-sludge',
      aerationSystem: 'fine-bubble-diffused',
      mlss: 3500,
      srt: 15,
      doSetpoint: 2.0,
      currentDO: 2.0,
    },
    dimensions: { width: 160, height: 155 },
    tags: ['biological', 'activated-sludge', 'aeration', 'diffuser', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Secondary Treatment', 'Biological Nutrient Removal', 'Extended Aeration'],
    typicalCapacity: '2000-4000 mg/L MLSS, 10-25 days SRT',
  },

  [SevernTrentBiologicalTreatmentTypes.TRICKLING_FILTER]: {
    id: SevernTrentBiologicalTreatmentTypes.TRICKLING_FILTER,
    name: 'Trickling Filter',
    category: 'Biological Treatment',
    description: 'Trickling filter with rotating distributor for fixed film biological treatment',
    component: TricklingFilterNode,
    defaultData: {
      treatmentType: 'trickling-filter',
      tricklingFilterType: 'high-rate',
      diameter: 25,
      height: 2,
      hydraulicLoading: 2.5,
      distributorSpeed: 1.5,
      isDistributorRotating: true,
    },
    dimensions: { width: 160, height: 165 },
    tags: ['biological', 'trickling-filter', 'rotating-distributor', 'fixed-film', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Secondary Treatment', 'Nitrification', 'Roughing Filter'],
    typicalCapacity: '1-4 m³/m²/day hydraulic loading',
  },

  [SevernTrentBiologicalTreatmentTypes.SBR_REACTOR]: {
    id: SevernTrentBiologicalTreatmentTypes.SBR_REACTOR,
    name: 'SBR Reactor',
    category: 'Biological Treatment',
    description: 'Sequencing Batch Reactor with automated fill-react-settle-decant cycle',
    component: SBRReactorNode,
    defaultData: {
      treatmentType: 'sbr',
      sbrPhase: 'react',
      cycleTime: 240,
      fillTime: 60,
      reactTime: 120,
      settleTime: 45,
      decantTime: 15,
    },
    dimensions: { width: 180, height: 155 },
    tags: ['biological', 'sbr', 'sequencing-batch-reactor', 'decanter', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Secondary Treatment', 'Nutrient Removal', 'Batch Processing'],
    typicalCapacity: '4-6 hour cycle time',
  },

  // Anaerobic Digestion
  [SevernTrentAnaerobicDigesterTypes.ANAEROBIC_DIGESTER]: {
    id: SevernTrentAnaerobicDigesterTypes.ANAEROBIC_DIGESTER,
    name: 'Anaerobic Digester',
    category: 'Anaerobic Digestion',
    description: 'Mesophilic anaerobic digester with gas recirculation mixing and biogas collection',
    component: AnaerobicDigesterNode,
    defaultData: {
      digesterType: 'mesophilic',
      mixingSystem: 'gas-recirculation',
      diameter: 20,
      height: 10,
      workingVolume: 3000,
      temperature: 35,
      hrt: 20,
      gasProduction: 1000,
      methaneContent: 65,
      isHeated: true,
      isMixing: true,
    },
    dimensions: { width: 180, height: 155 },
    tags: ['anaerobic', 'digester', 'biogas', 'sludge-treatment', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Sludge Stabilization', 'Biogas Generation', 'Volume Reduction'],
    typicalCapacity: '2000-4000 m³, 15-25 days HRT',
  },

  [SevernTrentAnaerobicDigesterTypes.STORM_TANK]: {
    id: SevernTrentAnaerobicDigesterTypes.STORM_TANK,
    name: 'Storm Tank',
    category: 'Anaerobic Digestion',
    description: 'Storm water storage tank with overflow weir and level monitoring',
    component: StormTankNode,
    defaultData: {
      tankType: 'storm',
      length: 30,
      width: 15,
      depth: 5,
      volume: 2250,
      overflowLevel: 4.5,
      alarmLevel: 4.0,
      currentLevel: 2.0,
    },
    dimensions: { width: 190, height: 155 },
    tags: ['storm', 'storage', 'overflow', 'level-control', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Storm Water Storage', 'Flow Equalization', 'Emergency Storage'],
    typicalCapacity: '1000-5000 m³',
  },

  // Sludge Handling
  [SevernTrentSludgeHandlingTypes.SLUDGE_THICKENER]: {
    id: SevernTrentSludgeHandlingTypes.SLUDGE_THICKENER,
    name: 'Sludge Thickener',
    category: 'Sludge Handling',
    description: 'Gravity sludge thickener with rotating rake mechanism and polymer addition',
    component: SludgeThickenerNode,
    defaultData: {
      handlingType: 'gravity-thickener',
      thickenerType: 'gravity',
      diameter: 15,
      feedSolids: 1.5,
      underflowSolids: 4.0,
      polymerDose: 3.0,
      isRunning: true,
    },
    dimensions: { width: 160, height: 165 },
    tags: ['sludge', 'thickener', 'gravity', 'polymer', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['WAS Thickening', 'Primary Sludge Thickening', 'Volume Reduction'],
    typicalCapacity: '1.5-2% feed to 4-6% underflow',
  },

  [SevernTrentSludgeHandlingTypes.CENTRIFUGE]: {
    id: SevernTrentSludgeHandlingTypes.CENTRIFUGE,
    name: 'Centrifuge',
    category: 'Sludge Handling',
    description: 'Solid bowl decanter centrifuge for sludge dewatering with polymer conditioning',
    component: CentrifugeNode,
    defaultData: {
      handlingType: 'centrifuge',
      centrifugeType: 'solid-bowl',
      bowlSpeed: 3200,
      gForce: 3000,
      throughput: 30,
      cakeSolids: 22,
      isRunning: true,
    },
    dimensions: { width: 180, height: 130 },
    tags: ['sludge', 'centrifuge', 'dewatering', 'solid-bowl', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Sludge Dewatering', 'Cake Production', 'Centrate Separation'],
    typicalCapacity: '20-40 m³/hr, 18-25% cake solids',
  },

  [SevernTrentSludgeHandlingTypes.BELT_FILTER_PRESS]: {
    id: SevernTrentSludgeHandlingTypes.BELT_FILTER_PRESS,
    name: 'Belt Filter Press',
    category: 'Sludge Handling',
    description: 'Belt filter press with gravity drainage, low/high pressure zones, and belt wash',
    component: BeltFilterPressNode,
    defaultData: {
      handlingType: 'belt-press',
      beltSpeed: 3.0,
      pressureZones: 3,
      cakeSolids: 20,
      isRunning: true,
    },
    dimensions: { width: 185, height: 125 },
    tags: ['sludge', 'belt-press', 'dewatering', 'pressure', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Sludge Dewatering', 'Continuous Operation', 'Municipal Wastewater'],
    typicalCapacity: '15-25% cake solids',
  },

  // Odor Control
  [SevernTrentOdorControlTypes.BIOFILTER]: {
    id: SevernTrentOdorControlTypes.BIOFILTER,
    name: 'Biofilter',
    category: 'Odor Control',
    description: 'Biological odor filter with organic media bed and moisture control',
    component: BiofilterNode,
    defaultData: {
      controlType: 'biofilter',
      biofilterMedia: 'compost',
      mediaDepth: 1.5,
      bedArea: 100,
      emptyBedContactTime: 60,
      moistureContent: 50,
      h2sInlet: 100,
      h2sOutlet: 1,
      removalEfficiency: 99,
      isRunning: true,
    },
    dimensions: { width: 195, height: 175 },
    tags: ['odor-control', 'biofilter', 'biological', 'h2s-removal', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Odor Control', 'H2S Removal', 'Biological Treatment'],
    typicalCapacity: '95-99% H2S removal, 45-75 sec EBCT',
  },

  [SevernTrentOdorControlTypes.CHEMICAL_SCRUBBER]: {
    id: SevernTrentOdorControlTypes.CHEMICAL_SCRUBBER,
    name: 'Chemical Scrubber',
    category: 'Odor Control',
    description: 'Packed tower chemical scrubber with caustic dosing for acid gas removal',
    component: ChemicalScrubberNode,
    defaultData: {
      controlType: 'chemical-scrubber',
      scrubberType: 'packed-tower',
      scrubberChemical: 'sodium-hydroxide',
      liquidFlowRate: 200,
      gasFlowRate: 5000,
      pHSetpoint: 10.0,
      currentpH: 10.0,
      h2sInlet: 200,
      h2sOutlet: 0.5,
      isRunning: true,
    },
    dimensions: { width: 185, height: 170 },
    tags: ['odor-control', 'chemical-scrubber', 'packed-tower', 'caustic', 'severn-trent'],
    standard: 'ST-ES-2024',
    applications: ['Odor Control', 'Acid Gas Removal', 'H2S Scrubbing'],
    typicalCapacity: '99+% H2S removal',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all Severn Trent symbols by category
 */
export function getSevernTrentSymbolsByCategory(
  category: 'Biological Treatment' | 'Anaerobic Digestion' | 'Sludge Handling' | 'Odor Control'
): SevernTrentSymbolMetadata[] {
  return Object.values(SevernTrentMetadataRegistry).filter(
    (metadata) => metadata.category === category
  );
}

/**
 * Search Severn Trent symbols by application
 */
export function searchSevernTrentSymbolsByApplication(
  application: string
): SevernTrentSymbolMetadata[] {
  const searchTerm = application.toLowerCase();
  return Object.values(SevernTrentMetadataRegistry).filter((metadata) =>
    metadata.applications.some((app) => app.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get Severn Trent symbol by ID
 */
export function getSevernTrentSymbol(id: string): SevernTrentSymbolMetadata | undefined {
  return SevernTrentMetadataRegistry[id];
}

/**
 * Get all Severn Trent symbol IDs
 */
export function getAllSevernTrentSymbolIds(): string[] {
  return Object.keys(SevernTrentMetadataRegistry);
}

/**
 * Get Severn Trent symbol count
 */
export function getSevernTrentSymbolCount(): number {
  return Object.keys(SevernTrentMetadataRegistry).length;
}

// ============================================================================
// Summary
// ============================================================================

/**
 * Severn Trent Symbol Library Summary
 *
 * Total Symbols: 10
 *
 * Categories:
 * - Biological Treatment: 3 symbols (Activated Sludge, Trickling Filter, SBR)
 * - Anaerobic Digestion: 2 symbols (Anaerobic Digester, Storm Tank)
 * - Sludge Handling: 3 symbols (Thickener, Centrifuge, Belt Press)
 * - Odor Control: 2 symbols (Biofilter, Chemical Scrubber)
 *
 * Standard: ST-ES-2024 (Severn Trent Engineering Standards 2024)
 *
 * Applications:
 * - Sewage Treatment Plants
 * - Biological Treatment
 * - Sludge Stabilization and Dewatering
 * - Odor Control Systems
 * - Storm Water Management
 */
