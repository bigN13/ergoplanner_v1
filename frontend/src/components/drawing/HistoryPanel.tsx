"use client";

import { Clock, RotateCcw, RotateCw, User, Activity, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import { useDrawingStore } from "@/store/drawing-store";

export interface HistoryItem {
  id: string;
  type: "add" | "delete" | "modify" | "move" | "connect" | "disconnect" | "property";
  action: string;
  timestamp: Date;
  user?: string;
  details: any;
  canUndo: boolean;
  canRedo: boolean;
}

const HistoryPanel: React.FC = () => {
  const { history = [], historyIndex = 0, undo, redo } = useDrawingStore() as any;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");

  // Mock history data if not available
  const mockHistory: HistoryItem[] = [
    {
      id: "1",
      type: "add",
      action: "Added Centrifugal Pump",
      timestamp: new Date(Date.now() - 3600000),
      user: "Current User",
      details: { elementId: "pump-1", position: { x: 100, y: 200 } },
      canUndo: true,
      canRedo: false,
    },
    {
      id: "2",
      type: "connect",
      action: "Connected Pump to Valve",
      timestamp: new Date(Date.now() - 3000000),
      user: "Current User",
      details: { source: "pump-1", target: "valve-1" },
      canUndo: true,
      canRedo: false,
    },
    {
      id: "3",
      type: "modify",
      action: "Changed Valve Properties",
      timestamp: new Date(Date.now() - 2400000),
      user: "Current User",
      details: { elementId: "valve-1", property: "size", oldValue: "DN50", newValue: "DN100" },
      canUndo: true,
      canRedo: false,
    },
    {
      id: "4",
      type: "move",
      action: "Moved Tank",
      timestamp: new Date(Date.now() - 1800000),
      user: "Current User",
      details: { elementId: "tank-1", from: { x: 200, y: 300 }, to: { x: 250, y: 350 } },
      canUndo: true,
      canRedo: false,
    },
    {
      id: "5",
      type: "delete",
      action: "Deleted Flow Meter",
      timestamp: new Date(Date.now() - 1200000),
      user: "Current User",
      details: { elementId: "meter-1", elementType: "flow-meter" },
      canUndo: true,
      canRedo: false,
    },
  ];

  const currentHistory = history.length > 0 ? history : mockHistory;

  // Filter history items
  const filteredHistory = currentHistory.filter((item: HistoryItem) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
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

  const getActionColor = (type: string) => {
    switch (type) {
      case "add":
        return "text-green-600";
      case "delete":
        return "text-red-600";
      case "modify":
        return "text-blue-600";
      case "move":
        return "text-purple-600";
      case "connect":
        return "text-indigo-600";
      case "disconnect":
        return "text-orange-600";
      case "property":
        return "text-gray-600";
      default:
        return "text-gray-500";
    }
  };

  const formatTimestamp = (date: Date) => {
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

  const canUndo = historyIndex > 0 || currentHistory.some((item: HistoryItem) => item.canUndo);
  const canRedo =
    historyIndex < currentHistory.length - 1 ||
    currentHistory.some((item: HistoryItem) => item.canRedo);

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
              disabled={!canUndo}
              className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
              title="Undo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
              title="Redo"
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
          <option value="add">Add</option>
          <option value="delete">Delete</option>
          <option value="modify">Modify</option>
          <option value="move">Move</option>
          <option value="connect">Connect</option>
          <option value="property">Property Change</option>
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
                      {item.canUndo && index <= historyIndex && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Undo to this point
                            for (let i = historyIndex; i >= index; i--) {
                              undo();
                            }
                          }}
                          className="rounded p-1 hover:bg-gray-200"
                          title="Undo to here"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                      {item.canRedo && index > historyIndex && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Redo to this point
                            for (let i = historyIndex; i < index; i++) {
                              redo();
                            }
                          }}
                          className="rounded p-1 hover:bg-gray-200"
                          title="Redo to here"
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
          <span className="font-medium">{currentHistory.length}</span>
        </div>
        <div className="mb-1 flex justify-between">
          <span>Current Position:</span>
          <span className="font-medium">
            {historyIndex + 1} / {currentHistory.length}
          </span>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              // Clear history
              if (confirm("Clear all history? This cannot be undone.")) {
                // Clear history action
              }
            }}
            className="flex-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
          >
            Clear History
          </button>
          <button
            onClick={() => {
              // Export history
              const blob = new Blob([JSON.stringify(currentHistory, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "history.json";
              a.click();
            }}
            className="flex-1 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
