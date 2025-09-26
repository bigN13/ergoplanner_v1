"use client";

import {
  FileText,
  FolderOpen,
  Save,
  Download,
  ChevronDown,
  Clock,
  // X,
  AlertTriangle,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useFileOperations } from "@/hooks/useFileOperations";
import { useDrawingStore } from "@/store/drawingStore";

export default function FileOperationsToolbar(): React.ReactElement {
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const [showRecentMenu, setShowRecentMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [autoSaveEnabled, _setAutoSaveEnabled] = useState(true);

  const templatesMenuRef = useRef<HTMLDivElement>(null);
  const recentMenuRef = useRef<HTMLDivElement>(null);

  const {
    recentFiles,
    templates,
    showUnsavedChangesDialog,
    handleNew,
    handleOpen,
    handleOpenRecent,
    handleSave,
    handleSaveAs,
    handleUnsavedChangesResponse,
    clearRecentFiles,
    isDirty,
    drawingName,
  } = useFileOperations();

  const { lastSaved } = useDrawingStore();

  // Check viewport size for responsive behavior
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update last save time
  useEffect(() => {
    if (lastSaved) {
      setLastSaveTime(lastSaved);
    }
  }, [lastSaved]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (templatesMenuRef.current && !templatesMenuRef.current.contains(event.target as Node)) {
        setShowTemplatesMenu(false);
      }
      if (recentMenuRef.current && !recentMenuRef.current.contains(event.target as Node)) {
        setShowRecentMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useHotkeys("ctrl+n, cmd+n", (e) => {
    e.preventDefault();
    handleNew();
  });

  useHotkeys("ctrl+o, cmd+o", (e) => {
    e.preventDefault();
    handleOpen();
  });

  useHotkeys("ctrl+s, cmd+s", (e) => {
    e.preventDefault();
    handleSave();
  });

  useHotkeys("ctrl+shift+s, cmd+shift+s", (e) => {
    e.preventDefault();
    handleSaveAs();
  });

  // Format relative time
  const formatRelativeTime = (date: Date | string | null): string => {
    if (!date) return "Never";

    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  return (
    <>
      {/* Toolbar Section */}
      <div className="flex items-center gap-1 border-r border-gray-200 px-2">
        {/* New Button with Template Dropdown */}
        <div className="relative" ref={templatesMenuRef}>
          <button
            onClick={() => handleNew()}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowTemplatesMenu(!showTemplatesMenu);
            }}
            title="New Drawing (Ctrl+N)"
            className="flex items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-100"
          >
            <FileText className="h-4 w-4" />
            {!isMobile && <span>New</span>}
            <ChevronDown
              className="h-3 w-3 cursor-pointer text-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                setShowTemplatesMenu(!showTemplatesMenu);
              }}
            />
          </button>

          {/* Templates Dropdown Menu */}
          {showTemplatesMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="py-1">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      handleNew(template.id);
                      setShowTemplatesMenu(false);
                    }}
                    className="flex w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-gray-100"
                  >
                    <span className="text-sm font-medium">{template.name}</span>
                    {template.description && (
                      <span className="text-xs text-gray-500">{template.description}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Open Button with Recent Files Dropdown */}
        <div className="relative" ref={recentMenuRef}>
          <button
            onClick={() => handleOpen()}
            title="Open File (Ctrl+O)"
            className="flex items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-100"
          >
            <FolderOpen className="h-4 w-4" />
            {!isMobile && <span>Open</span>}
            {recentFiles.length > 0 && (
              <ChevronDown
                className="h-3 w-3 cursor-pointer text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRecentMenu(!showRecentMenu);
                }}
              />
            )}
          </button>

          {/* Recent Files Dropdown Menu */}
          {showRecentMenu && recentFiles.length > 0 && (
            <div className="absolute top-full left-0 z-50 mt-1 max-h-96 w-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                <span className="text-sm font-medium">Recent Files</span>
                <button
                  onClick={clearRecentFiles}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Clear All
                </button>
              </div>
              <div className="py-1">
                {recentFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      handleOpenRecent(file);
                      setShowRecentMenu(false);
                    }}
                    className="flex w-full items-start justify-between px-3 py-2 text-left transition-colors hover:bg-gray-100"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(file.lastOpened)}
                        {file.size && ` • ${formatFileSize(file.size)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          title="Save (Ctrl+S)"
          className="relative flex items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-100"
        >
          <Save className="h-4 w-4" />
          {!isMobile && <span>Save</span>}
          {isDirty && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
          )}
        </button>

        {/* Save As Button */}
        <button
          onClick={handleSaveAs}
          title="Save As (Ctrl+Shift+S)"
          className="flex items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-100"
        >
          <Download className="h-4 w-4" />
          {!isMobile && <span>Save As</span>}
        </button>

        {/* Autosave Indicator */}
        {!isMobile && (
          <div className="flex items-center gap-2 px-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              {autoSaveEnabled ? (
                <>
                  <Clock className="h-3 w-3" />
                  <span>Autosave: On</span>
                </>
              ) : (
                <span>Autosave: Off</span>
              )}
            </div>
            {lastSaveTime && (
              <span className="text-gray-400">Last saved: {formatRelativeTime(lastSaveTime)}</span>
            )}
          </div>
        )}
      </div>

      {/* Unsaved Changes Dialog */}
      {showUnsavedChangesDialog && (
        <div className="bg-opacity-50 fixed inset-0 z-[9999] flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-yellow-500" />
              <div>
                <h3 className="mb-1 text-lg font-semibold">Unsaved Changes</h3>
                <p className="text-sm text-gray-600">
                  You have unsaved changes in &quot;{drawingName || "Untitled Drawing"}&quot;. Do
                  you want to save them before continuing?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleUnsavedChangesResponse(false)}
                className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800"
              >
                Don&apos;t Save
              </button>
              <button
                onClick={() => {
                  handleUnsavedChangesResponse(false);
                  setShowTemplatesMenu(false);
                  setShowRecentMenu(false);
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnsavedChangesResponse(true)}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
