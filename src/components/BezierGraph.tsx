import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Copy, Check, Activity, Sparkles } from 'lucide-react';
import { BezierPoints } from '../types';

interface BezierGraphProps {
  bezier: BezierPoints;
  onChange: (points: BezierPoints) => void;
  onPlaySound?: () => void;
  hideHeader?: boolean;
}

const PRESET_CURVES = [
  { name: 'Snap', p1: { x: 0.16, y: 1.0 }, p2: { x: 0.3, y: 1.0 }, path: 'M2 16 C 6 2, 10 2, 28 2' },
  { name: 'Decel', p1: { x: 0.25, y: 1.0 }, p2: { x: 0.5, y: 1.0 }, path: 'M2 16 C 8 4, 15 2, 28 2' },
  { name: 'Quint', p1: { x: 0.22, y: 1.0 }, p2: { x: 0.36, y: 1.0 }, path: 'M2 16 C 7 2, 12 2, 28 2' },
  { name: 'Slam', p1: { x: 0.18, y: 0.89 }, p2: { x: 0.32, y: 1.28 }, path: 'M2 16 C 6 4, 10 -2, 28 2' },
  { name: 'Back', p1: { x: 0.36, y: 0.0 }, p2: { x: 0.66, y: -0.56 }, path: 'M2 16 C 12 18, 18 22, 28 2' },
  { name: 'Sine', p1: { x: 0.45, y: 0.0 }, p2: { x: 0.55, y: 1.0 }, path: 'M2 16 C 14 16, 16 2, 28 2' },
  { name: 'Linear', p1: { x: 0.0, y: 0.0 }, p2: { x: 1.0, y: 1.0 }, path: 'M2 16 L 28 2' },
  { name: 'Bounce', p1: { x: 0.34, y: 1.56 }, p2: { x: 0.64, y: 1.0 }, path: 'M2 16 C 10 -4, 18 2, 28 2' }
];

export const BezierGraph: React.FC<BezierGraphProps> = ({
  bezier,
  onChange,
  onPlaySound,
  hideHeader = false
}) => {
  const [copied, setCopied] = useState(false);
  const [activeHandle, setActiveHandle] = useState<'p1' | 'p2' | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG coordinate conversions
  // W=240, H=140. Margin: left=24, right=24, top=20, bottom=24.
  // Usable width = 192, usable height = 96.
  const toSvgX = (x: number) => 24 + x * 192;
  const toSvgY = (y: number) => 116 - y * 96;
  const toNormX = (sx: number) => Math.max(0, Math.min(1, (sx - 24) / 192));
  const toNormY = (sy: number) => Math.max(-0.4, Math.min(1.4, (116 - sy) / 96));

  const p1s = { x: toSvgX(bezier.p1.x), y: toSvgY(bezier.p1.y) };
  const p2s = { x: toSvgX(bezier.p2.x), y: toSvgY(bezier.p2.y) };
  const start = { x: toSvgX(0), y: toSvgY(0) };
  const end = { x: toSvgX(1), y: toSvgY(1) };

  const curvePath = `M ${start.x} ${start.y} C ${p1s.x} ${p1s.y}, ${p2s.x} ${p2s.y}, ${end.x} ${end.y}`;
  const areaPath = `M ${start.x} ${start.y} C ${p1s.x} ${p1s.y}, ${p2s.x} ${p2s.y}, ${end.x} ${end.y} L ${end.x} ${start.y} Z`;
  const formula = `cubic-bezier(${bezier.p1.x.toFixed(2)}, ${bezier.p1.y.toFixed(2)}, ${bezier.p2.x.toFixed(2)}, ${bezier.p2.y.toFixed(2)})`;

  const handlePointerDown = (handle: 'p1' | 'p2') => (e: React.PointerEvent) => {
    e.preventDefault();
    setActiveHandle(handle);
    if (onPlaySound) onPlaySound();
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!activeHandle || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 240 / rect.width;
    const scaleY = 140 / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;

    const nx = Math.round(toNormX(sx) * 100) / 100;
    const ny = Math.round(toNormY(sy) * 100) / 100;

    if (activeHandle === 'p1') {
      onChange({ ...bezier, p1: { x: nx, y: ny } });
    } else {
      onChange({ ...bezier, p2: { x: nx, y: ny } });
    }
  }, [activeHandle, bezier, onChange]);

  const handlePointerUp = useCallback(() => {
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [activeHandle, handlePointerMove, handlePointerUp]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const selectPreset = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    onChange({ p1, p2 });
    if (onPlaySound) onPlaySound();
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Title & Copy (only rendered if hideHeader is false) */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-slate-200">
            <Activity size={12} className="text-[#00ffff]" />
            <span>Bézier Curve Graph</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-[10px] font-mono text-slate-300 rounded transition-all"
          >
            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}

      {/* SVG Canvas Graph */}
      <div className="relative bg-[#07080c] border border-[#202534] rounded-md overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 240 140"
          className="w-full h-[140px] block select-none touch-none"
        >
          <defs>
            <pattern id="bezier-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            <linearGradient id="curve-stroke-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="50%" stopColor="#ff4e2e" />
              <stop offset="100%" stopColor="#ff8566" />
            </linearGradient>
            <linearGradient id="curve-fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4e2e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00ffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect x="0" y="0" width="240" height="140" fill="#07080c" />
          <rect x="24" y="20" width="192" height="96" fill="url(#bezier-grid-pattern)" />

          {/* Reference Calibration Lines */}
          <line x1="24" y1="20" x2="216" y2="20" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="24" y1="116" x2="216" y2="116" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <line x1="24" y1="20" x2="24" y2="116" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <line x1="216" y1="20" x2="216" y2="116" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="3,3" />

          {/* Linear Diagonal Guide */}
          <line x1="24" y1="116" x2="216" y2="20" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="4,4" />

          {/* Axis Labels */}
          <text x="26" y="16" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="monospace">1.0 VAL</text>
          <text x="26" y="128" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="monospace">0.0 TIME</text>
          <text x="202" y="128" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="monospace">1.0</text>

          {/* Shaded Area Under Curve */}
          <path d={areaPath} fill="url(#curve-fill-gradient)" />

          {/* Cubic Bézier Stroke Curve */}
          <path d={curvePath} fill="none" stroke="url(#curve-stroke-gradient)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Handle Lines */}
          <line x1={start.x} y1={start.y} x2={p1s.x} y2={p1s.y} stroke="#00ffff" strokeWidth="1.5" strokeDasharray="2,2" />
          <line x1={end.x} y1={end.y} x2={p2s.x} y2={p2s.y} stroke="#ff4e2e" strokeWidth="1.5" strokeDasharray="2,2" />

          {/* Handle 1 Grip (Cyan) */}
          <circle
            cx={p1s.x}
            cy={p1s.y}
            r="14"
            fill="transparent"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown('p1')}
          />
          <circle cx={p1s.x} cy={p1s.y} r="8" fill="rgba(0, 255, 255, 0.25)" pointerEvents="none" />
          <circle cx={p1s.x} cy={p1s.y} r="4.5" fill="#00ffff" stroke="#ffffff" strokeWidth="1.5" pointerEvents="none" />

          {/* Handle 2 Grip (Red) */}
          <circle
            cx={p2s.x}
            cy={p2s.y}
            r="14"
            fill="transparent"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown('p2')}
          />
          <circle cx={p2s.x} cy={p2s.y} r="8" fill="rgba(255, 78, 46, 0.25)" pointerEvents="none" />
          <circle cx={p2s.x} cy={p2s.y} r="4.5" fill="#ff4e2e" stroke="#ffffff" strokeWidth="1.5" pointerEvents="none" />
        </svg>

        {/* Live Coordinate Badge */}
        <div className="absolute bottom-1.5 left-2 bg-[#0e1118]/90 border border-[#232736] rounded px-1.5 py-0.5 text-[8.5px] font-mono font-medium text-[#ff4e2e] shadow pointer-events-none">
          {formula}
        </div>
      </div>

      {/* Physical Acceleration Velocity Strip */}
      <div className="bg-black/40 border border-[#1f2432] rounded p-2 flex flex-col gap-1.5">
        <span className="text-[7.5px] font-mono text-slate-400 tracking-wider uppercase">
          Physical Velocity Simulation
        </span>
        <div className="h-3 bg-black/60 rounded-full border border-white/5 relative overflow-hidden">
          <div
            className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-[#ff4e2e] shadow-[0_0_8px_rgba(255,78,46,0.8)] border border-white animate-[puckSlide_1.5s_infinite]"
            style={{ animationTimingFunction: formula }}
          />
        </div>
      </div>

      {/* Visual Curve Presets Grid */}
      <div className="grid grid-cols-4 gap-1">
        {PRESET_CURVES.map((preset) => {
          const isActive =
            Math.abs(bezier.p1.x - preset.p1.x) < 0.05 &&
            Math.abs(bezier.p1.y - preset.p1.y) < 0.05 &&
            Math.abs(bezier.p2.x - preset.p2.x) < 0.05 &&
            Math.abs(bezier.p2.y - preset.p2.y) < 0.05;

          return (
            <button
              key={preset.name}
              onClick={() => selectPreset(preset.p1, preset.p2)}
              className={`flex flex-col items-center gap-0.5 py-1 px-0.5 rounded border transition-all ${
                isActive
                  ? 'bg-[#ff4e2e]/15 border-[#ff4e2e] text-white font-semibold'
                  : 'bg-[#181c28] border-[#222736] text-slate-400 hover:text-slate-100 hover:border-slate-500'
              }`}
            >
              <svg width="22" height="14" viewBox="0 0 30 18" className="stroke-current fill-none">
                <path d={preset.path} strokeWidth="1.8" />
              </svg>
              <span className="text-[8px] font-mono">{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
