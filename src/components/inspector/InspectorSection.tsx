import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface InspectorSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  badge?: string | React.ReactNode;
  action?: React.ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * InspectorSection
 * 
 * Modular, non-nesting collapsible section designed for dense studio inspector panels.
 * Avoids card-in-card anti-patterns by utilizing clean horizontal dividers and
 * standardized row heights.
 */
export const InspectorSection: React.FC<InspectorSectionProps> = ({
  id,
  title,
  icon,
  badge,
  action,
  isOpen: controlledIsOpen,
  defaultOpen = true,
  onToggle,
  children,
  className = ''
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(next);
    }
    if (onToggle) {
      onToggle(next);
    }
  };

  return (
    <div className={`border-b border-[#1f2430] last:border-b-0 ${className}`}>
      {/* Section Header Row */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#12151e]/80 hover:bg-[#161a25] transition-colors group select-none">
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls={`section-body-${id}`}
          className="flex-1 flex items-center gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff4e2e]"
        >
          <span className="text-slate-500 group-hover:text-slate-300 transition-transform duration-150">
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>

          {icon && (
            <span className="text-[#ff4e2e] flex items-center justify-center flex-shrink-0">
              {icon}
            </span>
          )}

          <span className="text-[10.5px] font-display font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
            {title}
          </span>

          {badge && (
            typeof badge === 'string' ? (
              <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 font-medium">
                {badge}
              </span>
            ) : badge
          )}
        </button>

        {action && (
          <div className="flex items-center gap-1.5 pl-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {action}
          </div>
        )}
      </div>

      {/* Section Content Area */}
      {isExpanded && (
        <div
          id={`section-body-${id}`}
          className="p-3 bg-[#0d1017]/50 flex flex-col gap-3"
        >
          {children}
        </div>
      )}
    </div>
  );
};
