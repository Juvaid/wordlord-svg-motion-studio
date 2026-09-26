// src/utils/userAssetStore.ts
// Persistent User Vector Asset Bank & Preset System (localStorage + JSON Export/Import)
import { SvgAssetPreset } from '../data/assetLibrary';
import { cleanSvgArtboardBackground, getSvgViewBox } from './threeEngine';

export interface UserAsset {
  id: string;
  name: string;
  category: 'Custom' | 'Branded' | 'Tech Brands' | 'UI Icons' | 'Monograms';
  description: string;
  viewBox: string;
  svgString: string;
  createdAt: number;
  isUserCreated: true;
}

const STORAGE_KEY = 'WORDLORD_USER_ASSET_BANK_V1';

/**
 * Retrieve all persistent user-created vector assets from localStorage
 */
export function getUserAssets(): UserAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(a => a && a.id && a.svgString);
    }
  } catch (err) {
    console.warn('[UserAssetStore] Error reading user assets:', err);
  }
  return [];
}

/**
 * Persist an array of user assets to localStorage
 */
function persistUserAssets(assets: UserAsset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (err) {
    console.warn('[UserAssetStore] Error saving user assets:', err);
  }
}

/**
 * Save a new or edited custom SVG asset into the persistent bank
 */
export function saveUserAsset(
  name: string,
  rawSvgString: string,
  category: UserAsset['category'] = 'Custom',
  description?: string
): UserAsset {
  const assets = getUserAssets();
  const cleanedSvg = cleanSvgArtboardBackground(rawSvgString.trim());
  const viewBox = getSvgViewBox(cleanedSvg, '0 0 500 500');
  
  const id = `user-asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newAsset: UserAsset = {
    id,
    name: name.trim() || 'Custom Vector Mark',
    category,
    description: description || `Custom imported SVG vector asset (${new Date().toLocaleDateString()})`,
    viewBox,
    svgString: cleanedSvg,
    createdAt: Date.now(),
    isUserCreated: true
  };

  const updated = [newAsset, ...assets];
  persistUserAssets(updated);
  return newAsset;
}

/**
 * Delete a user asset by unique ID
 */
export function deleteUserAsset(id: string): boolean {
  const assets = getUserAssets();
  const filtered = assets.filter(a => a.id !== id);
  if (filtered.length !== assets.length) {
    persistUserAssets(filtered);
    return true;
  }
  return false;
}

/**
 * Combine built-in presets with user assets into a unified catalog
 */
export function getCombinedAssets(builtInPresets: SvgAssetPreset[]): (SvgAssetPreset | UserAsset)[] {
  const userAssets = getUserAssets();
  return [...userAssets, ...builtInPresets];
}

/**
 * Export all user assets as a JSON bundle
 */
export function exportUserAssetsJson(): string {
  const userAssets = getUserAssets();
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    assetCount: userAssets.length,
    assets: userAssets
  }, null, 2);
}

/**
 * Import a JSON bundle of user assets into localStorage
 */
export function importUserAssetsJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    const candidateAssets: any[] = Array.isArray(data) ? data : data.assets;
    if (!Array.isArray(candidateAssets)) {
      return { success: false, count: 0, error: 'Invalid JSON format: expected asset array.' };
    }

    const current = getUserAssets();
    const currentIds = new Set(current.map(a => a.id));
    let importedCount = 0;

    const validated: UserAsset[] = [];
    for (const item of candidateAssets) {
      if (item.name && item.svgString) {
        const id = item.id && !currentIds.has(item.id) 
          ? item.id 
          : `user-asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        validated.push({
          id,
          name: item.name,
          category: item.category || 'Custom',
          description: item.description || 'Imported vector asset',
          viewBox: item.viewBox || getSvgViewBox(item.svgString, '0 0 500 500'),
          svgString: item.svgString,
          createdAt: item.createdAt || Date.now(),
          isUserCreated: true
        });
        importedCount++;
      }
    }

    if (validated.length > 0) {
      persistUserAssets([...validated, ...current]);
    }

    return { success: true, count: importedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed to parse JSON file.' };
  }
}
