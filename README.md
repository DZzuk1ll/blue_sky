# 蓝天系统 (Blue Sky) — 服务器功耗域监控与优化平台

蓝天系统是一个基于 Web 的**服务器功耗拓扑监控与优化平台**。它以可视化拓扑图的方式，实时展示从交流电源（AC）到 PSU、VR，再到 CPU、内存、IO 等硬件模块的完整功耗分布链路，帮助运维和硬件工程师快速定位功耗异常、分析转换效率。

## 功能概览

- **拓扑监控**：以节点-连线图实时展示服务器功耗分配链路（AC → PSU → VR → CPU/Memory/IO/Disk 等）
- **功耗效率分析**：追踪每级电源转换效率，计算各环节功耗损耗
- **CPU 功耗域详情**：查看 CPU 内部各功耗域（CORE_DVFS、DDRIO、UNCORE 等）的详细指标
- **拓扑设计模式**：通过拖拽方式自定义硬件拓扑结构
- **实时轮询**：可配置刷新间隔的实时数据更新
- **温度监控**：带颜色告警的温度追踪

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 7 |
| UI 组件库 | Ant Design 6 |
| 拓扑可视化 | React Flow (@xyflow/react) |
| 图表 | ECharts |
| 状态管理 | Zustand |
| 路由 | React Router 7 |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 16（推荐 18+）
- npm（随 Node.js 一起安装）

### 安装与运行

```bash
# 1. 克隆仓库
git clone <仓库地址>
cd blue_sky

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

启动成功后，在浏览器中打开 `http://localhost:5173` 即可访问。

### 其他命令

```bash
npm run build     # 构建生产环境产物（输出到 dist/ 目录）
npm run preview   # 本地预览生产构建
npm run lint      # 运行 ESLint 代码检查
```

## 项目结构

```
src/
├── main.tsx                        # 应用入口
├── App.tsx                         # 路由配置
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx           # 主布局（侧边栏 + 顶栏 + 轮询控制）
│   ├── topology/                   # 拓扑监控核心组件
│   │   ├── TopologyCanvas.tsx      # 拓扑图画布（React Flow）
│   │   ├── Toolbar.tsx             # 工具栏（复制/粘贴/删除/重置）
│   │   ├── nodes/                  # 各类硬件节点组件
│   │   │   ├── ACNode.tsx          #   交流电源节点
│   │   │   ├── ChassisNode.tsx     #   机箱节点
│   │   │   ├── CPUNode.tsx         #   CPU 节点
│   │   │   ├── MemoryNode.tsx      #   内存节点
│   │   │   ├── IONode.tsx          #   IO 节点
│   │   │   └── ...                 #   其他硬件节点
│   │   └── edges/
│   │       └── PowerEdge.tsx       # 自定义连线（显示功耗损耗数据）
│   ├── design/                     # 拓扑设计模式
│   │   ├── DesignCanvas.tsx        # 设计画布
│   │   ├── ModulePalette.tsx       # 模块面板（可拖拽）
│   │   └── IconPicker.tsx          # 图标选择器
│   ├── panels/
│   │   ├── NodeDetailPanel.tsx     # 节点详情侧边栏
│   │   ├── CPUPowerDomain.tsx      # CPU 功耗域详情弹窗
│   │   └── PowerEfficiency.tsx     # 功耗效率分析面板
│   └── reserved/                   # 预留功能（骨架组件）
│       ├── TestSuitePanel.tsx      #   测试套件
│       └── OptimizationPanel.tsx   #   自动优化
├── stores/
│   ├── topologyStore.ts            # 拓扑状态（节点/连线的增删改查、复制粘贴）
│   └── monitorStore.ts            # 监控状态（轮询控制、数据刷新）
├── services/
│   ├── bmcApi.ts                   # BMC API 接口封装（当前使用 Mock 数据）
│   └── mockData.ts                 # Mock 数据生成（带随机波动）
├── types/
│   ├── topology.ts                 # 拓扑相关类型定义
│   ├── power.ts                    # 功耗/PVT 数据类型
│   └── bmc.ts                      # BMC API 响应类型
├── utils/
│   └── formatters.ts               # 数值格式化与颜色映射工具
└── styles/
    └── global.css                  # 全局样式
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 拓扑监控 | 默认首页，实时展示功耗拓扑图 |
| `/design` | 拓扑设计 | 拖拽式自定义拓扑结构 |
| `/efficiency` | 效率分析 | 功耗转换效率瀑布图分析 |
| `/test` | 测试套件 | 预留功能 |
| `/optimize` | 自动优化 | 预留功能 |

## 数据流说明

```
UI 组件  →  Zustand Store  →  BMC API / Mock 数据
```

系统当前默认使用 **Mock 数据**运行，无需连接真实硬件即可体验全部功能。如需接入真实 BMC 接口，请修改 `src/services/bmcApi.ts` 中的 `USE_MOCK` 配置。

## 常见问题

**Q: 启动后页面空白？**
确认 Node.js 版本 >= 16，并且 `npm install` 已成功完成。

**Q: 如何接入真实数据？**
编辑 `src/services/bmcApi.ts`，将 `USE_MOCK` 设为 `false`，并实现实际的 BMC API 请求逻辑。

**Q: 如何添加新的硬件节点类型？**
在 `src/components/topology/nodes/` 下创建新的节点组件，然后在 `TopologyCanvas.tsx` 中注册该节点类型。
