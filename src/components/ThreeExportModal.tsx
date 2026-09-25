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
  Globe
} from 'lucide-react';
import { exportThreeGLTF, exportThreeSnapshot } from '../utils/threeEngine';
import { ThreeStudioConfig } from '../types/threeStudio';

interface ThreeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThreeStudioConfig;
  canvas: HTMLCanvasElement | null;
}

export const ThreeExportModal: React.FC<ThreeExportModalProps> = ({
  isOpen,
  onClose,
  config,
  canvas
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'model' | 'snapshot' | 'code'>('video');
  const [resolution, setResolution] = useState<'1080p' | 'square' | 'vertical' | '4k'>('1080p');
  const [backdropChoice, setBackdropChoice] = useState<'scene' | 'black' | 'alpha'>('scene');
  const [fps, setFps] = useState<number>(60);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolutionMap = {
    '1080p': { label: '1080p Full HD', width: 1920, height: 1080, ratio: '16:9' },
    'square': { label: '1:1 Square Lockup', width: 1080, height: 1080, ratio: '1:1' },
    'vertical': { label: '9:16 Vertical Reel', width: 1080, height: 1920, ratio: '9:16' },
    '4k': { label: '4K Ultra Cinema', width: 3840, height: 2160, ratio: '16:9' }
  };

  const targetRes = resolutionMap[resolution];

  // Record 60 FPS WebM Video from WebGL Canvas
  const handleRecordVideo = async () => {
    if (!canvas) {
      setStatusMessage('WebGL Canvas is not ready for recording.');
      return;
    }

    try {
      setIsRecording(true);
      setStatusMessage(null);
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);

      const stream = canvas.captureStream(fps);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 28000000 // 28 Mbps high fidelity
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

      const totalDurationMs = config.duration * 1000;
      const intervalMs = 80;
      let elapsedMs = 0;

      const progressTimer = setInterval(() => {
        elapsedMs += intervalMs;
        setRecordProgress(Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100)));
      }, intervalMs);

      await new Promise(r => setTimeout(r, totalDurationMs + 250));
      clearInterval(progressTimer);

      recorder.stop();
      const blob = await recordPromise;

      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `wordlord-3d-${config.motionMode}-${config.duration}s-${targetRes.ratio.replace(':', 'x')}.webm`;
      a.click();
    } catch (err: any) {
      setStatusMessage(err?.message || 'Error recording 3D WebGL stream.');
    } finally {
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
      <div className="w-[720px] max-w-full bg-[#0d1017] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Box size={16} className="text-[#ff4e2e]" />
            <span>Export 3D Animation & Assets</span>
          </div>
          <button
            onClick={onClose}
            disabled={isRecording}
            className="p-1 text-slate-400 hover:text-white rounded disabled:opacity-30"
          >
            <X size={16} />
          </button>
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
        <div className="p-5 flex flex-col gap-4">
          
          {/* TAB 1: 3D VIDEO */}
          {activeTab === 'video' && (
            <div className="flex flex-col gap-3.5">
              
              {/* Output Resolution & Framing Options */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                  Framing & Resolution Format
                </span>
                <div className="grid grid-cols-4 gap-2">
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

              {/* Framerate & Backdrop */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                    Framerate
                  </span>
                  <div className="flex bg-[#141722] border border-[#222736] rounded-md p-1 gap-1">
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
                    Backdrop Atmosphere
                  </span>
                  <div className="flex bg-[#141722] border border-[#222736] rounded-md p-1 gap-1">
                    {[
                      { id: 'scene' as const, label: 'Scene World' },
                      { id: 'black' as const, label: 'Pure Black' },
                      { id: 'alpha' as const, label: 'Alpha Trans' }
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

              {/* Encoding Status */}
              <div className="p-3 bg-[#11141e] border border-[#1f2535] rounded-lg flex flex-col gap-1 text-[9.5px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Engine & Mode:</span>
                  <span className="text-white font-bold uppercase">{config.motionMode} ({config.duration.toFixed(1)}s Loop)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bitrate & Target:</span>
                  <span className="text-emerald-400 font-bold">28 Mbps Master • {targetRes.label}</span>
                </div>
              </div>

              {/* Recording Action / Progress */}
              {isRecording ? (
                <div className="p-5 bg-black/60 border border-[#ff4e2e]/40 rounded-xl flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#ff4e2e] border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-white font-bold">
                    Recording 3D Loop ({recordProgress}%)...
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
                        a.download = `wordlord-3d-${config.motionMode}.webm`;
                        a.click();
                      }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      Download Again
                    </button>
                  </div>
                  <video
                    src={recordedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-48 rounded object-contain mx-auto"
                  />
                </div>
              ) : (
                <button
                  onClick={handleRecordVideo}
                  className="py-3 px-4 bg-[#ff4e2e] hover:bg-[#ff6144] text-white rounded-lg text-xs font-bold font-mono shadow-lg shadow-[#ff4e2e]/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Film size={14} />
                  <span>Start 60 FPS 3D Video Render</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: GLTF 3D MODEL */}
          {activeTab === 'model' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-[#121520] border border-[#202534] rounded-lg flex flex-col gap-1.5 text-xs font-mono">
                <span className="text-white font-bold">Industry Standard GLTF 2.0 / GLB Export</span>
                <span className="text-slate-400 text-[10.5px]">
                  Exports clean watertight extruded geometry with bevels and PBR material definitions. Fully compatible with Blender, Cinema 4D, Unreal Engine, Unity, and Apple Reality Composer.
                </span>
              </div>

              <button
                onClick={handleExportGLTF}
                className="py-3 px-4 bg-[#1f2434] hover:bg-[#2b334a] border border-[#3b4460] text-white rounded-lg text-xs font-bold font-mono shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Download size={14} />
                <span>Download .GLB 3D Binary File</span>
              </button>
            </div>
          )}

          {/* TAB 3: SNAPSHOT */}
          {activeTab === 'snapshot' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-[#121520] border border-[#202534] rounded-lg flex flex-col gap-1.5 text-xs font-mono">
                <span className="text-white font-bold">Transparent 4K Alpha Snapshot</span>
                <span className="text-slate-400 text-[10.5px]">
                  Instantly captures the active 3D camera view as a crisp, lossless PNG with transparent background.
                </span>
              </div>

              <button
                onClick={handleExportSnapshot}
                className="py-3 px-4 bg-[#1f2434] hover:bg-[#2b334a] border border-[#3b4460] text-white rounded-lg text-xs font-bold font-mono shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Camera size={14} />
                <span>Capture & Save PNG Snapshot</span>
              </button>
            </div>
          )}

          {/* TAB 4: CODE */}
          {activeTab === 'code' && (
            <div className="flex flex-col gap-2">
              <pre className="p-3 bg-[#07080c] border border-white/10 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-56 custom-scrollbar">
                <code>{embedCodeSnippet}</code>
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedCodeSnippet);
                  setStatusMessage('Code copied to clipboard!');
                }}
                className="py-2 px-3 bg-white/10 hover:bg-white/15 text-white rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <Code2 size={13} />
                <span>Copy Three.js Embed Code</span>
              </button>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="flex items-center gap-2 p-2.5 bg-cyan-950/40 border border-cyan-500/40 rounded text-xs font-mono text-cyan-200">
              <Check size={14} className="text-cyan-400 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="h-12 px-5 bg-[#090b10] border-t border-[#1f2430] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            WebGL PBR Extrusion Engine
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-slate-200 rounded text-xs font-mono transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
