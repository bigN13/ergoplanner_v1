import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutData as RcLayoutData } from 'rc-dock';

interface DockingOptions {
  enableAutoHide?: boolean;
  enableQuarterSplit?: boolean;
  enableMagneticSnapping?: boolean;
  magneticThreshold?: number;
  autoHideDelay?: number;
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
  draggedItem?: any;
  dropZones: DropZone[];
  activeZone?: DropZone;
  magneticTarget?: DropZone;
}

interface AutoHidePanel {
  id: string;
  isHidden: boolean;
  originalSize: number;
  edge: 'left' | 'right' | 'top' | 'bottom';
  hideTimeout?: NodeJS.Timeout;
}

export const useEnhancedDocking = (options: DockingOptions = {}) => {
  const {
    enableAutoHide = true,
    enableQuarterSplit = true,
    enableMagneticSnapping = true,
    magneticThreshold = 20,
    autoHideDelay = 300,
  } = options;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dropZones: [],
  });

  const [autoHidePanels, setAutoHidePanels] = useState<Map<string, AutoHidePanel>>(new Map());
  const containerRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Detect quarter split zones
  const detectQuarterSplitZones = useCallback((
    clientX: number,
    clientY: number,
    targetElement: Element
  ): DropZone[] => {
    if (!enableQuarterSplit) return [];

    const rect = targetElement.getBoundingClientRect();
    const cornerSize = 40;
    const zones: DropZone[] = [];

    // Calculate relative position
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // Top-left quarter
    if (relativeX < cornerSize && relativeY < cornerSize) {
      zones.push({
        id: 'quarter-tl',
        rect: new DOMRect(rect.left, rect.top, cornerSize, cornerSize),
        type: 'quarter',
        position: 'tl',
      });
    }

    // Top-right quarter
    if (rect.width - relativeX < cornerSize && relativeY < cornerSize) {
      zones.push({
        id: 'quarter-tr',
        rect: new DOMRect(rect.right - cornerSize, rect.top, cornerSize, cornerSize),
        type: 'quarter',
        position: 'tr',
      });
    }

    // Bottom-left quarter
    if (relativeX < cornerSize && rect.height - relativeY < cornerSize) {
      zones.push({
        id: 'quarter-bl',
        rect: new DOMRect(rect.left, rect.bottom - cornerSize, cornerSize, cornerSize),
        type: 'quarter',
        position: 'bl',
      });
    }

    // Bottom-right quarter
    if (rect.width - relativeX < cornerSize && rect.height - relativeY < cornerSize) {
      zones.push({
        id: 'quarter-br',
        rect: new DOMRect(rect.right - cornerSize, rect.bottom - cornerSize, cornerSize, cornerSize),
        type: 'quarter',
        position: 'br',
      });
    }

    return zones;
  }, [enableQuarterSplit]);

  // Detect magnetic edge zones
  const detectMagneticZones = useCallback((
    clientX: number,
    clientY: number,
    containerElement: Element
  ): DropZone[] => {
    if (!enableMagneticSnapping) return [];

    const rect = containerElement.getBoundingClientRect();
    const zones: DropZone[] = [];

    // Left edge
    if (clientX - rect.left < magneticThreshold) {
      const strength = magneticThreshold - (clientX - rect.left);
      zones.push({
        id: 'magnetic-left',
        rect: new DOMRect(rect.left, rect.top, magneticThreshold, rect.height),
        type: 'edge',
        position: 'left',
        magneticStrength: strength,
      });
    }

    // Right edge
    if (rect.right - clientX < magneticThreshold) {
      const strength = magneticThreshold - (rect.right - clientX);
      zones.push({
        id: 'magnetic-right',
        rect: new DOMRect(rect.right - magneticThreshold, rect.top, magneticThreshold, rect.height),
        type: 'edge',
        position: 'right',
        magneticStrength: strength,
      });
    }

    // Top edge
    if (clientY - rect.top < magneticThreshold) {
      const strength = magneticThreshold - (clientY - rect.top);
      zones.push({
        id: 'magnetic-top',
        rect: new DOMRect(rect.left, rect.top, rect.width, magneticThreshold),
        type: 'edge',
        position: 'top',
        magneticStrength: strength,
      });
    }

    // Bottom edge
    if (rect.bottom - clientY < magneticThreshold) {
      const strength = magneticThreshold - (rect.bottom - clientY);
      zones.push({
        id: 'magnetic-bottom',
        rect: new DOMRect(rect.left, rect.bottom - magneticThreshold, rect.width, magneticThreshold),
        type: 'edge',
        position: 'bottom',
        magneticStrength: strength,
      });
    }

    return zones;
  }, [enableMagneticSnapping, magneticThreshold]);

  // Auto-hide panel management
  const toggleAutoHide = useCallback((
    panelId: string,
    edge: 'left' | 'right' | 'top' | 'bottom',
    originalSize: number = 250
  ) => {
    if (!enableAutoHide) return;

    setAutoHidePanels(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(panelId);

      if (existing) {
        // Clear any existing timeout
        if (existing.hideTimeout) {
          clearTimeout(existing.hideTimeout);
        }

        // Toggle visibility
        newMap.set(panelId, {
          ...existing,
          isHidden: !existing.isHidden,
          hideTimeout: undefined,
        });
      } else {
        // Create new auto-hide panel
        newMap.set(panelId, {
          id: panelId,
          isHidden: true,
          originalSize,
          edge,
        });
      }

      return newMap;
    });
  }, [enableAutoHide]);

  // Auto-hide with delay
  const scheduleAutoHide = useCallback((
    panelId: string,
    edge: 'left' | 'right' | 'top' | 'bottom',
    originalSize: number = 250
  ) => {
    if (!enableAutoHide) return;

    const timeout = setTimeout(() => {
      toggleAutoHide(panelId, edge, originalSize);
    }, autoHideDelay);

    setAutoHidePanels(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(panelId);

      if (existing?.hideTimeout) {
        clearTimeout(existing.hideTimeout);
      }

      newMap.set(panelId, {
        id: panelId,
        isHidden: false,
        originalSize,
        edge,
        hideTimeout: timeout,
      });

      return newMap;
    });
  }, [enableAutoHide, autoHideDelay, toggleAutoHide]);

  // Cancel auto-hide
  const cancelAutoHide = useCallback((panelId: string) => {
    setAutoHidePanels(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(panelId);

      if (existing?.hideTimeout) {
        clearTimeout(existing.hideTimeout);
        newMap.set(panelId, {
          ...existing,
          hideTimeout: undefined,
        });
      }

      return newMap;
    });
  }, []);

  // Show auto-hidden panel
  const showAutoHiddenPanel = useCallback((panelId: string) => {
    setAutoHidePanels(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(panelId);

      if (existing && existing.isHidden) {
        newMap.set(panelId, {
          ...existing,
          isHidden: false,
        });
      }

      return newMap;
    });
  }, []);

  // Handle drag events
  const handleDragStart = useCallback((draggedItem: any) => {
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem,
    }));
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging || !containerRef.current) return;

    const quarterZones = detectQuarterSplitZones(clientX, clientY, containerRef.current);
    const magneticZones = detectMagneticZones(clientX, clientY, containerRef.current);

    const allZones = [...quarterZones, ...magneticZones];

    // Find the zone with the strongest magnetic pull
    const strongestZone = allZones.reduce((strongest, zone) => {
      const strength = zone.magneticStrength || 0;
      return !strongest || strength > (strongest.magneticStrength || 0) ? zone : strongest;
    }, undefined as DropZone | undefined);

    setDragState(prev => ({
      ...prev,
      dropZones: allZones,
      activeZone: strongestZone,
      magneticTarget: magneticZones.find(zone => zone.id === strongestZone?.id),
    }));
  }, [dragState.isDragging, detectQuarterSplitZones, detectMagneticZones]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dropZones: [],
    });
  }, []);

  // Layout utilities
  const optimizeLayout = useCallback((layout: RcLayoutData): RcLayoutData => {
    // Implement layout optimization logic
    // This could include auto-arranging panels, balancing sizes, etc.
    return layout;
  }, []);

  const getLayoutMetrics = useCallback((layout: RcLayoutData) => {
    // Calculate layout efficiency metrics
    return {
      panelCount: 0, // Calculate actual panel count
      utilization: 0, // Calculate space utilization
      balance: 0, // Calculate layout balance
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all auto-hide timeouts
      autoHidePanels.forEach(panel => {
        if (panel.hideTimeout) {
          clearTimeout(panel.hideTimeout);
        }
      });

      // Disconnect resize observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [autoHidePanels]);

  // Setup resize observer for responsive layouts
  useEffect(() => {
    if (!containerRef.current) return;

    resizeObserverRef.current = new ResizeObserver(entries => {
      // Handle container resize
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        // Trigger layout adjustments based on new size
        console.log('Container resized:', { width, height });
      });
    });

    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  return {
    // State
    dragState,
    autoHidePanels,
    containerRef,

    // Auto-hide functions
    toggleAutoHide,
    scheduleAutoHide,
    cancelAutoHide,
    showAutoHiddenPanel,

    // Drag functions
    handleDragStart,
    handleDragMove,
    handleDragEnd,

    // Zone detection
    detectQuarterSplitZones,
    detectMagneticZones,

    // Layout utilities
    optimizeLayout,
    getLayoutMetrics,

    // Options
    options: {
      enableAutoHide,
      enableQuarterSplit,
      enableMagneticSnapping,
      magneticThreshold,
      autoHideDelay,
    },
  };
};