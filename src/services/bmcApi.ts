/** BMC API接口层 - 当前使用Mock数据，预留真实BMC API切换 */
import type { BMCResponse, BMCControlResponse } from '../types/bmc';
import type { TopologyNode, TopologyEdge } from '../types/topology';
import { refreshNodeData, refreshEdgeData } from './mockData';

/** 是否使用Mock数据 (后续切换为false连接真实BMC) */
const USE_MOCK = true;

/** BMC基础URL (真实BMC API时使用) */
const _BMC_BASE_URL = '/api/bmc';
void _BMC_BASE_URL;

/** 获取所有节点最新数据 */
export async function fetchAllNodeData(
  currentNodes: TopologyNode[]
): Promise<BMCResponse<TopologyNode[]>> {
  if (USE_MOCK) {
    return {
      success: true,
      data: refreshNodeData(currentNodes),
      timestamp: new Date().toISOString(),
    };
  }
  // TODO: 真实BMC API调用
  // const res = await fetch(`${BMC_BASE_URL}/nodes`);
  // return res.json();
  throw new Error('Real BMC API not implemented');
}

/** 获取所有边最新数据 */
export async function fetchAllEdgeData(
  currentEdges: TopologyEdge[]
): Promise<BMCResponse<TopologyEdge[]>> {
  if (USE_MOCK) {
    return {
      success: true,
      data: refreshEdgeData(currentEdges),
      timestamp: new Date().toISOString(),
    };
  }
  throw new Error('Real BMC API not implemented');
}

/** 设置风扇转速 */
export async function setFanSpeed(
  nodeId: string,
  speedPercent: number
): Promise<BMCControlResponse> {
  if (USE_MOCK) {
    return {
      success: true,
      nodeId,
      action: 'setFanSpeed',
      newValue: speedPercent,
    };
  }
  throw new Error('Real BMC API not implemented');
}

/** 设置电压 */
export async function setVoltage(
  nodeId: string,
  voltage: number
): Promise<BMCControlResponse> {
  if (USE_MOCK) {
    return {
      success: true,
      nodeId,
      action: 'setVoltage',
      newValue: voltage,
    };
  }
  throw new Error('Real BMC API not implemented');
}
