"use client";

import type { LayoutData as RcLayoutData, TabData as RcTabData, DragDropContainer } from "rc-dock";
import DockLayout from "rc-dock";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

import "rc-dock/dist/rc-dock.css";
import BoQPanel from "@/components/drawing/BoQPanel";
import DrawingCanvas from "@/components/drawing/DrawingCanvas";
import HistoryPanel from "@/components/drawing/HistoryPanel";
import LayersPanel from "@/components/drawing/LayersPanel";
import MinimapPanel from "@/components/drawing/MinimapPanel";
import PropertyPanel from "@/components/drawing/PropertyPanel";
import SymbolLibrary from "@/components/drawing/SymbolLibrary";
import Toolbar from "@/components/drawing/Toolbar";
import { useEnhancedDrawingStore } from "@/store/enhanced-drawing-store";
import { DEFAULT_LAYOUT_PRESETS } from "@/types/dock-layout";
import type { DockLayoutConfig, PanelProps } from "@/types/dock-layout";

// Panel wrapper components to adapt interfaces
const SymbolLibraryWrapper: React.FC<PanelProps> = () => {
  const handleDragStart = (
    _event: React.DragEvent,
    nodeType: string,
    nodeData: Record<string, unknown>
  ): void => {
    console.warn("Drag started:", { nodeType, nodeData });
  };

  return <SymbolLibrary onDragStart={handleDragStart} />;
};

const ToolbarWrapper: React.FC<PanelProps> = () => {
  const handleExportSVG = (): void => console.warn("Export SVG");
  const handleExportPNG = (): void => console.warn("Export PNG");
  const handleFitView = (): void => console.warn("Fit view");
  const handleZoomIn = (): void => console.warn("Zoom in");
  const handleZoomOut = (): void => console.warn("Zoom out");
  const handleToolChange = (tool: "select" | "pan"): void => console.warn("Tool change:", tool);

  return (
    <Toolbar
      onExportSVG={handleExportSVG}
      onExportPNG={handleExportPNG}
      onFitView={handleFitView}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      tool="select"
      onToolChange={handleToolChange}
    />
  );
};

// Panel component mapping with proper wrappers
const PANEL_COMPONENTS: Record<string, React.ComponentType<PanelProps>> = {
  DrawingCanvas: DrawingCanvas as React.ComponentType<PanelProps>,
  SymbolLibrary: SymbolLibraryWrapper,
  PropertyPanel: PropertyPanel as React.ComponentType<PanelProps>,
  Toolbar: ToolbarWrapper,
  LayersPanel: LayersPanel as React.ComponentType<PanelProps>,
  BoQPanel: BoQPanel as React.ComponentType<PanelProps>,
  MinimapPanel: MinimapPanel as React.ComponentType<PanelProps>,
  HistoryPanel: HistoryPanel as React.ComponentType<PanelProps>,
};

interface AutoHideState {
  [key: string]: {
    isHidden: boolean;
    originalSize: number;
    edge: 'left' | 'right' | 'top' | 'bottom';
  };
}

interface DropZone {
  id: string;
  rect: DOMRect;
  type: 'edge' | 'tab' | 'float' | 'quarter';
  position?: 'left' | 'right' | 'top' | 'bottom' | 'tl' | 'tr' | 'bl' | 'br';
  magneticStrength?: number;
}

interface DragState {
  isDragging: boolean;
  activeTab?: RcTabData;
  dropZones: DropZone[];
  hoveredZone?: DropZone;
  magneticTarget?: DropZone;
}

interface EnhancedDockLayoutProps {
  config?: DockLayoutConfig;
  onLayoutChange?: (layout: RcLayoutData) => void;
  theme?: "light" | "dark";
  enableAutoHide?: boolean;
  enableQuarterSplit?: boolean;
  enableMagneticSnapping?: boolean;
  magneticThreshold?: number;
}

const EnhancedDockLayout: React.FC<EnhancedDockLayoutProps> = ({
  config,
  onLayoutChange,
  theme = "light",
  enableAutoHide = true,
  enableQuarterSplit = true,
  enableMagneticSnapping = true,
  magneticThreshold = 20,
}) => {
  const dockLayoutRef = useRef<DockLayout>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<RcLayoutData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [autoHideState, setAutoHideState] = useState<AutoHideState>({});
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dropZones: [],
  });
  const { selectedElements } = useEnhancedDrawingStore();

  // Load layout from localStorage
  useEffect(() => {
    setIsClient(true);
    const savedLayoutKey = config?.saveLayoutKey || "ergoplanner-enhanced-dock-layout";
    const savedLayout = localStorage.getItem(savedLayoutKey);

    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setLayout(parsedLayout);
      } catch (e) {
        console.error("Failed to parse saved layout:", e);
        setLayout((DEFAULT_LAYOUT_PRESETS[0]?.layout as RcLayoutData) || null);
      }
    } else {
      setLayout(
        (config?.defaultLayout as RcLayoutData) ||
          (DEFAULT_LAYOUT_PRESETS[0]?.layout as RcLayoutData) ||
          null
      );
    }
  }, [config]);

  // Enhanced layout change handler
  const handleLayoutChange = useCallback((newLayout: RcLayoutData | null): void => {
    if (!newLayout) return;

    setLayout(newLayout);
    const savedLayoutKey = config?.saveLayoutKey || "ergoplanner-enhanced-dock-layout";
    localStorage.setItem(savedLayoutKey, JSON.stringify(newLayout));
    onLayoutChange?.(newLayout);
  }, [config?.saveLayoutKey, onLayoutChange]);

  // Auto-hide functionality
  const toggleAutoHide = useCallback((panelId: string, edge: 'left' | 'right' | 'top' | 'bottom') => {
    if (!enableAutoHide) return;

    setAutoHideState(prev => {
      const current = prev[panelId];
      if (current) {
        // Show panel
        return {
          ...prev,
          [panelId]: {
            ...current,
            isHidden: false,
          }
        };
      } else {
        // Hide panel
        return {
          ...prev,
          [panelId]: {
            isHidden: true,
            originalSize: 250, // Default size, could be extracted from layout
            edge,
          }
        };
      }
    });
  }, [enableAutoHide]);

  // Quarter split detection
  const detectQuarterSplit = useCallback((clientX: number, clientY: number, targetRect: DOMRect): DropZone | null => {
    if (!enableQuarterSplit) return null;

    const cornerSize = 40; // 40px corner zones
    const { left, top, right, bottom } = targetRect;

    // Top-left corner
    if (clientX - left < cornerSize && clientY - top < cornerSize) {
      return {
        id: 'quarter-tl',
        rect: new DOMRect(left, top, cornerSize, cornerSize),
        type: 'quarter',
        position: 'tl',
        magneticStrength: magneticThreshold,
      };
    }

    // Top-right corner
    if (right - clientX < cornerSize && clientY - top < cornerSize) {
      return {
        id: 'quarter-tr',
        rect: new DOMRect(right - cornerSize, top, cornerSize, cornerSize),
        type: 'quarter',
        position: 'tr',
        magneticStrength: magneticThreshold,
      };
    }

    // Bottom-left corner
    if (clientX - left < cornerSize && bottom - clientY < cornerSize) {
      return {
        id: 'quarter-bl',
        rect: new DOMRect(left, bottom - cornerSize, cornerSize, cornerSize),
        type: 'quarter',
        position: 'bl',
        magneticStrength: magneticThreshold,
      };
    }

    // Bottom-right corner
    if (right - clientX < cornerSize && bottom - clientY < cornerSize) {
      return {
        id: 'quarter-br',
        rect: new DOMRect(right - cornerSize, bottom - cornerSize, cornerSize, cornerSize),
        type: 'quarter',
        position: 'br',
        magneticStrength: magneticThreshold,
      };
    }

    return null;
  }, [enableQuarterSplit, magneticThreshold]);

  // Magnetic edge detection
  const detectMagneticEdges = useCallback((clientX: number, clientY: number): DropZone[] => {
    if (!enableMagneticSnapping || !containerRef.current) return [];

    const containerRect = containerRef.current.getBoundingClientRect();
    const zones: DropZone[] = [];

    // Left edge
    if (clientX - containerRect.left < magneticThreshold) {
      zones.push({
        id: 'magnetic-left',
        rect: new DOMRect(containerRect.left, containerRect.top, magneticThreshold, containerRect.height),
        type: 'edge',
        position: 'left',
        magneticStrength: magneticThreshold - (clientX - containerRect.left),
      });
    }

    // Right edge
    if (containerRect.right - clientX < magneticThreshold) {
      zones.push({
        id: 'magnetic-right',
        rect: new DOMRect(containerRect.right - magneticThreshold, containerRect.top, magneticThreshold, containerRect.height),
        type: 'edge',
        position: 'right',
        magneticStrength: magneticThreshold - (containerRect.right - clientX),
      });
    }

    // Top edge
    if (clientY - containerRect.top < magneticThreshold) {
      zones.push({
        id: 'magnetic-top',
        rect: new DOMRect(containerRect.left, containerRect.top, containerRect.width, magneticThreshold),
        type: 'edge',
        position: 'top',
        magneticStrength: magneticThreshold - (clientY - containerRect.top),
      });
    }

    // Bottom edge
    if (containerRect.bottom - clientY < magneticThreshold) {
      zones.push({
        id: 'magnetic-bottom',
        rect: new DOMRect(containerRect.left, containerRect.bottom - magneticThreshold, containerRect.width, magneticThreshold),
        type: 'edge',
        position: 'bottom',
        magneticStrength: magneticThreshold - (containerRect.bottom - clientY),
      });
    }

    return zones;
  }, [enableMagneticSnapping, magneticThreshold]);

  // Drag event handlers
  const handleDragStart = useCallback((e: CustomEvent) => {
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      activeTab: e.detail?.tab,
    }));
  }, []);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !containerRef.current) return;

    const { clientX, clientY } = e;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Detect quarter splits
    const quarterZone = detectQuarterSplit(clientX, clientY, containerRect);

    // Detect magnetic edges
    const magneticZones = detectMagneticEdges(clientX, clientY);

    const dropZones: DropZone[] = [];
    if (quarterZone) dropZones.push(quarterZone);
    dropZones.push(...magneticZones);

    // Find the strongest magnetic zone
    const strongestMagnetic = magneticZones.reduce((strongest, zone) => {
      if (!strongest || (zone.magneticStrength || 0) > (strongest.magneticStrength || 0)) {
        return zone;
      }
      return strongest;
    }, undefined as DropZone | undefined);

    setDragState(prev => ({
      ...prev,
      dropZones,
      hoveredZone: quarterZone || strongestMagnetic,
      magneticTarget: strongestMagnetic,
    }));
  }, [dragState.isDragging, detectQuarterSplit, detectMagneticEdges]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dropZones: [],
    });
  }, []);

  // Setup drag event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('dragenter', handleDragStart as EventListener);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('dragend', handleDragEnd);

    return () => {
      container.removeEventListener('dragenter', handleDragStart as EventListener);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  // Convert panel content string to component
  const loadTab = useCallback((tab: RcTabData): RcTabData => {
    const contentType = typeof tab.content === "string" ? tab.content : "DrawingCanvas";
    const Component = PANEL_COMPONENTS[contentType];

    if (!Component) {
      console.warn(`Panel component not found: ${contentType}`);
      return {
        ...tab,
        content: <div>Panel not found: {contentType}</div>,
      };
    }

    // Enhanced tab with auto-hide controls
    const enhancedContent = (
      <div className="relative h-full">
        {enableAutoHide && (
          <div className="absolute top-1 right-1 z-10 flex gap-1">
            <button
              onClick={() => toggleAutoHide(tab.id || '', 'left')}
              className="opacity-50 hover:opacity-100 text-xs px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded"
              title="Auto-hide"
            >
              ◀
            </button>
          </div>
        )}
        <Component panelId={tab.id || ""} isActive={true} data={{ selectedElements }} />
      </div>
    );

    return {
      ...tab,
      content: enhancedContent,
      closable: tab.closable !== false,
      cached: true,
    };
  }, [selectedElements, enableAutoHide, toggleAutoHide]);

  // Enhanced groups with auto-hide and quarter split support
  const groups = useMemo(
    () => ({
      sidebar: {
        floatable: true,
        maximizable: true,
        // Custom drop modes for enhanced functionality
        dropMode: enableQuarterSplit ? 'edge|float|tab' : 'edge|float|tab',
      },
      main: {
        floatable: false,
        maximizable: true,
        dropMode: enableQuarterSplit ? 'edge|float|tab' : 'edge|float|tab',
      },
      top: {
        floatable: false,
        maximizable: false,
        dropMode: 'tab',
      },
    }),
    [enableQuarterSplit]
  );

  // Visual drop zone indicators
  const DropZoneIndicators: React.FC = () => {
    if (!dragState.isDragging || dragState.dropZones.length === 0) return null;

    return (
      <>
        {dragState.dropZones.map((zone) => (
          <div
            key={zone.id}
            className={`
              absolute pointer-events-none z-50 border-2 border-dashed transition-all duration-150
              ${zone.type === 'quarter'
                ? 'border-purple-500 bg-purple-200/30'
                : 'border-blue-500 bg-blue-200/30'
              }
              ${dragState.hoveredZone?.id === zone.id ? 'opacity-100' : 'opacity-60'}
            `}
            style={{
              left: zone.rect.left,
              top: zone.rect.top,
              width: zone.rect.width,
              height: zone.rect.height,
            }}
          >
            {zone.type === 'quarter' && (
              <div className="flex items-center justify-center h-full text-purple-600 font-semibold">
                ◢
              </div>
            )}
            {zone.type === 'edge' && (
              <div className="flex items-center justify-center h-full text-blue-600 font-semibold">
                {zone.position === 'left' ? '◀' : zone.position === 'right' ? '▶' :
                 zone.position === 'top' ? '▲' : '▼'}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  // Auto-hide edge triggers
  const AutoHideEdgeTriggers: React.FC = () => {
    if (!enableAutoHide) return null;

    return (
      <>
        {/* Left edge trigger */}
        <div
          className="absolute left-0 top-0 w-2 h-full z-40 hover:bg-blue-200/50 transition-colors"
          onMouseEnter={() => {
            // Show auto-hidden panels on left edge
            Object.entries(autoHideState).forEach(([panelId, state]) => {
              if (state.isHidden && state.edge === 'left') {
                toggleAutoHide(panelId, 'left');
              }
            });
          }}
        />

        {/* Right edge trigger */}
        <div
          className="absolute right-0 top-0 w-2 h-full z-40 hover:bg-blue-200/50 transition-colors"
          onMouseEnter={() => {
            Object.entries(autoHideState).forEach(([panelId, state]) => {
              if (state.isHidden && state.edge === 'right') {
                toggleAutoHide(panelId, 'right');
              }
            });
          }}
        />

        {/* Top edge trigger */}
        <div
          className="absolute top-0 left-0 w-full h-2 z-40 hover:bg-blue-200/50 transition-colors"
          onMouseEnter={() => {
            Object.entries(autoHideState).forEach(([panelId, state]) => {
              if (state.isHidden && state.edge === 'top') {
                toggleAutoHide(panelId, 'top');
              }
            });
          }}
        />

        {/* Bottom edge trigger */}
        <div
          className="absolute bottom-0 left-0 w-full h-2 z-40 hover:bg-blue-200/50 transition-colors"
          onMouseEnter={() => {
            Object.entries(autoHideState).forEach(([panelId, state]) => {
              if (state.isHidden && state.edge === 'bottom') {
                toggleAutoHide(panelId, 'bottom');
              }
            });
          }}
        />
      </>
    );
  };

  if (!isClient || !layout) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading enhanced workspace...</div>
      </div>
    );
  }

  return (
    <div className={`enhanced-dock-layout-wrapper h-screen w-full ${theme}`} ref={containerRef}>
      {/* Enhanced Layout Controls */}
      <div className="absolute top-2 right-2 z-50 flex gap-2">
        <div className="flex items-center gap-2 px-2 py-1 bg-white/90 dark:bg-gray-800/90 rounded shadow">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={enableAutoHide}
              onChange={() => {/* Toggle would require prop update */}}
              className="w-3 h-3"
            />
            Auto-hide
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={enableQuarterSplit}
              onChange={() => {/* Toggle would require prop update */}}
              className="w-3 h-3"
            />
            Quarter split
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={enableMagneticSnapping}
              onChange={() => {/* Toggle would require prop update */}}
              className="w-3 h-3"
            />
            Magnetic snap
          </label>
        </div>
      </div>

      {/* Auto-hide edge triggers */}
      <AutoHideEdgeTriggers />

      {/* DockLayout Component */}
      <DockLayout
        ref={dockLayoutRef}
        layout={layout}
        loadTab={loadTab}
        groups={groups}
        onLayoutChange={(newLayout) => handleLayoutChange(newLayout as RcLayoutData)}
        style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
      />

      {/* Drop zone indicators */}
      {createPortal(<DropZoneIndicators />, document.body)}

      {/* Enhanced custom styles */}
      <style jsx global>{`
        .enhanced-dock-layout-wrapper.dark {
          --dock-tab-bg: #1f2937;
          --dock-tab-active-bg: #374151;
          --dock-tab-border: #4b5563;
          --dock-panel-bg: #111827;
          --dock-divider-color: #374151;
        }

        .enhanced-dock-layout-wrapper.light {
          --dock-tab-bg: #f3f4f6;
          --dock-tab-active-bg: #ffffff;
          --dock-tab-border: #d1d5db;
          --dock-panel-bg: #ffffff;
          --dock-divider-color: #e5e7eb;
        }

        .dock-layout {
          background: var(--dock-panel-bg);
        }

        .dock-tab {
          background: var(--dock-tab-bg);
          border-color: var(--dock-tab-border);
          transition: all 0.2s ease;
        }

        .dock-tab:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dock-tab-active {
          background: var(--dock-tab-active-bg);
          border-bottom: 2px solid #3b82f6;
        }

        .dock-divider {
          background: var(--dock-divider-color);
          transition: background-color 0.2s ease;
        }

        .dock-divider:hover {
          background: #3b82f6;
        }

        .dock-panel {
          background: var(--dock-panel-bg);
          border-color: var(--dock-tab-border);
          transition: box-shadow 0.2s ease;
        }

        .dock-panel:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        /* Enhanced drag and drop styles */
        .dock-layout .dock-drop-indicator {
          background: #3b82f6 !important;
          opacity: 0.8;
          border-radius: 4px;
        }

        .dock-layout .dock-drop-square {
          background: rgba(59, 130, 246, 0.3) !important;
          border: 2px dashed #3b82f6 !important;
          border-radius: 8px;
        }

        /* Auto-hide panel styles */
        .dock-panel.auto-hidden {
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .dock-panel.auto-hidden.edge-right {
          transform: translateX(100%);
        }

        .dock-panel.auto-hidden.edge-top {
          transform: translateY(-100%);
        }

        .dock-panel.auto-hidden.edge-bottom {
          transform: translateY(100%);
        }

        /* Magnetic snapping feedback */
        .dock-layout.magnetic-snapping .dock-tab {
          cursor: crosshair;
        }

        /* Quarter split indicators */
        .dock-layout .quarter-split-zone {
          position: absolute;
          border: 2px dashed #8b5cf6;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 4px;
          pointer-events: none;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default EnhancedDockLayout;