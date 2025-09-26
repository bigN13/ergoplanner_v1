// Interface exports
export {
  PipeSizeStandard,
  PressureRatingStandard,
  PipingConnectionType,
  type IPipingComponent,
  type IValveComponent,
  type IFittingComponent,
  type IFlangeComponent,
  type PipingMaterial,
  type PipeSize,
  type PressureRating,
  type FlowCharacteristics,
  type ConnectionValidationResult,
  type IPipingConnectionValidator,
} from './IPipingComponent';

// Base component exports
export {
  default as BasePipingNode,
  type BasePipingNodeProps,
} from './BasePipingNode';

// Validator exports
export {
  PipingConnectionValidator,
  pipingConnectionValidator,
} from './PipingConnectionValidator';

// Catalog exports
export {
  PipingSymbolCatalog,
  pipingSymbolCatalog,
  VALVE_CATALOG,
  FITTING_CATALOG,
  FLANGE_CATALOG,
  type ISymbolCatalogEntry,
} from './SymbolCatalog';