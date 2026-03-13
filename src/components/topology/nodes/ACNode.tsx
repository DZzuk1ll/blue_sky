import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
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
    customIcon?: string;
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
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="ac" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
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
        </div>
      </div>
    </div>
  );
};

export default ACNode;
