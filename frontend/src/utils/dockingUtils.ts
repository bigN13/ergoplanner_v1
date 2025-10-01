import type { LayoutData as RcLayoutData, TabData as RcTabData, BoxData, PanelData } from 'rc-dock';

// Performance optimized drag and drop utilities
export class DockingDragDropManager {
  private static instance: DockingDragDropManager;
  private dragThreshold = 5;
  private lastDragPosition = { x: 0, y: 0 };
  private dragStartTime = 0;
  private isDragging = false;

  static getInstance(): DockingDragDropManager {
    if (!DockingDragDropManager.instance) {
      DockingDragDropManager.instance = new DockingDragDropManager();
    }
    return DockingDragDropManager.instance;
  }

  // Optimized drag detection with throttling
  shouldStartDrag(clientX: number, clientY: number): boolean {
    const distance = Math.sqrt(
      Math.pow(clientX - this.lastDragPosition.x, 2) +
      Math.pow(clientY - this.lastDragPosition.y, 2)
    );

    return distance > this.dragThreshold;
  }

  // Throttled drag move handler
  throttledDragMove = this.throttle((callback: (x: number, y: number) => void, x: number, y: number) => {
    callback(x, y);
  }, 16); // 60fps

  // Performance optimized drop zone calculation
  calculateDropZones(containerElement: Element, clientX: number, clientY: number): DropZone[] {
    const containerRect = containerElement.getBoundingClientRect();
    const zones: DropZone[] = [];

    // Use document fragments for better performance
    const panels = containerElement.querySelectorAll('.dock-panel');

    panels.forEach((panel, index) => {
      const panelRect = panel.getBoundingClientRect();

      // Only calculate zones for visible panels
      if (this.isElementVisible(panel)) {
        zones.push(...this.calculatePanelDropZones(panel, panelRect, index));
      }
    });

    return zones;
  }

  private calculatePanelDropZones(panel: Element, rect: DOMRect, index: number): DropZone[] {
    const zones: DropZone[] = [];
    const edgeThreshold = 30;

    // Edge zones
    zones.push(
      {
        id: `panel-${index}-left`,
        rect: new DOMRect(rect.left, rect.top, edgeThreshold, rect.height),
        type: 'edge',
        position: 'left',
        element: panel,
      },
      {
        id: `panel-${index}-right`,
        rect: new DOMRect(rect.right - edgeThreshold, rect.top, edgeThreshold, rect.height),
        type: 'edge',
        position: 'right',
        element: panel,
      },
      {
        id: `panel-${index}-top`,
        rect: new DOMRect(rect.left, rect.top, rect.width, edgeThreshold),
        type: 'edge',
        position: 'top',
        element: panel,
      },
      {
        id: `panel-${index}-bottom`,
        rect: new DOMRect(rect.left, rect.bottom - edgeThreshold, rect.width, edgeThreshold),
        type: 'edge',
        position: 'bottom',
        element: panel,
      }
    );

    // Tab zone
    const tabBar = panel.querySelector('.dock-tab-bar');
    if (tabBar) {
      const tabRect = tabBar.getBoundingClientRect();
      zones.push({
        id: `panel-${index}-tab`,
        rect: tabRect,
        type: 'tab',
        element: panel,
      });
    }

    return zones;
  }

  private isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;

    return ((...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  }
}

interface DropZone {
  id: string;
  rect: DOMRect;
  type: 'edge' | 'tab' | 'float' | 'quarter';
  position?: 'left' | 'right' | 'top' | 'bottom' | 'tl' | 'tr' | 'bl' | 'br';
  element?: Element;
  magneticStrength?: number;
}

// Layout optimization utilities
export class LayoutOptimizer {
  // Optimize layout for better space utilization
  static optimizeLayout(layout: RcLayoutData): RcLayoutData {
    const optimized = JSON.parse(JSON.stringify(layout)); // Deep clone

    if (optimized.dockbox) {
      this.optimizeBox(optimized.dockbox);
    }

    if (optimized.floatbox) {
      this.optimizeBox(optimized.floatbox);
    }

    return optimized;
  }

  private static optimizeBox(box: BoxData): void {
    if (!box.children) return;

    // Remove empty boxes
    box.children = box.children.filter(child => this.isBoxNotEmpty(child));

    // Optimize child boxes recursively
    box.children.forEach(child => {
      if ('children' in child) {
        this.optimizeBox(child);
      }
    });

    // Balance sizes if needed
    this.balanceSizes(box);
  }

  private static isBoxNotEmpty(box: BoxData | PanelData): boolean {
    if ('tabs' in box) {
      return box.tabs && box.tabs.length > 0;
    }

    if ('children' in box) {
      return box.children && box.children.length > 0;
    }

    return false;
  }

  private static balanceSizes(box: BoxData): void {
    if (!box.children || box.children.length === 0) return;

    const totalSize = box.children.reduce((sum, child) => sum + (child.size || 0), 0);

    // If no sizes are set, distribute equally
    if (totalSize === 0) {
      const equalSize = 100 / box.children.length;
      box.children.forEach(child => {
        child.size = equalSize;
      });
    }
  }

  // Calculate layout metrics for performance monitoring
  static calculateLayoutMetrics(layout: RcLayoutData): LayoutMetrics {
    const metrics: LayoutMetrics = {
      panelCount: 0,
      maxDepth: 0,
      utilization: 0,
      balance: 0,
      floatingPanels: 0,
    };

    if (layout.dockbox) {
      this.analyzeBox(layout.dockbox, metrics, 0);
    }

    if (layout.floatbox) {
      this.analyzeBox(layout.floatbox, metrics, 0);
      metrics.floatingPanels = this.countFloatingPanels(layout.floatbox);
    }

    // Calculate utilization (simple heuristic)
    metrics.utilization = Math.min(100, (metrics.panelCount / 10) * 100);

    // Calculate balance (difference in sizes)
    metrics.balance = this.calculateBalance(layout);

    return metrics;
  }

  private static analyzeBox(box: BoxData | PanelData, metrics: LayoutMetrics, depth: number): void {
    metrics.maxDepth = Math.max(metrics.maxDepth, depth);

    if ('tabs' in box) {
      metrics.panelCount += box.tabs?.length || 0;
    } else if ('children' in box && box.children) {
      box.children.forEach(child => {
        this.analyzeBox(child, metrics, depth + 1);
      });
    }
  }

  private static countFloatingPanels(floatbox: BoxData): number {
    let count = 0;

    const countInBox = (box: BoxData | PanelData): void => {
      if ('tabs' in box) {
        count += box.tabs?.length || 0;
      } else if ('children' in box && box.children) {
        box.children.forEach(countInBox);
      }
    };

    countInBox(floatbox);
    return count;
  }

  private static calculateBalance(layout: RcLayoutData): number {
    // Simple balance calculation based on size distribution
    const sizes: number[] = [];

    const collectSizes = (box: BoxData | PanelData): void => {
      if ('size' in box && box.size) {
        sizes.push(box.size);
      }

      if ('children' in box && box.children) {
        box.children.forEach(collectSizes);
      }
    };

    if (layout.dockbox) {
      collectSizes(layout.dockbox);
    }

    if (sizes.length === 0) return 100;

    const mean = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - mean, 2), 0) / sizes.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to a 0-100 balance score (lower deviation = higher balance)
    return Math.max(0, 100 - (standardDeviation / mean) * 100);
  }
}

interface LayoutMetrics {
  panelCount: number;
  maxDepth: number;
  utilization: number;
  balance: number;
  floatingPanels: number;
}

// Panel state management utilities
export class PanelStateManager {
  private static states = new Map<string, PanelState>();

  static savePanelState(panelId: string, state: Partial<PanelState>): void {
    const existing = this.states.get(panelId) || {};
    this.states.set(panelId, { ...existing, ...state });
  }

  static getPanelState(panelId: string): PanelState | undefined {
    return this.states.get(panelId);
  }

  static restorePanelState(panelId: string): PanelState | null {
    return this.states.get(panelId) || null;
  }

  static clearPanelState(panelId: string): void {
    this.states.delete(panelId);
  }

  // Batch operations for performance
  static savePanelStates(states: Record<string, Partial<PanelState>>): void {
    Object.entries(states).forEach(([panelId, state]) => {
      this.savePanelState(panelId, state);
    });
  }

  static getAllPanelStates(): Record<string, PanelState> {
    const result: Record<string, PanelState> = {};
    this.states.forEach((state, panelId) => {
      result[panelId] = state;
    });
    return result;
  }
}

interface PanelState {
  isAutoHidden?: boolean;
  isMaximized?: boolean;
  isMinimized?: boolean;
  originalSize?: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  zIndex?: number;
  lastActiveTime?: number;
}

// Visual feedback utilities
export class VisualFeedbackManager {
  private static activeIndicators = new Set<string>();

  static showDropIndicator(zone: DropZone, type: 'highlight' | 'preview' = 'highlight'): void {
    const indicatorId = `drop-indicator-${zone.id}`;

    // Remove existing indicator
    this.removeDropIndicator(indicatorId);

    // Create new indicator
    const indicator = document.createElement('div');
    indicator.id = indicatorId;
    indicator.className = `drop-indicator drop-indicator-${type} drop-indicator-${zone.type}`;

    // Position the indicator
    Object.assign(indicator.style, {
      position: 'fixed',
      left: `${zone.rect.left}px`,
      top: `${zone.rect.top}px`,
      width: `${zone.rect.width}px`,
      height: `${zone.rect.height}px`,
      pointerEvents: 'none',
      zIndex: '10000',
      transition: 'all 0.2s ease',
    });

    // Add type-specific styles
    this.applyIndicatorStyles(indicator, zone, type);

    document.body.appendChild(indicator);
    this.activeIndicators.add(indicatorId);

    // Auto-remove after timeout
    setTimeout(() => {
      this.removeDropIndicator(indicatorId);
    }, 5000);
  }

  static removeDropIndicator(indicatorId: string): void {
    const existing = document.getElementById(indicatorId);
    if (existing) {
      existing.remove();
      this.activeIndicators.delete(indicatorId);
    }
  }

  static clearAllDropIndicators(): void {
    this.activeIndicators.forEach(indicatorId => {
      this.removeDropIndicator(indicatorId);
    });
  }

  private static applyIndicatorStyles(element: HTMLElement, zone: DropZone, type: 'highlight' | 'preview'): void {
    if (type === 'highlight') {
      Object.assign(element.style, {
        border: '2px dashed #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '4px',
      });
    } else {
      Object.assign(element.style, {
        border: '2px solid #10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      });
    }

    // Add type-specific indicators
    if (zone.type === 'quarter') {
      element.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6366f1; font-size: 24px;">◢</div>';
    } else if (zone.type === 'edge') {
      const arrow = zone.position === 'left' ? '◀' : zone.position === 'right' ? '▶' :
                   zone.position === 'top' ? '▲' : '▼';
      element.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #3b82f6; font-size: 20px;">${arrow}</div>`;
    }
  }
}

// Export all utilities
export {
  DockingDragDropManager,
  LayoutOptimizer,
  PanelStateManager,
  VisualFeedbackManager,
};

export type {
  DropZone,
  LayoutMetrics,
  PanelState,
};