/**
 * QuadTree Spatial Indexing
 *
 * High-performance spatial data structure for efficient element culling
 * in the minimap component. Provides O(log n) query time for viewport-based
 * element retrieval.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadTreeElement<T = any> {
  id: string;
  bounds: Bounds;
  data: T;
}

export interface QueryResult<T = any> {
  element: QuadTreeElement<T>;
  distance?: number;
}

// ============================================================================
// QuadTree Node
// ============================================================================

class QuadTreeNode<T = any> {
  bounds: Bounds;
  capacity: number;
  elements: QuadTreeElement<T>[] = [];
  divided: boolean = false;

  // Child nodes (NW, NE, SW, SE)
  northwest?: QuadTreeNode<T>;
  northeast?: QuadTreeNode<T>;
  southwest?: QuadTreeNode<T>;
  southeast?: QuadTreeNode<T>;

  constructor(bounds: Bounds, capacity: number = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
  }

  /**
   * Subdivide this node into 4 quadrants
   */
  subdivide(): void {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.northwest = new QuadTreeNode<T>(
      { x, y, width: halfWidth, height: halfHeight },
      this.capacity
    );

    this.northeast = new QuadTreeNode<T>(
      { x: x + halfWidth, y, width: halfWidth, height: halfHeight },
      this.capacity
    );

    this.southwest = new QuadTreeNode<T>(
      { x, y: y + halfHeight, width: halfWidth, height: halfHeight },
      this.capacity
    );

    this.southeast = new QuadTreeNode<T>(
      { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight },
      this.capacity
    );

    this.divided = true;
  }

  /**
   * Insert element into the QuadTree
   */
  insert(element: QuadTreeElement<T>): boolean {
    // Check if element intersects this node
    if (!this.intersects(element.bounds)) {
      return false;
    }

    // If capacity not reached, add element here
    if (this.elements.length < this.capacity && !this.divided) {
      this.elements.push(element);
      return true;
    }

    // Otherwise, subdivide if needed
    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert into children
    if (this.northwest!.insert(element)) return true;
    if (this.northeast!.insert(element)) return true;
    if (this.southwest!.insert(element)) return true;
    if (this.southeast!.insert(element)) return true;

    // If element doesn't fit in any child (spans multiple quadrants), store here
    this.elements.push(element);
    return true;
  }

  /**
   * Query all elements within a boundary
   */
  query(range: Bounds, found: QuadTreeElement<T>[] = []): QuadTreeElement<T>[] {
    // If range doesn't intersect this node, return
    if (!this.intersectsBounds(range)) {
      return found;
    }

    // Check elements in this node
    for (const element of this.elements) {
      if (this.intersectsBoundsWithBounds(range, element.bounds)) {
        found.push(element);
      }
    }

    // Recursively check children
    if (this.divided) {
      this.northwest!.query(range, found);
      this.northeast!.query(range, found);
      this.southwest!.query(range, found);
      this.southeast!.query(range, found);
    }

    return found;
  }

  /**
   * Find all elements within a radius of a point
   */
  queryRadius(point: Point, radius: number, found: QueryResult<T>[] = []): QueryResult<T>[] {
    // Create bounding box for radius
    const range: Bounds = {
      x: point.x - radius,
      y: point.y - radius,
      width: radius * 2,
      height: radius * 2,
    };

    // If range doesn't intersect this node, return
    if (!this.intersectsBounds(range)) {
      return found;
    }

    // Check elements in this node
    for (const element of this.elements) {
      const distance = this.distanceToElement(point, element.bounds);
      if (distance <= radius) {
        found.push({ element, distance });
      }
    }

    // Recursively check children
    if (this.divided) {
      this.northwest!.queryRadius(point, radius, found);
      this.northeast!.queryRadius(point, radius, found);
      this.southwest!.queryRadius(point, radius, found);
      this.southeast!.queryRadius(point, radius, found);
    }

    return found;
  }

  /**
   * Get all elements in the tree
   */
  getAllElements(found: QuadTreeElement<T>[] = []): QuadTreeElement<T>[] {
    found.push(...this.elements);

    if (this.divided) {
      this.northwest!.getAllElements(found);
      this.northeast!.getAllElements(found);
      this.southwest!.getAllElements(found);
      this.southeast!.getAllElements(found);
    }

    return found;
  }

  /**
   * Get tree statistics
   */
  getStats(): { nodeCount: number; elementCount: number; maxDepth: number } {
    let nodeCount = 1;
    let elementCount = this.elements.length;
    let maxDepth = 0;

    if (this.divided) {
      const nwStats = this.northwest!.getStats();
      const neStats = this.northeast!.getStats();
      const swStats = this.southwest!.getStats();
      const seStats = this.southeast!.getStats();

      nodeCount += nwStats.nodeCount + neStats.nodeCount + swStats.nodeCount + seStats.nodeCount;
      elementCount += nwStats.elementCount + neStats.elementCount + swStats.elementCount + seStats.elementCount;
      maxDepth = Math.max(nwStats.maxDepth, neStats.maxDepth, swStats.maxDepth, seStats.maxDepth) + 1;
    }

    return { nodeCount, elementCount, maxDepth };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private intersects(bounds: Bounds): boolean {
    return !(
      bounds.x > this.bounds.x + this.bounds.width ||
      bounds.x + bounds.width < this.bounds.x ||
      bounds.y > this.bounds.y + this.bounds.height ||
      bounds.y + bounds.height < this.bounds.y
    );
  }

  private intersectsBounds(range: Bounds): boolean {
    return !(
      range.x > this.bounds.x + this.bounds.width ||
      range.x + range.width < this.bounds.x ||
      range.y > this.bounds.y + this.bounds.height ||
      range.y + range.height < this.bounds.y
    );
  }

  private intersectsBoundsWithBounds(a: Bounds, b: Bounds): boolean {
    return !(
      a.x > b.x + b.width ||
      a.x + a.width < b.x ||
      a.y > b.y + b.height ||
      a.y + a.height < b.y
    );
  }

  private distanceToElement(point: Point, bounds: Bounds): number {
    // Find closest point on bounds to the given point
    const closestX = Math.max(bounds.x, Math.min(point.x, bounds.x + bounds.width));
    const closestY = Math.max(bounds.y, Math.min(point.y, bounds.y + bounds.height));

    const dx = point.x - closestX;
    const dy = point.y - closestY;

    return Math.sqrt(dx * dx + dy * dy);
  }
}

// ============================================================================
// QuadTree Main Class
// ============================================================================

export class QuadTree<T = any> {
  private root: QuadTreeNode<T>;
  private elementMap: Map<string, QuadTreeElement<T>> = new Map();

  constructor(bounds: Bounds, capacity: number = 4) {
    this.root = new QuadTreeNode<T>(bounds, capacity);
  }

  /**
   * Insert an element into the QuadTree
   */
  insert(element: QuadTreeElement<T>): boolean {
    // Check for duplicates
    if (this.elementMap.has(element.id)) {
      return false;
    }

    const inserted = this.root.insert(element);
    if (inserted) {
      this.elementMap.set(element.id, element);
    }
    return inserted;
  }

  /**
   * Remove an element from the QuadTree
   */
  remove(elementId: string): boolean {
    if (!this.elementMap.has(elementId)) {
      return false;
    }

    this.elementMap.delete(elementId);

    // Rebuild tree (simple approach - could be optimized)
    const elements = Array.from(this.elementMap.values());
    this.clear();
    elements.forEach(el => this.root.insert(el));

    return true;
  }

  /**
   * Update an element's position
   */
  update(elementId: string, newBounds: Bounds): boolean {
    const element = this.elementMap.get(elementId);
    if (!element) {
      return false;
    }

    element.bounds = newBounds;

    // Rebuild tree
    const elements = Array.from(this.elementMap.values());
    this.clear();
    elements.forEach(el => this.root.insert(el));

    return true;
  }

  /**
   * Query elements within a boundary
   */
  query(range: Bounds): QuadTreeElement<T>[] {
    return this.root.query(range);
  }

  /**
   * Find elements within radius of a point
   */
  queryRadius(point: Point, radius: number): QueryResult<T>[] {
    return this.root.queryRadius(point, radius);
  }

  /**
   * Find k nearest neighbors to a point
   */
  queryKNearest(point: Point, k: number, maxDistance: number = Infinity): QueryResult<T>[] {
    // Start with a reasonable search radius
    let searchRadius = 100;
    let results: QueryResult<T>[] = [];

    // Expand search radius until we find k elements or reach maxDistance
    while (results.length < k && searchRadius <= maxDistance) {
      results = this.queryRadius(point, searchRadius);
      searchRadius *= 2;
    }

    // Sort by distance and return k nearest
    return results
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, k)
      .filter(r => (r.distance || 0) <= maxDistance);
  }

  /**
   * Get element by ID
   */
  get(elementId: string): QuadTreeElement<T> | undefined {
    return this.elementMap.get(elementId);
  }

  /**
   * Check if element exists
   */
  has(elementId: string): boolean {
    return this.elementMap.has(elementId);
  }

  /**
   * Get all elements
   */
  getAll(): QuadTreeElement<T>[] {
    return Array.from(this.elementMap.values());
  }

  /**
   * Clear the QuadTree
   */
  clear(): void {
    this.elementMap.clear();
    const {bounds} = this.root;
    const {capacity} = this.root;
    this.root = new QuadTreeNode<T>(bounds, capacity);
  }

  /**
   * Get tree statistics
   */
  getStats(): {
    nodeCount: number;
    elementCount: number;
    maxDepth: number;
    bounds: Bounds;
  } {
    const stats = this.root.getStats();
    return {
      ...stats,
      bounds: this.root.bounds,
    };
  }

  /**
   * Rebuild tree with new bounds
   */
  rebuild(newBounds: Bounds, capacity?: number): void {
    const elements = Array.from(this.elementMap.values());
    this.root = new QuadTreeNode<T>(newBounds, capacity || this.root.capacity);
    this.elementMap.clear();
    elements.forEach(el => this.insert(el));
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate optimal QuadTree capacity based on element count
 */
export function calculateOptimalCapacity(elementCount: number): number {
  if (elementCount < 100) return 4;
  if (elementCount < 1000) return 8;
  if (elementCount < 10000) return 16;
  return 32;
}

/**
 * Calculate optimal bounds that encompass all elements with padding
 */
export function calculateOptimalBounds<T>(
  elements: QuadTreeElement<T>[],
  padding: number = 100
): Bounds {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 1000, height: 1000 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const element of elements) {
    const { x, y, width, height } = element.bounds;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}
