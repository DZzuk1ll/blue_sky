/** 拓扑图状态管理 */
import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type { TopologyNode, TopologyEdge, HardwareNodeType, ApiConfig, TopologyExportData } from '../types/topology';
import { getDefaultNodes, getDefaultEdges, createDefaultNodeData } from '../services/mockData';

interface ClipboardItem {
  node: TopologyNode;
}

interface TopologyState {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedNodeIds: string[];
  clipboard: ClipboardItem[];
  nodeScales: Record<string, number>;

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

  // 节点缩放
  setNodeScale: (nodeId: string, scale: number) => void;

  // 设计模式操作
  addNode: (type: HardwareNodeType, position: { x: number; y: number }) => void;
  addEdge: (connection: Connection) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateEdgeLabel: (edgeId: string, label: string | undefined) => void;
  updateNodeIcon: (nodeId: string, iconName: string) => void;

  // 别名 & 自定义图标 & API配置
  updateNodeAlias: (nodeId: string, alias: string) => void;
  updateNodeCustomIconUrl: (nodeId: string, url: string | undefined) => void;
  updateNodeApiConfig: (nodeId: string, config: ApiConfig) => void;

  // 控制类操作
  updateFanSpeed: (nodeId: string, speed: number) => void;
  updateSourceVoltage: (nodeId: string, voltage: number) => void;
  updateNodeControlRange: (nodeId: string, range: { min: number; max: number } | undefined) => void;

  // 导入导出
  exportTopology: () => TopologyExportData;
  importTopology: (data: TopologyExportData) => boolean;

  // 重置
  resetToDefault: () => void;
}

let nodeCounter = 0;

export const useTopologyStore = create<TopologyState>((set, get) => ({
  nodes: getDefaultNodes(),
  edges: getDefaultEdges(),
  selectedNodeIds: [],
  clipboard: [],
  nodeScales: {},

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

  setNodeScale: (nodeId, scale) => {
    set({ nodeScales: { ...get().nodeScales, [nodeId]: scale } });
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

  addNode: (type, position) => {
    const { nodes } = get();
    nodeCounter++;
    const id = `${type}-new-${Date.now()}-${nodeCounter}`;
    const data = createDefaultNodeData(type);
    const newNode: TopologyNode = {
      id,
      type,
      position,
      data,
    };
    set({ nodes: [...nodes, newNode] });
  },

  addEdge: (connection) => {
    const { edges } = get();
    const id = `e-${connection.source}-${connection.target}-${Date.now()}`;
    const newEdge: TopologyEdge = {
      id,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: 'powerEdge',
      data: { loss: 0, lossPercent: 0, animated: true },
    };
    set({ edges: [...edges, newEdge] });
  },

  removeNode: (id) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter(n => n.id !== id),
      edges: edges.filter(e => e.source !== id && e.target !== id),
    });
  },

  removeEdge: (id) => {
    const { edges } = get();
    set({ edges: edges.filter(e => e.id !== id) });
  },

  updateEdgeLabel: (edgeId, label) => {
    const { edges } = get();
    set({
      edges: edges.map(e =>
        e.id === edgeId ? { ...e, data: { ...e.data!, label } } : e
      ),
    });
  },

  updateNodeIcon: (nodeId, iconName) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, customIcon: iconName } }
          : n
      ),
    });
  },

  updateNodeAlias: (nodeId, alias) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, displayAlias: alias || undefined } }
          : n
      ),
    });
  },

  updateNodeCustomIconUrl: (nodeId, url) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, customIconUrl: url } }
          : n
      ),
    });
  },

  updateNodeApiConfig: (nodeId, config) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, apiConfig: config } }
          : n
      ),
    });
  },

  updateFanSpeed: (nodeId, speed) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n =>
        n.id === nodeId && n.data.fanData
          ? { ...n, data: { ...n.data, fanData: { ...n.data.fanData, speedPercent: speed } } }
          : n
      ),
    });
  },

  updateSourceVoltage: (nodeId, voltage) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n =>
        n.id === nodeId && n.data.sourceData
          ? { ...n, data: { ...n.data, sourceData: { ...n.data.sourceData, outputVoltage: voltage } } }
          : n
      ),
    });
  },

  updateNodeControlRange: (nodeId, range) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, controlRange: range } }
          : n
      ),
    });
  },

  exportTopology: () => {
    const { nodes, edges, nodeScales } = get();
    return {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      nodes,
      edges,
      nodeScales,
    };
  },

  importTopology: (data) => {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return false;
    }
    set({
      nodes: data.nodes,
      edges: data.edges,
      nodeScales: data.nodeScales || {},
      selectedNodeIds: [],
      clipboard: [],
    });
    return true;
  },

  resetToDefault: () => {
    set({
      nodes: getDefaultNodes(),
      edges: getDefaultEdges(),
      selectedNodeIds: [],
      clipboard: [],
      nodeScales: {},
    });
  },
}));
