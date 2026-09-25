import React, { useMemo } from 'react';
import { 
  Clapperboard, 
  Palette, 
  Shapes, 
  Search, 
  Info,
  Check,
  Compass,
  ScanEye,
  Activity,
  Box,
  Cpu,
  Waves,
  Sparkles,
  Type,
  Component,
  Columns3
} from 'lucide-react';
import { MOTIONS } from '../data/motions';
import { STYLES } from '../data/styles';
import { GLYPHS } from '../data/glyphs';
import { MotionPreset, StylePreset } from '../types';
import { Tooltip } from './Tooltip';
import { getMotionIcon, getStyleIcon } from '../utils/presetIcons';

interface LeftLibraryProps {
  activeTab: 'motions' | 'styles' | 'glyphs';
  activeMotionId: string;
  activeStyleId: string;
  searchQuery: string;
  categoryFilter: string;
  width: number;
  onTabChange: (tab: 'motions' | 'styles' | 'glyphs') => void;
  onSelectMotion: (motion: MotionPreset) => void;
  onSelectStyle: (style: StylePreset) => void;
  onSearchChange: (q: string) => void;
  onCategoryFilterChange: (cat: string) => void;
  onShowInfo: (title: string, desc: string, specs?: Record<string, string>) => void;
}

export const LeftLibrary: React.FC<LeftLibraryProps> = ({
  activeTab,
  activeMotionId,
  activeStyleId,
  searchQuery,
  categoryFilter,
  width,
  onTabChange,
  onSelectMotion,
  onSelectStyle,
  onSearchChange,
  onCategoryFilterChange,
  onShowInfo
}) => {
  // Width breakpoints for ultra-narrow responsive adaptation
  const isIconOnlyTabs = width < 255;
  const isCompactTabs = width >= 255 && width < 305;
  const isSingleColGrid = width < 285;

  const motionCategories = [
    { name: 'All', icon: <Compass size={11} className="text-slate-400" /> },
    { name: 'Reveal', icon: <ScanEye size={11} className="text-[#ff4e2e]" /> },
    { name: 'Kinetic', icon: <Activity size={11} className="text-[#f97316]" /> },
    { name: '3D', icon: <Box size={11} className="text-[#38bdf8]" /> },
    { name: 'Glitch', icon: <Cpu size={11} className="text-[#22c55e]" /> },
    { name: 'Ambient', icon: <Waves size={11} className="text-[#a855f7]" /> },
    { name: 'Optics', icon: <Sparkles size={11} className="text-[#00ffff]" /> }
  ];

  const filteredMotions = useMemo(() => {
    return MOTIONS.filter(m => {
      const matchCat = categoryFilter === 'All' || m.badge.toLowerCase() === categoryFilter.toLowerCase();
      const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  const filteredStyles = useMemo(() => {
    return STYLES.filter(s => {
      return !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const filteredGlyphs = useMemo(() => {
    return GLYPHS.filter(g => {
      return !searchQuery || g.char.toLowerCase().includes(searchQuery.toLowerCase()) || g.group.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const renderThumbnailMark = (fillPrimary = '#ffffff', fillMedia = '#ff4e2e', stroke = 'none', strokeW = '0px') => (
    <svg width="24" height="24" viewBox="0 0 25 26" fill="none" className="block overflow-visible drop-shadow">
      <g>
        <path d="M1.457 7.322L0.014 0.567L0 0.433h0.476l0.52 0.01l0.518 0.443L2.193 5.65h0.029L2.943 0.443h0.52l0.779 0.01l0.72 5.2h0.028l0.678-5.2h0.878l-0.923 6.414h-1.025l-0.678-4.527h-0.029l-0.678 4.527H1.457z" fill={fillPrimary} stroke={stroke} strokeWidth={strokeW} />
        <path d="M12.46 6.95c-0.413 0.317-1.01 0.475-1.789 0.475s-1.375-0.158-1.789-0.475C8.469 6.634 8.262 6.187 8.262 5.61V1.815c0-0.578 0.207-1.024 0.62-1.34C9.296 0.158 9.892 0 10.671 0s1.376 0.158 1.789 0.474c0.414 0.317 0.621 0.763 0.621 1.341v3.795c0 0.577-0.207 1.024-0.621 1.34zm-2.611-1.268c0 0.474 0.274 0.712 0.822 0.712s0.822-0.238 0.822-0.712V1.743c0-0.474-0.274-0.712-0.822-0.712s-0.822 0.238-0.822 0.712v3.939z" fill={fillPrimary} stroke={stroke} strokeWidth={strokeW} />
        <path d="M14.66 7.322V0.103h1.847c0.817 0 1.414 0.138 1.789 0.413 0.375 0.268 0.563 0.684 0.563 1.247v0.444c0 0.75-0.347 1.224-1.039 1.423v0.02c0.702 0.159 1.053 0.668 1.053 1.527v1.268c0 0.227 0.015 0.389 0.044 0.485 0.019 0.069 0.029 0.114 0.029 0.135 0 0.172-0.144 0.258-0.433 0.258h-0.635c-0.336 0-0.519-0.103-0.548-0.31-0.028-0.123-0.043-0.316-0.043-0.577v-1.32c0-0.33-0.077-0.56-0.23-0.69-0.145-0.13-0.4-0.196-0.766-0.196h-0.548v2.733H14.66zm1.082-4.125h0.577c0.317 0 0.553-0.058 0.707-0.175 0.163-0.117 0.245-0.313 0.245-0.588v-0.557c0-0.495-0.269-0.742-0.808-0.742h-0.72v2.062z" fill={fillPrimary} stroke={stroke} strokeWidth={strokeW} />
      </g>
      <g>
        <path d="M1.212 15.7V8.482h0.577v6.187h2.612v1.031H1.212z" fill={fillPrimary} stroke={stroke} strokeWidth={strokeW} />
        <path d="M10.56 15.33c-0.414 0.316-1.01 0.474-1.79 0.474s-1.375-0.158-1.789-0.474c-0.413-0.317-0.62-0.764-0.62-1.341v-3.795c0-0.578 0.207-1.024 0.62-1.341 0.414-0.316 1.01-0.474 1.79-0.474s1.376 0.158 1.789 0.474c0.414 0.317 0.62 0.763 0.62 1.341v3.795c0 0.577-0.206 1.024-0.62 1.341zm-2.612-1.268c0 0.474 0.274 0.711 0.822 0.711s0.822-0.237 0.822-0.711v-3.94c0-0.474-0.274-0.711-0.822-0.711s-0.822 0.237-0.822 0.712v3.939z" fill={fillPrimary} stroke={stroke} strokeWidth={strokeW} />
        <path d="M13.623 15.7V8.482h1.847c0.817 0 1.414 0.137 1.789 0.412 0.375 0.268 0.563 0.684 0.563 1.248v0.443c0 0.75-0.347 1.224-1.039 1.424v0.02c0.702 0.159 1.053 0.668 1.053 1.527v1.268c0 0.227 0.015 0.389 0.044 0.485 0.019 0.069 0.029 0.114 0.029 0.135 0 0.172-0.144 0.258-0.433 0.258h-0.635c-0.336 0-0.519-0.103-0.548-0.31-0.028-0.123-0.043-0.316-0.043-0.577v-1.32c0-0.33-0.077-0.56-0.23-0.69-0.145-0.13-0.4-0.196-0.766-0.196h-0.548v2.733h-0.577zm1.082-4.125h0.577c0.317 0 0.553-0.058 0.707-0.175 0.163-0.117 0.245-0.313 0.245-0.588v-0.557c0-0.495-0.269-0.742-0.808-0.742h-0.72v2.062z" fill={fillPrimary} stroke={stroke} strokeWidth={strokeW} />
      </g>
      <g>
        <path d="M20.51 15.7V0.102h1.919c1.577 0 2.366 0.595 2.366 1.784v12.03c0 1.189-0.789 1.784-2.366 1.784H20.51zm1.082-1.031h0.808c0.539 0 0.808-0.234 0.808-0.701V1.835c0-0.468-0.269-0.701-0.808-0.701h-0.808v13.535z" fill={fillPrimary} stroke={stroke} strokeWidth={strokeW} />
      </g>
      <g>
        <path d="M1.066 25.261V17.3h1.142l0.835 5.7h0.025l0.835-5.7h1.142v7.96h-0.885v-5.632h-0.026l-0.962 5.666H2.838l-0.963-5.666h-0.026v5.632h-0.783z" fill={fillMedia} stroke={stroke} strokeWidth={strokeW} />
        <path d="M8.127 25.261V17.3h2.952v1.139H9.089v2.105h1.489v1.138H9.089v2.446h1.99v1.138H8.127z" fill={fillMedia} stroke={stroke} strokeWidth={strokeW} />
        <path d="M12.943 25.261V17.3h1.707c1.404 0 2.105 0.656 2.105 1.968v4.027c0 1.312-0.701 1.968-2.105 1.968h-1.707zm0.963-1.138h0.719c0.479 0 0.718-0.258 0.718-0.774v-4.141c0-0.516-0.239-0.774-0.718-0.774h-0.719v5.689z" fill={fillMedia} stroke={stroke} strokeWidth={strokeW} />
        <path d="M18.311 25.261V17.3h0.963v7.961h-0.963z" fill={fillMedia} stroke={stroke} strokeWidth={strokeW} />
        <path d="M20.575 25.261l1.348-7.961h1.09l1.348 7.961h-0.912l-0.192-1.218h-1.656l-0.193 1.218h-0.833zm1.245-2.64h1.322l-0.655-3.936h-0.025l-0.642 3.936z" fill={fillMedia} stroke={stroke} strokeWidth={strokeW} />
      </g>
    </svg>
  );

  return (
    <aside
      style={{ width: `${width}px` }}
      className="flex-shrink-0 bg-[#0e1117] border-r border-[#1f2430] flex flex-col h-full z-30 select-none overflow-hidden"
    >
      {/* 1. Adaptive Tab Switcher Header */}
      <div className="flex bg-[#0a0c10] border-b border-[#1f2430] p-1.5 gap-1 flex-shrink-0">
        <Tooltip content="Motion Choreography Presets (12)" side="bottom" delay={350}>
          <button
            type="button"
            onClick={() => onTabChange('motions')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'motions'
                ? 'bg-[#181c28] text-white border border-[#2b3245] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clapperboard size={14} className={activeTab === 'motions' ? 'text-[#ff4e2e]' : 'text-slate-400'} />
            {!isIconOnlyTabs && (
              <span className="truncate">
                {isCompactTabs ? 'Motions' : 'Motions (12)'}
              </span>
            )}
          </button>
        </Tooltip>

        <Tooltip content="Optical Styles & Palettes (8)" side="bottom" delay={350}>
          <button
            type="button"
            onClick={() => onTabChange('styles')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'styles'
                ? 'bg-[#181c28] text-white border border-[#2b3245] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette size={14} className={activeTab === 'styles' ? 'text-[#38bdf8]' : 'text-slate-400'} />
            {!isIconOnlyTabs && (
              <span className="truncate">
                {isCompactTabs ? 'Styles' : 'Styles (8)'}
              </span>
            )}
          </button>
        </Tooltip>

        <Tooltip content="Sub-pixel Vector Glyphs (17)" side="bottom" delay={350}>
          <button
            type="button"
            onClick={() => onTabChange('glyphs')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'glyphs'
                ? 'bg-[#181c28] text-white border border-[#2b3245] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shapes size={14} className={activeTab === 'glyphs' ? 'text-emerald-400' : 'text-slate-400'} />
            {!isIconOnlyTabs && (
              <span className="truncate">
                {isCompactTabs ? 'Glyphs' : 'Glyphs (17)'}
              </span>
            )}
          </button>
        </Tooltip>
      </div>

      {/* 2. Search Bar & Category Filter Pills */}
      <div className="p-2.5 border-b border-[#1f2430] flex flex-col gap-2 flex-shrink-0 bg-[#0c0e14]">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={width < 260 ? 'Search...' : `Filter ${activeTab}...`}
            className="w-full bg-[#131620] border border-[#222736] focus:border-[#ff4e2e] focus:outline-none rounded-md pl-7 pr-2.5 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 transition-colors"
          />
        </div>

        {/* Category Pills with Unique Icons */}
        {activeTab === 'motions' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            {motionCategories.map(cat => {
              const isActive = categoryFilter === cat.name;
              return (
                <Tooltip key={cat.name} content={`Filter by: ${cat.name}`} side="bottom" delay={300}>
                  <button
                    type="button"
                    onClick={() => onCategoryFilterChange(cat.name)}
                    className={`flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-[#ff4e2e] font-semibold'
                        : 'bg-[#141722] border-[#222736] text-slate-400 hover:text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.name}</span>
                  </button>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Cards Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
        {/* Motions Tab */}
        {activeTab === 'motions' && (
          <div className={`grid gap-2 ${isSingleColGrid ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {filteredMotions.map(motion => {
              const isSelected = activeMotionId === motion.id;
              const motionIcon = getMotionIcon(motion.id, 11);

              // Single Column Horizontal Row (Ultra-Narrow Panel: No clipping!)
              if (isSingleColGrid) {
                return (
                  <div
                    key={motion.id}
                    onClick={() => onSelectMotion(motion)}
                    className={`group relative bg-[#131620] border rounded-lg p-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-[#ff4e2e] bg-[#ff4e2e]/[0.08] shadow-md shadow-[#ff4e2e]/10'
                        : 'border-[#202534] hover:border-slate-500 hover:bg-[#181c28]'
                    }`}
                  >
                    {/* Compact Stage Thumbnail */}
                    <div className="w-12 h-12 flex-shrink-0 bg-[#07080c] border border-white/5 rounded-md flex items-center justify-center overflow-hidden relative">
                      <div className="scale-75 group-hover:scale-90 transition-transform duration-300">
                        {renderThumbnailMark()}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-[#ff4e2e] rounded-full flex items-center justify-center shadow">
                          <Check size={8} strokeWidth={3} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Metadata: Unclipped Title & Specs */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-100 font-display truncate">
                          {motion.name}
                        </span>
                        <Tooltip content="View Specification Details" side="top">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onShowInfo(motion.name, motion.desc, motion.specs);
                            }}
                            className="p-0.5 text-slate-500 hover:text-slate-300 rounded flex-shrink-0"
                            aria-label="View Specifications"
                          >
                            <Info size={11} />
                          </button>
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-300 bg-white/5 px-1.5 py-0.2 rounded border border-white/10">
                          {motionIcon}
                          <span>{motion.badge}</span>
                        </span>
                        <span className="text-slate-500">{motion.defaultDuration}s</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard 2-Column Grid (Width >= 285px)
              return (
                <div
                  key={motion.id}
                  onClick={() => onSelectMotion(motion)}
                  className={`group relative bg-[#131620] border rounded-lg p-2.5 cursor-pointer flex flex-col gap-2 transition-all ${
                    isSelected
                      ? 'border-[#ff4e2e] bg-[#ff4e2e]/[0.08] shadow-lg shadow-[#ff4e2e]/10'
                      : 'border-[#202534] hover:border-slate-500 hover:bg-[#181c28]'
                  }`}
                >
                  {/* Card Stage Thumbnail */}
                  <div className="h-16 bg-[#07080c] border border-white/5 rounded-md flex items-center justify-center overflow-hidden relative">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {renderThumbnailMark()}
                    </div>
                    {/* Unique Motion Icon Watermark Badge */}
                    <div className="absolute top-1.5 left-1.5 p-1 rounded bg-black/60 border border-white/10 flex items-center justify-center shadow">
                      {motionIcon}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#ff4e2e] rounded-full flex items-center justify-center shadow">
                        <Check size={9} strokeWidth={3} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Card Meta */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 font-display truncate">
                        {motion.name}
                      </span>
                      <Tooltip content="View Specification Details" side="top">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowInfo(motion.name, motion.desc, motion.specs);
                          }}
                          className="p-0.5 text-slate-500 hover:text-slate-300 rounded"
                          aria-label="View Specifications"
                        >
                          <Info size={11} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-0.5">
                      <span className="text-[#ff4e2e] font-semibold flex items-center gap-1">
                        {motion.badge}
                      </span>
                      <span>{motion.defaultDuration}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div className={`grid gap-2 ${isSingleColGrid ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {filteredStyles.map(style => {
              const isSelected = activeStyleId === style.id;
              const styleIcon = getStyleIcon(style.id, 11);

              if (isSingleColGrid) {
                return (
                  <div
                    key={style.id}
                    onClick={() => onSelectStyle(style)}
                    className={`group relative bg-[#131620] border rounded-lg p-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-[#38bdf8] bg-[#38bdf8]/[0.08] shadow-md shadow-[#38bdf8]/10'
                        : 'border-[#202534] hover:border-slate-500 hover:bg-[#181c28]'
                    }`}
                  >
                    <div
                      className="w-12 h-12 flex-shrink-0 rounded-md border border-white/5 flex items-center justify-center overflow-hidden relative"
                      style={{ background: style.bgGradient }}
                    >
                      <div className="scale-75 group-hover:scale-90 transition-transform duration-300">
                        {renderThumbnailMark(style.fillWord, style.fillMedia, style.strokeColor, `${style.strokeWidth}px`)}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-[#38bdf8] rounded-full flex items-center justify-center shadow">
                          <Check size={8} strokeWidth={3} className="text-black" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-100 font-display truncate">
                          {style.name}
                        </span>
                        <Tooltip content="View Style Details" side="top">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onShowInfo(style.name, style.desc, { 'Category': style.category, 'Glow Radius': `${style.glowRadius}px` });
                            }}
                            className="p-0.5 text-slate-500 hover:text-slate-300 rounded flex-shrink-0"
                            aria-label="View Style Specs"
                          >
                            <Info size={11} />
                          </button>
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-300 bg-white/5 px-1.5 py-0.2 rounded border border-white/10">
                          {styleIcon}
                          <span>{style.category}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={style.id}
                  onClick={() => onSelectStyle(style)}
                  className={`group relative bg-[#131620] border rounded-lg p-2.5 cursor-pointer flex flex-col gap-2 transition-all ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/[0.08] shadow-lg shadow-[#38bdf8]/10'
                      : 'border-[#202534] hover:border-slate-500 hover:bg-[#181c28]'
                  }`}
                >
                  <div
                    className="h-16 rounded-md border border-white/5 flex items-center justify-center overflow-hidden relative"
                    style={{ background: style.bgGradient }}
                  >
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {renderThumbnailMark(style.fillWord, style.fillMedia, style.strokeColor, `${style.strokeWidth}px`)}
                    </div>
                    <div className="absolute top-1.5 left-1.5 p-1 rounded bg-black/60 border border-white/10 flex items-center justify-center shadow">
                      {styleIcon}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#38bdf8] rounded-full flex items-center justify-center shadow">
                        <Check size={9} strokeWidth={3} className="text-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 font-display truncate">
                        {style.name}
                      </span>
                      <Tooltip content="View Style Details" side="top">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowInfo(style.name, style.desc, { 'Category': style.category, 'Glow Radius': `${style.glowRadius}px` });
                          }}
                          className="p-0.5 text-slate-500 hover:text-slate-300 rounded"
                          aria-label="View Style Specs"
                        >
                          <Info size={11} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-0.5">
                      <span className="text-[#38bdf8]">{style.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Glyphs Tab */}
        {activeTab === 'glyphs' && (
          <div className={`grid gap-2 ${width < 250 ? 'grid-cols-2' : width > 360 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {filteredGlyphs.map(glyph => {
              const groupIcon = glyph.group === 'WORD' ? <Type size={9} /> :
                                glyph.group === 'LORD' ? <Component size={9} /> :
                                glyph.group === 'LIGATURE' ? <Columns3 size={9} /> :
                                <Sparkles size={9} className="text-[#ff4e2e]" />;

              return (
                <Tooltip key={glyph.id} content={`Glyph ${glyph.char} (${glyph.group})`} side="top">
                  <div
                    className="bg-[#131620] border border-[#202534] hover:border-slate-500 rounded-lg p-2 flex flex-col items-center gap-1.5 transition-all cursor-default"
                  >
                    <div className="w-full h-12 bg-[#07080c] rounded flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 25 26" fill="none">
                        <path d={glyph.path} fill={glyph.group === 'MEDIA' ? '#ff4e2e' : '#ffffff'} />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-slate-200 font-mono">{glyph.char}</span>
                      <span className="text-[8px] font-mono text-slate-500 flex items-center gap-0.5">
                        {groupIcon}
                        <span>{glyph.group}</span>
                      </span>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
