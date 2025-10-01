/**
 * Minimap Performance Monitor
 *
 * Real-time performance monitoring for the minimap component using
 * React DevTools Profiler API and custom metrics.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ProfilerOnRenderCallback } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  memoryUsage: number;
  elementCount: number;
  visibleElementCount: number;
  quadTreeDepth: number;
  quadTreeNodeCount: number;
  lodLevel: string;
}

export interface PerformanceStats {
  current: PerformanceMetrics;
  average: PerformanceMetrics;
  min: PerformanceMetrics;
  max: PerformanceMetrics;
  history: PerformanceMetrics[];
}

export interface PerformanceMonitorProps {
  enabled?: boolean;
  sampleInterval?: number; // ms
  historySize?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showOverlay?: boolean;
  overlayPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// ============================================================================
// Performance Monitor Hook
// ============================================================================

export function useMinimapPerformance(
  enabled: boolean = true,
  sampleInterval: number = 1000
): {
  metrics: PerformanceMetrics;
  stats: PerformanceStats;
  startMeasure: (label: string) => void;
  endMeasure: (label: string) => void;
  recordMetric: (key: keyof PerformanceMetrics, value: number) => void;
} {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    renderTime: 0,
    memoryUsage: 0,
    elementCount: 0,
    visibleElementCount: 0,
    quadTreeDepth: 0,
    quadTreeNodeCount: 0,
    lodLevel: 'detailed',
  });

  const [stats, setStats] = useState<PerformanceStats>({
    current: metrics,
    average: metrics,
    min: metrics,
    max: metrics,
    history: [],
  });

  const measurementsRef = useRef<Map<string, number>>(new Map());
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const historyRef = useRef<PerformanceMetrics[]>([]);

  // ============================================================================
  // FPS Calculation
  // ============================================================================

  useEffect(() => {
    if (!enabled) return;

    let animationFrameId: number;

    const measureFPS = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      const avgFrameTime =
        frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const fps = 1000 / avgFrameTime;

      setMetrics((prev) => ({
        ...prev,
        fps: Math.round(fps * 10) / 10,
        frameTime: Math.round(avgFrameTime * 100) / 100,
      }));

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [enabled]);

  // ============================================================================
  // Memory Monitoring
  // ============================================================================

  useEffect(() => {
    if (!enabled) return;

    const updateMemory = () => {
      if ((performance as any).memory) {
        const memoryMB = (performance as any).memory.usedJSHeapSize / 1048576;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(memoryMB * 100) / 100,
        }));
      }
    };

    const interval = setInterval(updateMemory, sampleInterval);
    return () => clearInterval(interval);
  }, [enabled, sampleInterval]);

  // ============================================================================
  // Statistics Calculation
  // ============================================================================

  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      historyRef.current.push({ ...metrics });
      if (historyRef.current.length > 60) {
        historyRef.current.shift();
      }

      if (historyRef.current.length === 0) return;

      // Calculate average
      const avg: PerformanceMetrics = { ...metrics };
      for (const key in avg) {
        const values = historyRef.current.map((m) => m[key as keyof PerformanceMetrics] as number);
        avg[key as keyof PerformanceMetrics] = (
          values.reduce((a, b) => a + b, 0) / values.length
        ) as any;
      }

      // Calculate min/max
      const min: PerformanceMetrics = { ...metrics };
      const max: PerformanceMetrics = { ...metrics };
      for (const key in min) {
        const values = historyRef.current.map((m) => m[key as keyof PerformanceMetrics] as number);
        min[key as keyof PerformanceMetrics] = Math.min(...values) as any;
        max[key as keyof PerformanceMetrics] = Math.max(...values) as any;
      }

      setStats({
        current: metrics,
        average: avg,
        min,
        max,
        history: [...historyRef.current],
      });
    };

    const interval = setInterval(updateStats, sampleInterval);
    return () => clearInterval(interval);
  }, [enabled, metrics, sampleInterval]);

  // ============================================================================
  // Performance Measurement Utilities
  // ============================================================================

  const startMeasure = useCallback((label: string) => {
    measurementsRef.current.set(label, performance.now());
  }, []);

  const endMeasure = useCallback((label: string) => {
    const startTime = measurementsRef.current.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      measurementsRef.current.delete(label);

      if (label === 'render') {
        setMetrics((prev) => ({
          ...prev,
          renderTime: Math.round(duration * 100) / 100,
        }));
      }
    }
  }, []);

  const recordMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return {
    metrics,
    stats,
    startMeasure,
    endMeasure,
    recordMetric,
  };
}

// ============================================================================
// Performance Monitor Component
// ============================================================================

export const MinimapPerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  sampleInterval = 1000,
  historySize: _historySize = 60,
  onMetricsUpdate,
  showOverlay = true,
  overlayPosition = 'top-left',
}) => {
  const { metrics, stats } = useMinimapPerformance(enabled, sampleInterval);

  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  if (!enabled || !showOverlay) return null;

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'monospace',
      lineHeight: '1.4',
      pointerEvents: 'none',
    };

    const offset = 8;

    switch (overlayPosition) {
      case 'top-left':
        return { ...base, top: offset, left: offset };
      case 'top-right':
        return { ...base, top: offset, right: offset };
      case 'bottom-left':
        return { ...base, bottom: offset, left: offset };
      case 'bottom-right':
        return { ...base, bottom: offset, right: offset };
      default:
        return base;
    }
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return '#4CAF50'; // Green
    if (fps >= 30) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getMemoryColor = (mb: number): string => {
    if (mb < 50) return '#4CAF50';
    if (mb < 100) return '#FF9800';
    return '#F44336';
  };

  return (
    <div style={getPositionStyles()}>
      <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#2196F3' }}>
        Minimap Performance
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 80px', gap: '4px' }}>
        <div>FPS:</div>
        <div style={{ color: getFPSColor(metrics.fps) }}>
          {metrics.fps.toFixed(1)}
        </div>

        <div>Frame Time:</div>
        <div>{metrics.frameTime.toFixed(2)} ms</div>

        <div>Render Time:</div>
        <div>{metrics.renderTime.toFixed(2)} ms</div>

        <div>Memory:</div>
        <div style={{ color: getMemoryColor(metrics.memoryUsage) }}>
          {metrics.memoryUsage.toFixed(1)} MB
        </div>

        <div>Elements:</div>
        <div>{metrics.elementCount}</div>

        <div>Visible:</div>
        <div>{metrics.visibleElementCount}</div>

        <div>QuadTree Depth:</div>
        <div>{metrics.quadTreeDepth}</div>

        <div>QuadTree Nodes:</div>
        <div>{metrics.quadTreeNodeCount}</div>

        <div>LOD Level:</div>
        <div style={{ textTransform: 'capitalize' }}>{metrics.lodLevel}</div>
      </div>

      <div
        style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '10px',
          color: '#999',
        }}
      >
        <div>
          Avg FPS: {stats.average.fps.toFixed(1)} | Min: {stats.min.fps.toFixed(1)} | Max:{' '}
          {stats.max.fps.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// React Profiler Callback
// ============================================================================

export const createMinimapProfilerCallback = (
  onRender?: (metrics: {
    id: string;
    phase: 'mount' | 'update';
    actualDuration: number;
    baseDuration: number;
    startTime: number;
    commitTime: number;
  }) => void
): ProfilerOnRenderCallback => {
  return (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    if (onRender) {
      onRender({
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Minimap Profiler] ${id} ${phase}:`, {
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
      });
    }
  };
};

// ============================================================================
// Performance Benchmark Utility
// ============================================================================

export class MinimapBenchmark {
  private measurements: Map<string, number[]> = new Map();

  start(label: string): void {
    performance.mark(`${label}-start`);
  }

  end(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const measure = performance.getEntriesByName(label)[0] as PerformanceMeasure;
    const {duration} = measure;

    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(duration);

    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);

    return duration;
  }

  getStats(label: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((a, b) => a + b, 0);
    const avg = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      avg,
      min,
      max,
      total,
    };
  }

  clear(): void {
    this.measurements.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  report(): string {
    let report = 'Minimap Performance Benchmark Report\n';
    report += '=====================================\n\n';

    for (const [label, _measurements] of this.measurements) {
      const stats = this.getStats(label);
      if (stats) {
        report += `${label}:\n`;
        report += `  Count: ${stats.count}\n`;
        report += `  Avg:   ${stats.avg.toFixed(2)} ms\n`;
        report += `  Min:   ${stats.min.toFixed(2)} ms\n`;
        report += `  Max:   ${stats.max.toFixed(2)} ms\n`;
        report += `  Total: ${stats.total.toFixed(2)} ms\n\n`;
      }
    }

    return report;
  }
}

// ============================================================================
// Export
// ============================================================================

export default MinimapPerformanceMonitor;
