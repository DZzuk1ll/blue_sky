import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import { Slider } from 'antd';
import {
  formatVoltage,
  formatCurrent,
  formatPower,
  formatEfficiency,
  formatTemperature,
  getEfficiencyColor,
  getTemperatureColor,
  getNodeDisplayLabel,
} from '../../../utils/formatters';

const VRNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    displayAlias?: string;
    customIconUrl?: string;
    nodeType?: string;
    sourceData: {
      inputVoltage: number;
      outputVoltage: number;
      current: number;
      inputPower: number;
      outputPower: number;
      efficiency: number;
      temperature?: number;
    };
    onVoltageChange?: (voltage: number) => void;
  };
  const s = data.sourceData;

  return (
    <div className="hardware-node source-node">
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="vr" customIcon={data.customIcon} customIconUrl={data.customIconUrl} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{getNodeDisplayLabel(data as any)}</span>
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
            <div>
              <span>电压调节:</span>
              <Slider
                min={0.5}
                max={1.5}
                step={0.01}
                value={s.outputVoltage}
                onChange={data.onVoltageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRNode;
