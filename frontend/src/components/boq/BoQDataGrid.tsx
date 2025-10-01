"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Download,
  Upload,
  Calculator,
  RefreshCw,
} from 'lucide-react';

import type { BoQItem, BoQGridColumn, BoQGridState, BoQSearchFilters } from '../../types/boq';

interface BoQDataGridProps {
  items: BoQItem[];
  onItemUpdate: (id: string, updates: Partial<BoQItem>) => void;
  onItemDelete: (id: string) => void;
  onItemAdd: (item: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBulkUpdate?: (updates: Array<{ id: string; updates: Partial<BoQItem> }>) => void;
  onCalculateCosts?: () => void;
  onExport?: (format: 'csv' | 'excel') => void;
  onImport?: (file: File) => void;
  loading?: boolean;
  readOnly?: boolean;
  showActions?: boolean;
  showTotals?: boolean;
  customColumns?: BoQGridColumn[];
}

const DEFAULT_COLUMNS: BoQGridColumn[] = [
  {
    id: 'category',
    title: 'Category',
    field: 'category',
    width: 120,
    sortable: true,
    filterable: true,
    editable: true,
  },
  {
    id: 'description',
    title: 'Description',
    field: 'description',
    width: 250,
    sortable: true,
    filterable: true,
    editable: true,
    validator: (value) => !value ? 'Description is required' : null,
  },
  {
    id: 'specification',
    title: 'Specification',
    field: 'specification',
    width: 200,
    sortable: true,
    filterable: true,
    editable: true,
  },
  {
    id: 'quantity',
    title: 'Qty',
    field: 'quantity',
    width: 80,
    sortable: true,
    filterable: true,
    editable: true,
    formatter: 'number',
    aggregation: 'sum',
    validator: (value) => {
      const num = Number(value);
      return isNaN(num) || num < 0 ? 'Must be a positive number' : null;
    },
  },
  {
    id: 'unit',
    title: 'Unit',
    field: 'unit',
    width: 60,
    sortable: true,
    filterable: true,
    editable: true,
  },
  {
    id: 'unitPrice',
    title: 'Unit Price',
    field: 'unitPrice',
    width: 100,
    sortable: true,
    filterable: true,
    editable: true,
    formatter: 'currency',
    validator: (value) => {
      const num = Number(value);
      return isNaN(num) || num < 0 ? 'Must be a positive number' : null;
    },
  },
  {
    id: 'totalPrice',
    title: 'Total Price',
    field: 'totalPrice',
    width: 120,
    sortable: true,
    filterable: true,
    editable: false,
    formatter: 'currency',
    aggregation: 'sum',
  },
  {
    id: 'supplier',
    title: 'Supplier',
    field: 'supplier',
    width: 120,
    sortable: true,
    filterable: true,
    editable: true,
  },
  {
    id: 'status',
    title: 'Status',
    field: 'status',
    width: 100,
    sortable: true,
    filterable: true,
    editable: true,
  },
];

export const BoQDataGrid: React.FC<BoQDataGridProps> = ({
  items,
  onItemUpdate,
  onItemDelete,
  onItemAdd,
  onBulkUpdate,
  onCalculateCosts,
  onExport,
  onImport,
  loading = false,
  readOnly = false,
  showActions = true,
  showTotals = true,
  customColumns,
}) => {
  const [gridState, setGridState] = useState<BoQGridState>({
    columns: customColumns || DEFAULT_COLUMNS,
    filters: {},
    selectedRows: [],
    showTotals,
    pageSize: 50,
    currentPage: 0,
  });

  const [searchText, setSearchText] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editingValue, setEditingValue] = useState<any>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState<Partial<BoQItem>>({});

  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized filtered and sorted data
  const processedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchLower) ||
        item.specification.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchLower))
      );
    }

    // Apply column filters
    Object.entries(gridState.filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = gridState.columns.find(col => col.id === columnId);
        if (column) {
          filtered = filtered.filter(item => {
            const itemValue = getItemValue(item, column.field);
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
          });
        }
      }
    });

    // Apply sorting
    if (gridState.sortBy) {
      const column = gridState.columns.find(col => col.id === gridState.sortBy);
      if (column) {
        filtered.sort((a, b) => {
          const aVal = getItemValue(a, column.field);
          const bVal = getItemValue(b, column.field);

          let comparison = 0;
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
          } else {
            comparison = String(aVal).localeCompare(String(bVal));
          }

          return gridState.sortDirection === 'desc' ? -comparison : comparison;
        });
      }
    }

    return filtered;
  }, [items, searchText, gridState.filters, gridState.sortBy, gridState.sortDirection, gridState.columns]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const start = gridState.currentPage * gridState.pageSize;
    const end = start + gridState.pageSize;
    return processedItems.slice(start, end);
  }, [processedItems, gridState.currentPage, gridState.pageSize]);

  // Calculate aggregations
  const aggregations = useMemo(() => {
    const result: Record<string, number> = {};

    gridState.columns.forEach(column => {
      if (column.aggregation) {
        const values = processedItems
          .map(item => getItemValue(item, column.field))
          .filter(val => typeof val === 'number' && !isNaN(val));

        switch (column.aggregation) {
          case 'sum':
            result[column.id] = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            result[column.id] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            break;
          case 'count':
            result[column.id] = values.length;
            break;
          case 'min':
            result[column.id] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            result[column.id] = values.length > 0 ? Math.max(...values) : 0;
            break;
        }
      }
    });

    return result;
  }, [processedItems, gridState.columns]);

  const getItemValue = (item: BoQItem, field: string): any => {
    if (field.includes('.')) {
      const path = field.split('.');
      let value: any = item;
      for (const key of path) {
        value = value?.[key];
      }
      return value;
    }
    return (item as any)[field];
  };

  const formatCellValue = (value: any, formatter?: string): string => {
    if (value == null) return '';

    switch (formatter) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(value) || 0);
      case 'number':
        return new Intl.NumberFormat('en-US').format(Number(value) || 0);
      case 'percentage':
        return `${(Number(value) || 0).toFixed(2)}%`;
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return String(value);
    }
  };

  const handleSort = (columnId: string) => {
    setGridState(prev => ({
      ...prev,
      sortBy: columnId,
      sortDirection:
        prev.sortBy === columnId && prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilter = (columnId: string, value: string) => {
    setGridState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [columnId]: value,
      },
    }));
  };

  const handleCellEdit = (item: BoQItem, column: BoQGridColumn) => {
    if (readOnly || !column.editable) return;

    setEditingCell({ rowId: item.id, columnId: column.id });
    setEditingValue(getItemValue(item, column.field));
    setValidationError(null);
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const column = gridState.columns.find(col => col.id === editingCell.columnId);
    if (!column || !column.validator) {
      commitCellEdit();
      return;
    }

    const error = column.validator(editingValue);
    if (error) {
      setValidationError(error);
      return;
    }

    commitCellEdit();
  };

  const commitCellEdit = () => {
    if (!editingCell) return;

    const column = gridState.columns.find(col => col.id === editingCell.columnId);
    if (column) {
      const updates: Partial<BoQItem> = {
        [column.field]: editingValue,
      };

      // Auto-calculate total price when quantity or unit price changes
      if (column.field === 'quantity' || column.field === 'unitPrice') {
        const item = items.find(i => i.id === editingCell.rowId);
        if (item) {
          const quantity = column.field === 'quantity' ? Number(editingValue) : item.quantity;
          const unitPrice = column.field === 'unitPrice' ? Number(editingValue) : item.unitPrice;
          updates.totalPrice = quantity * unitPrice;
        }
      }

      onItemUpdate(editingCell.rowId, updates);
    }

    setEditingCell(null);
    setEditingValue('');
    setValidationError(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
    setValidationError(null);
  };

  const handleRowSelect = (itemId: string, isSelected: boolean) => {
    setGridState(prev => ({
      ...prev,
      selectedRows: isSelected
        ? [...prev.selectedRows, itemId]
        : prev.selectedRows.filter(id => id !== itemId),
    }));
  };

  const handleSelectAll = (isSelected: boolean) => {
    setGridState(prev => ({
      ...prev,
      selectedRows: isSelected ? paginatedItems.map(item => item.id) : [],
    }));
  };

  const handleAddRow = () => {
    if (!newRowData.description) {
      alert('Description is required');
      return;
    }

    const item: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'> = {
      category: newRowData.category || 'Equipment',
      description: newRowData.description || '',
      specification: newRowData.specification || '',
      quantity: newRowData.quantity || 1,
      unit: newRowData.unit || 'EA',
      unitPrice: newRowData.unitPrice || 0,
      totalPrice: (newRowData.quantity || 1) * (newRowData.unitPrice || 0),
      supplier: newRowData.supplier,
      status: newRowData.status || 'pending',
      linkedElements: [],
      extractionMethod: 'manual',
      syncStatus: 'pending',
    };

    onItemAdd(item);
    setIsAddingRow(false);
    setNewRowData({});
  };

  const handleBulkDelete = () => {
    if (gridState.selectedRows.length === 0) return;

    if (confirm(`Delete ${gridState.selectedRows.length} selected items?`)) {
      gridState.selectedRows.forEach(id => onItemDelete(id));
      setGridState(prev => ({ ...prev, selectedRows: [] }));
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const file = files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    event.target.value = '';
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCell) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCellSave();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCellCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingCell]);

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 text-sm"
            />
          </div>

          <div className="text-sm text-gray-600">
            {processedItems.length} items ({gridState.selectedRows.length} selected)
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={() => setIsAddingRow(true)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>

              {gridState.selectedRows.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({gridState.selectedRows.length})
                </button>
              )}
            </>
          )}

          {onCalculateCosts && (
            <button
              onClick={onCalculateCosts}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm"
            >
              <Calculator className="h-4 w-4" />
              Calculate
            </button>
          )}

          {onExport && (
            <button
              onClick={() => onExport('csv')}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}

          {onImport && !readOnly && (
            <>
              <button
                onClick={handleImport}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}

          {loading && (
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead className="sticky top-0 bg-gray-100 border-b">
            <tr>
              {showActions && (
                <th className="w-12 p-2 text-left">
                  <input
                    type="checkbox"
                    checked={gridState.selectedRows.length === paginatedItems.length && paginatedItems.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
              )}
              {gridState.columns.map((column) => (
                <th
                  key={column.id}
                  className="p-2 text-left border-r last:border-r-0"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{column.title}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {gridState.sortBy === column.id ? (
                          gridState.sortDirection === 'asc' ? (
                            <SortAsc className="h-4 w-4" />
                          ) : (
                            <SortDesc className="h-4 w-4" />
                          )
                        ) : (
                          <SortAsc className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    )}
                  </div>
                  {column.filterable && (
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={gridState.filters[column.id] || ''}
                      onChange={(e) => handleFilter(column.id, e.target.value)}
                      className="w-full mt-1 px-2 py-1 text-xs border rounded"
                    />
                  )}
                </th>
              ))}
              {showActions && !readOnly && (
                <th className="w-20 p-2 text-center">Actions</th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Add new row */}
            {isAddingRow && (
              <tr className="border-b bg-blue-50">
                <td className="p-2">
                  <div className="flex gap-1">
                    <button
                      onClick={handleAddRow}
                      className="text-green-600 hover:text-green-700"
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsAddingRow(false)}
                      className="text-gray-600 hover:text-gray-700"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                {gridState.columns.map((column) => (
                  <td key={column.id} className="p-2 border-r last:border-r-0">
                    {column.editable ? (
                      <input
                        type={column.formatter === 'number' || column.formatter === 'currency' ? 'number' : 'text'}
                        value={(newRowData as any)[column.field] || ''}
                        onChange={(e) => setNewRowData(prev => ({
                          ...prev,
                          [column.field]: e.target.value,
                        }))}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder={column.title}
                      />
                    ) : (
                      <span className="text-gray-400">Auto</span>
                    )}
                  </td>
                ))}
                <td className="p-2"></td>
              </tr>
            )}

            {/* Data rows */}
            {paginatedItems.map((item) => (
              <tr
                key={item.id}
                className={`border-b hover:bg-gray-50 ${
                  gridState.selectedRows.includes(item.id) ? 'bg-blue-50' : ''
                }`}
              >
                {showActions && (
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={gridState.selectedRows.includes(item.id)}
                      onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                )}
                {gridState.columns.map((column) => {
                  const isEditing = editingCell?.rowId === item.id && editingCell?.columnId === column.id;
                  const value = getItemValue(item, column.field);

                  return (
                    <td
                      key={column.id}
                      className="p-2 border-r last:border-r-0 cursor-pointer"
                      onClick={() => handleCellEdit(item, column)}
                    >
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type={column.formatter === 'number' || column.formatter === 'currency' ? 'number' : 'text'}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={handleCellSave}
                            autoFocus
                            className={`w-full px-2 py-1 border rounded text-sm ${
                              validationError ? 'border-red-500' : ''
                            }`}
                          />
                          {validationError && (
                            <div className="absolute top-full left-0 z-10 mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded whitespace-nowrap">
                              {validationError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`${column.editable && !readOnly ? 'hover:bg-gray-100' : ''} block px-1 py-1 rounded`}>
                          {formatCellValue(value, column.formatter)}
                        </span>
                      )}
                    </td>
                  );
                })}
                {showActions && !readOnly && (
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onItemDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>

          {/* Totals row */}
          {showTotals && (
            <tfoot className="sticky bottom-0 bg-gray-100 border-t">
              <tr>
                {showActions && <td className="p-2 font-semibold">Totals</td>}
                {gridState.columns.map((column) => (
                  <td key={column.id} className="p-2 border-r last:border-r-0 font-semibold">
                    {column.aggregation && aggregations[column.id] !== undefined
                      ? formatCellValue(aggregations[column.id], column.formatter)
                      : ''}
                  </td>
                ))}
                {showActions && !readOnly && <td className="p-2"></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600">
          Showing {gridState.currentPage * gridState.pageSize + 1} to{' '}
          {Math.min((gridState.currentPage + 1) * gridState.pageSize, processedItems.length)} of{' '}
          {processedItems.length} items
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridState(prev => ({ ...prev, currentPage: Math.max(0, prev.currentPage - 1) }))}
            disabled={gridState.currentPage === 0}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {gridState.currentPage + 1} of {Math.ceil(processedItems.length / gridState.pageSize)}
          </span>

          <button
            onClick={() => setGridState(prev => ({
              ...prev,
              currentPage: Math.min(Math.ceil(processedItems.length / gridState.pageSize) - 1, prev.currentPage + 1)
            }))}
            disabled={gridState.currentPage >= Math.ceil(processedItems.length / gridState.pageSize) - 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>

          <select
            value={gridState.pageSize}
            onChange={(e) => setGridState(prev => ({ ...prev, pageSize: Number(e.target.value), currentPage: 0 }))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
          </select>
        </div>
      </div>
    </div>
  );
};