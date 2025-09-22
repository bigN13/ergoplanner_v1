import { create } from 'zustand';
import { Node, Edge, Connection, addEdge } from 'reactflow';

export interface Equipment {
  id: string;
  type: 'pump' | 'valve' | 'tank' | 'pipe';
  position: { x: number; y: number };
  properties: {
    name: string;
    manufacturer?: string;
    model?: string;
    flow?: number;
    power?: number;
    status?: 'online' | 'offline' | 'maintenance';
  };
}

interface AppState {
  // ReactFlow state
  nodes: Node[];
  edges: Edge[];

  // Equipment data
  equipment: Equipment[];

  // Selected equipment
  selectedEquipment: Equipment | null;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;

  // Equipment actions
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  selectEquipment: (equipment: Equipment | null) => void;

  // Sync equipment with nodes
  syncEquipmentToNodes: () => void;
  syncNodeToEquipment: (nodeId: string, position: { x: number; y: number }) => void;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  equipment: [],
  selectedEquipment: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onConnect: (connection) => {
    const { edges } = get();
    set({ edges: addEdge(connection, edges) });
  },

  addEquipment: (equipment) => {
    set((state) => ({
      equipment: [...state.equipment, equipment],
    }));
    get().syncEquipmentToNodes();
  },

  updateEquipment: (id, updates) => {
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === id ? { ...eq, ...updates } : eq
      ),
    }));
    get().syncEquipmentToNodes();
  },

  deleteEquipment: (id) => {
    set((state) => ({
      equipment: state.equipment.filter((eq) => eq.id !== id),
      nodes: state.nodes.filter((node) => node.id !== id),
      selectedEquipment: state.selectedEquipment?.id === id ? null : state.selectedEquipment,
    }));
  },

  selectEquipment: (equipment) => {
    set({ selectedEquipment: equipment });
  },

  syncEquipmentToNodes: () => {
    const { equipment } = get();
    const nodes = equipment.map((eq) => ({
      id: eq.id,
      type: eq.type,
      position: eq.position,
      data: {
        label: eq.properties.name,
        equipment: eq,
      },
    }));
    set({ nodes });
  },

  syncNodeToEquipment: (nodeId, position) => {
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === nodeId ? { ...eq, position } : eq
      ),
    }));
  },
}));