import type { Node } from "reactflow";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { DragPreviewState } from "@/components/drawing/DragPreviewManager";

interface DragPreviewStore extends DragPreviewState {
  // Actions
  setPreviewElement: (element: HTMLElement | Node | null) => void;
  updatePreviewPosition: (
    position: { x: number; y: number },
    offset?: { x: number; y: number }
  ) => void;
  setMultiSelection: (nodes: Node[]) => void;
  setDragState: (isDragging: boolean) => void;
  setVisibility: (isVisible: boolean) => void;
  setOpacity: (opacity: number) => void;
  setScale: (scale: number) => void;
  clearPreview: () => void;

  // Advanced actions
  startDragFromStencil: (element: HTMLElement, mousePosition: { x: number; y: number }) => void;
  startDragFromCanvas: (
    node: Node,
    mousePosition: { x: number; y: number },
    grabOffset: { x: number; y: number }
  ) => void;
  startMultiDrag: (nodes: Node[], mousePosition: { x: number; y: number }) => void;
  updateDragPosition: (mousePosition: { x: number; y: number }) => void;
  endDrag: () => void;
}

const initialState: DragPreviewState = {
  element: null,
  position: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  isVisible: false,
  isDragging: false,
  opacity: 0.5,
  scale: 1,
  multiSelection: undefined,
};

export const useDragPreviewStore = create<DragPreviewStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Basic actions
      setPreviewElement: (element) => set({ element }, false, "setPreviewElement"),

      updatePreviewPosition: (position, offset) =>
        set(
          {
            position,
            ...(offset && { offset }),
          },
          false,
          "updatePreviewPosition"
        ),

      setMultiSelection: (nodes) =>
        set({ multiSelection: nodes.length > 0 ? nodes : undefined }, false, "setMultiSelection"),

      setDragState: (isDragging) => set({ isDragging }, false, "setDragState"),

      setVisibility: (isVisible) => set({ isVisible }, false, "setVisibility"),

      setOpacity: (opacity) =>
        set({ opacity: Math.max(0, Math.min(1, opacity)) }, false, "setOpacity"),

      setScale: (scale) => set({ scale: Math.max(0.1, Math.min(3, scale)) }, false, "setScale"),

      clearPreview: () =>
        set(
          {
            ...initialState,
          },
          false,
          "clearPreview"
        ),

      // Advanced workflow actions
      startDragFromStencil: (element, mousePosition) => {
        // For stencil drags, center the preview on the cursor
        const rect = element.getBoundingClientRect();
        const offset = {
          x: rect.width / 2,
          y: rect.height / 2,
        };

        set(
          {
            element,
            position: mousePosition,
            offset,
            isVisible: true,
            isDragging: true,
            opacity: 0.5,
            scale: 1,
            multiSelection: undefined,
          },
          false,
          "startDragFromStencil"
        );
      },

      startDragFromCanvas: (node, mousePosition, grabOffset) => {
        // For canvas drags, maintain the grab offset
        set(
          {
            element: node,
            position: mousePosition,
            offset: grabOffset,
            isVisible: true,
            isDragging: true,
            opacity: 0.6,
            scale: 1,
            multiSelection: undefined,
          },
          false,
          "startDragFromCanvas"
        );
      },

      startMultiDrag: (nodes, mousePosition) => {
        if (nodes.length === 0) return;

        // Calculate center point of all selected nodes
        const bounds = nodes.reduce(
          (acc, node) => ({
            minX: Math.min(acc.minX, node.position.x),
            minY: Math.min(acc.minY, node.position.y),
            maxX: Math.max(acc.maxX, node.position.x + 100), // Approximate node width
            maxY: Math.max(acc.maxY, node.position.y + 50), // Approximate node height
          }),
          { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
        );

        const centerOffset = {
          x: (bounds.maxX - bounds.minX) / 2,
          y: (bounds.maxY - bounds.minY) / 2,
        };

        set(
          {
            element: nodes[0], // Use first node as primary element
            multiSelection: nodes,
            position: mousePosition,
            offset: centerOffset,
            isVisible: true,
            isDragging: true,
            opacity: 0.4, // Slightly more transparent for multi-selection
            scale: 0.8, // Slightly smaller for visual distinction
          },
          false,
          "startMultiDrag"
        );
      },

      updateDragPosition: (mousePosition) => {
        const state = get();
        if (!state.isDragging) return;

        set(
          {
            position: mousePosition,
          },
          false,
          "updateDragPosition"
        );
      },

      endDrag: () => {
        set(
          {
            isDragging: false,
            isVisible: false,
            element: null,
            multiSelection: undefined,
          },
          false,
          "endDrag"
        );
      },
    }),
    {
      name: "drag-preview-store",
    }
  )
);

// Selector hooks for performance optimization
export const useDragPreviewElement = (): HTMLElement | Node | null =>
  useDragPreviewStore((state) => state.element);
export const useDragPreviewPosition = (): {
  position: { x: number; y: number };
  offset: { x: number; y: number };
} =>
  useDragPreviewStore((state) => ({
    position: state.position,
    offset: state.offset,
  }));
export const useDragPreviewVisibility = (): { isVisible: boolean; isDragging: boolean } =>
  useDragPreviewStore((state) => ({
    isVisible: state.isVisible,
    isDragging: state.isDragging,
  }));
export const useDragPreviewStyle = (): { opacity: number; scale: number } =>
  useDragPreviewStore((state) => ({
    opacity: state.opacity,
    scale: state.scale,
  }));
export const useDragPreviewMultiSelection = (): Node[] | undefined =>
  useDragPreviewStore((state) => state.multiSelection);

// Action hooks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDragPreviewActions = (): any =>
  useDragPreviewStore((state) => ({
    setPreviewElement: state.setPreviewElement,
    updatePreviewPosition: state.updatePreviewPosition,
    setMultiSelection: state.setMultiSelection,
    setDragState: state.setDragState,
    setVisibility: state.setVisibility,
    setOpacity: state.setOpacity,
    setScale: state.setScale,
    clearPreview: state.clearPreview,
    startDragFromStencil: state.startDragFromStencil,
    startDragFromCanvas: state.startDragFromCanvas,
    startMultiDrag: state.startMultiDrag,
    updateDragPosition: state.updateDragPosition,
    endDrag: state.endDrag,
  }));

export default useDragPreviewStore;
