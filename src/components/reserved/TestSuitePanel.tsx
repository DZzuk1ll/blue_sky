import React, { useState, useMemo } from 'react';
import { Card, Select, Form, InputNumber, Table, Button, Space, Divider, message } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';

const testSuiteOptions = [
  { label: '功耗遍历测试', value: 'power' },
  { label: '电压扫描测试', value: 'voltage' },
  { label: '温度压力测试', value: 'temperature' },
];

const formFieldsMap: Record<string, { label: string; suffix: string }[]> = {
  power: [
    { label: '起始功耗', suffix: 'W' },
    { label: '终止功耗', suffix: 'W' },
    { label: '步长', suffix: 'W' },
  ],
  voltage: [
    { label: '起始电压', suffix: 'V' },
    { label: '终止电压', suffix: 'V' },
    { label: '步长', suffix: 'V' },
  ],
  temperature: [
    { label: '目标温度', suffix: '°C' },
    { label: '持续时间', suffix: 'min' },
  ],
};

interface ResultRow {
  key: string;
  id: string;
  input: string;
  power: string;
  efficiency: string;
  temperature: string;
}

const mockResults: ResultRow[] = [
  { key: '1', id: 'T-001', input: '100W', power: '98.5W', efficiency: '92.3%', temperature: '65°C' },
  { key: '2', id: 'T-002', input: '150W', power: '147.2W', efficiency: '91.8%', temperature: '72°C' },
  { key: '3', id: 'T-003', input: '200W', power: '195.1W', efficiency: '90.5%', temperature: '78°C' },
];

const columns: ColumnsType<ResultRow> = [
  { title: '测试编号', dataIndex: 'id', key: 'id' },
  { title: '输入值', dataIndex: 'input', key: 'input' },
  { title: '输出功耗', dataIndex: 'power', key: 'power' },
  { title: '效率', dataIndex: 'efficiency', key: 'efficiency' },
  { title: '温度', dataIndex: 'temperature', key: 'temperature' },
];

const axisOptions = [
  { label: '输入值', value: 'input' },
  { label: '输出功耗', value: 'power' },
  { label: '效率', value: 'efficiency' },
  { label: '温度', value: 'temperature' },
];

const TestSuitePanel: React.FC = () => {
  const [suite, setSuite] = useState<string>('power');
  const [xAxis, setXAxis] = useState<string>('input');
  const [yAxis, setYAxis] = useState<string>('power');

  const chartOption = useMemo(() => ({
    xAxis: { type: 'category' as const, name: axisOptions.find(o => o.value === xAxis)?.label, data: ['1', '2', '3'] },
    yAxis: { type: 'value' as const, name: axisOptions.find(o => o.value === yAxis)?.label },
    series: [{ type: 'line', data: [100, 150, 200], smooth: true }],
    tooltip: { trigger: 'axis' as const },
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
  }), [xAxis, yAxis]);

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 16 }}>
      <Card title="测试套选择" size="small" style={{ marginBottom: 16 }}>
        <Select
          style={{ width: '100%' }}
          value={suite}
          onChange={setSuite}
          options={testSuiteOptions}
        />
      </Card>

      <Card title="输入条件" size="small" style={{ marginBottom: 16 }}>
        <Form layout="inline" size="small">
          {formFieldsMap[suite]?.map((field) => (
            <Form.Item key={field.label} label={field.label}>
              <InputNumber addonAfter={field.suffix} style={{ width: 160 }} />
            </Form.Item>
          ))}
        </Form>
        <Divider style={{ margin: '12px 0' }} />
        <Button type="primary" onClick={() => message.info('功能开发中')}>
          开始测试
        </Button>
      </Card>

      <Card title="测试结果" size="small" style={{ marginBottom: 16 }}>
        <Table<ResultRow>
          columns={columns}
          dataSource={mockResults}
          size="small"
          pagination={false}
        />
      </Card>

      <Card title="曲线绘制" size="small">
        <Space style={{ marginBottom: 12 }}>
          <span>X轴:</span>
          <Select style={{ width: 120 }} value={xAxis} onChange={setXAxis} options={axisOptions} />
          <span>Y轴:</span>
          <Select style={{ width: 120 }} value={yAxis} onChange={setYAxis} options={axisOptions} />
        </Space>
        <ReactECharts option={chartOption} style={{ height: 260 }} />
      </Card>
    </div>
  );
};

export default TestSuitePanel;
