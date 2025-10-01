import type { Edge, Node } from 'reactflow';
import type { ConnectionPoint } from '@/types/connectionPoint';

export interface PipeSpecification {
  nominalSize: string; // DN15, DN20, DN25, DN32, DN40, DN50, DN65, DN80, DN100, DN125, DN150, DN200
  outerDiameter: number; // mm
  wallThickness: number; // mm
  internalDiameter: number; // mm
  weightPerMeter: number; // kg/m
  maxPressure: number; // bar
}

export interface FluidProperties {
  name: string;
  type: 'liquid' | 'gas' | 'steam' | 'electrical';
  density: number; // kg/m³
  viscosity: number; // cP
  specificHeat: number; // kJ/kg·K
  thermalConductivity: number; // W/m·K
  freezingPoint: number; // °C
  boilingPoint: number; // °C
  corrosiveness: 'low' | 'medium' | 'high';
  toxicity: 'none' | 'low' | 'medium' | 'high';
  flammability: 'none' | 'low' | 'medium' | 'high';
}

export interface MaterialProperties {
  name: string;
  type: 'carbon_steel' | 'stainless_steel' | 'aluminum' | 'copper' | 'pvc' | 'hdpe' | 'carbon_fiber';
  maxTemperature: number; // °C
  maxPressure: number; // bar
  corrosionResistance: string[];
  thermalExpansion: number; // mm/m/°C
  youngsModulus: number; // GPa
  cost: number; // relative cost factor
  availability: 'standard' | 'special_order' | 'limited';
}

export interface DesignStandard {
  code: string;
  name: string;
  region: 'international' | 'european' | 'american' | 'british' | 'german';
  applicableServices: string[];
  pressureClasses: string[];
  temperatureRanges: { min: number; max: number }[];
  safetyFactors: { pressure: number; temperature: number };
}

export interface ConnectionMetadata {
  id: string;
  connectionId: string; // ReactFlow edge ID
  sourceNodeId: string;
  targetNodeId: string;
  sourcePointId: string;
  targetPointId: string;

  // Line Identification
  lineNumber: string;
  serviceName: string;
  systemCode: string;
  equipmentTags: string[];

  // Process Data
  fluid: FluidProperties;
  operatingConditions: {
    temperature: number; // °C
    pressure: number; // bar
    flowRate: number; // m³/h or kg/h
    velocity: number; // m/s
  };

  // Design Data
  designConditions: {
    temperature: number; // °C
    pressure: number; // bar
    designCode: string;
    safetyFactor: number;
  };

  // Physical Properties
  pipeSpec: PipeSpecification;
  material: MaterialProperties;
  insulation?: {
    type: string;
    thickness: number; // mm
    thermalConductivity: number; // W/m·K
  };

  // Installation Data
  routing: {
    length: number; // m
    elevationChange: number; // m
    supports: number;
    expansionJoints: number;
    valves: string[];
    fittings: string[];
  };

  // Compliance
  standards: DesignStandard[];
  certifications: string[];
  testPressure: number; // bar
  lastInspection?: Date;

  // Cost Data
  estimatedCost: {
    material: number;
    fabrication: number;
    installation: number;
    testing: number;
    total: number;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  status: 'draft' | 'under_review' | 'approved' | 'installed' | 'operational';
  comments: string[];
}

export class ConnectionMetadataService {
  private connections = new Map<string, ConnectionMetadata>();
  private pipeSpecs = new Map<string, PipeSpecification>();
  private fluidLibrary = new Map<string, FluidProperties>();
  private materialLibrary = new Map<string, MaterialProperties>();
  private standardsLibrary = new Map<string, DesignStandard>();

  constructor() {
    this.initializeLibraries();
  }

  /**
   * Initialize standard libraries with common specifications
   */
  private initializeLibraries(): void {
    // Standard pipe specifications (DIN/EN standards)
    const pipeSpecs: PipeSpecification[] = [
      { nominalSize: 'DN15', outerDiameter: 21.3, wallThickness: 2.6, internalDiameter: 16.1, weightPerMeter: 1.28, maxPressure: 400 },
      { nominalSize: 'DN20', outerDiameter: 26.9, wallThickness: 2.6, internalDiameter: 21.7, weightPerMeter: 1.69, maxPressure: 400 },
      { nominalSize: 'DN25', outerDiameter: 33.7, wallThickness: 3.2, internalDiameter: 27.3, weightPerMeter: 2.41, maxPressure: 400 },
      { nominalSize: 'DN32', outerDiameter: 42.4, wallThickness: 3.2, internalDiameter: 36.0, weightPerMeter: 3.24, maxPressure: 400 },
      { nominalSize: 'DN40', outerDiameter: 48.3, wallThickness: 3.2, internalDiameter: 41.9, weightPerMeter: 3.84, maxPressure: 400 },
      { nominalSize: 'DN50', outerDiameter: 60.3, wallThickness: 3.6, internalDiameter: 53.1, weightPerMeter: 5.44, maxPressure: 320 },
      { nominalSize: 'DN65', outerDiameter: 76.1, wallThickness: 3.6, internalDiameter: 68.9, weightPerMeter: 7.14, maxPressure: 320 },
      { nominalSize: 'DN80', outerDiameter: 88.9, wallThickness: 4.0, internalDiameter: 80.9, weightPerMeter: 9.30, maxPressure: 320 },
      { nominalSize: 'DN100', outerDiameter: 114.3, wallThickness: 4.5, internalDiameter: 105.3, weightPerMeter: 13.4, maxPressure: 250 },
      { nominalSize: 'DN125', outerDiameter: 139.7, wallThickness: 5.0, internalDiameter: 129.7, weightPerMeter: 18.3, maxPressure: 250 },
      { nominalSize: 'DN150', outerDiameter: 168.3, wallThickness: 5.6, internalDiameter: 157.1, weightPerMeter: 24.7, maxPressure: 200 },
      { nominalSize: 'DN200', outerDiameter: 219.1, wallThickness: 6.3, internalDiameter: 206.5, weightPerMeter: 36.4, maxPressure: 200 }
    ];

    pipeSpecs.forEach(spec => this.pipeSpecs.set(spec.nominalSize, spec));

    // Common fluids
    const fluids: FluidProperties[] = [
      {
        name: 'Water',
        type: 'liquid',
        density: 1000,
        viscosity: 1.0,
        specificHeat: 4.18,
        thermalConductivity: 0.6,
        freezingPoint: 0,
        boilingPoint: 100,
        corrosiveness: 'low',
        toxicity: 'none',
        flammability: 'none'
      },
      {
        name: 'Steam',
        type: 'steam',
        density: 0.6,
        viscosity: 0.012,
        specificHeat: 2.01,
        thermalConductivity: 0.025,
        freezingPoint: 0,
        boilingPoint: 100,
        corrosiveness: 'medium',
        toxicity: 'low',
        flammability: 'none'
      },
      {
        name: 'Compressed Air',
        type: 'gas',
        density: 1.225,
        viscosity: 0.018,
        specificHeat: 1.005,
        thermalConductivity: 0.026,
        freezingPoint: -273,
        boilingPoint: -196,
        corrosiveness: 'low',
        toxicity: 'none',
        flammability: 'none'
      },
      {
        name: 'Natural Gas',
        type: 'gas',
        density: 0.717,
        viscosity: 0.011,
        specificHeat: 2.22,
        thermalConductivity: 0.034,
        freezingPoint: -182,
        boilingPoint: -162,
        corrosiveness: 'low',
        toxicity: 'medium',
        flammability: 'high'
      }
    ];

    fluids.forEach(fluid => this.fluidLibrary.set(fluid.name, fluid));

    // Material properties
    const materials: MaterialProperties[] = [
      {
        name: 'Carbon Steel',
        type: 'carbon_steel',
        maxTemperature: 400,
        maxPressure: 420,
        corrosionResistance: ['water', 'steam'],
        thermalExpansion: 12,
        youngsModulus: 200,
        cost: 1.0,
        availability: 'standard'
      },
      {
        name: 'Stainless Steel 316L',
        type: 'stainless_steel',
        maxTemperature: 600,
        maxPressure: 420,
        corrosionResistance: ['water', 'steam', 'chemicals', 'seawater'],
        thermalExpansion: 16,
        youngsModulus: 200,
        cost: 3.5,
        availability: 'standard'
      },
      {
        name: 'PVC',
        type: 'pvc',
        maxTemperature: 60,
        maxPressure: 16,
        corrosionResistance: ['water', 'chemicals'],
        thermalExpansion: 80,
        youngsModulus: 3,
        cost: 0.3,
        availability: 'standard'
      }
    ];

    materials.forEach(material => this.materialLibrary.set(material.name, material));

    // Design standards
    const standards: DesignStandard[] = [
      {
        code: 'ASME B31.1',
        name: 'Power Piping',
        region: 'american',
        applicableServices: ['steam', 'water', 'power'],
        pressureClasses: ['150', '300', '600', '900', '1500'],
        temperatureRanges: [{ min: -29, max: 510 }],
        safetyFactors: { pressure: 4.0, temperature: 1.5 }
      },
      {
        code: 'DIN EN 13480',
        name: 'Metallic industrial piping',
        region: 'european',
        applicableServices: ['general', 'chemical', 'industrial'],
        pressureClasses: ['PN6', 'PN10', 'PN16', 'PN25', 'PN40'],
        temperatureRanges: [{ min: -196, max: 700 }],
        safetyFactors: { pressure: 2.4, temperature: 1.2 }
      },
      {
        code: 'BS EN 13480',
        name: 'Metallic industrial piping - British Standard',
        region: 'british',
        applicableServices: ['water', 'steam', 'general'],
        pressureClasses: ['PN6', 'PN10', 'PN16', 'PN25', 'PN40'],
        temperatureRanges: [{ min: -196, max: 700 }],
        safetyFactors: { pressure: 2.4, temperature: 1.2 }
      }
    ];

    standards.forEach(standard => this.standardsLibrary.set(standard.code, standard));
  }

  /**
   * Create connection metadata from ReactFlow edge and connection points
   */
  public createConnectionMetadata(
    edge: Edge,
    sourceNode: Node,
    targetNode: Node,
    sourcePoint: ConnectionPoint,
    targetPoint: ConnectionPoint,
    userId: string
  ): ConnectionMetadata {
    const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lineNumber = this.generateLineNumber(sourceNode, targetNode);

    const metadata: ConnectionMetadata = {
      id,
      connectionId: edge.id,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourcePointId: sourcePoint.id,
      targetPointId: targetPoint.id,

      lineNumber,
      serviceName: this.deriveServiceName(sourcePoint, targetPoint),
      systemCode: this.deriveSystemCode(sourceNode, targetNode),
      equipmentTags: [sourceNode.id, targetNode.id],

      fluid: this.selectDefaultFluid(sourcePoint, targetPoint),
      operatingConditions: {
        temperature: 20,
        pressure: 6,
        flowRate: 100,
        velocity: 2.0
      },

      designConditions: {
        temperature: 80,
        pressure: 10,
        designCode: 'DIN EN 13480',
        safetyFactor: 2.4
      },

      pipeSpec: this.selectDefaultPipeSpec(sourcePoint, targetPoint),
      material: this.selectDefaultMaterial(sourcePoint, targetPoint),

      routing: {
        length: this.calculateRouteLength(edge),
        elevationChange: 0,
        supports: Math.ceil(this.calculateRouteLength(edge) / 3), // Support every 3m
        expansionJoints: 0,
        valves: [],
        fittings: ['elbow_90', 'tee']
      },

      standards: [this.standardsLibrary.get('DIN EN 13480')!],
      certifications: [],
      testPressure: 15, // 1.5x design pressure

      estimatedCost: {
        material: 0,
        fabrication: 0,
        installation: 0,
        testing: 0,
        total: 0
      },

      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      version: 1,
      status: 'draft',
      comments: []
    };

    this.calculateCosts(metadata);
    this.connections.set(id, metadata);

    return metadata;
  }

  /**
   * Update existing connection metadata
   */
  public updateConnectionMetadata(id: string, updates: Partial<ConnectionMetadata>): ConnectionMetadata | null {
    const existing = this.connections.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
      version: existing.version + 1
    };

    if (updates.pipeSpec || updates.material || updates.routing) {
      this.calculateCosts(updated);
    }

    this.connections.set(id, updated);
    return updated;
  }

  /**
   * Get connection metadata by ID
   */
  public getConnectionMetadata(id: string): ConnectionMetadata | null {
    return this.connections.get(id) || null;
  }

  /**
   * Get all connections for a specific node
   */
  public getNodeConnections(nodeId: string): ConnectionMetadata[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
    );
  }

  /**
   * Search connections by criteria
   */
  public searchConnections(criteria: {
    systemCode?: string;
    serviceName?: string;
    fluid?: string;
    material?: string;
    pipeSize?: string;
    status?: string;
  }): ConnectionMetadata[] {
    return Array.from(this.connections.values()).filter(conn => {
      if (criteria.systemCode && conn.systemCode !== criteria.systemCode) return false;
      if (criteria.serviceName && !conn.serviceName.toLowerCase().includes(criteria.serviceName.toLowerCase())) return false;
      if (criteria.fluid && conn.fluid.name !== criteria.fluid) return false;
      if (criteria.material && conn.material.name !== criteria.material) return false;
      if (criteria.pipeSize && conn.pipeSpec.nominalSize !== criteria.pipeSize) return false;
      if (criteria.status && conn.status !== criteria.status) return false;
      return true;
    });
  }

  /**
   * Generate standardized line number
   */
  private generateLineNumber(sourceNode: Node, targetNode: Node): string {
    const system = 'SYS';
    const service = 'GEN';
    const sequence = String(this.connections.size + 1).padStart(3, '0');
    return `${system}-${service}-${sequence}`;
  }

  /**
   * Derive service name from connection points
   */
  private deriveServiceName(sourcePoint: ConnectionPoint, targetPoint: ConnectionPoint): string {
    const serviceMap: Record<string, string> = {
      'process_water': 'Process Water',
      'cooling_water': 'Cooling Water',
      'hot_water': 'Hot Water',
      'steam': 'Steam',
      'compressed_air': 'Compressed Air',
      'natural_gas': 'Natural Gas',
      'electrical': 'Electrical',
      'instrument_air': 'Instrument Air'
    };

    return serviceMap[sourcePoint.type] || serviceMap[targetPoint.type] || 'General Service';
  }

  /**
   * Derive system code from nodes
   */
  private deriveSystemCode(sourceNode: Node, targetNode: Node): string {
    // This would typically analyze node types and derive appropriate system codes
    return 'GEN'; // General system
  }

  /**
   * Select appropriate fluid based on connection points
   */
  private selectDefaultFluid(sourcePoint: ConnectionPoint, targetPoint: ConnectionPoint): FluidProperties {
    const fluidMap: Record<string, string> = {
      'steam': 'Steam',
      'compressed_air': 'Compressed Air',
      'natural_gas': 'Natural Gas'
    };

    const fluidName = fluidMap[sourcePoint.type] || fluidMap[targetPoint.type] || 'Water';
    return this.fluidLibrary.get(fluidName) || this.fluidLibrary.get('Water')!;
  }

  /**
   * Select appropriate pipe specification
   */
  private selectDefaultPipeSpec(sourcePoint: ConnectionPoint, targetPoint: ConnectionPoint): PipeSpecification {
    // Default to DN50 for most applications
    return this.pipeSpecs.get('DN50')!;
  }

  /**
   * Select appropriate material
   */
  private selectDefaultMaterial(sourcePoint: ConnectionPoint, targetPoint: ConnectionPoint): MaterialProperties {
    if (sourcePoint.type.includes('steam') || targetPoint.type.includes('steam')) {
      return this.materialLibrary.get('Carbon Steel')!;
    }
    return this.materialLibrary.get('Carbon Steel')!;
  }

  /**
   * Calculate route length from edge path
   */
  private calculateRouteLength(edge: Edge): number {
    // Simplified calculation - in reality would analyze edge path
    return 10; // Default 10 meters
  }

  /**
   * Calculate estimated costs
   */
  private calculateCosts(metadata: ConnectionMetadata): void {
    const {length} = metadata.routing;
    const materialCost = length * metadata.material.cost * 100; // Base cost per meter
    const fabricationCost = materialCost * 0.3;
    const installationCost = materialCost * 0.5;
    const testingCost = materialCost * 0.1;

    metadata.estimatedCost = {
      material: Math.round(materialCost),
      fabrication: Math.round(fabricationCost),
      installation: Math.round(installationCost),
      testing: Math.round(testingCost),
      total: Math.round(materialCost + fabricationCost + installationCost + testingCost)
    };
  }

  /**
   * Export connections to CSV
   */
  public exportToCSV(): string {
    const headers = [
      'Line Number', 'Service Name', 'System Code', 'Fluid', 'Pipe Size',
      'Material', 'Operating Pressure', 'Operating Temperature', 'Length',
      'Estimated Cost', 'Status'
    ];

    const rows = Array.from(this.connections.values()).map(conn => [
      conn.lineNumber,
      conn.serviceName,
      conn.systemCode,
      conn.fluid.name,
      conn.pipeSpec.nominalSize,
      conn.material.name,
      conn.operatingConditions.pressure,
      conn.operatingConditions.temperature,
      conn.routing.length,
      conn.estimatedCost.total,
      conn.status
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Get available pipe specifications
   */
  public getPipeSpecifications(): PipeSpecification[] {
    return Array.from(this.pipeSpecs.values());
  }

  /**
   * Get available fluids
   */
  public getFluids(): FluidProperties[] {
    return Array.from(this.fluidLibrary.values());
  }

  /**
   * Get available materials
   */
  public getMaterials(): MaterialProperties[] {
    return Array.from(this.materialLibrary.values());
  }

  /**
   * Get available standards
   */
  public getStandards(): DesignStandard[] {
    return Array.from(this.standardsLibrary.values());
  }

  /**
   * Clear all connection data
   */
  public clearConnections(): void {
    this.connections.clear();
  }

  /**
   * Get connection statistics
   */
  public getStatistics(): {
    totalConnections: number;
    totalLength: number;
    totalCost: number;
    fluidBreakdown: Record<string, number>;
    materialBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
  } {
    const connections = Array.from(this.connections.values());

    return {
      totalConnections: connections.length,
      totalLength: connections.reduce((sum, conn) => sum + conn.routing.length, 0),
      totalCost: connections.reduce((sum, conn) => sum + conn.estimatedCost.total, 0),
      fluidBreakdown: this.groupBy(connections, conn => conn.fluid.name),
      materialBreakdown: this.groupBy(connections, conn => conn.material.name),
      statusBreakdown: this.groupBy(connections, conn => conn.status)
    };
  }

  private groupBy<T>(array: T[], keyFunc: (item: T) => string): Record<string, number> {
    return array.reduce((groups, item) => {
      const key = keyFunc(item);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}

// Singleton instance
export const connectionMetadataService = new ConnectionMetadataService();