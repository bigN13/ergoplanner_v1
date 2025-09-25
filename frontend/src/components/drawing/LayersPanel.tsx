"use client";

import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Edit2, Layers } from "lucide-react";
import React, { useState } from "react";

import { useDrawingStore } from "@/store/drawingStore";
import type { Layer } from "@/types/drawing";

const LayersPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    setActiveLayer,
    updateLayer,
    addLayer,
    deleteLayer,
    moveLayer,
  } = useDrawingStore();
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const currentLayers = layers;

  const handleAddLayer = (): void => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${currentLayers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1.0,
      order: currentLayers.length,
    };
    addLayer(newLayer);
  };

  const handleToggleVisibility = (layerId: string): void => {
    const layer = currentLayers.find((l) => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { visible: !layer.visible });
    }
  };

  const handleToggleLock = (layerId: string): void => {
    const layer = currentLayers.find((l) => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { locked: !layer.locked });
    }
  };

  const handleOpacityChange = (layerId: string, opacity: number): void => {
    const layer = currentLayers.find((l) => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { opacity: opacity / 100 }); // Convert percentage to decimal
    }
  };

  const handleRename = (layerId: string): void => {
    setEditingLayerId(layerId);
    const layer = currentLayers.find((l) => l.id === layerId);
    setEditingName(layer?.name || "");
  };

  const handleSaveRename = (): void => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, { name: editingName.trim() });
    }
    setEditingLayerId(null);
    setEditingName("");
  };

  const handleDeleteLayer = (layerId: string): void => {
    if (currentLayers.length > 1 && layerId !== "main") {
      deleteLayer(layerId);
    }
  };

  const handleMoveLayer = (layerId: string, direction: "up" | "down"): void => {
    moveLayer(layerId, direction);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          <h3 className="font-semibold">Layers</h3>
        </div>
        <button
          onClick={handleAddLayer}
          className="rounded-lg bg-blue-500 p-1.5 text-white hover:bg-blue-600"
          title="Add Layer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2">
        {currentLayers
          .sort((a, b) => a.order - b.order)
          .map((layer) => (
            <div
              key={layer.id}
              className={`mb-2 rounded-lg border ${
                activeLayerId === layer.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
              } p-2 hover:bg-gray-50`}
              onClick={() => setActiveLayer(layer.id)}
            >
              {/* Layer Header */}
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-2">
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyPress={(e) => e.key === "Enter" && handleSaveRename()}
                      className="flex-1 rounded border px-2 py-1 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium">{layer.name}</span>
                  )}
                  {/* Element count will be computed from nodes/edges */}
                  <span className="text-xs text-gray-500"></span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(layer.id);
                    }}
                    className="rounded p-1 hover:bg-gray-200"
                    title={layer.visible ? "Hide Layer" : "Show Layer"}
                  >
                    {layer.visible ? (
                      <Eye className="h-4 w-4 text-gray-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLock(layer.id);
                    }}
                    className="rounded p-1 hover:bg-gray-200"
                    title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                  >
                    {layer.locked ? (
                      <Lock className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Unlock className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {layer.id !== "main" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(layer.id);
                        }}
                        className="rounded p-1 hover:bg-gray-200"
                        title="Rename Layer"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(layer.id);
                        }}
                        className="rounded p-1 hover:bg-red-100"
                        title="Delete Layer"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(layer.opacity * 100)}
                  onChange={(e) => handleOpacityChange(layer.id, Number(e.target.value))}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="w-8 text-xs text-gray-600">{Math.round(layer.opacity * 100)}%</span>
              </div>

              {/* Layer Controls */}
              {activeLayerId === layer.id && (
                <div className="mt-2 flex gap-1 border-t pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveLayer(layer.id, "up");
                    }}
                    disabled={layer.order === 0}
                    className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
                  >
                    Move Up
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveLayer(layer.id, "down");
                    }}
                    disabled={layer.order === currentLayers.length - 1}
                    className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
                  >
                    Move Down
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Footer Info */}
      <div className="border-t p-3 text-xs text-gray-500">
        <div>Active: {currentLayers.find((l) => l.id === activeLayerId)?.name || "None"}</div>
        <div>Total Layers: {currentLayers.length}</div>
      </div>
    </div>
  );
};

export default LayersPanel;
