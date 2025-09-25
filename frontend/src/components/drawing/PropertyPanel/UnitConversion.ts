/**
 * Unit conversion system for P&ID properties
 */

export type UnitSystem = "metric" | "imperial";

/**
 * Unit category definitions
 */
export type UnitCategory =
  | "length"
  | "area"
  | "volume"
  | "flow_rate"
  | "pressure"
  | "temperature"
  | "power"
  | "mass"
  | "density"
  | "viscosity"
  | "energy"
  | "torque";

/**
 * Unit definition interface
 */
export interface Unit {
  symbol: string;
  name: string;
  category: UnitCategory;
  system: UnitSystem;
  factor: number; // Conversion factor to base unit
  offset?: number; // Offset for temperature conversions
}

/**
 * Unit definitions organized by category
 */
export const UNIT_DEFINITIONS: Record<UnitCategory, Unit[]> = {
  length: [
    // Metric
    { symbol: "mm", name: "Millimeters", category: "length", system: "metric", factor: 0.001 },
    { symbol: "cm", name: "Centimeters", category: "length", system: "metric", factor: 0.01 },
    { symbol: "m", name: "Meters", category: "length", system: "metric", factor: 1 },
    { symbol: "km", name: "Kilometers", category: "length", system: "metric", factor: 1000 },
    // Imperial
    { symbol: "in", name: "Inches", category: "length", system: "imperial", factor: 0.0254 },
    { symbol: "ft", name: "Feet", category: "length", system: "imperial", factor: 0.3048 },
    { symbol: "yd", name: "Yards", category: "length", system: "imperial", factor: 0.9144 },
    { symbol: "mi", name: "Miles", category: "length", system: "imperial", factor: 1609.34 },
  ],

  area: [
    // Metric
    { symbol: "mm²", name: "Square Millimeters", category: "area", system: "metric", factor: 0.000001 },
    { symbol: "cm²", name: "Square Centimeters", category: "area", system: "metric", factor: 0.0001 },
    { symbol: "m²", name: "Square Meters", category: "area", system: "metric", factor: 1 },
    { symbol: "ha", name: "Hectares", category: "area", system: "metric", factor: 10000 },
    // Imperial
    { symbol: "in²", name: "Square Inches", category: "area", system: "imperial", factor: 0.00064516 },
    { symbol: "ft²", name: "Square Feet", category: "area", system: "imperial", factor: 0.092903 },
    { symbol: "yd²", name: "Square Yards", category: "area", system: "imperial", factor: 0.836127 },
  ],

  volume: [
    // Metric
    { symbol: "ml", name: "Milliliters", category: "volume", system: "metric", factor: 0.000001 },
    { symbol: "l", name: "Liters", category: "volume", system: "metric", factor: 0.001 },
    { symbol: "m³", name: "Cubic Meters", category: "volume", system: "metric", factor: 1 },
    // Imperial
    { symbol: "fl oz", name: "Fluid Ounces", category: "volume", system: "imperial", factor: 0.0000295735 },
    { symbol: "pt", name: "Pints", category: "volume", system: "imperial", factor: 0.000473176 },
    { symbol: "qt", name: "Quarts", category: "volume", system: "imperial", factor: 0.000946353 },
    { symbol: "gal", name: "Gallons", category: "volume", system: "imperial", factor: 0.00378541 },
    { symbol: "ft³", name: "Cubic Feet", category: "volume", system: "imperial", factor: 0.0283168 },
  ],

  flow_rate: [
    // Metric
    { symbol: "l/min", name: "Liters per Minute", category: "flow_rate", system: "metric", factor: 0.0000166667 },
    { symbol: "l/h", name: "Liters per Hour", category: "flow_rate", system: "metric", factor: 0.000000277778 },
    { symbol: "m³/h", name: "Cubic Meters per Hour", category: "flow_rate", system: "metric", factor: 0.000277778 },
    { symbol: "m³/s", name: "Cubic Meters per Second", category: "flow_rate", system: "metric", factor: 1 },
    // Imperial
    { symbol: "gpm", name: "Gallons per Minute", category: "flow_rate", system: "imperial", factor: 0.0000630902 },
    { symbol: "gph", name: "Gallons per Hour", category: "flow_rate", system: "imperial", factor: 0.00000105150 },
    { symbol: "ft³/min", name: "Cubic Feet per Minute", category: "flow_rate", system: "imperial", factor: 0.000471947 },
    { symbol: "ft³/s", name: "Cubic Feet per Second", category: "flow_rate", system: "imperial", factor: 0.0283168 },
  ],

  pressure: [
    // Metric
    { symbol: "Pa", name: "Pascals", category: "pressure", system: "metric", factor: 1 },
    { symbol: "kPa", name: "Kilopascals", category: "pressure", system: "metric", factor: 1000 },
    { symbol: "MPa", name: "Megapascals", category: "pressure", system: "metric", factor: 1000000 },
    { symbol: "bar", name: "Bar", category: "pressure", system: "metric", factor: 100000 },
    { symbol: "mbar", name: "Millibar", category: "pressure", system: "metric", factor: 100 },
    { symbol: "atm", name: "Atmospheres", category: "pressure", system: "metric", factor: 101325 },
    // Imperial
    { symbol: "psi", name: "Pounds per Square Inch", category: "pressure", system: "imperial", factor: 6894.76 },
    { symbol: "psig", name: "Pounds per Square Inch Gauge", category: "pressure", system: "imperial", factor: 6894.76 },
    { symbol: "psia", name: "Pounds per Square Inch Absolute", category: "pressure", system: "imperial", factor: 6894.76 },
    { symbol: "inHg", name: "Inches of Mercury", category: "pressure", system: "imperial", factor: 3386.39 },
    { symbol: "inH2O", name: "Inches of Water", category: "pressure", system: "imperial", factor: 248.84 },
  ],

  temperature: [
    // Metric
    { symbol: "°C", name: "Celsius", category: "temperature", system: "metric", factor: 1, offset: 273.15 },
    { symbol: "K", name: "Kelvin", category: "temperature", system: "metric", factor: 1, offset: 0 },
    // Imperial
    { symbol: "°F", name: "Fahrenheit", category: "temperature", system: "imperial", factor: 5/9, offset: 255.372 },
    { symbol: "°R", name: "Rankine", category: "temperature", system: "imperial", factor: 5/9, offset: 0 },
  ],

  power: [
    // Metric
    { symbol: "W", name: "Watts", category: "power", system: "metric", factor: 1 },
    { symbol: "kW", name: "Kilowatts", category: "power", system: "metric", factor: 1000 },
    { symbol: "MW", name: "Megawatts", category: "power", system: "metric", factor: 1000000 },
    // Imperial
    { symbol: "hp", name: "Horsepower", category: "power", system: "imperial", factor: 745.7 },
    { symbol: "BTU/h", name: "BTU per Hour", category: "power", system: "imperial", factor: 0.293071 },
  ],

  mass: [
    // Metric
    { symbol: "g", name: "Grams", category: "mass", system: "metric", factor: 0.001 },
    { symbol: "kg", name: "Kilograms", category: "mass", system: "metric", factor: 1 },
    { symbol: "t", name: "Metric Tons", category: "mass", system: "metric", factor: 1000 },
    // Imperial
    { symbol: "oz", name: "Ounces", category: "mass", system: "imperial", factor: 0.0283495 },
    { symbol: "lb", name: "Pounds", category: "mass", system: "imperial", factor: 0.453592 },
    { symbol: "ton", name: "Short Tons", category: "mass", system: "imperial", factor: 907.185 },
  ],

  density: [
    // Metric
    { symbol: "kg/m³", name: "Kilograms per Cubic Meter", category: "density", system: "metric", factor: 1 },
    { symbol: "g/cm³", name: "Grams per Cubic Centimeter", category: "density", system: "metric", factor: 1000 },
    { symbol: "g/ml", name: "Grams per Milliliter", category: "density", system: "metric", factor: 1000 },
    // Imperial
    { symbol: "lb/ft³", name: "Pounds per Cubic Foot", category: "density", system: "imperial", factor: 16.0185 },
    { symbol: "lb/gal", name: "Pounds per Gallon", category: "density", system: "imperial", factor: 119.826 },
  ],

  viscosity: [
    // Metric
    { symbol: "Pa·s", name: "Pascal Seconds", category: "viscosity", system: "metric", factor: 1 },
    { symbol: "cP", name: "Centipoise", category: "viscosity", system: "metric", factor: 0.001 },
    { symbol: "cSt", name: "Centistokes", category: "viscosity", system: "metric", factor: 0.000001 },
    // Imperial
    { symbol: "lbf·s/ft²", name: "Pound-force Seconds per Square Foot", category: "viscosity", system: "imperial", factor: 47.880 },
  ],

  energy: [
    // Metric
    { symbol: "J", name: "Joules", category: "energy", system: "metric", factor: 1 },
    { symbol: "kJ", name: "Kilojoules", category: "energy", system: "metric", factor: 1000 },
    { symbol: "MJ", name: "Megajoules", category: "energy", system: "metric", factor: 1000000 },
    { symbol: "kWh", name: "Kilowatt Hours", category: "energy", system: "metric", factor: 3600000 },
    // Imperial
    { symbol: "BTU", name: "British Thermal Units", category: "energy", system: "imperial", factor: 1055.06 },
    { symbol: "cal", name: "Calories", category: "energy", system: "imperial", factor: 4.184 },
  ],

  torque: [
    // Metric
    { symbol: "N·m", name: "Newton Meters", category: "torque", system: "metric", factor: 1 },
    { symbol: "kN·m", name: "Kilonewton Meters", category: "torque", system: "metric", factor: 1000 },
    // Imperial
    { symbol: "lb·ft", name: "Pound Feet", category: "torque", system: "imperial", factor: 1.35582 },
    { symbol: "lb·in", name: "Pound Inches", category: "torque", system: "imperial", factor: 0.112985 },
  ],
};

/**
 * Get units for a specific category and system
 */
export function getUnitsForCategory(category: UnitCategory, system?: UnitSystem): Unit[] {
  const units = UNIT_DEFINITIONS[category];
  return system ? units.filter(unit => unit.system === system) : units;
}

/**
 * Get all units for a specific system
 */
export function getUnitsForSystem(system: UnitSystem): Unit[] {
  return Object.values(UNIT_DEFINITIONS).flat().filter(unit => unit.system === system);
}

/**
 * Find a unit by its symbol
 */
export function findUnitBySymbol(symbol: string): Unit | undefined {
  return Object.values(UNIT_DEFINITIONS)
    .flat()
    .find(unit => unit.symbol === symbol);
}

/**
 * Convert a value from one unit to another
 */
export function convertValue(
  value: number,
  fromUnit: string,
  toUnit: string
): { value: number; success: boolean; error?: string } {
  const from = findUnitBySymbol(fromUnit);
  const to = findUnitBySymbol(toUnit);

  if (!from || !to) {
    return {
      value,
      success: false,
      error: `Unit not found: ${!from ? fromUnit : toUnit}`,
    };
  }

  if (from.category !== to.category) {
    return {
      value,
      success: false,
      error: `Cannot convert between different categories: ${from.category} → ${to.category}`,
    };
  }

  try {
    let convertedValue: number;

    if (from.category === "temperature") {
      // Special handling for temperature conversions
      convertedValue = convertTemperature(value, from, to);
    } else {
      // Standard linear conversion
      const baseValue = value * from.factor;
      convertedValue = baseValue / to.factor;
    }

    return {
      value: convertedValue,
      success: true,
    };
  } catch (error) {
    return {
      value,
      success: false,
      error: error instanceof Error ? error.message : "Conversion failed",
    };
  }
}

/**
 * Convert temperature values (special handling for offset)
 */
function convertTemperature(value: number, from: Unit, to: Unit): number {
  // Convert to Kelvin first (base unit for temperature)
  let kelvinValue: number;

  switch (from.symbol) {
    case "°C":
      kelvinValue = value + 273.15;
      break;
    case "°F":
      kelvinValue = (value - 32) * 5/9 + 273.15;
      break;
    case "°R":
      kelvinValue = value * 5/9;
      break;
    case "K":
      kelvinValue = value;
      break;
    default:
      throw new Error(`Unknown temperature unit: ${from.symbol}`);
  }

  // Convert from Kelvin to target unit
  switch (to.symbol) {
    case "°C":
      return kelvinValue - 273.15;
    case "°F":
      return (kelvinValue - 273.15) * 9/5 + 32;
    case "°R":
      return kelvinValue * 9/5;
    case "K":
      return kelvinValue;
    default:
      throw new Error(`Unknown temperature unit: ${to.symbol}`);
  }
}

/**
 * Format a value with its unit
 */
export function formatValueWithUnit(
  value: number | string,
  unit: string,
  precision = 2
): string {
  if (typeof value === "string") {
    return `${value} ${unit}`;
  }

  const formattedValue = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(precision);

  return `${formattedValue} ${unit}`;
}

/**
 * Parse a value with unit string (e.g., "100 m³/h")
 */
export function parseValueWithUnit(input: string): {
  value: number | null;
  unit: string | null;
  success: boolean;
} {
  const trimmed = input.trim();
  const regex = /^([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*(.*)$/;
  const match = trimmed.match(regex);

  if (!match) {
    return { value: null, unit: null, success: false };
  }

  const [, valueStr, unitStr] = match;
  const value = parseFloat(valueStr || '');
  const unit = unitStr?.trim() || '';

  if (isNaN(value)) {
    return { value: null, unit: null, success: false };
  }

  return {
    value,
    unit: unit || null,
    success: true,
  };
}

/**
 * Get suggested units for a property based on common engineering practice
 */
export function getSuggestedUnits(propertyName: string, system: UnitSystem = "metric"): string[] {
  const suggestions: Record<string, { metric: string[]; imperial: string[] }> = {
    diameter: { metric: ["mm", "cm", "m"], imperial: ["in", "ft"] },
    length: { metric: ["mm", "cm", "m"], imperial: ["in", "ft"] },
    height: { metric: ["mm", "cm", "m"], imperial: ["in", "ft"] },
    width: { metric: ["mm", "cm", "m"], imperial: ["in", "ft"] },
    thickness: { metric: ["mm", "cm"], imperial: ["in"] },
    capacity: { metric: ["l", "m³"], imperial: ["gal", "ft³"] },
    volume: { metric: ["l", "m³"], imperial: ["gal", "ft³"] },
    flowRate: { metric: ["l/min", "m³/h"], imperial: ["gpm", "ft³/min"] },
    pressure: { metric: ["bar", "kPa"], imperial: ["psi", "psig"] },
    temperature: { metric: ["°C"], imperial: ["°F"] },
    power: { metric: ["kW", "W"], imperial: ["hp"] },
    mass: { metric: ["kg", "t"], imperial: ["lb", "ton"] },
    weight: { metric: ["kg", "t"], imperial: ["lb", "ton"] },
    density: { metric: ["kg/m³"], imperial: ["lb/ft³"] },
    viscosity: { metric: ["cP", "Pa·s"], imperial: ["cP"] },
    area: { metric: ["m²", "cm²"], imperial: ["ft²", "in²"] },
  };

  const suggestion = suggestions[propertyName];
  return suggestion ? suggestion[system] : [];
}

/**
 * Unit conversion hook-friendly interface
 */
export interface UnitConversionSystem {
  currentSystem: UnitSystem;
  convertValue: typeof convertValue;
  formatValueWithUnit: typeof formatValueWithUnit;
  parseValueWithUnit: typeof parseValueWithUnit;
  getUnitsForCategory: typeof getUnitsForCategory;
  getSuggestedUnits: typeof getSuggestedUnits;
  setSystem: (system: UnitSystem) => void;
}

/**
 * Create a unit conversion system with persistent state
 */
export function createUnitConversionSystem(): UnitConversionSystem {
  let currentSystem: UnitSystem = "metric";

  return {
    get currentSystem() {
      return currentSystem;
    },
    convertValue,
    formatValueWithUnit,
    parseValueWithUnit,
    getUnitsForCategory,
    getSuggestedUnits,
    setSystem: (system: UnitSystem) => {
      currentSystem = system;
    },
  };
}