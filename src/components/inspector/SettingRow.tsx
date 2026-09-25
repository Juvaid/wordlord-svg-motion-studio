import React from 'react';
import { Tooltip } from '../Tooltip';

export interface SettingRowProps {
  label: string;
  tooltip?: string;
  shortcut?: string;
  valueBadge?: React.ReactNode;
  action?: React.ReactNode;
  layout?: 'stacked' | 'horizontal';
  children: React.ReactNode;
  className?: string;
}

/**
 * SettingRow
 * 
 * Standardized atomic wrapper for inspector controls.
 * Ensures consistent typographic hierarchy, zero-overlap alignment, and built-in tooltips.
 */
export const SettingRow: React.FC<SettingRowProps> = ({
  label,
  tooltip,
  shortcut,
  valueBadge,
  action,
  layout = 'stacked',
  children,
  className = ''
}) => {
  const labelElement = (
    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300 transition-colors select-none cursor-default truncate">
      {label}
    </span>
  );

  if (layout === 'horizontal') {
    return (
      <div className={`flex items-center justify-between gap-2 min-h-[26px] ${className}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {tooltip ? (
            <Tooltip content={tooltip} shortcut={shortcut} side="top" align="start">
              <span className="cursor-help inline-flex items-center underline decoration-dotted decoration-slate-600 underline-offset-2">
                {labelElement}
              </span>
            </Tooltip>
          ) : (
            labelElement
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {valueBadge && (
            <span className="text-[10px] font-mono font-semibold text-slate-300">
              {valueBadge}
            </span>
          )}
          {children}
        </div>
      </div>
    );
  }

  // Stacked layout (default for range sliders, code blocks, color grids)
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono leading-tight">
        <div className="flex items-center gap-1.5 min-w-0">
          {tooltip ? (
            <Tooltip content={tooltip} shortcut={shortcut} side="top" align="start">
              <span className="cursor-help inline-flex items-center underline decoration-dotted decoration-slate-600 underline-offset-2">
                {labelElement}
              </span>
            </Tooltip>
          ) : (
            labelElement
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>

        {valueBadge && (
          <span className="text-[10px] font-mono font-semibold flex-shrink-0">
            {valueBadge}
          </span>
        )}
      </div>

      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
