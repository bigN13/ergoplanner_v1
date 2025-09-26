"use client";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Grid2x2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Copy,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Magnet,
  Search,
  Pin,
  Unplug,
  Sparkles,
  Workflow,
  X,
  ChevronDown,
  ChevronRight,
  Command,
  Clock,
  TrendingUp,
} from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import { useQuickActions } from "@/hooks/useQuickActions";
import type { QuickAction, ActionContext, ActionSuggestion } from "@/types/quickActions";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  AlignLeft,
  AlignCenterHorizontal: AlignCenter,
  AlignRight,
  AlignTop: AlignVerticalJustifyStart,
  AlignCenterVertical: AlignVerticalJustifyCenter,
  AlignBottom: AlignVerticalJustifyEnd,
  DistributeHorizontal: Grid3X3,
  DistributeVertical: Grid3X3,
  Grid: Grid3X3,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Copy,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid2x2,
  Magnet,
  Workflow,
};

interface QuickActionsPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
  defaultPosition?: { x: number; y: number };
  canDrag?: boolean;
}

export default function QuickActionsPanel({
  isVisible = true,
  onClose,
  defaultPosition = { x: 20, y: 100 },
  canDrag = true,
}: QuickActionsPanelProps): React.ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["edit", "align", "transform"])
  );
  const [showSuggestions] = useState(true);
  // const [showHistory, setShowHistory] = useState(false);
  // const [showMacros, setShowMacros] = useState(false);

  const {
    context,
    availableActions,
    frequentActions,
    pinnedActionsList,
    suggestions,
    actionHistory,
    macros,
    togglePin,
    createMacroFromHistory,
    executeMacro,
  } = useQuickActions();

  // Filter actions based on search
  const filteredActions = useMemo(() => {
    if (!searchQuery) return availableActions;

    const query = searchQuery.toLowerCase();
    return availableActions.filter(
      (action) =>
        action.label.toLowerCase().includes(query) ||
        action.category.toLowerCase().includes(query) ||
        action.shortcut?.toLowerCase().includes(query)
    );
  }, [availableActions, searchQuery]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups = new Map<string, QuickAction[]>();

    filteredActions.forEach((action) => {
      const { category } = action;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      const categoryActions = groups.get(category);
      if (categoryActions) {
        categoryActions.push(action);
      }
    });

    return groups;
  }, [filteredActions]);

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!canDrag) return;

      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [canDrag, position]
  );

  // Handle drag
  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep panel within viewport
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 300);
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 400);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging, dragStart]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Setup drag listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleDragEnd);

      return () => {
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
    return undefined;
  }, [isDragging, handleDrag, handleDragEnd]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Get context label
  const getContextLabel = (ctx: ActionContext): string => {
    const labels: Record<ActionContext, string> = {
      "no-selection": "No Selection",
      "single-node": "Single Node Selected",
      "multiple-nodes": "Multiple Nodes Selected",
      "single-edge": "Edge Selected",
      "multiple-edges": "Multiple Edges Selected",
      "mixed-selection": "Mixed Selection",
    };
    return labels[ctx];
  };

  // Get category label
  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      edit: "Edit",
      align: "Alignment",
      distribute: "Distribution",
      transform: "Transform",
      arrange: "Arrange",
      clipboard: "Clipboard",
      zoom: "View",
      history: "History",
    };
    return labels[category] || category;
  };

  // Render action button
  const renderActionButton = (action: QuickAction, isPinned = false): React.ReactElement => {
    const Icon = iconMap[action.icon] || Grid2x2;
    const canExecute = !action.canExecute || action.canExecute();

    return (
      <div
        key={action.id}
        className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 select-none ${
          canExecute ? "hover:bg-blue-50 active:bg-blue-100" : "cursor-not-allowed opacity-50"
        } `}
        onClick={() => canExecute && action.execute()}
      >
        <Icon className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700">{action.label}</span>

        {action.shortcut && (
          <span className="ml-auto text-xs text-gray-400">{action.shortcut}</span>
        )}

        <button
          className="absolute right-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            togglePin(action.id);
          }}
        >
          {isPinned ? (
            <Unplug className="h-3 w-3 text-blue-500" />
          ) : (
            <Pin className="h-3 w-3 text-gray-400 hover:text-blue-500" />
          )}
        </button>
      </div>
    );
  };

  // Render suggestion
  const renderSuggestion = (suggestion: ActionSuggestion): React.ReactElement | null => {
    const action = availableActions.find((a) => a.id === suggestion.actionId);
    if (!action) return null;

    const Icon = iconMap[action.icon] || Sparkles;
    const canExecute = !action.canExecute || action.canExecute();

    return (
      <div
        key={suggestion.actionId}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-transparent px-3 py-2 ${canExecute ? "hover:from-blue-100" : "cursor-not-allowed opacity-50"} `}
        onClick={() => canExecute && action.execute()}
      >
        <Sparkles className="h-4 w-4 text-blue-500" />
        <Icon className="h-4 w-4 text-gray-600" />
        <div className="flex-1">
          <span className="text-sm text-gray-700">{action.label}</span>
          <span className="block text-xs text-gray-500">{suggestion.reason}</span>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      className="fixed overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
      style={{
        left: position.x,
        top: position.y,
        width: 320,
        maxHeight: "calc(100vh - 120px)",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        className="flex cursor-move items-center justify-between border-b bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Command className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Quick Actions</span>
          <span className="rounded bg-white px-2 py-0.5 text-xs text-gray-500">
            {getContextLabel(context)}
          </span>
        </div>
        {onClose && (
          <button className="rounded p-1 hover:bg-gray-200" onClick={onClose}>
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="border-b px-3 py-2">
        <div className="relative">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions..."
            className="w-full rounded-lg border py-2 pr-3 pl-8 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 500 }}>
        {/* Smart Suggestions */}
        {showSuggestions && suggestions.length > 0 && !searchQuery && (
          <div className="space-y-1 px-3 py-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Suggested</span>
              <TrendingUp className="h-3 w-3 text-blue-500" />
            </div>
            {suggestions.map((suggestion) => renderSuggestion(suggestion))}
          </div>
        )}

        {/* Pinned Actions */}
        {pinnedActionsList.length > 0 && !searchQuery && (
          <div className="space-y-1 border-t px-3 py-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Pinned</span>
              <Pin className="h-3 w-3 text-gray-400" />
            </div>
            {pinnedActionsList.map((action) => renderActionButton(action, true))}
          </div>
        )}

        {/* Frequently Used */}
        {frequentActions.length > 0 && !searchQuery && (
          <div className="space-y-1 border-t px-3 py-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Frequently Used</span>
              <Clock className="h-3 w-3 text-gray-400" />
            </div>
            {frequentActions.slice(0, 3).map((action) => renderActionButton(action))}
          </div>
        )}

        {/* All Actions by Category */}
        <div className="space-y-2 border-t px-3 py-2">
          {Array.from(groupedActions.entries()).map(([category, actions]) => (
            <div key={category} className="space-y-1">
              <button
                className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-gray-50"
                onClick={() => toggleCategory(category)}
              >
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {getCategoryLabel(category)}
                </span>
                {expandedCategories.has(category) ? (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                )}
              </button>

              {expandedCategories.has(category) && (
                <div className="ml-2 space-y-0.5">
                  {actions.map((action) => renderActionButton(action))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Macros */}
        {macros.length > 0 && (
          <div className="space-y-1 border-t px-3 py-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Macros</span>
              <Workflow className="h-3 w-3 text-purple-500" />
            </div>
            {macros.map((macro) => (
              <div
                key={macro.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-purple-50"
                onClick={() => executeMacro(macro)}
              >
                <Workflow className="h-4 w-4 text-purple-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-700">{macro.name}</span>
                  <span className="block text-xs text-gray-500">
                    {macro.actions.length} actions
                  </span>
                </div>
              </div>
            ))}

            {actionHistory.length >= 2 && (
              <button
                className="w-full py-1 text-xs text-purple-600 hover:text-purple-700"
                onClick={() => createMacroFromHistory(3)}
              >
                Create macro from recent actions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with tips */}
      <div className="border-t bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Command className="h-3 w-3" />
          <span>Tip: Use keyboard shortcuts for faster access</span>
        </div>
      </div>
    </div>
  );
}
