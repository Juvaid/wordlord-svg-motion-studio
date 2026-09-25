import React, { useState } from 'react';
import { 
  Sliders, 
  Repeat, 
  Square, 
  Shuffle, 
  Sparkles, 
  Box, 
  Compass, 
  RotateCcw, 
  Copy, 
  Check, 
  Palette,
  ChevronDown,
  ChevronRight,
  Activity
} from 'lucide-react';
import { BezierGraph } from './BezierGraph';
import { BezierPoints, PlaybackMode, GeometryMode } from '../types';
import { Tooltip } from './Tooltip';

interface RightInspectorProps {
  motionName: string;
  category: string;
  duration: number;
  stagger: number;
  bezier: BezierPoints;
  easeFormula: string;
  playbackMode: PlaybackMode;
  glowRadius: number;
  glowIntensity: number;
  geometryMode: GeometryMode;
  strokeWidth: number;
  tiltX: number;
  tiltY: number;
  colors: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
  width: number;
  onDurationChange: (dur: number) => void;
  onStaggerChange: (stagger: number) => void;
  onBezierChange: (points: BezierPoints) => void;
  onPlaybackModeChange: (mode: PlaybackMode) => void;
  onGlowRadiusChange: (rad: number) => void;
  onGlowIntensityChange: (intensity: number) => void;
  onGeometryModeChange: (mode: GeometryMode) => void;
  onStrokeWidthChange: (w: number) => void;
  onTiltXChange: (x: number) => void;
  onTiltYChange: (y: number) => void;
  onResetTilt: () => void;
  onColorChange: (key: 'word' | 'lord' | 'ligature' | 'media', val: string) => void;
  onPlaySound?: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  motionName,
  category,
  duration,
  stagger,
  bezier,
  easeFormula,
  playbackMode,
  glowRadius,
  glowIntensity,
  geometryMode,
  strokeWidth,
  tiltX,
  tiltY,
  colors,
  width,
  onDurationChange,
  onStaggerChange,
  onBezierChange,
  onPlaybackModeChange,
  onGlowRadiusChange,
  onGlowIntensityChange,
  onGeometryModeChange,
  onStrokeWidthChange,
  onTiltXChange,
  onTiltYChange,
  onResetTilt,
  onColorChange,
  onPlaySound
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Accordion state
  const [sections, setSections] = useState({
    dynamics: true,
    bezier: true,
    optics: true,
    spatial3d: true,
    palette: true,
    manifest: false
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const manifestSnippet = `/* WordLord Studio — ${motionName} */
:root {
  --motion-duration: ${duration}s;
  --motion-stagger: ${stagger / 1000}s;
  --motion-ease: ${easeFormula};
  --motion-glow: ${glowRadius}px;
}

#main-stage-svg {
  filter: drop-shadow(0 0 ${glowRadius}px ${colors.media});
  overflow: visible !important;
}`;

  const copyManifest = () => {
    navigator.clipboard.writeText(manifestSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1500);
  };

  return (
    <aside
      style={{ width: `${width}px` }}
      className="flex-shrink-0 bg-[#0e1117] border-l border-[#1f2430] flex flex-col h-full z-30 select-none overflow-hidden"
    >
      {/* Sticky Fixed Header */}
      <div className="h-11 px-3.5 border-b border-[#1f2430] flex items-center justify-between bg-[#0a0c10] flex-shrink-0">
        <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-slate-200">
          <Sliders size={13} className="text-[#ff4e2e]" />
          <span>Properties & Inspector</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#ff4e2e]/10 text-[#ff4e2e] border border-[#ff4e2e]/20 font-medium">
          {category}
        </span>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        
        {/* Active Preset Header Chip */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-xs font-display font-black text-slate-100 uppercase tracking-wide">
              {motionName}
            </span>
            <span className="text-[9px] font-mono text-slate-500">60 FPS Hardware Timing</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-[#ff4e2e]">
            {duration.toFixed(2)}s
          </span>
        </div>

        {/* 1. Motion Timing Accordion */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('dynamics')}
            className="w-full h-8 px-3 flex items-center justify-between bg-[#151822] hover:bg-[#1a1e2b] transition-colors text-[10.5px] font-display font-bold uppercase tracking-wider text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Sliders size={12} className="text-[#ff4e2e]" />
              <span>Motion Dynamics</span>
            </div>
            {sections.dynamics ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {sections.dynamics && (
            <div className="p-3 flex flex-col gap-2.5 border-t border-[#1f2430]">
              {/* Duration Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Duration</span>
                  <span className="text-[#ff4e2e] font-semibold">{duration.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="4.0"
                  step="0.05"
                  value={duration}
                  onChange={(e) => onDurationChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Stagger Delay Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Stagger Cascade</span>
                  <span className="text-[#ff4e2e] font-semibold">{stagger}ms</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={stagger}
                  onChange={(e) => onStaggerChange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Playback Sequence Mode */}
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  Loop Iteration Mode
                </span>
                <div className="flex bg-[#181c28] border border-[#232736] rounded-md p-0.5 gap-1">
                  <Tooltip content="Repeat continuously from start" side="top">
                    <button
                      onClick={() => onPlaybackModeChange('loop')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[9px] font-mono rounded transition-all ${
                        playbackMode === 'loop'
                          ? 'bg-white/10 text-white font-semibold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Repeat size={11} />
                      <span>Loop</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Play once and pause at end" side="top">
                    <button
                      onClick={() => onPlaybackModeChange('once')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[9px] font-mono rounded transition-all ${
                        playbackMode === 'once'
                          ? 'bg-white/10 text-white font-semibold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Square size={11} />
                      <span>1-Shot</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Play forward then reverse" side="top">
                    <button
                      onClick={() => onPlaybackModeChange('alternate')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[9px] font-mono rounded transition-all ${
                        playbackMode === 'alternate'
                          ? 'bg-white/10 text-white font-semibold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Shuffle size={11} />
                      <span>Ping-Pong</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Interactive Bézier Curve Graph Accordion */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('bezier')}
            className="w-full h-8 px-3 flex items-center justify-between bg-[#151822] hover:bg-[#1a1e2b] transition-colors text-[10.5px] font-display font-bold uppercase tracking-wider text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-[#00ffff]" />
              <span>Bézier Easing Graph</span>
            </div>
            {sections.bezier ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {sections.bezier && (
            <div className="p-2.5 border-t border-[#1f2430]">
              <BezierGraph
                bezier={bezier}
                onChange={onBezierChange}
                onPlaySound={onPlaySound}
              />
            </div>
          )}
        </div>

        {/* 3. Volumetric Optics & Aura Accordion */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('optics')}
            className="w-full h-8 px-3 flex items-center justify-between bg-[#151822] hover:bg-[#1a1e2b] transition-colors text-[10.5px] font-display font-bold uppercase tracking-wider text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#ff4e2e]" />
              <span>Volumetric Optics & Aura</span>
            </div>
            {sections.optics ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {sections.optics && (
            <div className="p-3 flex flex-col gap-2.5 border-t border-[#1f2430]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Glow Blur Radius</span>
                  <span className="text-[#ff4e2e] font-semibold">{glowRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={glowRadius}
                  onChange={(e) => onGlowRadiusChange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Aura Bloom Intensity</span>
                  <span className="text-[#ff4e2e] font-semibold">{glowIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={glowIntensity}
                  onChange={(e) => onGlowIntensityChange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Geometry Mode Toggle */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  Geometry Render Mode
                </span>
                <div className="flex bg-[#181c28] border border-[#232736] rounded-md p-0.5 gap-1">
                  <Tooltip content="Filled Vector Geometry" side="top">
                    <button
                      onClick={() => onGeometryModeChange('fill')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-mono rounded transition-all ${
                        geometryMode === 'fill' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Box size={10} />
                      <span>Fill</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Wireframe Vector Contours" side="top">
                    <button
                      onClick={() => onGeometryModeChange('stroke')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-mono rounded transition-all ${
                        geometryMode === 'stroke' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Compass size={10} />
                      <span>Outline</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Semi-translucent Fill with Stroke Edge" side="top">
                    <button
                      onClick={() => onGeometryModeChange('hybrid')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-mono rounded transition-all ${
                        geometryMode === 'hybrid' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles size={10} />
                      <span>Hybrid</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Stroke Width Slider if stroke or hybrid */}
              {geometryMode !== 'fill' && (
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Stroke Line Width</span>
                    <span className="text-[#00ffff] font-semibold">{strokeWidth.toFixed(1)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="3.5"
                    step="0.1"
                    value={strokeWidth}
                    onChange={(e) => onStrokeWidthChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. 3D Spatial Perspective Accordion */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('spatial3d')}
            className="w-full h-8 px-3 flex items-center justify-between bg-[#151822] hover:bg-[#1a1e2b] transition-colors text-[10.5px] font-display font-bold uppercase tracking-wider text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Compass size={12} className="text-[#38bdf8]" />
              <span>3D Spatial Perspective</span>
            </div>
            {sections.spatial3d ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {sections.spatial3d && (
            <div className="p-3 flex flex-col gap-2.5 border-t border-[#1f2430]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-400">Angle Calibration</span>
                <Tooltip content="Reset 3D Pitch and Yaw to 0°" side="left">
                  <button
                    onClick={onResetTilt}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[9px] font-mono text-slate-400 hover:text-white rounded"
                  >
                    <RotateCcw size={9} />
                    <span>Reset</span>
                  </button>
                </Tooltip>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Tilt X (Pitch)</span>
                  <span className="text-[#38bdf8] font-semibold">{tiltX}°</span>
                </div>
                <input
                  type="range"
                  min="-35"
                  max="35"
                  step="1"
                  value={tiltX}
                  onChange={(e) => onTiltXChange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Tilt Y (Yaw)</span>
                  <span className="text-[#38bdf8] font-semibold">{tiltY}°</span>
                </div>
                <input
                  type="range"
                  min="-35"
                  max="35"
                  step="1"
                  value={tiltY}
                  onChange={(e) => onTiltYChange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Brand Color Tuning Accordion (2x2 Grid, NO CLIPPING) */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('palette')}
            className="w-full h-8 px-3 flex items-center justify-between bg-[#151822] hover:bg-[#1a1e2b] transition-colors text-[10.5px] font-display font-bold uppercase tracking-wider text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Palette size={12} className="text-[#ff4e2e]" />
              <span>Brand Palette Tuning</span>
            </div>
            {sections.palette ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {sections.palette && (
            <div className="p-3 border-t border-[#1f2430]">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'word' as const, label: 'WORD (Line 1)', color: colors.word },
                  { key: 'lord' as const, label: 'LORD (Line 2)', color: colors.lord },
                  { key: 'ligature' as const, label: 'TALL D (Monolith)', color: colors.ligature },
                  { key: 'media' as const, label: 'MEDIA (Sub-brand)', color: colors.media }
                ].map(item => (
                  <Tooltip key={item.key} content={`Change hex color for ${item.label}`} side="top">
                    <label
                      className="flex items-center gap-2 bg-[#181c28] border border-[#222736] hover:border-slate-500 rounded-md p-2 cursor-pointer transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-mono font-bold text-slate-200 truncate">{item.label}</span>
                        <span className="text-[8px] font-mono text-slate-500 truncate">{item.color}</span>
                      </div>
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => onColorChange(item.key, e.target.value)}
                        className="sr-only"
                      />
                    </label>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. CSS Manifest Snippet Accordion */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('manifest')}
            className="w-full h-8 px-3 flex items-center justify-between bg-[#151822] hover:bg-[#1a1e2b] transition-colors text-[10.5px] font-display font-bold uppercase tracking-wider text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Copy size={12} className="text-[#a5b4fc]" />
              <span>CSS Manifest Export</span>
            </div>
            {sections.manifest ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {sections.manifest && (
            <div className="p-3 border-t border-[#1f2430] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-400">Live Computed Variables</span>
                <Tooltip content="Copy CSS snippet to clipboard" side="left">
                  <button
                    onClick={copyManifest}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[10px] font-mono text-slate-300 rounded transition-all"
                  >
                    {copiedSnippet ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                  </button>
                </Tooltip>
              </div>
              <pre className="bg-[#07080c] border border-white/5 rounded p-2 text-[8.5px] font-mono text-indigo-300 leading-relaxed overflow-x-auto whitespace-pre">
                {manifestSnippet}
              </pre>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
