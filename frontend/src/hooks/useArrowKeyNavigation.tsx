/**
 * Arrow Key Navigation Hook
 *
 * Keyboard-based viewport panning with:
 * - Arrow key navigation
 * - Acceleration (hold longer = move faster)
 * - Diagonal movement support
 * - Configurable speed and acceleration
 */

import { useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ArrowKeyNavigationConfig {
  enabled?: boolean;
  baseSpeed?: number; // pixels per frame
  maxSpeed?: number; // maximum speed with acceleration
  accelerationRate?: number; // speed increase per frame
  enableAcceleration?: boolean;
  enableDiagonal?: boolean;
  disableWhenInputFocused?: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<ArrowKeyNavigationConfig> = {
  enabled: true,
  baseSpeed: 5,
  maxSpeed: 30,
  accelerationRate: 0.5,
  enableAcceleration: true,
  enableDiagonal: true,
  disableWhenInputFocused: true,
};

// ============================================================================
// Arrow Key Navigation Hook
// ============================================================================

export function useArrowKeyNavigation(config: ArrowKeyNavigationConfig = {}) {
  const { getViewport, setViewport } = useReactFlow();
  const fullConfig: Required<ArrowKeyNavigationConfig> = { ...DEFAULT_CONFIG, ...config };

  const keysPressed = useRef<Set<string>>(new Set());
  const currentSpeed = useRef<number>(fullConfig.baseSpeed);
  const animationFrameRef = useRef<number | null>(null);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const isInputFocused = useCallback((): boolean => {
    if (!fullConfig.disableWhenInputFocused) return false;

    const { activeElement } = document;
    const tagName = activeElement?.tagName.toLowerCase();

    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      (activeElement as HTMLElement)?.isContentEditable === true
    );
  }, [fullConfig.disableWhenInputFocused]);

  // ============================================================================
  // Navigation Animation
  // ============================================================================

  const startNavigation = useCallback(() => {
    if (animationFrameRef.current) return; // Already running

    const animate = () => {
      if (keysPressed.current.size === 0) {
        // No keys pressed, stop animation and reset speed
        animationFrameRef.current = null;
        currentSpeed.current = fullConfig.baseSpeed;
        return;
      }

      // Calculate direction based on pressed keys
      let deltaX = 0;
      let deltaY = 0;

      if (keysPressed.current.has('ArrowLeft')) deltaX -= 1;
      if (keysPressed.current.has('ArrowRight')) deltaX += 1;
      if (keysPressed.current.has('ArrowUp')) deltaY -= 1;
      if (keysPressed.current.has('ArrowDown')) deltaY += 1;

      // Normalize diagonal movement
      if (fullConfig.enableDiagonal && deltaX !== 0 && deltaY !== 0) {
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        deltaX /= length;
        deltaY /= length;
      }

      // Apply acceleration
      if (fullConfig.enableAcceleration) {
        currentSpeed.current = Math.min(
          currentSpeed.current + fullConfig.accelerationRate,
          fullConfig.maxSpeed
        );
      }

      // Apply movement
      const viewport = getViewport();
      const newX = viewport.x + deltaX * currentSpeed.current;
      const newY = viewport.y + deltaY * currentSpeed.current;

      setViewport({ ...viewport, x: newX, y: newY });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [fullConfig, getViewport, setViewport]);

  // ============================================================================
  // Keyboard Event Handlers
  // ============================================================================

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!fullConfig.enabled || isInputFocused()) return;

      const { key } = e;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
        e.preventDefault();

        if (!keysPressed.current.has(key)) {
          keysPressed.current.add(key);

          // Start navigation if first key
          if (keysPressed.current.size === 1) {
            startNavigation();
          }
        }
      }
    },
    [fullConfig, isInputFocused, startNavigation]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const { key } = e;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
        keysPressed.current.delete(key);

        // Reset speed when all keys released
        if (keysPressed.current.size === 0) {
          currentSpeed.current = fullConfig.baseSpeed;
        }
      }
    },
    [fullConfig]
  );

  // ============================================================================
  // Effect Hooks
  // ============================================================================

  useEffect(() => {
    if (!fullConfig.enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Reset on window blur
    const handleBlur = () => {
      keysPressed.current.clear();
      currentSpeed.current = fullConfig.baseSpeed;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [fullConfig, handleKeyDown, handleKeyUp]);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    config: fullConfig,
    isNavigating: keysPressed.current.size > 0,
    currentSpeed: currentSpeed.current,
  };
}

// ============================================================================
// Arrow Key Indicator Component
// ============================================================================

export interface ArrowKeyIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showInstructions?: boolean;
}

export const ArrowKeyIndicator: React.FC<ArrowKeyIndicatorProps> = ({
  position = 'bottom-left',
  showInstructions = true,
}) => {
  if (!showInstructions) return null;

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      pointerEvents: 'none',
    };

    const margin = 16;

    switch (position) {
      case 'top-left':
        return { ...base, top: margin, left: margin };
      case 'top-right':
        return { ...base, top: margin, right: margin };
      case 'bottom-left':
        return { ...base, bottom: margin, left: margin };
      case 'bottom-right':
        return { ...base, bottom: margin, right: margin };
      default:
        return base;
    }
  };

  return (
    <div style={getPositionStyles()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ opacity: 0.7 }}>Arrow keys to pan</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <KeyButton>↑</KeyButton>
          <KeyButton>↓</KeyButton>
          <KeyButton>←</KeyButton>
          <KeyButton>→</KeyButton>
        </div>
      </div>
    </div>
  );
};

const KeyButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: '20px',
      height: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
    }}
  >
    {children}
  </div>
);

// ============================================================================
// Speed Indicator Component
// ============================================================================

export interface SpeedIndicatorProps {
  currentSpeed: number;
  maxSpeed: number;
  visible?: boolean;
}

export const SpeedIndicator: React.FC<SpeedIndicatorProps> = ({
  currentSpeed,
  maxSpeed,
  visible = true,
}) => {
  if (!visible) return null;

  const speedPercentage = (currentSpeed / maxSpeed) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      <span>Speed</span>
      <div
        style={{
          width: '100px',
          height: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${speedPercentage}%`,
            height: '100%',
            backgroundColor: '#2196F3',
            transition: 'width 0.1s ease-out',
          }}
        />
      </div>
      <span>{Math.round(currentSpeed)} px/s</span>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default useArrowKeyNavigation;
