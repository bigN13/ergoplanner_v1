/**
 * Minimap Level of Detail (LOD) System
 *
 * Adaptive rendering system that adjusts element detail based on:
 * - Total element count in viewport
 * - Zoom level
 * - Element size on screen
 *
 * Three LOD levels:
 * - Simplified: For 1000+ elements (shapes only, no text)
 * - Normal: For 100-1000 elements (shapes with labels)
 * - Detailed: For <100 elements (full rendering with all details)
 */

import type { Node, Edge } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export enum LODLevel {
  Simplified = 'simplified',
  Normal = 'normal',
  Detailed = 'detailed',
}

export interface LODConfig {
  simplifiedThreshold: number;
  normalThreshold: number;
  minElementSize: number; // Minimum size to render (pixels)
  textVisibilityThreshold: number; // Minimum size to show text
  enableAdaptive: boolean;
}

export interface RenderElement {
  id: string;
  type: 'node' | 'edge';
  bounds: { x: number; y: number; width: number; height: number };
  lodLevel: LODLevel;
  data: any;
}

export interface LODStats {
  totalElements: number;
  visibleElements: number;
  simplifiedCount: number;
  normalCount: number;
  detailedCount: number;
  currentLevel: LODLevel;
  renderTime: number;
}

// ============================================================================
// LOD Manager
// ============================================================================

export class LODManager {
  private config: LODConfig;
  private stats: LODStats;

  constructor(config: Partial<LODConfig> = {}) {
    this.config = {
      simplifiedThreshold: 1000,
      normalThreshold: 100,
      minElementSize: 2, // pixels
      textVisibilityThreshold: 20, // pixels
      enableAdaptive: true,
      ...config,
    };

    this.stats = {
      totalElements: 0,
      visibleElements: 0,
      simplifiedCount: 0,
      normalCount: 0,
      detailedCount: 0,
      currentLevel: LODLevel.Detailed,
      renderTime: 0,
    };
  }

  /**
   * Determine LOD level based on element count
   */
  determineLODLevel(visibleElementCount: number): LODLevel {
    if (visibleElementCount >= this.config.simplifiedThreshold) {
      return LODLevel.Simplified;
    } else if (visibleElementCount >= this.config.normalThreshold) {
      return LODLevel.Normal;
    } else {
      return LODLevel.Detailed;
    }
  }

  /**
   * Calculate element LOD based on size and global level
   */
  calculateElementLOD(
    elementSize: { width: number; height: number },
    globalLevel: LODLevel,
    zoom: number
  ): LODLevel {
    if (!this.config.enableAdaptive) {
      return globalLevel;
    }

    // Calculate screen size
    const screenWidth = elementSize.width * zoom;
    const screenHeight = elementSize.height * zoom;
    const screenSize = Math.max(screenWidth, screenHeight);

    // If element is too small, use simplified
    if (screenSize < this.config.minElementSize) {
      return LODLevel.Simplified;
    }

    // If element is small, cap at normal level
    if (screenSize < this.config.textVisibilityThreshold) {
      return globalLevel === LODLevel.Detailed ? LODLevel.Normal : globalLevel;
    }

    // Use global level for larger elements
    return globalLevel;
  }

  /**
   * Prepare render elements with LOD assignments
   */
  prepareRenderElements(
    nodes: Node[],
    edges: Edge[],
    viewport: { x: number; y: number; width: number; height: number; zoom: number }
  ): RenderElement[] {
    const startTime = performance.now();
    const renderElements: RenderElement[] = [];

    // Calculate visible bounds with padding
    const padding = 100;
    const visibleBounds = {
      x: viewport.x - padding,
      y: viewport.y - padding,
      width: viewport.width + padding * 2,
      height: viewport.height + padding * 2,
    };

    // Filter visible nodes
    const visibleNodes = nodes.filter((node) => {
      const bounds = this.getNodeBounds(node);
      return this.intersects(bounds, visibleBounds);
    });

    // Filter visible edges
    const visibleEdges = edges.filter((edge) => {
      const bounds = this.getEdgeBounds(edge, nodes);
      return this.intersects(bounds, visibleBounds);
    });

    const visibleCount = visibleNodes.length + visibleEdges.length;
    const globalLevel = this.determineLODLevel(visibleCount);

    // Process nodes
    let simplifiedCount = 0;
    let normalCount = 0;
    let detailedCount = 0;

    for (const node of visibleNodes) {
      const bounds = this.getNodeBounds(node);
      const elementSize = { width: bounds.width, height: bounds.height };
      const lodLevel = this.calculateElementLOD(elementSize, globalLevel, viewport.zoom);

      renderElements.push({
        id: node.id,
        type: 'node',
        bounds,
        lodLevel,
        data: node.data,
      });

      if (lodLevel === LODLevel.Simplified) simplifiedCount++;
      else if (lodLevel === LODLevel.Normal) normalCount++;
      else detailedCount++;
    }

    // Process edges (always simplified or normal)
    for (const edge of visibleEdges) {
      const bounds = this.getEdgeBounds(edge, nodes);
      const lodLevel = globalLevel === LODLevel.Detailed ? LODLevel.Normal : globalLevel;

      renderElements.push({
        id: edge.id,
        type: 'edge',
        bounds,
        lodLevel,
        data: edge.data,
      });

      if (lodLevel === LODLevel.Simplified) simplifiedCount++;
      else normalCount++;
    }

    const renderTime = performance.now() - startTime;

    // Update stats
    this.stats = {
      totalElements: nodes.length + edges.length,
      visibleElements: visibleCount,
      simplifiedCount,
      normalCount,
      detailedCount,
      currentLevel: globalLevel,
      renderTime,
    };

    return renderElements;
  }

  /**
   * Get current LOD statistics
   */
  getStats(): LODStats {
    return { ...this.stats };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LODConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // Rendering Functions by LOD Level
  // ============================================================================

  /**
   * Render node at simplified level
   */
  renderSimplifiedNode(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    element: RenderElement,
    scale: number
  ): void {
    const { bounds } = element;
    const x = bounds.x * scale;
    const y = bounds.y * scale;
    const width = bounds.width * scale;
    const height = bounds.height * scale;

    // Simple filled rectangle
    ctx.fillStyle = this.getNodeColor(element.data.type || 'default');
    ctx.fillRect(x, y, width, height);
  }

  /**
   * Render node at normal level
   */
  renderNormalNode(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    element: RenderElement,
    scale: number
  ): void {
    const { bounds, data } = element;
    const x = bounds.x * scale;
    const y = bounds.y * scale;
    const width = bounds.width * scale;
    const height = bounds.height * scale;

    // Filled rectangle with border
    ctx.fillStyle = this.getNodeColor(data.type || 'default');
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Label if space permits
    if (width > 30 && height > 20 && data.label) {
      ctx.fillStyle = '#000';
      ctx.font = `${10 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Truncate text if too long
      const maxWidth = width - 4;
      let text = data.label;
      if (ctx.measureText(text).width > maxWidth) {
        text = `${text.substring(0, 8)  }...`;
      }

      ctx.fillText(text, x + width / 2, y + height / 2);
    }
  }

  /**
   * Render node at detailed level
   */
  renderDetailedNode(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    element: RenderElement,
    scale: number
  ): void {
    const { bounds, data } = element;
    const x = bounds.x * scale;
    const y = bounds.y * scale;
    const width = bounds.width * scale;
    const height = bounds.height * scale;

    // Gradient fill
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    const baseColor = this.getNodeColor(data.type || 'default');
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, this.darkenColor(baseColor, 20));

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Border with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4 * scale;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur = 0;

    // Icon or symbol
    if (data.icon) {
      ctx.fillStyle = '#fff';
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(data.icon, x + 4 * scale, y + 4 * scale);
    }

    // Label
    if (data.label) {
      ctx.fillStyle = '#000';
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.label, x + width / 2, y + height / 2);
    }

    // Status indicator
    if (data.status) {
      const statusColor = this.getStatusColor(data.status);
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x + width - 6 * scale, y + 6 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render edge
   */
  renderEdge(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    element: RenderElement,
    scale: number,
    detailed: boolean = false
  ): void {
    const { data } = element;

    if (!data.source || !data.target) return;

    const sourcePos = { x: data.sourceX * scale, y: data.sourceY * scale };
    const targetPos = { x: data.targetX * scale, y: data.targetY * scale };

    ctx.strokeStyle = data.animated ? '#2196F3' : '#999';
    ctx.lineWidth = detailed ? 2 * scale : 1;

    ctx.beginPath();
    ctx.moveTo(sourcePos.x, sourcePos.y);

    if (detailed && data.path) {
      // Bezier curve for detailed
      const controlPoint1 = { x: (sourcePos.x + targetPos.x) / 2, y: sourcePos.y };
      const controlPoint2 = { x: (sourcePos.x + targetPos.x) / 2, y: targetPos.y };
      ctx.bezierCurveTo(
        controlPoint1.x,
        controlPoint1.y,
        controlPoint2.x,
        controlPoint2.y,
        targetPos.x,
        targetPos.y
      );
    } else {
      // Straight line for simplified
      ctx.lineTo(targetPos.x, targetPos.y);
    }

    ctx.stroke();
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getNodeBounds(node: Node): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: node.position.x,
      y: node.position.y,
      width: (node.width as number) || 100,
      height: (node.height as number) || 80,
    };
  }

  private getEdgeBounds(
    edge: Edge,
    nodes: Node[]
  ): { x: number; y: number; width: number; height: number } {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const x1 = sourceNode.position.x;
    const y1 = sourceNode.position.y;
    const x2 = targetNode.position.x;
    const y2 = targetNode.position.y;

    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  }

  private intersects(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      a.x > b.x + b.width ||
      a.x + a.width < b.x ||
      a.y > b.y + b.height ||
      a.y + a.height < b.y
    );
  }

  private getNodeColor(type: string): string {
    const colors: Record<string, string> = {
      default: '#E3F2FD',
      pump: '#BBDEFB',
      valve: '#90CAF9',
      tank: '#64B5F6',
      pipe: '#42A5F5',
      instrument: '#2196F3',
      equipment: '#1E88E5',
    };

    return colors[type] || colors.default;
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: '#4CAF50',
      inactive: '#9E9E9E',
      warning: '#FF9800',
      error: '#F44336',
    };

    return colors[status] || colors.inactive;
  }

  private darkenColor(color: string, percent: number): string {
    // Simple color darkening (assumes hex color)
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;

    return (
      `#${ 
      (
        0x1000000 +
        (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 0 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)}`
    );
  }
}

// ============================================================================
// LOD Utilities
// ============================================================================

/**
 * Calculate recommended LOD thresholds based on device capabilities
 */
export function calculateRecommendedThresholds(): {
  simplifiedThreshold: number;
  normalThreshold: number;
} {
  // Check device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Check available memory (if supported)
  const memory = (performance as any).memory?.jsHeapSizeLimit || 2000000000;

  // Check CPU cores
  const cores = navigator.hardwareConcurrency || 4;

  // Calculate thresholds based on capabilities
  let simplifiedThreshold = 1000;
  let normalThreshold = 100;

  if (dpr > 2) {
    // High DPI displays can handle more detail
    simplifiedThreshold = 1500;
    normalThreshold = 150;
  }

  if (memory > 4000000000) {
    // More memory = higher thresholds
    simplifiedThreshold *= 1.5;
    normalThreshold *= 1.5;
  }

  if (cores > 4) {
    // More cores = better performance
    simplifiedThreshold *= 1.2;
    normalThreshold *= 1.2;
  }

  return {
    simplifiedThreshold: Math.round(simplifiedThreshold),
    normalThreshold: Math.round(normalThreshold),
  };
}
