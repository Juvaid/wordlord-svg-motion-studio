import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  Gauge, 
  Clock, 
  Sliders,
  Activity,
  Layers
} from 'lucide-react';
import { ThreeStudioConfig, ThreeMotionMode } from '../types/threeStudio';

interface ThreeTimelineFooterProps {
  height: number;
  config: ThreeStudioConfig;
  onUpdateConfig: (partial: Partial<ThreeStudioConfig>) => void;
  onTogglePlay: () => void;
  onResetTime: () => void;
}

export const ThreeTimelineFooter: React.FC<ThreeTimelineFooterProps> = ({
  height,
  config,
  onUpdateConfig,
  onTogglePlay,
  onResetTime
}) => {
  const progressRatio = config.duration > 0 ? config.time / config.duration : 0;

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateConfig({ time: val * config.duration, isPlaying: false });
  };

  return (
    <footer 
      className="bg-[#0c0e14] border-t border-[#1f2430] flex flex-col z-30 select-none overflow-hidden"
      style={{ height }}
    >
      {/* Top Playback Transport Toolbar */}
      <div className="h-10 border-b border-[#1f2430] flex items-center justify-between px-4 bg-[#090b10] flex-shrink-0">
        
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Rewind */}
          <button
            onClick={onResetTime}
            title="Rewind to 0:00"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <RotateCcw size={13} />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-md ${
              config.isPlaying
                ? 'bg-[#ff4e2e] text-white shadow-[#ff4e2e]/25'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            {config.isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            <span>{config.isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Time Counter Badge */}
          <div className="px-2.5 py-0.5 rounded bg-black/50 border border-white/5 font-mono text-[11px] text-slate-300">
            <span className="text-white font-bold">{config.time.toFixed(2)}s</span>
            <span className="text-slate-500"> / {config.duration.toFixed(2)}s</span>
          </div>
        </div>

        {/* Center: Active Motion Mode Badge */}
        <div className="flex items-center gap-2 bg-[#121520] border border-[#23293a] px-3 py-1 rounded-full text-xs font-mono">
          <Activity size={12} className="text-[#ff4e2e]" />
          <span className="text-slate-400 text-[10px] uppercase">Engine:</span>
          <span className="text-white font-bold text-[10.5px] uppercase">{config.motionMode}</span>
        </div>

        {/* Right: Motion Amplitude, Speed & Gyro Toggles */}
        <div className="flex items-center gap-3">
          {/* Gyro Cursor Tilt Reaction Toggle */}
          <button
            onClick={() => onUpdateConfig({ gyroEnabled: !config.gyroEnabled })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] font-mono transition-colors ${
              config.gyroEnabled
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Compass size={11} />
            <span>Gyro Tilt</span>
          </button>

          {/* Playback Speed Switcher */}
          <div className="flex items-center bg-[#131722] border border-[#232838] rounded p-0.5">
            {[0.5, 1.0, 1.5, 2.0].map(s => (
              <button
                key={s}
                onClick={() => onUpdateConfig({ speed: s })}
                className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono transition-colors ${
                  config.speed === s ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrubber & Timeline Tracks Area */}
      <div className="flex-1 flex flex-col p-4 gap-3 bg-[#0a0c10]">
        
        {/* Scrubber Slider Track */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400">
            <span>0.00s</span>
            <span className="text-[#ff4e2e] font-bold">{(progressRatio * 100).toFixed(0)}% Normalized Loop</span>
            <span>{config.duration.toFixed(2)}s</span>
          </div>

          <div className="relative w-full flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progressRatio}
              onChange={handleScrubberChange}
              className="w-full accent-[#ff4e2e] cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Global Animation Dynamics Sliders */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          {/* Loop Duration */}
          <div className="flex items-center justify-between bg-[#121520] border border-[#202534] rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400" />
              <span className="text-xs font-mono text-slate-300">Loop Duration:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={config.duration}
                onChange={(e) => onUpdateConfig({ duration: parseFloat(e.target.value) })}
                className="w-24 accent-[#ff4e2e] cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <span className="text-xs font-mono font-bold text-white w-10 text-right">
                {config.duration.toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Motion Amplitude */}
          <div className="flex items-center justify-between bg-[#121520] border border-[#202534] rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <Sliders size={13} className="text-slate-400" />
              <span className="text-xs font-mono text-slate-300">Motion Amplitude:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={config.amplitude}
                onChange={(e) => onUpdateConfig({ amplitude: parseFloat(e.target.value) })}
                className="w-24 accent-[#ff4e2e] cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <span className="text-xs font-mono font-bold text-white w-10 text-right">
                {config.amplitude.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
