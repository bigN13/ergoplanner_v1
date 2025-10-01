"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Download,
  Calculator,
  RotateCcw,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

import { BoQDataGrid } from './BoQDataGrid';
import type { BoQItem, BoQProject, BoQCostCalculation } from '../../types/boq';
import { getBoQDatabase } from '../../lib/boq-database';
import { getBoQExtractionService } from '../../services/BoQExtractionService';
import { getBoQSyncService } from '../../services/BoQSyncService';
import { getBoQCostCalculationEngine } from '../../services/BoQCostCalculationEngine';
import { getBoQSignalRService } from '../../services/BoQSignalRService';
import { useEnhancedDrawingStore } from '../../store/enhanced-drawing-store';

interface EnhancedBoQPanelProps {
  projectId?: string;
  drawingId?: string;
  onExport?: (data: any, format: string) => void;
  onImport?: (file: File) => void;
  className?: string;
}

export const EnhancedBoQPanel: React.FC<EnhancedBoQPanelProps> = ({
  projectId,
  drawingId,
  onExport,
  onImport,
  className = '',
}) => {
  const { nodes, edges } = useEnhancedDrawingStore();

  // State management
  const [boqItems, setBoqItems] = useState<BoQItem[]>([]);
  const [project, setProject] = useState<BoQProject | null>(null);
  const [costCalculation, setCostCalculation] = useState<BoQCostCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLastSync] = useState<Date | null>(null);

  // Panel state
  const [activeTab, setActiveTab] = useState<'items' | 'costs' | 'analytics' | 'settings'>('items');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync and connection status
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    pendingChanges: number;
    lastSync: Date | null;
    conflictCount: number;
  }>({
    isOnline: false,
    pendingChanges: 0,
    lastSync: null,
    conflictCount: 0,
  });

  // Statistics
  const statistics = useMemo(() => {
    const totalItems = boqItems.length;
    const totalValue = boqItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const categoryCounts = boqItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const extractedItems = boqItems.filter(item => item.extractionMethod === 'automatic').length;
    const manualItems = boqItems.filter(item => item.extractionMethod === 'manual').length;

    return {
      totalItems,
      totalValue,
      categoryCounts,
      extractedItems,
      manualItems,
      averageValue: totalItems > 0 ? totalValue / totalItems : 0,
    };
  }, [boqItems]);

  // Initialize services and load data
  useEffect(() => {
    initializeServices();
  }, [projectId, drawingId]);

  // Auto-sync when drawing changes
  useEffect(() => {
    if (nodes.length > 0 && projectId && drawingId) {
      handleAutoSync();
    }
  }, [nodes, edges, projectId, drawingId]);

  const initializeServices = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize database
      const db = getBoQDatabase();
      await db.initialize();

      // Initialize sync service if we have project and drawing IDs
      if (projectId && drawingId) {
        const syncService = getBoQSyncService();
        await syncService.initializeSync(projectId, drawingId, nodes, edges);

        // Subscribe to sync events
        syncService.addEventListener((event) => {
          console.log('Sync event:', event);
          // Update UI based on sync events
          if (event.type.includes('boq-item')) {
            loadBoQItems();
          }
        });
      }

      // Load initial data
      await Promise.all([
        loadProject(),
        loadBoQItems(),
        loadLatestCostCalculation(),
      ]);

      // Update sync status
      updateSyncStatus();

    } catch (error) {
      console.error('Failed to initialize BoQ services:', error);
      setError(error instanceof Error ? error.message : 'Initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProject = async (): Promise<void> => {
    if (!projectId) return;

    const db = getBoQDatabase();
    const projectData = await db.getProject(projectId);
    setProject(projectData || null);
  };

  const loadBoQItems = async (): Promise<void> => {
    const db = getBoQDatabase();

    let items: BoQItem[];
    if (drawingId) {
      items = await db.getBoQItemsByDrawing(drawingId);
    } else if (projectId) {
      items = await db.getBoQItemsByProject(projectId);
    } else {
      const { items: allItems } = await db.exportData();
      items = allItems;
    }

    setBoqItems(items);
  };

  const loadLatestCostCalculation = async (): Promise<void> => {
    if (!projectId) return;

    const db = getBoQDatabase();
    const allData = await db.exportData();
    const calculations = allData.calculations.filter(
      calc => calc.projectId === projectId
    );

    if (calculations.length > 0) {
      const latest = calculations.sort((a: BoQCostCalculation, b: BoQCostCalculation) =>
        new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
      )[0];
      setCostCalculation(latest);
    }
  };

  const updateSyncStatus = async (): Promise<void> => {
    const syncService = getBoQSyncService();
    const signalRService = getBoQSignalRService();

    const syncState = syncService.getSyncState();
    const serverStatus = signalRService.getServerSyncStatus();

    setSyncStatus({
      isOnline: serverStatus.isOnline,
      pendingChanges: syncState.pendingChanges,
      lastSync: syncState.lastSync,
      conflictCount: serverStatus.conflictCount,
    });
  };

  const handleAutoSync = useCallback(async (): Promise<void> => {
    if (!projectId || !drawingId) return;

    try {
      const syncService = getBoQSyncService();
      syncService.onDrawingChange(nodes, edges);
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }, [nodes, edges, projectId, drawingId]);

  const handleExtractFromDrawing = async (): Promise<void> => {
    if (!projectId || !drawingId) {
      setError('Project and drawing IDs are required for extraction');
      return;
    }

    try {
      setIsExtracting(true);
      setError(null);

      const extractionService = getBoQExtractionService();
      const result = await extractionService.extractFromDrawing(nodes, edges, {
        projectId,
        drawingId,
      });

      // Save extracted items to database
      const db = getBoQDatabase();
      for (const item of result.items) {
        try {
          await db.createBoQItem(item);
        } catch (error) {
          console.warn('Item may already exist, updating instead:', error);
          // Try to find and update existing item
          const existingItems = await db.getBoQItemsByDrawing(drawingId);
          const existing = existingItems.find(existing =>
            existing.description === item.description &&
            existing.specification === item.specification &&
            existing.category === item.category
          );

          if (existing) {
            await db.updateBoQItem(existing.id, {
              quantity: item.quantity,
              linkedElements: item.linkedElements,
              lastExtractedAt: new Date(),
            });
          }
        }
      }

      // Show warnings if any
      if (result.warnings.length > 0) {
        console.warn('Extraction warnings:', result.warnings);
      }

      // Reload items
      await loadBoQItems();

      console.log(`Extracted ${result.items.length} items from drawing`);

    } catch (error) {
      console.error('Extraction failed:', error);
      setError(error instanceof Error ? error.message : 'Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCalculateCosts = async (): Promise<void> => {
    if (!projectId) {
      setError('Project ID is required for cost calculation');
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);

      const costEngine = getBoQCostCalculationEngine();
      const result = await costEngine.calculateProjectCosts(projectId);

      // Save calculation to database
      await costEngine.saveCalculation(result.calculation);

      setCostCalculation(result.calculation);

      // Show warnings and recommendations
      if (result.warnings.length > 0) {
        console.warn('Cost calculation warnings:', result.warnings);
      }

      if (result.recommendations.length > 0) {
        console.info('Cost recommendations:', result.recommendations);
      }

      console.log('Cost calculation completed:', {
        totalCost: result.calculation.totalCost,
        itemCount: result.categoryBreakdowns.reduce((sum: number, cb: any) => sum + cb.itemCount, 0),
      });

    } catch (error) {
      console.error('Cost calculation failed:', error);
      setError(error instanceof Error ? error.message : 'Cost calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSync = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      setError(null);

      const syncService = getBoQSyncService();
      const result = await syncService.synchronize();

      if (!result.success) {
        setError(`Sync failed: ${result.errors.join(', ')}`);
      } else {
        setLastSync(new Date());
        await loadBoQItems(); // Reload items after sync
      }

      await updateSyncStatus();

    } catch (error) {
      console.error('Sync failed:', error);
      setError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleItemUpdate = async (id: string, updates: Partial<BoQItem>): Promise<void> => {
    try {
      const db = getBoQDatabase();
      await db.updateBoQItem(id, updates);
      await loadBoQItems();
    } catch (error) {
      console.error('Failed to update item:', error);
      setError(error instanceof Error ? error.message : 'Failed to update item');
    }
  };

  const handleItemDelete = async (id: string): Promise<void> => {
    try {
      const db = getBoQDatabase();
      await db.deleteBoQItem(id);
      await loadBoQItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete item');
    }
  };

  const handleItemAdd = async (item: Omit<BoQItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const db = getBoQDatabase();
      await db.createBoQItem({
        ...item,
        projectId: projectId || undefined,
        drawingId: drawingId || undefined,
      });
      await loadBoQItems();
    } catch (error) {
      console.error('Failed to add item:', error);
      setError(error instanceof Error ? error.message : 'Failed to add item');
    }
  };

  const handleExport = async (format: 'csv' | 'excel'): Promise<void> => {
    try {
      if (onExport) {
        onExport(boqItems, format);
      } else {
        // Default CSV export
        const headers = [
          'Category',
          'Description',
          'Specification',
          'Quantity',
          'Unit',
          'Unit Price',
          'Total Price',
          'Supplier',
          'Status',
        ];

        const rows = boqItems.map(item => [
          item.category,
          item.description,
          item.specification,
          item.quantity,
          item.unit,
          item.unitPrice,
          item.totalPrice,
          item.supplier || '',
          item.status || '',
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boq-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
    }
  };

  const renderStatusIndicator = (): React.ReactNode => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      );
    }

    if (syncStatus.conflictCount > 0) {
      return (
        <div className="flex items-center gap-2 text-orange-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{syncStatus.conflictCount} conflicts</span>
        </div>
      );
    }

    if (syncStatus.pendingChanges > 0) {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{syncStatus.pendingChanges} pending</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Synced</span>
      </div>
    );
  };

  return (
    <div className={`flex h-full flex-col bg-white ${className}`}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Bill of Quantities</h2>
              {project && (
                <p className="text-sm text-gray-600">{project.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {renderStatusIndicator()}
            {syncStatus.isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalItems}</div>
            <div className="text-xs text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${statistics.totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{statistics.extractedItems}</div>
            <div className="text-xs text-gray-600">Auto-Extracted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{statistics.manualItems}</div>
            <div className="text-xs text-gray-600">Manual Items</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExtractFromDrawing}
            disabled={isExtracting || !nodes.length}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <Database className="h-4 w-4" />
            {isExtracting ? 'Extracting...' : 'Extract from Drawing'}
          </button>

          <button
            onClick={handleCalculateCosts}
            disabled={isCalculating || !boqItems.length}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <Calculator className="h-4 w-4" />
            {isCalculating ? 'Calculating...' : 'Calculate Costs'}
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mt-4">
          {[
            { key: 'items', label: 'Items', icon: Package },
            { key: 'costs', label: 'Costs', icon: Calculator },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            { key: 'settings', label: 'Settings', icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'items' && (
          <BoQDataGrid
            items={boqItems}
            onItemUpdate={handleItemUpdate}
            onItemDelete={handleItemDelete}
            onItemAdd={handleItemAdd}
            onCalculateCosts={handleCalculateCosts}
            onExport={handleExport}
            onImport={onImport}
            loading={isLoading}
            showActions={true}
            showTotals={true}
          />
        )}

        {activeTab === 'costs' && (
          <div className="p-4">
            {costCalculation ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Cost Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${costCalculation.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor:</span>
                        <span>${costCalculation.laborCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment:</span>
                        <span>${costCalculation.equipmentCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overhead:</span>
                        <span>${costCalculation.overheadCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Markup:</span>
                        <span>${costCalculation.markup.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${costCalculation.tax.toLocaleString()}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${costCalculation.totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Category Breakdown</h3>
                    <div className="space-y-2">
                      {costCalculation.categoryBreakdown.map((category) => (
                        <div key={category.categoryId} className="flex justify-between">
                          <span>{category.categoryName}:</span>
                          <span>${category.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Calculated on: {new Date(costCalculation.calculatedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No cost calculation available</p>
                <button
                  onClick={handleCalculateCosts}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Calculate Costs
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-4">
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Analytics features coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Settings panel coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};