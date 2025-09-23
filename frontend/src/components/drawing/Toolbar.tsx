'use client';

import React, { useRef } from 'react';
import {
  Save,
  Upload,
  Undo,
  Redo,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize,
  MousePointer2,
  Hand,
  FileJson,
  Image as ImageIcon,
  FileText,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { useDrawingStore } from '@/store/drawingStore';

interface ToolbarProps {
  onExportSVG: () => void;
  onExportPNG: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  tool: 'select' | 'pan';
  onToolChange: (tool: 'select' | 'pan') => void;
}

export default function Toolbar({
  onExportSVG,
  onExportPNG,
  onFitView,
  onZoomIn,
  onZoomOut,
  tool,
  onToolChange,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    drawingName,
    isDirty,
    isGridVisible,
    snapToGrid,
    canUndo,
    canRedo,
    setDrawingName,
    newDrawing,
    saveDrawing,
    loadDrawing,
    exportDrawing,
    importDrawing,
    toggleGrid,
    toggleSnapToGrid,
    undo,
    redo,
  } = useDrawingStore();

  const handleSave = () => {
    saveDrawing();
    alert('Drawing saved to browser storage!');
  };

  const handleLoad = () => {
    const savedDrawings = JSON.parse(localStorage.getItem('ergoplanner-drawings') || '[]');
    if (savedDrawings.length === 0) {
      alert('No saved drawings found');
      return;
    }

    const drawingList = savedDrawings
      .map((d: any) => `${d.name} (${new Date(d.savedAt).toLocaleString()})`)
      .join('\n');

    const selected = prompt(`Select a drawing to load:\n\n${drawingList}\n\nEnter drawing name:`);

    if (selected) {
      const drawing = savedDrawings.find((d: any) => d.name === selected.split(' (')[0]);
      if (drawing) {
        loadDrawing(drawing.id);
        alert('Drawing loaded successfully!');
      }
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          importDrawing(content);
          alert('Drawing imported successfully!');
        } catch (error) {
          alert('Failed to import drawing. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleNewDrawing = () => {
    if (isDirty && !confirm('You have unsaved changes. Create a new drawing anyway?')) {
      return;
    }
    newDrawing();
  };

  const handleExportJSON = () => {
    exportDrawing('json');
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center space-x-2">
        {/* File operations */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            onClick={handleNewDrawing}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="New Drawing"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Save Drawing"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={handleLoad}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Load Drawing"
          >
            <FolderOpen className="h-4 w-4" />
          </button>
        </div>

        {/* Import/Export */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            onClick={handleImport}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Import JSON"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportJSON}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Export as JSON"
          >
            <FileJson className="h-4 w-4" />
          </button>
          <button
            onClick={onExportSVG}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Export as SVG"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={onExportPNG}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Export as PNG"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Tools */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => onToolChange('select')}
            className={`rounded p-1.5 ${
              tool === 'select'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="Select Tool"
          >
            <MousePointer2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToolChange('pan')}
            className={`rounded p-1.5 ${
              tool === 'pan'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="Pan Tool"
          >
            <Hand className="h-4 w-4" />
          </button>
        </div>

        {/* View controls */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            onClick={onZoomIn}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={onFitView}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Fit to View"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>

        {/* Grid controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleGrid}
            className={`rounded p-1.5 ${
              isGridVisible
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="Toggle Grid"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <label className="flex items-center space-x-1 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={toggleSnapToGrid}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Snap to Grid</span>
          </label>
        </div>
      </div>

      {/* Drawing name and status */}
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={drawingName}
          onChange={(e) => setDrawingName(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Drawing Name"
        />
        {isDirty && (
          <span className="text-xs text-orange-600 font-medium">Unsaved changes</span>
        )}
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />
    </div>
  );
}