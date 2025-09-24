/**
 * A* Pathfinding Service for Smart Pipe Routing
 * Provides intelligent pathfinding for drawing pipes between P&ID symbols
 */

import type { Node as ReactFlowNode } from "reactflow";

/**
 * Configuration for pathfinding behavior
 */
export interface PathfindingConfig {
  gridSize: number; // Size of grid cells for pathfinding
  obstacleBuffer: number; // Buffer around obstacles
  routingMode: RoutingMode;
  diagonalCost: number; // Cost multiplier for diagonal movement
  turnPenalty: number; // Penalty for changing direction
  maxIterations: number; // Maximum iterations to prevent infinite loops
}

/**
 * Routing modes for different pipe styles
 */
export enum RoutingMode {
  ORTHOGONAL = "orthogonal", // Only horizontal/vertical
  DIAGONAL = "diagonal", // Allow 45-degree angles
  FREE = "free", // Any angle
}

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle for obstacle representation
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Path segment with metadata
 */
export interface PathSegment {
  start: Point;
  end: Point;
  direction: Direction;
  type: SegmentType;
}

/**
 * Movement directions
 */
export enum Direction {
  NORTH = "north",
  SOUTH = "south",
  EAST = "east",
  WEST = "west",
  NORTHEAST = "northeast",
  NORTHWEST = "northwest",
  SOUTHEAST = "southeast",
  SOUTHWEST = "southwest",
}

/**
 * Segment types for styling
 */
export enum SegmentType {
  STRAIGHT = "straight",
  CORNER = "corner",
  DIAGONAL = "diagonal",
}

/**
 * Node in the pathfinding grid
 */
class GridNode {
  x: number;
  y: number;
  g: number = 0; // Cost from start
  h: number = 0; // Heuristic cost to end
  f: number = 0; // Total cost (g + h)
  parent: GridNode | null = null;
  direction: Direction | null = null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Main pathfinding service class
 */
export class PathfindingService {
  private config: PathfindingConfig;
  private grid: Map<string, GridNode> = new Map();
  private obstacles: Rectangle[] = [];

  constructor(config?: Partial<PathfindingConfig>) {
    this.config = {
      gridSize: 10,
      obstacleBuffer: 20,
      routingMode: RoutingMode.ORTHOGONAL,
      diagonalCost: 1.414,
      turnPenalty: 0.5,
      maxIterations: 10000,
      ...config,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PathfindingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set obstacles from ReactFlow nodes
   */
  setObstaclesFromNodes(
    nodes: ReactFlowNode[],
    excludeIds: string[] = []
  ): void {
    this.obstacles = nodes
      .filter((node) => !excludeIds.includes(node.id))
      .map((node) => ({
        x: node.position.x - this.config.obstacleBuffer,
        y: node.position.y - this.config.obstacleBuffer,
        width: (node.width || 100) + 2 * this.config.obstacleBuffer,
        height: (node.height || 50) + 2 * this.config.obstacleBuffer,
      }));
  }

  /**
   * Add manual obstacles
   */
  addObstacles(obstacles: Rectangle[]): void {
    this.obstacles.push(...obstacles);
  }

  /**
   * Clear all obstacles
   */
  clearObstacles(): void {
    this.obstacles = [];
  }

  /**
   * Find optimal path using A* algorithm
   */
  findPath(start: Point, end: Point): Point[] {
    // Reset grid
    this.grid.clear();

    // Convert to grid coordinates
    const startGrid = this.toGridCoords(start);
    const endGrid = this.toGridCoords(end);

    // Initialize start node
    const startNode = new GridNode(startGrid.x, startGrid.y);
    startNode.h = this.heuristic(startNode, endGrid);
    startNode.f = startNode.h;

    // Open and closed sets
    const openSet: GridNode[] = [startNode];
    const closedSet = new Set<string>();
    let iterations = 0;

    while (openSet.length > 0 && iterations < this.config.maxIterations) {
      iterations++;

      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      if (!current) break;
      const currentKey = `${current.x},${current.y}`;

      // Check if we reached the goal
      if (current.x === endGrid.x && current.y === endGrid.y) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      // Check all neighbors
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        // Skip if in closed set
        if (closedSet.has(neighborKey)) continue;

        // Skip if blocked by obstacle
        if (this.isBlocked(neighbor)) continue;

        // Calculate tentative g score
        const moveCost = this.getMoveCost(current, neighbor);
        const tentativeG = current.g + moveCost;

        // Check if this path to neighbor is better
        const existingNeighbor = openSet.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y
        );

        if (!existingNeighbor) {
          // New node discovered
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(neighbor, endGrid);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          neighbor.direction = this.getDirection(current, neighbor);
          openSet.push(neighbor);
        } else if (tentativeG < existingNeighbor.g) {
          // Better path found
          existingNeighbor.g = tentativeG;
          existingNeighbor.f = existingNeighbor.g + existingNeighbor.h;
          existingNeighbor.parent = current;
          existingNeighbor.direction = this.getDirection(current, neighbor);
        }
      }
    }

    // No path found - return direct line
    return [start, end];
  }

  /**
   * Find smooth path with bezier curves
   */
  findSmoothPath(start: Point, end: Point): string {
    const path = this.findPath(start, end);
    return this.smoothPath(path);
  }

  /**
   * Convert path to SVG path string
   */
  pathToSvg(points: Point[]): string {
    if (points.length < 2) return "";

    let svg = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      svg += ` L ${points[i].x} ${points[i].y}`;
    }

    return svg;
  }

  /**
   * Convert to grid coordinates
   */
  private toGridCoords(point: Point): Point {
    return {
      x: Math.round(point.x / this.config.gridSize),
      y: Math.round(point.y / this.config.gridSize),
    };
  }

  /**
   * Convert from grid coordinates
   */
  private fromGridCoords(point: Point): Point {
    return {
      x: point.x * this.config.gridSize,
      y: point.y * this.config.gridSize,
    };
  }

  /**
   * Calculate heuristic (Manhattan or Euclidean distance)
   */
  private heuristic(node: GridNode, goal: Point): number {
    const dx = Math.abs(node.x - goal.x);
    const dy = Math.abs(node.y - goal.y);

    switch (this.config.routingMode) {
      case RoutingMode.ORTHOGONAL:
        return dx + dy; // Manhattan distance
      case RoutingMode.DIAGONAL:
      case RoutingMode.FREE:
        return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
      default:
        return dx + dy;
    }
  }

  /**
   * Get valid neighbors for a node
   */
  private getNeighbors(node: GridNode): GridNode[] {
    const neighbors: GridNode[] = [];
    const directions: Array<[number, number, Direction]> = [
      [0, -1, Direction.NORTH],
      [0, 1, Direction.SOUTH],
      [1, 0, Direction.EAST],
      [-1, 0, Direction.WEST],
    ];

    // Add diagonal directions if allowed
    if (
      this.config.routingMode === RoutingMode.DIAGONAL ||
      this.config.routingMode === RoutingMode.FREE
    ) {
      directions.push(
        [1, -1, Direction.NORTHEAST],
        [-1, -1, Direction.NORTHWEST],
        [1, 1, Direction.SOUTHEAST],
        [-1, 1, Direction.SOUTHWEST]
      );
    }

    for (const [dx, dy, _direction] of directions) {
      const neighbor = new GridNode(node.x + dx, node.y + dy);
      neighbors.push(neighbor);
    }

    return neighbors;
  }

  /**
   * Calculate movement cost
   */
  private getMoveCost(from: GridNode, to: GridNode): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Diagonal movement
    if (dx === 1 && dy === 1) {
      return this.config.diagonalCost;
    }

    // Add turn penalty if changing direction
    let turnPenalty = 0;
    if (from.parent && from.direction) {
      const newDirection = this.getDirection(from, to);
      if (newDirection !== from.direction) {
        ({ turnPenalty } = this.config);
      }
    }

    return 1 + turnPenalty;
  }

  /**
   * Get direction from one node to another
   */
  private getDirection(from: GridNode, to: GridNode): Direction {
    const [dx, dy] = [to.x - from.x, to.y - from.y];

    if (dx === 0 && dy < 0) return Direction.NORTH;
    if (dx === 0 && dy > 0) return Direction.SOUTH;
    if (dx > 0 && dy === 0) return Direction.EAST;
    if (dx < 0 && dy === 0) return Direction.WEST;
    if (dx > 0 && dy < 0) return Direction.NORTHEAST;
    if (dx < 0 && dy < 0) return Direction.NORTHWEST;
    if (dx > 0 && dy > 0) return Direction.SOUTHEAST;
    if (dx < 0 && dy > 0) return Direction.SOUTHWEST;

    return Direction.NORTH; // Default
  }

  /**
   * Check if a node is blocked by obstacles
   */
  private isBlocked(node: GridNode): boolean {
    const worldPoint = this.fromGridCoords(node);

    for (const obstacle of this.obstacles) {
      if (
        worldPoint.x >= obstacle.x &&
        worldPoint.x <= obstacle.x + obstacle.width &&
        worldPoint.y >= obstacle.y &&
        worldPoint.y <= obstacle.y + obstacle.height
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Reconstruct path from goal node
   */
  private reconstructPath(node: GridNode): Point[] {
    const path: Point[] = [];
    let current: GridNode | null = node;

    while (current) {
      path.unshift(this.fromGridCoords(current));
      current = current.parent;
    }

    return this.optimizePath(path);
  }

  /**
   * Optimize path by removing unnecessary waypoints
   */
  private optimizePath(path: Point[]): Point[] {
    if (path.length <= 2) return path;

    const optimized: Point[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];

      // Calculate directions
      const dir1 = this.getDirectionBetweenPoints(prev, current);
      const dir2 = this.getDirectionBetweenPoints(current, next);

      // Keep point if direction changes
      if (dir1 !== dir2) {
        optimized.push(current);
      }
    }

    optimized.push(path[path.length - 1]);
    return optimized;
  }

  /**
   * Get direction between two world points
   */
  private getDirectionBetweenPoints(from: Point, to: Point): Direction {
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);

    if (dx === 0 && dy < 0) return Direction.NORTH;
    if (dx === 0 && dy > 0) return Direction.SOUTH;
    if (dx > 0 && dy === 0) return Direction.EAST;
    if (dx < 0 && dy === 0) return Direction.WEST;
    if (dx > 0 && dy < 0) return Direction.NORTHEAST;
    if (dx < 0 && dy < 0) return Direction.NORTHWEST;
    if (dx > 0 && dy > 0) return Direction.SOUTHEAST;
    if (dx < 0 && dy > 0) return Direction.SOUTHWEST;

    return Direction.NORTH;
  }

  /**
   * Smooth path with bezier curves
   */
  private smoothPath(points: Point[]): string {
    if (points.length < 2) return "";
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let svg = `M ${points[0].x} ${points[0].y}`;

    // Create smooth curves through corners
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];

      // Calculate control point offset
      const offset = Math.min(
        20,
        Math.min(
          this.distance(prev, current) * 0.3,
          this.distance(current, next) * 0.3
        )
      );

      // Calculate control points
      const cp1 = this.offsetPoint(current, prev, offset);
      const cp2 = this.offsetPoint(current, next, offset);

      // Add curve
      svg += ` L ${cp1.x} ${cp1.y}`;
      svg += ` Q ${current.x} ${current.y} ${cp2.x} ${cp2.y}`;
    }

    svg += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return svg;
  }

  /**
   * Calculate distance between two points
   */
  private distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Offset a point towards another point
   */
  private offsetPoint(from: Point, towards: Point, distance: number): Point {
    const d = this.distance(from, towards);
    if (d === 0) return from;

    const ratio = distance / d;
    return {
      x: from.x + (towards.x - from.x) * ratio,
      y: from.y + (towards.y - from.y) * ratio,
    };
  }

  /**
   * Get path segments with metadata
   */
  getPathSegments(points: Point[]): PathSegment[] {
    const segments: PathSegment[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const direction = this.getDirectionBetweenPoints(start, end);

      let type: SegmentType = SegmentType.STRAIGHT;
      if (i > 0) {
        const prevDirection = this.getDirectionBetweenPoints(points[i - 1], start);
        if (prevDirection !== direction) {
          type = SegmentType.CORNER;
        }
      }
      if ([Direction.NORTHEAST, Direction.NORTHWEST, Direction.SOUTHEAST, Direction.SOUTHWEST].includes(direction)) {
        type = SegmentType.DIAGONAL;
      }

      segments.push({ start, end, direction, type });
    }

    return segments;
  }
}

/**
 * Singleton instance for global usage
 */
export const pathfindingService = new PathfindingService();

/**
 * React hook for using pathfinding service
 */
export function usePathfinding(config?: Partial<PathfindingConfig>): {
  findPath: (start: Point, end: Point, obstacles?: ReactFlowNode[]) => Point[];
  findSmoothPath: (start: Point, end: Point, obstacles?: ReactFlowNode[]) => string;
  pathToSvg: (points: Point[]) => string;
  updateConfig: (newConfig: Partial<PathfindingConfig>) => void;
  service: PathfindingService;
} {
  const service = new PathfindingService(config);

  return {
    findPath: (start: Point, end: Point, obstacles?: ReactFlowNode[]) => {
      if (obstacles) {
        service.setObstaclesFromNodes(obstacles);
      }
      return service.findPath(start, end);
    },
    findSmoothPath: (start: Point, end: Point, obstacles?: ReactFlowNode[]) => {
      if (obstacles) {
        service.setObstaclesFromNodes(obstacles);
      }
      return service.findSmoothPath(start, end);
    },
    pathToSvg: (points: Point[]) => service.pathToSvg(points),
    updateConfig: (newConfig: Partial<PathfindingConfig>) => service.updateConfig(newConfig),
    service,
  };
}