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
      if (
        templatesMenuRef.current &&
        !templatesMenuRef.current.contains(event.target as Node)
      ) {
        setShowTemplatesMenu(false);
      }
      if (
        recentMenuRef.current &&
        !recentMenuRef.current.contains(event.target as Node)
      ) {
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
      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        {/* New Button with Template Dropdown */}
        <div className="relative" ref={templatesMenuRef}>
          <button
            onClick={() => handleNew()}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowTemplatesMenu(!showTemplatesMenu);
            }}
            title="New Drawing (Ctrl+N)"
            className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-4 h-4" />
            {!isMobile && <span>New</span>}
            <ChevronDown
              className="w-3 h-3 text-gray-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowTemplatesMenu(!showTemplatesMenu);
              }}
            />
          </button>

          {/* Templates Dropdown Menu */}
          {showTemplatesMenu && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      handleNew(template.id);
                      setShowTemplatesMenu(false);
                    }}
                    className="flex flex-col items-start w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
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
            className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            {!isMobile && <span>Open</span>}
            {recentFiles.length > 0 && (
              <ChevronDown
                className="w-3 h-3 text-gray-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRecentMenu(!showRecentMenu);
                }}
              />
            )}
          </button>

          {/* Recent Files Dropdown Menu */}
          {showRecentMenu && recentFiles.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
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
                    className="flex items-start justify-between w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
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
          className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors relative"
        >
          <Save className="w-4 h-4" />
          {!isMobile && <span>Save</span>}
          {isDirty && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>

        {/* Save As Button */}
        <button
          onClick={handleSaveAs}
          title="Save As (Ctrl+Shift+S)"
          className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          {!isMobile && <span>Save As</span>}
        </button>

        {/* Autosave Indicator */}
        {!isMobile && (
          <div className="flex items-center gap-2 px-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              {autoSaveEnabled ? (
                <>
                  <Clock className="w-3 h-3" />
                  <span>Autosave: On</span>
                </>
              ) : (
                <span>Autosave: Off</span>
              )}
            </div>
            {lastSaveTime && (
              <span className="text-gray-400">
                Last saved: {formatRelativeTime(lastSaveTime)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Unsaved Changes Dialog */}
      {showUnsavedChangesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Unsaved Changes</h3>
                <p className="text-sm text-gray-600">
                  You have unsaved changes in &quot;{drawingName || "Untitled Drawing"}&quot;.
                  Do you want to save them before continuing?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleUnsavedChangesResponse(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Don&apos;t Save
              </button>
              <button
                onClick={() => {
                  handleUnsavedChangesResponse(false);
                  setShowTemplatesMenu(false);
                  setShowRecentMenu(false);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnsavedChangesResponse(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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