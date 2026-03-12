import type { NodeTypes } from '@xyflow/react';
import ACNode from './ACNode';
import PSUNode from './PSUNode';
import VRNode from './VRNode';
import PSIPNode from './PSIPNode';
import CPUNode from './CPUNode';
import MemoryNode from './MemoryNode';
import FanNode from './FanNode';
import DiskNode from './DiskNode';
import IONode from './IONode';
import CardNode from './CardNode';
import SensorNode from './SensorNode';
import MgmtBoardNode from './MgmtBoardNode';
import ChassisNode from './ChassisNode';

export const nodeTypes: NodeTypes = {
  ac: ACNode,
  psu: PSUNode,
  vr: VRNode,
  psip: PSIPNode,
  cpu: CPUNode,
  memory: MemoryNode,
  fan: FanNode,
  disk: DiskNode,
  io: IONode,
  card: CardNode,
  sensor: SensorNode,
  mgmtBoard: MgmtBoardNode,
  chassis: ChassisNode,
};
