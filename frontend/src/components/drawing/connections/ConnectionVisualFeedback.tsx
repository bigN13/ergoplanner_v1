/**
 * Connection Visual Feedback Component
 *
 * Provides smooth animations and visual indicators for connection operations
 * using React Spring for fluid animations.
 */

import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import type { XYPosition } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SnapIndicatorProps {
  position: XYPosition;
  isValid: boolean;
  message?: string;
  strength?: number;
}

export interface ConnectionPreviewProps {
  startPosition: XYPosition;
  endPosition: XYPosition;
  isValid: boolean;
  isDragging: boolean;
}

export interface ValidationBadgeProps {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  position: XYPosition;
}

// ============================================================================
// Snap Indicator Component
// ============================================================================

export const SnapIndicator: React.FC<SnapIndicatorProps> = ({
  position,
  isValid,
  message,
  strength = 1.0,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    return () => setShow(false);
  }, []);

  // Spring animation for appearance
  const springProps = useSpring({
    from: { scale: 0.5, opacity: 0 },
    to: { scale: show ? 1 : 0.5, opacity: show ? 1 : 0 },
    config: config.wobbly,
  });

  // Pulsing animation
  const pulseProps = useSpring({
    from: { pulseScale: 1 },
    to: async (next) => {
      while (show) {
        await next({ pulseScale: 1.2 });
        await next({ pulseScale: 1 });
      }
    },
    config: { duration: 800 },
  });

  const color = isValid ? '#4CAF50' : '#FF9800';
  const ringColor = isValid ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)';

  return (
    <animated.div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: springProps.scale.to(s => `translate(-50%, -50%) scale(${s})`),
        opacity: springProps.opacity,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Outer ring */}
      <animated.div
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          left: -20,
          top: -20,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          backgroundColor: ringColor,
          transform: pulseProps.pulseScale.to(s => `scale(${s})`),
        }}
      />

      {/* Inner dot */}
      <div
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          left: -6,
          top: -6,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />

      {/* Connection strength indicator */}
      {strength < 1.0 && (
        <div
          style={{
            position: 'absolute',
            top: 25,
            left: -30,
            width: 60,
            height: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${strength * 100}%`,
              height: '100%',
              backgroundColor: color,
              transition: 'width 0.3s ease-in-out',
            }}
          />
        </div>
      )}

      {/* Message tooltip */}
      {message && (
        <animated.div
          style={{
            position: 'absolute',
            top: 35,
            left: -60,
            width: 120,
            padding: '4px 8px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: 4,
            fontSize: '0.75rem',
            textAlign: 'center',
            opacity: springProps.opacity,
          }}
        >
          {message}
        </animated.div>
      )}
    </animated.div>
  );
};

// ============================================================================
// Connection Preview Component
// ============================================================================

export const ConnectionPreview: React.FC<ConnectionPreviewProps> = ({
  startPosition,
  endPosition,
  isValid,
  isDragging,
}) => {
  // Animated path
  const pathProps = useSpring({
    from: { dashOffset: 0 },
    to: { dashOffset: isDragging ? -20 : 0 },
    loop: isDragging,
    config: { duration: 1000 },
  });

  // Color based on validity
  const color = isValid ? '#4CAF50' : '#F44336';
  const strokeWidth = isValid ? 2 : 3;
  const strokeDasharray = isValid ? '5,5' : '8,4';

  // Calculate path
  const dx = endPosition.x - startPosition.x;
  const dy = endPosition.y - startPosition.y;
  const controlPointOffset = Math.min(Math.abs(dx) * 0.5, 100);

  const pathData = `M ${startPosition.x} ${startPosition.y} C ${startPosition.x + controlPointOffset} ${startPosition.y}, ${endPosition.x - controlPointOffset} ${endPosition.y}, ${endPosition.x} ${endPosition.y}`;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <animated.path
        d={pathData}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={pathProps.dashOffset}
        fill="none"
        filter="url(#glow)"
        opacity={0.8}
      />

      {/* Arrowhead */}
      <polygon
        points={`${endPosition.x},${endPosition.y} ${endPosition.x - 8},${endPosition.y - 4} ${endPosition.x - 8},${endPosition.y + 4}`}
        fill={color}
        opacity={0.8}
      />
    </svg>
  );
};

// ============================================================================
// Validation Badge Component
// ============================================================================

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({
  isValid,
  errors = [],
  warnings = [],
  position,
}) => {
  const [expanded, setExpanded] = useState(false);

  const springProps = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: config.gentle,
  });

  const expandProps = useSpring({
    height: expanded ? 'auto' : 0,
    opacity: expanded ? 1 : 0,
    config: config.stiff,
  });

  const icon = isValid ? '✓' : errors.length > 0 ? '✗' : '⚠';
  const color = isValid ? '#4CAF50' : errors.length > 0 ? '#F44336' : '#FF9800';

  return (
    <animated.div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: springProps.scale.to(s => `translate(-50%, -100%) translateY(-10px) scale(${s})`),
        opacity: springProps.opacity,
        zIndex: 1001,
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem',
          backgroundColor: 'white',
          border: `2px solid ${color}`,
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color,
          boxShadow: `0 2px 8px ${color}40`,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        {!isValid && (
          <span>{errors.length > 0 ? errors.length : warnings.length}</span>
        )}
      </div>

      {/* Expanded details */}
      <animated.div
        style={{
          marginTop: '0.5rem',
          padding: expanded ? '0.5rem' : 0,
          backgroundColor: 'white',
          border: `1px solid ${color}`,
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '200px',
          overflow: 'hidden',
          ...expandProps,
        }}
      >
        {errors.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#F44336', marginBottom: '0.25rem' }}>
              ERRORS
            </div>
            {errors.map((error, idx) => (
              <div key={idx} style={{ fontSize: '0.65rem', color: '#F44336', marginBottom: '0.1rem' }}>
                • {error}
              </div>
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#FF9800', marginBottom: '0.25rem' }}>
              WARNINGS
            </div>
            {warnings.map((warning, idx) => (
              <div key={idx} style={{ fontSize: '0.65rem', color: '#FF9800', marginBottom: '0.1rem' }}>
                • {warning}
              </div>
            ))}
          </div>
        )}
      </animated.div>
    </animated.div>
  );
};

// ============================================================================
// Connection Success Animation Component
// ============================================================================

export interface ConnectionSuccessProps {
  position: XYPosition;
  onComplete?: () => void;
}

export const ConnectionSuccess: React.FC<ConnectionSuccessProps> = ({
  position,
  onComplete,
}) => {
  const [show, setShow] = useState(true);

  const springProps = useSpring({
    from: { scale: 0, opacity: 0, rotation: -180 },
    to: { scale: show ? 1 : 0, opacity: show ? 1 : 0, rotation: 0 },
    config: config.wobbly,
    onRest: () => {
      if (show) {
        setTimeout(() => {
          setShow(false);
          onComplete?.();
        }, 1000);
      }
    },
  });

  return (
    <animated.div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: springProps.scale.to(s =>
          `translate(-50%, -50%) scale(${s}) rotate(${springProps.rotation}deg)`
        ),
        opacity: springProps.opacity,
        pointerEvents: 'none',
        zIndex: 1002,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.5)',
        }}
      >
        ✓
      </div>
    </animated.div>
  );
};

// ============================================================================
// Drag Handle Component
// ============================================================================

export interface DragHandleProps {
  position: XYPosition;
  isActive: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  position,
  isActive,
  onDragStart,
  onDragEnd,
}) => {
  const springProps = useSpring({
    scale: isActive ? 1.2 : 1,
    backgroundColor: isActive ? '#2196F3' : '#9E9E9E',
    config: config.wobbly,
  });

  return (
    <animated.div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: springProps.scale.to(s => `translate(-50%, -50%) scale(${s})`),
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: springProps.backgroundColor,
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        cursor: 'grab',
        zIndex: 1000,
      }}
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
    />
  );
};
