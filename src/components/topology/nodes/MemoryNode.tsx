import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { DatabaseOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const MemoryNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    memoryData: {
      power: number;
      temperature?: number;
      thermalThrottle: boolean;
    };
  };
  const mem = data.memoryData;

  return (
    <div className="hardware-node load-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <DatabaseOutlined />
        <span>{data.label ?? 'Memory'}</span>
      </div>
      <div className="node-body">
        <div>功率: {formatPower(mem.power)}</div>
        {mem.temperature !== undefined && (
          <div>
            温度:{' '}
            <span style={{ color: getTemperatureColor(mem.temperature) }}>
              {formatTemperature(mem.temperature)}
            </span>
          </div>
        )}
        <div>
          热节流:{' '}
          <Tag color={mem.thermalThrottle ? 'red' : 'green'}>
            {mem.thermalThrottle ? '已触发' : '正常'}
          </Tag>
        </div>
      </div>
    </div>
  );
};

export default MemoryNode;
