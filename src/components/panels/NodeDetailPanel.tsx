import React, { useState, useCallback } from 'react';
import { Drawer, Descriptions, Slider, message, Tag, Typography } from 'antd';
import { setFanSpeed } from '../../services/bmcApi';
import {
  formatVoltage,
  formatCurrent,
  formatPower,
  formatEfficiency,
  formatTemperature,
  formatRPM,
  getTemperatureColor,
  getNodeDisplayLabel,
} from '../../utils/formatters';
import type { SourceData, FanData, LoadData, MemoryData, DiskData, IOData, CardData, SensorData } from '../../types/power';

const { Title } = Typography;

interface NodeDetailPanelProps {
  open: boolean;
  onClose: () => void;
  node: any | null;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ open, onClose, node }) => {
  const [fanSpeed, setFanSpeedLocal] = useState<number>(50);

  const handleFanSpeedChange = useCallback(async (value: number) => {
    if (!node) return;
    setFanSpeedLocal(value);
    try {
      await setFanSpeed(node.id, value);
      message.success(`风扇转速已设置为 ${value}%`);
    } catch {
      message.error('设置风扇转速失败');
    }
  }, [node]);

  const renderContent = () => {
    if (!node?.data) return <div>暂无数据</div>;

    const { nodeType } = node.data;
    const d = node.data;

    switch (nodeType) {
      case 'ac':
      case 'psu':
      case 'vr':
      case 'psip': {
        const s = d.sourceData as SourceData;
        if (!s) return <div>暂无数据</div>;
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="输入电压">{formatVoltage(s.inputVoltage)}</Descriptions.Item>
            <Descriptions.Item label="输出电压">{formatVoltage(s.outputVoltage)}</Descriptions.Item>
            <Descriptions.Item label="电流">{formatCurrent(s.current)}</Descriptions.Item>
            <Descriptions.Item label="输入功率">{formatPower(s.inputPower)}</Descriptions.Item>
            <Descriptions.Item label="输出功率">{formatPower(s.outputPower)}</Descriptions.Item>
            <Descriptions.Item label="转换效率">{formatEfficiency(s.efficiency)}</Descriptions.Item>
            {s.temperature != null && (
              <Descriptions.Item label="温度">{formatTemperature(s.temperature)}</Descriptions.Item>
            )}
          </Descriptions>
        );
      }

      case 'fan': {
        const f = d.fanData as FanData;
        if (!f) return <div>暂无数据</div>;
        return (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="功耗">{formatPower(f.power)}</Descriptions.Item>
              {f.temperature != null && (
                <Descriptions.Item label="温度">{formatTemperature(f.temperature)}</Descriptions.Item>
              )}
              <Descriptions.Item label="转速">{formatRPM(f.rpm)}</Descriptions.Item>
              <Descriptions.Item label="速度百分比">{f.speedPercent}%</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <Title level={5}>风扇转速控制</Title>
              <Slider
                min={0}
                max={100}
                value={fanSpeed}
                onChange={setFanSpeedLocal}
                onChangeComplete={handleFanSpeedChange}
                marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
              />
            </div>
          </>
        );
      }

      case 'cpu': {
        const c = d.cpuData as LoadData;
        if (!c) return <div>暂无数据</div>;
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="功耗">{formatPower(c.power)}</Descriptions.Item>
            {c.temperature != null && (
              <Descriptions.Item label="温度">{formatTemperature(c.temperature)}</Descriptions.Item>
            )}
          </Descriptions>
        );
      }

      case 'memory': {
        const m = d.memoryData as MemoryData;
        if (!m) return <div>暂无数据</div>;
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="功耗">{formatPower(m.power)}</Descriptions.Item>
            {m.temperature != null && (
              <Descriptions.Item label="温度">{formatTemperature(m.temperature)}</Descriptions.Item>
            )}
            <Descriptions.Item label="热节流">
              <Tag color={m.thermalThrottle ? 'red' : 'green'}>
                {m.thermalThrottle ? '已触发' : '正常'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        );
      }

      case 'disk': {
        const dk = d.diskData as DiskData;
        if (!dk) return <div>暂无数据</div>;
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="功耗">{formatPower(dk.power)}</Descriptions.Item>
            {dk.temperature != null && (
              <Descriptions.Item label="温度">{formatTemperature(dk.temperature)}</Descriptions.Item>
            )}
            <Descriptions.Item label="状态">
              <Tag color={dk.status === 'normal' ? 'green' : dk.status === 'warning' ? 'orange' : 'red'}>
                {dk.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        );
      }

      case 'io': {
        const io = d.ioData as IOData;
        if (!io) return <div>暂无数据</div>;
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="功耗">{formatPower(io.power)}</Descriptions.Item>
            {io.temperature != null && (
              <Descriptions.Item label="温度">{formatTemperature(io.temperature)}</Descriptions.Item>
            )}
            <Descriptions.Item label="链路速率">{io.linkSpeed}</Descriptions.Item>
          </Descriptions>
        );
      }

      case 'card': {
        const cd = d.cardData as CardData;
        if (!cd) return <div>暂无数据</div>;
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="功耗">{formatPower(cd.power)}</Descriptions.Item>
            {cd.temperature != null && (
              <Descriptions.Item label="温度">{formatTemperature(cd.temperature)}</Descriptions.Item>
            )}
            <Descriptions.Item label="插槽">{cd.slotId}</Descriptions.Item>
          </Descriptions>
        );
      }

      case 'sensor': {
        const sn = d.sensorData as SensorData;
        if (!sn) return <div>暂无数据</div>;
        const color = getTemperatureColor(sn.temperature);
        return (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, fontWeight: 'bold', color }}>{sn.temperature.toFixed(1)}°C</div>
            <div style={{ marginTop: 8, color: '#888' }}>{sn.location}</div>
          </div>
        );
      }

      default:
        return (
          <Descriptions column={1} bordered size="small">
            {Object.entries(d).map(([k, v]) => (
              <Descriptions.Item key={k} label={k}>{String(v)}</Descriptions.Item>
            ))}
          </Descriptions>
        );
    }
  };

  return (
    <Drawer
      title={node?.data ? getNodeDisplayLabel(node.data) || '节点详情' : '节点详情'}
      placement="right"
      width={360}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {renderContent()}
    </Drawer>
  );
};

export default NodeDetailPanel;
