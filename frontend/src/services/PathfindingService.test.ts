import type { Node } from 'reactflow';

import { PathfindingService } from './PathfindingService';

describe('PathfindingService', () => {
  let pathfinder: PathfindingService;

  beforeEach(() => {
    pathfinder = new PathfindingService({
      gridSize: 20,
      obstacleMargin: 40,
      routingMode: 'orthogonal',
      allowDiagonal: false,
      weight: 1.0
    });
  });

  describe('findPath', () => {
    test('should find direct path when no obstacles exist', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 100, y: 100 };
      const obstacles: Node[] = [];

      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(true);
      expect(result.path).toHaveLength(2);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
    });

    test('should find path around obstacles', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 200, y: 0 };
      const obstacles: Node[] = [
        {
          id: 'obstacle1',
          position: { x: 80, y: -20 },
          data: { label: 'Obstacle' },
          width: 40,
          height: 40
        }
      ];

      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(true);
      expect(result.path.length).toBeGreaterThan(2);
      expect(result.distance).toBeGreaterThan(200); // Should be longer than direct path
    });

    test('should handle invalid inputs gracefully', () => {
      const start = { x: NaN, y: 0 };
      const goal = { x: 100, y: 100 };
      const obstacles: Node[] = [];

      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid start or goal position');
    });

    test('should return empty path when no route exists', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 100, y: 0 };

      // Create a wall of obstacles blocking the path
      const obstacles: Node[] = [];
      for (let y = -100; y <= 100; y += 20) {
        obstacles.push({
          id: `wall-${y}`,
          position: { x: 40, y: y - 20 },
          data: { label: 'Wall' },
          width: 20,
          height: 40
        });
      }

      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(false);
      expect(result.path).toHaveLength(0);
    });
  });

  describe('routing modes', () => {
    test('should use orthogonal routing by default', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 100, y: 100 };
      const obstacles: Node[] = [];

      pathfinder.updateOptions({ routingMode: 'orthogonal' });
      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(true);
      // Orthogonal routing should create Manhattan-style paths
      expect(result.distance).toBe(200); // 100 + 100
    });

    test('should use direct routing when specified', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 100, y: 100 };
      const obstacles: Node[] = [];

      pathfinder.updateOptions({ routingMode: 'direct' });
      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(true);
      expect(result.path).toHaveLength(2);
      expect(Math.round(result.distance)).toBe(141); // sqrt(100^2 + 100^2)
    });
  });

  describe('path optimization', () => {
    test('should remove unnecessary waypoints', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 100, y: 0 };
      const obstacles: Node[] = [];

      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(true);
      expect(result.path.length).toBeLessThanOrEqual(3); // Should optimize straight line
    });
  });

  describe('options management', () => {
    test('should update options correctly', () => {
      const newOptions = {
        gridSize: 30,
        obstacleMargin: 50,
        routingMode: 'diagonal' as const,
        allowDiagonal: true,
        weight: 1.5
      };

      pathfinder.updateOptions(newOptions);
      const options = pathfinder.getOptions();

      expect(options.gridSize).toBe(30);
      expect(options.obstacleMargin).toBe(50);
      expect(options.routingMode).toBe('diagonal');
      expect(options.allowDiagonal).toBe(true);
      expect(options.weight).toBe(1.5);
    });
  });

  describe('obstacle detection', () => {
    test('should detect obstacles with margin', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 200, y: 0 };

      // Place obstacle directly in path
      const obstacles: Node[] = [
        {
          id: 'center-obstacle',
          position: { x: 90, y: -10 },
          data: { label: 'Obstacle' },
          width: 20,
          height: 20
        }
      ];

      const result = pathfinder.findPath(start, goal, obstacles);

      expect(result.success).toBe(true);
      // Path should go around the obstacle
      expect(result.distance).toBeGreaterThan(200);
    });
  });

  describe('error handling', () => {
    test('should handle exceptions gracefully', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 100, y: 100 };

      // Create malformed obstacles that might cause errors
      const obstacles: Record<string, unknown>[] = [
        { id: 'bad', position: null, data: {} }
      ];

      const result = pathfinder.findPath(start, goal, obstacles as Node[]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
    });
  });
});