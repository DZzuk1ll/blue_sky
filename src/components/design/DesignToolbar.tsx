import React, { useCallback, useRef, useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  DeleteOutlined,
  ClearOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SaveOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useReactFlow } from '@xyflow/react';
import { useTopologyStore } from '../../stores/topologyStore';
import VersionHistoryPanel from './VersionHistoryPanel';

interface DesignToolbarProps {
  onDelete: () => void;
  onClear: () => void;
  onReset: () => void;
}

const DesignToolbar: React.FC<DesignToolbarProps> = ({ onDelete, onClear, onReset }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { exportTopology, importTopology, saveManual } = useTopologyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);

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

  const handleSave = useCallback(() => {
    saveManual('手动保存');
    message.success('拓扑已保存');
  }, [saveManual]);

  const buttons = [
    { title: '保存 (手动)', icon: <SaveOutlined />, onClick: handleSave },
    { title: '版本历史', icon: <HistoryOutlined />, onClick: () => setVersionPanelOpen(true) },
    'divider' as const,
    { title: '放大', icon: <ZoomInOutlined />, onClick: () => zoomIn() },
    { title: '缩小', icon: <ZoomOutOutlined />, onClick: () => zoomOut() },
    { title: '适应画布', icon: <ExpandOutlined />, onClick: () => fitView() },
    'divider' as const,
    { title: '删除选中 (Del)', icon: <DeleteOutlined />, onClick: onDelete },
    { title: '清空画布', icon: <ClearOutlined />, onClick: onClear },
    'divider' as const,
    { title: '导出拓扑', icon: <DownloadOutlined />, onClick: handleExport },
    { title: '导入拓扑', icon: <UploadOutlined />, onClick: handleImport },
    { title: '重置默认', icon: <ReloadOutlined />, onClick: onReset },
  ];

  return (
    <>
      <div
        className="topology-toolbar"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          background: '#fff',
          borderRadius: 6,
          padding: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
        {buttons.map((item, i) => {
          if (item === 'divider') {
            return (
              <div
                key={`divider-${i}`}
                style={{
                  width: 1,
                  height: 20,
                  background: '#e8e8e8',
                  margin: '0 2px',
                }}
              />
            );
          }
          const { title, icon, onClick } = item;
          return (
            <Tooltip key={title} title={title}>
              <Button type="text" size="small" icon={icon} onClick={onClick} />
            </Tooltip>
          );
        })}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <VersionHistoryPanel
        open={versionPanelOpen}
        onClose={() => setVersionPanelOpen(false)}
      />
    </>
  );
};

export default DesignToolbar;
