import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Custom render function that includes providers
function customRender(
  ui: React.ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: RenderOptions & {
    queryClient?: QueryClient
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Common test utilities
export const createMockNode = (overrides = {}) => ({
  id: 'test-node-1',
  type: 'default',
  position: { x: 100, y: 100 },
  data: { label: 'Test Node' },
  ...overrides,
})

export const createMockEdge = (overrides = {}) => ({
  id: 'test-edge-1',
  source: 'node-1',
  target: 'node-2',
  type: 'default',
  ...overrides,
})

export const createMockSymbol = (overrides = {}) => ({
  id: 'test-symbol-1',
  name: 'Test Symbol',
  category: 'Valve',
  svgPath: '<svg><rect width="50" height="50" /></svg>',
  ...overrides,
})

// Mock data generators
export const generateMockNodes = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockNode({
      id: `node-${i + 1}`,
      position: { x: i * 100, y: i * 100 },
      data: { label: `Node ${i + 1}` },
    })
  )

export const generateMockEdges = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockEdge({
      id: `edge-${i + 1}`,
      source: `node-${i + 1}`,
      target: `node-${i + 2}`,
    })
  )

// Test helpers
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

export const createMockFile = (name: string, content: string, type: string = 'text/plain') =>
  new File([content], name, { type })

// Mock event helpers
export const createMockDragEvent = (data: Record<string, any> = {}) => ({
  dataTransfer: {
    getData: jest.fn((key: string) => data[key] || ''),
    setData: jest.fn(),
    clearData: jest.fn(),
    effectAllowed: 'all',
    dropEffect: 'move',
    files: [],
    items: [],
    types: Object.keys(data),
  },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
})

export const createMockKeyboardEvent = (key: string, options: KeyboardEventInit = {}) => ({
  key,
  code: key,
  keyCode: key.charCodeAt(0),
  which: key.charCodeAt(0),
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...options,
})

// Custom matchers can be added here if needed
export const customMatchers = {
  toHaveCorrectFlowPosition: (received: any, expected: { x: number; y: number }) => {
    const pass = received.x === expected.x && received.y === expected.y
    return {
      message: () =>
        pass
          ? `Expected position not to be { x: ${expected.x}, y: ${expected.y} }`
          : `Expected position to be { x: ${expected.x}, y: ${expected.y} }, but got { x: ${received.x}, y: ${received.y} }`,
      pass,
    }
  },
}

// Setup function for component tests
export const setupComponentTest = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return { queryClient }
}