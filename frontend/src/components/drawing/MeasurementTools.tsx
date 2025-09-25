"use client";

import {
  Ruler,
  Square,
  // Circle,
  Calculator,
  Crosshair,
  MousePointer,
  // Grid3x3,
  // ArrowRight,
  // RotateCcw,
  Trash2,
} from "lucide-react";
import React, { useState, useCallback, useRef } from "react";
import { useReactFlow } from "reactflow";

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  type: "distance" | "area" | "angle" | "coordinate";
  points: Point[];
  value: number;
  unit: string;
  label?: string;
  color?: string;
}

interface MeasurementToolsProps {
  className?: string;
  visible?: boolean;
  onToggle?: () => void;
}

export default function MeasurementTools({
  className = "",
  visible = true,
  onToggle,
}: MeasurementToolsProps): React.JSX.Element | null {
  const [activeTool, setActiveTool] = useState<
    "select" | "distance" | "area" | "angle" | "coordinate"
  >("select");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<Measurement> | null>(null);
  const [unit, setUnit] = useState<"mm" | "cm" | "m" | "in" | "ft">("m");
  const [scale, setScale] = useState(1); // pixels per unit
  const [_isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();

  // Handle canvas click for measurements
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent): void => {
      if (activeTool === "select") return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const flowPoint = screenToFlowPosition(point);

      switch (activeTool) {
        case "distance":
          handleDistanceMeasurement(flowPoint);
          break;
        case "area":
          handleAreaMeasurement(flowPoint);
          break;
        case "angle":
          handleAngleMeasurement(flowPoint);
          break;
        case "coordinate":
          handleCoordinateMeasurement(flowPoint);
          break;
      }
    },
    [
      activeTool,
      screenToFlowPosition,
      handleDistanceMeasurement,
      handleAreaMeasurement,
      handleAngleMeasurement,
      handleCoordinateMeasurement,
    ]
  );

  const handleDistanceMeasurement = useCallback((point: Point): void => {
    if (!currentMeasurement) {
      setCurrentMeasurement({
        id: `distance-${Date.now()}`,
        type: "distance",
        points: [point],
        unit,
      });
      setIsDrawing(true);
    } else if (currentMeasurement.points && currentMeasurement.points.length === 1) {
      const points = [...currentMeasurement.points, point];
      const distance = calculateDistance(points[0], points[1]);

      const measurement: Measurement = {
        ...(currentMeasurement as Measurement),
        points,
        value: distance,
        label: `${(distance * scale).toFixed(2)} ${unit}`,
      };

      setMeasurements((prev) => [...prev, measurement]);
      setCurrentMeasurement(null);
      setIsDrawing(false);
    }
  }, [currentMeasurement, unit, scale]);

  const handleAreaMeasurement = useCallback((point: Point): void => {
    if (!currentMeasurement) {
      setCurrentMeasurement({
        id: `area-${Date.now()}`,
        type: "area",
        points: [point],
        unit: unit === "m" ? "m²" : `${unit}²`,
      });
      setIsDrawing(true);
    } else if (currentMeasurement.points) {
      const points = [...currentMeasurement.points, point];

      if (points.length >= 3) {
        // Check if user clicked near the first point to close the polygon
        const firstPoint = points[0];
        const distance = calculateDistance(point, firstPoint);

        if (distance < 20) {
          // Close polygon if within 20 pixels of start
          const area = calculatePolygonArea(points.slice(0, -1)); // Remove the last point (duplicate of first)

          const measurement: Measurement = {
            ...(currentMeasurement as Measurement),
            points: points.slice(0, -1),
            value: area,
            label: `${(area * scale * scale).toFixed(2)} ${unit === "m" ? "m²" : `${unit}²`}`,
          };

          setMeasurements((prev) => [...prev, measurement]);
          setCurrentMeasurement(null);
          setIsDrawing(false);
        } else {
          setCurrentMeasurement({
            ...currentMeasurement,
            points,
          });
        }
      } else {
        setCurrentMeasurement({
          ...currentMeasurement,
          points,
        });
      }
    }
  }, [currentMeasurement, unit, scale]);

  const handleAngleMeasurement = useCallback((point: Point): void => {
    if (!currentMeasurement) {
      setCurrentMeasurement({
        id: `angle-${Date.now()}`,
        type: "angle",
        points: [point],
        unit: "°",
      });
      setIsDrawing(true);
    } else if (currentMeasurement.points) {
      const points = [...currentMeasurement.points, point];

      if (points.length === 3) {
        const angle = calculateAngle(points[0], points[1], points[2]);

        const measurement: Measurement = {
          ...(currentMeasurement as Measurement),
          points,
          value: angle,
          label: `${angle.toFixed(1)}°`,
        };

        setMeasurements((prev) => [...prev, measurement]);
        setCurrentMeasurement(null);
        setIsDrawing(false);
      } else {
        setCurrentMeasurement({
          ...currentMeasurement,
          points,
        });
      }
    }
  }, [currentMeasurement]);

  const handleCoordinateMeasurement = useCallback((point: Point): void => {
    const measurement: Measurement = {
      id: `coord-${Date.now()}`,
      type: "coordinate",
      points: [point],
      value: 0,
      unit,
      label: `(${(point.x * scale).toFixed(2)}, ${(point.y * scale).toFixed(2)}) ${unit}`,
    };

    setMeasurements((prev) => [...prev, measurement]);
  }, [unit, scale]);

  // Calculation functions
  const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    const angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  const deleteMeasurement = (id: string): void => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAllMeasurements = (): void => {
    setMeasurements([]);
    setCurrentMeasurement(null);
    setIsDrawing(false);
  };

  const exportMeasurements = (): void => {
    const data = {
      measurements: measurements.map((m) => ({
        type: m.type,
        value: m.value,
        unit: m.unit,
        label: m.label,
      })),
      scale,
      unit,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "measurements.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render measurement overlay
  const renderMeasurementOverlay = (): React.JSX.Element => {
    return (
      <svg className="pointer-events-none absolute inset-0" style={{ zIndex: 1000 }}>
        {/* Render existing measurements */}
        {measurements.map((measurement) => (
          <g key={measurement.id}>
            {measurement.type === "distance" && measurement.points.length === 2 && (
              <>
                <line
                  x1={flowToScreenPosition(measurement.points[0]).x}
                  y1={flowToScreenPosition(measurement.points[0]).y}
                  x2={flowToScreenPosition(measurement.points[1]).x}
                  y2={flowToScreenPosition(measurement.points[1]).y}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <circle
                  cx={flowToScreenPosition(measurement.points[0]).x}
                  cy={flowToScreenPosition(measurement.points[0]).y}
                  r="4"
                  fill="#ef4444"
                />
                <circle
                  cx={flowToScreenPosition(measurement.points[1]).x}
                  cy={flowToScreenPosition(measurement.points[1]).y}
                  r="4"
                  fill="#ef4444"
                />
                <text
                  x={
                    (flowToScreenPosition(measurement.points[0]).x +
                      flowToScreenPosition(measurement.points[1]).x) /
                    2
                  }
                  y={
                    (flowToScreenPosition(measurement.points[0]).y +
                      flowToScreenPosition(measurement.points[1]).y) /
                      2 -
                    10
                  }
                  fill="#ef4444"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {measurement.label}
                </text>
              </>
            )}

            {measurement.type === "area" && measurement.points.length >= 3 && (
              <>
                <polygon
                  points={measurement.points
                    .map((p) => {
                      const screen = flowToScreenPosition(p);
                      return `${screen.x},${screen.y}`;
                    })
                    .join(" ")}
                  fill="rgba(34, 197, 94, 0.2)"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {measurement.points.map((point, index) => (
                  <circle
                    key={index}
                    cx={flowToScreenPosition(point).x}
                    cy={flowToScreenPosition(point).y}
                    r="4"
                    fill="#22c55e"
                  />
                ))}
                <text
                  x={
                    measurement.points.reduce((sum, p) => sum + flowToScreenPosition(p).x, 0) /
                    measurement.points.length
                  }
                  y={
                    measurement.points.reduce((sum, p) => sum + flowToScreenPosition(p).y, 0) /
                    measurement.points.length
                  }
                  fill="#22c55e"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {measurement.label}
                </text>
              </>
            )}

            {measurement.type === "coordinate" && (
              <>
                <circle
                  cx={flowToScreenPosition(measurement.points[0]).x}
                  cy={flowToScreenPosition(measurement.points[0]).y}
                  r="6"
                  fill="#8b5cf6"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={flowToScreenPosition(measurement.points[0]).x + 10}
                  y={flowToScreenPosition(measurement.points[0]).y - 10}
                  fill="#8b5cf6"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {measurement.label}
                </text>
              </>
            )}
          </g>
        ))}

        {/* Render current measurement being drawn */}
        {currentMeasurement && currentMeasurement.points && (
          <g>
            {currentMeasurement.points.map((point, index) => (
              <circle
                key={index}
                cx={flowToScreenPosition(point).x}
                cy={flowToScreenPosition(point).y}
                r="4"
                fill="#3b82f6"
              />
            ))}
            {currentMeasurement.type === "distance" && currentMeasurement.points.length === 1 && (
              <text
                x={flowToScreenPosition(currentMeasurement.points[0]).x + 10}
                y={flowToScreenPosition(currentMeasurement.points[0]).y - 10}
                fill="#3b82f6"
                fontSize="10"
              >
                Click to set end point
              </text>
            )}
            {currentMeasurement.type === "area" && currentMeasurement.points.length >= 2 && (
              <>
                <polygon
                  points={currentMeasurement.points
                    .map((p) => {
                      const screen = flowToScreenPosition(p);
                      return `${screen.x},${screen.y}`;
                    })
                    .join(" ")}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />
                <text
                  x={flowToScreenPosition(currentMeasurement.points[0]).x + 10}
                  y={flowToScreenPosition(currentMeasurement.points[0]).y - 10}
                  fill="#3b82f6"
                  fontSize="10"
                >
                  Click near start to close
                </text>
              </>
            )}
          </g>
        )}
      </svg>
    );
  };

  if (!visible) return null;

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {/* Measurement overlay */}
      <div
        ref={canvasRef}
        className="pointer-events-auto absolute inset-0"
        onClick={handleCanvasClick}
        style={{ cursor: activeTool !== "select" ? "crosshair" : "default" }}
      >
        {renderMeasurementOverlay()}
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Measurement Tools</h3>
          <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        {/* Tool Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-xs text-gray-500">Active Tool</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTool("select")}
              className={`flex items-center justify-center gap-1 rounded p-2 text-xs ${
                activeTool === "select"
                  ? "border border-blue-300 bg-blue-100 text-blue-700"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MousePointer className="h-3 w-3" />
              Select
            </button>
            <button
              onClick={() => setActiveTool("distance")}
              className={`flex items-center justify-center gap-1 rounded p-2 text-xs ${
                activeTool === "distance"
                  ? "border border-blue-300 bg-blue-100 text-blue-700"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Ruler className="h-3 w-3" />
              Distance
            </button>
            <button
              onClick={() => setActiveTool("area")}
              className={`flex items-center justify-center gap-1 rounded p-2 text-xs ${
                activeTool === "area"
                  ? "border border-blue-300 bg-blue-100 text-blue-700"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Square className="h-3 w-3" />
              Area
            </button>
            <button
              onClick={() => setActiveTool("coordinate")}
              className={`flex items-center justify-center gap-1 rounded p-2 text-xs ${
                activeTool === "coordinate"
                  ? "border border-blue-300 bg-blue-100 text-blue-700"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Crosshair className="h-3 w-3" />
              Point
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as typeof unit)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
              <option value="in">Inches (in)</option>
              <option value="ft">Feet (ft)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Scale (pixels per {unit})</label>
            <input
              type="number"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value) || 1)}
              min="0.1"
              step="0.1"
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={clearAllMeasurements}
              disabled={measurements.length === 0}
              className="flex items-center justify-center gap-1 rounded bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </button>
            <button
              onClick={exportMeasurements}
              disabled={measurements.length === 0}
              className="flex items-center justify-center gap-1 rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Calculator className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>

        {/* Measurements List */}
        <div>
          <label className="mb-2 block text-xs text-gray-500">
            Measurements ({measurements.length})
          </label>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {measurements.length === 0 ? (
              <p className="py-2 text-center text-xs text-gray-400 italic">No measurements yet</p>
            ) : (
              measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="flex items-center justify-between rounded bg-gray-50 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {measurement.type === "distance" && <Ruler className="h-3 w-3 text-red-500" />}
                    {measurement.type === "area" && <Square className="h-3 w-3 text-green-500" />}
                    {measurement.type === "coordinate" && (
                      <Crosshair className="h-3 w-3 text-purple-500" />
                    )}
                    <span className="font-medium">{measurement.label}</span>
                  </div>
                  <button
                    onClick={() => deleteMeasurement(measurement.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        {activeTool !== "select" && (
          <div className="mt-4 rounded bg-blue-50 p-2 text-xs text-blue-700">
            {activeTool === "distance" && "Click two points to measure distance"}
            {activeTool === "area" && "Click points to create polygon, click near start to close"}
            {activeTool === "coordinate" && "Click to get point coordinates"}
          </div>
        )}
      </div>
    </div>
  );
}
