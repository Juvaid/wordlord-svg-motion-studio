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

interface TimelineFooterProps {
  duration: number;
  currentProgress: number;
  isPlaying: boolean;
  isLooping: boolean;
  soundEnabled: boolean;
  playbackSpeed: number;
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
    <footer className="h-48 bg-[#090b10] border-t border-[#1f2430] flex flex-col z-30 select-none">
      {/* Top Playback Transport Bar */}
      <div className="h-9 px-3 bg-[#0d0f15] border-b border-[#1f2430] flex items-center justify-between gap-4 flex-shrink-0">
        {/* Left Transport Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onJumpStart}
            title="Jump to Start (0s)"
            className="w-6 h-6 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded transition-colors"
          >
            <SkipBack size={11} />
          </button>

          <button
            onClick={onStepBack}
            title="Step Back 1 Frame (1/60s)"
            className="w-6 h-6 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded transition-colors"
          >
            <ChevronLeft size={13} />
          </button>

          <button
            onClick={onPlayPause}
            title="Play / Pause (Spacebar)"
            className={`w-7 h-7 flex items-center justify-center rounded transition-all shadow-md ${
              isPlaying
                ? 'bg-[#151822] text-[#ff4e2e] border border-[#ff4e2e]'
                : 'bg-[#ff4e2e] text-white hover:bg-[#ff6144]'
            }`}
          >
            {isPlaying ? (
              <Pause size={12} fill="currentColor" />
            ) : (
              <Play size={12} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={onStepForward}
            title="Step Forward 1 Frame (1/60s)"
            className="w-6 h-6 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded transition-colors"
          >
            <ChevronRight size={13} />
          </button>

          <button
            onClick={onJumpEnd}
            title="Jump to End"
            className="w-6 h-6 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded transition-colors"
          >
            <SkipForward size={11} />
          </button>

          <div className="w-[1px] h-4 bg-[#232736] mx-1" />

          {/* Loop Mode Toggle */}
          <button
            onClick={onToggleLoop}
            title="Toggle Continuous Loop"
            className={`w-6 h-6 flex items-center justify-center rounded border transition-colors ${
              isLooping
                ? 'bg-[#ff4e2e]/15 border-[#ff4e2e] text-[#ff4e2e]'
                : 'bg-[#151822] border-[#232736] text-slate-400 hover:text-white'
            }`}
          >
            <Repeat size={11} />
          </button>

          {/* Audio Haptic Clicks */}
          <button
            onClick={onToggleSound}
            title="Audio Haptic Clicks"
            className={`w-6 h-6 flex items-center justify-center rounded border transition-colors ${
              soundEnabled
                ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8]'
                : 'bg-[#151822] border-[#232736] text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
          </button>
        </div>

        {/* Center Frame & Timecode Readout */}
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-slate-100">
          <span className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 px-1.5 py-0.5 rounded text-[8px] tracking-wider">
            FR {String(curFrame).padStart(2, '0')}/{totalFrames}
          </span>
          <span>{formatTime(curSec)}</span>
          <span className="text-slate-500 font-normal">/ {formatTime(duration)}</span>
        </div>

        {/* Right Playback Speed Multipliers */}
        <div className="flex items-center bg-[#151822] border border-[#232736] rounded p-0.5 gap-0.5">
          {[0.25, 0.5, 1.0, 1.5, 2.0].map(speed => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-1.5 py-0.5 text-[8.5px] font-mono rounded transition-colors ${
                playbackSpeed === speed
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Track Lanes and Ruler Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden bg-[#07080c]">
        {/* Ruler Row */}
        <div className="h-6 flex bg-[#0c0e14] border-b border-[#1f2430] sticky top-0 z-20">
          <div className="w-36 flex-shrink-0 border-r border-[#1f2430] bg-[#0a0c11] px-2 flex items-center font-mono text-[8px] font-bold text-slate-500 tracking-wider uppercase">
            CHANNELS (6)
          </div>
          <div
            ref={rulerTrackRef}
            onPointerDown={handlePointerDown}
            className="flex-1 relative cursor-pointer flex items-end pb-1"
          >
            {/* Tick Grid */}
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_5%)]" />

            {/* Ruler Timestamps */}
            <span className="absolute bottom-0.5 left-0 -translate-x-1/2 text-[8px] font-mono text-slate-500 pointer-events-none">0.0s</span>
            <span className="absolute bottom-0.5 left-[25%] -translate-x-1/2 text-[8px] font-mono text-slate-500 pointer-events-none">{(duration * 0.25).toFixed(2)}s</span>
            <span className="absolute bottom-0.5 left-[50%] -translate-x-1/2 text-[8px] font-mono text-slate-500 pointer-events-none">{(duration * 0.50).toFixed(2)}s</span>
            <span className="absolute bottom-0.5 left-[75%] -translate-x-1/2 text-[8px] font-mono text-slate-500 pointer-events-none">{(duration * 0.75).toFixed(2)}s</span>
            <span className="absolute bottom-0.5 left-[100%] -translate-x-1/2 text-[8px] font-mono text-slate-500 pointer-events-none">{duration.toFixed(2)}s</span>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 flex flex-col relative">
          {tracks.map(track => (
            <div
              key={track.id}
              className="h-6 flex border-b border-white/[0.03] hover:bg-white/[0.015] relative group"
            >
              {/* Channel Header */}
              <div className="w-36 flex-shrink-0 border-r border-[#1f2430] bg-[#0a0c11] px-2 flex items-center justify-between gap-1.5 z-10">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="text-[8.5px] font-mono text-slate-300 font-medium truncate">
                    {track.name}
                  </span>
                </div>

                <button
                  onClick={() => onToggleLayerVisibility(track.id)}
                  title={track.visible ? 'Hide Layer' : 'Show Layer'}
                  className={`p-0.5 rounded transition-colors ${
                    track.visible ? 'text-[#38bdf8] hover:text-white' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {track.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                </button>
              </div>

              {/* Channel Body */}
              <div
                onPointerDown={handlePointerDown}
                className="flex-1 relative flex items-center cursor-pointer"
              >
                {/* Clip Timing Block */}
                <div
                  className="absolute h-3.5 rounded border flex items-center px-1.5 text-[7px] font-mono text-white/90 shadow-sm"
                  style={{
                    left: `${track.startRatio * 100}%`,
                    width: `${track.widthRatio * 100}%`,
                    background: `linear-gradient(90deg, ${track.color}22, ${track.color}44)`,
                    borderColor: `${track.color}66`
                  }}
                >
                  <span className="truncate pointer-events-none">{track.name}</span>

                  {/* Keyframe Diamonds */}
                  {track.keyframes.map(kf => (
                    <div
                      key={kf.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeekProgress(kf.timeRatio);
                        if (onPlaySound) onPlaySound(850, 0.03);
                      }}
                      title={`Keyframe: ${(kf.timeRatio * duration).toFixed(2)}s — ${kf.label}`}
                      style={{ left: `${kf.timeRatio * 100}%` }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border border-black rotate-45 cursor-pointer z-10 hover:scale-150 hover:bg-[#ff4e2e] hover:border-white transition-transform"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Scrubber Playhead situated exactly over the tracks right column */}
          <div
            className="absolute top-0 bottom-0 left-36 right-0 pointer-events-none z-30"
          >
            <div
              className={`absolute top-[-24px] bottom-0 w-[2px] bg-[#ff4e2e] shadow-[0_0_10px_rgba(255,78,46,0.8)] -translate-x-1/2 pointer-events-auto cursor-ew-resize transition-none ${
                isScrubbing ? 'cursor-grabbing' : ''
              }`}
              style={{ left: `${currentProgress * 100}%` }}
              onPointerDown={handlePointerDown}
            >
              {/* Playhead Inverted Diamond Grab Head */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3 bg-[#ff4e2e] shadow-md"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 55%, 50% 100%, 0% 55%)' }}
              />

              {/* Floating Timestamp Tag */}
              {isScrubbing && (
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 bg-[#0a0c10]/95 border border-[#ff4e2e] text-white text-[8px] font-mono font-bold px-1 py-0.5 rounded whitespace-nowrap shadow-lg">
                  {curSec.toFixed(2)}s
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
