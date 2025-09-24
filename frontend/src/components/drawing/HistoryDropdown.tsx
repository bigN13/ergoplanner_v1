"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Move,
  ArrowRight,
  Palette,
  Layout,
  Layers,
  MousePointer,
  Command,
  Clock,
} from "lucide-react";
import { CommandType } from "@/types/commands";
import type { HistoryEntry } from "@/types/commands";

interface HistoryDropdownProps {
  historyEntries: HistoryEntry[];
  currentIndex: number;
  onJumpToIndex: (index: number) => void;
  disabled?: boolean;
  isUndo?: boolean; // true for undo dropdown, false for redo
}

// Helper function to get the appropriate icon component for a command type
const getIconComponent = (iconName: string, className = "h-3 w-3") => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    plus: Plus,
    "trash-2": Trash2,
    move: Move,
    "arrow-right": ArrowRight,
    palette: Palette,
    layout: Layout,
    layers: Layers,
    "mouse-pointer": MousePointer,
    command: Command,
  };

  const IconComponent = iconMap[iconName] || Command;
  return <IconComponent className={className} />;
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return timestamp.toLocaleDateString();
};

// Helper function to get command type color
const getCommandTypeColor = (type: CommandType): string => {
  switch (type) {
    case CommandType.NODE:
      return "text-blue-600";
    case CommandType.EDGE:
      return "text-green-600";
    case CommandType.SELECTION:
      return "text-purple-600";
    case CommandType.TRANSFORM:
      return "text-orange-600";
    case CommandType.FORMAT:
      return "text-pink-600";
    case CommandType.LAYOUT:
      return "text-indigo-600";
    case CommandType.COMPOSITE:
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export default function HistoryDropdown({
  historyEntries,
  currentIndex,
  onJumpToIndex,
  disabled = false,
  isUndo = true,
}: HistoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get relevant entries based on whether this is undo or redo dropdown
  const relevantEntries = isUndo
    ? historyEntries.slice(0, currentIndex + 1).reverse() // Undo: show executed commands in reverse order
    : historyEntries.slice(currentIndex + 1); // Redo: show future commands

  const hasEntries = relevantEntries.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredIndex(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleEntryClick = (entry: HistoryEntry, entryIndex: number) => {
    const targetIndex = isUndo
      ? currentIndex - entryIndex - 1
      : currentIndex + entryIndex + 1;

    onJumpToIndex(targetIndex);
    setIsOpen(false);
    setHoveredIndex(null);
  };

  const getPreviewText = () => {
    if (!hasEntries) return "No actions to " + (isUndo ? "undo" : "redo");

    const count = hoveredIndex !== null ? hoveredIndex + 1 : 1;
    const action = isUndo ? "Undo" : "Redo";
    const plural = count > 1 ? "actions" : "action";

    return `${action} ${count} ${plural}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        onClick={() => !disabled && hasEntries && setIsOpen(!isOpen)}
        onMouseEnter={() => !disabled && hasEntries && setIsOpen(true)}
        disabled={disabled || !hasEntries}
        className={`
          ml-0.5 p-1 rounded transition-colors
          ${disabled || !hasEntries
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }
        `}
        title={getPreviewText()}
      >
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Dropdown menu */}
      {isOpen && hasEntries && (
        <div className={`
          absolute ${isUndo ? "right-0" : "left-0"} top-full mt-1
          w-80 max-h-96 overflow-y-auto
          bg-white border border-gray-200 rounded-lg shadow-lg
          z-50
        `}>
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm text-gray-700">
                  Command History
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {relevantEntries.length} {relevantEntries.length === 1 ? "action" : "actions"}
              </span>
            </div>
          </div>

          {/* History entries */}
          <div className="py-1">
            {relevantEntries.map((entry, index) => {
              const isHovered = hoveredIndex === index;
              const willBeAffected = hoveredIndex !== null && index <= hoveredIndex;

              return (
                <button
                  key={entry.id}
                  onClick={() => handleEntryClick(entry, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    w-full px-3 py-2 text-left transition-colors
                    flex items-center space-x-3
                    ${willBeAffected
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                    }
                  `}
                >
                  {/* Command icon */}
                  <div className={`
                    flex-shrink-0 p-1.5 rounded
                    ${willBeAffected ? "bg-blue-100" : "bg-gray-100"}
                  `}>
                    <div className={getCommandTypeColor(entry.type)}>
                      {getIconComponent(entry.icon || "command", "h-3 w-3")}
                    </div>
                  </div>

                  {/* Command details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`
                        font-medium text-sm truncate
                        ${willBeAffected ? "text-blue-900" : "text-gray-900"}
                      `}>
                        {entry.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <p className={`
                      text-xs truncate
                      ${willBeAffected ? "text-blue-700" : "text-gray-600"}
                    `}>
                      {entry.description}
                    </p>
                  </div>

                  {/* Step indicator */}
                  <div className="flex-shrink-0">
                    <span className={`
                      text-xs px-1.5 py-0.5 rounded
                      ${willBeAffected
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-600"
                      }
                    `}>
                      {index + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with preview */}
          {hoveredIndex !== null && (
            <div className="px-3 py-2 border-t border-gray-200 bg-blue-50">
              <p className="text-xs text-blue-800 font-medium">
                {getPreviewText()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}