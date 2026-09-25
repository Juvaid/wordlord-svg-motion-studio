import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip } from '../Tooltip';

interface NumberInputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  tooltip?: string;
  disabled?: boolean;
}

export const NumberInputField: React.FC<NumberInputFieldProps> = ({
  label,
  value,
  onChange,
  min = -9999,
  max = 9999,
  step = 1,
  unit,
  tooltip,
  disabled = false
}) => {
  const handleIncrement = () => {
    const next = Math.min(max, Number((value + step).toFixed(2)));
    onChange(next);
  };

  const handleDecrement = () => {
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.max(min, Math.min(max, val)));
    }
  };

  const content = (
    <div className={`flex items-center justify-between py-1 px-0.5 gap-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <span className="text-[10.5px] font-mono text-slate-300 truncate">
        {label}
      </span>
      <div className="flex items-center bg-[#090b10] border border-[#22283a] rounded overflow-hidden focus-within:border-[#ff4e2e] transition-colors">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className="w-16 bg-transparent text-right px-1.5 py-0.5 text-[10px] font-mono text-slate-100 outline-none"
        />
        {unit && (
          <span className="text-[9px] font-mono text-slate-500 pr-1.5">
            {unit}
          </span>
        )}
        <div className="flex flex-col border-l border-[#22283a] bg-black/40">
          <button
            type="button"
            onClick={handleIncrement}
            className="px-1 py-0.5 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ChevronUp size={9} />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="px-1 py-0.5 text-slate-400 hover:text-white hover:bg-white/10 border-t border-[#22283a]"
          >
            <ChevronDown size={9} />
          </button>
        </div>
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
