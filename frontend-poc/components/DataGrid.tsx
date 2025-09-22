'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Edit3, Trash2 } from 'lucide-react';

export default function DataGrid() {
  const { equipment, updateEquipment, deleteEquipment, selectEquipment } = useStore();

  const handleInputChange = (equipmentId: string, field: string, value: string | number) => {
    const eq = equipment.find(e => e.id === equipmentId);
    if (eq) {
      updateEquipment(equipmentId, {
        properties: { ...eq.properties, [field]: value }
      });
    }
  };

  const handleStatusChange = (equipmentId: string, status: string) => {
    const eq = equipment.find(e => e.id === equipmentId);
    if (eq) {
      updateEquipment(equipmentId, {
        properties: { ...eq.properties, status: status as any }
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Equipment List</h3>
        <p className="text-sm text-gray-500">
          {equipment.length} equipment items
        </p>
      </div>

      {equipment.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No Equipment Added</div>
          <div className="text-sm">Add equipment using the canvas toolbar above</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flow/Capacity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Power
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      value={eq.properties.name}
                      onChange={(e) => handleInputChange(eq.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="capitalize font-medium text-gray-700">
                      {eq.type}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      value={eq.properties.manufacturer || ''}
                      onChange={(e) => handleInputChange(eq.id, 'manufacturer', e.target.value)}
                      placeholder="Enter manufacturer"
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      value={eq.properties.model || ''}
                      onChange={(e) => handleInputChange(eq.id, 'model', e.target.value)}
                      placeholder="Enter model"
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={eq.properties.flow || 0}
                        onChange={(e) => handleInputChange(eq.id, 'flow', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded"
                      />
                      <span className="text-xs text-gray-500">
                        {eq.type === 'tank' ? 'm³' : 'm³/h'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {eq.type === 'pump' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={eq.properties.power || 0}
                          onChange={(e) => handleInputChange(eq.id, 'power', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-20 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded"
                        />
                        <span className="text-xs text-gray-500">kW</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={eq.properties.status || 'offline'}
                      onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm border-0 ${
                        eq.properties.status === 'online' ? 'bg-green-100 text-green-800' :
                        eq.properties.status === 'offline' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button
                        onClick={() => selectEquipment(eq)}
                        className="p-1 hover:bg-blue-100 rounded"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${eq.properties.name}?`)) {
                            deleteEquipment(eq.id);
                          }
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}