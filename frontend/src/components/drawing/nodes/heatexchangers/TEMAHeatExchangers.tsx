/**
 * TEMA Standard Heat Exchangers
 * Shell and tube heat exchangers following TEMA (Tubular Exchanger Manufacturers Association) standards
 */

import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

import type { HeatExchangerNodeData } from '../vessels/HeatExchangerNode';
import HeatExchangerNode from '../vessels/HeatExchangerNode';

/**
 * TEMA Front Head Types
 */
export enum TEMAFrontHead {
  A = 'A', // Channel and removable cover
  B = 'B', // Bonnet (integral cover)
  C = 'C', // Channel integral with tubesheet and removable cover
  N = 'N', // Channel integral with tubesheet and removable cover
  D = 'D', // Special high pressure closure
}

/**
 * TEMA Shell Types
 */
export enum TEMAShellType {
  E = 'E', // One pass shell
  F = 'F', // Two pass shell with longitudinal baffle
  G = 'G', // Split flow
  H = 'H', // Double split flow
  J = 'J', // Divided flow
  K = 'K', // Kettle type reboiler
  X = 'X', // Cross flow
}

/**
 * TEMA Rear Head Types
 */
export enum TEMARearHead {
  L = 'L', // Fixed tubesheet like A stationary head
  M = 'M', // Fixed tubesheet like B stationary head
  N = 'N', // Fixed tubesheet like N stationary head
  P = 'P', // Outside packed floating head
  S = 'S', // Floating head with backing device
  T = 'T', // Pull through floating head
  U = 'U', // U-tube bundle
  W = 'W', // Externally sealed floating tubesheet
}

/**
 * TEMA Heat Exchanger Data
 */
export interface TEMAHeatExchangerData extends HeatExchangerNodeData {
  temaType?: string; // e.g., 'BEM', 'AES', 'BKU'
  frontHead?: TEMAFrontHead;
  shellType?: TEMAShellType;
  rearHead?: TEMARearHead;

  // TEMA specifications
  shellDiameter?: number;
  tubeLength?: number;
  numberOfTubes?: number;
  tubeOD?: number;
  tubePitch?: number;
  tubePattern?: 'triangular' | 'square' | 'rotated-square';

  // Baffle configuration
  baffleType?: 'single-segmental' | 'double-segmental' | 'no-tubes-in-window' | 'rod';
  baffleSpacing?: number;
  baffleCut?: number; // percentage

  // Operating parameters
  shellSidePressure?: number;
  tubeSidePressure?: number;
  shellSideFlowRate?: number;
  tubeSideFlowRate?: number;
  foulingResistance?: number;
}

type TEMAHeatExchangerProps = NodeProps<TEMAHeatExchangerData>;

// ============================================================================
// BEM TYPE (Channel/One-Pass/Fixed Tubesheet)
// ============================================================================

/**
 * TEMA BEM Heat Exchanger
 * B - Bonnet front head
 * E - One pass shell
 * M - Fixed tubesheet rear head
 */
export const BEMHeatExchanger = memo<TEMAHeatExchangerProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'fixed_head',
      temaType: 'BEM',
      showBaffles: true,
      showFlowDirection: true,
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

BEMHeatExchanger.displayName = 'BEMHeatExchanger';

// ============================================================================
// AES TYPE (Channel/One-Pass/Floating Head)
// ============================================================================

/**
 * TEMA AES Heat Exchanger
 * A - Channel and removable cover
 * E - One pass shell
 * S - Floating head with backing device
 */
export const AESHeatExchanger = memo<TEMAHeatExchangerProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'floating_head',
      temaType: 'AES',
      showBaffles: true,
      showFlowDirection: true,
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

AESHeatExchanger.displayName = 'AESHeatExchanger';

// ============================================================================
// BKU TYPE (Bonnet/Kettle/U-Tube)
// ============================================================================

/**
 * TEMA BKU Heat Exchanger (Kettle Reboiler)
 * B - Bonnet
 * K - Kettle type reboiler
 * U - U-tube bundle
 */
export const BKUHeatExchanger = memo<TEMAHeatExchangerProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'kettle',
      temaType: 'BKU',
      showBaffles: false,
      showFlowDirection: true,
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

BKUHeatExchanger.displayName = 'BKUHeatExchanger';

// ============================================================================
// AEU TYPE (Channel/One-Pass/U-Tube)
// ============================================================================

/**
 * TEMA AEU Heat Exchanger
 * A - Channel and removable cover
 * E - One pass shell
 * U - U-tube bundle
 */
export const AEUHeatExchanger = memo<TEMAHeatExchangerProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'u_tube',
      temaType: 'AEU',
      showBaffles: true,
      showFlowDirection: true,
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

AEUHeatExchanger.displayName = 'AEUHeatExchanger';

// ============================================================================
// AEP TYPE (Channel/One-Pass/Outside Packed)
// ============================================================================

/**
 * TEMA AEP Heat Exchanger
 * A - Channel and removable cover
 * E - One pass shell
 * P - Outside packed floating head
 */
export const AEPHeatExchanger = memo<TEMAHeatExchangerProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'floating_head',
      temaType: 'AEP',
      showBaffles: true,
      showFlowDirection: true,
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

AEPHeatExchanger.displayName = 'AEPHeatExchanger';

// ============================================================================
// AFU TYPE (Channel/Two-Pass/U-Tube)
// ============================================================================

/**
 * TEMA AFU Heat Exchanger
 * A - Channel and removable cover
 * F - Two pass shell with longitudinal baffle
 * U - U-tube bundle
 */
export const AFUHeatExchanger = memo<TEMAHeatExchangerProps>(
  ({ id, data, selected, dragging }): React.ReactElement => {
    const exchangerData: HeatExchangerNodeData = {
      ...data,
      exchangerType: 'u_tube',
      temaType: 'AFU',
      shellPasses: 2,
      showBaffles: true,
      showFlowDirection: true,
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

AFUHeatExchanger.displayName = 'AFUHeatExchanger';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get TEMA type description
 */
export function getTEMADescription(temaType: string): string {
  const descriptions: Record<string, string> = {
    BEM: 'Bonnet / One-Pass Shell / Fixed Tubesheet - Most economical, non-removable bundle',
    AES: 'Channel / One-Pass Shell / Floating Head - Removable bundle, thermal expansion',
    BKU: 'Bonnet / Kettle / U-Tube - Kettle reboiler with vapor space',
    AEU: 'Channel / One-Pass Shell / U-Tube - Economical, thermal expansion capability',
    AEP: 'Channel / One-Pass Shell / Packed Floating - Easy maintenance, high temperature',
    AFU: 'Channel / Two-Pass Shell / U-Tube - Higher shell-side velocity',
    BFU: 'Bonnet / Two-Pass Shell / U-Tube - Compact design, higher heat transfer',
    AEW: 'Channel / One-Pass Shell / Externally Sealed Floating - Clean fluids',
    AET: 'Channel / One-Pass Shell / Pull-Through Floating - Removable bundle',
    AEL: 'Channel / One-Pass Shell / Fixed Like A - Fixed tubesheet design',
  };

  return descriptions[temaType] || 'TEMA Standard Heat Exchanger';
}

/**
 * Get TEMA application recommendations
 */
export function getTEMAApplications(temaType: string): string[] {
  const applications: Record<string, string[]> = {
    BEM: ['Clean fluids', 'Low fouling', 'No thermal expansion issues', 'Cost-sensitive'],
    AES: ['High fouling', 'Thermal expansion', 'Frequent cleaning', 'High reliability'],
    BKU: ['Reboiler service', 'Vaporization', 'Thermosiphon', 'Kettle applications'],
    AEU: ['Thermal expansion', 'Single-phase fluids', 'Clean service', 'Cost-effective'],
    AEP: ['High temperature', 'High pressure', 'Moderate fouling', 'Easy maintenance'],
    AFU: ['High shell-side velocity needed', 'Temperature cross', 'Compact design'],
  };

  return applications[temaType] || ['General purpose heat exchange'];
}

/**
 * Calculate TEMA heat exchanger dimensions
 */
export function calculateTEMADimensions(data: TEMAHeatExchangerData): {
  width: number;
  height: number;
} {
  const shellDiameter = data.shellDiameter || 500; // mm
  const tubeLength = data.tubeLength || 3000; // mm

  // Scale to display units (pixels)
  const scaleFactor = 0.04; // 1mm = 0.04px

  return {
    width: tubeLength * scaleFactor,
    height: shellDiameter * scaleFactor * 1.5, // Add height for nozzles and supports
  };
}

export default {
  BEMHeatExchanger,
  AESHeatExchanger,
  BKUHeatExchanger,
  AEUHeatExchanger,
  AEPHeatExchanger,
  AFUHeatExchanger,
};