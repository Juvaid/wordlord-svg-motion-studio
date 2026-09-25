import React, { useState, useRef, useEffect, useCallback, ReactElement } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'start' | 'end';
  delay?: number;
  children: ReactElement<any>;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  side = 'top',
  align = 'center',
  delay = 120,
  children,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 120;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 28;
    const offset = 6;

    let top = 0;
    let left = 0;

    // Calculate vertical/horizontal side
    if (side === 'top') {
      top = triggerRect.top - tooltipHeight - offset;
      if (align === 'center') left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
      else if (align === 'start') left = triggerRect.left;
      else left = triggerRect.right - tooltipWidth;
    } else if (side === 'bottom') {
      top = triggerRect.bottom + offset;
      if (align === 'center') left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
      else if (align === 'start') left = triggerRect.left;
      else left = triggerRect.right - tooltipWidth;
    } else if (side === 'left') {
      left = triggerRect.left - tooltipWidth - offset;
      if (align === 'center') top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
      else if (align === 'start') top = triggerRect.top;
      else top = triggerRect.bottom - tooltipHeight;
    } else if (side === 'right') {
      left = triggerRect.right + offset;
      if (align === 'center') top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
      else if (align === 'start') top = triggerRect.top;
      else top = triggerRect.bottom - tooltipHeight;
    }

    // Keep within viewport bounds
    const padding = 8;
    const maxLeft = window.innerWidth - tooltipWidth - padding;
    const maxTop = window.innerHeight - tooltipHeight - padding;

    left = Math.max(padding, Math.min(maxLeft, left));
    top = Math.max(padding, Math.min(maxTop, top));

    setCoords({ top, left });
  }, [side, align]);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  // Recompute position after render if opened
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      const handleScrollOrResize = () => calculatePosition();
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const child = children as ReactElement<any>;
  const trigger = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const existingRef = (child as any).ref;
      if (typeof existingRef === 'function') existingRef(node);
      else if (existingRef && typeof existingRef === 'object' && 'current' in existingRef) {
        existingRef.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      child.props?.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      child.props?.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleMouseEnter();
      child.props?.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleMouseLeave();
      child.props?.onBlur?.(e);
    }
  } as any);

  return (
    <>
      {trigger}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999
            }}
            className="pointer-events-none select-none flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#11141d]/95 backdrop-blur-md border border-[#2b3347] text-slate-100 text-[11px] font-sans font-medium shadow-2xl shadow-black/80 whitespace-nowrap transition-opacity duration-100"
          >
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.2 bg-[#222738] text-slate-300 font-mono text-[9px] font-semibold rounded border border-white/10 uppercase tracking-wider">
                {shortcut}
              </kbd>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
