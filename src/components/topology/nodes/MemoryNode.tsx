import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import { Tag } from 'antd';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
  getNodeDisplayLabel,
} from '../../../utils/formatters';

const MemoryNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    displayAlias?: string;
    customIconUrl?: string;
    nodeType?: string;
    memoryData: {
      power: number;
      temperature?: number;
      thermalThrottle: boolean;
    };
  };
  const mem = data.memoryData;

  return (
    <div className="hardware-node load-node">
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="memory" customIcon={data.customIcon} customIconUrl={data.customIconUrl} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{getNodeDisplayLabel(data as any)}</span>
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
      </div>
    </div>
  );
};

export default MemoryNode;
