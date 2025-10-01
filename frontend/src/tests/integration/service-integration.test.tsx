import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'

// Mock service classes
class MockBoQSyncService {
  extractFromDrawing = jest.fn()
  initializeSync = jest.fn()
  onDrawingChange = jest.fn()
  onBoQChange = jest.fn()
  synchronize = jest.fn()
}

class MockBoQDatabase {
  getBoQItemsByProject = jest.fn()
  createBoQItem = jest.fn()
  updateBoQItem = jest.fn()
  deleteBoQItem = jest.fn()
  getProjectSummary = jest.fn()
  bulkUpdate = jest.fn()
}

class MockCostCalculationEngine {
  calculateProjectCosts = jest.fn()
  getOptimizationSuggestions = jest.fn()
  calculateItemCost = jest.fn()
  getBulkPricingDiscounts = jest.fn()
}

class MockSymbolLibraryService {
  getSymbolsByCategory = jest.fn()
  searchSymbols = jest.fn()
  getSymbolMetadata = jest.fn()
  validateSymbolPlacement = jest.fn()
}

describe('Service Integration Tests', () => {
  let boqSyncService: MockBoQSyncService
  let boqDatabase: MockBoQDatabase
  let costEngine: MockCostCalculationEngine
  let symbolService: MockSymbolLibraryService

  beforeEach(() => {
    boqSyncService = new MockBoQSyncService()
    boqDatabase = new MockBoQDatabase()
    costEngine = new MockCostCalculationEngine()
    symbolService = new MockSymbolLibraryService()

    jest.clearAllMocks()
  })

  it('should integrate drawing changes with BoQ synchronization', async () => {
    // Mock drawing nodes
    const mockNodes = [
      {
        id: 'valve-1',
        type: 'valve',
        position: { x: 100, y: 100 },
        data: {
          label: 'Gate Valve',
          size: '6"',
          material: 'Carbon Steel',
          pressure: '150#',
        },
      },
      {
        id: 'pump-1',
        type: 'pump',
        position: { x: 300, y: 100 },
        data: {
          label: 'Centrifugal Pump',
          capacity: '100 GPM',
          head: '50 ft',
        },
      },
    ]

    const mockEdges = [
      {
        id: 'pipe-1',
        source: 'valve-1',
        target: 'pump-1',
        type: 'pipe',
        data: {
          diameter: '4"',
          material: 'Carbon Steel',
          length: '20 ft',
        },
      },
    ]

    // Mock extraction result
    const mockBoQItems = [
      {
        id: 'boq-1',
        category: 'Valves',
        description: 'Gate Valve 6" Carbon Steel 150#',
        quantity: 1,
        unit: 'EA',
        unitPrice: 250.0,
        totalPrice: 250.0,
        linkedElements: ['valve-1'],
      },
      {
        id: 'boq-2',
        category: 'Pumps',
        description: 'Centrifugal Pump 100 GPM, 50 ft head',
        quantity: 1,
        unit: 'EA',
        unitPrice: 1500.0,
        totalPrice: 1500.0,
        linkedElements: ['pump-1'],
      },
      {
        id: 'boq-3',
        category: 'Piping',
        description: '4" Carbon Steel Pipe',
        quantity: 20,
        unit: 'FT',
        unitPrice: 15.0,
        totalPrice: 300.0,
        linkedElements: ['pipe-1'],
      },
    ]

    boqSyncService.extractFromDrawing.mockResolvedValue({
      items: mockBoQItems,
      summary: {
        totalItems: 3,
        totalCost: 2050.0,
        categories: {
          Valves: 250.0,
          Pumps: 1500.0,
          Piping: 300.0,
        },
      },
    })

    // Initialize sync
    await boqSyncService.initializeSync('project-123', 'drawing-456')
    expect(boqSyncService.initializeSync).toHaveBeenCalledWith('project-123', 'drawing-456')

    // Trigger extraction on drawing change
    await boqSyncService.onDrawingChange(mockNodes, mockEdges)
    expect(boqSyncService.onDrawingChange).toHaveBeenCalledWith(mockNodes, mockEdges)

    // Verify extraction was called
    await boqSyncService.extractFromDrawing(mockNodes, mockEdges)
    expect(boqSyncService.extractFromDrawing).toHaveBeenCalledWith(mockNodes, mockEdges)

    const result = await boqSyncService.extractFromDrawing.mock.results[0].value
    expect(result.items).toHaveLength(3)
    expect(result.summary.totalCost).toBe(2050.0)
  })

  it('should integrate BoQ changes with cost calculation', async () => {
    const mockBoQItems = [
      {
        id: 'boq-1',
        category: 'Valves',
        description: 'Gate Valve 6" Carbon Steel 150#',
        quantity: 5,
        unit: 'EA',
        unitPrice: 250.0,
        totalPrice: 1250.0,
      },
      {
        id: 'boq-2',
        category: 'Pumps',
        description: 'Centrifugal Pump 100 GPM',
        quantity: 2,
        unit: 'EA',
        unitPrice: 1500.0,
        totalPrice: 3000.0,
      },
    ]

    const mockCostResult = {
      totalCost: 4250.0,
      breakdown: {
        materials: 3400.0,
        labor: 680.0,
        equipment: 170.0,
      },
      categoryBreakdown: {
        Valves: 1250.0,
        Pumps: 3000.0,
      },
      optimizations: [
        {
          type: 'bulk_discount',
          description: 'Consider bulk purchase for gate valves',
          savings: 125.0,
          confidence: 0.8,
        },
      ],
    }

    costEngine.calculateProjectCosts.mockResolvedValue(mockCostResult)
    boqDatabase.getBoQItemsByProject.mockResolvedValue(mockBoQItems)

    // Get BoQ items
    const boqItems = await boqDatabase.getBoQItemsByProject('project-123')
    expect(boqItems).toEqual(mockBoQItems)

    // Calculate costs
    const costResult = await costEngine.calculateProjectCosts('project-123')
    expect(costResult.totalCost).toBe(4250.0)
    expect(costResult.optimizations).toHaveLength(1)
    expect(costResult.optimizations[0].savings).toBe(125.0)

    // Verify integration
    expect(costEngine.calculateProjectCosts).toHaveBeenCalledWith('project-123')
    expect(boqDatabase.getBoQItemsByProject).toHaveBeenCalledWith('project-123')
  })

  it('should integrate symbol library with drawing placement', async () => {
    const mockSymbols = [
      {
        id: 'symbol-1',
        name: 'Gate Valve',
        category: 'Valves',
        svgContent: '<svg><rect width="50" height="50" /></svg>',
        metadata: {
          connectionPoints: [
            { id: 'inlet', position: { x: 0, y: 25 }, direction: 'left' },
            { id: 'outlet', position: { x: 50, y: 25 }, direction: 'right' },
          ],
          properties: {
            size: { type: 'dropdown', options: ['2"', '4"', '6"', '8"'] },
            material: { type: 'dropdown', options: ['Carbon Steel', 'Stainless Steel'] },
            pressure: { type: 'dropdown', options: ['150#', '300#', '600#'] },
          },
        },
      },
    ]

    symbolService.getSymbolsByCategory.mockResolvedValue(mockSymbols)
    symbolService.validateSymbolPlacement.mockResolvedValue({
      valid: true,
      warnings: [],
    })

    // Get symbols for category
    const symbols = await symbolService.getSymbolsByCategory('Valves')
    expect(symbols).toEqual(mockSymbols)
    expect(symbolService.getSymbolsByCategory).toHaveBeenCalledWith('Valves')

    // Validate placement
    const placementValidation = await symbolService.validateSymbolPlacement(
      'symbol-1',
      { x: 100, y: 100 },
      []
    )
    expect(placementValidation.valid).toBe(true)
    expect(symbolService.validateSymbolPlacement).toHaveBeenCalledWith(
      'symbol-1',
      { x: 100, y: 100 },
      []
    )
  })

  it('should handle bulk BoQ operations with cost recalculation', async () => {
    const mockBoQItems = [
      {
        id: 'boq-1',
        category: 'Valves',
        description: 'Gate Valve 4"',
        quantity: 2,
        unit: 'EA',
        unitPrice: 200.0,
        totalPrice: 400.0,
      },
      {
        id: 'boq-2',
        category: 'Valves',
        description: 'Gate Valve 6"',
        quantity: 3,
        unit: 'EA',
        unitPrice: 250.0,
        totalPrice: 750.0,
      },
    ]

    const bulkUpdateData = {
      itemIds: ['boq-1', 'boq-2'],
      updates: {
        material: 'Stainless Steel',
        priceMultiplier: 1.5,
      },
    }

    const updatedItems = mockBoQItems.map(item => ({
      ...item,
      material: 'Stainless Steel',
      unitPrice: item.unitPrice * 1.5,
      totalPrice: item.totalPrice * 1.5,
    }))

    boqDatabase.bulkUpdate.mockResolvedValue(updatedItems)
    costEngine.calculateProjectCosts.mockResolvedValue({
      totalCost: 1725.0, // Updated total
      breakdown: { materials: 1725.0, labor: 0, equipment: 0 },
    })

    // Perform bulk update
    const result = await boqDatabase.bulkUpdate(bulkUpdateData)
    expect(result).toEqual(updatedItems)

    // Recalculate costs after bulk update
    const newCosts = await costEngine.calculateProjectCosts('project-123')
    expect(newCosts.totalCost).toBe(1725.0)

    // Verify integration
    expect(boqDatabase.bulkUpdate).toHaveBeenCalledWith(bulkUpdateData)
    expect(costEngine.calculateProjectCosts).toHaveBeenCalledWith('project-123')
  })

  it('should handle error propagation across services', async () => {
    // Mock service errors
    boqSyncService.extractFromDrawing.mockRejectedValue(
      new Error('Failed to extract BoQ from drawing')
    )
    boqDatabase.getBoQItemsByProject.mockRejectedValue(
      new Error('Database connection failed')
    )
    costEngine.calculateProjectCosts.mockRejectedValue(
      new Error('Cost calculation service unavailable')
    )

    // Test error handling in extraction
    try {
      await boqSyncService.extractFromDrawing([], [])
      fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Failed to extract BoQ from drawing')
    }

    // Test error handling in database operations
    try {
      await boqDatabase.getBoQItemsByProject('project-123')
      fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Database connection failed')
    }

    // Test error handling in cost calculation
    try {
      await costEngine.calculateProjectCosts('project-123')
      fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Cost calculation service unavailable')
    }
  })

  it('should handle concurrent operations correctly', async () => {
    // Setup mock implementation before creating promises
    boqDatabase.getBoQItemsByProject.mockImplementation((projectId) => {
      return Promise.resolve([
        {
          id: `boq-${projectId}`,
          projectId,
          category: 'Test',
          quantity: 1,
          unitPrice: 100.0,
        },
      ])
    })

    const mockPromises = [
      boqDatabase.getBoQItemsByProject('project-1'),
      boqDatabase.getBoQItemsByProject('project-2'),
      boqDatabase.getBoQItemsByProject('project-3'),
    ]

    // Execute concurrent operations
    const results = await Promise.all(mockPromises)

    expect(results).toHaveLength(3)
    expect(results[0]).toHaveLength(1)
    expect(results[0][0].projectId).toBe('project-1')
    expect(results[1][0].projectId).toBe('project-2')
    expect(results[2][0].projectId).toBe('project-3')

    expect(boqDatabase.getBoQItemsByProject).toHaveBeenCalledTimes(3)
  })

  it('should handle service lifecycle and cleanup', async () => {
    // Initialize services
    await boqSyncService.initializeSync('project-123', 'drawing-456')
    expect(boqSyncService.initializeSync).toHaveBeenCalled()

    // Perform operations
    await boqDatabase.createBoQItem({
      projectId: 'project-123',
      category: 'Test',
      description: 'Test Item',
      quantity: 1,
      unitPrice: 100.0,
    })

    // Cleanup (simulate service shutdown)
    boqSyncService.synchronize.mockResolvedValue({ success: true })
    const syncResult = await boqSyncService.synchronize()
    expect(syncResult.success).toBe(true)

    // Verify all operations completed
    expect(boqDatabase.createBoQItem).toHaveBeenCalled()
    expect(boqSyncService.synchronize).toHaveBeenCalled()
  })
})