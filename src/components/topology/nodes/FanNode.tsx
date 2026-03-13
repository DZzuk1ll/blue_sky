import React, { useCallback } from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import InteractiveZone from './InteractiveZone';
import {
  formatPower,
  formatRPM,
  getNodeDisplayLabel,
} from '../../../utils/formatters';

const FanNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    displayAlias?: string;
    customIconUrl?: string;
    nodeType?: string;
    controlRange?: { min: number; max: number };
    fanData: {
      power: number;
      rpm: number;
      speedPercent: number;
      temperature?: number;
    };
    onSpeedChange?: (speed: number) => void;
  };
  const fan = data.fanData;
  const range = data.controlRange ?? { min: 0, max: 100 };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      data.onSpeedChange?.(Number(e.target.value));
    },
    [data.onSpeedChange],
  );

  return (
    <div className="hardware-node fan-node">
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="fan" customIcon={data.customIcon} customIconUrl={data.customIconUrl} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{getNodeDisplayLabel(data as any)}</span>
          </div>
          <div className="node-body">
            <div>功率: {formatPower(fan.power)}</div>
            <div>转速: {formatRPM(fan.rpm)}</div>
            <div>速度: {fan.speedPercent}%</div>
            <InteractiveZone>
              <span style={{ fontSize: 11, color: '#666' }}>速度控制: {fan.speedPercent}%</span>
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={1}
                value={fan.speedPercent}
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

export default FanNode;
