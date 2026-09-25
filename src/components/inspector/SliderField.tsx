import React from 'react';
import { SettingRow } from './SettingRow';

export interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  decimals?: number;
  tooltip?: string;
  accentColor?: string;
  onChange: (val: number) => void;
  action?: React.ReactNode;
  className?: string;
}

/**
 * SliderField
 * 
 * Precision range scrub control with standardized badge readout, track styling,
 * and built-in tooltip support.
 */
export const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  decimals = 0,
  tooltip,
  accentColor = '#ff4e2e',
  onChange,
  action,
  className = ''
}) => {
  const formattedValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

  const badge = (
    <span
      className="font-mono text-[10px] font-semibold"
      style={{ color: accentColor }}
    >
      {formattedValue}{unit}
    </span>
  );

  return (
    <SettingRow
      label={label}
      tooltip={tooltip}
      valueBadge={badge}
      action={action}
      layout="stacked"
      className={className}
    >
      <div className="relative flex items-center w-full py-0.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-[#1e2230] rounded cursor-pointer appearance-none focus:outline-none"
          style={{
            accentColor: accentColor
          }}
        />
      </div>
    </SettingRow>
  );
};
