/**
 * Symbol Conversion Engine
 * Converts symbols between different standards while preserving semantic meaning
 */

import { SymbolMetadata } from './SymbolCatalog';

// Mapping of equivalent symbols between standards
export const SymbolEquivalenceMap: Record<string, {
  'ISA-5.1'?: string;
  'ISO-14617'?: string;
  'UK-Water'?: string;
}> = {
  // Pumps
  'centrifugal-pump': {
    'ISA-5.1': 'isa-centrifugal-pump',
    'ISO-14617': 'iso-centrifugal-pump',
    'UK-Water': 'uk-centrifugal-pump'
  },
  'positive-displacement-pump': {
    'ISA-5.1': 'isa-positive-displacement-pump',
    'ISO-14617': 'iso-gear-pump',
    'UK-Water': 'uk-positive-pump'
  },
  'reciprocating-pump': {
    'ISA-5.1': 'isa-reciprocating-pump',
    'ISO-14617': 'iso-screw-pump',
    'UK-Water': 'uk-reciprocating-pump'
  },

  // Valves
  'gate-valve': {
    'ISA-5.1': 'isa-gate-valve',
    'ISO-14617': 'iso-shutoff-valve',
    'UK-Water': 'uk-gate-valve'
  },
  'globe-valve': {
    'ISA-5.1': 'isa-globe-valve',
    'ISO-14617': 'iso-throttle-valve',
    'UK-Water': 'uk-globe-valve'
  },
  'ball-valve': {
    'ISA-5.1': 'isa-ball-valve',
    'ISO-14617': 'iso-shutoff-valve',
    'UK-Water': 'uk-ball-valve'
  },
  'butterfly-valve': {
    'ISA-5.1': 'isa-butterfly-valve',
    'ISO-14617': 'iso-throttle-valve',
    'UK-Water': 'uk-butterfly-valve'
  },
  'check-valve': {
    'ISA-5.1': 'isa-check-valve',
    'ISO-14617': 'iso-non-return-valve',
    'UK-Water': 'uk-check-valve'
  },
  'control-valve': {
    'ISA-5.1': 'isa-control-valve',
    'ISO-14617': 'iso-control-valve',
    'UK-Water': 'uk-control-valve'
  },
  'safety-valve': {
    'ISA-5.1': 'isa-safety-relief-valve',
    'ISO-14617': 'iso-safety-valve',
    'UK-Water': 'uk-safety-valve'
  },

  // Tanks & Vessels
  'storage-tank': {
    'ISA-5.1': 'isa-vertical-tank',
    'ISO-14617': 'iso-storage-tank',
    'UK-Water': 'uk-storage-tank'
  },
  'pressure-vessel': {
    'ISA-5.1': 'isa-pressure-vessel',
    'ISO-14617': 'iso-pressure-vessel',
    'UK-Water': 'uk-pressure-vessel'
  },
  'open-tank': {
    'ISA-5.1': 'isa-vertical-tank',
    'ISO-14617': 'iso-open-tank',
    'UK-Water': 'uk-open-tank'
  },

  // Heat Transfer
  'heat-exchanger': {
    'ISA-5.1': 'isa-shell-tube-exchanger',
    'ISO-14617': 'iso-heat-exchanger',
    'UK-Water': 'uk-heat-exchanger'
  },
  'condenser': {
    'ISA-5.1': 'isa-shell-tube-exchanger',
    'ISO-14617': 'iso-condenser',
    'UK-Water': 'uk-condenser'
  },

  // Instruments
  'flow-meter': {
    'ISA-5.1': 'isa-flow-indicator',
    'ISO-14617': 'iso-flow-meter',
    'UK-Water': 'uk-flow-meter'
  },
  'pressure-gauge': {
    'ISA-5.1': 'isa-pressure-indicator',
    'ISO-14617': 'iso-pressure-gauge',
    'UK-Water': 'uk-pressure-gauge'
  },
  'temperature-sensor': {
    'ISA-5.1': 'isa-temperature-indicator',
    'ISO-14617': 'iso-temperature-sensor',
    'UK-Water': 'uk-temperature-sensor'
  },
  'level-gauge': {
    'ISA-5.1': 'isa-level-indicator',
    'ISO-14617': 'iso-level-gauge',
    'UK-Water': 'uk-level-gauge'
  },

  // Process Equipment
  'compressor': {
    'ISA-5.1': 'isa-centrifugal-compressor',
    'ISO-14617': 'iso-compressor',
    'UK-Water': 'uk-compressor'
  },
  'fan': {
    'ISA-5.1': 'isa-centrifugal-compressor',
    'ISO-14617': 'iso-fan',
    'UK-Water': 'uk-fan'
  },
  'blower': {
    'ISA-5.1': 'isa-centrifugal-compressor',
    'ISO-14617': 'iso-blower',
    'UK-Water': 'uk-blower'
  },
  'filter': {
    'ISA-5.1': 'isa-filter',
    'ISO-14617': 'iso-filter',
    'UK-Water': 'uk-filter'
  },
  'separator': {
    'ISA-5.1': 'isa-separator',
    'ISO-14617': 'iso-separator',
    'UK-Water': 'uk-separator'
  },
  'mixer': {
    'ISA-5.1': 'isa-mixer',
    'ISO-14617': 'iso-mixer',
    'UK-Water': 'uk-mixer'
  }
};

// Property mapping between standards
export const PropertyMap: Record<string, Record<string, string>> = {
  'ISA-5.1': {
    'tagNumber': 'label',
    'flowRate': 'flowRate',
    'pressure': 'pressure',
    'temperature': 'temperature',
    'level': 'level',
    'capacity': 'capacity',
    'power': 'power'
  },
  'ISO-14617': {
    'designation': 'label',
    'flow': 'flowRate',
    'pressure': 'pressure',
    'temp': 'temperature',
    'level': 'level',
    'volume': 'capacity',
    'power': 'power'
  },
  'UK-Water': {
    'ref': 'label',
    'flow': 'flowRate',
    'pressure': 'pressure',
    'temperature': 'temperature',
    'level': 'level',
    'capacity': 'capacity',
    'rating': 'power'
  }
};

export interface ConversionResult {
  success: boolean;
  symbolId?: string;
  componentName?: string;
  properties?: Record<string, unknown>;
  warnings?: string[];
  error?: string;
}

/**
 * Convert a symbol from one standard to another
 */
export function convertSymbol(
  symbolId: string,
  fromStandard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water',
  toStandard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water',
  properties?: Record<string, unknown>
): ConversionResult {
  try {
    // Find the generic type for this symbol
    let genericType: string | undefined;

    for (const [type, mappings] of Object.entries(SymbolEquivalenceMap)) {
      if (mappings[fromStandard] === symbolId) {
        genericType = type;
        break;
      }
    }

    if (!genericType) {
      return {
        success: false,
        error: `No conversion mapping found for symbol ${symbolId} from ${fromStandard}`
      };
    }

    // Get the equivalent symbol in the target standard
    const targetSymbolId = SymbolEquivalenceMap[genericType]?.[toStandard];

    if (!targetSymbolId) {
      return {
        success: false,
        error: `No ${toStandard} equivalent found for ${genericType}`
      };
    }

    // Convert properties if provided
    let convertedProperties: Record<string, unknown> = {};
    const warnings: string[] = [];

    if (properties) {
      const fromPropertyMap = PropertyMap[fromStandard];
      const toPropertyMap = PropertyMap[toStandard];

      for (const [key, value] of Object.entries(properties)) {
        // Find the generic property name
        const genericProp = fromPropertyMap[key];

        if (genericProp) {
          // Find the target property name
          const targetProp = Object.entries(toPropertyMap).find(
            ([_, genProp]) => genProp === genericProp
          )?.[0];

          if (targetProp) {
            convertedProperties[targetProp] = convertPropertyValue(
              value,
              genericProp,
              fromStandard,
              toStandard
            );
          } else {
            warnings.push(`Property ${key} could not be mapped to ${toStandard}`);
            convertedProperties[key] = value; // Keep original
          }
        } else {
          // Property not in mapping, keep as is
          convertedProperties[key] = value;
        }
      }
    }

    // Generate component name based on convention
    const componentName = generateComponentName(targetSymbolId, toStandard);

    return {
      success: true,
      symbolId: targetSymbolId,
      componentName,
      properties: convertedProperties,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    };
  }
}

/**
 * Convert property values between standards (units, formats, etc.)
 */
function convertPropertyValue(
  value: unknown,
  propertyType: string,
  fromStandard: string,
  toStandard: string
): unknown {
  // Unit conversions based on property type and standards
  if (typeof value === 'string') {
    // Handle unit conversions
    if (propertyType === 'flowRate') {
      return convertFlowRate(value, fromStandard, toStandard);
    } else if (propertyType === 'pressure') {
      return convertPressure(value, fromStandard, toStandard);
    } else if (propertyType === 'temperature') {
      return convertTemperature(value, fromStandard, toStandard);
    }
  }

  return value; // Return unchanged if no conversion needed
}

/**
 * Convert flow rate units
 */
function convertFlowRate(value: string, fromStandard: string, toStandard: string): string {
  // Simplified conversion - in production would use proper unit conversion library
  const match = value.match(/^([\d.]+)\s*(.+)$/);
  if (!match) return value;

  const [, numStr, unit] = match;
  const num = parseFloat(numStr);

  // Convert m³/h to different standards
  if (unit === 'm³/h') {
    if (toStandard === 'UK-Water') {
      return `${(num * 4.402867).toFixed(2)} gpm`; // Convert to gallons per minute
    }
    return value; // ISO uses same units
  } else if (unit === 'gpm' && toStandard !== 'UK-Water') {
    return `${(num / 4.402867).toFixed(2)} m³/h`; // Convert to m³/h
  }

  return value;
}

/**
 * Convert pressure units
 */
function convertPressure(value: string, fromStandard: string, toStandard: string): string {
  const match = value.match(/^([\d.]+)\s*(.+)$/);
  if (!match) return value;

  const [, numStr, unit] = match;
  const num = parseFloat(numStr);

  // Convert bar to different standards
  if (unit === 'bar' || unit === 'barg') {
    if (toStandard === 'UK-Water') {
      return `${(num * 14.5038).toFixed(2)} psi`; // Convert to PSI
    }
    return value; // ISO uses same units
  } else if (unit === 'psi' && toStandard !== 'UK-Water') {
    return `${(num / 14.5038).toFixed(2)} bar`; // Convert to bar
  }

  return value;
}

/**
 * Convert temperature units
 */
function convertTemperature(value: string, fromStandard: string, toStandard: string): string {
  const match = value.match(/^([\d.]+)\s*°?([CF])$/);
  if (!match) return value;

  const [, numStr, unit] = match;
  const num = parseFloat(numStr);

  // Convert Celsius to Fahrenheit for UK Water standard
  if (unit === 'C' && toStandard === 'UK-Water') {
    return `${((num * 9/5) + 32).toFixed(1)} °F`;
  } else if (unit === 'F' && toStandard !== 'UK-Water') {
    return `${((num - 32) * 5/9).toFixed(1)} °C`;
  }

  return value;
}

/**
 * Generate component name based on symbol ID and standard
 */
function generateComponentName(symbolId: string, standard: string): string {
  // Convert kebab-case to PascalCase
  const parts = symbolId.split('-');
  const pascalCase = parts.map(part =>
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  ).join('');

  // Add standard prefix if needed
  if (standard === 'ISO-14617') {
    return `ISO_${pascalCase}`;
  } else if (standard === 'UK-Water') {
    return `UK_${pascalCase}`;
  }

  return pascalCase;
}

/**
 * Batch convert multiple symbols
 */
export function batchConvertSymbols(
  symbols: Array<{
    id: string;
    properties?: Record<string, unknown>;
  }>,
  fromStandard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water',
  toStandard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water'
): ConversionResult[] {
  return symbols.map(symbol =>
    convertSymbol(symbol.id, fromStandard, toStandard, symbol.properties)
  );
}

/**
 * Get all available conversions for a symbol
 */
export function getAvailableConversions(
  symbolId: string,
  fromStandard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water'
): { standard: string; symbolId: string }[] {
  // Find the generic type
  let genericType: string | undefined;

  for (const [type, mappings] of Object.entries(SymbolEquivalenceMap)) {
    if (mappings[fromStandard] === symbolId) {
      genericType = type;
      break;
    }
  }

  if (!genericType) return [];

  const conversions: { standard: string; symbolId: string }[] = [];
  const mappings = SymbolEquivalenceMap[genericType];

  for (const [standard, id] of Object.entries(mappings)) {
    if (standard !== fromStandard && id) {
      conversions.push({ standard, symbolId: id });
    }
  }

  return conversions;
}

/**
 * Check if a symbol can be converted to another standard
 */
export function canConvert(
  symbolId: string,
  fromStandard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water',
  toStandard: 'ISA-5.1' | 'ISO-14617' | 'UK-Water'
): boolean {
  const conversions = getAvailableConversions(symbolId, fromStandard);
  return conversions.some(c => c.standard === toStandard);
}

export default {
  convertSymbol,
  batchConvertSymbols,
  getAvailableConversions,
  canConvert
};