import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Tooltip } from '../Tooltip';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownFieldProps<T extends string = string> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  tooltip?: string;
  disabled?: boolean;
}

export const DropdownField = <T extends string = string>({
  label,
  value,
  options,
  onChange,
  tooltip,
  disabled = false
}: DropdownFieldProps<T>) => {
  const content = (
    <div className={`flex items-center justify-between py-1.5 px-0.5 gap-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <span className="text-[10.5px] font-mono text-slate-300 truncate">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as T)}
          className="appearance-none bg-[#090b10] border border-[#22283a] hover:border-[#384360] focus:border-[#ff4e2e] text-slate-200 text-[10.5px] font-mono rounded px-2 py-1 pr-6 outline-none cursor-pointer transition-colors"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0f121a] text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side="left">
        {content}
      </Tooltip>
    );
  }

  return content;
};
