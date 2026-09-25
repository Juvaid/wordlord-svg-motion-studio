import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  Repeat, 
  Volume2, 
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import { TimelineTrack } from '../types';
import { Tooltip } from './Tooltip';

interface TimelineFooterProps {
  duration: number;
  currentProgress: number;
  isPlaying: boolean;
  isLooping: boolean;
  soundEnabled: boolean;
  playbackSpeed: number;
  height: number;
  tracks: TimelineTrack[];
  onPlayPause: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onToggleLoop: () => void;
  onToggleSound: () => void;
  onSpeedChange: (speed: number) => void;
  onSeekProgress: (progress: number) => void;
  onToggleLayerVisibility: (trackId: string) => void;
  onPlaySound?: (pitch?: number, dur?: number) => void;
}

export const TimelineFooter: React.FC<TimelineFooterProps> = ({
  duration,
  currentProgress,
  isPlaying,
  isLooping,
  soundEnabled,
  playbackSpeed,
  height,
  tracks,
  onPlayPause,
  onJumpStart,
  onJumpEnd,
  onStepBack,
  onStepForward,
  onToggleLoop,
  onToggleSound,
  onSpeedChange,
  onSeekProgress,
  onToggleLayerVisibility,
  onPlaySound
}) => {
  const rulerTrackRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Format time in mm:ss.ms
  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 100);
    return `00:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const curSec = currentProgress * duration;
  const totalFrames = Math.max(1, Math.round(duration * 60));
  const curFrame = Math.round(currentProgress * totalFrames);

  const getProgressFromClientX = useCallback((clientX: number) => {
    if (!rulerTrackRef.current) return 0;
    const rect = rulerTrackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    const p = getProgressFromClientX(e.clientX);
    onSeekProgress(p);
    if (onPlaySound) onPlaySound(600, 0.015);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isScrubbing) return;
    const p = getProgressFromClientX(e.clientX);
    onSeekProgress(p);
  }, [isScrubbing, getProgressFromClientX, onSeekProgress]);

  const handlePointerUp = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isScrubbing, handlePointerMove, handlePointerUp]);

  return (
    <footer
      style={{ height: `${height}px` }}
      className="bg-[#090b10] border-t border-[#1f2430] flex flex-col z-30 select-none flex-shrink-0"
    >
      {/* Top Playback Transport Bar */}
      <div className="h-10 px-3.5 bg-[#0d0f15] border-b border-[#1f2430] flex items-center justify-between gap-4 flex-shrink-0">
        {/* Left Transport Buttons */}
        <div className="flex items-center gap-1.5">
          <Tooltip content="Jump to Start" shortcut="Home" side="top">
            <button
              onClick={onJumpStart}
              aria-label="Jump to Start"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <SkipBack size={12} />
            </button>
          </Tooltip>

          <Tooltip content="Step Back 1 Frame (1/60s)" shortcut="←" side="top">
            <button
              onClick={onStepBack}
              aria-label="Step Back 1 Frame"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </Tooltip>

          <Tooltip content={isPlaying ? "Pause Sequence" : "Play Sequence"} shortcut="Space" side="top">
            <button
              onClick={onPlayPause}
              aria-label={isPlaying ? "Pause Sequence" : "Play Sequence"}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all shadow-md ${
                isPlaying
                  ? 'bg-[#151822] text-[#ff4e2e] border border-[#ff4e2e]'
                  : 'bg-[#ff4e2e] text-white hover:bg-[#ff6144]'
              }`}
            >
              {isPlaying ? (
                <Pause size={13} fill="currentColor" />
              ) : (
                <Play size={13} fill="currentColor" className="ml-0.5" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Step Forward 1 Frame (1/60s)" shortcut="→" side="top">
            <button
              onClick={onStepForward}
              aria-label="Step Forward 1 Frame"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Jump to End" shortcut="End" side="top">
            <button
              onClick={onJumpEnd}
              aria-label="Jump to End"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <SkipForward size={12} />
            </button>
          </Tooltip>

          <div className="w-[1px] h-4 bg-[#232736] mx-1" />

          {/* Loop Mode Toggle */}
          <Tooltip content={isLooping ? "Continuous Loop: Enabled" : "Continuous Loop: Disabled"} shortcut="L" side="top">
            <button
              onClick={onToggleLoop}
              aria-label="Toggle Continuous Loop"
              className={`w-7 h-7 flex items-center justify-center rounded-md border transition-colors ${
                isLooping
                  ? 'bg-[#ff4e2e]/15 border-[#ff4e2e] text-[#ff4e2e]'
                  : 'bg-[#151822] border-[#232736] text-slate-400 hover:text-white'
              }`}
            >
              <Repeat size={12} />
            </button>
          </Tooltip>

          {/* Audio Haptic Clicks */}
          <Tooltip content={soundEnabled ? "Audio Clicks: Enabled" : "Audio Clicks: Muted"} shortcut="M" side="top">
            <button
              onClick={onToggleSound}
              aria-label="Audio Clicks"
              className={`w-7 h-7 flex items-center justify-center rounded-md border transition-colors ${
                soundEnabled
                  ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8]'
                  : 'bg-[#151822] border-[#232736] text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            </button>
          </Tooltip>
        </div>

        {/* Center Frame & Timecode Readout */}
        <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold text-slate-100">
          <Tooltip content="Current Frame Index at 60 FPS" side="top">
            <span className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 px-2 py-0.5 rounded text-[8.5px] tracking-wider cursor-default">
              FR {String(curFrame).padStart(2, '0')}/{totalFrames}
            </span>
          </Tooltip>
          <span className="text-white text-xs">{formatTime(curSec)}</span>
          <span className="text-slate-500 font-normal">/ {formatTime(duration)}</span>
        </div>

        {/* Right Playback Speed Multipliers */}
        <div className="flex items-center bg-[#151822] border border-[#232736] rounded-md p-0.5 gap-0.5">
          {[0.25, 0.5, 1.0, 1.5, 2.0].map(speed => (
            <Tooltip key={speed} content={`Set Playback Speed to ${speed}x`} side="top">
              <button
                onClick={() => onSpeedChange(speed)}
                aria-label={`Playback speed ${speed}x`}
                className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Main Timeline Scroller */}
      <div className="flex-1 flex overflow-hidden relative bg-[#07080c]">
        {/* Left Column: Fixed Channel Headers */}
        <div className="w-40 flex-shrink-0 flex flex-col border-r border-[#1f2430] bg-[#0a0c11] z-20">
          {/* Header Spacer matching Ruler height */}
          <div className="h-6 px-3 border-b border-[#1f2430] flex items-center justify-between font-mono text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-[#0d0f15]">
            <span>CHANNELS (6)</span>
            <Eye size={11} className="text-slate-500" />
          </div>

          {/* Track Headers */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map(track => (
              <div
                key={track.id}
                className="h-7 px-3 border-b border-white/[0.04] flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="text-[9px] font-mono font-medium text-slate-200 truncate">
                    {track.name}
                  </span>
                </div>

                <Tooltip content={track.visible ? `Hide ${track.name}` : `Show ${track.name}`} side="right">
                  <button
                    onClick={() => onToggleLayerVisibility(track.id)}
                    aria-label={track.visible ? 'Hide Layer' : 'Show Layer'}
                    className={`p-1 rounded transition-colors ${
                      track.visible ? 'text-[#38bdf8] hover:text-white' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {track.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Time Ruler, Tracks Canvas & Playhead Needle */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Ruler Bar */}
          <Tooltip content="Click or drag to scrub composition timeline" side="top">
            <div
              ref={rulerTrackRef}
              onPointerDown={handlePointerDown}
              className="h-6 flex bg-[#0c0e14] border-b border-[#1f2430] relative cursor-pointer flex-shrink-0 z-10"
            >
              {/* Tick Grid */}
              <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_5%)]" />

              {/* Timestamps */}
              <span className="absolute bottom-1 left-2 text-[8px] font-mono text-slate-400 pointer-events-none">0.00s</span>
              <span className="absolute bottom-1 left-[25%] -translate-x-1/2 text-[8px] font-mono text-slate-400 pointer-events-none">{(duration * 0.25).toFixed(2)}s</span>
              <span className="absolute bottom-1 left-[50%] -translate-x-1/2 text-[8px] font-mono text-slate-400 pointer-events-none">{(duration * 0.50).toFixed(2)}s</span>
              <span className="absolute bottom-1 left-[75%] -translate-x-1/2 text-[8px] font-mono text-slate-400 pointer-events-none">{(duration * 0.75).toFixed(2)}s</span>
              <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400 pointer-events-none">{duration.toFixed(2)}s</span>
            </div>
          </Tooltip>

          {/* Tracks Area */}
          <div className="flex-1 overflow-y-auto relative">
            {tracks.map(track => (
              <div
                key={track.id}
                onPointerDown={handlePointerDown}
                className="h-7 border-b border-white/[0.03] relative flex items-center hover:bg-white/[0.015] cursor-pointer"
              >
                {/* Background Guide Line */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/[0.02] pointer-events-none" />

                {/* Timing Clip Block */}
                <div
                  className="absolute h-4 rounded border flex items-center px-2 text-[7.5px] font-mono text-white shadow-sm"
                  style={{
                    left: `${track.startRatio * 100}%`,
                    width: `${track.widthRatio * 100}%`,
                    background: `linear-gradient(90deg, ${track.color}25, ${track.color}45)`,
                    borderColor: `${track.color}77`
                  }}
                >
                  <span className="truncate pointer-events-none font-semibold">{track.name}</span>

                  {/* Keyframe Diamonds with Tooltips */}
                  {track.keyframes.map(kf => (
                    <Tooltip
                      key={kf.id}
                      content={`${kf.label} (${(kf.timeRatio * duration).toFixed(2)}s)`}
                      side="top"
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeekProgress(kf.timeRatio);
                          if (onPlaySound) onPlaySound(850, 0.03);
                        }}
                        style={{ left: `${kf.timeRatio * 100}%` }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-black rotate-45 cursor-pointer z-10 hover:scale-150 hover:bg-[#ff4e2e] hover:border-white transition-transform"
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Unified Laser Scrubber Playhead spanning Ruler + Tracks */}
          <div
            className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-30"
          >
            <div
              className={`absolute top-0 bottom-0 w-[2px] bg-[#ff4e2e] shadow-[0_0_12px_rgba(255,78,46,0.9)] -translate-x-1/2 pointer-events-auto cursor-ew-resize ${
                isScrubbing ? 'cursor-grabbing' : ''
              }`}
              style={{ left: `${currentProgress * 100}%` }}
              onPointerDown={handlePointerDown}
            >
              {/* Top Playhead Inverted Diamond Grabber */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-3.5 bg-[#ff4e2e] shadow-lg flex items-center justify-center"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 55%, 50% 100%, 0% 55%)' }}
              />

              {/* Floating Scrubbing Time Badge */}
              {isScrubbing && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0c0e14]/95 border border-[#ff4e2e] text-white text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap">
                  {curSec.toFixed(2)}s • FR {curFrame}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
