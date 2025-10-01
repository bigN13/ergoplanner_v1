"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { LayoutData as RcLayoutData } from 'rc-dock';
import {
  DockingDragDropManager,
  LayoutOptimizer,
  PanelStateManager,
  VisualFeedbackManager
} from '@/utils/dockingUtils';
import type { DropZone, LayoutMetrics, PanelState } from '@/utils/dockingUtils';

// Enhanced docking state interface
interface EnhancedDockingState {
  layout: RcLayoutData | null;
  autoHidePanels: Map<string, AutoHidePanel>;
  dragState: DragState;
  layoutMetrics: LayoutMetrics;
  preferences: DockingPreferences;
  isInitialized: boolean;
}

interface AutoHidePanel {
  id: string;
  isHidden: boolean;
  originalSize: number;
  edge: 'left' | 'right' | 'top' | 'bottom';
  hideTimeout?: NodeJS.Timeout;
}

interface DragState {
  isDragging: boolean;
  draggedItem?: any;
  dropZones: DropZone[];
  activeZone?: DropZone;
  magneticTarget?: DropZone;
}

interface DockingPreferences {
  enableAutoHide: boolean;
  enableQuarterSplit: boolean;
  enableMagneticSnapping: boolean;
  magneticThreshold: number;
  autoHideDelay: number;
  enableKeyboardShortcuts: boolean;
  enableVisualFeedback: boolean;
  theme: 'light' | 'dark';
}

// Action types
type DockingAction =
  | { type: 'SET_LAYOUT'; payload: RcLayoutData }
  | { type: 'SET_AUTO_HIDE_PANEL'; payload: { panelId: string; panel: AutoHidePanel } }
  | { type: 'REMOVE_AUTO_HIDE_PANEL'; payload: string }
  | { type: 'SET_DRAG_STATE'; payload: Partial<DragState> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<DockingPreferences> }
  | { type: 'UPDATE_LAYOUT_METRICS'; payload: LayoutMetrics }
  | { type: 'INITIALIZE'; payload: { layout: RcLayoutData; preferences: DockingPreferences } }
  | { type: 'RESET' };

// Initial state
const initialState: EnhancedDockingState = {
  layout: null,
  autoHidePanels: new Map(),
  dragState: {
    isDragging: false,
    dropZones: [],
  },
  layoutMetrics: {
    panelCount: 0,
    maxDepth: 0,
    utilization: 0,
    balance: 0,
    floatingPanels: 0,
  },
  preferences: {
    enableAutoHide: true,
    enableQuarterSplit: true,
    enableMagneticSnapping: true,
    magneticThreshold: 20,
    autoHideDelay: 300,
    enableKeyboardShortcuts: true,
    enableVisualFeedback: true,
    theme: 'light',
  },
  isInitialized: false,
};

// Reducer function
const dockingReducer = (state: EnhancedDockingState, action: DockingAction): EnhancedDockingState => {
  switch (action.type) {
    case 'SET_LAYOUT':
      const metrics = LayoutOptimizer.calculateLayoutMetrics(action.payload);
      return {
        ...state,
        layout: action.payload,
        layoutMetrics: metrics,
      };

    case 'SET_AUTO_HIDE_PANEL':
      const newPanels = new Map(state.autoHidePanels);
      newPanels.set(action.payload.panelId, action.payload.panel);
      return {
        ...state,
        autoHidePanels: newPanels,
      };

    case 'REMOVE_AUTO_HIDE_PANEL':
      const filteredPanels = new Map(state.autoHidePanels);
      filteredPanels.delete(action.payload);
      return {
        ...state,
        autoHidePanels: filteredPanels,
      };

    case 'SET_DRAG_STATE':
      return {
        ...state,
        dragState: {
          ...state.dragState,
          ...action.payload,
        },
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case 'UPDATE_LAYOUT_METRICS':
      return {
        ...state,
        layoutMetrics: action.payload,
      };

    case 'INITIALIZE':
      return {
        ...state,
        layout: action.payload.layout,
        preferences: action.payload.preferences,
        layoutMetrics: LayoutOptimizer.calculateLayoutMetrics(action.payload.layout),
        isInitialized: true,
      };

    case 'RESET':
      return {
        ...initialState,
        preferences: state.preferences, // Keep preferences
      };

    default:
      return state;
  }
};

// Context interface
interface EnhancedDockingContextType {
  state: EnhancedDockingState;

  // Layout management
  setLayout: (layout: RcLayoutData) => void;
  optimizeLayout: () => void;
  resetLayout: () => void;

  // Auto-hide management
  toggleAutoHide: (panelId: string, edge: 'left' | 'right' | 'top' | 'bottom', originalSize?: number) => void;
  showAutoHiddenPanel: (panelId: string) => void;
  hideAutoHiddenPanel: (panelId: string) => void;

  // Drag and drop
  startDrag: (item: any) => void;
  updateDragState: (state: Partial<DragState>) => void;
  endDrag: () => void;

  // Panel management
  focusPanel: (panelId: string) => void;
  maximizePanel: (panelId: string) => void;
  minimizePanel: (panelId: string) => void;

  // Preferences
  updatePreferences: (preferences: Partial<DockingPreferences>) => void;

  // Utilities
  getLayoutMetrics: () => LayoutMetrics;
  exportLayout: () => string;
  importLayout: (layoutJson: string) => void;
}

// Create context
const EnhancedDockingContext = createContext<EnhancedDockingContextType | null>(null);

// Provider component
interface EnhancedDockingProviderProps {
  children: React.ReactNode;
  initialLayout?: RcLayoutData;
  initialPreferences?: Partial<DockingPreferences>;
  storageKey?: string;
}

export const EnhancedDockingProvider: React.FC<EnhancedDockingProviderProps> = ({
  children,
  initialLayout,
  initialPreferences = {},
  storageKey = 'enhanced-docking-state',
}) => {
  const [state, dispatch] = useReducer(dockingReducer, initialState);
  const dragManagerRef = useRef<DockingDragDropManager>();
  const persistenceTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize drag manager
  useEffect(() => {
    dragManagerRef.current = DockingDragDropManager.getInstance();
  }, []);

  // Load persisted state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { layout, preferences } = JSON.parse(stored);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            layout: layout || initialLayout || state.layout,
            preferences: { ...state.preferences, ...initialPreferences, ...preferences },
          },
        });
      } else if (initialLayout) {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            layout: initialLayout,
            preferences: { ...state.preferences, ...initialPreferences },
          },
        });
      }
    } catch (error) {
      console.error('Failed to load persisted docking state:', error);
      if (initialLayout) {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            layout: initialLayout,
            preferences: { ...state.preferences, ...initialPreferences },
          },
        });
      }
    }
  }, [initialLayout, initialPreferences, storageKey]);

  // Persist state changes with debouncing
  useEffect(() => {
    if (!state.isInitialized) return;

    if (persistenceTimeoutRef.current) {
      clearTimeout(persistenceTimeoutRef.current);
    }

    persistenceTimeoutRef.current = setTimeout(() => {
      try {
        const persistData = {
          layout: state.layout,
          preferences: state.preferences,
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(persistData));
      } catch (error) {
        console.error('Failed to persist docking state:', error);
      }
    }, 1000); // Debounce for 1 second

    return () => {
      if (persistenceTimeoutRef.current) {
        clearTimeout(persistenceTimeoutRef.current);
      }
    };
  }, [state.layout, state.preferences, state.isInitialized, storageKey]);

  // Layout management functions
  const setLayout = useCallback((layout: RcLayoutData) => {
    dispatch({ type: 'SET_LAYOUT', payload: layout });
  }, []);

  const optimizeLayout = useCallback(() => {
    if (state.layout) {
      const optimized = LayoutOptimizer.optimizeLayout(state.layout);
      dispatch({ type: 'SET_LAYOUT', payload: optimized });
    }
  }, [state.layout]);

  const resetLayout = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Auto-hide management
  const toggleAutoHide = useCallback((
    panelId: string,
    edge: 'left' | 'right' | 'top' | 'bottom',
    originalSize: number = 250
  ) => {
    const existing = state.autoHidePanels.get(panelId);

    if (existing) {
      // Clear timeout if exists
      if (existing.hideTimeout) {
        clearTimeout(existing.hideTimeout);
      }

      if (existing.isHidden) {
        // Show panel
        dispatch({
          type: 'SET_AUTO_HIDE_PANEL',
          payload: {
            panelId,
            panel: { ...existing, isHidden: false, hideTimeout: undefined },
          },
        });
      } else {
        // Hide panel
        dispatch({
          type: 'SET_AUTO_HIDE_PANEL',
          payload: {
            panelId,
            panel: { ...existing, isHidden: true, hideTimeout: undefined },
          },
        });
      }
    } else {
      // Create new auto-hide panel
      dispatch({
        type: 'SET_AUTO_HIDE_PANEL',
        payload: {
          panelId,
          panel: {
            id: panelId,
            isHidden: true,
            originalSize,
            edge,
          },
        },
      });
    }

    // Save panel state
    PanelStateManager.savePanelState(panelId, {
      isAutoHidden: !existing?.isHidden,
      originalSize,
    });
  }, [state.autoHidePanels]);

  const showAutoHiddenPanel = useCallback((panelId: string) => {
    const panel = state.autoHidePanels.get(panelId);
    if (panel && panel.isHidden) {
      dispatch({
        type: 'SET_AUTO_HIDE_PANEL',
        payload: {
          panelId,
          panel: { ...panel, isHidden: false },
        },
      });
    }
  }, [state.autoHidePanels]);

  const hideAutoHiddenPanel = useCallback((panelId: string) => {
    const panel = state.autoHidePanels.get(panelId);
    if (panel && !panel.isHidden) {
      const timeout = setTimeout(() => {
        dispatch({
          type: 'SET_AUTO_HIDE_PANEL',
          payload: {
            panelId,
            panel: { ...panel, isHidden: true, hideTimeout: undefined },
          },
        });
      }, state.preferences.autoHideDelay);

      dispatch({
        type: 'SET_AUTO_HIDE_PANEL',
        payload: {
          panelId,
          panel: { ...panel, hideTimeout: timeout },
        },
      });
    }
  }, [state.autoHidePanels, state.preferences.autoHideDelay]);

  // Drag and drop functions
  const startDrag = useCallback((item: any) => {
    dispatch({
      type: 'SET_DRAG_STATE',
      payload: { isDragging: true, draggedItem: item },
    });
  }, []);

  const updateDragState = useCallback((newState: Partial<DragState>) => {
    dispatch({ type: 'SET_DRAG_STATE', payload: newState });

    // Show visual feedback
    if (state.preferences.enableVisualFeedback && newState.activeZone) {
      VisualFeedbackManager.showDropIndicator(newState.activeZone);
    }
  }, [state.preferences.enableVisualFeedback]);

  const endDrag = useCallback(() => {
    dispatch({
      type: 'SET_DRAG_STATE',
      payload: { isDragging: false, draggedItem: undefined, dropZones: [], activeZone: undefined },
    });

    // Clear visual feedback
    VisualFeedbackManager.clearAllDropIndicators();
  }, []);

  // Panel management functions
  const focusPanel = useCallback((panelId: string) => {
    const panel = document.querySelector(`[data-tab-id="${panelId}"]`) as HTMLElement;
    if (panel) {
      panel.click();
      panel.focus();
    }

    // Show auto-hidden panel if needed
    showAutoHiddenPanel(panelId);
  }, [showAutoHiddenPanel]);

  const maximizePanel = useCallback((panelId: string) => {
    PanelStateManager.savePanelState(panelId, { isMaximized: true });
    // Additional maximize logic would go here
  }, []);

  const minimizePanel = useCallback((panelId: string) => {
    PanelStateManager.savePanelState(panelId, { isMinimized: true });
    // Additional minimize logic would go here
  }, []);

  // Preferences
  const updatePreferences = useCallback((preferences: Partial<DockingPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  // Utility functions
  const getLayoutMetrics = useCallback((): LayoutMetrics => {
    return state.layoutMetrics;
  }, [state.layoutMetrics]);

  const exportLayout = useCallback((): string => {
    return JSON.stringify({
      layout: state.layout,
      preferences: state.preferences,
      panelStates: PanelStateManager.getAllPanelStates(),
      timestamp: Date.now(),
    }, null, 2);
  }, [state.layout, state.preferences]);

  const importLayout = useCallback((layoutJson: string) => {
    try {
      const imported = JSON.parse(layoutJson);

      if (imported.layout) {
        dispatch({ type: 'SET_LAYOUT', payload: imported.layout });
      }

      if (imported.preferences) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: imported.preferences });
      }

      if (imported.panelStates) {
        PanelStateManager.savePanelStates(imported.panelStates);
      }
    } catch (error) {
      console.error('Failed to import layout:', error);
      throw new Error('Invalid layout format');
    }
  }, []);

  // Context value
  const contextValue: EnhancedDockingContextType = {
    state,
    setLayout,
    optimizeLayout,
    resetLayout,
    toggleAutoHide,
    showAutoHiddenPanel,
    hideAutoHiddenPanel,
    startDrag,
    updateDragState,
    endDrag,
    focusPanel,
    maximizePanel,
    minimizePanel,
    updatePreferences,
    getLayoutMetrics,
    exportLayout,
    importLayout,
  };

  return (
    <EnhancedDockingContext.Provider value={contextValue}>
      {children}
    </EnhancedDockingContext.Provider>
  );
};

// Hook to use the enhanced docking context
export const useEnhancedDocking = (): EnhancedDockingContextType => {
  const context = useContext(EnhancedDockingContext);
  if (!context) {
    throw new Error('useEnhancedDocking must be used within an EnhancedDockingProvider');
  }
  return context;
};

// Export types
export type {
  EnhancedDockingState,
  AutoHidePanel,
  DragState,
  DockingPreferences,
  EnhancedDockingContextType,
};