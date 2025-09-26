"use client";

import React, { useCallback, useMemo } from "react";

import { useDragPreview } from "@/hooks/useDragPreview";

import { DragPreviewManager } from "./DragPreviewManager";

interface EnhancedDragPreviewProps {
  className?: string;
}

/**
 * Enhanced Drag Preview Integration Component
 *
 * This component integrates the DragPreviewManager with the application,
 * providing a complete drag preview system with:
 * - ReactFlow integration
 * - Performance monitoring
 * - Event handling
 * - Smart positioning
 */
export const EnhancedDragPreview: React.FC<EnhancedDragPreviewProps> = React.memo(
  ({ className = "" }) => {
    const { previewState, updatePosition, getPerformanceMetrics } = useDragPreview();

    // Handle position updates with performance monitoring
    const handlePositionUpdate = useCallback(
      (position: { x: number; y: number }) => {
        updatePosition(position);

        // Log performance warnings if needed
        const metrics = getPerformanceMetrics();
        if (metrics.currentFps < 30) {
          console.warn("Drag preview performance degraded:", metrics);
        }
      },
      [updatePosition, getPerformanceMetrics]
    );

    // Handle drag start event
    const handleDragStart = useCallback(() => {
      // Add drag start logic here if needed
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      // Prevent text selection during drag
      const preventSelection = (e: Event): void => e.preventDefault();
      document.addEventListener("selectstart", preventSelection);

      // Store cleanup function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__dragCleanup = (): void => {
        document.removeEventListener("selectstart", preventSelection);
      };
    }, []);

    // Handle drag end event
    const handleDragEnd = useCallback(() => {
      // Reset cursor and selection
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // Clean up event listeners
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).__dragCleanup) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__dragCleanup();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__dragCleanup;
      }

      // Log performance summary
      const metrics = getPerformanceMetrics();
      console.warn("Drag operation completed. Performance metrics:", metrics);
    }, [getPerformanceMetrics]);

    // Memoize the preview state to prevent unnecessary re-renders
    const memoizedPreviewState = useMemo(() => previewState, [previewState]);

    // Only render if preview is needed
    if (!previewState.isVisible && !previewState.isDragging) {
      return null;
    }

    return (
      <div className={`enhanced-drag-preview ${className}`}>
        <DragPreviewManager
          previewState={memoizedPreviewState}
          onPositionUpdate={handlePositionUpdate}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      </div>
    );
  }
);

EnhancedDragPreview.displayName = "EnhancedDragPreview";

export default EnhancedDragPreview;
