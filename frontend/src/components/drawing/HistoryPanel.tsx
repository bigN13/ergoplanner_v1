import React, { useState } from "react";
import {
  History,
  Undo2,
  Redo2,
  Clock,
  Circle,
  GitBranch,
  MousePointer,
  Move,
  Palette,
  Layout,
  Layers,
  Command,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useDrawingStore } from "@/store/drawingStore";

interface HistoryPanelProps {
  className?: string;
  maxHeight?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function HistoryPanel({
  className = "",
  maxHeight = "400px",
  isCollapsed = false,
  onToggleCollapse,
}: HistoryPanelProps): JSX.Element {
  const {
    commandHistory,
    undoCommand,
    redoCommand,
    canUndoCommand,
    canRedoCommand,
    jumpToCommand,
    clearCommandHistory,
  } = useDrawingStore();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get icon component for command type
  const getIcon = (name: string) => {
    if (name.includes("Node") || name.includes("Symbol")) return Circle;
    if (name.includes("Edge") || name.includes("Connection")) return GitBranch;
    if (name.includes("Select")) return MousePointer;
    if (name.includes("Move") || name.includes("Transform")) return Move;
    if (name.includes("Format") || name.includes("Style")) return Palette;
    if (name.includes("Layout")) return Layout;
    if (name.includes("Layer")) return Layers;
    return Command;
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return date.toLocaleTimeString();
  };

  if (isCollapsed) {
    return (
      <div className={`bg-white border-l border-gray-200 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Expand History Panel"
        >
          <History className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  const entries = commandHistory?.entries || [];
  const currentIndex = commandHistory?.currentIndex ?? -1;

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">History</span>
          <span className="text-xs text-gray-500">
            ({entries.length} actions)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Undo Button */}
          <button
            onClick={undoCommand}
            disabled={!canUndoCommand()}
            className={`p-1 rounded transition-colors ${
              canUndoCommand()
                ? "hover:bg-gray-200"
                : "opacity-50 cursor-not-allowed"
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 text-gray-600" />
          </button>

          {/* Redo Button */}
          <button
            onClick={redoCommand}
            disabled={!canRedoCommand()}
            className={`p-1 rounded transition-colors ${
              canRedoCommand()
                ? "hover:bg-gray-200"
                : "opacity-50 cursor-not-allowed"
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4 text-gray-600" />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Clear History Button */}
          <button
            onClick={() => {
              if (confirm("Clear all history? This cannot be undone.")) {
                clearCommandHistory();
              }
            }}
            disabled={entries.length === 0}
            className={`p-1 rounded transition-colors ${
              entries.length > 0
                ? "hover:bg-red-100"
                : "opacity-50 cursor-not-allowed"
            }`}
            title="Clear History"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>

          {onToggleCollapse && (
            <>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Collapse Panel"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* History List */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight }}
      >
        {entries.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No actions yet. Start editing to see history.
          </div>
        ) : (
          <div className="py-1">
            {entries.map((entry, index) => {
              const Icon = getIcon(entry.name);
              const isActive = index === currentIndex;
              const isFuture = index > currentIndex;

              return (
                <button
                  key={entry.id}
                  onClick={() => jumpToCommand(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50
                    transition-colors text-left group
                    ${isActive ? "bg-blue-50 border-l-2 border-blue-500" : ""}
                    ${isFuture ? "opacity-50" : ""}
                  `}
                  title={`${entry.name}\n${formatTime(entry.timestamp)}`}
                >
                  {/* Status Indicator */}
                  <div className="w-1">
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 -ml-0.5" />
                    )}
                  </div>

                  {/* Icon */}
                  <Icon
                    className={`w-3 h-3 flex-shrink-0 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />

                  {/* Name */}
                  <span
                    className={`text-xs flex-1 truncate ${
                      isActive
                        ? "font-medium text-blue-600"
                        : isFuture
                        ? "text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    {entry.name}
                  </span>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(entry.timestamp)}
                  </span>

                  {/* Jump Indicator */}
                  {hoveredIndex === index && index !== currentIndex && (
                    <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Jump here
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Position: {currentIndex + 1} / {entries.length}
            </span>
            <div className="flex items-center gap-2">
              {canUndoCommand() && (
                <span className="text-blue-600">
                  {currentIndex + 1} to undo
                </span>
              )}
              {canRedoCommand() && (
                <span className="text-green-600">
                  {entries.length - currentIndex - 1} to redo
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}