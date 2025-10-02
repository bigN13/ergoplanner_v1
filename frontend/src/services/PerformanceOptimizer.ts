/**
 * Performance Optimization and Rendering System
 * Optimizes rendering for 1000+ symbols maintaining 60fps
 *
 * MVP Features:
 * - Performance monitoring (FPS, memory, render time)
 * - RAF batching for smooth rendering
 * - Progressive loading with Intersection Observer
 * - Adaptive quality settings
 * - Memory usage tracking
 *
 * Deferred features (future implementation):
 * - WebGL/Pixi.js rendering
 * - Symbol instancing
 * - Web Workers
 * - Memory pooling
 * - LOD system
 * - Texture atlasing
 */

/**
 * Performance metrics
 */
export interface IPerformanceMetrics {
  fps: number;
  avgFrameTime: number; // ms
  maxFrameTime: number; // ms
  memoryUsage: number; // MB
  renderTime: number; // ms
  symbolCount: number;
  visibleSymbolCount: number;
  timestamp: number;
}

/**
 * Quality settings for adaptive performance
 */
export enum QualityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  AUTO = 'auto',
}

/**
 * Quality configuration
 */
export interface IQualityConfig {
  level: QualityLevel;
  shadowsEnabled: boolean;
  antialiasing: boolean;
  complexSymbols: boolean;
  maxSymbolsToRender: number;
}

/**
 * RAF batch task
 */
export type RAFCallback = (timestamp: number) => void;

/**
 * Intersection Observer configuration
 */
export interface IIntersectionConfig {
  rootMargin?: string; // Default: '200px' for buffer
  threshold?: number | number[]; // Default: 0.1
}

/**
 * Performance Monitor
 * Tracks FPS, memory, and render performance
 */
export class PerformanceMonitor {
  private frames: number[] = [];
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private metricsCallbacks: ((metrics: IPerformanceMetrics) => void)[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private symbolCount = 0;
  private visibleSymbolCount = 0;
  private renderTime = 0;

  /**
   * Start performance monitoring
   */
  start(updateInterval = 1000): void {
    this.lastFrameTime = performance.now();
    this.monitoringInterval = setInterval(() => {
      this.calculateMetrics();
    }, updateInterval);
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Record a frame
   */
  recordFrame(timestamp: number): void {
    const frameTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.frameTimes.push(frameTime);
    this.frames.push(timestamp);

    // Keep only last 60 frames
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
      this.frames.shift();
    }
  }

  /**
   * Record render time
   */
  recordRenderTime(time: number): void {
    this.renderTime = time;
  }

  /**
   * Update symbol counts
   */
  updateSymbolCounts(total: number, visible: number): void {
    this.symbolCount = total;
    this.visibleSymbolCount = visible;
  }

  /**
   * Calculate current metrics
   */
  private calculateMetrics(): void {
    if (this.frameTimes.length === 0) return;

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const maxFrameTime = Math.max(...this.frameTimes);
    const fps = 1000 / avgFrameTime;

    // Get memory usage if available
    let memoryUsage = 0;
    if ('memory' in performance && (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory) {
      const perfMemory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
      memoryUsage = perfMemory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }

    const metrics: IPerformanceMetrics = {
      fps: Math.round(fps),
      avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      renderTime: this.renderTime,
      symbolCount: this.symbolCount,
      visibleSymbolCount: this.visibleSymbolCount,
      timestamp: Date.now(),
    };

    this.notifyMetricsCallbacks(metrics);
  }

  /**
   * Subscribe to metrics updates
   */
  onMetricsUpdate(callback: (metrics: IPerformanceMetrics) => void): () => void {
    this.metricsCallbacks.push(callback);
    return () => {
      const index = this.metricsCallbacks.indexOf(callback);
      if (index !== -1) {
        this.metricsCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all metrics callbacks
   */
  private notifyMetricsCallbacks(metrics: IPerformanceMetrics): void {
    this.metricsCallbacks.forEach(cb => cb(metrics));
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return Math.round(1000 / avgFrameTime);
  }

  /**
   * Check if performance is acceptable (>= 30 FPS)
   */
  isPerformanceAcceptable(): boolean {
    return this.getCurrentFPS() >= 30;
  }
}

/**
 * Request Animation Frame Batcher
 * Batches multiple render requests into single RAF cycle
 */
export class RAFBatcher {
  private rafId: number | null = null;
  private callbacks: Set<RAFCallback> = new Set();
  private isRunning = false;

  /**
   * Schedule a callback for next frame
   */
  schedule(callback: RAFCallback): () => void {
    this.callbacks.add(callback);

    if (!this.isRunning) {
      this.startBatching();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Start RAF batching
   */
  private startBatching(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.runBatch();
  }

  /**
   * Run batch of callbacks
   */
  private runBatch(): void {
    this.rafId = requestAnimationFrame((timestamp) => {
      // Execute all callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(timestamp);
        } catch (error) {
          console.error('RAF callback error:', error);
        }
      });

      // Continue batching if there are callbacks
      if (this.callbacks.size > 0) {
        this.runBatch();
      } else {
        this.isRunning = false;
      }
    });
  }

  /**
   * Stop batching
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
    this.callbacks.clear();
  }

  /**
   * Get number of scheduled callbacks
   */
  getCallbackCount(): number {
    return this.callbacks.size;
  }
}

/**
 * Progressive Loading Manager
 * Uses Intersection Observer for lazy loading
 */
export class ProgressiveLoadingManager {
  private observer: IntersectionObserver | null = null;
  private loadCallbacks: Map<Element, () => void> = new Map();
  private config: IIntersectionConfig;

  constructor(config: IIntersectionConfig = {}) {
    this.config = {
      rootMargin: config.rootMargin || '200px',
      threshold: config.threshold || 0.1,
    };

    this.initializeObserver();
  }

  /**
   * Initialize Intersection Observer
   */
  private initializeObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const callback = this.loadCallbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold,
      }
    );
  }

  /**
   * Observe an element for progressive loading
   */
  observe(element: Element, onLoad: () => void): void {
    if (!this.observer) {
      // Fallback: load immediately if IntersectionObserver not supported
      onLoad();
      return;
    }

    this.loadCallbacks.set(element, onLoad);
    this.observer.observe(element);
  }

  /**
   * Unobserve an element
   */
  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.loadCallbacks.delete(element);
  }

  /**
   * Disconnect observer
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadCallbacks.clear();
  }
}

/**
 * Adaptive Quality Manager
 * Automatically adjusts quality based on performance
 */
export class AdaptiveQualityManager {
  private currentQuality: QualityLevel = QualityLevel.HIGH;
  private performanceMonitor: PerformanceMonitor;
  private autoAdjustEnabled = false;
  private adjustmentInterval: NodeJS.Timeout | null = null;

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
  }

  /**
   * Get quality configuration for current level
   */
  getQualityConfig(): IQualityConfig {
    switch (this.currentQuality) {
      case QualityLevel.LOW:
        return {
          level: QualityLevel.LOW,
          shadowsEnabled: false,
          antialiasing: false,
          complexSymbols: false,
          maxSymbolsToRender: 500,
        };

      case QualityLevel.MEDIUM:
        return {
          level: QualityLevel.MEDIUM,
          shadowsEnabled: false,
          antialiasing: true,
          complexSymbols: true,
          maxSymbolsToRender: 1000,
        };

      case QualityLevel.HIGH:
        return {
          level: QualityLevel.HIGH,
          shadowsEnabled: true,
          antialiasing: true,
          complexSymbols: true,
          maxSymbolsToRender: 2000,
        };

      case QualityLevel.AUTO:
        return this.getQualityConfig(); // Returns current quality config

      default:
        return this.getQualityConfig();
    }
  }

  /**
   * Set quality level
   */
  setQuality(level: QualityLevel): void {
    if (level === QualityLevel.AUTO) {
      this.enableAutoAdjust();
    } else {
      this.disableAutoAdjust();
      this.currentQuality = level;
    }
  }

  /**
   * Get current quality level
   */
  getCurrentQuality(): QualityLevel {
    return this.currentQuality;
  }

  /**
   * Enable auto quality adjustment
   */
  enableAutoAdjust(): void {
    if (this.autoAdjustEnabled) return;

    this.autoAdjustEnabled = true;
    this.adjustmentInterval = setInterval(() => {
      this.adjustQualityBasedOnPerformance();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Disable auto quality adjustment
   */
  disableAutoAdjust(): void {
    this.autoAdjustEnabled = false;
    if (this.adjustmentInterval) {
      clearInterval(this.adjustmentInterval);
      this.adjustmentInterval = null;
    }
  }

  /**
   * Adjust quality based on current performance
   */
  private adjustQualityBasedOnPerformance(): void {
    const fps = this.performanceMonitor.getCurrentFPS();

    // Decrease quality if FPS drops below 40
    if (fps < 40 && this.currentQuality !== QualityLevel.LOW) {
      if (this.currentQuality === QualityLevel.HIGH) {
        this.currentQuality = QualityLevel.MEDIUM;
      } else if (this.currentQuality === QualityLevel.MEDIUM) {
        this.currentQuality = QualityLevel.LOW;
      }
      console.warn(`Performance degraded (${fps} FPS). Quality reduced to ${this.currentQuality}`);
    }

    // Increase quality if FPS is consistently high
    if (fps >= 55 && this.currentQuality !== QualityLevel.HIGH) {
      if (this.currentQuality === QualityLevel.LOW) {
        this.currentQuality = QualityLevel.MEDIUM;
      } else if (this.currentQuality === QualityLevel.MEDIUM) {
        this.currentQuality = QualityLevel.HIGH;
      }
      console.warn(`Performance improved (${fps} FPS). Quality increased to ${this.currentQuality}`);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disableAutoAdjust();
  }
}

/**
 * Performance Optimizer
 * Main class coordinating all performance features
 */
export class PerformanceOptimizer {
  public performanceMonitor: PerformanceMonitor;
  public rafBatcher: RAFBatcher;
  public progressiveLoader: ProgressiveLoadingManager;
  public qualityManager: AdaptiveQualityManager;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.rafBatcher = new RAFBatcher();
    this.progressiveLoader = new ProgressiveLoadingManager();
    this.qualityManager = new AdaptiveQualityManager(this.performanceMonitor);
  }

  /**
   * Initialize optimizer
   */
  initialize(options: {
    monitoringEnabled?: boolean;
    autoQualityEnabled?: boolean;
    monitoringInterval?: number;
  } = {}): void {
    const {
      monitoringEnabled = true,
      autoQualityEnabled = false,
      monitoringInterval = 1000,
    } = options;

    if (monitoringEnabled) {
      this.performanceMonitor.start(monitoringInterval);
    }

    if (autoQualityEnabled) {
      this.qualityManager.enableAutoAdjust();
    }
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    this.performanceMonitor.stop();
    this.rafBatcher.stop();
    this.progressiveLoader.disconnect();
    this.qualityManager.destroy();
  }

  /**
   * Get current performance status
   */
  getPerformanceStatus(): {
    fps: number;
    isAcceptable: boolean;
    quality: QualityLevel;
  } {
    return {
      fps: this.performanceMonitor.getCurrentFPS(),
      isAcceptable: this.performanceMonitor.isPerformanceAcceptable(),
      quality: this.qualityManager.getCurrentQuality(),
    };
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

export default PerformanceOptimizer;
