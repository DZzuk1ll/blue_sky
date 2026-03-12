import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import NodeIcon from './NodeIcon';
import { Badge } from 'antd';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
} from '../../../utils/formatters';

const statusMap: Record<string, { status: 'success' | 'warning' | 'error'; text: string }> = {
  normal: { status: 'success', text: '正常' },
  warning: { status: 'warning', text: '警告' },
  error: { status: 'error', text: '错误' },
};

const DiskNode: React.FC<NodeProps> = (props) => {
  const data = props.data as {
    label?: string;
    customIcon?: string;
    diskData: {
      power: number;
      temperature?: number;
      status: 'normal' | 'warning' | 'error';
    };
  };
  const disk = data.diskData;
  const st = statusMap[disk.status] ?? statusMap.normal;

  return (
    <div className="hardware-node load-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="disk" customIcon={data.customIcon} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{data.label ?? 'Disk'}</span>
          </div>
          <div className="node-body">
            <div>功率: {formatPower(disk.power)}</div>
            {disk.temperature !== undefined && (
              <div>
                温度:{' '}
                <span style={{ color: getTemperatureColor(disk.temperature) }}>
                  {formatTemperature(disk.temperature)}
                </span>
              </div>
            )}
            <div>
              状态: <Badge status={st.status} text={st.text} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiskNode;
