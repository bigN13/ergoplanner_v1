'use client';

import React, { useState } from 'react';
import { useStore, Equipment } from '@/lib/store';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import PIDSymbol from './symbols/PIDSymbol';

interface ComponentCategory {
  name: string;
  icon: string;
  items: ComponentItem[];
}

interface ComponentItem {
  name: string;
  type: Equipment['type'];
  pidSymbol: 'centrifugal_pump' | 'gate_valve' | 'globe_valve' | 'check_valve' | 'ball_valve' | 'vertical_tank' | 'horizontal_tank' | 'pressure_vessel';
  description: string;
}

const categories: ComponentCategory[] = [
  {
    name: 'Pumps',
    icon: '⚙️',
    items: [
      { name: 'Centrifugal Pump', type: 'pump', pidSymbol: 'centrifugal_pump', description: 'Standard centrifugal pump for water systems' },
    ],
  },
  {
    name: 'Valves',
    icon: '🚰',
    items: [
      { name: 'Gate Valve', type: 'valve', pidSymbol: 'gate_valve', description: 'On/off isolation valve' },
      { name: 'Globe Valve', type: 'valve', pidSymbol: 'globe_valve', description: 'Flow control valve' },
      { name: 'Check Valve', type: 'valve', pidSymbol: 'check_valve', description: 'Prevents backflow' },
      { name: 'Ball Valve', type: 'valve', pidSymbol: 'ball_valve', description: 'Quarter-turn valve' },
    ],
  },
  {
    name: 'Vessels & Tanks',
    icon: '🏗️',
    items: [
      { name: 'Vertical Tank', type: 'tank', pidSymbol: 'vertical_tank', description: 'Vertical storage tank' },
      { name: 'Horizontal Tank', type: 'tank', pidSymbol: 'horizontal_tank', description: 'Horizontal storage tank' },
      { name: 'Pressure Vessel', type: 'tank', pidSymbol: 'pressure_vessel', description: 'Pressure-rated vessel' },
    ],
  },
];

export default function ComponentLibrary() {
  const { addEquipment } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Pumps', 'Valves', 'Vessels & Tanks']);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleDragStart = (e: React.DragEvent, item: ComponentItem) => {
    // Use text/plain format for better browser compatibility
    const dragData = JSON.stringify({ type: item.type, name: item.name });
    e.dataTransfer.setData('text/plain', dragData);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = (item: ComponentItem) => {
    const timestamp = Date.now();
    const newEquipment: Equipment = {
      id: `${item.type}-${timestamp}`,
      type: item.type,
      position: {
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      properties: {
        name: `${item.type.toUpperCase()}-${timestamp.toString().slice(-3)}`,
        manufacturer: item.type === 'pump' ? 'Grundfos' : item.type === 'valve' ? 'Danfoss' : 'Storage Co',
        model: item.name,
        flow: item.type === 'pump' ? 20 : item.type === 'tank' ? 1000 : undefined,
        power: item.type === 'pump' ? 1.5 : undefined,
        status: 'offline',
      },
    };
    addEquipment(newEquipment);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.items.length > 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.name} className="border-b border-gray-200">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              {expandedCategories.includes(category.name) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700">{category.icon} {category.name}</span>
              <span className="ml-auto text-xs text-gray-500">({category.items.length})</span>
            </button>

            {/* Category Items */}
            {expandedCategories.includes(category.name) && (
              <div className="px-2 py-1">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDoubleClick={() => handleDoubleClick(item)}
                    className="mb-1 p-2 bg-white border border-gray-200 rounded cursor-move hover:border-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-gray-700">
                        <PIDSymbol type={item.pidSymbol} width={32} height={32} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-400 group-hover:text-gray-600">
                      Drag to canvas or double-click
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <div className="text-sm">No components found</div>
            <div className="text-xs mt-1">Try a different search term</div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">How to use:</div>
          <div>• Drag components to canvas</div>
          <div>• Double-click to add at center</div>
          <div>• Connect with pipes</div>
        </div>
      </div>
    </div>
  );
}