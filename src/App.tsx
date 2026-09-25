import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { LeftLibrary } from './components/LeftLibrary';
import { StageViewport } from './components/StageViewport';
import { RightInspector } from './components/RightInspector';
import { TimelineFooter } from './components/TimelineFooter';
import { ExportModal } from './components/ExportModal';
import { VideoExportModal } from './components/VideoExportModal';
import { PanelResizer } from './components/PanelResizer';
import { MOTIONS } from './data/motions';
import { STYLES } from './data/styles';
import { playTick, playWhoosh } from './utils/audio';
import { 
  MotionPreset, 
  StylePreset, 
  BezierPoints, 
  PlaybackMode, 
  GeometryMode, 
  BackgroundMode,
  TimelineTrack 
} from './types';

export const App: React.FC = () => {
  // 1. Studio State
  const [activeMotionId, setActiveMotionId] = useState<string>('typewriter');
  const [activeStyleId, setActiveStyleId] = useState<string>('signature');
  const [animKey, setAnimKey] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0.95);
  const [stagger, setStagger] = useState<number>(60);
  const [bezier, setBezier] = useState<BezierPoints>({ p1: { x: 0.16, y: 1.0 }, p2: { x: 0.3, y: 1.0 } });
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('loop');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Resizable Panels State
  const [leftWidth, setLeftWidth] = useState<number>(290);
  const [rightWidth, setRightWidth] = useState<number>(320);
  const [timelineHeight, setTimelineHeight] = useState<number>(210);

  // Optics & 3D
  const [glowRadius, setGlowRadius] = useState<number>(20);
  const [glowIntensity, setGlowIntensity] = useState<number>(100);
  const [geometryMode, setGeometryMode] = useState<GeometryMode>('fill');
  const [strokeWidth, setStrokeWidth] = useState<number>(1.0);
  const [tiltX, setTiltX] = useState<number>(0);
  const [tiltY, setTiltY] = useState<number>(0);

  // Viewport
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [bgMode, setBgMode] = useState<BackgroundMode>('dark');

  // Library Navigation
  const [activeTab, setActiveTab] = useState<'motions' | 'styles' | 'glyphs'>('motions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Color Overrides
  const [colors, setColors] = useState({
    word: '#ffffff',
    lord: '#ffffff',
    ligature: '#ffffff',
    media: '#ff4e2e'
  });

  // Layer Visibility
  const [layerVisibility, setLayerVisibility] = useState({
    master: true,
    word: true,
    lord: true,
    ligature: true,
    media: true,
    glow: true
  });

  // Modals & Toast
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isVideoExportOpen, setIsVideoExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeMotion = MOTIONS.find(m => m.id === activeMotionId) || MOTIONS[0];
  const activeStyle = STYLES.find(s => s.id === activeStyleId) || STYLES[0];
  const easeFormula = `cubic-bezier(${bezier.p1.x.toFixed(2)}, ${bezier.p1.y.toFixed(2)}, ${bezier.p2.x.toFixed(2)}, ${bezier.p2.y.toFixed(2)})`;

  // Notification Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // Multi-Track Timeline Lanes State
  const [userTracks, setUserTracks] = useState<TimelineTrack[]>([
    {
      id: 'master',
      name: '0: Master Stage',
      groupKey: 'master',
      color: '#00ffff',
      visible: true,
      locked: false,
      startRatio: 0,
      widthRatio: 1,
      keyframes: [
        { id: 'kf-m0', timeRatio: 0, label: 'Sequence Trigger' },
        { id: 'kf-m1', timeRatio: 0.25, label: 'Initial Impact' },
        { id: 'kf-m2', timeRatio: 0.5, label: 'Midpoint Align' },
        { id: 'kf-m3', timeRatio: 0.75, label: 'Settle Decay' },
        { id: 'kf-m4', timeRatio: 1.0, label: 'Resolved Lockup' }
      ]
    },
    {
      id: 'word',
      name: '1: WORD (W,O,R)',
      groupKey: 'word',
      color: colors.word,
      visible: true,
      locked: false,
      startRatio: 0.04,
      widthRatio: 0.52,
      keyframes: [
        { id: 'kf-w0', timeRatio: 0.05, label: 'W Cascade' },
        { id: 'kf-w1', timeRatio: 0.3, label: 'O / R Settle' },
        { id: 'kf-w2', timeRatio: 0.55, label: 'WORD Complete' }
      ]
    },
    {
      id: 'lord',
      name: '2: LORD (L,O,R)',
      groupKey: 'lord',
      color: colors.lord,
      visible: true,
      locked: false,
      startRatio: 0.2,
      widthRatio: 0.52,
      keyframes: [
        { id: 'kf-l0', timeRatio: 0.22, label: 'L Drop' },
        { id: 'kf-l1', timeRatio: 0.45, label: 'LORD Alignment' },
        { id: 'kf-l2', timeRatio: 0.72, label: 'LORD Baseline' }
      ]
    },
    {
      id: 'ligature',
      name: '3: TALL D Ligature',
      groupKey: 'ligature',
      color: colors.ligature,
      visible: true,
      locked: false,
      startRatio: 0.3,
      widthRatio: 0.56,
      keyframes: [
        { id: 'kf-d0', timeRatio: 0.32, label: 'Drop Begin' },
        { id: 'kf-d1', timeRatio: 0.48, label: 'Monolith Clamp Lock' },
        { id: 'kf-d2', timeRatio: 0.86, label: 'Stable Composure' }
      ]
    },
    {
      id: 'media',
      name: '4: MEDIA Subline',
      groupKey: 'media',
      color: colors.media,
      visible: true,
      locked: false,
      startRatio: 0.45,
      widthRatio: 0.52,
      keyframes: [
        { id: 'kf-me0', timeRatio: 0.48, label: 'Subline Reveal' },
        { id: 'kf-me1', timeRatio: 0.65, label: 'Red Accent Ignite' },
        { id: 'kf-me2', timeRatio: 0.97, label: 'Full Brand Anchor' }
      ]
    },
    {
      id: 'glow',
      name: '5: Volumetric Aura',
      groupKey: 'glow',
      color: '#ff4e2e',
      visible: true,
      locked: false,
      startRatio: 0.4,
      widthRatio: 0.6,
      keyframes: [
        { id: 'kf-g0', timeRatio: 0.4, label: 'Aura Pulse Ignition' },
        { id: 'kf-g1', timeRatio: 0.7, label: 'Peak Volumetric Bloom' },
        { id: 'kf-g2', timeRatio: 1.0, label: 'Ambient Radiance' }
      ]
    }
  ]);

  // Sync track visibility and colors with state
  const tracks: TimelineTrack[] = userTracks.map(t => ({
    ...t,
    visible: layerVisibility[t.id as keyof typeof layerVisibility] ?? true,
    color: t.id === 'word' ? colors.word : t.id === 'lord' ? colors.lord : t.id === 'ligature' ? colors.ligature : t.id === 'media' ? colors.media : t.color
  }));

  // Scrubbing & Seeking Animation Engine
  const seekToProgress = useCallback((progress: number, fromLoop = false) => {
    const p = Math.max(0, Math.min(1, progress));
    setCurrentProgress(p);

    const stage = document.getElementById('stage-wrapper');
    if (!stage) return;

    const anims = stage.getAnimations({ subtree: true });
    const targetMs = p * duration * 1000;

    if (anims && anims.length > 0) {
      anims.forEach(anim => {
        if (!fromLoop) anim.pause();
        try {
          anim.currentTime = targetMs;
        } catch {
          // ignore
        }
      });
    } else {
      // CSS negative delay fallback
      const curSec = p * duration;
      stage.style.animationPlayState = 'paused';
      stage.style.animationDelay = `-${curSec}s`;
      stage.querySelectorAll('[data-glyph], #laser-sweep-rect, #main-stage-svg, #media-glow-layer').forEach(el => {
        const h = el as HTMLElement;
        h.style.animationPlayState = 'paused';
        h.style.animationDelay = `-${curSec}s`;
      });
    }
  }, [duration]);

  // Re-trigger animation cleanly
  const restartAnimation = useCallback(() => {
    setAnimKey(k => k + 1);
    const stage = document.getElementById('stage-wrapper');
    if (!stage) return;

    stage.classList.remove(activeMotion.animClass);
    void stage.offsetWidth;
    stage.classList.add(activeMotion.animClass);

    stage.style.animationPlayState = 'running';
    stage.style.animationDelay = '0s';
    stage.querySelectorAll('[data-glyph], #laser-sweep-rect, #main-stage-svg, #media-glow-layer').forEach(el => {
      const h = el as HTMLElement;
      h.style.animationPlayState = 'running';
      h.style.animationDelay = '';
    });
  }, [activeMotion.animClass]);

  // Full Rewind & Reset to 0:00 (Beginning)
  const handleResetToStart = useCallback(() => {
    setIsPlaying(false);
    if (tlRafRef.current) cancelAnimationFrame(tlRafRef.current);
    seekToProgress(0);
    setAnimKey(k => k + 1);
    playTick(soundEnabled, 600, 0.02);
    showToast('Rewound to 0:00 (Start)');
  }, [seekToProgress, soundEnabled, showToast]);

  // Playback Loop
  const tlRafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    restartAnimation();
    startTimeRef.current = null;
    playTick(soundEnabled, 700, 0.02);
  }, [restartAnimation, soundEnabled]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (tlRafRef.current) cancelAnimationFrame(tlRafRef.current);
    const stage = document.getElementById('stage-wrapper');
    if (stage) {
      stage.getAnimations({ subtree: true }).forEach(a => a.pause());
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  }, [isPlaying, stopPlayback, startPlayback]);

  // Jump to Previous Keyframe
  const handleJumpPrevKeyframe = useCallback(() => {
    stopPlayback();
    const allKeyframes: number[] = [];
    tracks.forEach(t => t.keyframes.forEach(kf => allKeyframes.push(kf.timeRatio)));
    allKeyframes.sort((a, b) => a - b);

    // Find keyframe strictly before currentProgress - 0.01
    const prev = [...allKeyframes].reverse().find(t => t < currentProgress - 0.015);
    const target = prev !== undefined ? prev : 0;
    seekToProgress(target);
    playTick(soundEnabled, 800, 0.02);
    showToast(`Jump: ${(target * duration).toFixed(2)}s`);
  }, [tracks, currentProgress, duration, seekToProgress, soundEnabled, showToast, stopPlayback]);

  // Jump to Next Keyframe
  const handleJumpNextKeyframe = useCallback(() => {
    stopPlayback();
    const allKeyframes: number[] = [];
    tracks.forEach(t => t.keyframes.forEach(kf => allKeyframes.push(kf.timeRatio)));
    allKeyframes.sort((a, b) => a - b);

    // Find keyframe strictly after currentProgress + 0.01
    const next = allKeyframes.find(t => t > currentProgress + 0.015);
    const target = next !== undefined ? next : 1;
    seekToProgress(target);
    playTick(soundEnabled, 850, 0.02);
    showToast(`Jump: ${(target * duration).toFixed(2)}s`);
  }, [tracks, currentProgress, duration, seekToProgress, soundEnabled, showToast, stopPlayback]);

  // Add Keyframe at Current Timecode
  const handleAddKeyframe = useCallback(() => {
    const curTime = (currentProgress * duration).toFixed(2);
    const newKf = {
      id: `kf-user-${Date.now()}`,
      timeRatio: currentProgress,
      label: `Mark @ ${curTime}s`
    };

    setUserTracks(prev => {
      return prev.map(t => {
        if (t.id === 'master') {
          return {
            ...t,
            keyframes: [...t.keyframes, newKf].sort((a, b) => a.timeRatio - b.timeRatio)
          };
        }
        return t;
      });
    });

    playTick(soundEnabled, 900, 0.03);
    showToast(`Added Keyframe at ${curTime}s`);
  }, [currentProgress, duration, soundEnabled, showToast]);

  useEffect(() => {
    if (!isPlaying) return;

    const loop = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - (currentProgress * duration * 1000 / playbackSpeed);
      }

      const elapsed = (timestamp - startTimeRef.current) * playbackSpeed;
      const durMs = duration * 1000;
      let p = elapsed / durMs;

      if (p >= 1) {
        if (isLooping || playbackMode === 'loop') {
          startTimeRef.current = timestamp;
          p = 0;
          playWhoosh(soundEnabled);
          restartAnimation();
        } else {
          stopPlayback();
          seekToProgress(1, false);
          return;
        }
      }

      seekToProgress(p, true);
      tlRafRef.current = requestAnimationFrame(loop);
    };

    tlRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (tlRafRef.current) cancelAnimationFrame(tlRafRef.current);
    };
  }, [isPlaying, isLooping, playbackMode, playbackSpeed, duration, currentProgress, restartAnimation, seekToProgress, stopPlayback, soundEnabled]);

  // Keyboard Shortcuts: Space, 0/Home, Escape, R, V, E, J, K, Shift+J, L, M, Arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        seekToProgress(0);
        restartAnimation();
        playTick(soundEnabled, 700, 0.02);
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        setIsVideoExportOpen(true);
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        setIsLooping(l => !l);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setSoundEnabled(s => !s);
      } else if (e.code === 'KeyJ') {
        e.preventDefault();
        if (e.shiftKey) handleJumpNextKeyframe();
        else handleJumpPrevKeyframe();
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        handleAddKeyframe();
      } else if (e.code === 'Digit1') {
        setBgMode('dark');
      } else if (e.code === 'Digit2') {
        setBgMode('radial');
      } else if (e.code === 'Digit3') {
        setBgMode('grid');
      } else if (e.code === 'Digit0' || e.code === 'Home' || e.code === 'Escape') {
        e.preventDefault();
        handleResetToStart();
      } else if (e.code === 'End') {
        e.preventDefault();
        stopPlayback();
        seekToProgress(1);
      } else if (e.code === 'ArrowLeft' || e.code === 'Comma') {
        e.preventDefault();
        stopPlayback();
        seekToProgress(Math.max(0, currentProgress - (1/60)/duration));
      } else if (e.code === 'ArrowRight' || e.code === 'Period') {
        e.preventDefault();
        stopPlayback();
        seekToProgress(Math.min(1, currentProgress + (1/60)/duration));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, seekToProgress, restartAnimation, stopPlayback, handleResetToStart, handleJumpPrevKeyframe, handleJumpNextKeyframe, handleAddKeyframe, currentProgress, duration, soundEnabled]);

  // Handle Preset Switching
  const handleSelectMotion = (m: MotionPreset) => {
    setActiveMotionId(m.id);
    setDuration(m.defaultDuration);
    setStagger(m.defaultStagger);
    // Parse easing
    if (m.defaultEase.includes('cubic-bezier')) {
      const parts = m.defaultEase.match(/cubic-bezier\(([^)]+)\)/);
      if (parts && parts[1]) {
        const [p1x, p1y, p2x, p2y] = parts[1].split(',').map(s => parseFloat(s.trim()));
        setBezier({ p1: { x: p1x, y: p1y }, p2: { x: p2x, y: p2y } });
      }
    }
    seekToProgress(0);
    restartAnimation();
    playTick(soundEnabled, 800, 0.02);
    showToast(`Motion: ${m.name}`);
  };

  const handleSelectStyle = (s: StylePreset) => {
    setActiveStyleId(s.id);
    setColors({
      word: s.fillWord,
      lord: s.fillLord,
      ligature: s.fillLigature,
      media: s.fillMedia
    });
    setGlowRadius(s.glowRadius);
    setGlowIntensity(Math.round(s.glowOpacity * 100));
    setStrokeWidth(s.strokeWidth);
    playTick(soundEnabled, 750, 0.02);
    showToast(`Style: ${s.name}`);
  };

  // Layer Visibility Toggle
  const handleToggleLayerVisibility = (trackId: string) => {
    setLayerVisibility(prev => {
      const key = trackId as keyof typeof prev;
      const next = { ...prev, [key]: !prev[key] };
      playTick(soundEnabled, 550, 0.02);
      showToast(`Layer ${trackId.toUpperCase()}: ${next[key] ? 'Visible' : 'Hidden'}`);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07080c] text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <TopNavbar
        scale={scale}
        bgMode={bgMode}
        activeMotionId={activeMotion.id}
        activeMotionName={activeMotion.name}
        activeStyleName={activeStyle.name}
        onZoomIn={() => setScale(s => Math.min(3.5, s * 1.15))}
        onZoomOut={() => setScale(s => Math.max(0.4, s * 0.85))}
        onResetView={() => { setScale(1.0); setPan({ x: 0, y: 0 }); }}
        onSetBgMode={setBgMode}
        onQuickPlay={() => { seekToProgress(0); startPlayback(); }}
        onResetToStart={handleResetToStart}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenVideoExport={() => setIsVideoExportOpen(true)}
      />

      {/* Main Workspace Body (3-Column Layout with Resizable Dividers) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Creative Library */}
        <LeftLibrary
          width={leftWidth}
          activeTab={activeTab}
          activeMotionId={activeMotionId}
          activeStyleId={activeStyleId}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onTabChange={setActiveTab}
          onSelectMotion={handleSelectMotion}
          onSelectStyle={handleSelectStyle}
          onSearchChange={setSearchQuery}
          onCategoryFilterChange={setCategoryFilter}
          onShowInfo={(title, desc) => showToast(`${title}: ${desc}`)}
        />

        {/* Vertical Resizer: Left Library <-> Stage */}
        <PanelResizer
          direction="vertical"
          onResize={(delta) => setLeftWidth(w => Math.max(220, Math.min(420, w + delta)))}
          title="Drag to resize Library panel"
        />

        {/* Center Vector Motion Canvas */}
        <StageViewport
          animKey={animKey}
          animClass={activeMotion.animClass}
          duration={duration}
          easeFormula={easeFormula}
          stagger={stagger}
          glowRadius={glowRadius}
          glowIntensity={glowIntensity}
          geometryMode={geometryMode}
          strokeWidth={strokeWidth}
          tiltX={tiltX}
          tiltY={tiltY}
          scale={scale}
          pan={pan}
          bgMode={bgMode}
          bgGradient={activeStyle.bgGradient}
          colors={colors}
          layerVisibility={layerVisibility}
          onPanChange={setPan}
          onScaleChange={setScale}
        />

        {/* Vertical Resizer: Stage <-> Right Inspector */}
        <PanelResizer
          direction="vertical"
          onResize={(delta) => setRightWidth(w => Math.max(260, Math.min(460, w - delta)))}
          title="Drag to resize Inspector panel"
        />

        {/* Right Properties & Inspector Lab */}
        <RightInspector
          width={rightWidth}
          motionId={activeMotion.id}
          motionName={activeMotion.name}
          category={activeMotion.badge}
          duration={duration}
          stagger={stagger}
          bezier={bezier}
          easeFormula={easeFormula}
          playbackMode={playbackMode}
          glowRadius={glowRadius}
          glowIntensity={glowIntensity}
          geometryMode={geometryMode}
          strokeWidth={strokeWidth}
          tiltX={tiltX}
          tiltY={tiltY}
          colors={colors}
          onDurationChange={(d) => { setDuration(d); seekToProgress(currentProgress); }}
          onStaggerChange={setStagger}
          onBezierChange={setBezier}
          onPlaybackModeChange={setPlaybackMode}
          onGlowRadiusChange={setGlowRadius}
          onGlowIntensityChange={setGlowIntensity}
          onGeometryModeChange={setGeometryMode}
          onStrokeWidthChange={setStrokeWidth}
          onTiltXChange={setTiltX}
          onTiltYChange={setTiltY}
          onResetTilt={() => { setTiltX(0); setTiltY(0); showToast('3D Tilt Reset'); }}
          onColorChange={(k, val) => setColors(prev => ({ ...prev, [k]: val }))}
          onPlaySound={() => playTick(soundEnabled, 650, 0.02)}
        />
      </div>

      {/* Horizontal Resizer: Workspace <-> Timeline */}
      <PanelResizer
        direction="horizontal"
        onResize={(delta) => setTimelineHeight(h => Math.max(130, Math.min(380, h + delta)))}
        title="Drag to resize Timeline height"
      />

      {/* Bottom Professional NLE Timeline */}
      <TimelineFooter
        height={timelineHeight}
        duration={duration}
        currentProgress={currentProgress}
        isPlaying={isPlaying}
        isLooping={isLooping}
        soundEnabled={soundEnabled}
        playbackSpeed={playbackSpeed}
        tracks={tracks}
        onPlayPause={handlePlayPause}
        onJumpStart={handleResetToStart}
        onJumpEnd={() => { stopPlayback(); seekToProgress(1); playTick(soundEnabled, 700, 0.02); }}
        onStepBack={() => { stopPlayback(); seekToProgress(Math.max(0, currentProgress - (1/60)/duration)); playTick(soundEnabled, 550, 0.015); }}
        onStepForward={() => { stopPlayback(); seekToProgress(Math.min(1, currentProgress + (1/60)/duration)); playTick(soundEnabled, 550, 0.015); }}
        onToggleLoop={() => { setIsLooping(l => !l); showToast(`Loop: ${!isLooping ? 'ON' : 'OFF'}`); }}
        onToggleSound={() => { setSoundEnabled(s => !s); showToast(`Audio FX: ${!soundEnabled ? 'ON' : 'MUTED'}`); }}
        onSpeedChange={(s) => { setPlaybackSpeed(s); showToast(`Speed: ${s}x`); }}
        onSeekProgress={(p) => seekToProgress(p)}
        onToggleLayerVisibility={handleToggleLayerVisibility}
        onAddKeyframe={handleAddKeyframe}
        onJumpPrevKeyframe={handleJumpPrevKeyframe}
        onJumpNextKeyframe={handleJumpNextKeyframe}
        onPlaySound={(pitch, dur) => playTick(soundEnabled, pitch, dur)}
      />

      {/* Code Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        motionName={activeMotion.name}
        duration={duration}
        easeFormula={easeFormula}
        glowRadius={glowRadius}
        colors={colors}
      />

      {/* 60 FPS MP4 / WebM Video Export Modal */}
      <VideoExportModal
        isOpen={isVideoExportOpen}
        onClose={() => setIsVideoExportOpen(false)}
        motionName={activeMotion.name}
        duration={duration}
        bgGradient={activeStyle.bgGradient}
        seekFrame={async (p) => {
          seekToProgress(p, true);
        }}
      />

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-56 left-1/2 -translate-x-1/2 bg-[#12151e]/95 text-white border border-[#ff4e2e] shadow-2xl shadow-[#ff4e2e]/30 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
