import type React from 'react';
import type { NodeTypes, NodeProps } from 'reactflow';

import type { BaseSymbolData } from './BaseSymbolNode';
import CheckValveNode from './CheckValveNode';
import CompressorNode from './CompressorNode';
import FlowMeterNode from './FlowMeterNode';
import HeatExchangerNode from './HeatExchangerNode';
import PipeNode from './PipeNode';
import PressureGaugeNode from './PressureGaugeNode';
import PumpNode from './PumpNode';
import { CentrifugalPumpNode, PositiveDisplacementPumpNode, ReciprocatingPumpNode } from './pumps';
import TankNode from './TankNode';
import ValveNode from './ValveNode';
import { BallValveNode, ControlValveNode, GateValveNode } from './valves';

// Legacy components

// Symbol node factory configuration
export interface SymbolNodeConfig {
  id: string;
  name: string;
  category: string;
  description: string;
   
  component: React.ComponentType<NodeProps<any>>; // Using any for backward compatibility with legacy components
  defaultData: Partial<BaseSymbolData>;
  tags: string[];
  standards: string[];
}

// Registry of all available symbol nodes
export const SYMBOL_NODE_REGISTRY: Record<string, SymbolNodeConfig> = {
  // Enhanced Pump Symbols
  'enhanced-centrifugal-pump': {
    id: 'enhanced-centrifugal-pump',
    name: 'Centrifugal Pump (Enhanced)',
    category: 'Pumps & Compressors',
    description: 'Advanced centrifugal pump with comprehensive specifications and real-time state visualization',
    component: CentrifugalPumpNode,
    defaultData: {
      symbolType: 'pump',
      label: 'P-101',
      dimensions: {
        width: 60,
        height: 60,
        originX: 30,
        originY: 30,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 3.0,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [
        {
          id: 'suction',
          type: 'inlet',
          x: 10,
          y: 30,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Suction inlet'
        },
        {
          id: 'discharge',
          type: 'outlet',
          x: 50,
          y: 30,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Discharge outlet'
        }
      ],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['pump', 'centrifugal', 'rotating', 'equipment'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'enhanced-positive-displacement-pump': {
    id: 'enhanced-positive-displacement-pump',
    name: 'Positive Displacement Pump (Enhanced)',
    category: 'Pumps & Compressors',
    description: 'Advanced positive displacement pump with multiple type variants and control features',
    component: PositiveDisplacementPumpNode,
    defaultData: {
      symbolType: 'pump',
      label: 'P-102',
      dimensions: {
        width: 60,
        height: 60,
        originX: 30,
        originY: 30,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 3.0,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [
        {
          id: 'inlet',
          type: 'inlet',
          x: 10,
          y: 30,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Pump inlet'
        },
        {
          id: 'outlet',
          type: 'outlet',
          x: 50,
          y: 30,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Pump outlet'
        }
      ],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['pump', 'positive-displacement', 'volumetric'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'enhanced-reciprocating-pump': {
    id: 'enhanced-reciprocating-pump',
    name: 'Reciprocating Pump (Enhanced)',
    category: 'Pumps & Compressors',
    description: 'Advanced reciprocating pump with piston/plunger/diaphragm variants and pulsation dampening',
    component: ReciprocatingPumpNode,
    defaultData: {
      symbolType: 'pump',
      label: 'P-103',
      dimensions: {
        width: 70,
        height: 60,
        originX: 35,
        originY: 30,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 3.0,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [
        {
          id: 'suction',
          type: 'inlet',
          x: 10,
          y: 35,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Suction line'
        },
        {
          id: 'discharge',
          type: 'outlet',
          x: 50,
          y: 25,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Discharge line'
        }
      ],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['pump', 'reciprocating', 'piston', 'displacement'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Enhanced Valve Symbols
  'enhanced-gate-valve': {
    id: 'enhanced-gate-valve',
    name: 'Gate Valve (Enhanced)',
    category: 'Valves',
    description: 'Advanced gate valve with position indication, actuator options, and operational state visualization',
    component: GateValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'V-101',
      dimensions: {
        width: 60,
        height: 60,
        originX: 30,
        originY: 30,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 3.0,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [
        {
          id: 'inlet',
          type: 'inlet',
          x: 15,
          y: 30,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Valve inlet'
        },
        {
          id: 'outlet',
          type: 'outlet',
          x: 45,
          y: 30,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Valve outlet'
        }
      ],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'gate', 'isolation', 'shutoff'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'enhanced-ball-valve': {
    id: 'enhanced-ball-valve',
    name: 'Ball Valve (Enhanced)',
    category: 'Valves',
    description: 'Advanced ball valve with quarter-turn operation, actuator options, and fail-position indication',
    component: BallValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'V-102',
      dimensions: {
        width: 60,
        height: 60,
        originX: 30,
        originY: 30,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 3.0,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [
        {
          id: 'inlet',
          type: 'inlet',
          x: 15,
          y: 30,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Valve inlet'
        },
        {
          id: 'outlet',
          type: 'outlet',
          x: 45,
          y: 30,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Valve outlet'
        }
      ],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'ball', 'quarter-turn'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'enhanced-control-valve': {
    id: 'enhanced-control-valve',
    name: 'Control Valve (Enhanced)',
    category: 'Valves',
    description: 'Advanced control valve with positioner, actuator, and comprehensive control loop integration',
    component: ControlValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'CV-101',
      dimensions: {
        width: 60,
        height: 70,
        originX: 30,
        originY: 35,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 3.0,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [
        {
          id: 'inlet',
          type: 'inlet',
          x: 15,
          y: 35,
          direction: 180,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Process inlet'
        },
        {
          id: 'outlet',
          type: 'outlet',
          x: 45,
          y: 35,
          direction: 0,
          compatible: ['pipe', 'process'],
          required: true,
          description: 'Process outlet'
        },
        {
          id: 'control-signal',
          type: 'control',
          x: 30,
          y: 8,
          direction: 270,
          compatible: ['instrumentation', 'control'],
          required: true,
          description: 'Control signal input'
        }
      ],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'control', 'automated', 'modulating'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Legacy symbols (for backward compatibility)
  'legacy-pump': {
    id: 'legacy-pump',
    name: 'Pump (Legacy)',
    category: 'Pumps & Compressors',
    description: 'Basic pump symbol for simple diagrams',
    component: PumpNode,
    defaultData: {
      symbolType: 'pump',
      label: 'P-001',
    },
    tags: ['pump', 'basic'],
    standards: ['ISA-5.1']
  },

  'legacy-valve': {
    id: 'legacy-valve',
    name: 'Valve (Legacy)',
    category: 'Valves',
    description: 'Basic valve symbol for simple diagrams',
    component: ValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'V-001',
    },
    tags: ['valve', 'basic'],
    standards: ['ISA-5.1']
  },

  'legacy-tank': {
    id: 'legacy-tank',
    name: 'Tank (Legacy)',
    category: 'Tanks & Vessels',
    description: 'Basic tank symbol',
    component: TankNode,
    defaultData: {
      symbolType: 'tank',
      label: 'T-001',
    },
    tags: ['tank', 'vessel', 'storage'],
    standards: ['ISA-5.1']
  },

  'legacy-pipe': {
    id: 'legacy-pipe',
    name: 'Pipe (Legacy)',
    category: 'Piping',
    description: 'Basic pipe connection',
    component: PipeNode,
    defaultData: {
      symbolType: 'pipe',
      label: '',
    },
    tags: ['pipe', 'connection'],
    standards: ['ISA-5.1']
  },

  'legacy-flow-meter': {
    id: 'legacy-flow-meter',
    name: 'Flow Meter (Legacy)',
    category: 'Instruments',
    description: 'Basic flow measurement instrument',
    component: FlowMeterNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'FI-001',
    },
    tags: ['instrument', 'flow', 'meter'],
    standards: ['ISA-5.1']
  },

  'legacy-pressure-gauge': {
    id: 'legacy-pressure-gauge',
    name: 'Pressure Gauge (Legacy)',
    category: 'Instruments',
    description: 'Basic pressure measurement instrument',
    component: PressureGaugeNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'PI-001',
    },
    tags: ['instrument', 'pressure', 'gauge'],
    standards: ['ISA-5.1']
  },

  'legacy-control-valve': {
    id: 'legacy-control-valve',
    name: 'Control Valve (Legacy)',
    category: 'Valves',
    description: 'Basic control valve symbol',
    component: ControlValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'CV-001',
    },
    tags: ['valve', 'control', 'basic'],
    standards: ['ISA-5.1']
  },

  'legacy-check-valve': {
    id: 'legacy-check-valve',
    name: 'Check Valve (Legacy)',
    category: 'Valves',
    description: 'Basic check valve symbol',
    component: CheckValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'CHK-001',
    },
    tags: ['valve', 'check', 'non-return'],
    standards: ['ISA-5.1']
  },

  'legacy-heat-exchanger': {
    id: 'legacy-heat-exchanger',
    name: 'Heat Exchanger (Legacy)',
    category: 'Heat Transfer',
    description: 'Basic heat exchanger symbol',
    component: HeatExchangerNode,
    defaultData: {
      symbolType: 'heat-exchanger',
      label: 'HX-001',
    },
    tags: ['heat-exchanger', 'thermal'],
    standards: ['ISA-5.1']
  },

  'legacy-compressor': {
    id: 'legacy-compressor',
    name: 'Compressor (Legacy)',
    category: 'Pumps & Compressors',
    description: 'Basic compressor symbol',
    component: CompressorNode,
    defaultData: {
      symbolType: 'compressor',
      label: 'C-001',
    },
    tags: ['compressor', 'gas'],
    standards: ['ISA-5.1']
  }
};

// Helper functions for symbol node management
export function getSymbolNodeConfig(nodeId: string): SymbolNodeConfig | undefined {
  return SYMBOL_NODE_REGISTRY[nodeId];
}

export function getSymbolsByCategory(category: string): SymbolNodeConfig[] {
  return Object.values(SYMBOL_NODE_REGISTRY).filter(config => config.category === category);
}

export function getSymbolsByStandard(standard: string): SymbolNodeConfig[] {
  return Object.values(SYMBOL_NODE_REGISTRY).filter(config =>
    config.standards.includes(standard)
  );
}

export function searchSymbols(query: string): SymbolNodeConfig[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(SYMBOL_NODE_REGISTRY).filter(config =>
    config.name.toLowerCase().includes(lowerQuery) ||
    config.description.toLowerCase().includes(lowerQuery) ||
    config.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getCategories(): string[] {
  const categories = new Set(Object.values(SYMBOL_NODE_REGISTRY).map(config => config.category));
  return Array.from(categories).sort();
}

// ReactFlow node types registry
export function createNodeTypes(): NodeTypes {
  const nodeTypes: NodeTypes = {};

  Object.entries(SYMBOL_NODE_REGISTRY).forEach(([key, config]) => {
    nodeTypes[key] = config.component;
  });

  return nodeTypes;
}

// Factory function to create symbol nodes with default data
export function createSymbolNode(
  nodeId: string,
  position: { x: number; y: number },
  customData?: Partial<BaseSymbolData>
): { id: string; type: string; position: { x: number; y: number }; data: BaseSymbolData } {
  const config = getSymbolNodeConfig(nodeId);
  if (!config) {
    throw new Error(`Unknown symbol node type: ${nodeId}`);
  }

  // Ensure dimensions are always defined
  const dimensions = config.defaultData.dimensions || {
    width: 60,
    height: 60,
    originX: 30,
    originY: 30,
    scale: 1.0,
    minScale: 0.5,
    maxScale: 3.0,
    rotation: 0,
    canFlipHorizontal: true,
    canFlipVertical: false
  };

  return {
    id: `${nodeId}-${Date.now()}`,
    type: nodeId,
    position,
    data: {
      ...config.defaultData,
      dimensions,
      ...customData
    } as BaseSymbolData
  };
}

export default SYMBOL_NODE_REGISTRY;