import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import NodeIcon from './NodeIcon';
import { Button } from 'antd';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const CPUNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    cpuData: {
      power: number;
      temperature?: number;
      powerDomains: { name: string; voltage: number; current: number; power: number }[];
      amuEvents: { type: string; timestamp: number; message: string }[];
    };
  };
  const cpu = data.cpuData;

  const handleOpenDetail = () => {
    window.dispatchEvent(
      new CustomEvent('open-cpu-detail', {
        detail: { nodeId: props.id, data: data.cpuData },
      })
    );
  };

  return (
    <div className="hardware-node cpu-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="cpu" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{data.label ?? 'CPU'}</span>
          </div>
          <div className="node-body">
            <div>功率: {formatPower(cpu.power)}</div>
            {cpu.temperature !== undefined && (
              <div>
                温度:{' '}
                <span style={{ color: getTemperatureColor(cpu.temperature) }}>
                  {formatTemperature(cpu.temperature)}
                </span>
              </div>
            )}
            <Button size="small" type="primary" onClick={handleOpenDetail}>
              电源域详情
            </Button>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CPUNode;
