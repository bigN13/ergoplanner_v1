// Core symbol architecture exports
export {
  default as SymbolBase,
  createSymbolComponent,
  ConnectionType,
  type IConnectionPoint,
  type ISymbolMetadata,
  type ISymbolBaseData,
  type ISymbolProps,
  type ISymbolValidation,
} from './SymbolBase';

// Symbol registry exports
export {
  default as symbolRegistry,
  SymbolCategory,
  RegisterSymbol,
  registerLazySymbol,
  type ISymbolRegistration,
  type SymbolFactory,
} from './SymbolRegistry';

// SVG renderer exports
export {
  default as OptimizedSVGRenderer,
  SVGPathOptimizer,
  SVGPerformanceMonitor,
  SVGSymbolCache,
  type ISVGRenderOptions,
  type IOptimizedSVGRendererProps,
} from './SVGRenderer';

// Parametric symbol generator exports
export {
  default as parametricSymbolFactory,
  ParametricSymbolGenerator,
  ParametricSymbolFactory,
  type IParametricConfig,
  type IConnectionRule,
  type IMaterialOption,
} from './ParametricSymbolGenerator';

// Instrumentation symbol exports
export {
  InstrumentationSymbolBase,
  InstrumentationSymbolFactory,
  InstrumentFunction,
  BubbleShape,
  SignalLineType,
  PrimaryElementType,
  INSTRUMENTATION_BASE_CONFIG,
  type IInstrumentationMetadata,
  type IInstrumentationSymbolData,
  INSTRUMENT_CATEGORIES,
  MVP_INSTRUMENT_TYPES,
  INSTRUMENT_SYMBOL_COUNTS,
  STANDARD_RANGES,
  getInstrumentSymbol,
  generateTagNumber,
  parseTagNumber,
} from './instrumentation';