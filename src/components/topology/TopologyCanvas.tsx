import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import PowerEdge from './edges/PowerEdge';
import Toolbar from './Toolbar';
import NodeDetailPanel from '../panels/NodeDetailPanel';
import CPUPowerDomain from '../panels/CPUPowerDomain';
import { useTopologyStore } from '../../stores/topologyStore';
import type { TopologyNode } from '../../types/topology';
import type { CPUData } from '../../types/power';

const edgeTypes = { powerEdge: PowerEdge };

const TopologyCanvas: React.FC = () => {
  const {
    nodes,
    edges,
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

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const ids = params.nodes.map((n) => n.id);
      setSelectedNodeIds(ids);
      if (ids.length === 1) {
        const node = nodes.find((n) => n.id === ids[0]) ?? null;
        setSelectedNode(node);
      } else {
        setSelectedNode(null);
      }
    },
    [nodes, setSelectedNodeIds],
  );

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
      } else if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copySelectedNodes();
      } else if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [copySelectedNodes, pasteNodes, deleteSelectedNodes]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={handleSelectionChange}
        fitView
      >
        <Background />
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
    </div>
  );
};

export default TopologyCanvas;
