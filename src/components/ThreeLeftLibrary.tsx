import React, { useState } from 'react';
import { 
  Box, 
  Sparkles, 
  Sun, 
  Activity, 
  Upload, 
  Check, 
  Layers,
  ChevronRight,
  Shield,
  RotateCw,
  Zap,
  Flame,
  Radio,
  Search
} from 'lucide-react';
import { 
  THREE_ASSET_PRESETS, 
  PBR_PRESETS, 
  LIGHTING_RIGS 
} from '../data/threePresets';
import { MOTIONS } from '../data/motions';
import { 
  ThreeStudioConfig, 
  PbrPresetId, 
  LightingRigId, 
  ThreeMotionMode 
} from '../types/threeStudio';

interface ThreeLeftLibraryProps {
  width: number;
  config: ThreeStudioConfig;
  activeAssetId?: string;
  onSelectAsset: (assetId: string) => void;
  onSelectPbrPreset: (presetId: PbrPresetId) => void;
  onSelectLightingRig: (rigId: LightingRigId) => void;
  onSelectMotion: (motion: ThreeMotionMode) => void;
  onOpenCustomSvgModal: () => void;
}

export const ThreeLeftLibrary: React.FC<ThreeLeftLibraryProps> = ({
  width,
  config,
  activeAssetId: explicitAssetId,
  onSelectAsset,
  onSelectPbrPreset,
  onSelectLightingRig,
  onSelectMotion,
  onOpenCustomSvgModal
}) => {
  const activeAssetId = explicitAssetId || config.activeAssetId || 'wordlord';
  const [activeTab, setActiveTab] = useState<'assets' | 'materials' | 'lighting' | 'motions'>('assets');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('All');
  const [assetSearchQuery, setAssetSearchQuery] = useState<string>('');
  const isNarrow = width < 255;

  const filteredAssets = THREE_ASSET_PRESETS.filter(a => {
    const matchCat = assetCategoryFilter === 'All' || a.category.toLowerCase() === assetCategoryFilter.toLowerCase();
    const matchSearch = !assetSearchQuery || a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) || a.description.toLowerCase().includes(assetSearchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const spatialEngineList: { id: ThreeMotionMode; name: string; desc: string; icon: any }[] = [
    { id: 'turntable', name: 'Turntable 360°', desc: 'Smooth continuous luxury turntable rotation', icon: RotateCw },
    { id: 'wave', name: 'Sinusoidal Wave', desc: 'Harmonic undulating wave across all glyphs', icon: Activity },
    { id: 'sweep', name: 'Rim Light Sweep', desc: 'Dramatic orbiting key & rim specular highlights', icon: Radio },
    { id: 'explode', name: 'Particle Explode', desc: 'Dynamic radial blast outward and reassembly', icon: Zap },
    { id: 'camera', name: 'Camera Orbit Sweep', desc: 'Cinematic floating perspective orbit', icon: Box }
  ];

  return (
    <aside 
      className="h-full bg-[#0d1017] border-r border-[#1f2430] flex flex-col z-30 select-none overflow-hidden transition-all duration-75"
      style={{ width }}
    >
      {/* Navigation Header Tabs */}
      <div className="h-10 border-b border-[#1f2430] flex items-center justify-between px-2 bg-[#090b10] flex-shrink-0">
        <div className="flex items-center gap-1 w-full">
          {[
            { id: 'assets' as const, label: 'Assets', icon: Layers },
            { id: 'materials' as const, label: 'Materials', icon: Sparkles },
            { id: 'lighting' as const, label: 'Lighting', icon: Sun },
            { id: 'motions' as const, label: 'Motions', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`flex-1 py-1 px-1.5 rounded flex items-center justify-center gap-1.5 text-xs font-mono transition-all ${
                  isSel
                    ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] font-bold border border-[#ff4e2e]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={12} strokeWidth={2} />
                {!isNarrow && <span className="text-[10.5px] truncate">{tab.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Library Body Cards */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar">
        
        {/* TAB 1: ASSETS */}
        {activeTab === 'assets' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Vector Assets ({filteredAssets.length})
              </span>
              <button
                type="button"
                onClick={onOpenCustomSvgModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#ff4e2e]/10 hover:bg-[#ff4e2e]/20 text-[#ff4e2e] text-[9.5px] font-mono border border-[#ff4e2e]/30 transition-all font-semibold"
              >
                <Upload size={10} />
                <span>Custom SVG</span>
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter 27 vector assets..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="w-full bg-[#131620] border border-[#232736] focus:border-[#ff4e2e] focus:outline-none rounded-md pl-7 pr-2.5 py-1 text-[10.5px] text-slate-200 placeholder:text-slate-500 font-mono transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {['All', 'Tech Brands', 'UI Icons', 'Monograms', 'Branded'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAssetCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-all ${
                      assetCategoryFilter === cat
                        ? 'bg-[#ff4e2e] text-white font-bold shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredAssets.map(asset => {
              const isSel = config.activeAssetId === asset.id;
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelectAsset(asset.id)}
                  className={`flex flex-col p-2.5 rounded-lg border text-left transition-all relative ${
                    isSel
                      ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                      : 'bg-[#121520] border-[#222736] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold font-display uppercase tracking-wide truncate ${isSel ? 'text-white' : 'text-slate-200'}`}>
                      {asset.name}
                    </span>
                    <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-400 border border-white/5 flex-shrink-0">
                      {asset.category}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {asset.description}
                  </span>
                  {isSel && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ff4e2e] rounded-full flex items-center justify-center shadow">
                      <Check size={7} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: PBR MATERIALS */}
        {activeTab === 'materials' && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
              PBR Material Presets
            </span>

            {PBR_PRESETS.map(pbr => {
              const isSel = config.activePbrId === pbr.id;
              return (
                <button
                  key={pbr.id}
                  onClick={() => onSelectPbrPreset(pbr.id)}
                  className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                    isSel
                      ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                      : 'bg-[#121520] border-[#222736] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {/* Dual-color Swatch */}
                      <div className="flex items-center -space-x-1">
                        <div 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: pbr.faceColor }}
                        />
                        <div 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: pbr.sideColor }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-200'}`}>
                        {pbr.name}
                      </span>
                    </div>
                    {isSel && <Check size={12} className="text-[#ff4e2e]" />}
                  </div>
                  <span className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {pbr.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 3: LIGHTING RIGS */}
        {activeTab === 'lighting' && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
              Studio Lighting Rigs
            </span>

            {LIGHTING_RIGS.map(rig => {
              const isSel = config.activeRigId === rig.id;
              return (
                <button
                  key={rig.id}
                  onClick={() => onSelectLightingRig(rig.id)}
                  className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                    isSel
                      ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                      : 'bg-[#121520] border-[#222736] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: rig.keyColor }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: rig.rimColor }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-200'}`}>
                        {rig.name}
                      </span>
                    </div>
                    {isSel && <Check size={12} className="text-[#ff4e2e]" />}
                  </div>
                  <span className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {rig.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 4: MOTIONS */}
        {activeTab === 'motions' && (
          <div className="flex flex-col gap-3">
            {/* Sync 2D Active Mode */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                Timeline Synchronization
              </span>
              <button
                onClick={() => onSelectMotion('sync2d')}
                className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                  config.motionMode === 'sync2d'
                    ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                    : 'bg-[#121520] border-[#222736] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${config.motionMode === 'sync2d' ? 'bg-[#ff4e2e] text-white' : 'bg-white/5 text-slate-400'}`}>
                      <Layers size={12} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${config.motionMode === 'sync2d' ? 'text-white' : 'text-slate-200'}`}>
                        2D Motion Synced
                      </span>
                      <span className="text-[9px] font-mono text-[#ff4e2e]">
                        Active: {config.active2dMotionId || 'typewriter'}
                      </span>
                    </div>
                  </div>
                  {config.motionMode === 'sync2d' && <Check size={12} className="text-[#ff4e2e]" />}
                </div>
                <span className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  Realtime mirrored keyframes and curve dynamics from the 2D SVG workspace into 3D extrusion.
                </span>
              </button>
            </div>

            {/* Group 1: 3D Spatial Engines */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Spatial 3D Engines
                </span>
                <span className="text-[9px] font-mono text-slate-500">{spatialEngineList.length} Engines</span>
              </div>

              {spatialEngineList.map(mot => {
                const Icon = mot.icon;
                const isSel = config.motionMode === mot.id;
                return (
                  <button
                    key={mot.id}
                    onClick={() => onSelectMotion(mot.id)}
                    className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                      isSel
                        ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                        : 'bg-[#121520] border-[#222736] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${isSel ? 'bg-[#ff4e2e] text-white' : 'bg-white/5 text-slate-400'}`}>
                          <Icon size={12} />
                        </div>
                        <span className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-200'}`}>
                          {mot.name}
                        </span>
                      </div>
                      {isSel && <Check size={12} className="text-[#ff4e2e]" />}
                    </div>
                    <span className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {mot.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Group 2: Kinetic Vector Motion Library */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Kinetic Vector Motions
                </span>
                <span className="text-[9px] font-mono text-slate-500">{MOTIONS.length} Presets</span>
              </div>

              {MOTIONS.map(mot => {
                const isSel = config.motionMode === mot.id;
                return (
                  <button
                    key={mot.id}
                    onClick={() => onSelectMotion(mot.id as ThreeMotionMode)}
                    className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                      isSel
                        ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                        : 'bg-[#121520] border-[#222736] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">
                          {mot.badge}
                        </span>
                        <span className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-200'}`}>
                          {mot.name}
                        </span>
                      </div>
                      {isSel && <Check size={12} className="text-[#ff4e2e]" />}
                    </div>
                    <span className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {mot.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
