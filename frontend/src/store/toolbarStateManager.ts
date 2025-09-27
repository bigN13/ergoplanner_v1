import type { Node, Edge } from "reactflow";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Types
export type ToolGroup = "file" | "edit" | "view" | "drawing" | "secondary" | "zoom";

export interface ToolState {
  id: string;
  enabled: boolean;
  visible: boolean;
  active: boolean;
  badge?: string | number;
  tooltip?: string;
  customClass?: string;
  metadata?: Record<string, any>;
}

export interface ContextRule {
  toolId: string;
  condition: (context: SelectionContext) => boolean;
  action: "enable" | "disable" | "hide" | "show";
  priority: number;
}

export interface SelectionContext {
  selectedNodes: Node[];
  selectedEdges: Edge[];
  clipboard: any;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  activeLayer?: string;
  zoom: number;
}

export interface ShortcutConfig {
  key: string;
  modifiers?: string[];
  action: () => void;
  description: string;
  group: ToolGroup;
  enabled: boolean;
}

export interface ToolbarConfiguration {
  showLabels: boolean;
  orientation: "horizontal" | "vertical";
  compactMode: boolean;
  theme: "light" | "dark" | "auto";
  animationsEnabled: boolean;
}

export interface CustomToolbar {
  id: string;
  name: string;
  tools: string[];
  position: "top" | "bottom" | "left" | "right" | "floating";
  visible: boolean;
}

export interface ToolGroupConfig {
  id: string;
  name: string;
  tools: string[];
  collapsed: boolean;
  order: number;
}

// Store Interface
interface ToolbarStateManager {
  // Active Tool Management
  activeTool: string;
  previousTool: string | null;
  toolHistory: string[];
  maxHistorySize: number;

  // Tool States
  toolStates: Map<string, ToolState>;

  // Contextual Rules
  contextualRules: Map<string, ContextRule[]>;
  selectionContext: SelectionContext;

  // Keyboard Shortcuts
  shortcuts: Map<string, ShortcutConfig>;
  activeShortcuts: Set<string>;

  // Toolbar Configuration
  toolbarConfig: ToolbarConfiguration;
  customToolbars: CustomToolbar[];

  // Tool Groups
  toolGroups: Map<string, ToolGroupConfig>;
  collapsedGroups: Set<string>;

  // Actions - Tool Management
  setActiveTool: (toolId: string) => void;
  toggleTool: (toolId: string) => void;
  switchToPreviousTool: () => void;
  clearToolHistory: () => void;

  // Actions - Tool State
  setToolState: (toolId: string, state: Partial<ToolState>) => void;
  enableTool: (toolId: string) => void;
  disableTool: (toolId: string) => void;
  showTool: (toolId: string) => void;
  hideTool: (toolId: string) => void;
  setToolBadge: (toolId: string, badge: string | number | undefined) => void;

  // Actions - Context Management
  updateSelectionContext: (context: Partial<SelectionContext>) => void;
  evaluateContextualRules: () => void;
  addContextRule: (rule: ContextRule) => void;
  removeContextRule: (ruleId: string) => void;

  // Actions - Shortcuts
  registerShortcut: (shortcut: ShortcutConfig) => void;
  unregisterShortcut: (key: string) => void;
  enableShortcut: (key: string) => void;
  disableShortcut: (key: string) => void;
  triggerShortcut: (key: string) => void;
  getShortcutsByGroup: (group: ToolGroup) => ShortcutConfig[];

  // Actions - Toolbar Configuration
  updateToolbarConfig: (config: Partial<ToolbarConfiguration>) => void;
  addCustomToolbar: (toolbar: CustomToolbar) => void;
  removeCustomToolbar: (id: string) => void;
  updateCustomToolbar: (id: string, updates: Partial<CustomToolbar>) => void;
  toggleCustomToolbar: (id: string) => void;

  // Actions - Tool Groups
  collapseGroup: (groupId: string) => void;
  expandGroup: (groupId: string) => void;
  toggleGroup: (groupId: string) => void;
  reorderGroup: (groupId: string, newOrder: number) => void;
  addToolToGroup: (groupId: string, toolId: string) => void;
  removeToolFromGroup: (groupId: string, toolId: string) => void;

  // Actions - Persistence
  saveConfiguration: () => void;
  loadConfiguration: () => void;
  resetConfiguration: () => void;
  exportConfiguration: () => string;
  importConfiguration: (config: string) => void;

  // Actions - Tool Usage Analytics
  trackToolUsage: (toolId: string) => void;
  getMostUsedTools: (limit?: number) => string[];
  getToolUsageStats: () => Map<string, number>;
  resetUsageStats: () => void;
}

// Initial State
const initialState = {
  activeTool: "select",
  previousTool: null,
  toolHistory: [],
  maxHistorySize: 50,
  toolStates: new Map(),
  contextualRules: new Map(),
  selectionContext: {
    selectedNodes: [],
    selectedEdges: [],
    clipboard: null,
    canUndo: false,
    canRedo: false,
    historyLength: 0,
    zoom: 1,
  },
  shortcuts: new Map(),
  activeShortcuts: new Set<string>(),
  toolbarConfig: {
    showLabels: true,
    orientation: "horizontal" as const,
    compactMode: false,
    theme: "light" as const,
    animationsEnabled: true,
  },
  customToolbars: [],
  toolGroups: new Map(),
  collapsedGroups: new Set<string>(),
};

// Create Store
export const useToolbarStateManager = create<ToolbarStateManager>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Tool Management
        setActiveTool: (toolId) => {
          const state = get();
          const newHistory = [...state.toolHistory, state.activeTool].slice(-state.maxHistorySize);

          set({
            previousTool: state.activeTool,
            activeTool: toolId,
            toolHistory: newHistory,
          });

          // Track usage
          get().trackToolUsage(toolId);
        },

        toggleTool: (toolId) => {
          const state = get();
          if (state.activeTool === toolId) {
            get().switchToPreviousTool();
          } else {
            get().setActiveTool(toolId);
          }
        },

        switchToPreviousTool: () => {
          const state = get();
          if (state.previousTool) {
            get().setActiveTool(state.previousTool);
          }
        },

        clearToolHistory: () => {
          set({ toolHistory: [], previousTool: null });
        },

        // Tool State Management
        setToolState: (toolId, updates) => {
          const state = get();
          const currentState = state.toolStates.get(toolId) || {
            id: toolId,
            enabled: true,
            visible: true,
            active: false,
          };

          const newToolStates = new Map(state.toolStates);
          newToolStates.set(toolId, { ...currentState, ...updates });

          set({ toolStates: newToolStates });
        },

        enableTool: (toolId) => {
          get().setToolState(toolId, { enabled: true });
        },

        disableTool: (toolId) => {
          get().setToolState(toolId, { enabled: false });
        },

        showTool: (toolId) => {
          get().setToolState(toolId, { visible: true });
        },

        hideTool: (toolId) => {
          get().setToolState(toolId, { visible: false });
        },

        setToolBadge: (toolId, badge) => {
          get().setToolState(toolId, { badge });
        },

        // Context Management
        updateSelectionContext: (context) => {
          const state = get();
          const newContext = { ...state.selectionContext, ...context };
          set({ selectionContext: newContext });

          // Evaluate rules after context update
          get().evaluateContextualRules();
        },

        evaluateContextualRules: () => {
          const state = get();
          const context = state.selectionContext;

          // Group rules by toolId
          const toolRules = new Map<string, ContextRule[]>();

          state.contextualRules.forEach((rules) => {
            rules.forEach((rule) => {
              const existingRules = toolRules.get(rule.toolId) || [];
              toolRules.set(rule.toolId, [...existingRules, rule]);
            });
          });

          // Evaluate rules for each tool
          toolRules.forEach((rules, toolId) => {
            // Sort by priority (higher first)
            rules.sort((a, b) => b.priority - a.priority);

            // Apply first matching rule
            for (const rule of rules) {
              if (rule.condition(context)) {
                switch (rule.action) {
                  case "enable":
                    get().enableTool(toolId);
                    break;
                  case "disable":
                    get().disableTool(toolId);
                    break;
                  case "show":
                    get().showTool(toolId);
                    break;
                  case "hide":
                    get().hideTool(toolId);
                    break;
                }
                break; // Apply only first matching rule
              }
            }
          });
        },

        addContextRule: (rule) => {
          const state = get();
          const rules = state.contextualRules.get(rule.toolId) || [];
          const newRules = new Map(state.contextualRules);
          newRules.set(rule.toolId, [...rules, rule]);
          set({ contextualRules: newRules });
        },

        removeContextRule: (ruleId) => {
          const state = get();
          const newRules = new Map(state.contextualRules);

          newRules.forEach((rules, toolId) => {
            const filtered = rules.filter((r) => `${toolId}-${r.priority}` !== ruleId);
            if (filtered.length > 0) {
              newRules.set(toolId, filtered);
            } else {
              newRules.delete(toolId);
            }
          });

          set({ contextualRules: newRules });
        },

        // Shortcuts
        registerShortcut: (shortcut) => {
          const state = get();
          const newShortcuts = new Map(state.shortcuts);
          newShortcuts.set(shortcut.key, shortcut);
          set({ shortcuts: newShortcuts });
        },

        unregisterShortcut: (key) => {
          const state = get();
          const newShortcuts = new Map(state.shortcuts);
          newShortcuts.delete(key);

          const newActiveShortcuts = new Set(state.activeShortcuts);
          newActiveShortcuts.delete(key);

          set({ shortcuts: newShortcuts, activeShortcuts: newActiveShortcuts });
        },

        enableShortcut: (key) => {
          const state = get();
          const shortcut = state.shortcuts.get(key);
          if (shortcut) {
            shortcut.enabled = true;
            const newShortcuts = new Map(state.shortcuts);
            newShortcuts.set(key, shortcut);

            const newActiveShortcuts = new Set(state.activeShortcuts);
            newActiveShortcuts.add(key);

            set({ shortcuts: newShortcuts, activeShortcuts: newActiveShortcuts });
          }
        },

        disableShortcut: (key) => {
          const state = get();
          const shortcut = state.shortcuts.get(key);
          if (shortcut) {
            shortcut.enabled = false;
            const newShortcuts = new Map(state.shortcuts);
            newShortcuts.set(key, shortcut);

            const newActiveShortcuts = new Set(state.activeShortcuts);
            newActiveShortcuts.delete(key);

            set({ shortcuts: newShortcuts, activeShortcuts: newActiveShortcuts });
          }
        },

        triggerShortcut: (key) => {
          const state = get();
          const shortcut = state.shortcuts.get(key);
          if (shortcut?.enabled) {
            shortcut.action();
          }
        },

        getShortcutsByGroup: (group) => {
          const state = get();
          const shortcuts: ShortcutConfig[] = [];

          state.shortcuts.forEach((shortcut) => {
            if (shortcut.group === group) {
              shortcuts.push(shortcut);
            }
          });

          return shortcuts;
        },

        // Toolbar Configuration
        updateToolbarConfig: (config) => {
          const state = get();
          set({ toolbarConfig: { ...state.toolbarConfig, ...config } });
        },

        addCustomToolbar: (toolbar) => {
          const state = get();
          set({ customToolbars: [...state.customToolbars, toolbar] });
        },

        removeCustomToolbar: (id) => {
          const state = get();
          set({ customToolbars: state.customToolbars.filter((t) => t.id !== id) });
        },

        updateCustomToolbar: (id, updates) => {
          const state = get();
          set({
            customToolbars: state.customToolbars.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          });
        },

        toggleCustomToolbar: (id) => {
          const state = get();
          get().updateCustomToolbar(id, {
            visible: !state.customToolbars.find((t) => t.id === id)?.visible,
          });
        },

        // Tool Groups
        collapseGroup: (groupId) => {
          const state = get();
          const newCollapsed = new Set(state.collapsedGroups);
          newCollapsed.add(groupId);
          set({ collapsedGroups: newCollapsed });
        },

        expandGroup: (groupId) => {
          const state = get();
          const newCollapsed = new Set(state.collapsedGroups);
          newCollapsed.delete(groupId);
          set({ collapsedGroups: newCollapsed });
        },

        toggleGroup: (groupId) => {
          const state = get();
          if (state.collapsedGroups.has(groupId)) {
            get().expandGroup(groupId);
          } else {
            get().collapseGroup(groupId);
          }
        },

        reorderGroup: (groupId, newOrder) => {
          const state = get();
          const group = state.toolGroups.get(groupId);
          if (group) {
            const newGroups = new Map(state.toolGroups);
            newGroups.set(groupId, { ...group, order: newOrder });
            set({ toolGroups: newGroups });
          }
        },

        addToolToGroup: (groupId, toolId) => {
          const state = get();
          const group = state.toolGroups.get(groupId);
          if (group && !group.tools.includes(toolId)) {
            const newGroups = new Map(state.toolGroups);
            newGroups.set(groupId, { ...group, tools: [...group.tools, toolId] });
            set({ toolGroups: newGroups });
          }
        },

        removeToolFromGroup: (groupId, toolId) => {
          const state = get();
          const group = state.toolGroups.get(groupId);
          if (group) {
            const newGroups = new Map(state.toolGroups);
            newGroups.set(groupId, {
              ...group,
              tools: group.tools.filter((t) => t !== toolId),
            });
            set({ toolGroups: newGroups });
          }
        },

        // Persistence
        saveConfiguration: () => {
          // Configuration is automatically saved by persist middleware
        },

        loadConfiguration: () => {
          // Configuration is automatically loaded by persist middleware
        },

        resetConfiguration: () => {
          set(initialState);
        },

        exportConfiguration: () => {
          const state = get();
          return JSON.stringify({
            toolbarConfig: state.toolbarConfig,
            customToolbars: state.customToolbars,
            toolGroups: Array.from(state.toolGroups.entries()),
            shortcuts: Array.from(state.shortcuts.entries()),
          });
        },

        importConfiguration: (config) => {
          try {
            const parsed = JSON.parse(config);
            set({
              toolbarConfig: parsed.toolbarConfig || initialState.toolbarConfig,
              customToolbars: parsed.customToolbars || [],
              toolGroups: new Map(parsed.toolGroups || []),
              shortcuts: new Map(parsed.shortcuts || []),
            });
          } catch (error) {
            console.error("Failed to import configuration:", error);
          }
        },

        // Tool Usage Analytics
        trackToolUsage: (toolId) => {
          // Implementation would track usage in localStorage or analytics service
          const usageKey = `tool-usage-${toolId}`;
          const currentUsage = parseInt(localStorage.getItem(usageKey) || "0", 10);
          localStorage.setItem(usageKey, String(currentUsage + 1));
        },

        getMostUsedTools: (limit = 10) => {
          const stats = get().getToolUsageStats();
          const sorted = Array.from(stats.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([toolId]) => toolId);
          return sorted;
        },

        getToolUsageStats: () => {
          const stats = new Map<string, number>();
          const keys = Object.keys(localStorage).filter((k) => k.startsWith("tool-usage-"));

          keys.forEach((key) => {
            const toolId = key.replace("tool-usage-", "");
            const usage = parseInt(localStorage.getItem(key) || "0", 10);
            stats.set(toolId, usage);
          });

          return stats;
        },

        resetUsageStats: () => {
          const keys = Object.keys(localStorage).filter((k) => k.startsWith("tool-usage-"));
          keys.forEach((key) => localStorage.removeItem(key));
        },
      }),
      {
        name: "toolbar-state",
        partialize: (state) => ({
          toolbarConfig: state.toolbarConfig,
          customToolbars: state.customToolbars,
        }),
      }
    )
  )
);

// Helper hooks
export const useActiveTool = () => useToolbarStateManager((state) => state.activeTool);
export const useToolState = (toolId: string) =>
  useToolbarStateManager((state) => state.toolStates.get(toolId));
export const useToolbarConfig = () => useToolbarStateManager((state) => state.toolbarConfig);
export const useToolShortcuts = (group?: ToolGroup) =>
  useToolbarStateManager((state) =>
    group ? state.getShortcutsByGroup(group) : Array.from(state.shortcuts.values())
  );