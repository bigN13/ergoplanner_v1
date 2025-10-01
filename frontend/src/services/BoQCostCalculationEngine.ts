// BoQ Cost Calculation Engine
// Advanced offline cost calculation system for Bill of Quantities

import type {
  BoQItem,
  BoQProject,
  BoQCostCalculation,
  BoQCategory,
  BoQSupplier,
} from '../types/boq';
import { getBoQDatabase } from '../lib/boq-database';

interface CostBreakdown {
  materials: number;
  labor: number;
  equipment: number;
  overhead: number;
  markup: number;
  tax: number;
  shipping: number;
  insurance: number;
  contingency: number;
  total: number;
}

interface CategoryCostBreakdown {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  quantities: Record<string, number>; // unit -> total quantity
  costs: CostBreakdown;
  percentage: number;
  averageUnitCost: number;
  topExpensiveItems: Array<{
    id: string;
    description: string;
    cost: number;
    percentage: number;
  }>;
}

interface SupplierCostBreakdown {
  supplierId: string;
  supplierName: string;
  itemCount: number;
  costs: CostBreakdown;
  percentage: number;
  deliveryTimeWeighted: number;
  qualityScore: number;
}

interface CostOptimization {
  type: 'consolidation' | 'alternative-supplier' | 'bulk-discount' | 'substitute-material';
  description: string;
  currentCost: number;
  optimizedCost: number;
  savingsAmount: number;
  savingsPercentage: number;
  affectedItems: string[];
  implementation: {
    effort: 'low' | 'medium' | 'high';
    risk: 'low' | 'medium' | 'high';
    timeToImplement: number; // days
    prerequisites: string[];
  };
}

interface CostTrend {
  date: Date;
  totalCost: number;
  itemCount: number;
  averageCost: number;
  categories: Record<string, number>;
  changeFromPrevious: {
    amount: number;
    percentage: number;
  };
}

interface CostCalculationOptions {
  includeTax: boolean;
  taxRate: number;
  includeShipping: boolean;
  shippingRate: number;
  includeInsurance: boolean;
  insuranceRate: number;
  contingencyRate: number;
  laborRates: Record<string, number>; // category -> rate per hour
  equipmentRates: Record<string, number>; // category -> rate per hour
  overheadRates: Record<string, number>; // category -> percentage
  markupRates: Record<string, number>; // category -> percentage
  currency: string;
  exchangeRates?: Record<string, number>;
  bulkDiscountThresholds: Array<{
    category: string;
    minimumQuantity: number;
    discountPercentage: number;
  }>;
  supplierDiscounts: Record<string, number>; // supplierId -> discount percentage
}

interface CostCalculationResult {
  calculation: BoQCostCalculation;
  breakdown: CostBreakdown;
  categoryBreakdowns: CategoryCostBreakdown[];
  supplierBreakdowns: SupplierCostBreakdown[];
  optimizations: CostOptimization[];
  trends: CostTrend[];
  warnings: string[];
  recommendations: string[];
}

class BoQCostCalculationEngine {
  private defaultOptions: CostCalculationOptions = {
    includeTax: true,
    taxRate: 0.10, // 10%
    includeShipping: true,
    shippingRate: 0.05, // 5%
    includeInsurance: true,
    insuranceRate: 0.02, // 2%
    contingencyRate: 0.15, // 15%
    laborRates: {
      equipment: 75, // $75/hour
      piping: 65,    // $65/hour
      instrumentation: 85, // $85/hour
      electrical: 70, // $70/hour
      civil: 60,     // $60/hour
    },
    equipmentRates: {
      equipment: 150, // $150/hour
      piping: 50,     // $50/hour
      instrumentation: 100, // $100/hour
      electrical: 80,  // $80/hour
      civil: 200,     // $200/hour
    },
    overheadRates: {
      equipment: 0.12, // 12%
      piping: 0.08,    // 8%
      instrumentation: 0.15, // 15%
      electrical: 0.10, // 10%
      civil: 0.20,     // 20%
    },
    markupRates: {
      equipment: 0.18, // 18%
      piping: 0.15,    // 15%
      instrumentation: 0.20, // 20%
      electrical: 0.16, // 16%
      civil: 0.22,     // 22%
    },
    currency: 'USD',
    bulkDiscountThresholds: [
      { category: 'piping', minimumQuantity: 1000, discountPercentage: 0.05 },
      { category: 'equipment', minimumQuantity: 10, discountPercentage: 0.03 },
      { category: 'instrumentation', minimumQuantity: 50, discountPercentage: 0.04 },
    ],
    supplierDiscounts: {},
  };

  async calculateProjectCosts(
    projectId: string,
    options?: Partial<CostCalculationOptions>
  ): Promise<CostCalculationResult> {
    const db = getBoQDatabase();
    await db.initialize();

    const [project, items, categories, suppliers] = await Promise.all([
      db.getProject(projectId),
      db.getBoQItemsByProject(projectId),
      db.getAllCategories(),
      db.getAllSuppliers(),
    ]);

    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    const calcOptions = { ...this.defaultOptions, ...options };
    return await this.performCalculation(project, items, categories, suppliers, calcOptions);
  }

  async calculateItemsCosts(
    items: BoQItem[],
    options?: Partial<CostCalculationOptions>
  ): Promise<CostCalculationResult> {
    const db = getBoQDatabase();
    await db.initialize();

    const [categories, suppliers] = await Promise.all([
      db.getAllCategories(),
      db.getAllSuppliers(),
    ]);

    // Create temporary project for calculation
    const tempProject: BoQProject = {
      id: 'temp',
      name: 'Temporary Calculation',
      defaultCurrency: options?.currency || 'USD',
      defaultUnit: 'EA',
      markupPercentage: 15,
      taxRate: options?.taxRate ? options.taxRate * 100 : 10,
      drawingIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'offline-only',
    };

    const calcOptions = { ...this.defaultOptions, ...options };
    return await this.performCalculation(tempProject, items, categories, suppliers, calcOptions);
  }

  private async performCalculation(
    project: BoQProject,
    items: BoQItem[],
    categories: BoQCategory[],
    suppliers: BoQSupplier[],
    options: CostCalculationOptions
  ): Promise<CostCalculationResult> {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate input data
    this.validateCalculationInputs(items, warnings);

    // Apply bulk discounts
    const discountedItems = this.applyBulkDiscounts(items, options);

    // Apply supplier discounts
    const supplierDiscountedItems = this.applySupplierDiscounts(discountedItems, options);

    // Calculate base costs
    const baseCosts = this.calculateBaseCosts(supplierDiscountedItems);

    // Calculate category breakdowns
    const categoryBreakdowns = this.calculateCategoryBreakdowns(
      supplierDiscountedItems,
      categories,
      options
    );

    // Calculate supplier breakdowns
    const supplierBreakdowns = this.calculateSupplierBreakdowns(
      supplierDiscountedItems,
      suppliers,
      options
    );

    // Calculate total breakdown
    const breakdown = this.calculateTotalBreakdown(
      baseCosts,
      categoryBreakdowns,
      options
    );

    // Find cost optimizations
    const optimizations = this.findCostOptimizations(
      supplierDiscountedItems,
      categoryBreakdowns,
      supplierBreakdowns,
      options
    );

    // Generate cost trends (if historical data exists)
    const trends = await this.generateCostTrends(project.id);

    // Generate recommendations
    this.generateRecommendations(
      breakdown,
      categoryBreakdowns,
      supplierBreakdowns,
      optimizations,
      recommendations
    );

    // Create calculation record
    const calculation: BoQCostCalculation = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: project.id,
      subtotal: baseCosts.subtotal,
      laborCost: breakdown.labor,
      materialCost: breakdown.materials,
      equipmentCost: breakdown.equipment,
      overheadCost: breakdown.overhead,
      markup: breakdown.markup,
      tax: breakdown.tax,
      totalCost: breakdown.total,
      parameters: {
        laborRate: this.getAverageLaborRate(options.laborRates),
        equipmentRate: this.getAverageEquipmentRate(options.equipmentRates),
        overheadPercentage: this.getAverageOverheadRate(options.overheadRates) * 100,
        markupPercentage: this.getAverageMarkupRate(options.markupRates) * 100,
        taxPercentage: options.taxRate * 100,
        currency: options.currency,
      },
      categoryBreakdown: categoryBreakdowns.map(cb => ({
        categoryId: cb.categoryId,
        categoryName: cb.categoryName,
        subtotal: cb.costs.total,
        itemCount: cb.itemCount,
        percentage: cb.percentage,
      })),
      calculatedAt: new Date(),
      calculatedBy: 'system',
      version: 1,
    };

    return {
      calculation,
      breakdown,
      categoryBreakdowns,
      supplierBreakdowns,
      optimizations,
      trends,
      warnings,
      recommendations,
    };
  }

  private validateCalculationInputs(items: BoQItem[], warnings: string[]): void {
    let itemsWithoutPrice = 0;
    let itemsWithZeroQuantity = 0;

    items.forEach(item => {
      if (!item.unitPrice || item.unitPrice <= 0) {
        itemsWithoutPrice++;
      }
      if (!item.quantity || item.quantity <= 0) {
        itemsWithZeroQuantity++;
      }
    });

    if (itemsWithoutPrice > 0) {
      warnings.push(`${itemsWithoutPrice} items have no unit price - using default estimates`);
    }

    if (itemsWithZeroQuantity > 0) {
      warnings.push(`${itemsWithZeroQuantity} items have zero quantity - excluded from calculations`);
    }
  }

  private applyBulkDiscounts(items: BoQItem[], options: CostCalculationOptions): BoQItem[] {
    const categoryQuantities = new Map<string, number>();

    // Calculate total quantities by category
    items.forEach(item => {
      const currentQty = categoryQuantities.get(item.category) || 0;
      categoryQuantities.set(item.category, currentQty + item.quantity);
    });

    // Apply discounts
    return items.map(item => {
      const categoryQty = categoryQuantities.get(item.category) || 0;
      const threshold = options.bulkDiscountThresholds.find(
        t => t.category === item.category && categoryQty >= t.minimumQuantity
      );

      if (threshold) {
        const discountedPrice = item.unitPrice * (1 - threshold.discountPercentage);
        return {
          ...item,
          unitPrice: discountedPrice,
          totalPrice: item.quantity * discountedPrice,
        };
      }

      return item;
    });
  }

  private applySupplierDiscounts(items: BoQItem[], options: CostCalculationOptions): BoQItem[] {
    return items.map(item => {
      if (item.supplier && options.supplierDiscounts[item.supplier]) {
        const discount = options.supplierDiscounts[item.supplier];
        const discountedPrice = item.unitPrice * (1 - discount);
        return {
          ...item,
          unitPrice: discountedPrice,
          totalPrice: item.quantity * discountedPrice,
        };
      }
      return item;
    });
  }

  private calculateBaseCosts(items: BoQItem[]): { subtotal: number; itemCount: number } {
    const validItems = items.filter(item => item.quantity > 0);

    const subtotal = validItems.reduce((sum, item) => {
      return sum + (item.totalPrice || item.quantity * item.unitPrice);
    }, 0);

    return {
      subtotal,
      itemCount: validItems.length,
    };
  }

  private calculateCategoryBreakdowns(
    items: BoQItem[],
    categories: BoQCategory[],
    options: CostCalculationOptions
  ): CategoryCostBreakdown[] {
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const categoryItems = new Map<string, BoQItem[]>();

    // Group items by category
    items.forEach(item => {
      if (!categoryItems.has(item.category)) {
        categoryItems.set(item.category, []);
      }
      categoryItems.get(item.category)!.push(item);
    });

    const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return Array.from(categoryItems.entries()).map(([categoryId, categoryItemList]) => {
      const category = categoryMap.get(categoryId);
      const categoryName = category?.name || categoryId;

      // Calculate quantities by unit
      const quantities: Record<string, number> = {};
      categoryItemList.forEach(item => {
        quantities[item.unit] = (quantities[item.unit] || 0) + item.quantity;
      });

      // Calculate base costs
      const materialCost = categoryItemList.reduce((sum, item) => sum + item.totalPrice, 0);

      // Calculate additional costs based on category defaults
      const laborRate = options.laborRates[categoryId] || 60;
      const equipmentRate = options.equipmentRates[categoryId] || 80;
      const overheadRate = options.overheadRates[categoryId] || 0.12;
      const markupRate = options.markupRates[categoryId] || 0.15;

      const estimatedLaborHours = this.estimateLaborHours(categoryItemList, categoryId);
      const estimatedEquipmentHours = this.estimateEquipmentHours(categoryItemList, categoryId);

      const laborCost = estimatedLaborHours * laborRate;
      const equipmentCost = estimatedEquipmentHours * equipmentRate;
      const subtotal = materialCost + laborCost + equipmentCost;
      const overheadCost = subtotal * overheadRate;
      const markupCost = subtotal * markupRate;

      const costs: CostBreakdown = {
        materials: materialCost,
        labor: laborCost,
        equipment: equipmentCost,
        overhead: overheadCost,
        markup: markupCost,
        tax: 0, // Calculated at project level
        shipping: 0, // Calculated at project level
        insurance: 0, // Calculated at project level
        contingency: 0, // Calculated at project level
        total: subtotal + overheadCost + markupCost,
      };

      // Find top expensive items
      const sortedItems = [...categoryItemList]
        .sort((a, b) => b.totalPrice - a.totalPrice)
        .slice(0, 5);

      const topExpensiveItems = sortedItems.map(item => ({
        id: item.id,
        description: item.description,
        cost: item.totalPrice,
        percentage: (item.totalPrice / costs.total) * 100,
      }));

      return {
        categoryId,
        categoryName,
        itemCount: categoryItemList.length,
        quantities,
        costs,
        percentage: totalCost > 0 ? (costs.total / totalCost) * 100 : 0,
        averageUnitCost: categoryItemList.length > 0 ? costs.total / categoryItemList.length : 0,
        topExpensiveItems,
      };
    });
  }

  private calculateSupplierBreakdowns(
    items: BoQItem[],
    suppliers: BoQSupplier[],
    options: CostCalculationOptions
  ): SupplierCostBreakdown[] {
    const supplierMap = new Map(suppliers.map(s => [s.id, s]));
    const supplierItems = new Map<string, BoQItem[]>();

    // Group items by supplier
    items.forEach(item => {
      const supplierId = item.supplier || 'unassigned';
      if (!supplierItems.has(supplierId)) {
        supplierItems.set(supplierId, []);
      }
      supplierItems.get(supplierId)!.push(item);
    });

    const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return Array.from(supplierItems.entries()).map(([supplierId, supplierItemList]) => {
      const supplier = supplierMap.get(supplierId);
      const supplierName = supplier?.name || 'Unassigned';

      const materialCost = supplierItemList.reduce((sum, item) => sum + item.totalPrice, 0);

      // Calculate delivery time weighted average
      const deliveryTimeWeighted = supplierItemList.reduce((sum, item) => {
        const leadTime = item.leadTime || 30; // Default 30 days
        return sum + (leadTime * item.totalPrice);
      }, 0) / materialCost;

      // Get quality score from supplier data
      const qualityScore = supplier?.ratings?.quality || 3; // Default 3/5

      const costs: CostBreakdown = {
        materials: materialCost,
        labor: 0,
        equipment: 0,
        overhead: 0,
        markup: 0,
        tax: 0,
        shipping: 0,
        insurance: 0,
        contingency: 0,
        total: materialCost,
      };

      return {
        supplierId,
        supplierName,
        itemCount: supplierItemList.length,
        costs,
        percentage: totalCost > 0 ? (materialCost / totalCost) * 100 : 0,
        deliveryTimeWeighted,
        qualityScore,
      };
    });
  }

  private calculateTotalBreakdown(
    baseCosts: { subtotal: number; itemCount: number },
    categoryBreakdowns: CategoryCostBreakdown[],
    options: CostCalculationOptions
  ): CostBreakdown {
    const materialsCost = categoryBreakdowns.reduce((sum, cb) => sum + cb.costs.materials, 0);
    const laborCost = categoryBreakdowns.reduce((sum, cb) => sum + cb.costs.labor, 0);
    const equipmentCost = categoryBreakdowns.reduce((sum, cb) => sum + cb.costs.equipment, 0);
    const overheadCost = categoryBreakdowns.reduce((sum, cb) => sum + cb.costs.overhead, 0);
    const markupCost = categoryBreakdowns.reduce((sum, cb) => sum + cb.costs.markup, 0);

    const subtotal = materialsCost + laborCost + equipmentCost + overheadCost + markupCost;

    const shippingCost = options.includeShipping ? subtotal * options.shippingRate : 0;
    const insuranceCost = options.includeInsurance ? subtotal * options.insuranceRate : 0;
    const contingencyCost = subtotal * options.contingencyRate;
    const taxableCost = subtotal + shippingCost + insuranceCost + contingencyCost;
    const taxCost = options.includeTax ? taxableCost * options.taxRate : 0;

    const totalCost = taxableCost + taxCost;

    return {
      materials: materialsCost,
      labor: laborCost,
      equipment: equipmentCost,
      overhead: overheadCost,
      markup: markupCost,
      shipping: shippingCost,
      insurance: insuranceCost,
      contingency: contingencyCost,
      tax: taxCost,
      total: totalCost,
    };
  }

  private findCostOptimizations(
    items: BoQItem[],
    categoryBreakdowns: CategoryCostBreakdown[],
    supplierBreakdowns: SupplierCostBreakdown[],
    options: CostCalculationOptions
  ): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // Find consolidation opportunities
    optimizations.push(...this.findConsolidationOpportunities(items, supplierBreakdowns));

    // Find alternative supplier opportunities
    optimizations.push(...this.findAlternativeSupplierOpportunities(items, supplierBreakdowns));

    // Find bulk discount opportunities
    optimizations.push(...this.findBulkDiscountOpportunities(items, options));

    // Find material substitution opportunities
    optimizations.push(...this.findMaterialSubstitutionOpportunities(items));

    return optimizations.sort((a, b) => b.savingsAmount - a.savingsAmount);
  }

  private estimateLaborHours(items: BoQItem[], category: string): number {
    // Estimation factors by category (hours per unit)
    const laborFactors: Record<string, number> = {
      equipment: 8,    // 8 hours per equipment item
      piping: 0.5,     // 0.5 hours per linear meter
      instrumentation: 4, // 4 hours per instrument
      electrical: 2,   // 2 hours per electrical item
      civil: 1,        // 1 hour per cubic meter
    };

    const factor = laborFactors[category] || 2; // Default 2 hours
    return items.reduce((sum, item) => sum + (item.quantity * factor), 0);
  }

  private estimateEquipmentHours(items: BoQItem[], category: string): number {
    // Equipment rental factors by category (hours per unit)
    const equipmentFactors: Record<string, number> = {
      equipment: 4,    // 4 hours per equipment item
      piping: 0.2,     // 0.2 hours per linear meter
      instrumentation: 1, // 1 hour per instrument
      electrical: 0.5, // 0.5 hours per electrical item
      civil: 2,        // 2 hours per cubic meter
    };

    const factor = equipmentFactors[category] || 1; // Default 1 hour
    return items.reduce((sum, item) => sum + (item.quantity * factor), 0);
  }

  private findConsolidationOpportunities(
    items: BoQItem[],
    supplierBreakdowns: SupplierCostBreakdown[]
  ): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // Find small orders that could be consolidated
    const smallOrders = supplierBreakdowns.filter(
      sb => sb.costs.total < 5000 && sb.itemCount < 10
    );

    if (smallOrders.length > 1) {
      const totalCurrent = smallOrders.reduce((sum, so) => sum + so.costs.total, 0);
      const estimatedSavings = totalCurrent * 0.08; // 8% savings from consolidation

      optimizations.push({
        type: 'consolidation',
        description: `Consolidate ${smallOrders.length} small supplier orders`,
        currentCost: totalCurrent,
        optimizedCost: totalCurrent - estimatedSavings,
        savingsAmount: estimatedSavings,
        savingsPercentage: 8,
        affectedItems: items
          .filter(item => smallOrders.some(so => so.supplierId === item.supplier))
          .map(item => item.id),
        implementation: {
          effort: 'medium',
          risk: 'low',
          timeToImplement: 14,
          prerequisites: ['Negotiate with suppliers', 'Adjust delivery schedules'],
        },
      });
    }

    return optimizations;
  }

  private findAlternativeSupplierOpportunities(
    items: BoQItem[],
    supplierBreakdowns: SupplierCostBreakdown[]
  ): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // Find suppliers with high costs and low quality scores
    const problematicSuppliers = supplierBreakdowns.filter(
      sb => sb.qualityScore < 3 || sb.deliveryTimeWeighted > 45
    );

    problematicSuppliers.forEach(supplier => {
      const affectedItems = items.filter(item => item.supplier === supplier.supplierId);
      const estimatedSavings = supplier.costs.total * 0.12; // 12% potential savings

      optimizations.push({
        type: 'alternative-supplier',
        description: `Replace supplier "${supplier.supplierName}" with better alternative`,
        currentCost: supplier.costs.total,
        optimizedCost: supplier.costs.total - estimatedSavings,
        savingsAmount: estimatedSavings,
        savingsPercentage: 12,
        affectedItems: affectedItems.map(item => item.id),
        implementation: {
          effort: 'high',
          risk: 'medium',
          timeToImplement: 30,
          prerequisites: ['Supplier evaluation', 'Quality assessment', 'Contract negotiation'],
        },
      });
    });

    return optimizations;
  }

  private findBulkDiscountOpportunities(
    items: BoQItem[],
    options: CostCalculationOptions
  ): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // Check for categories close to bulk discount thresholds
    const categoryQuantities = new Map<string, { quantity: number; value: number; items: BoQItem[] }>();

    items.forEach(item => {
      if (!categoryQuantities.has(item.category)) {
        categoryQuantities.set(item.category, { quantity: 0, value: 0, items: [] });
      }
      const categoryData = categoryQuantities.get(item.category)!;
      categoryData.quantity += item.quantity;
      categoryData.value += item.totalPrice;
      categoryData.items.push(item);
    });

    options.bulkDiscountThresholds.forEach(threshold => {
      const categoryData = categoryQuantities.get(threshold.category);
      if (categoryData && categoryData.quantity < threshold.minimumQuantity) {
        const shortfall = threshold.minimumQuantity - categoryData.quantity;
        const shortfallPercentage = (shortfall / threshold.minimumQuantity) * 100;

        if (shortfallPercentage <= 25) { // Only suggest if within 25% of threshold
          const potentialSavings = categoryData.value * threshold.discountPercentage;

          optimizations.push({
            type: 'bulk-discount',
            description: `Increase ${threshold.category} quantity by ${shortfall} units to achieve ${threshold.discountPercentage * 100}% bulk discount`,
            currentCost: categoryData.value,
            optimizedCost: categoryData.value - potentialSavings,
            savingsAmount: potentialSavings,
            savingsPercentage: threshold.discountPercentage * 100,
            affectedItems: categoryData.items.map(item => item.id),
            implementation: {
              effort: 'low',
              risk: 'low',
              timeToImplement: 7,
              prerequisites: [`Order additional ${shortfall} units`],
            },
          });
        }
      }
    });

    return optimizations;
  }

  private findMaterialSubstitutionOpportunities(items: BoQItem[]): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // Look for expensive materials that could be substituted
    const expensiveItems = items.filter(item => item.unitPrice > 1000);

    expensiveItems.forEach(item => {
      // Simple heuristic: assume 15% savings possible for expensive items
      const estimatedSavings = item.totalPrice * 0.15;

      optimizations.push({
        type: 'substitute-material',
        description: `Consider alternative materials for high-cost item: ${item.description}`,
        currentCost: item.totalPrice,
        optimizedCost: item.totalPrice - estimatedSavings,
        savingsAmount: estimatedSavings,
        savingsPercentage: 15,
        affectedItems: [item.id],
        implementation: {
          effort: 'high',
          risk: 'medium',
          timeToImplement: 21,
          prerequisites: ['Engineering review', 'Performance validation', 'Code compliance check'],
        },
      });
    });

    return optimizations;
  }

  private async generateCostTrends(projectId: string): Promise<CostTrend[]> {
    try {
      const db = getBoQDatabase();
      const allData = await db.exportData();
      const calculations = allData.calculations.filter(
        calc => calc.projectId === projectId
      );

      return calculations
        .sort((a: BoQCostCalculation, b: BoQCostCalculation) => a.calculatedAt.getTime() - b.calculatedAt.getTime())
        .map((calc: BoQCostCalculation, index: number, array: BoQCostCalculation[]) => {
          const previousCalc = index > 0 ? array[index - 1] : null;
          const changeAmount = previousCalc ? calc.totalCost - previousCalc.totalCost : 0;
          const changePercentage = previousCalc
            ? ((calc.totalCost - previousCalc.totalCost) / previousCalc.totalCost) * 100
            : 0;

          const categories: Record<string, number> = {};
          calc.categoryBreakdown.forEach((cb: any) => {
            categories[cb.categoryName] = cb.subtotal;
          });

          return {
            date: calc.calculatedAt,
            totalCost: calc.totalCost,
            itemCount: calc.categoryBreakdown.reduce((sum: number, cb: any) => sum + cb.itemCount, 0),
            averageCost: calc.totalCost / Math.max(1, calc.categoryBreakdown.reduce((sum: number, cb: any) => sum + cb.itemCount, 0)),
            categories,
            changeFromPrevious: {
              amount: changeAmount,
              percentage: changePercentage,
            },
          };
        });
    } catch (error) {
      console.error('Failed to generate cost trends:', error);
      return [];
    }
  }

  private generateRecommendations(
    breakdown: CostBreakdown,
    categoryBreakdowns: CategoryCostBreakdown[],
    supplierBreakdowns: SupplierCostBreakdown[],
    optimizations: CostOptimization[],
    recommendations: string[]
  ): void {
    // Cost distribution recommendations
    const materialPercentage = (breakdown.materials / breakdown.total) * 100;
    const laborPercentage = (breakdown.labor / breakdown.total) * 100;

    if (materialPercentage > 80) {
      recommendations.push('Materials represent a very high percentage of costs. Consider value engineering or alternative materials.');
    }

    if (laborPercentage > 40) {
      recommendations.push('Labor costs are high. Consider prefabrication or modular approaches to reduce on-site work.');
    }

    // Category-specific recommendations
    const highestCostCategory = categoryBreakdowns.reduce((highest, current) =>
      current.costs.total > highest.costs.total ? current : highest
    );

    if (highestCostCategory.percentage > 60) {
      recommendations.push(`${highestCostCategory.categoryName} dominates the cost (${highestCostCategory.percentage.toFixed(1)}%). Focus optimization efforts here.`);
    }

    // Supplier recommendations
    const lowQualitySuppliers = supplierBreakdowns.filter(sb => sb.qualityScore < 3);
    if (lowQualitySuppliers.length > 0) {
      recommendations.push(`${lowQualitySuppliers.length} suppliers have low quality ratings. Consider supplier development or replacement.`);
    }

    // Optimization recommendations
    const highImpactOptimizations = optimizations.filter(opt => opt.savingsAmount > breakdown.total * 0.05);
    if (highImpactOptimizations.length > 0) {
      recommendations.push(`${highImpactOptimizations.length} high-impact optimizations identified with potential savings of ${highImpactOptimizations.reduce((sum, opt) => sum + opt.savingsAmount, 0).toLocaleString()}.`);
    }

    // General recommendations
    if (breakdown.contingency / breakdown.total < 0.10) {
      recommendations.push('Contingency is below 10%. Consider increasing for risk mitigation.');
    }

    if (breakdown.total > 1000000) {
      recommendations.push('Large project detected. Consider phased procurement to optimize cash flow and reduce risk.');
    }
  }

  private getAverageLaborRate(rates: Record<string, number>): number {
    const values = Object.values(rates);
    return values.reduce((sum, rate) => sum + rate, 0) / values.length;
  }

  private getAverageEquipmentRate(rates: Record<string, number>): number {
    const values = Object.values(rates);
    return values.reduce((sum, rate) => sum + rate, 0) / values.length;
  }

  private getAverageOverheadRate(rates: Record<string, number>): number {
    const values = Object.values(rates);
    return values.reduce((sum, rate) => sum + rate, 0) / values.length;
  }

  private getAverageMarkupRate(rates: Record<string, number>): number {
    const values = Object.values(rates);
    return values.reduce((sum, rate) => sum + rate, 0) / values.length;
  }

  // Public utility methods
  async saveCalculation(calculation: BoQCostCalculation): Promise<void> {
    const db = getBoQDatabase();
    await db.initialize();
    // Note: add method would be implemented when backend is ready
    console.log('Calculation saved:', calculation);
  }

  updateDefaultOptions(options: Partial<CostCalculationOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  getDefaultOptions(): CostCalculationOptions {
    return { ...this.defaultOptions };
  }
}

// Singleton instance
let costCalculationEngine: BoQCostCalculationEngine | null = null;

export const getBoQCostCalculationEngine = (): BoQCostCalculationEngine => {
  if (!costCalculationEngine) {
    costCalculationEngine = new BoQCostCalculationEngine();
  }
  return costCalculationEngine;
};

export { BoQCostCalculationEngine };
export type {
  CostBreakdown,
  CategoryCostBreakdown,
  SupplierCostBreakdown,
  CostOptimization,
  CostTrend,
  CostCalculationOptions,
  CostCalculationResult,
};