import { GLYPH_PATHS } from './vectorPaths';
import { PbrPresetId, LightingRigId, ProceduralTextureType } from '../types/threeStudio';

export { ALL_ASSETS as THREE_ASSET_PRESETS, type SvgAssetPreset } from './assetLibrary';

export interface PbrMaterialPreset {
  id: PbrPresetId;
  name: string;
  description: string;
  faceColor: string;
  sideColor: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  transmission: number;
  flutingEnabled: boolean;
  fluteScale: number;
  proceduralTexture: ProceduralTextureType;
  bloomEnabled: boolean;
  bloomStrength: number;
}

export const PBR_PRESETS: PbrMaterialPreset[] = [
  {
    id: 'crimson',
    name: 'Crimson & Noir',
    description: 'Signature vibrant scarlet face with obsidian metallic bevels',
    faceColor: '#ff263e',
    sideColor: '#4a070e',
    roughness: 0.22,
    metalness: 0.45,
    clearcoat: 0.75,
    transmission: 0.0,
    flutingEnabled: false,
    fluteScale: 0.45,
    proceduralTexture: 'none',
    bloomEnabled: true,
    bloomStrength: 0.75
  },
  {
    id: 'ribbed',
    name: 'Ribbed Fluted Glass',
    description: 'Architectural ribbed micro-groove refraction with high clearcoat',
    faceColor: '#e0283e',
    sideColor: '#30050a',
    roughness: 0.35,
    metalness: 0.15,
    clearcoat: 0.95,
    transmission: 0.0,
    flutingEnabled: true,
    fluteScale: 0.65,
    proceduralTexture: 'fluted',
    bloomEnabled: true,
    bloomStrength: 0.9
  },
  {
    id: 'gold',
    name: '24K Luxury Gold',
    description: 'Mirror-polished champagne gold with rich metallic reflections',
    faceColor: '#ffd700',
    sideColor: '#997300',
    roughness: 0.16,
    metalness: 0.92,
    clearcoat: 0.85,
    transmission: 0.0,
    flutingEnabled: false,
    fluteScale: 0.3,
    proceduralTexture: 'brushed',
    bloomEnabled: true,
    bloomStrength: 0.8
  },
  {
    id: 'chrome',
    name: 'Mirror Cyber Chrome',
    description: 'Specular titanium alloy with icy rim glints',
    faceColor: '#eef2ff',
    sideColor: '#6366f1',
    roughness: 0.08,
    metalness: 0.98,
    clearcoat: 1.0,
    transmission: 0.0,
    flutingEnabled: false,
    fluteScale: 0.3,
    proceduralTexture: 'diamond',
    bloomEnabled: true,
    bloomStrength: 0.85
  },
  {
    id: 'glass',
    name: 'Frosted Translucent',
    description: 'Refractive optical glass with interior depth scattering',
    faceColor: '#ffffff',
    sideColor: '#88aaff',
    roughness: 0.22,
    metalness: 0.1,
    clearcoat: 0.9,
    transmission: 0.82,
    flutingEnabled: false,
    fluteScale: 0.3,
    proceduralTexture: 'noise',
    bloomEnabled: true,
    bloomStrength: 0.7
  },
  {
    id: 'neon',
    name: 'Cyberpunk Neon',
    description: 'Ultra-vivid emissive bloom with electric saturated aura',
    faceColor: '#00f0ff',
    sideColor: '#ff0055',
    roughness: 0.1,
    metalness: 0.65,
    clearcoat: 0.8,
    transmission: 0.0,
    flutingEnabled: false,
    fluteScale: 0.3,
    proceduralTexture: 'none',
    bloomEnabled: true,
    bloomStrength: 1.45
  },
  {
    id: 'clay',
    name: 'Matte Studio Ceramic',
    description: 'Soft diffusion clay finish for architectural form inspection',
    faceColor: '#f1f5f9',
    sideColor: '#94a3b8',
    roughness: 0.82,
    metalness: 0.0,
    clearcoat: 0.0,
    transmission: 0.0,
    flutingEnabled: false,
    fluteScale: 0.0,
    proceduralTexture: 'none',
    bloomEnabled: false,
    bloomStrength: 0.0
  }
];

export interface LightingRigPreset {
  id: LightingRigId;
  name: string;
  description: string;
  keyColor: string;
  keyIntensity: number;
  rimColor: string;
  rimIntensity: number;
  fillColor: string;
  fillIntensity: number;
  ambientIntensity: number;
}

export const LIGHTING_RIGS: LightingRigPreset[] = [
  {
    id: 'studio',
    name: 'Studio High-Key',
    description: 'Clean balanced commercial lighting with crisp edge separation',
    keyColor: '#ffffff',
    keyIntensity: 2.2,
    rimColor: '#ffffff',
    rimIntensity: 2.8,
    fillColor: '#ff8877',
    fillIntensity: 0.9,
    ambientIntensity: 0.5
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Grid',
    description: 'Electric cyan key with contrasting hot magenta rim',
    keyColor: '#00f0ff',
    keyIntensity: 2.5,
    rimColor: '#ff0077',
    rimIntensity: 3.8,
    fillColor: '#6366f1',
    fillIntensity: 0.8,
    ambientIntensity: 0.4
  },
  {
    id: 'luxury',
    name: 'Luxury Warmth',
    description: 'Warm champagne amber lighting for high-end gold & brass',
    keyColor: '#fff2db',
    keyIntensity: 2.0,
    rimColor: '#ffd799',
    rimIntensity: 2.6,
    fillColor: '#ffccaa',
    fillIntensity: 0.8,
    ambientIntensity: 0.6
  },
  {
    id: 'noir',
    name: 'Dramatic Film Noir',
    description: 'Chiaroscuro high-contrast spotlight with intense rim glints',
    keyColor: '#ffffff',
    keyIntensity: 3.2,
    rimColor: '#38bdf8',
    rimIntensity: 4.2,
    fillColor: '#1e293b',
    fillIntensity: 0.2,
    ambientIntensity: 0.2
  }
];
