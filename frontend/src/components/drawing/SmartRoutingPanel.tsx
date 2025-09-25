"use client";

import {
  Route,
  Grid3X3,
  Settings,
  Zap,
  GitBranch,
  CornerDownRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import React, { useState, useCallback } from "react";

import { useSmartRouting, type SmartRoutingOptions } from "@/hooks/useSmartRouting";
import type { RoutingMode } from "@/services/PathfindingService";

interface SmartRoutingPanelProps {
  className?: string;
  visible?: boolean;
  onToggle?: () => void;
}

export default function SmartRoutingPanel({
  className = "",
  visible = true,
  onToggle,
}: SmartRoutingPanelProps): React.JSX.Element | null {
  const { updateRoutingOptions, getRoutingOptions } = useSmartRouting();
  const [options, setOptions] = useState<SmartRoutingOptions>(() => getRoutingOptions());
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOptionChange = useCallback(
    (updates: Partial<SmartRoutingOptions>) => {
      const newOptions = { ...options, ...updates };
      setOptions(newOptions);
      updateRoutingOptions(updates);
    },
    [options, updateRoutingOptions]
  );

  const handleRoutingModeChange = useCallback(
    (mode: RoutingMode) => {
      handleOptionChange({ routingMode: mode });
    },
    [handleOptionChange]
  );

  if (!visible) return null;

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Route className="h-4 w-4" />
            Smart Routing
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            {onToggle && (
              <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Quick Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.autoRoute}
              onChange={(e) => handleOptionChange({ autoRoute: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable Auto-routing</span>
          </label>
        </div>

        {/* Routing Mode Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-xs text-gray-500">Routing Mode</label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "orthogonal", icon: CornerDownRight, label: "Orthogonal" },
              { id: "diagonal", icon: GitBranch, label: "Diagonal" },
              { id: "direct", icon: Zap, label: "Direct" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleRoutingModeChange(mode.id as RoutingMode)}
                className={`flex flex-col items-center justify-center gap-1 rounded p-2 text-xs ${
                  options.routingMode === mode.id
                    ? "border border-blue-300 bg-blue-100 text-blue-700"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                title={mode.label}
              >
                <mode.icon className="h-3 w-3" />
                <span className="text-xs">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            {/* Grid Size */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                <Grid3X3 className="h-3 w-3" />
                Grid Size
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={options.gridSize}
                onChange={(e) => handleOptionChange({ gridSize: Number(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{options.gridSize}px</span>
            </div>

            {/* Obstacle Margin */}
            <div>
              <label className="mb-1 block text-xs text-gray-500">Obstacle Margin</label>
              <input
                type="range"
                min="10"
                max="100"
                value={options.obstacleMargin}
                onChange={(e) => handleOptionChange({ obstacleMargin: Number(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{options.obstacleMargin}px</span>
            </div>

            {/* Heuristic Weight */}
            <div>
              <label className="mb-1 block text-xs text-gray-500">Path Optimization</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={options.weight}
                onChange={(e) => handleOptionChange({ weight: Number(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {options.weight}x {options.weight < 1 ? "(Shorter)" : options.weight > 1 ? "(Faster)" : "(Balanced)"}
              </span>
            </div>

            {/* Allow Diagonal */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.allowDiagonal}
                  onChange={(e) => handleOptionChange({ allowDiagonal: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Allow diagonal paths</span>
              </label>
            </div>

            {/* Reset to Defaults */}
            <div className="pt-2">
              <button
                onClick={() => {
                  const defaultOptions: SmartRoutingOptions = {
                    routingMode: "orthogonal",
                    gridSize: 20,
                    obstacleMargin: 40,
                    allowDiagonal: false,
                    weight: 1.0,
                    autoRoute: true,
                  };
                  setOptions(defaultOptions);
                  updateRoutingOptions(defaultOptions);
                }}
                className="flex items-center justify-center gap-1 rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
              >
                <Settings className="h-3 w-3" />
                Reset to Defaults
              </button>
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="mt-4 rounded bg-blue-50 p-2 text-xs text-blue-700">
          <div className="font-medium mb-1">Current Configuration:</div>
          <div>Mode: {options.routingMode}</div>
          <div>Grid: {options.gridSize}px</div>
          <div>Margin: {options.obstacleMargin}px</div>
        </div>
      </div>
    </div>
  );
}