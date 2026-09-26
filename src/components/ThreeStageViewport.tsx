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
  Eye,
  Upload,
  Camera,
  Globe
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

/**
 * Computes 3D directional coordinates for Key, Rim, and Fill lights
 * based on Blender-style azimuth rotation (0-360°) and pitch elevation (10-80°).
 * At lightRotation = 0°, Key Light shines directly into the front face of the model (+Z).
 */
function computeLightPositions(lightRotation: number = 35, lightElevation: number = 35) {
  const rotRad = (lightRotation * Math.PI) / 180;
  const elevRad = (lightElevation * Math.PI) / 180;
  const dist = 380;
  const yKey = dist * Math.sin(elevRad);
  const rKey = dist * Math.cos(elevRad);

  return {
    key: new THREE.Vector3(rKey * Math.sin(rotRad), yKey, rKey * Math.cos(rotRad)),
    rim: new THREE.Vector3(dist * 0.85 * Math.sin(rotRad + Math.PI - 0.4), dist * 0.5, dist * 0.85 * Math.cos(rotRad + Math.PI - 0.4)),
    fill: new THREE.Vector3(dist * 0.7 * Math.sin(rotRad - 1.2), -dist * 0.2, dist * 0.7 * Math.cos(rotRad - 1.2))
  };
}

interface ThreeStageViewportProps {
  config: ThreeStudioConfig;
  parts: ThreePart[];
  onUpdateConfig: (partial: Partial<ThreeStudioConfig>) => void;
  onSelectPart: (index: number) => void;
  onSetParts: React.Dispatch<React.SetStateAction<ThreePart[]>>;
  onDropSvgFile?: (file: File) => void;
}

export const ThreeStageViewport: React.FC<ThreeStageViewportProps> = ({
  config,
  parts,
  onUpdateConfig,
  onSelectPart,
  onSetParts,
  onDropSvgFile
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

  const timeRef = useRef<number>(config.time || 0);
  const isPlayingRef = useRef<boolean>(config.isPlaying);
  const speedRef = useRef<number>(config.speed || 1);
  const durationRef = useRef<number>(config.duration || 4);
  const workAreaRef = useRef(config.workArea || { inPoint: 0, outPoint: 1 });
  const motionModeRef = useRef(config.motionMode);
  const amplitudeRef = useRef<number>(config.amplitude || 1);
  const onUpdateConfigRef = useRef(onUpdateConfig);
  const configRef = useRef<ThreeStudioConfig>(config);
  const partsRef = useRef<ThreePart[]>(parts);

  useEffect(() => {
    timeRef.current = config.time || 0;
  }, [config.time]);

  useEffect(() => {
    isPlayingRef.current = config.isPlaying;
  }, [config.isPlaying]);

  useEffect(() => {
    speedRef.current = config.speed;
    durationRef.current = config.duration;
    workAreaRef.current = config.workArea || { inPoint: 0, outPoint: 1 };
    motionModeRef.current = config.motionMode;
    amplitudeRef.current = config.amplitude;
    onUpdateConfigRef.current = onUpdateConfig;
    configRef.current = config;
  }, [config, onUpdateConfig]);

  useEffect(() => {
    partsRef.current = parts;
  }, [parts]);

  // 1. Initialize Scene & Renderer
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Fail-safe dimensions (never allow 0 to prevent WebGL zero-size framebuffer crash)
    const width = Math.max(128, containerRef.current.clientWidth || 800);
    const height = Math.max(128, containerRef.current.clientHeight || 600);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (with FOV and initial coordinates from config)
    const camera = new THREE.PerspectiveCamera(config.fov || 45, width / height, 1, 3500);
    camera.position.set(
      config.cameraPosX || 0,
      config.cameraPosY || 0,
      config.cameraPosZ || config.cameraDistance || 420
    );
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
    controls.target.set(
      config.cameraTargetX || 0,
      config.cameraTargetY || 0,
      config.cameraTargetZ || 0
    );
    controls.addEventListener('start', () => {
      if (configRef.current.cameraViewMode === 'camera') {
        onUpdateConfigRef.current({ cameraViewMode: 'free', cameraPreset: 'free' });
      }
    });
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

    const initPos = computeLightPositions(config.lightRotation ?? 35, config.lightElevation ?? 35);

    const keyLight = new THREE.DirectionalLight(new THREE.Color(config.keyColor), config.keyIntensity);
    keyLight.position.copy(initPos.key);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 50;
    keyLight.shadow.camera.far = 1200;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(config.rimColor), config.rimIntensity);
    rimLight.position.copy(initPos.rim);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(new THREE.Color(config.fillColor), config.fillIntensity);
    fillLight.position.copy(initPos.fill);
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
    (window as any).__THREE_RENDER_FRAME__ = (normalizedTime: number) => {
      const curConfig = configRef.current;
      const curParts = partsRef.current;
      if (lightsRef.current && logoGroupRef.current) {
        evaluate3DMotion(
          logoGroupRef.current,
          meshesRef.current,
          motionModeRef.current,
          normalizedTime,
          amplitudeRef.current,
          { x: 0, y: 0 },
          { keyLight: lightsRef.current.keyLight, rimLight: lightsRef.current.rimLight },
          curConfig,
          curParts,
          cameraRef.current,
          controlsRef.current
        );
      }
      if (composerRef.current && curConfig.shadingMode === 'bloom' && curConfig.bloomEnabled) {
        composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    return () => {
      delete (window as any).__THREE_SCENE__;
      delete (window as any).__THREE_CAMERA__;
      delete (window as any).__THREE_RENDERER__;
      delete (window as any).__THREE_COMPOSER__;
      delete (window as any).__THREE_RENDER_FRAME__;
      delete (window as any).__THREE_IS_RECORDING__;
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

  // 5. Update Lights, Bloom & Camera Coordinates
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

    // Reposition Key, Rim, and Fill lights according to Blender-style Azimuth & Elevation
    const lightPos = computeLightPositions(config.lightRotation ?? 35, config.lightElevation ?? 35);
    keyLight.position.copy(lightPos.key);
    rimLight.position.copy(lightPos.rim);
    fillLight.position.copy(lightPos.fill);

    if (floorRef.current) {
      floorRef.current.mesh.visible = config.showFloor && config.envPreset !== 'transparent';
      floorRef.current.grid.visible = config.showFloor && config.envPreset !== 'transparent';
      const envRotRad = ((config.envRotation || 0) * Math.PI) / 180;
      floorRef.current.mesh.rotation.y = envRotRad;
      floorRef.current.grid.rotation.y = envRotRad;
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

    // If in camera view mode, position camera and target according to spherical coordinates and config
    if (cameraRef.current && controlsRef.current) {
      const dist = Math.max(160, config.cameraDistance ?? 560);
      const tx = config.cameraTargetX ?? 0;
      const ty = config.cameraTargetY ?? 0;
      const tz = config.cameraTargetZ ?? 0;

      if (config.cameraViewMode === 'camera') {
        const elRad = ((config.cameraElevation ?? 12) * Math.PI) / 180;
        const azRad = ((config.cameraAzimuth ?? 0) * Math.PI) / 180;

        const cx = tx + (config.cameraPosX ?? 0) + dist * Math.cos(elRad) * Math.sin(azRad);
        const cy = ty + (config.cameraPosY ?? 0) + dist * Math.sin(elRad);
        const cz = tz + dist * Math.cos(elRad) * Math.cos(azRad);

        cameraRef.current.position.set(cx, cy, cz);
        controlsRef.current.target.set(tx, ty, tz);
        cameraRef.current.lookAt(tx, ty, tz);
        if (config.cameraRoll !== undefined) {
          cameraRef.current.rotation.z = (config.cameraRoll * Math.PI) / 180;
        }
        controlsRef.current.update();
      } else {
        // Free Orbit Mode: Sync distance seamlessly while preserving user's manual orbit angle
        const target = controlsRef.current.target;
        const offset = cameraRef.current.position.clone().sub(target);
        if (offset.lengthSq() < 0.001) offset.set(0, 0, 1);
        const curDist = offset.length();
        if (Math.abs(curDist - dist) > 0.5) {
          offset.setLength(dist);
          cameraRef.current.position.copy(target).add(offset);
          controlsRef.current.update();
        }
      }
    }
  }, [
    config.keyColor, 
    config.keyIntensity, 
    config.rimColor, 
    config.rimIntensity, 
    config.fillColor, 
    config.fillIntensity, 
    config.ambientIntensity,
    config.lightRotation,
    config.lightElevation,
    config.envRotation,
    config.showFloor, 
    config.envPreset, 
    config.bloomEnabled, 
    config.bloomStrength, 
    config.bloomRadius, 
    config.bloomThreshold, 
    config.shadingMode,
    config.fov,
    config.cameraDistance,
    config.cameraElevation,
    config.cameraAzimuth,
    config.cameraRoll,
    config.cameraMotion,
    config.cameraViewMode,
    config.cameraPosX,
    config.cameraPosY,
    config.cameraPosZ,
    config.cameraTargetX,
    config.cameraTargetY,
    config.cameraTargetZ
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

      // If an export session is currently actively rendering frame-by-frame, skip the standard RAF tick
      if ((window as any).__THREE_IS_RECORDING__) {
        return;
      }

      const now = performance.now();
      const deltaSec = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      // FPS tracking
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      const curConfig = configRef.current;
      const curParts = partsRef.current;

      // Smooth gyro cursor (only if gyro is explicitly enabled)
      const hasGyro = curConfig.gyroEnabled || (curConfig.stackedEffects && curConfig.stackedEffects.gyroTilt);
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

      // Advance time if playing (respecting In/Out Work Area loop bounds)
      const dur = durationRef.current > 0 ? durationRef.current : 4;
      if (isPlayingRef.current) {
        const inTime = (workAreaRef.current?.inPoint ?? 0) * dur;
        const outTime = (workAreaRef.current?.outPoint ?? 1) * dur;
        let newTime = timeRef.current + (deltaSec * speedRef.current);
        if (newTime >= outTime) {
          newTime = inTime;
        } else if (newTime < inTime) {
          newTime = inTime;
        }
        timeRef.current = newTime;
        onUpdateConfigRef.current({ time: newTime });
      }

      // Evaluate Motion Frame on EVERY frame (both playing and paused/scrubbed)
      const normalizedTime = dur > 0 ? (timeRef.current / dur) : 0;
      if (lightsRef.current && logoGroupRef.current) {
        evaluate3DMotion(
          logoGroupRef.current,
          meshesRef.current,
          motionModeRef.current,
          normalizedTime,
          amplitudeRef.current,
          mouseGyroRef.current,
          { keyLight: lightsRef.current.keyLight, rimLight: lightsRef.current.rimLight },
          curConfig,
          curParts,
          cameraRef.current,
          controlsRef.current
        );
      }

      // Render
      if (composerRef.current && curConfig.shadingMode === 'bloom' && curConfig.bloomEnabled) {
        composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // Pointer move for Gyro Cursor Reaction
  const handlePointerMove = (e: React.PointerEvent) => {
    const curConfig = configRef.current;
    const hasGyro = curConfig.gyroEnabled || (curConfig.stackedEffects && curConfig.stackedEffects.gyroTilt);
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

    if (preset === 'camera') {
      onUpdateConfig({ cameraPreset: 'camera', cameraViewMode: 'camera' });
      return;
    }

    if (preset === 'free') {
      onUpdateConfig({ cameraPreset: 'free', cameraViewMode: 'free' });
      return;
    }

    switch (preset) {
      case 'front':
        onUpdateConfig({ 
          cameraPreset: 'front', 
          cameraViewMode: 'camera', 
          cameraElevation: 0, 
          cameraAzimuth: 0, 
          cameraRoll: 0,
          cameraPosY: 0,
          cameraPosX: 0
        });
        break;
      case 'iso':
        onUpdateConfig({ 
          cameraPreset: 'iso', 
          cameraViewMode: 'camera', 
          cameraElevation: 25, 
          cameraAzimuth: 40, 
          cameraRoll: 0 
        });
        break;
      case 'top':
        onUpdateConfig({ 
          cameraPreset: 'top', 
          cameraViewMode: 'camera', 
          cameraElevation: 75, 
          cameraAzimuth: 0, 
          cameraRoll: 0 
        });
        break;
      case 'side':
        onUpdateConfig({ 
          cameraPreset: 'side', 
          cameraViewMode: 'camera', 
          cameraElevation: 0, 
          cameraAzimuth: 90, 
          cameraRoll: 0 
        });
        break;
    }
  };

  // Blender-style Keyboard Shortcuts: 0/C toggle Cam, 1 Front, 3 Side, 7 Top, [ and ] rotate Light Rig
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Numpad0' || (e.key === '0' && !e.ctrlKey && !e.metaKey && !e.altKey) || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (config.cameraViewMode === 'camera') {
          handleSetCameraPreset('free');
        } else {
          handleSetCameraPreset('camera');
        }
      } else if (e.code === 'Numpad1' || e.key === '1') {
        e.preventDefault();
        handleSetCameraPreset('front');
      } else if (e.code === 'Numpad3' || e.key === '3') {
        e.preventDefault();
        handleSetCameraPreset('side');
      } else if (e.code === 'Numpad7' || e.key === '7') {
        e.preventDefault();
        handleSetCameraPreset('top');
      } else if (e.key === '[') {
        e.preventDefault();
        const currentRot = config.lightRotation ?? 35;
        onUpdateConfig({ lightRotation: (currentRot - 15 + 360) % 360 });
      } else if (e.key === ']') {
        e.preventDefault();
        const currentRot = config.lightRotation ?? 35;
        onUpdateConfig({ lightRotation: (currentRot + 15) % 360 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.cameraViewMode, config.lightRotation, onUpdateConfig]);

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
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.toLowerCase().endsWith('.svg') || file.type.includes('svg'))) {
      onDropSvgFile?.(file);
    }
  };

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 w-full h-full bg-[#080a0f] overflow-hidden select-none"
    >
      {/* Interactive Drag & Drop File Indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-[#07080c]/85 backdrop-blur-md border-2 border-dashed border-[#ff4e2e] m-4 rounded-xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-100 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-[#ff4e2e]/20 border border-[#ff4e2e]/40 flex items-center justify-center text-[#ff4e2e] shadow-xl shadow-[#ff4e2e]/20">
            <Upload size={28} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-base font-bold text-white font-display uppercase tracking-wider">
              Drop SVG Vector File Here
            </span>
            <span className="text-xs font-mono text-slate-400">
              Instantly extrude into 3D PBR WebGL mesh & animate
            </span>
          </div>
        </div>
      )}

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

        {/* Camera View Mode Switcher (Active Framed Camera vs Free Orbit) */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          <button
            onClick={() => handleSetCameraPreset('camera')}
            title="Lock to Framed Camera View (0 / C)"
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase transition-all ${
              config.cameraViewMode === 'camera'
                ? 'bg-[#ff4e2e] text-white font-bold shadow-md shadow-[#ff4e2e]/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera size={11} />
            <span>CAM (0)</span>
          </button>
          <button
            onClick={() => handleSetCameraPreset('free')}
            title="Free Orbit Perspective"
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase transition-all ${
              config.cameraViewMode === 'free'
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={11} />
            <span>FREE</span>
          </button>
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Quick Camera Angles */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          {[
            { id: 'front' as const, label: 'Front' },
            { id: 'iso' as const, label: 'ISO' },
            { id: 'top' as const, label: 'Top' },
            { id: 'side' as const, label: 'Side' }
          ].map(angle => (
            <button
              key={angle.id}
              onClick={() => handleSetCameraPreset(angle.id)}
              className={`px-1.5 py-1 rounded text-[9.5px] font-mono uppercase transition-all ${
                config.cameraPreset === angle.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {angle.label}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Studio Light Rig Azimuth Control & Quick Front Lighting */}
        <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5">
          <button
            onClick={() => onUpdateConfig({ lightRotation: ((config.lightRotation ?? 35) + 30) % 360 })}
            title="Rotate Studio Lighting Rig ([ and ])"
            className="flex items-center gap-1 px-1.5 py-1 rounded text-[9.5px] font-mono text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-all"
          >
            <Sun size={11} />
            <span>{config.lightRotation ?? 35}°</span>
          </button>
          <button
            onClick={() => onUpdateConfig({ lightRotation: 0, lightElevation: 30 })}
            title="Aim Key Light directly at Front Face (0°)"
            className={`px-1.5 py-1 rounded text-[9px] font-mono uppercase transition-all ${
              (config.lightRotation ?? 35) === 0
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Front
          </button>
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
          <span className="text-amber-400">Sun {config.lightRotation ?? 35}°</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400">{config.cameraViewMode === 'camera' ? 'Cam (0)' : 'Free'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 truncate max-w-[120px]">{selectedPartName}</span>
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
