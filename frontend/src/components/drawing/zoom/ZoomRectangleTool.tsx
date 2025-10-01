/**
 * Zoom Rectangle Tool Component
 *
 * Interactive tool for selecting a rectangular area to zoom into.
 * Features:
 * - Drag to create selection rectangle
 * - Visual feedback with semi-transparent overlay
 * - Smooth zoom animation to selected area
 * - Keyboard activation (Z key)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ZoomRectangleToolProps {
  enabled?: boolean;
  activationKey?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  minRectangleSize?: number;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

interface Rectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// ============================================================================
// Zoom Rectangle Tool Component
// ============================================================================

export const ZoomRectangleTool: React.FC<ZoomRectangleToolProps> = ({
  enabled = false,
  activationKey = 'z',
  strokeColor = '#2196F3',
  fillColor = 'rgba(33, 150, 243, 0.1)',
  strokeWidth = 2,
  minRectangleSize = 20,
  onActivate,
  onDeactivate,
}) => {
  const { getViewport, setViewport } = useReactFlow();

  const [isActive, setIsActive] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangle, setRectangle] = useState<Rectangle | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Activation/Deactivation
  // ============================================================================

  useEffect(() => {
    if (enabled && !isActive) {
      setIsActive(true);
      onActivate?.();
    } else if (!enabled && isActive) {
      setIsActive(false);
      setIsDrawing(false);
      setRectangle(null);
      onDeactivate?.();
    }
  }, [enabled, isActive, onActivate, onDeactivate]);

  // ============================================================================
  // Keyboard Activation
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === activationKey && !isActive) {
        setIsActive(true);
        onActivate?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === activationKey && isActive) {
        setIsActive(false);
        setIsDrawing(false);
        setRectangle(null);
        onDeactivate?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activationKey, isActive, onActivate, onDeactivate]);

  // ============================================================================
  // Mouse Event Handlers
  // ============================================================================

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      setRectangle({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    },
    [isActive]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive || !isDrawing || !rectangle) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setRectangle({
        ...rectangle,
        endX: x,
        endY: y,
      });
    },
    [isActive, isDrawing, rectangle]
  );

  const handleMouseUp = useCallback(() => {
    if (!isActive || !isDrawing || !rectangle) return;

    const width = Math.abs(rectangle.endX - rectangle.startX);
    const height = Math.abs(rectangle.endY - rectangle.startY);

    // Only zoom if rectangle is large enough
    if (width >= minRectangleSize && height >= minRectangleSize) {
      performZoom(rectangle);
    }

    setIsDrawing(false);
    setRectangle(null);
  }, [isActive, isDrawing, rectangle, minRectangleSize]);

  // ============================================================================
  // Zoom to Rectangle
  // ============================================================================

  const performZoom = useCallback(
    (rect: Rectangle) => {
      const viewport = getViewport();

      // Calculate rectangle in screen coordinates
      const minX = Math.min(rect.startX, rect.endX);
      const minY = Math.min(rect.startY, rect.endY);
      const maxX = Math.max(rect.startX, rect.endX);
      const maxY = Math.max(rect.startY, rect.endY);

      const rectWidth = maxX - minX;
      const rectHeight = maxY - minY;

      // Convert screen coordinates to flow coordinates
      const flowMinX = (minX - viewport.x) / viewport.zoom;
      const flowMinY = (minY - viewport.y) / viewport.zoom;
      const flowMaxX = (maxX - viewport.x) / viewport.zoom;
      const flowMaxY = (maxY - viewport.y) / viewport.zoom;

      const flowWidth = flowMaxX - flowMinX;
      const flowHeight = flowMaxY - flowMinY;
      const flowCenterX = flowMinX + flowWidth / 2;
      const flowCenterY = flowMinY + flowHeight / 2;

      // Calculate zoom level to fit rectangle
      const scaleX = window.innerWidth / rectWidth;
      const scaleY = window.innerHeight / rectHeight;
      const targetZoom = Math.min(scaleX, scaleY) * viewport.zoom * 0.9; // 90% to add padding

      // Calculate new viewport position
      const newX = window.innerWidth / 2 - flowCenterX * targetZoom;
      const newY = window.innerHeight / 2 - flowCenterY * targetZoom;

      // Animate to new viewport
      const startX = viewport.x;
      const startY = viewport.y;
      const startZoom = viewport.zoom;
      const startTime = performance.now();
      const duration = 500;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const x = startX + (newX - startX) * easeProgress;
        const y = startY + (newY - startY) * easeProgress;
        const zoom = startZoom + (targetZoom - startZoom) * easeProgress;

        setViewport({ x, y, zoom });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
    [getViewport, setViewport]
  );

  // ============================================================================
  // Canvas Rendering
  // ============================================================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!rectangle) return;

    const minX = Math.min(rectangle.startX, rectangle.endX);
    const minY = Math.min(rectangle.startY, rectangle.endY);
    const width = Math.abs(rectangle.endX - rectangle.startX);
    const height = Math.abs(rectangle.endY - rectangle.startY);

    // Draw rectangle
    ctx.fillStyle = fillColor;
    ctx.fillRect(minX, minY, width, height);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeRect(minX, minY, width, height);

    // Draw size indicator
    if (width >= minRectangleSize && height >= minRectangleSize) {
      const text = `${Math.round(width)} × ${Math.round(height)}`;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(text, minX + width / 2, minY - 8);
    }
  }, [rectangle, strokeColor, fillColor, strokeWidth, minRectangleSize]);

  // ============================================================================
  // Resize Canvas
  // ============================================================================

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        zIndex: 1000,
        pointerEvents: 'all',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Instruction Tooltip */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 500,
          pointerEvents: 'none',
        }}
      >
        Drag to select area to zoom • Release {activationKey.toUpperCase()} to cancel
      </div>
    </div>
  );
};

// ============================================================================
// Zoom Rectangle Tool Button
// ============================================================================

export interface ZoomRectangleButtonProps {
  onActivate?: () => void;
  onDeactivate?: () => void;
  activationKey?: string;
  style?: React.CSSProperties;
}

export const ZoomRectangleButton: React.FC<ZoomRectangleButtonProps> = ({
  onActivate,
  onDeactivate,
  activationKey = 'z',
  style,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      onDeactivate?.();
    } else {
      setIsActive(true);
      onActivate?.();
    }
  }, [isActive, onActivate, onDeactivate]);

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: isActive ? '#2196F3' : 'white',
    color: isActive ? 'white' : '#333',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease-in-out',
    ...style,
  };

  return (
    <button
      onClick={handleClick}
      style={buttonStyle}
      title={`Zoom Rectangle Tool (${activationKey.toUpperCase()})`}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.target as HTMLButtonElement).style.backgroundColor = 'white';
        }
      }}
    >
      <span style={{ fontSize: '16px' }}>⊡</span>
      <span style={{ fontSize: '11px', opacity: 0.7 }}>{activationKey.toUpperCase()}</span>
    </button>
  );
};

export default ZoomRectangleTool;
