import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection
} from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid'

export interface DeviceNodeData extends Record<string, unknown> {
  hostname: string
  ip: string
  platform: 'cisco-ios' | 'cisco-nxos' | 'arista-eos' | 'juniper-junos' | 'generic'
  status: 'online' | 'offline' | 'unknown'
  site?: string
}

export type DeviceNode = Node<DeviceNodeData>

interface TopologyState {
  nodes: DeviceNode[]
  edges: Edge[]
  
  onNodesChange: (changes: NodeChange<DeviceNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  
  addNode: (data: Omit<DeviceNodeData, 'status'>, position?: {x: number, y: number}) => void
  addDiscoveredLink: (sourceHostname: string, targetHostname: string, sourcePort: string, targetPort: string) => void
  updateNodeStatus: (id: string, status: DeviceNodeData['status']) => void
  removeNode: (id: string) => void
  clearTopology: () => void
}

export const useTopologyStore = create<TopologyState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes)
        })
      },
      
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges)
        })
      },
      
      onConnect: (connection) => {
        set({
          edges: addEdge({ ...connection, animated: true, type: 'smoothstep' }, get().edges)
        })
      },

      addNode: (data, position) => {
        const pos = position || { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 }
        
        const existingNode = get().nodes.find(n => n.data.hostname === data.hostname)
        if (existingNode) {
          return
        }

        const newNode: DeviceNode = {
          id: uuidv4(),
          type: 'device',
          position: pos,
          data: {
            ...data,
            status: 'unknown'
          } as DeviceNodeData
        }
        
        set({ nodes: [...get().nodes, newNode] })
      },

      addDiscoveredLink: (sourceHostname, targetHostname, sourcePort, targetPort) => {
        const nodes = get().nodes
        const sourceNode = nodes.find(n => n.data.hostname === sourceHostname)
        const targetNode = nodes.find(n => n.data.hostname === targetHostname)
        
        if (!sourceNode || !targetNode) return
        
        const edgeId = `e-${sourceNode.id}-${targetNode.id}`
        if (get().edges.some(e => e.id === edgeId || (e.source === targetNode.id && e.target === sourceNode.id))) {
          return 
        }

        const newEdge: Edge = {
          id: edgeId,
          source: sourceNode.id,
          target: targetNode.id,
          label: `${sourcePort} ⟷ ${targetPort}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--accent-blue)', strokeWidth: 1.5 },
          labelBgStyle: { fill: 'var(--bg-surface)', fillOpacity: 0.8 },
          labelStyle: { fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 500 }
        }

        set({ edges: [...get().edges, newEdge] })
      },

      updateNodeStatus: (id, status) => {
        set({
          nodes: get().nodes.map(n => 
            n.id === id ? { ...n, data: { ...n.data, status } } : n
          )
        })
      },

      removeNode: (id) => {
        set({
          nodes: get().nodes.filter(n => n.id !== id),
          edges: get().edges.filter(e => e.source !== id && e.target !== id)
        })
      },
      
      clearTopology: () => {
        set({ nodes: [], edges: [] })
      }
    }),
    {
      name: 'helix-topology-storage',
      storage: createJSONStorage(() => localStorage), 
    }
  )
)
