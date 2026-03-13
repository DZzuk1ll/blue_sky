import React, { useCallback, useMemo, useRef, useState } from 'react';
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
    onNodesChange,
    onEdgesChange,
    setSelectedNodeIds,
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

  // Inject design mode into edge data so PowerEdge knows labels are editable
  const designEdges = useMemo(
    () => edges.map(e => ({
      ...e,
      data: { ...e.data!, _mode: 'design' as const },
    })) as typeof edges,
    [edges],
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

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <ModulePalette />
      <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
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
