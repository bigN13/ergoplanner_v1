'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  NodeTypes,
  SelectionMode,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { useHotkeys } from 'react-hotkeys-hook';

import { useDrawingStore } from '@/store/drawingStore';
import SymbolLibrary from './SymbolLibrary';
import Toolbar from './Toolbar';
import PropertyPanel from './PropertyPanel';

// Import custom node components
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
} from './nodes';

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

function DrawingCanvasContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [tool, setTool] = useState<'select' | 'pan'>('select');

  const {
    nodes,
    edges,
    isGridVisible,
    snapToGrid,
    gridSize,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode: setStoreSelectedNode,
    setSelectedEdge: setStoreSelectedEdge,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDrawingStore();

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Keyboard shortcuts
  useHotkeys('ctrl+z, cmd+z', () => canUndo() && undo(), [canUndo]);
  useHotkeys('ctrl+y, cmd+y', () => canRedo() && redo(), [canRedo]);
  useHotkeys('delete, backspace', () => {
    if (selectedNode) {
      useDrawingStore.getState().deleteNode(selectedNode.id);
      setSelectedNode(null);
    } else if (selectedEdge) {
      useDrawingStore.getState().deleteEdge(selectedEdge.id);
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge]);
  useHotkeys('ctrl+a, cmd+a', (e) => {
    e.preventDefault();
    // Select all nodes - ReactFlow doesn't have a built-in select all
  });

  // Initialize with an empty drawing
  useEffect(() => {
    const hasInitialized = localStorage.getItem('ergoplanner-has-initialized');
    if (!hasInitialized) {
      useDrawingStore.getState().newDrawing();
      useDrawingStore.getState().pushHistory();
      localStorage.setItem('ergoplanner-has-initialized', 'true');
    }
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('nodeType');
      const data = JSON.parse(event.dataTransfer.getData('nodeData') || '{}');

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

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('nodeType', nodeType);
    event.dataTransfer.setData('nodeData', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
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
      onConnect(params);
    },
    [onConnect]
  );

  const handleExportPNG = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      toPng(element, {
        backgroundColor: '#ffffff',
        filter: (node) => {
          // Filter out controls and minimap from export
          if (
            node?.classList?.contains('react-flow__controls') ||
            node?.classList?.contains('react-flow__minimap')
          ) {
            return false;
          }
          return true;
        },
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${useDrawingStore.getState().drawingName || 'diagram'}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch(console.error);
    }
  }, []);

  const handleExportSVG = useCallback(() => {
    if (reactFlowInstance) {
      const allNodes = reactFlowInstance.getNodes();
      let nodesBounds = { x: 0, y: 0, width: 800, height: 600 };

      if (allNodes.length > 0) {
        const positions = allNodes.map(n => ({
          x: n.position.x,
          y: n.position.y,
          x2: n.position.x + ((n as any).measured?.width || 100),
          y2: n.position.y + ((n as any).measured?.height || 100)
        }));

        const minX = Math.min(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxX = Math.max(...positions.map(p => p.x2));
        const maxY = Math.max(...positions.map(p => p.y2));

        nodesBounds = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      }

      // Create SVG content
      const svgWidth = nodesBounds.width + 100;
      const svgHeight = nodesBounds.height + 100;

      let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="${nodesBounds.x - 50} ${nodesBounds.y - 50} ${svgWidth} ${svgHeight}">
  <rect width="${svgWidth}" height="${svgHeight}" fill="white"/>
`;

      // Add edges
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          svgContent += `  <line x1="${sourceNode.position.x + 40}" y1="${
            sourceNode.position.y + 20
          }" x2="${targetNode.position.x}" y2="${
            targetNode.position.y + 20
          }" stroke="black" stroke-width="2"/>\n`;
        }
      });

      // Add nodes (simplified representation)
      nodes.forEach((node) => {
        svgContent += `  <g transform="translate(${node.position.x}, ${node.position.y})">
    <rect x="0" y="0" width="80" height="40" fill="white" stroke="black" stroke-width="2" rx="5"/>
    <text x="40" y="25" text-anchor="middle" font-size="12">${node.data.label || node.id}</text>
  </g>\n`;
      });

      svgContent += '</svg>';

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${useDrawingStore.getState().drawingName || 'diagram'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [reactFlowInstance, nodes, edges]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 });
  }, [fitView]);

  const handleToolChange = (newTool: 'select' | 'pan') => {
    setTool(newTool);
  };

  return (
    <div className="flex h-screen w-full">
      <SymbolLibrary onDragStart={onDragStart} />

      <div className="flex flex-1 flex-col">
        <Toolbar
          onExportSVG={handleExportSVG}
          onExportPNG={handleExportPNG}
          onFitView={handleFitView}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          tool={tool}
          onToolChange={handleToolChange}
        />

        <div className="relative flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            snapToGrid={snapToGrid}
            snapGrid={[gridSize, gridSize]}
            connectionMode={'loose' as any}
            fitView
            panOnDrag={tool === 'pan'}
            panOnScroll={true}
            zoomOnScroll={true}
            selectionMode={SelectionMode.Partial}
            deleteKeyCode={['Delete', 'Backspace']}
            multiSelectionKeyCode={['Control', 'Meta']}
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
                  case 'pump':
                    return '#3B82F6';
                  case 'valve':
                  case 'controlValve':
                  case 'checkValve':
                    return '#10B981';
                  case 'tank':
                    return '#F59E0B';
                  case 'pipe':
                    return '#6B7280';
                  case 'flowMeter':
                  case 'pressureGauge':
                    return '#8B5CF6';
                  case 'heatExchanger':
                    return '#EF4444';
                  case 'compressor':
                    return '#06B6D4';
                  default:
                    return '#9CA3AF';
                }
              }}
              style={{
                backgroundColor: '#f3f4f6',
              }}
              className="!bg-gray-50"
            />
            <Controls className="!bg-white !shadow-md" />
          </ReactFlow>
        </div>
      </div>

      {(selectedNode || selectedEdge) && (
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
            setStoreSelectedNode(null);
            setStoreSelectedEdge(null);
          }}
        />
      )}
    </div>
  );
}

export default function DrawingCanvas() {
  return (
    <ReactFlowProvider>
      <DrawingCanvasContent />
    </ReactFlowProvider>
  );
}