import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import { Slider } from 'antd';
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
            <div className="nodrag nopan">
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
      </div>
    </div>
  );
};

export default FanNode;
