import type { Node, Edge, XYPosition } from "reactflow";

export type RoutingMode = "orthogonal" | "diagonal" | "direct";

export interface PathfindingNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent?: PathfindingNode;
  blocked?: boolean;
}

export interface PathfindingOptions {
  routingMode: RoutingMode;
  gridSize: number;
  obstacleMargin: number;
  allowDiagonal: boolean;
  weight: number; // Heuristic weight
}

export interface RouteResult {
  path: XYPosition[];
  distance: number;
  success: boolean;
  message?: string;
}

/**
 * PathfindingService provides client-side A* pathfinding for automatic pipe routing
 * between P&ID symbols with obstacle avoidance.
 */
export class PathfindingService {
  private gridSize: number;
  private obstacleMargin: number;
  private routingMode: RoutingMode;
  private allowDiagonal: boolean;
  private weight: number;

  constructor(options: Partial<PathfindingOptions> = {}) {
    this.gridSize = options.gridSize || 20;
    this.obstacleMargin = options.obstacleMargin || 40;
    this.routingMode = options.routingMode || "orthogonal";
    this.allowDiagonal = options.allowDiagonal || false;
    this.weight = options.weight || 1.0;
  }

  /**
   * Find optimal path between two points using A* algorithm
   */
  public findPath(
    start: XYPosition,
    goal: XYPosition,
    obstacles: Node[],
    _existingEdges: Edge[] = []
  ): RouteResult {
    try {
      // Validate inputs
      if (!this.isValidPosition(start) || !this.isValidPosition(goal)) {
        return {
          path: [],
          distance: 0,
          success: false,
          message: "Invalid start or goal position"
        };
      }

      // If direct routing is enabled and path is clear, return direct path
      if (this.routingMode === "direct") {
        const directPath = this.getDirectPath(start, goal);
        if (this.isPathClear(directPath, obstacles)) {
          return {
            path: directPath,
            distance: this.calculateDistance(start, goal),
            success: true
          };
        }
      }

      // Use A* pathfinding for complex routing
      const path = this.aStarSearch(start, goal, obstacles);

      if (path.length === 0) {
        return {
          path: [],
          distance: 0,
          success: false,
          message: "No path found between start and goal"
        };
      }

      const optimizedPath = this.optimizePath(path);
      const distance = this.calculatePathDistance(optimizedPath);

      return {
        path: optimizedPath,
        distance,
        success: true
      };

    } catch (error) {
      return {
        path: [],
        distance: 0,
        success: false,
        message: `Pathfinding error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * A* search algorithm implementation
   */
  private aStarSearch(
    start: XYPosition,
    goal: XYPosition,
    obstacles: Node[]
  ): XYPosition[] {
    const openList: PathfindingNode[] = [];
    const closedList: Set<string> = new Set();

    // Initialize start node
    const startNode: PathfindingNode = {
      x: Math.round(start.x / this.gridSize) * this.gridSize,
      y: Math.round(start.y / this.gridSize) * this.gridSize,
      g: 0,
      h: this.calculateHeuristic(start, goal),
      f: 0
    };
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);

    while (openList.length > 0) {
      // Find node with lowest f cost
      const currentNode = openList.reduce((min, node) =>
        node.f < min.f ? node : min
      );

      // Remove current node from open list
      const currentIndex = openList.indexOf(currentNode);
      openList.splice(currentIndex, 1);

      // Add to closed list
      const nodeKey = `${currentNode.x},${currentNode.y}`;
      closedList.add(nodeKey);

      // Check if we reached the goal
      if (this.isAtGoal(currentNode, goal)) {
        return this.reconstructPath(currentNode);
      }

      // Examine neighbors
      const neighbors = this.getNeighbors(currentNode);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        // Skip if in closed list or blocked by obstacle
        if (closedList.has(neighborKey) || this.isBlocked(neighbor, obstacles)) {
          continue;
        }

        const tentativeG = currentNode.g + this.calculateMovementCost(currentNode, neighbor);

        // Check if this path to neighbor is better
        const existingInOpen = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existingInOpen || tentativeG < existingInOpen.g) {
          neighbor.parent = currentNode;
          neighbor.g = tentativeG;
          neighbor.h = this.calculateHeuristic(neighbor, goal);
          neighbor.f = neighbor.g + neighbor.h;

          if (!existingInOpen) {
            openList.push(neighbor);
          }
        }
      }
    }

    // No path found
    return [];
  }

  /**
   * Get neighboring grid points
   */
  private getNeighbors(node: PathfindingNode): PathfindingNode[] {
    const neighbors: PathfindingNode[] = [];
    const directions = this.allowDiagonal
      ? [
          { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
          { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ]
      : [
          { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];

    for (const { dx, dy } of directions) {
      const newX = node.x + dx * this.gridSize;
      const newY = node.y + dy * this.gridSize;

      neighbors.push({
        x: newX,
        y: newY,
        g: 0,
        h: 0,
        f: 0
      });
    }

    return neighbors;
  }

  /**
   * Calculate heuristic distance (Manhattan or Euclidean)
   */
  private calculateHeuristic(from: XYPosition, to: XYPosition): number {
    if (this.routingMode === "orthogonal") {
      // Manhattan distance
      return (Math.abs(to.x - from.x) + Math.abs(to.y - from.y)) * this.weight;
    } else {
      // Euclidean distance
      return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)) * this.weight;
    }
  }

  /**
   * Calculate movement cost between two adjacent nodes
   */
  private calculateMovementCost(from: PathfindingNode, to: PathfindingNode): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    if (dx > 0 && dy > 0) {
      // Diagonal movement
      return Math.sqrt(2) * this.gridSize;
    } else {
      // Orthogonal movement
      return this.gridSize;
    }
  }

  /**
   * Check if a position is blocked by obstacles
   */
  private isBlocked(position: XYPosition, obstacles: Node[]): boolean {
    for (const obstacle of obstacles) {
      const obstacleX = obstacle.position.x;
      const obstacleY = obstacle.position.y;
      const obstacleWidth = obstacle.width || 100;
      const obstacleHeight = obstacle.height || 60;

      // Check if position is within obstacle bounds (with margin)
      if (
        position.x >= obstacleX - this.obstacleMargin &&
        position.x <= obstacleX + obstacleWidth + this.obstacleMargin &&
        position.y >= obstacleY - this.obstacleMargin &&
        position.y <= obstacleY + obstacleHeight + this.obstacleMargin
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if current node is at goal position
   */
  private isAtGoal(node: PathfindingNode, goal: XYPosition): boolean {
    const distance = Math.sqrt(
      Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2)
    );
    return distance <= this.gridSize;
  }

  /**
   * Reconstruct path from goal to start
   */
  private reconstructPath(goalNode: PathfindingNode): XYPosition[] {
    const path: XYPosition[] = [];
    let currentNode: PathfindingNode | undefined = goalNode;

    while (currentNode) {
      path.unshift({ x: currentNode.x, y: currentNode.y });
      currentNode = currentNode.parent;
    }

    return path;
  }

  /**
   * Optimize path by removing unnecessary waypoints
   */
  private optimizePath(path: XYPosition[]): XYPosition[] {
    if (path.length <= 2) return path;

    const firstPoint = path[0];
    const lastPoint = path[path.length - 1];

    if (!firstPoint || !lastPoint) return path;

    const optimized: XYPosition[] = [firstPoint];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];

      // Check if all points exist and if current point is necessary for the path
      if (prev && current && next && !this.areCollinear(prev, current, next)) {
        optimized.push(current);
      }
    }

    optimized.push(lastPoint);
    return optimized;
  }

  /**
   * Check if three points are collinear
   */
  private areCollinear(p1: XYPosition, p2: XYPosition, p3: XYPosition): boolean {
    const tolerance = 1; // Allow small deviations
    const area = Math.abs(
      (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)
    );
    return area <= tolerance;
  }

  /**
   * Get direct path between two points
   */
  private getDirectPath(start: XYPosition, goal: XYPosition): XYPosition[] {
    return [start, goal];
  }

  /**
   * Check if direct path is clear of obstacles
   */
  private isPathClear(path: XYPosition[], obstacles: Node[]): boolean {
    if (path.length < 2) return true;

    const start = path[0];
    const end = path[path.length - 1];

    if (!start || !end) return false;

    const steps = Math.max(
      Math.abs(end.x - start.x) / this.gridSize,
      Math.abs(end.y - start.y) / this.gridSize
    );

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t
      };

      if (this.isBlocked(point, obstacles)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(from: XYPosition, to: XYPosition): number {
    return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  }

  /**
   * Calculate total distance of a path
   */
  private calculatePathDistance(path: XYPosition[]): number {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const prevPoint = path[i - 1];
      const currentPoint = path[i];

      if (prevPoint && currentPoint) {
        distance += this.calculateDistance(prevPoint, currentPoint);
      }
    }
    return distance;
  }

  /**
   * Validate if position is valid
   */
  private isValidPosition(position: XYPosition): boolean {
    return (
      position &&
      typeof position.x === "number" &&
      typeof position.y === "number" &&
      !isNaN(position.x) &&
      !isNaN(position.y)
    );
  }

  /**
   * Update pathfinding options
   */
  public updateOptions(options: Partial<PathfindingOptions>): void {
    if (options.gridSize !== undefined) this.gridSize = options.gridSize;
    if (options.obstacleMargin !== undefined) this.obstacleMargin = options.obstacleMargin;
    if (options.routingMode !== undefined) this.routingMode = options.routingMode;
    if (options.allowDiagonal !== undefined) this.allowDiagonal = options.allowDiagonal;
    if (options.weight !== undefined) this.weight = options.weight;
  }

  /**
   * Get current pathfinding options
   */
  public getOptions(): PathfindingOptions {
    return {
      gridSize: this.gridSize,
      obstacleMargin: this.obstacleMargin,
      routingMode: this.routingMode,
      allowDiagonal: this.allowDiagonal,
      weight: this.weight
    };
  }
}

// Export singleton instance
export const pathfindingService = new PathfindingService();