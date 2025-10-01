import { Edge, Node, XYPosition } from 'reactflow';
import {
  ConnectionPoint,
  ConnectionPreview,
  AutoConnectorConfig,
} from '@/types/connection';
import { ConnectionDetector } from './ConnectionDetector';
import { ConnectionValidator } from './ConnectionValidator';

/**
 * Auto-connector service for intelligent connection creation
 * Manages the entire connection workflow from detection to creation
 */
export class AutoConnector {
  private detector: ConnectionDetector;
  private validator: ConnectionValidator;
  private config: AutoConnectorConfig;

  constructor(config: AutoConnectorConfig) {
    this.config = config;
    this.detector = new ConnectionDetector(config);
    this.validator = new ConnectionValidator(
      ConnectionValidator.getDefaultCompatibilityRules()
    );
  }

  /**
   * Initialize with connection points from nodes
   */
  public indexConnectionPoints(connectionPoints: ConnectionPoint[]): void {
    this.detector.indexConnectionPoints(connectionPoints);
  }

  /**
   * Start creating a connection from a source point
   */
  public startConnection(
    sourcePoint: ConnectionPoint,
    cursorPosition: XYPosition
  ): ConnectionPreview {
    return {
      sourcePoint,
      cursorPosition,
      isValid: false,
    };
  }

  /**
   * Update connection preview as cursor moves
   */
  public updateConnectionPreview(
    preview: ConnectionPreview,
    cursorPosition: XYPosition
  ): ConnectionPreview {
    // Detect nearby connection points
    const detection = this.detector.detectNearbyPoints(
      cursorPosition,
      preview.sourcePoint
    );

    const updatedPreview: ConnectionPreview = {
      ...preview,
      cursorPosition,
      targetPoint: detection.closestPoint,
      isValid: false,
    };

    // Validate if target point found
    if (detection.closestPoint) {
      const validation = this.validator.validateConnection(
        preview.sourcePoint,
        detection.closestPoint
      );

      updatedPreview.isValid = validation.isValid;

      // Apply magnetic snap if valid
      if (validation.isValid && this.config.enableMagneticSnap) {
        const snapPosition = this.detector.calculateSnapPosition(
          cursorPosition,
          detection.closestPoint
        );
        updatedPreview.cursorPosition = snapPosition;
      }
    } else {
      updatedPreview.isValid = false;
    }

    // Generate preview path if enabled
    if (this.config.enablePreview) {
      updatedPreview.path = this.generatePreviewPath(updatedPreview);
    }

    return updatedPreview;
  }

  /**
   * Complete connection and create edge
   */
  public completeConnection(
    preview: ConnectionPreview,
    _nodes: Node[],
    _edges: Edge[]
  ): Edge | null {
    if (!preview.targetPoint || !preview.isValid) {
      return null;
    }

    // Validate one more time
    const validation = this.validator.validateConnection(
      preview.sourcePoint,
      preview.targetPoint
    );

    if (!validation.isValid) {
      return null;
    }

    // Create new edge
    const newEdge: Edge = {
      id: `e-${preview.sourcePoint.id}-${preview.targetPoint.id}`,
      source: preview.sourcePoint.nodeId,
      target: preview.targetPoint.nodeId,
      sourceHandle: preview.sourcePoint.id,
      targetHandle: preview.targetPoint.id,
      type: this.config.enableAutoRouting ? 'smoothstep' : 'default',
      animated: false,
      style: {
        stroke: '#2563eb',
        strokeWidth: 2,
      },
      data: {
        sourcePointType: preview.sourcePoint.type,
        targetPointType: preview.targetPoint.type,
        createdAt: new Date().toISOString(),
      },
    };

    return newEdge;
  }

  /**
   * Generate SVG path for connection preview
   */
  private generatePreviewPath(preview: ConnectionPreview): string {
    const start = preview.sourcePoint.worldPosition;
    const end = preview.targetPoint?.worldPosition || preview.cursorPosition;

    // Simple straight line for preview (future: use smart routing)
    return `M ${start.x},${start.y} L ${end.x},${end.y}`;
  }

  /**
   * Cancel active connection
   */
  public cancelConnection(): void {
    // No state stored in service, handled by calling code
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AutoConnectorConfig>): void {
    this.config = { ...this.config, ...config };
    this.detector.updateConfig(this.config);
  }

  /**
   * Get default configuration
   */
  public static getDefaultConfig(): AutoConnectorConfig {
    return {
      snapDistance: 20,
      enableMagneticSnap: true,
      enablePreview: true,
      enableAutoRouting: true,
      gridSize: 10,
    };
  }
}
