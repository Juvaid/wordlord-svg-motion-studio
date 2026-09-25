import React from 'react';
import { 
  Keyboard, 
  Spline, 
  Columns3, 
  Droplets, 
  Maximize2, 
  Box, 
  Terminal, 
  Sparkles, 
  Sun, 
  Minimize2, 
  Binary, 
  Activity,
  Clapperboard,
  Palette,
  Contrast,
  Crown,
  EyeOff,
  Flame,
  Scan,
  Sunset,
  Cpu
} from 'lucide-react';

/**
 * Returns a unique Lucide icon for each Motion Preset.
 */
export const getMotionIcon = (id: string, size = 12): React.ReactNode => {
  switch (id) {
    case 'typewriter':
      return <Keyboard size={size} className="text-[#ff4e2e]" />;
    case 'wiredraw':
      return <Spline size={size} className="text-[#00ffff]" />;
    case 'ligature-clamp':
      return <Columns3 size={size} className="text-[#f59e0b]" />;
    case 'liquid-wipe':
      return <Droplets size={size} className="text-[#38bdf8]" />;
    case 'depth-slam':
      return <Maximize2 size={size} className="text-[#a855f7]" />;
    case 'origami':
      return <Box size={size} className="text-[#ec4899]" />;
    case 'cyber-glitch':
      return <Terminal size={size} className="text-[#22c55e]" />;
    case 'pulse-glow':
      return <Sparkles size={size} className="text-[#eab308]" />;
    case 'laser-sweep':
      return <Sun size={size} className="text-[#06b6d4]" />;
    case 'split-converge':
      return <Minimize2 size={size} className="text-[#3b82f6]" />;
    case 'matrix-rain':
      return <Binary size={size} className="text-[#10b981]" />;
    case 'elastic-pop':
      return <Activity size={size} className="text-[#f97316]" />;
    default:
      return <Clapperboard size={size} className="text-[#ff4e2e]" />;
  }
};

/**
 * Returns a unique Lucide icon for each Style Preset.
 */
export const getStyleIcon = (id: string, size = 12): React.ReactNode => {
  switch (id) {
    case 'signature':
      return <Sparkles size={size} className="text-[#ff4e2e]" />;
    case 'cyberpunk':
      return <Cpu size={size} className="text-[#00ffff]" />;
    case 'monochrome':
      return <Contrast size={size} className="text-slate-300" />;
    case 'golden':
      return <Crown size={size} className="text-amber-400" />;
    case 'ghost':
      return <EyeOff size={size} className="text-indigo-400" />;
    case 'emerald':
      return <Flame size={size} className="text-emerald-400" />;
    case 'wireframe':
      return <Scan size={size} className="text-cyan-400" />;
    case 'sunset':
      return <Sunset size={size} className="text-rose-400" />;
    default:
      return <Palette size={size} className="text-[#38bdf8]" />;
  }
};
