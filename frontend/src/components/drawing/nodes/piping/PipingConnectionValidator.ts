import {
  PipingConnectionType,
  PressureRatingStandard,
  PipeSizeStandard,
  type IPipingComponent,
  type IPipingConnectionValidator,
  type ConnectionValidationResult,
  type PipeSize,
  type PressureRating,
  type PipingMaterial
} from './IPipingComponent';

/**
 * Size conversion tables for different standards
 */
const SIZE_CONVERSION_TABLE: Record<string, { dn: number; nps: number; od: number }> = {
  '15-0.5': { dn: 15, nps: 0.5, od: 21.3 },
  '20-0.75': { dn: 20, nps: 0.75, od: 26.7 },
  '25-1': { dn: 25, nps: 1, od: 33.4 },
  '32-1.25': { dn: 32, nps: 1.25, od: 42.2 },
  '40-1.5': { dn: 40, nps: 1.5, od: 48.3 },
  '50-2': { dn: 50, nps: 2, od: 60.3 },
  '65-2.5': { dn: 65, nps: 2.5, od: 73.0 },
  '80-3': { dn: 80, nps: 3, od: 88.9 },
  '100-4': { dn: 100, nps: 4, od: 114.3 },
  '125-5': { dn: 125, nps: 5, od: 141.3 },
  '150-6': { dn: 150, nps: 6, od: 168.3 },
  '200-8': { dn: 200, nps: 8, od: 219.1 },
  '250-10': { dn: 250, nps: 10, od: 273.1 },
  '300-12': { dn: 300, nps: 12, od: 323.9 },
  '350-14': { dn: 350, nps: 14, od: 355.6 },
  '400-16': { dn: 400, nps: 16, od: 406.4 },
  '450-18': { dn: 450, nps: 18, od: 457.2 },
  '500-20': { dn: 500, nps: 20, od: 508.0 },
  '600-24': { dn: 600, nps: 24, od: 609.6 },
};

/**
 * Pressure class to PN conversion at 20°C
 */
const PRESSURE_CONVERSION_TABLE: Record<number, number> = {
  150: 20,
  300: 50,
  400: 64,
  600: 100,
  900: 150,
  1500: 250,
  2500: 420,
};

/**
 * Material compatibility matrix
 */
const MATERIAL_COMPATIBILITY: Record<string, string[]> = {
  'CS': ['CS', 'LTCS', 'CAST_IRON'], // Carbon Steel
  'SS304': ['SS304', 'SS316', 'SS321'], // Stainless Steel 304
  'SS316': ['SS304', 'SS316', 'SS316L', 'SS321'], // Stainless Steel 316
  'COPPER': ['COPPER', 'BRASS', 'BRONZE'], // Copper alloys
  'PVC': ['PVC', 'CPVC', 'ABS'], // Plastics
  'HDPE': ['HDPE', 'LDPE', 'PP'], // Polyethylene
  'PTFE': ['PTFE', 'PFA', 'FEP'], // Fluoropolymers
};

/**
 * Galvanic corrosion potential (volts)
 */
const GALVANIC_POTENTIAL: Record<string, number> = {
  'MAGNESIUM': -1.75,
  'ZINC': -1.0,
  'ALUMINUM': -0.8,
  'CAST_IRON': -0.5,
  'CS': -0.6, // Carbon steel
  'LTCS': -0.6, // Low temperature carbon steel
  'SS410': -0.3, // Stainless steel 410 (martensitic)
  'SS304': -0.1, // Stainless steel 304 (austenitic)
  'SS316': -0.05, // Stainless steel 316 (austenitic)
  'BRASS': 0.0,
  'COPPER': 0.2,
  'BRONZE': 0.1,
  'MONEL': 0.3,
  'TITANIUM': 0.5,
  'GRAPHITE': 0.8,
};

/**
 * Implementation of piping connection validator
 */
export class PipingConnectionValidator implements IPipingConnectionValidator {
  private strictMode: boolean;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  /**
   * Main validation method for component connections
   */
  public validateConnection(
    source: IPipingComponent,
    target: IPipingComponent,
    _connectionPoint?: string
  ): ConnectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate size compatibility
    const sizeValid = this.validateSize(source.size, target.size, !this.strictMode);
    if (!sizeValid) {
      errors.push(this.getSizeErrorMessage(source.size, target.size));
      recommendations.push('Install appropriate reducer/expander fitting');
    }

    // Validate pressure rating
    const ratingValid = this.validateRating(source.rating, target.rating);
    if (!ratingValid) {
      const message = this.getRatingErrorMessage(source.rating, target.rating);
      if (this.strictMode) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    // Validate material compatibility
    const materialValid = this.validateMaterial(
      source.material,
      target.material,
      !this.strictMode
    );
    if (!materialValid) {
      const galvanicRisk = this.checkGalvanicCorrosion(source.material, target.material);
      if (galvanicRisk > 0.5) {
        errors.push(`High galvanic corrosion risk between ${source.material.code} and ${target.material.code}`);
        recommendations.push('Use dielectric union or insulating gasket kit');
      } else if (galvanicRisk > 0.25) {
        warnings.push(`Moderate galvanic corrosion risk between ${source.material.code} and ${target.material.code}`);
        recommendations.push('Consider cathodic protection or coating');
      }
    }

    // Validate connection type
    const connectionValid = this.validateConnectionType(
      source.outletConnection,
      target.inletConnection
    );
    if (!connectionValid) {
      errors.push(
        `Incompatible connection types: ${source.outletConnection} to ${target.inletConnection}`
      );
      recommendations.push(this.getConnectionAdapter(source.outletConnection, target.inletConnection));
    }

    // Validate operating conditions
    this.validateOperatingConditions(source, target, errors, warnings);

    // Validate flow characteristics
    this.validateFlowCharacteristics(source, target, warnings, recommendations);

    // Check for special requirements
    this.checkSpecialRequirements(source, target, warnings, recommendations);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Validate pipe sizes
   */
  public validateSize(
    sourceSize: PipeSize,
    targetSize: PipeSize,
    allowReduction: boolean = false
  ): boolean {
    const sourceOD = this.getOuterDiameter(sourceSize);
    const targetOD = this.getOuterDiameter(targetSize);

    if (Math.abs(sourceOD - targetOD) < 0.1) {
      return true; // Same size
    }

    if (allowReduction) {
      // Allow one size step reduction (common practice)
      const allowedReduction = this.isOneSizeStep(sourceSize, targetSize);
      return allowedReduction;
    }

    return false;
  }

  /**
   * Validate pressure ratings
   */
  public validateRating(
    sourceRating: PressureRating,
    targetRating: PressureRating
  ): boolean {
    const sourcePressure = this.convertToBarAbsolute(sourceRating);
    const targetPressure = this.convertToBarAbsolute(targetRating);

    // Target must handle source pressure
    return targetPressure >= sourcePressure;
  }

  /**
   * Validate material compatibility
   */
  public validateMaterial(
    sourceMaterial: PipingMaterial,
    targetMaterial: PipingMaterial,
    allowDissimilar: boolean = false
  ): boolean {
    // Same material is always compatible
    if (sourceMaterial.code === targetMaterial.code) {
      return true;
    }

    if (!allowDissimilar) {
      return false;
    }

    // Check compatibility matrix
    const compatibleMaterials = MATERIAL_COMPATIBILITY[sourceMaterial.code] || [];
    if (compatibleMaterials.includes(targetMaterial.code)) {
      return true;
    }

    // Check temperature compatibility
    if (sourceMaterial.maxTemperature && targetMaterial.minTemperature) {
      if (sourceMaterial.maxTemperature < targetMaterial.minTemperature) {
        return false;
      }
    }

    // Check galvanic corrosion risk
    const galvanicRisk = this.checkGalvanicCorrosion(sourceMaterial, targetMaterial);
    return galvanicRisk <= 0.25; // Acceptable risk threshold
  }

  /**
   * Validate connection types
   */
  public validateConnectionType(
    sourceType: PipingConnectionType,
    targetType: PipingConnectionType
  ): boolean {
    // Same type is compatible
    if (sourceType === targetType) {
      return true;
    }

    // Define compatible transitions
    const compatibleTransitions: Record<PipingConnectionType, PipingConnectionType[]> = {
      [PipingConnectionType.FLANGED]: [PipingConnectionType.FLANGED],
      [PipingConnectionType.THREADED]: [PipingConnectionType.THREADED, PipingConnectionType.SOCKET_WELD],
      [PipingConnectionType.SOCKET_WELD]: [PipingConnectionType.SOCKET_WELD, PipingConnectionType.THREADED],
      [PipingConnectionType.BUTT_WELD]: [PipingConnectionType.BUTT_WELD],
      [PipingConnectionType.COMPRESSION]: [PipingConnectionType.COMPRESSION, PipingConnectionType.THREADED],
      [PipingConnectionType.GROOVED]: [PipingConnectionType.GROOVED],
      [PipingConnectionType.PUSH_FIT]: [PipingConnectionType.PUSH_FIT],
      [PipingConnectionType.SOLVENT_WELD]: [PipingConnectionType.SOLVENT_WELD],
      [PipingConnectionType.BRAZED]: [PipingConnectionType.BRAZED, PipingConnectionType.SOLDERED],
      [PipingConnectionType.SOLDERED]: [PipingConnectionType.SOLDERED, PipingConnectionType.BRAZED],
    };

    const compatible = compatibleTransitions[sourceType] || [];
    return compatible.includes(targetType);
  }

  /**
   * Get outer diameter in mm
   */
  private getOuterDiameter(size: PipeSize): number {
    if (size.outerDiameter) {
      return size.outerDiameter;
    }

    // Find in conversion table
    for (const entry of Object.values(SIZE_CONVERSION_TABLE)) {
      if (
        (size.standard === PipeSizeStandard.DN && entry.dn === size.nominal) ||
        (size.standard === PipeSizeStandard.NPS && entry.nps === size.nominal)
      ) {
        return entry.od;
      }
    }

    // Estimate if not found
    if (size.standard === PipeSizeStandard.DN) {
      return size.nominal * 1.2; // Rough approximation
    } else if (size.standard === PipeSizeStandard.NPS) {
      return size.nominal * 25.4 * 1.3; // Rough approximation
    }

    return size.nominal;
  }

  /**
   * Check if sizes are one step apart
   */
  private isOneSizeStep(size1: PipeSize, size2: PipeSize): boolean {
    const standardSizes = [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300];

    const size1Nominal = this.convertToDN(size1);
    const size2Nominal = this.convertToDN(size2);

    const index1 = standardSizes.indexOf(size1Nominal);
    const index2 = standardSizes.indexOf(size2Nominal);

    if (index1 === -1 || index2 === -1) {
      return false;
    }

    return Math.abs(index1 - index2) <= 1;
  }

  /**
   * Convert size to DN
   */
  private convertToDN(size: PipeSize): number {
    if (size.standard === PipeSizeStandard.DN) {
      return size.nominal;
    }

    // Find conversion
    for (const entry of Object.values(SIZE_CONVERSION_TABLE)) {
      if (size.standard === PipeSizeStandard.NPS && Math.abs(entry.nps - size.nominal) < 0.01) {
        return entry.dn;
      }
    }

    return size.nominal;
  }

  /**
   * Convert pressure to bar absolute
   */
  private convertToBarAbsolute(rating: PressureRating): number {
    if (rating.standard === PressureRatingStandard.PN) {
      return rating.value;
    }

    if (rating.standard === PressureRatingStandard.CLASS) {
      return PRESSURE_CONVERSION_TABLE[rating.value] || rating.value;
    }

    if (rating.standard === PressureRatingStandard.SCHEDULE) {
      // Schedule to pressure depends on pipe size and material
      // Using simplified conversion
      const scheduleMap: Record<string, number> = {
        '40': 10,
        '80': 20,
        '160': 40,
        'STD': 10,
        'XS': 20,
        'XXS': 40,
      };
      return scheduleMap[rating.value.toString()] || 10;
    }

    return rating.value;
  }

  /**
   * Check galvanic corrosion risk
   */
  private checkGalvanicCorrosion(
    material1: PipingMaterial,
    material2: PipingMaterial
  ): number {
    const potential1 = GALVANIC_POTENTIAL[material1.code] ?? 0;
    const potential2 = GALVANIC_POTENTIAL[material2.code] ?? 0;

    return Math.abs(potential1 - potential2);
  }

  /**
   * Get size error message
   */
  private getSizeErrorMessage(source: PipeSize, target: PipeSize): string {
    const sourceStr = `${source.nominal}${source.standard}`;
    const targetStr = `${target.nominal}${target.standard}`;
    return `Size mismatch: ${sourceStr} to ${targetStr}`;
  }

  /**
   * Get rating error message
   */
  private getRatingErrorMessage(source: PressureRating, target: PressureRating): string {
    const sourceStr = source.standard === PressureRatingStandard.CLASS
      ? `Class ${source.value}`
      : `${source.standard}${source.value}`;
    const targetStr = target.standard === PressureRatingStandard.CLASS
      ? `Class ${target.value}`
      : `${target.standard}${target.value}`;
    return `Pressure rating downgrade: ${sourceStr} to ${targetStr}`;
  }

  /**
   * Get recommended adapter
   */
  private getConnectionAdapter(
    source: PipingConnectionType,
    target: PipingConnectionType
  ): string {
    const adapterMap: Record<string, string> = {
      [`${PipingConnectionType.FLANGED}-${PipingConnectionType.THREADED}`]: 'Flanged to threaded adapter',
      [`${PipingConnectionType.THREADED}-${PipingConnectionType.FLANGED}`]: 'Threaded to flanged adapter',
      [`${PipingConnectionType.FLANGED}-${PipingConnectionType.GROOVED}`]: 'Flanged to grooved adapter',
      [`${PipingConnectionType.THREADED}-${PipingConnectionType.COMPRESSION}`]: 'Threaded to compression adapter',
      [`${PipingConnectionType.SOCKET_WELD}-${PipingConnectionType.THREADED}`]: 'Socket weld to threaded union',
      [`${PipingConnectionType.BUTT_WELD}-${PipingConnectionType.FLANGED}`]: 'Weld neck flange',
    };

    const key = `${source}-${target}`;
    return adapterMap[key] || 'Use appropriate transition fitting';
  }

  /**
   * Validate operating conditions
   */
  private validateOperatingConditions(
    source: IPipingComponent,
    target: IPipingComponent,
    errors: string[],
    warnings: string[]
  ): void {
    // Pressure validation
    if (source.operatingPressure && target.designPressure) {
      if (source.operatingPressure > target.designPressure) {
        errors.push(
          `Operating pressure (${source.operatingPressure} bar) exceeds downstream design (${target.designPressure} bar)`
        );
      } else if (source.operatingPressure > target.designPressure * 0.8) {
        warnings.push('Operating pressure approaching design limit');
      }
    }

    // Temperature validation
    if (source.operatingTemperature && target.material.maxTemperature) {
      if (source.operatingTemperature > target.material.maxTemperature) {
        errors.push(
          `Operating temperature (${source.operatingTemperature}°C) exceeds material limit (${target.material.maxTemperature}°C)`
        );
      }
    }
  }

  /**
   * Validate flow characteristics
   */
  private validateFlowCharacteristics(
    source: IPipingComponent,
    target: IPipingComponent,
    warnings: string[],
    recommendations: string[]
  ): void {
    if (!source.flowCharacteristics || !target.flowCharacteristics) {
      return;
    }

    // Check for significant pressure drop
    const sourceCv = source.flowCharacteristics.flowCoefficient || 0;
    const targetCv = target.flowCharacteristics.flowCoefficient || 0;

    if (targetCv > 0 && sourceCv > 0 && targetCv < sourceCv * 0.5) {
      warnings.push('Significant flow restriction detected');
      recommendations.push('Consider larger downstream component or parallel installation');
    }

    // Check velocity limits
    if (source.flowCharacteristics.velocity && source.flowCharacteristics.velocity > 3) {
      warnings.push(`High velocity (${source.flowCharacteristics.velocity} m/s) may cause erosion`);
      recommendations.push('Consider velocity reduction or erosion-resistant materials');
    }
  }

  /**
   * Check special requirements
   */
  private checkSpecialRequirements(
    source: IPipingComponent,
    target: IPipingComponent,
    warnings: string[],
    recommendations: string[]
  ): void {
    // Check flow direction requirements
    if (source.flowDirection === 'unidirectional' && target.flowDirection === 'unidirectional') {
      recommendations.push('Ensure proper flow direction alignment');
    }

    // Check orientation requirements
    if (target.orientation && target.orientation !== 'any') {
      recommendations.push(`Install in ${target.orientation} orientation`);
    }

    // Check for dissimilar metal contact
    if (source.material.code !== target.material.code) {
      const materials = [source.material.code, target.material.code].sort().join('-');
      if (['CS-SS316', 'CS-COPPER', 'ALUMINUM-SS316'].includes(materials)) {
        warnings.push('Dissimilar metal contact detected');
        recommendations.push('Use appropriate gaskets and bolt isolation');
      }
    }
  }
}

/**
 * Singleton instance
 */
export const pipingConnectionValidator = new PipingConnectionValidator();

export default pipingConnectionValidator;