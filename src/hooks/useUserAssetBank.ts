// src/hooks/useUserAssetBank.ts
// React Hook for User Vector Asset Bank & Reusable Preset Management
import { useState, useCallback, useMemo } from 'react';
import { 
  getUserAssets, 
  saveUserAsset, 
  deleteUserAsset, 
  getCombinedAssets, 
  exportUserAssetsJson, 
  importUserAssetsJson, 
  UserAsset 
} from '../utils/userAssetStore';
import { THREE_ASSET_PRESETS } from '../data/threePresets';

export function useUserAssetBank() {
  const [nonce, setNonce] = useState(0);

  const userAssets = useMemo(() => {
    return getUserAssets();
  }, [nonce]);

  const allAssets = useMemo(() => {
    return getCombinedAssets(THREE_ASSET_PRESETS);
  }, [nonce]);

  const saveAsset = useCallback((name: string, svgString: string, category?: UserAsset['category'], description?: string) => {
    const asset = saveUserAsset(name, svgString, category, description);
    setNonce(n => n + 1);
    return asset;
  }, []);

  const removeAsset = useCallback((id: string) => {
    const success = deleteUserAsset(id);
    if (success) {
      setNonce(n => n + 1);
    }
    return success;
  }, []);

  const exportBank = useCallback(() => {
    return exportUserAssetsJson();
  }, []);

  const importBank = useCallback((jsonString: string) => {
    const res = importUserAssetsJson(jsonString);
    if (res.success) {
      setNonce(n => n + 1);
    }
    return res;
  }, []);

  return {
    userAssets,
    allAssets,
    saveAsset,
    removeAsset,
    exportBank,
    importBank,
    refreshBank: () => setNonce(n => n + 1)
  };
}
