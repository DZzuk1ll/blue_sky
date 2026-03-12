import React from 'react';
import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

interface PowerEdgeData {
  loss: number;
  lossPercent: number;
  animated?: boolean;
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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const color = getEdgeColor(lossPercent);

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
      {/* Visible edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
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
            fontSize: 11,
            fontWeight: 500,
            background: '#fff',
            border: `1px solid ${color}`,
            borderRadius: 4,
            padding: '1px 6px',
            color,
            whiteSpace: 'nowrap',
          }}
          className="nodrag nopan"
        >
          {loss.toFixed(1)}W ({lossPercent.toFixed(1)}%)
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default PowerEdge;
