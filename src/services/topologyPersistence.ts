/**
 * 拓扑持久化服务 — 基于 localStorage 实现自动保存、手动保存和版本管理
 */
import type { TopologyExportData } from '../types/topology';

const STORAGE_KEY = 'topology_current';
const VERSIONS_KEY = 'topology_versions';
const MAX_VERSIONS = 50;

/** 版本记录 */
export interface TopologyVersion {
  id: string;
  timestamp: string;
  label: string;       // 版本描述（自动保存 / 手动保存）
  data: TopologyExportData;
}

/** 保存当前拓扑到 localStorage */
export function saveCurrentTopology(data: TopologyExportData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('保存拓扑失败:', e);
  }
}

/** 从 localStorage 加载当前拓扑 */
export function loadCurrentTopology(): TopologyExportData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as TopologyExportData;
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return null;
    return data;
  } catch {
    return null;
  }
}

/** 保存一个版本快照 */
export function saveVersion(data: TopologyExportData, label: string): TopologyVersion {
  const versions = loadVersions();
  const version: TopologyVersion = {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    label,
    data,
  };
  versions.unshift(version);
  // 限制最大版本数
  if (versions.length > MAX_VERSIONS) {
    versions.length = MAX_VERSIONS;
  }
  try {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  } catch (e) {
    console.warn('保存版本失败:', e);
    // 如果存储满了，删除一半旧版本后重试
    versions.length = Math.floor(MAX_VERSIONS / 2);
    try {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
    } catch {
      console.error('无法保存版本历史');
    }
  }
  return version;
}

/** 加载所有版本历史 */
export function loadVersions(): TopologyVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TopologyVersion[];
  } catch {
    return [];
  }
}

/** 删除指定版本 */
export function deleteVersion(versionId: string): void {
  const versions = loadVersions().filter(v => v.id !== versionId);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

/** 清空所有版本历史 */
export function clearVersions(): void {
  localStorage.removeItem(VERSIONS_KEY);
}
