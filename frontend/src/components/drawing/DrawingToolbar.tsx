"use client";

import {
  MousePointer,
  Hand,
  Square as SquareSelect,
  Type,
  Ruler,
  MessageSquare,
  Plus,
  Minus,
  PenTool,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  useDrawingStore,
  type ToolGroup,
  type DrawingTool_Type,
  type SelectionTool,
  type DrawingTool,
  type AnnotationTool,
} from "@/store/drawingStore";

interface DrawingToolbarProps {
  className?: string;
}

interface ToolConfig {
  id: DrawingTool_Type;
  label: string;
  icon: React.ReactNode;
  hotkey: string;
  description: string;
  variants?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

interface ToolGroupConfig {
  id: ToolGroup;
  label: string;
  tools: ToolConfig[];
  collapsed?: boolean;
}

export default function DrawingToolbar({ className }: DrawingToolbarProps): React.ReactElement {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<ToolGroup>>(new Set());
  const [activeVariants, setActiveVariants] = useState<Record<string, string>>({});

  const { toolState, setActiveTool, updateToolOptions, getActiveToolConfig } = useDrawingStore();

  // Define tool groups and their tools
  const toolGroups: ToolGroupConfig[] = [
    {
      id: "selection",
      label: "Selection Tools",
      tools: [
        {
          id: "select" as SelectionTool,
          label: "Select",
          icon: <MousePointer className="h-4 w-4" />,
          hotkey: "V",
          description: "Select and move elements",
        },
        {
          id: "pan" as SelectionTool,
          label: "Pan",
          icon: <Hand className="h-4 w-4" />,
          hotkey: "H",
          description: "Pan the canvas view",
        },
        {
          id: "multiSelect" as SelectionTool,
          label: "Multi-Select",
          icon: <SquareSelect className="h-4 w-4" />,
          hotkey: "M",
          description: "Select multiple elements",
          variants: [
            { id: "rectangle", label: "Rectangle Selection" },
            { id: "lasso", label: "Lasso Selection" },
          ],
        },
      ],
    },
    {
      id: "drawing",
      label: "Drawing Tools",
      tools: [
        {
          id: "addNode" as DrawingTool,
          label: "Add Node",
          icon: <Plus className="h-4 w-4" />,
          hotkey: "N",
          description: "Add symbols and equipment",
          variants: [
            { id: "pump", label: "Pump" },
            { id: "valve", label: "Valve" },
            { id: "tank", label: "Tank" },
            { id: "instrument", label: "Instrument" },
          ],
        },
        {
          id: "drawEdge" as DrawingTool,
          label: "Draw Edge",
          icon: <Minus className="h-4 w-4" />,
          hotkey: "E",
          description: "Connect elements with pipes",
          variants: [
            { id: "straight", label: "Straight Pipe" },
            { id: "curved", label: "Curved Pipe" },
            { id: "orthogonal", label: "Orthogonal Pipe" },
          ],
        },
        {
          id: "freehand" as DrawingTool,
          label: "Freehand",
          icon: <PenTool className="h-4 w-4" />,
          hotkey: "F",
          description: "Draw freehand annotations",
        },
      ],
    },
    {
      id: "annotation",
      label: "Annotation Tools",
      tools: [
        {
          id: "text" as AnnotationTool,
          label: "Text",
          icon: <Type className="h-4 w-4" />,
          hotkey: "T",
          description: "Add text annotations",
          variants: [
            { id: "label", label: "Label" },
            { id: "title", label: "Title" },
            { id: "note", label: "Note" },
          ],
        },
        {
          id: "measurement" as AnnotationTool,
          label: "Measurement",
          icon: <Ruler className="h-4 w-4" />,
          hotkey: "R",
          description: "Add measurements and dimensions",
          variants: [
            { id: "linear", label: "Linear Dimension" },
            { id: "angular", label: "Angular Dimension" },
            { id: "radial", label: "Radial Dimension" },
          ],
        },
        {
          id: "callout" as AnnotationTool,
          label: "Callout",
          icon: <MessageSquare className="h-4 w-4" />,
          hotkey: "C",
          description: "Add callouts and notes",
          variants: [
            { id: "bubble", label: "Speech Bubble" },
            { id: "arrow", label: "Arrow Callout" },
            { id: "box", label: "Box Callout" },
          ],
        },
      ],
    },
  ];

  // Set up keyboard shortcuts - individual calls to avoid React Hooks rules violation
  useHotkeys(
    "v",
    (e) => {
      e.preventDefault();
      handleToolSelect("select");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "h",
    (e) => {
      e.preventDefault();
      handleToolSelect("pan");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "m",
    (e) => {
      e.preventDefault();
      handleToolSelect("multiSelect");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "n",
    (e) => {
      e.preventDefault();
      handleToolSelect("addNode");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "e",
    (e) => {
      e.preventDefault();
      handleToolSelect("drawEdge");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "f",
    (e) => {
      e.preventDefault();
      handleToolSelect("freehand");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "t",
    (e) => {
      e.preventDefault();
      handleToolSelect("text");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "r",
    (e) => {
      e.preventDefault();
      handleToolSelect("measurement");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );
  useHotkeys(
    "c",
    (e) => {
      e.preventDefault();
      handleToolSelect("callout");
    },
    { enableOnContentEditable: false, enableOnFormTags: false }
  );

  const handleToolSelect = (toolId: DrawingTool_Type): void => {
    setActiveTool(toolId);
  };

  const handleGroupToggle = (groupId: ToolGroup): void => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const handleVariantSelect = (toolId: string, variantId: string): void => {
    setActiveVariants((prev) => ({ ...prev, [toolId]: variantId }));

    // Update tool options based on variant
    const updates: Parameters<typeof updateToolOptions>[0] = {};

    // Example variant handling - extend as needed
    if (toolId === "drawEdge") {
      switch (variantId) {
        case "straight":
          updates.lineStyle = "solid";
          break;
        case "curved":
          updates.lineStyle = "solid";
          break;
        case "orthogonal":
          updates.lineStyle = "solid";
          break;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateToolOptions(updates);
    }
  };

  const renderTool = (tool: ToolConfig): React.ReactElement => {
    const isActive = toolState.activeTool === tool.id;
    const hasVariants = tool.variants && tool.variants.length > 0;
    const activeVariant = activeVariants[tool.id];

    return (
      <div key={tool.id} className="relative">
        <button
          onClick={() => handleToolSelect(tool.id)}
          className={`flex w-full items-center justify-between rounded p-2 text-sm transition-colors duration-200 ${
            isActive
              ? "border border-blue-300 bg-blue-100 text-blue-700"
              : "border border-transparent hover:bg-gray-100"
          } `}
          title={`${tool.description} (${tool.hotkey})`}
        >
          <div className="flex items-center space-x-2">
            {tool.icon}
            <span className="text-xs">{tool.label}</span>
            {hasVariants && activeVariant && (
              <span className="text-xs text-gray-500">
                ({tool.variants?.find((v) => v.id === activeVariant)?.label})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">{tool.hotkey}</span>
            {hasVariants && <ChevronDown className="h-3 w-3 text-gray-400" />}
          </div>
        </button>

        {/* Tool variants dropdown */}
        {hasVariants && isActive && (
          <div className="mt-1 ml-6 space-y-1">
            {tool.variants?.map((variant) => (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(tool.id, variant.id)}
                className={`flex w-full items-center space-x-2 rounded p-1.5 text-xs transition-colors duration-200 ${
                  activeVariant === variant.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                } `}
              >
                {variant.icon}
                <span>{variant.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderToolGroup = (group: ToolGroupConfig): React.ReactElement => {
    const isCollapsed = collapsedGroups.has(group.id);
    const isActiveGroup = toolState.activeToolGroup === group.id;

    return (
      <div key={group.id} className="mb-4">
        <button
          onClick={() => handleGroupToggle(group.id)}
          className={`flex w-full items-center justify-between rounded p-2 text-sm font-medium transition-colors duration-200 ${
            isActiveGroup
              ? "border border-blue-200 bg-blue-50 text-blue-700"
              : "border border-gray-200 hover:bg-gray-50"
          } `}
        >
          <span>{group.label}</span>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {!isCollapsed && <div className="mt-2 space-y-1">{group.tools.map(renderTool)}</div>}
      </div>
    );
  };

  const activeConfig = getActiveToolConfig();

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <h3 className="text-sm font-semibold text-gray-700">Drawing Tools</h3>
        <div className="mt-1 text-xs text-gray-500">
          Active: {activeConfig.tool} ({activeConfig.group})
        </div>
      </div>

      {/* Tool Groups */}
      <div className="space-y-2">{toolGroups.map(renderToolGroup)}</div>

      {/* Tool Options Quick Access */}
      <div className="mt-4 border-t border-gray-200 pt-3">
        <div className="mb-2 text-xs font-medium text-gray-600">Tool Options</div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={toolState.toolOptions.snapEnabled ?? true}
              onChange={(e) => updateToolOptions({ snapEnabled: e.target.checked })}
              className="h-3 w-3"
            />
            <span>Snap to Grid</span>
          </label>

          {toolState.activeToolGroup === "selection" && (
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={toolState.toolOptions.multiSelectMode ?? false}
                onChange={(e) => updateToolOptions({ multiSelectMode: e.target.checked })}
                className="h-3 w-3"
              />
              <span>Multi-Select Mode</span>
            </label>
          )}

          {toolState.activeToolGroup === "drawing" && (
            <>
              <div className="text-xs text-gray-500">Line Style:</div>
              <select
                value={toolState.toolOptions.lineStyle ?? "solid"}
                onChange={(e) =>
                  updateToolOptions({
                    lineStyle: e.target.value as "solid" | "dashed" | "dotted",
                  })
                }
                className="w-full rounded border border-gray-300 p-1 text-xs"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Footer with keyboard shortcuts info */}
      <div className="mt-4 border-t border-gray-200 pt-3">
        <div className="text-xs text-gray-400">
          Press hotkeys (V, H, M, N, E, F, T, R, C) for quick tool access
        </div>
      </div>
    </div>
  );
}
