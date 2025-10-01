/**
 * Pan Navigation Hook
 *
 * Comprehensive pan system with:
 * - Space+drag pan mode
 * - Middle mouse button pan
 * - Touch pan with momentum
 * - Inertial scrolling with friction
 * - Pan constraints and boundaries
 * - Performance optimizations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow, type Viewport } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface PanConfig {
  enableSpacePan?: boolean;
  enableMiddleMousePan?: boolean;
  enableTouchPan?: boolean;
  enableInertia?: boolean;
  panSpeed?: number;
  inertiaDamping?: number; // 0-1, higher = more damping
  minVelocity?: number; // Stop inertia below this
  enableBoundaries?: boolean;
  boundaries?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

export interface PanState {
  isPanning: boolean;
  panMode: 'space' | 'middle-mouse' | 'touch' | null;
  velocity: { x: number; y: number };
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<PanConfig> = {
  enableSpacePan: true,
  enableMiddleMousePan: true,
  enableTouchPan: true,
  enableInertia: true,
  panSpeed: 1.0,
  inertiaDamping: 0.92,
  minVelocity: 0.1,
  enableBoundaries: false,
  boundaries: {},
};

// ============================================================================
// Pan Navigation Hook
// ============================================================================

export function usePanNavigation(config: PanConfig = {}) {
  const { getViewport, setViewport } = useReactFlow();
  const fullConfig: Required<PanConfig> = { ...DEFAULT_CONFIG, ...config };

  const [state, setState] = useState<PanState>({
    isPanning: false,
    panMode: null,
    velocity: { x: 0, y: 0 },
  });

  // Refs for pan tracking
  const spaceKeyPressedRef = useRef<boolean>(false);
  const lastPanPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastPanTimeRef = useRef<number>(0);
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const inertiaAnimationRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; viewport: Viewport } | null>(null);

  // ============================================================================
  // Pan Constraints
  // ============================================================================

  const applyBoundaries = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      if (!fullConfig.enableBoundaries) return { x, y };

      const { minX, maxX, minY, maxY } = fullConfig.boundaries;

      let constrainedX = x;
      let constrainedY = y;

      if (minX !== undefined) constrainedX = Math.max(minX, constrainedX);
      if (maxX !== undefined) constrainedX = Math.min(maxX, constrainedX);
      if (minY !== undefined) constrainedY = Math.max(minY, constrainedY);
      if (maxY !== undefined) constrainedY = Math.min(maxY, constrainedY);

      return { x: constrainedX, y: constrainedY };
    },
    [fullConfig]
  );

  // ============================================================================
  // Inertial Scrolling
  // ============================================================================

  const startInertia = useCallback(() => {
    if (!fullConfig.enableInertia) return;

    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current);
    }

    const animate = () => {
      const currentVelocity = velocityRef.current;

      // Check if velocity is below threshold
      if (
        Math.abs(currentVelocity.x) < fullConfig.minVelocity &&
        Math.abs(currentVelocity.y) < fullConfig.minVelocity
      ) {
        velocityRef.current = { x: 0, y: 0 };
        setState((prev) => ({ ...prev, velocity: { x: 0, y: 0 } }));
        return;
      }

      // Apply velocity to viewport
      const viewport = getViewport();
      const newPosition = applyBoundaries(
        viewport.x + currentVelocity.x * fullConfig.panSpeed,
        viewport.y + currentVelocity.y * fullConfig.panSpeed
      );

      setViewport({ ...viewport, ...newPosition });

      // Apply damping
      velocityRef.current = {
        x: currentVelocity.x * fullConfig.inertiaDamping,
        y: currentVelocity.y * fullConfig.inertiaDamping,
      };

      setState((prev) => ({ ...prev, velocity: velocityRef.current }));

      inertiaAnimationRef.current = requestAnimationFrame(animate);
    };

    inertiaAnimationRef.current = requestAnimationFrame(animate);
  }, [fullConfig, getViewport, setViewport, applyBoundaries]);

  const stopInertia = useCallback(() => {
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current);
      inertiaAnimationRef.current = null;
    }
    velocityRef.current = { x: 0, y: 0 };
    setState((prev) => ({ ...prev, velocity: { x: 0, y: 0 } }));
  }, []);

  // ============================================================================
  // Space + Drag Pan
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && fullConfig.enableSpacePan && !spaceKeyPressedRef.current) {
        spaceKeyPressedRef.current = true;
        document.body.style.cursor = 'grab';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceKeyPressedRef.current = false;
        document.body.style.cursor = 'default';

        if (state.isPanning && state.panMode === 'space') {
          setState((prev) => ({ ...prev, isPanning: false, panMode: null }));
          startInertia();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [fullConfig, state, startInertia]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Space + left click OR middle mouse button
      if (
        (fullConfig.enableSpacePan && spaceKeyPressedRef.current && e.button === 0) ||
        (fullConfig.enableMiddleMousePan && e.button === 1)
      ) {
        e.preventDefault();
        stopInertia();

        const panMode = e.button === 1 ? 'middle-mouse' : 'space';

        setState((prev) => ({ ...prev, isPanning: true, panMode }));
        lastPanPositionRef.current = { x: e.clientX, y: e.clientY };
        lastPanTimeRef.current = performance.now();

        document.body.style.cursor = 'grabbing';
      }
    },
    [fullConfig, stopInertia]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!state.isPanning || !lastPanPositionRef.current) return;

      const now = performance.now();
      const deltaTime = now - lastPanTimeRef.current;

      if (deltaTime === 0) return;

      const deltaX = e.clientX - lastPanPositionRef.current.x;
      const deltaY = e.clientY - lastPanPositionRef.current.y;

      // Calculate velocity for inertia
      velocityRef.current = {
        x: deltaX / deltaTime * 16, // Normalize to ~60fps
        y: deltaY / deltaTime * 16,
      };

      // Apply pan
      const viewport = getViewport();
      const newPosition = applyBoundaries(
        viewport.x + deltaX * fullConfig.panSpeed,
        viewport.y + deltaY * fullConfig.panSpeed
      );

      setViewport({ ...viewport, ...newPosition });

      lastPanPositionRef.current = { x: e.clientX, y: e.clientY };
      lastPanTimeRef.current = now;
    },
    [state, fullConfig, getViewport, setViewport, applyBoundaries]
  );

  const handleMouseUp = useCallback(() => {
    if (state.isPanning) {
      setState((prev) => ({ ...prev, isPanning: false, panMode: null }));
      lastPanPositionRef.current = null;

      document.body.style.cursor = spaceKeyPressedRef.current ? 'grab' : 'default';

      startInertia();
    }
  }, [state, startInertia]);

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // ============================================================================
  // Touch Pan
  // ============================================================================

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!fullConfig.enableTouchPan || e.touches.length !== 1) return;

      stopInertia();

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        viewport: getViewport(),
      };

      setState((prev) => ({ ...prev, isPanning: true, panMode: 'touch' }));
      lastPanTimeRef.current = performance.now();
    },
    [fullConfig, stopInertia, getViewport]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!state.isPanning || !touchStartRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const now = performance.now();
      const deltaTime = now - lastPanTimeRef.current;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Calculate velocity
      velocityRef.current = {
        x: deltaX / deltaTime * 16,
        y: deltaY / deltaTime * 16,
      };

      // Apply pan
      const newPosition = applyBoundaries(
        touchStartRef.current.viewport.x + deltaX * fullConfig.panSpeed,
        touchStartRef.current.viewport.y + deltaY * fullConfig.panSpeed
      );

      setViewport({ ...touchStartRef.current.viewport, ...newPosition });

      lastPanTimeRef.current = now;
    },
    [state, fullConfig, setViewport, applyBoundaries]
  );

  const handleTouchEnd = useCallback(() => {
    if (state.isPanning && state.panMode === 'touch') {
      setState((prev) => ({ ...prev, isPanning: false, panMode: null }));
      touchStartRef.current = null;
      startInertia();
    }
  }, [state, startInertia]);

  useEffect(() => {
    const options = { passive: false };

    window.addEventListener('touchstart', handleTouchStart, options);
    window.addEventListener('touchmove', handleTouchMove, options);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // ============================================================================
  // Programmatic Pan
  // ============================================================================

  const panTo = useCallback(
    (x: number, y: number, animated: boolean = true) => {
      stopInertia();

      const viewport = getViewport();
      const newPosition = applyBoundaries(x, y);

      if (animated) {
        const startX = viewport.x;
        const startY = viewport.y;
        const startTime = performance.now();
        const duration = 300;

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);

          const x = startX + (newPosition.x - startX) * easeProgress;
          const y = startY + (newPosition.y - startY) * easeProgress;

          setViewport({ ...viewport, x, y });

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      } else {
        setViewport({ ...viewport, ...newPosition });
      }
    },
    [getViewport, setViewport, applyBoundaries, stopInertia]
  );

  const panBy = useCallback(
    (deltaX: number, deltaY: number, animated: boolean = true) => {
      const viewport = getViewport();
      panTo(viewport.x + deltaX, viewport.y + deltaY, animated);
    },
    [getViewport, panTo]
  );

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      if (inertiaAnimationRef.current) {
        cancelAnimationFrame(inertiaAnimationRef.current);
      }
      document.body.style.cursor = 'default';
    };
  }, []);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // State
    isPanning: state.isPanning,
    panMode: state.panMode,
    velocity: state.velocity,

    // Programmatic controls
    panTo,
    panBy,
    stopInertia,

    // Config
    config: fullConfig,
  };
}

// ============================================================================
// Export
// ============================================================================

export default usePanNavigation;
