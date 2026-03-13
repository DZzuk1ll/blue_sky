import type { NodeTypes } from '@xyflow/react';
import { withScalable } from './ScalableNodeWrapper';
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
  ac: withScalable(ACNode),
  psu: withScalable(PSUNode),
  vr: withScalable(VRNode),
  psip: withScalable(PSIPNode),
  cpu: withScalable(CPUNode),
  memory: withScalable(MemoryNode),
  fan: withScalable(FanNode),
  disk: withScalable(DiskNode),
  io: withScalable(IONode),
  card: withScalable(CardNode),
  sensor: withScalable(SensorNode),
  mgmtBoard: withScalable(MgmtBoardNode),
  chassis: withScalable(ChassisNode),
};
