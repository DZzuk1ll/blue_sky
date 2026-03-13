import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  type OnSelectionChangeParams,
  type Connection,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../topology/nodes';
import PowerEdge from '../topology/edges/PowerEdge';
import DesignToolbar from './DesignToolbar';
import ModulePalette from './ModulePalette';
import IconPicker from './IconPicker';
import { useTopologyStore } from '../../stores/topologyStore';
import type { HardwareNodeType, TopologyNode } from '../../types/topology';

const edgeTypes = { powerEdge: PowerEdge };

const DesignCanvasInner: React.FC = () => {
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
    addNode,
    addEdge,
    updateNodeIcon,
    resetToDefault,
    updateNodes,
    updateEdges,
  } = useTopologyStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // === 连线高亮 ===
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

  // 注入 design mode + 高亮标记到 edge data
  const designEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        data: {
          ...e.data!,
          _mode: 'design' as const,
          _highlighted: highlightedEdgeIds.has(e.id),
        },
      })) as typeof edges,
    [edges, highlightedEdgeIds],
  );

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

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    customIcon?: string;
  } | null>(null);

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const ids = params.nodes.map((n) => n.id);
      setSelectedNodeIds(ids);
    },
    [setSelectedNodeIds],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      addEdge(connection);
    },
    [addEdge],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type') as HardwareNodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
  );

  const handlePaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: TopologyNode) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
        customIcon: (node.data as Record<string, unknown>).customIcon as string | undefined,
      });
    },
    [],
  );

  const handleClear = useCallback(() => {
    updateNodes([]);
    updateEdges([]);
  }, [updateNodes, updateEdges]);

  const handleIconChange = useCallback(
    (iconName: string) => {
      if (contextMenu) {
        updateNodeIcon(contextMenu.nodeId, iconName);
        setContextMenu(null);
      }
    },
    [contextMenu, updateNodeIcon],
  );

  // Keyboard shortcuts: Ctrl+C, Ctrl+V, Delete
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
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <ModulePalette />
      <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={processedNodes}
          edges={designEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onSelectionChange={handleSelectionChange}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPaneClick={handlePaneClick}
          onNodeContextMenu={handleNodeContextMenu}
          fitView
          connectionLineStyle={{ stroke: '#1677ff', strokeWidth: 2 }}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{ type: 'powerEdge' }}
        >
          <Background />
          <Controls />
          <MiniMap />
          <DesignToolbar
            onDelete={deleteSelectedNodes}
            onClear={handleClear}
            onReset={resetToDefault}
          />
        </ReactFlow>

        {/* 右键菜单 - 图标选择 */}
        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 1000,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              padding: 8,
            }}
          >
            <IconPicker
              value={contextMenu.customIcon}
              onChange={handleIconChange}
            >
              <div
                style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                  borderRadius: 4,
                  fontSize: 13,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                更换图标
              </div>
            </IconPicker>
          </div>
        )}
      </div>
    </div>
  );
};

const DesignCanvas: React.FC = () => (
  <ReactFlowProvider>
    <DesignCanvasInner />
  </ReactFlowProvider>
);

export default DesignCanvas;
