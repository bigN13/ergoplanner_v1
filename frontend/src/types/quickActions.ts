export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  category: string;
  shortcut?: string;
  action: () => void;
  isContextual?: boolean;
  requiredContext?: Partial<ActionContext>;
}

export interface ActionContext {
  selectedNodes: string[];
  selectedEdges: string[];
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
}

export interface ActionMacro {
  id: string;
  name: string;
  description?: string;
  actions: QuickAction[];
  icon?: string;
}