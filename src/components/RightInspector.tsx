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
  Maximize2
} from 'lucide-react';
import { BezierGraph } from './BezierGraph';
import { BezierPoints, PlaybackMode, GeometryMode } from '../types';

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
    <aside className="w-[310px] flex-shrink-0 bg-[#0e1117] border-l border-[#1f2430] flex flex-col z-30 select-none overflow-y-auto">
      {/* Header */}
      <div className="h-10 px-3 border-b border-[#1f2430] flex items-center justify-between bg-[#0a0c10]">
        <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200">
          <Sliders size={13} className="text-[#ff4e2e]" />
          <span>Properties & Inspector</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#ff4e2e]/10 text-[#ff4e2e] border border-[#ff4e2e]/20">
          {category}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* Active Preset Title */}
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <span className="text-xs font-display font-black text-slate-100 uppercase tracking-wide">
            {motionName}
          </span>
          <span className="text-[9px] font-mono text-slate-400">FPS: 60 Accurate</span>
        </div>

        {/* 1. Motion Timing Sliders */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-display font-bold uppercase tracking-wider text-slate-200">
            <span>Duration & Stagger</span>
          </div>

          {/* Duration */}
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

          {/* Stagger */}
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
        </div>

        {/* 2. Interactive Bézier Curve Graph Editor */}
        <BezierGraph
          bezier={bezier}
          onChange={onBezierChange}
          onPlaySound={onPlaySound}
        />

        {/* 3. Playback Sequence Mode */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg p-3 flex flex-col gap-2">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-200">
            Playback Sequence
          </span>
          <div className="flex bg-[#181c28] border border-[#232736] rounded-md p-0.5 gap-1">
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
          </div>
        </div>

        {/* 4. Volumetric Optics & Geometry */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg p-3 flex flex-col gap-2.5">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-200">
            Volumetric Optics & Aura
          </span>

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
              <span>Aura Intensity</span>
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
              Geometry Render
            </span>
            <div className="flex bg-[#181c28] border border-[#232736] rounded-md p-0.5 gap-1">
              <button
                onClick={() => onGeometryModeChange('fill')}
                className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-mono rounded transition-all ${
                  geometryMode === 'fill' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box size={10} />
                <span>Fill</span>
              </button>
              <button
                onClick={() => onGeometryModeChange('stroke')}
                className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-mono rounded transition-all ${
                  geometryMode === 'stroke' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass size={10} />
                <span>Outline</span>
              </button>
              <button
                onClick={() => onGeometryModeChange('hybrid')}
                className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-mono rounded transition-all ${
                  geometryMode === 'hybrid' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={10} />
                <span>Hybrid</span>
              </button>
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

        {/* 5. 3D Spatial Perspective Tilt */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-200">
              3D Spatial Perspective
            </span>
            <button
              onClick={onResetTilt}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[9px] font-mono text-slate-400 rounded"
              title="Reset 3D Angles"
            >
              <RotateCcw size={9} />
              <span>Reset</span>
            </button>
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

        {/* 6. Color Tuning */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-display font-bold uppercase tracking-wider text-slate-200">
            <Palette size={12} className="text-[#ff4e2e]" />
            <span>Brand Color Tuning</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { key: 'word' as const, label: 'WORD', color: colors.word },
              { key: 'lord' as const, label: 'LORD', color: colors.lord },
              { key: 'ligature' as const, label: 'TALL D', color: colors.ligature },
              { key: 'media' as const, label: 'MEDIA', color: colors.media }
            ].map(item => (
              <label
                key={item.key}
                className="flex flex-col items-center gap-1 bg-[#181c28] border border-[#222736] hover:border-slate-500 rounded p-1.5 cursor-pointer transition-colors"
                title={`Click to pick ${item.label} color`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[8px] font-mono font-medium text-slate-300">{item.label}</span>
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => onColorChange(item.key, e.target.value)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>

        {/* 7. CSS Snippet Manifest */}
        <div className="bg-[#12151e] border border-[#202534] rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-200">
              CSS Keyframe Manifest
            </span>
            <button
              onClick={copyManifest}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[10px] font-mono text-slate-300 rounded transition-all"
            >
              {copiedSnippet ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
              <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="bg-[#07080c] border border-white/5 rounded p-2 text-[8.5px] font-mono text-indigo-300 leading-relaxed overflow-x-auto whitespace-pre">
            {manifestSnippet}
          </pre>
        </div>
      </div>
    </aside>
  );
};
