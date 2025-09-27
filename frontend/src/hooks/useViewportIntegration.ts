import { useEffect, useRef, useCallback } from 'react';
import { useReactFlow, Viewport } from 'reactflow';
import { useViewportStore } from '@/store/viewportStore';

interface UseViewportIntegrationOptions {
  autoSync?: boolean;
  saveHistoryOnChange?: boolean;
  debounceMs?: number;
}

export const useViewportIntegration = (options: UseViewportIntegrationOptions = {}) => {
  const {
    autoSync = true,
    saveHistoryOnChange = true,
    debounceMs = 100,
  } = options;

  // Get ReactFlow instance - this hook must be used within a ReactFlow provider
  const reactFlowInstance = useReactFlow();
  const viewportStore = useViewportStore();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastViewport = useRef<Viewport>({
    x: viewportStore.x,
    y: viewportStore.y,
    zoom: viewportStore.zoom,
  });

  // Sync viewport store to ReactFlow
  useEffect(() => {
    if (!autoSync || !reactFlowInstance) return;

    const currentViewport = {
      x: viewportStore.x,
      y: viewportStore.y,
      zoom: viewportStore.zoom,
    };

    // Only update if viewport has actually changed
    if (
      lastViewport.current.x !== currentViewport.x ||
      lastViewport.current.y !== currentViewport.y ||
      lastViewport.current.zoom !== currentViewport.zoom
    ) {
      reactFlowInstance.setViewport(currentViewport, { duration: viewportStore.animationDuration });
      lastViewport.current = currentViewport;
    }
  }, [
    viewportStore.x,
    viewportStore.y,
    viewportStore.zoom,
    viewportStore.animationDuration,
    autoSync,
    reactFlowInstance,
  ]);

  // Handle viewport changes from ReactFlow
  const handleViewportChange = useCallback(
    (viewport: Viewport) => {
      if (!autoSync) return;

      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Update viewport store immediately
      viewportStore.setViewport(viewport);

      // Debounce history save
      if (saveHistoryOnChange) {
        debounceTimer.current = setTimeout(() => {
          viewportStore.pushToHistory();
        }, debounceMs);
      }
    },
    [autoSync, saveHistoryOnChange, debounceMs, viewportStore]
  );

  // Handle move start
  const handleMoveStart = useCallback(() => {
    viewportStore.setIsPanning(true);
    if (saveHistoryOnChange) {
      viewportStore.pushToHistory();
    }
  }, [saveHistoryOnChange, viewportStore]);

  // Handle move end
  const handleMoveEnd = useCallback(() => {
    viewportStore.setIsPanning(false);
  }, [viewportStore]);

  // Keyboard shortcuts for viewport control
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if an input element is focused
      const { activeElement } = document;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      // Zoom controls
      if (isCtrlOrCmd && event.key === '+') {
        event.preventDefault();
        viewportStore.zoomIn(true);
      } else if (isCtrlOrCmd && event.key === '-') {
        event.preventDefault();
        viewportStore.zoomOut(true);
      } else if (isCtrlOrCmd && event.key === '0') {
        event.preventDefault();
        viewportStore.resetView(true);
      }

      // Undo/Redo
      else if (isCtrlOrCmd && event.key === 'z' && !isShift) {
        event.preventDefault();
        viewportStore.undo();
      } else if (isCtrlOrCmd && ((event.key === 'z' && isShift) || event.key === 'y')) {
        event.preventDefault();
        viewportStore.redo();
      }

      // Fit to screen
      else if (event.key === 'f' && !isCtrlOrCmd) {
        event.preventDefault();
        viewportStore.fitToScreen(50, true);
      }

      // Reset view
      else if (event.key === 'r' && !isCtrlOrCmd) {
        event.preventDefault();
        viewportStore.resetView(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewportStore]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      viewportStore.setViewportDimensions(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewportStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Viewport control methods
  const fitToNodes = useCallback(
    (nodeIds?: string[]) => {
      if (!reactFlowInstance) return;

      const nodes = nodeIds
        ? reactFlowInstance.getNodes().filter((node) => nodeIds.includes(node.id))
        : reactFlowInstance.getNodes();

      if (nodes.length === 0) return;

      // Calculate bounds of all nodes
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const nodeWidth = node.width || 150;
        const nodeHeight = node.height || 50;

        minX = Math.min(minX, nodeX);
        minY = Math.min(minY, nodeY);
        maxX = Math.max(maxX, nodeX + nodeWidth);
        maxY = Math.max(maxY, nodeY + nodeHeight);
      });

      viewportStore.fitToSelection(
        {
          minX,
          minY,
          maxX,
          maxY,
        },
        50,
        true
      );
    },
    [reactFlowInstance, viewportStore]
  );

  const centerOnNode = useCallback(
    (nodeId: string) => {
      if (!reactFlowInstance) return;

      const node = reactFlowInstance.getNode(nodeId);
      if (!node) return;

      const nodeX = node.position.x + (node.width || 150) / 2;
      const nodeY = node.position.y + (node.height || 50) / 2;

      viewportStore.centerOnPoint(nodeX, nodeY, true);
    },
    [reactFlowInstance, viewportStore]
  );

  return {
    // Event handlers for ReactFlow
    onViewportChange: handleViewportChange,
    onMoveStart: handleMoveStart,
    onMoveEnd: handleMoveEnd,

    // Viewport control methods
    fitToNodes,
    centerOnNode,
    zoomIn: () => viewportStore.zoomIn(true),
    zoomOut: () => viewportStore.zoomOut(true),
    resetView: () => viewportStore.resetView(true),
    fitToScreen: () => viewportStore.fitToScreen(50, true),

    // Viewport state
    viewport: {
      x: viewportStore.x,
      y: viewportStore.y,
      zoom: viewportStore.zoom,
    },
    isAnimating: viewportStore.isAnimating,
    isPanning: viewportStore.isPanning,
    isZooming: viewportStore.isZooming,

    // History
    canUndo: viewportStore.historyIndex > 0,
    canRedo: viewportStore.historyIndex < viewportStore.history.length - 1,
    undo: viewportStore.undo,
    redo: viewportStore.redo,
  };
};