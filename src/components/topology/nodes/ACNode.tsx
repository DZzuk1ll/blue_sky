import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ThunderboltOutlined } from '@ant-design/icons';
import {
  formatVoltage,
  formatCurrent,
  formatPower,
  formatEfficiency,
  getEfficiencyColor,
} from '../../../utils/formatters';

const ACNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    sourceData: {
      inputVoltage: number;
      outputVoltage: number;
      current: number;
      inputPower: number;
      outputPower: number;
      efficiency: number;
      temperature?: number;
    };
  };
  const s = data.sourceData;

  return (
    <div className="hardware-node source-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <ThunderboltOutlined />
        <span>{data.label ?? 'AC'}</span>
      </div>
      <div className="node-body">
        <div>输入电压: {formatVoltage(s.inputVoltage)}</div>
        <div>输出电压: {formatVoltage(s.outputVoltage)}</div>
        <div>电流: {formatCurrent(s.current)}</div>
        <div>输入功率: {formatPower(s.inputPower)}</div>
        <div>输出功率: {formatPower(s.outputPower)}</div>
        <div>
          效率:{' '}
          <span style={{ color: getEfficiencyColor(s.efficiency) }}>
            {formatEfficiency(s.efficiency)}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default ACNode;
