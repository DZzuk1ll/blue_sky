import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';

const ChassisNode: React.FC<NodeProps> = (props) => {
  const data = props.data as { label?: string; customIcon?: string };

  return (
    <div className="hardware-node">
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="chassis" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{data.label ?? '机框'}</span>
          </div>
        </div>
      </div>
      <MultiSideHandles />
    </div>
  );
};

export default ChassisNode;
