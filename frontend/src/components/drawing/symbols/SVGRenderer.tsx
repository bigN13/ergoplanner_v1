import React, { memo, useMemo, useRef, useEffect } from 'react';
import { useViewport } from 'reactflow';

/**
 * SVG rendering options for performance optimization
 */
export interface ISVGRenderOptions {
  // Performance settings
  enableCaching?: boolean;
  enableVirtualization?: boolean;
  enableLOD?: boolean; // Level of Detail
  targetFPS?: number;
  maxRenderBatch?: number;

  // Quality settings
  antialiasing?: boolean;
  preserveAspectRatio?: boolean;
  vectorEffect?: 'none' | 'non-scaling-stroke';

  // Optimization thresholds
  lodHighThreshold?: number;
  lodMediumThreshold?: number;
  lodLowThreshold?: number;
  cullingMargin?: number;
}

/**
 * SVG path optimization utilities
 */
export class SVGPathOptimizer {
  /**
   * Simplify SVG path using Douglas-Peucker algorithm
   */
  public static simplifyPath(path: string, tolerance: number = 1): string {
    // Parse path to points
    const points = this.parsePathToPoints(path);
    if (points.length < 3) return path;

    // Apply Douglas-Peucker simplification
    const simplified = this.douglasPeucker(points, tolerance);

    // Convert back to path
    return this.pointsToPath(simplified);
  }

  /**
   * Parse SVG path to array of points
   */
  private static parsePathToPoints(path: string): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    const commands = path.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);

    if (!commands) return points;

    let currentX = 0;
    let currentY = 0;

    commands.forEach((cmd) => {
      const type = cmd[0];
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      switch (type.toUpperCase()) {
        case 'M':
        case 'L':
          currentX = type === type.toUpperCase() ? coords[0] : currentX + coords[0];
          currentY = type === type.toUpperCase() ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        case 'H':
          currentX = type === type.toUpperCase() ? coords[0] : currentX + coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        case 'V':
          currentY = type === type.toUpperCase() ? coords[0] : currentY + coords[0];
          points.push({ x: currentX, y: currentY });
          break;
      }
    });

    return points;
  }

  /**
   * Douglas-Peucker line simplification algorithm
   */
  private static douglasPeucker(
    points: Array<{ x: number; y: number }>,
    tolerance: number
  ): Array<{ x: number; y: number }> {
    if (points.length <= 2) return points;

    let maxDistance = 0;
    let maxIndex = 0;

    // Find point with maximum distance from line
    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], points[0], points[points.length - 1]);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
      const right = this.douglasPeucker(points.slice(maxIndex), tolerance);
      return [...left.slice(0, -1), ...right];
    } else {
      return [points[0], points[points.length - 1]];
    }
  }

  /**
   * Calculate perpendicular distance from point to line
   */
  private static perpendicularDistance(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag === 0) {
      return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
    }

    const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);
    const closestPoint = {
      x: lineStart.x + u * dx,
      y: lineStart.y + u * dy,
    };

    return Math.sqrt((point.x - closestPoint.x) ** 2 + (point.y - closestPoint.y) ** 2);
  }

  /**
   * Convert points back to SVG path
   */
  private static pointsToPath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
  }
}

/**
 * Performance monitor for SVG rendering
 */
export class SVGPerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  private renderTime: number = 0;
  private symbolCount: number = 0;

  /**
   * Start frame measurement
   */
  public startFrame(): void {
    this.lastTime = performance.now();
  }

  /**
   * End frame measurement
   */
  public endFrame(symbolCount: number): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.renderTime = deltaTime;
    this.symbolCount = symbolCount;
    this.frameCount++;

    // Calculate FPS
    if (this.frameCount % 60 === 0) {
      this.fps = 1000 / deltaTime;
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): {
    fps: number;
    renderTime: number;
    symbolCount: number;
    averageSymbolTime: number;
  } {
    return {
      fps: this.fps,
      renderTime: this.renderTime,
      symbolCount: this.symbolCount,
      averageSymbolTime: this.symbolCount > 0 ? this.renderTime / this.symbolCount : 0,
    };
  }

  /**
   * Check if performance is below target
   */
  public isBelowTarget(targetFPS: number): boolean {
    return this.fps < targetFPS && this.fps > 0;
  }
}

/**
 * SVG symbol cache for performance
 */
export class SVGSymbolCache {
  private cache: Map<string, string> = new Map();
  private maxSize: number;
  private accessOrder: string[] = [];

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get cached SVG
   */
  public get(key: string): string | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Update access order (LRU)
      this.updateAccessOrder(key);
    }
    return value;
  }

  /**
   * Set cached SVG
   */
  public set(key: string, value: string): void {
    // Check if we need to evict
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, value);
    this.updateAccessOrder(key);
  }

  /**
   * Clear cache
   */
  public clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lru = this.accessOrder.shift();
      if (lru) {
        this.cache.delete(lru);
      }
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate rate
    };
  }
}

/**
 * Props for optimized SVG renderer component
 */
export interface IOptimizedSVGRendererProps {
  svgContent: string | (() => React.ReactElement);
  width: number;
  height: number;
  id: string;
  options?: ISVGRenderOptions;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Optimized SVG renderer component
 */
export const OptimizedSVGRenderer = memo<IOptimizedSVGRendererProps>(
  ({ svgContent, width, height, id, options = {}, className, style }) => {
    const viewport = useViewport();
    const svgRef = useRef<SVGSVGElement>(null);
    const cacheRef = useRef(new SVGSymbolCache());
    const performanceRef = useRef(new SVGPerformanceMonitor());

    // Default options
    const renderOptions = useMemo(
      () => ({
        enableCaching: true,
        enableLOD: true,
        targetFPS: 60,
        lodHighThreshold: 1.5,
        lodMediumThreshold: 0.75,
        lodLowThreshold: 0.3,
        vectorEffect: 'non-scaling-stroke' as const,
        ...options,
      }),
      [options]
    );

    // Determine level of detail
    const levelOfDetail = useMemo(() => {
      if (!renderOptions.enableLOD) return 'high';

      const zoom = viewport.zoom;
      if (zoom >= renderOptions.lodHighThreshold!) {
        return 'high';
      } else if (zoom >= renderOptions.lodMediumThreshold!) {
        return 'medium';
      } else if (zoom >= renderOptions.lodLowThreshold!) {
        return 'low';
      }
      return 'minimal';
    }, [viewport.zoom, renderOptions]);

    // Get optimized SVG content
    const optimizedContent = useMemo(() => {
      performanceRef.current.startFrame();

      // Check cache if enabled
      if (renderOptions.enableCaching) {
        const cacheKey = `${id}-${levelOfDetail}`;
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          performanceRef.current.endFrame(1);
          return cached;
        }
      }

      // Generate content based on LOD
      let content: string;
      if (typeof svgContent === 'function') {
        const element = svgContent();
        content = 'SVG_FUNCTION_CONTENT'; // Placeholder for function content
      } else {
        content = svgContent;

        // Apply path simplification based on LOD
        if (levelOfDetail === 'low' || levelOfDetail === 'minimal') {
          const tolerance = levelOfDetail === 'minimal' ? 3 : 1.5;
          content = content.replace(
            /d="([^"]*)"/g,
            (match, path) => `d="${SVGPathOptimizer.simplifyPath(path, tolerance)}"`
          );
        }
      }

      // Cache the result
      if (renderOptions.enableCaching) {
        const cacheKey = `${id}-${levelOfDetail}`;
        cacheRef.current.set(cacheKey, content);
      }

      performanceRef.current.endFrame(1);
      return content;
    }, [svgContent, levelOfDetail, id, renderOptions.enableCaching]);

    // Monitor performance
    useEffect(() => {
      const metrics = performanceRef.current.getMetrics();
      if (renderOptions.targetFPS && performanceRef.current.isBelowTarget(renderOptions.targetFPS)) {
        console.warn(`SVG rendering below target FPS: ${metrics.fps.toFixed(2)}`);
      }
    }, [optimizedContent, renderOptions.targetFPS]);

    // Render based on content type
    if (typeof svgContent === 'function') {
      return (
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className={className}
          style={style}
          data-lod={levelOfDetail}
        >
          {svgContent()}
        </svg>
      );
    }

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={className}
        style={style}
        data-lod={levelOfDetail}
        dangerouslySetInnerHTML={{ __html: optimizedContent }}
      />
    );
  }
);

OptimizedSVGRenderer.displayName = 'OptimizedSVGRenderer';

export default OptimizedSVGRenderer;