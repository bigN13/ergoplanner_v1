"use client";

import {
  Grid,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Minus,
  MoreHorizontal,
  Square,
  Circle,
  Triangle,
  Ruler,
  Settings,
  // Zap,
  MousePointer,
  // Hand,
  // Plus,
  PenTool,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { useDrawingStore } from "@/store/drawingStore";

interface ToolOption {
  id: string;
  label: string;
  type: "toggle" | "select" | "slider" | "color" | "button" | "group";
  icon?: React.ReactNode;
  value?: unknown;
  options?: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  min?: number;
  max?: number;
  step?: number;
  action?: () => void;
}

interface ToolOptionsBarProps {
  className?: string;
}

const TOOL_PREFERENCES_KEY = "ergoplanner-tool-preferences";

// Get tool preferences from localStorage
const getToolPreferences = (): Record<string, unknown> => {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(TOOL_PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save tool preferences to localStorage
const saveToolPreferences = (preferences: Record<string, unknown>): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOOL_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Handle storage errors gracefully
  }
};

export default function ToolOptionsBar({ className = "" }: ToolOptionsBarProps): React.ReactElement {
  const toolState = useDrawingStore((state) => ({
    activeToolGroup: state.toolState.activeToolGroup,
    activeTool: state.activeTool,
    snapToGrid: state.snapToGrid,
    isGridVisible: state.isGridVisible,
    toggleSnapToGrid: state.toggleSnapToGrid,
    toggleGrid: state.toggleGrid,
  }));

  const [toolPreferences, setToolPreferences] = useState<Record<string, unknown>>(getToolPreferences);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Save preferences when they change
  useEffect(() => {
    saveToolPreferences(toolPreferences);
  }, [toolPreferences]);

  // Update preference value
  const updatePreference = (key: string, value: unknown): void => {
    setToolPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Get current preference value with fallback
  const getPreference = (key: string, fallback: unknown): unknown => {
    return toolPreferences[key] ?? fallback;
  };

  // Generate options based on active tool
  const getToolOptions = (): ToolOption[] => {
    const { activeToolGroup, activeTool } = toolState;

    const baseOptions: ToolOption[] = [
      {
        id: "snapToGrid",
        label: "Snap to Grid",
        type: "toggle",
        icon: <Grid className="h-3 w-3" />,
        value: toolState.snapToGrid,
        action: toolState.toggleSnapToGrid,
      },
    ];

    if (activeToolGroup === "selection") {
      if (activeTool === "select") {
        return [
          ...baseOptions,
          {
            id: "multiSelect",
            label: "Multi-select Mode",
            type: "toggle",
            icon: <MousePointer className="h-3 w-3" />,
            value: getPreference("multiSelectMode", false),
            action: () => updatePreference("multiSelectMode", !getPreference("multiSelectMode", false)),
          },
          {
            id: "selectionFilter",
            label: "Filter by Type",
            type: "select",
            value: getPreference("selectionFilter", "all"),
            options: [
              { id: "all", label: "All Types" },
              { id: "pump", label: "Pumps" },
              { id: "valve", label: "Valves" },
              { id: "tank", label: "Tanks" },
              { id: "instrument", label: "Instruments" },
            ],
          },
        ];
      }
    }

    if (activeToolGroup === "drawing") {
      if (activeTool === "addNode") {
        return [
          ...baseOptions,
          {
            id: "nodeRotation",
            label: "Rotation",
            type: "slider",
            icon: <RotateCcw className="h-3 w-3" />,
            value: getPreference("nodeRotation", 0),
            min: 0,
            max: 360,
            step: 15,
          },
          {
            id: "nodeFlip",
            label: "Flip",
            type: "group",
            options: [
              { id: "flipH", label: "Horizontal", icon: <FlipHorizontal className="h-3 w-3" /> },
              { id: "flipV", label: "Vertical", icon: <FlipVertical className="h-3 w-3" /> },
            ],
          },
          {
            id: "nodeSize",
            label: "Size Preset",
            type: "select",
            value: getPreference("nodeSize", "medium"),
            options: [
              { id: "small", label: "Small" },
              { id: "medium", label: "Medium" },
              { id: "large", label: "Large" },
              { id: "custom", label: "Custom" },
            ],
          },
        ];
      }

      if (activeTool === "drawEdge") {
        return [
          ...baseOptions,
          {
            id: "lineStyle",
            label: "Line Style",
            type: "select",
            icon: <Minus className="h-3 w-3" />,
            value: getPreference("lineStyle", "solid"),
            options: [
              { id: "solid", label: "Solid", icon: <Minus className="h-3 w-3" /> },
              { id: "dashed", label: "Dashed", icon: <MoreHorizontal className="h-3 w-3" /> },
              { id: "dotted", label: "Dotted" },
            ],
          },
          {
            id: "lineWeight",
            label: "Line Weight",
            type: "slider",
            value: getPreference("lineWeight", 2),
            min: 1,
            max: 8,
            step: 1,
          },
          {
            id: "arrowStyle",
            label: "Arrow Style",
            type: "select",
            value: getPreference("arrowStyle", "none"),
            options: [
              { id: "none", label: "None" },
              { id: "start", label: "Start" },
              { id: "end", label: "End" },
              { id: "both", label: "Both" },
            ],
          },
        ];
      }

      if (activeTool === "freehand") {
        return [
          ...baseOptions,
          {
            id: "brushSize",
            label: "Brush Size",
            type: "slider",
            icon: <PenTool className="h-3 w-3" />,
            value: getPreference("brushSize", 3),
            min: 1,
            max: 12,
            step: 1,
          },
          {
            id: "brushColor",
            label: "Color",
            type: "color",
            value: getPreference("brushColor", "#000000"),
          },
        ];
      }
    }

    if (activeToolGroup === "annotation") {
      if (activeTool === "text") {
        return [
          ...baseOptions,
          {
            id: "fontFamily",
            label: "Font",
            type: "select",
            icon: <Type className="h-3 w-3" />,
            value: getPreference("fontFamily", "Arial"),
            options: [
              { id: "Arial", label: "Arial" },
              { id: "Helvetica", label: "Helvetica" },
              { id: "Times", label: "Times" },
              { id: "Courier", label: "Courier" },
            ],
          },
          {
            id: "fontSize",
            label: "Size",
            type: "slider",
            value: getPreference("fontSize", 12),
            min: 8,
            max: 72,
            step: 2,
          },
          {
            id: "textAlign",
            label: "Alignment",
            type: "group",
            options: [
              { id: "left", label: "Left", icon: <AlignLeft className="h-3 w-3" /> },
              { id: "center", label: "Center", icon: <AlignCenter className="h-3 w-3" /> },
              { id: "right", label: "Right", icon: <AlignRight className="h-3 w-3" /> },
            ],
          },
          {
            id: "textColor",
            label: "Color",
            type: "color",
            value: getPreference("textColor", "#000000"),
          },
        ];
      }

      if (activeTool === "measurement") {
        return [
          ...baseOptions,
          {
            id: "measureUnits",
            label: "Units",
            type: "select",
            icon: <Ruler className="h-3 w-3" />,
            value: getPreference("measureUnits", "mm"),
            options: [
              { id: "mm", label: "Millimeters" },
              { id: "cm", label: "Centimeters" },
              { id: "m", label: "Meters" },
              { id: "in", label: "Inches" },
              { id: "ft", label: "Feet" },
            ],
          },
          {
            id: "measurePrecision",
            label: "Precision",
            type: "slider",
            value: getPreference("measurePrecision", 2),
            min: 0,
            max: 4,
            step: 1,
          },
          {
            id: "showLabels",
            label: "Show Labels",
            type: "toggle",
            value: getPreference("showLabels", true),
          },
        ];
      }

      if (activeTool === "callout") {
        return [
          ...baseOptions,
          {
            id: "calloutShape",
            label: "Shape",
            type: "group",
            icon: <MessageSquare className="h-3 w-3" />,
            options: [
              { id: "rectangle", label: "Rectangle", icon: <Square className="h-3 w-3" /> },
              { id: "circle", label: "Circle", icon: <Circle className="h-3 w-3" /> },
              { id: "triangle", label: "Triangle", icon: <Triangle className="h-3 w-3" /> },
            ],
          },
          {
            id: "calloutColor",
            label: "Color",
            type: "color",
            value: getPreference("calloutColor", "#FFE4B5"),
          },
        ];
      }
    }

    return baseOptions;
  };

  const currentOptions = getToolOptions();

  // Render individual option
  const renderOption = (option: ToolOption): React.ReactNode => {
    switch (option.type) {
      case "toggle":
        return (
          <button
            key={option.id}
            onClick={option.action || (() => updatePreference(option.id, !option.value))}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
              option.value
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={option.label}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );

      case "select":
        return (
          <div key={option.id} className="flex items-center gap-1">
            {option.icon && option.icon}
            <select
              value={String(option.value)}
              onChange={(e) => updatePreference(option.id, e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              title={option.label}
            >
              {option.options?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "slider":
        return (
          <div key={option.id} className="flex items-center gap-2">
            {option.icon && option.icon}
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={option.min}
                max={option.max}
                step={option.step}
                value={Number(option.value)}
                onChange={(e) => updatePreference(option.id, Number(e.target.value))}
                className="w-16 sm:w-20"
                title={option.label}
              />
              <span className="text-xs text-gray-500 w-8 text-right">{String(option.value)}</span>
            </div>
          </div>
        );

      case "color":
        return (
          <div key={option.id} className="flex items-center gap-1">
            <input
              type="color"
              value={String(option.value)}
              onChange={(e) => updatePreference(option.id, e.target.value)}
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
              title={option.label}
            />
            <span className="text-xs text-gray-600 hidden sm:inline">{option.label}</span>
          </div>
        );

      case "group":
        return (
          <div key={option.id} className="flex items-center gap-1">
            {option.icon && option.icon}
            <div className="flex rounded border border-gray-200 overflow-hidden">
              {option.options?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updatePreference(option.id, opt.id)}
                  className={`px-2 py-1 text-xs transition-colors ${
                    getPreference(option.id, "") === opt.id
                      ? "bg-blue-100 text-blue-700"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title={opt.label}
                >
                  {opt.icon || opt.label}
                </button>
              ))}
            </div>
          </div>
        );

      case "button":
        return (
          <button
            key={option.id}
            onClick={option.action}
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
            title={option.label}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );

      default:
        return null;
    }
  };

  if (currentOptions.length === 0) {
    return <div></div>;
  }

  return (
    <div className={`border-b border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3 flex-wrap">
          {!isCollapsed && currentOptions.map(renderOption)}

          {/* Responsive collapse for mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-300 sm:hidden"
          >
            <Settings className="h-3 w-3" />
            <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Tool info and shortcuts */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="hidden md:inline">
            {toolState.activeToolGroup} / {toolState.activeTool}
          </span>

          {/* Keyboard shortcut hints based on active tool */}
          {toolState.activeTool === "select" && (
            <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">V</kbd>
          )}
          {toolState.activeTool === "pan" && (
            <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">H</kbd>
          )}
          {toolState.activeTool === "addNode" && (
            <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">N</kbd>
          )}
          {toolState.activeTool === "drawEdge" && (
            <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">E</kbd>
          )}
          {toolState.activeTool === "text" && (
            <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">T</kbd>
          )}
        </div>
      </div>
    </div>
  );
}