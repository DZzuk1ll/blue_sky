import React, { useState } from 'react';
import { Card, Select, Form, InputNumber, Radio, Button, Statistic, Row, Col, message } from 'antd';
import { ThunderboltOutlined, FireOutlined, DashboardOutlined } from '@ant-design/icons';

const inputVarOptions = [
  { label: '电压', value: 'voltage' },
  { label: '频率', value: 'frequency' },
  { label: '风扇转速', value: 'fanSpeed' },
];

const outputVarOptions = [
  { label: '功耗', value: 'power' },
  { label: '温度', value: 'temperature' },
  { label: '性能分数', value: 'perfScore' },
];

const algorithmOptions = [
  { label: '遗传算法', value: 'ga' },
  { label: '粒子群优化', value: 'pso' },
  { label: '模拟退火', value: 'sa' },
  { label: '贝叶斯优化', value: 'bo' },
];

const OptimizationPanel: React.FC = () => {
  const [inputVars, setInputVars] = useState<string[]>(['voltage', 'frequency']);
  const [outputVars, setOutputVars] = useState<string[]>(['power', 'perfScore']);
  const [algorithm, setAlgorithm] = useState('ga');
  const [rule, setRule] = useState('perf');
  const [iterations, setIterations] = useState<number>(100);

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 16 }}>
      <Card title="输入/输出标量配置" size="small" style={{ marginBottom: 16 }}>
        <Form layout="vertical" size="small">
          <Form.Item label="输入变量">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={inputVars}
              onChange={setInputVars}
              options={inputVarOptions}
              placeholder="选择输入变量"
            />
          </Form.Item>
          <Form.Item label="输出变量">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={outputVars}
              onChange={setOutputVars}
              options={outputVarOptions}
              placeholder="选择输出变量"
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="寻优配置" size="small" style={{ marginBottom: 16 }}>
        <Form layout="vertical" size="small">
          <Form.Item label="算法选择">
            <Select
              style={{ width: '100%' }}
              value={algorithm}
              onChange={setAlgorithm}
              options={algorithmOptions}
            />
          </Form.Item>
          <Form.Item label="寻优规则">
            <Radio.Group value={rule} onChange={(e) => setRule(e.target.value)}>
              <Radio.Button value="perf">性能最佳</Radio.Button>
              <Radio.Button value="power">功耗最佳</Radio.Button>
              <Radio.Button value="efficiency">能效比最佳</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="迭代次数">
            <InputNumber
              min={1}
              max={10000}
              value={iterations}
              onChange={(v) => setIterations(v ?? 100)}
              style={{ width: 160 }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => message.info('功能开发中')}>
              开始寻优
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="最优工况点" size="small">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" hoverable>
              <Statistic
                title="性能最佳"
                value={9856}
                prefix={<DashboardOutlined />}
                suffix="分"
              />
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                电压 1.15V / 频率 3.8GHz / 风扇 2400RPM
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" hoverable>
              <Statistic
                title="功耗最佳"
                value={85.3}
                precision={1}
                prefix={<ThunderboltOutlined />}
                suffix="W"
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                电压 0.95V / 频率 2.4GHz / 风扇 1200RPM
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" hoverable>
              <Statistic
                title="能效比最佳"
                value={112.6}
                precision={1}
                prefix={<FireOutlined />}
                suffix="分/W"
                valueStyle={{ color: '#cf1322' }}
              />
              <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                电压 1.05V / 频率 3.2GHz / 风扇 1800RPM
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OptimizationPanel;
