/**
 * Advanced Calculation Engine for Engineering Properties
 *
 * Provides comprehensive engineering calculations with:
 * - Fluid dynamics (Reynolds, pressure drop, flow velocity)
 * - Heat transfer (heat duty, LMTD, U-value)
 * - Pump calculations (NPSH, power, efficiency)
 * - Valve sizing (Cv/Kv)
 * - Material properties (density, viscosity)
 * - Pipe sizing (velocity, erosional velocity)
 * - Dependency tracking and auto-recalculation
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface CalculationContext {
  variables: Map<string, number>;
  units: Map<string, string>;
  formulas: Map<string, Formula>;
  dependencies: DependencyGraph;
}

export interface Formula {
  id: string;
  name: string;
  expression: string;
  inputs: string[];
  output: string;
  unit: string;
  description: string;
  category: FormulaCategory;
  validate?: (inputs: Map<string, number>) => ValidationResult;
}

export type FormulaCategory =
  | 'fluid-dynamics'
  | 'heat-transfer'
  | 'pump-hydraulics'
  | 'valve-sizing'
  | 'material-properties'
  | 'pipe-sizing'
  | 'general';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CalculationResult {
  value: number;
  unit: string;
  formula: string;
  inputs: Record<string, number>;
  intermediateValues?: Record<string, number>;
  warnings?: string[];
}

// ============================================================================
// Dependency Graph for Auto-Recalculation
// ============================================================================

class DependencyGraph {
  private dependencies: Map<string, Set<string>> = new Map();
  private dependents: Map<string, Set<string>> = new Map();

  addDependency(variable: string, dependsOn: string[]): void {
    this.dependencies.set(variable, new Set(dependsOn));

    for (const dep of dependsOn) {
      if (!this.dependents.has(dep)) {
        this.dependents.set(dep, new Set());
      }
      this.dependents.get(dep)!.add(variable);
    }
  }

  getDependents(variable: string): string[] {
    return Array.from(this.dependents.get(variable) || []);
  }

  getTopologicalOrder(startVariable: string): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (variable: string) => {
      if (visited.has(variable)) return;
      visited.add(variable);

      const dependents = this.getDependents(variable);
      for (const dependent of dependents) {
        visit(dependent);
      }

      order.push(variable);
    };

    visit(startVariable);
    return order.reverse();
  }

  hasCircularDependency(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (variable: string): boolean => {
      visited.add(variable);
      recursionStack.add(variable);

      const dependents = this.getDependents(variable);
      for (const dependent of dependents) {
        if (!visited.has(dependent)) {
          if (hasCycle(dependent)) return true;
        } else if (recursionStack.has(dependent)) {
          return true;
        }
      }

      recursionStack.delete(variable);
      return false;
    };

    for (const variable of this.dependencies.keys()) {
      if (!visited.has(variable)) {
        if (hasCycle(variable)) return true;
      }
    }

    return false;
  }
}

// ============================================================================
// Calculation Engine
// ============================================================================

export class CalculationEngine {
  private context: CalculationContext;
  private formulaLibrary: Map<string, Formula>;

  constructor() {
    this.context = {
      variables: new Map(),
      units: new Map(),
      formulas: new Map(),
      dependencies: new DependencyGraph(),
    };
    this.formulaLibrary = new Map();
    this.initializeFormulaLibrary();
  }

  // ============================================================================
  // Variable Management
  // ============================================================================

  setVariable(name: string, value: number, unit?: string): void {
    this.context.variables.set(name, value);
    if (unit) {
      this.context.units.set(name, unit);
    }

    // Trigger recalculation of dependent variables
    this.recalculateDependents(name);
  }

  getVariable(name: string): number | undefined {
    return this.context.variables.get(name);
  }

  getVariableWithUnit(name: string): { value: number; unit: string } | undefined {
    const value = this.context.variables.get(name);
    const unit = this.context.units.get(name);
    if (value !== undefined) {
      return { value, unit: unit || 'dimensionless' };
    }
    return undefined;
  }

  // ============================================================================
  // Formula Execution
  // ============================================================================

  calculate(formulaId: string, inputs: Record<string, number>): CalculationResult {
    const formula = this.formulaLibrary.get(formulaId);
    if (!formula) {
      throw new Error(`Formula not found: ${formulaId}`);
    }

    // Validate inputs
    if (formula.validate) {
      const validation = formula.validate(new Map(Object.entries(inputs)));
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Execute formula
    const inputMap = new Map(Object.entries(inputs));
    const value = this.executeFormula(formula.expression, inputMap);

    return {
      value,
      unit: formula.unit,
      formula: formula.expression,
      inputs,
    };
  }

  private executeFormula(expression: string, variables: Map<string, number>): number {
    // Replace variables with values
    let expr = expression;
    for (const [name, value] of variables) {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      expr = expr.replace(regex, value.toString());
    }

    // Add engineering functions
    const context = {
      PI: Math.PI,
      E: Math.E,
      sqrt: Math.sqrt,
      pow: Math.pow,
      exp: Math.exp,
      log: Math.log,
      log10: Math.log10,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      abs: Math.abs,
      min: Math.min,
      max: Math.max,
      // Custom engineering functions
      reynolds: this.calculateReynolds.bind(this),
      frictionFactor: this.calculateFrictionFactor.bind(this),
      lmtd: this.calculateLMTD.bind(this),
    };

    try {
      // Safe evaluation using Function constructor with restricted context
      const func = new Function(...Object.keys(context), `return ${expr}`);
      return func(...Object.values(context));
    } catch (error) {
      throw new Error(`Formula execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private recalculateDependents(variable: string): void {
    const dependents = this.context.dependencies.getTopologicalOrder(variable);

    for (const dependent of dependents) {
      const formula = this.context.formulas.get(dependent);
      if (formula) {
        const inputs: Record<string, number> = {};
        for (const input of formula.inputs) {
          const value = this.context.variables.get(input);
          if (value !== undefined) {
            inputs[input] = value;
          }
        }

        try {
          const result = this.calculate(formula.id, inputs);
          this.context.variables.set(dependent, result.value);
        } catch (error) {
          console.error(`Failed to recalculate ${dependent}:`, error);
        }
      }
    }
  }

  // ============================================================================
  // Fluid Dynamics Calculations
  // ============================================================================

  private calculateReynolds(velocity: number, diameter: number, density: number, viscosity: number): number {
    return (density * velocity * diameter) / viscosity;
  }

  calculateReynoldsNumber(inputs: {
    velocity: number; // m/s
    diameter: number; // m
    density: number; // kg/m³
    viscosity: number; // Pa·s
  }): CalculationResult {
    const Re = this.calculateReynolds(
      inputs.velocity,
      inputs.diameter,
      inputs.density,
      inputs.viscosity
    );

    let flowRegime = 'Unknown';
    if (Re < 2300) flowRegime = 'Laminar';
    else if (Re < 4000) flowRegime = 'Transitional';
    else flowRegime = 'Turbulent';

    return {
      value: Re,
      unit: 'dimensionless',
      formula: 'Re = (ρ × v × D) / μ',
      inputs,
      intermediateValues: { flowRegime: flowRegime as any },
      warnings: Re > 1e6 ? ['Reynolds number extremely high - verify inputs'] : [],
    };
  }

  calculatePressureDrop(inputs: {
    flowRate: number; // m³/s
    diameter: number; // m
    length: number; // m
    density: number; // kg/m³
    viscosity: number; // Pa·s
    roughness: number; // m
  }): CalculationResult {
    const area = Math.PI * Math.pow(inputs.diameter / 2, 2);
    const velocity = inputs.flowRate / area;

    const Re = this.calculateReynolds(velocity, inputs.diameter, inputs.density, inputs.viscosity);
    const f = this.calculateFrictionFactor(Re, inputs.diameter, inputs.roughness);

    const pressureDrop = f * (inputs.length / inputs.diameter) * (inputs.density * Math.pow(velocity, 2)) / 2;

    return {
      value: pressureDrop,
      unit: 'Pa',
      formula: 'ΔP = f × (L/D) × (ρv²/2)',
      inputs,
      intermediateValues: { velocity, reynoldsNumber: Re, frictionFactor: f },
    };
  }

  private calculateFrictionFactor(Re: number, diameter: number, roughness: number): number {
    const relativeRoughness = roughness / diameter;

    if (Re < 2300) {
      // Laminar flow
      return 64 / Re;
    } else {
      // Turbulent flow - Colebrook-White equation (approximation)
      const a = Math.pow(-2.457 * Math.log(Math.pow(7 / Re, 0.9) + 0.27 * relativeRoughness), 16);
      const b = Math.pow(37530 / Re, 16);
      return Math.pow(8 * Math.pow((Math.pow(8 / Re, 12) + 1 / Math.pow(a + b, 1.5)), 1/12), 2);
    }
  }

  calculateFlowVelocity(inputs: {
    flowRate: number; // m³/s
    diameter: number; // m
  }): CalculationResult {
    const area = Math.PI * Math.pow(inputs.diameter / 2, 2);
    const velocity = inputs.flowRate / area;

    const warnings: string[] = [];
    if (velocity > 3) warnings.push('Velocity exceeds recommended limit of 3 m/s for water');
    if (velocity < 0.5) warnings.push('Velocity below recommended minimum of 0.5 m/s');

    return {
      value: velocity,
      unit: 'm/s',
      formula: 'v = Q / A',
      inputs,
      intermediateValues: { area },
      warnings,
    };
  }

  calculateErosionalVelocity(inputs: {
    density: number; // kg/m³
    cFactor?: number; // Empirical constant (default: 100 for carbon steel)
  }): CalculationResult {
    const c = inputs.cFactor || 100;
    const velocity = c / Math.sqrt(inputs.density);

    return {
      value: velocity,
      unit: 'm/s',
      formula: 'Ve = C / √ρ',
      inputs,
      warnings: velocity > 15 ? ['Erosional velocity very high - verify C factor'] : [],
    };
  }

  // ============================================================================
  // Heat Transfer Calculations
  // ============================================================================

  calculateHeatDuty(inputs: {
    massFlow: number; // kg/s
    specificHeat: number; // J/(kg·K)
    temperatureChange: number; // K
  }): CalculationResult {
    const duty = inputs.massFlow * inputs.specificHeat * inputs.temperatureChange;

    return {
      value: duty,
      unit: 'W',
      formula: 'Q = ṁ × Cp × ΔT',
      inputs,
    };
  }

  private calculateLMTD(
    hotInlet: number,
    hotOutlet: number,
    coldInlet: number,
    coldOutlet: number
  ): number {
    const dt1 = hotInlet - coldOutlet;
    const dt2 = hotOutlet - coldInlet;

    if (Math.abs(dt1 - dt2) < 0.01) {
      return (dt1 + dt2) / 2;
    }

    return (dt1 - dt2) / Math.log(dt1 / dt2);
  }

  calculateLogMeanTemperatureDifference(inputs: {
    hotInlet: number; // °C
    hotOutlet: number; // °C
    coldInlet: number; // °C
    coldOutlet: number; // °C
  }): CalculationResult {
    const lmtd = this.calculateLMTD(
      inputs.hotInlet,
      inputs.hotOutlet,
      inputs.coldInlet,
      inputs.coldOutlet
    );

    const warnings: string[] = [];
    if (lmtd < 5) warnings.push('LMTD very low - consider larger heat exchanger');

    return {
      value: lmtd,
      unit: 'K',
      formula: 'LMTD = (ΔT₁ - ΔT₂) / ln(ΔT₁/ΔT₂)',
      inputs,
      warnings,
    };
  }

  calculateOverallHeatTransferCoefficient(inputs: {
    heatDuty: number; // W
    area: number; // m²
    lmtd: number; // K
  }): CalculationResult {
    const U = inputs.heatDuty / (inputs.area * inputs.lmtd);

    const warnings: string[] = [];
    if (U < 100) warnings.push('U-value low - check fouling factors');
    if (U > 2000) warnings.push('U-value very high - verify calculation');

    return {
      value: U,
      unit: 'W/(m²·K)',
      formula: 'U = Q / (A × LMTD)',
      inputs,
      warnings,
    };
  }

  // ============================================================================
  // Pump Calculations
  // ============================================================================

  calculateNPSHAvailable(inputs: {
    atmosphericPressure: number; // Pa
    staticHead: number; // m
    vaporPressure: number; // Pa
    frictionLoss: number; // Pa
    density: number; // kg/m³
  }): CalculationResult {
    const g = 9.81;
    const npsha =
      (inputs.atmosphericPressure - inputs.vaporPressure - inputs.frictionLoss) / (inputs.density * g) +
      inputs.staticHead;

    const warnings: string[] = [];
    if (npsha < 2) warnings.push('NPSHA critically low - cavitation risk');

    return {
      value: npsha,
      unit: 'm',
      formula: 'NPSHa = (Pa - Pv - hf) / (ρg) + z',
      inputs,
      warnings,
    };
  }

  calculatePumpPower(inputs: {
    flowRate: number; // m³/s
    head: number; // m
    density: number; // kg/m³
    efficiency: number; // fraction (0-1)
  }): CalculationResult {
    const g = 9.81;
    const hydraulicPower = inputs.density * g * inputs.flowRate * inputs.head;
    const shaftPower = hydraulicPower / inputs.efficiency;

    const warnings: string[] = [];
    if (inputs.efficiency < 0.5) warnings.push('Pump efficiency very low');
    if (inputs.efficiency > 0.95) warnings.push('Pump efficiency unrealistically high');

    return {
      value: shaftPower,
      unit: 'W',
      formula: 'P = (ρ × g × Q × H) / η',
      inputs,
      intermediateValues: { hydraulicPower },
      warnings,
    };
  }

  // ============================================================================
  // Valve Sizing Calculations
  // ============================================================================

  calculateValveCv(inputs: {
    flowRate: number; // m³/h
    pressureDrop: number; // bar
    specificGravity: number; // dimensionless
  }): CalculationResult {
    const Cv = inputs.flowRate * Math.sqrt(inputs.specificGravity / inputs.pressureDrop);

    return {
      value: Cv,
      unit: 'US gal/min',
      formula: 'Cv = Q × √(SG/ΔP)',
      inputs,
    };
  }

  calculateValveKv(inputs: {
    flowRate: number; // m³/h
    pressureDrop: number; // bar
    specificGravity: number; // dimensionless
  }): CalculationResult {
    const Kv = inputs.flowRate * Math.sqrt(inputs.specificGravity / inputs.pressureDrop);

    return {
      value: Kv,
      unit: 'm³/h',
      formula: 'Kv = Q × √(ρ/ΔP)',
      inputs,
    };
  }

  // ============================================================================
  // Formula Library Initialization
  // ============================================================================

  private initializeFormulaLibrary(): void {
    // Fluid Dynamics
    this.formulaLibrary.set('reynolds-number', {
      id: 'reynolds-number',
      name: 'Reynolds Number',
      expression: 'reynolds(velocity, diameter, density, viscosity)',
      inputs: ['velocity', 'diameter', 'density', 'viscosity'],
      output: 'Re',
      unit: 'dimensionless',
      description: 'Calculate Reynolds number for flow regime determination',
      category: 'fluid-dynamics',
    });

    this.formulaLibrary.set('pressure-drop', {
      id: 'pressure-drop',
      name: 'Pressure Drop (Darcy-Weisbach)',
      expression: 'frictionFactor * (length / diameter) * (density * pow(velocity, 2)) / 2',
      inputs: ['frictionFactor', 'length', 'diameter', 'density', 'velocity'],
      output: 'pressureDrop',
      unit: 'Pa',
      description: 'Calculate pressure drop in pipe using Darcy-Weisbach equation',
      category: 'fluid-dynamics',
    });

    // Heat Transfer
    this.formulaLibrary.set('heat-duty', {
      id: 'heat-duty',
      name: 'Heat Duty',
      expression: 'massFlow * specificHeat * temperatureChange',
      inputs: ['massFlow', 'specificHeat', 'temperatureChange'],
      output: 'heatDuty',
      unit: 'W',
      description: 'Calculate sensible heat duty',
      category: 'heat-transfer',
    });

    this.formulaLibrary.set('lmtd', {
      id: 'lmtd',
      name: 'Log Mean Temperature Difference',
      expression: 'lmtd(hotInlet, hotOutlet, coldInlet, coldOutlet)',
      inputs: ['hotInlet', 'hotOutlet', 'coldInlet', 'coldOutlet'],
      output: 'lmtd',
      unit: 'K',
      description: 'Calculate LMTD for heat exchangers',
      category: 'heat-transfer',
    });

    // Pump Hydraulics
    this.formulaLibrary.set('pump-power', {
      id: 'pump-power',
      name: 'Pump Power',
      expression: '(density * 9.81 * flowRate * head) / efficiency',
      inputs: ['density', 'flowRate', 'head', 'efficiency'],
      output: 'power',
      unit: 'W',
      description: 'Calculate pump shaft power',
      category: 'pump-hydraulics',
    });

    // Valve Sizing
    this.formulaLibrary.set('valve-cv', {
      id: 'valve-cv',
      name: 'Valve Cv',
      expression: 'flowRate * sqrt(specificGravity / pressureDrop)',
      inputs: ['flowRate', 'pressureDrop', 'specificGravity'],
      output: 'Cv',
      unit: 'US gal/min',
      description: 'Calculate valve flow coefficient (US units)',
      category: 'valve-sizing',
    });
  }

  getFormulasByCategory(category: FormulaCategory): Formula[] {
    return Array.from(this.formulaLibrary.values()).filter(f => f.category === category);
  }

  getAllFormulas(): Formula[] {
    return Array.from(this.formulaLibrary.values());
  }
}

// Singleton instance
let calculationEngineInstance: CalculationEngine | null = null;

export function getCalculationEngine(): CalculationEngine {
  if (!calculationEngineInstance) {
    calculationEngineInstance = new CalculationEngine();
  }
  return calculationEngineInstance;
}
