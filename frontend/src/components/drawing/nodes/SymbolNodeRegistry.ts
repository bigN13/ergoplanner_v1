import { lazy } from 'react';
import type React from 'react';
import type { NodeTypes, NodeProps } from 'reactflow';

import type { BaseSymbolData } from './BaseSymbolNode';

// Lazy-loaded components for code splitting and performance optimization
const CheckValveNode = lazy(() => import('./CheckValveNode'));
const CompressorNode = lazy(() => import('./CompressorNode'));
const FlowMeterNode = lazy(() => import('./FlowMeterNode'));
const HeatExchangerNode = lazy(() => import('./HeatExchangerNode'));
const PipeNode = lazy(() => import('./PipeNode'));
const PressureGaugeNode = lazy(() => import('./PressureGaugeNode'));
const PumpNode = lazy(() => import('./PumpNode'));
const TankNode = lazy(() => import('./TankNode'));
const ValveNode = lazy(() => import('./ValveNode'));

// Pumps
const CentrifugalPumpNode = lazy(() => import('./pumps').then(m => ({ default: m.CentrifugalPumpNode })));
const PositiveDisplacementPumpNode = lazy(() => import('./pumps').then(m => ({ default: m.PositiveDisplacementPumpNode })));
const ReciprocatingPumpNode = lazy(() => import('./pumps').then(m => ({ default: m.ReciprocatingPumpNode })));

// Valves
const BallValveNode = lazy(() => import('./valves').then(m => ({ default: m.BallValveNode })));
const ControlValveNode = lazy(() => import('./valves').then(m => ({ default: m.ControlValveNode })));
const GateValveNode = lazy(() => import('./valves').then(m => ({ default: m.GateValveNode })));
const GlobeValveNode = lazy(() => import('./valves').then(m => ({ default: m.GlobeValveNode })));
const ButterflyValveNode = lazy(() => import('./valves').then(m => ({ default: m.ButterflyValveNode })));
const SafetyValveNode = lazy(() => import('./valves').then(m => ({ default: m.SafetyValveNode })));
const PressureReliefValveNode = lazy(() => import('./valves').then(m => ({ default: m.PressureReliefValveNode })));
const VacuumReliefValveNode = lazy(() => import('./valves').then(m => ({ default: m.VacuumReliefValveNode })));
const NeedleValveNode = lazy(() => import('./valves').then(m => ({ default: m.NeedleValveNode })));
const DiaphragmValveNode = lazy(() => import('./valves').then(m => ({ default: m.DiaphragmValveNode })));
const PinchValveNode = lazy(() => import('./valves').then(m => ({ default: m.PinchValveNode })));
const PlugValveNode = lazy(() => import('./valves').then(m => ({ default: m.PlugValveNode })));

// Vessels
const _VesselTankNode = lazy(() => import('./vessels').then(m => ({ default: m.VesselTankNode })));
const StorageTankNode = lazy(() => import('./vessels').then(m => ({ default: m.StorageTankNode })));
const MixingTankNode = lazy(() => import('./vessels').then(m => ({ default: m.MixingTankNode })));
const SeparatorNode = lazy(() => import('./vessels').then(m => ({ default: m.SeparatorNode })));
const KnockoutDrumNode = lazy(() => import('./vessels').then(m => ({ default: m.KnockoutDrumNode })));
const FlashDrumNode = lazy(() => import('./vessels').then(m => ({ default: m.FlashDrumNode })));
const SurgeTankNode = lazy(() => import('./vessels').then(m => ({ default: m.SurgeTankNode })));
const AccumulatorNode = lazy(() => import('./vessels').then(m => ({ default: m.AccumulatorNode })));
const BufferTankNode = lazy(() => import('./vessels').then(m => ({ default: m.BufferTankNode })));
const ReactorNode = lazy(() => import('./vessels').then(m => ({ default: m.ReactorNode })));
const ColumnNode = lazy(() => import('./vessels').then(m => ({ default: m.ColumnNode })));

// Heat Exchangers
const BEMHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.BEMHeatExchanger })));
const AESHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.AESHeatExchanger })));
const BKUHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.BKUHeatExchanger })));
const AEUHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.AEUHeatExchanger })));
const AEPHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.AEPHeatExchanger })));
const AFUHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.AFUHeatExchanger })));
const GaskettedPlateHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.GaskettedPlateHeatExchanger })));
const BrazedPlateHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.BrazedPlateHeatExchanger })));
const ForcedDraftAirCooler = lazy(() => import('./heatexchangers').then(m => ({ default: m.ForcedDraftAirCooler })));
const InducedDraftAirCooler = lazy(() => import('./heatexchangers').then(m => ({ default: m.InducedDraftAirCooler })));
const SurfaceCondenser = lazy(() => import('./heatexchangers').then(m => ({ default: m.SurfaceCondenser })));
const AirCooledCondenser = lazy(() => import('./heatexchangers').then(m => ({ default: m.AirCooledCondenser })));
const KettleReboiler = lazy(() => import('./heatexchangers').then(m => ({ default: m.KettleReboiler })));
const ThermosiphonReboiler = lazy(() => import('./heatexchangers').then(m => ({ default: m.ThermosiphonReboiler })));
const ForcedCirculationReboiler = lazy(() => import('./heatexchangers').then(m => ({ default: m.ForcedCirculationReboiler })));
const SpiralHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.SpiralHeatExchanger })));
const DoublePipeHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.DoublePipeHeatExchanger })));
const ScrapedSurfaceHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.ScrapedSurfaceHeatExchanger })));
const PrintedCircuitHeatExchanger = lazy(() => import('./heatexchangers').then(m => ({ default: m.PrintedCircuitHeatExchanger })));
const Economizer = lazy(() => import('./heatexchangers').then(m => ({ default: m.Economizer })));
const Vaporizer = lazy(() => import('./heatexchangers').then(m => ({ default: m.Vaporizer })));
const Cooler = lazy(() => import('./heatexchangers').then(m => ({ default: m.Cooler })));
const Heater = lazy(() => import('./heatexchangers').then(m => ({ default: m.Heater })));

// Instruments
const OrificePlateNode = lazy(() => import('./instruments').then(m => ({ default: m.OrificePlateNode })));
const VenturiMeterNode = lazy(() => import('./instruments').then(m => ({ default: m.VenturiMeterNode })));
const MagneticFlowmeterNode = lazy(() => import('./instruments').then(m => ({ default: m.MagneticFlowmeterNode })));
const VortexFlowmeterNode = lazy(() => import('./instruments').then(m => ({ default: m.VortexFlowmeterNode })));
const ThermocoupleNode = lazy(() => import('./instruments').then(m => ({ default: m.ThermocoupleNode })));
const RTDNode = lazy(() => import('./instruments').then(m => ({ default: m.RTDNode })));
const ThermowellNode = lazy(() => import('./instruments').then(m => ({ default: m.ThermowellNode })));
const BimetallicThermometerNode = lazy(() => import('./instruments').then(m => ({ default: m.BimetallicThermometerNode })));
const BourdonGaugeNode = lazy(() => import('./instruments').then(m => ({ default: m.BourdonGaugeNode })));
const PressureTransmitterNode = lazy(() => import('./instruments').then(m => ({ default: m.PressureTransmitterNode })));
const DifferentialPressureNode = lazy(() => import('./instruments').then(m => ({ default: m.DifferentialPressureNode })));
const DiaphragmSealNode = lazy(() => import('./instruments').then(m => ({ default: m.DiaphragmSealNode })));
const FloatLevelNode = lazy(() => import('./instruments').then(m => ({ default: m.FloatLevelNode })));
const DisplacerLevelNode = lazy(() => import('./instruments').then(m => ({ default: m.DisplacerLevelNode })));
const RadarLevelNode = lazy(() => import('./instruments').then(m => ({ default: m.RadarLevelNode })));
const UltrasonicLevelNode = lazy(() => import('./instruments').then(m => ({ default: m.UltrasonicLevelNode })));
const CapacitanceLevelNode = lazy(() => import('./instruments').then(m => ({ default: m.CapacitanceLevelNode })));
const pHMeterNode = lazy(() => import('./instruments').then(m => ({ default: m.pHMeterNode })));
const ConductivityAnalyzerNode = lazy(() => import('./instruments').then(m => ({ default: m.ConductivityAnalyzerNode })));
const OxygenAnalyzerNode = lazy(() => import('./instruments').then(m => ({ default: m.OxygenAnalyzerNode })));
const TurbidityMeterNode = lazy(() => import('./instruments').then(m => ({ default: m.TurbidityMeterNode })));

// Controls
const TransmitterNode = lazy(() => import('./controls').then(m => ({ default: m.TransmitterNode })));
const FlowTransmitterNode = lazy(() => import('./controls').then(m => ({ default: m.FlowTransmitterNode })));
const TemperatureTransmitterNode = lazy(() => import('./controls').then(m => ({ default: m.TemperatureTransmitterNode })));
const LevelTransmitterNode = lazy(() => import('./controls').then(m => ({ default: m.LevelTransmitterNode })));
const AnalyticalTransmitterNode = lazy(() => import('./controls').then(m => ({ default: m.AnalyticalTransmitterNode })));
const MultivariableTransmitterNode = lazy(() => import('./controls').then(m => ({ default: m.MultivariableTransmitterNode })));
const PIDControllerNode = lazy(() => import('./controls').then(m => ({ default: m.PIDControllerNode })));
const CascadeControllerNode = lazy(() => import('./controls').then(m => ({ default: m.CascadeControllerNode })));
const RatioControllerNode = lazy(() => import('./controls').then(m => ({ default: m.RatioControllerNode })));
const SelectorControllerNode = lazy(() => import('./controls').then(m => ({ default: m.SelectorControllerNode })));
const SplitRangeControllerNode = lazy(() => import('./controls').then(m => ({ default: m.SplitRangeControllerNode })));
const LocalIndicatorNode = lazy(() => import('./controls').then(m => ({ default: m.LocalIndicatorNode })));
const PanelIndicatorNode = lazy(() => import('./controls').then(m => ({ default: m.PanelIndicatorNode })));
const DigitalIndicatorNode = lazy(() => import('./controls').then(m => ({ default: m.DigitalIndicatorNode })));
const AnalogGaugeIndicatorNode = lazy(() => import('./controls').then(m => ({ default: m.AnalogGaugeIndicatorNode })));
const RecorderIndicatorNode = lazy(() => import('./controls').then(m => ({ default: m.RecorderIndicatorNode })));
const TotalizerIndicatorNode = lazy(() => import('./controls').then(m => ({ default: m.TotalizerIndicatorNode })));
const IPConverterNode = lazy(() => import('./controls').then(m => ({ default: m.IPConverterNode })));
const PIConverterNode = lazy(() => import('./controls').then(m => ({ default: m.PIConverterNode })));
const EPConverterNode = lazy(() => import('./controls').then(m => ({ default: m.EPConverterNode })));
const SignalConditionerNode = lazy(() => import('./controls').then(m => ({ default: m.SignalConditionerNode })));
const SignalIsolatorNode = lazy(() => import('./controls').then(m => ({ default: m.SignalIsolatorNode })));
const SignalRepeaterNode = lazy(() => import('./controls').then(m => ({ default: m.SignalRepeaterNode })));
const PneumaticPositionerNode = lazy(() => import('./controls').then(m => ({ default: m.PneumaticPositionerNode })));
const ElectroPneumaticPositionerNode = lazy(() => import('./controls').then(m => ({ default: m.ElectroPneumaticPositionerNode })));
const DigitalPositionerNode = lazy(() => import('./controls').then(m => ({ default: m.DigitalPositionerNode })));
const PositionerWithBoosterNode = lazy(() => import('./controls').then(m => ({ default: m.PositionerWithBoosterNode })));

// UK Water - Thames
const PrimaryClarifierNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.PrimaryClarifierNode })));
const SecondaryClarifierNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.SecondaryClarifierNode })));
const RectangularClarifierNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.RectangularClarifierNode })));
const LamellaClarifierNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.LamellaClarifierNode })));
const RapidGravityFilterNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.RapidGravityFilterNode })));
const GACFilterNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.GACFilterNode })));
const SandFilterNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.SandFilterNode })));
const MembraneFilterNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.MembraneFilterNode })));
const ChlorineContactTankNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.ChlorineContactTankNode })));
const UVDisinfectionChamberNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.UVDisinfectionChamberNode })));
const OzoneContactVesselNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.OzoneContactVesselNode })));
const WetWellNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.WetWellNode })));
const SubmersiblePumpStationNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.SubmersiblePumpStationNode })));
const DryWellPumpStationNode = lazy(() => import('./uk-water/thames').then(m => ({ default: m.DryWellPumpStationNode })));

// UK Water - Severn Trent
const ActivatedSludgeTankNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.ActivatedSludgeTankNode })));
const TricklingFilterNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.TricklingFilterNode })));
const SBRReactorNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.SBRReactorNode })));
const AnaerobicDigesterNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.AnaerobicDigesterNode })));
const StormTankNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.StormTankNode })));
const SludgeThickenerNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.SludgeThickenerNode })));
const CentrifugeNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.CentrifugeNode })));
const BeltFilterPressNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.BeltFilterPressNode })));
const BiofilterNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.BiofilterNode })));
const ChemicalScrubberNode = lazy(() => import('./uk-water/severn-trent').then(m => ({ default: m.ChemicalScrubberNode })));

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

  // Globe Valves
  'globe-valve': {
    id: 'globe-valve',
    name: 'Globe Valve',
    category: 'Valves',
    description: 'Globe valve for throttling and flow regulation',
    component: GlobeValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'V-103',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'globe', 'throttling', 'regulation'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Butterfly Valves
  'butterfly-valve': {
    id: 'butterfly-valve',
    name: 'Butterfly Valve',
    category: 'Valves',
    description: 'Butterfly valve for large diameter applications',
    component: ButterflyValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'V-104',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'butterfly', 'quarter-turn', 'large-diameter'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Check Valves
  'check-valve-swing': {
    id: 'check-valve-swing',
    name: 'Swing Check Valve',
    category: 'Valves',
    description: 'Swing type check valve preventing backflow',
    component: CheckValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'CV-201',
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
      connectionPoints: [],
      checkType: 'swing',
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'check', 'swing', 'non-return', 'backflow-prevention'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'check-valve-lift': {
    id: 'check-valve-lift',
    name: 'Lift Check Valve',
    category: 'Valves',
    description: 'Lift type check valve with vertical disc movement',
    component: CheckValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'CV-202',
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
      connectionPoints: [],
      checkType: 'lift',
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'check', 'lift', 'non-return'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'check-valve-dual-plate': {
    id: 'check-valve-dual-plate',
    name: 'Dual Plate Check Valve',
    category: 'Valves',
    description: 'Wafer type dual plate check valve',
    component: CheckValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'CV-203',
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
      connectionPoints: [],
      checkType: 'dual-plate',
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'check', 'dual-plate', 'wafer', 'non-return'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Safety and Relief Valves
  'safety-valve': {
    id: 'safety-valve',
    name: 'Safety Valve',
    category: 'Valves',
    description: 'Spring-loaded safety valve for overpressure protection',
    component: SafetyValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'PSV-101',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'ASME VIII'
    },
    tags: ['valve', 'safety', 'relief', 'pressure-protection', 'overpressure'],
    standards: ['ISA-5.1', 'ASME VIII', 'API-520']
  },

  'pressure-relief-valve': {
    id: 'pressure-relief-valve',
    name: 'Pressure Relief Valve',
    category: 'Valves',
    description: 'Pressure relief valve for system protection',
    component: PressureReliefValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'PRV-101',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'ISO-4414'
    },
    tags: ['valve', 'relief', 'pressure', 'protection', 'hydraulic', 'pneumatic'],
    standards: ['ISA-5.1', 'ISO-4414', 'ISO-4413']
  },

  'vacuum-relief-valve': {
    id: 'vacuum-relief-valve',
    name: 'Vacuum Relief Valve',
    category: 'Valves',
    description: 'Vacuum relief valve for tank and vessel protection',
    component: VacuumReliefValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'VRV-101',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'API-2000'
    },
    tags: ['valve', 'vacuum', 'relief', 'tank-protection', 'atmospheric'],
    standards: ['ISA-5.1', 'API-2000']
  },

  // Specialty Valves
  'needle-valve': {
    id: 'needle-valve',
    name: 'Needle Valve',
    category: 'Valves',
    description: 'Precision needle valve for fine flow control',
    component: NeedleValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'NV-101',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'needle', 'metering', 'precision', 'fine-control', 'instrumentation'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'diaphragm-valve': {
    id: 'diaphragm-valve',
    name: 'Diaphragm Valve',
    category: 'Valves',
    description: 'Diaphragm valve for corrosive and slurry applications',
    component: DiaphragmValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'DV-101',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'diaphragm', 'corrosive', 'slurry', 'hygienic'],
    standards: ['ISA-5.1', 'ISO-14617', 'ASME-BPE']
  },

  'pinch-valve': {
    id: 'pinch-valve',
    name: 'Pinch Valve',
    category: 'Valves',
    description: 'Pinch valve for slurry and abrasive media',
    component: PinchValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'PV-101',
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
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'pinch', 'slurry', 'abrasive', 'mining'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'plug-valve-2way': {
    id: 'plug-valve-2way',
    name: 'Plug Valve (2-Way)',
    category: 'Valves',
    description: 'Two-way plug valve for on/off service',
    component: PlugValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'PG-101',
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
      connectionPoints: [],
      numberOfPorts: 2,
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'plug', '2-way', 'quarter-turn'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'plug-valve-3way': {
    id: 'plug-valve-3way',
    name: 'Plug Valve (3-Way)',
    category: 'Valves',
    description: 'Three-way plug valve for diverting or mixing service',
    component: PlugValveNode,
    defaultData: {
      symbolType: 'valve',
      label: 'PG-102',
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
      connectionPoints: [],
      numberOfPorts: 3,
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['valve', 'plug', '3-way', 'diverting', 'mixing'],
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
  },

  // ============================================================================
  // VESSEL AND TANK SYMBOLS
  // ============================================================================

  // Storage Vessels
  'storage-tank-atmospheric': {
    id: 'storage-tank-atmospheric',
    name: 'Atmospheric Storage Tank',
    category: 'Vessels & Tanks',
    description: 'Atmospheric pressure storage tank with flat roof',
    component: StorageTankNode,
    defaultData: {
      symbolType: 'tank',
      label: 'TK-101',
      dimensions: {
        width: 120,
        height: 120,
        originX: 60,
        originY: 60,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['tank', 'storage', 'atmospheric', 'vessel'],
    standards: ['ISA-5.1', 'ISO-14617', 'ASME']
  },

  'storage-tank-pressurized': {
    id: 'storage-tank-pressurized',
    name: 'Pressurized Storage Tank',
    category: 'Vessels & Tanks',
    description: 'Pressurized storage vessel with elliptical heads',
    component: StorageTankNode,
    defaultData: {
      symbolType: 'tank',
      label: 'TK-102',
      dimensions: {
        width: 120,
        height: 120,
        originX: 60,
        originY: 60,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['tank', 'storage', 'pressurized', 'vessel', 'pressure'],
    standards: ['ISA-5.1', 'ISO-14617', 'ASME', 'PED']
  },

  // Process Vessels
  'mixing-tank': {
    id: 'mixing-tank',
    name: 'Mixing Tank',
    category: 'Vessels & Tanks',
    description: 'Mixing tank with agitator and baffles',
    component: MixingTankNode,
    defaultData: {
      symbolType: 'tank',
      label: 'MIX-101',
      dimensions: {
        width: 120,
        height: 120,
        originX: 60,
        originY: 60,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['tank', 'mixing', 'agitator', 'process', 'blending'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'separator-two-phase': {
    id: 'separator-two-phase',
    name: 'Two-Phase Separator',
    category: 'Vessels & Tanks',
    description: 'Gas-liquid phase separator',
    component: SeparatorNode,
    defaultData: {
      symbolType: 'separator',
      label: 'SEP-101',
      dimensions: {
        width: 140,
        height: 100,
        originX: 70,
        originY: 50,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['separator', 'two-phase', 'gas-liquid', 'process'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'separator-three-phase': {
    id: 'separator-three-phase',
    name: 'Three-Phase Separator',
    category: 'Vessels & Tanks',
    description: 'Gas-oil-water phase separator',
    component: SeparatorNode,
    defaultData: {
      symbolType: 'separator',
      label: 'SEP-102',
      dimensions: {
        width: 160,
        height: 100,
        originX: 80,
        originY: 50,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['separator', 'three-phase', 'gas-oil-water', 'process'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Specialized Tanks
  'knockout-drum': {
    id: 'knockout-drum',
    name: 'Knockout Drum',
    category: 'Vessels & Tanks',
    description: 'Liquid knockout drum for gas streams',
    component: KnockoutDrumNode,
    defaultData: {
      symbolType: 'tank',
      label: 'KO-101',
      dimensions: {
        width: 100,
        height: 130,
        originX: 50,
        originY: 65,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['knockout', 'drum', 'separator', 'demister'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'flash-drum': {
    id: 'flash-drum',
    name: 'Flash Drum',
    category: 'Vessels & Tanks',
    description: 'Flash evaporation vessel',
    component: FlashDrumNode,
    defaultData: {
      symbolType: 'tank',
      label: 'FD-101',
      dimensions: {
        width: 100,
        height: 130,
        originX: 50,
        originY: 65,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['flash', 'drum', 'evaporation', 'vapor'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'surge-tank': {
    id: 'surge-tank',
    name: 'Surge Tank',
    category: 'Vessels & Tanks',
    description: 'Flow surge absorption tank',
    component: SurgeTankNode,
    defaultData: {
      symbolType: 'tank',
      label: 'ST-101',
      dimensions: {
        width: 100,
        height: 120,
        originX: 50,
        originY: 60,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['surge', 'tank', 'buffer', 'flow'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'accumulator': {
    id: 'accumulator',
    name: 'Accumulator',
    category: 'Vessels & Tanks',
    description: 'Hydraulic/pneumatic accumulator',
    component: AccumulatorNode,
    defaultData: {
      symbolType: 'accumulator',
      label: 'ACC-101',
      dimensions: {
        width: 90,
        height: 110,
        originX: 45,
        originY: 55,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['accumulator', 'hydraulic', 'pneumatic', 'pressure'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'buffer-tank': {
    id: 'buffer-tank',
    name: 'Buffer Tank',
    category: 'Vessels & Tanks',
    description: 'Process buffer tank',
    component: BufferTankNode,
    defaultData: {
      symbolType: 'tank',
      label: 'BUF-101',
      dimensions: {
        width: 100,
        height: 120,
        originX: 50,
        originY: 60,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['buffer', 'tank', 'storage', 'residence'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Reactors
  'reactor-batch': {
    id: 'reactor-batch',
    name: 'Batch Reactor',
    category: 'Vessels & Tanks',
    description: 'Batch chemical reactor with agitation',
    component: ReactorNode,
    defaultData: {
      symbolType: 'reactor',
      label: 'R-101',
      dimensions: {
        width: 120,
        height: 140,
        originX: 60,
        originY: 70,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['reactor', 'batch', 'chemical', 'reaction'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'reactor-continuous': {
    id: 'reactor-continuous',
    name: 'Continuous Reactor (CSTR)',
    category: 'Vessels & Tanks',
    description: 'Continuous stirred tank reactor',
    component: ReactorNode,
    defaultData: {
      symbolType: 'reactor',
      label: 'R-102',
      dimensions: {
        width: 120,
        height: 140,
        originX: 60,
        originY: 70,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['reactor', 'continuous', 'CSTR', 'chemical'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Columns
  'distillation-column': {
    id: 'distillation-column',
    name: 'Distillation Column',
    category: 'Vessels & Tanks',
    description: 'Distillation column with trays/packing',
    component: ColumnNode,
    defaultData: {
      symbolType: 'column',
      label: 'C-101',
      dimensions: {
        width: 80,
        height: 200,
        originX: 40,
        originY: 100,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['column', 'distillation', 'separation', 'tray', 'packing'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'absorption-column': {
    id: 'absorption-column',
    name: 'Absorption Column',
    category: 'Vessels & Tanks',
    description: 'Gas absorption column',
    component: ColumnNode,
    defaultData: {
      symbolType: 'column',
      label: 'C-102',
      dimensions: {
        width: 80,
        height: 180,
        originX: 40,
        originY: 90,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['column', 'absorption', 'scrubber', 'gas'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Heat Exchangers - TEMA Shell and Tube
  'tema-bem-exchanger': {
    id: 'tema-bem-exchanger',
    name: 'TEMA BEM Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Bonnet/One-Pass Shell/Fixed Tubesheet - Most economical, non-removable bundle',
    component: BEMHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-101',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'TEMA'
    },
    tags: ['heat-exchanger', 'TEMA', 'shell-and-tube', 'BEM', 'fixed-tubesheet'],
    standards: ['ISA-5.1', 'TEMA']
  },

  'tema-aes-exchanger': {
    id: 'tema-aes-exchanger',
    name: 'TEMA AES Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Channel/One-Pass Shell/Floating Head - Removable bundle, thermal expansion',
    component: AESHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-102',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'TEMA'
    },
    tags: ['heat-exchanger', 'TEMA', 'shell-and-tube', 'AES', 'floating-head'],
    standards: ['ISA-5.1', 'TEMA']
  },

  'tema-bku-exchanger': {
    id: 'tema-bku-exchanger',
    name: 'TEMA BKU Kettle Reboiler',
    category: 'Heat Exchangers',
    description: 'Bonnet/Kettle/U-Tube - Kettle reboiler with vapor space',
    component: BKUHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-201',
      dimensions: {
        width: 140,
        height: 70,
        originX: 70,
        originY: 35,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'TEMA'
    },
    tags: ['heat-exchanger', 'TEMA', 'kettle', 'reboiler', 'BKU', 'u-tube'],
    standards: ['ISA-5.1', 'TEMA']
  },

  'tema-aeu-exchanger': {
    id: 'tema-aeu-exchanger',
    name: 'TEMA AEU Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Channel/One-Pass Shell/U-Tube - Economical, thermal expansion capability',
    component: AEUHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-103',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'TEMA'
    },
    tags: ['heat-exchanger', 'TEMA', 'shell-and-tube', 'AEU', 'u-tube'],
    standards: ['ISA-5.1', 'TEMA']
  },

  'tema-aep-exchanger': {
    id: 'tema-aep-exchanger',
    name: 'TEMA AEP Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Channel/One-Pass Shell/Packed Floating - Easy maintenance, high temperature',
    component: AEPHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-104',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'TEMA'
    },
    tags: ['heat-exchanger', 'TEMA', 'shell-and-tube', 'AEP', 'packed-floating'],
    standards: ['ISA-5.1', 'TEMA']
  },

  'tema-afu-exchanger': {
    id: 'tema-afu-exchanger',
    name: 'TEMA AFU Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Channel/Two-Pass Shell/U-Tube - Higher shell-side velocity',
    component: AFUHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-105',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'TEMA'
    },
    tags: ['heat-exchanger', 'TEMA', 'shell-and-tube', 'AFU', 'two-pass', 'u-tube'],
    standards: ['ISA-5.1', 'TEMA']
  },

  // Heat Exchangers - Plate Type
  'gasketed-plate-exchanger': {
    id: 'gasketed-plate-exchanger',
    name: 'Gasketed Plate Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Plate heat exchanger with gaskets - Easy maintenance, high efficiency',
    component: GaskettedPlateHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-301',
      dimensions: {
        width: 80,
        height: 60,
        originX: 40,
        originY: 30,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'plate', 'gasketed', 'compact'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'brazed-plate-exchanger': {
    id: 'brazed-plate-exchanger',
    name: 'Brazed Plate Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Compact brazed plate exchanger - High pressure, no gaskets',
    component: BrazedPlateHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-302',
      dimensions: {
        width: 70,
        height: 50,
        originX: 35,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'plate', 'brazed', 'compact', 'high-pressure'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Heat Exchangers - Air Cooled
  'forced-draft-air-cooler': {
    id: 'forced-draft-air-cooler',
    name: 'Forced Draft Air Cooler',
    category: 'Heat Exchangers',
    description: 'Air-cooled heat exchanger with fan below bundle',
    component: ForcedDraftAirCooler,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-401',
      dimensions: {
        width: 100,
        height: 80,
        originX: 50,
        originY: 40,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'air-cooled', 'forced-draft', 'fan'],
    standards: ['ISA-5.1', 'ISO-14617', 'API-661']
  },

  'induced-draft-air-cooler': {
    id: 'induced-draft-air-cooler',
    name: 'Induced Draft Air Cooler',
    category: 'Heat Exchangers',
    description: 'Air-cooled heat exchanger with fan above bundle',
    component: InducedDraftAirCooler,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-402',
      dimensions: {
        width: 100,
        height: 80,
        originX: 50,
        originY: 40,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'air-cooled', 'induced-draft', 'fan'],
    standards: ['ISA-5.1', 'ISO-14617', 'API-661']
  },

  // Heat Exchangers - Condensers
  'surface-condenser': {
    id: 'surface-condenser',
    name: 'Surface Condenser',
    category: 'Heat Exchangers',
    description: 'Shell and tube condenser for vapor condensation',
    component: SurfaceCondenser,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-501',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'condenser', 'surface', 'shell-and-tube'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'air-cooled-condenser': {
    id: 'air-cooled-condenser',
    name: 'Air-Cooled Condenser',
    category: 'Heat Exchangers',
    description: 'Air-cooled condenser for vapor condensation',
    component: AirCooledCondenser,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-502',
      dimensions: {
        width: 100,
        height: 80,
        originX: 50,
        originY: 40,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'condenser', 'air-cooled'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Heat Exchangers - Reboilers
  'kettle-reboiler': {
    id: 'kettle-reboiler',
    name: 'Kettle Reboiler',
    category: 'Heat Exchangers',
    description: 'Kettle-type reboiler with vapor disengagement space',
    component: KettleReboiler,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-601',
      dimensions: {
        width: 140,
        height: 70,
        originX: 70,
        originY: 35,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'reboiler', 'kettle', 'vaporization'],
    standards: ['ISA-5.1', 'TEMA']
  },

  'thermosiphon-reboiler': {
    id: 'thermosiphon-reboiler',
    name: 'Thermosiphon Reboiler',
    category: 'Heat Exchangers',
    description: 'Natural circulation reboiler',
    component: ThermosiphonReboiler,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-602',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'reboiler', 'thermosiphon', 'natural-circulation'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'forced-circulation-reboiler': {
    id: 'forced-circulation-reboiler',
    name: 'Forced Circulation Reboiler',
    category: 'Heat Exchangers',
    description: 'Reboiler with pump-assisted circulation',
    component: ForcedCirculationReboiler,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-603',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'reboiler', 'forced-circulation', 'pump'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Heat Exchangers - Specialty Types
  'spiral-heat-exchanger': {
    id: 'spiral-heat-exchanger',
    name: 'Spiral Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Spiral plate heat exchanger - High fouling resistance',
    component: SpiralHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-701',
      dimensions: {
        width: 70,
        height: 70,
        originX: 35,
        originY: 35,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'spiral', 'high-fouling', 'specialty'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'double-pipe-exchanger': {
    id: 'double-pipe-exchanger',
    name: 'Double Pipe Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Simple double-pipe (hairpin) heat exchanger',
    component: DoublePipeHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-702',
      dimensions: {
        width: 100,
        height: 40,
        originX: 50,
        originY: 20,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'double-pipe', 'hairpin', 'simple'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'scraped-surface-exchanger': {
    id: 'scraped-surface-exchanger',
    name: 'Scraped Surface Heat Exchanger',
    category: 'Heat Exchangers',
    description: 'Heat exchanger with rotating scraper blades - For viscous fluids',
    component: ScrapedSurfaceHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-703',
      dimensions: {
        width: 100,
        height: 50,
        originX: 50,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'scraped-surface', 'viscous', 'specialty'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'printed-circuit-exchanger': {
    id: 'printed-circuit-exchanger',
    name: 'Printed Circuit Heat Exchanger (PCHE)',
    category: 'Heat Exchangers',
    description: 'Compact microchannel heat exchanger - High pressure, compact',
    component: PrintedCircuitHeatExchanger,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-704',
      dimensions: {
        width: 60,
        height: 60,
        originX: 30,
        originY: 30,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'PCHE', 'microchannel', 'compact', 'high-pressure'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // Heat Exchangers - Other Equipment
  'economizer': {
    id: 'economizer',
    name: 'Economizer',
    category: 'Heat Exchangers',
    description: 'Waste heat recovery heat exchanger',
    component: Economizer,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-801',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'economizer', 'waste-heat-recovery'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'vaporizer': {
    id: 'vaporizer',
    name: 'Vaporizer',
    category: 'Heat Exchangers',
    description: 'Heat exchanger for liquid vaporization',
    component: Vaporizer,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-802',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'vaporizer', 'evaporation'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'cooler': {
    id: 'cooler',
    name: 'Cooler',
    category: 'Heat Exchangers',
    description: 'General purpose cooling heat exchanger',
    component: Cooler,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-803',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'cooler', 'cooling'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  'heater': {
    id: 'heater',
    name: 'Heater',
    category: 'Heat Exchangers',
    description: 'General purpose heating heat exchanger',
    component: Heater,
    defaultData: {
      symbolType: 'heat_exchanger',
      label: 'E-804',
      dimensions: {
        width: 120,
        height: 50,
        originX: 60,
        originY: 25,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.5,
        maintainAspectRatio: true,
        units: 'px'
      },
      connectionPoints: [],
      state: 'idle',
      standard: 'ISA-5.1'
    },
    tags: ['heat-exchanger', 'heater', 'heating'],
    standards: ['ISA-5.1', 'ISO-14617']
  },

  // ============================================================================
  // INSTRUMENTATION - FLOW MEASUREMENT
  // ============================================================================

  'orifice-plate': {
    id: 'orifice-plate',
    name: 'Orifice Plate',
    category: 'Instruments',
    description: 'Differential pressure flow measurement using orifice restriction',
    component: OrificePlateNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'FE-101',
      tag: 'FE-101',
      dimensions: {
        width: 60,
        height: 80,
        originX: 30,
        originY: 40,
        scale: 1.0,
        minScale: 0.5,
        maxScale: 2.0,
      }
    },
    tags: ['instrument', 'flow', 'orifice', 'differential-pressure'],
    standards: ['ISA-5.1', 'ISO-5167', 'ASME-MFC-3M']
  },

  'venturi-meter': {
    id: 'venturi-meter',
    name: 'Venturi Meter',
    category: 'Instruments',
    description: 'Low pressure drop flow measurement using venturi effect',
    component: VenturiMeterNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'FE-102',
      tag: 'FE-102',
      dimensions: {
        width: 80,
        height: 70,
        originX: 40,
        originY: 35,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'flow', 'venturi', 'differential-pressure'],
    standards: ['ISA-5.1', 'ISO-5167']
  },

  'magnetic-flowmeter': {
    id: 'magnetic-flowmeter',
    name: 'Magnetic Flowmeter',
    category: 'Instruments',
    description: 'Electromagnetic induction flow measurement for conductive liquids',
    component: MagneticFlowmeterNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'FT-103',
      tag: 'FT-103',
      dimensions: {
        width: 70,
        height: 80,
        originX: 35,
        originY: 40,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'flow', 'magnetic', 'magmeter'],
    standards: ['ISA-5.1', 'ISO-9104']
  },

  'vortex-flowmeter': {
    id: 'vortex-flowmeter',
    name: 'Vortex Flowmeter',
    category: 'Instruments',
    description: 'Vortex shedding frequency flow measurement',
    component: VortexFlowmeterNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'FT-104',
      tag: 'FT-104',
      dimensions: {
        width: 60,
        height: 75,
        originX: 30,
        originY: 37,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'flow', 'vortex', 'steam'],
    standards: ['ISA-5.1', 'ISO-10790']
  },

  // ============================================================================
  // INSTRUMENTATION - TEMPERATURE MEASUREMENT
  // ============================================================================

  'thermocouple': {
    id: 'thermocouple',
    name: 'Thermocouple',
    category: 'Instruments',
    description: 'Seebeck effect temperature measurement',
    component: ThermocoupleNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'TE-201',
      tag: 'TE-201',
      dimensions: {
        width: 50,
        height: 80,
        originX: 25,
        originY: 40,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'temperature', 'thermocouple'],
    standards: ['ISA-5.1', 'IEC-60584']
  },

  'rtd': {
    id: 'rtd',
    name: 'RTD (Resistance Temperature Detector)',
    category: 'Instruments',
    description: 'Resistance-based precision temperature measurement',
    component: RTDNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'TE-202',
      tag: 'TE-202',
      dimensions: {
        width: 50,
        height: 80,
        originX: 25,
        originY: 40,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'temperature', 'rtd', 'pt100'],
    standards: ['ISA-5.1', 'IEC-60751']
  },

  'thermowell': {
    id: 'thermowell',
    name: 'Thermowell',
    category: 'Instruments',
    description: 'Protective sheath for temperature sensors',
    component: ThermowellNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'TW-203',
      tag: 'TW-203',
      dimensions: {
        width: 60,
        height: 90,
        originX: 30,
        originY: 45,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'temperature', 'thermowell', 'protection'],
    standards: ['ISA-5.1', 'ASME-PTC-19.3']
  },

  'bimetallic-thermometer': {
    id: 'bimetallic-thermometer',
    name: 'Bimetallic Thermometer',
    category: 'Instruments',
    description: 'Mechanical dial thermometer using bimetallic strip',
    component: BimetallicThermometerNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'TI-204',
      tag: 'TI-204',
      dimensions: {
        width: 70,
        height: 80,
        originX: 35,
        originY: 40,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'temperature', 'thermometer', 'dial'],
    standards: ['ISA-5.1', 'ASME-B40.200']
  },

  // ============================================================================
  // INSTRUMENTATION - PRESSURE MEASUREMENT
  // ============================================================================

  'bourdon-gauge': {
    id: 'bourdon-gauge',
    name: 'Bourdon Tube Gauge',
    category: 'Instruments',
    description: 'Mechanical pressure gauge using bourdon tube',
    component: BourdonGaugeNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'PI-301',
      tag: 'PI-301',
      dimensions: {
        width: 70,
        height: 80,
        originX: 35,
        originY: 40,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'pressure', 'gauge', 'bourdon'],
    standards: ['ISA-5.1', 'ASME-B40.100']
  },

  'pressure-transmitter': {
    id: 'pressure-transmitter',
    name: 'Pressure Transmitter',
    category: 'Instruments',
    description: 'Electronic pressure measurement and transmission',
    component: PressureTransmitterNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'PT-302',
      tag: 'PT-302',
      dimensions: {
        width: 60,
        height: 70,
        originX: 30,
        originY: 35,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'pressure', 'transmitter', '4-20ma'],
    standards: ['ISA-5.1', 'IEC-61326']
  },

  'differential-pressure': {
    id: 'differential-pressure',
    name: 'Differential Pressure Transmitter',
    category: 'Instruments',
    description: 'Measures pressure difference between two points',
    component: DifferentialPressureNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'PDT-303',
      tag: 'PDT-303',
      dimensions: {
        width: 80,
        height: 100,
        originX: 40,
        originY: 50,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'pressure', 'differential', 'dp', 'flow', 'level'],
    standards: ['ISA-5.1', 'ISA-51.1']
  },

  'diaphragm-seal': {
    id: 'diaphragm-seal',
    name: 'Diaphragm Seal',
    category: 'Instruments',
    description: 'Isolates process fluid from pressure sensor',
    component: DiaphragmSealNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'PS-304',
      tag: 'PS-304',
      dimensions: {
        width: 60,
        height: 70,
        originX: 30,
        originY: 35,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'pressure', 'seal', 'diaphragm', 'remote-seal'],
    standards: ['ISA-5.1', 'ASME-B40.100']
  },

  // ============================================================================
  // INSTRUMENTATION - LEVEL MEASUREMENT
  // ============================================================================

  'float-level': {
    id: 'float-level',
    name: 'Float Level Indicator',
    category: 'Instruments',
    description: 'Buoyancy-based level measurement',
    component: FloatLevelNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'LT-401',
      tag: 'LT-401',
      dimensions: {
        width: 60,
        height: 90,
        originX: 30,
        originY: 45,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'level', 'float', 'buoyancy'],
    standards: ['ISA-5.1', 'API-12K']
  },

  'displacer-level': {
    id: 'displacer-level',
    name: 'Displacer Level Transmitter',
    category: 'Instruments',
    description: 'Archimedes principle level measurement',
    component: DisplacerLevelNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'LT-402',
      tag: 'LT-402',
      dimensions: {
        width: 65,
        height: 95,
        originX: 32,
        originY: 47,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'level', 'displacer', 'interface'],
    standards: ['ISA-5.1', 'API-2350']
  },

  'radar-level': {
    id: 'radar-level',
    name: 'Radar Level Transmitter',
    category: 'Instruments',
    description: 'Microwave radar time-of-flight level measurement',
    component: RadarLevelNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'LT-403',
      tag: 'LT-403',
      dimensions: {
        width: 70,
        height: 80,
        originX: 35,
        originY: 40,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'level', 'radar', 'microwave', 'gwr'],
    standards: ['ISA-5.1', 'IEC-61326', 'NAMUR-NE21']
  },

  'ultrasonic-level': {
    id: 'ultrasonic-level',
    name: 'Ultrasonic Level Transmitter',
    category: 'Instruments',
    description: 'Acoustic time-of-flight level measurement',
    component: UltrasonicLevelNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'LT-404',
      tag: 'LT-404',
      dimensions: {
        width: 70,
        height: 75,
        originX: 35,
        originY: 37,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'level', 'ultrasonic', 'sonic'],
    standards: ['ISA-5.1', 'IEC-61326']
  },

  'capacitance-level': {
    id: 'capacitance-level',
    name: 'Capacitance Level Probe',
    category: 'Instruments',
    description: 'Dielectric constant-based level measurement',
    component: CapacitanceLevelNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'LT-405',
      tag: 'LT-405',
      dimensions: {
        width: 60,
        height: 90,
        originX: 30,
        originY: 45,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'level', 'capacitance', 'rf'],
    standards: ['ISA-5.1', 'IEC-61326']
  },

  // ============================================================================
  // INSTRUMENTATION - ANALYTICAL MEASUREMENT
  // ============================================================================

  'ph-meter': {
    id: 'ph-meter',
    name: 'pH Meter',
    category: 'Instruments',
    description: 'Electrochemical pH measurement (0-14 scale)',
    component: pHMeterNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'AT-501',
      tag: 'AT-501',
      dimensions: {
        width: 70,
        height: 95,
        originX: 35,
        originY: 47,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'analytical', 'ph', 'water-quality'],
    standards: ['ISA-5.1', 'ISO-10523']
  },

  'conductivity-analyzer': {
    id: 'conductivity-analyzer',
    name: 'Conductivity Analyzer',
    category: 'Instruments',
    description: 'Electrical conductivity measurement',
    component: ConductivityAnalyzerNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'AT-502',
      tag: 'AT-502',
      dimensions: {
        width: 70,
        height: 90,
        originX: 35,
        originY: 45,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'analytical', 'conductivity', 'water-quality'],
    standards: ['ISA-5.1', 'ISO-7888']
  },

  'oxygen-analyzer': {
    id: 'oxygen-analyzer',
    name: 'Oxygen Analyzer',
    category: 'Instruments',
    description: 'Dissolved or trace oxygen measurement',
    component: OxygenAnalyzerNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'AT-503',
      tag: 'AT-503',
      dimensions: {
        width: 70,
        height: 90,
        originX: 35,
        originY: 45,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'analytical', 'oxygen', 'do', 'water-quality'],
    standards: ['ISA-5.1', 'ISO-5814']
  },

  'turbidity-meter': {
    id: 'turbidity-meter',
    name: 'Turbidity Meter',
    category: 'Instruments',
    description: 'Optical measurement of water clarity/suspended solids',
    component: TurbidityMeterNode,
    defaultData: {
      symbolType: 'instrument',
      label: 'AT-504',
      tag: 'AT-504',
      dimensions: {
        width: 70,
        height: 85,
        originX: 35,
        originY: 42,
        scale: 1.0,
      }
    },
    tags: ['instrument', 'analytical', 'turbidity', 'ntu', 'water-quality'],
    standards: ['ISA-5.1', 'ISO-7027']
  },

  // ============================================================================
  // CONTROL ELEMENTS - TRANSMITTERS
  // ============================================================================

  'transmitter-generic': {
    id: 'transmitter-generic',
    name: 'Generic Transmitter',
    category: 'Control Elements',
    description: 'Square transmitter symbol with protocol indication',
    component: TransmitterNode,
    defaultData: {
      symbolType: 'transmitter',
      label: 'XT-101',
      tag: 'XT-101',
      dimensions: { width: 60, height: 70, originX: 30, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'transmitter', 'signal'],
    standards: ['ISA-5.1']
  },

  'transmitter-flow': {
    id: 'transmitter-flow',
    name: 'Flow Transmitter',
    category: 'Control Elements',
    description: 'Flow measurement transmitter (FT)',
    component: FlowTransmitterNode,
    defaultData: {
      symbolType: 'transmitter',
      label: 'FT-101',
      tag: 'FT-101',
      dimensions: { width: 60, height: 70, originX: 30, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'transmitter', 'flow'],
    standards: ['ISA-5.1']
  },

  'transmitter-pressure': {
    id: 'transmitter-pressure',
    name: 'Pressure Transmitter',
    category: 'Control Elements',
    description: 'Pressure measurement transmitter (PT)',
    component: PressureTransmitterNode,
    defaultData: {
      symbolType: 'transmitter',
      label: 'PT-201',
      tag: 'PT-201',
      dimensions: { width: 60, height: 70, originX: 30, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'transmitter', 'pressure'],
    standards: ['ISA-5.1']
  },

  'transmitter-temperature': {
    id: 'transmitter-temperature',
    name: 'Temperature Transmitter',
    category: 'Control Elements',
    description: 'Temperature measurement transmitter (TT)',
    component: TemperatureTransmitterNode,
    defaultData: {
      symbolType: 'transmitter',
      label: 'TT-301',
      tag: 'TT-301',
      dimensions: { width: 60, height: 70, originX: 30, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'transmitter', 'temperature'],
    standards: ['ISA-5.1']
  },

  'transmitter-level': {
    id: 'transmitter-level',
    name: 'Level Transmitter',
    category: 'Control Elements',
    description: 'Level measurement transmitter (LT)',
    component: LevelTransmitterNode,
    defaultData: {
      symbolType: 'transmitter',
      label: 'LT-401',
      tag: 'LT-401',
      dimensions: { width: 60, height: 70, originX: 30, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'transmitter', 'level'],
    standards: ['ISA-5.1']
  },

  'transmitter-analytical': {
    id: 'transmitter-analytical',
    name: 'Analytical Transmitter',
    category: 'Control Elements',
    description: 'Analytical measurement transmitter (AT)',
    component: AnalyticalTransmitterNode,
    defaultData: {
      symbolType: 'transmitter',
      label: 'AT-501',
      tag: 'AT-501',
      dimensions: { width: 60, height: 70, originX: 30, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'transmitter', 'analytical'],
    standards: ['ISA-5.1']
  },

  'transmitter-multivariable': {
    id: 'transmitter-multivariable',
    name: 'Multivariable Transmitter',
    category: 'Control Elements',
    description: 'Multiple variable measurement transmitter',
    component: MultivariableTransmitterNode,
    defaultData: {
      symbolType: 'transmitter',
      label: 'MV-601',
      tag: 'MV-601',
      dimensions: { width: 70, height: 80, originX: 35, originY: 40, scale: 1.0 }
    },
    tags: ['control', 'transmitter', 'multivariable'],
    standards: ['ISA-5.1']
  },

  // ============================================================================
  // CONTROL ELEMENTS - CONTROLLERS
  // ============================================================================

  'controller-pid': {
    id: 'controller-pid',
    name: 'PID Controller',
    category: 'Control Elements',
    description: 'Proportional-Integral-Derivative controller with circular symbol',
    component: PIDControllerNode,
    defaultData: {
      symbolType: 'controller',
      label: 'PIC-101',
      tag: 'PIC-101',
      dimensions: { width: 70, height: 70, originX: 35, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'controller', 'pid'],
    standards: ['ISA-5.1']
  },

  'controller-cascade': {
    id: 'controller-cascade',
    name: 'Cascade Controller',
    category: 'Control Elements',
    description: 'Primary and secondary controller in cascade',
    component: CascadeControllerNode,
    defaultData: {
      symbolType: 'controller',
      label: 'CAS-101',
      tag: 'CAS-101',
      dimensions: { width: 90, height: 90, originX: 45, originY: 45, scale: 1.0 }
    },
    tags: ['control', 'controller', 'cascade'],
    standards: ['ISA-5.1']
  },

  'controller-ratio': {
    id: 'controller-ratio',
    name: 'Ratio Controller',
    category: 'Control Elements',
    description: 'Maintains ratio between two variables',
    component: RatioControllerNode,
    defaultData: {
      symbolType: 'controller',
      label: 'RAT-101',
      tag: 'RAT-101',
      dimensions: { width: 75, height: 75, originX: 37, originY: 37, scale: 1.0 }
    },
    tags: ['control', 'controller', 'ratio'],
    standards: ['ISA-5.1']
  },

  'controller-selector': {
    id: 'controller-selector',
    name: 'Selector Controller',
    category: 'Control Elements',
    description: 'High/Low/Middle selector',
    component: SelectorControllerNode,
    defaultData: {
      symbolType: 'controller',
      label: 'SEL-101',
      tag: 'SEL-101',
      dimensions: { width: 70, height: 80, originX: 35, originY: 40, scale: 1.0 }
    },
    tags: ['control', 'controller', 'selector'],
    standards: ['ISA-5.1']
  },

  'controller-split-range': {
    id: 'controller-split-range',
    name: 'Split-Range Controller',
    category: 'Control Elements',
    description: 'Single input controlling multiple outputs',
    component: SplitRangeControllerNode,
    defaultData: {
      symbolType: 'controller',
      label: 'SPL-101',
      tag: 'SPL-101',
      dimensions: { width: 75, height: 75, originX: 37, originY: 37, scale: 1.0 }
    },
    tags: ['control', 'controller', 'split-range'],
    standards: ['ISA-5.1']
  },

  // ============================================================================
  // CONTROL ELEMENTS - INDICATORS
  // ============================================================================

  'indicator-local': {
    id: 'indicator-local',
    name: 'Local Indicator',
    category: 'Control Elements',
    description: 'Field-mounted indicator with hexagon symbol',
    component: LocalIndicatorNode,
    defaultData: {
      symbolType: 'indicator',
      label: 'FI-101',
      tag: 'FI-101',
      dimensions: { width: 60, height: 60, originX: 30, originY: 30, scale: 1.0 }
    },
    tags: ['control', 'indicator', 'local'],
    standards: ['ISA-5.1']
  },

  'indicator-panel': {
    id: 'indicator-panel',
    name: 'Panel Indicator',
    category: 'Control Elements',
    description: 'Control room panel-mounted indicator',
    component: PanelIndicatorNode,
    defaultData: {
      symbolType: 'indicator',
      label: 'PI-101',
      tag: 'PI-101',
      dimensions: { width: 65, height: 65, originX: 32, originY: 32, scale: 1.0 }
    },
    tags: ['control', 'indicator', 'panel'],
    standards: ['ISA-5.1']
  },

  'indicator-digital': {
    id: 'indicator-digital',
    name: 'Digital Display',
    category: 'Control Elements',
    description: 'Digital numeric display with LED/LCD',
    component: DigitalIndicatorNode,
    defaultData: {
      symbolType: 'indicator',
      label: 'DI-101',
      tag: 'DI-101',
      dimensions: { width: 80, height: 50, originX: 40, originY: 25, scale: 1.0 }
    },
    tags: ['control', 'indicator', 'digital'],
    standards: ['ISA-5.1']
  },

  'indicator-analog-gauge': {
    id: 'indicator-analog-gauge',
    name: 'Analog Gauge',
    category: 'Control Elements',
    description: 'Analog dial gauge with needle',
    component: AnalogGaugeIndicatorNode,
    defaultData: {
      symbolType: 'indicator',
      label: 'AI-101',
      tag: 'AI-101',
      dimensions: { width: 70, height: 70, originX: 35, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'indicator', 'analog'],
    standards: ['ISA-5.1']
  },

  'indicator-recorder': {
    id: 'indicator-recorder',
    name: 'Recorder',
    category: 'Control Elements',
    description: 'Chart recorder for trend recording',
    component: RecorderIndicatorNode,
    defaultData: {
      symbolType: 'indicator',
      label: 'FR-101',
      tag: 'FR-101',
      dimensions: { width: 70, height: 70, originX: 35, originY: 35, scale: 1.0 }
    },
    tags: ['control', 'indicator', 'recorder'],
    standards: ['ISA-5.1']
  },

  'indicator-totalizer': {
    id: 'indicator-totalizer',
    name: 'Totalizer',
    category: 'Control Elements',
    description: 'Integrating/totalizing indicator',
    component: TotalizerIndicatorNode,
    defaultData: {
      symbolType: 'indicator',
      label: 'FQ-101',
      tag: 'FQ-101',
      dimensions: { width: 70, height: 65, originX: 35, originY: 32, scale: 1.0 }
    },
    tags: ['control', 'indicator', 'totalizer'],
    standards: ['ISA-5.1']
  },

  // ============================================================================
  // CONTROL ELEMENTS - CONVERTERS
  // ============================================================================

  'converter-ip': {
    id: 'converter-ip',
    name: 'I/P Converter',
    category: 'Control Elements',
    description: 'Current to pneumatic signal converter',
    component: IPConverterNode,
    defaultData: {
      symbolType: 'converter',
      label: 'I/P-101',
      tag: 'I/P-101',
      dimensions: { width: 70, height: 60, originX: 35, originY: 30, scale: 1.0 }
    },
    tags: ['control', 'converter', 'ip', 'pneumatic'],
    standards: ['ISA-5.1']
  },

  'converter-pi': {
    id: 'converter-pi',
    name: 'P/I Converter',
    category: 'Control Elements',
    description: 'Pneumatic to current signal converter',
    component: PIConverterNode,
    defaultData: {
      symbolType: 'converter',
      label: 'P/I-101',
      tag: 'P/I-101',
      dimensions: { width: 70, height: 60, originX: 35, originY: 30, scale: 1.0 }
    },
    tags: ['control', 'converter', 'pi', 'pneumatic'],
    standards: ['ISA-5.1']
  },

  'converter-ep': {
    id: 'converter-ep',
    name: 'E/P Converter',
    category: 'Control Elements',
    description: 'Voltage to pneumatic signal converter',
    component: EPConverterNode,
    defaultData: {
      symbolType: 'converter',
      label: 'E/P-101',
      tag: 'E/P-101',
      dimensions: { width: 70, height: 60, originX: 35, originY: 30, scale: 1.0 }
    },
    tags: ['control', 'converter', 'ep', 'pneumatic'],
    standards: ['ISA-5.1']
  },

  'signal-conditioner': {
    id: 'signal-conditioner',
    name: 'Signal Conditioner',
    category: 'Control Elements',
    description: 'Signal amplification, filtering, and conditioning',
    component: SignalConditionerNode,
    defaultData: {
      symbolType: 'converter',
      label: 'SC-101',
      tag: 'SC-101',
      dimensions: { width: 75, height: 65, originX: 37, originY: 32, scale: 1.0 }
    },
    tags: ['control', 'converter', 'conditioner', 'signal'],
    standards: ['ISA-5.1']
  },

  'signal-isolator': {
    id: 'signal-isolator',
    name: 'Signal Isolator',
    category: 'Control Elements',
    description: 'Galvanic isolation between input and output',
    component: SignalIsolatorNode,
    defaultData: {
      symbolType: 'converter',
      label: 'ISO-101',
      tag: 'ISO-101',
      dimensions: { width: 70, height: 60, originX: 35, originY: 30, scale: 1.0 }
    },
    tags: ['control', 'converter', 'isolator', 'galvanic'],
    standards: ['ISA-5.1']
  },

  'signal-repeater': {
    id: 'signal-repeater',
    name: 'Signal Repeater',
    category: 'Control Elements',
    description: 'Signal amplification for long distances',
    component: SignalRepeaterNode,
    defaultData: {
      symbolType: 'converter',
      label: 'RPT-101',
      tag: 'RPT-101',
      dimensions: { width: 60, height: 50, originX: 30, originY: 25, scale: 1.0 }
    },
    tags: ['control', 'converter', 'repeater', 'amplifier'],
    standards: ['ISA-5.1']
  },

  // ============================================================================
  // CONTROL ELEMENTS - POSITIONERS
  // ============================================================================

  'positioner-pneumatic': {
    id: 'positioner-pneumatic',
    name: 'Pneumatic Positioner',
    category: 'Control Elements',
    description: 'Pneumatic valve positioner with mechanical feedback',
    component: PneumaticPositionerNode,
    defaultData: {
      symbolType: 'positioner',
      label: 'VP-101',
      tag: 'VP-101',
      dimensions: { width: 70, height: 75, originX: 35, originY: 37, scale: 1.0 }
    },
    tags: ['control', 'positioner', 'pneumatic', 'valve'],
    standards: ['ISA-5.1', 'IEC-60534']
  },

  'positioner-electro-pneumatic': {
    id: 'positioner-electro-pneumatic',
    name: 'Electro-Pneumatic Positioner',
    category: 'Control Elements',
    description: 'Electric input with pneumatic output positioner',
    component: ElectroPneumaticPositionerNode,
    defaultData: {
      symbolType: 'positioner',
      label: 'VP-102',
      tag: 'VP-102',
      dimensions: { width: 75, height: 80, originX: 37, originY: 40, scale: 1.0 }
    },
    tags: ['control', 'positioner', 'electro-pneumatic', 'valve'],
    standards: ['ISA-5.1', 'IEC-60534']
  },

  'positioner-digital': {
    id: 'positioner-digital',
    name: 'Digital Smart Positioner',
    category: 'Control Elements',
    description: 'Digital communication positioner with diagnostics',
    component: DigitalPositionerNode,
    defaultData: {
      symbolType: 'positioner',
      label: 'VP-103',
      tag: 'VP-103',
      dimensions: { width: 80, height: 85, originX: 40, originY: 42, scale: 1.0 }
    },
    tags: ['control', 'positioner', 'digital', 'smart', 'valve'],
    standards: ['ISA-5.1', 'IEC-60534', 'NAMUR-NE107']
  },

  'positioner-with-booster': {
    id: 'positioner-with-booster',
    name: 'Positioner with Booster',
    category: 'Control Elements',
    description: 'Positioner with air volume booster for large actuators',
    component: PositionerWithBoosterNode,
    defaultData: {
      symbolType: 'positioner',
      label: 'VP-104',
      tag: 'VP-104',
      dimensions: { width: 85, height: 90, originX: 42, originY: 45, scale: 1.0 }
    },
    tags: ['control', 'positioner', 'booster', 'valve'],
    standards: ['ISA-5.1', 'IEC-60534']
  },

  // ============================================================================
  // Thames Water Treatment Equipment (14 types)
  // Standard: TW-STD-2023
  // ============================================================================

  'thames-primary-clarifier': {
    id: 'thames-primary-clarifier',
    name: 'Primary Clarifier (Thames)',
    category: 'UK Water - Thames',
    description: 'Circular primary sedimentation tank with center-feed well and rotating rake mechanism',
    component: PrimaryClarifierNode,
    defaultData: {
      symbolType: 'clarifier',
      label: 'PC-101',
      tag: 'PC-101',
      clarifierType: 'primary',
      rakeMechanism: 'center-feed',
      diameter: 30,
      depth: 4,
      dimensions: { width: 100, height: 130, originX: 50, originY: 65, scale: 1.0 }
    },
    tags: ['clarifier', 'primary', 'sedimentation', 'thames', 'wastewater'],
    standards: ['TW-STD-2023']
  },

  'thames-secondary-clarifier': {
    id: 'thames-secondary-clarifier',
    name: 'Secondary Clarifier (Thames)',
    category: 'UK Water - Thames',
    description: 'Circular secondary clarifier for activated sludge process with RAS/WAS withdrawal',
    component: SecondaryClarifierNode,
    defaultData: {
      symbolType: 'clarifier',
      label: 'SC-101',
      tag: 'SC-101',
      clarifierType: 'secondary',
      rakeMechanism: 'peripheral-feed',
      diameter: 35,
      depth: 4.5,
      dimensions: { width: 100, height: 130, originX: 50, originY: 65, scale: 1.0 }
    },
    tags: ['clarifier', 'secondary', 'activated-sludge', 'ras', 'was', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-rectangular-clarifier': {
    id: 'thames-rectangular-clarifier',
    name: 'Rectangular Clarifier (Thames)',
    category: 'UK Water - Thames',
    description: 'Rectangular sedimentation tank with traveling bridge scraper mechanism',
    component: RectangularClarifierNode,
    defaultData: {
      symbolType: 'clarifier',
      label: 'RC-101',
      tag: 'RC-101',
      clarifierType: 'rectangular',
      rakeMechanism: 'bridge-scraper',
      length: 40,
      width: 10,
      dimensions: { width: 120, height: 120, originX: 60, originY: 60, scale: 1.0 }
    },
    tags: ['clarifier', 'rectangular', 'bridge-scraper', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-lamella-clarifier': {
    id: 'thames-lamella-clarifier',
    name: 'Lamella Clarifier (Thames)',
    category: 'UK Water - Thames',
    description: 'High-rate clarifier with inclined plate settlers for compact design',
    component: LamellaClarifierNode,
    defaultData: {
      symbolType: 'clarifier',
      label: 'LC-101',
      tag: 'LC-101',
      clarifierType: 'lamella',
      plateAngle: 60,
      plateSpacing: 50,
      dimensions: { width: 90, height: 120, originX: 45, originY: 60, scale: 1.0 }
    },
    tags: ['clarifier', 'lamella', 'plate-settler', 'high-rate', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-rapid-gravity-filter': {
    id: 'thames-rapid-gravity-filter',
    name: 'Rapid Gravity Filter (Thames)',
    category: 'UK Water - Thames',
    description: 'Dual-media filter with air scour backwash system',
    component: RapidGravityFilterNode,
    defaultData: {
      symbolType: 'filter',
      label: 'RGF-101',
      tag: 'RGF-101',
      filterType: 'rapid-gravity',
      mediaConfiguration: 'dual-media',
      backwashSystem: 'air-scour-water',
      dimensions: { width: 100, height: 130, originX: 50, originY: 65, scale: 1.0 }
    },
    tags: ['filter', 'rapid-gravity', 'dual-media', 'backwash', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-gac-filter': {
    id: 'thames-gac-filter',
    name: 'GAC Filter (Thames)',
    category: 'UK Water - Thames',
    description: 'Granular Activated Carbon filter for organics and taste/odor removal',
    component: GACFilterNode,
    defaultData: {
      symbolType: 'filter',
      label: 'GACF-101',
      tag: 'GACF-101',
      filterType: 'gac',
      mediaConfiguration: 'gac',
      mediaDepth: 2.5,
      dimensions: { width: 100, height: 130, originX: 50, originY: 65, scale: 1.0 }
    },
    tags: ['filter', 'gac', 'carbon', 'organics', 'adsorption', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-sand-filter': {
    id: 'thames-sand-filter',
    name: 'Sand Filter (Thames)',
    category: 'UK Water - Thames',
    description: 'Sand filter with air scour for effective particle removal',
    component: SandFilterNode,
    defaultData: {
      symbolType: 'filter',
      label: 'SF-101',
      tag: 'SF-101',
      filterType: 'sand',
      mediaConfiguration: 'single-media',
      hasAirScour: true,
      dimensions: { width: 100, height: 130, originX: 50, originY: 65, scale: 1.0 }
    },
    tags: ['filter', 'sand', 'air-scour', 'particle-removal', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-membrane-filter': {
    id: 'thames-membrane-filter',
    name: 'Membrane Filter (Thames)',
    category: 'UK Water - Thames',
    description: 'Hollow fiber membrane filter with CIP system',
    component: MembraneFilterNode,
    defaultData: {
      symbolType: 'filter',
      label: 'MF-101',
      tag: 'MF-101',
      filterType: 'membrane',
      membraneType: 'hollow-fiber',
      hasCIP: true,
      dimensions: { width: 100, height: 140, originX: 50, originY: 70, scale: 1.0 }
    },
    tags: ['filter', 'membrane', 'ultrafiltration', 'cip', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-chlorine-contact-tank': {
    id: 'thames-chlorine-contact-tank',
    name: 'Chlorine Contact Tank (Thames)',
    category: 'UK Water - Thames',
    description: 'Serpentine baffled contact tank for chlorine disinfection',
    component: ChlorineContactTankNode,
    defaultData: {
      symbolType: 'disinfection',
      label: 'CCT-101',
      tag: 'CCT-101',
      disinfectionType: 'chlorine-contact',
      chlorineType: 'gas-chlorine',
      baffleCount: 6,
      dimensions: { width: 160, height: 120, originX: 80, originY: 60, scale: 1.0 }
    },
    tags: ['disinfection', 'chlorine', 'contact-tank', 'baffled', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-uv-disinfection-chamber': {
    id: 'thames-uv-disinfection-chamber',
    name: 'UV Disinfection Chamber (Thames)',
    category: 'UK Water - Thames',
    description: 'UV lamp banks for chemical-free disinfection',
    component: UVDisinfectionChamberNode,
    defaultData: {
      symbolType: 'disinfection',
      label: 'UV-101',
      tag: 'UV-101',
      disinfectionType: 'uv-chamber',
      uvLampType: 'low-pressure-high-output',
      lampBanks: 3,
      dimensions: { width: 140, height: 110, originX: 70, originY: 55, scale: 1.0 }
    },
    tags: ['disinfection', 'uv', 'ultraviolet', 'lamps', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-ozone-contact-vessel': {
    id: 'thames-ozone-contact-vessel',
    name: 'Ozone Contact Vessel (Thames)',
    category: 'UK Water - Thames',
    description: 'Ozone generator with contact vessel and off-gas destruction',
    component: OzoneContactVesselNode,
    defaultData: {
      symbolType: 'disinfection',
      label: 'OZ-101',
      tag: 'OZ-101',
      disinfectionType: 'ozone-contact',
      ozoneGenerationType: 'corona-discharge',
      offGasDestruction: true,
      dimensions: { width: 180, height: 155, originX: 90, originY: 77, scale: 1.0 }
    },
    tags: ['disinfection', 'ozone', 'advanced-oxidation', 'corona', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-wet-well': {
    id: 'thames-wet-well',
    name: 'Wet Well (Thames)',
    category: 'UK Water - Thames',
    description: 'Wet well with level control and submersible pumps',
    component: WetWellNode,
    defaultData: {
      symbolType: 'pumping',
      label: 'WW-101',
      tag: 'WW-101',
      stationType: 'wet-well',
      levelControlType: 'ultrasonic',
      pumpCount: 2,
      dimensions: { width: 140, height: 145, originX: 70, originY: 72, scale: 1.0 }
    },
    tags: ['pumping', 'wet-well', 'level-control', 'submersible', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-submersible-pump-station': {
    id: 'thames-submersible-pump-station',
    name: 'Submersible Pump Station (Thames)',
    category: 'UK Water - Thames',
    description: 'Complete submersible pumping station with duty/standby configuration',
    component: SubmersiblePumpStationNode,
    defaultData: {
      symbolType: 'pumping',
      label: 'SPS-101',
      tag: 'SPS-101',
      stationType: 'submersible-pump-station',
      pumpConfiguration: 'duty-assist-standby',
      pumpCount: 3,
      dimensions: { width: 160, height: 170, originX: 80, originY: 85, scale: 1.0 }
    },
    tags: ['pumping', 'submersible', 'station', 'duty-standby', 'vfd', 'thames'],
    standards: ['TW-STD-2023']
  },

  'thames-dry-well-pump-station': {
    id: 'thames-dry-well-pump-station',
    name: 'Dry Well Pump Station (Thames)',
    category: 'UK Water - Thames',
    description: 'Dry well pump station with horizontal centrifugal pumps',
    component: DryWellPumpStationNode,
    defaultData: {
      symbolType: 'pumping',
      label: 'DPS-101',
      tag: 'DPS-101',
      stationType: 'dry-well-pump-station',
      pumpType: 'horizontal-centrifugal',
      pumpCount: 2,
      dimensions: { width: 160, height: 145, originX: 80, originY: 72, scale: 1.0 }
    },
    tags: ['pumping', 'dry-well', 'centrifugal', 'horizontal', 'thames'],
    standards: ['TW-STD-2023']
  },

  // ============================================================================
  // Severn Trent Sewage Treatment Equipment (10 types)
  // Standard: ST-ES-2024
  // ============================================================================

  'severn-activated-sludge-tank': {
    id: 'severn-activated-sludge-tank',
    name: 'Activated Sludge Tank (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Activated sludge aeration tank with fine bubble diffused aeration system',
    component: ActivatedSludgeTankNode,
    defaultData: {
      symbolType: 'biological-treatment',
      label: 'AST-101',
      tag: 'AST-101',
      treatmentType: 'activated-sludge',
      aerationSystem: 'fine-bubble-diffused',
      mlss: 3500,
      srt: 15,
      dimensions: { width: 160, height: 155, originX: 80, originY: 77, scale: 1.0 }
    },
    tags: ['biological', 'activated-sludge', 'aeration', 'diffuser', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-trickling-filter': {
    id: 'severn-trickling-filter',
    name: 'Trickling Filter (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Trickling filter with rotating distributor for fixed film biological treatment',
    component: TricklingFilterNode,
    defaultData: {
      symbolType: 'biological-treatment',
      label: 'TF-101',
      tag: 'TF-101',
      treatmentType: 'trickling-filter',
      tricklingFilterType: 'high-rate',
      diameter: 25,
      isDistributorRotating: true,
      dimensions: { width: 160, height: 165, originX: 80, originY: 82, scale: 1.0 }
    },
    tags: ['biological', 'trickling-filter', 'rotating-distributor', 'fixed-film', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-sbr-reactor': {
    id: 'severn-sbr-reactor',
    name: 'SBR Reactor (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Sequencing Batch Reactor with automated fill-react-settle-decant cycle',
    component: SBRReactorNode,
    defaultData: {
      symbolType: 'biological-treatment',
      label: 'SBR-101',
      tag: 'SBR-101',
      treatmentType: 'sbr',
      sbrPhase: 'react',
      cycleTime: 240,
      dimensions: { width: 180, height: 155, originX: 90, originY: 77, scale: 1.0 }
    },
    tags: ['biological', 'sbr', 'sequencing-batch-reactor', 'decanter', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-anaerobic-digester': {
    id: 'severn-anaerobic-digester',
    name: 'Anaerobic Digester (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Mesophilic anaerobic digester with gas recirculation mixing and biogas collection',
    component: AnaerobicDigesterNode,
    defaultData: {
      symbolType: 'anaerobic-digestion',
      label: 'AD-101',
      tag: 'AD-101',
      digesterType: 'mesophilic',
      mixingSystem: 'gas-recirculation',
      temperature: 35,
      isHeated: true,
      isMixing: true,
      dimensions: { width: 180, height: 155, originX: 90, originY: 77, scale: 1.0 }
    },
    tags: ['anaerobic', 'digester', 'biogas', 'sludge-treatment', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-storm-tank': {
    id: 'severn-storm-tank',
    name: 'Storm Tank (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Storm water storage tank with overflow weir and level monitoring',
    component: StormTankNode,
    defaultData: {
      symbolType: 'storm-storage',
      label: 'ST-101',
      tag: 'ST-101',
      tankType: 'storm',
      depth: 5,
      overflowLevel: 4.5,
      alarmLevel: 4.0,
      dimensions: { width: 190, height: 155, originX: 95, originY: 77, scale: 1.0 }
    },
    tags: ['storm', 'storage', 'overflow', 'level-control', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-sludge-thickener': {
    id: 'severn-sludge-thickener',
    name: 'Sludge Thickener (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Gravity sludge thickener with rotating rake mechanism and polymer addition',
    component: SludgeThickenerNode,
    defaultData: {
      symbolType: 'sludge-handling',
      label: 'THK-101',
      tag: 'THK-101',
      handlingType: 'gravity-thickener',
      thickenerType: 'gravity',
      feedSolids: 1.5,
      underflowSolids: 4.0,
      dimensions: { width: 160, height: 165, originX: 80, originY: 82, scale: 1.0 }
    },
    tags: ['sludge', 'thickener', 'gravity', 'polymer', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-centrifuge': {
    id: 'severn-centrifuge',
    name: 'Centrifuge (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Solid bowl decanter centrifuge for sludge dewatering with polymer conditioning',
    component: CentrifugeNode,
    defaultData: {
      symbolType: 'sludge-handling',
      label: 'CF-101',
      tag: 'CF-101',
      handlingType: 'centrifuge',
      centrifugeType: 'solid-bowl',
      bowlSpeed: 3200,
      dimensions: { width: 180, height: 130, originX: 90, originY: 65, scale: 1.0 }
    },
    tags: ['sludge', 'centrifuge', 'dewatering', 'solid-bowl', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-belt-filter-press': {
    id: 'severn-belt-filter-press',
    name: 'Belt Filter Press (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Belt filter press with gravity drainage, low/high pressure zones, and belt wash',
    component: BeltFilterPressNode,
    defaultData: {
      symbolType: 'sludge-handling',
      label: 'BFP-101',
      tag: 'BFP-101',
      handlingType: 'belt-press',
      beltSpeed: 3.0,
      pressureZones: 3,
      dimensions: { width: 185, height: 125, originX: 92, originY: 62, scale: 1.0 }
    },
    tags: ['sludge', 'belt-press', 'dewatering', 'pressure', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-biofilter': {
    id: 'severn-biofilter',
    name: 'Biofilter (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Biological odor filter with organic media bed and moisture control',
    component: BiofilterNode,
    defaultData: {
      symbolType: 'odor-control',
      label: 'BF-101',
      tag: 'BF-101',
      controlType: 'biofilter',
      biofilterMedia: 'compost',
      mediaDepth: 1.5,
      isRunning: true,
      dimensions: { width: 195, height: 175, originX: 97, originY: 87, scale: 1.0 }
    },
    tags: ['odor-control', 'biofilter', 'biological', 'h2s-removal', 'severn-trent'],
    standards: ['ST-ES-2024']
  },

  'severn-chemical-scrubber': {
    id: 'severn-chemical-scrubber',
    name: 'Chemical Scrubber (Severn Trent)',
    category: 'UK Water - Severn Trent',
    description: 'Packed tower chemical scrubber with caustic dosing for acid gas removal',
    component: ChemicalScrubberNode,
    defaultData: {
      symbolType: 'odor-control',
      label: 'CS-101',
      tag: 'CS-101',
      controlType: 'chemical-scrubber',
      scrubberType: 'packed-tower',
      scrubberChemical: 'sodium-hydroxide',
      isRunning: true,
      dimensions: { width: 185, height: 170, originX: 92, originY: 85, scale: 1.0 }
    },
    tags: ['odor-control', 'chemical-scrubber', 'packed-tower', 'caustic', 'severn-trent'],
    standards: ['ST-ES-2024']
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