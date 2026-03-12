import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AppstoreOutlined } from '@ant-design/icons';

const ChassisNode: React.FC<NodeProps> = (props) => {
  const data = props.data as { label?: string };

  return (
    <div className="hardware-node">
      <div className="node-header">
        <AppstoreOutlined />
        <span>{data.label ?? '机框'}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default ChassisNode;
