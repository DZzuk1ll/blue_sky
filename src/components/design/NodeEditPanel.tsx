import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Drawer, Input, InputNumber, Button, Upload, message, Tabs, Select, Typography, Divider, Tag } from 'antd';
import {
  EditOutlined,
  UploadOutlined,
  ApiOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { useTopologyStore } from '../../stores/topologyStore';
import type { TopologyNode, HardwareNodeType, ApiConfig } from '../../types/topology';

const { Text, Title } = Typography;

/** 模块类型大写缩写 */
const typeTagMap: Record<HardwareNodeType, string> = {
  ac: 'AC', psu: 'PSU', vr: 'VR', psip: 'PSIP',
  cpu: 'CPU', memory: 'MEM', fan: 'FAN', disk: 'DISK',
  io: 'IO', card: 'CARD', sensor: 'SENSOR', mgmtBoard: 'MGMT', chassis: 'CHASSIS',
};

/** 监测 API Response JSON 模板 */
const monitorResponseTemplates: Record<HardwareNodeType, object> = {
  ac: { inputVoltage: 220, outputVoltage: 220, current: 30, inputPower: 850, outputPower: 803, efficiency: 94.5, temperature: 45 },
  psu: { inputVoltage: 220, outputVoltage: 12, current: 30, inputPower: 400, outputPower: 376, efficiency: 94, temperature: 48 },
  vr: { inputVoltage: 12, outputVoltage: 0.85, current: 180, inputPower: 160, outputPower: 153, efficiency: 90, temperature: 55 },
  psip: { inputVoltage: 12, outputVoltage: 1.8, current: 5, inputPower: 10, outputPower: 9, efficiency: 91, temperature: 42 },
  cpu: { power: 150, temperature: 72, powerDomains: [{ name: 'CORE', voltage: 0.85, current: 80, power: 68 }], amuEvents: [] },
  memory: { power: 8, temperature: 55, thermalThrottle: false },
  fan: { power: 15, rpm: 5000, speedPercent: 60, temperature: 40 },
  disk: { power: 12, temperature: 38, status: 'normal' },
  io: { power: 10, temperature: 42, linkSpeed: 'PCIe Gen4 x16' },
  card: { power: 25, temperature: 50, slotId: 'Slot-1' },
  sensor: { temperature: 40, location: 'CPU附近' },
  mgmtBoard: { status: 'online', temperature: 38 },
  chassis: {},
};

/** 控制 API Request JSON 模板 */
const controlRequestTemplates: Partial<Record<HardwareNodeType, object>> = {
  fan: { speedPercent: 60 },
  vr: { voltage: 0.85 },
  psip: { voltage: 1.8 },
};

interface NodeEditPanelProps {
  open: boolean;
  onClose: () => void;
  node: TopologyNode | null;
}

/** 可控模块类型（支持调速/调压） */
const controllableTypes: HardwareNodeType[] = ['fan', 'vr', 'psip'];

/** 各可控类型的默认范围 */
const defaultRanges: Record<string, { min: number; max: number; step: number; unit: string; label: string }> = {
  fan:  { min: 0, max: 100, step: 1, unit: '%', label: '调速范围' },
  vr:   { min: 0.5, max: 1.5, step: 0.01, unit: 'V', label: '调压范围' },
  psip: { min: 0.5, max: 1.5, step: 0.01, unit: 'V', label: '调压范围' },
};

const NodeEditPanel: React.FC<NodeEditPanelProps> = ({ open, onClose, node }) => {
  const { updateNodeAlias, updateNodeCustomIconUrl, updateNodeApiConfig, updateNodeControlRange } = useTopologyStore();

  const [alias, setAlias] = useState('');
  const [monitorUrl, setMonitorUrl] = useState('');
  const [controlUrl, setControlUrl] = useState('');
  const [controlMethod, setControlMethod] = useState<'POST' | 'PUT'>('POST');
  const [rangeMin, setRangeMin] = useState<number | null>(null);
  const [rangeMax, setRangeMax] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 同步外部 node 数据到本地状态
  useEffect(() => {
    if (node?.data) {
      setAlias(node.data.displayAlias || '');
      setMonitorUrl(node.data.apiConfig?.monitorApi?.url || '');
      setControlUrl(node.data.apiConfig?.controlApi?.url || '');
      setControlMethod(node.data.apiConfig?.controlApi?.method || 'POST');
      const nt = node.data.nodeType as HardwareNodeType;
      const defaults = defaultRanges[nt];
      if (defaults) {
        setRangeMin(node.data.controlRange?.min ?? defaults.min);
        setRangeMax(node.data.controlRange?.max ?? defaults.max);
      }
    }
  }, [node]);

  const nodeType = node?.data?.nodeType as HardwareNodeType | undefined;
  const typeTag = nodeType ? typeTagMap[nodeType] || nodeType.toUpperCase() : '';

  // 保存别名
  const handleSaveAlias = useCallback(() => {
    if (!node) return;
    updateNodeAlias(node.id, alias);
    message.success('别名已保存');
  }, [node, alias, updateNodeAlias]);

  // 图标上传
  const handleIconUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!node) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验格式
    const validTypes = ['image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      message.error('仅支持 PNG 和 SVG 格式图标');
      return;
    }

    // 校验大小 (<500KB)
    if (file.size > 500 * 1024) {
      message.error('图标文件大小不能超过 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateNodeCustomIconUrl(node.id, dataUrl);
      message.success('图标已更新');
    };
    reader.readAsDataURL(file);

    // 重置 input 以支持重复上传同一文件
    e.target.value = '';
  }, [node, updateNodeCustomIconUrl]);

  // 清除自定义图标
  const handleClearIcon = useCallback(() => {
    if (!node) return;
    updateNodeCustomIconUrl(node.id, undefined);
    message.success('已恢复默认图标');
  }, [node, updateNodeCustomIconUrl]);

  // 保存控制范围
  const handleSaveControlRange = useCallback(() => {
    if (!node || !nodeType) return;
    const defaults = defaultRanges[nodeType];
    if (!defaults) return;
    const min = rangeMin ?? defaults.min;
    const max = rangeMax ?? defaults.max;
    if (min >= max) {
      message.error('最小值必须小于最大值');
      return;
    }
    updateNodeControlRange(node.id, { min, max });
    message.success('控制范围已保存');
  }, [node, nodeType, rangeMin, rangeMax, updateNodeControlRange]);

  // 保存 API 配置
  const handleSaveApiConfig = useCallback(() => {
    if (!node) return;
    const config: ApiConfig = {};
    if (monitorUrl.trim()) {
      config.monitorApi = { url: monitorUrl.trim(), method: 'GET' };
    }
    if (controlUrl.trim()) {
      config.controlApi = { url: controlUrl.trim(), method: controlMethod };
    }
    updateNodeApiConfig(node.id, config);
    message.success('API 配置已保存');
  }, [node, monitorUrl, controlUrl, controlMethod, updateNodeApiConfig]);

  const renderBasicTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 别名配置 */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          <EditOutlined /> 显示别名
        </Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder="输入自定义别名"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            suffix={<Tag color="blue">{typeTag}</Tag>}
            onPressEnter={handleSaveAlias}
          />
          <Button type="primary" onClick={handleSaveAlias}>保存</Button>
        </div>
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          保存后显示格式：{alias ? `${alias} (${typeTag})` : node?.data?.label || ''}
        </Text>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* 图标上传 */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          <UploadOutlined /> 自定义图标
        </Text>

        {/* 预览区 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8,
          padding: 12,
          background: '#fafafa',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
        }}>
          <div style={{
            width: 48, height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, background: '#fff', border: '1px solid #e8e8e8',
            fontSize: 28,
          }}>
            {node?.data?.customIconUrl ? (
              <img src={node.data.customIconUrl} alt="icon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            ) : (
              <span style={{ color: '#8c8c8c' }}>默认</span>
            )}
          </div>
          <div>
            <Text>当前图标：{node?.data?.customIconUrl ? '自定义' : '默认'}</Text>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.svg,image/png,image/svg+xml"
            onChange={handleIconUpload}
            style={{ display: 'none' }}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            上传图标
          </Button>
          {node?.data?.customIconUrl && (
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleClearIcon}
            >
              恢复默认
            </Button>
          )}
        </div>
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          支持 PNG / SVG 格式，大小不超过 500KB
        </Text>
      </div>
    </div>
  );

  const renderControlTab = () => {
    if (!nodeType) return null;
    const defaults = defaultRanges[nodeType];
    if (!defaults) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <ControlOutlined /> {defaults.label}
          </Title>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
            设置在拓扑监控界面中该模块滑块的最小值和最大值
          </Text>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <Text style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>最小值 ({defaults.unit})</Text>
              <InputNumber
                style={{ width: '100%' }}
                value={rangeMin}
                onChange={(v) => setRangeMin(v)}
                step={defaults.step}
                placeholder={`默认 ${defaults.min}`}
              />
            </div>
            <span style={{ marginTop: 20 }}>~</span>
            <div style={{ flex: 1 }}>
              <Text style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>最大值 ({defaults.unit})</Text>
              <InputNumber
                style={{ width: '100%' }}
                value={rangeMax}
                onChange={(v) => setRangeMax(v)}
                step={defaults.step}
                placeholder={`默认 ${defaults.max}`}
              />
            </div>
          </div>

          <div style={{
            padding: '8px 12px',
            background: '#f6f8fa',
            border: '1px solid #e8e8e8',
            borderRadius: 6,
            marginBottom: 12,
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined /> 当前范围：{rangeMin ?? defaults.min}{defaults.unit} ~ {rangeMax ?? defaults.max}{defaults.unit}
              （默认：{defaults.min}{defaults.unit} ~ {defaults.max}{defaults.unit}）
            </Text>
          </div>

          <Button type="primary" onClick={handleSaveControlRange} block>
            保存控制范围
          </Button>
        </div>
      </div>
    );
  };

  const renderApiTab = () => {
    const monitorTemplate = nodeType ? monitorResponseTemplates[nodeType] : {};
    const controlTemplate = nodeType ? controlRequestTemplates[nodeType] : undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 监测 API */}
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <ApiOutlined /> 监测 API（GET）
          </Title>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            配置数据获取接口，用于实时监控数据拉取
          </Text>
          <Input
            placeholder="输入监测 API URL，如 /api/bmc/nodes/{id}/data"
            value={monitorUrl}
            onChange={(e) => setMonitorUrl(e.target.value)}
            addonBefore="GET"
          />

          {/* Response JSON 模板 */}
          <div style={{
            marginTop: 8,
            background: '#f6f8fa',
            border: '1px solid #e8e8e8',
            borderRadius: 6,
            padding: '8px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, color: '#8c8c8c', fontSize: 12 }}>
              <InfoCircleOutlined /> 期望的 Response JSON 格式：
            </div>
            <pre style={{ margin: 0, fontSize: 11, color: '#595959', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(monitorTemplate, null, 2)}
            </pre>
          </div>
        </div>

        <Divider style={{ margin: '4px 0' }} />

        {/* 控制 API */}
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <ApiOutlined /> 控制 API
          </Title>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            配置控制指令接口，用于下发操作命令{controlTemplate ? '' : '（当前模块类型无控制功能）'}
          </Text>
          <Input
            placeholder={controlTemplate ? '输入控制 API URL，如 /api/bmc/nodes/{id}/control' : '当前模块无控制 API'}
            value={controlUrl}
            onChange={(e) => setControlUrl(e.target.value)}
            disabled={!controlTemplate}
            addonBefore={
              <Select
                value={controlMethod}
                onChange={setControlMethod}
                style={{ width: 80 }}
                disabled={!controlTemplate}
                options={[
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                ]}
              />
            }
          />

          {/* Request JSON 模板 */}
          {controlTemplate && (
            <div style={{
              marginTop: 8,
              background: '#f6f8fa',
              border: '1px solid #e8e8e8',
              borderRadius: 6,
              padding: '8px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, color: '#8c8c8c', fontSize: 12 }}>
                <InfoCircleOutlined /> 前端将发送的 Request JSON 格式：
              </div>
              <pre style={{ margin: 0, fontSize: 11, color: '#595959', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(controlTemplate, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <Button type="primary" onClick={handleSaveApiConfig} block style={{ marginTop: 8 }}>
          保存 API 配置
        </Button>
      </div>
    );
  };

  return (
    <Drawer
      title={
        <span>
          编辑模块 {node?.data?.label && <Tag color="blue">{typeTag}</Tag>}
        </span>
      }
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {node ? (
        <Tabs
          defaultActiveKey="basic"
          size="small"
          items={[
            {
              key: 'basic',
              label: <span><EditOutlined /> 基本信息</span>,
              children: renderBasicTab(),
            },
            ...(nodeType && controllableTypes.includes(nodeType) ? [{
              key: 'control',
              label: <span><ControlOutlined /> 控制范围</span>,
              children: renderControlTab(),
            }] : []),
            {
              key: 'api',
              label: <span><ApiOutlined /> API 配置</span>,
              children: renderApiTab(),
            },
          ]}
        />
      ) : (
        <div style={{ textAlign: 'center', color: '#8c8c8c', padding: 40 }}>
          请选中一个模块进行编辑
        </div>
      )}
    </Drawer>
  );
};

export default NodeEditPanel;
