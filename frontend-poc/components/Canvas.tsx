'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore, Equipment } from '@/lib/store';
import PumpNode from './nodes/PumpNode';
import ValveNode from './nodes/ValveNode';
import TankNode from './nodes/TankNode';
import { Plus } from 'lucide-react';

const nodeTypes: NodeTypes = {
  pump: PumpNode,
  valve: ValveNode,
  tank: TankNode,
};

export default function Canvas() {
  const {
    equipment,
    addEquipment,
    updateEquipment,
    selectEquipment,
  } = useStore();

  // Convert equipment to ReactFlow nodes
  const initialNodes: Node[] = equipment.map(eq => ({
    id: eq.id,
    type: eq.type === 'pipe' ? 'default' : eq.type,
    position: eq.position,
    data: eq,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // edges and onEdgesChange are used by ReactFlow component

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

  // Add new equipment
  const handleAddEquipment = (type: Equipment['type']) => {
    const newEquipment: Equipment = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      properties: {
        name: `${type.toUpperCase()}-${Date.now().toString().slice(-3)}`,
        manufacturer: type === 'pump' ? 'Grundfos' : type === 'valve' ? 'Danfoss' : 'Stainless Steel Co',
        model: type === 'pump' ? 'CR 15-2' : type === 'valve' ? 'VFG2' : 'ST-1000',
        flow: type === 'pump' ? 20 : type === 'tank' ? 1000 : undefined,
        power: type === 'pump' ? 1.5 : undefined,
        status: 'offline',
      },
    };

    addEquipment(newEquipment);
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

  return (
    <div className="w-full h-full relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => handleAddEquipment('pump')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Pump
        </button>
        <button
          onClick={() => handleAddEquipment('valve')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Valve
        </button>
        <button
          onClick={() => handleAddEquipment('tank')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Tank
        </button>
      </div>

      {/* ReactFlow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background
          id="1"
          gap={10}
          color="#f1f1f1"
          variant={BackgroundVariant.Lines}
        />
        <Background
          id="2"
          gap={100}
          offset={1}
          color="#e5e5e5"
          variant={BackgroundVariant.Lines}
        />
      </ReactFlow>
    </div>
  );
}