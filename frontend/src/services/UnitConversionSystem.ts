/**
 * Unit Conversion System
 *
 * Comprehensive unit conversion supporting SI, Imperial, and custom units
 * with automatic conversion in calculations.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type UnitCategory =
  | 'length'
  | 'area'
  | 'volume'
  | 'mass'
  | 'time'
  | 'temperature'
  | 'pressure'
  | 'flow-rate'
  | 'velocity'
  | 'density'
  | 'viscosity'
  | 'energy'
  | 'power'
  | 'heat-transfer-coefficient'
  | 'specific-heat'
  | 'thermal-conductivity';

export interface Unit {
  symbol: string;
  name: string;
  category: UnitCategory;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  isBase?: boolean;
}

export interface ConversionResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  category: UnitCategory;
}

// ============================================================================
// Unit Conversion System
// ============================================================================

export class UnitConversionSystem {
  private units: Map<string, Unit> = new Map();
  private categoryMap: Map<UnitCategory, Set<string>> = new Map();

  constructor() {
    this.initializeUnits();
  }

  // ============================================================================
  // Conversion Methods
  // ============================================================================

  convert(value: number, fromUnit: string, toUnit: string): ConversionResult {
    const from = this.units.get(fromUnit);
    const to = this.units.get(toUnit);

    if (!from || !to) {
      throw new Error(`Unknown unit: ${!from ? fromUnit : toUnit}`);
    }

    if (from.category !== to.category) {
      throw new Error(
        `Cannot convert between different categories: ${from.category} and ${to.category}`
      );
    }

    // Convert to base unit, then to target unit
    const baseValue = from.toBase(value);
    const convertedValue = to.fromBase(baseValue);

    return {
      value: convertedValue,
      fromUnit,
      toUnit,
      category: from.category,
    };
  }

  getUnitsForCategory(category: UnitCategory): Unit[] {
    const unitSymbols = this.categoryMap.get(category) || new Set();
    return Array.from(unitSymbols)
      .map(symbol => this.units.get(symbol))
      .filter((unit): unit is Unit => unit !== undefined);
  }

  getBaseUnit(category: UnitCategory): Unit | undefined {
    const units = this.getUnitsForCategory(category);
    return units.find(u => u.isBase);
  }

  registerUnit(unit: Unit): void {
    this.units.set(unit.symbol, unit);

    if (!this.categoryMap.has(unit.category)) {
      this.categoryMap.set(unit.category, new Set());
    }
    this.categoryMap.get(unit.category)!.add(unit.symbol);
  }

  // ============================================================================
  // Unit Initialization
  // ============================================================================

  private initializeUnits(): void {
    // Length
    this.registerUnit({
      symbol: 'm',
      name: 'meter',
      category: 'length',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'cm',
      name: 'centimeter',
      category: 'length',
      toBase: (v) => v / 100,
      fromBase: (v) => v * 100,
    });

    this.registerUnit({
      symbol: 'mm',
      name: 'millimeter',
      category: 'length',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    });

    this.registerUnit({
      symbol: 'ft',
      name: 'foot',
      category: 'length',
      toBase: (v) => v * 0.3048,
      fromBase: (v) => v / 0.3048,
    });

    this.registerUnit({
      symbol: 'in',
      name: 'inch',
      category: 'length',
      toBase: (v) => v * 0.0254,
      fromBase: (v) => v / 0.0254,
    });

    // Area
    this.registerUnit({
      symbol: 'm²',
      name: 'square meter',
      category: 'area',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'ft²',
      name: 'square foot',
      category: 'area',
      toBase: (v) => v * 0.09290304,
      fromBase: (v) => v / 0.09290304,
    });

    // Volume
    this.registerUnit({
      symbol: 'm³',
      name: 'cubic meter',
      category: 'volume',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'L',
      name: 'liter',
      category: 'volume',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    });

    this.registerUnit({
      symbol: 'gal',
      name: 'gallon (US)',
      category: 'volume',
      toBase: (v) => v * 0.003785411784,
      fromBase: (v) => v / 0.003785411784,
    });

    this.registerUnit({
      symbol: 'ft³',
      name: 'cubic foot',
      category: 'volume',
      toBase: (v) => v * 0.028316846592,
      fromBase: (v) => v / 0.028316846592,
    });

    // Mass
    this.registerUnit({
      symbol: 'kg',
      name: 'kilogram',
      category: 'mass',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'g',
      name: 'gram',
      category: 'mass',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    });

    this.registerUnit({
      symbol: 'lb',
      name: 'pound',
      category: 'mass',
      toBase: (v) => v * 0.45359237,
      fromBase: (v) => v / 0.45359237,
    });

    // Time
    this.registerUnit({
      symbol: 's',
      name: 'second',
      category: 'time',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'min',
      name: 'minute',
      category: 'time',
      toBase: (v) => v * 60,
      fromBase: (v) => v / 60,
    });

    this.registerUnit({
      symbol: 'h',
      name: 'hour',
      category: 'time',
      toBase: (v) => v * 3600,
      fromBase: (v) => v / 3600,
    });

    // Temperature
    this.registerUnit({
      symbol: 'K',
      name: 'Kelvin',
      category: 'temperature',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: '°C',
      name: 'Celsius',
      category: 'temperature',
      toBase: (v) => v + 273.15,
      fromBase: (v) => v - 273.15,
    });

    this.registerUnit({
      symbol: '°F',
      name: 'Fahrenheit',
      category: 'temperature',
      toBase: (v) => (v - 32) * 5/9 + 273.15,
      fromBase: (v) => (v - 273.15) * 9/5 + 32,
    });

    // Pressure
    this.registerUnit({
      symbol: 'Pa',
      name: 'Pascal',
      category: 'pressure',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'kPa',
      name: 'kiloPascal',
      category: 'pressure',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    });

    this.registerUnit({
      symbol: 'bar',
      name: 'bar',
      category: 'pressure',
      toBase: (v) => v * 100000,
      fromBase: (v) => v / 100000,
    });

    this.registerUnit({
      symbol: 'psi',
      name: 'pounds per square inch',
      category: 'pressure',
      toBase: (v) => v * 6894.757293168,
      fromBase: (v) => v / 6894.757293168,
    });

    this.registerUnit({
      symbol: 'atm',
      name: 'atmosphere',
      category: 'pressure',
      toBase: (v) => v * 101325,
      fromBase: (v) => v / 101325,
    });

    // Flow Rate (Volumetric)
    this.registerUnit({
      symbol: 'm³/s',
      name: 'cubic meter per second',
      category: 'flow-rate',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'm³/h',
      name: 'cubic meter per hour',
      category: 'flow-rate',
      toBase: (v) => v / 3600,
      fromBase: (v) => v * 3600,
    });

    this.registerUnit({
      symbol: 'L/s',
      name: 'liter per second',
      category: 'flow-rate',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    });

    this.registerUnit({
      symbol: 'gpm',
      name: 'gallons per minute (US)',
      category: 'flow-rate',
      toBase: (v) => v * 0.00006309019640,
      fromBase: (v) => v / 0.00006309019640,
    });

    // Velocity
    this.registerUnit({
      symbol: 'm/s',
      name: 'meter per second',
      category: 'velocity',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'ft/s',
      name: 'foot per second',
      category: 'velocity',
      toBase: (v) => v * 0.3048,
      fromBase: (v) => v / 0.3048,
    });

    // Density
    this.registerUnit({
      symbol: 'kg/m³',
      name: 'kilogram per cubic meter',
      category: 'density',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'lb/ft³',
      name: 'pound per cubic foot',
      category: 'density',
      toBase: (v) => v * 16.01846337,
      fromBase: (v) => v / 16.01846337,
    });

    // Dynamic Viscosity
    this.registerUnit({
      symbol: 'Pa·s',
      name: 'Pascal-second',
      category: 'viscosity',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'cP',
      name: 'centipoise',
      category: 'viscosity',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    });

    // Energy
    this.registerUnit({
      symbol: 'J',
      name: 'Joule',
      category: 'energy',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'kJ',
      name: 'kiloJoule',
      category: 'energy',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    });

    this.registerUnit({
      symbol: 'BTU',
      name: 'British Thermal Unit',
      category: 'energy',
      toBase: (v) => v * 1055.05585262,
      fromBase: (v) => v / 1055.05585262,
    });

    // Power
    this.registerUnit({
      symbol: 'W',
      name: 'Watt',
      category: 'power',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'kW',
      name: 'kiloWatt',
      category: 'power',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    });

    this.registerUnit({
      symbol: 'hp',
      name: 'horsepower',
      category: 'power',
      toBase: (v) => v * 745.699872,
      fromBase: (v) => v / 745.699872,
    });

    // Heat Transfer Coefficient
    this.registerUnit({
      symbol: 'W/(m²·K)',
      name: 'Watt per square meter Kelvin',
      category: 'heat-transfer-coefficient',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'BTU/(h·ft²·°F)',
      name: 'BTU per hour square foot Fahrenheit',
      category: 'heat-transfer-coefficient',
      toBase: (v) => v * 5.678263337,
      fromBase: (v) => v / 5.678263337,
    });

    // Specific Heat
    this.registerUnit({
      symbol: 'J/(kg·K)',
      name: 'Joule per kilogram Kelvin',
      category: 'specific-heat',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'BTU/(lb·°F)',
      name: 'BTU per pound Fahrenheit',
      category: 'specific-heat',
      toBase: (v) => v * 4186.8,
      fromBase: (v) => v / 4186.8,
    });

    // Thermal Conductivity
    this.registerUnit({
      symbol: 'W/(m·K)',
      name: 'Watt per meter Kelvin',
      category: 'thermal-conductivity',
      toBase: (v) => v,
      fromBase: (v) => v,
      isBase: true,
    });

    this.registerUnit({
      symbol: 'BTU/(h·ft·°F)',
      name: 'BTU per hour foot Fahrenheit',
      category: 'thermal-conductivity',
      toBase: (v) => v * 1.730735,
      fromBase: (v) => v / 1.730735,
    });
  }
}

// Singleton instance
let unitConversionSystemInstance: UnitConversionSystem | null = null;

export function getUnitConversionSystem(): UnitConversionSystem {
  if (!unitConversionSystemInstance) {
    unitConversionSystemInstance = new UnitConversionSystem();
  }
  return unitConversionSystemInstance;
}
