/** 拓扑图状态管理 */
import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type { TopologyNode, TopologyEdge } from '../types/topology';
import { getDefaultNodes, getDefaultEdges } from '../services/mockData';

interface ClipboardItem {
  node: TopologyNode;
}

interface TopologyState {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedNodeIds: string[];
  clipboard: ClipboardItem[];

  // 节点/边变更
  onNodesChange: (changes: NodeChange<TopologyNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<TopologyEdge>[]) => void;

  // 批量更新数据
  updateNodes: (nodes: TopologyNode[]) => void;
  updateEdges: (edges: TopologyEdge[]) => void;

  // 选中
  setSelectedNodeIds: (ids: string[]) => void;

  // 剪贴板
  copySelectedNodes: () => void;
  pasteNodes: () => void;
  deleteSelectedNodes: () => void;

  // 重置
  resetToDefault: () => void;
}

export const useTopologyStore = create<TopologyState>((set, get) => ({
  nodes: getDefaultNodes(),
  edges: getDefaultEdges(),
  selectedNodeIds: [],
  clipboard: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  updateNodes: (nodes) => set({ nodes }),
  updateEdges: (edges) => set({ edges }),

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),

  copySelectedNodes: () => {
    const { nodes, selectedNodeIds } = get();
    const selected = nodes.filter(n => selectedNodeIds.includes(n.id));
    set({ clipboard: selected.map(node => ({ node: { ...node } })) });
  },

  pasteNodes: () => {
    const { clipboard, nodes } = get();
    if (clipboard.length === 0) return;
    const newNodes = clipboard.map(item => {
      const id = `${item.node.id}-copy-${Date.now()}`;
      return {
        ...item.node,
        id,
        position: {
          x: item.node.position.x + 50,
          y: item.node.position.y + 50,
        },
        selected: false,
      };
    });
    set({ nodes: [...nodes, ...newNodes] });
  },

  deleteSelectedNodes: () => {
    const { nodes, edges, selectedNodeIds } = get();
    set({
      nodes: nodes.filter(n => !selectedNodeIds.includes(n.id)),
      edges: edges.filter(e =>
        !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)
      ),
      selectedNodeIds: [],
    });
  },

  resetToDefault: () => {
    set({
      nodes: getDefaultNodes(),
      edges: getDefaultEdges(),
      selectedNodeIds: [],
      clipboard: [],
    });
  },
}));
