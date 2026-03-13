import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import {
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const SensorNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    sensorData: {
      temperature: number;
      location: string;
    };
  };
  const sensor = data.sensorData;

  return (
    <div className="hardware-node sensor-node">
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="sensor" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{data.label ?? 'Sensor'}</span>
          </div>
          <div className="node-body">
            <div>位置: {sensor.location}</div>
            <div>
              温度:{' '}
              <span style={{ color: getTemperatureColor(sensor.temperature) }}>
                {formatTemperature(sensor.temperature)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorNode;
