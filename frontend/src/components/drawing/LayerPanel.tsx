import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Layers,
  ChevronDown,
  ChevronRight,
  Palette,
  Settings,
  Check,
  X,
  GripVertical,
} from "lucide-react";
import { useDrawingStore } from "@/store/drawingStore";

interface LayerPanelProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LayerPanel({
  className = "",
  isCollapsed = false,
  onToggleCollapse,
}: LayerPanelProps): JSX.Element {
  const {
    layers,
    activeLayerId,
    addLayer,
    deleteLayer,
    renameLayer,
    setActiveLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    setLayerOpacity,
    reorderLayers,
  } = useDrawingStore();

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showOpacitySlider, setShowOpacitySlider] = useState<string | null>(null);
  const [draggedLayer, setDraggedLayer] = useState<number | null>(null);
  const [dragOverLayer, setDragOverLayer] = useState<number | null>(null);

  const handleStartEdit = (layerId: string, currentName: string) => {
    setEditingLayerId(layerId);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingLayerId && editingName.trim()) {
      renameLayer(editingLayerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingLayerId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedLayer(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverLayer(index);
  };

  const handleDragLeave = () => {
    setDragOverLayer(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedLayer !== null && draggedLayer !== toIndex) {
      reorderLayers(draggedLayer, toIndex);
    }
    setDraggedLayer(null);
    setDragOverLayer(null);
  };

  const handleDragEnd = () => {
    setDraggedLayer(null);
    setDragOverLayer(null);
  };

  if (isCollapsed) {
    return (
      <div className={`bg-white border-l border-gray-200 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Expand Layers Panel"
        >
          <Layers className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Layers</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={addLayer}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Add New Layer"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Collapse Panel"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No layers yet. Click + to add a layer.
          </div>
        ) : (
          <div className="py-1">
            {layers
              .sort((a, b) => a.order - b.order)
              .map((layer, index) => (
                <div
                  key={layer.id}
                  className={`
                    group relative px-2 py-1 hover:bg-gray-50 transition-colors
                    ${activeLayerId === layer.id ? "bg-blue-50" : ""}
                    ${dragOverLayer === index ? "border-t-2 border-blue-500" : ""}
                  `}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setActiveLayer(layer.id)}
                >
                  <div className="flex items-center gap-2">
                    {/* Drag Handle */}
                    <div
                      className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-3 h-3 text-gray-400" />
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                      title={layer.visible ? "Hide Layer" : "Show Layer"}
                    >
                      {layer.visible ? (
                        <Eye className="w-3 h-3 text-gray-600" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </button>

                    {/* Lock Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerLock(layer.id);
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                      title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                    >
                      {layer.locked ? (
                        <Lock className="w-3 h-3 text-gray-600" />
                      ) : (
                        <Unlock className="w-3 h-3 text-gray-400" />
                      )}
                    </button>

                    {/* Color Indicator */}
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: layer.color || "#3b82f6" }}
                      title="Layer Color"
                    />

                    {/* Layer Name */}
                    <div className="flex-1 min-w-0">
                      {editingLayerId === layer.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            className="flex-1 px-1 py-0 text-xs border border-blue-500 rounded outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            className="p-0.5 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs truncate ${
                              activeLayerId === layer.id
                                ? "font-medium text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            {layer.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(layer.id, layer.name);
                            }}
                            className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                          >
                            <Edit2 className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Layer Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Opacity Control */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOpacitySlider(
                            showOpacitySlider === layer.id ? null : layer.id
                          );
                        }}
                        className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        title="Adjust Opacity"
                      >
                        <Settings className="w-3 h-3 text-gray-600" />
                      </button>

                      {/* Delete Layer */}
                      {layer.id !== "layer-default" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="p-0.5 hover:bg-red-100 rounded transition-colors"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  {showOpacitySlider === layer.id && (
                    <div
                      className="mt-2 px-2 py-1 bg-gray-50 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Opacity:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={layer.opacity * 100}
                          onChange={(e) =>
                            setLayerOpacity(layer.id, parseInt(e.target.value) / 100)
                          }
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-600 w-8">
                          {Math.round(layer.opacity * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{layers.length} layer{layers.length !== 1 ? "s" : ""}</span>
          <span className="text-blue-600">
            Active: {layers.find((l) => l.id === activeLayerId)?.name || "None"}
          </span>
        </div>
      </div>
    </div>
  );
}