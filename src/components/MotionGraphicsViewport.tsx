import React, { useRef, useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Palette, 
  Terminal, 
  Cpu, 
  Gauge, 
  Monitor, 
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { BentoConfig, BentoTheme } from '../types';

interface MotionGraphicsViewportProps {
  currentProgress: number; // 0.0 to 1.0
  isPlaying: boolean;
  duration: number;
  stagger: number;
  easeFormula: string;
  bentoConfig: BentoConfig;
  onUpdateBentoConfig: (updater: (prev: BentoConfig) => BentoConfig) => void;
  colors: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
}

export const MotionGraphicsViewport: React.FC<MotionGraphicsViewportProps> = ({
  currentProgress,
  isPlaying,
  duration,
  stagger,
  easeFormula,
  bentoConfig,
  onUpdateBentoConfig,
  colors
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Easing curve simulation (Cubic Bezier approx)
  const p = Math.max(0, Math.min(1, currentProgress));
  // Smooth cubic ease out
  const eased = Math.sin((p * Math.PI) / 2);

  // Card dynamics based on progress
  const cardRotateX = (1 - eased) * (bentoConfig.cardTiltX || 12) + mouseTilt.y;
  const cardRotateY = mouseTilt.x;
  const cardTranslateY = (1 - eased) * 25;
  const cardOpacity = 0.35 + 0.65 * eased;
  const letterSpacing = (1 - eased) * 12;
  const glowDrop = 12 + (1 - eased) * 24;

  // Track cursor over canvas for micro 3D tilt
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({
      x: Number((nx * 10).toFixed(2)),
      y: Number((-ny * 8).toFixed(2))
    });
  };

  const handlePointerLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  // Theme styles lookup
  const getThemeClasses = (theme: BentoTheme) => {
    switch (theme) {
      case 'cyberpunk':
        return {
          cardBg: 'bg-[#0a0f1d]/90 backdrop-blur-2xl border-[#00e5ff]/30 shadow-[0_20px_60px_rgba(0,229,255,0.15)]',
          headerBorder: 'border-[#00e5ff]/20',
          headline: 'text-white',
          subline: 'text-[#00e5ff] filter drop-shadow-[0_0_18px_rgba(0,229,255,0.8)]',
          badge: 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/30',
          tileBg: 'bg-[#00e5ff]/5 border-[#00e5ff]/15 text-slate-300',
          tileVal: 'text-[#00e5ff]'
        };
      case 'monochrome':
        return {
          cardBg: 'bg-[#121316]/95 backdrop-blur-2xl border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)]',
          headerBorder: 'border-white/10',
          headline: 'text-white',
          subline: 'text-slate-300 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]',
          badge: 'bg-white/10 text-white border-white/20',
          tileBg: 'bg-white/[0.03] border-white/10 text-slate-400',
          tileVal: 'text-white'
        };
      case 'gold':
        return {
          cardBg: 'bg-[#14110a]/90 backdrop-blur-2xl border-amber-500/30 shadow-[0_20px_60px_rgba(245,158,11,0.15)]',
          headerBorder: 'border-amber-500/20',
          headline: 'text-white',
          subline: 'text-amber-400 filter drop-shadow-[0_0_18px_rgba(245,158,11,0.8)]',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          tileBg: 'bg-amber-500/5 border-amber-500/15 text-slate-300',
          tileVal: 'text-amber-400'
        };
      case 'slate':
        return {
          cardBg: 'bg-[#0f172a]/90 backdrop-blur-2xl border-slate-700/60 shadow-[0_20px_60px_rgba(0,0,0,0.8)]',
          headerBorder: 'border-slate-800',
          headline: 'text-white',
          subline: 'text-[#ff4e2e] filter drop-shadow-[0_0_16px_rgba(255,78,46,0.7)]',
          badge: 'bg-slate-800 text-sky-400 border-slate-700',
          tileBg: 'bg-slate-800/40 border-slate-700/40 text-slate-300',
          tileVal: 'text-sky-400'
        };
      case 'obsidian':
      default:
        return {
          cardBg: 'bg-[#090b0e]/95 backdrop-blur-2xl border-[#1e2433] shadow-[0_25px_70px_rgba(0,0,0,0.95)]',
          headerBorder: 'border-[#1a202c]',
          headline: 'text-white',
          subline: 'text-[#ff4e2e] filter drop-shadow-[0_0_20px_rgba(255,78,46,0.85)]',
          badge: 'bg-[#ff4e2e]/10 text-[#ff4e2e] border-[#ff4e2e]/25',
          tileBg: 'bg-white/[0.02] border-white/5 text-slate-300',
          tileVal: 'text-[#ff4e2e]'
        };
    }
  };

  const themeStyles = getThemeClasses(bentoConfig.theme || 'obsidian');

  const handleCopyCode = () => {
    const codeSnippet = `<div class="bento-card ${bentoConfig.theme}">
  <h1>${bentoConfig.headlineWord} ${bentoConfig.headlineLord}</h1>
  <span>${bentoConfig.sublineText}</span>
</div>`;
    navigator.clipboard.writeText(codeSnippet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  return (
    <main 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="flex-1 flex flex-col relative bg-[#07090c] overflow-hidden select-none"
    >
      {/* Viewport Floating Top Ribbon */}
      <div className="h-8 bg-[#0b0e14]/90 backdrop-blur border-b border-[#1c222e] flex items-center justify-between px-3 text-[11px] font-mono z-20">
        <div className="flex items-center gap-2.5 text-slate-400">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ff4e2e]/10 text-[#ff4e2e] border border-[#ff4e2e]/20 font-bold text-[10px]">
            <Sparkles size={11} />
            <span>MOTION GRAPHICS</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-mono text-[10px] hidden sm:inline">
            SaaS Notion Bento Card UI Graphic Studio
          </span>
        </div>

        {/* Viewport Controls: Themes & Zoom */}
        <div className="flex items-center gap-2">
          {/* Theme Quick Switcher */}
          <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
            {(['obsidian', 'slate', 'cyberpunk', 'monochrome', 'gold'] as BentoTheme[]).map(t => (
              <button
                key={t}
                onClick={() => onUpdateBentoConfig(prev => ({ ...prev, theme: t }))}
                title={`Theme: ${t.toUpperCase()}`}
                className={`px-1.5 py-0.5 rounded text-[9.5px] uppercase font-mono transition-all ${
                  bentoConfig.theme === t
                    ? 'bg-[#ff4e2e] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-3.5 bg-white/10" />

          {/* Reset View */}
          <button
            onClick={() => { setScale(1.0); setMouseTilt({ x: 0, y: 0 }); }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Reset Perspective & Scale"
          >
            <RotateCcw size={10} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Center Canvas Stage */}
      <div className="flex-1 relative flex items-center justify-center p-6 sm:p-10 overflow-hidden studio-grid-pattern">
        
        {/* Subtle Ambient Background Radial Glow */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 filter blur-[100px] transition-all duration-700"
          style={{
            background: bentoConfig.theme === 'cyberpunk' 
              ? '#00e5ff' 
              : bentoConfig.theme === 'gold' 
              ? '#ffd700' 
              : '#ff4e2e'
          }}
        />

        {/* Interactive Bento Card Root with 3D Perspective */}
        <div 
          style={{
            transform: `perspective(1200px) rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg) translateY(${cardTranslateY}px) scale(${scale})`,
            opacity: cardOpacity,
            transition: isPlaying ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out'
          }}
          className={`w-full max-w-xl rounded-2xl p-6 sm:p-7 border relative transition-all duration-500 shadow-2xl ${themeStyles.cardBg}`}
        >
          {/* Card Top Window Chrome */}
          <div className={`flex items-center justify-between border-b pb-4 mb-5 ${themeStyles.headerBorder}`}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[11px] font-mono text-slate-400 ml-2 tracking-tight">
                {bentoConfig.docPath || '/workspace/docs/wordlord.motion'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${themeStyles.badge}`}>
                {bentoConfig.tagText || 'Notion Preset v2.4'}
              </span>
              <button
                onClick={handleCopyCode}
                title="Copy Card Markup"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Dynamic Typography Showcase */}
          <div className="text-center py-6 sm:py-8 relative">
            {/* Embedded Mini Vector Mark Glow */}
            {bentoConfig.showMark !== false && (
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-lg">
                  <svg width="22" height="22" viewBox="0 0 25 26" fill="none">
                    <path d="M1.45 7.32L0 0.5h1.5l.68 5.2h.03L2.94.5h1.3l.72 5.2h.03l.68-5.2h1.36L6.1 7.32H5.06l-.53-4.5h-.03l-.68 4.5H2.6L1.45 7.32z" fill={colors.word} />
                    <path d="M1.06 25.26V17.3h1.14l.84 5.7h.03l.83-5.7h1.14v7.96h-.88v-5.63h-.03l-.96 5.66H2.84l-.96-5.66h-.03v5.63H1.06z" fill={colors.media} />
                  </svg>
                </div>
              </div>
            )}

            {/* Headline: WORD / LORD */}
            <h1 
              style={{
                letterSpacing: `${letterSpacing}px`,
                transition: isPlaying ? 'none' : 'letter-spacing 0.25s ease-out'
              }}
              className={`text-4xl sm:text-5xl font-black tracking-tight font-mono uppercase leading-none drop-shadow-2xl ${themeStyles.headline}`}
            >
              {bentoConfig.headlineWord || 'WORD'}<br />
              <span className="opacity-90">{bentoConfig.headlineLord || 'LORD'}</span>
            </h1>

            {/* Subline: MEDIA with Laser Glow */}
            <div 
              style={{
                filter: `drop-shadow(0 0 ${glowDrop}px ${
                  bentoConfig.theme === 'cyberpunk' 
                    ? 'rgba(0,229,255,0.85)' 
                    : bentoConfig.theme === 'gold'
                    ? 'rgba(245,158,11,0.85)'
                    : 'rgba(255,78,46,0.85)'
                })`,
                transition: isPlaying ? 'none' : 'filter 0.25s ease-out'
              }}
              className={`text-2xl sm:text-3xl font-black tracking-[0.25em] uppercase mt-2.5 ${themeStyles.subline}`}
            >
              {bentoConfig.sublineText || 'MEDIA'}
            </div>
          </div>

          {/* Bento Style 4-Tile Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2 pt-4 border-t border-white/5 text-xs font-mono">
            <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${themeStyles.tileBg}`}>
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Cpu size={11} />
                <span className="text-[9px] uppercase tracking-wider">ENGINE</span>
              </div>
              <span className={`font-bold text-[10px] truncate ${themeStyles.tileVal}`}>
                {bentoConfig.engineSpec || 'Hardware PBR'}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${themeStyles.tileBg}`}>
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Gauge size={11} />
                <span className="text-[9px] uppercase tracking-wider">DYNAMICS</span>
              </div>
              <span className={`font-bold text-[10px] truncate ${themeStyles.tileVal}`}>
                {bentoConfig.dynamicsSpec || 'Cubic Hermite'}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${themeStyles.tileBg}`}>
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Monitor size={11} />
                <span className="text-[9px] uppercase tracking-wider">FRAMERATE</span>
              </div>
              <span className={`font-bold text-[10px] truncate ${themeStyles.tileVal}`}>
                {bentoConfig.fpsSpec || '60 FPS Lock'}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${themeStyles.tileBg}`}>
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Layers size={11} />
                <span className="text-[9px] uppercase tracking-wider">RESOLUTION</span>
              </div>
              <span className={`font-bold text-[10px] truncate ${themeStyles.tileVal}`}>
                {bentoConfig.resSpec || '4K Vector'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Deck */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#0e1118]/90 backdrop-blur-md border border-[#1e2433] rounded-lg p-1 z-20 shadow-xl text-xs">
        <button
          onClick={() => setScale(s => Math.max(0.6, Number((s - 0.1).toFixed(2))))}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
          title="Zoom Out"
        >
          <ZoomOut size={12} />
        </button>
        <span className="text-[10px] font-mono text-slate-300 min-w-[36px] text-center font-bold">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(s => Math.min(2.0, Number((s + 0.1).toFixed(2))))}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
          title="Zoom In"
        >
          <ZoomIn size={12} />
        </button>

        <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

        <span className="text-[9.5px] font-mono text-slate-400 px-1">
          Tilt: ({Math.round(cardRotateX)}°, {Math.round(cardRotateY)}°)
        </span>
      </div>
    </main>
  );
};
