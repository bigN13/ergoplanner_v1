"use client";

import { useCallback, useEffect, useState } from "react";

import { useDrawingStore } from "@/store/drawingStore";

export interface Template {
  id: string;
  name: string;
  description?: string;
  nodes: unknown[];
  edges: unknown[];
}

export interface RecentFile {
  id: string;
  name: string;
  lastOpened: string;
  savedAt?: string;
  size?: number;
}

const MAX_RECENT_FILES = 10;
const RECENT_FILES_KEY = "ergoplanner-recent-files";
const TEMPLATES_KEY = "ergoplanner-templates";

// Default templates
const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Blank P&ID",
    description: "Start with an empty canvas",
    nodes: [],
    edges: [],
  },
  {
    id: "water-treatment",
    name: "Water Treatment Plant",
    description: "Basic water treatment plant layout",
    nodes: [],
    edges: [],
  },
  {
    id: "pumping-station",
    name: "Pumping Station",
    description: "Standard pumping station configuration",
    nodes: [],
    edges: [],
  },
  {
    id: "distribution-network",
    name: "Distribution Network",
    description: "Water distribution network template",
    nodes: [],
    edges: [],
  },
];

export function useFileOperations(): {
  recentFiles: RecentFile[];
  templates: Template[];
  showUnsavedChangesDialog: boolean;
  handleNew: (templateId?: string) => void;
  handleOpen: (file?: File) => void;
  handleOpenRecent: (recentFile: RecentFile) => void;
  handleSave: () => void;
  handleSaveAs: () => void;
  handleExport: (format: "json" | "svg" | "png") => Promise<void>;
  handleUnsavedChangesResponse: (save: boolean) => void;
  clearRecentFiles: () => void;
  isDirty: boolean;
  drawingName: string;
  nodes: unknown[];
  edges: unknown[];
} {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const {
    drawingId,
    drawingName,
    isDirty,
    nodes,
    edges,
    newDrawing,
    saveDrawing,
    loadDrawing,
    exportDrawing,
    setNodes,
    setEdges,
    setDrawingName,
    // markClean,
  } = useDrawingStore();

  // Load recent files from localStorage
  useEffect(() => {
    const loadRecentFiles = (): void => {
      try {
        const stored = localStorage.getItem(RECENT_FILES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecentFiles(parsed.slice(0, MAX_RECENT_FILES));
        }
      } catch (error) {
        console.error("Failed to load recent files:", error);
      }
    };

    loadRecentFiles();
  }, []);

  // Load custom templates if any
  useEffect(() => {
    const loadTemplates = (): void => {
      try {
        const stored = localStorage.getItem(TEMPLATES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setTemplates([...DEFAULT_TEMPLATES, ...parsed]);
        }
      } catch (error) {
        console.error("Failed to load templates:", error);
      }
    };

    loadTemplates();
  }, []);

  // Add to recent files
  const addToRecentFiles = useCallback(
    (file: Omit<RecentFile, "lastOpened">) => {
      const newRecentFile: RecentFile = {
        ...file,
        lastOpened: new Date().toISOString(),
      };

      const updated = [
        newRecentFile,
        ...recentFiles.filter((f) => f.id !== file.id),
      ].slice(0, MAX_RECENT_FILES);

      setRecentFiles(updated);
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
    },
    [recentFiles]
  );

  // Check for unsaved changes
  const checkUnsavedChanges = useCallback(
    (action: () => void) => {
      if (isDirty) {
        setShowUnsavedChangesDialog(true);
        setPendingAction(() => action);
      } else {
        action();
      }
    },
    [isDirty]
  );

  // Handle new drawing with template
  const handleNew = useCallback(
    (templateId?: string) => {
      const action = (): void => {
        if (templateId) {
          const template = templates.find((t) => t.id === templateId);
          if (template) {
            newDrawing();
            setNodes(template.nodes);
            setEdges(template.edges);
            setDrawingName(`New ${template.name}`);
          }
        } else {
          newDrawing();
        }
      };

      checkUnsavedChanges(action);
    },
    [templates, newDrawing, setNodes, setEdges, setDrawingName, checkUnsavedChanges]
  );

  // Handle open file
  const handleOpen = useCallback<(file?: File) => void>(
    (file) => {
      const action = (): void => {
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              loadDrawing(content);
              addToRecentFiles({
                id: `file-${Date.now()}`,
                name: file.name,
                size: file.size,
              });
            } catch (error) {
              console.error("Failed to load file:", error);
            }
          };
          reader.readAsText(file);
        } else {
          // Open file dialog
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json,.dwg,.dxf";
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files?.[0]) {
              handleOpen(target.files[0]);
            }
          };
          input.click();
        }
      };

      if (file) {
        checkUnsavedChanges(action);
      } else {
        action();
      }
    },
    [loadDrawing, addToRecentFiles, checkUnsavedChanges]
  );

  // Handle open recent
  const handleOpenRecent = useCallback<(recentFile: RecentFile) => void>(
    (recentFile) => {
      const action = (): void => {
        loadDrawing(recentFile.id);
        addToRecentFiles(recentFile);
      };

      checkUnsavedChanges(action);
    },
    [loadDrawing, addToRecentFiles, checkUnsavedChanges]
  );

  // Handle save
  const handleSave = useCallback(() => {
    saveDrawing();
    if (drawingId && drawingName) {
      addToRecentFiles({
        id: drawingId,
        name: drawingName,
        savedAt: new Date().toISOString(),
      });
    }
  }, [saveDrawing, drawingId, drawingName, addToRecentFiles]);

  // Handle save as
  const handleSaveAs = useCallback<() => void>(() => {
    // TODO: Replace with proper dialog
    // eslint-disable-next-line no-alert
    const name = window.prompt("Save as:", drawingName || "Untitled Drawing");
    if (name) {
      setDrawingName(name);
      saveDrawing();
      if (drawingId) {
        addToRecentFiles({
          id: drawingId,
          name,
          savedAt: new Date().toISOString(),
        });
      }
    }
  }, [drawingName, setDrawingName, saveDrawing, drawingId, addToRecentFiles]);

  // Handle export
  const handleExport = useCallback(
    async (format: "json" | "svg" | "png") => {
      await exportDrawing(format);
    },
    [exportDrawing]
  );

  // Handle unsaved changes dialog
  const handleUnsavedChangesResponse = useCallback(
    (save: boolean) => {
      if (save) {
        handleSave();
      }
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      setShowUnsavedChangesDialog(false);
    },
    [handleSave, pendingAction]
  );

  // Clear recent files
  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    localStorage.removeItem(RECENT_FILES_KEY);
  }, []);

  return {
    recentFiles,
    templates,
    showUnsavedChangesDialog,
    handleNew,
    handleOpen,
    handleOpenRecent,
    handleSave,
    handleSaveAs,
    handleExport,
    handleUnsavedChangesResponse,
    clearRecentFiles,
    isDirty,
    drawingName,
    nodes,
    edges,
  };
}