import { ThreeStudioConfig, ThreePart } from '../types/threeStudio';
import { GeometryMode, BackgroundMode, BentoConfig } from '../types';

export interface ProjectStateSnapshot {
  version: string;
  timestamp: number;
  actionName?: string;
  studioMode: '2d' | '3d' | 'motion-graphics';
  uiComplexity?: 'presets' | 'advanced';
  activeAssetId?: string;
  bentoConfig?: BentoConfig;
  // 2D State
  activeMotionId: string;
  activeStyleId: string;
  duration: number;
  stagger: number;
  glowRadius: number;
  glowIntensity: number;
  glowTarget?: 'all' | 'media' | 'word' | 'lord' | 'ligature' | 'selected';
  geometryMode: GeometryMode;
  strokeWidth: number;
  tiltX: number;
  tiltY: number;
  colors: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
  // 3D State
  threeConfig: ThreeStudioConfig;
  threeParts: ThreePart[];
}

const STORAGE_KEY = 'wordlord_studio_state_v5';

/**
 * Save project snapshot to browser local storage
 */
export function saveProjectToStorage(snapshot: ProjectStateSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('Could not save project to localStorage', err);
  }
}

/**
 * Validate and sanitize a loaded project snapshot against missing fields or schema shifts
 */
export function validateProjectSnapshot(data: any): ProjectStateSnapshot {
  if (!data || typeof data !== 'object') {
    throw new Error('Project data must be a valid JSON object.');
  }

  return {
    version: typeof data.version === 'string' ? data.version : '5.0.0',
    timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
    actionName: data.actionName || 'Imported Project',
    studioMode: ['2d', '3d', 'motion-graphics'].includes(data.studioMode) ? data.studioMode : '2d',
    uiComplexity: data.uiComplexity === 'presets' || data.uiComplexity === 'advanced' ? data.uiComplexity : 'presets',
    activeAssetId: typeof data.activeAssetId === 'string' ? data.activeAssetId : 'wordlord',
    bentoConfig: data.bentoConfig && typeof data.bentoConfig === 'object' ? data.bentoConfig : undefined,
    activeMotionId: typeof data.activeMotionId === 'string' ? data.activeMotionId : 'typewriter',
    activeStyleId: typeof data.activeStyleId === 'string' ? data.activeStyleId : 'signature',
    duration: typeof data.duration === 'number' && data.duration > 0 ? data.duration : 1.0,
    stagger: typeof data.stagger === 'number' ? data.stagger : 60,
    glowRadius: typeof data.glowRadius === 'number' ? data.glowRadius : 20,
    glowIntensity: typeof data.glowIntensity === 'number' ? data.glowIntensity : 100,
    glowTarget: ['all', 'media', 'word', 'lord', 'ligature', 'selected'].includes(data.glowTarget) ? data.glowTarget : 'media',
    geometryMode: ['fill', 'stroke', 'hybrid'].includes(data.geometryMode) ? data.geometryMode : 'fill',
    strokeWidth: typeof data.strokeWidth === 'number' ? data.strokeWidth : 1.0,
    tiltX: typeof data.tiltX === 'number' ? data.tiltX : 0,
    tiltY: typeof data.tiltY === 'number' ? data.tiltY : 0,
    colors: {
      word: data.colors?.word || '#ffffff',
      lord: data.colors?.lord || '#ffffff',
      ligature: data.colors?.ligature || '#ffffff',
      media: data.colors?.media || '#ff4e2e'
    },
    threeConfig: data.threeConfig && typeof data.threeConfig === 'object' ? data.threeConfig : {} as ThreeStudioConfig,
    threeParts: Array.isArray(data.threeParts) ? data.threeParts : []
  };
}

/**
 * Load project snapshot from browser local storage
 */
export function loadProjectFromStorage(): ProjectStateSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validateProjectSnapshot(parsed);
  } catch (err) {
    console.warn('Could not parse saved project from localStorage', err);
    return null;
  }
}

/**
 * Export project snapshot to downloadable JSON file
 */
export function exportProjectToFile(snapshot: ProjectStateSnapshot): void {
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wordlord-studio-project-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import project snapshot from JSON file
 */
export function importProjectFromFile(file: File): Promise<ProjectStateSnapshot> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const validated = validateProjectSnapshot(parsed);
        resolve(validated);
      } catch (err: any) {
        reject(new Error(err?.message || 'Invalid project JSON file format.'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
