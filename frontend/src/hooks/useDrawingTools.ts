import { useCallback, useRef, useState } from "react";
import type { Connection, Node, Edge, ReactFlowInstance, XYPosition } from "reactflow";
import { MarkerType } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

interface DrawingPoint {
  x: number;
  y: number;
}

interface UseDrawingToolsResult {
  handleCanvasClick: (event: React.MouseEvent, position: XYPosition) => void;
  handleCanvasMouseMove: (event: React.MouseEvent, position: XYPosition) => void;
  handleCanvasMouseDown: (event: React.MouseEvent, position: XYPosition) => void;
  handleCanvasMouseUp: (event: React.MouseEvent) => void;
  handleNodeClick: (event: React.MouseEvent, node: Node) => void;
  handleConnect: (connection: Connection) => void;
  isDrawing: boolean;
  currentPath: DrawingPoint[];
  previewNode: Node | null;
  previewEdge: Edge | null;
}

export function useDrawingTools(reactFlowInstance: ReactFlowInstance | null): UseDrawingToolsResult {
  const {
    activeTool,
    connectorMode,
    addNode,
    addEdge,
    setSelectedNode,
    setSelectedEdge: _setSelectedEdge,
  } = useDrawingStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);
  const [startPosition, setStartPosition] = useState<XYPosition | null>(null);
  const [previewNode, setPreviewNode] = useState<Node | null>(null);
  const [previewEdge, _setPreviewEdge] = useState<Edge | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);

  const drawingRef = useRef<{
    startPos: XYPosition | null;
    currentPos: XYPosition | null;
  }>({
    startPos: null,
    currentPos: null,
  });

  // Handle shape creation
  const createShape = useCallback(
    (type: string, position: XYPosition, size?: { width: number; height: number }) => {
      if (!reactFlowInstance) return;

      const nodeId = `${type}-${Date.now()}`;
      const defaultSize = size || { width: 100, height: 100 };

      const newNode: Node = {
        id: nodeId,
        type: type === "ellipse" ? "circle" : type === "rhombus" ? "diamond" : type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeId.slice(-4)}`,
        },
        style: {
          width: defaultSize.width,
          height: defaultSize.height,
          borderRadius: type === "rounded-rectangle" ? "8px" : undefined,
        },
      };

      addNode(newNode);
      return nodeId;
    },
    [addNode, reactFlowInstance]
  );

  // Handle connector creation
  const createConnector = useCallback(
    (source: string, target: string, sourceHandle?: string, targetHandle?: string) => {
      const edgeType = connectorMode === "straight" ? "straight" :
                       connectorMode === "curved" ? "default" : "smoothstep";

      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        type: edgeType,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
        },
      };

      addEdge(newEdge);
    },
    [addEdge, connectorMode]
  );

  // Handle freehand drawing
  const handleFreehandDrawing = useCallback(
    (position: XYPosition, isStart: boolean) => {
      if (isStart) {
        setCurrentPath([{ x: position.x, y: position.y }]);
        setIsDrawing(true);
      } else if (isDrawing) {
        setCurrentPath((prev) => [...prev, { x: position.x, y: position.y }]);
      }
    },
    [isDrawing]
  );

  // Smooth path using quadratic Bezier curves
  const smoothPath = useCallback((points: DrawingPoint[]): string => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const cpx = (points[i].x + points[i + 1].x) / 2;
      const cpy = (points[i].y + points[i + 1].y) / 2;
      path += ` Q ${points[i].x} ${points[i].y}, ${cpx} ${cpy}`;
    }

    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      path += ` L ${lastPoint.x} ${lastPoint.y}`;
    }

    return path;
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent, position: XYPosition) => {
      event.preventDefault();

      if (activeTool === "text") {
        // Create text node
        const textNode: Node = {
          id: `text-${Date.now()}`,
          type: "text",
          position,
          data: {
            label: "Text",
            isEditing: true,
          },
        };
        addNode(textNode);
      }
    },
    [activeTool, addNode]
  );

  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback(
    (_event: React.MouseEvent, position: XYPosition) => {
      if (!isDrawing) return;

      if (activeTool === "freehand") {
        handleFreehandDrawing(position, false);
      } else if (["rectangle", "rounded-rectangle", "ellipse", "rhombus"].includes(activeTool)) {
        // Update preview shape
        if (startPosition) {
          const width = Math.abs(position.x - startPosition.x);
          const height = Math.abs(position.y - startPosition.y);
          const x = Math.min(position.x, startPosition.x);
          const y = Math.min(position.y, startPosition.y);

          setPreviewNode({
            id: "preview",
            type: "default",
            position: { x, y },
            data: { label: "" },
            style: {
              width,
              height,
              borderRadius: activeTool === "rounded-rectangle" ? "8px" : undefined,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "2px dashed #3b82f6",
            },
          });
        }
      }

      drawingRef.current.currentPos = position;
    },
    [isDrawing, activeTool, startPosition, handleFreehandDrawing]
  );

  // Handle canvas mouse down
  const handleCanvasMouseDown = useCallback(
    (_event: React.MouseEvent, position: XYPosition) => {
      if (["rectangle", "rounded-rectangle", "ellipse", "rhombus"].includes(activeTool)) {
        setIsDrawing(true);
        setStartPosition(position);
        drawingRef.current.startPos = position;
      } else if (activeTool === "freehand") {
        handleFreehandDrawing(position, true);
      }
    },
    [activeTool, handleFreehandDrawing]
  );

  // Handle canvas mouse up
  const handleCanvasMouseUp = useCallback(
    (_event: React.MouseEvent) => {
      if (!isDrawing) return;

      if (["rectangle", "rounded-rectangle", "ellipse", "rhombus"].includes(activeTool)) {
        // Create the shape
        if (startPosition && drawingRef.current.currentPos) {
          const width = Math.abs(drawingRef.current.currentPos.x - startPosition.x);
          const height = Math.abs(drawingRef.current.currentPos.y - startPosition.y);
          const x = Math.min(drawingRef.current.currentPos.x, startPosition.x);
          const y = Math.min(drawingRef.current.currentPos.y, startPosition.y);

          if (width > 10 && height > 10) {
            // Minimum size threshold
            createShape(activeTool, { x, y }, { width, height });
          }
        }
        setPreviewNode(null);
      } else if (activeTool === "freehand" && currentPath.length > 1) {
        // Create freehand path as custom node
        const pathData = smoothPath(currentPath);
        const bounds = currentPath.reduce(
          (acc, point) => ({
            minX: Math.min(acc.minX, point.x),
            maxX: Math.max(acc.maxX, point.x),
            minY: Math.min(acc.minY, point.y),
            maxY: Math.max(acc.maxY, point.y),
          }),
          {
            minX: currentPath[0].x,
            maxX: currentPath[0].x,
            minY: currentPath[0].y,
            maxY: currentPath[0].y,
          }
        );

        const freehandNode: Node = {
          id: `freehand-${Date.now()}`,
          type: "freehand",
          position: { x: bounds.minX, y: bounds.minY },
          data: {
            pathData,
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY,
          },
        };

        addNode(freehandNode);
        setCurrentPath([]);
      }

      setIsDrawing(false);
      setStartPosition(null);
      drawingRef.current.startPos = null;
      drawingRef.current.currentPos = null;
    },
    [isDrawing, activeTool, startPosition, currentPath, createShape, smoothPath, addNode]
  );

  // Handle node click for connections
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();

      if (activeTool === "drawEdge") {
        if (!connectingNodeId) {
          // Start connection
          setConnectingNodeId(node.id);
        } else if (connectingNodeId !== node.id) {
          // Complete connection
          createConnector(connectingNodeId, node.id);
          setConnectingNodeId(null);
        }
      } else if (activeTool === "select") {
        setSelectedNode(node.id);
      }
    },
    [activeTool, connectingNodeId, createConnector, setSelectedNode]
  );

  // Handle connection from ReactFlow
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        createConnector(
          connection.source,
          connection.target,
          connection.sourceHandle || undefined,
          connection.targetHandle || undefined
        );
      }
    },
    [createConnector]
  );

  return {
    handleCanvasClick,
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    handleNodeClick,
    handleConnect,
    isDrawing,
    currentPath,
    previewNode,
    previewEdge,
  };
}