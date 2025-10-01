/**
 * Specialty Heat Exchangers
 * Plate, air-cooled, condensers, reboilers, and specialty types
 */

import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { HeatExchangerNodeData } from '../vessels/HeatExchangerNode';
import HeatExchangerNode from '../vessels/HeatExchangerNode';

// ============================================================================
// PLATE HEAT EXCHANGERS
// ============================================================================

export interface PlateHeatExchangerData extends HeatExchangerNodeData {
  plateType?: 'gasketed' | 'brazed' | 'welded' | 'semi-welded';
  numberOfPlates?: number;
  plateSpacing?: number;
  plateMaterial?: string;
  gasketMaterial?: string;
  chevronAngle?: number;
}

/**
 * Gasketed Plate Heat Exchanger
 */
export const GaskettedPlateHeatExchanger = memo<NodeProps<PlateHeatExchangerData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'plate',
      plateType: 'gasketed',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

GaskettedPlateHeatExchanger.displayName = 'GaskettedPlateHeatExchanger';

/**
 * Brazed Plate Heat Exchanger
 */
export const BrazedPlateHeatExchanger = memo<NodeProps<PlateHeatExchangerData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'plate',
      plateType: 'brazed',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

BrazedPlateHeatExchanger.displayName = 'BrazedPlateHeatExchanger';

// ============================================================================
// AIR COOLED HEAT EXCHANGERS
// ============================================================================

export interface AirCooledHeatExchangerData extends HeatExchangerNodeData {
  coolerType?: 'forced-draft' | 'induced-draft';
  numberOfFans?: number;
  fanDiameter?: number;
  finType?: 'plain' | 'serrated' | 'studded' | 'embedded';
  finDensity?: number; // fins per inch
  numberOfBundles?: number;
}

/**
 * Forced Draft Air Cooler
 */
export const ForcedDraftAirCooler = memo<NodeProps<AirCooledHeatExchangerData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'air_cooled',
      coolerType: 'forced-draft',
      showFins: true,
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

ForcedDraftAirCooler.displayName = 'ForcedDraftAirCooler';

/**
 * Induced Draft Air Cooler
 */
export const InducedDraftAirCooler = memo<NodeProps<AirCooledHeatExchangerData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'air_cooled',
      coolerType: 'induced-draft',
      showFins: true,
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

InducedDraftAirCooler.displayName = 'InducedDraftAirCooler';

// ============================================================================
// CONDENSERS
// ============================================================================

export interface CondenserData extends HeatExchangerNodeData {
  condenserType?: 'surface' | 'barometric' | 'jet' | 'air-cooled';
  vacuumSystem?: boolean;
  subcooling?: boolean;
}

/**
 * Surface Condenser
 */
export const SurfaceCondenser = memo<NodeProps<CondenserData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'shell_and_tube',
      condenserType: 'surface',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

SurfaceCondenser.displayName = 'SurfaceCondenser';

/**
 * Air-Cooled Condenser
 */
export const AirCooledCondenser = memo<NodeProps<CondenserData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'air_cooled',
      condenserType: 'air-cooled',
      showFins: true,
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

AirCooledCondenser.displayName = 'AirCooledCondenser';

// ============================================================================
// REBOILERS
// ============================================================================

export interface ReboilerData extends HeatExchangerNodeData {
  reboilerType?: 'kettle' | 'thermosiphon' | 'forced-circulation' | 'internal';
  circulation?: 'natural' | 'forced';
  vaporFraction?: number;
}

/**
 * Kettle Reboiler
 */
export const KettleReboiler = memo<NodeProps<ReboilerData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'kettle',
      reboilerType: 'kettle',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

KettleReboiler.displayName = 'KettleReboiler';

/**
 * Thermosiphon Reboiler
 */
export const ThermosiphonReboiler = memo<NodeProps<ReboilerData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'shell_and_tube',
      reboilerType: 'thermosiphon',
      circulation: 'natural',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

ThermosiphonReboiler.displayName = 'ThermosiphonReboiler';

/**
 * Forced Circulation Reboiler
 */
export const ForcedCirculationReboiler = memo<NodeProps<ReboilerData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'shell_and_tube',
      reboilerType: 'forced-circulation',
      circulation: 'forced',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

ForcedCirculationReboiler.displayName = 'ForcedCirculationReboiler';

// ============================================================================
// SPECIALTY EXCHANGERS
// ============================================================================

/**
 * Spiral Heat Exchanger
 */
export const SpiralHeatExchanger = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'spiral',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

SpiralHeatExchanger.displayName = 'SpiralHeatExchanger';

/**
 * Double Pipe Heat Exchanger
 */
export const DoublePipeHeatExchanger = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'double_pipe',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

DoublePipeHeatExchanger.displayName = 'DoublePipeHeatExchanger';

/**
 * Scraped Surface Heat Exchanger
 */
export const ScrapedSurfaceHeatExchanger = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'double_pipe',
      // Special visual representation would go here
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

ScrapedSurfaceHeatExchanger.displayName = 'ScrapedSurfaceHeatExchanger';

/**
 * Printed Circuit Heat Exchanger (PCHE)
 */
export const PrintedCircuitHeatExchanger = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'plate',
      // Compact high-pressure design
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

PrintedCircuitHeatExchanger.displayName = 'PrintedCircuitHeatExchanger';

// ============================================================================
// OTHER HEAT TRANSFER EQUIPMENT
// ============================================================================

/**
 * Economizer
 */
export const Economizer = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'shell_and_tube',
      // Waste heat recovery application
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

Economizer.displayName = 'Economizer';

/**
 * Vaporizer
 */
export const Vaporizer = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'shell_and_tube',
      // Vaporization application
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

Vaporizer.displayName = 'Vaporizer';

/**
 * Cooler (General)
 */
export const Cooler = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'shell_and_tube',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

Cooler.displayName = 'Cooler';

/**
 * Heater (General)
 */
export const Heater = memo<NodeProps<HeatExchangerNodeData>>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'shell_and_tube',
    };

    return (
      <HeatExchangerNode
        id={id}
        data={exchangerData}
        selected={selected}
        dragging={dragging}
      />
    );
  }
);

Heater.displayName = 'Heater';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get heat exchanger type recommendations
 */
export function getHeatExchangerRecommendations(serviceType: string): string[] {
  const recommendations: Record<string, string[]> = {
    'high-fouling': ['Plate (Gasketed)', 'Spiral', 'Double Pipe'],
    'high-pressure': ['Shell and Tube (TEMA)', 'Printed Circuit'],
    'high-temperature': ['Shell and Tube', 'Brazed Plate'],
    'gas-cooling': ['Air Cooled', 'Plate-Fin'],
    'vaporization': ['Kettle Reboiler', 'Thermosiphon', 'Forced Circulation'],
    'condensation': ['Surface Condenser', 'Air-Cooled Condenser'],
    'viscous-fluids': ['Scraped Surface', 'Spiral', 'Wide-gap Plate'],
    'compact-space': ['Plate (Brazed)', 'Printed Circuit', 'Spiral'],
  };

  return recommendations[serviceType] || ['Shell and Tube (General Purpose)'];
}

/**
 * Calculate heat exchanger duty
 */
export function calculateDuty(
  flowRate: number,
  specificHeat: number,
  tempIn: number,
  tempOut: number
): number {
  return flowRate * specificHeat * (tempOut - tempIn);
}

/**
 * Calculate LMTD (Log Mean Temperature Difference)
 */
export function calculateLMTD(
  hotIn: number,
  hotOut: number,
  coldIn: number,
  coldOut: number
): number {
  const dt1 = hotIn - coldOut;
  const dt2 = hotOut - coldIn;

  if (dt1 === dt2) {
    return dt1;
  }

  return (dt1 - dt2) / Math.log(dt1 / dt2);
}

export default {
  // Plate exchangers
  GaskettedPlateHeatExchanger,
  BrazedPlateHeatExchanger,

  // Air cooled
  ForcedDraftAirCooler,
  InducedDraftAirCooler,

  // Condensers
  SurfaceCondenser,
  AirCooledCondenser,

  // Reboilers
  KettleReboiler,
  ThermosiphonReboiler,
  ForcedCirculationReboiler,

  // Specialty
  SpiralHeatExchanger,
  DoublePipeHeatExchanger,
  ScrapedSurfaceHeatExchanger,
  PrintedCircuitHeatExchanger,

  // Other
  Economizer,
  Vaporizer,
  Cooler,
  Heater,
};