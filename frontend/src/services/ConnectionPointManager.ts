/**
 * ConnectionPointManager Service
 * Manages connection points for P&ID symbols including creation, validation, and updates
 */

import type { Node, Edge } from 'reactflow';

import type {
  ConnectionPoint,
  PipeSize,
  PressureRating,
  ConnectionValidation,
  ConnectionValidationResult,
  SymbolConnectionConfig,
  ConnectionManagerConfig,
  ConnectionPointStyle} from '@/types/connectionPoint';
import {
  ConnectionPointType,
  ConnectionDirection,
  DEFAULT_VALIDATION_RULES,
  generateConnectionPointId
} from '@/types/connectionPoint';

/**
 * Default manager configuration
 */
const DEFAULT_CONFIG: ConnectionManagerConfig = {
  showOnHover: true,
  showOnSelect: true,
  snapToPoint: true,
  snapDistance: 20,
  validateConnections: true,
  highlightValidPoints: true,
  defaultStyle: {
    color: '#007bff',
    size: 8,
    showLabel: false,
    animated: false
  }
};

/**
 * Connection Point Manager Service
 */
export class ConnectionPointManager {
  private config: ConnectionManagerConfig;
  private symbolConfigs: Map<string, SymbolConnectionConfig>;
  private connectionPoints: Map<string, ConnectionPoint[]>;

  constructor(config: Partial<ConnectionManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.symbolConfigs = new Map();
    this.connectionPoints = new Map();
    this.initializeDefaultConfigs();
  }

  /**
   * Initialize default connection configurations for common symbol types
   */
  private initializeDefaultConfigs(): void {
    // Pump symbol configuration
    this.registerSymbolConfig({
      symbolType: 'pump',
      connectionPoints: [
        this.createConnectionPoint('inlet', ConnectionPointType.PROCESS_INLET,
          { x: 0, y: 0.5 }, ConnectionDirection.WEST),
        this.createConnectionPoint('outlet', ConnectionPointType.PROCESS_OUTLET,
          { x: 1, y: 0.5 }, ConnectionDirection.EAST),
        this.createConnectionPoint('power', ConnectionPointType.UTILITY_POWER,
          { x: 0.5, y: 0 }, ConnectionDirection.NORTH)
      ]
    });

    // Valve symbol configuration
    this.registerSymbolConfig({
      symbolType: 'valve',
      connectionPoints: [
        this.createConnectionPoint('inlet', ConnectionPointType.PROCESS_INLET,
          { x: 0, y: 0.5 }, ConnectionDirection.WEST),
        this.createConnectionPoint('outlet', ConnectionPointType.PROCESS_OUTLET,
          { x: 1, y: 0.5 }, ConnectionDirection.EAST),
        this.createConnectionPoint('actuator', ConnectionPointType.SIGNAL_PNEUMATIC,
          { x: 0.5, y: 0 }, ConnectionDirection.NORTH)
      ]
    });

    // Tank symbol configuration
    this.registerSymbolConfig({
      symbolType: 'tank',
      connectionPoints: [
        this.createConnectionPoint('inlet', ConnectionPointType.PROCESS_INLET,
          { x: 0.5, y: 0 }, ConnectionDirection.NORTH),
        this.createConnectionPoint('outlet', ConnectionPointType.PROCESS_OUTLET,
          { x: 0.5, y: 1 }, ConnectionDirection.SOUTH),
        this.createConnectionPoint('drain', ConnectionPointType.DRAIN,
          { x: 0.3, y: 1 }, ConnectionDirection.SOUTH),
        this.createConnectionPoint('vent', ConnectionPointType.VENT,
          { x: 0.7, y: 0 }, ConnectionDirection.NORTH)
      ]
    });

    // Instrument symbol configuration
    this.registerSymbolConfig({
      symbolType: 'instrument',
      connectionPoints: [
        this.createConnectionPoint('process', ConnectionPointType.PROCESS_INLET,
          { x: 0.5, y: 1 }, ConnectionDirection.SOUTH),
        this.createConnectionPoint('signal_out', ConnectionPointType.SIGNAL_ANALOG,
          { x: 1, y: 0.5 }, ConnectionDirection.EAST),
        this.createConnectionPoint('power', ConnectionPointType.UTILITY_POWER,
          { x: 0, y: 0.5 }, ConnectionDirection.WEST)
      ]
    });

    // Heat exchanger configuration
    this.registerSymbolConfig({
      symbolType: 'heat_exchanger',
      connectionPoints: [
        this.createConnectionPoint('hot_inlet', ConnectionPointType.PROCESS_INLET,
          { x: 0, y: 0.25 }, ConnectionDirection.WEST),
        this.createConnectionPoint('hot_outlet', ConnectionPointType.PROCESS_OUTLET,
          { x: 1, y: 0.25 }, ConnectionDirection.EAST),
        this.createConnectionPoint('cold_inlet', ConnectionPointType.PROCESS_INLET,
          { x: 1, y: 0.75 }, ConnectionDirection.EAST),
        this.createConnectionPoint('cold_outlet', ConnectionPointType.PROCESS_OUTLET,
          { x: 0, y: 0.75 }, ConnectionDirection.WEST)
      ]
    });
  }

  /**
   * Create a connection point with default validation
   */
  private createConnectionPoint(
    id: string,
    type: ConnectionPointType,
    position: { x: number; y: number },
    direction: ConnectionDirection,
    size?: PipeSize,
    rating?: PressureRating
  ): ConnectionPoint {
    const defaultValidation = DEFAULT_VALIDATION_RULES[type] || {};

    return {
      id,
      type,
      position,
      direction,
      size,
      rating,
      validation: {
        compatibleTypes: defaultValidation.compatibleTypes || [type],
        isRequired: defaultValidation.isRequired ?? false,
        allowMultiple: defaultValidation.allowMultiple ?? false
      } as ConnectionValidation,
      isConnected: false,
      connectedEdges: [],
      style: this.config.defaultStyle
    };
  }

  /**
   * Register a symbol configuration
   */
  public registerSymbolConfig(config: SymbolConnectionConfig): void {
    this.symbolConfigs.set(config.symbolType, config);
  }

  /**
   * Get connection points for a node
   */
  public getConnectionPoints(node: Node): ConnectionPoint[] {
    const cached = this.connectionPoints.get(node.id);
    if (cached) return cached;

    const points = this.generateConnectionPoints(node);
    this.connectionPoints.set(node.id, points);
    return points;
  }

  /**
   * Generate connection points for a node based on its type
   */
  private generateConnectionPoints(node: Node): ConnectionPoint[] {
    const symbolType = node.data?.symbolType || node.type || 'generic';
    const config = this.symbolConfigs.get(symbolType);

    if (!config) {
      // Generate default connection points
      return this.generateDefaultConnectionPoints(node);
    }

    // Clone and customize connection points for this specific node
    return config.connectionPoints.map((point, index) => ({
      ...point,
      id: generateConnectionPointId(node.id, index),
      isConnected: false,
      connectedEdges: []
    }));
  }

  /**
   * Generate default connection points for unknown symbol types
   */
  private generateDefaultConnectionPoints(node: Node): ConnectionPoint[] {
    return [
      this.createConnectionPoint(
        generateConnectionPointId(node.id, 0),
        ConnectionPointType.GENERIC,
        { x: 0, y: 0.5 },
        ConnectionDirection.WEST
      ),
      this.createConnectionPoint(
        generateConnectionPointId(node.id, 1),
        ConnectionPointType.GENERIC,
        { x: 1, y: 0.5 },
        ConnectionDirection.EAST
      ),
      this.createConnectionPoint(
        generateConnectionPointId(node.id, 2),
        ConnectionPointType.GENERIC,
        { x: 0.5, y: 0 },
        ConnectionDirection.NORTH
      ),
      this.createConnectionPoint(
        generateConnectionPointId(node.id, 3),
        ConnectionPointType.GENERIC,
        { x: 0.5, y: 1 },
        ConnectionDirection.SOUTH
      )
    ];
  }

  /**
   * Validate a connection between two points
   */
  public validateConnection(
    sourcePoint: ConnectionPoint,
    targetPoint: ConnectionPoint
  ): ConnectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if connection types are compatible
    if (!sourcePoint.validation.compatibleTypes.includes(targetPoint.type)) {
      errors.push(`Connection type ${targetPoint.type} is not compatible with ${sourcePoint.type}`);
    }

    // Check if source allows multiple connections
    if (sourcePoint.isConnected && !sourcePoint.validation.allowMultiple) {
      errors.push(`Source connection point does not allow multiple connections`);
    }

    // Check if target allows multiple connections
    if (targetPoint.isConnected && !targetPoint.validation.allowMultiple) {
      errors.push(`Target connection point does not allow multiple connections`);
    }

    // Check size compatibility
    if (sourcePoint.size && targetPoint.size) {
      const sourceSize = parseInt(sourcePoint.size.replace('DN', ''));
      const targetSize = parseInt(targetPoint.size.replace('DN', ''));

      if (sourceSize !== targetSize) {
        warnings.push(`Size mismatch: ${sourcePoint.size} to ${targetPoint.size}`);
        suggestions.push(`Consider using a reducer/expander fitting`);
      }
    }

    // Check pressure rating compatibility
    if (sourcePoint.rating && targetPoint.rating && sourcePoint.rating !== targetPoint.rating) {
      warnings.push(`Pressure rating mismatch: ${sourcePoint.rating} to ${targetPoint.rating}`);
      suggestions.push(`Ensure downstream equipment can handle the pressure`);
    }

    // Run custom validators if present
    if (sourcePoint.validation.customValidator) {
      if (!sourcePoint.validation.customValidator(sourcePoint, targetPoint)) {
        errors.push(`Custom validation failed`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Update connection status when an edge is connected
   */
  public handleEdgeConnection(
    edge: Edge,
    nodes: Node[]
  ): ConnectionValidationResult | null {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      return null;
    }

    const sourcePoints = this.getConnectionPoints(sourceNode);
    const targetPoints = this.getConnectionPoints(targetNode);

    // Find the specific connection points (simplified - in real app would use handle IDs)
    const sourcePoint = sourcePoints.find(p => p.id === (edge as any).sourceHandle) || sourcePoints[0];
    const targetPoint = targetPoints.find(p => p.id === (edge as any).targetHandle) || targetPoints[0];

    if (!sourcePoint || !targetPoint) {
      return null;
    }

    // Validate connection
    const validation = this.validateConnection(sourcePoint, targetPoint);

    if (validation.isValid) {
      // Update connection status
      sourcePoint.isConnected = true;
      sourcePoint.connectedEdges.push(edge.id);
      targetPoint.isConnected = true;
      targetPoint.connectedEdges.push(edge.id);
    }

    return validation;
  }

  /**
   * Update connection status when an edge is disconnected
   */
  public handleEdgeDisconnection(edge: Edge, nodes: Node[]): void {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (sourceNode) {
      const sourcePoints = this.getConnectionPoints(sourceNode);
      sourcePoints.forEach(point => {
        const index = point.connectedEdges.indexOf(edge.id);
        if (index > -1) {
          point.connectedEdges.splice(index, 1);
          point.isConnected = point.connectedEdges.length > 0;
        }
      });
    }

    if (targetNode) {
      const targetPoints = this.getConnectionPoints(targetNode);
      targetPoints.forEach(point => {
        const index = point.connectedEdges.indexOf(edge.id);
        if (index > -1) {
          point.connectedEdges.splice(index, 1);
          point.isConnected = point.connectedEdges.length > 0;
        }
      });
    }
  }

  /**
   * Find the nearest connection point to a position
   */
  public findNearestConnectionPoint(
    node: Node,
    position: { x: number; y: number },
    nodeWidth: number,
    nodeHeight: number
  ): ConnectionPoint | null {
    const points = this.getConnectionPoints(node);
    let nearestPoint: ConnectionPoint | null = null;
    let minDistance = this.config.snapDistance;

    points.forEach(point => {
      const pointX = point.position.x * nodeWidth;
      const pointY = point.position.y * nodeHeight;
      const distance = Math.sqrt(
        Math.pow(position.x - pointX, 2) +
        Math.pow(position.y - pointY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    return nearestPoint;
  }

  /**
   * Get valid connection points for a source point
   */
  public getValidTargetPoints(
    sourcePoint: ConnectionPoint,
    nodes: Node[]
  ): Map<string, ConnectionPoint[]> {
    const validPoints = new Map<string, ConnectionPoint[]>();

    nodes.forEach(node => {
      const points = this.getConnectionPoints(node);
      const validNodePoints = points.filter(targetPoint => {
        const validation = this.validateConnection(sourcePoint, targetPoint);
        return validation.isValid;
      });

      if (validNodePoints.length > 0) {
        validPoints.set(node.id, validNodePoints);
      }
    });

    return validPoints;
  }

  /**
   * Update connection point style
   */
  public updateConnectionPointStyle(
    nodeId: string,
    pointId: string,
    style: Partial<ConnectionPointStyle>
  ): void {
    const points = this.connectionPoints.get(nodeId);
    if (!points) return;

    const point = points.find(p => p.id === pointId);
    if (point) {
      point.style = { ...point.style, ...style };
    }
  }

  /**
   * Clear all cached connection points
   */
  public clearCache(): void {
    this.connectionPoints.clear();
  }

  /**
   * Export connection point data for persistence
   */
  public exportConnectionData(nodes: Node[]): Record<string, ConnectionPoint[]> {
    const data: Record<string, ConnectionPoint[]> = {};

    nodes.forEach(node => {
      const points = this.getConnectionPoints(node);
      if (points.length > 0) {
        data[node.id] = points;
      }
    });

    return data;
  }

  /**
   * Import connection point data
   */
  public importConnectionData(data: Record<string, ConnectionPoint[]>): void {
    Object.entries(data).forEach(([nodeId, points]) => {
      this.connectionPoints.set(nodeId, points);
    });
  }

  /**
   * Get configuration
   */
  public getConfig(): ConnectionManagerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ConnectionManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const connectionPointManager = new ConnectionPointManager();