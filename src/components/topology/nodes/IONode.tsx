import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const IONode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    ioData: {
      power: number;
      temperature?: number;
      linkSpeed: string;
    };
  };
  const io = data.ioData;

  return (
    <div className="hardware-node load-node">
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="io" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{data.label ?? 'IO'}</span>
          </div>
          <div className="node-body">
            <div>功率: {formatPower(io.power)}</div>
            {io.temperature !== undefined && (
              <div>
                温度:{' '}
                <span style={{ color: getTemperatureColor(io.temperature) }}>
                  {formatTemperature(io.temperature)}
                </span>
              </div>
            )}
            <div>链路速度: {io.linkSpeed}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IONode;
