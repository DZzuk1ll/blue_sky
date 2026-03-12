import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CreditCardOutlined } from '@ant-design/icons';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const CardNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    cardData: {
      power: number;
      temperature?: number;
      slotId: string;
    };
  };
  const card = data.cardData;

  return (
    <div className="hardware-node load-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <CreditCardOutlined />
        <span>{data.label ?? 'Card'}</span>
      </div>
      <div className="node-body">
        <div>槽位: {card.slotId}</div>
        <div>功率: {formatPower(card.power)}</div>
        {card.temperature !== undefined && (
          <div>
            温度:{' '}
            <span style={{ color: getTemperatureColor(card.temperature) }}>
              {formatTemperature(card.temperature)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardNode;
