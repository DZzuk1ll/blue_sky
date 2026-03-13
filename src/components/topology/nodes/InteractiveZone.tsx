import React, { useRef, useEffect } from 'react';

/**
 * 交互隔离区域：阻止 React Flow 拦截内部组件的指针事件
 * 用于包裹 Slider、Input 等需要用户直接交互的控件
 */
const InteractiveZone: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 在 DOM 捕获阶段拦截事件，确保 React Flow 无法捕获
    const stop = (e: Event) => {
      e.stopPropagation();
    };

    // 使用冒泡阶段（而非捕获阶段）拦截事件，
    // 这样事件仍能到达子组件（如 Slider），但不会冒泡到 React Flow
    el.addEventListener('pointerdown', stop, false);
    el.addEventListener('mousedown', stop, false);
    el.addEventListener('touchstart', stop, false);
    el.addEventListener('pointermove', stop, false);
    el.addEventListener('mousemove', stop, false);
    el.addEventListener('touchmove', stop, false);

    return () => {
      el.removeEventListener('pointerdown', stop, false);
      el.removeEventListener('mousedown', stop, false);
      el.removeEventListener('touchstart', stop, false);
      el.removeEventListener('pointermove', stop, false);
      el.removeEventListener('mousemove', stop, false);
      el.removeEventListener('touchmove', stop, false);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`nodrag nopan nowheel ${className ?? ''}`}
      style={{ pointerEvents: 'all' }}
    >
      {children}
    </div>
  );
};

export default InteractiveZone;
