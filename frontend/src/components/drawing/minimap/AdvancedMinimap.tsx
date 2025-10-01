/**
 * Advanced Minimap Component
 *
 * High-performance minimap with:
 * - Canvas-based rendering using OffscreenCanvas API
 * - QuadTree spatial indexing for efficient culling
 * - Level of Detail (LOD) system
 * - Interactive viewport navigation
 * - Configurable positioning and auto-hide
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useReactFlow, useStore, type Viewport } from 'reactflow';
import { QuadTree, calculateOptimalBounds, calculateOptimalCapacity } from '../../../utils/QuadTree';
import { LODManager, LODLevel, calculateRecommendedThresholds } from './MinimapLOD';

// ============================================================================
// Type Definitions
// ============================================================================

export type MinimapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface AdvancedMinimapProps {
  width?: number;
  height?: number;
  position?: MinimapPosition;
  backgroundColor?: string;
  viewportColor?: string;
  borderRadius?: number;
  enableResize?: boolean;
  enableAutoHide?: boolean;
  autoHideDelay?: number; // ms
  minZoomToShow?: number;
  maxZoomToShow?: number;
  enableLOD?: boolean;
  lodConfig?: {
    simplifiedThreshold?: number;
    normalThreshold?: number;
  };
  onViewportClick?: (x: number, y: number) => void;
  style?: React.CSSProperties;
}

export interface MinimapState {
  isDragging: boolean;
  isResizing: boolean;
  isVisible: boolean;
  dimensions: { width: number; height: number };
}

// ============================================================================
// Advanced Minimap Component
// ============================================================================

export const AdvancedMinimap: React.FC<AdvancedMinimapProps> = ({
  width = 200,
  height = 150,
  position = 'bottom-right',
  backgroundColor = '#ffffff',
  viewportColor = 'rgba(33, 150, 243, 0.3)',
  borderRadius = 8,
  enableResize: _enableResize = true,
  enableAutoHide = true,
  autoHideDelay = 2000,
  minZoomToShow = 0.1,
  maxZoomToShow = 2.0,
  enableLOD = true,
  lodConfig,
  onViewportClick,
  style,
}) => {
  const { getNodes, getEdges, setViewport } = useReactFlow();
  const viewport = useStore((state) => state.transform) as unknown as Viewport;

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<OffscreenCanvas | null>(null);
  const offscreenCtxRef = useRef<OffscreenCanvasRenderingContext2D | null>(null);

  // State
  const [state, setState] = useState<MinimapState>({
    isDragging: false,
    isResizing: false,
    isVisible: true,
    dimensions: { width, height },
  });

  const [lastInteraction, setLastInteraction] = useState<number>(Date.now());

  // QuadTree and LOD
  const quadTreeRef = useRef<QuadTree | null>(null);
  const lodManagerRef = useRef<LODManager | null>(null);

  // Animation frame
  const animationFrameRef = useRef<number | null>(null);

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    // Initialize LOD manager
    const thresholds = enableLOD ? calculateRecommendedThresholds() : { simplifiedThreshold: 1000, normalThreshold: 100 };

    lodManagerRef.current = new LODManager({
      ...thresholds,
      ...lodConfig,
      enableAdaptive: enableLOD,
    });

    // Initialize OffscreenCanvas if supported
    if (typeof OffscreenCanvas !== 'undefined') {
      offscreenCanvasRef.current = new OffscreenCanvas(state.dimensions.width, state.dimensions.height);
      offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d');
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ============================================================================
  // QuadTree Update
  // ============================================================================

  useEffect(() => {
    const nodes = getNodes();
    const _edges = getEdges();

    // Calculate optimal bounds for QuadTree
    const elements = nodes.map((node) => ({
      id: node.id,
      bounds: {
        x: node.position.x,
        y: node.position.y,
        width: (node.width as number) || 100,
        height: (node.height as number) || 80,
      },
      data: node,
    }));

    const bounds = calculateOptimalBounds(elements, 100);
    const capacity = calculateOptimalCapacity(nodes.length);

    // Rebuild QuadTree
    quadTreeRef.current = new QuadTree(bounds, capacity);
    elements.forEach((el) => quadTreeRef.current!.insert(el));

    // Trigger render
    scheduleRender();
  }, [getNodes, getEdges]);

  // ============================================================================
  // Rendering
  // ============================================================================

  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      render();
    });
  }, []);

  const render = useCallback(() => {
    if (!canvasRef.current || !quadTreeRef.current || !lodManagerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = offscreenCtxRef.current || canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = state.dimensions;
    const nodes = getNodes();
    const edges = getEdges();

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Calculate minimap bounds
    const {bounds} = quadTreeRef.current.getStats();
    const scaleX = width / bounds.width;
    const scaleY = height / bounds.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add padding

    const offsetX = (width - bounds.width * scale) / 2 - bounds.x * scale;
    const offsetY = (height - bounds.height * scale) / 2 - bounds.y * scale;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Calculate visible viewport bounds
    const viewportBounds = {
      x: -viewport[0] / viewport[2],
      y: -viewport[1] / viewport[2],
      width: window.innerWidth / viewport[2],
      height: window.innerHeight / viewport[2],
      zoom: viewport[2],
    };

    // Prepare render elements with LOD
    const renderElements = lodManagerRef.current.prepareRenderElements(
      nodes,
      edges,
      viewportBounds
    );

    // Render edges first (background)
    for (const element of renderElements) {
      if (element.type === 'edge') {
        const detailed = element.lodLevel === LODLevel.Detailed;
        lodManagerRef.current.renderEdge(ctx, element, scale, detailed);
      }
    }

    // Render nodes
    for (const element of renderElements) {
      if (element.type === 'node') {
        switch (element.lodLevel) {
          case LODLevel.Simplified:
            lodManagerRef.current.renderSimplifiedNode(ctx, element, scale);
            break;
          case LODLevel.Normal:
            lodManagerRef.current.renderNormalNode(ctx, element, scale);
            break;
          case LODLevel.Detailed:
            lodManagerRef.current.renderDetailedNode(ctx, element, scale);
            break;
        }
      }
    }

    ctx.restore();

    // Draw viewport rectangle
    const viewportX = (-viewport[0] / viewport[2]) * scale + offsetX;
    const viewportY = (-viewport[1] / viewport[2]) * scale + offsetY;
    const viewportWidth = (window.innerWidth / viewport[2]) * scale;
    const viewportHeight = (window.innerHeight / viewport[2]) * scale;

    ctx.strokeStyle = viewportColor.replace('0.3', '1');
    ctx.fillStyle = viewportColor;
    ctx.lineWidth = 2;
    ctx.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

    // Copy from offscreen canvas to main canvas if using OffscreenCanvas
    if (offscreenCanvasRef.current && offscreenCtxRef.current) {
      const mainCtx = canvas.getContext('2d');
      if (mainCtx) {
        mainCtx.clearRect(0, 0, width, height);
        mainCtx.drawImage(offscreenCanvasRef.current as any, 0, 0);
      }
    }
  }, [
    state.dimensions,
    viewport,
    backgroundColor,
    viewportColor,
    getNodes,
    getEdges,
  ]);

  // Trigger render on viewport or nodes change
  useEffect(() => {
    scheduleRender();
  }, [viewport, getNodes, getEdges, scheduleRender]);

  // ============================================================================
  // Auto-hide Logic
  // ============================================================================

  useEffect(() => {
    if (!enableAutoHide) return;

    const timer = setTimeout(() => {
      if (Date.now() - lastInteraction > autoHideDelay) {
        setState((prev) => ({ ...prev, isVisible: false }));
      }
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [lastInteraction, autoHideDelay, enableAutoHide]);

  // Show on interaction
  const handleInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    setState((prev) => ({ ...prev, isVisible: true }));
  }, []);

  // ============================================================================
  // Viewport Navigation
  // ============================================================================

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!quadTreeRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate click position in diagram coordinates
      const {bounds} = quadTreeRef.current.getStats();
      const scaleX = state.dimensions.width / bounds.width;
      const scaleY = state.dimensions.height / bounds.height;
      const scale = Math.min(scaleX, scaleY) * 0.9;

      const offsetX = (state.dimensions.width - bounds.width * scale) / 2 - bounds.x * scale;
      const offsetY = (state.dimensions.height - bounds.height * scale) / 2 - bounds.y * scale;

      const diagramX = (x - offsetX) / scale;
      const diagramY = (y - offsetY) / scale;

      // Center viewport on clicked position
      const newX = -diagramX * viewport[2] + window.innerWidth / 2;
      const newY = -diagramY * viewport[2] + window.innerHeight / 2;

      setViewport({ x: newX, y: newY, zoom: viewport[2] }, { duration: 300 });

      onViewportClick?.(diagramX, diagramY);
      handleInteraction();
    },
    [state.dimensions, viewport, setViewport, onViewportClick, handleInteraction]
  );

  // ============================================================================
  // Viewport Dragging
  // ============================================================================

  const handleMouseDown = useCallback(
    (_e: React.MouseEvent<HTMLCanvasElement>) => {
      setState((prev) => ({ ...prev, isDragging: true }));
      handleInteraction();
    },
    [handleInteraction]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!state.isDragging || !quadTreeRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate position in diagram coordinates
      const {bounds} = quadTreeRef.current.getStats();
      const scaleX = state.dimensions.width / bounds.width;
      const scaleY = state.dimensions.height / bounds.height;
      const scale = Math.min(scaleX, scaleY) * 0.9;

      const offsetX = (state.dimensions.width - bounds.width * scale) / 2 - bounds.x * scale;
      const offsetY = (state.dimensions.height - bounds.height * scale) / 2 - bounds.y * scale;

      const diagramX = (x - offsetX) / scale;
      const diagramY = (y - offsetY) / scale;

      const newX = -diagramX * viewport[2] + window.innerWidth / 2;
      const newY = -diagramY * viewport[2] + window.innerHeight / 2;

      setViewport({ x: newX, y: newY, zoom: viewport[2] });
    },
    [state.isDragging, state.dimensions, viewport, setViewport]
  );

  const handleMouseUp = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  // ============================================================================
  // Visibility Check
  // ============================================================================

  const isVisible = useMemo(() => {
    const zoom = viewport[2];
    if (zoom < minZoomToShow || zoom > maxZoomToShow) return false;
    return state.isVisible;
  }, [viewport, minZoomToShow, maxZoomToShow, state.isVisible]);

  // ============================================================================
  // Position Styles
  // ============================================================================

  const positionStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      borderRadius: `${borderRadius}px`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      cursor: state.isDragging ? 'grabbing' : 'grab',
      transition: 'opacity 0.3s ease-in-out',
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
    };

    const margin = 16;

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: margin, left: margin };
      case 'top-right':
        return { ...baseStyles, top: margin, right: margin };
      case 'bottom-left':
        return { ...baseStyles, bottom: margin, left: margin };
      case 'bottom-right':
        return { ...baseStyles, bottom: margin, right: margin };
      default:
        return baseStyles;
    }
  }, [position, borderRadius, state.isDragging, isVisible]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      style={{ ...positionStyles, ...style }}
      onMouseEnter={handleInteraction}
      onMouseLeave={() => {
        setState((prev) => ({ ...prev, isDragging: false }));
      }}
    >
      <canvas
        ref={canvasRef}
        width={state.dimensions.width}
        height={state.dimensions.height}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          display: 'block',
          backgroundColor,
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* LOD stats overlay (optional, for debugging) */}
      {process.env.NODE_ENV === 'development' && lodManagerRef.current && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            fontSize: '10px',
            color: '#666',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2px 4px',
            borderRadius: '2px',
          }}
        >
          LOD: {lodManagerRef.current.getStats().currentLevel} |{' '}
          {lodManagerRef.current.getStats().visibleElements} visible
        </div>
      )}
    </div>
  );
};

export default AdvancedMinimap;
