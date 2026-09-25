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
  ChevronsUpDown
} from 'lucide-react';
import { BezierGraph } from './BezierGraph';
import { BezierPoints, PlaybackMode, GeometryMode } from '../types';
import { Tooltip } from './Tooltip';
import { 
  InspectorSection, 
  SliderField, 
  SegmentedField, 
  ColorSwatchField 
} from './inspector';

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

type CategoryFilter = 'all' | 'dynamics' | 'optics' | 'spatial' | 'palette' | 'code';

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
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-display font-black text-slate-100 uppercase tracking-wide truncate">
            {motionName}
          </span>
          <span className="text-[9px] font-mono text-slate-500">60 FPS Hardware Timing</span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-[#ff4e2e] px-1.5 py-0.5 rounded bg-[#ff4e2e]/10 border border-[#ff4e2e]/20 flex-shrink-0">
          {duration.toFixed(2)}s
        </span>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="px-2 py-1.5 border-b border-[#1f2430] bg-[#0a0c10] flex items-center gap-1 overflow-x-auto flex-shrink-0 no-scrollbar">
        {[
          { id: 'all' as const, label: 'All' },
          { id: 'dynamics' as const, label: 'Timing' },
          { id: 'optics' as const, label: 'Optics' },
          { id: 'spatial' as const, label: '3D' },
          { id: 'palette' as const, label: 'Palette' },
          { id: 'code' as const, label: 'Code' }
        ].map((tab) => {
          const isActive = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-2 py-1 rounded text-[9.5px] font-mono whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
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
