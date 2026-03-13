import React, { useState, useCallback, useRef, useEffect } from 'react';
import { type EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import { useTopologyStore } from '../../../stores/topologyStore';

interface PowerEdgeData {
  loss: number;
  lossPercent: number;
  animated?: boolean;
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
    markerEnd,
  } = props;

  const data = props.data as PowerEdgeData | undefined;
  const loss = data?.loss ?? 0;
  const lossPercent = data?.lossPercent ?? 0;
  const animated = data?.animated !== false;
  const edgeLabel = data?.label;
  const customData = data?.customData;
  const isDesignMode = data?._mode === 'design';
  const isHighlighted = data?._highlighted === true;

  const updateEdgeLabel = useTopologyStore((s) => s.updateEdgeLabel);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(edgeLabel ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync editValue when external label changes
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

  return (
    <>
      {/* Background path for wider hit area */}
      <path
        id={`${id}-bg`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />
      {/* Highlighted glow (behind the main path) */}
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
      {/* Visible edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={isHighlighted ? 3 : 2}
        markerEnd={markerEnd}
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
      {/* Inline keyframes (rendered once, deduped by browser) */}
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
