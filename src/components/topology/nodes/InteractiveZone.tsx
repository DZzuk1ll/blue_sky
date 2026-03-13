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

    el.addEventListener('pointerdown', stop, true);
    el.addEventListener('mousedown', stop, true);
    el.addEventListener('touchstart', stop, true);

    return () => {
      el.removeEventListener('pointerdown', stop, true);
      el.removeEventListener('mousedown', stop, true);
      el.removeEventListener('touchstart', stop, true);
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
