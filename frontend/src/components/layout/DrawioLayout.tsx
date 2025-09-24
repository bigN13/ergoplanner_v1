"use client";

import React, { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DrawingCanvas from "@/components/drawing/DrawingCanvas";
import SymbolLibrary from "@/components/drawing/SymbolLibrary";
import PropertyPanel from "@/components/drawing/PropertyPanel";
import LayersPanel from "@/components/drawing/LayersPanel";
import MainToolbar from "@/components/drawing/MainToolbar";

interface DrawioLayoutProps {
  children?: React.ReactNode;
}

export default function DrawioLayout({ children }: DrawioLayoutProps) {
  const [showAutoSave, setShowAutoSave] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(280);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [rightActiveTab, setRightActiveTab] = useState<"properties" | "format" | "layers">("properties");

  const leftDragRef = useRef<HTMLDivElement>(null);
  const rightDragRef = useRef<HTMLDivElement>(null);

  // Handle drag and drop for symbols
  const handleSymbolDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData("nodeType", nodeType);
    event.dataTransfer.setData("nodeData", JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = "move";
  };

  // Drawing store is now used by MainToolbar directly

  // Handle sidebar dragging
  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  };

  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft && !leftSidebarCollapsed) {
        const newWidth = Math.max(200, Math.min(400, e.clientX));
        setLeftSidebarWidth(newWidth);
      }
      if (isDraggingRight && !rightSidebarCollapsed) {
        const newWidth = Math.max(200, Math.min(400, window.innerWidth - e.clientX));
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Main Toolbar */}
      <MainToolbar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div
          className={`bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200 ${
            leftSidebarCollapsed ? 'w-12' : ''
          }`}
          style={{ width: leftSidebarCollapsed ? '48px' : `${leftSidebarWidth}px` }}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-10 px-2 border-b border-gray-200 bg-gray-50">
              {!leftSidebarCollapsed && (
                <span className="text-sm font-medium">Symbols</span>
              )}
              <button
                onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {leftSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Sidebar Content */}
            {!leftSidebarCollapsed && (
              <div className="flex-1 overflow-auto p-2">
                <SymbolLibrary onDragStart={handleSymbolDragStart} />
              </div>
            )}
          </div>

          {/* Resize Handle */}
          {!leftSidebarCollapsed && (
            <div
              ref={leftDragRef}
              onMouseDown={handleLeftMouseDown}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
              style={{ transform: 'translateX(50%)' }}
            />
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          <DrawingCanvas />
        </div>

        {/* Right Sidebar */}
        <div
          className={`bg-white border-l border-gray-200 flex-shrink-0 transition-all duration-200 ${
            rightSidebarCollapsed ? 'w-12' : ''
          }`}
          style={{ width: rightSidebarCollapsed ? '48px' : `${rightSidebarWidth}px` }}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-10 px-2 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {rightSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {!rightSidebarCollapsed && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setRightActiveTab("properties")}
                    className={`px-2 py-1 text-xs rounded ${
                      rightActiveTab === "properties" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                  >
                    Properties
                  </button>
                  <button
                    onClick={() => setRightActiveTab("format")}
                    className={`px-2 py-1 text-xs rounded ${
                      rightActiveTab === "format" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                  >
                    Format
                  </button>
                  <button
                    onClick={() => setRightActiveTab("layers")}
                    className={`px-2 py-1 text-xs rounded ${
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
                      <h3 className="text-sm font-medium mb-2">Style</h3>
                      <div className="space-y-2">
                        <label className="block text-xs">
                          <span className="text-gray-600">Fill Color</span>
                          <input type="color" className="w-full h-8 mt-1" />
                        </label>
                        <label className="block text-xs">
                          <span className="text-gray-600">Stroke Color</span>
                          <input type="color" className="w-full h-8 mt-1" />
                        </label>
                        <label className="block text-xs">
                          <span className="text-gray-600">Stroke Width</span>
                          <input type="range" min="1" max="10" className="w-full mt-1" />
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
              className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
              style={{ transform: 'translateX(-50%)' }}
            />
          )}
        </div>
      </div>

      {/* Footer/Status Bar */}
      <footer className="bg-gray-50 border-t border-gray-200 h-8 flex items-center px-3 flex-shrink-0">
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