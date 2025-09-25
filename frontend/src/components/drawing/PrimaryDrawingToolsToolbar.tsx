"use client";

import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Diamond,
  Share2,
  PenTool,
  ChevronDown,
  RectangleHorizontal,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useDrawingStore, type DrawingTool_Type } from "@/store/drawingStore";

interface PrimaryDrawingToolsToolbarProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

interface ToolButton {
  id: DrawingTool_Type | "shapes";
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  children?: ToolButton[];
}

type ConnectorMode = "straight" | "orthogonal" | "curved";

export default function PrimaryDrawingToolsToolbar({
  orientation = "horizontal",
  className = "",
}: PrimaryDrawingToolsToolbarProps): ReactElement {
  const {
    activeTool,
    setActiveTool,
    connectorMode = "orthogonal",
    setConnectorMode,
  } = useDrawingStore();

  const [showShapesDropdown, setShowShapesDropdown] = useState(false);
  const [selectedShape, setSelectedShape] = useState<DrawingTool_Type>("rectangle");
  const shapesDropdownRef = useRef<HTMLDivElement>(null);

  // Tool definitions
  const toolButtons: ToolButton[] = [
    {
      id: "select",
      icon: MousePointer2,
      label: "Selection Tool",
      shortcut: "V",
    },
    {
      id: "text",
      icon: Type,
      label: "Text Tool",
      shortcut: "T",
    },
    {
      id: "shapes",
      icon: selectedShape === "rectangle" ? Square :
            selectedShape === "ellipse" ? Circle :
            selectedShape === "rhombus" ? Diamond :
            RectangleHorizontal,
      label: "Shapes",
      children: [
        {
          id: "rectangle",
          icon: Square,
          label: "Rectangle",
          shortcut: "R",
        },
        {
          id: "rounded-rectangle",
          icon: RectangleHorizontal,
          label: "Rounded Rectangle",
        },
        {
          id: "ellipse",
          icon: Circle,
          label: "Ellipse",
          shortcut: "E",
        },
        {
          id: "rhombus",
          icon: Diamond,
          label: "Rhombus",
        },
      ],
    },
    {
      id: "drawEdge",
      icon: Share2,
      label: "Connector Tool",
      shortcut: "C",
    },
    {
      id: "freehand",
      icon: PenTool,
      label: "Freehand Drawing",
      shortcut: "P",
    },
  ];

  // Keyboard shortcuts
  useHotkeys("v", () => setActiveTool("select"), [setActiveTool]);
  useHotkeys("t", () => setActiveTool("text"), [setActiveTool]);
  useHotkeys("r", () => {
    setSelectedShape("rectangle");
    setActiveTool("rectangle");
  }, [setActiveTool]);
  useHotkeys("e", () => {
    setSelectedShape("ellipse");
    setActiveTool("ellipse");
  }, [setActiveTool]);
  useHotkeys("c", () => setActiveTool("drawEdge"), [setActiveTool]);
  useHotkeys("p", () => setActiveTool("freehand"), [setActiveTool]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        shapesDropdownRef.current &&
        !shapesDropdownRef.current.contains(event.target as Node)
      ) {
        setShowShapesDropdown(false);
      }
    };

    if (showShapesDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShapesDropdown]);

  const handleToolClick = (toolId: DrawingTool_Type | "shapes"): void => {
    if (toolId === "shapes") {
      setShowShapesDropdown(!showShapesDropdown);
    } else {
      setActiveTool(toolId);
      if (["rectangle", "rounded-rectangle", "ellipse", "rhombus"].includes(toolId)) {
        setSelectedShape(toolId as DrawingTool_Type);
        setShowShapesDropdown(false);
      }
    }
  };

  const handleShapeSelect = (shapeId: DrawingTool_Type): void => {
    setSelectedShape(shapeId);
    setActiveTool(shapeId);
    setShowShapesDropdown(false);
  };

  const handleConnectorModeChange = (mode: ConnectorMode): void => {
    if (setConnectorMode) {
      setConnectorMode(mode);
    }
  };

  const renderToolButton = (tool: ToolButton): ReactElement => {
    const Icon = tool.icon;
    const isActive = tool.id === "shapes"
      ? ["rectangle", "rounded-rectangle", "ellipse", "rhombus"].includes(activeTool)
      : activeTool === tool.id;

    return (
      <div key={tool.id} className="relative">
        <button
          onClick={() => handleToolClick(tool.id)}
          className={`
            relative flex items-center justify-center p-2 rounded transition-all
            ${isActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}
            ${orientation === "vertical" ? "w-full" : ""}
            group
          `}
          title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
        >
          <Icon className="h-4 w-4" />
          {tool.id === "shapes" && (
            <ChevronDown className="ml-1 h-3 w-3" />
          )}

          {/* Tooltip */}
          {orientation === "horizontal" && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {tool.label}
              {tool.shortcut && (
                <span className="ml-1 text-gray-300">({tool.shortcut})</span>
              )}
            </div>
          )}
        </button>

        {/* Shapes Dropdown */}
        {tool.id === "shapes" && showShapesDropdown && (
          <div
            ref={shapesDropdownRef}
            className={`
              absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg
              ${orientation === "vertical" ? "left-full top-0 ml-1" : "top-full left-0"}
            `}
          >
            {tool.children?.map((shape) => {
              const ShapeIcon = shape.icon;
              return (
                <button
                  key={shape.id}
                  onClick={() => handleShapeSelect(shape.id as DrawingTool_Type)}
                  className={`
                    flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100
                    ${selectedShape === shape.id ? "bg-gray-50 text-blue-600" : ""}
                  `}
                >
                  <ShapeIcon className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">{shape.label}</span>
                  {shape.shortcut && (
                    <span className="ml-auto text-xs text-gray-400 pl-4">
                      {shape.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Connector mode selector (only shown when connector tool is active)
  const renderConnectorModes = (): ReactElement | null => {
    if (activeTool !== "drawEdge") return null;

    return (
      <div className={`
        flex items-center gap-1 ml-2 pl-2 border-l border-gray-300
        ${orientation === "vertical" ? "flex-col mt-2 ml-0 pl-0 border-l-0 border-t pt-2" : ""}
      `}>
        <button
          onClick={() => handleConnectorModeChange("straight")}
          className={`p-1.5 rounded text-xs ${
            connectorMode === "straight" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          }`}
          title="Straight connector"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={() => handleConnectorModeChange("orthogonal")}
          className={`p-1.5 rounded text-xs ${
            connectorMode === "orthogonal" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          }`}
          title="Orthogonal connector"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M 2 8 L 8 8 L 8 4 L 14 4" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={() => handleConnectorModeChange("curved")}
          className={`p-1.5 rounded text-xs ${
            connectorMode === "curved" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          }`}
          title="Curved connector"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M 2 8 Q 8 2, 14 8" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div
      className={`
        flex items-center bg-white border rounded-lg shadow-sm p-1
        ${orientation === "vertical" ? "flex-col w-12" : ""}
        ${className}
      `}
    >
      {/* Main tool buttons */}
      <div className={`
        flex items-center gap-1
        ${orientation === "vertical" ? "flex-col" : ""}
      `}>
        {toolButtons.map(renderToolButton)}
      </div>

      {/* Connector mode selector */}
      {renderConnectorModes()}

      {/* Status indicator */}
      {orientation === "horizontal" && (
        <div className="ml-auto mr-2 text-xs text-gray-500">
          Active: {activeTool}
        </div>
      )}
    </div>
  );
}