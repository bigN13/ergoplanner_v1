"use client";

import React, { useMemo } from "react";

import { useDropZone } from "@/contexts/DropZoneContext";
import { useDrawingStore } from "@/store/drawingStore";

interface GridOverlayProps {
  width?: number;
  height?: number;
  gridSize?: number;
  showOnlyDuringDrag?: boolean;
  gridColor?: string;
  gridOpacity?: number;
  showDots?: boolean;
}

export default function GridOverlay({
  width = window.innerWidth,
  height = window.innerHeight,
  gridSize: propGridSize,
  showOnlyDuringDrag = true,
  gridColor = "#e0e0e0",
  gridOpacity = 0.5,
  showDots = false,
}: GridOverlayProps): React.ReactElement {
  const { dragItem } = useDropZone();
  const { isGridVisible, gridSize: storeGridSize, snapToGrid } = useDrawingStore();

  const gridSize = propGridSize ?? storeGridSize;

  const shouldShowGrid = useMemo(() => {
    if (showOnlyDuringDrag) {
      return dragItem !== null && isGridVisible;
    }
    return isGridVisible;
  }, [dragItem, isGridVisible, showOnlyDuringDrag]);

  const gridPattern = useMemo(() => {
    if (showDots) {
      // Create dot pattern
      return (
        <pattern
          id="grid-dots"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={gridSize / 2}
            cy={gridSize / 2}
            r="1"
            fill={gridColor}
            opacity={gridOpacity}
          />
        </pattern>
      );
    } else {
      // Create line pattern
      return (
        <pattern
          id="grid-lines"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke={gridColor}
            strokeWidth="0.5"
            opacity={gridOpacity}
          />
        </pattern>
      );
    }
  }, [gridSize, showDots, gridColor, gridOpacity]);

  const majorGridPattern = useMemo(() => {
    const majorGridSize = gridSize * 5; // Major grid lines every 5 cells
    return (
      <pattern
        id="grid-major"
        width={majorGridSize}
        height={majorGridSize}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={`M ${majorGridSize} 0 L 0 0 0 ${majorGridSize}`}
          fill="none"
          stroke={gridColor}
          strokeWidth="1"
          opacity={gridOpacity * 1.5}
        />
      </pattern>
    );
  }, [gridSize, gridColor, gridOpacity]);

  if (!shouldShowGrid) {
    return <></>;
  }

  return (
    <svg
      className="grid-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <defs>
        {gridPattern}
        {majorGridPattern}
      </defs>

      {/* Minor grid */}
      <rect
        width={width}
        height={height}
        fill={showDots ? "url(#grid-dots)" : "url(#grid-lines)"}
      />

      {/* Major grid */}
      {!showDots && (
        <rect
          width={width}
          height={height}
          fill="url(#grid-major)"
        />
      )}

      {/* Show snap indicator when dragging */}
      {dragItem && snapToGrid && (
        <g className="snap-indicator">
          <text
            x="20"
            y="30"
            fill={gridColor}
            fontSize="12"
            fontWeight="bold"
            opacity={0.8}
          >
            SNAP: {gridSize}px
          </text>
        </g>
      )}
    </svg>
  );
}