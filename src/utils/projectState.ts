import { ThreeStudioConfig, ThreePart } from '../types/threeStudio';
import { GeometryMode, BackgroundMode, BentoConfig } from '../types';

export interface ProjectStateSnapshot {
  version: string;
  timestamp: number;
  studioMode: '2d' | '3d' | 'motion-graphics';
  bentoConfig?: BentoConfig;
  // 2D State
  activeMotionId: string;
  activeStyleId: string;
  duration: number;
  stagger: number;
  glowRadius: number;
  glowIntensity: number;
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
 * Load project snapshot from browser local storage
 */
export function loadProjectFromStorage(): ProjectStateSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectStateSnapshot;
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
        const parsed = JSON.parse(text) as ProjectStateSnapshot;
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid project JSON file format.'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
