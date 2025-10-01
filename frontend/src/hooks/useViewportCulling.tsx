/**
 * Viewport Culling Hook
 *
 * Advanced viewport optimization with:
 * - Spatial indexing using QuadTree
 * - Frustum culling with bounding boxes
 * - Visibility tracking and caching
 * - Performance monitoring
 * - Support for 10,000+ elements
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow, type Node, type Edge, type Viewport } from 'reactflow';
import { QuadTree, type QuadTreeElement } from '../utils/QuadTree';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CullingConfig {
  enabled?: boolean;
  padding?: number; // Extra area around viewport to preload
  enableCache?: boolean;
  cacheTimeout?: number; // ms
  updateThrottle?: number; // ms
  enableStats?: boolean;
}

export interface CullingStats {
  totalElements: number;
  visibleElements: number;
  culledElements: number;
  updateTime: number; // ms
  cacheHitRate: number; // 0-1
  quadTreeDepth: number;
  quadTreeNodes: number;
}

export interface VisibilityState {
  visibleNodes: Node[];
  visibleEdges: Edge[];
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<CullingConfig> = {
  enabled: true,
  padding: 200,
  enableCache: true,
  cacheTimeout: 100,
  updateThrottle: 16, // ~60fps
  enableStats: false,
};

// ============================================================================
// Viewport Culling Hook
// ============================================================================

export function useViewportCulling(config: CullingConfig = {}) {
  const { getNodes, getEdges, getViewport } = useReactFlow();
  const fullConfig: Required<CullingConfig> = { ...DEFAULT_CONFIG, ...config };

  const [visibilityState, setVisibilityState] = useState<VisibilityState>({
    visibleNodes: [],
    visibleEdges: [],
    visibleNodeIds: new Set(),
    visibleEdgeIds: new Set(),
  });

  const [stats, setStats] = useState<CullingStats>({
    totalElements: 0,
    visibleElements: 0,
    culledElements: 0,
    updateTime: 0,
    cacheHitRate: 0,
    quadTreeDepth: 0,
    quadTreeNodes: 0,
  });

  // Refs for optimization
  const quadTreeRef = useRef<QuadTree<Node> | null>(null);
  const cacheRef = useRef<{
    viewport: Viewport | null;
    visibleNodes: Node[];
    timestamp: number;
  }>({
    viewport: null,
    visibleNodes: [],
    timestamp: 0,
  });
  const lastUpdateRef = useRef<number>(0);
  const cacheHitsRef = useRef<number>(0);
  const cacheMissesRef = useRef<number>(0);

  // ============================================================================
  // Spatial Indexing
  // ============================================================================

  useEffect(() => {
    const nodes = getNodes();

    // Convert nodes to QuadTree elements
    const elements: QuadTreeElement<Node>[] = nodes.map((node) => ({
      id: node.id,
      bounds: {
        x: node.position.x,
        y: node.position.y,
        width: (node.width as number) || 100,
        height: (node.height as number) || 80,
      },
      data: node,
    }));

    // Calculate optimal bounds
    if (elements.length === 0) {
      quadTreeRef.current = new QuadTree({ x: 0, y: 0, width: 10000, height: 10000 }, 8);
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of elements) {
      minX = Math.min(minX, el.bounds.x);
      minY = Math.min(minY, el.bounds.y);
      maxX = Math.max(maxX, el.bounds.x + el.bounds.width);
      maxY = Math.max(maxY, el.bounds.y + el.bounds.height);
    }

    const padding = 500;
    const bounds = {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };

    // Rebuild QuadTree
    const capacity = elements.length < 100 ? 4 : elements.length < 1000 ? 8 : 16;
    quadTreeRef.current = new QuadTree<Node>(bounds, capacity);

    elements.forEach((el) => quadTreeRef.current!.insert(el));

    // Update stats
    if (fullConfig.enableStats) {
      const treeStats = quadTreeRef.current.getStats();
      setStats((prev) => ({
        ...prev,
        totalElements: elements.length,
        quadTreeDepth: treeStats.maxDepth,
        quadTreeNodes: treeStats.nodeCount,
      }));
    }
  }, [getNodes, fullConfig.enableStats]);

  // ============================================================================
  // Frustum Culling
  // ============================================================================

  const performCulling = useCallback(() => {
    if (!fullConfig.enabled || !quadTreeRef.current) {
      const nodes = getNodes();
      const edges = getEdges();
      setVisibilityState({
        visibleNodes: nodes,
        visibleEdges: edges,
        visibleNodeIds: new Set(nodes.map((n) => n.id)),
        visibleEdgeIds: new Set(edges.map((e) => e.id)),
      });
      return;
    }

    const startTime = performance.now();
    const viewport = getViewport();

    // Check cache
    if (
      fullConfig.enableCache &&
      cacheRef.current.viewport &&
      Date.now() - cacheRef.current.timestamp < fullConfig.cacheTimeout &&
      viewportsEqual(viewport, cacheRef.current.viewport)
    ) {
      cacheHitsRef.current++;
      return;
    }

    cacheMissesRef.current++;

    // Calculate visible bounds with padding
    const visibleBounds = {
      x: -viewport.x / viewport.zoom - fullConfig.padding,
      y: -viewport.y / viewport.zoom - fullConfig.padding,
      width: window.innerWidth / viewport.zoom + fullConfig.padding * 2,
      height: window.innerHeight / viewport.zoom + fullConfig.padding * 2,
    };

    // Query QuadTree for visible nodes
    const visibleElements = quadTreeRef.current.query(visibleBounds);
    const visibleNodes = visibleElements.map((el) => el.data);
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

    // Filter edges that connect visible nodes
    const allEdges = getEdges();
    const visibleEdges = allEdges.filter(
      (edge) => visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target)
    );
    const visibleEdgeIds = new Set(visibleEdges.map((e) => e.id));

    // Update cache
    if (fullConfig.enableCache) {
      cacheRef.current = {
        viewport,
        visibleNodes,
        timestamp: Date.now(),
      };
    }

    // Update visibility state
    setVisibilityState({
      visibleNodes,
      visibleEdges,
      visibleNodeIds,
      visibleEdgeIds,
    });

    // Update stats
    if (fullConfig.enableStats) {
      const updateTime = performance.now() - startTime;
      const totalHits = cacheHitsRef.current + cacheMissesRef.current;
      const cacheHitRate = totalHits > 0 ? cacheHitsRef.current / totalHits : 0;

      setStats((prev) => ({
        ...prev,
        visibleElements: visibleNodes.length + visibleEdges.length,
        culledElements: prev.totalElements - visibleNodes.length - visibleEdges.length,
        updateTime,
        cacheHitRate,
      }));
    }
  }, [fullConfig, getNodes, getEdges, getViewport]);

  // ============================================================================
  // Throttled Update
  // ============================================================================

  useEffect(() => {
    const handleViewportChange = () => {
      const now = Date.now();

      if (now - lastUpdateRef.current < fullConfig.updateThrottle) {
        return;
      }

      lastUpdateRef.current = now;
      performCulling();
    };

    // Initial culling
    performCulling();

    // Listen to viewport changes
    const interval = setInterval(handleViewportChange, fullConfig.updateThrottle);

    return () => clearInterval(interval);
  }, [performCulling, fullConfig.updateThrottle]);

  // Also update on node changes
  useEffect(() => {
    performCulling();
  }, [getNodes, performCulling]);

  // ============================================================================
  // Visibility Checks
  // ============================================================================

  const isNodeVisible = useCallback(
    (nodeId: string): boolean => {
      return visibilityState.visibleNodeIds.has(nodeId);
    },
    [visibilityState]
  );

  const isEdgeVisible = useCallback(
    (edgeId: string): boolean => {
      return visibilityState.visibleEdgeIds.has(edgeId);
    },
    [visibilityState]
  );

  // ============================================================================
  // Manual Controls
  // ============================================================================

  const forceUpdate = useCallback(() => {
    cacheRef.current.viewport = null;
    performCulling();
  }, [performCulling]);

  const clearCache = useCallback(() => {
    cacheRef.current = {
      viewport: null,
      visibleNodes: [],
      timestamp: 0,
    };
    cacheHitsRef.current = 0;
    cacheMissesRef.current = 0;
  }, []);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // Visibility state
    visibleNodes: visibilityState.visibleNodes,
    visibleEdges: visibilityState.visibleEdges,
    visibleNodeIds: visibilityState.visibleNodeIds,
    visibleEdgeIds: visibilityState.visibleEdgeIds,

    // Visibility checks
    isNodeVisible,
    isEdgeVisible,

    // Stats
    stats,

    // Controls
    forceUpdate,
    clearCache,

    // Config
    config: fullConfig,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function viewportsEqual(a: Viewport, b: Viewport): boolean {
  return (
    Math.abs(a.x - b.x) < 1 &&
    Math.abs(a.y - b.y) < 1 &&
    Math.abs(a.zoom - b.zoom) < 0.01
  );
}

// ============================================================================
// Culling Stats Display Component
// ============================================================================

export interface CullingStatsDisplayProps {
  stats: CullingStats;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible?: boolean;
}

export const CullingStatsDisplay: React.FC<CullingStatsDisplayProps> = ({
  stats,
  position = 'top-left',
  visible = true,
}) => {
  if (!visible) return null;

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'monospace',
      lineHeight: '1.6',
    };

    const margin = 8;

    switch (position) {
      case 'top-left':
        return { ...base, top: margin, left: margin };
      case 'top-right':
        return { ...base, top: margin, right: margin };
      case 'bottom-left':
        return { ...base, bottom: margin, left: margin };
      case 'bottom-right':
        return { ...base, bottom: margin, right: margin };
      default:
        return base;
    }
  };

  const cullingEfficiency = stats.totalElements > 0
    ? ((stats.culledElements / stats.totalElements) * 100).toFixed(1)
    : '0';

  return (
    <div style={getPositionStyles()}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2196F3' }}>
        Viewport Culling
      </div>
      <div>Total: {stats.totalElements}</div>
      <div style={{ color: '#4CAF50' }}>Visible: {stats.visibleElements}</div>
      <div style={{ color: '#FF9800' }}>Culled: {stats.culledElements} ({cullingEfficiency}%)</div>
      <div>Update: {stats.updateTime.toFixed(2)} ms</div>
      <div>Cache Hit: {(stats.cacheHitRate * 100).toFixed(1)}%</div>
      <div>QuadTree Depth: {stats.quadTreeDepth}</div>
      <div>QuadTree Nodes: {stats.quadTreeNodes}</div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default useViewportCulling;
