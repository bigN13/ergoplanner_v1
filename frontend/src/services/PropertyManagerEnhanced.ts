/**
 * Enhanced PropertyManager Service
 * Complete property management system with validation, calculations, templates,
 * history tracking, and unit conversions
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { NodeType } from '@/types/propertySchemas';

// Unit conversion types
type UnitType = 'pressure' | 'temperature' | 'flow' | 'length' | 'mass' | 'volume' | 'power' | 'area';

interface UnitConversion {
  from: string;
  to: string;
  factor: number;
  offset?: number; // For temperature conversions
}

// Property history for undo/redo
interface PropertyHistoryEntry {
  id: string;
  timestamp: number;
  nodeId: string;
  propertyName: string;
  oldValue: any;
  newValue: any;
  userId?: string;
}

// Transaction support for bulk operations
interface PropertyTransaction {
  id: string;
  operations: Array<{
    nodeId: string;
    properties: Record<string, any>;
    previousProperties?: Record<string, any>;
  }>;
  status: 'pending' | 'committed' | 'rolled-back';
  timestamp: number;
}

// Cross-field validation rule
interface CrossFieldValidation {
  id: string;
  name: string;
  fields: string[];
  validator: (values: Record<string, any>) => { valid: boolean; error?: string };
  nodeTypes?: NodeType[];
}

// Engineering formula definition
interface EngineeringFormula {
  id: string;
  name: string;
  category: string;
  formula: (inputs: Record<string, number>) => number;
  inputs: Array<{ name: string; unit: string; description: string }>;
  output: { name: string; unit: string; description: string };
  description: string;
}

// Zustand store interface
interface PropertyManagerStore {
  // State
  history: PropertyHistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;
  transactions: Map<string, PropertyTransaction>;
  activeTransaction: string | null;
  unitPreferences: Map<UnitType, string>;
  
  // Actions
  addHistoryEntry: (entry: Omit<PropertyHistoryEntry, 'id' | 'timestamp'>) => void;
  undo: () => PropertyHistoryEntry | null;
  redo: () => PropertyHistoryEntry | null;
  clearHistory: () => void;
  beginTransaction: () => string;
  commitTransaction: (transactionId: string) => boolean;
  rollbackTransaction: (transactionId: string) => boolean;
  setUnitPreference: (type: UnitType, unit: string) => void;
}

// Create Zustand store
const usePropertyManagerStore = create<PropertyManagerStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      history: [],
      historyIndex: -1,
      maxHistorySize: 100,
      transactions: new Map(),
      activeTransaction: null,
      unitPreferences: new Map([
        ['pressure', 'bar'],
        ['temperature', '°C'],
        ['flow', 'm³/h'],
        ['length', 'm'],
        ['mass', 'kg'],
        ['volume', 'm³'],
        ['power', 'kW'],
        ['area', 'm²'],
      ]),

      // History management
      addHistoryEntry: (entry) => set((state) => {
        const newEntry: PropertyHistoryEntry = {
          ...entry,
          id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        // Remove any entries after current index (for redo)
        state.history = state.history.slice(0, state.historyIndex + 1);
        
        // Add new entry
        state.history.push(newEntry);
        
        // Limit history size
        if (state.history.length > state.maxHistorySize) {
          state.history = state.history.slice(-state.maxHistorySize);
        }
        
        state.historyIndex = state.history.length - 1;
      }),

      undo: (): PropertyHistoryEntry | null => {
        const state = get();
        if (state.historyIndex >= 0) {
          const entry = state.history[state.historyIndex];
          set((s) => { s.historyIndex--; });
          return entry || null;
        }
        return null;
      },

      redo: (): PropertyHistoryEntry | null => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          set((s) => { s.historyIndex++; });
          return state.history[state.historyIndex + 1] || null;
        }
        return null;
      },

      clearHistory: () => set((state) => {
        state.history = [];
        state.historyIndex = -1;
      }),

      // Transaction management
      beginTransaction: () => {
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => {
          state.transactions.set(transactionId, {
            id: transactionId,
            operations: [],
            status: 'pending',
            timestamp: Date.now(),
          });
          state.activeTransaction = transactionId;
        });
        return transactionId;
      },

      commitTransaction: (transactionId) => {
        const state = get();
        const transaction = state.transactions.get(transactionId);
        if (!transaction || transaction.status !== 'pending') return false;
        
        set((s) => {
          const tx = s.transactions.get(transactionId);
          if (tx) {
            tx.status = 'committed';
            if (s.activeTransaction === transactionId) {
              s.activeTransaction = null;
            }
          }
        });
        return true;
      },

      rollbackTransaction: (transactionId) => {
        const state = get();
        const transaction = state.transactions.get(transactionId);
        if (!transaction || transaction.status !== 'pending') return false;
        
        set((s) => {
          const tx = s.transactions.get(transactionId);
          if (tx) {
            tx.status = 'rolled-back';
            if (s.activeTransaction === transactionId) {
              s.activeTransaction = null;
            }
          }
        });
        return true;
      },

      setUnitPreference: (type, unit) => set((state) => {
        state.unitPreferences.set(type, unit);
      }),
    })),
    { name: 'property-manager-store' }
  )
);

/**
 * Enhanced Property Manager Class
 */
export class PropertyManagerEnhanced {
  private static instance: PropertyManagerEnhanced;
  private unitConversions: Map<string, UnitConversion[]>;
  private crossFieldValidations: Map<string, CrossFieldValidation>;
  private engineeringFormulas: Map<string, EngineeringFormula>;

  private constructor() {
    this.unitConversions = new Map();
    this.crossFieldValidations = new Map();
    this.engineeringFormulas = new Map();
    this.initializeUnitConversions();
    this.initializeCrossFieldValidations();
    this.initializeEngineeringFormulas();
  }

  static getInstance(): PropertyManagerEnhanced {
    if (!PropertyManagerEnhanced.instance) {
      PropertyManagerEnhanced.instance = new PropertyManagerEnhanced();
    }
    return PropertyManagerEnhanced.instance;
  }

  /**
   * Initialize unit conversion tables
   */
  private initializeUnitConversions(): void {
    // Pressure conversions
    this.unitConversions.set('pressure', [
      { from: 'bar', to: 'psi', factor: 14.5038 },
      { from: 'bar', to: 'kPa', factor: 100 },
      { from: 'bar', to: 'MPa', factor: 0.1 },
      { from: 'bar', to: 'atm', factor: 0.986923 },
      { from: 'psi', to: 'bar', factor: 0.0689476 },
      { from: 'kPa', to: 'bar', factor: 0.01 },
      { from: 'MPa', to: 'bar', factor: 10 },
      { from: 'atm', to: 'bar', factor: 1.01325 },
    ]);

    // Temperature conversions (with offset)
    this.unitConversions.set('temperature', [
      { from: '°C', to: '°F', factor: 1.8, offset: 32 },
      { from: '°C', to: 'K', factor: 1, offset: 273.15 },
      { from: '°F', to: '°C', factor: 0.5556, offset: -17.7778 },
      { from: 'K', to: '°C', factor: 1, offset: -273.15 },
    ]);

    // Flow rate conversions
    this.unitConversions.set('flow', [
      { from: 'm³/h', to: 'gpm', factor: 4.40287 },
      { from: 'm³/h', to: 'L/min', factor: 16.6667 },
      { from: 'm³/h', to: 'L/s', factor: 0.277778 },
      { from: 'm³/h', to: 'ft³/h', factor: 35.3147 },
      { from: 'gpm', to: 'm³/h', factor: 0.227125 },
      { from: 'L/min', to: 'm³/h', factor: 0.06 },
      { from: 'L/s', to: 'm³/h', factor: 3.6 },
    ]);

    // Length conversions
    this.unitConversions.set('length', [
      { from: 'm', to: 'ft', factor: 3.28084 },
      { from: 'm', to: 'in', factor: 39.3701 },
      { from: 'm', to: 'mm', factor: 1000 },
      { from: 'ft', to: 'm', factor: 0.3048 },
      { from: 'in', to: 'm', factor: 0.0254 },
      { from: 'mm', to: 'm', factor: 0.001 },
    ]);

    // Power conversions
    this.unitConversions.set('power', [
      { from: 'kW', to: 'hp', factor: 1.34102 },
      { from: 'kW', to: 'W', factor: 1000 },
      { from: 'kW', to: 'MW', factor: 0.001 },
      { from: 'hp', to: 'kW', factor: 0.745700 },
    ]);
  }

  /**
   * Initialize cross-field validations
   */
  private initializeCrossFieldValidations(): void {
    // Pump validations
    this.crossFieldValidations.set('pump_npsh_check', {
      id: 'pump_npsh_check',
      name: 'NPSH Margin Check',
      fields: ['npshRequired', 'npshAvailable'],
      validator: (values) => {
        const required = parseFloat(values.npshRequired) || 0;
        const available = parseFloat(values.npshAvailable) || 0;
        const margin = available - required;
        
        if (margin < 0.5) {
          return { 
            valid: false, 
            error: `NPSH margin too low (${margin.toFixed(2)}m). Minimum 0.5m required.`
          };
        }
        return { valid: true };
      },
      nodeTypes: ['pump'],
    });

    // Valve validations
    this.crossFieldValidations.set('valve_cv_check', {
      id: 'valve_cv_check',
      name: 'Cv Adequacy Check',
      fields: ['cvRequired', 'cvValue'],
      validator: (values) => {
        const required = parseFloat(values.cvRequired) || 0;
        const actual = parseFloat(values.cvValue) || 0;
        
        if (actual < required) {
          return { 
            valid: false, 
            error: `Valve Cv (${actual}) is less than required (${required})`
          };
        }
        return { valid: true };
      },
      nodeTypes: ['valve'],
    });

    // Heat exchanger validations
    this.crossFieldValidations.set('hex_temperature_cross', {
      id: 'hex_temperature_cross',
      name: 'Temperature Cross Check',
      fields: ['shellSideTemperatureOut', 'tubeSideTemperatureIn'],
      validator: (values) => {
        const shellOut = parseFloat(values.shellSideTemperatureOut) || 0;
        const tubeIn = parseFloat(values.tubeSideTemperatureIn) || 0;
        
        if (shellOut <= tubeIn) {
          return { 
            valid: false, 
            error: 'Temperature cross detected in heat exchanger'
          };
        }
        return { valid: true };
      },
      nodeTypes: ['heatExchanger'],
    });

    // Pipe validations
    this.crossFieldValidations.set('pipe_velocity_check', {
      id: 'pipe_velocity_check',
      name: 'Velocity Limit Check',
      fields: ['velocity', 'material'],
      validator: (values) => {
        const velocity = parseFloat(values.velocity) || 0;
        const material = values.material || 'CS';
        
        const limits: Record<string, number> = {
          'CS': 3, // Carbon Steel
          'SS': 6, // Stainless Steel
          'PVC': 2.5, // PVC
          'HDPE': 2, // HDPE
        };
        
        const limit = limits[material] || 3;
        
        if (velocity > limit) {
          return { 
            valid: false, 
            error: `Velocity (${velocity} m/s) exceeds limit for ${material} (${limit} m/s)`
          };
        }
        return { valid: true };
      },
      nodeTypes: ['pipe'],
    });
  }

  /**
   * Initialize engineering formulas
   */
  private initializeEngineeringFormulas(): void {
    // Fluid dynamics formulas
    this.engineeringFormulas.set('reynolds_number', {
      id: 'reynolds_number',
      name: 'Reynolds Number',
      category: 'Fluid Dynamics',
      description: 'Dimensionless number for flow regime determination',
      inputs: [
        { name: 'density', unit: 'kg/m³', description: 'Fluid density' },
        { name: 'velocity', unit: 'm/s', description: 'Flow velocity' },
        { name: 'diameter', unit: 'm', description: 'Pipe diameter' },
        { name: 'viscosity', unit: 'Pa·s', description: 'Dynamic viscosity' },
      ],
      output: { name: 'Re', unit: '-', description: 'Reynolds number' },
      formula: (inputs) => {
        const density = inputs.density ?? 0;
        const velocity = inputs.velocity ?? 0;
        const diameter = inputs.diameter ?? 0;
        const viscosity = inputs.viscosity ?? 1;
        return (density * velocity * diameter) / viscosity;
      },
    });

    // Pressure drop - Darcy-Weisbach
    this.engineeringFormulas.set('darcy_weisbach', {
      id: 'darcy_weisbach',
      name: 'Darcy-Weisbach Pressure Drop',
      category: 'Fluid Dynamics',
      description: 'Pressure drop in straight pipes',
      inputs: [
        { name: 'friction', unit: '-', description: 'Friction factor' },
        { name: 'length', unit: 'm', description: 'Pipe length' },
        { name: 'diameter', unit: 'm', description: 'Pipe diameter' },
        { name: 'density', unit: 'kg/m³', description: 'Fluid density' },
        { name: 'velocity', unit: 'm/s', description: 'Flow velocity' },
      ],
      output: { name: 'ΔP', unit: 'Pa', description: 'Pressure drop' },
      formula: (inputs) => {
        const friction = inputs.friction ?? 0;
        const length = inputs.length ?? 0;
        const diameter = inputs.diameter ?? 1;
        const density = inputs.density ?? 0;
        const velocity = inputs.velocity ?? 0;
        return friction * (length / diameter) *
               (density * Math.pow(velocity, 2) / 2);
      },
    });

    // Pump affinity laws
    this.engineeringFormulas.set('pump_affinity_flow', {
      id: 'pump_affinity_flow',
      name: 'Pump Affinity - Flow',
      category: 'Pump Hydraulics',
      description: 'Flow rate change with speed',
      inputs: [
        { name: 'q1', unit: 'm³/h', description: 'Initial flow rate' },
        { name: 'n1', unit: 'rpm', description: 'Initial speed' },
        { name: 'n2', unit: 'rpm', description: 'New speed' },
      ],
      output: { name: 'Q2', unit: 'm³/h', description: 'New flow rate' },
      formula: (inputs) => {
        const q1 = inputs.q1 ?? 0;
        const n1 = inputs.n1 ?? 1;
        const n2 = inputs.n2 ?? 0;
        return q1 * (n2 / n1);
      },
    });

    this.engineeringFormulas.set('pump_affinity_head', {
      id: 'pump_affinity_head',
      name: 'Pump Affinity - Head',
      category: 'Pump Hydraulics',
      description: 'Head change with speed',
      inputs: [
        { name: 'h1', unit: 'm', description: 'Initial head' },
        { name: 'n1', unit: 'rpm', description: 'Initial speed' },
        { name: 'n2', unit: 'rpm', description: 'New speed' },
      ],
      output: { name: 'H2', unit: 'm', description: 'New head' },
      formula: (inputs) => {
        const h1 = inputs.h1 ?? 0;
        const n1 = inputs.n1 ?? 1;
        const n2 = inputs.n2 ?? 0;
        return h1 * Math.pow(n2 / n1, 2);
      },
    });

    this.engineeringFormulas.set('pump_affinity_power', {
      id: 'pump_affinity_power',
      name: 'Pump Affinity - Power',
      category: 'Pump Hydraulics',
      description: 'Power change with speed',
      inputs: [
        { name: 'p1', unit: 'kW', description: 'Initial power' },
        { name: 'n1', unit: 'rpm', description: 'Initial speed' },
        { name: 'n2', unit: 'rpm', description: 'New speed' },
      ],
      output: { name: 'P2', unit: 'kW', description: 'New power' },
      formula: (inputs) => {
        const p1 = inputs.p1 ?? 0;
        const n1 = inputs.n1 ?? 1;
        const n2 = inputs.n2 ?? 0;
        return p1 * Math.pow(n2 / n1, 3);
      },
    });

    // Orifice flow calculation
    this.engineeringFormulas.set('orifice_flow', {
      id: 'orifice_flow',
      name: 'Orifice Flow Rate',
      category: 'Flow Measurement',
      description: 'Flow through orifice plate',
      inputs: [
        { name: 'cd', unit: '-', description: 'Discharge coefficient' },
        { name: 'area', unit: 'm²', description: 'Orifice area' },
        { name: 'deltaP', unit: 'Pa', description: 'Pressure drop' },
        { name: 'density', unit: 'kg/m³', description: 'Fluid density' },
      ],
      output: { name: 'Q', unit: 'm³/s', description: 'Flow rate' },
      formula: (inputs) => {
        const cd = inputs.cd ?? 0;
        const area = inputs.area ?? 0;
        const deltaP = inputs.deltaP ?? 0;
        const density = inputs.density ?? 1;
        return cd * area * Math.sqrt(2 * deltaP / density);
      },
    });

    // Valve Cv calculation
    this.engineeringFormulas.set('valve_cv', {
      id: 'valve_cv',
      name: 'Valve Cv Calculation',
      category: 'Valve Sizing',
      description: 'Required Cv for liquid service',
      inputs: [
        { name: 'flow', unit: 'gpm', description: 'Flow rate' },
        { name: 'sg', unit: '-', description: 'Specific gravity' },
        { name: 'deltaP', unit: 'psi', description: 'Pressure drop' },
      ],
      output: { name: 'Cv', unit: '-', description: 'Valve Cv' },
      formula: (inputs) => {
        const flow = inputs.flow ?? 0;
        const sg = inputs.sg ?? 1;
        const deltaP = inputs.deltaP ?? 1;
        return flow * Math.sqrt(sg / deltaP);
      },
    });
  }

  /**
   * Convert units
   */
  public convertUnit(
    value: number,
    fromUnit: string,
    toUnit: string,
    unitType: UnitType
  ): number {
    if (fromUnit === toUnit) return value;

    const conversions = this.unitConversions.get(unitType);
    if (!conversions) return value;

    const conversion = conversions.find(c => c.from === fromUnit && c.to === toUnit);
    if (!conversion) {
      // Try reverse conversion
      const reverseConversion = conversions.find(c => c.from === toUnit && c.to === fromUnit);
      if (reverseConversion) {
        return value / reverseConversion.factor;
      }
      return value;
    }

    let result = value * conversion.factor;
    if (conversion.offset) {
      result += conversion.offset;
    }
    return result;
  }

  /**
   * Validate cross-field dependencies
   */
  public validateCrossFields(
    nodeType: NodeType,
    values: Record<string, any>
  ): Array<{ field: string; error: string }> {
    const errors: Array<{ field: string; error: string }> = [];

    this.crossFieldValidations.forEach(validation => {
      if (!validation.nodeTypes || validation.nodeTypes.includes(nodeType)) {
        const result = validation.validator(values);
        if (!result.valid && result.error) {
          errors.push({
            field: validation.fields.join(', '),
            error: result.error,
          });
        }
      }
    });

    return errors;
  }

  /**
   * Calculate engineering formula
   */
  public calculateFormula(
    formulaId: string,
    inputs: Record<string, number>
  ): { success: boolean; result?: number; error?: string } {
    const formula = this.engineeringFormulas.get(formulaId);
    if (!formula) {
      return { success: false, error: 'Formula not found' };
    }

    // Check all inputs are provided
    for (const input of formula.inputs) {
      if (inputs[input.name] === undefined) {
        return { 
          success: false, 
          error: `Missing input: ${input.name} (${input.description})`
        };
      }
    }

    try {
      const result = formula.formula(inputs);
      return { success: true, result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Calculation failed'
      };
    }
  }

  /**
   * Get available formulas for a category
   */
  public getFormulasByCategory(category: string): EngineeringFormula[] {
    return Array.from(this.engineeringFormulas.values()).filter(
      f => f.category === category
    );
  }

  /**
   * Get all formula categories
   */
  public getFormulaCategories(): string[] {
    const categories = new Set<string>();
    this.engineeringFormulas.forEach(f => categories.add(f.category));
    return Array.from(categories);
  }

  /**
   * Batch update with transaction support
   */
  public async batchUpdateWithTransaction(
    updates: Array<{ nodeId: string; properties: Record<string, any> }>,
    validateFn?: (nodeId: string, props: Record<string, any>) => boolean
  ): Promise<{ success: boolean; transactionId?: string; errors?: string[] }> {
    const store = usePropertyManagerStore.getState();
    const transactionId = store.beginTransaction();
    const errors: string[] = [];

    try {
      for (const update of updates) {
        if (validateFn && !validateFn(update.nodeId, update.properties)) {
          errors.push(`Validation failed for node ${update.nodeId}`);
          continue;
        }

        // Record in transaction
        const transaction = store.transactions.get(transactionId);
        if (transaction) {
          transaction.operations.push({
            nodeId: update.nodeId,
            properties: update.properties,
          });
        }

        // Add to history for each property change
        Object.entries(update.properties).forEach(([key, value]) => {
          store.addHistoryEntry({
            nodeId: update.nodeId,
            propertyName: key,
            oldValue: null, // Should be fetched from current state
            newValue: value,
          });
        });
      }

      if (errors.length > 0) {
        store.rollbackTransaction(transactionId);
        return { success: false, transactionId, errors };
      }

      store.commitTransaction(transactionId);
      return { success: true, transactionId };
    } catch (error) {
      store.rollbackTransaction(transactionId);
      return { 
        success: false, 
        transactionId,
        errors: [error instanceof Error ? error.message : 'Transaction failed']
      };
    }
  }

  /**
   * Get property history for a node
   */
  public getNodeHistory(nodeId: string): PropertyHistoryEntry[] {
    const store = usePropertyManagerStore.getState();
    return store.history.filter(h => h.nodeId === nodeId);
  }

  /**
   * Perform undo operation
   */
  public undo(): PropertyHistoryEntry | null {
    const store = usePropertyManagerStore.getState();
    return store.undo();
  }

  /**
   * Perform redo operation
   */
  public redo(): PropertyHistoryEntry | null {
    const store = usePropertyManagerStore.getState();
    return store.redo();
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    const store = usePropertyManagerStore.getState();
    store.clearHistory();
  }

  /**
   * Get unit preference for a type
   */
  public getUnitPreference(type: UnitType): string {
    const store = usePropertyManagerStore.getState();
    return store.unitPreferences.get(type) || '';
  }

  /**
   * Set unit preference
   */
  public setUnitPreference(type: UnitType, unit: string): void {
    const store = usePropertyManagerStore.getState();
    store.setUnitPreference(type, unit);
  }
}

// Export singleton instance and store hook
export const propertyManagerEnhanced = PropertyManagerEnhanced.getInstance();
export { usePropertyManagerStore };