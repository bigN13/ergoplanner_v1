export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  category: string;
  shortcut?: string;
  execute: () => void;
  canExecute?: () => boolean;
  isContextual?: boolean;
  requiredContext?: Partial<DrawingActionContext>;
}

export type ActionContext =
  | "no-selection"
  | "single-node"
  | "multiple-nodes"
  | "single-edge"
  | "multiple-edges"
  | "mixed-selection";

export interface DrawingActionContext {
  selectedNodes: string[];
  selectedEdges: string[];
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
}

export interface ActionSuggestion {
  actionId: string;
  reason: string;
  priority?: number;
}

export interface ActionMacro {
  id: string;
  name: string;
  description?: string;
  actions: QuickAction[];
  icon?: string;
}