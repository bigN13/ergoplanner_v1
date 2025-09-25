"use client";

// import { toPng } from "html-to-image"; // Currently unused
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { Node, Edge, Connection, NodeTypes, ReactFlowInstance } from "reactflow";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  // useReactFlow,
  BackgroundVariant,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";

import { useSmartRouting } from "@/hooks/useSmartRouting";
import { useDrawingStore } from "@/store/drawingStore";

import AnnotationTools from "./AnnotationTools";
import ContextMenu from "./ContextMenu";
import ExportImportPanel from "./ExportImportPanel";
import MeasurementTools from "./MeasurementTools";
import {
  PumpNode,
  ValveNode,
  TankNode,
  PipeNode,
  FlowMeterNode,
  PressureGaugeNode,
  ControlValveNode,
  CheckValveNode,
  HeatExchangerNode,
  CompressorNode,
} from "./nodes";
import QuickActionsPanel from "./QuickActionsPanel";
import SmartRoutingPanel from "./SmartRoutingPanel";

// Import custom node components

// Define custom node types
const nodeTypes: NodeTypes = {
  pump: PumpNode,
  valve: ValveNode,
  tank: TankNode,
  pipe: PipeNode,
  flowMeter: FlowMeterNode,
  pressureGauge: PressureGaugeNode,
  controlValve: ControlValveNode,
  checkValve: CheckValveNode,
  heatExchanger: HeatExchangerNode,
  compressor: CompressorNode,
};

function DrawingCanvasContent(): React.ReactElement {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [tool] = useState<"select" | "pan">("select");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMeasurementTools, setShowMeasurementTools] = useState(false);
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);
  const [showExportPanel] = useState(false);
  const [showSmartRouting, setShowSmartRouting] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Smart routing hook
  const { createSmartConnection } = useSmartRouting({
    routingMode: "orthogonal",
    gridSize: 20,
    obstacleMargin: 40,
    allowDiagonal: false,
    weight: 1.0,
    autoRoute: true
  });

  const {
    // nodes,
    // edges,
    isGridVisible,
    snapToGrid,
    gridSize,
    onNodesChange,
    onEdgesChange,
    // onConnect,
    addNode,
    setSelectedNode: setStoreSelectedNode,
    setSelectedEdge: setStoreSelectedEdge,
    undo,
    redo,
    canUndo,
    canRedo,
    getVisibleNodes,
    getVisibleEdges,
    // layers, // Layers are accessed through getVisibleNodes/getVisibleEdges
  } = useDrawingStore();

  // const { fitView } = useReactFlow(); // Currently unused

  // Keyboard shortcuts
  useHotkeys("ctrl+z, cmd+z", () => canUndo() && undo(), [canUndo]);
  useHotkeys("ctrl+y, cmd+y", () => canRedo() && redo(), [canRedo]);
  useHotkeys(
    "delete, backspace",
    () => {
      if (selectedNode) {
        useDrawingStore.getState().deleteNode(selectedNode.id);
        setSelectedNode(null);
      } else if (selectedEdge) {
        useDrawingStore.getState().deleteEdge(selectedEdge.id);
        setSelectedEdge(null);
      }
    },
    [selectedNode, selectedEdge]
  );
  useHotkeys("ctrl+a, cmd+a", (e) => {
    e.preventDefault();
    // Select all nodes - ReactFlow doesn't have a built-in select all
  });

  // Smart routing panel toggle
  useHotkeys("ctrl+r, cmd+r", (e) => {
    e.preventDefault();
    setShowSmartRouting(!showSmartRouting);
  }, [showSmartRouting]);

  // Initialize with an empty drawing
  useEffect(() => {
    const hasInitialized = localStorage.getItem("ergoplanner-has-initialized");
    if (!hasInitialized) {
      useDrawingStore.getState().newDrawing();
      useDrawingStore.getState().markDirty();
      localStorage.setItem("ergoplanner-has-initialized", "true");
    }
  }, []);

  const onDragOver = useCallback((event: React.DragEvent): void => {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent): void => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("nodeType");
      const data = JSON.parse(event.dataTransfer.getData("nodeData") || "{}");

      if (type && reactFlowBounds && reactFlowInstance) {
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Snap to grid if enabled
        if (snapToGrid) {
          position.x = Math.round(position.x / gridSize) * gridSize;
          position.y = Math.round(position.y / gridSize) * gridSize;
        }

        const newNode: Node = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data,
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, snapToGrid, gridSize, addNode]
  );

  // const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: unknown): void => {
  //   event.dataTransfer.setData("nodeType", nodeType);
  //   event.dataTransfer.setData("nodeData", JSON.stringify(nodeData));
  //   // eslint-disable-next-line no-param-reassign
  //   event.dataTransfer.effectAllowed = "move";
  // };

  // Monitor online status - currently commented out
  // useEffect(() => {
  //   const handleOnline = (): void => setIsOnline(true);
  //   const handleOffline = (): void => setIsOnline(false);

  //   window.addEventListener("online", handleOnline);
  //   window.addEventListener("offline", handleOffline);

  //   return () => {
  //     window.removeEventListener("online", handleOnline);
  //     window.removeEventListener("offline", handleOffline);
  //   };
  // }, []);

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }): void => {
      setSelectedNodes(nodes);

      if (nodes.length === 1 && nodes[0]) {
        setSelectedNode(nodes[0]);
        setSelectedEdge(null);
        setStoreSelectedNode(nodes[0].id);
      } else if (edges.length === 1 && edges[0]) {
        setSelectedEdge(edges[0]);
        setSelectedNode(null);
        setStoreSelectedEdge(edges[0].id);
      } else {
        setSelectedNode(null);
        setSelectedEdge(null);
        setStoreSelectedNode(null);
        setStoreSelectedEdge(null);
      }
    },
    [setStoreSelectedNode, setStoreSelectedEdge]
  );

  const handleConnect = useCallback(
    (params: Connection) => {
      // Use smart routing for automatic pipe routing
      createSmartConnection(params);
    },
    [createSmartConnection]
  );

  // const handleExportPNG = useCallback((): void => {
  //   const element = document.querySelector(".react-flow") as HTMLElement;
  //   if (element) {
  //     toPng(element, {
  //       backgroundColor: "#ffffff",
  //       filter: (node) => {
  //         // Filter out controls and minimap from export
  //         if (
  //           node?.classList?.contains("react-flow__controls") ||
  //           node?.classList?.contains("react-flow__minimap")
  //         ) {
  //           return false;
  //         }
  //         return true;
  //       },
  //     })
  //       .then((dataUrl) => {
  //         const link = document.createElement("a");
  //         link.download = `${useDrawingStore.getState().drawingName || "diagram"}.png`;
  //         link.href = dataUrl;
  //         link.click();
  //       })
  //       .catch(console.error);
  //   }
  // }, []);

  // const handleExportSVG = useCallback((): void => {
  //   if (reactFlowInstance) {
  //     const allNodes = reactFlowInstance.getNodes();
  //     let nodesBounds = { x: 0, y: 0, width: 800, height: 600 };

  //     if (allNodes.length > 0) {
  //       const positions = allNodes.map((n) => ({
  //         x: n.position.x,
  //         y: n.position.y,
  //         x2: n.position.x + ((n as { measured?: { width?: number } }).measured?.width || 100),
  //         y2: n.position.y + ((n as { measured?: { height?: number } }).measured?.height || 100),
  //       }));

  //       const minX = Math.min(...positions.map((p) => p.x));
  //       const minY = Math.min(...positions.map((p) => p.y));
  //       const maxX = Math.max(...positions.map((p) => p.x2));
  //       const maxY = Math.max(...positions.map((p) => p.y2));

  //       nodesBounds = {
  //         x: minX,
  //         y: minY,
  //         width: maxX - minX,
  //         height: maxY - minY,
  //       };
  //     }

  //     // Create SVG content
  //     const svgWidth = nodesBounds.width + 100;
  //     const svgHeight = nodesBounds.height + 100;

  //     let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
  // <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="${nodesBounds.x - 50} ${nodesBounds.y - 50} ${svgWidth} ${svgHeight}">
  //   <rect width="${svgWidth}" height="${svgHeight}" fill="white"/>
  // `;

  //     // Add edges
  //     edges.forEach((edge) => {
  //       const sourceNode = nodes.find((n) => n.id === edge.source);
  //       const targetNode = nodes.find((n) => n.id === edge.target);
  //       if (sourceNode && targetNode) {
  //         svgContent += `  <line x1="${sourceNode.position.x + 40}" y1="${
  //           sourceNode.position.y + 20
  //         }" x2="${targetNode.position.x}" y2="${
  //           targetNode.position.y + 20
  //         }" stroke="black" stroke-width="2"/>\n`;
  //       }
  //     });

  //     // Add nodes (simplified representation)
  //     nodes.forEach((node) => {
  //       svgContent += `  <g transform="translate(${node.position.x}, ${node.position.y})">
  //   <rect x="0" y="0" width="80" height="40" fill="white" stroke="black" stroke-width="2" rx="5"/>
  //   <text x="40" y="25" text-anchor="middle" font-size="12">${node.data.label || node.id}</text>
  // </g>\n`;
  //     });

  //     svgContent += "</svg>";

  //     const blob = new Blob([svgContent], { type: "image/svg+xml" });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.download = `${useDrawingStore.getState().drawingName || "diagram"}.svg`;
  //     link.href = url;
  //     link.click();
  //     URL.revokeObjectURL(url);
  //   }
  // }, [reactFlowInstance, nodes, edges]);

  // const handleFitView = useCallback((): void => {
  //   fitView({ padding: 0.2, duration: 800 });
  // }, [fitView]);

  // const handleToolChange = (newTool: "select" | "pan"): void => {
  //   setTool(newTool);
  // };

  // Context menu handlers
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true,
    });
  }, []);

  const handleContextMenuAction = useCallback((action: string, _data?: unknown): void => {
    // Context menu action logic
    // Implement context menu actions here
    switch (action) {
      case "copy":
        // Handle copy
        break;
      case "delete":
        // Handle delete
        break;
      case "properties":
        // Handle properties
        break;
      // Add more actions as needed
    }
  }, []);

  // Mouse position tracking
  const handleMouseMove = useCallback(
    (_event: React.MouseEvent) => {
      if (reactFlowInstance) {
        const rect = reactFlowWrapper.current?.getBoundingClientRect();
        if (rect) {
          // const flowPosition = reactFlowInstance.project({
          //   x: event.clientX - rect.left,
          //   y: event.clientY - rect.top,
          // });
          // setMousePosition(flowPosition);
        }
      }
    },
    [reactFlowInstance]
  );

  // Click handler to close context menu
  const handleCanvasClick = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div className="flex h-full w-full">
      <div className="relative flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={getVisibleNodes()}
            edges={getVisibleEdges()}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            onContextMenu={handleContextMenu}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            nodeTypes={nodeTypes}
            snapToGrid={snapToGrid}
            snapGrid={[gridSize, gridSize]}
            // connectionMode="loose"
            fitView
            panOnDrag={tool === "pan"}
            panOnScroll={true}
            zoomOnScroll={true}
            selectionMode={SelectionMode.Partial}
            deleteKeyCode={["Delete", "Backspace"]}
            multiSelectionKeyCode={["Control", "Meta"]}
          >
            {isGridVisible && (
              <Background
                variant={BackgroundVariant.Dots}
                gap={gridSize}
                size={1}
                color="#e5e7eb"
              />
            )}
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case "pump":
                    return "#3B82F6";
                  case "valve":
                  case "controlValve":
                  case "checkValve":
                    return "#10B981";
                  case "tank":
                    return "#F59E0B";
                  case "pipe":
                    return "#6B7280";
                  case "flowMeter":
                  case "pressureGauge":
                    return "#8B5CF6";
                  case "heatExchanger":
                    return "#EF4444";
                  case "compressor":
                    return "#06B6D4";
                  default:
                    return "#9CA3AF";
                }
              }}
              style={{
                backgroundColor: "#f3f4f6",
              }}
              className="!bg-gray-50"
            />
            <Controls className="!bg-white !shadow-md" />
          </ReactFlow>

          {/* Context Menu */}
          {contextMenu.visible && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              selectedNodes={selectedNodes}
              onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
              onAction={handleContextMenuAction}
            />
          )}

          {/* Measurement Tools */}
          {showMeasurementTools && (
            <div className="absolute top-4 right-4 w-80">
              <MeasurementTools
                visible={showMeasurementTools}
                onToggle={() => setShowMeasurementTools(false)}
              />
            </div>
          )}

          {/* Annotation Tools */}
          {showAnnotationTools && (
            <div className="absolute top-4 right-4 w-80">
              <AnnotationTools
                visible={showAnnotationTools}
                onToggle={() => setShowAnnotationTools(false)}
              />
            </div>
          )}

          {/* Smart Routing Panel */}
          {showSmartRouting && (
            <div className="absolute top-4 left-4 w-80">
              <SmartRoutingPanel
                visible={showSmartRouting}
                onToggle={() => setShowSmartRouting(false)}
              />
            </div>
          )}

          {/* Quick Actions Panel */}
          {showQuickActions && (
            <QuickActionsPanel
              isVisible={showQuickActions}
              onClose={() => setShowQuickActions(false)}
              defaultPosition={{ x: window.innerWidth - 350, y: 100 }}
              canDrag={true}
            />
          )}

          {/* Export/Import Panel */}
          {showExportPanel && (
            <div className="absolute top-4 left-4 w-80">
              <ExportImportPanel />
            </div>
          )}

          {/* Auto-save Manager - Hidden for now */}
          {/* <AutoSaveManager enabled={true} interval={30000} maxAutoSaves={10} /> */}
      </div>
    </div>
  );
}

export default function DrawingCanvas(): React.ReactElement {
  return (
    <ReactFlowProvider>
      <DrawingCanvasContent />
    </ReactFlowProvider>
  );
}
