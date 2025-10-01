/**
 * Edge Scrolling Hook
 *
 * Automatic viewport panning when cursor/drag approaches edges:
 * - Drag operations near viewport boundaries
 * - Distance-based scroll speed (closer = faster)
 * - Smooth acceleration curve
 * - Configurable edge zones and speeds
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface EdgeScrollConfig {
  enabled?: boolean;
  edgeSize?: number; // pixels from edge
  maxSpeed?: number; // max pan speed (pixels per frame)
  accelerationCurve?: 'linear' | 'quadratic' | 'exponential';
  enableHorizontal?: boolean;
  enableVertical?: boolean;
  triggerOnDrag?: boolean;
  triggerOnHover?: boolean;
}

export interface EdgeScrollState {
  isScrolling: boolean;
  direction: {
    x: number; // -1, 0, or 1
    y: number;
  };
  speed: {
    x: number;
    y: number;
  };
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<EdgeScrollConfig> = {
  enabled: true,
  edgeSize: 50,
  maxSpeed: 15,
  accelerationCurve: 'quadratic',
  enableHorizontal: true,
  enableVertical: true,
  triggerOnDrag: true,
  triggerOnHover: false,
};

// ============================================================================
// Edge Scrolling Hook
// ============================================================================

export function useEdgeScrolling(config: EdgeScrollConfig = {}) {
  const { getViewport, setViewport } = useReactFlow();
  const fullConfig: Required<EdgeScrollConfig> = { ...DEFAULT_CONFIG, ...config };

  const [state, setState] = useState<EdgeScrollState>({
    isScrolling: false,
    direction: { x: 0, y: 0 },
    speed: { x: 0, y: 0 },
  });

  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ============================================================================
  // Acceleration Curves
  // ============================================================================

  const calculateSpeed = useCallback(
    (distance: number, edgeSize: number): number => {
      // Normalize distance (0 at edge, 1 at edgeSize)
      const normalizedDistance = Math.max(0, Math.min(1, distance / edgeSize));

      // Invert so closer to edge = higher value
      const proximity = 1 - normalizedDistance;

      let speedFactor: number;

      switch (fullConfig.accelerationCurve) {
        case 'linear':
          speedFactor = proximity;
          break;
        case 'quadratic':
          speedFactor = Math.pow(proximity, 2);
          break;
        case 'exponential':
          speedFactor = Math.pow(proximity, 3);
          break;
        default:
          speedFactor = proximity;
      }

      return speedFactor * fullConfig.maxSpeed;
    },
    [fullConfig]
  );

  // ============================================================================
  // Edge Detection
  // ============================================================================

  const checkEdgeProximity = useCallback(
    (x: number, y: number): { direction: { x: number; y: number }; speed: { x: number; y: number } } => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let directionX = 0;
      let directionY = 0;
      let speedX = 0;
      let speedY = 0;

      // Check horizontal edges
      if (fullConfig.enableHorizontal) {
        if (x < fullConfig.edgeSize) {
          // Left edge
          directionX = 1; // Pan right (move viewport left)
          speedX = calculateSpeed(x, fullConfig.edgeSize);
        } else if (x > viewport.width - fullConfig.edgeSize) {
          // Right edge
          directionX = -1; // Pan left (move viewport right)
          speedX = calculateSpeed(viewport.width - x, fullConfig.edgeSize);
        }
      }

      // Check vertical edges
      if (fullConfig.enableVertical) {
        if (y < fullConfig.edgeSize) {
          // Top edge
          directionY = 1; // Pan down (move viewport up)
          speedY = calculateSpeed(y, fullConfig.edgeSize);
        } else if (y > viewport.height - fullConfig.edgeSize) {
          // Bottom edge
          directionY = -1; // Pan up (move viewport down)
          speedY = calculateSpeed(viewport.height - y, fullConfig.edgeSize);
        }
      }

      return {
        direction: { x: directionX, y: directionY },
        speed: { x: speedX, y: speedY },
      };
    },
    [fullConfig, calculateSpeed]
  );

  // ============================================================================
  // Scrolling Animation
  // ============================================================================

  const startScrolling = useCallback(
    (direction: { x: number; y: number }, speed: { x: number; y: number }) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setState({
        isScrolling: true,
        direction,
        speed,
      });

      const animate = () => {
        const viewport = getViewport();

        // Recalculate based on current mouse position
        const { direction: newDirection, speed: newSpeed } = checkEdgeProximity(
          lastMousePositionRef.current.x,
          lastMousePositionRef.current.y
        );

        // Stop if no longer near edge
        if (newDirection.x === 0 && newDirection.y === 0) {
          stopScrolling();
          return;
        }

        // Apply scrolling
        const newX = viewport.x + newDirection.x * newSpeed.x;
        const newY = viewport.y + newDirection.y * newSpeed.y;

        setViewport({ ...viewport, x: newX, y: newY });

        setState({
          isScrolling: true,
          direction: newDirection,
          speed: newSpeed,
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [getViewport, setViewport, checkEdgeProximity]
  );

  const stopScrolling = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setState({
      isScrolling: false,
      direction: { x: 0, y: 0 },
      speed: { x: 0, y: 0 },
    });
  }, []);

  // ============================================================================
  // Mouse Event Handlers
  // ============================================================================

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!fullConfig.enabled) return;

      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };

      // Only scroll if dragging (and triggerOnDrag is enabled)
      // or if triggerOnHover is enabled
      const shouldTrigger =
        (fullConfig.triggerOnDrag && isDraggingRef.current) ||
        fullConfig.triggerOnHover;

      if (!shouldTrigger) {
        if (state.isScrolling) {
          stopScrolling();
        }
        return;
      }

      const { direction, speed } = checkEdgeProximity(e.clientX, e.clientY);

      if (direction.x !== 0 || direction.y !== 0) {
        if (!state.isScrolling) {
          startScrolling(direction, speed);
        }
      } else {
        if (state.isScrolling) {
          stopScrolling();
        }
      }
    },
    [fullConfig, state, checkEdgeProximity, startScrolling, stopScrolling]
  );

  const handleMouseDown = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (state.isScrolling && fullConfig.triggerOnDrag && !fullConfig.triggerOnHover) {
      stopScrolling();
    }
  }, [fullConfig, state, stopScrolling]);

  useEffect(() => {
    if (!fullConfig.enabled) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [fullConfig, handleMouseMove, handleMouseDown, handleMouseUp]);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Programmatic Control
  // ============================================================================

  const enableEdgeScrolling = useCallback(() => {
    fullConfig.enabled = true;
  }, [fullConfig]);

  const disableEdgeScrolling = useCallback(() => {
    fullConfig.enabled = false;
    stopScrolling();
  }, [fullConfig, stopScrolling]);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // State
    isScrolling: state.isScrolling,
    direction: state.direction,
    speed: state.speed,

    // Controls
    enableEdgeScrolling,
    disableEdgeScrolling,
    stopScrolling,

    // Config
    config: fullConfig,
  };
}

// ============================================================================
// Edge Scroll Indicator Component
// ============================================================================

export interface EdgeScrollIndicatorProps {
  isScrolling: boolean;
  direction: { x: number; y: number };
  speed: { x: number; y: number };
  edgeSize?: number;
}

export const EdgeScrollIndicator: React.FC<EdgeScrollIndicatorProps> = ({
  isScrolling,
  direction,
  speed: _speed,
  edgeSize = 50,
}) => {
  if (!isScrolling) return null;

  const getArrowPosition = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
      pointerEvents: 'none',
      fontSize: '24px',
      color: '#2196F3',
      opacity: 0.7,
      animation: 'pulse 1s ease-in-out infinite',
    };

    if (direction.x < 0) {
      // Scrolling left
      return { ...base, right: edgeSize / 2, top: '50%', transform: 'translateY(-50%)' };
    } else if (direction.x > 0) {
      // Scrolling right
      return { ...base, left: edgeSize / 2, top: '50%', transform: 'translateY(-50%)' };
    } else if (direction.y < 0) {
      // Scrolling up
      return { ...base, top: edgeSize / 2, left: '50%', transform: 'translateX(-50%)' };
    } else if (direction.y > 0) {
      // Scrolling down
      return { ...base, bottom: edgeSize / 2, left: '50%', transform: 'translateX(-50%)' };
    }

    return base;
  };

  const getArrowIcon = (): string => {
    if (direction.x < 0) return '→';
    if (direction.x > 0) return '←';
    if (direction.y < 0) return '↓';
    if (direction.y > 0) return '↑';
    return '';
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}
      </style>
      <div style={getArrowPosition()}>{getArrowIcon()}</div>
    </>
  );
};

// ============================================================================
// Export
// ============================================================================

export default useEdgeScrolling;
