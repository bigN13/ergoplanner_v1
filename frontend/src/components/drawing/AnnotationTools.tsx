"use client";

import {
  Type,
  MessageSquare,
  ArrowRight,
  Circle,
  Square,
  Triangle,
  Ruler,
  Pen,
  Highlighter,
  Palette,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RotateCcw,
  Move,
} from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useReactFlow, Node } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

interface Annotation {
  id: string;
  type: "text" | "callout" | "dimension" | "arrow" | "shape" | "freehand" | "highlight";
  position: { x: number; y: number };
  data: any;
  style: {
    color: string;
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: string;
    strokeWidth?: number;
    opacity?: number;
  };
  points?: { x: number; y: number }[];
  locked?: boolean;
  visible?: boolean;
  layer?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnotationToolsProps {
  className?: string;
  visible?: boolean;
  onToggle?: () => void;
}

export default function AnnotationTools({
  className = "",
  visible = true,
  onToggle,
}: AnnotationToolsProps) {
  const [activeTool, setActiveTool] = useState<string>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const [currentColor, setCurrentColor] = useState("#ef4444");
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);
  const [currentFontSize, setCurrentFontSize] = useState(14);
  const [showColorPalette, setShowColorPalette] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();
  const { addToHistory } = useDrawingStore();

  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
    "#000000",
  ];

  // Handle canvas interaction for annotations
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool === "select") return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const flowPoint = screenToFlowPosition(point);

      switch (activeTool) {
        case "text":
          handleTextAnnotation(flowPoint);
          break;
        case "callout":
          handleCalloutAnnotation(flowPoint);
          break;
        case "dimension":
          handleDimensionAnnotation(flowPoint);
          break;
        case "arrow":
          handleArrowAnnotation(flowPoint);
          break;
        case "shape":
          handleShapeAnnotation(flowPoint);
          break;
        case "freehand":
          handleFreehandStart(flowPoint);
          break;
        case "highlight":
          handleHighlightAnnotation(flowPoint);
          break;
      }
    },
    [activeTool, currentAnnotation, screenToFlowPosition]
  );

  const handleTextAnnotation = (point: { x: number; y: number }) => {
    const text = prompt("Enter text:");
    if (!text) return;

    const annotation: Annotation = {
      id: `text-${Date.now()}`,
      type: "text",
      position: point,
      data: { text },
      style: {
        color: currentColor,
        fontSize: currentFontSize,
        fontWeight: "normal",
      },
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAnnotations((prev) => [...prev, annotation]);
    addToHistory();
  };

  const handleCalloutAnnotation = (point: { x: number; y: number }) => {
    if (!currentAnnotation) {
      const text = prompt("Enter callout text:");
      if (!text) return;

      setCurrentAnnotation({
        id: `callout-${Date.now()}`,
        type: "callout",
        position: point,
        data: { text, targetPoint: null },
        style: {
          color: currentColor,
          backgroundColor: "#ffffff",
          fontSize: currentFontSize,
        },
      });
      setIsDrawing(true);
    } else if (currentAnnotation.data && !currentAnnotation.data.targetPoint) {
      const annotation: Annotation = {
        ...(currentAnnotation as Annotation),
        data: {
          ...currentAnnotation.data,
          targetPoint: point,
        },
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAnnotations((prev) => [...prev, annotation]);
      setCurrentAnnotation(null);
      setIsDrawing(false);
      addToHistory();
    }
  };

  const handleDimensionAnnotation = (point: { x: number; y: number }) => {
    if (!currentAnnotation) {
      setCurrentAnnotation({
        id: `dimension-${Date.now()}`,
        type: "dimension",
        position: point,
        data: { endPoint: null, value: 0, unit: "mm" },
        style: {
          color: currentColor,
          strokeWidth: currentStrokeWidth,
        },
      });
      setIsDrawing(true);
    } else if (currentAnnotation.data && !currentAnnotation.data.endPoint) {
      const distance = Math.sqrt(
        Math.pow(point.x - currentAnnotation.position!.x, 2) +
          Math.pow(point.y - currentAnnotation.position!.y, 2)
      );

      const annotation: Annotation = {
        ...(currentAnnotation as Annotation),
        data: {
          ...currentAnnotation.data,
          endPoint: point,
          value: Math.round(distance),
        },
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAnnotations((prev) => [...prev, annotation]);
      setCurrentAnnotation(null);
      setIsDrawing(false);
      addToHistory();
    }
  };

  const handleArrowAnnotation = (point: { x: number; y: number }) => {
    if (!currentAnnotation) {
      setCurrentAnnotation({
        id: `arrow-${Date.now()}`,
        type: "arrow",
        position: point,
        data: { endPoint: null },
        style: {
          color: currentColor,
          strokeWidth: currentStrokeWidth,
        },
      });
      setIsDrawing(true);
    } else if (currentAnnotation.data && !currentAnnotation.data.endPoint) {
      const annotation: Annotation = {
        ...(currentAnnotation as Annotation),
        data: {
          ...currentAnnotation.data,
          endPoint: point,
        },
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAnnotations((prev) => [...prev, annotation]);
      setCurrentAnnotation(null);
      setIsDrawing(false);
      addToHistory();
    }
  };

  const handleShapeAnnotation = (point: { x: number; y: number }) => {
    const shape = "rectangle"; // Default shape, could be made configurable

    if (!currentAnnotation) {
      setCurrentAnnotation({
        id: `shape-${Date.now()}`,
        type: "shape",
        position: point,
        data: { shape, endPoint: null },
        style: {
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          backgroundColor: "transparent",
        },
      });
      setIsDrawing(true);
    } else if (currentAnnotation.data && !currentAnnotation.data.endPoint) {
      const annotation: Annotation = {
        ...(currentAnnotation as Annotation),
        data: {
          ...currentAnnotation.data,
          endPoint: point,
        },
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAnnotations((prev) => [...prev, annotation]);
      setCurrentAnnotation(null);
      setIsDrawing(false);
      addToHistory();
    }
  };

  const handleFreehandStart = (point: { x: number; y: number }) => {
    const annotation: Annotation = {
      id: `freehand-${Date.now()}`,
      type: "freehand",
      position: point,
      data: {},
      style: {
        color: currentColor,
        strokeWidth: currentStrokeWidth,
      },
      points: [point],
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAnnotations((prev) => [...prev, annotation]);
    setCurrentAnnotation(annotation);
    setIsDrawing(true);
  };

  const handleHighlightAnnotation = (point: { x: number; y: number }) => {
    if (!currentAnnotation) {
      setCurrentAnnotation({
        id: `highlight-${Date.now()}`,
        type: "highlight",
        position: point,
        data: { endPoint: null },
        style: {
          color: currentColor,
          opacity: 0.3,
          strokeWidth: 20,
        },
      });
      setIsDrawing(true);
    } else if (currentAnnotation.data && !currentAnnotation.data.endPoint) {
      const annotation: Annotation = {
        ...(currentAnnotation as Annotation),
        data: {
          ...currentAnnotation.data,
          endPoint: point,
        },
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAnnotations((prev) => [...prev, annotation]);
      setCurrentAnnotation(null);
      setIsDrawing(false);
      addToHistory();
    }
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedAnnotations((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    addToHistory();
  };

  const toggleAnnotationVisibility = (id: string) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)));
  };

  const lockAnnotation = (id: string) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, locked: !a.locked } : a)));
  };

  const clearAllAnnotations = () => {
    if (confirm("Are you sure you want to clear all annotations?")) {
      setAnnotations([]);
      setSelectedAnnotations(new Set());
      addToHistory();
    }
  };

  const exportAnnotations = () => {
    const data = {
      annotations: annotations.map((a) => ({
        ...a,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "annotations.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render annotation overlay
  const renderAnnotationOverlay = () => {
    return (
      <svg className="pointer-events-none absolute inset-0" style={{ zIndex: 1000 }}>
        {annotations
          .filter((a) => a.visible)
          .map((annotation) => {
            const screenPos = flowToScreenPosition(annotation.position);

            switch (annotation.type) {
              case "text":
                return (
                  <text
                    key={annotation.id}
                    x={screenPos.x}
                    y={screenPos.y}
                    fill={annotation.style.color}
                    fontSize={annotation.style.fontSize}
                    fontWeight={annotation.style.fontWeight}
                  >
                    {annotation.data.text}
                  </text>
                );

              case "arrow":
                if (annotation.data.endPoint) {
                  const endScreen = flowToScreenPosition(annotation.data.endPoint);
                  return (
                    <g key={annotation.id}>
                      <defs>
                        <marker
                          id={`arrowhead-${annotation.id}`}
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill={annotation.style.color} />
                        </marker>
                      </defs>
                      <line
                        x1={screenPos.x}
                        y1={screenPos.y}
                        x2={endScreen.x}
                        y2={endScreen.y}
                        stroke={annotation.style.color}
                        strokeWidth={annotation.style.strokeWidth}
                        markerEnd={`url(#arrowhead-${annotation.id})`}
                      />
                    </g>
                  );
                }
                break;

              case "dimension":
                if (annotation.data.endPoint) {
                  const endScreen = flowToScreenPosition(annotation.data.endPoint);
                  const midX = (screenPos.x + endScreen.x) / 2;
                  const midY = (screenPos.y + endScreen.y) / 2;
                  return (
                    <g key={annotation.id}>
                      <line
                        x1={screenPos.x}
                        y1={screenPos.y}
                        x2={endScreen.x}
                        y2={endScreen.y}
                        stroke={annotation.style.color}
                        strokeWidth={annotation.style.strokeWidth}
                      />
                      <text
                        x={midX}
                        y={midY - 5}
                        fill={annotation.style.color}
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {annotation.data.value} {annotation.data.unit}
                      </text>
                    </g>
                  );
                }
                break;

              case "shape":
                if (annotation.data.endPoint) {
                  const endScreen = flowToScreenPosition(annotation.data.endPoint);
                  const width = endScreen.x - screenPos.x;
                  const height = endScreen.y - screenPos.y;
                  return (
                    <rect
                      key={annotation.id}
                      x={screenPos.x}
                      y={screenPos.y}
                      width={width}
                      height={height}
                      fill={annotation.style.backgroundColor || "transparent"}
                      stroke={annotation.style.color}
                      strokeWidth={annotation.style.strokeWidth}
                    />
                  );
                }
                break;

              case "callout":
                if (annotation.data.targetPoint) {
                  const targetScreen = flowToScreenPosition(annotation.data.targetPoint);
                  return (
                    <g key={annotation.id}>
                      <line
                        x1={screenPos.x}
                        y1={screenPos.y}
                        x2={targetScreen.x}
                        y2={targetScreen.y}
                        stroke={annotation.style.color}
                        strokeWidth="1"
                      />
                      <rect
                        x={screenPos.x - 50}
                        y={screenPos.y - 15}
                        width="100"
                        height="30"
                        fill={annotation.style.backgroundColor}
                        stroke={annotation.style.color}
                        strokeWidth="1"
                        rx="3"
                      />
                      <text
                        x={screenPos.x}
                        y={screenPos.y + 5}
                        fill={annotation.style.color}
                        fontSize={annotation.style.fontSize}
                        textAnchor="middle"
                      >
                        {annotation.data.text}
                      </text>
                    </g>
                  );
                }
                break;

              case "freehand":
                if (annotation.points && annotation.points.length > 1) {
                  const pathData = annotation.points
                    .map((point, index) => {
                      const screenPoint = flowToScreenPosition(point);
                      return `${index === 0 ? "M" : "L"} ${screenPoint.x} ${screenPoint.y}`;
                    })
                    .join(" ");

                  return (
                    <path
                      key={annotation.id}
                      d={pathData}
                      fill="none"
                      stroke={annotation.style.color}
                      strokeWidth={annotation.style.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                }
                break;

              case "highlight":
                if (annotation.data.endPoint) {
                  const endScreen = flowToScreenPosition(annotation.data.endPoint);
                  return (
                    <line
                      key={annotation.id}
                      x1={screenPos.x}
                      y1={screenPos.y}
                      x2={endScreen.x}
                      y2={endScreen.y}
                      stroke={annotation.style.color}
                      strokeWidth={annotation.style.strokeWidth}
                      opacity={annotation.style.opacity}
                      strokeLinecap="round"
                    />
                  );
                }
                break;
            }

            return null;
          })}

        {/* Render current annotation being drawn */}
        {currentAnnotation && currentAnnotation.position && (
          <g>{/* Add rendering for current annotation */}</g>
        )}
      </svg>
    );
  };

  if (!visible) return null;

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {/* Annotation overlay */}
      <div
        ref={canvasRef}
        className="pointer-events-auto absolute inset-0"
        onClick={handleCanvasClick}
        style={{ cursor: activeTool !== "select" ? "crosshair" : "default" }}
      >
        {renderAnnotationOverlay()}
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Annotations</h3>
          <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        {/* Tool Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-xs text-gray-500">Tool</label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: "select", icon: Move, label: "Select" },
              { id: "text", icon: Type, label: "Text" },
              { id: "callout", icon: MessageSquare, label: "Callout" },
              { id: "arrow", icon: ArrowRight, label: "Arrow" },
              { id: "dimension", icon: Ruler, label: "Dimension" },
              { id: "shape", icon: Square, label: "Shape" },
              { id: "freehand", icon: Pen, label: "Draw" },
              { id: "highlight", icon: Highlighter, label: "Highlight" },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded p-2 text-xs ${
                  activeTool === tool.id
                    ? "border border-blue-300 bg-blue-100 text-blue-700"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                title={tool.label}
              >
                <tool.icon className="h-3 w-3" />
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style Controls */}
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Color</label>
            <div className="relative">
              <button
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="h-8 w-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: currentColor }}
              />
              {showColorPalette && (
                <div className="absolute top-10 left-0 z-10 rounded border border-gray-200 bg-white p-2 shadow-lg">
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setCurrentColor(color);
                          setShowColorPalette(false);
                        }}
                        className="h-6 w-6 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Stroke Width</label>
            <input
              type="range"
              min="1"
              max="10"
              value={currentStrokeWidth}
              onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{currentStrokeWidth}px</span>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Font Size</label>
            <input
              type="range"
              min="8"
              max="24"
              value={currentFontSize}
              onChange={(e) => setCurrentFontSize(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{currentFontSize}px</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={clearAllAnnotations}
              disabled={annotations.length === 0}
              className="flex items-center justify-center gap-1 rounded bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </button>
            <button
              onClick={exportAnnotations}
              disabled={annotations.length === 0}
              className="flex items-center justify-center gap-1 rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Palette className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>

        {/* Annotations List */}
        <div>
          <label className="mb-2 block text-xs text-gray-500">
            Annotations ({annotations.length})
          </label>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {annotations.length === 0 ? (
              <p className="py-2 text-center text-xs text-gray-400 italic">No annotations yet</p>
            ) : (
              annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="flex items-center justify-between rounded bg-gray-50 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: annotation.style.color }}
                    />
                    <span className="font-medium capitalize">{annotation.type}</span>
                    {annotation.data.text && (
                      <span className="max-w-20 truncate text-gray-500">
                        "{annotation.data.text}"
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleAnnotationVisibility(annotation.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {annotation.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => lockAnnotation(annotation.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {annotation.locked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteAnnotation(annotation.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        {activeTool !== "select" && (
          <div className="mt-4 rounded bg-blue-50 p-2 text-xs text-blue-700">
            {activeTool === "text" && "Click to add text annotation"}
            {activeTool === "callout" && "Click to place callout, then click target"}
            {activeTool === "arrow" && "Click start point, then end point"}
            {activeTool === "dimension" && "Click two points to measure distance"}
            {activeTool === "shape" && "Click and drag to create shape"}
            {activeTool === "freehand" && "Click and drag to draw freely"}
            {activeTool === "highlight" && "Click and drag to highlight"}
          </div>
        )}
      </div>
    </div>
  );
}
