/**
 * React Hook for Connection Auto-Snap with Intelligent Proximity Detection
 *
 * Provides auto-snap functionality for connecting nodes with visual feedback
 * and validation. Uses KD-tree algorithm for efficient nearest neighbor search.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Node, Edge, XYPosition } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ConnectionPoint {
  id: string;
  type: string;
  x: number;
  y: number;
  direction: number;
  size: string;
  pressureRating?: string;
  serviceType?: string;
  material?: string;
  temperatureRating?: number;
  flowDirection: 'inlet' | 'outlet' | 'bidirectional';
  snapThreshold: number;
  connectionStrength: number;
  isOccupied: boolean;
  maxConnections: number;
  sizeTolerance: number;
}

export interface SnapCandidate {
  nodeId: string;
  connectionPoint: ConnectionPoint;
  worldX: number;
  worldY: number;
  distance: number;
  snapScore: number;
  isValid: boolean;
  validationMessage?: string;
}

export interface SnapResult {
  candidate: SnapCandidate | null;
  snappedPosition: XYPosition | null;
  showSnapIndicator: boolean;
}

export interface UseConnectionAutoSnapOptions {
  nodes: Node[];
  snapThreshold?: number;
  enableAutoSnap?: boolean;
  showSnapIndicator?: boolean;
  onSnap?: (candidate: SnapCandidate) => void;
}

export interface UseConnectionAutoSnapReturn {
  findSnapCandidate: (position: XYPosition, sourceConnectionPoint?: ConnectionPoint) => SnapResult;
  isNearSnapPoint: (position: XYPosition) => boolean;
  getSnapIndicatorStyle: (candidate: SnapCandidate) => React.CSSProperties;
  snapToNearest: (position: XYPosition, sourceConnectionPoint?: ConnectionPoint) => XYPosition;
}

// ============================================================================
// KD-Tree Implementation for Spatial Indexing
// ============================================================================

interface KDNode {
  point: {
    nodeId: string;
    connectionPoint: ConnectionPoint;
    worldX: number;
    worldY: number;
  };
  axis: number;
  left?: KDNode;
  right?: KDNode;
}

class KDTree {
  private root: KDNode | null = null;

  constructor(points: Array<{ nodeId: string; connectionPoint: ConnectionPoint; worldX: number; worldY: number }>) {
    this.root = this.buildTree(points, 0);
  }

  private buildTree(
    points: Array<{ nodeId: string; connectionPoint: ConnectionPoint; worldX: number; worldY: number }>,
    depth: number
  ): KDNode | null {
    if (points.length === 0) return null;

    const axis = depth % 2; // 0 = x, 1 = y

    points.sort((a, b) => {
      const aValue = axis === 0 ? a.worldX : a.worldY;
      const bValue = axis === 0 ? b.worldX : b.worldY;
      return aValue - bValue;
    });

    const medianIndex = Math.floor(points.length / 2);
    const node: KDNode = {
      point: points[medianIndex],
      axis,
    };

    const leftPoints = points.slice(0, medianIndex);
    const rightPoints = points.slice(medianIndex + 1);

    node.left = this.buildTree(leftPoints, depth + 1);
    node.right = this.buildTree(rightPoints, depth + 1);

    return node;
  }

  findNearest(x: number, y: number, k: number = 1, maxDistance: number = Infinity): Array<{
    nodeId: string;
    connectionPoint: ConnectionPoint;
    worldX: number;
    worldY: number;
    distance: number;
  }> {
    const best: Array<{ point: any; distance: number }> = [];

    const search = (node: KDNode | null, depth: number) => {
      if (!node) return;

      const distance = Math.sqrt(
        Math.pow(node.point.worldX - x, 2) +
        Math.pow(node.point.worldY - y, 2)
      );

      if (distance <= maxDistance) {
        best.push({ point: node.point, distance });
        best.sort((a, b) => a.distance - b.distance);
        if (best.length > k) {
          best.pop();
        }
      }

      const axis = depth % 2;
      const diff = axis === 0 ? x - node.point.worldX : y - node.point.worldY;

      const first = diff < 0 ? node.left : node.right;
      const second = diff < 0 ? node.right : node.left;

      search(first, depth + 1);

      if (best.length < k || Math.abs(diff) < maxDistance) {
        search(second, depth + 1);
      }
    };

    search(this.root, 0);

    return best.map(b => ({ ...b.point, distance: b.distance }));
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useConnectionAutoSnap({
  nodes,
  snapThreshold = 10,
  enableAutoSnap = true,
  showSnapIndicator = true,
  onSnap,
}: UseConnectionAutoSnapOptions): UseConnectionAutoSnapReturn {

  const [spatialIndex, setSpatialIndex] = useState<KDTree | null>(null);
  const indexVersion = useRef(0);

  // Build/rebuild spatial index when nodes change
  useEffect(() => {
    if (!enableAutoSnap) return;

    const connectionPoints: Array<{
      nodeId: string;
      connectionPoint: ConnectionPoint;
      worldX: number;
      worldY: number;
    }> = [];

    nodes.forEach(node => {
      const nodeConnectionPoints = node.data?.connectionPoints as ConnectionPoint[] | undefined;
      if (nodeConnectionPoints && Array.isArray(nodeConnectionPoints)) {
        nodeConnectionPoints.forEach(cp => {
          connectionPoints.push({
            nodeId: node.id,
            connectionPoint: cp,
            worldX: node.position.x + cp.x,
            worldY: node.position.y + cp.y,
          });
        });
      }
    });

    if (connectionPoints.length > 0) {
      setSpatialIndex(new KDTree(connectionPoints));
      indexVersion.current++;
    }
  }, [nodes, enableAutoSnap]);

  /**
   * Calculate compatibility score between two connection points
   */
  const calculateCompatibility = useCallback((
    source: ConnectionPoint,
    target: ConnectionPoint
  ): { isValid: boolean; score: number; message: string } => {
    let score = 1.0;
    const issues: string[] = [];

    // Check if occupied
    if (target.isOccupied && target.maxConnections <= 1) {
      return { isValid: false, score: 0, message: 'Target connection point is occupied' };
    }

    // Check size compatibility
    if (source.size !== target.size && source.size !== 'Generic' && target.size !== 'Generic') {
      const sizeRatio = parseSizeToNumber(source.size) / parseSizeToNumber(target.size);
      if (Math.abs(sizeRatio - 1.0) > source.sizeTolerance) {
        issues.push('Size mismatch');
        score *= 0.7;
      } else {
        score *= 0.9;
      }
    }

    // Check service type
    if (source.serviceType && target.serviceType && source.serviceType !== target.serviceType) {
      issues.push('Service type mismatch');
      score *= 0.6;
    }

    // Check material
    if (source.material && target.material && source.material !== target.material) {
      issues.push('Material mismatch');
      score *= 0.9;
    }

    // Check flow direction
    if (!areFlowDirectionsCompatible(source.flowDirection, target.flowDirection)) {
      issues.push('Flow direction mismatch');
      score *= 0.8;
    }

    const isValid = score >= 0.7;
    const message = issues.length > 0 ? issues.join(', ') : 'Compatible connection';

    return { isValid, score, message };
  }, []);

  /**
   * Calculate snap score (lower is better)
   */
  const calculateSnapScore = useCallback((
    distance: number,
    sourcePoint: ConnectionPoint | undefined,
    targetPoint: ConnectionPoint
  ): number => {
    if (!sourcePoint) return distance;

    // Get compatibility score
    const compatibility = calculateCompatibility(sourcePoint, targetPoint);

    // Distance component (normalized to 0-1, lower is better)
    const distanceScore = distance / snapThreshold;

    // Direction alignment score
    const targetAngle = targetPoint.direction;
    const angleToTarget = Math.atan2(
      targetPoint.y - sourcePoint.y,
      targetPoint.x - sourcePoint.x
    ) * 180 / Math.PI;

    const angleDiff = Math.abs(normalizeAngle(angleToTarget) - normalizeAngle(targetAngle));
    const angleScore = angleDiff / 180; // 0-1, lower is better

    // Combined score (weighted)
    return (
      distanceScore * 0.4 +
      angleScore * 0.2 +
      (1.0 - compatibility.score) * 0.4
    );
  }, [calculateCompatibility, snapThreshold]);

  /**
   * Find snap candidate at given position
   */
  const findSnapCandidate = useCallback((
    position: XYPosition,
    sourceConnectionPoint?: ConnectionPoint
  ): SnapResult => {
    if (!enableAutoSnap || !spatialIndex) {
      return {
        candidate: null,
        snappedPosition: null,
        showSnapIndicator: false,
      };
    }

    const threshold = sourceConnectionPoint?.snapThreshold ?? snapThreshold;
    const nearest = spatialIndex.findNearest(position.x, position.y, 5, threshold);

    if (nearest.length === 0) {
      return {
        candidate: null,
        snappedPosition: null,
        showSnapIndicator: false,
      };
    }

    // Find best candidate
    let bestCandidate: SnapCandidate | null = null;
    let bestScore = Infinity;

    for (const point of nearest) {
      const snapScore = calculateSnapScore(
        point.distance,
        sourceConnectionPoint,
        point.connectionPoint
      );

      if (snapScore < bestScore) {
        const compatibility = sourceConnectionPoint
          ? calculateCompatibility(sourceConnectionPoint, point.connectionPoint)
          : { isValid: true, score: 1.0, message: 'No validation' };

        bestScore = snapScore;
        bestCandidate = {
          nodeId: point.nodeId,
          connectionPoint: point.connectionPoint,
          worldX: point.worldX,
          worldY: point.worldY,
          distance: point.distance,
          snapScore,
          isValid: compatibility.isValid,
          validationMessage: compatibility.message,
        };
      }
    }

    if (bestCandidate && bestCandidate.distance <= threshold) {
      onSnap?.(bestCandidate);

      return {
        candidate: bestCandidate,
        snappedPosition: {
          x: bestCandidate.worldX,
          y: bestCandidate.worldY,
        },
        showSnapIndicator,
      };
    }

    return {
      candidate: null,
      snappedPosition: null,
      showSnapIndicator: false,
    };
  }, [
    enableAutoSnap,
    spatialIndex,
    snapThreshold,
    showSnapIndicator,
    calculateSnapScore,
    calculateCompatibility,
    onSnap,
  ]);

  /**
   * Check if position is near any snap point
   */
  const isNearSnapPoint = useCallback((position: XYPosition): boolean => {
    const result = findSnapCandidate(position);
    return result.candidate !== null;
  }, [findSnapCandidate]);

  /**
   * Get CSS style for snap indicator
   */
  const getSnapIndicatorStyle = useCallback((candidate: SnapCandidate): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: candidate.worldX - 8,
      top: candidate.worldY - 8,
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: '2px solid',
      borderColor: candidate.isValid ? '#4CAF50' : '#FF9800',
      backgroundColor: candidate.isValid ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
      pointerEvents: 'none',
      zIndex: 1000,
      transition: 'all 0.15s ease-in-out',
      boxShadow: candidate.isValid
        ? '0 0 8px rgba(76, 175, 80, 0.6)'
        : '0 0 8px rgba(255, 152, 0, 0.6)',
    };

    return baseStyle;
  }, []);

  /**
   * Snap to nearest connection point
   */
  const snapToNearest = useCallback((
    position: XYPosition,
    sourceConnectionPoint?: ConnectionPoint
  ): XYPosition => {
    const result = findSnapCandidate(position, sourceConnectionPoint);
    return result.snappedPosition ?? position;
  }, [findSnapCandidate]);

  return useMemo(
    () => ({
      findSnapCandidate,
      isNearSnapPoint,
      getSnapIndicatorStyle,
      snapToNearest,
    }),
    [findSnapCandidate, isNearSnapPoint, getSnapIndicatorStyle, snapToNearest]
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseSizeToNumber(size: string): number {
  const cleaned = size.replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 1.0 : num;
}

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

function areFlowDirectionsCompatible(dir1: string, dir2: string): boolean {
  if (dir1 === 'bidirectional' || dir2 === 'bidirectional') return true;
  if (dir1 === 'inlet' && dir2 === 'outlet') return true;
  if (dir1 === 'outlet' && dir2 === 'inlet') return true;
  return dir1 === dir2;
}
