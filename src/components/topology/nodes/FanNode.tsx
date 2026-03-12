import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Slider } from 'antd';
import {
  formatPower,
  formatRPM,
} from '../../../utils/formatters';

const FanIcon = () => (
  <span role="img" aria-label="fan" className="anticon">
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M512 64c-53 0-96 43-96 96 0 106-86 192-192 192-53 0-96 43-96 96s43 96 96 96c106 0 192 86 192 192 0 53 43 96 96 96s96-43 96-96c0-106 86-192 192-192 53 0 96-43 96-96s-43-96-96-96c-106 0-192-86-192-192 0-53-43-96-96-96zm0 400a48 48 0 1 1 0 96 48 48 0 0 1 0-96z" />
    </svg>
  </span>
);

const FanNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    fanData: {
      power: number;
      rpm: number;
      speedPercent: number;
      temperature?: number;
    };
    onSpeedChange?: (speed: number) => void;
  };
  const fan = data.fanData;

  return (
    <div className="hardware-node fan-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <FanIcon />
        <span>{data.label ?? 'Fan'}</span>
      </div>
      <div className="node-body">
        <div>功率: {formatPower(fan.power)}</div>
        <div>转速: {formatRPM(fan.rpm)}</div>
        <div>速度: {fan.speedPercent}%</div>
        <div>
          <span>速度控制:</span>
          <Slider
            min={0}
            max={100}
            value={fan.speedPercent}
            onChange={data.onSpeedChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FanNode;
