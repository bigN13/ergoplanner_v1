"use client";

import {
  MousePointer,
  Move,
  Crosshair,
  Zap,
  Layers,
  Grid3x3,
  Ruler,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Users,
  Eye,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useReactFlow } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

interface StatusBarProps {
  className?: string;
  tool?: string;
  mousePosition?: { x: number; y: number };
  selectedCount?: number;
  isOnline?: boolean;
  collaborators?: number;
  showPerformanceMetrics?: boolean;
}

export default function StatusBar({
  className = "",
  tool = "select",
  mousePosition = { x: 0, y: 0 },
  selectedCount = 0,
  isOnline = true,
  collaborators = 0,
  showPerformanceMetrics = false,
}: StatusBarProps) {
  const [fps, setFps] = useState(60);
  const [renderTime, setRenderTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  const { getZoom, getViewport } = useReactFlow();
  const {
    nodes,
    edges,
    isGridVisible,
    snapToGrid,
    gridSize,
    canUndo,
    canRedo,
    currentHistoryIndex,
    history,
  } = useDrawingStore();

  // Performance monitoring
  useEffect(() => {
    if (!showPerformanceMetrics) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const updateFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(updateFPS);
    };

    updateFPS();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [showPerformanceMetrics]);

  // Memory usage monitoring
  useEffect(() => {
    if (!showPerformanceMetrics || !(performance as any).memory) return;

    const updateMemoryUsage = () => {
      const { memory } = performance as any;
      setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024));
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, [showPerformanceMetrics]);

  // Update timestamp when data changes
  useEffect(() => {
    setLastUpdateTime(new Date());
  }, [nodes, edges]);

  const zoom = getZoom();
  const viewport = getViewport();

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case "select":
        return <MousePointer className="h-3 w-3" />;
      case "pan":
        return <Move className="h-3 w-3" />;
      case "measure":
        return <Ruler className="h-3 w-3" />;
      case "annotate":
        return <Crosshair className="h-3 w-3" />;
      default:
        return <MousePointer className="h-3 w-3" />;
    }
  };

  const formatCoordinate = (value: number): string => {
    return Math.round(value).toString();
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </div>
      );
    }
  };

  const getHistoryStatus = () => {
    const totalSteps = history.length;
    const currentStep = currentHistoryIndex + 1;

    return (
      <div className="flex items-center gap-1 text-gray-600">
        <Clock className="h-3 w-3" />
        <span>
          {currentStep}/{totalSteps}
        </span>
      </div>
    );
  };

  const getSelectionInfo = () => {
    if (selectedCount === 0) {
      return "No selection";
    } else if (selectedCount === 1) {
      return "1 item selected";
    } else {
      return `${selectedCount} items selected`;
    }
  };

  const getPerformanceIndicator = () => {
    if (fps >= 50) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    } else if (fps >= 30) {
      return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    } else {
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    }
  };

  return (
    <div className={`border-t border-gray-200 bg-gray-50 px-4 py-1 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-600">
        {/* Left Section - Tool and Selection Info */}
        <div className="flex items-center gap-6">
          {/* Active Tool */}
          <div className="flex items-center gap-1">
            {getToolIcon(tool)}
            <span className="capitalize">{tool}</span>
          </div>

          {/* Selection Info */}
          <div className="flex items-center gap-1">
            <span>{getSelectionInfo()}</span>
          </div>

          {/* Drawing Stats */}
          <div className="flex items-center gap-4">
            <span>{nodes.length} symbols</span>
            <span>{edges.length} connections</span>
          </div>
        </div>

        {/* Center Section - Mouse Position and Zoom */}
        <div className="flex items-center gap-6">
          {/* Mouse Position */}
          <div className="flex items-center gap-2">
            <span>X: {formatCoordinate(mousePosition.x)}</span>
            <span>Y: {formatCoordinate(mousePosition.y)}</span>
          </div>

          {/* Zoom Level */}
          <div className="flex items-center gap-1">
            <span>Zoom: {formatPercentage(zoom)}</span>
          </div>

          {/* Grid Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Grid3x3 className="h-3 w-3" />
              <span className={isGridVisible ? "text-blue-600" : "text-gray-400"}>
                Grid {isGridVisible ? "On" : "Off"}
              </span>
            </div>
            {isGridVisible && <span>({gridSize}px)</span>}
          </div>

          {/* Snap Status */}
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span className={snapToGrid ? "text-blue-600" : "text-gray-400"}>
              Snap {snapToGrid ? "On" : "Off"}
            </span>
          </div>
        </div>

        {/* Right Section - System Status */}
        <div className="flex items-center gap-6">
          {/* History Status */}
          {getHistoryStatus()}

          {/* Collaboration Status */}
          {collaborators > 0 && (
            <div className="flex items-center gap-1 text-blue-600">
              <Users className="h-3 w-3" />
              <span>{collaborators} online</span>
            </div>
          )}

          {/* Connection Status */}
          {getConnectionStatus()}

          {/* Performance Metrics */}
          {showPerformanceMetrics && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {getPerformanceIndicator()}
                <span>{fps} FPS</span>
              </div>
              {memoryUsage > 0 && <span>{memoryUsage} MB</span>}
            </div>
          )}

          {/* Last Update Time */}
          <div className="flex items-center gap-1 text-gray-500">
            <span>Updated {lastUpdateTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Performance Warning */}
      {showPerformanceMetrics && fps < 30 && (
        <div className="mt-1 rounded border border-yellow-300 bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3" />
            <span>Performance warning: {fps} FPS. Consider reducing diagram complexity.</span>
          </div>
        </div>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <div className="mt-1 rounded border border-red-300 bg-red-100 px-2 py-1 text-xs text-red-800">
          <div className="flex items-center gap-2">
            <WifiOff className="h-3 w-3" />
            <span>You're offline. Changes will be saved locally.</span>
          </div>
        </div>
      )}
    </div>
  );
}
