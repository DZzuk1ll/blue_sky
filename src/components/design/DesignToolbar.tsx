import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  DeleteOutlined,
  ClearOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useReactFlow } from '@xyflow/react';

interface DesignToolbarProps {
  onDelete: () => void;
  onClear: () => void;
  onReset: () => void;
}

const DesignToolbar: React.FC<DesignToolbarProps> = ({ onDelete, onClear, onReset }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const buttons = [
    { title: '放大', icon: <ZoomInOutlined />, onClick: () => zoomIn() },
    { title: '缩小', icon: <ZoomOutOutlined />, onClick: () => zoomOut() },
    { title: '适应画布', icon: <ExpandOutlined />, onClick: () => fitView() },
    { title: '删除选中', icon: <DeleteOutlined />, onClick: onDelete },
    { title: '清空画布', icon: <ClearOutlined />, onClick: onClear },
    { title: '重置默认', icon: <ReloadOutlined />, onClick: onReset },
  ];

  return (
    <div
      className="topology-toolbar"
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        display: 'flex',
        gap: 4,
        background: '#fff',
        borderRadius: 6,
        padding: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      {buttons.map(({ title, icon, onClick }) => (
        <Tooltip key={title} title={title}>
          <Button type="text" size="small" icon={icon} onClick={onClick} />
        </Tooltip>
      ))}
    </div>
  );
};

export default DesignToolbar;
