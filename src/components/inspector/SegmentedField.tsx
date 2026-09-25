import React from 'react';
import { Tooltip } from '../Tooltip';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

export interface SegmentedFieldProps<T extends string> {
  label?: string;
  tooltip?: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * SegmentedField
 * 
 * Compact desktop studio segmented button group.
 * Ensures consistent padding, clear active state indicator, and tooltips.
 */
export function SegmentedField<T extends string>({
  label,
  tooltip,
  options,
  value,
  onChange,
  className = ''
}: SegmentedFieldProps<T>) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          {tooltip ? (
            <Tooltip content={tooltip} side="top" align="start">
              <span className="cursor-help underline decoration-dotted decoration-slate-600 underline-offset-2">
                {label}
              </span>
            </Tooltip>
          ) : (
            <span>{label}</span>
          )}
        </div>
      )}

      <div className="flex bg-[#151822] border border-[#232736] rounded-md p-0.5 gap-1">
        {options.map((option) => {
          const isActive = option.value === value;
          const buttonNode = (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 text-[9px] font-mono rounded transition-all select-none ${
                isActive
                  ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {option.icon && (
                <span className="flex-shrink-0 opacity-80">{option.icon}</span>
              )}
              <span className="truncate">{option.label}</span>
            </button>
          );

          if (option.tooltip) {
            return (
              <Tooltip key={option.value} content={option.tooltip} side="top">
                {buttonNode}
              </Tooltip>
            );
          }

          return buttonNode;
        })}
      </div>
    </div>
  );
}
