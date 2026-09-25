import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { LeftLibrary } from './components/LeftLibrary';
import { StageViewport } from './components/StageViewport';
import { RightInspector } from './components/RightInspector';
import { TimelineFooter } from './components/TimelineFooter';
import { ExportModal } from './components/ExportModal';
import { VideoExportModal } from './components/VideoExportModal';
import { PanelResizer } from './components/PanelResizer';

// 3D Extruded Studio Components & Data
import { ThreeStageViewport } from './components/ThreeStageViewport';
import { ThreeLeftLibrary } from './components/ThreeLeftLibrary';
import { ThreeRightInspector } from './components/ThreeRightInspector';
import { ThreeTimelineFooter } from './components/ThreeTimelineFooter';
import { ThreeExportModal } from './components/ThreeExportModal';
import { CustomSvgModal } from './components/CustomSvgModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { 
  ProjectStateSnapshot, 
  saveProjectToStorage, 
  loadProjectFromStorage, 
  exportProjectToFile, 
  importProjectFromFile 
} from './utils/projectState';
import { 
  ThreeStudioConfig, 
  ThreePart, 
  PbrPresetId, 
  LightingRigId, 
  ThreeMotionMode 
} from './types/threeStudio';
import { 
  THREE_ASSET_PRESETS, 
  PBR_PRESETS, 
  LIGHTING_RIGS 
} from './data/threePresets';
import { parseSvgIntoParts } from './utils/threeEngine';

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

  // 3D Studio Workspace State
  const [studioMode, setStudioMode] = useState<'2d' | '3d'>('2d');
  const [is3DExportOpen, setIs3DExportOpen] = useState(false);
  const [isCustomSvgOpen, setIsCustomSvgOpen] = useState(false);

  const [threeConfig, setThreeConfig] = useState<ThreeStudioConfig>({
    groupId: 'group-wordlord',
    groupName: 'WordLord Core Vector Mark',
    isGroupLocked: false,
    isGroupVisible: true,
    depth: 32,
    bevelThickness: 3.5,
    bevelSize: 2.2,
    bevelSegments: 5,
    meshScale: 1.0,
    autoCenter: true,
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scaleX: 1.0,
    scaleY: 1.0,
    scaleZ: 1.0,
    fov: 45,
    cameraDistance: 420,
    envPreset: 'studio',
    fogDensity: 0.0016,
    floorRoughness: 0.65,
    floorMetalness: 0.35,
    gridColor: '#ff4e2e',
    faceColor: '#ff263e',
    sideColor: '#4a070e',
    roughness: 0.22,
    metalness: 0.45,
    clearcoat: 0.75,
    transmission: 0.0,
    emissiveIntensity: 0.0,
    flutingEnabled: false,
    fluteScale: 0.45,
    proceduralTexture: 'none',
    keyColor: '#ffffff',
    keyIntensity: 2.2,
    rimColor: '#ffffff',
    rimIntensity: 2.8,
    fillColor: '#ff8877',
    fillIntensity: 0.9,
    ambientIntensity: 0.5,
    showFloor: true,
    showLightHelpers: false,
    transparentBg: false,
    gizmoMode: 'none',
    framingAspect: 'free',
    showFramingMask: false,
    bloomEnabled: true,
    bloomStrength: 0.75,
    bloomRadius: 0.5,
    bloomThreshold: 0.75,
    motionMode: 'reveal',
    stackedEffects: {
      hoverFloat: false,
      turntableSpin: false,
      harmonicWave: false,
      lightSweep: false,
      gyroTilt: true,
      sync2dMotion: false
    },
    isPlaying: true,
    amplitude: 1.0,
    time: 0.0,
    duration: 5.0,
    speed: 1.0,
    gyroEnabled: true,
    active2dMotionId: 'typewriter',
    shadingMode: 'rendered',
    cameraPreset: 'front',
    activeAssetId: 'wordlord',
    activePbrId: 'crimson',
    activeRigId: 'studio',
    selectedPartIndex: -1
  });

  const [threeParts, setThreeParts] = useState<ThreePart[]>(() => {
    return parseSvgIntoParts(
      THREE_ASSET_PRESETS[0].svgString,
      '#ff263e',
      '#4a070e'
    );
  });

  const activeMotion = MOTIONS.find(m => m.id === activeMotionId) || MOTIONS[0];
  const activeStyle = STYLES.find(s => s.id === activeStyleId) || STYLES[0];
  const easeFormula = `cubic-bezier(${bezier.p1.x.toFixed(2)}, ${bezier.p1.y.toFixed(2)}, ${bezier.p2.x.toFixed(2)}, ${bezier.p2.y.toFixed(2)})`;

  // Notification Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // History & Non-Destructive State Engine
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const undoStackRef = useRef<ProjectStateSnapshot[]>([]);
  const redoStackRef = useRef<ProjectStateSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isRestoringRef = useRef(false);

  const createStateSnapshot = useCallback((): ProjectStateSnapshot => {
    return {
      version: '5.0',
      timestamp: Date.now(),
      studioMode,
      activeMotionId,
      activeStyleId,
      duration,
      stagger,
      glowRadius,
      glowIntensity,
      geometryMode,
      strokeWidth,
      tiltX,
      tiltY,
      colors: { ...colors },
      threeConfig: { ...threeConfig },
      threeParts: threeParts.map(p => ({ ...p }))
    };
  }, [
    studioMode,
    activeMotionId,
    activeStyleId,
    duration,
    stagger,
    glowRadius,
    glowIntensity,
    geometryMode,
    strokeWidth,
    tiltX,
    tiltY,
    colors,
    threeConfig,
    threeParts
  ]);

  const applySnapshot = useCallback((snap: ProjectStateSnapshot) => {
    isRestoringRef.current = true;
    if (snap.studioMode) setStudioMode(snap.studioMode);
    if (snap.activeMotionId) setActiveMotionId(snap.activeMotionId);
    if (snap.activeStyleId) setActiveStyleId(snap.activeStyleId);
    if (typeof snap.duration === 'number') setDuration(snap.duration);
    if (typeof snap.stagger === 'number') setStagger(snap.stagger);
    if (typeof snap.glowRadius === 'number') setGlowRadius(snap.glowRadius);
    if (typeof snap.glowIntensity === 'number') setGlowIntensity(snap.glowIntensity);
    if (snap.geometryMode) setGeometryMode(snap.geometryMode);
    if (typeof snap.strokeWidth === 'number') setStrokeWidth(snap.strokeWidth);
    if (typeof snap.tiltX === 'number') setTiltX(snap.tiltX);
    if (typeof snap.tiltY === 'number') setTiltY(snap.tiltY);
    if (snap.colors) setColors({ ...snap.colors });
    if (snap.threeConfig) setThreeConfig({ ...snap.threeConfig });
    if (snap.threeParts && Array.isArray(snap.threeParts)) {
      setThreeParts(snap.threeParts.map(p => ({ ...p })));
    }
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 50);
  }, []);

  const pushUndoSnapshot = useCallback(() => {
    if (isRestoringRef.current) return;
    const snap = createStateSnapshot();
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > 40) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [createStateSnapshot]);

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const currentSnap = createStateSnapshot();
    redoStackRef.current.push(currentSnap);

    const prevSnap = undoStackRef.current.pop()!;
    applySnapshot(prevSnap);

    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
    showToast('Undo change');
  }, [applySnapshot, createStateSnapshot, showToast]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const currentSnap = createStateSnapshot();
    undoStackRef.current.push(currentSnap);

    const nextSnap = redoStackRef.current.pop()!;
    applySnapshot(nextSnap);

    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
    showToast('Redo change');
  }, [applySnapshot, createStateSnapshot, showToast]);

  // Initial load from local storage
  useEffect(() => {
    const saved = loadProjectFromStorage();
    if (saved) {
      applySnapshot(saved);
      showToast('Loaded saved project state');
    }
  }, [applySnapshot, showToast]);

  // Debounced auto-save
  useEffect(() => {
    if (isRestoringRef.current) return;
    const timer = setTimeout(() => {
      const snap = createStateSnapshot();
      saveProjectToStorage(snap);
    }, 1500);
    return () => clearTimeout(timer);
  }, [createStateSnapshot]);

  const handleSaveProject = useCallback(() => {
    const snap = createStateSnapshot();
    saveProjectToStorage(snap);
    showToast('Project snapshot saved (localStorage)');
  }, [createStateSnapshot, showToast]);

  const handleExportProject = useCallback(() => {
    const snap = createStateSnapshot();
    exportProjectToFile(snap);
    showToast('Exported project JSON');
  }, [createStateSnapshot, showToast]);

  const handleImportProject = useCallback(async (file: File) => {
    try {
      pushUndoSnapshot();
      const snap = await importProjectFromFile(file);
      applySnapshot(snap);
      showToast(`Imported ${file.name}`);
    } catch {
      showToast('Failed to import project file');
    }
  }, [applySnapshot, pushUndoSnapshot, showToast]);

  const handleUpdateThreeConfig = useCallback((partial: Partial<ThreeStudioConfig>) => {
    setThreeConfig(prev => ({ ...prev, ...partial }));
  }, []);

  const handleSelect3DAsset = useCallback((assetId: string) => {
    pushUndoSnapshot();
    const preset = THREE_ASSET_PRESETS.find(a => a.id === assetId);
    if (!preset) return;
    const newParts = parseSvgIntoParts(preset.svgString, threeConfig.faceColor, threeConfig.sideColor);
    setThreeParts(newParts);
    setThreeConfig(prev => ({ 
      ...prev, 
      activeAssetId: assetId,
      groupId: `group-${assetId}`,
      groupName: preset.name,
      isGroupLocked: false,
      isGroupVisible: true,
      time: 0 
    }));
    showToast(`Loaded ${preset.name} as collective group`);
  }, [threeConfig.faceColor, threeConfig.sideColor, pushUndoSnapshot, showToast]);

  const handleSelect3DPbrPreset = useCallback((presetId: PbrPresetId) => {
    pushUndoSnapshot();
    const pbr = PBR_PRESETS.find(p => p.id === presetId);
    if (!pbr) return;
    setThreeConfig(prev => ({
      ...prev,
      activePbrId: presetId,
      faceColor: pbr.faceColor,
      sideColor: pbr.sideColor,
      roughness: pbr.roughness,
      metalness: pbr.metalness,
      clearcoat: pbr.clearcoat,
      transmission: pbr.transmission,
      flutingEnabled: pbr.flutingEnabled,
      fluteScale: pbr.fluteScale,
      proceduralTexture: pbr.proceduralTexture,
      bloomEnabled: pbr.bloomEnabled,
      bloomStrength: pbr.bloomStrength
    }));
    setThreeParts(prev => prev.map(p => ({
      ...p,
      faceColor: pbr.faceColor,
      sideColor: pbr.sideColor,
      metalness: pbr.metalness,
      roughness: pbr.roughness,
      transmission: pbr.transmission
    })));
    showToast(`Applied ${pbr.name} PBR`);
  }, [pushUndoSnapshot, showToast]);

  const handleSelect3DLightingRig = useCallback((rigId: LightingRigId) => {
    pushUndoSnapshot();
    const rig = LIGHTING_RIGS.find(r => r.id === rigId);
    if (!rig) return;
    setThreeConfig(prev => ({
      ...prev,
      activeRigId: rigId,
      keyColor: rig.keyColor,
      keyIntensity: rig.keyIntensity,
      rimColor: rig.rimColor,
      rimIntensity: rig.rimIntensity,
      fillColor: rig.fillColor,
      fillIntensity: rig.fillIntensity,
      ambientIntensity: rig.ambientIntensity
    }));
    showToast(`Switched to ${rig.name}`);
  }, [pushUndoSnapshot, showToast]);

  const handleSelect3DMotion = useCallback((motion: ThreeMotionMode) => {
    setThreeConfig(prev => ({ ...prev, motionMode: motion, time: 0, isPlaying: true }));
    showToast(`Motion: ${motion.toUpperCase()}`);
  }, [showToast]);

  const handleUpdatePart = useCallback((idx: number, partial: Partial<ThreePart>) => {
    setThreeParts(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], ...partial };
      }
      return next;
    });
  }, []);

  const handleResetParts = useCallback(() => {
    pushUndoSnapshot();
    const asset = THREE_ASSET_PRESETS.find(a => a.id === threeConfig.activeAssetId) || THREE_ASSET_PRESETS[0];
    const newParts = parseSvgIntoParts(asset.svgString, threeConfig.faceColor, threeConfig.sideColor);
    setThreeParts(newParts);
    showToast('Reset parts geometry & offsets');
  }, [threeConfig.activeAssetId, threeConfig.faceColor, threeConfig.sideColor, pushUndoSnapshot, showToast]);

  const handleResetTransforms = useCallback(() => {
    pushUndoSnapshot();
    setThreeConfig(prev => ({
      ...prev,
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
      meshScale: 1.0
    }));
    showToast('Reset 3D Transforms (Position, Rotation, Scale)');
  }, [pushUndoSnapshot, showToast]);

  const handleImportCustomSvg = useCallback((svgString: string, name?: string) => {
    pushUndoSnapshot();
    const newParts = parseSvgIntoParts(svgString, threeConfig.faceColor, threeConfig.sideColor);
    setThreeParts(newParts);
    const assignedName = name || 'Imported Custom Vector Mark';
    setThreeConfig(prev => ({ 
      ...prev, 
      activeAssetId: 'custom',
      groupId: `group-custom-${Date.now()}`,
      groupName: assignedName,
      isGroupLocked: false,
      isGroupVisible: true,
      time: 0 
    }));
    showToast(`Imported ${assignedName} as collective group`);
  }, [threeConfig.faceColor, threeConfig.sideColor, pushUndoSnapshot, showToast]);

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

  // Global Desktop Keyboard Shortcuts: Space, Cmd+Z, Cmd+Shift+Z, Cmd+S, Tab, ?, R, V, E, 1..4, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd+Z (without shift)
      if (cmdKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Cmd+Shift+Z or Cmd+Y
      if ((cmdKey && e.key.toLowerCase() === 'z' && e.shiftKey) || (cmdKey && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Save Project: Cmd+S
      if (cmdKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      // Help / Shortcuts: ?
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // Studio Mode Switcher: Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        setStudioMode(prev => {
          const next = prev === '2d' ? '3d' : '2d';
          showToast(next === '3d' ? 'Switched to 3D Extruded Studio' : 'Switched to 2D Motion Studio');
          return next;
        });
        return;
      }

      // Reset 3D Rotation: Alt+R
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetTransforms();
        return;
      }

      // Reset 3D Position: Alt+G
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        pushUndoSnapshot();
        setThreeConfig(prev => ({ ...prev, posX: 0, posY: 0, posZ: 0 }));
        showToast('Reset 3D Position (Alt+G)');
        return;
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (studioMode === '2d') {
          handlePlayPause();
        } else {
          setThreeConfig(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
        }
        return;
      }

      // Replay: KeyR
      if (e.code === 'KeyR' && !cmdKey) {
        e.preventDefault();
        if (studioMode === '2d') {
          seekToProgress(0);
          restartAnimation();
          playTick(soundEnabled, 700, 0.02);
        } else {
          setThreeConfig(prev => ({ ...prev, time: 0, isPlaying: true }));
          showToast('3D Animation Replayed');
        }
        return;
      }

      // Video Export: KeyV
      if (e.code === 'KeyV' && !cmdKey) {
        e.preventDefault();
        setIsVideoExportOpen(true);
        return;
      }

      // Code / 3D Export: KeyE
      if (e.code === 'KeyE' && !cmdKey) {
        e.preventDefault();
        if (studioMode === '2d') {
          setIsExportOpen(true);
        } else {
          setIs3DExportOpen(true);
        }
        return;
      }

      // Escape: Close any open modal or reset playhead
      if (e.code === 'Escape') {
        e.preventDefault();
        if (isExportOpen || isVideoExportOpen || is3DExportOpen || isCustomSvgOpen || isShortcutsOpen) {
          setIsExportOpen(false);
          setIsVideoExportOpen(false);
          setIs3DExportOpen(false);
          setIsCustomSvgOpen(false);
          setIsShortcutsOpen(false);
        } else {
          handleResetToStart();
        }
        return;
      }

      // Number Keys: 1..4 (Cameras in 3D, Stages in 2D)
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && !cmdKey && !e.altKey) {
        e.preventDefault();
        if (studioMode === '3d') {
          const cameras: ('front' | 'iso' | 'top' | 'side')[] = ['front', 'iso', 'top', 'side'];
          const idx = parseInt(e.code.replace('Digit', ''), 10) - 1;
          const chosen = cameras[idx];
          if (chosen) {
            setThreeConfig(prev => ({ ...prev, cameraPreset: chosen }));
            showToast(`Camera: ${chosen.toUpperCase()}`);
          }
        } else {
          if (e.code === 'Digit1') setBgMode('dark');
          else if (e.code === 'Digit2') setBgMode('radial');
          else if (e.code === 'Digit3') setBgMode('grid');
        }
        return;
      }

      // 2D Timeline scrubbing keys
      if (studioMode === '2d') {
        if (e.code === 'KeyL') {
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
        } else if (e.code === 'Digit0' || e.code === 'Home') {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleSaveProject,
    handleResetTransforms,
    pushUndoSnapshot,
    studioMode,
    handlePlayPause,
    seekToProgress,
    restartAnimation,
    stopPlayback,
    handleResetToStart,
    handleJumpPrevKeyframe,
    handleJumpNextKeyframe,
    handleAddKeyframe,
    currentProgress,
    duration,
    soundEnabled,
    isExportOpen,
    isVideoExportOpen,
    is3DExportOpen,
    isCustomSvgOpen,
    isShortcutsOpen,
    showToast
  ]);

  // Handle Preset Switching
  const handleSelectMotion = (m: MotionPreset) => {
    pushUndoSnapshot();
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
    pushUndoSnapshot();
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
        studioMode={studioMode}
        onSetStudioMode={setStudioMode}
        scale={scale}
        bgMode={bgMode}
        activeMotionId={activeMotion.id}
        activeMotionName={activeMotion.name}
        activeStyleName={activeStyle.name}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSaveProject={handleSaveProject}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onZoomIn={() => setScale(s => Math.min(3.5, s * 1.15))}
        onZoomOut={() => setScale(s => Math.max(0.4, s * 0.85))}
        onResetView={() => { setScale(1.0); setPan({ x: 0, y: 0 }); }}
        onSetBgMode={setBgMode}
        onQuickPlay={() => { seekToProgress(0); startPlayback(); }}
        onResetToStart={handleResetToStart}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenVideoExport={() => setIsVideoExportOpen(true)}
        onOpen3DExport={() => setIs3DExportOpen(true)}
      />

      {/* Main Workspace Body (3-Column Layout with Resizable Dividers) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Library (2D Preset Engine vs 3D Assets & PBR) */}
        {studioMode === '2d' ? (
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
        ) : (
          <ThreeLeftLibrary
            width={leftWidth}
            config={threeConfig}
            onSelectAsset={handleSelect3DAsset}
            onSelectPbrPreset={handleSelect3DPbrPreset}
            onSelectLightingRig={handleSelect3DLightingRig}
            onSelectMotion={handleSelect3DMotion}
            onOpenCustomSvgModal={() => setIsCustomSvgOpen(true)}
          />
        )}

        {/* Vertical Resizer: Left Library <-> Stage */}
        <PanelResizer
          direction="vertical"
          onResize={(delta) => setLeftWidth(w => Math.max(220, Math.min(420, w + delta)))}
          title="Drag to resize Library panel"
        />

        {/* Center Stage Viewport (2D CSS Motion Canvas vs 3D WebGL PBR Viewport) */}
        {studioMode === '2d' ? (
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
        ) : (
          <ThreeStageViewport
            config={threeConfig}
            parts={threeParts}
            onUpdateConfig={handleUpdateThreeConfig}
            onSelectPart={(idx) => setThreeConfig(prev => ({ ...prev, selectedPartIndex: idx }))}
            onSetParts={setThreeParts}
          />
        )}

        {/* Vertical Resizer: Stage <-> Right Inspector */}
        <PanelResizer
          direction="vertical"
          onResize={(delta) => setRightWidth(w => Math.max(260, Math.min(460, w - delta)))}
          title="Drag to resize Inspector panel"
        />

        {/* Right Inspector (2D Typography Optics vs 3D Extrusion & PBR Lab) */}
        {studioMode === '2d' ? (
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
        ) : (
          <ThreeRightInspector
            width={rightWidth}
            config={threeConfig}
            parts={threeParts}
            onUpdateConfig={handleUpdateThreeConfig}
            onUpdatePart={handleUpdatePart}
            onResetParts={handleResetParts}
            onResetTransforms={handleResetTransforms}
          />
        )}
      </div>

      {/* Horizontal Resizer: Workspace <-> Timeline */}
      <PanelResizer
        direction="horizontal"
        onResize={(delta) => setTimelineHeight(h => Math.max(130, Math.min(380, h + delta)))}
        title="Drag to resize Timeline height"
      />

      {/* Bottom Professional Timeline (2D Multi-Track vs 3D Normalized Scrubber) */}
      {studioMode === '2d' ? (
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
      ) : (
        <ThreeTimelineFooter
          height={timelineHeight}
          config={threeConfig}
          onUpdateConfig={handleUpdateThreeConfig}
          onTogglePlay={() => setThreeConfig(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
          onResetTime={() => setThreeConfig(prev => ({ ...prev, time: 0 }))}
        />
      )}

      {/* Code Export Modal (2D) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        motionName={activeMotion.name}
        duration={duration}
        easeFormula={easeFormula}
        glowRadius={glowRadius}
        colors={colors}
      />

      {/* 60 FPS MP4 / WebM Video Export Modal (2D) */}
      <VideoExportModal
        isOpen={isVideoExportOpen}
        onClose={() => setIsVideoExportOpen(false)}
        motionId={activeMotion.id}
        motionName={activeMotion.name}
        duration={duration}
        bgGradient={activeStyle.bgGradient}
        colors={colors}
        glowRadius={glowRadius}
        glowIntensity={glowIntensity}
        geometryMode={geometryMode}
        strokeWidth={strokeWidth}
        tiltX={tiltX}
        tiltY={tiltY}
        layerVisibility={layerVisibility}
        seekFrame={async (p) => {
          seekToProgress(p, true);
        }}
      />

      {/* 3D Asset & Animation Export Modal */}
      <ThreeExportModal
        isOpen={is3DExportOpen}
        onClose={() => setIs3DExportOpen(false)}
        config={threeConfig}
        canvas={document.getElementById('three-stage-canvas') as HTMLCanvasElement | null}
      />

      {/* Custom SVG Vector Import Modal */}
      <CustomSvgModal
        isOpen={isCustomSvgOpen}
        onClose={() => setIsCustomSvgOpen(false)}
        onImportSvg={handleImportCustomSvg}
      />

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
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
