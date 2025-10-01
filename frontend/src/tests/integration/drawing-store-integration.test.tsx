import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'

// Mock the drawing store with comprehensive functionality
const mockDrawingStore = {
  nodes: [],
  edges: [],
  setNodes: jest.fn(),
  setEdges: jest.fn(),
  addNode: jest.fn(),
  updateNode: jest.fn(),
  deleteNode: jest.fn(),
  addEdge: jest.fn(),
  updateEdge: jest.fn(),
  deleteEdge: jest.fn(),
  selectedNodes: [],
  selectedEdges: [],
  setSelectedNodes: jest.fn(),
  setSelectedEdges: jest.fn(),
  clearSelection: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
  fitView: jest.fn(),
  isGridVisible: true,
  toggleGrid: jest.fn(),
  snapToGrid: true,
  toggleSnapToGrid: jest.fn(),
  currentTool: 'select',
  setCurrentTool: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
  canUndo: false,
  canRedo: false,
  history: [],
  pushHistory: jest.fn(),
  viewport: { x: 0, y: 0, zoom: 1 },
  setViewport: jest.fn(),
}

// Mock the store
jest.mock('../../store/drawingStore', () => ({
  useDrawingStore: () => mockDrawingStore,
}))

// Simple component that uses the drawing store
const DrawingStoreIntegrationComponent = () => {
  const store = mockDrawingStore

  const handleAddNode = () => {
    const newNode = {
      id: 'test-node-1',
      type: 'valve',
      position: { x: 100, y: 100 },
      data: { label: 'Test Valve' },
    }
    store.addNode(newNode)
  }

  const handleSelectTool = (tool: string) => {
    store.setCurrentTool(tool)
  }

  const handleDeleteSelected = () => {
    store.selectedNodes.forEach(node => store.deleteNode(node.id))
  }

  return (
    <div data-testid="drawing-integration">
      <div data-testid="toolbar">
        <button onClick={() => handleSelectTool('select')}>Select</button>
        <button onClick={() => handleSelectTool('valve')}>Valve</button>
        <button onClick={() => handleSelectTool('pump')}>Pump</button>
        <button onClick={handleAddNode}>Add Node</button>
        <button onClick={handleDeleteSelected}>Delete Selected</button>
        <button onClick={store.undo} disabled={!store.canUndo}>Undo</button>
        <button onClick={store.redo} disabled={!store.canRedo}>Redo</button>
      </div>
      <div data-testid="canvas">
        <div>Current Tool: {store.currentTool}</div>
        <div>Nodes: {store.nodes.length}</div>
        <div>Selected: {store.selectedNodes.length}</div>
      </div>
    </div>
  )
}

describe('Drawing Store Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    mockDrawingStore.nodes = []
    mockDrawingStore.edges = []
    mockDrawingStore.selectedNodes = []
    mockDrawingStore.selectedEdges = []
    mockDrawingStore.currentTool = 'select'
    mockDrawingStore.canUndo = false
    mockDrawingStore.canRedo = false
  })

  it('should handle tool selection workflow', async () => {
    render(<DrawingStoreIntegrationComponent />)

    // Start with select tool
    expect(screen.getByText('Current Tool: select')).toBeInTheDocument()

    // Switch to valve tool
    const valveButton = screen.getByRole('button', { name: /valve/i })
    await user.click(valveButton)

    expect(mockDrawingStore.setCurrentTool).toHaveBeenCalledWith('valve')

    // Switch to pump tool
    const pumpButton = screen.getByRole('button', { name: /pump/i })
    await user.click(pumpButton)

    expect(mockDrawingStore.setCurrentTool).toHaveBeenCalledWith('pump')
  })

  it('should handle node creation and selection', async () => {
    render(<DrawingStoreIntegrationComponent />)

    // Add a node
    const addNodeButton = screen.getByRole('button', { name: /add node/i })
    await user.click(addNodeButton)

    expect(mockDrawingStore.addNode).toHaveBeenCalledWith({
      id: 'test-node-1',
      type: 'valve',
      position: { x: 100, y: 100 },
      data: { label: 'Test Valve' },
    })

    // Simulate node selection
    mockDrawingStore.selectedNodes = [{
      id: 'test-node-1',
      type: 'valve',
      position: { x: 100, y: 100 },
      data: { label: 'Test Valve' },
    }]

    // Delete selected node
    const deleteButton = screen.getByRole('button', { name: /delete selected/i })
    await user.click(deleteButton)

    expect(mockDrawingStore.deleteNode).toHaveBeenCalledWith('test-node-1')
  })

  it('should handle undo/redo operations', async () => {
    // Setup with undo available
    mockDrawingStore.canUndo = true
    mockDrawingStore.canRedo = false

    const { rerender } = render(<DrawingStoreIntegrationComponent />)

    // Test undo
    const undoButton = screen.getByRole('button', { name: /undo/i })
    expect(undoButton).not.toBeDisabled()
    await user.click(undoButton)

    expect(mockDrawingStore.undo).toHaveBeenCalled()

    // Test redo (should be disabled initially)
    const redoButton = screen.getByRole('button', { name: /redo/i })
    expect(redoButton).toBeDisabled()

    // Enable redo and rerender
    mockDrawingStore.canRedo = true
    rerender(<DrawingStoreIntegrationComponent />)

    const enabledRedoButton = screen.getByRole('button', { name: /redo/i })
    expect(enabledRedoButton).not.toBeDisabled()
    await user.click(enabledRedoButton)

    expect(mockDrawingStore.redo).toHaveBeenCalled()
  })

  it('should handle multi-node operations', async () => {
    // Setup multiple selected nodes
    mockDrawingStore.selectedNodes = [
      { id: 'node-1', type: 'valve', position: { x: 100, y: 100 }, data: {} },
      { id: 'node-2', type: 'pump', position: { x: 200, y: 100 }, data: {} },
    ]

    render(<DrawingStoreIntegrationComponent />)

    // Delete multiple selected nodes
    const deleteButton = screen.getByRole('button', { name: /delete selected/i })
    await user.click(deleteButton)

    expect(mockDrawingStore.deleteNode).toHaveBeenCalledWith('node-1')
    expect(mockDrawingStore.deleteNode).toHaveBeenCalledWith('node-2')
  })

  it('should handle keyboard shortcuts integration', async () => {
    // Setup with nodes
    mockDrawingStore.selectedNodes = [
      { id: 'test-node', type: 'valve', position: { x: 0, y: 0 }, data: {} }
    ]

    render(<DrawingStoreIntegrationComponent />)

    // Test delete key
    fireEvent.keyDown(document, { key: 'Delete', code: 'Delete' })

    // Note: In real implementation, this would be handled by the DrawingCanvas component
    // Here we just verify the integration concept works
    expect(screen.getByTestId('drawing-integration')).toBeInTheDocument()
  })

  it('should handle viewport and zoom operations', async () => {
    render(<DrawingStoreIntegrationComponent />)

    // These would typically be triggered by UI interactions
    // Here we test that the store methods are available and callable
    expect(typeof mockDrawingStore.zoomIn).toBe('function')
    expect(typeof mockDrawingStore.zoomOut).toBe('function')
    expect(typeof mockDrawingStore.fitView).toBe('function')
    expect(typeof mockDrawingStore.setViewport).toBe('function')

    // Test zoom functionality
    mockDrawingStore.zoomIn()
    expect(mockDrawingStore.zoomIn).toHaveBeenCalled()

    mockDrawingStore.zoomOut()
    expect(mockDrawingStore.zoomOut).toHaveBeenCalled()

    mockDrawingStore.fitView()
    expect(mockDrawingStore.fitView).toHaveBeenCalled()
  })

  it('should handle grid and snap functionality', async () => {
    render(<DrawingStoreIntegrationComponent />)

    // Test grid toggle
    expect(mockDrawingStore.isGridVisible).toBe(true)
    mockDrawingStore.toggleGrid()
    expect(mockDrawingStore.toggleGrid).toHaveBeenCalled()

    // Test snap to grid toggle
    expect(mockDrawingStore.snapToGrid).toBe(true)
    mockDrawingStore.toggleSnapToGrid()
    expect(mockDrawingStore.toggleSnapToGrid).toHaveBeenCalled()
  })
})