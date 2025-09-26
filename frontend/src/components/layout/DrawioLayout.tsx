"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useRef } from "react";

import DrawingCanvas from "@/components/drawing/DrawingCanvas";
import DrawingToolbar from "@/components/drawing/DrawingToolbar";
import EditOperationsToolbar from "@/components/drawing/EditOperationsToolbar";
import LayersPanel from "@/components/drawing/LayersPanel";
import MainToolbar from "@/components/drawing/MainToolbar";
import PrimaryDrawingToolsToolbar from "@/components/drawing/PrimaryDrawingToolsToolbar";
import PropertyPanel from "@/components/drawing/PropertyPanel";
import SymbolLibrary from "@/components/drawing/SymbolLibrary";
import ToolOptionsBar from "@/components/drawing/ToolOptionsBar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDrawingStore } from "@/store/drawingStore";

interface DrawioLayoutProps {
  children?: React.ReactNode;
}

export default function DrawioLayout({
  children: _children,
}: DrawioLayoutProps): React.ReactElement {
  const [_showAutoSave, _setShowAutoSave] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(280);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [rightActiveTab, setRightActiveTab] = useState<"properties" | "format" | "layers">(
    "properties"
  );
  const [leftActiveTab, setLeftActiveTab] = useState<"tools" | "symbols">("tools");

  const leftDragRef = useRef<HTMLDivElement>(null);
  const rightDragRef = useRef<HTMLDivElement>(null);

  // Initialize command manager and keyboard shortcuts
  const { initializeCommandManager } = useDrawingStore();

  // Enable keyboard shortcuts for undo/redo
  useKeyboardShortcuts();

  // Initialize command manager on component mount
  React.useEffect(() => {
    initializeCommandManager();
  }, [initializeCommandManager]);

  // Handle drag and drop for symbols
  const handleSymbolDragStart = (
    event: React.DragEvent,
    nodeType: string,
    nodeData: Record<string, unknown>
  ): void => {
    const { dataTransfer } = event;
    dataTransfer.setData("nodeType", nodeType);
    dataTransfer.setData("nodeData", JSON.stringify(nodeData));
    dataTransfer.effectAllowed = "move";
  };

  // Drawing store is now used by MainToolbar directly

  // Handle sidebar dragging
  const handleLeftMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();
    setIsDraggingLeft(true);
  };

  const handleRightMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();
    setIsDraggingRight(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (isDraggingLeft && !leftSidebarCollapsed) {
        const newWidth = Math.max(200, Math.min(400, e.clientX));
        setLeftSidebarWidth(newWidth);
      }
      if (isDraggingRight && !rightSidebarCollapsed) {
        const newWidth = Math.max(200, Math.min(400, window.innerWidth - e.clientX));
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = (): void => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDraggingLeft, isDraggingRight, leftSidebarCollapsed, rightSidebarCollapsed]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Main Toolbar */}
      <MainToolbar />

      {/* Edit Operations Toolbar */}
      <EditOperationsToolbar className="border-b border-gray-200" orientation="horizontal" />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div
          className={`flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-200 ${
            leftSidebarCollapsed ? "w-12" : ""
          }`}
          style={{ width: leftSidebarCollapsed ? "48px" : `${leftSidebarWidth}px` }}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header with Tabs */}
            {!leftSidebarCollapsed && (
              <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-gray-50 px-2">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setLeftActiveTab("tools")}
                    className={`rounded px-3 py-1 text-xs ${
                      leftActiveTab === "tools"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Tools
                  </button>
                  <button
                    onClick={() => setLeftActiveTab("symbols")}
                    className={`rounded px-3 py-1 text-xs ${
                      leftActiveTab === "symbols"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Symbols
                  </button>
                </div>
                <button
                  onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                  className="rounded p-1 hover:bg-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Collapsed Header */}
            {leftSidebarCollapsed && (
              <div className="flex h-10 items-center justify-center border-b border-gray-200 bg-gray-50 px-2">
                <button
                  onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                  className="rounded p-1 hover:bg-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Sidebar Content */}
            {!leftSidebarCollapsed && (
              <div className="flex-1 overflow-auto">
                {leftActiveTab === "tools" && (
                  <div className="p-2">
                    <DrawingToolbar />
                  </div>
                )}
                {leftActiveTab === "symbols" && (
                  <div className="p-2">
                    <SymbolLibrary onDragStart={handleSymbolDragStart} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resize Handle */}
          {!leftSidebarCollapsed && (
            <div
              ref={leftDragRef}
              onMouseDown={handleLeftMouseDown}
              className="absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors hover:bg-blue-500"
              style={{ transform: "translateX(50%)" }}
            />
          )}
        </div>

        {/* Canvas Area */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-gray-100">
          {/* Tool Options Bar */}
          <ToolOptionsBar className="flex-shrink-0" />

          {/* Drawing Canvas */}
          <div className="relative flex-1 overflow-hidden">
            <DrawingCanvas />

            {/* Primary Drawing Tools Toolbar - Floating */}
            <div className="absolute top-4 left-4 z-10">
              <PrimaryDrawingToolsToolbar orientation="horizontal" />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          className={`flex-shrink-0 border-l border-gray-200 bg-white transition-all duration-200 ${
            rightSidebarCollapsed ? "w-12" : ""
          }`}
          style={{ width: rightSidebarCollapsed ? "48px" : `${rightSidebarWidth}px` }}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-gray-50 px-2">
              <button
                onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
                className="rounded p-1 hover:bg-gray-200"
              >
                {rightSidebarCollapsed ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {!rightSidebarCollapsed && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setRightActiveTab("properties")}
                    className={`rounded px-2 py-1 text-xs ${
                      rightActiveTab === "properties"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    Properties
                  </button>
                  <button
                    onClick={() => setRightActiveTab("format")}
                    className={`rounded px-2 py-1 text-xs ${
                      rightActiveTab === "format" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                  >
                    Format
                  </button>
                  <button
                    onClick={() => setRightActiveTab("layers")}
                    className={`rounded px-2 py-1 text-xs ${
                      rightActiveTab === "layers" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                  >
                    Layers
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Content */}
            {!rightSidebarCollapsed && (
              <div className="flex-1 overflow-auto p-2">
                {rightActiveTab === "properties" && <PropertyPanel />}
                {rightActiveTab === "format" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-sm font-medium">Style</h3>
                      <div className="space-y-2">
                        <label className="block text-xs">
                          <span className="text-gray-600">Fill Color</span>
                          <input type="color" className="mt-1 h-8 w-full" />
                        </label>
                        <label className="block text-xs">
                          <span className="text-gray-600">Stroke Color</span>
                          <input type="color" className="mt-1 h-8 w-full" />
                        </label>
                        <label className="block text-xs">
                          <span className="text-gray-600">Stroke Width</span>
                          <input type="range" min="1" max="10" className="mt-1 w-full" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {rightActiveTab === "layers" && <LayersPanel />}
              </div>
            )}
          </div>

          {/* Resize Handle */}
          {!rightSidebarCollapsed && (
            <div
              ref={rightDragRef}
              onMouseDown={handleRightMouseDown}
              className="absolute top-0 left-0 h-full w-1 cursor-col-resize transition-colors hover:bg-blue-500"
              style={{ transform: "translateX(-50%)" }}
            />
          )}
        </div>
      </div>

      {/* Footer/Status Bar */}
      <footer className="flex h-8 flex-shrink-0 items-center border-t border-gray-200 bg-gray-50 px-3">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span>Ready</span>
          <span>|</span>
          <span>Objects: 0</span>
          <span>|</span>
          <span>Zoom: 100%</span>
          <span>|</span>
          <span>Grid: On</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span>Autosave: On</span>
          <span>|</span>
          <span>Last saved: Never</span>
        </div>
      </footer>
    </div>
  );
}
