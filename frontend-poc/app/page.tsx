'use client';

import React, { useState } from 'react';
import CanvasProfessional from '@/components/CanvasProfessional';
import ComponentLibrary from '@/components/ComponentLibrary';
import PropertiesPanel from '@/components/PropertiesPanel';
import DataGridEnhanced from '@/components/DataGridEnhanced';
import ChatInterface from '@/components/ChatInterface';
import { useStore } from '@/lib/store';
import {
  Save, Download, Upload, Undo, Redo, Copy, Clipboard, Trash2,
  ZoomIn, ZoomOut, Grid3x3, Lock, Unlock, Layers, Eye,
  FileText, Settings, HelpCircle, Share2, ChevronDown
} from 'lucide-react';

export default function Home() {
  const { selectedEquipment } = useStore();
  const [showGrid, setShowGrid] = useState(true);
  const [showDataGrid, setShowDataGrid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(3);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Menu Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-bold text-blue-600">ERGOPLANNER</span>
            <span className="text-gray-500">AI Suite - POC</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hover:bg-gray-100 px-3 py-1 rounded flex items-center gap-1">
              File <ChevronDown className="w-3 h-3" />
            </button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded flex items-center gap-1">
              Edit <ChevronDown className="w-3 h-3" />
            </button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded flex items-center gap-1">
              View <ChevronDown className="w-3 h-3" />
            </button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded flex items-center gap-1">
              Insert <ChevronDown className="w-3 h-3" />
            </button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded flex items-center gap-1">
              Format <ChevronDown className="w-3 h-3" />
            </button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded flex items-center gap-1">
              Tools <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="hover:bg-gray-100 p-2 rounded">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="hover:bg-gray-100 p-2 rounded">
              <Settings className="w-4 h-4" />
            </button>
            <button className="hover:bg-gray-100 p-2 rounded">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-300 px-4 py-2">
        <div className="flex items-center gap-1">
          {/* File Operations */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
            <button className="p-2 hover:bg-gray-100 rounded" title="Save">
              <Save className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Open">
              <Upload className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Export">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Edit Operations */}
          <div className="flex items-center gap-1 px-3 border-r border-gray-300">
            <button className="p-2 hover:bg-gray-100 rounded" title="Undo">
              <Undo className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Redo">
              <Redo className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Copy">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Paste">
              <Clipboard className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* View Operations */}
          <div className="flex items-center gap-1 px-3 border-r border-gray-300">
            <button className="p-2 hover:bg-gray-100 rounded" title="Zoom In"
              onClick={() => setZoom(prev => Math.min(200, prev + 10))}>
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm">{zoom}%</span>
            <button className="p-2 hover:bg-gray-100 rounded" title="Zoom Out"
              onClick={() => setZoom(prev => Math.max(50, prev - 10))}>
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              className={`p-2 hover:bg-gray-100 rounded ${showGrid ? 'bg-blue-100' : ''}`}
              title="Toggle Grid"
              onClick={() => setShowGrid(!showGrid)}>
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>

          {/* Arrange Operations */}
          <div className="flex items-center gap-1 px-3">
            <button className="p-2 hover:bg-gray-100 rounded" title="Lock">
              <Lock className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Unlock">
              <Unlock className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Layers">
              <Layers className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Show">
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Data Grid Toggle */}
          <div className="ml-auto">
            <button
              className={`px-3 py-1 rounded text-sm ${showDataGrid ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setShowDataGrid(!showDataGrid)}>
              <FileText className="w-4 h-4 inline mr-1" />
              Equipment List
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Library */}
        <div className="w-64 bg-white border-r border-gray-300 flex flex-col">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Components</h3>
          </div>
          <ComponentLibrary />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-50 relative overflow-hidden">
            <CanvasProfessional showGrid={showGrid} zoom={zoom} />
          </div>

          {/* Data Grid (Collapsible) */}
          {showDataGrid && (
            <div className="h-80 border-t border-gray-300 bg-white">
              <DataGridEnhanced />
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        {selectedEquipment ? (
          <div className="w-80 bg-white border-l border-gray-300">
            <PropertiesPanel />
          </div>
        ) : (
          <div className="w-80 bg-white border-l border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">Properties</div>
              <div className="text-sm">Select an element to view properties</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-300 px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Ready</span>
            <span className="text-gray-600">100% • A4 (210mm × 297mm)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 hover:bg-gray-100 rounded disabled:opacity-50">
              ←
            </button>
            <span className="px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 hover:bg-gray-100 rounded disabled:opacity-50">
              →
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">Objects: {useStore.getState().equipment.length}</span>
            <span className="text-gray-600">Modified</span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}