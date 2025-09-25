"use client";

import {
  Undo2,
  Redo2,
  Scissors,
  Copy,
  Clipboard,
  ClipboardCopy,
  ClipboardPaste,
  Paintbrush,
  ChevronDown,
  FileText,
  Info,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useReactFlow } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";
import type { HistoryItem } from "@/types/commands";

interface EditOperationsToolbarProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  shortcut?: string;
  disabled?: boolean;
  active?: boolean;
  dropdown?: DropdownItem[];
}

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  shortcut?: string;
  divider?: boolean;
}

export default function EditOperationsToolbar({
  className = "",
  orientation = "horizontal",
}: EditOperationsToolbarProps): React.ReactElement {
  const { getNodes, getEdges } = useReactFlow();
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryItems,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    pasteSpecial,
    hasClipboardData,
    isFormatPainterActive,
    setFormatPainter,
    toggleFormatPainter,
    selectedNodeId,
    selectedEdgeId,
  } = useDrawingStore();

  const [showUndoDropdown, setShowUndoDropdown] = useState(false);
  const [showRedoDropdown, setShowRedoDropdown] = useState(false);
  const [showPasteDropdown, setShowPasteDropdown] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Update history items when dropdown opens
  useEffect(() => {
    if (showUndoDropdown || showRedoDropdown) {
      setHistoryItems(getHistoryItems());
    }
  }, [showUndoDropdown, showRedoDropdown, getHistoryItems]);

  // Get selected elements
  const getSelectedElements = useCallback(() => {
    const nodes = getNodes().filter((n) => n.selected);
    const edges = getEdges().filter((e) => e.selected);

    // If no multi-selection, check for single selection
    if (nodes.length === 0 && edges.length === 0) {
      if (selectedNodeId) {
        const selectedNode = getNodes().find((n) => n.id === selectedNodeId);
        if (selectedNode) nodes.push(selectedNode);
      }
      if (selectedEdgeId) {
        const selectedEdge = getEdges().find((e) => e.id === selectedEdgeId);
        if (selectedEdge) edges.push(selectedEdge);
      }
    }

    return { nodes, edges };
  }, [getNodes, getEdges, selectedNodeId, selectedEdgeId]);

  // Handle cut operation
  const handleCut = useCallback(() => {
    const { nodes, edges } = getSelectedElements();
    if (nodes.length > 0 || edges.length > 0) {
      cutToClipboard(nodes, edges);
    }
  }, [cutToClipboard, getSelectedElements]);

  // Handle copy operation
  const handleCopy = useCallback(() => {
    const { nodes, edges } = getSelectedElements();
    if (nodes.length > 0 || edges.length > 0) {
      copyToClipboard(nodes, edges);
    }
  }, [copyToClipboard, getSelectedElements]);

  // Handle paste operation
  const handlePaste = useCallback(() => {
    pasteFromClipboard();
  }, [pasteFromClipboard]);

  // Handle format painter
  const handleFormatPainter = useCallback(() => {
    const { nodes } = getSelectedElements();
    if (nodes.length > 0 && !isFormatPainterActive) {
      // Pick format from first selected node
      const sourceNode = nodes[0];
      if (sourceNode) {
        setFormatPainter({
          style: sourceNode.style,
          nodeType: sourceNode.type,
          data: sourceNode.data,
        });
      }
    } else {
      toggleFormatPainter();
    }
  }, [getSelectedElements, isFormatPainterActive, setFormatPainter, toggleFormatPainter]);

  // Setup keyboard shortcuts
  useHotkeys("ctrl+z, cmd+z", () => canUndo() && undo(), [canUndo, undo]);
  useHotkeys("ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z", () => canRedo() && redo(), [
    canRedo,
    redo,
  ]);
  useHotkeys("ctrl+x, cmd+x", handleCut, [handleCut]);
  useHotkeys("ctrl+c, cmd+c", handleCopy, [handleCopy]);
  useHotkeys("ctrl+v, cmd+v", handlePaste, [handlePaste]);

  // Undo/Redo dropdown items
  const undoDropdownItems: DropdownItem[] = historyItems
    .slice(0, 10)
    .map((item, index) => ({
      id: `undo-${index}`,
      label: item.action || `Action ${index + 1}`,
      onClick: () => {
        // Undo multiple times to reach this point
        for (let i = 0; i <= index; i++) {
          undo();
        }
        setShowUndoDropdown(false);
      },
    }));

  const redoDropdownItems: DropdownItem[] = historyItems
    .slice(0, 10)
    .map((item, index) => ({
      id: `redo-${index}`,
      label: item.action || `Action ${index + 1}`,
      onClick: () => {
        // Redo multiple times to reach this point
        for (let i = 0; i <= index; i++) {
          redo();
        }
        setShowRedoDropdown(false);
      },
    }));

  // Paste special dropdown items
  const pasteDropdownItems: DropdownItem[] = [
    {
      id: "paste-normal",
      label: "Paste",
      icon: Clipboard,
      onClick: () => {
        handlePaste();
        setShowPasteDropdown(false);
      },
      shortcut: "Ctrl+V",
    },
    {
      id: "paste-formatting",
      label: "Paste Format Only",
      icon: Paintbrush,
      onClick: () => {
        pasteSpecial("formatting");
        setShowPasteDropdown(false);
      },
    },
    {
      id: "paste-values",
      label: "Paste Values Only",
      icon: FileText,
      onClick: () => {
        pasteSpecial("values");
        setShowPasteDropdown(false);
      },
    },
    { id: "divider", label: "", divider: true, onClick: () => {} },
    {
      id: "paste-duplicate",
      label: "Duplicate",
      icon: ClipboardCopy,
      onClick: () => {
        pasteSpecial("duplicate");
        setShowPasteDropdown(false);
      },
      shortcut: "Ctrl+D",
    },
  ];

  // Toolbar buttons configuration
  const buttons: ToolbarButton[] = [
    {
      id: "undo",
      label: "Undo",
      icon: Undo2,
      onClick: undo,
      shortcut: "Ctrl+Z",
      disabled: !canUndo(),
      dropdown: undoDropdownItems,
    },
    {
      id: "redo",
      label: "Redo",
      icon: Redo2,
      onClick: redo,
      shortcut: "Ctrl+Y",
      disabled: !canRedo(),
      dropdown: redoDropdownItems,
    },
    {
      id: "cut",
      label: "Cut",
      icon: Scissors,
      onClick: handleCut,
      shortcut: "Ctrl+X",
      disabled: !selectedNodeId && !selectedEdgeId,
    },
    {
      id: "copy",
      label: "Copy",
      icon: Copy,
      onClick: handleCopy,
      shortcut: "Ctrl+C",
      disabled: !selectedNodeId && !selectedEdgeId,
    },
    {
      id: "paste",
      label: "Paste",
      icon: ClipboardPaste,
      onClick: handlePaste,
      shortcut: "Ctrl+V",
      disabled: !hasClipboardData(),
      dropdown: pasteDropdownItems,
    },
    {
      id: "format-painter",
      label: "Format Painter",
      icon: Paintbrush,
      onClick: handleFormatPainter,
      active: isFormatPainterActive,
      disabled: !selectedNodeId && !isFormatPainterActive,
    },
  ];

  // Render dropdown menu
  const renderDropdown = (items: DropdownItem[], show: boolean, onClose: () => void): React.ReactElement | null => {
    if (!show) return null;

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
        {items.map((item) => {
          if (item.divider) {
            return <div key={item.id} className="border-t border-gray-200 my-1" />;
          }

          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                item.onClick();
                onClose();
              }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-400 ml-2">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Render button with optional dropdown
  const renderButton = (button: ToolbarButton): React.ReactElement => {
    const Icon = button.icon;
    const isUndoButton = button.id === "undo";
    const isRedoButton = button.id === "redo";
    const isPasteButton = button.id === "paste";

    return (
      <div key={button.id} className="relative group">
        <div className="flex items-center">
          <button
            className={`
              flex items-center justify-center p-2 rounded-l transition-all
              ${button.disabled
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : "hover:bg-gray-100 active:bg-gray-200"
              }
              ${button.active ? "bg-blue-100 text-blue-600" : ""}
              ${orientation === "vertical" ? "w-full" : ""}
            `}
            onClick={button.onClick}
            disabled={button.disabled}
            title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ""}`}
          >
            <Icon className="w-4 h-4" />
            {orientation === "vertical" && (
              <span className="ml-2 text-sm">{button.label}</span>
            )}
          </button>

          {button.dropdown && (
            <button
              className={`
                px-1 py-2 border-l border-gray-200 rounded-r transition-all
                ${button.disabled
                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                  : "hover:bg-gray-100 active:bg-gray-200"
                }
              `}
              onClick={() => {
                if (isUndoButton) setShowUndoDropdown(!showUndoDropdown);
                if (isRedoButton) setShowRedoDropdown(!showRedoDropdown);
                if (isPasteButton) setShowPasteDropdown(!showPasteDropdown);
              }}
              disabled={button.disabled}
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Tooltip */}
        {!button.disabled && button.shortcut && orientation === "horizontal" && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {button.label}
            {button.shortcut && (
              <span className="ml-1 text-gray-300">({button.shortcut})</span>
            )}
          </div>
        )}

        {/* Dropdown menu */}
        {isUndoButton &&
          renderDropdown(undoDropdownItems, showUndoDropdown, () => setShowUndoDropdown(false))}
        {isRedoButton &&
          renderDropdown(redoDropdownItems, showRedoDropdown, () => setShowRedoDropdown(false))}
        {isPasteButton &&
          renderDropdown(pasteDropdownItems, showPasteDropdown, () =>
            setShowPasteDropdown(false)
          )}
      </div>
    );
  };

  const containerClass =
    orientation === "horizontal"
      ? "flex items-center gap-1 px-2 py-1 bg-white border-b border-gray-200"
      : "flex flex-col gap-1 p-2 bg-white border-r border-gray-200";

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Undo/Redo Section */}
      <div
        className={`flex ${
          orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1"
        }`}
      >
        {buttons.slice(0, 2).map(renderButton)}
      </div>

      {/* Separator */}
      <div
        className={`${
          orientation === "horizontal"
            ? "w-px h-6 bg-gray-300 mx-1"
            : "h-px w-full bg-gray-300 my-1"
        }`}
      />

      {/* Cut/Copy/Paste Section */}
      <div
        className={`flex ${
          orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1"
        }`}
      >
        {buttons.slice(2, 5).map(renderButton)}
      </div>

      {/* Separator */}
      <div
        className={`${
          orientation === "horizontal"
            ? "w-px h-6 bg-gray-300 mx-1"
            : "h-px w-full bg-gray-300 my-1"
        }`}
      />

      {/* Format Painter Section */}
      <div
        className={`flex ${
          orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1"
        }`}
      >
        {buttons.slice(5).map(renderButton)}
      </div>

      {/* Additional Info */}
      {orientation === "vertical" && (
        <>
          <div className="h-px w-full bg-gray-300 my-1" />
          <div className="text-xs text-gray-500 p-2">
            <div className="flex items-center gap-1 mb-1">
              <Info className="w-3 h-3" />
              <span>Edit Operations</span>
            </div>
            <div className="text-[10px] leading-relaxed">
              Use keyboard shortcuts for faster editing
            </div>
          </div>
        </>
      )}
    </div>
  );
}