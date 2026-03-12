import React from 'react';
import { Layout, Menu, Typography, Switch, Space, Tag } from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMonitorStore } from '../../stores/monitorStore';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '拓扑监控' },
  { key: '/efficiency', icon: <ThunderboltOutlined />, label: '效率分析' },
  { key: '/test', icon: <ExperimentOutlined />, label: '用例测试' },
  { key: '/optimize', icon: <AimOutlined />, label: '自动寻优' },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPolling, startPolling, stopPolling, lastUpdate } = useMonitorStore();

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={180} theme="dark">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            蓝天系统
          </Typography.Title>
          <Typography.Text style={{ color: '#8c8c8c', fontSize: 11 }}>
            电源域监控
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          height: 48,
        }}>
          <Space>
            <Typography.Text strong>实时监控</Typography.Text>
            <Switch
              checked={isPolling}
              onChange={v => v ? startPolling() : stopPolling()}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              size="small"
            />
            {isPolling && <Tag color="green">运行中</Tag>}
          </Space>
          {lastUpdate && (
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              最后更新: {new Date(lastUpdate).toLocaleTimeString()}
            </Typography.Text>
          )}
        </Header>
        <Content style={{ position: 'relative', overflow: 'hidden' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
