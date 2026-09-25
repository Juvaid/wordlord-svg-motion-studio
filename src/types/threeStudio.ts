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
  | 'camera';

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

export interface ThreeStudioConfig {
  // Geometry
  depth: number;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  meshScale: number;
  autoCenter: boolean;

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
  isPlaying: boolean;
  amplitude: number;
  time: number;
  duration: number;
  speed: number;
  gyroEnabled: boolean;

  // Viewport Settings
  shadingMode: ViewportShadingMode;
  cameraPreset: CameraAnglePreset;
  activeAssetId: string;
  activePbrId: PbrPresetId;
  activeRigId: LightingRigId;
  selectedPartIndex: number;
}
