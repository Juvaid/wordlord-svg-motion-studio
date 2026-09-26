import React, { useState } from 'react';
import { 
  Box, 
  Sparkles, 
  Sun, 
  Eye, 
  EyeOff, 
  Sliders, 
  RotateCcw, 
  Layers, 
  Move, 
  Maximize2, 
  Camera, 
  Globe, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Lock,
  Unlock,
  Folder,
  Edit3,
  Check,
  Scale,
  Ratio,
  Lightbulb,
  Crosshair,
  SlidersHorizontal,
  Flame,
  Activity,
  Layers2,
  Upload,
  Film
} from 'lucide-react';
import { 
  InspectorSection, 
  SliderField, 
  ColorSwatchField,
  ToggleField,
  DropdownField
} from './inspector';
import { 
  ThreeStudioConfig, 
  ThreePart, 
  EnvironmentScenePreset,
  ProceduralTextureType,
  SocialFramingAspect,
  PbrPresetId,
  LightingRigId
} from '../types/threeStudio';
import { PBR_PRESETS, LIGHTING_RIGS } from '../data/threePresets';

interface ThreeRightInspectorProps {
  width: number;
  config: ThreeStudioConfig;
  parts: ThreePart[];
  onUpdateConfig: (partial: Partial<ThreeStudioConfig>) => void;
  onUpdatePart: (index: number, partial: Partial<ThreePart>) => void;
  onResetParts: () => void;
  onResetTransforms: () => void;
  onOpenExportModal?: () => void;
  onOpenCustomSvg?: () => void;
  onOpenAssetLibrary?: () => void;
  onSetUiComplexity?: (complexity: 'presets' | 'advanced') => void;
  onSelectPbrPreset?: (presetId: PbrPresetId) => void;
  onSelectRigPreset?: (rigId: LightingRigId) => void;
}

export const ThreeRightInspector: React.FC<ThreeRightInspectorProps> = ({
  width,
  config,
  parts,
  onUpdateConfig,
  onUpdatePart,
  onResetParts,
  onResetTransforms,
  onOpenExportModal,
  onOpenCustomSvg,
  onOpenAssetLibrary,
  onSetUiComplexity,
  onSelectPbrPreset,
  onSelectRigPreset
}) => {
  const [expandedPartIdx, setExpandedPartIdx] = useState<number | null>(null);
  const [isEditingGroupName, setIsEditingGroupName] = useState<boolean>(false);
  const [groupNameInput, setGroupNameInput] = useState<string>(config.groupName || 'Asset Group');

  const isNarrow = width < 305;

  const envOptions: { id: EnvironmentScenePreset; label: string }[] = [
    { id: 'studio', label: 'Studio Dark' },
    { id: 'radial', label: 'Spotlight' },
    { id: 'cyber', label: 'Cyber Void' },
    { id: 'luxury', label: 'Sunset' },
    { id: 'obsidian', label: 'OLED Black' },
    { id: 'transparent', label: 'Alpha Trans' }
  ];

  const proceduralOptions: { value: ProceduralTextureType; label: string }[] = [
    { value: 'none', label: 'Smooth Polished' },
    { value: 'fluted', label: 'Fluted Architectural Ribs' },
    { value: 'brushed', label: 'Anisotropic Brushed Metal' },
    { value: 'carbon', label: 'Carbon Fiber Weave' },
    { value: 'diamond', label: 'Diamond Knurl Grid' },
    { value: 'noise', label: 'Per-Pixel Bump Noise' }
  ];

  const framingOptions: { value: SocialFramingAspect; label: string }[] = [
    { value: 'free', label: 'Free Viewport' },
    { value: '16:9', label: '16:9 Landscape (YouTube)' },
    { value: '9:16', label: '9:16 Vertical (Reels/TikTok)' },
    { value: '1:1', label: '1:1 Square (Feed)' },
    { value: '21:9', label: '21:9 Cinema Master' }
  ];

  const handleToggleStackEffect = (key: keyof typeof config.stackedEffects) => {
    const current = config.stackedEffects || {
      hoverFloat: false,
      turntableSpin: false,
      harmonicWave: false,
      lightSweep: false,
      gyroTilt: false,
      sync2dMotion: false
    };
    onUpdateConfig({
      stackedEffects: {
        ...current,
        [key]: !current[key]
      }
    });
  };

  const handleSaveGroupName = () => {
    if (groupNameInput.trim()) {
      onUpdateConfig({ groupName: groupNameInput.trim() });
    }
    setIsEditingGroupName(false);
  };

  const handleUniformScale = (val: number) => {
    onUpdateConfig({
      scaleX: val,
      scaleY: val,
      scaleZ: val
    });
  };

  const uniformScaleValue = Number(((config.scaleX + config.scaleY + config.scaleZ) / 3).toFixed(2)) || 1.0;

  // 3D Express / Presets Mode Inspector
  if (config.uiComplexity === 'presets') {
    return (
      <aside 
        className="h-full bg-[#0d1017] border-l border-[#1f2430] flex flex-col z-30 select-none overflow-hidden transition-all duration-75"
        style={{ width }}
      >
        {/* Express Header */}
        <div className="h-10 border-b border-[#1f2430] flex items-center justify-between px-3 bg-[#090b10] flex-shrink-0">
          <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200">
            <Zap size={13} className="text-[#ff4e2e]" />
            <span>3D Express Presets</span>
          </div>
          <button
            onClick={() => onSetUiComplexity?.('advanced')}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[10px] font-mono text-slate-300 hover:text-white transition-all focus:outline-none"
          >
            <SlidersHorizontal size={11} className="text-[#ff4e2e]" />
            <span>Pro Studio</span>
          </button>
        </div>

        {/* Express Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 custom-scrollbar">
          {/* Active 3D Model Card */}
          <div className="bg-[#121622] border border-[#22283a] rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Box size={12} className="text-[#ff4e2e]" />
                Active 3D Asset
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                {parts.length} Extruded Parts
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 rounded-lg p-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#ff4e2e]/20 to-transparent border border-[#ff4e2e]/30 flex items-center justify-center flex-shrink-0">
                <Layers size={14} className="text-[#ff4e2e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-display font-bold text-white truncate">
                  {config.groupName || '3D Vector Mark'}
                </div>
                <div className="text-[9px] font-mono text-slate-500 truncate">
                  PBR Hardware Extrusion • 60 FPS
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

          {/* 1-Click PBR Materials */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                PBR Material Presets
              </span>
              <span className="text-[9px] font-mono text-slate-500">Hardware PBR</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {PBR_PRESETS.map((pbr) => {
                const isActive = config.activePbrId === pbr.id;
                return (
                  <button
                    key={pbr.id}
                    type="button"
                    onClick={() => onSelectPbrPreset?.(pbr.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                      isActive
                        ? 'bg-[#ff4e2e]/15 border-[#ff4e2e] text-white'
                        : 'bg-[#121622] border-[#22283a] text-slate-300 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-black/40 shadow-sm"
                      style={{ backgroundColor: pbr.faceColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono font-medium truncate leading-tight">{pbr.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1-Click Lighting Rigs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Sun size={12} className="text-sky-400" />
                Lighting Studio Rigs
              </span>
              <span className="text-[9px] font-mono text-slate-500">3-Point Rig</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {LIGHTING_RIGS.map((rig) => {
                const isActive = config.activeRigId === rig.id;
                return (
                  <button
                    key={rig.id}
                    type="button"
                    onClick={() => onSelectRigPreset?.(rig.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-left transition-all border ${
                      isActive
                        ? 'bg-sky-500/15 border-sky-400 text-white'
                        : 'bg-[#121622] border-[#22283a] text-slate-300 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <Lightbulb size={11} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
                    <span className="text-[10px] font-mono font-medium truncate">{rig.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick 3D Motion Stacks */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" />
              Kinetic 3D Motion Stacks
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleStackEffect('turntableSpin')}
                className={`flex items-center justify-between p-2 rounded-lg border text-[10px] font-mono transition-all ${
                  config.stackedEffects?.turntableSpin
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#121622] border-[#22283a] text-slate-400 hover:text-white'
                }`}
              >
                <span>360° Turntable</span>
                {config.stackedEffects?.turntableSpin && <Check size={11} />}
              </button>

              <button
                type="button"
                onClick={() => handleToggleStackEffect('hoverFloat')}
                className={`flex items-center justify-between p-2 rounded-lg border text-[10px] font-mono transition-all ${
                  config.stackedEffects?.hoverFloat
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#121622] border-[#22283a] text-slate-400 hover:text-white'
                }`}
              >
                <span>Idle Hover Float</span>
                {config.stackedEffects?.hoverFloat && <Check size={11} />}
              </button>

              <button
                type="button"
                onClick={() => handleToggleStackEffect('harmonicWave')}
                className={`flex items-center justify-between p-2 rounded-lg border text-[10px] font-mono transition-all ${
                  config.stackedEffects?.harmonicWave
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#121622] border-[#22283a] text-slate-400 hover:text-white'
                }`}
              >
                <span>Harmonic Wave</span>
                {config.stackedEffects?.harmonicWave && <Check size={11} />}
              </button>

              <button
                type="button"
                onClick={() => handleToggleStackEffect('lightSweep')}
                className={`flex items-center justify-between p-2 rounded-lg border text-[10px] font-mono transition-all ${
                  config.stackedEffects?.lightSweep
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#121622] border-[#22283a] text-slate-400 hover:text-white'
                }`}
              >
                <span>Specular Sweep</span>
                {config.stackedEffects?.lightSweep && <Check size={11} />}
              </button>
            </div>
          </div>

          {/* Quick Geometry Sliders */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Scale size={12} className="text-indigo-400" />
              Extrusion Geometry
            </span>

            <SliderField
              label="Extrude Depth"
              value={config.depth}
              min={4}
              max={96}
              step={1}
              unit="px"
              tooltip="Z-axis physical extrusion thickness"
              onChange={(v) => onUpdateConfig({ depth: v })}
            />

            <SliderField
              label="Bevel Radius"
              value={config.bevelThickness}
              min={0}
              max={8}
              step={0.2}
              unit="px"
              decimals={1}
              tooltip="Curvature bevel fillet along outer vector perimeter"
              onChange={(v) => onUpdateConfig({ bevelThickness: v })}
            />

            <SliderField
              label="Mesh Scale"
              value={config.meshScale}
              min={0.4}
              max={2.5}
              step={0.05}
              unit="x"
              decimals={2}
              tooltip="Uniform 3D scale multiplier"
              onChange={(v) => onUpdateConfig({ meshScale: v })}
            />
          </div>

          {/* Direct 3D Export Hub */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Film size={12} className="text-purple-400" />
              Direct 3D Studio Export
            </span>

            <button
              type="button"
              onClick={onOpenExportModal}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#ff4e2e] to-[#ff263e] hover:brightness-110 text-white font-display text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff4e2e]/20 flex items-center justify-center gap-2 transition-all"
            >
              <Film size={14} />
              <span>Export 3D Video / GLTF Asset</span>
            </button>
          </div>

          {/* Switch to Advanced Studio Tip */}
          <div className="pt-2 pb-2 text-center">
            <button
              type="button"
              onClick={() => onSetUiComplexity?.('advanced')}
              className="text-[10px] font-mono text-slate-400 hover:text-[#ff4e2e] transition-colors underline underline-offset-4"
            >
              Need fluted textures, camera focal length, or sub-part editing? Open Pro Studio →
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className="h-full bg-[#0d1017] border-l border-[#1f2430] flex flex-col z-30 select-none overflow-hidden transition-all duration-75"
      style={{ width }}
    >
      {/* Inspector Header */}
      <div className="h-10 border-b border-[#1f2430] flex items-center justify-between px-3 bg-[#090b10] flex-shrink-0">
        <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200">
          <Box size={13} className="text-[#ff4e2e]" />
          <span>{isNarrow ? '3D Props' : '3D Properties & PBR'}</span>
        </div>
        <button
          onClick={onResetTransforms}
          title="Reset Blender Transforms (Alt+G / Alt+R)"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 text-[9.5px] font-mono"
        >
          <RotateCcw size={11} />
          {!isNarrow && <span>Reset</span>}
        </button>
      </div>

      {/* Inspector Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
        
        {/* COLLECTIVE ASSET GROUP CARD (Spline / Blender Outliner Header) */}
        <div className="bg-[#121622] border border-[#22283a] rounded-xl p-2.5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Folder size={13} className="text-[#ff4e2e] flex-shrink-0" />
              {isEditingGroupName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveGroupName()}
                    className="bg-black/60 border border-[#ff4e2e] rounded px-1.5 py-0.5 text-xs font-mono text-white outline-none w-28"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveGroupName}
                    className="p-1 bg-[#ff4e2e] text-white rounded hover:bg-[#ff6144]"
                  >
                    <Check size={11} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-100 truncate max-w-[130px]">
                    {config.groupName || 'Asset Group'}
                  </span>
                  <button
                    onClick={() => {
                      setGroupNameInput(config.groupName || 'Asset Group');
                      setIsEditingGroupName(true);
                    }}
                    title="Rename Asset Group"
                    className="p-0.5 text-slate-500 hover:text-slate-300 rounded"
                  >
                    <Edit3 size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Group Lock & Eye Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onUpdateConfig({ isGroupLocked: !config.isGroupLocked })}
                title={config.isGroupLocked ? 'Group is Locked (Click to Unlock)' : 'Lock Group Transforms'}
                className={`p-1.5 rounded transition-colors ${
                  config.isGroupLocked
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {config.isGroupLocked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>

              <button
                onClick={() => onUpdateConfig({ isGroupVisible: config.isGroupVisible === false ? true : false })}
                title={config.isGroupVisible === false ? 'Show Asset Group' : 'Hide Asset Group'}
                className={`p-1.5 rounded transition-colors ${
                  config.isGroupVisible === false
                    ? 'text-slate-600 hover:text-slate-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {config.isGroupVisible === false ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4e2e]" />
              <span>Collective Unit</span>
            </span>
            <span className="text-slate-400 font-semibold">
              {parts.length} Glyphs
            </span>
          </div>
        </div>

        {/* SECTION 1: COLLECTIVE OBJECT TRANSFORMS (Blender N-Panel) */}
        <InspectorSection id="3d-transforms" title={isNarrow ? "Transforms" : "Collective Transforms (N-Panel)"} icon={<Move size={12} className="text-[#ff4e2e]" />}>
          {config.isGroupLocked && (
            <div className="flex items-center gap-1.5 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[10px] font-mono text-amber-300">
              <Lock size={11} className="flex-shrink-0" />
              <span>Group locked. Unlock above to modify collective position, rotation, or scale.</span>
            </div>
          )}

          {/* Uniform Scale Slider */}
          <div className={`flex flex-col gap-1 pb-1.5 border-b border-white/5 ${config.isGroupLocked ? 'opacity-40 pointer-events-none' : ''}`}>
            <SliderField
              label={isNarrow ? "Uniform Scale" : "Uniform Scale (All Axes)"}
              value={uniformScaleValue}
              min={0.2}
              max={3.0}
              step={0.05}
              unit="x"
              onChange={handleUniformScale}
            />
          </div>

          {/* Location / Position */}
          <div className={`flex flex-col gap-1.5 pb-1 border-b border-white/5 ${config.isGroupLocked ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                {isNarrow ? "Location" : "Location / Position (X, Y, Z)"}
              </span>
              <button
                onClick={() => onUpdateConfig({ posX: 0, posY: 0, posZ: 0 })}
                title="Reset Position (Alt+G)"
                className="text-[9px] font-mono text-slate-500 hover:text-slate-300"
              >
                Alt+G
              </button>
            </div>
            <div className={`grid ${isNarrow ? 'grid-cols-1' : 'grid-cols-3'} gap-1.5`}>
              <SliderField
                label={isNarrow ? "Position X" : "Pos X"}
                value={config.posX || 0}
                min={-200}
                max={200}
                step={2}
                unit="px"
                onChange={(val) => onUpdateConfig({ posX: val })}
              />
              <SliderField
                label={isNarrow ? "Position Y" : "Pos Y"}
                value={config.posY || 0}
                min={-200}
                max={200}
                step={2}
                unit="px"
                onChange={(val) => onUpdateConfig({ posY: val })}
              />
              <SliderField
                label={isNarrow ? "Position Z" : "Pos Z"}
                value={config.posZ || 0}
                min={-200}
                max={200}
                step={2}
                unit="px"
                onChange={(val) => onUpdateConfig({ posZ: val })}
              />
            </div>
          </div>

          {/* Rotation / Angle */}
          <div className={`flex flex-col gap-1.5 pb-1 border-b border-white/5 ${config.isGroupLocked ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                {isNarrow ? "Rotation" : "Rotation / Angle (X, Y, Z)"}
              </span>
              <button
                onClick={() => onUpdateConfig({ rotX: 0, rotY: 0, rotZ: 0 })}
                title="Reset Rotation (Alt+R)"
                className="text-[9px] font-mono text-slate-500 hover:text-slate-300"
              >
                Alt+R
              </button>
            </div>
            <div className={`grid ${isNarrow ? 'grid-cols-1' : 'grid-cols-3'} gap-1.5`}>
              <SliderField
                label={isNarrow ? "Rotate X" : "Rot X"}
                value={config.rotX || 0}
                min={-180}
                max={180}
                step={1}
                unit="°"
                onChange={(val) => onUpdateConfig({ rotX: val })}
              />
              <SliderField
                label={isNarrow ? "Rotate Y" : "Rot Y"}
                value={config.rotY || 0}
                min={-180}
                max={180}
                step={1}
                unit="°"
                onChange={(val) => onUpdateConfig({ rotY: val })}
              />
              <SliderField
                label={isNarrow ? "Rotate Z" : "Rot Z"}
                value={config.rotZ || 0}
                min={-180}
                max={180}
                step={1}
                unit="°"
                onChange={(val) => onUpdateConfig({ rotZ: val })}
              />
            </div>
          </div>

          {/* Discrete Scale Axes */}
          <div className={`flex flex-col gap-1.5 ${config.isGroupLocked ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              {isNarrow ? "Scale Dimensions" : "Individual Scale Dimensions"}
            </span>
            <div className={`grid ${isNarrow ? 'grid-cols-1' : 'grid-cols-3'} gap-1.5`}>
              <SliderField
                label="Scale X"
                value={config.scaleX || 1.0}
                min={0.2}
                max={3.0}
                step={0.05}
                onChange={(val) => onUpdateConfig({ scaleX: val })}
              />
              <SliderField
                label="Scale Y"
                value={config.scaleY || 1.0}
                min={0.2}
                max={3.0}
                step={0.05}
                onChange={(val) => onUpdateConfig({ scaleY: val })}
              />
              <SliderField
                label="Scale Z"
                value={config.scaleZ || 1.0}
                min={0.2}
                max={3.0}
                step={0.05}
                onChange={(val) => onUpdateConfig({ scaleZ: val })}
              />
            </div>
          </div>
        </InspectorSection>

        {/* SECTION 2: SOCIAL FRAMING & VIEWPORT MASKS */}
        <InspectorSection id="3d-framing" title={isNarrow ? "Social Framing" : "Social Video Framing & Guides"} icon={<Ratio size={12} className="text-[#ff4e2e]" />}>
          <DropdownField<SocialFramingAspect>
            label="Aspect Ratio"
            value={config.framingAspect || 'free'}
            options={framingOptions}
            onChange={(val) => onUpdateConfig({ 
              framingAspect: val, 
              showFramingMask: val !== 'free' 
            })}
          />
          <ToggleField
            label="Show Framing Overlay Mask"
            checked={config.showFramingMask || false}
            onChange={(checked) => onUpdateConfig({ showFramingMask: checked })}
          />
        </InspectorSection>

        {/* SECTION 3: EFFECT STACKING & 2D MOTION SYNCHRONIZER */}
        <InspectorSection id="3d-effect-stack" title={isNarrow ? "Effect Stack" : "Effect Stacking & 2D Sync"} icon={<Zap size={12} className="text-[#ff4e2e]" />}>
          <div className="flex flex-col gap-1.5">
            {[
              { key: 'sync2dMotion' as const, label: 'Sync 2D Motion', desc: `Follows 2D timing (${config.active2dMotionId || 'Typewriter'})` },
              { key: 'turntableSpin' as const, label: 'Turntable 360° Spin', desc: 'Smooth continuous luxury turntable rotation' },
              { key: 'harmonicWave' as const, label: 'Harmonic Z-Wave', desc: 'Phase-offset undulating wave across glyphs' },
              { key: 'hoverFloat' as const, label: 'Organic Hover Float', desc: 'Natural vertical breathing buoyancy' },
              { key: 'lightSweep' as const, label: 'Orbiting Light Sweep', desc: 'Dynamic rotating key & rim specular glints' },
              { key: 'gyroTilt' as const, label: 'Cursor Gyro Tracking', desc: 'Perspective tilts towards mouse cursor' }
            ].map(eff => {
              const active = config.stackedEffects ? config.stackedEffects[eff.key] : false;
              return (
                <button
                  key={eff.key}
                  type="button"
                  onClick={() => handleToggleStackEffect(eff.key)}
                  className={`flex flex-col p-2 rounded-lg border text-left transition-all ${
                    active
                      ? 'bg-[#ff4e2e]/15 border-[#ff4e2e] shadow-sm'
                      : 'bg-[#121520] border-[#22283a] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10.5px] font-bold ${active ? 'text-white' : 'text-slate-300'}`}>
                      {eff.label}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${active ? 'bg-[#ff4e2e] text-white' : 'bg-white/5 text-slate-500'}`}>
                      {active ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  {!isNarrow && (
                    <span className="text-[8.5px] text-slate-400 mt-0.5">
                      {eff.desc}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </InspectorSection>

        {/* SECTION 4: ENVIRONMENT & BACKGROUND (Blender World) */}
        <InspectorSection id="3d-environment" title="Environment & Scene" icon={<Globe size={12} className="text-[#ff4e2e]" />}>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              Atmospheric Preset
            </span>
            <div className={`grid ${isNarrow ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5`}>
              {envOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateConfig({ envPreset: opt.id })}
                  className={`py-1.5 px-1 rounded text-center border text-[9.5px] font-mono transition-colors truncate ${
                    config.envPreset === opt.id
                      ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-white font-bold'
                      : 'bg-[#141722] border-[#222736] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid ${isNarrow ? 'grid-cols-1' : 'grid-cols-2'} gap-2 pt-1`}>
            <SliderField
              label="Floor Roughness"
              value={config.floorRoughness || 0.65}
              min={0.05}
              max={1.0}
              step={0.05}
              onChange={(val) => onUpdateConfig({ floorRoughness: val })}
            />
            <SliderField
              label="Floor Metalness"
              value={config.floorMetalness || 0.35}
              min={0.0}
              max={1.0}
              step={0.05}
              onChange={(val) => onUpdateConfig({ floorMetalness: val })}
            />
          </div>
        </InspectorSection>

        {/* SECTION 5: CAMERA OPTICS */}
        <InspectorSection id="3d-camera" title="Camera Optics (Lens)" icon={<Camera size={12} className="text-[#ff4e2e]" />}>
          <SliderField
            label="Field of View (FOV)"
            value={config.fov || 45}
            min={20}
            max={85}
            step={1}
            unit="°"
            onChange={(val) => onUpdateConfig({ fov: val })}
          />
          <SliderField
            label="Camera Distance"
            value={config.cameraDistance || 420}
            min={180}
            max={850}
            step={10}
            unit="px"
            onChange={(val) => onUpdateConfig({ cameraDistance: val })}
          />
        </InspectorSection>

        {/* SECTION 6: EXTRUSION & BEVEL */}
        <InspectorSection id="3d-geometry" title="Extrusion & Bevel" icon={<Box size={12} className="text-[#ff4e2e]" />}>
          <SliderField
            label="Extrude Depth"
            value={config.depth}
            min={2}
            max={80}
            step={1}
            unit="px"
            onChange={(val) => onUpdateConfig({ depth: val })}
          />
          <SliderField
            label="Bevel Thickness"
            value={config.bevelThickness}
            min={0}
            max={12}
            step={0.2}
            unit="px"
            onChange={(val) => onUpdateConfig({ bevelThickness: val })}
          />
          <SliderField
            label="Bevel Radius / Size"
            value={config.bevelSize}
            min={0}
            max={10}
            step={0.2}
            unit="px"
            onChange={(val) => onUpdateConfig({ bevelSize: val })}
          />
          <SliderField
            label="Bevel Segments"
            value={config.bevelSegments}
            min={1}
            max={8}
            step={1}
            onChange={(val) => onUpdateConfig({ bevelSegments: val })}
          />
          <SliderField
            label="Master Scale"
            value={config.meshScale}
            min={0.5}
            max={2.0}
            step={0.05}
            onChange={(val) => onUpdateConfig({ meshScale: val })}
          />
        </InspectorSection>

        {/* SECTION 7: PBR SURFACE & PROCEDURAL TEXTURES */}
        <InspectorSection id="3d-pbr" title="PBR Surface & Textures" icon={<Sparkles size={12} className="text-[#ff4e2e]" />}>
          <div className={`grid ${isNarrow ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            <ColorSwatchField
              label="Face Color"
              value={config.faceColor}
              onChange={(color) => onUpdateConfig({ faceColor: color })}
            />
            <ColorSwatchField
              label="Side / Bevel Color"
              value={config.sideColor}
              onChange={(color) => onUpdateConfig({ sideColor: color })}
            />
          </div>

          <SliderField
            label="Metallic Factor"
            value={config.metalness}
            min={0}
            max={1}
            step={0.02}
            onChange={(val) => onUpdateConfig({ metalness: val })}
          />
          <SliderField
            label="Roughness"
            value={config.roughness}
            min={0.02}
            max={1}
            step={0.02}
            onChange={(val) => onUpdateConfig({ roughness: val })}
          />
          <SliderField
            label="Clearcoat Glaze"
            value={config.clearcoat}
            min={0}
            max={1}
            step={0.05}
            onChange={(val) => onUpdateConfig({ clearcoat: val })}
          />
          <SliderField
            label="Glass Transmission"
            value={config.transmission}
            min={0}
            max={1}
            step={0.05}
            onChange={(val) => onUpdateConfig({ transmission: val })}
          />

          {/* Procedural Surface Texture Generator */}
          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            <DropdownField<ProceduralTextureType>
              label="Procedural Bump Texture"
              value={config.proceduralTexture || (config.flutingEnabled ? 'fluted' : 'none')}
              options={proceduralOptions}
              onChange={(val) => onUpdateConfig({ 
                proceduralTexture: val,
                flutingEnabled: val === 'fluted'
              })}
            />

            {(config.proceduralTexture && config.proceduralTexture !== 'none' || config.flutingEnabled) && (
              <SliderField
                label="Texture Relief / Bump"
                value={config.fluteScale || 0.45}
                min={0.05}
                max={1.5}
                step={0.05}
                onChange={(val) => onUpdateConfig({ fluteScale: val })}
              />
            )}
          </div>
        </InspectorSection>

        {/* SECTION 8: STUDIO LIGHTING */}
        <InspectorSection id="3d-lighting" title="Studio Lighting Rig" icon={<Sun size={12} className="text-[#ff4e2e]" />}>
          <div className={`grid ${isNarrow ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            <ColorSwatchField
              label="Key Light"
              value={config.keyColor}
              onChange={(color) => onUpdateConfig({ keyColor: color })}
            />
            <ColorSwatchField
              label="Rim Light"
              value={config.rimColor}
              onChange={(color) => onUpdateConfig({ rimColor: color })}
            />
          </div>

          <SliderField
            label="Key Light Power"
            value={config.keyIntensity}
            min={0}
            max={6}
            step={0.1}
            onChange={(val) => onUpdateConfig({ keyIntensity: val })}
          />

          <SliderField
            label="Rim Light Power"
            value={config.rimIntensity}
            min={0}
            max={8}
            step={0.1}
            onChange={(val) => onUpdateConfig({ rimIntensity: val })}
          />

          <SliderField
            label="Fill Light Power"
            value={config.fillIntensity}
            min={0}
            max={4}
            step={0.1}
            onChange={(val) => onUpdateConfig({ fillIntensity: val })}
          />
          <SliderField
            label="Ambient Light"
            value={config.ambientIntensity}
            min={0}
            max={1.5}
            step={0.05}
            onChange={(val) => onUpdateConfig({ ambientIntensity: val })}
          />

          <ToggleField
            label="Studio Floor & Grid"
            checked={config.showFloor}
            onChange={(checked) => onUpdateConfig({ showFloor: checked })}
          />
        </InspectorSection>

        {/* SECTION 9: UNREAL BLOOM OPTICS */}
        <InspectorSection id="3d-bloom" title="Unreal Bloom Post-Processing" icon={<Sparkles size={12} className="text-[#ff4e2e]" />}>
          <ToggleField
            label="Glow Bloom Engine"
            checked={config.bloomEnabled}
            onChange={(checked) => onUpdateConfig({ bloomEnabled: checked })}
          />

          {config.bloomEnabled && (
            <>
              <SliderField
                label="Bloom Strength"
                value={config.bloomStrength}
                min={0.1}
                max={3.0}
                step={0.05}
                onChange={(val) => onUpdateConfig({ bloomStrength: val })}
              />
              <SliderField
                label="Bloom Diffusion Radius"
                value={config.bloomRadius}
                min={0.1}
                max={1.5}
                step={0.05}
                onChange={(val) => onUpdateConfig({ bloomRadius: val })}
              />
              <SliderField
                label="Luminosity Threshold"
                value={config.bloomThreshold}
                min={0.1}
                max={1.0}
                step={0.05}
                onChange={(val) => onUpdateConfig({ bloomThreshold: val })}
              />
            </>
          )}
        </InspectorSection>

        {/* SECTION 10: MULTI-PART / LETTERS BREAKDOWN */}
        <InspectorSection id="3d-parts" title={`Parts Breakdown (${parts.length} Glyphs)`} icon={<Layers size={12} className="text-[#ff4e2e]" />}>
          <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {parts.map((part, pIdx) => {
              const isExpanded = expandedPartIdx === pIdx;
              return (
                <div 
                  key={part.id} 
                  className={`flex flex-col rounded-lg border transition-all ${
                    isExpanded 
                      ? 'bg-[#141824] border-[#2b3346]' 
                      : 'bg-[#10131d] border-[#1e2434] hover:border-slate-500'
                  }`}
                >
                  {/* Card Header Row */}
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => onUpdatePart(pIdx, { visible: !part.visible })}
                        title={part.visible ? 'Hide Part' : 'Show Part'}
                        className={`p-1 rounded transition-colors ${
                          part.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600'
                        }`}
                      >
                        {part.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>

                      {/* Part Color Swatch */}
                      <div 
                        className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: part.faceColor }}
                      />

                      <span className={`text-[10.5px] font-mono font-medium truncate ${part.visible ? 'text-slate-200' : 'text-slate-500'}`}>
                        {part.name}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedPartIdx(isExpanded ? null : pIdx)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Expanded Sub-Controls for this Part */}
                  {isExpanded && (
                    <div className="p-2 pt-0 border-t border-white/5 flex flex-col gap-2 mt-1">
                      <SliderField
                        label="Depth Offset"
                        value={part.depthOffset}
                        min={-20}
                        max={40}
                        step={1}
                        unit="px"
                        onChange={(val) => onUpdatePart(pIdx, { depthOffset: val })}
                      />
                      <SliderField
                        label="Phase Stagger Delay"
                        value={part.phaseDelay}
                        min={0}
                        max={1.5}
                        step={0.02}
                        unit="s"
                        onChange={(val) => onUpdatePart(pIdx, { phaseDelay: val })}
                      />
                      <ColorSwatchField
                        label="Custom Part Color"
                        value={part.faceColor}
                        onChange={(color) => onUpdatePart(pIdx, { faceColor: color })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </InspectorSection>

      </div>
    </aside>
  );
};
