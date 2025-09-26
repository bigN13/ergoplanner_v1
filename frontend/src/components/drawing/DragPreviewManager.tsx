"use client";

import * as htmlToImage from "html-to-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Node } from "reactflow";

/**
 * Preview cache for performance optimization
 * Stores generated canvas elements keyed by element ID + configuration
 */
const previewCache = new Map<string, HTMLCanvasElement>();

export interface DragPreviewState {
  element: HTMLElement | Node | null;
  position: { x: number; y: number };
  offset: { x: number; y: number };
  isVisible: boolean;
  isDragging: boolean;
  opacity: number;
  scale: number;
  multiSelection?: Node[];
}

interface DragPreviewManagerProps {
  previewState: DragPreviewState;
  onPositionUpdate: (position: { x: number; y: number }) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

/**
 * Enhanced Drag Preview Manager
 *
 * Provides a sophisticated drag preview system with:
 * - Semi-transparent previews using React Portals
 * - Smart positioning with cursor-relative or grab-offset positioning
 * - Performance optimizations with 60fps updates and caching
 * - Support for multi-selection previews
 * - HTML5 Canvas rendering for complex shapes
 */
export const DragPreviewManager: React.FC<DragPreviewManagerProps> = ({
  previewState,
  onPositionUpdate,
  onDragStart,
  onDragEnd,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate preview canvas from element or node
  const generatePreview = useCallback(
    async (element: HTMLElement | Node, cacheKey: string): Promise<HTMLCanvasElement | null> => {
      // Check cache first
      const cached = previewCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      setIsGenerating(true);

      try {
        let canvas: HTMLCanvasElement;

        if ("id" in element && "position" in element) {
          // ReactFlow Node - need to find the actual DOM element
          const nodeElement = document.querySelector(`[data-id="${element.id}"]`) as HTMLElement;
          if (!nodeElement) {
            console.warn(`Could not find DOM element for node ${element.id}`);
            return null;
          }

          canvas = await htmlToImage.toCanvas(nodeElement, {
            backgroundColor: "transparent",
            pixelRatio: window.devicePixelRatio || 1,
            width: nodeElement.offsetWidth,
            height: nodeElement.offsetHeight,
          });
        } else {
          // Regular HTML element
          canvas = await htmlToImage.toCanvas(element as HTMLElement, {
            backgroundColor: "transparent",
            pixelRatio: window.devicePixelRatio || 1,
          });
        }

        // Scale down large previews for performance
        if (canvas.width > 500 || canvas.height > 500) {
          const scale = Math.min(500 / canvas.width, 500 / canvas.height);
          const scaledCanvas = document.createElement("canvas");
          scaledCanvas.width = canvas.width * scale;
          scaledCanvas.height = canvas.height * scale;

          const ctx = scaledCanvas.getContext("2d");
          if (ctx) {
            ctx.scale(scale, scale);
            ctx.drawImage(canvas, 0, 0);
            canvas = scaledCanvas;
          }
        }

        // Cache the generated preview
        previewCache.set(cacheKey, canvas);

        return canvas;
      } catch (error) {
        console.error("Failed to generate drag preview:", error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Generate composite preview for multi-selection
  const generateMultiSelectionPreview = useCallback(
    async (nodes: Node[]): Promise<HTMLCanvasElement | null> => {
      if (nodes.length === 0) return null;

      const cacheKey = `multi-${nodes.map((n) => n.id).join(",")}`;
      const cached = previewCache.get(cacheKey);
      if (cached) return cached;

      try {
        setIsGenerating(true);

        // Calculate bounding box of all nodes
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        const nodeElements = await Promise.all(
          nodes.map(async (node) => {
            const element = document.querySelector(`[data-id="${node.id}"]`) as HTMLElement;
            if (element) {
              const canvas = await htmlToImage.toCanvas(element, {
                backgroundColor: "transparent",
                pixelRatio: 1,
              });

              minX = Math.min(minX, node.position.x);
              minY = Math.min(minY, node.position.y);
              maxX = Math.max(maxX, node.position.x + (element.offsetWidth || 100));
              maxY = Math.max(maxY, node.position.y + (element.offsetHeight || 100));

              return { node, canvas, element };
            }
            return null;
          })
        );

        const validElements = nodeElements.filter(Boolean);
        if (validElements.length === 0) return null;

        // Create composite canvas
        const compositeCanvas = document.createElement("canvas");
        const width = maxX - minX;
        const height = maxY - minY;

        compositeCanvas.width = Math.min(width, 800);
        compositeCanvas.height = Math.min(height, 600);

        const ctx = compositeCanvas.getContext("2d");
        if (!ctx) return null;

        // Scale if needed
        const scaleX = compositeCanvas.width / width;
        const scaleY = compositeCanvas.height / height;
        const scale = Math.min(scaleX, scaleY);

        ctx.scale(scale, scale);

        // Draw each node at its relative position
        validElements.forEach((element) => {
          if (element && element.canvas) {
            const relativeX = element.node.position.x - minX;
            const relativeY = element.node.position.y - minY;
            ctx.drawImage(element.canvas, relativeX, relativeY);
          }
        });

        previewCache.set(cacheKey, compositeCanvas);
        return compositeCanvas;
      } catch (error) {
        console.error("Failed to generate multi-selection preview:", error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Update preview when state changes
  useEffect(() => {
    if (!previewState.element || !previewState.isVisible) {
      setPreviewCanvas(null);
      return;
    }

    const updatePreview = async (): Promise<void> => {
      if (previewState.multiSelection && previewState.multiSelection.length > 1) {
        // Multi-selection preview
        const canvas = await generateMultiSelectionPreview(previewState.multiSelection);
        setPreviewCanvas(canvas);
      } else {
        // Single element preview
        const cacheKey = previewState.element
          ? "id" in previewState.element
            ? `node-${previewState.element.id}`
            : `element-${(previewState.element as HTMLElement).className}`
          : "unknown";

        const canvas = previewState.element
          ? await generatePreview(previewState.element, cacheKey)
          : null;
        setPreviewCanvas(canvas);
      }
    };

    updatePreview();
  }, [
    previewState.element,
    previewState.isVisible,
    previewState.multiSelection,
    generatePreview,
    generateMultiSelectionPreview,
  ]);

  // Smooth position updates with requestAnimationFrame
  useEffect(() => {
    if (!previewState.isDragging) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTime = 0;
    const throttleInterval = 16; // ~60fps

    const updatePosition = (timestamp: number): void => {
      if (timestamp - lastTime >= throttleInterval) {
        if (previewRef.current) {
          const x = previewState.position.x - previewState.offset.x;
          const y = previewState.position.y - previewState.offset.y;

          previewRef.current.style.transform = `translate(${x}px, ${y}px) scale(${previewState.scale})`;
          onPositionUpdate({ x, y });
        }
        lastTime = timestamp;
      }

      if (previewState.isDragging) {
        animationRef.current = requestAnimationFrame(updatePosition);
      }
    };

    animationRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    previewState.position,
    previewState.offset,
    previewState.scale,
    previewState.isDragging,
    onPositionUpdate,
  ]);

  // Handle drag lifecycle
  useEffect(() => {
    if (previewState.isDragging) {
      onDragStart();
    } else {
      onDragEnd();
    }
  }, [previewState.isDragging, onDragStart, onDragEnd]);

  // Don't render if not visible or no canvas
  if (!previewState.isVisible || !previewCanvas) {
    return null;
  }

  // Render preview using Portal for optimal performance
  return createPortal(
    <div
      ref={previewRef}
      className="pointer-events-none fixed top-0 left-0 z-50"
      style={{
        opacity: isGenerating ? 0.3 : previewState.opacity,
        transition: isGenerating ? "opacity 0.2s ease" : "none",
        willChange: "transform",
        contain: "layout style paint",
      }}
    >
      <canvas
        ref={canvasRef}
        width={previewCanvas.width}
        height={previewCanvas.height}
        style={{
          display: "block",
          imageRendering: "pixelated",
        }}
        {...(() => {
          // Draw the cached canvas onto our display canvas
          const canvas = canvasRef.current;
          if (canvas && previewCanvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.globalAlpha = previewState.opacity;
              ctx.drawImage(previewCanvas, 0, 0);
            }
          }
          return {};
        })()}
      />

      {/* Loading indicator for complex previews */}
      {isGenerating && (
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded bg-gray-200">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>,
    document.body
  );
};

/**
 * Utility function to clear preview cache
 * Should be called periodically to prevent memory leaks
 */
export const clearPreviewCache = (): void => {
  // Simple heuristic: remove if cache is getting large
  if (previewCache.size > 50) {
    // Clear the oldest entries (simple approach: clear all when limit exceeded)
    previewCache.clear();
  }
};

// Auto-cleanup cache every 5 minutes
setInterval(() => clearPreviewCache(), 300000);

export default DragPreviewManager;
