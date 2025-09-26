"use client";

import type { LayoutData as RcLayoutData, TabData as RcTabData } from "rc-dock";
import DockLayout from "rc-dock";
import React, { useState, useEffect, useMemo, useRef } from "react";

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
    // Handle drag start - could dispatch to store or emit event
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

interface DockLayoutWrapperProps {
  config?: DockLayoutConfig;
  onLayoutChange?: (layout: RcLayoutData) => void;
  theme?: "light" | "dark";
}

const DockLayoutWrapper: React.FC<DockLayoutWrapperProps> = ({
  config,
  onLayoutChange,
  theme = "light",
}) => {
  const dockLayoutRef = useRef<DockLayout>(null);
  const [layout, setLayout] = useState<RcLayoutData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { selectedElements } = useEnhancedDrawingStore();

  // Load layout from localStorage
  useEffect(() => {
    setIsClient(true);
    const savedLayoutKey = config?.saveLayoutKey || "ergoplanner-dock-layout";
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

  // Save layout to localStorage on change
  const handleLayoutChange = (newLayout: RcLayoutData | null): void => {
    if (!newLayout) return;

    setLayout(newLayout);
    const savedLayoutKey = config?.saveLayoutKey || "ergoplanner-dock-layout";
    localStorage.setItem(savedLayoutKey, JSON.stringify(newLayout));
    onLayoutChange?.(newLayout);
  };

  // Convert panel content string to component
  const loadTab = (tab: RcTabData): RcTabData => {
    const contentType = typeof tab.content === "string" ? tab.content : "DrawingCanvas";
    const Component = PANEL_COMPONENTS[contentType];

    if (!Component) {
      console.warn(`Panel component not found: ${contentType}`);
      return {
        ...tab,
        content: <div>Panel not found: {contentType}</div>,
      };
    }

    return {
      ...tab,
      content: <Component panelId={tab.id || ""} isActive={true} data={{ selectedElements }} />,
      closable: tab.closable !== false,
      cached: true,
    };
  };

  // Create groups for panel organization
  const groups = useMemo(
    () => ({
      sidebar: {
        floatable: true,
        maximizable: true,
      },
      main: {
        floatable: false,
        maximizable: true,
      },
      top: {
        floatable: false,
        maximizable: false,
      },
    }),
    []
  );

  // Reset layout to default
  const resetLayout = (): void => {
    const defaultLayout = DEFAULT_LAYOUT_PRESETS[0]?.layout;
    if (defaultLayout) {
      setLayout(defaultLayout as RcLayoutData);
      handleLayoutChange(defaultLayout as RcLayoutData);
    }
  };

  // Load preset layout
  const loadPreset = (presetIndex: number): void => {
    const preset = DEFAULT_LAYOUT_PRESETS[presetIndex];
    if (preset?.layout) {
      setLayout(preset.layout as RcLayoutData);
      handleLayoutChange(preset.layout as RcLayoutData);
    }
  };

  // Export current layout
  const exportLayout = (): void => {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = "layout.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import layout from file
  const importLayout = (file: File): void => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === "string") {
          const importedLayout = JSON.parse(result);
          setLayout(importedLayout);
          handleLayoutChange(importedLayout);
        }
      } catch (err) {
        console.error("Failed to import layout:", err);
      }
    };
    reader.readAsText(file);
  };

  if (!isClient || !layout) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className={`dock-layout-wrapper h-screen w-full ${theme}`}>
      {/* Layout Controls */}
      <div className="absolute top-2 right-2 z-50 flex gap-2">
        <button
          onClick={resetLayout}
          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          title="Reset Layout"
        >
          Reset
        </button>
        <select
          onChange={(e) => loadPreset(Number(e.target.value))}
          className="rounded border px-2 py-1"
          title="Load Preset"
        >
          {DEFAULT_LAYOUT_PRESETS.map((preset, index) => (
            <option key={index} value={index}>
              {preset.name}
            </option>
          ))}
        </select>
        <button
          onClick={exportLayout}
          className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
          title="Export Layout"
        >
          Export
        </button>
        <label className="cursor-pointer rounded bg-purple-500 px-3 py-1 text-white hover:bg-purple-600">
          Import
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importLayout(file);
            }}
          />
        </label>
      </div>

      {/* DockLayout Component */}
      <DockLayout
        ref={dockLayoutRef}
        layout={layout}
        loadTab={loadTab}
        groups={groups}
        onLayoutChange={(newLayout) => handleLayoutChange(newLayout as RcLayoutData)}
        style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
      />

      {/* Custom styles for theme */}
      <style jsx global>{`
        .dock-layout-wrapper.dark {
          --dock-tab-bg: #1f2937;
          --dock-tab-active-bg: #374151;
          --dock-tab-border: #4b5563;
          --dock-panel-bg: #111827;
          --dock-divider-color: #374151;
        }

        .dock-layout-wrapper.light {
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
        }

        .dock-tab-active {
          background: var(--dock-tab-active-bg);
        }

        .dock-divider {
          background: var(--dock-divider-color);
        }

        .dock-panel {
          background: var(--dock-panel-bg);
          border-color: var(--dock-tab-border);
        }
      `}</style>
    </div>
  );
};

export default DockLayoutWrapper;
