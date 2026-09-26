export interface ThreePart {
  id: string;
  name: string;
  pathD: string;
  originalColor: string;
  faceColor: string;
  sideColor: string;
  depthOffset: number;
  bevelScale: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  phaseDelay: number;
  metalness: number;
  roughness: number;
  emissive: string;
  transmission: number;
  visible: boolean;
  isolated: boolean;
  isBackground?: boolean;
}

export type ViewportShadingMode = 'rendered' | 'bloom' | 'solid' | 'wireframe';
export type CameraAnglePreset = 'camera' | 'front' | 'iso' | 'top' | 'side' | 'free';
export type CameraViewMode = 'camera' | 'free';

export type ThreeMotionMode = 
  | 'reveal' 
  | 'turntable' 
  | 'wave' 
  | 'sweep' 
  | 'explode' 
  | 'camera'
  | 'camera-orbit'
  | 'camera-dolly'
  | 'camera-crane'
  | 'camera-corkscrew'
  | 'sync2d'
  | 'typewriter'
  | 'wiredraw'
  | 'ligature-clamp'
  | 'liquid-wipe'
  | 'depth-slam'
  | 'origami'
  | 'laser-sweep'
  | 'magnetic-snap'
  | 'neon-flicker'
  | 'cyber-glitch'
  | 'isometric-cube'
  | 'quantum-pulse'
  | 'matrix-stream'
  | 'smoke-dissolve'
  | 'solar-flare'
  | 'minimal-fade'
  | 'audio-reactive'
  | (string & {});

export type PbrPresetId = 
  | 'crimson' 
  | 'ribbed' 
  | 'gold' 
  | 'chrome' 
  | 'glass' 
  | 'neon' 
  | 'clay';

export type LightingRigId = 
  | 'studio' 
  | 'cyber' 
  | 'luxury' 
  | 'noir';

export type EnvironmentScenePreset = 
  | 'studio'
  | 'radial'
  | 'cyber'
  | 'luxury'
  | 'obsidian'
  | 'transparent';

export type ProceduralTextureType = 
  | 'none' 
  | 'fluted' 
  | 'brushed' 
  | 'carbon' 
  | 'diamond' 
  | 'noise';

export type SocialFramingAspect = 
  | 'free' 
  | '16:9' 
  | '9:16' 
  | '1:1' 
  | '21:9';

export interface AssetGroup {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  parts: ThreePart[];
}

export interface StackedEffectsConfig {
  hoverFloat: boolean;
  turntableSpin: boolean;
  harmonicWave: boolean;
  lightSweep: boolean;
  gyroTilt: boolean;
  sync2dMotion: boolean;
}

export interface ThreeStudioConfig {
  // Collective Asset Group Meta & Transform
  groupId: string;
  groupName: string;
  isGroupLocked: boolean;
  isGroupVisible: boolean;

  // Geometry
  depth: number;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  meshScale: number;
  autoCenter: boolean;

  // Object Collective Transform (Blender style Position, Rotation, Scale)
  posX: number;
  posY: number;
  posZ: number;
  rotX: number; // degrees
  rotY: number; // degrees
  rotZ: number; // degrees
  scaleX: number;
  scaleY: number;
  scaleZ: number;

  // Camera Settings
  fov: number; // 25 to 90 degrees
  cameraDistance: number;
  cameraViewMode?: CameraViewMode;
  cameraPosX?: number;
  cameraPosY?: number;
  cameraPosZ?: number;
  cameraTargetX?: number;
  cameraTargetY?: number;
  cameraTargetZ?: number;
  cameraMotion?: 'none' | 'orbit' | 'dolly' | 'crane' | 'corkscrew';

  // Environment & Scene Settings
  envPreset: EnvironmentScenePreset;
  envRotation?: number; // 0 to 360 degrees
  fogDensity: number;
  floorRoughness: number;
  floorMetalness: number;
  gridColor: string;

  // Surface Material
  faceColor: string;
  sideColor: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  transmission: number;
  emissiveIntensity: number;
  flutingEnabled: boolean;
  fluteScale: number;
  proceduralTexture: ProceduralTextureType;

  // Studio Lighting
  keyColor: string;
  keyIntensity: number;
  rimColor: string;
  rimIntensity: number;
  fillColor: string;
  fillIntensity: number;
  ambientIntensity: number;
  lightRotation?: number; // 0 to 360 degrees (Blender style light rig azimuth)
  lightElevation?: number; // 10 to 80 degrees (pitch above horizon)
  showFloor: boolean;
  showLightHelpers: boolean;
  transparentBg: boolean;

  // Viewport Gizmo & Social Framing
  gizmoMode: 'none' | 'light' | 'model';
  framingAspect: SocialFramingAspect;
  showFramingMask: boolean;

  // Unreal Bloom
  bloomEnabled: boolean;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;

  // Motion & Animation
  motionMode: ThreeMotionMode;
  stackedEffects: StackedEffectsConfig;
  isPlaying: boolean;
  amplitude: number;
  time: number;
  duration: number;
  speed: number;
  gyroEnabled: boolean;
  active2dMotionId: string;
  workArea?: { inPoint: number; outPoint: number };

  // Viewport Settings
  shadingMode: ViewportShadingMode;
  cameraPreset: CameraAnglePreset;
  activeAssetId: string;
  activePbrId: PbrPresetId;
  activeRigId: LightingRigId;
  selectedPartIndex: number;
  hoveredPartIndex?: number;
  uiComplexity?: 'presets' | 'advanced';
}
