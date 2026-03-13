import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  type OnSelectionChangeParams,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import PowerEdge from './edges/PowerEdge';
import Toolbar from './Toolbar';
import NodeDetailPanel from '../panels/NodeDetailPanel';
import CPUPowerDomain from '../panels/CPUPowerDomain';
import TopologyOverviewPanel from '../panels/TopologyOverviewPanel';
import { useTopologyStore } from '../../stores/topologyStore';
import type { TopologyNode } from '../../types/topology';
import type { CPUData } from '../../types/power';

const edgeTypes = { powerEdge: PowerEdge };

const TopologyCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    selectedNodeIds,
    onNodesChange,
    onEdgesChange,
    setSelectedNodeIds,
    copySelectedNodes,
    pasteNodes,
    deleteSelectedNodes,
    resetToDefault,
  } = useTopologyStore();

  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [cpuModalOpen, setCpuModalOpen] = useState(false);
  const [cpuModalNodeId, setCpuModalNodeId] = useState<string | null>(null);
  const [cpuModalData, setCpuModalData] = useState<CPUData | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);

  // Track drag state to prevent detail panel opening during drag
  const isDragging = useRef(false);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  // === 连线高亮：选中节点时高亮相关边和连接的节点 ===
  const highlightedEdgeIds = useMemo(() => {
    if (selectedNodeIds.length === 0) return new Set<string>();
    return new Set(
      edges
        .filter(
          (e) =>
            selectedNodeIds.includes(e.source) ||
            selectedNodeIds.includes(e.target),
        )
        .map((e) => e.id),
    );
  }, [edges, selectedNodeIds]);

  const highlightedNodeIds = useMemo(() => {
    if (selectedNodeIds.length === 0) return new Set<string>();
    const ids = new Set<string>();
    edges.forEach((e) => {
      if (selectedNodeIds.includes(e.source)) ids.add(e.target);
      if (selectedNodeIds.includes(e.target)) ids.add(e.source);
    });
    selectedNodeIds.forEach((id) => ids.add(id));
    return ids;
  }, [edges, selectedNodeIds]);

  // 注入高亮标记到节点 data
  const processedNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          _highlighted: highlightedNodeIds.has(n.id),
        },
      })),
    [nodes, highlightedNodeIds],
  );

  // 注入高亮标记到边 data
  const processedEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        data: {
          ...e.data!,
          _highlighted: highlightedEdgeIds.has(e.id),
        },
      })),
    [edges, highlightedEdgeIds],
  );

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const ids = params.nodes.map((n) => n.id);
      setSelectedNodeIds(ids);
    },
    [setSelectedNodeIds],
  );

  // Only open detail panel on deliberate click (not drag)
  const handleNodeClick: NodeMouseHandler<TopologyNode> = useCallback(
    (_event, node) => {
      // Don't open panel if this was a drag
      if (isDragging.current) {
        isDragging.current = false;
        return;
      }
      setSelectedNode(node);
    },
    [],
  );

  const handleNodeDragStart = useCallback(() => {
    isDragging.current = false;
    mouseDownPos.current = null;
  }, []);

  const handleNodeDrag = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Listen for CPU detail custom event
  useEffect(() => {
    const handler = (e: Event) => {
      const { nodeId, data } = (e as CustomEvent).detail;
      setCpuModalNodeId(nodeId);
      setCpuModalData(data);
      setCpuModalOpen(true);
    };
    window.addEventListener('open-cpu-detail', handler);
    return () => window.removeEventListener('open-cpu-detail', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedNodes();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copySelectedNodes();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [copySelectedNodes, pasteNodes, deleteSelectedNodes]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#fff' }}>
      <ReactFlow
        nodes={processedNodes}
        edges={processedEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={handleSelectionChange}
        onNodeClick={handleNodeClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onPaneClick={handlePaneClick}
        nodesDraggable={false}
        fitView
      >
        <Controls />
        <MiniMap />
        <Toolbar
          onCopy={copySelectedNodes}
          onPaste={pasteNodes}
          onDelete={deleteSelectedNodes}
          onReset={resetToDefault}
        />
      </ReactFlow>

      <NodeDetailPanel
        open={selectedNode !== null}
        onClose={() => setSelectedNode(null)}
        node={selectedNode}
      />

      <CPUPowerDomain
        open={cpuModalOpen}
        onClose={() => setCpuModalOpen(false)}
        nodeId={cpuModalNodeId}
        cpuData={cpuModalData}
      />

      <TopologyOverviewPanel
        open={overviewOpen}
        onToggle={() => setOverviewOpen((v) => !v)}
      />
    </div>
  );
};

export default TopologyCanvas;
