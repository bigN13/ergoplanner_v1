"use client";

import {
  Undo2,
  Redo2,
  Scissors,
  Copy,
  Clipboard,
  PaintBucket,
  ChevronDown,
  Clock,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useDrawingStore } from "@/store/drawingStore";

import HistoryDropdown from "./HistoryDropdown";

/**
 * Props interface for EditOperationsToolbar component
 */
export interface EditOperationsToolbarProps {
  className?: string;
  showLabels?: boolean;
  responsive?: boolean;
}

/**
 * Paste special options enum
 */
export enum PasteSpecialMode {
  FORMATTING = "formatting",
  VALUES = "values",
  DUPLICATE = "duplicate",
}

/**
 * Edit operations toolbar component providing undo/redo, clipboard operations, and format painter
 * Matches draw.io styling and behavior with three distinct sections separated by dividers
 */
export default function EditOperationsToolbar({
  className = "",
  showLabels = true,
  responsive = true,
}: EditOperationsToolbarProps): JSX.Element {
  // Dropdown state management
  const [pasteDropdownOpen, setPasteDropdownOpen] = useState(false);
  const [isResponsiveMode, setIsResponsiveMode] = useState(false);

  // Refs for dropdown click-outside handling
  const pasteDropdownRef = useRef<HTMLDivElement>(null);

  // Drawing store integration
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    clipboard,
    formatPainter,
    copySelected,
    cut,
    paste,
    canPaste,
    duplicateSelected,
    copyFormat,
    applyFormat,
    toggleFormatPainter,
    clearFormatPainter,
    getHistoryEntries,
    jumpToHistoryIndex,
    getCurrentIndex,
    selectedNodeId,
    selectedNodeIds,
    selectedEdgeId,
    selectedEdgeIds,
  } = useDrawingStore();

  // Get history data for dropdowns
  const historyEntries = getHistoryEntries();
  const currentHistoryIndex = getCurrentIndex();

  // Check if anything is selected
  const hasSelection = selectedNodeId || selectedEdgeId ||
                      selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;

  // Check if format painter is active
  const isFormatPainterActive = formatPainter.active;

  // Responsive behavior
  useEffect(() => {
    if (!responsive) return;

    const handleResize = (): void => {
      setIsResponsiveMode(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [responsive]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        pasteDropdownRef.current &&
        !pasteDropdownRef.current.contains(event.target as Node)
      ) {
        setPasteDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useHotkeys("ctrl+z, cmd+z", handleUndo, { enabled: canUndo() });
  useHotkeys("ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z", handleRedo, { enabled: canRedo() });
  useHotkeys("ctrl+x, cmd+x", handleCut, { enabled: hasSelection });
  useHotkeys("ctrl+c, cmd+c", handleCopy, { enabled: hasSelection });
  useHotkeys("ctrl+v, cmd+v", handlePaste, { enabled: canPaste() });
  useHotkeys("ctrl+d, cmd+d", handleDuplicate, { enabled: hasSelection });
  useHotkeys("escape", handleEscapeKey);

  /**
   * Handle undo operation
   */
  function handleUndo(): void {
    if (canUndo()) {
      undo();
    }
  }

  /**
   * Handle redo operation
   */
  function handleRedo(): void {
    if (canRedo()) {
      redo();
    }
  }

  /**
   * Handle cut operation
   */
  function handleCut(): void {
    if (hasSelection) {
      cut();
    }
  }

  /**
   * Handle copy operation
   */
  function handleCopy(): void {
    if (hasSelection) {
      copySelected();
    }
  }

  /**
   * Handle paste operation
   */
  function handlePaste(): void {
    if (canPaste()) {
      paste();
    }
    setPasteDropdownOpen(false);
  }

  /**
   * Handle duplicate operation
   */
  function handleDuplicate(): void {
    if (hasSelection) {
      duplicateSelected();
    }
  }

  /**
   * Handle paste special operation
   */
  function handlePasteSpecial(mode: PasteSpecialMode): void {
    switch (mode) {
      case PasteSpecialMode.FORMATTING:
        // Apply only formatting from clipboard
        if (clipboard.nodes.length > 0 && selectedNodeId) {
          const sourceNode = clipboard.nodes[0];
          if (sourceNode.style || sourceNode.data) {
            // Use format painter logic
            copyFormat(sourceNode.id);
            applyFormat([selectedNodeId]);
          }
        }
        break;
      case PasteSpecialMode.VALUES:
        // Paste without formatting
        paste(); // Default paste for now
        break;
      case PasteSpecialMode.DUPLICATE:
        // Duplicate in place
        handleDuplicate();
        break;
    }
    setPasteDropdownOpen(false);
  }

  /**
   * Handle format painter toggle
   */
  function handleFormatPainter(): void {
    if (isFormatPainterActive) {
      clearFormatPainter();
    } else if (selectedNodeId) {
      // Copy format from selected node
      copyFormat(selectedNodeId);
    } else {
      // Just toggle the mode
      toggleFormatPainter();
    }
  }

  /**
   * Handle escape key to exit format painter mode
   */
  function handleEscapeKey(): void {
    if (isFormatPainterActive) {
      clearFormatPainter();
    }
  }

  /**
   * Handle history jump from dropdown
   */
  function handleJumpToHistory(index: number): void {
    jumpToHistoryIndex(index);
  }

  const shouldShowLabels = showLabels && !isResponsiveMode;
  const hasClipboardContent = clipboard.nodes.length > 0 || clipboard.edges.length > 0;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Section 1: Undo/Redo with History Dropdown */}
      <div className="flex items-center space-x-0.5">
        {/* Undo Button with Dropdown */}
        <div className="flex items-center">
          <button
            onClick={handleUndo}
            disabled={!canUndo()}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-l-md transition-colors ${
              canUndo()
                ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
            {shouldShowLabels && <span>Undo</span>}
          </button>
          <HistoryDropdown
            historyEntries={historyEntries}
            currentIndex={currentHistoryIndex}
            onJumpToIndex={handleJumpToHistory}
            disabled={!canUndo()}
            isUndo={true}
          />
        </div>

        {/* Redo Button with Dropdown */}
        <div className="flex items-center">
          <button
            onClick={handleRedo}
            disabled={!canRedo()}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-l-md transition-colors ${
              canRedo()
                ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
            {shouldShowLabels && <span>Redo</span>}
          </button>
          <HistoryDropdown
            historyEntries={historyEntries}
            currentIndex={currentHistoryIndex}
            onJumpToIndex={handleJumpToHistory}
            disabled={!canRedo()}
            isUndo={false}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Section 2: Clipboard Operations */}
      <div className="flex items-center space-x-0.5">
        {/* Cut Button */}
        <button
          onClick={handleCut}
          disabled={!hasSelection}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
            hasSelection
              ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
              : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
          title="Cut (Ctrl+X)"
        >
          <Scissors className="w-4 h-4" />
          {shouldShowLabels && <span>Cut</span>}
        </button>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={!hasSelection}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
            hasSelection
              ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
              : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
          title="Copy (Ctrl+C)"
        >
          <Copy className="w-4 h-4" />
          {shouldShowLabels && <span>Copy</span>}
        </button>

        {/* Paste Button with Dropdown */}
        <div className="relative" ref={pasteDropdownRef}>
          <div className="flex items-center">
            <button
              onClick={handlePaste}
              disabled={!hasClipboardContent}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-l-md transition-colors ${
                hasClipboardContent
                  ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                  : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
              title="Paste (Ctrl+V)"
            >
              <Clipboard className="w-4 h-4" />
              {shouldShowLabels && <span>Paste</span>}
              {hasClipboardContent && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
              )}
            </button>
            <button
              onClick={() => setPasteDropdownOpen(!pasteDropdownOpen)}
              disabled={!hasClipboardContent}
              className={`px-2 py-2 border border-l-0 rounded-r-md transition-colors ${
                hasClipboardContent
                  ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                  : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
              title="Paste special"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Paste Special Dropdown */}
          {pasteDropdownOpen && hasClipboardContent && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={handlePaste}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Clipboard className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Paste</div>
                    <div className="text-xs text-gray-500">Ctrl+V</div>
                  </div>
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={() => handlePasteSpecial(PasteSpecialMode.FORMATTING)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  disabled={!selectedNodeId}
                >
                  <PaintBucket className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Paste Formatting Only</div>
                    <div className="text-xs text-gray-500">Apply style only</div>
                  </div>
                </button>
                <button
                  onClick={() => handlePasteSpecial(PasteSpecialMode.VALUES)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Paste Values Only</div>
                    <div className="text-xs text-gray-500">No formatting</div>
                  </div>
                </button>
                <button
                  onClick={() => handlePasteSpecial(PasteSpecialMode.DUPLICATE)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  disabled={!hasSelection}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Duplicate</div>
                    <div className="text-xs text-gray-500">Ctrl+D</div>
                  </div>
                </button>
              </div>
              {clipboard.nodes.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>
                      Clipboard: {clipboard.nodes.length} nodes, {clipboard.edges.length} edges
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Section 3: Format Painter */}
      <div className="flex items-center">
        <button
          onClick={handleFormatPainter}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
            isFormatPainterActive
              ? "text-white bg-blue-500 border-blue-600 hover:bg-blue-600"
              : selectedNodeId
              ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
              : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
          title={`Format Painter ${isFormatPainterActive ? "(Active - Click to exit)" : "(Select a node first)"}`}
          disabled={!selectedNodeId && !isFormatPainterActive}
        >
          <PaintBucket className="w-4 h-4" />
          {shouldShowLabels && <span>Format Painter</span>}
          {isFormatPainterActive && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-1" />
          )}
        </button>
        {isFormatPainterActive && formatPainter.format && (
          <span className="ml-2 text-xs text-gray-500">
            Click nodes to apply format (ESC to exit)
          </span>
        )}
      </div>
    </div>
  );
}