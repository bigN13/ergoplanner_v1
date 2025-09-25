// Dock Layout Types
import type { TabData as RcDockTabData } from "rc-dock";
import type React from "react";

// Extended TabData to allow string content (panel component keys)
export interface TabData extends Omit<RcDockTabData, 'content'> {
  content?: string | React.ReactElement | ((tab: TabData) => React.ReactElement);
}

// Custom tab type for layout presets that uses string identifiers
export interface DockTab {
  id: string;
  title: string;
  content: string; // Component identifier string
  group?: string;
  closable?: boolean;
}

// Custom layout types that use string identifiers
export interface DockBox {
  mode?: 'horizontal' | 'vertical' | 'float';
  size?: number;
  children?: (DockBox | DockPanel)[];
  tabs?: DockTab[];
}

export interface DockPanel {
  tabs: DockTab[];
  size?: number;
}

export interface LayoutData {
  dockbox: DockBox;
  floatbox?: DockBox;
}

export interface DockPanelConfig {
  id: string;
  title: string;
  content: React.ComponentType<Record<string, unknown>>;
  closable?: boolean;
  minWidth?: number;
  minHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  group?: string;
  cached?: boolean;
}

export interface DockLayoutConfig {
  panels: DockPanelConfig[];
  defaultLayout?: LayoutData;
  saveLayoutKey?: string;
  theme?: "light" | "dark";
}

export interface PanelProps {
  panelId: string;
  isActive: boolean;
  onClose?: () => void;
  data?: Record<string, unknown>;
}

export interface LayoutPreset {
  name: string;
  description: string;
  layout: LayoutData;
  icon?: string;
}

export const DEFAULT_LAYOUT_PRESETS: LayoutPreset[] = [
  {
    name: "Default",
    description: "Standard P&ID editing layout",
    layout: {
      dockbox: {
        mode: "horizontal",
        children: [
          {
            mode: "vertical",
            size: 250,
            children: [
              {
                tabs: [
                  {
                    id: "symbol-library",
                    title: "Symbol Library",
                    content: "SymbolLibrary",
                    group: "sidebar",
                  },
                ],
              },
              {
                tabs: [
                  {
                    id: "layers",
                    title: "Layers",
                    content: "LayersPanel",
                    group: "sidebar",
                  },
                ],
                size: 200,
              },
            ],
          },
          {
            mode: "vertical",
            children: [
              {
                tabs: [
                  {
                    id: "toolbar",
                    title: "Toolbar",
                    content: "Toolbar",
                    group: "top",
                    closable: false,
                  },
                ],
                size: 60,
              },
              {
                tabs: [
                  {
                    id: "canvas",
                    title: "Drawing Canvas",
                    content: "DrawingCanvas",
                    group: "main",
                    closable: false,
                  },
                ],
              },
            ],
          },
          {
            mode: "vertical",
            size: 350,
            children: [
              {
                tabs: [
                  {
                    id: "properties",
                    title: "Properties",
                    content: "PropertyPanel",
                    group: "sidebar",
                  },
                  {
                    id: "boq",
                    title: "BoQ",
                    content: "BoQPanel",
                    group: "sidebar",
                  },
                ],
              },
              {
                tabs: [
                  {
                    id: "minimap",
                    title: "Minimap",
                    content: "MinimapPanel",
                    group: "sidebar",
                  },
                ],
                size: 200,
              },
            ],
          },
        ],
      },
    },
  },
  {
    name: "Compact",
    description: "Minimalist layout with more canvas space",
    layout: {
      dockbox: {
        mode: "horizontal",
        children: [
          {
            tabs: [
              {
                id: "symbol-library",
                title: "Symbols",
                content: "SymbolLibrary",
                group: "sidebar",
              },
              {
                id: "layers",
                title: "Layers",
                content: "LayersPanel",
                group: "sidebar",
              },
            ],
            size: 250,
          },
          {
            mode: "vertical",
            children: [
              {
                tabs: [
                  {
                    id: "toolbar",
                    title: "Tools",
                    content: "Toolbar",
                    group: "top",
                    closable: false,
                  },
                ],
                size: 50,
              },
              {
                tabs: [
                  {
                    id: "canvas",
                    title: "Canvas",
                    content: "DrawingCanvas",
                    group: "main",
                    closable: false,
                  },
                ],
              },
            ],
          },
          {
            tabs: [
              {
                id: "properties",
                title: "Props",
                content: "PropertyPanel",
                group: "sidebar",
              },
              {
                id: "boq",
                title: "BoQ",
                content: "BoQPanel",
                group: "sidebar",
              },
            ],
            size: 300,
          },
        ],
      },
    },
  },
];
