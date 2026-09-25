import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { 
  RotateCcw, 
  Grid, 
  Sun, 
  Sparkles, 
  Box, 
  Compass, 
  Maximize2,
  Crosshair,
  Ratio,
  Move,
  Lightbulb,
  Check,
  Eye
} from 'lucide-react';
import { 
  ThreeStudioConfig, 
  ThreePart, 
  CameraAnglePreset,
  SocialFramingAspect 
} from '../types/threeStudio';
import { 
  generateProceduralTexture, 
  buildExtrudedParts, 
  evaluate3DMotion,
  flashMeshHighlight 
} from '../utils/threeEngine';

interface ThreeStageViewportProps {
  config: ThreeStudioConfig;
  parts: ThreePart[];
  onUpdateConfig: (partial: Partial<ThreeStudioConfig>) => void;
  onSelectPart: (index: number) => void;
  onSetParts: React.Dispatch<React.SetStateAction<ThreePart[]>>;
}

export const ThreeStageViewport: React.FC<ThreeStageViewportProps> = ({
  config,
  parts,
  onUpdateConfig,
  onSelectPart,
  onSetParts
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  const logoGroupRef = useRef<THREE.Group>(new THREE.Group());
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
  } | null>(null);
  const floorRef = useRef<{ mesh: THREE.Mesh; grid: THREE.GridHelper } | null>(null);
  const proceduralTextureRef = useRef<THREE.Texture | null>(null);

  const [polyCount, setPolyCount] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [selectedPartName, setSelectedPartName] = useState<string>('All Parts');
  const [showAspectMenu, setShowAspectMenu] = useState(false);

  const mouseGyroRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Initialize Scene & Renderer
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Fail-safe dimensions (never allow 0 to prevent WebGL zero-size framebuffer crash)
    const width = Math.max(128, containerRef.current.clientWidth || 800);
    const height = Math.max(128, containerRef.current.clientHeight || 600);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (with FOV from config)
    const camera = new THREE.PerspectiveCamera(config.fov || 45, width / height, 1, 3500);
    camera.position.set(0, 0, config.cameraDistance || 420);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 1400;
    controls.minDistance = 60;
    controlsRef.current = controls;

    // TransformControls (Interactive 3D Gizmo from Prototypes)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.75;
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, config.ambientIntensity);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(new THREE.Color(config.keyColor), config.keyIntensity);
    keyLight.position.set(220, 260, 280);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 50;
    keyLight.shadow.camera.far = 1200;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(config.rimColor), config.rimIntensity);
    rimLight.position.set(-260, 200, -220);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(new THREE.Color(config.fillColor), config.fillIntensity);
    fillLight.position.set(0, -180, 150);
    scene.add(fillLight);

    lightsRef.current = { keyLight, rimLight, fillLight, ambientLight };

    // Floor Mesh & Grid
    const floorGeo = new THREE.PlaneGeometry(2000, 2000);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090b10,
      roughness: config.floorRoughness || 0.65,
      metalness: config.floorMetalness || 0.35
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -140;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const floorGrid = new THREE.GridHelper(2000, 60, 0xff4e2e, 0x1e2433);
    floorGrid.position.y = -139.8;
    scene.add(floorGrid);

    floorRef.current = { mesh: floorMesh, grid: floorGrid };

    // Logo Group
    scene.add(logoGroupRef.current);

    // Procedural texture
    proceduralTextureRef.current = generateProceduralTexture(config.proceduralTexture || (config.flutingEnabled ? 'fluted' : 'none'));

    // Post Processing (UnrealBloom)
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      config.bloomStrength,
      config.bloomRadius,
      config.bloomThreshold
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    // Handle Resize (with zero-size protection)
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current || !composerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w < 10 || h < 10) return; // Prevent zero-size framebuffer crash

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      composerRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Initial render tick to guarantee immediate visibility
    requestAnimationFrame(() => {
      handleResize();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    });

    // Expose references globally for offscreen 4K/1080p recording and GLTF export
    (window as any).__THREE_SCENE__ = scene;
    (window as any).__THREE_CAMERA__ = camera;
    (window as any).__THREE_RENDERER__ = renderer;
    (window as any).__THREE_COMPOSER__ = composer;

    return () => {
      delete (window as any).__THREE_SCENE__;
      delete (window as any).__THREE_CAMERA__;
      delete (window as any).__THREE_RENDERER__;
      delete (window as any).__THREE_COMPOSER__;
      resizeObserver.disconnect();
      renderer.dispose();
      composer.dispose();
      controls.dispose();
      transformControls.dispose();
    };
  }, []);

  // 2. Rebuild Meshes on Parts / Geometry / Procedural config changes
  useEffect(() => {
    if (!sceneRef.current) return;

    proceduralTextureRef.current = generateProceduralTexture(
      config.proceduralTexture || (config.flutingEnabled ? 'fluted' : 'none')
    );

    const meshes = buildExtrudedParts(
      logoGroupRef.current,
      parts,
      config,
      proceduralTextureRef.current
    );
    meshesRef.current = meshes;

    // Compute poly count
    let totalTriangles = 0;
    meshes.forEach(m => {
      if (m.geometry && m.geometry.index) {
        totalTriangles += m.geometry.index.count / 3;
      }
    });
    setPolyCount(totalTriangles);
  }, [
    parts, 
    config.depth, 
    config.bevelThickness, 
    config.bevelSize, 
    config.bevelSegments, 
    config.meshScale, 
    config.autoCenter,
    config.posX,
    config.posY,
    config.posZ,
    config.rotX,
    config.rotY,
    config.rotZ,
    config.scaleX,
    config.scaleY,
    config.scaleZ,
    config.faceColor, 
    config.sideColor, 
    config.roughness, 
    config.metalness, 
    config.clearcoat, 
    config.transmission, 
    config.flutingEnabled, 
    config.fluteScale,
    config.proceduralTexture
  ]);

  // 3. Update TransformControls Gizmo Mode
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc) return;

    if (config.gizmoMode === 'light' && lightsRef.current) {
      tc.attach(lightsRef.current.keyLight);
      tc.setMode('translate');
      tc.getHelper().visible = true;
      tc.enabled = true;
    } else if (config.gizmoMode === 'model' && logoGroupRef.current) {
      tc.attach(logoGroupRef.current);
      tc.setMode('rotate');
      tc.getHelper().visible = true;
      tc.enabled = true;
    } else {
      tc.detach();
      tc.getHelper().visible = false;
      tc.enabled = false;
    }
  }, [config.gizmoMode]);

  // 4. Update Environment, Fog & Background
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    switch (config.envPreset) {
      case 'transparent':
        scene.background = null;
        scene.fog = null;
        break;
      case 'obsidian':
        scene.background = new THREE.Color(0x000000);
        scene.fog = null;
        break;
      case 'cyber':
        scene.background = new THREE.Color(0x050711);
        scene.fog = new THREE.FogExp2(0x050711, 0.002);
        break;
      case 'luxury':
        scene.background = new THREE.Color(0x18120c);
        scene.fog = new THREE.FogExp2(0x18120c, 0.0018);
        break;
      case 'radial':
        scene.background = new THREE.Color(0x0d121c);
        scene.fog = new THREE.FogExp2(0x0d121c, 0.0015);
        break;
      case 'studio':
      default:
        scene.background = new THREE.Color(0x0b0e14);
        scene.fog = new THREE.FogExp2(0x0b0e14, 0.0016);
        break;
    }
  }, [config.envPreset]);

  // 5. Update Lights & Bloom Settings
  useEffect(() => {
    if (!lightsRef.current) return;
    const { keyLight, rimLight, fillLight, ambientLight } = lightsRef.current;

    keyLight.color.set(config.keyColor);
    keyLight.intensity = config.keyIntensity;

    rimLight.color.set(config.rimColor);
    rimLight.intensity = config.rimIntensity;

    fillLight.color.set(config.fillColor);
    fillLight.intensity = config.fillIntensity;

    ambientLight.intensity = config.ambientIntensity;

    if (floorRef.current) {
      floorRef.current.mesh.visible = config.showFloor && config.envPreset !== 'transparent';
      floorRef.current.grid.visible = config.showFloor && config.envPreset !== 'transparent';
    }

    if (bloomPassRef.current) {
      bloomPassRef.current.enabled = config.bloomEnabled && config.shadingMode === 'bloom';
      bloomPassRef.current.strength = config.bloomStrength;
      bloomPassRef.current.radius = config.bloomRadius;
      bloomPassRef.current.threshold = config.bloomThreshold;
    }

    if (cameraRef.current && config.fov) {
      cameraRef.current.fov = config.fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [
    config.keyColor, 
    config.keyIntensity, 
    config.rimColor, 
    config.rimIntensity, 
    config.fillColor, 
    config.fillIntensity, 
    config.ambientIntensity, 
    config.showFloor, 
    config.envPreset, 
    config.bloomEnabled, 
    config.bloomStrength, 
    config.bloomRadius, 
    config.bloomThreshold, 
    config.shadingMode,
    config.fov
  ]);

  // 6. Update Viewport Shading Mode (Solid / Wireframe / PBR / Bloom)
  useEffect(() => {
    meshesRef.current.forEach(mesh => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach(mat => {
        if (!mat) return;
        (mat as any).wireframe = config.shadingMode === 'wireframe';
      });
    });
  }, [config.shadingMode]);

  // 7. High-Performance Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFrameTime = performance.now();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      const now = performance.now();
      const deltaSec = Math.min(0.1, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      // FPS tracking
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Smooth gyro cursor (only if gyro is explicitly enabled)
      const hasGyro = config.gyroEnabled || (config.stackedEffects && config.stackedEffects.gyroTilt);
      if (!hasGyro) {
        mouseGyroRef.current.x = 0;
        mouseGyroRef.current.y = 0;
        mouseGyroRef.current.targetX = 0;
        mouseGyroRef.current.targetY = 0;
      } else {
        mouseGyroRef.current.x += (mouseGyroRef.current.targetX - mouseGyroRef.current.x) * 0.06;
        mouseGyroRef.current.y += (mouseGyroRef.current.targetY - mouseGyroRef.current.y) * 0.06;
      }

      // Update Controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Evaluate Motion Frame if playing
      if (config.isPlaying) {
        const newTime = (config.time + (deltaSec * config.speed)) % config.duration;
        onUpdateConfig({ time: newTime });

        const normalizedTime = newTime / config.duration;
        if (lightsRef.current) {
          evaluate3DMotion(
            logoGroupRef.current,
            meshesRef.current,
            config.motionMode,
            normalizedTime,
            config.amplitude,
            mouseGyroRef.current,
            { keyLight: lightsRef.current.keyLight, rimLight: lightsRef.current.rimLight },
            config,
            parts
          );
        }
      }

      // Render
      if (composerRef.current && config.shadingMode === 'bloom' && config.bloomEnabled) {
        composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    config.isPlaying, 
    config.speed, 
    config.duration, 
    config.motionMode, 
    config.amplitude, 
    config.shadingMode, 
    config.bloomEnabled, 
    config.stackedEffects,
    parts
  ]);

  // Pointer move for Gyro Cursor Reaction
  const handlePointerMove = (e: React.PointerEvent) => {
    const hasGyro = config.gyroEnabled || (config.stackedEffects && config.stackedEffects.gyroTilt);
    if (!hasGyro) {
      mouseGyroRef.current.targetX = 0;
      mouseGyroRef.current.targetY = 0;
      return;
    }
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseGyroRef.current.targetX = x;
    mouseGyroRef.current.targetY = y;
  };

  // Pointer Down for Raycasting & Drag distinction
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  // Interactive 3D Raycasting / Direct Mesh Picking (from Prototype 2 & 1)
  const handlePointerUp = (e: React.PointerEvent) => {
    const dist = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );
    // Ignore drags
    if (dist > 5) return;
    if (!containerRef.current || !cameraRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(meshesRef.current, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      flashMeshHighlight(hitMesh);
      const partIdx = hitMesh.userData.index;
      const partName = hitMesh.userData.name || `Part #${partIdx + 1}`;
      setSelectedPartName(partName);
      onSelectPart(partIdx);
    }
  };

  // Camera angle presets
  const handleSetCameraPreset = (preset: CameraAnglePreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    onUpdateConfig({ cameraPreset: preset });

    switch (preset) {
      case 'front':
        cameraRef.current.position.set(0, 0, config.cameraDistance || 420);
        break;
      case 'iso':
        cameraRef.current.position.set(240, 180, 300);
        break;
      case 'top':
        cameraRef.current.position.set(0, 440, 40);
        break;
      case 'side':
        cameraRef.current.position.set(440, 0, 40);
        break;
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  // Social Framing overlay dimensions
  const getFramingStyles = () => {
    if (config.framingAspect === 'free' || !config.showFramingMask) return null;
    let aspectNum = 16 / 9;
    let label = '16:9 Landscape (YouTube)';
    if (config.framingAspect === '9:16') {
      aspectNum = 9 / 16;
      label = '9:16 Vertical (Reels / TikTok)';
    } else if (config.framingAspect === '1:1') {
      aspectNum = 1;
      label = '1:1 Square (Feed)';
    } else if (config.framingAspect === '21:9') {
      aspectNum = 21 / 9;
      label = '21:9 Cinema Master';
    }

    return { aspectNum, label };
  };

  const framingData = getFramingStyles();

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative flex-1 w-full h-full bg-[#080a0f] overflow-hidden select-none"
    >
      {/* Three.js Canvas Element */}
      <canvas 
        ref={canvasRef} 
        id="three-stage-canvas"
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Social Media Framing Mask Overlay (from Prototypes) */}
      {framingData && config.showFramingMask && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div 
            className="relative border-2 border-dashed border-[#ff4e2e]/60 shadow-[0_0_0_9999px_rgba(5,7,12,0.72)] max-w-[92%] max-h-[90%] transition-all duration-200"
            style={{
              aspectRatio: `${framingData.aspectNum}`,
              width: config.framingAspect === '9:16' ? 'auto' : '82%',
              height: config.framingAspect === '9:16' ? '86%' : 'auto'
            }}
          >
            {/* Aspect Ratio Badge */}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-[#ff4e2e]/40 text-[9px] font-mono text-white font-bold tracking-wider uppercase">
              {framingData.label}
            </span>

            {/* Rule of Thirds Guides */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Viewport Control Deck (Blender / Studio Style) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-[#10131d]/90 backdrop-blur-md border border-[#23293a] rounded-lg shadow-2xl z-20">
        
        {/* Shading Mode Selector */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          {[
            { id: 'rendered' as const, label: 'PBR Shaded', icon: Sun },
            { id: 'bloom' as const, label: 'Neon Bloom', icon: Sparkles },
            { id: 'solid' as const, label: 'Clay Solid', icon: Box },
            { id: 'wireframe' as const, label: 'Wireframe', icon: Grid }
          ].map(sm => {
            const Icon = sm.icon;
            const isSel = config.shadingMode === sm.id;
            return (
              <button
                key={sm.id}
                onClick={() => onUpdateConfig({ shadingMode: sm.id })}
                title={sm.label}
                className={`p-1.5 rounded text-xs flex items-center gap-1 font-mono transition-all ${
                  isSel
                    ? 'bg-[#ff4e2e] text-white font-bold shadow-md shadow-[#ff4e2e]/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Quick Camera Angles */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          {(['front', 'iso', 'top', 'side'] as const).map(angle => (
            <button
              key={angle}
              onClick={() => handleSetCameraPreset(angle)}
              className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                config.cameraPreset === angle
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {angle}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* 3D Gizmo Mode Switcher (TransformControls) */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          <button
            onClick={() => onUpdateConfig({ gizmoMode: config.gizmoMode === 'light' ? 'none' : 'light' })}
            title="Key Light 3D Gizmo"
            className={`p-1.5 rounded transition-all ${
              config.gizmoMode === 'light'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb size={12} />
          </button>
          <button
            onClick={() => onUpdateConfig({ gizmoMode: config.gizmoMode === 'model' ? 'none' : 'model' })}
            title="Model 3D Rotation Cage Gizmo"
            className={`p-1.5 rounded transition-all ${
              config.gizmoMode === 'model'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Move size={12} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Social Framing Aspect Ratio Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowAspectMenu(!showAspectMenu)}
            title="Social Framing Masks"
            className={`p-1.5 rounded text-xs flex items-center gap-1 font-mono transition-all ${
              config.showFramingMask && config.framingAspect !== 'free'
                ? 'bg-[#ff4e2e]/20 text-[#ff4e2e] border border-[#ff4e2e]/30'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Ratio size={12} />
            <span className="text-[9px] uppercase font-bold">{config.framingAspect}</span>
          </button>

          {showAspectMenu && (
            <div className="absolute top-full mt-1.5 left-0 w-36 bg-[#0e1118] border border-[#23293a] rounded-lg shadow-2xl p-1 flex flex-col gap-0.5 z-50 animate-in fade-in">
              {(['free', '16:9', '9:16', '1:1', '21:9'] as const).map(asp => (
                <button
                  key={asp}
                  onClick={() => {
                    onUpdateConfig({
                      framingAspect: asp,
                      showFramingMask: asp !== 'free'
                    });
                    setShowAspectMenu(false);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono flex items-center justify-between text-left transition-colors ${
                    config.framingAspect === asp
                      ? 'bg-[#ff4e2e] text-white font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="uppercase">{asp === 'free' ? 'Free View' : asp}</span>
                  {config.framingAspect === asp && <Check size={10} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Floor Grid Toggle */}
        <button
          onClick={() => onUpdateConfig({ showFloor: !config.showFloor })}
          title={config.showFloor ? 'Hide Studio Floor' : 'Show Studio Floor'}
          className={`p-1.5 rounded transition-all ${
            config.showFloor 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <Compass size={13} />
        </button>

        {/* Reset Camera to Front */}
        <button
          onClick={() => handleSetCameraPreset('front')}
          title="Reset Camera Orientation"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Top Left Diagnostics HUD */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none z-10">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0f121a]/85 backdrop-blur border border-[#1e2433] text-[9.5px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">WebGL 3D Studio</span>
          <span className="text-slate-500">•</span>
          <span>{fps} FPS</span>
          <span className="text-slate-500">•</span>
          <span>{polyCount.toLocaleString()} Polys</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 truncate max-w-[120px]">{selectedPartName}</span>
        </div>
      </div>

      {/* Bottom Right Orbit Controls Tip */}
      <div className="absolute bottom-3 right-3 pointer-events-none z-10 flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#0e1118]/85 backdrop-blur border border-white/5 text-[9px] font-mono text-slate-400">
        <span>Click Letter: Select in 3D</span>
        <span>•</span>
        <span>Left Drag: Orbit</span>
        <span>•</span>
        <span>Right Drag: Pan</span>
      </div>
    </div>
  );
};
