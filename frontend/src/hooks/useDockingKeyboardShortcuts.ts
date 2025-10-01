import { useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { LayoutData as RcLayoutData } from 'rc-dock';

interface DockingKeyboardShortcutsOptions {
  layout?: RcLayoutData | null;
  onLayoutChange?: (layout: RcLayoutData) => void;
  onToggleAutoHide?: (panelId: string, edge: 'left' | 'right' | 'top' | 'bottom') => void;
  onResetLayout?: () => void;
  onFocusPanel?: (panelId: string) => void;
  onMaximizePanel?: (panelId: string) => void;
  onMinimizePanel?: (panelId: string) => void;
  enabled?: boolean;
}

export const useDockingKeyboardShortcuts = (options: DockingKeyboardShortcutsOptions = {}) => {
  const {
    layout,
    onLayoutChange,
    onToggleAutoHide,
    onResetLayout,
    onFocusPanel,
    onMaximizePanel,
    onMinimizePanel,
    enabled = true,
  } = options;

  // Panel navigation shortcuts
  useHotkeys('ctrl+1', () => {
    if (enabled && onFocusPanel) {
      onFocusPanel('symbol-library');
    }
  }, { description: 'Focus Symbol Library' });

  useHotkeys('ctrl+2', () => {
    if (enabled && onFocusPanel) {
      onFocusPanel('layers');
    }
  }, { description: 'Focus Layers Panel' });

  useHotkeys('ctrl+3', () => {
    if (enabled && onFocusPanel) {
      onFocusPanel('properties');
    }
  }, { description: 'Focus Properties Panel' });

  useHotkeys('ctrl+4', () => {
    if (enabled && onFocusPanel) {
      onFocusPanel('boq');
    }
  }, { description: 'Focus BoQ Panel' });

  useHotkeys('ctrl+5', () => {
    if (enabled && onFocusPanel) {
      onFocusPanel('minimap');
    }
  }, { description: 'Focus Minimap Panel' });

  // Auto-hide shortcuts
  useHotkeys('ctrl+shift+left', () => {
    if (enabled && onToggleAutoHide) {
      onToggleAutoHide('symbol-library', 'left');
    }
  }, { description: 'Toggle left panel auto-hide' });

  useHotkeys('ctrl+shift+right', () => {
    if (enabled && onToggleAutoHide) {
      onToggleAutoHide('properties', 'right');
    }
  }, { description: 'Toggle right panel auto-hide' });

  useHotkeys('ctrl+shift+up', () => {
    if (enabled && onToggleAutoHide) {
      onToggleAutoHide('toolbar', 'top');
    }
  }, { description: 'Toggle top panel auto-hide' });

  useHotkeys('ctrl+shift+down', () => {
    if (enabled && onToggleAutoHide) {
      onToggleAutoHide('minimap', 'bottom');
    }
  }, { description: 'Toggle bottom panel auto-hide' });

  // Panel management shortcuts
  useHotkeys('ctrl+shift+r', () => {
    if (enabled && onResetLayout) {
      onResetLayout();
    }
  }, { description: 'Reset layout to default' });

  useHotkeys('f11', (e) => {
    e.preventDefault();
    if (enabled && onMaximizePanel) {
      // Focus the currently active panel and maximize it
      const activePanel = document.querySelector('.dock-tab-active')?.getAttribute('data-tab-id');
      if (activePanel) {
        onMaximizePanel(activePanel);
      }
    }
  }, { description: 'Maximize active panel' });

  useHotkeys('escape', () => {
    if (enabled && onMinimizePanel) {
      // Minimize any maximized panel
      const maximizedPanel = document.querySelector('.dock-panel-maximized')?.getAttribute('data-panel-id');
      if (maximizedPanel) {
        onMinimizePanel(maximizedPanel);
      }
    }
  }, { description: 'Minimize maximized panel' });

  // Quick layout presets
  useHotkeys('ctrl+alt+1', () => {
    if (enabled && onLayoutChange && layout) {
      // Switch to default layout preset
      const defaultLayout: RcLayoutData = {
        dockbox: {
          mode: 'horizontal',
          children: [
            {
              mode: 'vertical',
              size: 250,
              children: [
                {
                  tabs: [{
                    id: 'symbol-library',
                    title: 'Symbol Library',
                    content: 'SymbolLibrary',
                    group: 'sidebar',
                  }],
                },
                {
                  tabs: [{
                    id: 'layers',
                    title: 'Layers',
                    content: 'LayersPanel',
                    group: 'sidebar',
                  }],
                  size: 200,
                },
              ],
            },
            {
              mode: 'vertical',
              children: [
                {
                  tabs: [{
                    id: 'toolbar',
                    title: 'Toolbar',
                    content: 'Toolbar',
                    group: 'top',
                    closable: false,
                  }],
                  size: 60,
                },
                {
                  tabs: [{
                    id: 'canvas',
                    title: 'Drawing Canvas',
                    content: 'DrawingCanvas',
                    group: 'main',
                    closable: false,
                  }],
                },
              ],
            },
            {
              mode: 'vertical',
              size: 350,
              children: [
                {
                  tabs: [
                    {
                      id: 'properties',
                      title: 'Properties',
                      content: 'PropertyPanel',
                      group: 'sidebar',
                    },
                    {
                      id: 'boq',
                      title: 'BoQ',
                      content: 'BoQPanel',
                      group: 'sidebar',
                    },
                  ],
                },
                {
                  tabs: [{
                    id: 'minimap',
                    title: 'Minimap',
                    content: 'MinimapPanel',
                    group: 'sidebar',
                  }],
                  size: 200,
                },
              ],
            },
          ],
        },
      } as any;
      onLayoutChange(defaultLayout);
    }
  }, { description: 'Switch to default layout' });

  useHotkeys('ctrl+alt+2', () => {
    if (enabled && onLayoutChange && layout) {
      // Switch to compact layout preset
      const compactLayout: RcLayoutData = {
        dockbox: {
          mode: 'horizontal',
          children: [
            {
              tabs: [
                {
                  id: 'symbol-library',
                  title: 'Symbols',
                  content: 'SymbolLibrary',
                  group: 'sidebar',
                },
                {
                  id: 'layers',
                  title: 'Layers',
                  content: 'LayersPanel',
                  group: 'sidebar',
                },
              ],
              size: 250,
            },
            {
              mode: 'vertical',
              children: [
                {
                  tabs: [{
                    id: 'toolbar',
                    title: 'Tools',
                    content: 'Toolbar',
                    group: 'top',
                    closable: false,
                  }],
                  size: 50,
                },
                {
                  tabs: [{
                    id: 'canvas',
                    title: 'Canvas',
                    content: 'DrawingCanvas',
                    group: 'main',
                    closable: false,
                  }],
                },
              ],
            },
            {
              tabs: [
                {
                  id: 'properties',
                  title: 'Props',
                  content: 'PropertyPanel',
                  group: 'sidebar',
                },
                {
                  id: 'boq',
                  title: 'BoQ',
                  content: 'BoQPanel',
                  group: 'sidebar',
                },
              ],
              size: 300,
            },
          ],
        },
      } as any;
      onLayoutChange(compactLayout);
    }
  }, { description: 'Switch to compact layout' });

  // Window management shortcuts
  useHotkeys('ctrl+shift+n', () => {
    if (enabled) {
      // Create new floating panel
      console.log('Create new floating panel');
    }
  }, { description: 'Create new floating panel' });

  useHotkeys('ctrl+w', (e) => {
    e.preventDefault();
    if (enabled) {
      // Close active panel (if closable)
      const activeTab = document.querySelector('.dock-tab-active');
      const closeButton = activeTab?.querySelector('.dock-tab-close-btn') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }, { description: 'Close active panel' });

  // Tab navigation
  useHotkeys('ctrl+tab', (e) => {
    e.preventDefault();
    if (enabled) {
      // Navigate to next tab in active panel
      const activePanel = document.querySelector('.dock-panel:focus-within');
      const tabs = activePanel?.querySelectorAll('.dock-tab');
      if (tabs && tabs.length > 1) {
        const activeTab = activePanel.querySelector('.dock-tab-active');
        const currentIndex = Array.from(tabs).indexOf(activeTab as Element);
        const nextIndex = (currentIndex + 1) % tabs.length;
        (tabs[nextIndex] as HTMLElement).click();
      }
    }
  }, { description: 'Next tab in active panel' });

  useHotkeys('ctrl+shift+tab', (e) => {
    e.preventDefault();
    if (enabled) {
      // Navigate to previous tab in active panel
      const activePanel = document.querySelector('.dock-panel:focus-within');
      const tabs = activePanel?.querySelectorAll('.dock-tab');
      if (tabs && tabs.length > 1) {
        const activeTab = activePanel.querySelector('.dock-tab-active');
        const currentIndex = Array.from(tabs).indexOf(activeTab as Element);
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        (tabs[prevIndex] as HTMLElement).click();
      }
    }
  }, { description: 'Previous tab in active panel' });

  // Panel splitting shortcuts
  useHotkeys('ctrl+shift+h', () => {
    if (enabled) {
      // Split current panel horizontally
      console.log('Split panel horizontally');
    }
  }, { description: 'Split panel horizontally' });

  useHotkeys('ctrl+shift+v', () => {
    if (enabled) {
      // Split current panel vertically
      console.log('Split panel vertically');
    }
  }, { description: 'Split panel vertically' });

  // Panel size adjustments
  useHotkeys('ctrl+plus', (e) => {
    e.preventDefault();
    if (enabled) {
      // Increase active panel size
      adjustPanelSize(10);
    }
  }, { description: 'Increase panel size' });

  useHotkeys('ctrl+minus', (e) => {
    e.preventDefault();
    if (enabled) {
      // Decrease active panel size
      adjustPanelSize(-10);
    }
  }, { description: 'Decrease panel size' });

  // Helper functions
  const adjustPanelSize = useCallback((delta: number) => {
    const activePanel = document.querySelector('.dock-panel:focus-within');
    if (activePanel && layout && onLayoutChange) {
      // Find and adjust the panel size in the layout
      // This would require traversing the layout structure
      console.log('Adjusting panel size by', delta);
    }
  }, [layout, onLayoutChange]);

  const focusPanel = useCallback((panelId: string) => {
    const panel = document.querySelector(`[data-tab-id="${panelId}"]`) as HTMLElement;
    if (panel) {
      panel.click();
      panel.focus();
    }
  }, []);

  // Return help information for displaying shortcuts
  const getShortcutHelp = useCallback(() => {
    return [
      { category: 'Panel Navigation', shortcuts: [
        { key: 'Ctrl+1', description: 'Focus Symbol Library' },
        { key: 'Ctrl+2', description: 'Focus Layers Panel' },
        { key: 'Ctrl+3', description: 'Focus Properties Panel' },
        { key: 'Ctrl+4', description: 'Focus BoQ Panel' },
        { key: 'Ctrl+5', description: 'Focus Minimap Panel' },
      ]},
      { category: 'Auto-Hide', shortcuts: [
        { key: 'Ctrl+Shift+←', description: 'Toggle left panel auto-hide' },
        { key: 'Ctrl+Shift+→', description: 'Toggle right panel auto-hide' },
        { key: 'Ctrl+Shift+↑', description: 'Toggle top panel auto-hide' },
        { key: 'Ctrl+Shift+↓', description: 'Toggle bottom panel auto-hide' },
      ]},
      { category: 'Layout Management', shortcuts: [
        { key: 'Ctrl+Shift+R', description: 'Reset layout to default' },
        { key: 'Ctrl+Alt+1', description: 'Switch to default layout' },
        { key: 'Ctrl+Alt+2', description: 'Switch to compact layout' },
        { key: 'F11', description: 'Maximize active panel' },
        { key: 'Escape', description: 'Minimize maximized panel' },
      ]},
      { category: 'Tab Management', shortcuts: [
        { key: 'Ctrl+Tab', description: 'Next tab in active panel' },
        { key: 'Ctrl+Shift+Tab', description: 'Previous tab in active panel' },
        { key: 'Ctrl+W', description: 'Close active panel' },
        { key: 'Ctrl+Shift+N', description: 'Create new floating panel' },
      ]},
      { category: 'Panel Splitting', shortcuts: [
        { key: 'Ctrl+Shift+H', description: 'Split panel horizontally' },
        { key: 'Ctrl+Shift+V', description: 'Split panel vertically' },
        { key: 'Ctrl++', description: 'Increase panel size' },
        { key: 'Ctrl+-', description: 'Decrease panel size' },
      ]},
    ];
  }, []);

  return {
    focusPanel,
    adjustPanelSize,
    getShortcutHelp,
    enabled,
  };
};