"use client";

import { Plus, Minus, ChevronDown, Check } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useReactFlow } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

// Zoom presets matching draw.io exactly
const ZOOM_PRESETS = [
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
  { value: 150, label: "150%" },
  { value: 200, label: "200%" },
  { value: 400, label: "400%" },
];

const SPECIAL_ACTIONS = [
  { id: "fit-screen", label: "Fit to Screen" },
  { id: "fit-selection", label: "Fit Selection" },
  { id: "actual-size", label: "Actual Size" },
];

interface ZoomControlsToolbarProps {
  className?: string;
}

export default function ZoomControlsToolbar({
  className = "",
}: ZoomControlsToolbarProps): React.JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customZoomInput, setCustomZoomInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getZoom, setViewport, getViewport, fitView, getNodes } = useReactFlow();
  const { setZoom } = useDrawingStore();

  // Sync current zoom level from ReactFlow
  const currentZoom = Math.round(getZoom() * 100);

  // Update store zoom when ReactFlow zoom changes
  useEffect(() => {
    setZoom(currentZoom);
  }, [currentZoom, setZoom]);

  // Initialize custom input with current zoom
  useEffect(() => {
    if (!isEditing) {
      setCustomZoomInput(currentZoom.toString());
    }
  }, [currentZoom, isEditing]);

  // Set specific zoom level with smooth animation
  const setZoomLevel = useCallback(
    (percentage: number): void => {
      const clampedZoom = Math.min(5000, Math.max(10, percentage));
      const viewport = getViewport();
      setViewport(
        {
          x: viewport.x,
          y: viewport.y,
          zoom: clampedZoom / 100,
        },
        { duration: 200 }
      );
    },
    [getViewport, setViewport]
  );

  // Handle zoom increment (+ button)
  const handleZoomIn = useCallback((): void => {
    const newZoom = Math.min(5000, currentZoom + 10);
    setZoomLevel(newZoom);
  }, [currentZoom, setZoomLevel]);

  // Handle zoom decrement (- button)
  const handleZoomOut = useCallback((): void => {
    const newZoom = Math.max(10, currentZoom - 10);
    setZoomLevel(newZoom);
  }, [currentZoom, setZoomLevel]);

  // Handle custom zoom input validation and application
  const applyCustomZoom = useCallback((): void => {
    const value = parseInt(customZoomInput, 10);
    if (!isNaN(value) && value >= 10 && value <= 5000) {
      setZoomLevel(value);
    } else {
      // Reset to current zoom if invalid
      setCustomZoomInput(currentZoom.toString());
    }
    setIsEditing(false);
  }, [customZoomInput, currentZoom, setZoomLevel]);

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (percentage: number): void => {
      setZoomLevel(percentage);
      setIsDropdownOpen(false);
    },
    [setZoomLevel]
  );

  // Handle special actions
  const handleSpecialAction = useCallback(
    (actionId: string): void => {
      switch (actionId) {
        case "fit-screen":
          fitView({ padding: 0.1, duration: 200 });
          break;
        case "fit-selection": {
          const selectedNodes = getNodes().filter((node) => node.selected);
          if (selectedNodes.length > 0) {
            // Calculate bounds of selected nodes
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            selectedNodes.forEach((node) => {
              const nodeX = node.position.x;
              const nodeY = node.position.y;
              const nodeWidth = node.width || 100;
              const nodeHeight = node.height || 100;

              minX = Math.min(minX, nodeX);
              minY = Math.min(minY, nodeY);
              maxX = Math.max(maxX, nodeX + nodeWidth);
              maxY = Math.max(maxY, nodeY + nodeHeight);
            });

            const bounds = {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
            };

            // Use fitBounds equivalent with setViewport
            const padding = 0.2;
            const containerWidth = window.innerWidth * 0.7; // Approximate canvas width
            const containerHeight = window.innerHeight * 0.7; // Approximate canvas height

            const scaleX = containerWidth / (bounds.width * (1 + padding));
            const scaleY = containerHeight / (bounds.height * (1 + padding));
            const scale = Math.min(scaleX, scaleY, 5000 / 100); // Max zoom 5000%

            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;

            setViewport(
              {
                x: containerWidth / 2 - centerX * scale,
                y: containerHeight / 2 - centerY * scale,
                zoom: scale,
              },
              { duration: 200 }
            );
          }
          break;
        }
        case "actual-size":
          setZoomLevel(100);
          break;
      }
      setIsDropdownOpen(false);
    },
    [fitView, getNodes, setViewport, setZoomLevel]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "0":
            event.preventDefault();
            fitView({ padding: 0.1, duration: 200 });
            break;
          case "1":
            event.preventDefault();
            setZoomLevel(100);
            break;
          case "+":
          case "=":
            event.preventDefault();
            handleZoomIn();
            break;
          case "-":
            event.preventDefault();
            handleZoomOut();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fitView, setZoomLevel, handleZoomIn, handleZoomOut]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }

    return undefined;
  }, [isDropdownOpen]);

  // Check if current zoom matches any preset
  const currentPreset = ZOOM_PRESETS.find((preset) => preset.value === currentZoom);

  return (
    <div className={`flex items-center space-x-1 border-r border-gray-300 pr-2 ${className}`}>
      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        disabled={currentZoom <= 10}
        className="rounded p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="Zoom Out (Ctrl+-)"
      >
        <Minus className="h-4 w-4" />
      </button>

      {/* Editable Zoom Percentage Field */}
      <div className="relative">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={customZoomInput}
            onChange={(e): void => setCustomZoomInput(e.target.value)}
            onBlur={applyCustomZoom}
            onKeyDown={(e): void => {
              if (e.key === "Enter") {
                applyCustomZoom();
              } else if (e.key === "Escape") {
                setCustomZoomInput(currentZoom.toString());
                setIsEditing(false);
              }
            }}
            className="w-14 rounded border border-blue-500 px-1 py-0.5 text-center text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
            min="10"
            max="5000"
            autoFocus
            onFocus={(e): void => e.target.select()}
          />
        ) : (
          <button
            onClick={(): void => setIsEditing(true)}
            className="w-14 rounded border border-gray-300 px-1 py-0.5 text-center text-sm hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            title="Click to edit zoom level"
          >
            {currentZoom}
          </button>
        )}
        <span className="pointer-events-none absolute top-1/2 -right-2 -translate-y-1/2 transform text-sm text-gray-500">
          %
        </span>
      </div>

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        disabled={currentZoom >= 5000}
        className="rounded p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="Zoom In (Ctrl++)"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Zoom Presets Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(): void => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center rounded p-1.5 hover:bg-gray-100"
          title="Zoom presets and special actions"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 z-50 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white shadow-lg">
            {/* Zoom Presets */}
            <div className="py-1">
              <div className="border-b border-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                Zoom Level
              </div>
              {ZOOM_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={(): void => handlePresetSelect(preset.value)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <span>{preset.label}</span>
                  {currentPreset?.value === preset.value && (
                    <Check className="h-3 w-3 text-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100" />

            {/* Special Actions */}
            <div className="py-1">
              <div className="border-b border-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                Actions
              </div>
              {SPECIAL_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={(): void => handleSpecialAction(action.id)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
