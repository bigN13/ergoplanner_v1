import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Viewport } from 'reactflow';

export interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ViewportState {
  // Core viewport properties
  x: number;
  y: number;
  zoom: number;

  // Viewport dimensions
  width: number;
  height: number;

  // Constraints
  minZoom: number;
  maxZoom: number;
  bounds: ViewportBounds | null;

  // Animation settings
  animationDuration: number;
  animationEasing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

  // History for undo/redo
  history: Viewport[];
  historyIndex: number;
  maxHistorySize: number;

  // Flags
  isAnimating: boolean;
  isPanning: boolean;
  isZooming: boolean;
}

export interface ViewportActions {
  // Core viewport operations
  setViewport: (viewport: Partial<Viewport>) => void;
  pan: (deltaX: number, deltaY: number, animate?: boolean) => void;
  zoomBy: (factor: number, center?: { x: number; y: number }, animate?: boolean) => void;
  zoomIn: (animate?: boolean) => void;
  zoomOut: (animate?: boolean) => void;

  // Fit operations
  fitToScreen: (padding?: number, animate?: boolean) => void;
  fitToSelection: (bounds: ViewportBounds, padding?: number, animate?: boolean) => void;
  centerOnPoint: (x: number, y: number, animate?: boolean) => void;

  // Reset and constraints
  resetView: (animate?: boolean) => void;
  setConstraints: (minZoom?: number, maxZoom?: number, bounds?: ViewportBounds | null) => void;
  setViewportDimensions: (width: number, height: number) => void;

  // History management
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Animation settings
  setAnimationDuration: (duration: number) => void;
  setAnimationEasing: (easing: ViewportState['animationEasing']) => void;

  // State flags
  setIsAnimating: (isAnimating: boolean) => void;
  setIsPanning: (isPanning: boolean) => void;
  setIsZooming: (isZooming: boolean) => void;

  // Utility
  clampViewport: (viewport: Partial<Viewport>) => Viewport;
  getViewportForBounds: (bounds: ViewportBounds, padding: number) => Viewport;
}

export type ViewportStore = ViewportState & ViewportActions;

const DEFAULT_VIEWPORT: ViewportState = {
  x: 0,
  y: 0,
  zoom: 1,
  width: window.innerWidth,
  height: window.innerHeight,
  minZoom: 0.01,
  maxZoom: 50,
  bounds: null,
  animationDuration: 300,
  animationEasing: 'easeInOut',
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  isAnimating: false,
  isPanning: false,
  isZooming: false,
};

const ZOOM_STEP = 0.15;

export const useViewportStore = create<ViewportStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...DEFAULT_VIEWPORT,

        setViewport: (viewport) => {
          set((state) => {
            const clamped = get().clampViewport({ ...state, ...viewport });
            state.x = clamped.x;
            state.y = clamped.y;
            state.zoom = clamped.zoom;
          });
        },

        pan: (deltaX, deltaY, animate = false) => {
          const currentState = get();
          const newViewport = get().clampViewport({
            x: currentState.x + deltaX,
            y: currentState.y + deltaY,
            zoom: currentState.zoom,
          });

          if (animate) {
            get().setIsAnimating(true);
            // Animation would be handled by ReactFlow or external animation library
            setTimeout(() => {
              get().setViewport(newViewport);
              get().setIsAnimating(false);
            }, currentState.animationDuration);
          } else {
            get().setViewport(newViewport);
          }
        },

        zoomBy(factor: number, center?: { x: number; y: number }, animate: boolean = false) {
          const currentState = get();
          const newZoom = currentState.zoom * factor;

          let newX = currentState.x;
          let newY = currentState.y;

          if (center) {
            // Zoom towards a specific point
            const dx = center.x - currentState.width / 2;
            const dy = center.y - currentState.height / 2;
            newX = currentState.x - dx * (factor - 1);
            newY = currentState.y - dy * (factor - 1);
          }

          const newViewport = get().clampViewport({
            x: newX,
            y: newY,
            zoom: newZoom,
          });

          if (animate) {
            get().setIsAnimating(true);
            setTimeout(() => {
              get().setViewport(newViewport);
              get().setIsAnimating(false);
            }, currentState.animationDuration);
          } else {
            get().setViewport(newViewport);
          }
        },

        zoomIn: (animate: boolean = false) => {
          get().zoomBy(1 + ZOOM_STEP, undefined, animate);
        },

        zoomOut: (animate: boolean = false) => {
          get().zoomBy(1 - ZOOM_STEP, undefined, animate);
        },

        fitToScreen: (padding: number = 50, animate: boolean = false) => {
          const { width, height } = get();
          const bounds: ViewportBounds = {
            minX: padding,
            maxX: width - padding,
            minY: padding,
            maxY: height - padding,
          };
          get().fitToSelection(bounds, 0, animate);
        },

        fitToSelection: (bounds: ViewportBounds, padding: number = 50, animate: boolean = false) => {
          const viewport = get().getViewportForBounds(bounds, padding);

          if (animate) {
            get().setIsAnimating(true);
            setTimeout(() => {
              get().setViewport(viewport);
              get().setIsAnimating(false);
            }, get().animationDuration);
          } else {
            get().setViewport(viewport);
          }
        },

        centerOnPoint: (x: number, y: number, animate: boolean = false) => {
          const { width, height, zoom } = get();
          const newViewport = {
            x: width / 2 - x * zoom,
            y: height / 2 - y * zoom,
            zoom,
          };

          if (animate) {
            get().setIsAnimating(true);
            setTimeout(() => {
              get().setViewport(newViewport);
              get().setIsAnimating(false);
            }, get().animationDuration);
          } else {
            get().setViewport(newViewport);
          }
        },

        resetView: (animate: boolean = false) => {
          const resetViewport = {
            x: DEFAULT_VIEWPORT.x,
            y: DEFAULT_VIEWPORT.y,
            zoom: DEFAULT_VIEWPORT.zoom,
          };

          if (animate) {
            get().setIsAnimating(true);
            setTimeout(() => {
              get().setViewport(resetViewport);
              get().setIsAnimating(false);
            }, get().animationDuration);
          } else {
            get().setViewport(resetViewport);
          }
        },

        setConstraints: (minZoom?: number, maxZoom?: number, bounds?: ViewportBounds | null) => {
          set((state) => {
            if (minZoom !== undefined) state.minZoom = minZoom;
            if (maxZoom !== undefined) state.maxZoom = maxZoom;
            if (bounds !== undefined) state.bounds = bounds;
          });
        },

        setViewportDimensions: (width: number, height: number) => {
          set((state) => {
            state.width = width;
            state.height = height;
          });
        },

        pushToHistory: () => {
          set((state) => {
            const currentViewport: Viewport = {
              x: state.x,
              y: state.y,
              zoom: state.zoom,
            };

            // Remove any history after current index
            state.history = state.history.slice(0, state.historyIndex + 1);

            // Add new viewport to history
            state.history.push(currentViewport);

            // Limit history size
            if (state.history.length > state.maxHistorySize) {
              state.history = state.history.slice(-state.maxHistorySize);
            }

            state.historyIndex = state.history.length - 1;
          });
        },

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            const previousViewport = history[historyIndex - 1];
            if (previousViewport) {
              set((state) => {
                state.historyIndex = historyIndex - 1;
                state.x = previousViewport.x;
                state.y = previousViewport.y;
                state.zoom = previousViewport.zoom;
              });
            }
          }
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            const nextViewport = history[historyIndex + 1];
            if (nextViewport) {
              set((state) => {
                state.historyIndex = historyIndex + 1;
                state.x = nextViewport.x;
                state.y = nextViewport.y;
                state.zoom = nextViewport.zoom;
              });
            }
          }
        },

        clearHistory: () => {
          set((state) => {
            state.history = [];
            state.historyIndex = -1;
          });
        },

        setAnimationDuration: (duration: number) => {
          set((state) => {
            state.animationDuration = duration;
          });
        },

        setAnimationEasing: (easing: ViewportState['animationEasing']) => {
          set((state) => {
            state.animationEasing = easing;
          });
        },

        setIsAnimating: (isAnimating: boolean) => {
          set((state) => {
            state.isAnimating = isAnimating;
          });
        },

        setIsPanning: (isPanning: boolean) => {
          set((state) => {
            state.isPanning = isPanning;
          });
        },

        setIsZooming: (isZooming: boolean) => {
          set((state) => {
            state.isZooming = isZooming;
          });
        },

        clampViewport: (viewport: Partial<Viewport>) => {
          const { minZoom, maxZoom, bounds } = get();
          let { x = 0, y = 0, zoom = 1 } = viewport;

          // Clamp zoom
          zoom = Math.max(minZoom, Math.min(maxZoom, zoom));

          // Clamp position to bounds if defined
          if (bounds) {
            const { width, height } = get();
            const viewWidth = width / zoom;
            const viewHeight = height / zoom;

            // Calculate actual viewport bounds in world space
            const { minX: boundsMinX, maxX: boundsMaxX, minY: boundsMinY, maxY: boundsMaxY } = bounds;
            const minX = boundsMinX;
            const maxX = Math.max(minX, boundsMaxX - viewWidth);
            const minY = boundsMinY;
            const maxY = Math.max(minY, boundsMaxY - viewHeight);

            // Convert from screen space to world space for clamping
            const worldX = -x / zoom;
            const worldY = -y / zoom;

            const clampedWorldX = Math.max(minX, Math.min(maxX, worldX));
            const clampedWorldY = Math.max(minY, Math.min(maxY, worldY));

            // Convert back to screen space
            x = -clampedWorldX * zoom;
            y = -clampedWorldY * zoom;
          }

          return { x, y, zoom };
        },

        getViewportForBounds: (bounds: ViewportBounds, padding: number) => {
          const { width, height } = get();

          const boundsWidth = bounds.maxX - bounds.minX;
          const boundsHeight = bounds.maxY - bounds.minY;

          const scaleX = (width - padding * 2) / boundsWidth;
          const scaleY = (height - padding * 2) / boundsHeight;
          const zoom = Math.min(scaleX, scaleY, get().maxZoom);

          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerY = (bounds.minY + bounds.maxY) / 2;

          const x = width / 2 - centerX * zoom;
          const y = height / 2 - centerY * zoom;

          return get().clampViewport({ x, y, zoom });
        },
      })),
      {
        name: 'viewport-store',
        partialize: (state) => ({
          x: state.x,
          y: state.y,
          zoom: state.zoom,
          minZoom: state.minZoom,
          maxZoom: state.maxZoom,
          bounds: state.bounds,
          animationDuration: state.animationDuration,
          animationEasing: state.animationEasing,
        }),
      }
    ),
    {
      name: 'ViewportStore',
    }
  )
);

// Helper hook to sync with ReactFlow
export const useViewportSync = () => {
  const viewportStore = useViewportStore();

  const onViewportChange = (viewport: Viewport) => {
    if (!viewportStore.isAnimating) {
      viewportStore.setViewport(viewport);
    }
  };

  const onMoveStart = () => {
    viewportStore.setIsPanning(true);
    viewportStore.pushToHistory();
  };

  const onMoveEnd = () => {
    viewportStore.setIsPanning(false);
  };


  return {
    viewport: {
      x: viewportStore.x,
      y: viewportStore.y,
      zoom: viewportStore.zoom,
    },
    onViewportChange,
    onMoveStart,
    onMoveEnd,
    minZoom: viewportStore.minZoom,
    maxZoom: viewportStore.maxZoom,
  };
};