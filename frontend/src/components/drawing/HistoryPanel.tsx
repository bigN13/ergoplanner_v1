"use client";

import { Clock, RotateCcw, RotateCw, User, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import { useDrawingStore } from "@/store/drawingStore";
import type { HistoryItem } from "@/types/commands";

const HistoryPanel: React.FC = () => {
  const { getHistoryItems, undo, redo, canUndo, canRedo, clearHistory } = useDrawingStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");

  const historyItems = getHistoryItems();

  // Use real history data from command manager

  // Filter history items
  const filteredHistory = historyItems.filter((item: HistoryItem) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const toggleExpanded = (itemId: string): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getActionIcon = (type: string): string => {
    switch (type) {
      case "add_node":
        return "+";
      case "delete_node":
        return "−";
      case "modify_node":
        return "✎";
      case "move_node":
        return "↔";
      case "add_edge":
        return "⟷";
      case "delete_edge":
        return "⤫";
      case "modify_edge":
        return "⚙";
      case "batch":
        return "⚡";
      case "layer_change":
        return "📋";
      case "property_change":
        return "⚙";
      // Legacy types for backward compatibility
      case "add":
        return "+";
      case "delete":
        return "−";
      case "modify":
        return "✎";
      case "move":
        return "↔";
      case "connect":
        return "⟷";
      case "disconnect":
        return "⤫";
      case "property":
        return "⚙";
      default:
        return "•";
    }
  };

  const getActionColor = (type: string): string => {
    switch (type) {
      case "add_node":
      case "add_edge":
      case "add":
        return "text-green-600";
      case "delete_node":
      case "delete_edge":
      case "delete":
        return "text-red-600";
      case "modify_node":
      case "modify_edge":
      case "modify":
        return "text-blue-600";
      case "move_node":
      case "move":
        return "text-purple-600";
      case "connect":
        return "text-indigo-600";
      case "disconnect":
        return "text-orange-600";
      case "batch":
        return "text-amber-600";
      case "layer_change":
        return "text-cyan-600";
      case "property_change":
      case "property":
        return "text-gray-600";
      default:
        return "text-gray-500";
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const hasUndo = canUndo();
  const hasRedo = canRedo();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold">History</h3>
            <span className="text-xs text-gray-500">({filteredHistory.length} actions)</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={undo}
              disabled={!hasUndo}
              className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!hasRedo}
              className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full rounded-lg border px-2 py-1.5 text-sm"
        >
          <option value="all">All Actions</option>
          <option value="add_node">Add Node</option>
          <option value="delete_node">Delete Node</option>
          <option value="modify_node">Modify Node</option>
          <option value="move_node">Move Node</option>
          <option value="add_edge">Add Edge</option>
          <option value="delete_edge">Delete Edge</option>
          <option value="modify_edge">Modify Edge</option>
          <option value="batch">Batch Operations</option>
          <option value="layer_change">Layer Changes</option>
          <option value="property_change">Property Changes</option>
        </select>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No history items</div>
        ) : (
          <div className="divide-y">
            {filteredHistory.map((item: HistoryItem, index: number) => {
              const isExpanded = expandedItems.has(item.id);
              const isCurrentPosition = index === historyIndex;

              return (
                <div
                  key={item.id}
                  className={`p-2 hover:bg-gray-50 ${
                    isCurrentPosition ? "border-l-2 border-blue-500 bg-blue-50" : ""
                  }`}
                >
                  <div
                    className="flex cursor-pointer items-start gap-2"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className={`mt-0.5 font-bold ${getActionColor(item.type)}`}>
                      {getActionIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.action}</span>
                        <ChevronRight
                          className={`h-3 w-3 text-gray-400 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(item.timestamp)}
                        </span>
                        {item.user && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.user}
                          </span>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && item.details && (
                        <div className="mt-2 rounded bg-gray-50 p-2 text-xs">
                          <div className="mb-1 font-semibold">Details:</div>
                          {Object.entries(item.details).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-mono">
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {item.canUndo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Single undo - more actions could be implemented later
                            undo();
                          }}
                          className="rounded p-1 hover:bg-gray-200"
                          title="Undo this action"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                      {item.canRedo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Single redo - more actions could be implemented later
                            redo();
                          }}
                          className="rounded p-1 hover:bg-gray-200"
                          title="Redo this action"
                        >
                          <RotateCw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statistics Footer */}
      <div className="border-t p-3 text-xs text-gray-500">
        <div className="mb-1 flex justify-between">
          <span>Total Actions:</span>
          <span className="font-medium">{historyItems.length}</span>
        </div>
        <div className="mb-1 flex justify-between">
          <span>Can Undo:</span>
          <span className="font-medium">{hasUndo ? 'Yes' : 'No'}</span>
        </div>
        <div className="mb-1 flex justify-between">
          <span>Can Redo:</span>
          <span className="font-medium">{hasRedo ? 'Yes' : 'No'}</span>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              // Clear history with confirmation
              // eslint-disable-next-line no-alert
              if (confirm("Clear all history? This cannot be undone.")) {
                clearHistory();
              }
            }}
            className="flex-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
            disabled={historyItems.length === 0}
          >
            Clear History
          </button>
          <button
            onClick={() => {
              // Export history
              const blob = new Blob([JSON.stringify(historyItems, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "drawing-history.json";
              a.click();
            }}
            className="flex-1 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
            disabled={historyItems.length === 0}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
