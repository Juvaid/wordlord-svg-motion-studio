import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GLYPH_PATHS } from '../data/vectorPaths';
import { BackgroundMode } from '../types';

interface StageViewportProps {
  animKey?: number;
  animClass: string;
  duration: number;
  easeFormula: string;
  stagger: number;
  glowRadius: number;
  glowIntensity: number;
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
  onPanChange: (pan: { x: number; y: number }) => void;
  onScaleChange: (scale: number) => void;
}

export const StageViewport: React.FC<StageViewportProps> = ({
  animKey = 0,
  animClass,
  duration,
  easeFormula,
  stagger,
  glowRadius,
  glowIntensity,
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
  onPanChange,
  onScaleChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Pan interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 0 && (e.altKey || (e.target as HTMLElement).tagName === 'MAIN')) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isPanning) return;
    onPanChange({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  }, [isPanning, onPanChange, startPan]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isPanning, handlePointerMove, handlePointerUp]);

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

  return (
    <main
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onWheel={handleWheel}
      style={getBgStyle()}
      className="flex-1 h-full relative overflow-hidden flex items-center justify-center cursor-crosshair select-none"
    >
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
        {/* Spec Label */}
        <div className="absolute -top-6 left-0 flex items-center gap-2 pointer-events-none">
          <span className="text-[8.5px] font-mono font-semibold text-[#ff4e2e] tracking-wider uppercase bg-[#0e1118]/80 border border-[#ff4e2e]/20 px-1.5 py-0.5 rounded">
            25 × 26 px // SUB-PIXEL VECTOR MARK
          </span>
        </div>

        {/* Master Stage SVG (Unclipped Guaranteed) */}
        <svg
          id="main-stage-svg"
          width="320"
          height="332"
          viewBox="0 0 25 26"
          fill="none"
          className="block overflow-visible"
          style={{
            transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out'
          }}
        >
          <defs>
            {/* Safe 600% Unclipped Filter Region */}
            <filter id="unclipped-media-glow" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={glowRadius * 0.045} result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation={glowRadius * 0.1} result="blur2" />
              <feColorMatrix
                in="blur1"
                type="matrix"
                values="
                  1 0 0 0 1
                  0 0.31 0 0 0.31
                  0 0 0.18 0 0.18
                  0 0 0 1.6 0"
                result="col1"
              />
              <feColorMatrix
                in="blur2"
                type="matrix"
                values="
                  1 0 0 0 1
                  0 0.31 0 0 0.31
                  0 0 0.18 0 0.18
                  0 0 0 0.9 0"
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

          {/* Dedicated Volumetric Glow Layer */}
          <g
            id="media-glow-layer"
            filter="url(#unclipped-media-glow)"
            style={{
              opacity: (glowIntensity / 100) * (layerVisibility.glow ? 1 : 0),
              transition: 'opacity 0.2s ease',
              overflow: 'visible'
            }}
          >
            <path d={GLYPH_PATHS.mediaM} fill={colors.media} />
            <path d={GLYPH_PATHS.mediaE} fill={colors.media} />
            <path d={GLYPH_PATHS.mediaD} fill={colors.media} />
            <path d={GLYPH_PATHS.mediaI} fill={colors.media} />
            <path d={GLYPH_PATHS.mediaA} fill={colors.media} />
          </g>

          {/* Group: WORD */}
          <g id="group-word" style={{ visibility: layerVisibility.word ? 'visible' : 'hidden' }}>
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
          <g id="group-lord" style={{ visibility: layerVisibility.lord ? 'visible' : 'hidden' }}>
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

          {/* Group: LIGATURE TALL D */}
          <g id="group-ligature" style={{ visibility: layerVisibility.ligature ? 'visible' : 'hidden' }}>
            <path
              id="glyph-ligature-d"
              data-glyph="TALL-D"
              d={GLYPH_PATHS.ligatureD}
              fill={colors.ligature}
              stroke={strokeAttr.stroke}
              strokeWidth={strokeAttr.strokeWidth}
              fillOpacity={strokeAttr.fillOpacity}
            />
          </g>

          {/* Group: MEDIA Sub-brand */}
          <g id="group-media" style={{ visibility: layerVisibility.media ? 'visible' : 'hidden' }}>
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
    </main>
  );
};
