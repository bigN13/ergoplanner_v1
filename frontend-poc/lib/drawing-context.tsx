'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type DrawingTool = 'select' | 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note' | 'freehand';

interface DrawingContextType {
  selectedTool: DrawingTool;
  setSelectedTool: (tool: DrawingTool) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export function DrawingProvider({ children }: { children: ReactNode }) {
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [isDrawing, setIsDrawing] = useState(false);

  return (
    <DrawingContext.Provider value={{ selectedTool, setSelectedTool, isDrawing, setIsDrawing }}>
      {children}
    </DrawingContext.Provider>
  );
}

export function useDrawing() {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within a DrawingProvider');
  }
  return context;
}