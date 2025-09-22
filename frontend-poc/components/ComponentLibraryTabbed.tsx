'use client';

import React, { useState } from 'react';
import { useStore, Equipment } from '@/lib/store';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import PIDSymbol from './symbols/PIDSymbol';
import BasicShape from './symbols/BasicShapes';

interface ComponentItem {
  name: string;
  type: Equipment['type'] | 'basic-shape';
  pidSymbol?: 'centrifugal_pump' | 'gate_valve' | 'globe_valve' | 'check_valve' | 'ball_valve' | 'vertical_tank' | 'horizontal_tank' | 'pressure_vessel';
  basicShape?: 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note';
  description: string;
  manufacturer?: string;
  flow?: number;
  power?: number;
}

interface StencilTab {
  id: string;
  name: string;
  items: ComponentItem[];
}

const stencilTabs: StencilTab[] = [
  {
    id: 'general',
    name: 'General',
    items: [
      { name: 'Rectangle', type: 'basic-shape', basicShape: 'rectangle', description: 'Basic rectangle shape' },
      { name: 'Circle', type: 'basic-shape', basicShape: 'circle', description: 'Basic circle shape' },
      { name: 'Diamond', type: 'basic-shape', basicShape: 'diamond', description: 'Basic diamond shape' },
      { name: 'Triangle', type: 'basic-shape', basicShape: 'triangle', description: 'Basic triangle shape' },
      { name: 'Line', type: 'basic-shape', basicShape: 'line', description: 'Basic line' },
      { name: 'Text', type: 'basic-shape', basicShape: 'text', description: 'Text label' },
      { name: 'Note', type: 'basic-shape', basicShape: 'note', description: 'Text note' },
    ],
  },
  {
    id: 'pid',
    name: 'P&ID',
    items: [
      {
        name: 'Centrifugal Pump',
        type: 'pump',
        pidSymbol: 'centrifugal_pump',
        description: 'Standard centrifugal pump for water systems',
        manufacturer: 'Grundfos',
        flow: 50,
        power: 15
      },
      {
        name: 'Gate Valve',
        type: 'valve',
        pidSymbol: 'gate_valve',
        description: 'Gate valve for isolation and on/off control',
        manufacturer: 'Danfoss'
      },
      {
        name: 'Globe Valve',
        type: 'valve',
        pidSymbol: 'globe_valve',
        description: 'Globe valve for flow control applications',
        manufacturer: 'Emerson'
      },
      {
        name: 'Check Valve',
        type: 'valve',
        pidSymbol: 'check_valve',
        description: 'Check valve to prevent backflow',
        manufacturer: 'Cameron'
      },
      {
        name: 'Ball Valve',
        type: 'valve',
        pidSymbol: 'ball_valve',
        description: 'Ball valve for quick shut-off applications',
        manufacturer: 'Fisher'
      },
      {
        name: 'Storage Tank',
        type: 'tank',
        pidSymbol: 'vertical_tank',
        description: 'Vertical storage tank for liquids',
        manufacturer: 'Steel Tank Co',
        flow: 5000
      },
      {
        name: 'Horizontal Tank',
        type: 'tank',
        pidSymbol: 'horizontal_tank',
        description: 'Horizontal storage vessel',
        manufacturer: 'CST Industries',
        flow: 3000
      },
      {
        name: 'Pressure Vessel',
        type: 'tank',
        pidSymbol: 'pressure_vessel',
        description: 'High-pressure storage vessel',
        manufacturer: 'McDermott',
        flow: 2000
      },
    ],
  },
  {
    id: 'pumps',
    name: 'Pumps',
    items: [
      {
        name: 'Centrifugal Pump',
        type: 'pump',
        pidSymbol: 'centrifugal_pump',
        description: 'Standard centrifugal pump',
        manufacturer: 'Grundfos',
        flow: 20,
        power: 1.5
      },
      {
        name: 'Booster Pump',
        type: 'pump',
        pidSymbol: 'centrifugal_pump',
        description: 'High-pressure booster pump',
        manufacturer: 'KSB',
        flow: 100,
        power: 22
      },
      {
        name: 'Submersible Pump',
        type: 'pump',
        pidSymbol: 'centrifugal_pump',
        description: 'Submersible water pump',
        manufacturer: 'Wilo',
        flow: 75,
        power: 11
      },
    ],
  },
  {
    id: 'valves',
    name: 'Valves',
    items: [
      { name: 'Gate Valve', type: 'valve', pidSymbol: 'gate_valve', description: 'Isolation gate valve', manufacturer: 'Danfoss' },
      { name: 'Globe Valve', type: 'valve', pidSymbol: 'globe_valve', description: 'Throttling globe valve', manufacturer: 'Emerson' },
      { name: 'Check Valve', type: 'valve', pidSymbol: 'check_valve', description: 'Non-return check valve', manufacturer: 'Cameron' },
      { name: 'Ball Valve', type: 'valve', pidSymbol: 'ball_valve', description: 'Quarter-turn ball valve', manufacturer: 'Fisher' },
    ],
  },
  {
    id: 'tanks',
    name: 'Tanks',
    items: [
      { name: 'Vertical Tank', type: 'tank', pidSymbol: 'vertical_tank', description: 'Vertical storage tank', manufacturer: 'Steel Tank Co', flow: 5000 },
      { name: 'Horizontal Tank', type: 'tank', pidSymbol: 'horizontal_tank', description: 'Horizontal vessel', manufacturer: 'CST Industries', flow: 3000 },
      { name: 'Pressure Vessel', type: 'tank', pidSymbol: 'pressure_vessel', description: 'High-pressure vessel', manufacturer: 'McDermott', flow: 2000 },
    ],
  },
];

export default function ComponentLibraryTabbed() {
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['general']);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<ComponentItem | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const { addEquipment } = useStore();

  const togglePanel = (panelId: string) => {
    setExpandedPanels(prev =>
      prev.includes(panelId)
        ? prev.filter(id => id !== panelId)
        : [...prev, panelId]
    );
  };

  const handleDragStart = (e: React.DragEvent, item: ComponentItem) => {
    const dragData = JSON.stringify({
      type: item.type === 'basic-shape' ? 'shape' : item.type,
      name: item.name,
      shape: item.basicShape,
      pidSymbol: item.pidSymbol
    });
    e.dataTransfer.setData('text/plain', dragData);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = (item: ComponentItem) => {
    if (item.type === 'basic-shape') {
      // Handle basic shapes - skip for now as they're handled via drag-drop
      return;
    }

    const timestamp = Date.now();
    const newEquipment: Equipment = {
      id: `${item.type}-${timestamp}`,
      type: item.type as Equipment['type'],
      position: {
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      properties: {
        name: `${item.type.toUpperCase()}-${timestamp.toString().slice(-3)}`,
        manufacturer: item.manufacturer || (item.type === 'pump' ? 'Grundfos' : item.type === 'valve' ? 'Danfoss' : 'Storage Co'),
        model: item.name,
        flow: item.flow || (item.type === 'pump' ? 20 : item.type === 'tank' ? 1000 : undefined),
        power: item.power || (item.type === 'pump' ? 1.5 : undefined),
        status: 'offline',
      },
    };
    addEquipment(newEquipment);
  };

  const handleMouseEnter = (e: React.MouseEvent, item: ComponentItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const getFilteredItems = (items: ComponentItem[]) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Search Bar */}
        <div className="p-2 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search shapes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Collapsible Panels */}
        <div className="flex-1 overflow-y-auto">
          {stencilTabs.map((tab) => {
            const isExpanded = expandedPanels.includes(tab.id);
            const filteredItems = getFilteredItems(tab.items);

            return (
              <div key={tab.id} className="border-b border-gray-200">
                {/* Panel Header */}
                <button
                  onClick={() => togglePanel(tab.id)}
                  className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    {tab.name}
                  </span>
                  <span className="text-gray-400">({filteredItems.length})</span>
                </button>

                {/* Panel Content */}
                {isExpanded && (
                  <div className="p-2 bg-gray-50">
                    <div className="grid grid-cols-3 gap-1">
                      {filteredItems.map((item) => (
                        <div
                          key={item.name}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDoubleClick={() => handleDoubleClick(item)}
                          onMouseEnter={(e) => handleMouseEnter(e, item)}
                          onMouseLeave={handleMouseLeave}
                          className="w-20 h-20 border border-gray-200 rounded p-1 cursor-move hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-center group bg-white"
                          title={item.name}
                        >
                          {item.pidSymbol ? (
                            <PIDSymbol type={item.pidSymbol} width={24} height={24} />
                          ) : item.basicShape ? (
                            <BasicShape type={item.basicShape} width={24} height={24} />
                          ) : null}
                        </div>
                      ))}
                    </div>
                    {filteredItems.length === 0 && (
                      <div className="text-center text-gray-500 text-xs py-4">
                        No items match your search
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Hover Tooltip - like diagrams.net */}
      {hoveredItem && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg p-3 max-w-xs"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              {hoveredItem.pidSymbol ? (
                <PIDSymbol type={hoveredItem.pidSymbol} width={32} height={32} />
              ) : hoveredItem.basicShape ? (
                <BasicShape type={hoveredItem.basicShape} width={32} height={32} />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900">{hoveredItem.name}</div>
              <div className="text-xs text-gray-600 mt-1">{hoveredItem.description}</div>
              {hoveredItem.manufacturer && (
                <div className="text-xs text-gray-500 mt-1">
                  <strong>Manufacturer:</strong> {hoveredItem.manufacturer}
                </div>
              )}
              {hoveredItem.flow && (
                <div className="text-xs text-gray-500">
                  <strong>Capacity:</strong> {hoveredItem.flow} {hoveredItem.type === 'pump' ? 'm³/h' : 'm³'}
                </div>
              )}
              {hoveredItem.power && (
                <div className="text-xs text-gray-500">
                  <strong>Power:</strong> {hoveredItem.power} kW
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}