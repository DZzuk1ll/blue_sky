/** 监控数据状态管理 */
import { create } from 'zustand';
import { fetchAllNodeData, fetchAllEdgeData } from '../services/bmcApi';
import { useTopologyStore } from './topologyStore';

interface MonitorState {
  isPolling: boolean;
  pollInterval: number;  // ms
  lastUpdate: string | null;
  error: string | null;
  intervalId: number | null;

  startPolling: () => void;
  stopPolling: () => void;
  setPollInterval: (ms: number) => void;
  refreshOnce: () => Promise<void>;
}

export const useMonitorStore = create<MonitorState>((set, get) => ({
  isPolling: false,
  pollInterval: 2000,
  lastUpdate: null,
  error: null,
  intervalId: null,

  refreshOnce: async () => {
    try {
      const topoStore = useTopologyStore.getState();
      const [nodeRes, edgeRes] = await Promise.all([
        fetchAllNodeData(topoStore.nodes),
        fetchAllEdgeData(topoStore.edges),
      ]);
      if (nodeRes.success) topoStore.updateNodes(nodeRes.data);
      if (edgeRes.success) topoStore.updateEdges(edgeRes.data);
      set({ lastUpdate: new Date().toISOString(), error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  startPolling: () => {
    const { isPolling, pollInterval } = get();
    if (isPolling) return;
    const id = window.setInterval(() => {
      get().refreshOnce();
    }, pollInterval);
    set({ isPolling: true, intervalId: id });
    // 立即执行一次
    get().refreshOnce();
  },

  stopPolling: () => {
    const { intervalId } = get();
    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }
    set({ isPolling: false, intervalId: null });
  },

  setPollInterval: (ms) => {
    const { isPolling } = get();
    set({ pollInterval: ms });
    if (isPolling) {
      get().stopPolling();
      get().startPolling();
    }
  },
}));
