import React from 'react';
import { Modal, Table, Divider, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PowerDomainPie from '../charts/PowerDomainPie';
import AMUEventList from '../charts/AMUEventList';
import type { CPUData, CPUPowerDomain as CPUPowerDomainType } from '../../types/power';

const { Title } = Typography;

interface CPUPowerDomainProps {
  open: boolean;
  onClose: () => void;
  nodeId: string | null;
  cpuData: CPUData | null;
}

const columns: ColumnsType<CPUPowerDomainType> = [
  { title: '域名称', dataIndex: 'name', key: 'name' },
  { title: '电压(V)', dataIndex: 'voltage', key: 'voltage', render: (v: number) => v.toFixed(3) },
  { title: '电流(A)', dataIndex: 'current', key: 'current', render: (v: number) => v.toFixed(2) },
  { title: '功耗(W)', dataIndex: 'power', key: 'power', render: (v: number) => v.toFixed(1) },
];

const CPUPowerDomain: React.FC<CPUPowerDomainProps> = ({ open, onClose, nodeId, cpuData }) => {
  return (
    <Modal
      title={`CPU电源域详情 - ${nodeId ?? ''}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {cpuData ? (
        <>
          <PowerDomainPie domains={cpuData.powerDomains} />
          <Divider />
          <Table<CPUPowerDomainType>
            columns={columns}
            dataSource={cpuData.powerDomains}
            rowKey="name"
            pagination={false}
            size="small"
          />
          <Divider />
          <Title level={5}>AMU事件</Title>
          <AMUEventList events={cpuData.amuEvents} />
        </>
      ) : (
        <div>暂无数据</div>
      )}
    </Modal>
  );
};

export default CPUPowerDomain;
