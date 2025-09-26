"use client";

import {
  // Save,
  // FolderOpen,
  // Download,
  // Upload,
  // Printer,
  Undo,
  Redo,
  Copy,
  Clipboard,
  Trash2,
  // Search,
  Grid,
  // Eye,
  // EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  // AlignJustify,
  RotateCw,
  // FlipHorizontal,
  // FlipVertical,
  Layers,
  // Lock,
  // Unlock,
  MousePointer,
  Type,
  Square,
  Circle,
  // Triangle,
  Minus,
  PenTool,
  ChevronDown,
  Settings,
  // HelpCircle,
  // Info,
  // FileText,
  // Database,
  // Users,
  // Share2,
  // Cloud,
  // GitBranch,
  Package,
  // Cpu,
  // Activity,
  // Zap,
  // Box,
  // Hexagon,
  // Pentagon,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useFileOperations } from "@/hooks/useFileOperations";
import { useDrawingStore } from "@/store/drawingStore";

import FileOperationsToolbar from "./FileOperationsToolbar";
import ZoomControlsToolbar from "./ZoomControlsToolbar";

interface MainToolbarProps {
  className?: string;
}

export default function MainToolbar({ className }: MainToolbarProps): React.ReactElement {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState("select");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelectedNode,
    deleteSelectedEdge,
    toggleGrid,
    toggleSnap,
    isGridVisible,
    snapToGrid,
  } = useDrawingStore();

  const { handleNew, handleOpen, handleSave, handleSaveAs, handleExport } = useFileOperations();

  // Keyboard shortcuts for edit operations only
  // File shortcuts are now handled by FileOperationsToolbar

  useHotkeys("ctrl+z, cmd+z", () => canUndo() && undo(), [canUndo]);
  useHotkeys("ctrl+y, cmd+y", () => canRedo() && redo(), [canRedo]);

  useHotkeys(
    "ctrl+c, cmd+c",
    (e) => {
      e.preventDefault();
      handleCopy();
    },
    []
  );

  useHotkeys(
    "ctrl+v, cmd+v",
    (e) => {
      e.preventDefault();
      handlePaste();
    },
    []
  );

  useHotkeys(
    "ctrl+x, cmd+x",
    (e) => {
      e.preventDefault();
      handleCut();
    },
    []
  );

  useHotkeys(
    "delete",
    () => {
      handleDelete();
    },
    []
  );

  // Edit actions
  const handleCopy = (): void => {
    // Copy functionality
  };

  const handlePaste = (): void => {
    // Paste functionality
  };

  const handleCut = (): void => {
    // Cut functionality
  };

  const handleDelete = (): void => {
    deleteSelectedNode();
    deleteSelectedEdge();
  };

  const toggleDropdown = (menu: string): void => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closeDropdowns = (): void => {
    setActiveDropdown(null);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`border-b border-gray-200 bg-white ${className}`} ref={dropdownRef}>
      {/* Menu Bar */}
      <div className="flex h-9 items-center border-b border-gray-200 px-2">
        <div className="flex items-center space-x-1">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("file")}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              File
            </button>
            {activeDropdown === "file" && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => handleNew()}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>New</span>
                  <span className="text-xs text-gray-500">Ctrl+N</span>
                </button>
                <button
                  onClick={() => handleOpen()}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Open</span>
                  <span className="text-xs text-gray-500">Ctrl+O</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Save</span>
                  <span className="text-xs text-gray-500">Ctrl+S</span>
                </button>
                <button
                  onClick={handleSaveAs}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Save As</span>
                  <span className="text-xs text-gray-500">Ctrl+Shift+S</span>
                </button>
                <div className="my-1 border-t border-gray-200" />
                <button
                  onClick={() => handleExport("json")}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport("svg")}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Export as SVG
                </button>
                <button
                  onClick={() => handleExport("png")}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Export as PNG
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("edit")}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              Edit
            </button>
            {activeDropdown === "edit" && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => undo()}
                  disabled={!canUndo()}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  <span>Undo</span>
                  <span className="text-xs text-gray-500">Ctrl+Z</span>
                </button>
                <button
                  onClick={() => redo()}
                  disabled={!canRedo()}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  <span>Redo</span>
                  <span className="text-xs text-gray-500">Ctrl+Y</span>
                </button>
                <div className="my-1 border-t border-gray-200" />
                <button
                  onClick={handleCut}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Cut</span>
                  <span className="text-xs text-gray-500">Ctrl+X</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Copy</span>
                  <span className="text-xs text-gray-500">Ctrl+C</span>
                </button>
                <button
                  onClick={handlePaste}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Paste</span>
                  <span className="text-xs text-gray-500">Ctrl+V</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Delete</span>
                  <span className="text-xs text-gray-500">Del</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("view")}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              View
            </button>
            {activeDropdown === "view" && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={toggleGrid}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Grid</span>
                  {isGridVisible && <span className="text-xs">✓</span>}
                </button>
                <button
                  onClick={toggleSnap}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>Snap to Grid</span>
                  {snapToGrid && <span className="text-xs">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Arrange Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("arrange")}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              Arrange
            </button>
            {activeDropdown === "arrange" && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Bring to Front
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Send to Back
                </button>
                <div className="my-1 border-t border-gray-200" />
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Align Left
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Align Center
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Align Right
                </button>
                <div className="my-1 border-t border-gray-200" />
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Rotate Right
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Rotate Left
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Flip Horizontal
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Flip Vertical
                </button>
              </div>
            )}
          </div>

          {/* Extras Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("extras")}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              Extras
            </button>
            {activeDropdown === "extras" && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Plugins
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Templates
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Themes
                </button>
                <div className="my-1 border-t border-gray-200" />
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Settings
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("help")}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              Help
            </button>
            {activeDropdown === "help" && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Documentation
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Keyboard Shortcuts
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  Video Tutorials
                </button>
                <div className="my-1 border-t border-gray-200" />
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
                  About
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="flex h-12 items-center space-x-2 px-2">
        {/* File Operations Toolbar */}
        <FileOperationsToolbar />

        {/* Edit Operations */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => undo()}
            disabled={!canUndo()}
            className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo()}
            className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="rounded p-1.5 hover:bg-gray-100"
            title="Copy (Ctrl+C)"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handlePaste}
            className="rounded p-1.5 hover:bg-gray-100"
            title="Paste (Ctrl+V)"
          >
            <Clipboard className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1.5 hover:bg-gray-100"
            title="Delete (Del)"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <ZoomControlsToolbar />

        {/* Drawing Tools */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => setSelectedTool("select")}
            className={`rounded p-1.5 ${selectedTool === "select" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Selection Tool"
          >
            <MousePointer className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool("text")}
            className={`rounded p-1.5 ${selectedTool === "text" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Text Tool"
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool("rectangle")}
            className={`rounded p-1.5 ${selectedTool === "rectangle" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool("circle")}
            className={`rounded p-1.5 ${selectedTool === "circle" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool("line")}
            className={`rounded p-1.5 ${selectedTool === "line" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Connector"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool("freehand")}
            className={`rounded p-1.5 ${selectedTool === "freehand" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Freehand"
          >
            <PenTool className="h-4 w-4" />
          </button>
        </div>

        {/* View Options */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
          <button
            onClick={toggleGrid}
            className={`rounded p-1.5 ${isGridVisible ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Toggle Grid"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button className="rounded p-1.5 hover:bg-gray-100" title="Layers">
            <Layers className="h-4 w-4" />
          </button>
        </div>

        {/* Alignment Tools */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
          <button className="rounded p-1.5 hover:bg-gray-100" title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </button>
          <button className="rounded p-1.5 hover:bg-gray-100" title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </button>
          <button className="rounded p-1.5 hover:bg-gray-100" title="Align Right">
            <AlignRight className="h-4 w-4" />
          </button>
          <button className="rounded p-1.5 hover:bg-gray-100" title="Rotate">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Secondary Tools */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
            <Package className="h-4 w-4" />
            <span className="text-sm">Insert</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Format</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
