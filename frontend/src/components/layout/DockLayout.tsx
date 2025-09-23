"use client";

import type { LayoutData, TabData, PanelData } from "rc-dock";
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

// Panel component mapping
const PANEL_COMPONENTS: Record<string, React.ComponentType<PanelProps>> = {
  DrawingCanvas: DrawingCanvas as any,
  SymbolLibrary: SymbolLibrary as any,
  PropertyPanel: PropertyPanel as any,
  Toolbar: Toolbar as any,
  LayersPanel: LayersPanel as any,
  BoQPanel: BoQPanel as any,
  MinimapPanel: MinimapPanel as any,
  HistoryPanel: HistoryPanel as any,
};

interface DockLayoutWrapperProps {
  config?: DockLayoutConfig;
  onLayoutChange?: (layout: LayoutData) => void;
  theme?: "light" | "dark";
}

const DockLayoutWrapper: React.FC<DockLayoutWrapperProps> = ({
  config,
  onLayoutChange,
  theme = "light",
}) => {
  const dockLayoutRef = useRef<DockLayout>(null);
  const [layout, setLayout] = useState<LayoutData | null>(null);
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
        setLayout(DEFAULT_LAYOUT_PRESETS[0].layout);
      }
    } else {
      setLayout(config?.defaultLayout || DEFAULT_LAYOUT_PRESETS[0].layout);
    }
  }, [config]);

  // Save layout to localStorage on change
  const handleLayoutChange = (newLayout: LayoutData | null) => {
    if (!newLayout) return;

    setLayout(newLayout);
    const savedLayoutKey = config?.saveLayoutKey || "ergoplanner-dock-layout";
    localStorage.setItem(savedLayoutKey, JSON.stringify(newLayout));
    onLayoutChange?.(newLayout);
  };

  // Convert panel content string to component
  const loadTab = (tab: TabData): PanelData => {
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
  const resetLayout = () => {
    const defaultLayout = DEFAULT_LAYOUT_PRESETS[0].layout;
    setLayout(defaultLayout);
    handleLayoutChange(defaultLayout);
  };

  // Load preset layout
  const loadPreset = (presetIndex: number) => {
    const preset = DEFAULT_LAYOUT_PRESETS[presetIndex];
    if (preset) {
      setLayout(preset.layout);
      handleLayoutChange(preset.layout);
    }
  };

  // Export current layout
  const exportLayout = () => {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = "layout.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import layout from file
  const importLayout = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLayout = JSON.parse(e.target?.result as string);
        setLayout(importedLayout);
        handleLayoutChange(importedLayout);
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
        onLayoutChange={handleLayoutChange}
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
