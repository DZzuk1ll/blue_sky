import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { FireOutlined } from '@ant-design/icons';
import {
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const SensorNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    sensorData: {
      temperature: number;
      location: string;
    };
  };
  const sensor = data.sensorData;

  return (
    <div className="hardware-node sensor-node">
      <div className="node-header">
        <FireOutlined />
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
  );
};

export default SensorNode;
