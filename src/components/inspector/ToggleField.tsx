import React from 'react';
import { Tooltip } from '../Tooltip';

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
  badge?: string;
  disabled?: boolean;
  accentColor?: string;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({
  label,
  checked,
  onChange,
  tooltip,
  badge,
  disabled = false,
  accentColor = '#ff4e2e'
}) => {
  const toggleContent = (
    <div className={`flex items-center justify-between py-1.5 px-0.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-1.5 min-w-0 pr-2">
        <span className="text-[11px] font-mono text-slate-300 truncate">
          {label}
        </span>
        {badge && (
          <span className="px-1 py-0.2 rounded text-[8.5px] font-mono font-bold bg-[#ff4e2e]/20 text-[#ff4e2e] uppercase border border-[#ff4e2e]/30">
            {badge}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${
          checked ? 'bg-[#ff4e2e]' : 'bg-[#1e2432]'
        }`}
        style={checked && accentColor !== '#ff4e2e' ? { backgroundColor: accentColor } : undefined}
      >
        <span
          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-150 ease-in-out ${
            checked ? 'translate-x-3' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side="left">
        {toggleContent}
      </Tooltip>
    );
  }

  return toggleContent;
};
