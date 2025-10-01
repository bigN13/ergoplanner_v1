import '@testing-library/jest-dom'
import 'jest-canvas-mock'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt="" />
  },
}))

// Mock Zustand store
jest.mock('zustand', () => ({
  create: jest.fn((fn) => {
    const store = fn((set, get) => ({
      ...fn(set, get),
    }))
    return () => store
  }),
}))

// Mock ReactFlow
jest.mock('reactflow', () => ({
  ReactFlow: ({ children, ...props }) => <div data-testid="react-flow" {...props}>{children}</div>,
  Node: ({ children, ...props }) => <div data-testid="react-flow-node" {...props}>{children}</div>,
  Edge: ({ children, ...props }) => <div data-testid="react-flow-edge" {...props}>{children}</div>,
  Handle: (props) => <div data-testid="react-flow-handle" {...props} />,
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
  MarkerType: {
    Arrow: 'arrow',
    ArrowClosed: 'arrowclosed',
  },
  useNodesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
  useEdgesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
  useReactFlow: jest.fn(() => ({
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    setNodes: jest.fn(),
    setEdges: jest.fn(),
    addNodes: jest.fn(),
    addEdges: jest.fn(),
    deleteElements: jest.fn(),
    fitView: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    zoomTo: jest.fn(),
    getZoom: jest.fn(() => 1),
    setViewport: jest.fn(),
    getViewport: jest.fn(() => ({ x: 0, y: 0, zoom: 1 })),
    project: jest.fn(),
    screenToFlowPosition: jest.fn(),
    flowToScreenPosition: jest.fn(),
  })),
  addEdge: jest.fn(),
  applyNodeChanges: jest.fn(),
  applyEdgeChanges: jest.fn(),
}))

// Mock rc-dock
jest.mock('rc-dock', () => ({
  DockLayout: ({ children, ...props }) => <div data-testid="dock-layout" {...props}>{children}</div>,
  DividerBox: ({ children, ...props }) => <div data-testid="divider-box" {...props}>{children}</div>,
  TabData: {},
  PanelData: {},
  BoxData: {},
  LayoutData: {},
}))

// Mock canvas-related functions for HTML5 Canvas
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}))

// Mock File API
global.File = class MockFile {
  constructor(parts, filename, properties) {
    this.parts = parts
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + (typeof part === 'string' ? part.length : part.byteLength || 0), 0)
    this.type = properties?.type || ''
    this.lastModified = Date.now()
  }
}

global.FileReader = class MockFileReader {
  constructor() {
    this.readyState = 0
    this.result = null
  }

  readAsText() {
    this.result = 'mock file content'
    this.readyState = 2
    if (this.onload) this.onload({ target: this })
  }

  readAsDataURL() {
    this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ='
    this.readyState = 2
    if (this.onload) this.onload({ target: this })
  }
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Suppress console errors in tests unless explicitly testing error handling
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: React.createFactory() is deprecated'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})