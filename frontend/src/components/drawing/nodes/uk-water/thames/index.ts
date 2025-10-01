/**
 * Thames Water Treatment Plant Symbol Library
 *
 * Standard: Thames Water TW-STD-2023
 * Category: UK Water Industry Symbols
 *
 * This module provides a comprehensive set of P&ID symbols specifically
 * for Thames Water treatment facilities including clarifiers, filters,
 * disinfection systems, and pumping stations.
 */

// ============================================================================
// Component Exports
// ============================================================================

export {
  // Clarifier Components
  PrimaryClarifierNode,
  SecondaryClarifierNode,
  RectangularClarifierNode,
  LamellaClarifierNode,
  ThamesWaterClarifierComponents,
  ThamesWaterClarifierTypes,
  type ClarifierNodeData,
  type ClarifierType,
  type RakeMechanism,
  type SludgeRemoval,
} from './ClarifierComponents';

export {
  // Filter Components
  RapidGravityFilterNode,
  GACFilterNode,
  SandFilterNode,
  MembraneFilterNode,
  ThamesWaterFilterComponents,
  ThamesWaterFilterTypes,
  type FilterNodeData,
  type FilterType,
  type BackwashSystem,
  type MediaConfiguration,
  type MembraneType,
  type FilterMode,
} from './FilterComponents';

export {
  // Disinfection Components
  ChlorineContactTankNode,
  UVDisinfectionChamberNode,
  OzoneContactVesselNode,
  ThamesWaterDisinfectionComponents,
  ThamesWaterDisinfectionTypes,
  type DisinfectionNodeData,
  type DisinfectionType,
  type ChlorineType,
  type UVLampType,
  type OzoneGenerationType,
  type DisinfectionMode,
} from './DisinfectionComponents';

export {
  // Pumping Station Components
  WetWellNode,
  SubmersiblePumpStationNode,
  DryWellPumpStationNode,
  ThamesWaterPumpingStationComponents,
  ThamesWaterPumpingStationTypes,
  type PumpingStationNodeData,
  type PumpingStationType,
  type PumpConfiguration,
  type PumpType,
  type LevelControlType,
  type PumpStatus,
} from './PumpingStationComponents';

// ============================================================================
// Symbol Type Registry
// ============================================================================

import { ThamesWaterClarifierTypes ,
  PrimaryClarifierNode,
  SecondaryClarifierNode,
  RectangularClarifierNode,
  LamellaClarifierNode,
} from './ClarifierComponents';
import { ThamesWaterFilterTypes ,
  RapidGravityFilterNode,
  GACFilterNode,
  SandFilterNode,
  MembraneFilterNode,
} from './FilterComponents';
import { ThamesWaterDisinfectionTypes ,
  ChlorineContactTankNode,
  UVDisinfectionChamberNode,
  OzoneContactVesselNode,
} from './DisinfectionComponents';
import { ThamesWaterPumpingStationTypes ,
  WetWellNode,
  SubmersiblePumpStationNode,
  DryWellPumpStationNode,
} from './PumpingStationComponents';

export const ThamesWaterSymbolTypes = {
  // Clarifiers (4 types)
  ...ThamesWaterClarifierTypes,

  // Filters (4 types)
  ...ThamesWaterFilterTypes,

  // Disinfection (3 types)
  ...ThamesWaterDisinfectionTypes,

  // Pumping Stations (3 types)
  ...ThamesWaterPumpingStationTypes,
} as const;

// ============================================================================
// Component Registry
// ============================================================================









export const ThamesWaterComponentRegistry = {
  // Clarifiers
  [ThamesWaterClarifierTypes.PRIMARY_CLARIFIER]: PrimaryClarifierNode,
  [ThamesWaterClarifierTypes.SECONDARY_CLARIFIER]: SecondaryClarifierNode,
  [ThamesWaterClarifierTypes.RECTANGULAR_CLARIFIER]: RectangularClarifierNode,
  [ThamesWaterClarifierTypes.LAMELLA_CLARIFIER]: LamellaClarifierNode,

  // Filters
  [ThamesWaterFilterTypes.RAPID_GRAVITY_FILTER]: RapidGravityFilterNode,
  [ThamesWaterFilterTypes.GAC_FILTER]: GACFilterNode,
  [ThamesWaterFilterTypes.SAND_FILTER]: SandFilterNode,
  [ThamesWaterFilterTypes.MEMBRANE_FILTER]: MembraneFilterNode,

  // Disinfection
  [ThamesWaterDisinfectionTypes.CHLORINE_CONTACT_TANK]: ChlorineContactTankNode,
  [ThamesWaterDisinfectionTypes.UV_DISINFECTION_CHAMBER]: UVDisinfectionChamberNode,
  [ThamesWaterDisinfectionTypes.OZONE_CONTACT_VESSEL]: OzoneContactVesselNode,

  // Pumping Stations
  [ThamesWaterPumpingStationTypes.WET_WELL]: WetWellNode,
  [ThamesWaterPumpingStationTypes.SUBMERSIBLE_PUMP_STATION]: SubmersiblePumpStationNode,
  [ThamesWaterPumpingStationTypes.DRY_WELL_PUMP_STATION]: DryWellPumpStationNode,
} as const;

// ============================================================================
// Metadata Registry
// ============================================================================

export interface ThamesWaterSymbolMetadata {
  id: string;
  name: string;
  category: 'Clarification' | 'Filtration' | 'Disinfection' | 'Pumping';
  description: string;
  component: React.ComponentType<any>;
  defaultData: Record<string, any>;
  dimensions: {
    width: number;
    height: number;
  };
  tags: string[];
  standard: 'TW-STD-2023';
  applications: string[];
  typicalCapacity?: string;
}

export const ThamesWaterMetadataRegistry: Record<string, ThamesWaterSymbolMetadata> = {
  // Clarifiers
  [ThamesWaterClarifierTypes.PRIMARY_CLARIFIER]: {
    id: ThamesWaterClarifierTypes.PRIMARY_CLARIFIER,
    name: 'Primary Clarifier',
    category: 'Clarification',
    description: 'Circular primary sedimentation tank with center-feed well and rotating rake mechanism',
    component: PrimaryClarifierNode,
    defaultData: {
      clarifierType: 'primary',
      rakeMechanism: 'center-feed',
      diameter: 30,
      depth: 4,
      overflowRate: 1.2,
      hasSkimmer: true,
    },
    dimensions: { width: 100, height: 130 },
    tags: ['clarifier', 'primary', 'sedimentation', 'thames', 'wastewater'],
    standard: 'TW-STD-2023',
    applications: ['Primary Treatment', 'Wastewater Treatment', 'Sewage Treatment'],
    typicalCapacity: '30-35m diameter, 4-5m depth',
  },

  [ThamesWaterClarifierTypes.SECONDARY_CLARIFIER]: {
    id: ThamesWaterClarifierTypes.SECONDARY_CLARIFIER,
    name: 'Secondary Clarifier',
    category: 'Clarification',
    description: 'Circular secondary clarifier for activated sludge process with RAS/WAS withdrawal',
    component: SecondaryClarifierNode,
    defaultData: {
      clarifierType: 'secondary',
      rakeMechanism: 'peripheral-feed',
      diameter: 35,
      depth: 4.5,
      overflowRate: 0.8,
      hasRAS: true,
      hasWAS: true,
    },
    dimensions: { width: 100, height: 130 },
    tags: ['clarifier', 'secondary', 'activated-sludge', 'ras', 'was', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Secondary Treatment', 'Activated Sludge', 'Biological Treatment'],
    typicalCapacity: '35m diameter, 4.5m depth',
  },

  [ThamesWaterClarifierTypes.RECTANGULAR_CLARIFIER]: {
    id: ThamesWaterClarifierTypes.RECTANGULAR_CLARIFIER,
    name: 'Rectangular Clarifier',
    category: 'Clarification',
    description: 'Rectangular sedimentation tank with traveling bridge scraper mechanism',
    component: RectangularClarifierNode,
    defaultData: {
      clarifierType: 'rectangular',
      rakeMechanism: 'bridge-scraper',
      length: 40,
      width: 10,
      depth: 4,
      hasOutletWeir: true,
    },
    dimensions: { width: 120, height: 120 },
    tags: ['clarifier', 'rectangular', 'bridge-scraper', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Primary Treatment', 'Secondary Treatment', 'Industrial Wastewater'],
    typicalCapacity: '40m × 10m × 4m deep',
  },

  [ThamesWaterClarifierTypes.LAMELLA_CLARIFIER]: {
    id: ThamesWaterClarifierTypes.LAMELLA_CLARIFIER,
    name: 'Lamella Clarifier',
    category: 'Clarification',
    description: 'High-rate clarifier with inclined plate settlers for compact design',
    component: LamellaClarifierNode,
    defaultData: {
      clarifierType: 'lamella',
      plateAngle: 60,
      plateSpacing: 50,
      overflowRate: 3.5,
      isUpflow: true,
    },
    dimensions: { width: 90, height: 120 },
    tags: ['clarifier', 'lamella', 'plate-settler', 'high-rate', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Tertiary Treatment', 'Compact Design', 'Upgrading Existing Plants'],
    typicalCapacity: '3-5 m³/m²/hr surface loading',
  },

  // Filters
  [ThamesWaterFilterTypes.RAPID_GRAVITY_FILTER]: {
    id: ThamesWaterFilterTypes.RAPID_GRAVITY_FILTER,
    name: 'Rapid Gravity Filter',
    category: 'Filtration',
    description: 'Dual-media filter with air scour backwash system',
    component: RapidGravityFilterNode,
    defaultData: {
      filterType: 'rapid-gravity',
      mediaConfiguration: 'dual-media',
      backwashSystem: 'air-scour-water',
      filtrationRate: 7.5,
      mediaDepth: 1.8,
    },
    dimensions: { width: 100, height: 130 },
    tags: ['filter', 'rapid-gravity', 'dual-media', 'backwash', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Tertiary Treatment', 'Potable Water', 'Effluent Polishing'],
    typicalCapacity: '5-10 m³/m²/hr filtration rate',
  },

  [ThamesWaterFilterTypes.GAC_FILTER]: {
    id: ThamesWaterFilterTypes.GAC_FILTER,
    name: 'GAC Filter',
    category: 'Filtration',
    description: 'Granular Activated Carbon filter for organics and taste/odor removal',
    component: GACFilterNode,
    defaultData: {
      filterType: 'gac',
      mediaConfiguration: 'gac',
      mediaDepth: 2.5,
      filtrationRate: 5.0,
    },
    dimensions: { width: 100, height: 130 },
    tags: ['filter', 'gac', 'carbon', 'organics', 'adsorption', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Advanced Treatment', 'Organics Removal', 'Taste & Odor Control'],
    typicalCapacity: '2.5m GAC bed depth',
  },

  [ThamesWaterFilterTypes.SAND_FILTER]: {
    id: ThamesWaterFilterTypes.SAND_FILTER,
    name: 'Sand Filter',
    category: 'Filtration',
    description: 'Sand filter with air scour for effective particle removal',
    component: SandFilterNode,
    defaultData: {
      filterType: 'sand',
      mediaConfiguration: 'single-media',
      hasAirScour: true,
      filtrationRate: 6.0,
    },
    dimensions: { width: 100, height: 130 },
    tags: ['filter', 'sand', 'air-scour', 'particle-removal', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Potable Water', 'Tertiary Treatment', 'Storm Water'],
    typicalCapacity: '5-8 m³/m²/hr filtration rate',
  },

  [ThamesWaterFilterTypes.MEMBRANE_FILTER]: {
    id: ThamesWaterFilterTypes.MEMBRANE_FILTER,
    name: 'Membrane Filter',
    category: 'Filtration',
    description: 'Hollow fiber membrane filter with CIP system',
    component: MembraneFilterNode,
    defaultData: {
      filterType: 'membrane',
      membraneType: 'hollow-fiber',
      hasCIP: true,
      permeateFlux: 60,
      tmpOperating: 50,
    },
    dimensions: { width: 100, height: 140 },
    tags: ['filter', 'membrane', 'ultrafiltration', 'cip', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Advanced Treatment', 'MBR', 'Ultrafiltration', 'Water Reuse'],
    typicalCapacity: '40-80 LMH permeate flux',
  },

  // Disinfection
  [ThamesWaterDisinfectionTypes.CHLORINE_CONTACT_TANK]: {
    id: ThamesWaterDisinfectionTypes.CHLORINE_CONTACT_TANK,
    name: 'Chlorine Contact Tank',
    category: 'Disinfection',
    description: 'Serpentine baffled contact tank for chlorine disinfection',
    component: ChlorineContactTankNode,
    defaultData: {
      disinfectionType: 'chlorine-contact',
      chlorineType: 'gas-chlorine',
      baffleCount: 6,
      contactTime: 30,
      chlorineDose: 2.0,
    },
    dimensions: { width: 160, height: 120 },
    tags: ['disinfection', 'chlorine', 'contact-tank', 'baffled', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Disinfection', 'Effluent Treatment', 'Potable Water'],
    typicalCapacity: '30-60 min contact time',
  },

  [ThamesWaterDisinfectionTypes.UV_DISINFECTION_CHAMBER]: {
    id: ThamesWaterDisinfectionTypes.UV_DISINFECTION_CHAMBER,
    name: 'UV Disinfection Chamber',
    category: 'Disinfection',
    description: 'UV lamp banks for chemical-free disinfection',
    component: UVDisinfectionChamberNode,
    defaultData: {
      disinfectionType: 'uv-chamber',
      uvLampType: 'low-pressure-high-output',
      lampBanks: 3,
      uvIntensity: 40,
      uvTransmittance: 75,
    },
    dimensions: { width: 140, height: 110 },
    tags: ['disinfection', 'uv', 'ultraviolet', 'lamps', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Disinfection', 'Effluent Discharge', 'Water Reuse'],
    typicalCapacity: '40+ mJ/cm² UV dose',
  },

  [ThamesWaterDisinfectionTypes.OZONE_CONTACT_VESSEL]: {
    id: ThamesWaterDisinfectionTypes.OZONE_CONTACT_VESSEL,
    name: 'Ozone Contact Vessel',
    category: 'Disinfection',
    description: 'Ozone generator with contact vessel and off-gas destruction',
    component: OzoneContactVesselNode,
    defaultData: {
      disinfectionType: 'ozone-contact',
      ozoneGenerationType: 'corona-discharge',
      ozoneDose: 5.0,
      contactTime_ozone: 10,
      offGasDestruction: true,
    },
    dimensions: { width: 180, height: 155 },
    tags: ['disinfection', 'ozone', 'advanced-oxidation', 'corona', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Advanced Disinfection', 'Oxidation', 'Color Removal'],
    typicalCapacity: '3-8 mg/L ozone dose',
  },

  // Pumping Stations
  [ThamesWaterPumpingStationTypes.WET_WELL]: {
    id: ThamesWaterPumpingStationTypes.WET_WELL,
    name: 'Wet Well',
    category: 'Pumping',
    description: 'Wet well with level control and submersible pumps',
    component: WetWellNode,
    defaultData: {
      stationType: 'wet-well',
      levelControlType: 'ultrasonic',
      pumpCount: 2,
      diameter: 3,
      depth: 5,
      pumpConfiguration: 'duty-standby',
    },
    dimensions: { width: 140, height: 145 },
    tags: ['pumping', 'wet-well', 'level-control', 'submersible', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Pumping Stations', 'Wastewater Lift', 'Collection Systems'],
    typicalCapacity: '3-5m diameter wet well',
  },

  [ThamesWaterPumpingStationTypes.SUBMERSIBLE_PUMP_STATION]: {
    id: ThamesWaterPumpingStationTypes.SUBMERSIBLE_PUMP_STATION,
    name: 'Submersible Pump Station',
    category: 'Pumping',
    description: 'Complete submersible pumping station with duty/standby configuration',
    component: SubmersiblePumpStationNode,
    defaultData: {
      stationType: 'submersible-pump-station',
      pumpConfiguration: 'duty-assist-standby',
      pumpCount: 3,
      hasVFD: true,
      hasTelemetry: true,
    },
    dimensions: { width: 160, height: 170 },
    tags: ['pumping', 'submersible', 'station', 'duty-standby', 'vfd', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['Municipal Pumping', 'Sewage Pumping', 'Effluent Discharge'],
    typicalCapacity: 'Duty/Assist/Standby configuration',
  },

  [ThamesWaterPumpingStationTypes.DRY_WELL_PUMP_STATION]: {
    id: ThamesWaterPumpingStationTypes.DRY_WELL_PUMP_STATION,
    name: 'Dry Well Pump Station',
    category: 'Pumping',
    description: 'Dry well pump station with horizontal centrifugal pumps',
    component: DryWellPumpStationNode,
    defaultData: {
      stationType: 'dry-well-pump-station',
      pumpType: 'horizontal-centrifugal',
      pumpConfiguration: 'duty-standby',
      pumpCount: 2,
    },
    dimensions: { width: 160, height: 145 },
    tags: ['pumping', 'dry-well', 'centrifugal', 'horizontal', 'thames'],
    standard: 'TW-STD-2023',
    applications: ['High Head Pumping', 'Clean Water', 'Process Pumping'],
    typicalCapacity: 'Horizontal centrifugal duty/standby',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all Thames Water symbols by category
 */
export function getThamesWaterSymbolsByCategory(
  category: 'Clarification' | 'Filtration' | 'Disinfection' | 'Pumping'
): ThamesWaterSymbolMetadata[] {
  return Object.values(ThamesWaterMetadataRegistry).filter(
    (metadata) => metadata.category === category
  );
}

/**
 * Search Thames Water symbols by application
 */
export function searchThamesWaterSymbolsByApplication(
  application: string
): ThamesWaterSymbolMetadata[] {
  const searchTerm = application.toLowerCase();
  return Object.values(ThamesWaterMetadataRegistry).filter((metadata) =>
    metadata.applications.some((app) => app.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get Thames Water symbol by ID
 */
export function getThamesWaterSymbol(id: string): ThamesWaterSymbolMetadata | undefined {
  return ThamesWaterMetadataRegistry[id];
}

/**
 * Get all Thames Water symbol IDs
 */
export function getAllThamesWaterSymbolIds(): string[] {
  return Object.keys(ThamesWaterMetadataRegistry);
}

/**
 * Get Thames Water symbol count
 */
export function getThamesWaterSymbolCount(): number {
  return Object.keys(ThamesWaterMetadataRegistry).length;
}

// ============================================================================
// Summary
// ============================================================================

/**
 * Thames Water Symbol Library Summary
 *
 * Total Symbols: 14
 *
 * Categories:
 * - Clarification: 4 symbols (Primary, Secondary, Rectangular, Lamella)
 * - Filtration: 4 symbols (Rapid Gravity, GAC, Sand, Membrane)
 * - Disinfection: 3 symbols (Chlorine, UV, Ozone)
 * - Pumping: 3 symbols (Wet Well, Submersible Station, Dry Well Station)
 *
 * Standard: TW-STD-2023 (Thames Water Standard 2023)
 *
 * Applications:
 * - Wastewater Treatment Plants
 * - Potable Water Treatment
 * - Tertiary Treatment
 * - Advanced Treatment
 * - Pumping Stations
 * - Effluent Discharge Systems
 */
