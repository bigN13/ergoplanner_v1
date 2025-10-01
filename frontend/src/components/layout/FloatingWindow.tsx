"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useFloatingWindows } from "@/contexts/FloatingWindowContext";

interface FloatingWindowProps {
  windowId: string;
  children: React.ReactNode;
  onClose?: () => void;
}

/**
 * Floating Window Component
 * Wraps content in a draggable, resizable window with controls
 */
export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  windowId,
  children,
  onClose,
}) => {
  const {
    windows,
    focusWindow,
    updateWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    closeWindow,
    getSnapPosition,
    constrainToMonitor,
  } = useFloatingWindows();

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const window = windows.get(windowId);

  // Handle window click to focus
  const handleWindowClick = useCallback(() => {
    focusWindow(windowId);
  }, [windowId, focusWindow]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window || window.isMaximized) return; // Can't drag maximized window

    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
    focusWindow(windowId);
  }, [window, windowId, focusWindow]);

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const proposedX = e.clientX - dragStart.x;
      const proposedY = e.clientY - dragStart.y;

      // Apply snapping
      const { x, y } = getSnapPosition(windowId, proposedX, proposedY);

      updateWindow(windowId, {
        position: { x, y },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, windowId, updateWindow, getSnapPosition]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, _corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window || window.isMaximized) return;

    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    });
    focusWindow(windowId);
  }, [window, windowId, focusWindow]);

  // Handle resize move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const newWindow = constrainToMonitor({
        ...window,
        size: {
          width: Math.max(200, resizeStart.width + deltaX),
          height: Math.max(150, resizeStart.height + deltaY),
        },
      });

      updateWindow(windowId, {
        size: newWindow.size,
        position: newWindow.position,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart, windowId, window, updateWindow, constrainToMonitor]);

  // Handle window controls
  const handleMinimize = useCallback(() => {
    minimizeWindow(windowId);
  }, [windowId, minimizeWindow]);

  const handleMaximize = useCallback(() => {
    if (!window) return;
    if (window.isMaximized) {
      restoreWindow(windowId);
    } else {
      maximizeWindow(windowId);
    }
  }, [window, windowId, maximizeWindow, restoreWindow]);

  const handleClose = useCallback(() => {
    closeWindow(windowId);
    onClose?.();
  }, [windowId, closeWindow, onClose]);

  // Double-click title bar to maximize/restore
  const handleTitleBarDoubleClick = useCallback(() => {
    handleMaximize();
  }, [handleMaximize]);

  if (!window) return null;

  if (window.isMinimized) {
    // Render minimized window as taskbar item (could be enhanced)
    return null;
  }

  return (
    <div
      ref={windowRef}
      className="floating-window"
      style={{
        position: "fixed",
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        zIndex: window.zIndex,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "default",
      }}
      onClick={handleWindowClick}
    >
      {/* Title Bar */}
      <div
        className="floating-window-title-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          cursor: window.isMaximized ? "default" : "grab",
          userSelect: "none",
        }}
        onMouseDown={handleDragStart}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        <div className="window-title" style={{ fontWeight: 600, fontSize: "14px" }}>
          {window.title}
        </div>

        {/* Window Controls */}
        <div className="window-controls" style={{ display: "flex", gap: "8px" }}>
          <button
            className="minimize-btn"
            onClick={handleMinimize}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "24px",
              height: "24px",
              border: "none",
              backgroundColor: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
            title="Minimize"
          >
            −
          </button>
          <button
            className="maximize-btn"
            onClick={handleMaximize}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "24px",
              height: "24px",
              border: "none",
              backgroundColor: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
            title={window.isMaximized ? "Restore" : "Maximize"}
          >
            {window.isMaximized ? "❐" : "□"}
          </button>
          <button
            className="close-btn"
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "24px",
              height: "24px",
              border: "none",
              backgroundColor: "#ff5f57",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div
        className="floating-window-content"
        style={{
          flex: 1,
          overflow: "auto",
          padding: "12px",
        }}
      >
        {children}
      </div>

      {/* Resize Handle (bottom-right corner) */}
      {!window.isMaximized && (
        <div
          className="resize-handle"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "16px",
            height: "16px",
            cursor: "nwse-resize",
            background: "linear-gradient(135deg, transparent 0%, transparent 50%, #999 50%, #999 100%)",
          }}
          onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
        />
      )}
    </div>
  );
};
