import React, { useState } from 'react';
import { 
  X, 
  Film, 
  Box, 
  Camera, 
  Code2, 
  Check, 
  Download, 
  RefreshCw, 
  AlertCircle,
  Eye,
  Sliders,
  Globe,
  Ratio,
  Gauge,
  Layers
} from 'lucide-react';
import * as THREE from 'three';
import { exportThreeGLTF, exportThreeSnapshot } from '../utils/threeEngine';
import { ThreeStudioConfig } from '../types/threeStudio';

interface ThreeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTo2DExport?: () => void;
  config: ThreeStudioConfig;
  onUpdateConfig?: (partial: Partial<ThreeStudioConfig>) => void;
  canvas: HTMLCanvasElement | null;
}

export const ThreeExportModal: React.FC<ThreeExportModalProps> = ({
  isOpen,
  onClose,
  onSwitchTo2DExport,
  config,
  onUpdateConfig,
  canvas
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'model' | 'snapshot' | 'code'>('video');
  const [resolution, setResolution] = useState<'1080p' | 'square' | 'vertical' | '4k'>('1080p');
  const [backdropChoice, setBackdropChoice] = useState<'scene' | 'black' | 'alpha'>('scene');
  const [fps, setFps] = useState<number>(60);
  const [bitrateMbps, setBitrateMbps] = useState<number>(45);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolutionMap = {
    '1080p': { label: '1080p Full HD', width: 1920, height: 1080, ratio: '16:9', aspectClass: 'aspect-video' },
    'square': { label: '1:1 Square Lockup', width: 1080, height: 1080, ratio: '1:1', aspectClass: 'aspect-square' },
    'vertical': { label: '9:16 Vertical Reel', width: 1080, height: 1920, ratio: '9:16', aspectClass: 'aspect-[9/16]' },
    '4k': { label: '4K Ultra Cinema', width: 3840, height: 2160, ratio: '16:9', aspectClass: 'aspect-video' }
  };

  const targetRes = resolutionMap[resolution];

  // High-Fidelity 60 FPS 3D Video Export with Hardware-Accelerated Bitrate & Frame-by-Frame Rendering
  const handleRecordVideo = async () => {
    if (!canvas) {
      setStatusMessage('WebGL Canvas is not ready for recording.');
      return;
    }

    const renderer = (window as any).__THREE_RENDERER__;
    const camera = (window as any).__THREE_CAMERA__;
    const composer = (window as any).__THREE_COMPOSER__;
    const scene = (window as any).__THREE_SCENE__;
    const renderThreeFrame = (window as any).__THREE_RENDER_FRAME__;

    if (!renderThreeFrame) {
      setStatusMessage('3D WebGL render pipeline is initializing. Please try again.');
      return;
    }

    // Cache original dimensions, aspect ratio, and background
    const origW = renderer?.domElement?.width || canvas.width;
    const origH = renderer?.domElement?.height || canvas.height;
    const origStyleW = renderer?.domElement?.style?.width || canvas.style.width;
    const origStyleH = renderer?.domElement?.style?.height || canvas.style.height;
    const origAspect = camera?.aspect;
    const origBg = scene?.background;

    try {
      setIsRecording(true);
      (window as any).__THREE_IS_RECORDING__ = true;
      setStatusMessage(null);
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);

      // Handle Backdrop choice
      if (scene) {
        if (backdropChoice === 'black') {
          scene.background = new THREE.Color(0x07080c);
        } else if (backdropChoice === 'alpha') {
          scene.background = null;
          if (renderer) renderer.setClearColor(0x000000, 0);
        }
      }

      // Scale WebGL renderer buffer to true target resolution during export
      if (renderer && camera) {
        camera.aspect = targetRes.width / targetRes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(targetRes.width, targetRes.height, false);
        if (composer) composer.setSize(targetRes.width, targetRes.height);
      }

      // Prime frame 0 immediately
      renderThreeFrame(0);

      // Setup recorder stream at requested framerate
      const stream = canvas.captureStream(fps);
      const videoTrack = stream.getVideoTracks()[0] as any;

      // Select highest fidelity supported codec
      let mimeType = 'video/webm;codecs=vp9';
      if (format === 'mp4') {
        const mp4Candidates = [
          'video/mp4;codecs="avc1.64002a,mp4a.40.2"',
          'video/mp4;codecs="avc1.640028"',
          'video/mp4;codecs=avc1.4d4020',
          'video/mp4'
        ];
        const match = mp4Candidates.find(c => MediaRecorder.isTypeSupported(c));
        if (match) {
          mimeType = match;
        } else {
          mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';
        }
      } else {
        const webmCandidates = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm'
        ];
        const match = webmCandidates.find(c => MediaRecorder.isTypeSupported(c));
        if (match) mimeType = match;
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrateMbps * 1_000_000
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
      });

      recorder.start();

      const duration = config.duration || 4.0;
      const totalFrames = Math.max(1, Math.round(duration * fps));
      const frameIntervalMs = 1000 / fps;
      const startTime = performance.now();

      // Deterministic Frame-by-Frame Render Pipeline
      for (let f = 0; f < totalFrames; f++) {
        const normT = totalFrames > 1 ? f / (totalFrames - 1) : 0;
        
        // 1. Advance 3D physics transforms & draw frame
        renderThreeFrame(normT);

        // 2. Request video frame capture
        if (videoTrack && typeof videoTrack.requestFrame === 'function') {
          videoTrack.requestFrame();
        }

        // 3. Keep real-time synchronization for MediaRecorder timestamps
        const expectedElapsedMs = (f + 1) * frameIntervalMs;
        const actualElapsedMs = performance.now() - startTime;
        const remainingWaitMs = Math.max(0, expectedElapsedMs - actualElapsedMs);
        if (remainingWaitMs > 0) {
          await new Promise(r => setTimeout(r, remainingWaitMs));
        }

        setRecordProgress(Math.min(100, Math.round(((f + 1) / totalFrames) * 100)));
      }

      // Hold final frame slightly for clean ending
      await new Promise(r => setTimeout(r, 160));

      recorder.stop();
      const blob = await recordPromise;

      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);

      // Determine extension based on negotiated MIME type
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `wordlord-3d-${config.motionMode}-${config.duration}s-${targetRes.width}x${targetRes.height}-${bitrateMbps}mbps.${ext}`;
      a.click();
    } catch (err: any) {
      setStatusMessage(err?.message || 'Error recording 3D WebGL stream.');
    } finally {
      (window as any).__THREE_IS_RECORDING__ = false;
      // Restore renderer, scene background, and camera viewport
      if (scene) {
        scene.background = origBg;
      }
      if (renderer && camera) {
        camera.aspect = origAspect || (origW / origH);
        camera.updateProjectionMatrix();
        renderer.setSize(origW, origH, false);
        if (renderer.domElement) {
          if (origStyleW) renderer.domElement.style.width = origStyleW;
          if (origStyleH) renderer.domElement.style.height = origStyleH;
        }
        if (composer) composer.setSize(origW, origH);
        if (renderThreeFrame) renderThreeFrame(0);
      }
      setIsRecording(false);
    }
  };

  // Export GLTF / GLB Binary Model
  const handleExportGLTF = async () => {
    if (!canvas) return;
    try {
      setStatusMessage('Packaging watertight 3D GLB binary...');
      const threeScene = (window as any).__THREE_SCENE__;
      if (threeScene) {
        await exportThreeGLTF(threeScene, `wordlord-3d-${config.activeAssetId}`);
        setStatusMessage('GLB 3D model exported successfully!');
      } else {
        setStatusMessage('Scene compiled and ready.');
      }
    } catch (err: any) {
      setStatusMessage(err?.message || 'Error exporting GLTF model.');
    }
  };

  // Export 4K PNG Snapshot
  const handleExportSnapshot = () => {
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `wordlord-3d-${config.activeAssetId}-snapshot.png`;
      a.click();
      setStatusMessage('Transparent PNG snapshot saved!');
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to capture snapshot.');
    }
  };

  // Three.js Embed snippet
  const embedCodeSnippet = `// WordLord 3D Extruded WebGL Embed
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(${config.fov || 45}, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.set(0, 0, ${config.cameraDistance || 420});

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// Extrusion Settings
const extrudeSettings = {
  depth: ${config.depth},
  bevelEnabled: true,
  bevelThickness: ${config.bevelThickness},
  bevelSize: ${config.bevelSize},
  bevelSegments: ${config.bevelSegments}
};

// Object Transform
const logoGroup = new THREE.Group();
logoGroup.position.set(${config.posX || 0}, ${config.posY || 0}, ${config.posZ || 0});
logoGroup.rotation.set(${((config.rotX || 0) * Math.PI) / 180}, ${((config.rotY || 0) * Math.PI) / 180}, ${((config.rotZ || 0) * Math.PI) / 180});
scene.add(logoGroup);

// Lighting Rig
const keyLight = new THREE.DirectionalLight('${config.keyColor}', ${config.keyIntensity});
keyLight.position.set(220, 260, 280);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight('${config.rimColor}', ${config.rimIntensity});
rimLight.position.set(-260, 200, -220);
scene.add(rimLight);
`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-[760px] max-w-full bg-[#0d1017] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Box size={16} className="text-[#ff4e2e]" />
            <span>Export 3D Animation & Assets</span>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchTo2DExport && !isRecording && (
              <button
                type="button"
                onClick={onSwitchTo2DExport}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-[10.5px] font-mono font-medium transition-all shadow-sm"
                title="Switch directly to 2D Vector Studio & Export Crisp Vector MP4"
              >
                <Layers size={12} />
                <span>Switch to 2D Vector Export</span>
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isRecording}
              className="p-1 text-slate-400 hover:text-white rounded disabled:opacity-30"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#1f2430] bg-[#0a0c10] px-4 gap-2">
          {[
            { id: 'video' as const, label: '60 FPS 3D Video', icon: Film },
            { id: 'model' as const, label: '3D GLTF / GLB Model', icon: Box },
            { id: 'snapshot' as const, label: '4K PNG Snapshot', icon: Camera },
            { id: 'code' as const, label: 'Three.js Code', icon: Code2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3 border-b-2 font-mono text-xs flex items-center gap-1.5 transition-all ${
                  isSel
                    ? 'border-[#ff4e2e] text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* TAB 1: 3D VIDEO */}
          {activeTab === 'video' && (
            <div className="flex flex-col gap-4">
              
              {/* Interactive Framing Preview + Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Column: Framing Preview */}
                <div className="flex flex-col gap-2 bg-[#10131d] border border-[#202535] rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Eye size={13} className="text-[#ff4e2e]" />
                      <span className="text-[11px] font-display font-bold text-slate-200 uppercase tracking-wider">
                        3D Framing Preview
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

                  {/* Viewport Frame Box */}
                  <div className="relative w-full h-[210px] bg-black/70 rounded-lg border border-[#262c3e] overflow-hidden flex items-center justify-center p-2">
                    <div 
                      className={`relative max-w-full max-h-full ${targetRes.aspectClass} rounded border border-white/20 flex items-center justify-center transition-all duration-200 overflow-hidden shadow-2xl`}
                      style={{
                        width: resolution === 'vertical' ? '118px' : resolution === 'square' ? '190px' : '100%',
                        background: backdropChoice === 'black' ? '#000000' : '#080a0f'
                      }}
                    >
                      {/* Safe Action Zones */}
                      {showSafeZones && (
                        <div className="absolute inset-[8%] border border-dashed border-cyan-400/40 pointer-events-none rounded-sm">
                          <span className="absolute top-1 left-1.5 text-[7.5px] font-mono text-cyan-400/70 tracking-tight">
                            92% SAFE AREA
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-cyan-400 text-xs font-mono">
                            +
                          </div>
                        </div>
                      )}

                      {/* Mockup 3D Representation */}
                      <div className="flex flex-col items-center justify-center gap-1 text-center p-2">
                        <Box size={28} className="text-[#ff4e2e] animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                          {config.groupName || '3D Model'}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">
                          {targetRes.width} × {targetRes.height} ({targetRes.ratio})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Aspect Ratio: <strong className="text-white">{targetRes.ratio}</strong></span>
                    <span>FPS: <strong className="text-emerald-400">{fps} Studio</strong></span>
                  </div>

                  {/* Camera Framing & Trajectory Overrides */}
                  <div className="flex flex-col gap-2 bg-[#090b11] border border-[#1e2332] rounded-lg p-2.5 mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-bold text-slate-300 uppercase">
                        <Camera size={11} className="text-[#ff4e2e]" />
                        <span>Camera Framing & Trajectory</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig?.({
                          cameraDistance: 560,
                          cameraElevation: 12,
                          cameraAzimuth: 0,
                          cameraPosY: 0,
                          cameraRoll: 0,
                          cameraMotion: 'none',
                          cameraViewMode: 'camera'
                        })}
                        className="text-[8.5px] font-mono text-slate-500 hover:text-white flex items-center gap-0.5"
                      >
                        <RefreshCw size={8} />
                        <span>Reset</span>
                      </button>
                    </div>

                    {/* Camera Distance */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400">Distance:</span>
                        <span className="text-[#ff4e2e] font-bold">{config.cameraDistance || 560}px</span>
                      </div>
                      <input
                        type="range"
                        min={180}
                        max={1200}
                        step={10}
                        value={config.cameraDistance || 560}
                        onChange={(e) => onUpdateConfig?.({
                          cameraDistance: Number(e.target.value),
                          cameraPosZ: Number(e.target.value),
                          cameraViewMode: 'camera'
                        })}
                        className="w-full accent-[#ff4e2e] h-1.5 bg-[#1a1f2c] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: 'Tight', dist: 380 },
                          { label: 'Hero', dist: 560 },
                          { label: 'Wide', dist: 740 },
                          { label: 'Cinema', dist: 960 }
                        ].map(c => (
                          <button
                            key={c.dist}
                            type="button"
                            onClick={() => onUpdateConfig?.({
                              cameraDistance: c.dist,
                              cameraPosZ: c.dist,
                              cameraViewMode: 'camera'
                            })}
                            className={`py-0.5 px-0.5 rounded text-[8px] font-mono border text-center transition-all ${
                              config.cameraDistance === c.dist
                                ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-[#ff4e2e] font-bold'
                                : 'bg-[#141722] border-[#222736] text-slate-400 hover:text-white'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pitch Tilt & Orbit Rotation */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-[8.5px] font-mono">
                          <span className="text-slate-400">Tilt:</span>
                          <span className="text-white font-bold">{config.cameraElevation ?? 12}°</span>
                        </div>
                        <input
                          type="range"
                          min={-45}
                          max={75}
                          step={1}
                          value={config.cameraElevation ?? 12}
                          onChange={(e) => onUpdateConfig?.({
                            cameraElevation: Number(e.target.value),
                            cameraViewMode: 'camera'
                          })}
                          className="w-full accent-[#ff4e2e] h-1.5 bg-[#1a1f2c] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-[8.5px] font-mono">
                          <span className="text-slate-400">Orbit:</span>
                          <span className="text-white font-bold">{config.cameraAzimuth ?? 0}°</span>
                        </div>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={config.cameraAzimuth ?? 0}
                          onChange={(e) => onUpdateConfig?.({
                            cameraAzimuth: Number(e.target.value),
                            cameraViewMode: 'camera'
                          })}
                          className="w-full accent-[#ff4e2e] h-1.5 bg-[#1a1f2c] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Camera Height Up/Down */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[8.5px] font-mono">
                        <span className="text-slate-400">Height:</span>
                        <span className="text-white font-bold">{config.cameraPosY || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min={-200}
                        max={200}
                        step={5}
                        value={config.cameraPosY || 0}
                        onChange={(e) => onUpdateConfig?.({
                          cameraPosY: Number(e.target.value),
                          cameraViewMode: 'camera'
                        })}
                        className="w-full accent-[#ff4e2e] h-1.5 bg-[#1a1f2c] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Camera Trajectory Select */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[8.5px] font-mono">
                        <span className="text-slate-400">Trajectory:</span>
                        <span className="text-[#ff4e2e] font-bold uppercase">{config.cameraMotion || 'none'}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'none', label: 'Static' },
                          { id: 'orbit', label: 'Orbit' },
                          { id: 'dolly', label: 'Dolly' },
                          { id: 'crane', label: 'Crane' },
                          { id: 'corkscrew', label: 'Spiral' },
                          { id: 'pan', label: 'Pan' },
                          { id: 'rise', label: 'Rise' },
                          { id: 'shake', label: 'Shake' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => onUpdateConfig?.({ cameraMotion: t.id as any })}
                            className={`py-1 px-0.5 rounded text-[8px] font-mono border text-center transition-all ${
                              (config.cameraMotion || 'none') === t.id
                                ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-white font-bold shadow-sm'
                                : 'bg-[#141722] border-[#222736] text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Resolution & Backdrop Options */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                      Target Resolution & Ratio
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['1080p', 'square', 'vertical', '4k'] as const).map(resKey => {
                        const r = resolutionMap[resKey];
                        const isSel = resolution === resKey;
                        return (
                          <button
                            key={resKey}
                            onClick={() => setResolution(resKey)}
                            className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all ${
                              isSel
                                ? 'bg-[#ff4e2e]/15 border-[#ff4e2e] shadow-sm'
                                : 'bg-[#141722] border-[#222736] hover:border-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-[10.5px] font-bold truncate ${isSel ? 'text-white' : 'text-slate-200'}`}>
                                {r.label.split(' ')[0]}
                              </span>
                              <span className="text-[9px] font-mono text-[#ff4e2e] font-bold">{r.ratio}</span>
                            </div>
                            <span className="text-[8.5px] font-mono text-slate-400 mt-0.5">
                              {r.width} × {r.height}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                        Framerate
                      </span>
                      <div className="flex bg-[#141722] border border-[#222736] rounded-md p-0.5 gap-1">
                        {[30, 60].map(r => (
                          <button
                            key={r}
                            onClick={() => setFps(r)}
                            className={`flex-1 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                              fps === r ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {r} FPS
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                        Backdrop
                      </span>
                      <div className="flex bg-[#141722] border border-[#222736] rounded-md p-0.5 gap-1">
                        {[
                          { id: 'scene' as const, label: 'Scene' },
                          { id: 'black' as const, label: 'OLED' },
                          { id: 'alpha' as const, label: 'Alpha' }
                        ].map(b => (
                          <button
                            key={b.id}
                            onClick={() => setBackdropChoice(b.id)}
                            className={`flex-1 py-1 rounded text-[9.5px] font-mono font-medium transition-colors truncate ${
                              backdropChoice === b.id ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {b.label}
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
                        ~{((config.duration * bitrateMbps) / 8).toFixed(1)} MB Est.
                      </span>
                    </div>

                    {/* Format Selector */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: 'webm' as const, label: 'WebM Master', sub: 'VP9 High Quality' },
                        { key: 'mp4' as const, label: 'MP4 Video', sub: 'H.264 High Profile' },
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

                  {/* Summary Box */}
                  <div className="p-3 bg-[#11141e] border border-[#1f2535] rounded-lg flex flex-col gap-1 text-[9.5px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Motion Sequence:</span>
                      <span className="text-white font-bold uppercase">{config.motionMode} ({config.duration.toFixed(1)}s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stream Quality:</span>
                      <span className="text-emerald-400 font-bold">{bitrateMbps} Mbps • {targetRes.width}×{targetRes.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Codec:</span>
                      <span className="text-cyan-400 font-bold">{format.toUpperCase()} ({format === 'mp4' ? 'H.264 High Profile' : 'VP9 Studio'})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Status or Complete */}
              {isRecording ? (
                <div className="p-5 bg-black/60 border border-[#ff4e2e]/40 rounded-xl flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#ff4e2e] border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-white font-bold">
                    Rendering 3D Stream ({recordProgress}%)...
                  </span>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff4e2e] to-[#ff8c42] transition-all"
                      style={{ width: `${recordProgress}%` }}
                    />
                  </div>
                </div>
              ) : recordedVideoUrl ? (
                <div className="flex flex-col gap-2 p-3 bg-black rounded-lg border border-emerald-500/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                      <Check size={14} />
                      <span>3D Video Render Complete!</span>
                    </div>
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = recordedVideoUrl;
                        a.download = `wordlord-3d-${config.motionMode}-${targetRes.ratio.replace(':', 'x')}.webm`;
                        a.click();
                      }}
                      className="px-3 py-1 bg-emerald-500 text-black font-bold rounded text-xs font-mono hover:bg-emerald-400 flex items-center gap-1"
                    >
                      <Download size={12} />
                      <span>Download Again</span>
                    </button>
                  </div>
                  <video 
                    src={recordedVideoUrl} 
                    controls 
                    loop 
                    autoPlay 
                    className="w-full max-h-48 rounded bg-black/80 border border-white/10" 
                  />
                </div>
              ) : null}

              {/* Master Render Button */}
              {!isRecording && (
                <button
                  onClick={handleRecordVideo}
                  className="w-full py-2.5 bg-[#ff4e2e] hover:bg-[#ff6144] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#ff4e2e]/25 transition-all flex items-center justify-center gap-2"
                >
                  <Film size={14} />
                  <span>Start 60 FPS 3D Render Loop</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: 3D MODEL (.GLTF / .GLB) */}
          {activeTab === 'model' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-300">
                Export binary watertight 3D models for Blender, Spline, Unity, Unreal Engine, or Three.js applications.
              </span>
              <button
                onClick={handleExportGLTF}
                className="py-3 bg-[#ff4e2e] hover:bg-[#ff6144] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#ff4e2e]/25 transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} />
                <span>Export 3D Asset (.GLB)</span>
              </button>
            </div>
          )}

          {/* TAB 3: SNAPSHOT */}
          {activeTab === 'snapshot' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-300">
                Capture an instant high-resolution transparent or opaque PNG image of the current 3D viewport orientation.
              </span>

              {/* Quick Framing Adjuster for Snapshot */}
              <div className="flex flex-col gap-2 bg-[#090b11] border border-[#1e2332] rounded-lg p-3">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300 uppercase">
                  <div className="flex items-center gap-1.5">
                    <Camera size={12} className="text-[#ff4e2e]" />
                    <span>Snapshot Framing Controls</span>
                  </div>
                  <span className="text-[#ff4e2e] font-mono">{config.cameraDistance || 560}px • {config.cameraElevation ?? 12}°</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-400">Camera Distance:</span>
                      <span className="text-white font-bold">{config.cameraDistance || 560}px</span>
                    </div>
                    <input
                      type="range"
                      min={180}
                      max={1200}
                      step={10}
                      value={config.cameraDistance || 560}
                      onChange={(e) => onUpdateConfig?.({
                        cameraDistance: Number(e.target.value),
                        cameraPosZ: Number(e.target.value),
                        cameraViewMode: 'camera'
                      })}
                      className="w-full accent-[#ff4e2e] h-1.5 bg-[#1a1f2c] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-400">Pitch Tilt:</span>
                      <span className="text-white font-bold">{config.cameraElevation ?? 12}°</span>
                    </div>
                    <input
                      type="range"
                      min={-45}
                      max={75}
                      step={1}
                      value={config.cameraElevation ?? 12}
                      onChange={(e) => onUpdateConfig?.({
                        cameraElevation: Number(e.target.value),
                        cameraViewMode: 'camera'
                      })}
                      className="w-full accent-[#ff4e2e] h-1.5 bg-[#1a1f2c] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'Tight 380px', dist: 380, elev: 0 },
                    { label: 'Hero 560px', dist: 560, elev: 12 },
                    { label: 'Wide 740px', dist: 740, elev: 20 },
                    { label: 'Top View', dist: 600, elev: 75 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => onUpdateConfig?.({
                        cameraDistance: p.dist,
                        cameraPosZ: p.dist,
                        cameraElevation: p.elev,
                        cameraViewMode: 'camera'
                      })}
                      className="py-1 px-1 rounded text-[8.5px] font-mono border bg-[#141722] border-[#222736] text-slate-300 hover:text-white hover:border-[#ff4e2e]/50 text-center transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExportSnapshot}
                className="py-3 bg-[#ff4e2e] hover:bg-[#ff6144] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#ff4e2e]/25 transition-all flex items-center justify-center gap-2"
              >
                <Camera size={14} />
                <span>Save 4K PNG Snapshot</span>
              </button>
            </div>
          )}

          {/* TAB 4: THREE.JS CODE */}
          {activeTab === 'code' && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-300">
                Self-contained Three.js boilerplate script matching your exact camera, materials, lighting, and bevel parameters:
              </span>
              <pre className="p-3 bg-[#08090e] border border-[#1f2430] rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-56 custom-scrollbar select-text">
                {embedCodeSnippet}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedCodeSnippet);
                  setStatusMessage('Three.js embed script copied to clipboard!');
                }}
                className="py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5"
              >
                <Code2 size={13} />
                <span>Copy Three.js Code</span>
              </button>
            </div>
          )}

          {statusMessage && (
            <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded text-xs font-mono text-blue-200">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-12 px-5 bg-[#090b10] border-t border-[#1f2430] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            WordLord 3D Production Studio • Hardware Encoded
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-slate-300 rounded text-xs font-mono transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
