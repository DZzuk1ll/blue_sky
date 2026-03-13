import React, { useCallback } from 'react';
import { type NodeProps } from '@xyflow/react';
import { useTopologyStore } from '../../../stores/topologyStore';

/**
 * HOC: 给节点添加缩放功能和关联高亮
 * - transform: scale() 等比例缩放节点及其内容
 * - hover 时显示 +/- 缩放控制按钮
 * - _highlighted 标记时显示高亮边框
 */
export function withScalable(Component: React.FC<NodeProps>): React.FC<NodeProps> {
  const WrappedComponent: React.FC<NodeProps> = (props) => {
    const scale = useTopologyStore((s) => s.nodeScales[props.id] ?? 1);
    const setNodeScale = useTopologyStore((s) => s.setNodeScale);
    const highlighted = (props.data as Record<string, unknown>)?._highlighted === true;

    const handleScaleUp = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodeScale(props.id, Math.min(+(scale + 0.1).toFixed(1), 2));
      },
      [props.id, scale, setNodeScale],
    );

    const handleScaleDown = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodeScale(props.id, Math.max(+(scale - 0.1).toFixed(1), 0.5));
      },
      [props.id, scale, setNodeScale],
    );

    const handleScaleReset = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodeScale(props.id, 1);
      },
      [props.id, setNodeScale],
    );

    return (
      <div
        className={`scalable-node-wrapper${highlighted ? ' node-highlighted' : ''}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Component {...props} />
        <div className="node-scale-controls nodrag nopan">
          <button className="scale-btn" onClick={handleScaleDown} title="缩小">
            −
          </button>
          <button className="scale-btn scale-btn-reset" onClick={handleScaleReset} title="重置大小">
            {Math.round(scale * 100)}%
          </button>
          <button className="scale-btn" onClick={handleScaleUp} title="放大">
            +
          </button>
        </div>
      </div>
    );
  };

  WrappedComponent.displayName = `Scalable(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}
