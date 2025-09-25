"use client";

import { Download, Plus, Trash2, Edit2, Package, Search } from "lucide-react";
import React, { useState, useMemo } from "react";

import { useEnhancedDrawingStore } from "@/store/enhanced-drawing-store";

export interface BoQItem {
  id: string;
  category: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  leadTime?: number;
  notes?: string;
  linkedElements: string[];
}

const BoQPanel: React.FC = () => {
  const { nodes } = useEnhancedDrawingStore();
  const [boqItems, setBoqItems] = useState<BoQItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Generate BoQ items from nodes
  const generatedBoQItems = useMemo(() => {
    const items: BoQItem[] = [];
    const itemMap = new Map<string, BoQItem>();

    nodes.forEach((node) => {
      const key = `${node.type}-default`;

      if (itemMap.has(key)) {
        const item = itemMap.get(key);
        if (!item) continue;
        item.quantity += 1;
        item.totalPrice = item.quantity * item.unitPrice;
        item.linkedElements.push(node.id);
      } else {
        const newItem: BoQItem = {
          id: `boq-${Date.now()}-${Math.random()}`,
          category: node.data?.category || "Equipment",
          description: node.data?.label || node.type || "Unknown Item",
          specification:
            node.data?.specification ||
            `Size: ${node.data?.size || "N/A"}, Material: ${node.data?.material || "N/A"}`,
          quantity: 1,
          unit: "EA",
          unitPrice: node.data?.unitPrice || 0,
          totalPrice: node.data?.unitPrice || 0,
          supplier: node.data?.supplier,
          leadTime: node.data?.leadTime,
          linkedElements: [node.id],
        };
        itemMap.set(key, newItem);
        items.push(newItem);
      }
    });

    return items;
  }, [nodes]);

  // Combine generated and manual items
  const allItems = [...generatedBoQItems, ...boqItems];

  // Filter items
  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(allItems.map((item) => item.category)));

  // Calculate totals
  const totals = filteredItems.reduce(
    (acc, item) => ({
      quantity: acc.quantity + item.quantity,
      totalPrice: acc.totalPrice + item.totalPrice,
    }),
    { quantity: 0, totalPrice: 0 }
  );

  const handleAddItem = (newItem: Partial<BoQItem>): void => {
    const item: BoQItem = {
      id: `boq-manual-${Date.now()}`,
      category: newItem.category || "Manual",
      description: newItem.description || "",
      specification: newItem.specification || "",
      quantity: newItem.quantity || 1,
      unit: newItem.unit || "EA",
      unitPrice: newItem.unitPrice || 0,
      totalPrice: (newItem.quantity || 1) * (newItem.unitPrice || 0),
      supplier: newItem.supplier,
      leadTime: newItem.leadTime,
      notes: newItem.notes,
      linkedElements: [],
    };
    setBoqItems([...boqItems, item]);
    setShowAddForm(false);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<BoQItem>): void => {
    setBoqItems(
      boqItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
              totalPrice:
                (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice),
            }
          : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string): void => {
    setBoqItems(boqItems.filter((item) => item.id !== itemId));
  };

  const exportToCSV = (): void => {
    const headers = [
      "Category",
      "Description",
      "Specification",
      "Quantity",
      "Unit",
      "Unit Price",
      "Total Price",
      "Supplier",
      "Lead Time",
    ];
    const rows = filteredItems.map((item) => [
      item.category,
      item.description,
      item.specification,
      item.quantity,
      item.unit,
      item.unitPrice,
      item.totalPrice,
      item.supplier || "",
      item.leadTime || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boq-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <h3 className="font-semibold">Bill of Quantities</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-lg bg-blue-500 p-1.5 text-white hover:bg-blue-600"
              title="Add Item"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={exportToCSV}
              className="rounded-lg bg-green-500 p-1.5 text-white hover:bg-green-600"
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-2 left-2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border py-1.5 pr-2 pl-8 text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BoQ Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="border-b p-2 text-left">Category</th>
              <th className="border-b p-2 text-left">Description</th>
              <th className="border-b p-2 text-left">Specification</th>
              <th className="border-b p-2 text-center">Qty</th>
              <th className="border-b p-2 text-center">Unit</th>
              <th className="border-b p-2 text-right">Unit Price</th>
              <th className="border-b p-2 text-right">Total</th>
              <th className="border-b p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border-b p-2 text-xs">{item.category}</td>
                <td className="border-b p-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                      className="w-full rounded border px-1 py-0.5 text-sm"
                    />
                  ) : (
                    <div>
                      <div className="text-sm font-medium">{item.description}</div>
                      {item.linkedElements.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Linked: {item.linkedElements.length} elements
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="border-b p-2 text-xs text-gray-600">{item.specification}</td>
                <td className="border-b p-2 text-center">
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { quantity: Number(e.target.value) })
                      }
                      className="w-16 rounded border px-1 py-0.5 text-center text-sm"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="border-b p-2 text-center text-xs">{item.unit}</td>
                <td className="border-b p-2 text-right">
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { unitPrice: Number(e.target.value) })
                      }
                      className="w-20 rounded border px-1 py-0.5 text-right text-sm"
                    />
                  ) : (
                    `$${item.unitPrice.toFixed(2)}`
                  )}
                </td>
                <td className="border-b p-2 text-right font-medium">
                  ${item.totalPrice.toFixed(2)}
                </td>
                <td className="border-b p-2 text-center">
                  <div className="flex justify-center gap-1">
                    {editingItem === item.id ? (
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-green-600 hover:text-green-700"
                        title="Save"
                      >
                        ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingItem(item.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {item.linkedElements.length === 0 && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td colSpan={3} className="p-2 font-semibold">
                Totals
              </td>
              <td className="p-2 text-center font-semibold">{totals.quantity}</td>
              <td colSpan={2}></td>
              <td className="p-2 text-right font-semibold">${totals.totalPrice.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-96 rounded-lg bg-white p-4">
            <h4 className="mb-3 font-semibold">Add BoQ Item</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Description"
                className="w-full rounded border px-2 py-1 text-sm"
                onChange={(_e) => {}}
              />
              <input
                type="text"
                placeholder="Specification"
                className="w-full rounded border px-2 py-1 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Quantity"
                  className="flex-1 rounded border px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  className="flex-1 rounded border px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  className="flex-1 rounded border px-2 py-1 text-sm"
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddItem({})}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="border-t bg-gray-50 p-3 text-sm">
        <div className="flex justify-between">
          <span>Total Items: {filteredItems.length}</span>
          <span className="font-semibold">Total Value: ${totals.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default BoQPanel;
