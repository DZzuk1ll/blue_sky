import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const CardNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    cardData: {
      power: number;
      temperature?: number;
      slotId: string;
    };
  };
  const card = data.cardData;

  return (
    <div className="hardware-node load-node">
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="card" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
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
      </div>
    </div>
  );
};

export default CardNode;
