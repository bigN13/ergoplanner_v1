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

  const {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleExport,
  } = useFileOperations();

  // Keyboard shortcuts for edit operations only
  // File shortcuts are now handled by FileOperationsToolbar

  useHotkeys("ctrl+z, cmd+z", () => canUndo() && undo(), [canUndo]);
  useHotkeys("ctrl+y, cmd+y", () => canRedo() && redo(), [canRedo]);

  useHotkeys("ctrl+c, cmd+c", (e) => {
    e.preventDefault();
    handleCopy();
  }, []);

  useHotkeys("ctrl+v, cmd+v", (e) => {
    e.preventDefault();
    handlePaste();
  }, []);

  useHotkeys("ctrl+x, cmd+x", (e) => {
    e.preventDefault();
    handleCut();
  }, []);

  useHotkeys("delete", () => {
    handleDelete();
  }, []);


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
    <div className={`bg-white border-b border-gray-200 ${className}`} ref={dropdownRef}>
      {/* Menu Bar */}
      <div className="flex items-center h-9 px-2 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("file")}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              File
            </button>
            {activeDropdown === "file" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-50">
                <button onClick={() => handleNew()} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>New</span>
                  <span className="text-xs text-gray-500">Ctrl+N</span>
                </button>
                <button onClick={() => handleOpen()} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Open</span>
                  <span className="text-xs text-gray-500">Ctrl+O</span>
                </button>
                <button onClick={handleSave} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Save</span>
                  <span className="text-xs text-gray-500">Ctrl+S</span>
                </button>
                <button onClick={handleSaveAs} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Save As</span>
                  <span className="text-xs text-gray-500">Ctrl+Shift+S</span>
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button onClick={() => handleExport("json")} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">
                  Export as JSON
                </button>
                <button onClick={() => handleExport("svg")} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">
                  Export as SVG
                </button>
                <button onClick={() => handleExport("png")} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">
                  Export as PNG
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("edit")}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Edit
            </button>
            {activeDropdown === "edit" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-50">
                <button onClick={() => undo()} disabled={!canUndo()} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between disabled:opacity-50">
                  <span>Undo</span>
                  <span className="text-xs text-gray-500">Ctrl+Z</span>
                </button>
                <button onClick={() => redo()} disabled={!canRedo()} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between disabled:opacity-50">
                  <span>Redo</span>
                  <span className="text-xs text-gray-500">Ctrl+Y</span>
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button onClick={handleCut} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Cut</span>
                  <span className="text-xs text-gray-500">Ctrl+X</span>
                </button>
                <button onClick={handleCopy} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Copy</span>
                  <span className="text-xs text-gray-500">Ctrl+C</span>
                </button>
                <button onClick={handlePaste} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Paste</span>
                  <span className="text-xs text-gray-500">Ctrl+V</span>
                </button>
                <button onClick={handleDelete} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
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
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              View
            </button>
            {activeDropdown === "view" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-50">
                <button onClick={toggleGrid} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Grid</span>
                  {isGridVisible && <span className="text-xs">✓</span>}
                </button>
                <button onClick={toggleSnap} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between">
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
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Arrange
            </button>
            {activeDropdown === "arrange" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-50">
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Bring to Front</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Send to Back</button>
                <div className="border-t border-gray-200 my-1" />
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Align Left</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Align Center</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Align Right</button>
                <div className="border-t border-gray-200 my-1" />
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Rotate Right</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Rotate Left</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Flip Horizontal</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Flip Vertical</button>
              </div>
            )}
          </div>

          {/* Extras Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("extras")}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Extras
            </button>
            {activeDropdown === "extras" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-50">
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Plugins</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Templates</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Themes</button>
                <div className="border-t border-gray-200 my-1" />
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Settings</button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("help")}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Help
            </button>
            {activeDropdown === "help" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-50">
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Documentation</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Keyboard Shortcuts</button>
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Video Tutorials</button>
                <div className="border-t border-gray-200 my-1" />
                <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100">About</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="flex items-center h-12 px-2 space-x-2">
        {/* File Operations Toolbar */}
        <FileOperationsToolbar />

        {/* Edit Operations */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={() => undo()}
            disabled={!canUndo()}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo()}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handlePaste}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Paste (Ctrl+V)"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Delete (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <ZoomControlsToolbar />

        {/* Drawing Tools */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={() => setSelectedTool("select")}
            className={`p-1.5 rounded ${selectedTool === "select" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Selection Tool"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool("text")}
            className={`p-1.5 rounded ${selectedTool === "text" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Text Tool"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool("rectangle")}
            className={`p-1.5 rounded ${selectedTool === "rectangle" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool("circle")}
            className={`p-1.5 rounded ${selectedTool === "circle" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool("line")}
            className={`p-1.5 rounded ${selectedTool === "line" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Connector"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool("freehand")}
            className={`p-1.5 rounded ${selectedTool === "freehand" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Freehand"
          >
            <PenTool className="w-4 h-4" />
          </button>
        </div>

        {/* View Options */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={toggleGrid}
            className={`p-1.5 rounded ${isGridVisible ? "bg-blue-100" : "hover:bg-gray-100"}`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Layers"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment Tools */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button className="p-1.5 hover:bg-gray-100 rounded" title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="Align Right">
            <AlignRight className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="Rotate">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary Tools */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
            <Package className="w-4 h-4" />
            <span className="text-sm">Insert</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Format</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}