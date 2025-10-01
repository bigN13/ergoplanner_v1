/**
 * Smart Zoom Hook
 *
 * Advanced zoom management with:
 * - Smooth animations using Web Animations API
 * - Momentum scrolling for mouse wheel
 * - Pinch-to-zoom for touch devices
 * - Semantic zoom with content-aware transitions
 * - Performance optimization with RAF and throttling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow, type Viewport } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ZoomConfig {
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
  zoomStep: number;
  smoothDuration: number; // ms
  momentumDecay: number; // 0-1
  enableMomentum: boolean;
  enablePinchZoom: boolean;
  doubleClickZoomLevel?: number;
  wheelSensitivity: number;
}

export interface ZoomPreset {
  label: string;
  value: number;
  icon?: string;
}

export interface ZoomToOptions {
  padding?: number;
  duration?: number;
  maxZoom?: number;
  minZoom?: number;
}

export interface SemanticZoomLevel {
  threshold: number;
  label: string;
  onEnter?: () => void;
  onExit?: () => void;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: ZoomConfig = {
  minZoom: 0.1,
  maxZoom: 4.0,
  defaultZoom: 1.0,
  zoomStep: 0.1,
  smoothDuration: 300,
  momentumDecay: 0.95,
  enableMomentum: true,
  enablePinchZoom: true,
  doubleClickZoomLevel: 2.0,
  wheelSensitivity: 0.001,
};

export const DEFAULT_PRESETS: ZoomPreset[] = [
  { label: '10%', value: 0.1 },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1.0, icon: '🎯' },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2.0 },
  { label: '400%', value: 4.0 },
];

// ============================================================================
// Smart Zoom Hook
// ============================================================================

export function useSmartZoom(config: Partial<ZoomConfig> = {}) {
  const { getViewport, setViewport, getNodes, fitView } = useReactFlow();
  const fullConfig: ZoomConfig = { ...DEFAULT_CONFIG, ...config };

  const [currentZoom, setCurrentZoom] = useState<number>(fullConfig.defaultZoom);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Refs for momentum and animation
  const momentumVelocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef<number>(0);
  const touchStartRef = useRef<{ distance: number; viewport: Viewport } | null>(null);

  // Semantic zoom levels
  const semanticLevelsRef = useRef<SemanticZoomLevel[]>([
    { threshold: 0.25, label: 'overview' },
    { threshold: 0.5, label: 'normal' },
    { threshold: 1.0, label: 'detail' },
    { threshold: 2.0, label: 'close-up' },
  ]);

  // ============================================================================
  // Core Zoom Functions
  // ============================================================================

  /**
   * Smoothly zoom to a specific level
   */
  const smoothZoomTo = useCallback(
    (targetZoom: number, duration: number = fullConfig.smoothDuration, centerPoint?: { x: number; y: number }) => {
      const clampedZoom = Math.max(fullConfig.minZoom, Math.min(fullConfig.maxZoom, targetZoom));

      setIsAnimating(true);

      const viewport = getViewport();
      const startZoom = viewport.zoom;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const newZoom = startZoom + (clampedZoom - startZoom) * easeProgress;

        if (centerPoint) {
          // Zoom to specific point
          const dx = centerPoint.x - viewport.x;
          const dy = centerPoint.y - viewport.y;
          const scale = newZoom / viewport.zoom;
          const newX = centerPoint.x - dx * scale;
          const newY = centerPoint.y - dy * scale;

          setViewport({ x: newX, y: newY, zoom: newZoom });
        } else {
          // Zoom to center
          setViewport({ ...viewport, zoom: newZoom });
        }

        setCurrentZoom(newZoom);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          checkSemanticZoomTransition(newZoom);
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [fullConfig, getViewport, setViewport]
  );

  /**
   * Zoom in by step
   */
  const zoomIn = useCallback(() => {
    const viewport = getViewport();
    const newZoom = Math.min(viewport.zoom + fullConfig.zoomStep, fullConfig.maxZoom);
    smoothZoomTo(newZoom);
  }, [fullConfig, getViewport, smoothZoomTo]);

  /**
   * Zoom out by step
   */
  const zoomOut = useCallback(() => {
    const viewport = getViewport();
    const newZoom = Math.max(viewport.zoom - fullConfig.zoomStep, fullConfig.minZoom);
    smoothZoomTo(newZoom);
  }, [fullConfig, getViewport, smoothZoomTo]);

  /**
   * Reset zoom to default
   */
  const resetZoom = useCallback(() => {
    smoothZoomTo(fullConfig.defaultZoom);
  }, [fullConfig, smoothZoomTo]);

  /**
   * Zoom to preset
   */
  const zoomToPreset = useCallback(
    (preset: number) => {
      smoothZoomTo(preset);
    },
    [smoothZoomTo]
  );

  // ============================================================================
  // Zoom to Element/Selection
  // ============================================================================

  /**
   * Zoom to specific node(s)
   */
  const zoomToNodes = useCallback(
    (nodeIds: string[], options: ZoomToOptions = {}) => {
      const { padding = 50, duration = fullConfig.smoothDuration, maxZoom = fullConfig.maxZoom, minZoom = fullConfig.minZoom } = options;

      const nodes = getNodes().filter((node) => nodeIds.includes(node.id));
      if (nodes.length === 0) return;

      // Calculate bounding box
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        const {x} = node.position;
        const {y} = node.position;
        const width = (node.width as number) || 100;
        const height = (node.height as number) || 80;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });

      const width = maxX - minX;
      const height = maxY - minY;
      const centerX = minX + width / 2;
      const centerY = minY + height / 2;

      // Calculate zoom to fit
      const viewportWidth = window.innerWidth - padding * 2;
      const viewportHeight = window.innerHeight - padding * 2;
      const scaleX = viewportWidth / width;
      const scaleY = viewportHeight / height;
      const targetZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(scaleX, scaleY)));

      // Calculate viewport position
      const newX = window.innerWidth / 2 - centerX * targetZoom;
      const newY = window.innerHeight / 2 - centerY * targetZoom;

      setIsAnimating(true);

      const viewport = getViewport();
      const startX = viewport.x;
      const startY = viewport.y;
      const startZoom = viewport.zoom;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const x = startX + (newX - startX) * easeProgress;
        const y = startY + (newY - startY) * easeProgress;
        const zoom = startZoom + (targetZoom - startZoom) * easeProgress;

        setViewport({ x, y, zoom });
        setCurrentZoom(zoom);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          checkSemanticZoomTransition(zoom);
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [fullConfig, getNodes, getViewport, setViewport]
  );

  /**
   * Fit all nodes in viewport
   */
  const fitAllNodes = useCallback(
    (options: ZoomToOptions = {}) => {
      const { padding = 50, duration = fullConfig.smoothDuration } = options;
      fitView({ padding, duration: duration / 1000 });
      setTimeout(() => {
        const viewport = getViewport();
        setCurrentZoom(viewport.zoom);
        checkSemanticZoomTransition(viewport.zoom);
      }, duration);
    },
    [fullConfig, fitView, getViewport]
  );

  // ============================================================================
  // Momentum Scrolling
  // ============================================================================

  const handleWheelZoom = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      const delta = -event.deltaY * fullConfig.wheelSensitivity;
      const viewport = getViewport();

      if (fullConfig.enableMomentum) {
        const now = performance.now();
        const timeDelta = now - lastWheelTimeRef.current;

        if (timeDelta < 50) {
          // Accumulate velocity for momentum
          momentumVelocityRef.current += delta;
        } else {
          momentumVelocityRef.current = delta;
        }

        lastWheelTimeRef.current = now;

        // Apply immediate zoom
        const newZoom = Math.max(
          fullConfig.minZoom,
          Math.min(fullConfig.maxZoom, viewport.zoom + delta)
        );

        // Get mouse position
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const scale = newZoom / viewport.zoom;
        const newX = x - (x - viewport.x) * scale;
        const newY = y - (y - viewport.y) * scale;

        setViewport({ x: newX, y: newY, zoom: newZoom });
        setCurrentZoom(newZoom);

        // Start momentum animation
        const applyMomentum = () => {
          if (Math.abs(momentumVelocityRef.current) < 0.001) {
            momentumVelocityRef.current = 0;
            checkSemanticZoomTransition(getViewport().zoom);
            return;
          }

          const currentViewport = getViewport();
          const momentumZoom = Math.max(
            fullConfig.minZoom,
            Math.min(fullConfig.maxZoom, currentViewport.zoom + momentumVelocityRef.current)
          );

          setViewport({ ...currentViewport, zoom: momentumZoom });
          setCurrentZoom(momentumZoom);

          momentumVelocityRef.current *= fullConfig.momentumDecay;

          animationFrameRef.current = requestAnimationFrame(applyMomentum);
        };

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(applyMomentum);
      } else {
        // Simple zoom without momentum
        const newZoom = Math.max(
          fullConfig.minZoom,
          Math.min(fullConfig.maxZoom, viewport.zoom + delta)
        );

        smoothZoomTo(newZoom, 100);
      }
    },
    [fullConfig, getViewport, setViewport, smoothZoomTo]
  );

  // ============================================================================
  // Pinch-to-Zoom for Touch Devices
  // ============================================================================

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length === 2 && fullConfig.enablePinchZoom) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        touchStartRef.current = {
          distance,
          viewport: getViewport(),
        };
      }
    },
    [fullConfig, getViewport]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length === 2 && touchStartRef.current && fullConfig.enablePinchZoom) {
        event.preventDefault();

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        const scale = distance / touchStartRef.current.distance;
        const newZoom = Math.max(
          fullConfig.minZoom,
          Math.min(fullConfig.maxZoom, touchStartRef.current.viewport.zoom * scale)
        );

        setViewport({ ...touchStartRef.current.viewport, zoom: newZoom });
        setCurrentZoom(newZoom);
      }
    },
    [fullConfig, setViewport]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartRef.current) {
      checkSemanticZoomTransition(getViewport().zoom);
      touchStartRef.current = null;
    }
  }, [getViewport]);

  // ============================================================================
  // Semantic Zoom
  // ============================================================================

  const checkSemanticZoomTransition = useCallback((zoom: number) => {
    const levels = semanticLevelsRef.current;
    let currentLevel: SemanticZoomLevel | undefined;

    for (let i = levels.length - 1; i >= 0; i--) {
      if (zoom >= levels[i].threshold) {
        currentLevel = levels[i];
        break;
      }
    }

    if (currentLevel) {
      currentLevel.onEnter?.();
    }
  }, []);

  const registerSemanticLevel = useCallback((level: SemanticZoomLevel) => {
    semanticLevelsRef.current.push(level);
    semanticLevelsRef.current.sort((a, b) => a.threshold - b.threshold);
  }, []);

  // ============================================================================
  // Effect Hooks
  // ============================================================================

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // State
    currentZoom,
    isAnimating,
    config: fullConfig,

    // Core functions
    zoomIn,
    zoomOut,
    resetZoom,
    smoothZoomTo,
    zoomToPreset,

    // Advanced functions
    zoomToNodes,
    fitAllNodes,

    // Event handlers
    handleWheelZoom,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Semantic zoom
    registerSemanticLevel,
  };
}
