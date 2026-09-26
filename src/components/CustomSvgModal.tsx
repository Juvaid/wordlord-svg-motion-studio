import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Code2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Folder, 
  Trash2, 
  Download, 
  FileUp, 
  Layers, 
  Clock 
} from 'lucide-react';
import { cleanSvgArtboardBackground } from '../utils/threeEngine';
import { 
  getUserAssets, 
  saveUserAsset, 
  deleteUserAsset, 
  exportUserAssetsJson, 
  importUserAssetsJson, 
  UserAsset 
} from '../utils/userAssetStore';

interface CustomSvgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSvg: (svgString: string, name?: string) => void;
}

export const CustomSvgModal: React.FC<CustomSvgModalProps> = ({
  isOpen,
  onClose,
  onImportSvg
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'library'>('import');
  const [svgCode, setSvgCode] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('Custom Vector Mark');
  const [category, setCategory] = useState<UserAsset['category']>('Custom');
  const [saveToBank, setSaveToBank] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [savedAssets, setSavedAssets] = useState<UserAsset[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedAssets(getUserAssets());
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.svg$/i, '');
    setAssetName(baseName);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSvgCode(content);
        setErrorMsg(null);
      }
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (!svgCode.trim()) {
      setErrorMsg('Please paste SVG markup or upload an SVG file.');
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgRoot = doc.querySelector('svg');

      if (!svgRoot) {
        setErrorMsg('Invalid SVG markup: no <svg> root element found.');
        return;
      }

      const paths = svgRoot.querySelectorAll('path, rect, circle, polygon, ellipse');
      if (paths.length === 0) {
        setErrorMsg('SVG contains no renderable vector paths (<path>, <rect>, <circle>).');
        return;
      }

      const finalName = assetName.trim() || 'Custom Vector Mark';
      const cleaned = cleanSvgArtboardBackground(svgCode);

      if (saveToBank) {
        saveUserAsset(finalName, cleaned, category);
        setSavedAssets(getUserAssets());
      }

      onImportSvg(cleaned, finalName);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error parsing SVG markup.');
    }
  };

  const handleSelectSaved = (asset: UserAsset) => {
    onImportSvg(asset.svgString, asset.name);
    onClose();
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteUserAsset(id);
    setSavedAssets(getUserAssets());
    setSuccessMsg('Asset removed from library.');
  };

  const handleExportBank = () => {
    const json = exportUserAssetsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordlord-user-assets-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMsg('User Asset Bank JSON exported successfully!');
  };

  const handleImportBankFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (json) {
        const res = importUserAssetsJson(json);
        if (res.success) {
          setSavedAssets(getUserAssets());
          setSuccessMsg(`Successfully imported ${res.count} assets into your bank!`);
        } else {
          setErrorMsg(res.error || 'Failed to import JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-[660px] max-w-full bg-[#0d1017] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Upload size={16} className="text-[#ff4e2e]" />
            <span>Universal Vector Asset Manager</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X size={16} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center border-b border-[#1f2430] px-4 bg-[#0a0d14]">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-2 px-3 border-b-2 font-mono text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'import'
                ? 'border-[#ff4e2e] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload size={13} />
            <span>Import / Paste SVG</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`py-2 px-3 border-b-2 font-mono text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'library'
                ? 'border-[#ff4e2e] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder size={13} />
            <span>My Asset Bank ({savedAssets.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'import' && (
            <div className="flex flex-col gap-3">
              {/* Asset Name & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g. Nike Swoosh, Acme Logo"
                    className="w-full bg-[#07080c] border border-[#222736] focus:border-[#ff4e2e] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#07080c] border border-[#222736] focus:border-[#ff4e2e] rounded px-2 py-1.5 text-xs font-mono text-slate-200 outline-none"
                  >
                    <option value="Custom">Custom Mark</option>
                    <option value="Branded">Branded Logo</option>
                    <option value="Tech Brands">Tech Brand</option>
                    <option value="UI Icons">UI Icon</option>
                    <option value="Monograms">Monogram / Lettermark</option>
                  </select>
                </div>
              </div>

              {/* Paste or Upload Area */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono text-slate-300">
                  Raw SVG Code or File:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (svgCode) {
                        const cleaned = cleanSvgArtboardBackground(svgCode);
                        setSvgCode(cleaned);
                      }
                    }}
                    title="Detect and remove full-bleed bounding background rectangles"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300 transition-colors"
                  >
                    <Sparkles size={11} />
                    <span>Clean Artboard BG</span>
                  </button>

                  <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-mono text-slate-200 transition-colors">
                    <Upload size={12} />
                    <span>Choose .svg File</span>
                    <input 
                      type="file" 
                      accept=".svg" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <textarea
                value={svgCode}
                onChange={(e) => { setSvgCode(e.target.value); setErrorMsg(null); }}
                placeholder={`<svg viewBox="0 0 100 100">\n  <path d="M 10 10 L 90 90 ..." fill="#ff4e2e" />\n</svg>`}
                rows={8}
                className="w-full bg-[#07080c] border border-[#222736] focus:border-[#ff4e2e] rounded-lg p-3 text-xs font-mono text-slate-200 outline-none resize-none custom-scrollbar"
              />

              {/* Save to Bank Option */}
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveToBank}
                  onChange={(e) => setSaveToBank(e.target.checked)}
                  className="rounded border-[#2b3142] accent-[#ff4e2e]"
                />
                <span>Save to persistent User Asset Bank for future sessions</span>
              </label>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Locally stored SVG assets available across 2D & 3D workspaces:
                </span>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded bg-[#181c28] border border-[#2b3245] text-slate-300 text-[10.5px] font-mono hover:text-white transition">
                    <FileUp size={11} />
                    <span>Import JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBankFile}
                      className="hidden"
                    />
                  </label>
                  {savedAssets.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportBank}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-[#181c28] border border-[#2b3245] text-slate-300 text-[10.5px] font-mono hover:text-white transition"
                    >
                      <Download size={11} />
                      <span>Export JSON</span>
                    </button>
                  )}
                </div>
              </div>

              {savedAssets.length === 0 ? (
                <div className="p-8 border border-dashed border-[#222736] rounded-xl flex flex-col items-center justify-center gap-2 text-center text-slate-500">
                  <Folder size={28} className="opacity-40" />
                  <span className="text-xs font-mono">No custom assets in your bank yet.</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('import')}
                    className="text-xs font-mono text-[#ff4e2e] underline mt-1"
                  >
                    Import your first SVG mark
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {savedAssets.map(asset => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectSaved(asset)}
                      className="flex items-center justify-between p-2.5 bg-[#090b11] border border-[#202535] hover:border-[#ff4e2e]/50 rounded-lg cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div 
                          className="w-10 h-10 rounded bg-black/60 border border-white/5 flex items-center justify-center p-1.5 flex-shrink-0"
                          dangerouslySetInnerHTML={{ __html: asset.svgString }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                            {asset.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 truncate">
                            {asset.category} • {new Date(asset.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSaved(asset.id, e)}
                        title="Delete asset"
                        className="p-1 text-slate-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-red-950/40 border border-red-500/40 rounded text-xs font-mono text-red-200">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs font-mono text-emerald-300">
              <Check size={14} className="text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-14 px-5 bg-[#090b10] border-t border-[#1f2430] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            Decomposes vector paths into independent animated letter glyphs
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-slate-200 rounded text-xs font-mono transition-all"
            >
              Close
            </button>
            {activeTab === 'import' && (
              <button
                onClick={handleApply}
                className="px-4 py-1.5 bg-[#ff4e2e] hover:bg-[#ff6144] text-white rounded text-xs font-semibold shadow-lg shadow-[#ff4e2e]/25 transition-all flex items-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Extrude & Animate Mark</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
