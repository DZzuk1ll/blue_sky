/** 拓扑节点/边类型定义 */
import type { Node, Edge } from '@xyflow/react';
import type {
  SourceData, FanData, CPUData, SensorData,
  MemoryData, DiskData, IOData, CardData, MgmtBoardData,
} from './power';

/** 所有节点类型 */
export type HardwareNodeType =
  | 'ac' | 'psu' | 'vr' | 'psip'
  | 'cpu' | 'memory' | 'fan' | 'disk'
  | 'io' | 'card' | 'sensor' | 'mgmtBoard' | 'chassis';

/** API 配置（监测接口 + 控制接口） */
export interface ApiConfig {
  monitorApi?: {
    url: string;
    method: 'GET';
  };
  controlApi?: {
    url: string;
    method: 'POST' | 'PUT';
  };
}

/** 节点数据联合类型 */
export type HardwareNodeData = {
  label: string;
  nodeType: HardwareNodeType;
  category: 'source' | 'path' | 'load' | 'other';
  customIcon?: string;
  displayAlias?: string;      // 用户自定义显示别名
  customIconUrl?: string;     // 用户上传的自定义图标 (Data URL)
  apiConfig?: ApiConfig;      // API 接口配置
  controlRange?: { min: number; max: number };  // 控制范围（调速/调压的最小最大值）
} & (
  | { nodeType: 'ac'; sourceData: SourceData }
  | { nodeType: 'psu'; sourceData: SourceData }
  | { nodeType: 'vr'; sourceData: SourceData }
  | { nodeType: 'psip'; sourceData: SourceData }
  | { nodeType: 'cpu'; cpuData: CPUData }
  | { nodeType: 'memory'; memoryData: MemoryData }
  | { nodeType: 'fan'; fanData: FanData }
  | { nodeType: 'disk'; diskData: DiskData }
  | { nodeType: 'io'; ioData: IOData }
  | { nodeType: 'card'; cardData: CardData }
  | { nodeType: 'sensor'; sensorData: SensorData }
  | { nodeType: 'mgmtBoard'; mgmtData: MgmtBoardData }
  | { nodeType: 'chassis'; }
);

/** React Flow节点类型 */
export type TopologyNode = Node<HardwareNodeData>;

/** 边数据 */
export interface PowerEdgeData {
  loss: number;         // 损耗 W
  lossPercent: number;  // 损耗百分比 %
  animated?: boolean;
  label?: string;                        // 用户可编辑的标签文本
  customData?: Record<string, unknown>;  // 自定义 JSON 数据（如 BMC 链路损耗信息）
  _mode?: 'design' | 'monitor';         // 由 Canvas 注入的模式标识
  [key: string]: unknown;
}

/** React Flow边类型 */
export type TopologyEdge = Edge<PowerEdgeData>;

/** 拓扑导出数据格式 */
export interface TopologyExportData {
  version: string;
  exportTime: string;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  nodeScales: Record<string, number>;
}
