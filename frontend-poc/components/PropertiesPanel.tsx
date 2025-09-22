'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Equipment } from '@/lib/store';
import { X, Save, Trash2, Copy, Palette, Settings, Info } from 'lucide-react';

export default function PropertiesPanel() {
  const { selectedEquipment, updateEquipment, deleteEquipment, selectEquipment } = useStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'style' | 'advanced'>('properties');
  const [formData, setFormData] = useState<Equipment['properties']>({
    name: '',
    manufacturer: '',
    model: '',
    flow: 0,
    power: 0,
    status: 'offline',
  });

  // Style settings
  const [styleSettings, setStyleSettings] = useState({
    fillColor: '#3B82F6',
    strokeColor: '#1E40AF',
    strokeWidth: 2,
    opacity: 100,
  });

  // Update form when selected equipment changes
  useEffect(() => {
    if (selectedEquipment) {
      setFormData(selectedEquipment.properties);
    }
  }, [selectedEquipment]);

  if (!selectedEquipment) {
    return null;
  }

  const handleInputChange = (field: keyof Equipment['properties'], value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateEquipment(selectedEquipment.id, { properties: formData });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedEquipment.properties.name}?`)) {
      deleteEquipment(selectedEquipment.id);
      selectEquipment(null);
    }
  };

  const handleClose = () => {
    selectEquipment(null);
  };

  const handleDuplicate = () => {
    const timestamp = Date.now();
    const newEquipment: Equipment = {
      ...selectedEquipment,
      id: `${selectedEquipment.type}-${timestamp}`,
      position: {
        x: selectedEquipment.position.x + 50,
        y: selectedEquipment.position.y + 50,
      },
      properties: {
        ...selectedEquipment.properties,
        name: `${selectedEquipment.properties.name}-COPY`,
      },
    };
    useStore.getState().addEquipment(newEquipment);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
          <p className="text-xs text-gray-500 capitalize">{selectedEquipment.type}</p>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === 'properties'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Settings className="w-3 h-3 inline mr-1" />
          Properties
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Palette className="w-3 h-3 inline mr-1" />
          Style
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === 'advanced'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Info className="w-3 h-3 inline mr-1" />
          Advanced
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {/* Equipment ID */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Equipment ID
              </label>
              <input
                type="text"
                value={selectedEquipment.id}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50"
              />
            </div>

            {/* Equipment Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Equipment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., P-101"
              />
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Grundfos"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CR 15-2"
              />
            </div>

            {/* Flow (for pumps and tanks) */}
            {(selectedEquipment.type === 'pump' || selectedEquipment.type === 'tank') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {selectedEquipment.type === 'pump' ? 'Flow Rate (m³/h)' : 'Capacity (m³)'}
                </label>
                <input
                  type="number"
                  value={formData.flow || 0}
                  onChange={(e) => handleInputChange('flow', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            )}

            {/* Power (for pumps) */}
            {selectedEquipment.type === 'pump' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Power (kW)
                </label>
                <input
                  type="number"
                  value={formData.power || 0}
                  onChange={(e) => handleInputChange('power', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'offline'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  X Position
                </label>
                <input
                  type="number"
                  value={Math.round(selectedEquipment.position.x)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Y Position
                </label>
                <input
                  type="number"
                  value={Math.round(selectedEquipment.position.y)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Fill Color */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fill Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styleSettings.fillColor}
                  onChange={(e) => setStyleSettings({ ...styleSettings, fillColor: e.target.value })}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styleSettings.fillColor}
                  onChange={(e) => setStyleSettings({ ...styleSettings, fillColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Stroke Color */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stroke Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styleSettings.strokeColor}
                  onChange={(e) => setStyleSettings({ ...styleSettings, strokeColor: e.target.value })}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styleSettings.strokeColor}
                  onChange={(e) => setStyleSettings({ ...styleSettings, strokeColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stroke Width
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={styleSettings.strokeWidth}
                onChange={(e) => setStyleSettings({ ...styleSettings, strokeWidth: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{styleSettings.strokeWidth}px</div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={styleSettings.opacity}
                onChange={(e) => setStyleSettings({ ...styleSettings, opacity: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{styleSettings.opacity}%</div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <div className="mb-3">
                <div className="font-medium text-gray-700 mb-1">Equipment Type</div>
                <div className="capitalize">{selectedEquipment.type}</div>
              </div>

              <div className="mb-3">
                <div className="font-medium text-gray-700 mb-1">Created</div>
                <div>{new Date(parseInt(selectedEquipment.id.split('-')[1])).toLocaleString()}</div>
              </div>

              <div className="mb-3">
                <div className="font-medium text-gray-700 mb-1">Connections</div>
                <div>0 connections</div>
              </div>

              <div className="mb-3">
                <div className="font-medium text-gray-700 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">P&ID</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Sheet-1</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleDuplicate}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}