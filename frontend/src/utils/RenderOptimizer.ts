/**
 * Render Optimizer
 *
 * Advanced rendering optimizations:
 * - Dirty rectangle tracking for selective re-rendering
 * - Batch drawing operations
 * - Memory pooling for temporary objects
 * - Frame skipping during rapid navigation
 * - requestIdleCallback integration
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface DirtyRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderBatch {
  operations: RenderOperation[];
  priority: number;
  timestamp: number;
}

export type RenderOperation = {
  type: 'draw' | 'clear' | 'update';
  element: any;
  bounds: DirtyRectangle;
};

export interface RenderStats {
  frameTime: number;
  fps: number;
  skippedFrames: number;
  dirtyRectangles: number;
  batchedOperations: number;
  pooledObjects: number;
}

export interface OptimizerConfig {
  enableDirtyTracking?: boolean;
  enableBatching?: boolean;
  enablePooling?: boolean;
  enableFrameSkipping?: boolean;
  targetFPS?: number;
  maxBatchSize?: number;
  poolSize?: number;
}

// ============================================================================
// Memory Pool
// ============================================================================

class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize: number = 1000) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  getSize(): number {
    return this.pool.length;
  }
}

// ============================================================================
// Dirty Rectangle Tracker
// ============================================================================

export class DirtyRectangleTracker {
  private dirtyRegions: DirtyRectangle[] = [];
  private merged: DirtyRectangle | null = null;

  markDirty(rect: DirtyRectangle): void {
    this.dirtyRegions.push({ ...rect });
    this.merged = null; // Invalidate cached merge
  }

  markDirtyBounds(x: number, y: number, width: number, height: number): void {
    this.markDirty({ x, y, width, height });
  }

  getMergedDirtyRegion(): DirtyRectangle | null {
    if (this.dirtyRegions.length === 0) return null;

    if (this.merged) return this.merged;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const rect of this.dirtyRegions) {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }

    this.merged = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    return this.merged;
  }

  getDirtyRegions(): DirtyRectangle[] {
    return [...this.dirtyRegions];
  }

  clear(): void {
    this.dirtyRegions = [];
    this.merged = null;
  }

  hasDirtyRegions(): boolean {
    return this.dirtyRegions.length > 0;
  }

  intersects(rect: DirtyRectangle): boolean {
    for (const dirty of this.dirtyRegions) {
      if (rectanglesIntersect(rect, dirty)) {
        return true;
      }
    }
    return false;
  }
}

// ============================================================================
// Render Batch Manager
// ============================================================================

export class RenderBatchManager {
  private batches: Map<number, RenderBatch> = new Map();
  private maxBatchSize: number;
  private nextBatchId: number = 0;

  constructor(maxBatchSize: number = 100) {
    this.maxBatchSize = maxBatchSize;
  }

  createBatch(priority: number = 0): number {
    const batchId = this.nextBatchId++;
    this.batches.set(batchId, {
      operations: [],
      priority,
      timestamp: performance.now(),
    });
    return batchId;
  }

  addOperation(batchId: number, operation: RenderOperation): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    batch.operations.push(operation);

    // Auto-flush if batch is full
    if (batch.operations.length >= this.maxBatchSize) {
      this.flushBatch(batchId);
    }
  }

  flushBatch(batchId: number): RenderOperation[] {
    const batch = this.batches.get(batchId);
    if (!batch) return [];

    const {operations} = batch;
    this.batches.delete(batchId);
    return operations;
  }

  flushAllBatches(): RenderOperation[] {
    const sortedBatches = Array.from(this.batches.values()).sort(
      (a, b) => b.priority - a.priority
    );

    const allOperations: RenderOperation[] = [];
    for (const batch of sortedBatches) {
      allOperations.push(...batch.operations);
    }

    this.batches.clear();
    return allOperations;
  }

  getPendingOperationCount(): number {
    let count = 0;
    for (const batch of this.batches.values()) {
      count += batch.operations.length;
    }
    return count;
  }

  clear(): void {
    this.batches.clear();
  }
}

// ============================================================================
// Frame Skipper
// ============================================================================

export class FrameSkipper {
  private _targetFPS: number;
  private lastFrameTime: number = 0;
  private frameInterval: number;
  private skippedFrames: number = 0;

  constructor(targetFPS: number = 60) {
    this._targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
  }

  shouldSkipFrame(): boolean {
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed < this.frameInterval) {
      this.skippedFrames++;
      return true;
    }

    this.lastFrameTime = now;
    return false;
  }

  getSkippedFrameCount(): number {
    return this.skippedFrames;
  }

  resetSkippedFrameCount(): void {
    this.skippedFrames = 0;
  }

  setTargetFPS(fps: number): void {
    this._targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }
}

// ============================================================================
// Render Optimizer Main Class
// ============================================================================

export class RenderOptimizer {
  private config: Required<OptimizerConfig>;
  private dirtyTracker: DirtyRectangleTracker;
  private batchManager: RenderBatchManager;
  private frameSkipper: FrameSkipper;
  private stats: RenderStats;

  // Object pools
  private rectPool: ObjectPool<DirtyRectangle>;

  constructor(config: OptimizerConfig = {}) {
    this.config = {
      enableDirtyTracking: config.enableDirtyTracking ?? true,
      enableBatching: config.enableBatching ?? true,
      enablePooling: config.enablePooling ?? true,
      enableFrameSkipping: config.enableFrameSkipping ?? true,
      targetFPS: config.targetFPS ?? 60,
      maxBatchSize: config.maxBatchSize ?? 100,
      poolSize: config.poolSize ?? 1000,
    };

    this.dirtyTracker = new DirtyRectangleTracker();
    this.batchManager = new RenderBatchManager(this.config.maxBatchSize);
    this.frameSkipper = new FrameSkipper(this.config.targetFPS);

    this.stats = {
      frameTime: 0,
      fps: 0,
      skippedFrames: 0,
      dirtyRectangles: 0,
      batchedOperations: 0,
      pooledObjects: 0,
    };

    // Initialize object pools
    this.rectPool = new ObjectPool<DirtyRectangle>(
      () => ({ x: 0, y: 0, width: 0, height: 0 }),
      (rect) => {
        rect.x = 0;
        rect.y = 0;
        rect.width = 0;
        rect.height = 0;
      },
      this.config.poolSize
    );
  }

  // ============================================================================
  // Dirty Rectangle API
  // ============================================================================

  markDirty(x: number, y: number, width: number, height: number): void {
    if (!this.config.enableDirtyTracking) return;

    if (this.config.enablePooling) {
      const rect = this.rectPool.acquire();
      rect.x = x;
      rect.y = y;
      rect.width = width;
      rect.height = height;
      this.dirtyTracker.markDirty(rect);
      this.rectPool.release(rect);
    } else {
      this.dirtyTracker.markDirtyBounds(x, y, width, height);
    }
  }

  getDirtyRegion(): DirtyRectangle | null {
    return this.dirtyTracker.getMergedDirtyRegion();
  }

  hasDirtyRegions(): boolean {
    return this.dirtyTracker.hasDirtyRegions();
  }

  clearDirtyRegions(): void {
    this.dirtyTracker.clear();
  }

  // ============================================================================
  // Batch Rendering API
  // ============================================================================

  createRenderBatch(priority: number = 0): number {
    if (!this.config.enableBatching) return -1;
    return this.batchManager.createBatch(priority);
  }

  addToBatch(batchId: number, operation: RenderOperation): void {
    if (!this.config.enableBatching) return;
    this.batchManager.addOperation(batchId, operation);
  }

  flushBatch(batchId: number): RenderOperation[] {
    if (!this.config.enableBatching) return [];
    return this.batchManager.flushBatch(batchId);
  }

  flushAllBatches(): RenderOperation[] {
    if (!this.config.enableBatching) return [];
    return this.batchManager.flushAllBatches();
  }

  // ============================================================================
  // Frame Management API
  // ============================================================================

  shouldSkipFrame(): boolean {
    if (!this.config.enableFrameSkipping) return false;
    return this.frameSkipper.shouldSkipFrame();
  }

  // ============================================================================
  // Idle Callback Integration
  // ============================================================================

  scheduleIdleWork(callback: () => void, options?: IdleRequestOptions): number {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(callback, options);
    } else {
      // Fallback to setTimeout
      return window.setTimeout(callback, 0) as any;
    }
  }

  cancelIdleWork(handle: number): void {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(handle);
    } else {
      window.clearTimeout(handle);
    }
  }

  // ============================================================================
  // Stats & Monitoring
  // ============================================================================

  updateStats(): void {
    this.stats = {
      frameTime: 0,
      fps: this.config.targetFPS,
      skippedFrames: this.frameSkipper.getSkippedFrameCount(),
      dirtyRectangles: this.dirtyTracker.getDirtyRegions().length,
      batchedOperations: this.batchManager.getPendingOperationCount(),
      pooledObjects: this.rectPool.getSize(),
    };
  }

  getStats(): RenderStats {
    this.updateStats();
    return { ...this.stats };
  }

  resetStats(): void {
    this.frameSkipper.resetSkippedFrameCount();
    this.stats = {
      frameTime: 0,
      fps: 0,
      skippedFrames: 0,
      dirtyRectangles: 0,
      batchedOperations: 0,
      pooledObjects: 0,
    };
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  clear(): void {
    this.dirtyTracker.clear();
    this.batchManager.clear();
    this.rectPool.clear();
    this.resetStats();
  }

  dispose(): void {
    this.clear();
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function rectanglesIntersect(a: DirtyRectangle, b: DirtyRectangle): boolean {
  return !(
    a.x > b.x + b.width ||
    a.x + a.width < b.x ||
    a.y > b.y + b.height ||
    a.y + a.height < b.y
  );
}

// ============================================================================
// Singleton Instance
// ============================================================================

let renderOptimizerInstance: RenderOptimizer | null = null;

export function getRenderOptimizer(config?: OptimizerConfig): RenderOptimizer {
  if (!renderOptimizerInstance) {
    renderOptimizerInstance = new RenderOptimizer(config);
  }
  return renderOptimizerInstance;
}

// ============================================================================
// Export
// ============================================================================

export default RenderOptimizer;
