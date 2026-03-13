import React, { useState, useCallback, useEffect } from 'react';
import { Drawer, Descriptions, Slider, message, Tag, Typography } from 'antd';
import { setFanSpeed, setVoltage } from '../../services/bmcApi';
import { useTopologyStore } from '../../stores/topologyStore';
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
  const updateFanSpeed = useTopologyStore((s) => s.updateFanSpeed);
  const updateSourceVoltage = useTopologyStore((s) => s.updateSourceVoltage);

  const [fanSpeed, setFanSpeedLocal] = useState<number>(50);
  const [voltageValue, setVoltageValue] = useState<number>(1.0);

  // 当节点变化时，同步初始值
  useEffect(() => {
    if (!node?.data) return;
    const { nodeType } = node.data;
    if (nodeType === 'fan' && node.data.fanData) {
      setFanSpeedLocal(node.data.fanData.speedPercent ?? 50);
    }
    if ((nodeType === 'vr' || nodeType === 'psip') && node.data.sourceData) {
      setVoltageValue(node.data.sourceData.outputVoltage ?? 1.0);
    }
  }, [node]);

  const handleFanSpeedComplete = useCallback(async (value: number) => {
    if (!node) return;
    setFanSpeedLocal(value);
    // 更新 store 使拓扑节点显示同步
    updateFanSpeed(node.id, value);
    try {
      await setFanSpeed(node.id, value);
      message.success(`风扇转速已设置为 ${value}%`);
    } catch {
      message.error('设置风扇转速失败');
    }
  }, [node, updateFanSpeed]);

  const handleVoltageComplete = useCallback(async (value: number) => {
    if (!node) return;
    setVoltageValue(value);
    // 更新 store 使拓扑节点显示同步
    updateSourceVoltage(node.id, value);
    try {
      await setVoltage(node.id, value);
      message.success(`电压已设置为 ${value.toFixed(2)}V`);
    } catch {
      message.error('设置电压失败');
    }
  }, [node, updateSourceVoltage]);

  const renderContent = () => {
    if (!node?.data) return <div>暂无数据</div>;

    const { nodeType } = node.data;
    const d = node.data;

    // 读取 controlRange 配置
    const controlRange = d.controlRange as { min: number; max: number } | undefined;

    switch (nodeType) {
      case 'ac':
      case 'psu': {
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

      case 'vr':
      case 'psip': {
        const s = d.sourceData as SourceData;
        if (!s) return <div>暂无数据</div>;
        const vMin = controlRange?.min ?? 0.5;
        const vMax = controlRange?.max ?? 1.5;
        const marks: Record<number, string> = {
          [vMin]: `${vMin}V`,
          [vMax]: `${vMax}V`,
        };
        // 添加中间刻度
        const vMid = +((vMin + vMax) / 2).toFixed(2);
        marks[vMid] = `${vMid}V`;
        return (
          <>
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
            <div style={{ marginTop: 16 }}>
              <Title level={5}>电压调节</Title>
              <Slider
                min={vMin}
                max={vMax}
                step={0.01}
                value={voltageValue}
                onChange={setVoltageValue}
                onChangeComplete={handleVoltageComplete}
                marks={marks}
              />
            </div>
          </>
        );
      }

      case 'fan': {
        const f = d.fanData as FanData;
        if (!f) return <div>暂无数据</div>;
        const sMin = controlRange?.min ?? 0;
        const sMax = controlRange?.max ?? 100;
        const marks: Record<number, string> = {
          [sMin]: `${sMin}%`,
          [sMax]: `${sMax}%`,
        };
        const sMid = Math.round((sMin + sMax) / 2);
        marks[sMid] = `${sMid}%`;
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
                min={sMin}
                max={sMax}
                value={fanSpeed}
                onChange={setFanSpeedLocal}
                onChangeComplete={handleFanSpeedComplete}
                marks={marks}
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
