import React, { useState, useCallback, useEffect } from 'react';
import { Drawer, List, Button, Tag, Popconfirm, Empty, message, Typography } from 'antd';
import {
  HistoryOutlined,
  RollbackOutlined,
  DeleteOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useTopologyStore } from '../../stores/topologyStore';
import type { TopologyVersion } from '../../services/topologyPersistence';

const { Text } = Typography;

interface VersionHistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ open, onClose }) => {
  const { getVersions, rollbackToVersion, deleteVersion, clearVersionHistory } = useTopologyStore();
  const [versions, setVersions] = useState<TopologyVersion[]>([]);

  const refresh = useCallback(() => {
    setVersions(getVersions());
  }, [getVersions]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleRollback = useCallback((id: string) => {
    const success = rollbackToVersion(id);
    if (success) {
      message.success('已回滚到选中版本');
      onClose();
    } else {
      message.error('回滚失败');
    }
  }, [rollbackToVersion, onClose]);

  const handleDelete = useCallback((id: string) => {
    deleteVersion(id);
    refresh();
    message.success('版本已删除');
  }, [deleteVersion, refresh]);

  const handleClearAll = useCallback(() => {
    clearVersionHistory();
    refresh();
    message.success('版本历史已清空');
  }, [clearVersionHistory, refresh]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return (
    <Drawer
      title={
        <span><HistoryOutlined /> 版本历史</span>
      }
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      extra={
        versions.length > 0 ? (
          <Popconfirm
            title="确定要清空所有版本历史吗？"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<ClearOutlined />}>
              清空历史
            </Button>
          </Popconfirm>
        ) : null
      }
    >
      {versions.length === 0 ? (
        <Empty description="暂无版本历史" />
      ) : (
        <List
          dataSource={versions}
          renderItem={(v, idx) => (
            <List.Item
              key={v.id}
              actions={[
                <Popconfirm
                  key="rollback"
                  title="确定要回滚到这个版本吗？当前拓扑将被替换。"
                  onConfirm={() => handleRollback(v.id)}
                  okText="确定回滚"
                  cancelText="取消"
                >
                  <Button size="small" type="link" icon={<RollbackOutlined />}>
                    回滚
                  </Button>
                </Popconfirm>,
                <Popconfirm
                  key="delete"
                  title="确定要删除这个版本吗？"
                  onConfirm={() => handleDelete(v.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    {v.label === '自动保存' ? (
                      <Tag color="blue">自动</Tag>
                    ) : (
                      <Tag color="green">手动</Tag>
                    )}
                    {idx === 0 && <Tag color="orange">最新</Tag>}
                    <Text style={{ fontSize: 12 }}>{v.label}</Text>
                  </span>
                }
                description={
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {formatTime(v.timestamp)} · {v.data.nodes?.length ?? 0} 节点 · {v.data.edges?.length ?? 0} 连线
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

export default VersionHistoryPanel;
