import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import NodeIcon from './NodeIcon';
import { Tag } from 'antd';
import {
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const MgmtBoardNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    mgmtData?: {
      status: 'online' | 'offline';
      temperature: number;
    };
  };
  const mgmt = data.mgmtData ?? { status: 'online' as const, temperature: 0 };

  return (
    <div className="hardware-node mgmt-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="mgmtBoard" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{data.label ?? '管理板'}</span>
          </div>
          <div className="node-body">
            <div>
              状态:{' '}
              <Tag color={mgmt.status === 'online' ? 'green' : 'red'}>
                {mgmt.status === 'online' ? '在线' : '离线'}
              </Tag>
            </div>
            <div>
              温度:{' '}
              <span style={{ color: getTemperatureColor(mgmt.temperature) }}>
                {formatTemperature(mgmt.temperature)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default MgmtBoardNode;
