'use client';

import React from 'react';
import Canvas from '@/components/Canvas';
import PropertyPanel from '@/components/PropertyPanel';
import DataGrid from '@/components/DataGrid';
import ChatInterface from '@/components/ChatInterface';
import { useStore } from '@/lib/store';

export default function Home() {
  const { selectedEquipment } = useStore();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Ergoplanner AI Suite - POC
            </h1>
            <p className="text-sm text-gray-600">
              P&ID Management System with AI Assistant
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Proof of Concept • ReactFlow + AI Integration
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <div className="flex-1">
            <Canvas />
          </div>

          {/* Data Grid */}
          <div className="h-80 border-t border-gray-200 p-4 overflow-hidden">
            <DataGrid />
          </div>
        </div>

        {/* Property Panel (conditional) */}
        {selectedEquipment && <PropertyPanel />}
      </div>

      {/* Chat Interface */}
      <ChatInterface />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Features: Drag & Drop • Custom Properties • Data Grid Sync • AI Commands
          </div>
          <div>
            Try: &ldquo;Add a pump&rdquo; • &ldquo;Create a tank&rdquo; • &ldquo;List equipment&rdquo;
          </div>
        </div>
      </footer>
    </div>
  );
}