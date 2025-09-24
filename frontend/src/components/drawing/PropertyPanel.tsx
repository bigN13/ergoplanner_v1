"use client";

import { X, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { Node, Edge } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

interface PropertyPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onClose: () => void;
}

export default function PropertyPanel({ selectedNode, selectedEdge, onClose }: PropertyPanelProps) {
  const { updateNode, updateEdge, deleteNode, deleteEdge } = useDrawingStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["General", "Properties", "Appearance"])
  );
  const [localData, setLocalData] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      setLocalData(selectedNode.data || {});
    } else if (selectedEdge) {
      setLocalData(selectedEdge.data || {});
    }
  }, [selectedNode, selectedEdge]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePropertyChange = (key: string, value: any) => {
    const updatedData = { ...localData, [key]: value };
    setLocalData(updatedData);

    if (selectedNode) {
      updateNode(selectedNode.id, { data: updatedData });
    } else if (selectedEdge) {
      updateEdge(selectedEdge.id, { data: updatedData });
    }
  };

  const handlePositionChange = (axis: "x" | "y", value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && selectedNode) {
      const position = { ...selectedNode.position, [axis]: numValue };
      updateNode(selectedNode.id, { position });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this element?")) {
      if (selectedNode) {
        deleteNode(selectedNode.id);
      } else if (selectedEdge) {
        deleteEdge(selectedEdge.id);
      }
      onClose();
    }
  };

  const renderNodeProperties = () => {
    if (!selectedNode) return null;

    const nodeType = selectedNode.type;

    return (
      <>
        {/* General Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("General")}
            className="flex w-full items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>General</span>
            {expandedSections.has("General") ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has("General") && (
            <div className="mt-2 space-y-2 px-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">ID</label>
                <input
                  type="text"
                  value={selectedNode.id}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Type</label>
                <input
                  type="text"
                  value={nodeType || "default"}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Label</label>
                <input
                  type="text"
                  value={localData.label || ""}
                  onChange={(e) => handlePropertyChange("label", e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Position Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("Position")}
            className="flex w-full items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Position</span>
            {expandedSections.has("Position") ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has("Position") && (
            <div className="mt-2 space-y-2 px-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.position.x)}
                    onChange={(e) => handlePositionChange("x", e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.position.y)}
                    onChange={(e) => handlePositionChange("y", e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Type-specific Properties */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("Properties")}
            className="flex w-full items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Properties</span>
            {expandedSections.has("Properties") ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has("Properties") && (
            <div className="mt-2 space-y-2 px-3">
              {nodeType === "pump" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Flow Rate</label>
                    <input
                      type="text"
                      value={localData.flowRate || ""}
                      onChange={(e) => handlePropertyChange("flowRate", e.target.value)}
                      placeholder="e.g., 100 m³/h"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Head</label>
                    <input
                      type="text"
                      value={localData.head || ""}
                      onChange={(e) => handlePropertyChange("head", e.target.value)}
                      placeholder="e.g., 50 m"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Power</label>
                    <input
                      type="text"
                      value={localData.power || ""}
                      onChange={(e) => handlePropertyChange("power", e.target.value)}
                      placeholder="e.g., 15 kW"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {nodeType === "valve" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Valve Type</label>
                    <select
                      value={localData.type || "gate"}
                      onChange={(e) => handlePropertyChange("type", e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="gate">Gate</option>
                      <option value="ball">Ball</option>
                      <option value="butterfly">Butterfly</option>
                      <option value="globe">Globe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">State</label>
                    <select
                      value={localData.state || "open"}
                      onChange={(e) => handlePropertyChange("state", e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="partial">Partial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Size</label>
                    <input
                      type="text"
                      value={localData.size || ""}
                      onChange={(e) => handlePropertyChange("size", e.target.value)}
                      placeholder="e.g., DN100"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {nodeType === "tank" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Tank Type</label>
                    <select
                      value={localData.type || "storage"}
                      onChange={(e) => handlePropertyChange("type", e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="storage">Storage</option>
                      <option value="pressure">Pressure</option>
                      <option value="mixing">Mixing</option>
                      <option value="buffer">Buffer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Capacity</label>
                    <input
                      type="text"
                      value={localData.capacity || ""}
                      onChange={(e) => handlePropertyChange("capacity", e.target.value)}
                      placeholder="e.g., 1000 m³"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      Level ({localData.level || 0}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localData.level || 50}
                      onChange={(e) => handlePropertyChange("level", parseInt(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </div>
                </>
              )}

              {nodeType === "pipe" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Orientation</label>
                    <select
                      value={localData.orientation || "horizontal"}
                      onChange={(e) => handlePropertyChange("orientation", e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                      <option value="elbow">Elbow</option>
                      <option value="tee">Tee</option>
                      <option value="cross">Cross</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Diameter</label>
                    <input
                      type="text"
                      value={localData.diameter || ""}
                      onChange={(e) => handlePropertyChange("diameter", e.target.value)}
                      placeholder="e.g., DN100"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Material</label>
                    <input
                      type="text"
                      value={localData.material || ""}
                      onChange={(e) => handlePropertyChange("material", e.target.value)}
                      placeholder="e.g., Steel"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {nodeType === "controlValve" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Control Type</label>
                    <select
                      value={localData.controlType || "pneumatic"}
                      onChange={(e) => handlePropertyChange("controlType", e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="pneumatic">Pneumatic</option>
                      <option value="electric">Electric</option>
                      <option value="hydraulic">Hydraulic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      Position ({localData.position || 50}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localData.position || 50}
                      onChange={(e) => handlePropertyChange("position", parseInt(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </div>
                </>
              )}

              {(nodeType === "flowMeter" || nodeType === "pressureGauge") && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Value</label>
                    <input
                      type="text"
                      value={localData.value || ""}
                      onChange={(e) => handlePropertyChange("value", e.target.value)}
                      placeholder="e.g., 25.5"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Unit</label>
                    <input
                      type="text"
                      value={localData.unit || ""}
                      onChange={(e) => handlePropertyChange("unit", e.target.value)}
                      placeholder={nodeType === "flowMeter" ? "m³/h" : "bar"}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderEdgeProperties = () => {
    if (!selectedEdge) return null;

    return (
      <>
        <div className="mb-4">
          <button
            onClick={() => toggleSection("General")}
            className="flex w-full items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>General</span>
            {expandedSections.has("General") ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has("General") && (
            <div className="mt-2 space-y-2 px-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">ID</label>
                <input
                  type="text"
                  value={selectedEdge.id}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Source</label>
                <input
                  type="text"
                  value={selectedEdge.source}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Target</label>
                <input
                  type="text"
                  value={selectedEdge.target}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  if (!selectedNode && !selectedEdge) return null;

  return (
    <div className="flex h-full w-80 flex-col border-l border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {selectedNode ? "Node Properties" : "Edge Properties"}
        </h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode && renderNodeProperties()}
        {selectedEdge && renderEdgeProperties()}
      </div>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleDelete}
          className="w-full rounded bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Delete {selectedNode ? "Node" : "Edge"}
        </button>
      </div>
    </div>
  );
}
