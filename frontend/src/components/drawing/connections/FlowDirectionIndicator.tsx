/**
 * Flow Direction Indicator Component
 *
 * Displays directional arrows on connections to indicate flow direction
 * with automatic positioning based on connection angles.
 */

import React, { useMemo } from 'react';
import type { Edge } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface FlowDirectionIndicatorProps {
  edge: Edge;
  flowDirection?: 'forward' | 'reverse' | 'bidirectional';
  style?: React.CSSProperties;
  animated?: boolean;
  color?: string;
  size?: number;
}

export interface ArrowConfig {
  path: string;
  position: { x: number; y: number };
  rotation: number;
}

// ============================================================================
// Flow Direction Indicator Component
// ============================================================================

export const FlowDirectionIndicator: React.FC<FlowDirectionIndicatorProps> = ({
  edge,
  flowDirection = 'forward',
  style,
  animated = false,
  color = '#555',
  size = 8,
}) => {
  // Calculate arrow positions and rotations
  const arrows = useMemo(() => {
    if (!edge.source || !edge.target) return [];

    const edgePath = edge.data?.path || [];
    if (edgePath.length < 2) return [];

    const arrowConfigs: ArrowConfig[] = [];

    if (flowDirection === 'forward' || flowDirection === 'bidirectional') {
      // Forward arrows
      const forwardArrows = generateArrowsAlongPath(edgePath, size, 3);
      arrowConfigs.push(...forwardArrows);
    }

    if (flowDirection === 'reverse' || flowDirection === 'bidirectional') {
      // Reverse arrows
      const reverseArrows = generateArrowsAlongPath(edgePath, size, 3, true);
      arrowConfigs.push(...reverseArrows);
    }

    return arrowConfigs;
  }, [edge, flowDirection, size]);

  if (arrows.length === 0) return null;

  return (
    <g className="flow-direction-indicators">
      {arrows.map((arrow, index) => (
        <g
          key={index}
          transform={`translate(${arrow.position.x}, ${arrow.position.y}) rotate(${arrow.rotation})`}
          style={style}
        >
          <path
            d={arrow.path}
            fill={color}
            stroke={color}
            strokeWidth={1}
            className={animated ? 'flow-arrow-animated' : ''}
          />
        </g>
      ))}
    </g>
  );
};

// ============================================================================
// Arrow Marker Component for Edge Definitions
// ============================================================================

export interface ArrowMarkerProps {
  id: string;
  color?: string;
  size?: number;
}

export const ArrowMarker: React.FC<ArrowMarkerProps> = ({
  id,
  color = '#555',
  size = 6,
}) => {
  return (
    <defs>
      <marker
        id={id}
        markerWidth={size * 2}
        markerHeight={size * 2}
        refX={size}
        refY={size}
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d={`M 0 0 L ${size * 2} ${size} L 0 ${size * 2} z`}
          fill={color}
        />
      </marker>
    </defs>
  );
};

// ============================================================================
// Animated Flow Arrows Component
// ============================================================================

export interface AnimatedFlowArrowsProps {
  edge: Edge;
  flowDirection?: 'forward' | 'reverse' | 'bidirectional';
  arrowCount?: number;
  speed?: number;
  color?: string;
  size?: number;
}

export const AnimatedFlowArrows: React.FC<AnimatedFlowArrowsProps> = ({
  edge,
  flowDirection = 'forward',
  arrowCount = 3,
  speed = 2,
  color = '#2196F3',
  size = 10,
}) => {
  const [animationOffset, setAnimationOffset] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset((prev) => (prev + 1) % 100);
    }, 1000 / (speed * 10));

    return () => clearInterval(interval);
  }, [speed]);

  const arrows = useMemo(() => {
    if (!edge.source || !edge.target) return [];

    const edgePath = edge.data?.path || [];
    if (edgePath.length < 2) return [];

    const pathLength = calculatePathLength(edgePath);
    const spacing = pathLength / (arrowCount + 1);

    const arrowConfigs: ArrowConfig[] = [];

    for (let i = 1; i <= arrowCount; i++) {
      const distance = (spacing * i + (animationOffset / 100) * spacing) % pathLength;
      const arrow = getArrowAtDistance(edgePath, distance, size, flowDirection === 'reverse');
      if (arrow) {
        arrowConfigs.push(arrow);
      }
    }

    return arrowConfigs;
  }, [edge, arrowCount, animationOffset, size, flowDirection]);

  return (
    <g className="animated-flow-arrows">
      {arrows.map((arrow, index) => (
        <g
          key={index}
          transform={`translate(${arrow.position.x}, ${arrow.position.y}) rotate(${arrow.rotation})`}
          style={{ transition: 'all 0.1s linear' }}
        >
          <path
            d={arrow.path}
            fill={color}
            stroke={color}
            strokeWidth={1}
            opacity={0.8}
          />
        </g>
      ))}
    </g>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate arrow path (SVG path data)
 */
function generateArrowPath(size: number): string {
  const halfSize = size / 2;
  return `M -${halfSize} -${halfSize} L ${size} 0 L -${halfSize} ${halfSize} Z`;
}

/**
 * Generate arrows along a path
 */
function generateArrowsAlongPath(
  path: Array<{ x: number; y: number }>,
  size: number,
  count: number,
  reverse: boolean = false
): ArrowConfig[] {
  const arrows: ArrowConfig[] = [];
  const pathLength = calculatePathLength(path);
  const spacing = pathLength / (count + 1);

  for (let i = 1; i <= count; i++) {
    const distance = spacing * i;
    const arrow = getArrowAtDistance(path, distance, size, reverse);
    if (arrow) {
      arrows.push(arrow);
    }
  }

  return arrows;
}

/**
 * Get arrow configuration at specific distance along path
 */
function getArrowAtDistance(
  path: Array<{ x: number; y: number }>,
  distance: number,
  size: number,
  reverse: boolean = false
): ArrowConfig | null {
  let accumulatedDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];

    const segmentLength = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );

    if (accumulatedDistance + segmentLength >= distance) {
      // Arrow is on this segment
      const segmentDistance = distance - accumulatedDistance;
      const t = segmentDistance / segmentLength;

      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;

      let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

      if (reverse) {
        angle += 180;
      }

      return {
        path: generateArrowPath(size),
        position: { x, y },
        rotation: angle,
      };
    }

    accumulatedDistance += segmentLength;
  }

  return null;
}

/**
 * Calculate total path length
 */
function calculatePathLength(path: Array<{ x: number; y: number }>): number {
  let length = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];

    length += Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
  }

  return length;
}

// ============================================================================
// CSS for Animations
// ============================================================================

export const FlowArrowStyles = `
  .flow-arrow-animated {
    animation: flow-pulse 1s ease-in-out infinite;
  }

  @keyframes flow-pulse {
    0%, 100% {
      opacity: 0.8;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .flow-direction-indicators path {
    transition: fill 0.2s ease-in-out;
  }

  .flow-direction-indicators:hover path {
    fill: #2196F3;
  }
`;

// ============================================================================
// Flow Direction Badge Component
// ============================================================================

export interface FlowDirectionBadgeProps {
  direction: 'forward' | 'reverse' | 'bidirectional';
  label?: string;
  style?: React.CSSProperties;
}

export const FlowDirectionBadge: React.FC<FlowDirectionBadgeProps> = ({
  direction,
  label,
  style,
}) => {
  const getIcon = () => {
    switch (direction) {
      case 'forward':
        return '→';
      case 'reverse':
        return '←';
      case 'bidirectional':
        return '⇄';
    }
  };

  const getColor = () => {
    switch (direction) {
      case 'forward':
        return '#4CAF50';
      case 'reverse':
        return '#2196F3';
      case 'bidirectional':
        return '#FF9800';
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        background: 'white',
        border: `1px solid ${getColor()}`,
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: getColor(),
        ...style,
      }}
    >
      <span style={{ fontSize: '1rem' }}>{getIcon()}</span>
      {label && <span>{label}</span>}
    </div>
  );
};
