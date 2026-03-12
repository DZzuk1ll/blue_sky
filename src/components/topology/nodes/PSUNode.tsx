import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import NodeIcon from './NodeIcon';
import {
  formatVoltage,
  formatCurrent,
  formatPower,
  formatEfficiency,
  formatTemperature,
  getEfficiencyColor,
  getTemperatureColor,
} from '../../../utils/formatters';

const PSUNode: React.FC<NodeProps> = (props) => {
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
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="psu" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{data.label ?? 'PSU'}</span>
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
            {s.temperature !== undefined && (
              <div>
                温度:{' '}
                <span style={{ color: getTemperatureColor(s.temperature) }}>
                  {formatTemperature(s.temperature)}
                </span>
              </div>
            )}
            <div className="efficiency-bar">
              <div
                style={{
                  width: `${s.efficiency}%`,
                  height: '100%',
                  backgroundColor: getEfficiencyColor(s.efficiency),
                  borderRadius: 2,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default PSUNode;
