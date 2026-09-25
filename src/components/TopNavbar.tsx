import React from 'react';
import { 
  Play, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Code2, 
  Grid, 
  Monitor, 
  Sparkles,
  Film
} from 'lucide-react';
import { BackgroundMode } from '../types';
import { Tooltip } from './Tooltip';

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
  onResetToStart: () => void;
  onOpenExport: () => void;
  onOpenVideoExport: () => void;
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
  onResetToStart,
  onOpenExport,
  onOpenVideoExport
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

      {/* Center Stage Viewport Navigation Tools */}
      <div className="flex items-center gap-1 bg-[#131620] border border-[#222736] rounded-md p-0.5">
        <Tooltip content="Zoom Out" shortcut="-" side="bottom">
          <button
            onClick={onZoomOut}
            aria-label="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded transition-colors"
          >
            <ZoomOut size={13} strokeWidth={2} />
          </button>
        </Tooltip>

        <Tooltip content="Current Scale (Scroll or drag stage)" side="bottom">
          <span className="text-[10px] font-mono font-medium px-1.5 text-slate-300 min-w-[3.2rem] text-center cursor-default">
            {Math.round(scale * 100)}%
          </span>
        </Tooltip>

        <Tooltip content="Zoom In" shortcut="+" side="bottom">
          <button
            onClick={onZoomIn}
            aria-label="Zoom In"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded transition-colors"
          >
            <ZoomIn size={13} strokeWidth={2} />
          </button>
        </Tooltip>

        <div className="w-[1px] h-3.5 bg-[#222736] mx-0.5" />

        <Tooltip content="Reset View (100% Zoom & Centered Pan)" shortcut="0" side="bottom">
          <button
            onClick={onResetView}
            aria-label="Reset View"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded transition-colors"
          >
            <RotateCcw size={13} strokeWidth={2} />
          </button>
        </Tooltip>
      </div>

      {/* Right Actions & Canvas Stage Modes */}
      <div className="flex items-center gap-2">
        {/* Background Mode Selector */}
        <div className="flex items-center bg-[#131620] border border-[#222736] rounded-md p-0.5">
          <Tooltip content="Solid Dark Stage" shortcut="1" side="bottom">
            <button
              onClick={() => onSetBgMode('dark')}
              aria-label="Solid Dark Stage"
              className={`p-1.5 rounded transition-all ${
                bgMode === 'dark'
                  ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor size={13} strokeWidth={2} />
            </button>
          </Tooltip>

          <Tooltip content="Radial Ambient Spotlight" shortcut="2" side="bottom">
            <button
              onClick={() => onSetBgMode('radial')}
              aria-label="Radial Ambient Spotlight"
              className={`p-1.5 rounded transition-all ${
                bgMode === 'radial'
                  ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} strokeWidth={2} />
            </button>
          </Tooltip>

          <Tooltip content="Sub-pixel Dot Calibration Grid" shortcut="3" side="bottom">
            <button
              onClick={() => onSetBgMode('grid')}
              aria-label="Sub-pixel Dot Calibration Grid"
              className={`p-1.5 rounded transition-all ${
                bgMode === 'grid'
                  ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid size={13} strokeWidth={2} />
            </button>
          </Tooltip>
        </div>

        {/* Rewind / Reset to 0:00 */}
        <Tooltip content="Reset Timeline to 0:00 (Beginning)" shortcut="Home" side="bottom">
          <button
            onClick={onResetToStart}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#141722] hover:bg-[#1d2232] border border-[#262c3e] text-slate-300 hover:text-white rounded-md text-xs font-mono transition-all shadow-sm"
          >
            <RotateCcw size={11} strokeWidth={2} className="text-slate-400" />
            <span>Reset</span>
          </button>
        </Tooltip>

        {/* Quick Replay Trigger */}
        <Tooltip content="Replay Animation from Beginning" shortcut="R" side="bottom">
          <button
            onClick={onQuickPlay}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#181c26] hover:bg-[#202534] border border-[#262c3e] hover:border-slate-500 text-slate-200 rounded-md text-xs font-mono transition-all shadow-sm"
          >
            <Play size={11} fill="currentColor" strokeWidth={0} className="text-[#ff4e2e]" />
            <span>Replay</span>
          </button>
        </Tooltip>

        {/* Video MP4 Export Trigger */}
        <Tooltip content="Render & Export 60 FPS MP4 / WebM Video" shortcut="V" side="bottom">
          <button
            onClick={onOpenVideoExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2434] hover:bg-[#293046] border border-[#3b4460] text-slate-100 rounded-md text-xs font-semibold shadow-sm transition-all"
          >
            <Film size={13} className="text-[#38bdf8]" />
            <span>Export MP4</span>
          </button>
        </Tooltip>

        {/* Code Export Modal Trigger */}
        <Tooltip content="Export Standalone SVG, CSS & React Component" shortcut="E" side="bottom">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4e2e] hover:bg-[#ff6144] text-white rounded-md text-xs font-semibold shadow-lg shadow-[#ff4e2e]/25 transition-all"
          >
            <Code2 size={13} strokeWidth={2.2} />
            <span>Export Code</span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
