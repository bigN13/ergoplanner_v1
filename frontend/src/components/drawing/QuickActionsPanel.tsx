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
      const {category} = action;
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
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!canDrag) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [canDrag, position]);

  // Handle drag
  const handleDrag = useCallback((e: MouseEvent) => {
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
  }, [isDragging, dragStart]);

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
        className={`
          group relative flex items-center gap-2 px-3 py-2 rounded-lg
          transition-all duration-200 cursor-pointer select-none
          ${canExecute
            ? "hover:bg-blue-50 active:bg-blue-100"
            : "opacity-50 cursor-not-allowed"
          }
        `}
        onClick={() => canExecute && action.execute()}
      >
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700">{action.label}</span>

        {action.shortcut && (
          <span className="ml-auto text-xs text-gray-400">
            {action.shortcut}
          </span>
        )}

        <button
          className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            togglePin(action.id);
          }}
        >
          {isPinned ? (
            <Unplug className="w-3 h-3 text-blue-500" />
          ) : (
            <Pin className="w-3 h-3 text-gray-400 hover:text-blue-500" />
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
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-gradient-to-r from-blue-50 to-transparent
          border border-blue-200 cursor-pointer
          ${canExecute ? "hover:from-blue-100" : "opacity-50 cursor-not-allowed"}
        `}
        onClick={() => canExecute && action.execute()}
      >
        <Sparkles className="w-4 h-4 text-blue-500" />
        <Icon className="w-4 h-4 text-gray-600" />
        <div className="flex-1">
          <span className="text-sm text-gray-700">{action.label}</span>
          <span className="text-xs text-gray-500 block">{suggestion.reason}</span>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
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
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Command className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-sm">Quick Actions</span>
          <span className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded">
            {getContextLabel(context)}
          </span>
        </div>
        {onClose && (
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions..."
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 500 }}>
        {/* Smart Suggestions */}
        {showSuggestions && suggestions.length > 0 && !searchQuery && (
          <div className="px-3 py-2 space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Suggested
              </span>
              <TrendingUp className="w-3 h-3 text-blue-500" />
            </div>
            {suggestions.map((suggestion) =>
              renderSuggestion(suggestion)
            )}
          </div>
        )}

        {/* Pinned Actions */}
        {pinnedActionsList.length > 0 && !searchQuery && (
          <div className="px-3 py-2 space-y-1 border-t">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Pinned
              </span>
              <Pin className="w-3 h-3 text-gray-400" />
            </div>
            {pinnedActionsList.map((action) => renderActionButton(action, true))}
          </div>
        )}

        {/* Frequently Used */}
        {frequentActions.length > 0 && !searchQuery && (
          <div className="px-3 py-2 space-y-1 border-t">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Frequently Used
              </span>
              <Clock className="w-3 h-3 text-gray-400" />
            </div>
            {frequentActions.slice(0, 3).map((action) => renderActionButton(action))}
          </div>
        )}

        {/* All Actions by Category */}
        <div className="px-3 py-2 space-y-2 border-t">
          {Array.from(groupedActions.entries()).map(([category, actions]) => (
            <div key={category} className="space-y-1">
              <button
                className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded px-2 py-1"
                onClick={() => toggleCategory(category)}
              >
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {getCategoryLabel(category)}
                </span>
                {expandedCategories.has(category) ? (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </button>

              {expandedCategories.has(category) && (
                <div className="space-y-0.5 ml-2">
                  {actions.map((action) => renderActionButton(action))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Macros */}
        {macros.length > 0 && (
          <div className="px-3 py-2 space-y-1 border-t">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Macros
              </span>
              <Workflow className="w-3 h-3 text-purple-500" />
            </div>
            {macros.map((macro) => (
              <div
                key={macro.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 cursor-pointer"
                onClick={() => executeMacro(macro)}
              >
                <Workflow className="w-4 h-4 text-purple-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-700">{macro.name}</span>
                  <span className="text-xs text-gray-500 block">
                    {macro.actions.length} actions
                  </span>
                </div>
              </div>
            ))}

            {actionHistory.length >= 2 && (
              <button
                className="w-full text-xs text-purple-600 hover:text-purple-700 py-1"
                onClick={() => createMacroFromHistory(3)}
              >
                Create macro from recent actions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with tips */}
      <div className="px-3 py-2 bg-gray-50 border-t">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Command className="w-3 h-3" />
          <span>Tip: Use keyboard shortcuts for faster access</span>
        </div>
      </div>
    </div>
  );
}