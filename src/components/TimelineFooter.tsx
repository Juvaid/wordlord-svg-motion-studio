import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
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
  EyeOff,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { TimelineTrack, WorkArea, TimelineKeyframe } from '../types';
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
  workArea?: WorkArea;
  selectedKeyframeId?: string | null;
  studioMode?: '2d' | '3d' | 'motion-graphics';
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
  onAddKeyframe?: () => void;
  onDeleteKeyframe?: (keyframeId: string) => void;
  onMoveKeyframe?: (trackId: string, keyframeId: string, newTimeRatio: number) => void;
  onSelectKeyframe?: (keyframeId: string | null) => void;
  onSetWorkArea?: (inPoint: number, outPoint: number) => void;
  onJumpPrevKeyframe?: () => void;
  onJumpNextKeyframe?: () => void;
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
  workArea = { inPoint: 0.0, outPoint: 1.0 },
  selectedKeyframeId,
  studioMode = '2d',
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
  onAddKeyframe,
  onDeleteKeyframe,
  onMoveKeyframe,
  onSelectKeyframe,
  onSetWorkArea,
  onJumpPrevKeyframe,
  onJumpNextKeyframe,
  onPlaySound
}) => {
  const rulerTrackRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingWorkArea, setDraggingWorkArea] = useState<'in' | 'out' | null>(null);
  const [draggingKeyframe, setDraggingKeyframe] = useState<{
    trackId: string;
    kfId: string;
  } | null>(null);
  const [displayMode, setDisplayMode] = useState<'time' | 'frames'>('time');
  const [snapActive, setSnapActive] = useState<boolean>(false);

  // Format time in mm:ss.ms
  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 100);
    return `00:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const curSec = currentProgress * duration;
  const totalFrames = Math.max(1, Math.round(duration * 60));
  const curFrame = Math.round(currentProgress * totalFrames);

  // Map contextual track titles for Motion Graphics Studio
  const displayTracks = useMemo(() => {
    if (studioMode !== 'motion-graphics') return tracks;
    const bentoNames: Record<string, string> = {
      master: '0: Bento Card Root',
      word: '1: Kinetic Word Typography',
      lord: '2: Kinetic Lord Typography',
      ligature: '3: Monolith D Anchor',
      media: '4: Neon Subline Glow',
      glow: '5: Telemetry Metrics Stagger'
    };
    return tracks.map(t => ({
      ...t,
      name: bentoNames[t.id] || t.name
    }));
  }, [tracks, studioMode]);

  // Collect all keyframes flat
  const allKeyframesList = useMemo(() => {
    const list: Array<{ trackId: string; trackName: string; kf: TimelineKeyframe }> = [];
    tracks.forEach(t => {
      t.keyframes.forEach(kf => {
        list.push({ trackId: t.id, trackName: t.name, kf });
      });
    });
    return list;
  }, [tracks]);

  // Find currently selected keyframe object
  const activeSelectedKeyframe = useMemo(() => {
    if (!selectedKeyframeId) return null;
    return allKeyframesList.find(item => item.kf.id === selectedKeyframeId) || null;
  }, [selectedKeyframeId, allKeyframesList]);

  // Snap targets calculation
  const getProgressFromClientX = useCallback((clientX: number, snap = true) => {
    if (!rulerTrackRef.current) return 0;
    const rect = rulerTrackRef.current.getBoundingClientRect();
    let p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    if (snap) {
      const snapTargets = [
        0, 
        workArea.inPoint, 
        workArea.outPoint, 
        1,
        ...allKeyframesList.map(item => item.kf.timeRatio)
      ];
      for (const target of snapTargets) {
        if (Math.abs(p - target) < 0.015) {
          p = target;
          setSnapActive(true);
          return p;
        }
      }
    }
    setSnapActive(false);
    return p;
  }, [workArea, allKeyframesList]);

  // Scrubbing handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    const p = getProgressFromClientX(e.clientX, true);
    onSeekProgress(p);
    if (onPlaySound) onPlaySound(600, 0.015);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    // 1. Dragging Work Area In/Out Brackets
    if (draggingWorkArea) {
      const p = getProgressFromClientX(e.clientX, false);
      if (draggingWorkArea === 'in') {
        onSetWorkArea?.(Math.min(p, workArea.outPoint - 0.05), workArea.outPoint);
      } else if (draggingWorkArea === 'out') {
        onSetWorkArea?.(workArea.inPoint, Math.max(p, workArea.inPoint + 0.05));
      }
      return;
    }

    // 2. Dragging Keyframe Diamond
    if (draggingKeyframe) {
      const p = getProgressFromClientX(e.clientX, false);
      const clamped = Math.max(0, Math.min(1, Number(p.toFixed(3))));
      onMoveKeyframe?.(draggingKeyframe.trackId, draggingKeyframe.kfId, clamped);
      return;
    }

    // 3. Playhead Scrubbing
    if (!isScrubbing) return;
    const p = getProgressFromClientX(e.clientX, true);
    onSeekProgress(p);
  }, [isScrubbing, draggingWorkArea, draggingKeyframe, getProgressFromClientX, onSeekProgress, onSetWorkArea, onMoveKeyframe, workArea]);

  const handlePointerUp = useCallback(() => {
    setIsScrubbing(false);
    setDraggingWorkArea(null);
    setDraggingKeyframe(null);
  }, []);

  useEffect(() => {
    if (isScrubbing || draggingWorkArea || draggingKeyframe) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isScrubbing, draggingWorkArea, draggingKeyframe, handlePointerMove, handlePointerUp]);

  // Find nearest keyframe across all tracks
  const nearestKeyframe = useMemo(() => {
    let closestMatch: { kf: TimelineKeyframe; diff: number; trackName: string } | null = null;
    for (const item of allKeyframesList) {
      const diff = Math.abs(item.kf.timeRatio - currentProgress);
      if (!closestMatch || diff < closestMatch.diff) {
        closestMatch = { kf: item.kf, diff, trackName: item.trackName };
      }
    }
    if (closestMatch && closestMatch.diff < 0.02) {
      return closestMatch;
    }
    return null;
  }, [allKeyframesList, currentProgress]);

  return (
    <footer
      style={{ height: `${height}px` }}
      className="bg-[#090b10] border-t border-[#1f2430] flex flex-col z-30 select-none flex-shrink-0 overflow-hidden"
    >
      {/* Top Playback Transport Bar */}
      <div className="h-10 px-3.5 bg-[#0d0f15] border-b border-[#1f2430] flex items-center justify-between gap-4 flex-shrink-0">
        
        {/* Left Transport Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Rewind / Reset to 0s or In Point */}
          <Tooltip content="Rewind to In-Point (Home)" shortcut="Home" side="top">
            <button
              onClick={onJumpStart}
              aria-label="Rewind to In-Point"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-300 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <RotateCcw size={11} />
            </button>
          </Tooltip>

          {/* Jump Previous Keyframe */}
          <Tooltip content="Jump to Previous Keyframe" shortcut="J" side="top">
            <button
              onClick={onJumpPrevKeyframe || onJumpStart}
              aria-label="Previous Keyframe"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <SkipBack size={12} />
            </button>
          </Tooltip>

          {/* Step Back 1 Frame */}
          <Tooltip content="Step Back 1 Frame (1/60s)" shortcut="←" side="top">
            <button
              onClick={onStepBack}
              aria-label="Step Back 1 Frame"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </Tooltip>

          {/* Master Play / Pause Button */}
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

          {/* Step Forward 1 Frame */}
          <Tooltip content="Step Forward 1 Frame (1/60s)" shortcut="→" side="top">
            <button
              onClick={onStepForward}
              aria-label="Step Forward 1 Frame"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </Tooltip>

          {/* Jump Next Keyframe */}
          <Tooltip content="Jump to Next Keyframe" shortcut="Shift+J" side="top">
            <button
              onClick={onJumpNextKeyframe || onJumpEnd}
              aria-label="Next Keyframe"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <SkipForward size={12} />
            </button>
          </Tooltip>

          <div className="w-[1px] h-4 bg-[#232736] mx-0.5" />

          {/* Add Keyframe Marker Button */}
          {onAddKeyframe && (
            <Tooltip content="Insert Keyframe at Current Time" shortcut="K" side="top">
              <button
                onClick={onAddKeyframe}
                aria-label="Add Keyframe"
                className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-[#ff4e2e] hover:text-white border border-[#232736] rounded-md transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </Tooltip>
          )}

          {/* Loop Mode Toggle with Work Area Indicator */}
          <Tooltip content={isLooping ? `Work Area Loop: ON [${Math.round(workArea.inPoint * 100)}% - ${Math.round(workArea.outPoint * 100)}%]` : "Continuous Loop: Disabled"} shortcut="L" side="top">
            <button
              onClick={onToggleLoop}
              aria-label="Toggle Continuous Loop"
              className={`flex items-center gap-1 px-2 h-7 rounded-md border text-[10px] font-mono transition-colors ${
                isLooping
                  ? 'bg-[#ff4e2e]/15 border-[#ff4e2e] text-[#ff4e2e] font-bold'
                  : 'bg-[#151822] border-[#232736] text-slate-400 hover:text-white'
              }`}
            >
              <Repeat size={11} />
              <span>[{Math.round(workArea.inPoint * 100)}%-{Math.round(workArea.outPoint * 100)}%]</span>
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

        {/* Center Frame & Timecode Readout + Keyframe Selection Inspector Bar */}
        <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold text-slate-100">
          
          {/* Active Selected Keyframe Inspector Strip */}
          {activeSelectedKeyframe ? (
            <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#ff4e2e]/15 border border-[#ff4e2e]/40 text-[#ff4e2e] text-[10px] animate-in fade-in duration-100">
              <span className="font-bold">◆ {activeSelectedKeyframe.kf.label}</span>
              <span className="text-white font-mono">{(activeSelectedKeyframe.kf.timeRatio * duration).toFixed(2)}s</span>
              <button
                onClick={() => onDeleteKeyframe?.(activeSelectedKeyframe.kf.id)}
                className="hover:text-white text-rose-300 p-0.5 rounded ml-1"
                title="Delete Keyframe (Del)"
              >
                <Trash2 size={11} />
              </button>
              <button
                onClick={() => onSelectKeyframe?.(null)}
                className="hover:text-white text-slate-400 p-0.5 rounded"
                title="Deselect"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <>
              {/* Frame Count / Timecode Toggle */}
              <Tooltip content="Click to switch Timecode / Frame count" side="top">
                <button
                  onClick={() => setDisplayMode(m => m === 'time' ? 'frames' : 'time')}
                  className="bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 px-2 py-0.5 rounded text-[8.5px] tracking-wider transition-colors cursor-pointer"
                >
                  FR {String(curFrame).padStart(2, '0')}/{totalFrames}
                </button>
              </Tooltip>
              <span className="text-white text-xs">{formatTime(curSec)}</span>
              <span className="text-slate-500 font-normal">/ {formatTime(duration)}</span>

              {/* Active Keyframe Indicator if near one */}
              {nearestKeyframe && (
                <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-[#ff4e2e]/15 text-[#ff4e2e] border border-[#ff4e2e]/30 flex items-center gap-1 animate-in fade-in duration-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4e2e] animate-pulse" />
                  <span>{nearestKeyframe.kf.label}</span>
                </span>
              )}
            </>
          )}
        </div>

        {/* Right Playback Speed Multipliers & Work Area Reset */}
        <div className="flex items-center gap-1.5">
          {/* Work Area Reset */}
          {(workArea.inPoint > 0 || workArea.outPoint < 1) && (
            <button
              onClick={() => onSetWorkArea?.(0, 1)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reset Work Area to 100%"
            >
              Reset [ ]
            </button>
          )}

          {/* Speed Multipliers */}
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
      </div>

      {/* Main Timeline Scroller */}
      <div className="flex-1 flex overflow-hidden relative bg-[#07080c]">
        
        {/* Left Column: Fixed Channel Headers */}
        <div className="w-44 flex-shrink-0 flex flex-col border-r border-[#1f2430] bg-[#0a0c11] z-20">
          <div className="h-6 px-3 border-b border-[#1f2430] flex items-center justify-between font-mono text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-[#0d0f15]">
            <span>CHANNELS ({displayTracks.length})</span>
            <Eye size={11} className="text-slate-500" />
          </div>

          {/* Track Headers */}
          <div className="flex-1 overflow-y-auto">
            {displayTracks.map(track => (
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
          <div
            ref={rulerTrackRef}
            onPointerDown={handlePointerDown}
            className="h-6 flex bg-[#0c0e14] border-b border-[#1f2430] relative cursor-pointer flex-shrink-0 z-10"
          >
            {/* Tick Grid */}
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_5%)]" />

            {/* Work Area In/Out Loop Range Shading */}
            <div
              className="absolute top-0 bottom-0 bg-cyan-500/10 border-x border-cyan-400/50 pointer-events-none"
              style={{
                left: `${workArea.inPoint * 100}%`,
                width: `${(workArea.outPoint - workArea.inPoint) * 100}%`
              }}
            />

            {/* Draggable In Point Bracket Handle */}
            <div
              className="absolute top-0 bottom-0 w-3 -translate-x-full cursor-ew-resize flex items-center justify-center z-20 group"
              style={{ left: `${workArea.inPoint * 100}%` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setDraggingWorkArea('in');
              }}
            >
              <div className="w-1.5 h-full bg-cyan-400 rounded-l-sm group-hover:bg-cyan-300 shadow-md flex items-center justify-center">
                <span className="text-[6.5px] font-mono font-bold text-black">[</span>
              </div>
            </div>

            {/* Draggable Out Point Bracket Handle */}
            <div
              className="absolute top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center z-20 group"
              style={{ left: `${workArea.outPoint * 100}%` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setDraggingWorkArea('out');
              }}
            >
              <div className="w-1.5 h-full bg-cyan-400 rounded-r-sm group-hover:bg-cyan-300 shadow-md flex items-center justify-center">
                <span className="text-[6.5px] font-mono font-bold text-black">]</span>
              </div>
            </div>

            {/* Timestamps */}
            <span className="absolute bottom-1 left-2 text-[8px] font-mono text-slate-400 pointer-events-none">0.00s</span>
            <span className="absolute bottom-1 left-[25%] -translate-x-1/2 text-[8px] font-mono text-slate-400 pointer-events-none">{(duration * 0.25).toFixed(2)}s</span>
            <span className="absolute bottom-1 left-[50%] -translate-x-1/2 text-[8px] font-mono text-slate-400 pointer-events-none">{(duration * 0.50).toFixed(2)}s</span>
            <span className="absolute bottom-1 left-[75%] -translate-x-1/2 text-[8px] font-mono text-slate-400 pointer-events-none">{(duration * 0.75).toFixed(2)}s</span>
            <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400 pointer-events-none">{duration.toFixed(2)}s</span>
          </div>

          {/* Tracks Area */}
          <div className="flex-1 overflow-y-auto relative">
            {displayTracks.map(track => (
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
                  <span className="truncate pointer-events-none font-semibold">{track.name.split(':')[1] || track.name}</span>

                  {/* Interactive Draggable Keyframe Diamonds */}
                  {track.keyframes.map(kf => {
                    const isSelected = selectedKeyframeId === kf.id;
                    const isNear = Math.abs(kf.timeRatio - currentProgress) < 0.015;
                    return (
                      <Tooltip
                        key={kf.id}
                        content={`[◆] ${kf.label} — ${(kf.timeRatio * duration).toFixed(2)}s (Click to select, drag to retime)`}
                        side="top"
                      >
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            onSelectKeyframe?.(kf.id);
                            onSeekProgress(kf.timeRatio);
                            setDraggingKeyframe({ trackId: track.id, kfId: kf.id });
                            if (onPlaySound) onPlaySound(850, 0.03);
                          }}
                          style={{ left: `${kf.timeRatio * 100}%` }}
                          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 cursor-grab active:cursor-grabbing z-10 transition-transform ${
                            isSelected
                              ? 'bg-[#00e5ff] scale-150 border-2 border-white shadow-[0_0_12px_rgba(0,229,255,1)] ring-2 ring-[#00e5ff]/50'
                              : isNear
                              ? 'bg-[#ff4e2e] scale-150 border-2 border-white shadow-[0_0_8px_rgba(255,78,46,1)]'
                              : 'bg-white border border-black hover:scale-150 hover:bg-[#ff4e2e] hover:border-white'
                          }`}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Unified Laser Scrubber Playhead spanning Ruler + Tracks */}
          <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-30">
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
                  {snapActive && <span className="ml-1 text-cyan-300 font-bold">SNAP</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
