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