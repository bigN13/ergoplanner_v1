"use client";

import { Save, Cloud, CloudOff, AlertCircle, CheckCircle, Clock } from "lucide-react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import type { ReactElement } from "react";

import { useDrawingStore } from "@/store/drawingStore";

interface AutoSaveData {
  id: string;
  timestamp: string;
  nodes: unknown[];
  edges: unknown[];
  metadata: {
    drawingName: string;
    version: string;
    userAgent: string;
    sessionId: string;
  };
}

interface AutoSaveManagerProps {
  enabled?: boolean;
  interval?: number; // milliseconds
  maxAutoSaves?: number;
  onSave?: (data: AutoSaveData) => Promise<void>;
  onRestore?: (data: AutoSaveData) => void;
}

export default function AutoSaveManager({
  enabled = true,
  interval = 30000, // 30 seconds
  maxAutoSaves = 10,
  onSave,
  onRestore,
}: AutoSaveManagerProps): ReactElement {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [autoSaves, setAutoSaves] = useState<AutoSaveData[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<string>("");

  const { nodes, edges, drawingName, addToHistory } = useDrawingStore();

  // Monitor online status
  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load existing auto-saves from localStorage
  useEffect(() => {
    const loadAutoSaves = (): void => {
      try {
        const saved = localStorage.getItem("ergoplanner-autosaves");
        if (saved) {
          const parsedSaves = JSON.parse(saved);
          setAutoSaves(parsedSaves);
        }
      } catch (error) {
        console.error("Failed to load auto-saves:", error);
      }
    };

    loadAutoSaves();
  }, []);

  // Create auto-save data
  const createAutoSaveData = useCallback((): AutoSaveData => {
    return {
      id: `autosave-${Date.now()}`,
      timestamp: new Date().toISOString(),
      nodes: [...nodes],
      edges: [...edges],
      metadata: {
        drawingName: drawingName || "Untitled Drawing",
        version: "1.0.0",
        userAgent: navigator.userAgent,
        sessionId,
      },
    };
  }, [nodes, edges, drawingName, sessionId]);

  // Save auto-save data
  const saveAutoSave = useCallback(
    async (data: AutoSaveData) => {
      try {
        // Save to localStorage
        const updatedAutoSaves = [data, ...autoSaves.slice(0, maxAutoSaves - 1)];
        localStorage.setItem("ergoplanner-autosaves", JSON.stringify(updatedAutoSaves));
        setAutoSaves(updatedAutoSaves);

        // Save to external storage if provided
        if (onSave) {
          await onSave(data);
        }

        setLastSaveTime(new Date());
        setSaveStatus("saved");
        setHasUnsavedChanges(false);

        // Auto-save completed successfully
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus("error");
      }
    },
    [autoSaves, maxAutoSaves, onSave]
  );

  // Perform auto-save
  const performAutoSave = useCallback(async () => {
    if (!enabled || saveStatus === "saving") return;

    // Check if data has changed
    const currentData = JSON.stringify({ nodes, edges, drawingName });
    if (currentData === lastSaveDataRef.current) {
      return; // No changes to save
    }

    setSaveStatus("saving");

    try {
      const autoSaveData = createAutoSaveData();
      await saveAutoSave(autoSaveData);
      lastSaveDataRef.current = currentData;
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [enabled, saveStatus, nodes, edges, drawingName, createAutoSaveData, saveAutoSave]);

  // Manual save
  const manualSave = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);

  // Restore from auto-save
  const restoreFromAutoSave = useCallback(
    (autoSave: AutoSaveData) => {
      if (onRestore) {
        onRestore(autoSave);
      } else {
        // Default restore behavior
        useDrawingStore.getState().setNodes(autoSave.nodes);
        useDrawingStore.getState().setEdges(autoSave.edges);
        useDrawingStore.getState().setDrawingName(autoSave.metadata.drawingName);
        addToHistory();
      }
      setHasUnsavedChanges(false);
    },
    [onRestore, addToHistory]
  );

  // Delete auto-save
  const deleteAutoSave = useCallback(
    (id: string) => {
      const updatedAutoSaves = autoSaves.filter((save) => save.id !== id);
      setAutoSaves(updatedAutoSaves);
      localStorage.setItem("ergoplanner-autosaves", JSON.stringify(updatedAutoSaves));
    },
    [autoSaves]
  );

  // Clear all auto-saves
  const clearAllAutoSaves = useCallback(() => {
    setAutoSaves([]);
    localStorage.removeItem("ergoplanner-autosaves");
  }, []);

  // Monitor changes to trigger auto-save
  useEffect(() => {
    setHasUnsavedChanges(true);

    // Reset status after a brief moment
    if (saveStatus === "saved") {
      const timer = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, drawingName, saveStatus]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      if (hasUnsavedChanges && isOnline) {
        performAutoSave();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, hasUnsavedChanges, isOnline, performAutoSave]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Render status indicator
  const renderStatusIndicator = (): ReactElement => {
    const getStatusIcon = (): ReactElement => {
      if (!isOnline) return <CloudOff className="h-4 w-4 text-gray-400" />;

      switch (saveStatus) {
        case "saving":
          return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
        case "saved":
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "error":
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
          return hasUnsavedChanges ? (
            <Cloud className="h-4 w-4 text-yellow-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          );
      }
    };

    const getStatusText = (): string => {
      if (!isOnline) return "Offline";

      switch (saveStatus) {
        case "saving":
          return "Saving...";
        case "saved":
          return "Saved";
        case "error":
          return "Save failed";
        default:
          return hasUnsavedChanges ? "Unsaved changes" : "Up to date";
      }
    };

    return (
      <div className="flex items-center gap-2 text-xs">
        {getStatusIcon()}
        <span
          className={` ${!isOnline ? "text-gray-400" : ""} ${saveStatus === "saving" ? "text-blue-600" : ""} ${saveStatus === "saved" ? "text-green-600" : ""} ${saveStatus === "error" ? "text-red-600" : ""} ${hasUnsavedChanges && isOnline && saveStatus === "idle" ? "text-yellow-600" : ""} `}
        >
          {getStatusText()}
        </span>
      </div>
    );
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Auto-Save</h3>
          {renderStatusIndicator()}
        </div>

        <div className="space-y-2">
          <button
            onClick={manualSave}
            disabled={saveStatus === "saving" || !hasUnsavedChanges}
            className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            {saveStatus === "saving" ? "Saving..." : "Save Now"}
          </button>

          {lastSaveTime && (
            <p className="text-center text-xs text-gray-500">
              Last saved: {lastSaveTime.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-600">Auto-saves ({autoSaves.length})</h4>
          {autoSaves.length > 0 && (
            <button onClick={clearAllAutoSaves} className="text-xs text-red-600 hover:text-red-700">
              Clear All
            </button>
          )}
        </div>

        <div className="max-h-48 space-y-2 overflow-y-auto">
          {autoSaves.length === 0 ? (
            <p className="py-2 text-center text-xs text-gray-400 italic">No auto-saves available</p>
          ) : (
            autoSaves.map((autoSave) => (
              <div
                key={autoSave.id}
                className="flex items-center justify-between rounded bg-gray-50 p-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{autoSave.metadata.drawingName}</p>
                  <p className="text-gray-500">{formatRelativeTime(autoSave.timestamp)}</p>
                  <p className="text-gray-400">
                    {autoSave.nodes.length} symbols, {autoSave.edges.length} connections
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => restoreFromAutoSave(autoSave)}
                    className="rounded bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => deleteAutoSave(autoSave.id)}
                    className="px-1 text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isOnline && (
          <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-700">
            <div className="flex items-center gap-2">
              <CloudOff className="h-3 w-3" />
              <span>You&apos;re offline. Auto-saves are stored locally.</span>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          <p>Auto-save interval: {interval / 1000}s</p>
          <p>Max auto-saves: {maxAutoSaves}</p>
        </div>
      </div>
    </div>
  );
}
