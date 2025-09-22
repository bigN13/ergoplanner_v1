'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Edit3, Trash2, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'name' | 'type' | 'manufacturer' | 'model' | 'flow' | 'power' | 'status';
type SortDirection = 'asc' | 'desc';

export default function DataGridEnhanced() {
  const { equipment, updateEquipment, deleteEquipment, selectEquipment } = useStore();

  // State for search, filter, sort, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and search logic
  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchesSearch = searchQuery === '' ||
        eq.properties.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (eq.properties.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (eq.properties.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesType = filterType === 'all' || eq.type === filterType;
      const matchesStatus = filterStatus === 'all' || eq.properties.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [equipment, searchQuery, filterType, filterStatus]);

  // Sort logic
  const sortedEquipment = useMemo(() => {
    const sorted = [...filteredEquipment].sort((a, b) => {
      let aValue: any = a.properties[sortField as keyof typeof a.properties];
      let bValue: any = b.properties[sortField as keyof typeof b.properties];

      if (sortField === 'type') {
        aValue = a.type;
        bValue = b.type;
      }

      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredEquipment, sortField, sortDirection]);

  // Pagination logic
  const paginatedEquipment = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEquipment.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEquipment, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedEquipment.length / itemsPerPage);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
        properties: { ...eq.properties, status: status as 'online' | 'offline' | 'maintenance' }
      });
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' ?
      <ArrowUp className="w-3 h-3" /> :
      <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full">
      {/* Header with Search and Filters */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Equipment List</h3>
          <p className="text-sm text-gray-500">
            {sortedEquipment.length} of {equipment.length} items
          </p>
        </div>

        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, manufacturer, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="pump">Pumps</option>
            <option value="valve">Valves</option>
            <option value="tank">Tanks</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Items per page */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {sortedEquipment.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <div className="text-lg font-medium mb-2">No Equipment Found</div>
            <div className="text-sm">Try adjusting your search or filters</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-1">
                    Type
                    <SortIcon field="type" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('manufacturer')}
                >
                  <div className="flex items-center gap-1">
                    Manufacturer
                    <SortIcon field="manufacturer" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('model')}
                >
                  <div className="flex items-center gap-1">
                    Model
                    <SortIcon field="model" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('flow')}
                >
                  <div className="flex items-center gap-1">
                    Flow/Capacity
                    <SortIcon field="flow" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('power')}
                >
                  <div className="flex items-center gap-1">
                    Power
                    <SortIcon field="power" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEquipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      value={eq.properties.name}
                      onChange={(e) => handleInputChange(eq.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded text-sm"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="capitalize font-medium text-gray-700 text-sm">
                      {eq.type}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      value={eq.properties.manufacturer || ''}
                      onChange={(e) => handleInputChange(eq.id, 'manufacturer', e.target.value)}
                      placeholder="Enter manufacturer"
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded text-sm"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      value={eq.properties.model || ''}
                      onChange={(e) => handleInputChange(eq.id, 'model', e.target.value)}
                      placeholder="Enter model"
                      className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded text-sm"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={eq.properties.flow || 0}
                        onChange={(e) => handleInputChange(eq.id, 'flow', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded text-sm"
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
                          className="w-20 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded text-sm"
                        />
                        <span className="text-xs text-gray-500">kW</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={eq.properties.status || 'offline'}
                      onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs border-0 ${
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
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedEquipment.length)} of {sortedEquipment.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-1">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}