import { useCallback, useEffect, useRef } from "react";
import type { Node } from "reactflow";
import { useReactFlow } from "reactflow";

import { useDragPreviewStore, useDragPreviewActions } from "@/store/dragPreviewStore";

/**
 * Hook for integrating drag preview system with ReactFlow
 *
 * Provides optimized drag preview functionality with:
 * - Smart positioning logic
 * - Performance optimizations
 * - ReactFlow integration
 * - Multi-selection support
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDragPreview = (): any => {
  const reactFlowInstance = useReactFlow();
  const previewState = useDragPreviewStore();
  const actions = useDragPreviewActions();

  const mousePositionRef = useRef({ x: 0, y: 0 });
  const dragStartTimeRef = useRef(0);
  const performanceMetricsRef = useRef({
    frameCount: 0,
    lastFpsUpdate: 0,
    currentFps: 60,
  });

  // Performance monitoring
  const updatePerformanceMetrics = useCallback(() => {
    const metrics = performanceMetricsRef.current;
    metrics.frameCount++;

    const now = performance.now();
    if (now - metrics.lastFpsUpdate >= 1000) {
      metrics.currentFps = metrics.frameCount;
      metrics.frameCount = 0;
      metrics.lastFpsUpdate = now;

      // Log performance warnings
      if (metrics.currentFps < 45) {
        console.warn(
          `Drag preview FPS dropped to ${metrics.currentFps}. Consider optimizing preview generation.`
        );
      }
    }
  }, []);

  // Track mouse position globally for smooth updates
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent): void => {
      mousePositionRef.current = { x: event.clientX, y: event.clientY };

      if (previewState.isDragging) {
        actions.updateDragPosition({ x: event.clientX, y: event.clientY });
        updatePerformanceMetrics();
      }
    };

    const handleMouseUp = (): void => {
      if (previewState.isDragging) {
        const dragDuration = performance.now() - dragStartTimeRef.current;
        console.warn(`Drag operation completed in ${dragDuration.toFixed(2)}ms`);
        actions.endDrag();
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [previewState.isDragging, actions, updatePerformanceMetrics]);

  // Start drag from symbol library/stencil
  const startStencilDrag = useCallback(
    (element: HTMLElement, initialMousePosition?: { x: number; y: number }) => {
      const mousePos = initialMousePosition || mousePositionRef.current;
      dragStartTimeRef.current = performance.now();

      actions.startDragFromStencil(element, mousePos);

      console.warn("Started stencil drag preview", {
        element: element.className,
        position: mousePos,
      });
    },
    [actions]
  );

  // Start drag from canvas node
  const startCanvasDrag = useCallback(
    (
      node: Node,
      grabOffset?: { x: number; y: number },
      initialMousePosition?: { x: number; y: number }
    ) => {
      const mousePos = initialMousePosition || mousePositionRef.current;

      // Calculate grab offset if not provided
      const offset = grabOffset || { x: 50, y: 25 }; // Default node center offset

      dragStartTimeRef.current = performance.now();
      actions.startDragFromCanvas(node, mousePos, offset);

      console.warn("Started canvas drag preview", { nodeId: node.id, position: mousePos, offset });
    },
    [actions]
  );

  // Start multi-selection drag
  const startMultiSelectionDrag = useCallback(
    (nodes: Node[], initialMousePosition?: { x: number; y: number }) => {
      if (nodes.length === 0) return;

      const mousePos = initialMousePosition || mousePositionRef.current;
      dragStartTimeRef.current = performance.now();

      actions.startMultiDrag(nodes, mousePos);

      console.warn("Started multi-selection drag preview", {
        nodeCount: nodes.length,
        nodes: nodes.map((n) => n.id),
        position: mousePos,
      });
    },
    [actions]
  );

  // Get current ReactFlow viewport information for positioning calculations
  const getViewportInfo = useCallback(() => {
    try {
      const viewport = reactFlowInstance.getViewport();
      const bounds = document.querySelector(".react-flow")?.getBoundingClientRect();

      return {
        viewport,
        bounds: bounds || { x: 0, y: 0, width: 0, height: 0 },
      };
    } catch (error) {
      console.warn("Could not get ReactFlow viewport info:", error);
      return {
        viewport: { x: 0, y: 0, zoom: 1 },
        bounds: { x: 0, y: 0, width: 0, height: 0 },
      };
    }
  }, [reactFlowInstance]);

  // Convert screen coordinates to ReactFlow coordinates
  const screenToFlowPosition = useCallback(
    (screenPosition: { x: number; y: number }) => {
      try {
        return reactFlowInstance.screenToFlowPosition(screenPosition);
      } catch (error) {
        console.warn("Could not convert screen to flow position:", error);
        return screenPosition;
      }
    },
    [reactFlowInstance]
  );

  // Convert ReactFlow coordinates to screen coordinates
  const flowToScreenPosition = useCallback(
    (flowPosition: { x: number; y: number }) => {
      try {
        // Use project method if available, otherwise manual calculation
        if ("project" in reactFlowInstance) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (reactFlowInstance as any).project(flowPosition);
        }

        const { viewport, bounds } = getViewportInfo();
        return {
          x: flowPosition.x * viewport.zoom + viewport.x + bounds.x,
          y: flowPosition.y * viewport.zoom + viewport.y + bounds.y,
        };
      } catch (error) {
        console.warn("Could not convert flow to screen position:", error);
        return flowPosition;
      }
    },
    [reactFlowInstance, getViewportInfo]
  );

  // Advanced positioning for complex drag scenarios
  const calculateSmartPosition = useCallback(
    (
      element: HTMLElement | Node,
      mousePosition: { x: number; y: number },
      dragType: "stencil" | "canvas" | "multi"
    ) => {
      // Calculate smart position based on viewport
      getViewportInfo();

      switch (dragType) {
        case "stencil":
          // Center preview on cursor, but ensure it stays within viewport
          const elementRect = (element as HTMLElement).getBoundingClientRect?.();
          const elementWidth = elementRect?.width || 100;
          const elementHeight = elementRect?.height || 50;

          return {
            x: Math.max(
              elementWidth / 2,
              Math.min(mousePosition.x, window.innerWidth - elementWidth / 2)
            ),
            y: Math.max(
              elementHeight / 2,
              Math.min(mousePosition.y, window.innerHeight - elementHeight / 2)
            ),
          };

        case "canvas":
          // Maintain grab offset but ensure preview stays visible
          return {
            x: Math.max(0, Math.min(mousePosition.x, window.innerWidth - 100)),
            y: Math.max(0, Math.min(mousePosition.y, window.innerHeight - 50)),
          };

        case "multi":
          // Center on selection but apply slight offset for visual clarity
          return {
            x: mousePosition.x + 10,
            y: mousePosition.y - 20,
          };

        default:
          return mousePosition;
      }
    },
    [getViewportInfo]
  );

  // Optimized position update with throttling
  const updatePosition = useCallback(
    (position: { x: number; y: number }) => {
      // Position updates are already throttled in DragPreviewManager
      // This is mainly for additional logic if needed
      return actions.updatePreviewPosition(position);
    },
    [actions]
  );

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return {
      ...performanceMetricsRef.current,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cacheSize: (window as any).__dragPreviewCacheSize || 0, // Will be set by DragPreviewManager
    };
  }, []);

  // Clear preview and reset state
  const clearPreview = useCallback(() => {
    actions.clearPreview();
    performanceMetricsRef.current.frameCount = 0;
    console.warn("Drag preview cleared");
  }, [actions]);

  return {
    // State
    previewState,

    // Actions
    startStencilDrag,
    startCanvasDrag,
    startMultiSelectionDrag,
    updatePosition,
    clearPreview,

    // Advanced positioning
    calculateSmartPosition,
    screenToFlowPosition,
    flowToScreenPosition,

    // Utilities
    getViewportInfo,
    getPerformanceMetrics,

    // Direct access to store actions for advanced use cases
    actions,
  };
};

export default useDragPreview;
