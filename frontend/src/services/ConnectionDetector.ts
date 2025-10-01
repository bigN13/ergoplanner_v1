import { XYPosition } from 'reactflow';
import {
  ConnectionPoint,
  ConnectionDetectionResult,
  AutoConnectorConfig,
} from '@/types/connection';

/**
 * Connection detection service using spatial indexing for efficient detection
 * Uses simple grid-based spatial partitioning (future: migrate to rbush for R-tree)
 */
export class ConnectionDetector {
  private config: AutoConnectorConfig;
  private spatialGrid: Map<string, ConnectionPoint[]>;
  private gridCellSize: number = 50; // px

  constructor(config: AutoConnectorConfig) {
    this.config = config;
    this.spatialGrid = new Map();
  }

  /**
   * Update spatial index with connection points
   */
  public indexConnectionPoints(points: ConnectionPoint[]): void {
    this.spatialGrid.clear();

    for (const point of points) {
      const cellKey = this.getCellKey(point.worldPosition);
      const cell = this.spatialGrid.get(cellKey) || [];
      cell.push(point);
      this.spatialGrid.set(cellKey, cell);
    }
  }

  /**
   * Detect nearby connection points within snap distance
   */
  public detectNearbyPoints(
    position: XYPosition,
    sourcePoint?: ConnectionPoint
  ): ConnectionDetectionResult {
    const nearbyPoints: ConnectionPoint[] = [];
    const searchCells = this.getNearbyCells(position);

    // Check all nearby cells
    for (const cellKey of searchCells) {
      const cellPoints = this.spatialGrid.get(cellKey) || [];

      for (const point of cellPoints) {
        // Skip if it's the source point itself
        if (sourcePoint && point.id === sourcePoint.id) {
          continue;
        }

        // Skip occupied points
        if (point.isOccupied) {
          continue;
        }

        const distance = this.calculateDistance(position, point.worldPosition);

        if (distance <= this.config.snapDistance) {
          nearbyPoints.push(point);
        }
      }
    }

    // Find closest point
    let closestPoint: ConnectionPoint | undefined;
    let minDistance = Infinity;

    for (const point of nearbyPoints) {
      const distance = this.calculateDistance(position, point.worldPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }

    return {
      nearbyPoints,
      closestPoint,
      distance: minDistance,
      isWithinSnapDistance: minDistance <= this.config.snapDistance,
    };
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private calculateDistance(p1: XYPosition, p2: XYPosition): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get grid cell key for position
   */
  private getCellKey(position: XYPosition): string {
    const cellX = Math.floor(position.x / this.gridCellSize);
    const cellY = Math.floor(position.y / this.gridCellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Get nearby cell keys (3x3 grid around position)
   */
  private getNearbyCells(position: XYPosition): string[] {
    const cellX = Math.floor(position.x / this.gridCellSize);
    const cellY = Math.floor(position.y / this.gridCellSize);
    const cells: string[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        cells.push(`${cellX + dx},${cellY + dy}`);
      }
    }

    return cells;
  }

  /**
   * Calculate snap position with magnetic behavior
   */
  public calculateSnapPosition(
    currentPosition: XYPosition,
    targetPoint: ConnectionPoint
  ): XYPosition {
    if (!this.config.enableMagneticSnap) {
      return currentPosition;
    }

    const distance = this.calculateDistance(
      currentPosition,
      targetPoint.worldPosition
    );

    // Linear interpolation for smooth magnetic snap
    const snapStrength = Math.max(
      0,
      1 - distance / this.config.snapDistance
    );

    return {
      x:
        currentPosition.x +
        (targetPoint.worldPosition.x - currentPosition.x) * snapStrength,
      y:
        currentPosition.y +
        (targetPoint.worldPosition.y - currentPosition.y) * snapStrength,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AutoConnectorConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
