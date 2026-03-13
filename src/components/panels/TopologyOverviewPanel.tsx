import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Button, Statistic, Row, Col, Table, Tabs, Tag } from 'antd';
import {
  BarChartOutlined,
  LeftOutlined,
  RightOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useTopologyStore } from '../../stores/topologyStore';
import type { TopologyNode, TopologyEdge } from '../../types/topology';
import { formatPower, getNodeDisplayLabel } from '../../utils/formatters';

interface HistoryPoint {
  time: string;
  totalInput: number;
  totalOutput: number;
  totalLoss: number;
  efficiency: number;
  maxTemperature: number;
}

const MAX_HISTORY = 30;

/** 从节点中计算总功率数据 */
function computePowerSummary(nodes: TopologyNode[], edges: TopologyEdge[]) {
  let totalInput = 0;
  let totalOutput = 0;
  let maxTemp = 0;

  const modulePowers: Array<{ name: string; type: string; power: number }> = [];

  for (const node of nodes) {
    const d = node.data;
    const displayName = getNodeDisplayLabel(d as any) || d.label || node.id;

    // Source modules contribute input/output
    if (d.sourceData) {
      // Only count the top-level AC input as total input
      if (d.nodeType === 'ac') {
        totalInput += d.sourceData.inputPower;
      }
    }
    // Gather power from all load modules
    if (d.cpuData) {
      modulePowers.push({ name: displayName, type: d.nodeType, power: d.cpuData.power });
      if (d.cpuData.temperature && d.cpuData.temperature > maxTemp) maxTemp = d.cpuData.temperature;
    }
    if (d.fanData) {
      modulePowers.push({ name: displayName, type: d.nodeType, power: d.fanData.power });
      if (d.fanData.temperature && d.fanData.temperature > maxTemp) maxTemp = d.fanData.temperature;
    }
    if (d.memoryData) {
      modulePowers.push({ name: displayName, type: d.nodeType, power: d.memoryData.power });
      if (d.memoryData.temperature && d.memoryData.temperature > maxTemp) maxTemp = d.memoryData.temperature;
    }
    if (d.diskData) {
      modulePowers.push({ name: displayName, type: d.nodeType, power: d.diskData.power });
      if (d.diskData.temperature && d.diskData.temperature > maxTemp) maxTemp = d.diskData.temperature;
    }
    if (d.ioData) {
      modulePowers.push({ name: displayName, type: d.nodeType, power: d.ioData.power });
      if (d.ioData.temperature && d.ioData.temperature > maxTemp) maxTemp = d.ioData.temperature;
    }
    if (d.cardData) {
      modulePowers.push({ name: displayName, type: d.nodeType, power: d.cardData.power });
      if (d.cardData.temperature && d.cardData.temperature > maxTemp) maxTemp = d.cardData.temperature;
    }
    if (d.sensorData) {
      if (d.sensorData.temperature > maxTemp) maxTemp = d.sensorData.temperature;
    }
    if (d.sourceData) {
      // Track source module output power for ranking
      modulePowers.push({ name: displayName, type: d.nodeType, power: d.sourceData.outputPower });
      if (d.sourceData.temperature && d.sourceData.temperature > maxTemp) maxTemp = d.sourceData.temperature;
    }
  }

  // Total output = sum of all end-load power
  totalOutput = modulePowers
    .filter(m => ['cpu', 'memory', 'fan', 'disk', 'io', 'card'].includes(m.type))
    .reduce((sum, m) => sum + m.power, 0);

  // Total loss from edges
  const totalEdgeLoss = edges.reduce((sum, e) => sum + (e.data?.loss ?? 0), 0);

  // Power loss rankings from edges
  const edgeLosses = edges
    .filter(e => e.data?.loss !== undefined)
    .map(e => {
      const srcNode = nodes.find(n => n.id === e.source);
      const tgtNode = nodes.find(n => n.id === e.target);
      const srcLabel = srcNode?.data ? (getNodeDisplayLabel(srcNode.data as any) || srcNode.data.label || e.source) : e.source;
      const tgtLabel = tgtNode?.data ? (getNodeDisplayLabel(tgtNode.data as any) || tgtNode.data.label || e.target) : e.target;
      return {
        path: `${srcLabel} → ${tgtLabel}`,
        loss: e.data!.loss,
        lossPercent: e.data!.lossPercent,
      };
    })
    .sort((a, b) => b.loss - a.loss);

  // Module power ranking (loads only)
  const loadPowerRanking = modulePowers
    .filter(m => ['cpu', 'memory', 'fan', 'disk', 'io', 'card'].includes(m.type))
    .sort((a, b) => b.power - a.power);

  return {
    totalInput,
    totalOutput,
    totalLoss: totalEdgeLoss,
    efficiency: totalInput > 0 ? (totalOutput / totalInput) * 100 : 0,
    maxTemperature: maxTemp,
    loadPowerRanking,
    edgeLosses,
  };
}

interface TopologyOverviewPanelProps {
  open: boolean;
  onToggle: () => void;
}

const TopologyOverviewPanel: React.FC<TopologyOverviewPanelProps> = ({ open, onToggle }) => {
  const { nodes, edges } = useTopologyStore();
  const historyRef = useRef<HistoryPoint[]>([]);

  const summary = useMemo(() => computePowerSummary(nodes, edges), [nodes, edges]);

  // Record history point on each data update
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    historyRef.current = [
      ...historyRef.current.slice(-(MAX_HISTORY - 1)),
      {
        time: timeStr,
        totalInput: summary.totalInput,
        totalOutput: summary.totalOutput,
        totalLoss: summary.totalLoss,
        efficiency: summary.efficiency,
        maxTemperature: summary.maxTemperature,
      },
    ];
  }, [summary]);

  const history = historyRef.current;

  // Chart option builders
  const buildLineOption = useCallback(
    (
      title: string,
      series: Array<{ name: string; data: number[]; color: string }>,
      unit: string,
    ) => ({
      title: { text: title, textStyle: { fontSize: 13 }, left: 'center', top: 0 },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) =>
          params
            .map((p: any) => `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)}${unit}`)
            .join('<br/>'),
      },
      legend: { bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 50, right: 16, top: 40, bottom: 36 },
      xAxis: {
        type: 'category',
        data: history.map((h) => h.time),
        boundaryGap: false,
        axisLabel: { fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: `{value}${unit}`, fontSize: 10 },
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        lineStyle: { color: s.color, width: 2 },
        itemStyle: { color: s.color },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: s.color + '40' },
              { offset: 1, color: s.color + '05' },
            ],
          },
        },
      })),
    }),
    [history],
  );

  const totalPowerOption = buildLineOption(
    '总功耗曲线',
    [
      { name: '总输入功率', data: history.map((h) => h.totalInput), color: '#1677ff' },
      { name: '总输出功率', data: history.map((h) => h.totalOutput), color: '#52c41a' },
    ],
    'W',
  );

  const lossOption = buildLineOption(
    '功耗损失曲线',
    [{ name: '功耗损失', data: history.map((h) => h.totalLoss), color: '#ff4d4f' }],
    'W',
  );

  const efficiencyOption = buildLineOption(
    '系统效率曲线',
    [{ name: '系统效率', data: history.map((h) => h.efficiency), color: '#722ed1' }],
    '%',
  );

  const temperatureOption = buildLineOption(
    '最高温度曲线',
    [{ name: '最高温度', data: history.map((h) => h.maxTemperature), color: '#fa8c16' }],
    '°C',
  );

  const powerRankColumns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 50, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: '模块', dataIndex: 'name', key: 'name' },
    { title: '功率', dataIndex: 'power', key: 'power', render: (v: number) => formatPower(v) },
  ];

  const lossRankColumns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 50, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: '路径', dataIndex: 'path', key: 'path', ellipsis: true },
    { title: '损耗', dataIndex: 'loss', key: 'loss', width: 70, render: (v: number) => formatPower(v) },
    {
      title: '占比',
      dataIndex: 'lossPercent',
      key: 'lossPercent',
      width: 65,
      render: (v: number) => (
        <Tag color={v < 1 ? 'green' : v < 3 ? 'orange' : 'red'}>{v.toFixed(1)}%</Tag>
      ),
    },
  ];

  return (
    <>
      {/* Toggle button - always visible on right edge */}
      <Button
        type="primary"
        icon={open ? <RightOutlined /> : <LeftOutlined />}
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: open ? 420 : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          borderRadius: open ? '6px 0 0 6px' : '6px 0 0 6px',
          height: 48,
          width: 24,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'right 0.3s ease',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        }}
      />

      {/* Panel */}
      <div
        className="topology-overview-panel"
        style={{
          position: 'absolute',
          right: open ? 0 : -420,
          top: 0,
          bottom: 0,
          width: 420,
          background: '#fff',
          borderLeft: '1px solid #e8e8e8',
          zIndex: 15,
          transition: 'right 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600,
            fontSize: 15,
            color: '#262626',
            flexShrink: 0,
          }}
        >
          <BarChartOutlined />
          拓扑概览
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 0 16px' }}>
          <Tabs
            defaultActiveKey="overview"
            centered
            size="small"
            style={{ padding: '0 16px' }}
            items={[
              {
                key: 'overview',
                label: (
                  <span>
                    <DashboardOutlined /> 总览
                  </span>
                ),
                children: (
                  <div>
                    {/* Power stats */}
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      <Col span={12}>
                        <div className="overview-stat-card" style={statCardStyle}>
                          <Statistic
                            title="当前总输入功率"
                            value={summary.totalInput}
                            precision={1}
                            suffix="W"
                            valueStyle={{ color: '#1677ff', fontSize: 20 }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="overview-stat-card" style={statCardStyle}>
                          <Statistic
                            title="当前总输出功率"
                            value={summary.totalOutput}
                            precision={1}
                            suffix="W"
                            valueStyle={{ color: '#52c41a', fontSize: 20 }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="overview-stat-card" style={statCardStyle}>
                          <Statistic
                            title="当前功率损耗"
                            value={summary.totalLoss}
                            precision={1}
                            suffix="W"
                            valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="overview-stat-card" style={statCardStyle}>
                          <Statistic
                            title="系统效率"
                            value={summary.efficiency}
                            precision={1}
                            suffix="%"
                            valueStyle={{
                              color:
                                summary.efficiency >= 90
                                  ? '#52c41a'
                                  : summary.efficiency >= 80
                                    ? '#faad14'
                                    : '#ff4d4f',
                              fontSize: 20,
                            }}
                          />
                        </div>
                      </Col>
                    </Row>

                    {/* Module power ranking */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={sectionTitleStyle}>
                        <ThunderboltOutlined /> 模块功率排名
                      </div>
                      <Table
                        dataSource={summary.loadPowerRanking.map((m, i) => ({
                          ...m,
                          key: `${m.name}-${i}`,
                        }))}
                        columns={powerRankColumns}
                        size="small"
                        pagination={false}
                        scroll={{ y: 180 }}
                      />
                    </div>

                    {/* Loss ranking */}
                    <div>
                      <div style={sectionTitleStyle}>
                        <ThunderboltOutlined /> 功率损耗排名
                      </div>
                      <Table
                        dataSource={summary.edgeLosses.map((e, i) => ({
                          ...e,
                          key: `${e.path}-${i}`,
                        }))}
                        columns={lossRankColumns}
                        size="small"
                        pagination={false}
                        scroll={{ y: 180 }}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: 'history',
                label: (
                  <span>
                    <BarChartOutlined /> 历史曲线
                  </span>
                ),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <ReactECharts
                      option={totalPowerOption}
                      style={{ height: 220 }}
                      notMerge
                    />
                    <ReactECharts
                      option={lossOption}
                      style={{ height: 220 }}
                      notMerge
                    />
                    <ReactECharts
                      option={efficiencyOption}
                      style={{ height: 220 }}
                      notMerge
                    />
                    <ReactECharts
                      option={temperatureOption}
                      style={{ height: 220 }}
                      notMerge
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};

const statCardStyle: React.CSSProperties = {
  background: '#fafafa',
  borderRadius: 8,
  padding: '12px 14px',
  border: '1px solid #f0f0f0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#262626',
  marginBottom: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

export default TopologyOverviewPanel;
