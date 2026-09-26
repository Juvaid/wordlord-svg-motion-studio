import React, { useState } from 'react';
import { X, Film, Download, Check, RefreshCw, AlertCircle, Eye, Sliders, Maximize2, Gauge, Zap, Box } from 'lucide-react';
import { renderAnimationToVideo, VideoExportResult } from '../utils/videoExporter';
import { getMotionIcon } from '../utils/presetIcons';
import { GLYPH_PATHS } from '../data/vectorPaths';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTo3DExport?: () => void;
  motionId: string;
  motionName: string;
  duration: number;
  bgGradient: string;
  colors: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
  glowRadius: number;
  glowIntensity: number;
  glowTarget?: 'all' | 'media' | 'word' | 'lord' | 'ligature' | 'selected';
  geometryMode: 'fill' | 'stroke' | 'hybrid';
  strokeWidth: number;
  tiltX: number;
  tiltY: number;
  layerVisibility: {
    master: boolean;
    word: boolean;
    lord: boolean;
    ligature: boolean;
    media: boolean;
    glow: boolean;
  };
  seekFrame: (p: number) => Promise<void> | void;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  onSwitchTo3DExport,
  motionId,
  motionName,
  duration,
  bgGradient,
  colors,
  glowRadius,
  glowIntensity,
  glowTarget = 'media',
  geometryMode,
  strokeWidth,
  tiltX,
  tiltY,
  layerVisibility,
  seekFrame
}) => {
  const [resolution, setResolution] = useState<'1080p' | 'square' | 'vertical' | '720p' | '4k'>('1080p');
  const [fps, setFps] = useState<number>(60);
  const [bitrateMbps, setBitrateMbps] = useState<number>(45);
  const [format, setFormat] = useState<'auto' | 'mp4' | 'webm'>('auto');
  const [markScale, setMarkScale] = useState<number>(0.85); // 85% balanced default
  const [bgChoice, setBgChoice] = useState<'theme' | 'black'>('theme');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [result, setResult] = useState<VideoExportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolutionMap = {
    '1080p': { label: '1080p Full HD', width: 1920, height: 1080, ratio: '16:9', aspectClass: 'aspect-video' },
    'square': { label: '1:1 Square Lockup', width: 1080, height: 1080, ratio: '1:1', aspectClass: 'aspect-square' },
    'vertical': { label: '9:16 Vertical Reel', width: 1080, height: 1920, ratio: '9:16', aspectClass: 'aspect-[9/16]' },
    '720p': { label: '720p Web Ready', width: 1280, height: 720, ratio: '16:9', aspectClass: 'aspect-video' },
    '4k': { label: '4K Ultra Cinema', width: 3840, height: 2160, ratio: '16:9', aspectClass: 'aspect-video' }
  };

  const targetRes = resolutionMap[resolution];

  const handleStartRender = async () => {
    try {
      setIsRendering(true);
      setErrorMsg(null);
      setResult(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      const res = await renderAnimationToVideo({
        duration,
        fps,
        width: targetRes.width,
        height: targetRes.height,
        markScale,
        presetName: motionName,
        colors,
        glowRadius,
        glowIntensity,
        glowTarget,
        geometryMode,
        strokeWidth,
        tiltX,
        tiltY,
        layerVisibility,
        bgChoice,
        bgGradient,
        bitrate: bitrateMbps * 1_000_000,
        format,
        seekFrame,
        onProgress: (p, frame, total) => {
          setProgress(Math.round(p * 100));
          setCurrentFrame(frame);
          setTotalFrames(total);
        }
      });

      setResult(res);
      const url = URL.createObjectURL(res.blob);
      setPreviewUrl(url);

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      a.click();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Video export encountered an error.');
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!previewUrl || !result) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = result.filename;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-[780px] max-w-full bg-[#0d1017] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Film size={16} className="text-[#ff4e2e]" />
            <span>Export 60 FPS Video (MP4 / WebM)</span>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchTo3DExport && !isRendering && (
              <button
                type="button"
                onClick={onSwitchTo3DExport}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ff4e2e]/10 hover:bg-[#ff4e2e]/20 border border-[#ff4e2e]/30 text-[#ff4e2e] text-[10.5px] font-mono font-medium transition-all shadow-sm"
                title="Switch directly to 3D Extrusion Studio & Export 3D Video"
              >
                <Box size={12} />
                <span>Switch to 3D Extruded Export</span>
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isRendering}
              className="p-1 text-slate-400 hover:text-white rounded disabled:opacity-30"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Active Preset & Settings Summary Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#121520] border border-[#202534]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded bg-black/60 border border-white/10 flex-shrink-0">
                {getMotionIcon(motionId, 16)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-display font-bold text-white uppercase truncate">
                  {motionName}
                </span>
                <div className="flex items-center gap-2 text-[9.5px] font-mono text-slate-400 mt-0.5">
                  <span>{duration.toFixed(2)}s @ {fps} FPS</span>
                  <span>•</span>
                  <span className="capitalize">{geometryMode}</span>
                  {tiltX !== 0 || tiltY !== 0 ? (
                    <>
                      <span>•</span>
                      <span>3D ({tiltX}°, {tiltY}°)</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Active Color Swatches Pill */}
            <div className="flex items-center gap-1.5 bg-[#0a0c10] border border-white/5 rounded-md px-2 py-1 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colors.word }} title="Word Color" />
              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colors.lord }} title="Lord Color" />
              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colors.ligature }} title="Ligature Color" />
              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colors.media }} title="Media Glow Color" />
            </div>
          </div>

          {/* Interactive Framing Preview + Configuration Layout */}
          {!isRendering && !result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Live Interactive Framing Preview */}
              <div className="flex flex-col gap-2 bg-[#10131d] border border-[#202535] rounded-xl p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-[#ff4e2e]" />
                    <span className="text-[11px] font-display font-bold text-slate-200 uppercase tracking-wider">
                      Export Framing Preview
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSafeZones(!showSafeZones)}
                    className={`text-[9.5px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      showSafeZones
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Safe Margins
                  </button>
                </div>

                {/* Aspect Ratio Viewport Frame Box */}
                <div className="relative w-full h-[220px] bg-black/60 rounded-lg border border-[#262c3e] overflow-hidden flex items-center justify-center p-2">
                  <div 
                    className={`relative max-w-full max-h-full ${targetRes.aspectClass} rounded border border-white/15 flex items-center justify-center transition-all duration-200 overflow-hidden shadow-xl`}
                    style={{
                      width: resolution === 'vertical' ? '124px' : resolution === 'square' ? '200px' : '100%',
                      background: bgChoice === 'theme' 
                        ? 'radial-gradient(circle, #1c2232 0%, #0b0e16 55%, #050608 100%)' 
                        : '#07080c'
                    }}
                  >
                    {/* Safe Zone Boundary Overlay */}
                    {showSafeZones && (
                      <div className="absolute inset-[8%] border border-dashed border-cyan-400/35 pointer-events-none rounded-sm">
                        <span className="absolute top-1 left-1.5 text-[7.5px] font-mono text-cyan-400/70 tracking-tight">
                          92% ACTION SAFE
                        </span>
                        {/* Center Crosshair */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 text-cyan-400 text-xs font-mono">
                          +
                        </div>
                      </div>
                    )}

                    {/* Scaled WordLord Vector Mark */}
                    <div 
                      className="relative flex items-center justify-center transition-all duration-150"
                      style={{
                        width: `${markScale * 100}%`,
                        height: `${markScale * 100}%`,
                        maxWidth: '96%',
                        maxHeight: '96%'
                      }}
                    >
                      <svg 
                        viewBox="0 0 25 26" 
                        className="w-full h-full object-contain filter drop-shadow-md"
                        style={{
                          filter: glowIntensity > 0 
                            ? `drop-shadow(0 0 ${(glowRadius * 0.4).toFixed(1)}px ${
                                glowTarget === 'word' ? colors.word :
                                glowTarget === 'lord' ? colors.lord :
                                glowTarget === 'ligature' ? colors.ligature :
                                colors.media
                              })` 
                            : 'none'
                        }}
                      >
                        {/* Word */}
                        {layerVisibility.word && (
                          <g fill={colors.word}>
                            <path d={GLYPH_PATHS.wordW} />
                            <path d={GLYPH_PATHS.wordO} />
                            <path d={GLYPH_PATHS.wordR} />
                          </g>
                        )}
                        {/* Lord */}
                        {layerVisibility.lord && (
                          <g fill={colors.lord}>
                            <path d={GLYPH_PATHS.lordL} />
                            <path d={GLYPH_PATHS.lordO} />
                            <path d={GLYPH_PATHS.lordR} />
                          </g>
                        )}
                        {/* Ligature D */}
                        {layerVisibility.ligature && (
                          <path d={GLYPH_PATHS.ligatureD} fill={colors.ligature} />
                        )}
                        {/* Media */}
                        {layerVisibility.media && (
                          <g fill={colors.media}>
                            <path d={GLYPH_PATHS.mediaM} />
                            <path d={GLYPH_PATHS.mediaE} />
                            <path d={GLYPH_PATHS.mediaD} />
                            <path d={GLYPH_PATHS.mediaI} />
                            <path d={GLYPH_PATHS.mediaA} />
                          </g>
                        )}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Framing Scale Slider & Quick Presets */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Canvas Occupancy / Scale:</span>
                    <span className="text-[#ff4e2e] font-bold">{Math.round(markScale * 100)}%</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0.60"
                    max="0.98"
                    step="0.01"
                    value={markScale}
                    onChange={(e) => setMarkScale(parseFloat(e.target.value))}
                    className="w-full accent-[#ff4e2e] cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                    {[
                      { scale: 0.75, label: 'Fit (75%)', desc: 'Breathing Room' },
                      { scale: 0.85, label: 'Cinema (85%)', desc: 'Balanced' },
                      { scale: 0.95, label: 'Hero (95%)', desc: 'Maximal Edge' }
                    ].map(opt => (
                      <button
                        key={opt.scale}
                        type="button"
                        onClick={() => setMarkScale(opt.scale)}
                        className={`flex flex-col items-center py-1 px-1.5 rounded border text-center transition-colors ${
                          Math.abs(markScale - opt.scale) < 0.02
                            ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-white font-bold'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[9px] font-mono">{opt.label}</span>
                        <span className="text-[7.5px] text-slate-500">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framing Details Pill */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-black/40 border border-white/5 text-[9px] font-mono text-slate-400">
                  <span>Aspect: {targetRes.ratio} ({targetRes.width}×{targetRes.height})</span>
                  <span>Margin: {Math.round((1 - markScale) * 50)}% edge</span>
                </div>
              </div>

              {/* Right Column: Resolution, Frame Rate & Background Options */}
              <div className="flex flex-col gap-3.5">
                
                {/* Resolution Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    Target Output Resolution
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['1080p', 'square', 'vertical', '720p', '4k'] as const).map(resKey => {
                      const r = resolutionMap[resKey];
                      const isSel = resolution === resKey;
                      return (
                        <button
                          key={resKey}
                          onClick={() => setResolution(resKey)}
                          className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all ${
                            isSel
                              ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                              : 'bg-[#141722] border-[#222736] hover:border-slate-500'
                          } ${resKey === '4k' ? 'col-span-2' : ''}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[11px] font-semibold truncate ${isSel ? 'text-white' : 'text-slate-200'}`}>
                              {r.label}
                            </span>
                            <span className="text-[9px] font-mono text-[#ff4e2e]">{r.ratio}</span>
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-400 mt-0.5">
                            {r.width} × {r.height}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Framerate & Background Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* FPS Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Frame Rate
                    </label>
                    <div className="flex bg-[#141722] border border-[#222736] rounded-md p-1 gap-1">
                      {[30, 60].map(rate => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setFps(rate)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                            fps === rate ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {rate} FPS
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas Background */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Stage Backdrop
                    </label>
                    <div className="flex bg-[#141722] border border-[#222736] rounded-md p-1 gap-1">
                      {[
                        { key: 'theme' as const, label: 'Ambient' },
                        { key: 'black' as const, label: 'Deep Dark' }
                      ].map(bg => (
                        <button
                          key={bg.key}
                          type="button"
                          onClick={() => setBgChoice(bg.key)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono font-medium transition-colors truncate ${
                            bgChoice === bg.key ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {bg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Codec Format & Bitrate Controls */}
                <div className="flex flex-col gap-2 bg-[#121622] border border-[#22283a] rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300 font-semibold uppercase tracking-wider">
                      <Gauge size={12} className="text-[#ff4e2e]" />
                      <span>Encoding Bitrate & Codec</span>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                      ~{((duration * bitrateMbps) / 8).toFixed(1)} MB Est.
                    </span>
                  </div>

                  {/* Format Selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'auto' as const, label: 'Auto (Best)', sub: 'Hardware Default' },
                      { key: 'mp4' as const, label: 'MP4 Video', sub: 'H.264 High Profile' },
                      { key: 'webm' as const, label: 'WebM Master', sub: 'VP9 Ultra-HD' },
                    ].map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFormat(f.key)}
                        className={`flex flex-col items-center py-1 px-1 rounded border text-center transition-all ${
                          format === f.key
                            ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-white font-bold'
                            : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[9.5px] font-mono leading-tight">{f.label}</span>
                        <span className="text-[7.5px] text-slate-500 leading-tight">{f.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Bitrate Presets */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between text-[9.5px] font-mono">
                      <span className="text-slate-400">Stream Bitrate:</span>
                      <span className="text-[#ff4e2e] font-bold">{bitrateMbps} Mbps</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { mbps: 60, label: 'Cinema', badge: '60M' },
                        { mbps: 45, label: 'Studio', badge: '45M' },
                        { mbps: 30, label: 'Pro', badge: '30M' },
                        { mbps: 18, label: 'Web', badge: '18M' },
                        { mbps: 10, label: 'Social', badge: '10M' },
                      ].map(p => (
                        <button
                          key={p.mbps}
                          type="button"
                          onClick={() => setBitrateMbps(p.mbps)}
                          className={`py-1 px-0.5 rounded border text-center transition-all ${
                            bitrateMbps === p.mbps
                              ? 'bg-[#ff4e2e] border-[#ff4e2e] text-white font-bold shadow-sm'
                              : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-[9px] font-mono block leading-tight">{p.badge}</span>
                          <span className="text-[7px] text-slate-400 block leading-tight">{p.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Fine-tuning Bitrate Slider */}
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={bitrateMbps}
                      onChange={(e) => setBitrateMbps(parseInt(e.target.value, 10))}
                      className="w-full accent-[#ff4e2e] cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none mt-1"
                    />
                  </div>
                </div>

                {/* Master Render Quality Specs */}
                <div className="p-3 bg-[#11141e] border border-[#1f2535] rounded-lg flex flex-col gap-1 text-[9.5px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Encoding Bitrate:</span>
                    <span className="text-slate-200 font-bold">{bitrateMbps} Mbps {bitrateMbps >= 45 ? '(Cinema Grade)' : '(Standard)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Format:</span>
                    <span className="text-cyan-400 font-bold">{format === 'auto' ? 'Auto (Hardware Best)' : format.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frame Count:</span>
                    <span className="text-slate-200 font-bold">{Math.round(duration * fps)} frames</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buffer Pipeline:</span>
                    <span className="text-emerald-400 font-bold">Zero-Flicker Double Buffer</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Realtime Rendering Progress State */}
          {isRendering && (
            <div className="p-6 bg-[#0a0c10] border border-[#ff4e2e]/40 rounded-xl flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#ff4e2e] border-t-transparent animate-spin flex items-center justify-center">
                <Film size={20} className="text-[#ff4e2e]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Rendering {fps} FPS Video...
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Frame {currentFrame} of {totalFrames} ({progress}%)
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#181c28] rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#ff4e2e] to-[#ff8c42] transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Atomic double-buffered rasterization with hardware-accelerated MediaRecorder...
              </span>
            </div>
          )}

          {/* Success Result & Video Preview Player */}
          {result && previewUrl && (
            <div className="flex flex-col gap-3 p-4 bg-[#0a0c10] border border-emerald-500/40 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                  <Check size={16} strokeWidth={2.5} />
                  <span>Render Complete! Saved as {result.extension.toUpperCase()}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {(result.blob.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {/* Embedded Video Preview Player */}
              <div className="h-48 bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs font-mono text-red-200">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-14 px-5 bg-[#090b10] border-t border-[#1f2430] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            Native MediaRecorder Stream Pipeline
          </span>
          <div className="flex items-center gap-2">
            {result ? (
              <>
                <button
                  onClick={() => { setResult(null); setPreviewUrl(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-slate-200 rounded-md text-xs font-mono transition-all"
                >
                  <RefreshCw size={12} />
                  <span>Configure Again</span>
                </button>
                <button
                  onClick={handleDownloadAgain}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-md transition-all"
                >
                  <Download size={13} />
                  <span>Download {result.extension.toUpperCase()} Again</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleStartRender}
                disabled={isRendering}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#ff4e2e] hover:bg-[#ff6144] disabled:bg-[#ff4e2e]/50 text-white rounded-md text-xs font-semibold shadow-lg shadow-[#ff4e2e]/25 transition-all"
              >
                <Film size={13} />
                <span>{isRendering ? 'Rendering Frames...' : 'Render & Download MP4'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
