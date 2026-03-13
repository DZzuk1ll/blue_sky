import React, { useCallback, useRef } from 'react';
import { Button, Tooltip, message } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  CopyOutlined,
  ScissorOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useReactFlow } from '@xyflow/react';
import { useTopologyStore } from '../../stores/topologyStore';

interface ToolbarProps {
  onCopy: () => void;
  onPaste: () => void;
  onReset: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onCopy, onPaste, onReset }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { exportTopology, importTopology } = useTopologyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const data = exportTopology();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topology-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('拓扑已导出');
  }, [exportTopology]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const success = importTopology(data);
        if (success) {
          message.success('拓扑已导入');
        } else {
          message.error('文件格式不正确，请检查 JSON 格式');
        }
      } catch {
        message.error('文件解析失败，请检查 JSON 格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [importTopology]);

  const buttons = [
    { title: '放大', icon: <ZoomInOutlined />, onClick: () => zoomIn() },
    { title: '缩小', icon: <ZoomOutOutlined />, onClick: () => zoomOut() },
    { title: '适应画布', icon: <ExpandOutlined />, onClick: () => fitView() },
    { title: '复制 (Ctrl+C)', icon: <CopyOutlined />, onClick: onCopy },
    { title: '粘贴 (Ctrl+V)', icon: <ScissorOutlined />, onClick: onPaste },
    { title: '导出拓扑', icon: <DownloadOutlined />, onClick: handleExport },
    { title: '导入拓扑', icon: <UploadOutlined />, onClick: handleImport },
    { title: '重置', icon: <ReloadOutlined />, onClick: onReset },
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Toolbar;
