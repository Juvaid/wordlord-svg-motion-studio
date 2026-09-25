import React, { useCallback, useEffect, useState } from 'react';

interface PanelResizerProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  className?: string;
  title?: string;
}

export const PanelResizer: React.FC<PanelResizerProps> = ({
  direction,
  onResize,
  className = '',
  title = 'Drag to resize'
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    if (direction === 'vertical') {
      onResize(e.movementX);
    } else {
      // For horizontal splitter, moving up increases height of bottom panel
      onResize(-e.movementY);
    }
  }, [isDragging, direction, onResize]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, direction, handlePointerMove, handlePointerUp]);

  return (
    <div
      onPointerDown={handlePointerDown}
      title={title}
      className={`group relative flex-shrink-0 transition-colors ${
        direction === 'vertical'
          ? 'w-1 hover:w-1.5 cursor-col-resize bg-[#181b24] hover:bg-[#ff4e2e]'
          : 'h-1 hover:h-1.5 cursor-row-resize bg-[#181b24] hover:bg-[#ff4e2e]'
      } ${isDragging ? '!bg-[#ff4e2e] shadow-[0_0_8px_rgba(255,78,46,0.8)]' : ''} ${className}`}
    >
      {/* Visual grab indicator dot */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 group-hover:bg-white transition-opacity ${
          direction === 'vertical' ? 'w-0.5 h-4' : 'w-4 h-0.5'
        }`}
      />
    </div>
  );
};
