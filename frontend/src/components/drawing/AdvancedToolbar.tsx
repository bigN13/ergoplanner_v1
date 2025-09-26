"use client";

import {
  Save,
  Undo,
  Redo,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize,
  MousePointer2,
  Hand,
  FileJson,
  Image as ImageIcon,
  FileText,
  FolderOpen,
  Plus,
  Copy,
  Clipboard,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Lock,
  Unlock,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Group,
  Ungroup,
  Ruler,
  Settings,
  Download,
  Share2,
  ArrowLeft,
  ArrowDown,
  Circle,
  Square,
  PenTool,
  Type,
  Eraser,
  Move,
  Scissors,
  Link2,
  GitBranch,
  Activity,
  Gauge,
  Thermometer,
  Droplet,
  Gauge as PressureGauge,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import React, { useState, useRef } from "react";

import { useDrawingStore, type DrawingTool_Type } from "@/store/drawingStore";

// Tool interface is defined inline in the component

interface AdvancedToolbarProps {
  onExportSVG?: () => void;
  onExportPNG?: () => void;
  onFitView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  tool?: "select" | "pan" | "draw" | "connect";
  onToolChange?: (tool: string) => void;
}

export default function AdvancedToolbar({
  onExportSVG,
  onExportPNG,
  onFitView,
  onZoomIn,
  onZoomOut,
  tool = "select",
  onToolChange,
}: AdvancedToolbarProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTool, setLocalActiveTool] = useState(tool);
  const [activeGroup, setActiveGroup] = useState("selection");

  const {
    drawingName,
    isDirty,
    isGridVisible,
    snapToGrid,
    canUndo,
    canRedo,
    undo,
    redo,
    saveDrawing,
    exportDrawing,
    importDrawing,
    toggleGrid,
    toggleSnapToGrid,
    newDrawing,
    setDrawingName,
    setActiveTool: setStoreActiveTool,
  } = useDrawingStore();

  const handleToolClick = (toolId: string, action?: () => void): void => {
    // Only set as active tool if it's a valid DrawingTool_Type
    const validTools = [
      "select",
      "pan",
      "multiSelect",
      "addNode",
      "drawEdge",
      "freehand",
      "text",
      "measurement",
      "callout",
    ];
    if (validTools.includes(toolId)) {
      setStoreActiveTool(toolId as DrawingTool_Type);
    }
    // Also update local state for UI
    setLocalActiveTool(toolId as "select" | "pan" | "draw" | "connect");
    if (onToolChange) {
      onToolChange(toolId);
    }
    if (action) {
      action();
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importDrawing(content);
      };
      reader.readAsText(file);
    }
  };

  const toolGroups = {
    file: {
      label: "File",
      tools: [
        { id: "new", icon: Plus, label: "New Drawing", shortcut: "Ctrl+N", action: newDrawing },
        { id: "save", icon: Save, label: "Save", shortcut: "Ctrl+S", action: saveDrawing },
        {
          id: "open",
          icon: FolderOpen,
          label: "Open",
          shortcut: "Ctrl+O",
          action: () => fileInputRef.current?.click(),
        },
        {
          id: "export-json",
          icon: FileJson,
          label: "Export JSON",
          action: () => exportDrawing("json"),
        },
        { id: "export-svg", icon: ImageIcon, label: "Export SVG", action: onExportSVG },
        { id: "export-png", icon: Download, label: "Export PNG", action: onExportPNG },
        { id: "export-pdf", icon: FileText, label: "Export PDF" },
        { id: "share", icon: Share2, label: "Share" },
      ],
    },
    edit: {
      label: "Edit",
      tools: [
        { id: "undo", icon: Undo, label: "Undo", shortcut: "Ctrl+Z", action: undo },
        { id: "redo", icon: Redo, label: "Redo", shortcut: "Ctrl+Y", action: redo },
        { id: "copy", icon: Copy, label: "Copy", shortcut: "Ctrl+C" },
        { id: "paste", icon: Clipboard, label: "Paste", shortcut: "Ctrl+V" },
        { id: "delete", icon: Trash2, label: "Delete", shortcut: "Del" },
        { id: "cut", icon: Scissors, label: "Cut", shortcut: "Ctrl+X" },
        { id: "duplicate", icon: Copy, label: "Duplicate", shortcut: "Ctrl+D" },
      ],
    },
    selection: {
      label: "Selection",
      tools: [
        {
          id: "select",
          icon: MousePointer2,
          label: "Select",
          shortcut: "V",
          isActive: activeTool === "select",
        },
        { id: "pan", icon: Hand, label: "Pan", shortcut: "H", isActive: activeTool === "pan" },
        { id: "move", icon: Move, label: "Move", shortcut: "M" },
        { id: "rotate", icon: RotateCw, label: "Rotate", shortcut: "R" },
        { id: "connect", icon: Link2, label: "Connect", shortcut: "C" },
        { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
      ],
    },
    drawing: {
      label: "Drawing",
      tools: [
        { id: "pen", icon: PenTool, label: "Pen Tool", shortcut: "P" },
        { id: "pipe", icon: GitBranch, label: "Pipe Tool", shortcut: "L" },
        { id: "valve", icon: Circle, label: "Valve" },
        { id: "pump", icon: Activity, label: "Pump" },
        { id: "tank", icon: Square, label: "Tank" },
        { id: "instrument", icon: Gauge, label: "Instrument" },
        { id: "text", icon: Type, label: "Text", shortcut: "T" },
      ],
    },
    instruments: {
      label: "Instruments",
      tools: [
        { id: "flow-meter", icon: Activity, label: "Flow Meter" },
        { id: "pressure-gauge", icon: PressureGauge, label: "Pressure Gauge" },
        { id: "temp-sensor", icon: Thermometer, label: "Temperature" },
        { id: "level-sensor", icon: Gauge, label: "Level Sensor" },
        { id: "ph-sensor", icon: Droplet, label: "pH Sensor" },
        { id: "control-valve", icon: Settings, label: "Control Valve" },
      ],
    },
    alignment: {
      label: "Alignment",
      tools: [
        { id: "align-left", icon: AlignLeft, label: "Align Left", shortcut: "Shift+L" },
        { id: "align-center", icon: AlignCenter, label: "Align Center", shortcut: "Shift+C" },
        { id: "align-right", icon: AlignRight, label: "Align Right", shortcut: "Shift+R" },
        // TODO: Add AlignTop, AlignMiddle, AlignBottom icons when available
        // { id: 'align-top', icon: AlignTop, label: 'Align Top', shortcut: 'Shift+T' },
        // { id: 'align-middle', icon: AlignMiddle, label: 'Align Middle', shortcut: 'Shift+M' },
        // { id: 'align-bottom', icon: AlignBottom, label: 'Align Bottom', shortcut: 'Shift+B' },
        { id: "distribute-h", icon: ArrowLeft, label: "Distribute Horizontally" },
        { id: "distribute-v", icon: ArrowDown, label: "Distribute Vertically" },
      ],
    },
    arrange: {
      label: "Arrange",
      tools: [
        { id: "group", icon: Group, label: "Group", shortcut: "Ctrl+G" },
        { id: "ungroup", icon: Ungroup, label: "Ungroup", shortcut: "Ctrl+Shift+G" },
        // TODO: Add BringToFront and SendToBack icons when available
        // { id: 'bring-front', icon: BringToFront, label: 'Bring to Front' },
        // { id: 'send-back', icon: SendToBack, label: 'Send to Back' },
        { id: "flip-h", icon: FlipHorizontal, label: "Flip Horizontal" },
        { id: "flip-v", icon: FlipVertical, label: "Flip Vertical" },
        { id: "lock", icon: Lock, label: "Lock", shortcut: "Ctrl+L" },
        { id: "unlock", icon: Unlock, label: "Unlock", shortcut: "Ctrl+U" },
      ],
    },
    view: {
      label: "View",
      tools: [
        { id: "zoom-in", icon: ZoomIn, label: "Zoom In", shortcut: "+", action: onZoomIn },
        { id: "zoom-out", icon: ZoomOut, label: "Zoom Out", shortcut: "-", action: onZoomOut },
        {
          id: "fit-view",
          icon: Maximize,
          label: "Fit View",
          shortcut: "Ctrl+0",
          action: onFitView,
        },
        {
          id: "grid",
          icon: Grid3x3,
          label: "Toggle Grid",
          shortcut: "Ctrl+G",
          action: toggleGrid,
          isToggle: true,
          isActive: isGridVisible,
        },
        {
          id: "snap",
          icon: Grid3x3,
          label: "Snap to Grid",
          action: toggleSnapToGrid,
          isToggle: true,
          isActive: snapToGrid,
        },
        { id: "rulers", icon: Ruler, label: "Show Rulers", isToggle: true },
        { id: "layers", icon: Layers, label: "Show Layers", isToggle: true },
      ],
    },
    simulation: {
      label: "Simulation",
      tools: [
        { id: "play", icon: Play, label: "Run Simulation" },
        { id: "pause", icon: Pause, label: "Pause Simulation" },
        { id: "reset", icon: RefreshCw, label: "Reset Simulation" },
        { id: "flow-analysis", icon: Activity, label: "Flow Analysis" },
        { id: "pressure-analysis", icon: Gauge, label: "Pressure Analysis" },
      ],
    },
  };

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      {/* Hidden file input for imports */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={drawingName}
            onChange={(e) => setDrawingName(e.target.value)}
            className="rounded border-none bg-transparent px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isDirty && <span className="text-xs text-orange-500">●</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Advanced P&ID Editor</span>
        </div>
      </div>

      {/* Tool Groups Tabs */}
      <div className="flex border-b border-gray-100">
        {Object.entries(toolGroups).map(([key, group]) => (
          <button
            key={key}
            onClick={() => setActiveGroup(key)}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              activeGroup === key
                ? "border-b-2 border-blue-600 bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Tool Buttons */}
      <div className="flex flex-wrap items-center gap-1 p-2">
        {activeGroup &&
          toolGroups[activeGroup as keyof typeof toolGroups]?.tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                if ("action" in tool && typeof tool.action === "function") {
                  handleToolClick(tool.id, tool.action);
                } else {
                  handleToolClick(tool.id);
                }
              }}
              disabled={(tool.id === "undo" && !canUndo()) || (tool.id === "redo" && !canRedo())}
              className={`group relative rounded p-2 transition-colors hover:bg-gray-100 ${
                "isActive" in tool && tool.isActive ? "bg-blue-100 text-blue-600" : ""
              } ${
                (tool.id === "undo" && !canUndo()) || (tool.id === "redo" && !canRedo())
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              title={`${tool.label}${"shortcut" in tool && tool.shortcut ? ` (${tool.shortcut})` : ""}`}
            >
              <tool.icon className="h-4 w-4" />
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                {tool.label}
                {"shortcut" in tool && tool.shortcut && (
                  <span className="ml-2 text-gray-400">{tool.shortcut}</span>
                )}
              </div>
            </button>
          ))}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-1 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Tool: {activeTool}</span>
          <span>Grid: {isGridVisible ? "On" : "Off"}</span>
          <span>Snap: {snapToGrid ? "On" : "Off"}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Objects: 0</span>
          <span>Connections: 0</span>
        </div>
      </div>
    </div>
  );
}
