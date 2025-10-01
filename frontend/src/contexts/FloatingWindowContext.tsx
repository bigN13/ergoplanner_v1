"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

/**
 * Represents a floating window state
 */
export interface FloatingWindow {
  id: string;
  title: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  previousState?: {
    position: { x: number; y: number };
    size: { width: number; height: number };
  };
  panelId: string; // Associated rc-dock panel ID
}

/**
 * Window arrangement types
 */
export type WindowArrangement = "cascade" | "tile-horizontal" | "tile-vertical" | "tile-grid";

/**
 * Multi-monitor detection
 */
interface MonitorInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
}

/**
 * Floating Window Manager Context
 */
interface FloatingWindowContextValue {
  windows: Map<string, FloatingWindow>;
  activeWindowId: string | null;
  maxZIndex: number;

  // Window management
  registerWindow: (window: Omit<FloatingWindow, "zIndex">) => void;
  unregisterWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<FloatingWindow>) => void;
  focusWindow: (id: string) => void;

  // Window controls
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  closeWindow: (id: string) => void;

  // Window arrangement
  arrangeWindows: (arrangement: WindowArrangement) => void;
  cascadeWindows: () => void;
  tileWindows: (direction: "horizontal" | "vertical" | "grid") => void;

  // Window snapping
  getSnapPosition: (
    windowId: string,
    proposedX: number,
    proposedY: number,
    snapThreshold?: number
  ) => { x: number; y: number; snapped: boolean };

  // Persistence
  saveState: () => void;
  loadState: () => void;
  clearState: () => void;

  // Multi-monitor
  getMonitorInfo: () => MonitorInfo;
  constrainToMonitor: (window: FloatingWindow) => FloatingWindow;
}

const FloatingWindowContext = createContext<FloatingWindowContextValue | null>(null);

/**
 * Hook to access floating window context
 */
export const useFloatingWindows = (): FloatingWindowContextValue => {
  const context = useContext(FloatingWindowContext);
  if (!context) {
    throw new Error("useFloatingWindows must be used within FloatingWindowProvider");
  }
  return context;
};

const STORAGE_KEY = "ergoplanner-floating-windows";
const CASCADE_OFFSET = 30; // Pixels to offset each cascaded window
const SNAP_THRESHOLD = 10; // Default snap threshold in pixels
const MIN_WINDOW_SIZE = { width: 200, height: 150 };

/**
 * Floating Window Provider Component
 */
export const FloatingWindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<Map<string, FloatingWindow>>(new Map());
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState<number>(1000);

  // Load state from localStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  /**
   * Register a new floating window
   */
  const registerWindow = useCallback((window: Omit<FloatingWindow, "zIndex">) => {
    setWindows((prev) => {
      const newWindows = new Map(prev);
      const newZIndex = maxZIndex + 1;
      newWindows.set(window.id, { ...window, zIndex: newZIndex });
      return newWindows;
    });
    setMaxZIndex((prev) => prev + 1);
    setActiveWindowId(window.id);
  }, [maxZIndex]);

  /**
   * Unregister a floating window
   */
  const unregisterWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const newWindows = new Map(prev);
      newWindows.delete(id);
      return newWindows;
    });

    if (activeWindowId === id) {
      // Focus next available window
      const remainingWindows = Array.from(windows.values()).filter(w => w.id !== id);
      if (remainingWindows.length > 0) {
        const nextWindow = remainingWindows.sort((a, b) => b.zIndex - a.zIndex)[0];
        setActiveWindowId(nextWindow?.id ?? null);
      } else {
        setActiveWindowId(null);
      }
    }
  }, [activeWindowId, windows]);

  /**
   * Update window properties
   */
  const updateWindow = useCallback((id: string, updates: Partial<FloatingWindow>) => {
    setWindows((prev) => {
      const newWindows = new Map(prev);
      const window = newWindows.get(id);
      if (window) {
        newWindows.set(id, { ...window, ...updates });
      }
      return newWindows;
    });
  }, []);

  /**
   * Focus a window (bring to front)
   */
  const focusWindow = useCallback((id: string) => {
    const window = windows.get(id);
    if (!window) return;

    const newZIndex = maxZIndex + 1;
    updateWindow(id, { zIndex: newZIndex });
    setMaxZIndex(newZIndex);
    setActiveWindowId(id);
  }, [windows, maxZIndex, updateWindow]);

  /**
   * Minimize window
   */
  const minimizeWindow = useCallback((id: string) => {
    updateWindow(id, { isMinimized: true });
  }, [updateWindow]);

  /**
   * Maximize window
   */
  const maximizeWindow = useCallback((id: string) => {
    const window = windows.get(id);
    if (!window) return;

    const monitorInfo = getMonitorInfo();

    updateWindow(id, {
      isMaximized: true,
      previousState: {
        position: { ...window.position },
        size: { ...window.size },
      },
      position: { x: 0, y: 0 },
      size: {
        width: monitorInfo.availWidth,
        height: monitorInfo.availHeight,
      },
    });
  }, [windows, updateWindow]);

  /**
   * Restore window from minimized or maximized state
   */
  const restoreWindow = useCallback((id: string) => {
    const window = windows.get(id);
    if (!window) return;

    if (window.isMaximized && window.previousState) {
      updateWindow(id, {
        isMaximized: false,
        isMinimized: false,
        position: window.previousState.position,
        size: window.previousState.size,
        previousState: undefined,
      });
    } else {
      updateWindow(id, {
        isMinimized: false,
        isMaximized: false,
      });
    }
  }, [windows, updateWindow]);

  /**
   * Close window
   */
  const closeWindow = useCallback((id: string) => {
    unregisterWindow(id);
  }, [unregisterWindow]);

  /**
   * Arrange windows using specified arrangement
   */
  const arrangeWindows = useCallback((arrangement: WindowArrangement) => {
    switch (arrangement) {
      case "cascade":
        cascadeWindows();
        break;
      case "tile-horizontal":
        tileWindows("horizontal");
        break;
      case "tile-vertical":
        tileWindows("vertical");
        break;
      case "tile-grid":
        tileWindows("grid");
        break;
    }
  }, []);

  /**
   * Cascade windows diagonally
   */
  const cascadeWindows = useCallback(() => {
    const windowArray = Array.from(windows.values());
    const monitorInfo = getMonitorInfo();

    const baseWidth = Math.min(600, monitorInfo.availWidth * 0.6);
    const baseHeight = Math.min(400, monitorInfo.availHeight * 0.6);

    windowArray.forEach((window, index) => {
      const offset = index * CASCADE_OFFSET;
      updateWindow(window.id, {
        position: {
          x: Math.min(offset, monitorInfo.availWidth - baseWidth),
          y: Math.min(offset, monitorInfo.availHeight - baseHeight),
        },
        size: { width: baseWidth, height: baseHeight },
        isMinimized: false,
        isMaximized: false,
      });
    });
  }, [windows, updateWindow]);

  /**
   * Tile windows in specified direction
   */
  const tileWindows = useCallback((direction: "horizontal" | "vertical" | "grid") => {
    const windowArray = Array.from(windows.values()).filter(w => !w.isMinimized);
    if (windowArray.length === 0) return;

    const monitorInfo = getMonitorInfo();
    const { availWidth, availHeight } = monitorInfo;

    if (direction === "horizontal") {
      const windowWidth = availWidth / windowArray.length;
      windowArray.forEach((window, index) => {
        updateWindow(window.id, {
          position: { x: windowWidth * index, y: 0 },
          size: { width: windowWidth, height: availHeight },
          isMinimized: false,
          isMaximized: false,
        });
      });
    } else if (direction === "vertical") {
      const windowHeight = availHeight / windowArray.length;
      windowArray.forEach((window, index) => {
        updateWindow(window.id, {
          position: { x: 0, y: windowHeight * index },
          size: { width: availWidth, height: windowHeight },
          isMinimized: false,
          isMaximized: false,
        });
      });
    } else if (direction === "grid") {
      const cols = Math.ceil(Math.sqrt(windowArray.length));
      const rows = Math.ceil(windowArray.length / cols);
      const windowWidth = availWidth / cols;
      const windowHeight = availHeight / rows;

      windowArray.forEach((window, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        updateWindow(window.id, {
          position: {
            x: windowWidth * col,
            y: windowHeight * row,
          },
          size: { width: windowWidth, height: windowHeight },
          isMinimized: false,
          isMaximized: false,
        });
      });
    }
  }, [windows, updateWindow]);

  /**
   * Get snapped position for window based on proximity to edges and other windows
   */
  const getSnapPosition = useCallback((
    windowId: string,
    proposedX: number,
    proposedY: number,
    snapThreshold: number = SNAP_THRESHOLD
  ): { x: number; y: number; snapped: boolean } => {
    const window = windows.get(windowId);
    if (!window) return { x: proposedX, y: proposedY, snapped: false };

    const monitorInfo = getMonitorInfo();
    let x = proposedX;
    let y = proposedY;
    let snapped = false;

    // Snap to screen edges
    if (Math.abs(x) < snapThreshold) {
      x = 0;
      snapped = true;
    }
    if (Math.abs(y) < snapThreshold) {
      y = 0;
      snapped = true;
    }
    if (Math.abs(x + window.size.width - monitorInfo.availWidth) < snapThreshold) {
      x = monitorInfo.availWidth - window.size.width;
      snapped = true;
    }
    if (Math.abs(y + window.size.height - monitorInfo.availHeight) < snapThreshold) {
      y = monitorInfo.availHeight - window.size.height;
      snapped = true;
    }

    // Snap to other windows
    Array.from(windows.values()).forEach(otherWindow => {
      if (otherWindow.id === windowId || otherWindow.isMinimized) return;

      // Snap to right edge of other window
      if (Math.abs(x - (otherWindow.position.x + otherWindow.size.width)) < snapThreshold) {
        x = otherWindow.position.x + otherWindow.size.width;
        snapped = true;
      }

      // Snap to left edge of other window
      if (Math.abs((x + window.size.width) - otherWindow.position.x) < snapThreshold) {
        x = otherWindow.position.x - window.size.width;
        snapped = true;
      }

      // Snap to bottom edge of other window
      if (Math.abs(y - (otherWindow.position.y + otherWindow.size.height)) < snapThreshold) {
        y = otherWindow.position.y + otherWindow.size.height;
        snapped = true;
      }

      // Snap to top edge of other window
      if (Math.abs((y + window.size.height) - otherWindow.position.y) < snapThreshold) {
        y = otherWindow.position.y - window.size.height;
        snapped = true;
      }
    });

    return { x, y, snapped };
  }, [windows]);

  /**
   * Save floating window state to localStorage
   */
  const saveState = useCallback(() => {
    const state = {
      windows: Array.from(windows.entries()),
      activeWindowId,
      maxZIndex,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [windows, activeWindowId, maxZIndex]);

  /**
   * Load floating window state from localStorage
   */
  const loadState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        setWindows(new Map(state.windows));
        setActiveWindowId(state.activeWindowId);
        setMaxZIndex(state.maxZIndex);
      }
    } catch (error) {
      console.error("Failed to load floating window state:", error);
    }
  }, []);

  /**
   * Clear saved state
   */
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setWindows(new Map());
    setActiveWindowId(null);
    setMaxZIndex(1000);
  }, []);

  /**
   * Get monitor information
   */
  const getMonitorInfo = useCallback((): MonitorInfo => {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
    };
  }, []);

  /**
   * Constrain window to monitor bounds
   */
  const constrainToMonitor = useCallback((window: FloatingWindow): FloatingWindow => {
    const monitorInfo = getMonitorInfo();
    const constrained = { ...window };

    // Ensure minimum size
    constrained.size.width = Math.max(constrained.size.width, MIN_WINDOW_SIZE.width);
    constrained.size.height = Math.max(constrained.size.height, MIN_WINDOW_SIZE.height);

    // Constrain to monitor bounds
    constrained.position.x = Math.max(0, Math.min(
      constrained.position.x,
      monitorInfo.availWidth - constrained.size.width
    ));
    constrained.position.y = Math.max(0, Math.min(
      constrained.position.y,
      monitorInfo.availHeight - constrained.size.height
    ));

    return constrained;
  }, []);

  // Auto-save state when windows change
  useEffect(() => {
    if (windows.size > 0) {
      saveState();
    }
  }, [windows, saveState]);

  const contextValue: FloatingWindowContextValue = {
    windows,
    activeWindowId,
    maxZIndex,
    registerWindow,
    unregisterWindow,
    updateWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    closeWindow,
    arrangeWindows,
    cascadeWindows,
    tileWindows,
    getSnapPosition,
    saveState,
    loadState,
    clearState,
    getMonitorInfo,
    constrainToMonitor,
  };

  return (
    <FloatingWindowContext.Provider value={contextValue}>
      {children}
    </FloatingWindowContext.Provider>
  );
};
