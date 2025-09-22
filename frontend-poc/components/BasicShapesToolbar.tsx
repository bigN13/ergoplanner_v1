'use client';

import React from 'react';
import BasicShape from './symbols/BasicShapes';
import { MousePointer, Square, Type, PenTool } from 'lucide-react';
import { useDrawing } from '@/lib/drawing-context';

export default function BasicShapesToolbar() {
  const { selectedTool, setSelectedTool } = useDrawing();

  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer },
    { id: 'rectangle', name: 'Rectangle', component: BasicShape, type: 'rectangle' },
    { id:'circle', name: 'Circle', component: BasicShape, type: 'circle' },
    { id: 'diamond', name: 'Diamond', component: BasicShape, type: 'diamond' },
    { id: 'triangle', name: 'Triangle', component: BasicShape, type: 'triangle' },
    { id: 'line', name: 'Line', component: BasicShape, type: 'line' },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'note', name: 'Note', component: BasicShape, type: 'note' },
    { id: 'freehand', name: 'Freehand', icon: PenTool },
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId as 'select' | 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note' | 'freehand');
  };

  return (
    <div className="bg-white border-b border-gray-300 px-2 py-1">
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const ShapeComponent = tool.component;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                selectedTool === tool.id ? 'bg-blue-100 border border-blue-300' : ''
              }`}
              title={tool.name}
            >
              {IconComponent ? (
                <IconComponent className="w-4 h-4" />
              ) : ShapeComponent ? (
                <ShapeComponent type={tool.type as 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note'} width={16} height={16} />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}