import React, { useState } from 'react';
import { X, Film, Download, Check, RefreshCw, AlertCircle, Play, Sparkles } from 'lucide-react';
import { renderAnimationToVideo, VideoExportResult } from '../utils/videoExporter';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  motionName: string;
  duration: number;
  bgGradient: string;
  seekFrame: (p: number) => Promise<void> | void;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  motionName,
  duration,
  bgGradient,
  seekFrame
}) => {
  const [resolution, setResolution] = useState<'1080p' | 'square' | '4k' | '720p'>('1080p');
  const [fps, setFps] = useState<number>(60);
  const [bgChoice, setBgChoice] = useState<'theme' | 'black' | 'transparent'>('theme');
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [result, setResult] = useState<VideoExportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolutionMap = {
    '1080p': { label: '1080p Full HD (1920 × 1080)', width: 1920, height: 1080, ratio: '16:9' },
    'square': { label: '1:1 Square Lockup (1080 × 1080)', width: 1080, height: 1080, ratio: '1:1' },
    '720p': { label: '720p Web Ready (1280 × 720)', width: 1280, height: 720, ratio: '16:9' },
    '4k': { label: '4K Ultra Cinema (3840 × 2160)', width: 3840, height: 2160, ratio: '16:9' }
  };

  const handleStartRender = async () => {
    try {
      setIsRendering(true);
      setErrorMsg(null);
      setResult(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      const targetRes = resolutionMap[resolution];
      const res = await renderAnimationToVideo({
        duration,
        fps,
        width: targetRes.width,
        height: targetRes.height,
        bgColor: bgChoice === 'black' ? '#07080c' : bgChoice === 'transparent' ? 'rgba(0,0,0,0)' : '#07080c',
        bgGradient: bgChoice === 'theme' ? bgGradient : undefined,
        presetName: motionName,
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
      <div className="w-[620px] max-w-full bg-[#0d1017] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Film size={16} className="text-[#ff4e2e]" />
            <span>Export 60 FPS Video (MP4 / WebM)</span>
          </div>
          <button
            onClick={onClose}
            disabled={isRendering}
            className="p-1 text-slate-400 hover:text-white rounded disabled:opacity-30"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          
          {/* Active Preset Summary Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#121520] border border-[#202534]">
            <div className="flex flex-col">
              <span className="text-xs font-display font-bold text-white uppercase">{motionName}</span>
              <span className="text-[10px] font-mono text-slate-400">Duration: {duration.toFixed(2)}s @ {fps} FPS</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff4e2e]/20 text-[#ff4e2e] border border-[#ff4e2e]/30 font-semibold">
              H.264 MP4 ENGINE
            </span>
          </div>

          {/* Config Options when not rendering */}
          {!isRendering && !result && (
            <div className="flex flex-col gap-3.5">
              {/* Resolution Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                  Resolution & Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['1080p', 'square', '720p', '4k'] as const).map(resKey => {
                    const r = resolutionMap[resKey];
                    const isSel = resolution === resKey;
                    return (
                      <button
                        key={resKey}
                        onClick={() => setResolution(resKey)}
                        className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                          isSel
                            ? 'bg-[#ff4e2e]/10 border-[#ff4e2e] shadow-sm'
                            : 'bg-[#141722] border-[#222736] hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-semibold ${isSel ? 'text-white' : 'text-slate-200'}`}>
                            {r.label.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-mono text-[#ff4e2e]">{r.ratio}</span>
                        </div>
                        <span className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                          {r.width} × {r.height} px
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Framerate & Background */}
              <div className="grid grid-cols-2 gap-3">
                {/* FPS Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    Frame Rate
                  </label>
                  <div className="flex bg-[#141722] border border-[#222736] rounded-md p-1 gap-1">
                    {[30, 60].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setFps(rate)}
                        className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
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
                  <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    Background Mode
                  </label>
                  <div className="flex bg-[#141722] border border-[#222736] rounded-md p-1 gap-1">
                    {[
                      { key: 'theme' as const, label: 'Theme Ambient' },
                      { key: 'black' as const, label: 'Solid Dark' }
                    ].map(bg => (
                      <button
                        key={bg.key}
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
                  Rendering 60 FPS Video...
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
                Synchronizing frame buffers with hardware acceleration...
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
              <div className="h-44 bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  loop
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
