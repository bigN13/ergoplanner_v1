/**
 * Magnetic Connection Behavior Component
 * Implements auto-snap functionality with visual feedback for connection points
 * Part of Task #72 - Build Intelligent Connection System
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useReactFlow, type Node, type XYPosition } from 'reactflow';
import { intelligentConnectionValidator } from '@/services/IntelligentConnectionValidator';
import { connectionPointManager } from '@/services/ConnectionPointManager';
import type { ConnectionPoint } from '@/types/connectionPoint';

interface MagneticConnectionBehaviorProps {
  enabled?: boolean;
  snapDistance?: number;
  showVisualFeedback?: boolean;
  onSnapTarget?: (target: { point: ConnectionPoint; node: Node; position: XYPosition } | null) => void;
}

interface SnapTarget {
  point: ConnectionPoint;
  node: Node;
  position: XYPosition;
  distance: number;
}

interface ConnectionPreview {
  start: XYPosition;
  end: XYPosition;
  isValid: boolean;
  feedbackClass: string;
}

export default function MagneticConnectionBehavior({
  enabled = true,
  snapDistance = 20,
  showVisualFeedback = true,
  onSnapTarget
}: MagneticConnectionBehaviorProps): React.JSX.Element {
  const { getNodes, project, screenToFlowPosition } = useReactFlow();
  const [isDragging, setIsDragging] = useState(false);
  const [currentSnapTarget, setCurrentSnapTarget] = useState<SnapTarget | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<ConnectionPreview | null>(null);
  const [dragStart, setDragStart] = useState<{ point: ConnectionPoint; node: Node; position: XYPosition } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef<XYPosition>({ x: 0, y: 0 });

  /**
   * Find the nearest connection point within snap distance
   */
  const findNearestConnectionPoint = useCallback((position: XYPosition, excludeNodeId?: string): SnapTarget | null => {
    if (!enabled) return null;

    const nodes = getNodes();
    let bestTarget: SnapTarget | null = null;

    for (const node of nodes) {
      if (node.id === excludeNodeId) continue;

      const connectionPoints = connectionPointManager.getConnectionPoints(node);
      const nodeWidth = node.width || 100;
      const nodeHeight = node.height || 60;

      for (const point of connectionPoints) {
        // Calculate absolute position of connection point
        const absoluteX = node.position.x + (point.position.x * nodeWidth);
        const absoluteY = node.position.y + (point.position.y * nodeHeight);

        const distance = Math.sqrt(
          Math.pow(absoluteX - position.x, 2) +
          Math.pow(absoluteY - position.y, 2)
        );

        if (distance <= snapDistance) {
          if (!bestTarget || distance < bestTarget.distance) {
            bestTarget = {
              point,
              node,
              position: { x: absoluteX, y: absoluteY },
              distance
            };
          }
        }
      }
    }

    return bestTarget;
  }, [enabled, snapDistance, getNodes]);

  /**
   * Handle mouse move during connection drag
   */
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled || !isDragging) return;

    const flowPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    mousePosition.current = flowPosition;

    // Find snap target
    const snapTarget = findNearestConnectionPoint(
      flowPosition,
      dragStart?.node.id
    );

    setCurrentSnapTarget(snapTarget);

    // Update connection preview
    if (dragStart) {
      const endPosition = snapTarget ? snapTarget.position : flowPosition;

      let isValid = false;
      let feedbackClass = 'connection-preview';

      if (snapTarget && dragStart.point) {
        const { isValid: validationResult } = intelligentConnectionValidator.validateConnection(
          dragStart.point,
          snapTarget.point
        );
        isValid = validationResult;
        feedbackClass = intelligentConnectionValidator.getConnectionFeedbackClass(
          dragStart.point,
          snapTarget.point
        );
      }

      setConnectionPreview({
        start: dragStart.position,
        end: endPosition,
        isValid,
        feedbackClass
      });
    }

    // Notify parent component of snap target
    if (onSnapTarget) {
      onSnapTarget(snapTarget ? {
        point: snapTarget.point,
        node: snapTarget.node,
        position: snapTarget.position
      } : null);
    }
  }, [enabled, isDragging, dragStart, findNearestConnectionPoint, screenToFlowPosition, onSnapTarget]);

  /**
   * Handle mouse up to complete connection
   */
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!enabled || !isDragging) return;

    setIsDragging(false);
    setConnectionPreview(null);
    setCurrentSnapTarget(null);
    setDragStart(null);

    // If we have a snap target, create the connection
    if (currentSnapTarget && dragStart) {
      // Emit connection event (this would integrate with ReactFlow's connection system)
      const customEvent = new CustomEvent('magneticConnection', {
        detail: {
          source: {
            nodeId: dragStart.node.id,
            handleId: dragStart.point.id,
            position: dragStart.position
          },
          target: {
            nodeId: currentSnapTarget.node.id,
            handleId: currentSnapTarget.point.id,
            position: currentSnapTarget.position
          }
        }
      });

      window.dispatchEvent(customEvent);
    }
  }, [enabled, isDragging, currentSnapTarget, dragStart]);

  /**
   * Start connection drag from a connection point
   */
  const startConnectionDrag = useCallback((
    point: ConnectionPoint,
    node: Node,
    position: XYPosition
  ) => {
    if (!enabled) return;

    setIsDragging(true);
    setDragStart({ point, node, position });
    setConnectionPreview({
      start: position,
      end: position,
      isValid: false,
      feedbackClass: 'connection-preview'
    });
  }, [enabled]);

  /**
   * Handle connection point click/drag start
   */
  const handleConnectionPointInteraction = useCallback((event: React.MouseEvent, point: ConnectionPoint, node: Node) => {
    event.stopPropagation();

    const flowPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    startConnectionDrag(point, node, flowPosition);
  }, [screenToFlowPosition, startConnectionDrag]);

  // Set up mouse event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, handleMouseMove, handleMouseUp]);

  /**
   * Render connection points for a node
   */
  const renderConnectionPoints = useCallback((node: Node) => {
    if (!showVisualFeedback) return null;

    const connectionPoints = connectionPointManager.getConnectionPoints(node);
    const nodeWidth = node.width || 100;
    const nodeHeight = node.height || 60;

    return connectionPoints.map(point => {
      const x = point.position.x * nodeWidth;
      const y = point.position.y * nodeHeight;

      // Determine if this is the current snap target
      const isSnapTarget = currentSnapTarget?.point.id === point.id;
      const {isConnected} = point;

      let className = 'connection-point';
      if (isSnapTarget) {
        className += ' connection-point-snap-target';
      }
      if (isConnected) {
        className += ' connection-point-connected';
      }
      if (isDragging) {
        className += ' connection-point-dragging';
      }

      return (
        <div
          key={point.id}
          className={className}
          style={{
            position: 'absolute',
            left: x - 4,
            top: y - 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: point.style?.color || '#3b82f6',
            border: '2px solid white',
            cursor: 'crosshair',
            zIndex: 1000,
            transform: isSnapTarget ? 'scale(1.5)' : 'scale(1)',
            transition: 'transform 0.1s ease-in-out',
            boxShadow: isSnapTarget ? '0 0 10px rgba(59, 130, 246, 0.8)' : 'none'
          }}
          onMouseDown={(e) => handleConnectionPointInteraction(e, point, node)}
          title={point.label || `${point.type} connection`}
        />
      );
    });
  }, [showVisualFeedback, currentSnapTarget, isDragging, handleConnectionPointInteraction]);

  /**
   * Render connection preview line
   */
  const renderConnectionPreview = useCallback(() => {
    if (!connectionPreview || !showVisualFeedback) return null;

    const { start, end, feedbackClass } = connectionPreview;

    // Calculate line properties
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    let strokeColor = '#6b7280'; // Default gray
    let strokeWidth = 2;
    let strokeDasharray = 'none';

    switch (feedbackClass) {
      case 'connection-valid':
        strokeColor = '#10b981'; // Green
        strokeWidth = 3;
        break;
      case 'connection-warning':
        strokeColor = '#f59e0b'; // Yellow
        strokeWidth = 3;
        strokeDasharray = '5,5';
        break;
      case 'connection-invalid':
        strokeColor = '#ef4444'; // Red
        strokeWidth = 3;
        strokeDasharray = '3,3';
        break;
    }

    return (
      <div
        className="connection-preview-line"
        style={{
          position: 'absolute',
          left: start.x,
          top: start.y,
          width: length,
          height: strokeWidth,
          backgroundColor: strokeColor,
          transformOrigin: '0 50%',
          transform: `rotate(${angle}deg)`,
          zIndex: 999,
          pointerEvents: 'none',
          opacity: 0.8,
          ...(strokeDasharray !== 'none' && {
            backgroundImage: `repeating-linear-gradient(90deg, ${strokeColor} 0, ${strokeColor} 3px, transparent 3px, transparent 6px)`
          })
        }}
      />
    );
  }, [connectionPreview, showVisualFeedback]);

  /**
   * Render snap indicator (pulsing circle at snap target)
   */
  const renderSnapIndicator = useCallback(() => {
    if (!currentSnapTarget || !showVisualFeedback) return null;

    const { position } = currentSnapTarget;

    return (
      <div
        className="snap-indicator"
        style={{
          position: 'absolute',
          left: position.x - 15,
          top: position.y - 15,
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: '2px solid #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          zIndex: 1001,
          animation: 'pulse 1s infinite',
          pointerEvents: 'none'
        }}
      />
    );
  }, [currentSnapTarget, showVisualFeedback]);

  if (!enabled) {
    return <></>;
  }

  return (
    <div ref={containerRef} className="magnetic-connection-behavior">
      {/* Render connection points for all nodes */}
      {getNodes().map(node => (
        <div
          key={`connection-points-${node.id}`}
          style={{
            position: 'absolute',
            left: node.position.x,
            top: node.position.y,
            width: node.width || 100,
            height: node.height || 60,
            pointerEvents: 'none'
          }}
        >
          {renderConnectionPoints(node)}
        </div>
      ))}

      {/* Render connection preview */}
      {renderConnectionPreview()}

      {/* Render snap indicator */}
      {renderSnapIndicator()}

      {/* CSS Styles */}
      <style jsx>{`
        .connection-point {
          transition: all 0.1s ease-in-out;
        }

        .connection-point:hover {
          transform: scale(1.2) !important;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
        }

        .connection-point-snap-target {
          animation: pulse 0.5s infinite alternate;
        }

        .connection-point-connected {
          background-color: #10b981 !important;
        }

        .connection-point-dragging {
          pointer-events: all;
        }

        .snap-indicator {
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }

        .connection-preview-line {
          transition: all 0.1s ease-in-out;
        }

        /* Magnetic effect animation */
        .connection-point-snap-target {
          animation: magnetic-pulse 0.3s ease-in-out infinite alternate;
        }

        @keyframes magnetic-pulse {
          0% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
          }
          100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 1), 0 0 30px rgba(59, 130, 246, 0.5);
          }
        }
      `}</style>
    </div>
  );
}