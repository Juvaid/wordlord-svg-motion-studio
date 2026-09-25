import React from 'react';
import { Tooltip } from '../Tooltip';

export interface ColorSwatchFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (hex: string) => void;
  tooltip?: string;
  className?: string;
}

/**
 * ColorSwatchField
 * 
 * Compact color swatch tile with hex readout and native picker integration.
 * Prevents layout clipping in narrow sidebars.
 */
export const ColorSwatchField: React.FC<ColorSwatchFieldProps> = ({
  label,
  sublabel,
  value,
  onChange,
  tooltip,
  className = ''
}) => {
  const swatchContent = (
    <label
      className={`group relative flex items-center gap-2 bg-[#151822] border border-[#222736] hover:border-slate-500 rounded-md p-1.5 cursor-pointer transition-all ${className}`}
    >
      <div
        className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
        style={{ backgroundColor: value }}
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[9px] font-mono font-bold text-slate-200 truncate group-hover:text-white transition-colors">
          {label}
        </span>
        <span className="text-[8px] font-mono text-slate-500 truncate">
          {sublabel || value.toUpperCase()}
        </span>
      </div>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </label>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side="top">
        {swatchContent}
      </Tooltip>
    );
  }

  return swatchContent;
};
