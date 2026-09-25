export type MotionCategory = 'Reveal' | 'Kinetic' | 'Glitch' | 'Optics' | '3D' | 'Ambient';

export interface MotionPreset {
  id: string;
  name: string;
  badge: MotionCategory;
  animClass: string;
  defaultDuration: number;
  defaultEase: string;
  defaultStagger: number;
  desc: string;
  fps: number;
  specs: {
    interpolator: string;
    complexity: string;
    staggerScale: string;
  };
}

export interface StylePreset {
  id: string;
  name: string;
  category: string;
  desc: string;
  fillWord: string;
  fillLord: string;
  fillLigature: string;
  fillMedia: string;
  glowColor: string;
  glowRadius: number;
  glowFilter: string;
  glowOpacity: number;
  bgGradient: string;
  strokeWidth: number;
  strokeColor: string;
  shadowColor: string;
}

export interface GlyphItem {
  id: string;
  char: string;
  group: 'WORD' | 'LORD' | 'LIGATURE' | 'MEDIA';
  path: string;
  bounds: string;
}

export interface BezierPoints {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
}

export type PlaybackMode = 'loop' | 'once' | 'alternate';

export type GeometryMode = 'fill' | 'stroke' | 'hybrid';

export type BackgroundMode = 'dark' | 'radial' | 'grid' | 'checker';

export interface TimelineTrack {
  id: string;
  name: string;
  groupKey: string;
  color: string;
  visible: boolean;
  locked: boolean;
  startRatio: number;
  widthRatio: number;
  keyframes: Array<{
    id: string;
    timeRatio: number;
    label: string;
  }>;
}

export interface StudioState {
  activeMotionId: string;
  activeStyleId: string;
  duration: number;
  stagger: number;
  easeFormula: string;
  bezier: BezierPoints;
  playbackMode: PlaybackMode;
  playbackSpeed: number;
  isPlaying: boolean;
  isLooping: boolean;
  soundEnabled: boolean;
  currentProgress: number;
  glowRadius: number;
  glowIntensity: number;
  geometryMode: GeometryMode;
  strokeWidth: number;
  tiltX: number;
  tiltY: number;
  scale: number;
  pan: { x: number; y: number };
  bgMode: BackgroundMode;
  activeTab: 'motions' | 'styles' | 'glyphs';
  searchQuery: string;
  categoryFilter: string;
  colorOverrides: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
}

export type BentoTheme = 'obsidian' | 'slate' | 'cyberpunk' | 'monochrome' | 'gold';

export interface BentoConfig {
  headlineWord: string;
  headlineLord: string;
  sublineText: string;
  docPath: string;
  tagText: string;
  theme: BentoTheme;
  cardTiltX: number;
  cardTiltY: number;
  glassmorphism: boolean;
  borderGlow: boolean;
  showMark: boolean;
  staggerMs: number;
  engineSpec: string;
  dynamicsSpec: string;
  fpsSpec: string;
  resSpec: string;
}

