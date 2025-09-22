'use client';

import React, { useState } from 'react';
import { useStore, Equipment } from '@/lib/store';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

interface ComponentCategory {
  name: string;
  icon: string;
  items: ComponentItem[];
}

interface ComponentItem {
  name: string;
  type: Equipment['type'];
  icon: string;
  description: string;
}

const categories: ComponentCategory[] = [
  {
    name: 'Process Equipment',
    icon: '⚙️',
    items: [
      { name: 'Centrifugal Pump', type: 'pump', icon: '🔵', description: 'Standard centrifugal pump' },
      { name: 'Positive Displacement', type: 'pump', icon: '🔷', description: 'PD pump for high pressure' },
      { name: 'Vacuum Pump', type: 'pump', icon: '🟦', description: 'For vacuum applications' },
    ],
  },
  {
    name: 'Valves',
    icon: '🚰',
    items: [
      { name: 'Gate Valve', type: 'valve', icon: '🔴', description: 'On/off isolation valve' },
      { name: 'Globe Valve', type: 'valve', icon: '🔶', description: 'Flow control valve' },
      { name: 'Check Valve', type: 'valve', icon: '🟥', description: 'Prevents backflow' },
      { name: 'Ball Valve', type: 'valve', icon: '🟧', description: 'Quarter-turn valve' },
    ],
  },
  {
    name: 'Storage',
    icon: '🏗️',
    items: [
      { name: 'Vertical Tank', type: 'tank', icon: '🟩', description: 'Vertical storage tank' },
      { name: 'Horizontal Tank', type: 'tank', icon: '🟢', description: 'Horizontal storage tank' },
      { name: 'Pressurized Vessel', type: 'tank', icon: '🟪', description: 'Pressure-rated vessel' },
    ],
  },
];

export default function ComponentLibrary() {
  const { addEquipment } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Process Equipment', 'Valves', 'Storage']);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleDragStart = (e: React.DragEvent, item: ComponentItem) => {
    e.dataTransfer.setData('componentType', item.type);
    e.dataTransfer.setData('componentName', item.name);
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
                      <span className="text-lg mt-0.5">{item.icon}</span>
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