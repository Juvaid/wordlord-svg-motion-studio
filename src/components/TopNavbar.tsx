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
  Film, 
  Layers, 
  Box, 
  Camera, 
  Download,
  Undo2,
  Redo2,
  Save,
  FileDown,
  FileUp,
  HelpCircle
} from 'lucide-react';
import { BackgroundMode } from '../types';
import { Tooltip } from './Tooltip';
import { getMotionIcon } from '../utils/presetIcons';

interface TopNavbarProps {
  studioMode: '2d' | '3d';
  onSetStudioMode: (mode: '2d' | '3d') => void;
  scale: number;
  bgMode: BackgroundMode;
  activeMotionId: string;
  activeMotionName: string;
  activeStyleName: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSaveProject?: () => void;
  onExportProject?: () => void;
  onImportProject?: (file: File) => void;
  onOpenShortcuts?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSetBgMode: (mode: BackgroundMode) => void;
  onQuickPlay: () => void;
  onResetToStart: () => void;
  onOpenExport: () => void;
  onOpenVideoExport: () => void;
  onOpen3DExport?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  studioMode,
  onSetStudioMode,
  scale,
  bgMode,
  activeMotionId,
  activeMotionName,
  activeStyleName,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSaveProject,
  onExportProject,
  onImportProject,
  onOpenShortcuts,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSetBgMode,
  onQuickPlay,
  onResetToStart,
  onOpenExport,
  onOpenVideoExport,
  onOpen3DExport
}) => {
  return (
    <header className="h-12 bg-[#0c0e14] border-b border-[#1f2430] flex items-center justify-between px-3.5 z-40 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 flex-shrink-0">
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
            {studioMode === '2d' ? (
              <>
                <span className="inline-flex items-center gap-1 text-slate-300">
                  {getMotionIcon(activeMotionId, 10)}
                  <span>{activeMotionName}</span>
                </span>
                <span>•</span>
                <span className="text-slate-400">{activeStyleName}</span>
              </>
            ) : (
              <span className="text-[#ff4e2e] font-semibold">Three.js WebGL Extruded Engine</span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Studio Switcher & History / Project Controls */}
      <div className="flex items-center gap-2">
        {/* Studio Workspace Mode Switcher (2D Vector Motion vs 3D Extruded Studio) */}
        <div className="flex items-center bg-[#131722] border border-[#232838] rounded-lg p-0.5 shadow-sm">
          <button
            onClick={() => onSetStudioMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
              studioMode === '2d'
                ? 'bg-[#ff4e2e] text-white font-bold shadow-md shadow-[#ff4e2e]/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>2D Motion Studio</span>
          </button>
          <button
            onClick={() => onSetStudioMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
              studioMode === '3d'
                ? 'bg-[#ff4e2e] text-white font-bold shadow-md shadow-[#ff4e2e]/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box size={13} />
            <span>3D Extruded Studio</span>
          </button>
        </div>

        {/* Undo / Redo History Buttons */}
        <div className="flex items-center bg-[#131722] border border-[#232838] rounded-lg p-0.5 shadow-sm">
          <Tooltip content="Undo change" shortcut="Cmd+Z" side="bottom">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              className={`p-1.5 rounded transition-all ${
                canUndo 
                  ? 'text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer' 
                  : 'text-slate-600 cursor-not-allowed opacity-40'
              }`}
            >
              <Undo2 size={13} />
            </button>
          </Tooltip>
          <Tooltip content="Redo change" shortcut="Cmd+Shift+Z" side="bottom">
            <button
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              className={`p-1.5 rounded transition-all ${
                canRedo 
                  ? 'text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer' 
                  : 'text-slate-600 cursor-not-allowed opacity-40'
              }`}
            >
              <Redo2 size={13} />
            </button>
          </Tooltip>
        </div>

        {/* Project State Actions: Save Snapshot, Export JSON, Import JSON */}
        <div className="flex items-center bg-[#131722] border border-[#232838] rounded-lg p-0.5 shadow-sm">
          <Tooltip content="Save Project Snapshot" shortcut="Cmd+S" side="bottom">
            <button
              onClick={onSaveProject}
              aria-label="Save Project Snapshot"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded transition-all"
            >
              <Save size={13} />
            </button>
          </Tooltip>
          <Tooltip content="Export Project State (JSON)" side="bottom">
            <button
              onClick={onExportProject}
              aria-label="Export Project JSON"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded transition-all"
            >
              <FileDown size={13} />
            </button>
          </Tooltip>
          <Tooltip content="Import Project State (JSON)" side="bottom">
            <label className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer">
              <FileUp size={13} />
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onImportProject) onImportProject(file);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </Tooltip>
        </div>
      </div>

      {/* Right Actions & Canvas Stage Modes */}
      <div className="flex items-center gap-2">
        {studioMode === '2d' ? (
          <>
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
          </>
        ) : (
          <>
            {/* 3D Export Trigger */}
            <button
              onClick={onOpen3DExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4e2e] hover:bg-[#ff6144] text-white rounded-md text-xs font-semibold shadow-lg shadow-[#ff4e2e]/25 transition-all"
            >
              <Download size={13} />
              <span>Export 3D Asset / Video</span>
            </button>
          </>
        )}

        {/* Global Keyboard Shortcuts Help Button */}
        <Tooltip content="Keyboard Shortcuts (?)" shortcut="?" side="bottom">
          <button
            onClick={onOpenShortcuts}
            aria-label="Shortcuts"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md border border-[#222736] transition-all ml-1"
          >
            <HelpCircle size={14} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
