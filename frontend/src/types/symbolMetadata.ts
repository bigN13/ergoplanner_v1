/**
 * Symbol Metadata types matching the backend API
 */

export interface SymbolMetadata {
  id: string;
  symbolId: string;
  tagNumber: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  
  // Technical Specifications
  size?: string;
  rating?: string;
  material?: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  
  // Process Data
  service?: string;
  designPressure?: number;
  designPressureUnit?: string;
  designTemperature?: number;
  designTemperatureUnit?: string;
  flowRate?: number;
  flowRateUnit?: string;
  
  // Standards
  isaStandard?: string;
  pipStandard?: string;
  isoStandard?: string;
  dinStandard?: string;
  bsStandard?: string;
  
  // Additional Properties
  customProperties: Record<string, any>;
  
  // Audit Fields
  createdAt: string;
  createdBy: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  version: number;
  
  // Relationships
  parentMetadataId?: string;
  childMetadataIds?: string[];
  templateId?: string;
}

export interface PropertyTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  requiredProperties: string[];
  optionalProperties: string[];
  defaultValues: Record<string, any>;
  validationRules?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateSymbolMetadataRequest {
  symbolId: string;
  tagNumber: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  size?: string;
  rating?: string;
  material?: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  service?: string;
  designPressure?: number;
  designPressureUnit?: string;
  designTemperature?: number;
  designTemperatureUnit?: string;
  flowRate?: number;
  flowRateUnit?: string;
  isaStandard?: string;
  pipStandard?: string;
  isoStandard?: string;
  customProperties?: Record<string, any>;
  parentMetadataId?: string;
  templateId?: string;
}

export interface UpdateSymbolMetadataRequest {
  id: string;
  tagNumber: string;
  name: string;
  description: string;
  size?: string;
  rating?: string;
  material?: string;
  type?: string;
  service?: string;
  designPressure?: number;
  designPressureUnit?: string;
  designTemperature?: number;
  designTemperatureUnit?: string;
  customProperties?: Record<string, any>;
}

export const METADATA_CATEGORIES = [
  'Process Equipment',
  'Piping Components', 
  'Instrumentation',
  'Electrical',
  'Safety',
] as const;

export const PRESSURE_UNITS = ['bar', 'psi', 'kPa', 'MPa', 'atm'] as const;
export const TEMPERATURE_UNITS = ['°C', '°F', 'K'] as const;
export const FLOW_UNITS = ['m³/h', 'gpm', 'L/min', 'L/s', 'ft³/h'] as const;

export type MetadataCategory = typeof METADATA_CATEGORIES[number];
export type PressureUnit = typeof PRESSURE_UNITS[number];
export type TemperatureUnit = typeof TEMPERATURE_UNITS[number];
export type FlowUnit = typeof FLOW_UNITS[number];