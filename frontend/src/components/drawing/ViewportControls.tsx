import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Undo,
  Redo,
  Move,
  Target,
} from 'lucide-react';
import { useViewportStore } from '@/store/viewportStore';
import { useViewportIntegration } from '@/hooks/useViewportIntegration';

interface ViewportControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  orientation?: 'horizontal' | 'vertical';
  showHistory?: boolean;
  showZoomLevel?: boolean;
  className?: string;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  position = 'bottom-right',
  orientation = 'vertical',
  showHistory = true,
  showZoomLevel = true,
  className = '',
}) => {
  const viewportStore = useViewportStore();
  const {
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
    fitToNodes,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useViewportIntegration();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const orientationClasses = {
    horizontal: 'flex-row space-x-2',
    vertical: 'flex-col space-y-2',
  };

  const zoomPercentage = Math.round(viewportStore.zoom * 100);

  const handleCenterView = () => {
    fitToNodes();
  };

  return (
    <div
      className={`
        fixed z-10 flex ${orientationClasses[orientation]}
        ${positionClasses[position]} ${className}
      `}
    >
      {/* Zoom Controls */}
      <div
        className={`
          flex ${orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row space-x-1'}
          bg-white rounded-lg shadow-lg border border-gray-200 p-1
        `}
      >
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In (Ctrl++)"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {showZoomLevel && (
          <div className="px-2 py-2 text-xs text-center min-w-[48px] text-gray-600 font-medium">
            {zoomPercentage}%
          </div>
        )}

        <button
          onClick={zoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out (Ctrl+-)"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* View Controls */}
      <div
        className={`
          flex ${orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row space-x-1'}
          bg-white rounded-lg shadow-lg border border-gray-200 p-1
        `}
      >
        <button
          onClick={fitToScreen}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Fit to Screen (F)"
          aria-label="Fit to screen"
        >
          <Maximize className="w-4 h-4" />
        </button>

        <button
          onClick={handleCenterView}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Center on Content"
          aria-label="Center on content"
        >
          <Target className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Reset View (R)"
          aria-label="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* History Controls */}
      {showHistory && (
        <div
          className={`
            flex ${orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row space-x-1'}
            bg-white rounded-lg shadow-lg border border-gray-200 p-1
          `}
        >
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`
              p-2 rounded transition-colors
              ${canUndo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}
            `}
            title="Undo Viewport Change (Ctrl+Z)"
            aria-label="Undo viewport change"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className={`
              p-2 rounded transition-colors
              ${canRedo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}
            `}
            title="Redo Viewport Change (Ctrl+Y)"
            aria-label="Redo viewport change"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pan Mode Indicator */}
      {viewportStore.isPanning && (
        <div className="bg-blue-500 text-white rounded-lg shadow-lg px-3 py-2 flex items-center space-x-2">
          <Move className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-medium">Panning</span>
        </div>
      )}
    </div>
  );
};

// Mini map zoom indicator component
export const ZoomIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const zoom = useViewportStore((state) => state.zoom);
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2
        ${className}
      `}
    >
      <div className="flex items-center space-x-2">
        <ZoomIn className="w-3 h-3 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{zoomPercentage}%</span>
      </div>
    </div>
  );
};

// Keyboard shortcuts helper
export const ViewportKeyboardShortcuts: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-sm font-semibold mb-2">Viewport Shortcuts</h3>
      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Zoom In</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + +</kbd>
        </div>
        <div className="flex justify-between">
          <span>Zoom Out</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + -</kbd>
        </div>
        <div className="flex justify-between">
          <span>Reset Zoom</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + 0</kbd>
        </div>
        <div className="flex justify-between">
          <span>Fit to Screen</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">F</kbd>
        </div>
        <div className="flex justify-between">
          <span>Reset View</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd>
        </div>
        <div className="flex justify-between">
          <span>Undo</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + Z</kbd>
        </div>
        <div className="flex justify-between">
          <span>Redo</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + Y</kbd>
        </div>
      </div>
    </div>
  );
};