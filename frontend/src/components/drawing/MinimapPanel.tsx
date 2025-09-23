"use client";

import { Maximize2, Minimize2, Move, ZoomIn, ZoomOut } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useReactFlow, MiniMap } from "reactflow";

import { useDrawingStore } from "@/store/drawing-store";

const MinimapPanel: React.FC = () => {
  const reactFlowInstance = useReactFlow();
  const { nodes, edges } = useDrawingStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showGrid, setShowGrid] = React.useState(true);

  const nodeColor = (node: any) => {
    switch (node.type) {
      case "pump":
        return "#3b82f6"; // blue
      case "valve":
        return "#10b981"; // green
      case "tank":
        return "#8b5cf6"; // purple
      case "pipe":
        return "#6b7280"; // gray
      case "instrument":
        return "#f59e0b"; // amber
      default:
        return "#94a3b8"; // slate
    }
  };

  const handleZoomIn = () => {
    reactFlowInstance.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance.zoomOut();
  };

  const handleFitView = () => {
    reactFlowInstance.fitView({ padding: 0.2 });
  };

  const handleCenter = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    reactFlowInstance.setCenter(centerX, centerY, { zoom: 1 });
  };

  return (
    <div className={`flex flex-col bg-white ${isExpanded ? "h-96" : "h-full"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Minimap</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={handleZoomIn} className="rounded p-1 hover:bg-gray-100" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded p-1 hover:bg-gray-100"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleFitView}
            className="rounded p-1 hover:bg-gray-100"
            title="Fit View"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 hover:bg-gray-100"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Minimap */}
      <div className="relative flex-1">
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          pannable
          zoomable
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        />

        {/* Overlay Info */}
        <div className="bg-opacity-90 absolute bottom-2 left-2 rounded bg-white p-2 text-xs">
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t p-2">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded"
            />
            <span>Show Grid</span>
          </label>
          <button
            onClick={handleCenter}
            className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
          >
            Center View
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t p-2">
        <div className="mb-1 text-xs font-semibold">Legend</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-blue-500"></div>
            <span>Pumps</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500"></div>
            <span>Valves</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-purple-500"></div>
            <span>Tanks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-gray-500"></div>
            <span>Pipes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-amber-500"></div>
            <span>Instruments</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-slate-400"></div>
            <span>Other</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimapPanel;
