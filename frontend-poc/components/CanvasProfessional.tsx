'use client';

import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Controls,
  NodeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore, Equipment } from '@/lib/store';
import { useDrawing } from '@/lib/drawing-context';
import PumpNode from './nodes/PumpNode';
import ValveNode from './nodes/ValveNode';
import TankNode from './nodes/TankNode';
import ShapeNode from './nodes/ShapeNode';

const nodeTypes: NodeTypes = {
  pump: PumpNode,
  valve: ValveNode,
  tank: TankNode,
  shape: ShapeNode,
};

interface CanvasProfessionalProps {
  showGrid: boolean;
  zoom: number;
}

function CanvasContent({ showGrid, zoom }: CanvasProfessionalProps) {
  const {
    equipment,
    updateEquipment,
    selectEquipment,
    addEquipment,
  } = useStore();
  const { selectedTool } = useDrawing();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  // Convert equipment to ReactFlow nodes
  const initialNodes: Node[] = equipment.map(eq => ({
    id: eq.id,
    type: eq.type === 'pipe' ? 'default' : eq.type,
    position: eq.position,
    data: eq,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  // Sync node changes back to store
  const handleNodesChange = (changes: NodeChange[]) => {
    onNodesChange(changes);

    // Update positions in store
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        const eq = equipment.find(e => e.id === change.id);
        if (eq) {
          updateEquipment(change.id, { position: change.position });
        }
      }
    });
  };

  // Handle node selection
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const eq = equipment.find(e => e.id === node.id);
    if (eq) {
      selectEquipment(eq);
    }
  };

  // Update nodes when equipment changes
  React.useEffect(() => {
    setNodes(equipment.map(eq => ({
      id: eq.id,
      type: eq.type === 'pipe' ? 'default' : eq.type,
      position: eq.position,
      data: eq,
    })));
  }, [equipment, setNodes]);

  // Handle drag over (required for drop to work)
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Get the data in text/plain format
      const dragDataString = event.dataTransfer.getData('text/plain');

      if (!dragDataString) {
        return;
      }

      let dragData: {
        type: string;
        name?: string;
        shape?: string;
        pidSymbol?: string;
      };
      try {
        dragData = JSON.parse(dragDataString);
      } catch (error) {
        console.error('Failed to parse drag data:', error);
        return;
      }

      // Get the bounding rectangle of the ReactFlow container
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) {
        return;
      }

      // Calculate the position relative to the ReactFlow container
      // The project function converts screen coordinates to flow coordinates
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const timestamp = Date.now();

      // Check if it's a shape or equipment
      if (dragData.type === 'shape') {
        // Create a shape node
        const newNode: Node = {
          id: `shape-${timestamp}`,
          type: 'shape',
          position,
          data: {
            shape: dragData.shape as 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note',
            label: dragData.shape === 'text' ? 'Text' : dragData.shape === 'note' ? 'Note' : '',
            width: 100,
            height: 60,
          },
        };
        setNodes((nds) => [...nds, newNode]);
      } else {
        // Create equipment node
        const componentType = dragData.type as Equipment['type'];
        const componentName = dragData.name;

        if (!componentType) {
          return;
        }

        const newEquipment: Equipment = {
          id: `${componentType}-${timestamp}`,
          type: componentType,
          position,
          properties: {
            name: `${componentType.toUpperCase()}-${timestamp.toString().slice(-3)}`,
            manufacturer: componentType === 'pump' ? 'Grundfos' : componentType === 'valve' ? 'Danfoss' : 'Storage Co',
            model: componentName || componentType,
            flow: componentType === 'pump' ? 20 : componentType === 'tank' ? 1000 : undefined,
            power: componentType === 'pump' ? 1.5 : undefined,
            status: 'offline',
          },
        };
        addEquipment(newEquipment);
      }
    },
    [project, addEquipment, setNodes]
  );

  // Handle pane click for shape drawing
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Only create shapes if a drawing tool is selected
      if (selectedTool === 'select' || selectedTool === 'freehand') {
        return;
      }

      // Get the click position
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) {
        return;
      }

      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      // Create a new shape node
      const timestamp = Date.now();
      const newNode: Node = {
        id: `shape-${timestamp}`,
        type: 'shape',
        position,
        data: {
          shape: selectedTool as 'rectangle' | 'circle' | 'diamond' | 'triangle' | 'line' | 'text' | 'note',
          label: selectedTool === 'text' ? 'Text' : '',
          width: 100,
          height: 60,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [selectedTool, project, setNodes, reactFlowWrapper]
  );

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gray-100">
      {/* A4 Paper Container */}
      <div className="relative bg-white shadow-2xl" style={{
        width: '794px', // A4 width at 96 DPI
        height: '1123px', // A4 height at 96 DPI
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out',
      }}>
        {/* Paper Border */}
        <div className="absolute inset-0 border-2 border-gray-300 pointer-events-none"></div>

        {/* Grid Lines (if enabled) */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                </pattern>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="url(#smallGrid)" />
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* ReactFlow Canvas */}
        <div className="absolute inset-0" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView={false}
            attributionPosition="bottom-left"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.5}
            maxZoom={2}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            snapToGrid={showGrid}
            snapGrid={[10, 10]}
            connectionLineStyle={{ stroke: '#2563eb', strokeWidth: 2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#2563eb', strokeWidth: 2 },
            }}
          >
            {/* Custom Controls */}
            <Panel position="bottom-right" className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg m-4">
              <Controls showInteractive={false} />
            </Panel>

            {/* MiniMap */}
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'pump') return '#3b82f6';
                if (node.type === 'valve') return '#ef4444';
                if (node.type === 'tank') return '#10b981';
                return '#6b7280';
              }}
              className="bg-white/90 backdrop-blur rounded-lg shadow-lg m-4"
              pannable
              zoomable
            />
          </ReactFlow>
        </div>

        {/* Page Header */}
        <div className="absolute top-0 left-0 right-0 h-12 border-b border-gray-200 flex items-center px-4 bg-white/95">
          <span className="text-sm text-gray-600">P&ID Diagram - Sheet 1</span>
        </div>

        {/* Page Margins */}
        <div className="absolute top-12 left-0 w-8 bottom-12 border-r border-gray-200 opacity-50"></div>
        <div className="absolute top-12 right-0 w-8 bottom-12 border-l border-gray-200 opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-12 border-t border-gray-200 opacity-50"></div>
      </div>
    </div>
  );
}

export default function CanvasProfessional(props: CanvasProfessionalProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
}