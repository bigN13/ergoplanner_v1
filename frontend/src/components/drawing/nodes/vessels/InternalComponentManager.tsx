/**
 * Internal Component Manager
 * Manages parent-child relationships for internal vessel components
 */

import React, { useMemo } from 'react';
import {
  BaffleComponent,
  AgitatorComponent,
  HeatingCoilComponent,
  DipTubeComponent,
  SprayNozzleComponent,
  PackingComponent,
  TrayComponent,
} from './InternalComponents';
import type { VesselTankNodeData } from './VesselTankNode';

/**
 * Internal component configuration
 */
export interface InternalComponentConfig {
  type: 'baffle' | 'agitator' | 'heating-coil' | 'dip-tube' | 'spray-nozzle' | 'packing' | 'tray';
  id: string;
  enabled: boolean;
  visible: boolean;
  properties: Record<string, unknown>;
  zIndex?: number;
}

/**
 * Manager for vessel internal components
 */
export interface InternalComponentManagerProps {
  vesselData: VesselTankNodeData;
  vesselWidth: number;
  vesselHeight: number;
  vesselOrientation: 'vertical' | 'horizontal';
  viewportZoom: number;
  components?: InternalComponentConfig[];
}

/**
 * InternalComponentManager
 * Renders and manages internal components within vessels
 */
export const InternalComponentManager: React.FC<InternalComponentManagerProps> = ({
  vesselData,
  vesselWidth,
  vesselHeight,
  vesselOrientation,
  viewportZoom,
  components,
}) => {
  // Determine detail level based on zoom
  const showDetailed = useMemo(() => viewportZoom >= 0.75, [viewportZoom]);

  // Generate components from vessel data if not explicitly provided
  const internalComponents = useMemo(() => {
    if (components) {
      return components.filter((c) => c.enabled && c.visible);
    }

    // Auto-generate from vessel properties
    const autoComponents: InternalComponentConfig[] = [];

    // Add baffles if specified
    if (vesselData.hasBaffles) {
      autoComponents.push({
        type: 'baffle',
        id: 'auto-baffle',
        enabled: true,
        visible: true,
        properties: {
          numberOfBaffles: 4,
          baffleType: 'vertical',
        },
        zIndex: 1,
      });
    }

    // Add agitator if specified
    if (vesselData.hasAgitator) {
      autoComponents.push({
        type: 'agitator',
        id: 'auto-agitator',
        enabled: true,
        visible: true,
        properties: {
          agitatorType: 'turbine',
          numberOfImpellers: 1,
        },
        zIndex: 3,
      });
    }

    // Add heating coil if specified
    if (vesselData.hasHeatingCoil) {
      autoComponents.push({
        type: 'heating-coil',
        id: 'auto-heating-coil',
        enabled: true,
        visible: true,
        properties: {
          coilType: 'helical',
          numberOfTurns: 4,
        },
        zIndex: 2,
      });
    }

    // Add dip tube if specified
    if (vesselData.hasDipTube) {
      autoComponents.push({
        type: 'dip-tube',
        id: 'auto-dip-tube',
        enabled: true,
        visible: true,
        properties: {
          dipDepth: 0.8,
        },
        zIndex: 2,
      });
    }

    // Add packing for columns with packed internals
    if (vesselData.tankType === 'column') {
      autoComponents.push({
        type: 'packing',
        id: 'auto-packing',
        enabled: true,
        visible: true,
        properties: {
          packingType: 'structured',
          packingHeight: 0.6,
        },
        zIndex: 1,
      });
    }

    // Add trays for tray columns
    if (vesselData.tankType === 'column') {
      autoComponents.push({
        type: 'tray',
        id: 'auto-tray',
        enabled: true,
        visible: true,
        properties: {
          numberOfTrays: 15,
          trayType: 'sieve',
        },
        zIndex: 1,
      });
    }

    return autoComponents;
  }, [components, vesselData]);

  // Sort by z-index
  const sortedComponents = useMemo(
    () => [...internalComponents].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    [internalComponents]
  );

  // Render individual component
  const renderComponent = (config: InternalComponentConfig) => {
    const baseProps = {
      vesselWidth,
      vesselHeight,
      vesselOrientation,
      showDetailed,
      strokeColor: vesselData.strokeColor,
      strokeWidth: vesselData.strokeWidth,
    };

    switch (config.type) {
      case 'baffle':
        return (
          <BaffleComponent
            key={config.id}
            {...baseProps}
            numberOfBaffles={config.properties.numberOfBaffles as number}
            baffleType={config.properties.baffleType as any}
            baffleWidth={config.properties.baffleWidth as number}
            baffleSpacing={config.properties.baffleSpacing as number}
          />
        );

      case 'agitator':
        return (
          <AgitatorComponent
            key={config.id}
            {...baseProps}
            agitatorType={config.properties.agitatorType as any}
            numberOfImpellers={config.properties.numberOfImpellers as number}
            motorPower={config.properties.motorPower as number}
            speed={config.properties.speed as number}
          />
        );

      case 'heating-coil':
        return (
          <HeatingCoilComponent
            key={config.id}
            {...baseProps}
            coilType={config.properties.coilType as any}
            numberOfTurns={config.properties.numberOfTurns as number}
          />
        );

      case 'dip-tube':
        return (
          <DipTubeComponent
            key={config.id}
            {...baseProps}
            dipDepth={config.properties.dipDepth as number}
            tubeWidth={config.properties.tubeWidth as number}
          />
        );

      case 'spray-nozzle':
        return (
          <SprayNozzleComponent
            key={config.id}
            {...baseProps}
            numberOfNozzles={config.properties.numberOfNozzles as number}
            nozzleType={config.properties.nozzleType as any}
          />
        );

      case 'packing':
        return (
          <PackingComponent
            key={config.id}
            {...baseProps}
            packingType={config.properties.packingType as any}
            packingHeight={config.properties.packingHeight as number}
          />
        );

      case 'tray':
        return (
          <TrayComponent
            key={config.id}
            {...baseProps}
            numberOfTrays={config.properties.numberOfTrays as number}
            trayType={config.properties.trayType as any}
            traySpacing={config.properties.traySpacing as number}
          />
        );

      default:
        return null;
    }
  };

  return (
    <g className="internal-components-group">
      {sortedComponents.map((config) => renderComponent(config))}
    </g>
  );
};

/**
 * Hook for managing internal components
 */
export const useInternalComponents = (vesselData: VesselTankNodeData) => {
  const components = useMemo<InternalComponentConfig[]>(() => {
    const configs: InternalComponentConfig[] = [];

    // Generate component configs based on vessel data
    if (vesselData.hasBaffles) {
      configs.push({
        type: 'baffle',
        id: `${vesselData.id}-baffle`,
        enabled: true,
        visible: true,
        properties: {
          numberOfBaffles: 4,
          baffleType: 'vertical',
        },
        zIndex: 1,
      });
    }

    if (vesselData.hasAgitator) {
      configs.push({
        type: 'agitator',
        id: `${vesselData.id}-agitator`,
        enabled: true,
        visible: true,
        properties: {
          agitatorType: 'turbine',
          numberOfImpellers: 1,
        },
        zIndex: 3,
      });
    }

    if (vesselData.hasHeatingCoil) {
      configs.push({
        type: 'heating-coil',
        id: `${vesselData.id}-heating-coil`,
        enabled: true,
        visible: true,
        properties: {
          coilType: 'helical',
          numberOfTurns: 4,
        },
        zIndex: 2,
      });
    }

    if (vesselData.hasDipTube) {
      configs.push({
        type: 'dip-tube',
        id: `${vesselData.id}-dip-tube`,
        enabled: true,
        visible: true,
        properties: {
          dipDepth: 0.8,
        },
        zIndex: 2,
      });
    }

    return configs;
  }, [vesselData]);

  const addComponent = (config: InternalComponentConfig) => {
    // In a real implementation, this would update state
    return [...components, config];
  };

  const removeComponent = (id: string) => {
    return components.filter((c) => c.id !== id);
  };

  const updateComponent = (id: string, updates: Partial<InternalComponentConfig>) => {
    return components.map((c) => (c.id === id ? { ...c, ...updates } : c));
  };

  const toggleComponentVisibility = (id: string) => {
    return components.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c));
  };

  return {
    components,
    addComponent,
    removeComponent,
    updateComponent,
    toggleComponentVisibility,
  };
};

/**
 * Component factory for creating internal components
 */
export class InternalComponentFactory {
  /**
   * Create a baffle component configuration
   */
  static createBaffle(vesselId: string, options?: {
    numberOfBaffles?: number;
    baffleType?: 'vertical' | 'horizontal' | 'disk-donut';
  }): InternalComponentConfig {
    return {
      type: 'baffle',
      id: `${vesselId}-baffle-${Date.now()}`,
      enabled: true,
      visible: true,
      properties: {
        numberOfBaffles: options?.numberOfBaffles || 4,
        baffleType: options?.baffleType || 'vertical',
      },
      zIndex: 1,
    };
  }

  /**
   * Create an agitator component configuration
   */
  static createAgitator(vesselId: string, options?: {
    agitatorType?: 'turbine' | 'propeller' | 'anchor' | 'paddle' | 'ribbon' | 'helical';
    numberOfImpellers?: number;
  }): InternalComponentConfig {
    return {
      type: 'agitator',
      id: `${vesselId}-agitator-${Date.now()}`,
      enabled: true,
      visible: true,
      properties: {
        agitatorType: options?.agitatorType || 'turbine',
        numberOfImpellers: options?.numberOfImpellers || 1,
      },
      zIndex: 3,
    };
  }

  /**
   * Create a heating coil component configuration
   */
  static createHeatingCoil(vesselId: string, options?: {
    coilType?: 'helical' | 'spiral' | 'serpentine';
    numberOfTurns?: number;
  }): InternalComponentConfig {
    return {
      type: 'heating-coil',
      id: `${vesselId}-heating-coil-${Date.now()}`,
      enabled: true,
      visible: true,
      properties: {
        coilType: options?.coilType || 'helical',
        numberOfTurns: options?.numberOfTurns || 4,
      },
      zIndex: 2,
    };
  }

  /**
   * Create a dip tube component configuration
   */
  static createDipTube(vesselId: string, options?: {
    dipDepth?: number;
  }): InternalComponentConfig {
    return {
      type: 'dip-tube',
      id: `${vesselId}-dip-tube-${Date.now()}`,
      enabled: true,
      visible: true,
      properties: {
        dipDepth: options?.dipDepth || 0.8,
      },
      zIndex: 2,
    };
  }

  /**
   * Create packing component configuration
   */
  static createPacking(vesselId: string, options?: {
    packingType?: 'random' | 'structured';
    packingHeight?: number;
  }): InternalComponentConfig {
    return {
      type: 'packing',
      id: `${vesselId}-packing-${Date.now()}`,
      enabled: true,
      visible: true,
      properties: {
        packingType: options?.packingType || 'structured',
        packingHeight: options?.packingHeight || 0.6,
      },
      zIndex: 1,
    };
  }

  /**
   * Create tray component configuration
   */
  static createTray(vesselId: string, options?: {
    numberOfTrays?: number;
    trayType?: 'sieve' | 'valve' | 'bubble-cap';
  }): InternalComponentConfig {
    return {
      type: 'tray',
      id: `${vesselId}-tray-${Date.now()}`,
      enabled: true,
      visible: true,
      properties: {
        numberOfTrays: options?.numberOfTrays || 10,
        trayType: options?.trayType || 'sieve',
      },
      zIndex: 1,
    };
  }
}

export default InternalComponentManager;