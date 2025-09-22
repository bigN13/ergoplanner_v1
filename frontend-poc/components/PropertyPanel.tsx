'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Equipment } from '@/lib/store';
import { X, Save, Trash2 } from 'lucide-react';

export default function PropertyPanel() {
  const { selectedEquipment, updateEquipment, deleteEquipment, selectEquipment } = useStore();
  const [formData, setFormData] = useState<Equipment['properties']>({
    name: '',
    manufacturer: '',
    model: '',
    flow: 0,
    power: 0,
    status: 'offline',
  });

  // Update form when selected equipment changes
  useEffect(() => {
    if (selectedEquipment) {
      setFormData(selectedEquipment.properties);
    }
  }, [selectedEquipment]);

  if (!selectedEquipment) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Equipment Selected</div>
          <div className="text-sm">Click on equipment in the canvas to edit properties</div>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof Equipment['properties'], value: any) => {
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

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Equipment Properties</h3>
          <p className="text-sm text-gray-500 capitalize">{selectedEquipment.type}</p>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Equipment Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., P-101"
            />
          </div>

          {/* Manufacturer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              value={formData.manufacturer || ''}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Grundfos"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              value={formData.model || ''}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CR 15-2"
            />
          </div>

          {/* Flow (for pumps and tanks) */}
          {(selectedEquipment.type === 'pump' || selectedEquipment.type === 'tank') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedEquipment.type === 'pump' ? 'Flow Rate (m³/h)' : 'Capacity (m³)'}
              </label>
              <input
                type="number"
                value={formData.flow || 0}
                onChange={(e) => handleInputChange('flow', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
          )}

          {/* Power (for pumps) */}
          {selectedEquipment.type === 'pump' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Power (kW)
              </label>
              <input
                type="number"
                value={formData.power || 0}
                onChange={(e) => handleInputChange('power', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || 'offline'}
              onChange={(e) => handleInputChange('status', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}