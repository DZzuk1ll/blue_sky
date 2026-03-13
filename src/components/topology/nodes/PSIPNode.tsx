import React, { useCallback } from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import InteractiveZone from './InteractiveZone';
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

const PSIPNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    displayAlias?: string;
    customIconUrl?: string;
    nodeType?: string;
    controlRange?: { min: number; max: number };
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
  const range = data.controlRange ?? { min: 0.5, max: 1.5 };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      data.onVoltageChange?.(Number(e.target.value));
    },
    [data.onVoltageChange],
  );

  return (
    <div className="hardware-node source-node">
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="psip" customIcon={data.customIcon} customIconUrl={data.customIconUrl} />
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
            <InteractiveZone>
              <span style={{ fontSize: 11, color: '#666' }}>电压调节: {s.outputVoltage.toFixed(2)}V</span>
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={0.01}
                value={s.outputVoltage}
                onChange={handleChange}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </InteractiveZone>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PSIPNode;
