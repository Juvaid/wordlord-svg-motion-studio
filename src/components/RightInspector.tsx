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
  Activity,
  Code2,
  ChevronsDownUp,
  ChevronsUpDown,
  Zap,
  Upload,
  Layers,
  Film,
  SlidersHorizontal
} from 'lucide-react';
import { BezierGraph } from './BezierGraph';
import { BezierPoints, PlaybackMode, GeometryMode } from '../types';
import { ALL_ASSETS } from '../data/assetLibrary';
import { STYLES } from '../data/styles';
import { Tooltip } from './Tooltip';
import { getMotionIcon } from '../utils/presetIcons';
import { 
  InspectorSection, 
  SliderField, 
  SegmentedField, 
  ColorSwatchField 
} from './inspector';

interface RightInspectorProps {
  motionId?: string;
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
  uiComplexity?: 'presets' | 'advanced';
  activeAssetId?: string;
  onSetUiComplexity?: (complexity: 'presets' | 'advanced') => void;
  onOpenCustomSvg?: () => void;
  onOpenAssetLibrary?: () => void;
  onOpenVideoExport?: () => void;
  onOpenCodeExport?: () => void;
  onSelectStyleById?: (styleId: string) => void;
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

type CategoryFilter = 'all' | 'dynamics' | 'optics' | 'spatial' | 'palette' | 'code';

export const RightInspector: React.FC<RightInspectorProps> = ({
  motionId = 'typewriter',
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
  uiComplexity = 'presets',
  activeAssetId = 'wordlord',
  onSetUiComplexity,
  onOpenCustomSvg,
  onOpenAssetLibrary,
  onOpenVideoExport,
  onOpenCodeExport,
  onSelectStyleById,
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
  const [copiedBezier, setCopiedBezier] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Accordion state management (by default, primary sections open)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dynamics: true,
    bezier: true,
    optics: true,
    spatial: true,
    palette: true,
    code: false
  });

  const toggleSection = (id: string, isOpen: boolean) => {
    setOpenSections(prev => ({ ...prev, [id]: isOpen }));
  };

  const areAllOpen = Object.values(openSections).every(Boolean);

  const toggleAllSections = () => {
    const nextState = !areAllOpen;
    setOpenSections({
      dynamics: nextState,
      bezier: nextState,
      optics: nextState,
      spatial: nextState,
      palette: nextState,
      code: nextState
    });
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

  const copyBezier = () => {
    navigator.clipboard.writeText(easeFormula);
    setCopiedBezier(true);
    setTimeout(() => setCopiedBezier(false), 1500);
  };

  const shouldShow = (cat: CategoryFilter) => {
    if (categoryFilter === 'all') return true;
    return categoryFilter === cat;
  };

  const currentAsset = ALL_ASSETS.find(a => a.id === activeAssetId) || ALL_ASSETS[0];

  // Express / Presets Mode Inspector
  if (uiComplexity === 'presets') {
    return (
      <aside
        style={{ width: `${width}px` }}
        className="flex-shrink-0 bg-[#0e1117] border-l border-[#1f2430] flex flex-col h-full z-30 select-none overflow-hidden"
      >
        {/* Express Header Toolbar */}
        <div className="h-11 px-3 border-b border-[#1f2430] flex items-center justify-between bg-[#0a0c10] flex-shrink-0">
          <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-slate-200">
            <Zap size={13} className="text-[#ff4e2e]" />
            <span>Express Presets</span>
          </div>

          <Tooltip content="Switch to Advanced Studio Inspector (Béziers, Optics, Spatial)" side="bottom" align="end">
            <button
              type="button"
              onClick={() => onSetUiComplexity?.('advanced')}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[10px] font-mono text-slate-300 hover:text-white transition-all focus:outline-none"
            >
              <SlidersHorizontal size={11} className="text-[#ff4e2e]" />
              <span>Pro Studio</span>
            </button>
          </Tooltip>
        </div>

        {/* Scrollable Express Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1f2430] p-3 space-y-4">
          {/* Active Asset Card */}
          <div className="bg-[#12151e] border border-[#232736] rounded-xl p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Layers size={12} className="text-[#ff4e2e]" />
                Active Vector Mark
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 capitalize">
                {currentAsset.category}
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 rounded-lg p-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-[#ff4e2e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-display font-bold text-white truncate">
                  {currentAsset.name}
                </div>
                <div className="text-[9px] font-mono text-slate-500 truncate">
                  {currentAsset.viewBox} • Scalable Vector
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenAssetLibrary}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] hover:border-slate-500 text-[10px] font-mono text-slate-200 rounded-lg transition-all"
              >
                <Layers size={11} className="text-sky-400" />
                <span>Browse 27+</span>
              </button>
              <button
                type="button"
                onClick={onOpenCustomSvg}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#ff4e2e]/10 hover:bg-[#ff4e2e]/20 border border-[#ff4e2e]/30 hover:border-[#ff4e2e]/50 text-[10px] font-mono text-[#ff4e2e] rounded-lg transition-all font-semibold"
              >
                <Upload size={11} />
                <span>Import SVG</span>
              </button>
            </div>
          </div>

          {/* Quick Speed & Timing */}
          <div className="pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Activity size={12} className="text-emerald-400" />
                Motion Speed
              </span>
              <span className="text-[10px] font-mono text-[#ff4e2e] font-semibold">
                {duration.toFixed(2)}s
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '0.5x', dur: 2.2, desc: 'Slow' },
                { label: '1.0x', dur: 1.2, desc: 'Normal' },
                { label: '1.5x', dur: 0.8, desc: 'Snappy' },
                { label: '2.0x', dur: 0.5, desc: 'Rapid' }
              ].map((s) => {
                const isSelected = Math.abs(duration - s.dur) < 0.15;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => onDurationChange(s.dur)}
                    className={`py-1.5 px-1 rounded-lg text-center font-mono transition-all border ${
                      isSelected
                        ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-[#ff4e2e] font-bold shadow-sm'
                        : 'bg-[#12151e] border-[#232736] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{s.label}</div>
                    <div className="text-[8px] opacity-70">{s.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Playback Mode */}
            <div className="grid grid-cols-3 gap-1 pt-1.5">
              {[
                { value: 'loop' as const, label: 'Loop', icon: <Repeat size={11} /> },
                { value: 'once' as const, label: '1-Shot', icon: <Square size={11} /> },
                { value: 'alternate' as const, label: 'Ping-Pong', icon: <Shuffle size={11} /> }
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => onPlaybackModeChange(m.value)}
                  className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[10px] font-mono transition-all border ${
                    playbackMode === m.value
                      ? 'bg-white/10 border-white/20 text-white font-semibold'
                      : 'bg-[#12151e] border-[#232736] text-slate-400 hover:text-white'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click Aesthetic Color Themes */}
          <div className="pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Palette size={12} className="text-pink-400" />
                Aesthetic Themes
              </span>
              <span className="text-[9px] font-mono text-slate-500">1-Click Apply</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STYLES.slice(0, 8).map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onSelectStyleById?.(style.id)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#12151e] border border-[#232736] hover:border-slate-500 hover:bg-[#181c28] text-left transition-all group"
                >
                  <div className="flex -space-x-1 flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: style.fillWord }} />
                    <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: style.fillMedia }} />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-300 group-hover:text-white truncate">
                    {style.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Optics Sliders */}
          <div className="pt-3 flex flex-col gap-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              Optics & Glow
            </span>

            <SliderField
              label="Aura Glow"
              value={glowRadius}
              min={0}
              max={60}
              step={1}
              unit="px"
              decimals={0}
              tooltip="Luminescent drop shadow dispersion aura"
              onChange={onGlowRadiusChange}
            />

            <SliderField
              label="Vector Stroke"
              value={strokeWidth}
              min={0.5}
              max={4.0}
              step={0.1}
              unit="px"
              decimals={1}
              tooltip="Outline weight thickness in vector units"
              onChange={onStrokeWidthChange}
            />

            <SegmentedField
              label="Render Geometry"
              value={geometryMode}
              onChange={onGeometryModeChange}
              options={[
                { value: 'fill', label: 'Solid Fill', icon: <Box size={11} />, tooltip: 'Full solid color fill' },
                { value: 'stroke', label: 'Outline', icon: <Compass size={11} />, tooltip: 'Contour stroke line' },
                { value: 'hybrid', label: 'Hybrid', icon: <Sparkles size={11} />, tooltip: 'Both stroke and fill' }
              ]}
            />
          </div>

          {/* Quick Direct Export Hub */}
          <div className="pt-3 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Film size={12} className="text-purple-400" />
              Direct Studio Export
            </span>

            <button
              type="button"
              onClick={onOpenVideoExport}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#ff4e2e] to-[#ff263e] hover:brightness-110 text-white font-display text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff4e2e]/20 flex items-center justify-center gap-2 transition-all"
            >
              <Film size={14} />
              <span>Export 60 FPS Video (MP4/WebM)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenCodeExport}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#12151e] hover:bg-[#181c28] border border-[#232736] hover:border-slate-500 text-[10px] font-mono text-slate-200 rounded-lg transition-all"
              >
                <Code2 size={12} className="text-cyan-400" />
                <span>TSX / SVG Code</span>
              </button>

              <button
                type="button"
                onClick={copyManifest}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#12151e] hover:bg-[#181c28] border border-[#232736] hover:border-slate-500 text-[10px] font-mono text-slate-200 rounded-lg transition-all"
              >
                {copiedSnippet ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-indigo-400" />}
                <span>{copiedSnippet ? 'Copied CSS!' : 'Copy Live CSS'}</span>
              </button>
            </div>
          </div>

          {/* Advanced Studio Prompt */}
          <div className="pt-3 pb-2 text-center">
            <button
              type="button"
              onClick={() => onSetUiComplexity?.('advanced')}
              className="text-[10px] font-mono text-slate-400 hover:text-[#ff4e2e] transition-colors underline underline-offset-4"
            >
              Looking for Bézier handles, 3D tilt, or sub-layer timing? Open Pro Inspector →
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{ width: `${width}px` }}
      className="flex-shrink-0 bg-[#0e1117] border-l border-[#1f2430] flex flex-col h-full z-30 select-none overflow-hidden"
    >
      {/* 1. Header Toolbar */}
      <div className="h-11 px-3 border-b border-[#1f2430] flex items-center justify-between bg-[#0a0c10] flex-shrink-0">
        <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-slate-200">
          <Sliders size={13} className="text-[#ff4e2e]" />
          <span>Properties</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#ff4e2e]/10 text-[#ff4e2e] border border-[#ff4e2e]/20 font-medium">
            {category}
          </span>

          <Tooltip
            content={areAllOpen ? "Collapse all sections" : "Expand all sections"}
            side="bottom"
            align="end"
          >
            <button
              type="button"
              onClick={toggleAllSections}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            >
              {areAllOpen ? <ChevronsDownUp size={13} /> : <ChevronsUpDown size={13} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 2. Preset Metadata Banner */}
      <div className="px-3 py-2 border-b border-[#1f2430] bg-[#12151e]/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-black/50 border border-white/10 flex-shrink-0">
            {getMotionIcon(motionId, 12)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-display font-black text-slate-100 uppercase tracking-wide truncate">
              {motionName}
            </span>
            <span className="text-[9px] font-mono text-slate-500">60 FPS Hardware Timing</span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold text-[#ff4e2e] px-1.5 py-0.5 rounded bg-[#ff4e2e]/10 border border-[#ff4e2e]/20 flex-shrink-0">
          {duration.toFixed(2)}s
        </span>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="px-2 py-1.5 border-b border-[#1f2430] bg-[#0a0c10] flex items-center gap-1 overflow-x-auto flex-shrink-0 no-scrollbar">
        {[
          { id: 'all' as const, label: 'All', icon: <Compass size={11} className="text-slate-400" /> },
          { id: 'dynamics' as const, label: 'Timing', icon: <Sliders size={11} className="text-[#ff4e2e]" /> },
          { id: 'optics' as const, label: 'Optics', icon: <Sparkles size={11} className="text-[#00ffff]" /> },
          { id: 'spatial' as const, label: '3D', icon: <Box size={11} className="text-[#38bdf8]" /> },
          { id: 'palette' as const, label: 'Palette', icon: <Palette size={11} className="text-pink-400" /> },
          { id: 'code' as const, label: 'Code', icon: <Code2 size={11} className="text-[#a5b4fc]" /> }
        ].map((tab) => {
          const isActive = categoryFilter === tab.id;
          return (
            <Tooltip key={tab.id} content={`Show ${tab.label} section`} side="bottom">
              <button
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[9.5px] font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {tab.icon}
                {width >= 275 && <span>{tab.label}</span>}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* 4. Scrollable Sections Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1f2430]">
        
        {/* Section 1: Motion Timing & Dynamics */}
        {shouldShow('dynamics') && (
          <InspectorSection
            id="dynamics"
            title="Motion Timing"
            icon={<Sliders size={12} className="text-[#ff4e2e]" />}
            isOpen={openSections.dynamics}
            onToggle={(open) => toggleSection('dynamics', open)}
          >
            <SliderField
              label="Duration"
              value={duration}
              min={0.3}
              max={4.0}
              step={0.05}
              unit="s"
              decimals={2}
              tooltip="Full lifecycle animation duration in seconds"
              onChange={onDurationChange}
            />

            <SliderField
              label="Stagger Cascade"
              value={stagger}
              min={10}
              max={150}
              step={5}
              unit="ms"
              tooltip="Micro-delay interval between glyph keyframe triggers"
              onChange={onStaggerChange}
            />

            <SegmentedField
              label="Loop Iteration Mode"
              tooltip="Playback loop behavior: continuous, single shot, or forward-reverse"
              value={playbackMode}
              onChange={onPlaybackModeChange}
              options={[
                { value: 'loop', label: 'Loop', icon: <Repeat size={11} />, tooltip: 'Repeat continuously from start' },
                { value: 'once', label: '1-Shot', icon: <Square size={11} />, tooltip: 'Play once and pause at end' },
                { value: 'alternate', label: 'Ping-Pong', icon: <Shuffle size={11} />, tooltip: 'Play forward then reverse' }
              ]}
            />
          </InspectorSection>
        )}

        {/* Section 2: Bézier Easing Dynamics */}
        {shouldShow('dynamics') && (
          <InspectorSection
            id="bezier"
            title="Bézier Dynamics"
            icon={<Activity size={12} className="text-[#00ffff]" />}
            isOpen={openSections.bezier}
            onToggle={(open) => toggleSection('bezier', open)}
            action={
              <Tooltip content="Copy cubic-bezier formula to clipboard" side="left">
                <button
                  type="button"
                  onClick={copyBezier}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[9px] font-mono text-slate-300 rounded transition-all"
                >
                  {copiedBezier ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  <span>{copiedBezier ? 'Copied' : 'Copy'}</span>
                </button>
              </Tooltip>
            }
          >
            <BezierGraph
              bezier={bezier}
              onChange={onBezierChange}
              onPlaySound={onPlaySound}
              hideHeader={true}
            />
          </InspectorSection>
        )}

        {/* Section 3: Volumetric Optics & Aura */}
        {shouldShow('optics') && (
          <InspectorSection
            id="optics"
            title="Volumetric Optics"
            icon={<Sparkles size={12} className="text-[#ff4e2e]" />}
            isOpen={openSections.optics}
            onToggle={(open) => toggleSection('optics', open)}
          >
            <SliderField
              label="Glow Blur Radius"
              value={glowRadius}
              min={0}
              max={50}
              step={1}
              unit="px"
              tooltip="Gaussian blur radius for typographic drop-shadow"
              onChange={onGlowRadiusChange}
            />

            <SliderField
              label="Aura Bloom Intensity"
              value={glowIntensity}
              min={20}
              max={250}
              step={5}
              unit="%"
              tooltip="Alpha amplification factor for luminous lighting"
              onChange={onGlowIntensityChange}
            />

            <SegmentedField
              label="Geometry Render Mode"
              tooltip="SVG path drawing style: solid fill, contour outline, or layered hybrid"
              value={geometryMode}
              onChange={onGeometryModeChange}
              options={[
                { value: 'fill', label: 'Fill', icon: <Box size={10} />, tooltip: 'Filled Vector Geometry' },
                { value: 'stroke', label: 'Outline', icon: <Compass size={10} />, tooltip: 'Wireframe Vector Contours' },
                { value: 'hybrid', label: 'Hybrid', icon: <Sparkles size={10} />, tooltip: 'Translucent Fill with Stroke Edge' }
              ]}
            />

            {geometryMode !== 'fill' && (
              <SliderField
                label="Stroke Line Width"
                value={strokeWidth}
                min={0.3}
                max={3.5}
                step={0.1}
                unit="px"
                decimals={1}
                accentColor="#00ffff"
                tooltip="Vector contour stroke weight"
                onChange={onStrokeWidthChange}
              />
            )}
          </InspectorSection>
        )}

        {/* Section 4: 3D Spatial Perspective */}
        {shouldShow('spatial') && (
          <InspectorSection
            id="spatial"
            title="3D Spatial Perspective"
            icon={<Compass size={12} className="text-[#38bdf8]" />}
            isOpen={openSections.spatial}
            onToggle={(open) => toggleSection('spatial', open)}
            action={
              <Tooltip content="Reset 3D Pitch and Yaw to 0°" side="left">
                <button
                  type="button"
                  onClick={onResetTilt}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[9px] font-mono text-slate-400 hover:text-white rounded transition-colors"
                >
                  <RotateCcw size={9} />
                  <span>Reset</span>
                </button>
              </Tooltip>
            }
          >
            <SliderField
              label="Tilt X (Pitch)"
              value={tiltX}
              min={-35}
              max={35}
              step={1}
              unit="°"
              accentColor="#38bdf8"
              tooltip="3D perspective rotation around the X-axis"
              onChange={onTiltXChange}
            />

            <SliderField
              label="Tilt Y (Yaw)"
              value={tiltY}
              min={-35}
              max={35}
              step={1}
              unit="°"
              accentColor="#38bdf8"
              tooltip="3D perspective rotation around the Y-axis"
              onChange={onTiltYChange}
            />
          </InspectorSection>
        )}

        {/* Section 5: Brand Palette Tuning */}
        {shouldShow('palette') && (
          <InspectorSection
            id="palette"
            title="Brand Palette"
            icon={<Palette size={12} className="text-[#ff4e2e]" />}
            isOpen={openSections.palette}
            onToggle={(open) => toggleSection('palette', open)}
          >
            <div className="grid grid-cols-2 gap-2">
              <ColorSwatchField
                label="WORD"
                sublabel="Line 1"
                value={colors.word}
                tooltip="Change hex color for WORD (Line 1)"
                onChange={(val) => onColorChange('word', val)}
              />
              <ColorSwatchField
                label="LORD"
                sublabel="Line 2"
                value={colors.lord}
                tooltip="Change hex color for LORD (Line 2)"
                onChange={(val) => onColorChange('lord', val)}
              />
              <ColorSwatchField
                label="TALL D"
                sublabel="Monolith"
                value={colors.ligature}
                tooltip="Change hex color for TALL D (Monolith)"
                onChange={(val) => onColorChange('ligature', val)}
              />
              <ColorSwatchField
                label="MEDIA"
                sublabel="Sub-brand"
                value={colors.media}
                tooltip="Change hex color for MEDIA (Sub-brand)"
                onChange={(val) => onColorChange('media', val)}
              />
            </div>
          </InspectorSection>
        )}

        {/* Section 6: CSS Manifest Export */}
        {shouldShow('code') && (
          <InspectorSection
            id="code"
            title="CSS Manifest Export"
            icon={<Code2 size={12} className="text-[#a5b4fc]" />}
            isOpen={openSections.code}
            onToggle={(open) => toggleSection('code', open)}
            action={
              <Tooltip content="Copy CSS tokens to clipboard" side="left">
                <button
                  type="button"
                  onClick={copyManifest}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[9px] font-mono text-slate-300 rounded transition-all"
                >
                  {copiedSnippet ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                </button>
              </Tooltip>
            }
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-slate-400">Live Hardware Tokens</span>
              <pre className="bg-[#07080c] border border-white/5 rounded p-2 text-[8.5px] font-mono text-indigo-300 leading-relaxed overflow-x-auto whitespace-pre">
                {manifestSnippet}
              </pre>
            </div>
          </InspectorSection>
        )}

      </div>
    </aside>
  );
};
