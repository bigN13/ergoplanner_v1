import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  PipingConnectionType,
  type IPipingComponent,
  type ConnectionValidationResult,
  type PipeSize,
  type PressureRating,
  type PipingMaterial
} from './IPipingComponent';

/**
 * Props for BasePipingNode component
 */
export interface BasePipingNodeProps<T extends IPipingComponent = IPipingComponent>
  extends NodeProps<T> {
  onConnectionValidate?: (
    source: IPipingComponent,
    target: IPipingComponent
  ) => ConnectionValidationResult;
  renderSymbol?: (data: T, selected: boolean) => React.ReactNode;
  showValidation?: boolean;
  showProperties?: boolean;
}

/**
 * Abstract base component for all piping nodes
 */
abstract class BasePipingNodeComponent<T extends IPipingComponent = IPipingComponent>
  extends React.Component<BasePipingNodeProps<T>> {

  /**
   * Get position for ReactFlow handle based on connection point
   */
  protected getHandlePosition(connectionType: 'inlet' | 'outlet'): Position {
    const { data } = this.props;

    // Determine position based on flow direction and orientation
    if (data.orientation === 'vertical') {
      return connectionType === 'inlet' ? Position.Top : Position.Bottom;
    }

    // Default horizontal orientation
    return connectionType === 'inlet' ? Position.Left : Position.Right;
  }

  /**
   * Validate connection between two piping components
   */
  protected validateConnection(
    source: IPipingComponent,
    target: IPipingComponent
  ): ConnectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Size validation
    if (!this.validateSize(source.size, target.size)) {
      errors.push(
        `Size mismatch: ${source.size.nominal}${source.size.standard} ` +
        `to ${target.size.nominal}${target.size.standard}`
      );
      recommendations.push('Consider using a reducer fitting');
    }

    // Rating validation
    if (!this.validateRating(source.rating, target.rating)) {
      warnings.push(
        `Pressure rating mismatch: ${source.rating.value}${source.rating.standard} ` +
        `to ${target.rating.value}${target.rating.standard}`
      );
    }

    // Material validation
    if (!this.validateMaterial(source.material, target.material)) {
      warnings.push(
        `Material compatibility: ${source.material.code} to ${target.material.code}`
      );
      if (this.requiresGalvanicIsolation(source.material, target.material)) {
        errors.push('Galvanic corrosion risk - isolation required');
        recommendations.push('Use dielectric union or insulating gasket');
      }
    }

    // Connection type validation
    if (!this.validateConnectionType(source.outletConnection, target.inletConnection)) {
      errors.push(
        `Connection type mismatch: ${source.outletConnection} to ${target.inletConnection}`
      );
      recommendations.push('Use appropriate adapter or transition fitting');
    }

    // Operating conditions validation
    if (source.operatingPressure && target.designPressure) {
      if (source.operatingPressure > target.designPressure) {
        errors.push(
          `Operating pressure (${source.operatingPressure} bar) exceeds ` +
          `downstream design pressure (${target.designPressure} bar)`
        );
      }
    }

    if (source.operatingTemperature && target.designTemperature) {
      if (source.operatingTemperature > target.designTemperature) {
        errors.push(
          `Operating temperature (${source.operatingTemperature}°C) exceeds ` +
          `downstream design temperature (${target.designTemperature}°C)`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Validate pipe sizes are compatible
   */
  protected validateSize(sourceSize: PipeSize, targetSize: PipeSize): boolean {
    // Different standards require conversion
    if (sourceSize.standard !== targetSize.standard) {
      // Convert to common OD for comparison
      const sourceOD = sourceSize.outerDiameter || this.estimateOD(sourceSize);
      const targetOD = targetSize.outerDiameter || this.estimateOD(targetSize);

      // Allow up to 10% difference for different standards
      return Math.abs(sourceOD - targetOD) / sourceOD <= 0.1;
    }

    // Same standard - must match exactly
    return sourceSize.nominal === targetSize.nominal;
  }

  /**
   * Estimate outer diameter from nominal size
   */
  private estimateOD(size: PipeSize): number {
    // Simplified conversion - would use lookup tables in production
    if (size.standard === 'DN') {
      // DN to approximate OD in mm
      return size.nominal + 10; // Simplified
    } else if (size.standard === 'NPS') {
      // NPS to approximate OD in mm
      return size.nominal * 25.4 * 1.05; // Simplified
    }
    return size.nominal;
  }

  /**
   * Validate pressure ratings are compatible
   */
  protected validateRating(sourceRating: PressureRating, targetRating: PressureRating): boolean {
    // Convert to common pressure unit (bar) for comparison
    const sourcePressure = this.convertToBar(sourceRating);
    const targetPressure = this.convertToBar(targetRating);

    // Target must be able to handle source pressure
    return targetPressure >= sourcePressure;
  }

  /**
   * Convert pressure rating to bar
   */
  private convertToBar(rating: PressureRating): number {
    switch (rating.standard) {
      case 'PN':
        return rating.value; // Already in bar
      case 'CLASS':
        // ANSI class to bar conversion (approximate at 20°C)
        const classToBar: Record<number, number> = {
          150: 20,
          300: 50,
          600: 100,
          900: 150,
          1500: 250,
          2500: 420
        };
        return classToBar[rating.value] || rating.value;
      default:
        return rating.value;
    }
  }

  /**
   * Validate material compatibility
   */
  protected validateMaterial(
    sourceMaterial: PipingMaterial,
    targetMaterial: PipingMaterial
  ): boolean {
    // Same material is always compatible
    if (sourceMaterial.code === targetMaterial.code) {
      return true;
    }

    // Check for known incompatibilities
    const incompatible = [
      ['CS', 'SS316'], // Carbon steel to stainless steel
      ['COPPER', 'GALV'], // Copper to galvanized steel
      ['BRASS', 'GALV'], // Brass to galvanized steel
    ];

    for (const [mat1, mat2] of incompatible) {
      if ((sourceMaterial.code === mat1 && targetMaterial.code === mat2) ||
          (sourceMaterial.code === mat2 && targetMaterial.code === mat1)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if materials require galvanic isolation
   */
  protected requiresGalvanicIsolation(
    material1: PipingMaterial,
    material2: PipingMaterial
  ): boolean {
    const galvanicSeries: Record<string, number> = {
      'MAGNESIUM': -1.75,
      'ZINC': -1.0,
      'ALUMINUM': -0.8,
      'CS': -0.6, // Carbon steel
      'CAST_IRON': -0.5,
      'SS316': -0.1, // Stainless steel
      'BRASS': 0.0,
      'COPPER': 0.2,
      'MONEL': 0.3,
    };

    const potential1 = galvanicSeries[material1.code] || 0;
    const potential2 = galvanicSeries[material2.code] || 0;

    // Risk of galvanic corrosion if potential difference > 0.25V
    return Math.abs(potential1 - potential2) > 0.25;
  }

  /**
   * Validate connection types are compatible
   */
  protected validateConnectionType(
    sourceType: PipingConnectionType,
    targetType: PipingConnectionType
  ): boolean {
    // Same type is always compatible
    if (sourceType === targetType) {
      return true;
    }

    // Define compatible connection combinations
    const compatible: Array<[PipingConnectionType, PipingConnectionType]> = [
      [PipingConnectionType.FLANGED, PipingConnectionType.FLANGED],
      [PipingConnectionType.THREADED, PipingConnectionType.THREADED],
      [PipingConnectionType.SOCKET_WELD, PipingConnectionType.SOCKET_WELD],
      [PipingConnectionType.BUTT_WELD, PipingConnectionType.BUTT_WELD],
      // Threaded can connect to socket-weld with appropriate fitting
      [PipingConnectionType.THREADED, PipingConnectionType.SOCKET_WELD],
      [PipingConnectionType.SOCKET_WELD, PipingConnectionType.THREADED],
    ];

    return compatible.some(
      ([type1, type2]) =>
        (sourceType === type1 && targetType === type2) ||
        (sourceType === type2 && targetType === type1)
    );
  }

  /**
   * Format size display
   */
  protected formatSize(size: PipeSize): string {
    const sizeStr = `${size.nominal}${size.standard}`;
    return size.schedule ? `${sizeStr} SCH${size.schedule}` : sizeStr;
  }

  /**
   * Format rating display
   */
  protected formatRating(rating: PressureRating): string {
    if (rating.standard === 'CLASS') {
      return `Class ${rating.value}`;
    }
    return `${rating.standard}${rating.value}`;
  }

  /**
   * Get component display label
   */
  protected getDisplayLabel(): string {
    const { data } = this.props;
    return data.label || `${data.subType} - ${this.formatSize(data.size)}`;
  }

  /**
   * Get status color based on component state
   */
  protected getStatusColor(): string {
    const { data } = this.props;
    switch (data.state) {
      case 'operating':
        return '#10b981'; // Green
      case 'idle':
        return '#6b7280'; // Gray
      case 'fault':
        return '#ef4444'; // Red
      case 'maintenance':
        return '#f59e0b'; // Amber
      default:
        return '#6b7280';
    }
  }

  /**
   * Abstract method to render the symbol SVG
   */
  protected abstract renderSymbol(): React.ReactNode;

  /**
   * Render component properties panel
   */
  protected renderProperties(): React.ReactNode {
    const { data, showProperties } = this.props;

    if (!showProperties) {
      return null;
    }

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-3 text-xs min-w-[200px] z-10">
        <div className="font-semibold mb-2">{data.label}</div>
        <div className="space-y-1">
          <div>Type: {data.subType}</div>
          <div>Size: {this.formatSize(data.size)}</div>
          <div>Rating: {this.formatRating(data.rating)}</div>
          <div>Material: {data.material.name}</div>
          {data.operatingPressure && (
            <div>Operating: {data.operatingPressure} bar</div>
          )}
          {data.operatingTemperature && (
            <div>Temperature: {data.operatingTemperature}°C</div>
          )}
        </div>
      </div>
    );
  }

  override render(): React.ReactNode {
    const { data, selected } = this.props;
    const statusColor = this.getStatusColor();

    return (
      <div className="relative">
        <Handle
          type="target"
          position={this.getHandlePosition('inlet')}
          id="inlet"
          style={{ background: statusColor }}
        />

        <div
          className={`
            piping-node
            ${selected ? 'ring-2 ring-blue-500' : ''}
            ${data.animated ? 'animate-pulse' : ''}
          `}
        >
          {this.renderSymbol()}

          {data.showLabel && (
            <div className="text-center text-xs mt-1">
              {this.getDisplayLabel()}
            </div>
          )}
        </div>

        {this.renderProperties()}

        <Handle
          type="source"
          position={this.getHandlePosition('outlet')}
          id="outlet"
          style={{ background: statusColor }}
        />
      </div>
    );
  }
}

/**
 * Export the base component - memo not needed for class components
 */
export const BasePipingNode = BasePipingNodeComponent;

export default BasePipingNode;