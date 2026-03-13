import React from 'react';
import { type NodeProps } from '@xyflow/react';
import MultiSideHandles from './MultiSideHandles';
import NodeIcon from './NodeIcon';
import { Badge } from 'antd';
import {
  formatPower,
  formatTemperature,
  getTemperatureColor,
  getNodeDisplayLabel,
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
    displayAlias?: string;
    customIconUrl?: string;
    nodeType?: string;
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
      <MultiSideHandles />
      <div className="node-content">
        <div className="node-icon-area">
          <NodeIcon nodeType="disk" customIcon={data.customIcon} customIconUrl={data.customIconUrl} />
        </div>
        <div className="node-info">
          <div className="node-header">
            <span>{getNodeDisplayLabel(data as any)}</span>
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
