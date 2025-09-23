'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

export interface Symbol {
  id: string;
  type: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  defaultData: any;
}

const symbolCategories = [
  {
    name: 'Pumps & Compressors',
    symbols: [
      {
        id: 'pump-centrifugal',
        type: 'pump',
        label: 'Centrifugal Pump',
        category: 'Pumps & Compressors',
        defaultData: {
          label: 'P-101',
          type: 'centrifugal',
          flowRate: '100 m³/h',
          head: '50 m',
        },
      },
      {
        id: 'compressor',
        type: 'compressor',
        label: 'Compressor',
        category: 'Pumps & Compressors',
        defaultData: {
          label: 'C-101',
          type: 'centrifugal',
          pressure: '10 bar',
        },
      },
    ],
  },
  {
    name: 'Valves',
    symbols: [
      {
        id: 'valve-gate',
        type: 'valve',
        label: 'Gate Valve',
        category: 'Valves',
        defaultData: {
          label: 'V-101',
          type: 'gate',
          state: 'open',
          size: 'DN100',
        },
      },
      {
        id: 'valve-control',
        type: 'controlValve',
        label: 'Control Valve',
        category: 'Valves',
        defaultData: {
          label: 'CV-101',
          controlType: 'pneumatic',
          position: 50,
        },
      },
      {
        id: 'valve-check',
        type: 'checkValve',
        label: 'Check Valve',
        category: 'Valves',
        defaultData: {
          label: 'CHK-101',
          type: 'swing',
          flowDirection: 'left-to-right',
        },
      },
    ],
  },
  {
    name: 'Tanks & Vessels',
    symbols: [
      {
        id: 'tank-storage',
        type: 'tank',
        label: 'Storage Tank',
        category: 'Tanks & Vessels',
        defaultData: {
          label: 'T-101',
          type: 'storage',
          capacity: '1000 m³',
          level: 50,
        },
      },
      {
        id: 'tank-pressure',
        type: 'tank',
        label: 'Pressure Vessel',
        category: 'Tanks & Vessels',
        defaultData: {
          label: 'V-101',
          type: 'pressure',
          capacity: '500 m³',
          level: 30,
        },
      },
    ],
  },
  {
    name: 'Piping',
    symbols: [
      {
        id: 'pipe-horizontal',
        type: 'pipe',
        label: 'Horizontal Pipe',
        category: 'Piping',
        defaultData: {
          label: '',
          diameter: 'DN100',
          material: 'Steel',
          orientation: 'horizontal',
        },
      },
      {
        id: 'pipe-vertical',
        type: 'pipe',
        label: 'Vertical Pipe',
        category: 'Piping',
        defaultData: {
          label: '',
          diameter: 'DN100',
          material: 'Steel',
          orientation: 'vertical',
        },
      },
      {
        id: 'pipe-elbow',
        type: 'pipe',
        label: 'Elbow',
        category: 'Piping',
        defaultData: {
          label: '',
          diameter: 'DN100',
          material: 'Steel',
          orientation: 'elbow',
        },
      },
      {
        id: 'pipe-tee',
        type: 'pipe',
        label: 'Tee',
        category: 'Piping',
        defaultData: {
          label: '',
          diameter: 'DN100',
          material: 'Steel',
          orientation: 'tee',
        },
      },
      {
        id: 'pipe-cross',
        type: 'pipe',
        label: 'Cross',
        category: 'Piping',
        defaultData: {
          label: '',
          diameter: 'DN100',
          material: 'Steel',
          orientation: 'cross',
        },
      },
    ],
  },
  {
    name: 'Instruments',
    symbols: [
      {
        id: 'flow-meter',
        type: 'flowMeter',
        label: 'Flow Meter',
        category: 'Instruments',
        defaultData: {
          label: 'FI-101',
          type: 'electromagnetic',
          unit: 'm³/h',
          value: '0.0',
        },
      },
      {
        id: 'pressure-gauge',
        type: 'pressureGauge',
        label: 'Pressure Gauge',
        category: 'Instruments',
        defaultData: {
          label: 'PI-101',
          unit: 'bar',
          value: '0.0',
          maxPressure: '10 bar',
        },
      },
    ],
  },
  {
    name: 'Heat Transfer',
    symbols: [
      {
        id: 'heat-exchanger',
        type: 'heatExchanger',
        label: 'Heat Exchanger',
        category: 'Heat Transfer',
        defaultData: {
          label: 'HX-101',
          type: 'shell-tube',
          duty: '1000 kW',
        },
      },
    ],
  },
];

interface SymbolLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export default function SymbolLibrary({ onDragStart }: SymbolLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(symbolCategories.map(cat => cat.name))
  );

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = symbolCategories.map(category => ({
    ...category,
    symbols: category.symbols.filter(symbol =>
      symbol.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.symbols.length > 0);

  const renderSymbolIcon = (type: string) => {
    // Simplified icon representations for the library
    const iconMap: { [key: string]: React.ReactNode } = {
      pump: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="12" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <path d="M 10 15 L 20 10 L 20 20 Z" fill="currentColor" />
        </svg>
      ),
      valve: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M 8 15 L 15 8 L 15 22 Z M 22 15 L 15 8 L 15 22 Z" fill="currentColor" stroke="currentColor" />
        </svg>
      ),
      controlValve: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M 8 15 L 15 8 L 15 22 Z M 22 15 L 15 8 L 15 22 Z" fill="currentColor" stroke="currentColor" />
          <rect x="10" y="3" width="10" height="5" stroke="currentColor" fill="white" />
        </svg>
      ),
      checkValve: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <path d="M 10 15 L 18 15 M 18 15 L 15 12 M 18 15 L 15 18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      tank: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="8" y="8" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <rect x="9" y="18" width="12" height="7" fill="#E0E7FF" opacity="0.5" />
        </svg>
      ),
      pipe: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <line x1="5" y1="15" x2="25" y2="15" stroke="currentColor" strokeWidth="3" />
        </svg>
      ),
      flowMeter: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <text x="15" y="19" textAnchor="middle" fontSize="8" fontWeight="bold">FI</text>
        </svg>
      ),
      pressureGauge: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="13" r="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <text x="15" y="16" textAnchor="middle" fontSize="8" fontWeight="bold">PI</text>
          <line x1="15" y1="21" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      heatExchanger: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="5" y="10" width="20" height="10" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <line x1="8" y1="13" x2="22" y2="13" stroke="#EF4444" strokeWidth="1" />
          <line x1="8" y1="17" x2="22" y2="17" stroke="#3B82F6" strokeWidth="1" />
        </svg>
      ),
      compressor: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="10" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <path d="M 15 10 L 12 15 L 15 20 M 15 10 L 18 15 L 15 20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    };

    return iconMap[type] || iconMap.pipe;
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Symbol Library</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map((category) => (
          <div key={category.name} className="mb-2">
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span>{category.name}</span>
              {expandedCategories.has(category.name) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedCategories.has(category.name) && (
              <div className="mt-1 grid grid-cols-2 gap-1.5 px-2">
                {category.symbols.map((symbol) => (
                  <div
                    key={symbol.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, symbol.type, symbol.defaultData)}
                    className="flex cursor-move flex-col items-center rounded border border-gray-200 bg-white p-2 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="mb-1 text-gray-700">
                      {renderSymbolIcon(symbol.type)}
                    </div>
                    <span className="text-xs text-gray-600">{symbol.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-3">
        <p className="text-xs text-gray-500">
          Drag symbols to the canvas to add them to your P&ID diagram
        </p>
      </div>
    </div>
  );
}