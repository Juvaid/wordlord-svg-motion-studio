import React from 'react';
import { 
  Play, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Code2, 
  Download, 
  Grid, 
  Monitor, 
  Sparkles,
  Layers,
  Box
} from 'lucide-react';
import { BackgroundMode } from '../types';

interface TopNavbarProps {
  scale: number;
  bgMode: BackgroundMode;
  activeMotionName: string;
  activeStyleName: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSetBgMode: (mode: BackgroundMode) => void;
  onQuickPlay: () => void;
  onOpenExport: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  scale,
  bgMode,
  activeMotionName,
  activeStyleName,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSetBgMode,
  onQuickPlay,
  onOpenExport,
}) => {
  return (
    <header className="h-12 bg-[#0c0e14] border-b border-[#1f2430] flex items-center justify-between px-3.5 z-40 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#1a1e29] to-[#0d0f14] border border-[#2a3040] flex items-center justify-center shadow-md">
          {/* Mini Vector Mark */}
          <svg width="15" height="15" viewBox="0 0 25 26" fill="none">
            <path d="M1.45 7.32L0 0.5h1.5l.68 5.2h.03L2.94.5h1.3l.72 5.2h.03l.68-5.2h1.36L6.1 7.32H5.06l-.53-4.5h-.03l-.68 4.5H2.6L1.45 7.32z" fill="#ffffff"/>
            <path d="M1.06 25.26V17.3h1.14l.84 5.7h.03l.83-5.7h1.14v7.96h-.88v-5.63h-.03l-.96 5.66H2.84l-.96-5.66h-.03v5.63H1.06z" fill="#ff4e2e"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-display text-xs font-black tracking-wider uppercase text-slate-100">
            <span>WORDLORD</span>
            <span className="text-[#ff4e2e]">STUDIO</span>
            <span className="text-[9px] font-mono px-1 py-0.2 bg-[#ff4e2e]/10 text-[#ff4e2e] border border-[#ff4e2e]/20 rounded font-normal">v5.0</span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 tracking-tight flex items-center gap-1">
            <span>{activeMotionName}</span>
            <span>•</span>
            <span className="text-slate-400">{activeStyleName}</span>
          </div>
        </div>
      </div>

      {/* Center Stage Tools */}
      <div className="flex items-center gap-1 bg-[#131620] border border-[#222736] rounded-md p-0.5">
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded transition-colors"
        >
          <ZoomOut size={13} strokeWidth={2} />
        </button>
        <span className="text-[10px] font-mono font-medium px-1.5 text-slate-300 min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded transition-colors"
        >
          <ZoomIn size={13} strokeWidth={2} />
        </button>
        <div className="w-[1px] h-3.5 bg-[#222736] mx-0.5" />
        <button
          onClick={onResetView}
          title="Reset View (100%)"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded transition-colors"
        >
          <RotateCcw size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Right Actions & Canvas Modes */}
      <div className="flex items-center gap-2">
        {/* Background Mode Selector */}
        <div className="flex items-center bg-[#131620] border border-[#222736] rounded-md p-0.5">
          <button
            onClick={() => onSetBgMode('dark')}
            title="Dark Stage"
            className={`p-1.5 rounded transition-all ${bgMode === 'dark' ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Monitor size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => onSetBgMode('radial')}
            title="Radial Spotlight"
            className={`p-1.5 rounded transition-all ${bgMode === 'radial' ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sparkles size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => onSetBgMode('grid')}
            title="Dot Calibration Grid"
            className={`p-1.5 rounded transition-all ${bgMode === 'grid' ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Grid size={13} strokeWidth={2} />
          </button>
        </div>

        {/* Quick Play Trigger */}
        <button
          onClick={onQuickPlay}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#181c26] hover:bg-[#202534] border border-[#262c3e] hover:border-slate-500 text-slate-200 rounded-md text-xs font-mono transition-all shadow-sm"
        >
          <Play size={12} fill="currentColor" strokeWidth={0} className="text-[#ff4e2e]" />
          <span>Replay</span>
        </button>

        {/* Export Modal Trigger */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4e2e] hover:bg-[#ff6144] text-white rounded-md text-xs font-semibold shadow-lg shadow-[#ff4e2e]/25 transition-all"
        >
          <Code2 size={13} strokeWidth={2.2} />
          <span>Export Code</span>
        </button>
      </div>
    </header>
  );
};
