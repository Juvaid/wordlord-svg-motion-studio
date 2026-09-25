import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Compass, 
  Sliders, 
  Clock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Activity, 
  Maximize2,
  Box,
  Layers
} from 'lucide-react';
import { ThreeStudioConfig, ThreePart, ThreeMotionMode } from '../types/threeStudio';
import { WorkArea } from '../types';
import { Tooltip } from './Tooltip';

interface ThreeTimelineFooterProps {
  height: number;
  config: ThreeStudioConfig;
  parts: ThreePart[];
  workArea?: WorkArea;
  soundEnabled?: boolean;
  onUpdateConfig: (partial: Partial<ThreeStudioConfig>) => void;
  onTogglePlay: () => void;
  onResetTime: () => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  onJumpStart?: () => void;
  onJumpEnd?: () => void;
  onSetWorkArea?: (inPoint: number, outPoint: number) => void;
  onToggleSound?: () => void;
  onTogglePartGroupVisibility?: (groupKey: string) => void;
  onPlaySound?: (pitch?: number, dur?: number) => void;
}

export const ThreeTimelineFooter: React.FC<ThreeTimelineFooterProps> = ({
  height,
  config,
  parts,
  workArea = { inPoint: 0.0, outPoint: 1.0 },
  soundEnabled = true,
  onUpdateConfig,
  onTogglePlay,
  onResetTime,
  onStepBack,
  onStepForward,
  onJumpStart,
  onJumpEnd,
  onSetWorkArea,
  onToggleSound,
  onTogglePartGroupVisibility,
  onPlaySound
}) => {
  const rulerTrackRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingWorkArea, setDraggingWorkArea] = useState<'in' | 'out' | null>(null);
  const [displayMode, setDisplayMode] = useState<'time' | 'frames'>('time');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [snapActive, setSnapActive] = useState<boolean>(false);

  const duration = config.duration || 4.0;
  const curTime = config.time || 0;
  const progressRatio = duration > 0 ? Math.max(0, Math.min(1, curTime / duration)) : 0;
  const totalFrames = Math.max(1, Math.round(duration * 60));
  const curFrame = Math.round(progressRatio * totalFrames);

  // Timecode formatting: mm:ss.ms
  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 100);
    return `00:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  // Compute 3D Motion Phase Keyframes for active motion
  const motionPhaseKeyframes = useMemo(() => {
    switch (config.motionMode) {
      case 'turntable':
        return [
          { timeRatio: 0.0, label: 'Ignition (0°)' },
          { timeRatio: 0.25, label: 'Quarter Turn (90°)' },
          { timeRatio: 0.50, label: 'Full Inversion (180°)' },
          { timeRatio: 0.75, label: 'Profile Return (270°)' },
          { timeRatio: 1.0, label: 'Cycle Settle (360°)' }
        ];
      case 'wave':
        return [
          { timeRatio: 0.0, label: 'Harmonic Rest 0' },
          { timeRatio: 0.25, label: 'Crest Apex (+Z)' },
          { timeRatio: 0.50, label: 'Zero Crossing' },
          { timeRatio: 0.75, label: 'Trough Deep (-Z)' },
          { timeRatio: 1.0, label: 'Harmonic Loop' }
        ];
      case 'reveal':
        return [
          { timeRatio: 0.0, label: 'Void Baseline' },
          { timeRatio: 0.35, label: 'Extrusion Rise' },
          { timeRatio: 0.70, label: 'Spring Overshoot' },
          { timeRatio: 1.0, label: 'Monolith Lock' }
        ];
      case 'sweep':
        return [
          { timeRatio: 0.0, label: 'Azimuth Flare Left' },
          { timeRatio: 0.50, label: 'Specular Core Glint' },
          { timeRatio: 1.0, label: 'Rim Sweep Right' }
        ];
      case 'explode':
        return [
          { timeRatio: 0.0, label: 'Solid Core Matrix' },
          { timeRatio: 0.50, label: 'Displacement Apex' },
          { timeRatio: 1.0, label: 'Gravitational Pull' }
        ];
      case 'camera':
        return [
          { timeRatio: 0.0, label: 'Dolly Camera In' },
          { timeRatio: 0.50, label: 'Low-Angle Hero' },
          { timeRatio: 1.0, label: 'Return Orbit' }
        ];
      case 'sync2d':
        return [
          { timeRatio: 0.0, label: '2D Flat Alignment' },
          { timeRatio: 0.50, label: '3D Extrusion Pop' },
          { timeRatio: 1.0, label: 'Synchronized State' }
        ];
      default:
        return [
          { timeRatio: 0.0, label: 'Start' },
          { timeRatio: 0.50, label: 'Midpoint' },
          { timeRatio: 1.0, label: 'End' }
        ];
    }
  }, [config.motionMode]);

  // Define 6 Production 3D Tracks
  const threeTracks = useMemo(() => [
    {
      id: 'camera',
      name: '0: Camera & Stage',
      color: '#38bdf8',
      startRatio: 0.0,
      widthRatio: 1.0,
      visible: true,
      keyframes: motionPhaseKeyframes
    },
    {
      id: 'word',
      name: '1: Word Meshes (W,O,R)',
      color: '#ff4e2e',
      startRatio: 0.0,
      widthRatio: 0.95,
      visible: parts.some(p => ['W', 'O', 'R'].includes(p.name) && p.visible),
      keyframes: [
        { timeRatio: 0.05, label: 'W Ignition' },
        { timeRatio: 0.30, label: 'Word Inversion' },
        { timeRatio: 0.70, label: 'Word Stabilize' }
      ]
    },
    {
      id: 'lord',
      name: '2: Lord Meshes (L,O,R)',
      color: '#fb923c',
      startRatio: 0.15,
      widthRatio: 0.85,
      visible: parts.some(p => ['L', 'O', 'R'].includes(p.name) && p.visible),
      keyframes: [
        { timeRatio: 0.20, label: 'Lord Cascade' },
        { timeRatio: 0.55, label: 'Lord Alignment' },
        { timeRatio: 0.85, label: 'Lord Settle' }
      ]
    },
    {
      id: 'ligature',
      name: '3: Tall D Ligature',
      color: '#facc15',
      startRatio: 0.25,
      widthRatio: 0.75,
      visible: parts.some(p => p.name === 'D' && p.visible),
      keyframes: [
        { timeRatio: 0.30, label: 'Monolith Drop' },
        { timeRatio: 0.60, label: 'Clamp Lock' },
        { timeRatio: 0.90, label: 'Stable Anchor' }
      ]
    },
    {
      id: 'media',
      name: '4: Media Glyph Group',
      color: '#ec4899',
      startRatio: 0.40,
      widthRatio: 0.60,
      visible: parts.some(p => ['M', 'E', 'D', 'I', 'A'].includes(p.name) && p.visible),
      keyframes: [
        { timeRatio: 0.45, label: 'Subline Reveal' },
        { timeRatio: 0.75, label: 'Glow Apex' },
        { timeRatio: 0.98, label: 'Full Stance' }
      ]
    },
    {
      id: 'lighting',
      name: '5: PBR Light Rig & Bloom',
      color: '#a855f7',
      startRatio: 0.0,
      widthRatio: 1.0,
      visible: config.bloomEnabled,
      keyframes: [
        { timeRatio: 0.10, label: 'Key Azimuth' },
        { timeRatio: 0.50, label: 'Specular Rim' },
        { timeRatio: 0.90, label: 'Ambient Glow' }
      ]
    }
  ], [parts, motionPhaseKeyframes, config.bloomEnabled]);

  // Progress from mouse X with magnetic snap
  const getProgressFromClientX = useCallback((clientX: number, snap = true) => {
    if (!rulerTrackRef.current) return 0;
    const rect = rulerTrackRef.current.getBoundingClientRect();
    let p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    if (snap) {
      // Find nearest snap target
      const snapTargets = [
        0, 
        workArea.inPoint, 
        workArea.outPoint, 
        1, 
        ...motionPhaseKeyframes.map(k => k.timeRatio)
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
  }, [workArea, motionPhaseKeyframes]);

  // Scrubbing handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    const p = getProgressFromClientX(e.clientX, true);
    onUpdateConfig({ time: p * duration, isPlaying: false });
    if (onPlaySound) onPlaySound(600, 0.015);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (draggingWorkArea) {
      const p = getProgressFromClientX(e.clientX, false);
      if (draggingWorkArea === 'in') {
        onSetWorkArea?.(Math.min(p, workArea.outPoint - 0.05), workArea.outPoint);
      } else if (draggingWorkArea === 'out') {
        onSetWorkArea?.(workArea.inPoint, Math.max(p, workArea.inPoint + 0.05));
      }
      return;
    }

    if (!isScrubbing) return;
    const p = getProgressFromClientX(e.clientX, true);
    onUpdateConfig({ time: p * duration });
  }, [isScrubbing, draggingWorkArea, getProgressFromClientX, duration, onUpdateConfig, workArea, onSetWorkArea]);

  const handlePointerUp = useCallback(() => {
    setIsScrubbing(false);
    setDraggingWorkArea(null);
  }, []);

  useEffect(() => {
    if (isScrubbing || draggingWorkArea) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isScrubbing, draggingWorkArea, handlePointerMove, handlePointerUp]);

  return (
    <footer 
      className="bg-[#090b10] border-t border-[#1f2430] flex flex-col z-30 select-none overflow-hidden"
      style={{ height: `${height}px` }}
    >
      {/* Top Playback Transport Toolbar */}
      <div className="h-10 px-3.5 bg-[#0d0f15] border-b border-[#1f2430] flex items-center justify-between gap-4 flex-shrink-0">
        
        {/* Left: Transport Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Rewind */}
          <Tooltip content="Rewind to In-Point (Home)" shortcut="Home" side="top">
            <button
              onClick={onJumpStart || onResetTime}
              aria-label="Rewind to In-Point"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-300 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <RotateCcw size={11} />
            </button>
          </Tooltip>

          {/* Jump Prev Keyframe */}
          <Tooltip content="Jump to Previous Phase (J)" shortcut="J" side="top">
            <button
              onClick={() => {
                const prev = [...motionPhaseKeyframes].reverse().find(k => k.timeRatio < progressRatio - 0.02);
                const target = prev ? prev.timeRatio : workArea.inPoint;
                onUpdateConfig({ time: target * duration });
                if (onPlaySound) onPlaySound(700, 0.02);
              }}
              aria-label="Previous Phase"
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

          {/* Primary Play / Pause Button */}
          <Tooltip content={config.isPlaying ? "Pause 3D Stream (Space)" : "Play 3D Stream (Space)"} shortcut="Space" side="top">
            <button
              onClick={onTogglePlay}
              aria-label={config.isPlaying ? "Pause 3D" : "Play 3D"}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all shadow-md ${
                config.isPlaying
                  ? 'bg-[#151822] text-[#ff4e2e] border border-[#ff4e2e]'
                  : 'bg-[#ff4e2e] text-white hover:bg-[#ff6144]'
              }`}
            >
              {config.isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
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
          <Tooltip content="Jump to Next Phase (Shift+J)" shortcut="Shift+J" side="top">
            <button
              onClick={() => {
                const next = motionPhaseKeyframes.find(k => k.timeRatio > progressRatio + 0.02);
                const target = next ? next.timeRatio : workArea.outPoint;
                onUpdateConfig({ time: target * duration });
                if (onPlaySound) onPlaySound(700, 0.02);
              }}
              aria-label="Next Phase"
              className="w-7 h-7 flex items-center justify-center bg-[#151822] hover:bg-[#1f2432] text-slate-400 hover:text-white border border-[#232736] rounded-md transition-colors"
            >
              <SkipForward size={12} />
            </button>
          </Tooltip>

          <div className="w-[1px] h-4 bg-[#232736] mx-0.5" />

          {/* Loop Mode Indicator */}
          <Tooltip content="3D Work Area Loop: Active" shortcut="L" side="top">
            <div className="px-2 py-1 rounded bg-[#ff4e2e]/15 border border-[#ff4e2e]/30 text-[#ff4e2e] flex items-center gap-1 text-[10px] font-mono">
              <Repeat size={11} />
              <span>LOOP [{Math.round(workArea.inPoint * 100)}%-{Math.round(workArea.outPoint * 100)}%]</span>
            </div>
          </Tooltip>

          {/* Audio Clicks Toggle */}
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

        {/* Center: Frame & Timecode Readout */}
        <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold text-slate-100">
          <Tooltip content="Click to switch Timecode / Frame count" side="top">
            <button
              onClick={() => setDisplayMode(m => m === 'time' ? 'frames' : 'time')}
              className="bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 px-2 py-0.5 rounded text-[8.5px] tracking-wider transition-colors cursor-pointer"
            >
              FR {String(curFrame).padStart(2, '0')}/{totalFrames}
            </button>
          </Tooltip>
          <span className="text-white text-xs">{formatTime(curTime)}</span>
          <span className="text-slate-500 font-normal">/ {formatTime(duration)}</span>

          {/* Active Motion Mode Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#121520] border border-[#23293a] text-[10px] font-mono">
            <Activity size={11} className="text-[#ff4e2e]" />
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-white font-bold uppercase">{config.motionMode}</span>
          </div>
        </div>

        {/* Right: Dynamics Controls, Gyro Tilt & Speed */}
        <div className="flex items-center gap-2">
          {/* Gyro Cursor Tilt Reaction Toggle */}
          <button
            onClick={() => onUpdateConfig({ gyroEnabled: !config.gyroEnabled })}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[9.5px] font-mono transition-colors ${
              config.gyroEnabled
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={11} />
            <span>Gyro Tilt</span>
          </button>

          {/* Speed Switcher */}
          <div className="flex items-center bg-[#151822] border border-[#232736] rounded-md p-0.5 gap-0.5">
            {[0.5, 1.0, 1.5, 2.0].map(s => (
              <button
                key={s}
                onClick={() => onUpdateConfig({ speed: s })}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors ${
                  config.speed === s ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset Work Area Button */}
          {(workArea.inPoint > 0 || workArea.outPoint < 1) && (
            <button
              onClick={() => onSetWorkArea?.(0, 1)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reset Work Area to 100%"
            >
              Reset [ ]
            </button>
          )}
        </div>
      </div>

      {/* Main Multi-Track Sequencer Area */}
      <div className="flex-1 flex overflow-hidden relative bg-[#07080c]">
        
        {/* Left Column: 3D Part Channels */}
        <div className="w-44 flex-shrink-0 flex flex-col border-r border-[#1f2430] bg-[#0a0c11] z-20">
          <div className="h-6 px-3 border-b border-[#1f2430] flex items-center justify-between font-mono text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-[#0d0f15]">
            <span>3D CHANNELS ({threeTracks.length})</span>
            <Layers size={11} className="text-slate-500" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {threeTracks.map(track => (
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

                {onTogglePartGroupVisibility && track.id !== 'camera' && track.id !== 'lighting' ? (
                  <button
                    onClick={() => onTogglePartGroupVisibility(track.id)}
                    className={`p-1 rounded transition-colors ${
                      track.visible ? 'text-[#38bdf8] hover:text-white' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={track.visible ? `Hide ${track.name}` : `Show ${track.name}`}
                  >
                    {track.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>
                ) : (
                  <span className="text-[8px] font-mono text-slate-600">3D</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Time Ruler, Work Area, Tracks & Laser Playhead */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Top Time Ruler Bar */}
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
            {threeTracks.map(track => (
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

                  {/* Phase Keyframe Diamonds with Tooltips */}
                  {track.keyframes.map((kf, kfIdx) => {
                    const isNear = Math.abs(kf.timeRatio - progressRatio) < 0.015;
                    return (
                      <Tooltip
                        key={kfIdx}
                        content={`[◆] ${kf.label} — ${(kf.timeRatio * duration).toFixed(2)}s (Click to jump)`}
                        side="top"
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateConfig({ time: kf.timeRatio * duration });
                            if (onPlaySound) onPlaySound(850, 0.03);
                          }}
                          style={{ left: `${kf.timeRatio * 100}%` }}
                          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 cursor-pointer z-10 transition-transform ${
                            isNear
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
              style={{ left: `${progressRatio * 100}%` }}
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
                  {curTime.toFixed(2)}s • FR {curFrame}
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
