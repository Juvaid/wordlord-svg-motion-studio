import { GLYPH_PATHS } from './vectorPaths';
import { PbrPresetId, LightingRigId, ProceduralTextureType } from '../types/threeStudio';

export interface SvgAssetPreset {
  id: string;
  name: string;
  category: 'Branded' | 'Abstract' | 'Monogram';
  description: string;
  viewBox: string;
  svgString: string;
}

// Convert our 12 WordLord vector paths into a clean standalone SVG string for Three.js SVGLoader
const WORDLORD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 26" width="500" height="520">
  <path id="Letter-W-Word" fill="#ffffff" d="${GLYPH_PATHS.wordW}" />
  <path id="Letter-O-Word" fill="#ffffff" d="${GLYPH_PATHS.wordO}" />
  <path id="Letter-R-Word" fill="#ffffff" d="${GLYPH_PATHS.wordR}" />
  <path id="Letter-L-Lord" fill="#ffffff" d="${GLYPH_PATHS.lordL}" />
  <path id="Letter-O-Lord" fill="#ffffff" d="${GLYPH_PATHS.lordO}" />
  <path id="Letter-R-Lord" fill="#ffffff" d="${GLYPH_PATHS.lordR}" />
  <path id="Monolith-Ligature-D" fill="#ffffff" d="${GLYPH_PATHS.ligatureD}" />
  <path id="Letter-M-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaM}" />
  <path id="Letter-E-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaE}" />
  <path id="Letter-D-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaD}" />
  <path id="Letter-I-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaI}" />
  <path id="Letter-A-Media" fill="#ff4e2e" d="${GLYPH_PATHS.mediaA}" />
</svg>`;

const MEDIA_SHOWPIECE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 120" width="540" height="120">
  <path id="Letter-M" fill="#FF263E" d="M 15 110 L 15 10 L 42 10 L 62 72 L 82 10 L 109 10 L 109 110 L 89 110 L 89 44 L 70 96 L 54 96 L 35 44 L 35 110 Z" />
  <path id="Letter-E" fill="#FF263E" d="M 124 110 L 124 10 L 188 10 L 188 32 L 150 32 L 150 51 L 182 51 L 182 72 L 150 72 L 150 88 L 188 88 L 188 110 Z" />
  <path id="Letter-D" fill="#FF263E" d="M 204 110 L 204 10 L 246 10 C 274 10 288 28 288 60 C 288 92 274 110 246 110 Z M 228 32 L 228 88 L 244 88 C 259 88 264 78 264 60 C 264 42 259 32 244 32 Z" />
  <path id="Letter-I" fill="#FF263E" d="M 304 110 L 304 10 L 330 10 L 330 110 Z" />
  <path id="Letter-A" fill="#FF263E" d="M 346 110 L 376 10 L 404 10 L 434 110 L 408 110 L 402 88 L 378 88 L 372 110 Z M 390 38 L 382 70 L 398 70 Z" />
</svg>`;

const CYBER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 120" width="380" height="120">
  <path id="Letter-C" fill="#06B6D4" d="M 90 20 L 30 20 L 30 100 L 90 100 L 90 80 L 52 80 L 52 40 L 90 40 Z" />
  <path id="Letter-Y" fill="#06B6D4" d="M 105 20 L 122 62 L 139 20 L 160 20 L 132 80 L 132 100 L 112 100 L 112 80 L 85 20 Z" />
  <path id="Letter-B" fill="#06B6D4" d="M 175 100 L 175 20 L 215 20 C 230 20 240 28 240 45 C 240 54 234 60 225 63 C 238 67 245 76 245 88 C 245 96 235 100 215 100 Z M 197 38 L 197 52 L 212 52 C 218 52 222 48 222 45 C 222 42 218 38 212 38 Z M 197 68 L 197 82 L 214 82 C 220 82 224 78 224 75 C 224 72 220 68 214 68 Z" />
</svg>`;

const APEX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <path id="Shield-Outer" fill="#F59E0B" d="M 150 25 L 260 85 L 260 190 L 150 275 L 40 190 L 40 85 Z" />
  <path id="Shield-Inner" fill="#EF4444" d="M 150 65 L 230 110 L 230 180 L 150 240 L 70 180 L 70 110 Z" />
  <path id="Core-Star" fill="#FFFFFF" d="M 150 100 L 165 135 L 200 150 L 165 165 L 150 200 L 135 165 L 100 150 L 135 135 Z" />
</svg>`;

const VORTEX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <path id="Spiral-Arm-Alpha" fill="#8B5CF6" d="M 150 30 C 220 30 270 80 270 150 C 270 180 250 210 220 230 L 200 200 C 220 185 235 165 235 150 C 235 105 200 65 150 65 Z" />
  <path id="Spiral-Arm-Beta" fill="#EC4899" d="M 270 150 C 270 220 220 270 150 270 C 120 270 90 250 70 220 L 100 200 C 115 220 135 235 150 235 C 195 235 235 200 235 150 Z" />
  <path id="Spiral-Arm-Gamma" fill="#06B6D4" d="M 150 270 C 80 270 30 220 30 150 C 30 120 50 90 80 70 L 100 100 C 85 115 65 135 65 150 C 65 195 105 235 150 235 Z" />
  <path id="Spiral-Arm-Delta" fill="#10B981" d="M 30 150 C 30 80 80 30 150 30 C 180 30 210 50 230 80 L 200 100 C 185 85 165 65 150 65 C 105 65 65 105 65 150 Z" />
</svg>`;

export const THREE_ASSET_PRESETS: SvgAssetPreset[] = [
  {
    id: 'wordlord',
    name: 'WordLord Media',
    category: 'Branded',
    description: '12-part typography lockup with ligature D & neon media baseline',
    viewBox: '0 0 25 26',
    svgString: WORDLORD_SVG
  },
  {
    id: 'media',
    name: 'MEDIA Showpiece',
    category: 'Branded',
    description: 'Extruded high-impact brand mark with individual letters M-E-D-I-A',
    viewBox: '0 0 540 120',
    svgString: MEDIA_SHOWPIECE_SVG
  },
  {
    id: 'cyber',
    name: 'CYB Monogram',
    category: 'Monogram',
    description: 'Futuristic sci-fi cyber monogram with neon cyan edges',
    viewBox: '0 0 380 120',
    svgString: CYBER_SVG
  },
  {
    id: 'apex',
    name: 'Apex Vanguard',
    category: 'Abstract',
    description: 'Nested heraldic shield badge with central star core',
    viewBox: '0 0 300 300',
    svgString: APEX_SVG
  },
  {
    id: 'vortex',
    name: 'Vortex Pinwheel',
    category: 'Abstract',
    description: '4-arm harmonic spiral with organic curved fins',
    viewBox: '0 0 300 300',
    svgString: VORTEX_SVG
  }
];

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
