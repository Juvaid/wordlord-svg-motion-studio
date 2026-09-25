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
export type CameraAnglePreset = 'front' | 'iso' | 'top' | 'side';

export type ThreeMotionMode = 
  | 'reveal' 
  | 'turntable' 
  | 'wave' 
  | 'sweep' 
  | 'explode' 
  | 'camera'
  | 'sync2d';

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

export interface StackedEffectsConfig {
  hoverFloat: boolean;
  turntableSpin: boolean;
  harmonicWave: boolean;
  lightSweep: boolean;
  gyroTilt: boolean;
  sync2dMotion: boolean;
}

export interface ThreeStudioConfig {
  // Geometry
  depth: number;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  meshScale: number;
  autoCenter: boolean;

  // Object Transform (Blender style Position, Rotation, Scale)
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

  // Environment & Scene Settings
  envPreset: EnvironmentScenePreset;
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

  // Studio Lighting
  keyColor: string;
  keyIntensity: number;
  rimColor: string;
  rimIntensity: number;
  fillColor: string;
  fillIntensity: number;
  ambientIntensity: number;
  showFloor: boolean;
  showLightHelpers: boolean;
  transparentBg: boolean;

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

  // Viewport Settings
  shadingMode: ViewportShadingMode;
  cameraPreset: CameraAnglePreset;
  activeAssetId: string;
  activePbrId: PbrPresetId;
  activeRigId: LightingRigId;
  selectedPartIndex: number;
}
