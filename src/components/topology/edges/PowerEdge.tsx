import React, { useState, useCallback, useRef, useEffect } from 'react';
import { type EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import { useTopologyStore } from '../../../stores/topologyStore';
import type { EdgeArrowType } from '../../../types/topology';

interface PowerEdgeDataLocal {
  loss: number;
  lossPercent: number;
  animated?: boolean;
  arrowType?: EdgeArrowType;
  label?: string;
  customData?: Record<string, unknown>;
  _mode?: 'design' | 'monitor';
  _highlighted?: boolean;
  [key: string]: unknown;
}

function getEdgeColor(lossPercent: number): string {
  if (lossPercent < 1) return '#52c41a';
  if (lossPercent <= 3) return '#faad14';
  return '#f5222d';
}

/** 箭头类型对应的显示文字 */
const arrowLabels: Record<EdgeArrowType, string> = {
  none: '无箭头',
  forward: '单向 →',
  both: '双向 ⇆',
};

/** 箭头类型循环顺序 */
const arrowCycle: EdgeArrowType[] = ['forward', 'both', 'none'];

const PowerEdge: React.FC<EdgeProps> = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
  } = props;

  const data = props.data as PowerEdgeDataLocal | undefined;
  const loss = data?.loss ?? 0;
  const lossPercent = data?.lossPercent ?? 0;
  const animated = data?.animated !== false;
  const arrowType: EdgeArrowType = data?.arrowType ?? 'forward';
  const edgeLabel = data?.label;
  const customData = data?.customData;
  const isDesignMode = data?._mode === 'design';
  const isHighlighted = data?._highlighted === true;

  const updateEdgeLabel = useTopologyStore((s) => s.updateEdgeLabel);
  const updateEdgeArrowType = useTopologyStore((s) => s.updateEdgeArrowType);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(edgeLabel ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) {
      setEditValue(edgeLabel ?? '');
    }
  }, [edgeLabel, editing]);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
    offset: 20,
  });

  const color = getEdgeColor(lossPercent);

  // 为每条边生成唯一的 marker ID
  const markerEndId = `arrow-end-${id}`;
  const markerStartId = `arrow-start-${id}`;

  const handleLabelClick = useCallback(() => {
    if (isDesignMode) {
      setEditing(true);
    }
  }, [isDesignMode]);

  const commitLabel = useCallback(() => {
    setEditing(false);
    const trimmed = editValue.trim();
    updateEdgeLabel(id, trimmed || undefined);
  }, [id, editValue, updateEdgeLabel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitLabel();
      } else if (e.key === 'Escape') {
        setEditing(false);
        setEditValue(edgeLabel ?? '');
      }
    },
    [commitLabel, edgeLabel],
  );

  const handleCycleArrow = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentIdx = arrowCycle.indexOf(arrowType);
      const next = arrowCycle[(currentIdx + 1) % arrowCycle.length];
      updateEdgeArrowType(id, next);
    },
    [id, arrowType, updateEdgeArrowType],
  );

  return (
    <>
      {/* SVG marker definitions for arrows */}
      <defs>
        <marker
          id={markerEndId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
        <marker
          id={markerStartId}
          viewBox="0 0 10 10"
          refX="2"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 10 0 L 0 5 L 10 10 z" fill={color} />
        </marker>
      </defs>

      {/* Background path for wider hit area */}
      <path
        id={`${id}-bg`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />
      {/* Highlighted glow */}
      {isHighlighted && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeOpacity={0.25}
          style={{ filter: 'blur(2px)' }}
        />
      )}
      {/* Visible edge path with arrow markers */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={isHighlighted ? 3 : 2}
        markerEnd={arrowType !== 'none' ? `url(#${markerEndId})` : undefined}
        markerStart={arrowType === 'both' ? `url(#${markerStartId})` : undefined}
        style={style}
      />
      {/* Animated flowing overlay */}
      {animated && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="6 4"
          style={{
            animation: 'power-edge-flow 1s linear infinite',
          }}
        />
      )}
      <style>
        {`@keyframes power-edge-flow {
          to { stroke-dashoffset: -10; }
        }`}
      </style>
      {/* Label at midpoint */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* Editable label area */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              background: '#fff',
              border: `1px solid ${color}`,
              borderRadius: 4,
              padding: '1px 6px',
              color,
              whiteSpace: 'nowrap',
              cursor: isDesignMode ? 'text' : 'default',
              textAlign: 'center',
            }}
            onClick={handleLabelClick}
          >
            {editing ? (
              <input
                ref={inputRef}
                className="edge-label-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitLabel}
                onKeyDown={handleKeyDown}
                style={{ color }}
              />
            ) : (
              <>
                {edgeLabel && <div>{edgeLabel}</div>}
                <div>{loss.toFixed(1)}W ({lossPercent.toFixed(1)}%)</div>
              </>
            )}
          </div>

          {/* Arrow type toggle button - design mode only */}
          {isDesignMode && (
            <div
              style={{
                marginTop: 2,
                fontSize: 10,
                background: '#f0f5ff',
                border: '1px solid #adc6ff',
                borderRadius: 3,
                padding: '1px 4px',
                cursor: 'pointer',
                textAlign: 'center',
                color: '#1677ff',
                userSelect: 'none',
              }}
              onClick={handleCycleArrow}
              title="点击切换箭头类型"
            >
              {arrowLabels[arrowType]}
            </div>
          )}

          {/* Custom JSON data display */}
          {customData && Object.keys(customData).length > 0 && (
            <div className="edge-custom-data">
              {Object.entries(customData).map(([key, value]) => (
                <div key={key} className="edge-custom-data-row">
                  <span className="edge-custom-data-key">{key}:</span>{' '}
                  <span className="edge-custom-data-value">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default PowerEdge;
