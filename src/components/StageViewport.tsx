import React, { useRef, useState, useEffect } from 'react';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Move,
  Compass,
  MousePointer,
  Hand,
  Upload
} from 'lucide-react';
import { GLYPH_PATHS } from '../data/vectorPaths';
import { BackgroundMode } from '../types';
import { ThreePart } from '../types/threeStudio';

interface StageViewportProps {
  animKey?: number;
  animClass: string;
  duration: number;
  easeFormula: string;
  stagger: number;
  glowRadius: number;
  glowIntensity: number;
  glowTarget?: 'all' | 'media' | 'word' | 'lord' | 'ligature' | 'selected';
  selectedSection?: string | null;
  onSelectSection?: (sectionId: string | null) => void;
  geometryMode: 'fill' | 'stroke' | 'hybrid';
  strokeWidth: number;
  tiltX: number;
  tiltY: number;
  scale: number;
  pan: { x: number; y: number };
  bgMode: BackgroundMode;
  bgGradient?: string;
  colors: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
  layerVisibility: {
    master: boolean;
    word: boolean;
    lord: boolean;
    ligature: boolean;
    media: boolean;
    glow: boolean;
  };
  activeAssetId?: string;
  activeAssetViewBox?: string;
  parts?: ThreePart[];
  onPanChange: (pan: { x: number; y: number }) => void;
  onScaleChange: (scale: number) => void;
  onDropSvgFile?: (file: File) => void;
}

export const StageViewport: React.FC<StageViewportProps> = ({
  animKey = 0,
  animClass,
  duration,
  easeFormula,
  stagger,
  glowRadius,
  glowIntensity,
  glowTarget = 'media',
  selectedSection = null,
  onSelectSection,
  geometryMode,
  strokeWidth,
  tiltX,
  tiltY,
  scale,
  pan,
  bgMode,
  bgGradient,
  colors,
  layerVisibility,
  activeAssetId = 'wordlord',
  activeAssetViewBox,
  parts = [],
  onPanChange,
  onScaleChange,
  onDropSvgFile
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.toLowerCase().endsWith('.svg') || file.type.includes('svg'))) {
      onDropSvgFile?.(file);
    }
  };

  // Track Spacebar for temporary pan mode & navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      } else if (e.code === 'KeyH' && !e.altKey && !e.metaKey && !e.ctrlKey) {
        // H: Hand Tool
        e.preventDefault();
        setActiveTool('hand');
      } else if (e.code === 'KeyV' && !e.altKey && !e.metaKey && !e.ctrlKey) {
        // V: Select Pointer Tool
        e.preventDefault();
        setActiveTool('select');
      } else if ((e.key === '0' || e.code === 'Digit0') && (e.altKey || e.metaKey || e.ctrlKey)) {
        // Reset Zoom & Pan (Cmd+0 or Alt+0)
        e.preventDefault();
        onScaleChange(1.0);
        onPanChange({ x: 0, y: 0 });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onScaleChange, onPanChange]);

  // Robust Pan Interaction with explicit pointer capture
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Can pan if: Hand Tool is active OR Middle Click OR Left Click while Space/Alt held
    const canPan = activeTool === 'hand' 
      ? (e.button === 0 || e.button === 1)
      : (e.button === 1 || (e.button === 0 && (e.altKey || isSpacePressed)));
    
    if (!canPan) return;

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    onPanChange({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsPanning(false);
    }
  };

  // Zoom interaction
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.max(0.4, Math.min(3.5, scale * zoomFactor));
    onScaleChange(newScale);
  };

  // Background style
  const getBgStyle = () => {
    if (bgMode === 'radial') {
      return { background: bgGradient || 'radial-gradient(circle at 50% 50%, #161a26 0%, #06070a 100%)' };
    }
    if (bgMode === 'grid') {
      return {
        backgroundColor: '#07080c',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      };
    }
    return { backgroundColor: '#07080c' };
  };

  // Geometry attributes
  const getStrokeAttr = () => {
    if (geometryMode === 'stroke') {
      return { stroke: '#00ffff', strokeWidth: `${strokeWidth}px`, fillOpacity: 0 };
    }
    if (geometryMode === 'hybrid') {
      return { stroke: 'rgba(255, 255, 255, 0.8)', strokeWidth: `${strokeWidth}px`, fillOpacity: 0.85 };
    }
    return { stroke: 'none', strokeWidth: '0px', fillOpacity: 1 };
  };

  const strokeAttr = getStrokeAttr();

  // Dynamic cursor style
  const cursorClass = isPanning 
    ? 'cursor-grabbing' 
    : (activeTool === 'hand' || isSpacePressed)
    ? 'cursor-grab' 
    : 'cursor-default';

  const isWordLordMark = !activeAssetId || activeAssetId === 'wordlord';
  const rawVb = (activeAssetViewBox || '0 0 100 100').split(/[\s,]+/).filter(Boolean).map(Number);
  const vbW = rawVb.length === 4 && rawVb[2] > 0 ? rawVb[2] : 100;
  const vbH = rawVb.length === 4 && rawVb[3] > 0 ? rawVb[3] : 100;
  const stageWidth = isWordLordMark ? 320 : 340;
  const stageHeight = isWordLordMark ? 332 : Math.min(420, Math.max(160, Math.round((vbH / vbW) * 340)));
  const currentViewBox = isWordLordMark ? "0 0 25 26" : (activeAssetViewBox || `0 0 ${vbW} ${vbH}`);

  // Helper to compute ultra-crisp CSS multi-tier optical drop-shadow aura
  // Guarantees ZERO pixelation under any CSS 3D perspective or tilt angle
  const getGlowFilter = (targetKey: 'word' | 'lord' | 'ligature' | 'media' | string, color: string) => {
    if (!layerVisibility.glow || glowRadius <= 0 || glowIntensity <= 0) return undefined;
    
    const isTargeted = 
      glowTarget === 'all' || 
      glowTarget === targetKey || 
      (glowTarget === 'selected' && selectedSection === targetKey);
      
    if (!isTargeted) return undefined;

    const factor = glowIntensity / 100;
    const r1 = Math.max(1, (glowRadius * 0.25) * factor).toFixed(1);
    const r2 = Math.max(2, (glowRadius * 0.7) * factor).toFixed(1);
    const r3 = Math.max(4, (glowRadius * 1.5) * factor).toFixed(1);
    return `drop-shadow(0 0 ${r1}px ${color}) drop-shadow(0 0 ${r2}px ${color}) drop-shadow(0 0 ${r3}px ${color})`;
  };

  return (
    <main
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={getBgStyle()}
      className={`flex-1 h-full relative overflow-hidden flex items-center justify-center select-none ${cursorClass}`}
    >
      {/* Interactive Drag & Drop File Indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-[#07080c]/85 backdrop-blur-md border-2 border-dashed border-[#ff4e2e] m-4 rounded-xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-100 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-[#ff4e2e]/20 border border-[#ff4e2e]/40 flex items-center justify-center text-[#ff4e2e] shadow-xl shadow-[#ff4e2e]/20">
            <Upload size={28} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-base font-bold text-white font-display uppercase tracking-wider">
              Drop SVG Vector File Here
            </span>
            <span className="text-xs font-mono text-slate-400">
              Instantly load, decompose into vector paths & animate in 2D / 3D
            </span>
          </div>
        </div>
      )}

      {/* Top Floating Viewport Control Deck (Tool, Zoom, Pan, Reset) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-[#10131d]/90 backdrop-blur-md border border-[#23293a] rounded-lg shadow-2xl z-20 pointer-events-auto">
        
        {/* Navigation Mode: Select (V) vs Hand (H) */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          <button
            onClick={() => setActiveTool('select')}
            title="Selection Pointer (V) - Logo stays anchored"
            className={`p-1.5 rounded transition-all ${
              activeTool === 'select'
                ? 'bg-[#ff4e2e] text-white font-bold shadow-md shadow-[#ff4e2e]/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <MousePointer size={12} />
          </button>
          <button
            onClick={() => setActiveTool('hand')}
            title="Hand / Pan Tool (H) - Click and drag to pan stage"
            className={`p-1.5 rounded transition-all ${
              activeTool === 'hand'
                ? 'bg-[#ff4e2e] text-white font-bold shadow-md shadow-[#ff4e2e]/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Hand size={12} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Zoom In & Out */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          <button
            onClick={() => onScaleChange(Math.max(0.4, Number((scale - 0.15).toFixed(2))))}
            title="Zoom Out"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <ZoomOut size={12} />
          </button>
          <span className="text-[10px] font-mono px-1.5 text-slate-300 min-w-[42px] text-center font-bold">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => onScaleChange(Math.min(3.5, Number((scale + 0.15).toFixed(2))))}
            title="Zoom In"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <ZoomIn size={12} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Reset Zoom & Pan to Center */}
        <button
          onClick={() => {
            onScaleChange(1.0);
            onPanChange({ x: 0, y: 0 });
          }}
          title="Reset Zoom & Pan (Cmd+0 / Alt+0)"
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-all ${
            scale !== 1.0 || pan.x !== 0 || pan.y !== 0
              ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] border border-[#ff4e2e]/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <RotateCcw size={11} />
          <span>Center</span>
        </button>

        {/* Pan Active Indicator */}
        {(pan.x !== 0 || pan.y !== 0) && (
          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
            Pan ({Math.round(pan.x)}, {Math.round(pan.y)})
          </span>
        )}
      </div>

      {/* Top Left Spec Badge */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none z-10">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0f121a]/85 backdrop-blur border border-[#1e2433] text-[9.5px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4e2e]" />
          <span className="font-bold text-white">
            {isWordLordMark ? 'WordLord Vector Mark' : 'Custom Vector Asset'}
          </span>
          <span className="text-slate-500">•</span>
          <span>{currentViewBox}</span>
          {selectedSection && (
            <>
              <span className="text-slate-500">•</span>
              <span className="text-[#ff4e2e] font-semibold uppercase">
                Section: {selectedSection}
              </span>
            </>
          )}
          {!isWordLordMark && (
            <>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-semibold">{parts.length} Vector Layers</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Right Navigation Tip */}
      <div className="absolute bottom-3 right-3 pointer-events-none z-10 flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#0e1118]/85 backdrop-blur border border-white/5 text-[9px] font-mono text-slate-400">
        <span>V: Select Tool</span>
        <span>•</span>
        <span>H: Hand Tool</span>
        <span>•</span>
        <span>Space + Drag: Pan</span>
        <span>•</span>
        <span>Scroll: Zoom</span>
      </div>

      {/* Visual Bounding Spec Box */}
      <div
        id="stage-wrapper"
        key={animKey}
        className={`relative transition-transform duration-75 ease-out ${animClass}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          ['--motion-duration' as string]: `${duration}s`,
          ['--motion-ease' as string]: easeFormula,
          ['--motion-stagger' as string]: `${stagger / 1000}s`,
          ['--motion-glow-radius' as string]: `${glowRadius}px`,
          ['--svg-word-color' as string]: colors.word,
          ['--svg-lord-color' as string]: colors.lord,
          ['--svg-ligature-color' as string]: colors.ligature,
          ['--svg-media-color' as string]: colors.media,
          visibility: layerVisibility.master ? 'visible' : 'hidden'
        }}
      >
        {/* 3D Spatial Perspective Rig (Zero-Pixelation Hardware Vector Projection) */}
        <div
          id="stage-3d-perspective-rig"
          style={{
            perspective: 1200,
            perspectiveOrigin: '50% 50%',
            transformStyle: 'preserve-3d',
            display: 'inline-block'
          }}
        >
          <div
            id="stage-3d-gimbal"
            style={{
              transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center',
              transition: 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              willChange: (tiltX !== 0 || tiltY !== 0) ? 'transform' : 'auto'
            }}
          >
            {/* Master Stage SVG (Unclipped Guaranteed) */}
            <svg
              id="main-stage-svg"
              width={stageWidth}
              height={stageHeight}
              viewBox={currentViewBox}
              fill="none"
              className="block overflow-visible"
              style={{
                shapeRendering: 'geometricPrecision',
                textRendering: 'geometricPrecision'
              }}
            >
              <defs>
                {/* Safe 600% Unclipped Volumetric Glow Filter */}
                <filter id="unclipped-media-glow" x="-250%" y="-250%" width="600%" height="600%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation={glowRadius * 0.045} result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation={glowRadius * 0.1} result="blur2" />
                  <feColorMatrix
                    in="blur1"
                    type="matrix"
                    values={`
                      1 0 0 0 1
                      0 0.31 0 0 0.31
                      0 0 0.18 0 0.18
                      0 0 0 ${((glowIntensity / 100) * 1.6).toFixed(2)} 0`}
                    result="col1"
                  />
                  <feColorMatrix
                    in="blur2"
                    type="matrix"
                    values={`
                      1 0 0 0 1
                      0 0.31 0 0 0.31
                      0 0 0.18 0 0.18
                      0 0 0 ${((glowIntensity / 100) * 0.9).toFixed(2)} 0`}
                    result="col2"
                  />
                  <feMerge>
                    <feMergeNode in="col2" />
                    <feMergeNode in="col1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <linearGradient id="laser-gleam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#ff4e2e" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {!isWordLordMark ? (
                /* Custom Vector Asset Decomposed Layers */
                <g id="group-custom-asset">
                  {parts && parts.length > 0 ? (
                    parts.map((part, pIdx) => {
                      if (!part.visible) return null;
                      const partKey = part.id || `part-${pIdx}`;
                      const isSel = selectedSection === partKey;
                      const partDelay = ((part.phaseDelay ?? (pIdx * 0.08)) * (duration / 1.0)).toFixed(3);
                      return (
                        <path
                          key={part.id || pIdx}
                          id={`glyph-custom-${pIdx}`}
                          data-glyph={part.name || `part-${pIdx}`}
                          d={part.pathD}
                          fill={part.faceColor || colors.word}
                          stroke={strokeAttr.stroke}
                          strokeWidth={strokeAttr.strokeWidth}
                          fillOpacity={strokeAttr.fillOpacity}
                          onClick={(e) => {
                            if (activeTool === 'select') {
                              e.stopPropagation();
                              onSelectSection?.(isSel ? null : partKey);
                            }
                          }}
                          style={{
                            transformOrigin: 'center center',
                            animationDelay: `${partDelay}s`,
                            filter: getGlowFilter(partKey, part.faceColor || colors.word),
                            outline: isSel ? '1.5px dashed rgba(255, 78, 46, 0.7)' : undefined,
                            outlineOffset: '2px',
                            cursor: activeTool === 'select' ? 'pointer' : 'default',
                            transition: 'fill 0.2s ease, opacity 0.2s ease, filter 0.2s ease'
                          }}
                          className="custom-part-glyph"
                        />
                      );
                    })
                  ) : (
                    <text x="50" y="50" fill="#ffffff" fontSize="6" textAnchor="middle" opacity="0.6">
                      Loading Vector Asset...
                    </text>
                  )}
                </g>
              ) : (
                <>
                  {/* Group: WORD */}
                  <g 
                    id="group-word" 
                    onClick={(e) => {
                      if (activeTool === 'select') {
                        e.stopPropagation();
                        onSelectSection?.(selectedSection === 'word' ? null : 'word');
                      }
                    }}
                    className={activeTool === 'select' ? 'cursor-pointer' : undefined}
                    style={{ 
                      visibility: layerVisibility.word ? 'visible' : 'hidden',
                      filter: getGlowFilter('word', colors.word),
                      outline: selectedSection === 'word' ? '1.5px dashed rgba(255, 78, 46, 0.7)' : undefined,
                      outlineOffset: '2px',
                      transition: 'filter 0.2s ease, opacity 0.2s ease'
                    }}
                  >
                    <path
                      id="glyph-word-w"
                      data-glyph="W"
                      d={GLYPH_PATHS.wordW}
                      fill={colors.word}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-word-o"
                      data-glyph="O"
                      d={GLYPH_PATHS.wordO}
                      fill={colors.word}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-word-r"
                      data-glyph="R"
                      d={GLYPH_PATHS.wordR}
                      fill={colors.word}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                  </g>

                  {/* Group: LORD */}
                  <g 
                    id="group-lord" 
                    onClick={(e) => {
                      if (activeTool === 'select') {
                        e.stopPropagation();
                        onSelectSection?.(selectedSection === 'lord' ? null : 'lord');
                      }
                    }}
                    className={activeTool === 'select' ? 'cursor-pointer' : undefined}
                    style={{ 
                      visibility: layerVisibility.lord ? 'visible' : 'hidden',
                      filter: getGlowFilter('lord', colors.lord),
                      outline: selectedSection === 'lord' ? '1.5px dashed rgba(255, 78, 46, 0.7)' : undefined,
                      outlineOffset: '2px',
                      transition: 'filter 0.2s ease, opacity 0.2s ease'
                    }}
                  >
                    <path
                      id="glyph-lord-l"
                      data-glyph="L"
                      d={GLYPH_PATHS.lordL}
                      fill={colors.lord}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-lord-o"
                      data-glyph="O"
                      d={GLYPH_PATHS.lordO}
                      fill={colors.lord}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-lord-r"
                      data-glyph="R"
                      d={GLYPH_PATHS.lordR}
                      fill={colors.lord}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                  </g>

                  {/* Group: Monolithic Ligature D */}
                  <g 
                    id="group-ligature" 
                    onClick={(e) => {
                      if (activeTool === 'select') {
                        e.stopPropagation();
                        onSelectSection?.(selectedSection === 'ligature' ? null : 'ligature');
                      }
                    }}
                    className={activeTool === 'select' ? 'cursor-pointer' : undefined}
                    style={{ 
                      visibility: layerVisibility.ligature ? 'visible' : 'hidden',
                      filter: getGlowFilter('ligature', colors.ligature),
                      outline: selectedSection === 'ligature' ? '1.5px dashed rgba(255, 78, 46, 0.7)' : undefined,
                      outlineOffset: '2px',
                      transition: 'filter 0.2s ease, opacity 0.2s ease'
                    }}
                  >
                    <path
                      id="glyph-ligature-d"
                      data-glyph="D"
                      d={GLYPH_PATHS.ligatureD}
                      fill={colors.ligature}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                  </g>

                  {/* Group: MEDIA (with Volumetric Glow) */}
                  <g
                    id="group-media"
                    onClick={(e) => {
                      if (activeTool === 'select') {
                        e.stopPropagation();
                        onSelectSection?.(selectedSection === 'media' ? null : 'media');
                      }
                    }}
                    className={activeTool === 'select' ? 'cursor-pointer' : undefined}
                    style={{ 
                      visibility: layerVisibility.media ? 'visible' : 'hidden',
                      filter: getGlowFilter('media', colors.media),
                      outline: selectedSection === 'media' ? '1.5px dashed rgba(255, 78, 46, 0.7)' : undefined,
                      outlineOffset: '2px',
                      transition: 'filter 0.2s ease, opacity 0.2s ease'
                    }}
                  >
                    <path
                      id="glyph-media-m"
                      data-glyph="M"
                      d={GLYPH_PATHS.mediaM}
                      fill={colors.media}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-media-e"
                      data-glyph="E"
                      d={GLYPH_PATHS.mediaE}
                      fill={colors.media}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-media-d"
                      data-glyph="D"
                      d={GLYPH_PATHS.mediaD}
                      fill={colors.media}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-media-i"
                      data-glyph="I"
                      d={GLYPH_PATHS.mediaI}
                      fill={colors.media}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                    <path
                      id="glyph-media-a"
                      data-glyph="A"
                      d={GLYPH_PATHS.mediaA}
                      fill={colors.media}
                      stroke={strokeAttr.stroke}
                      strokeWidth={strokeAttr.strokeWidth}
                      fillOpacity={strokeAttr.fillOpacity}
                    />
                  </g>
                </>
              )}

              {/* Laser Specular Sweep Overlay */}
              <rect
                id="laser-sweep-rect"
                x="-20"
                y="-20"
                width="65"
                height="65"
                fill="url(#laser-gleam-grad)"
                pointerEvents="none"
                className="hidden"
                style={{ mixBlendMode: 'overlay' }}
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
};
