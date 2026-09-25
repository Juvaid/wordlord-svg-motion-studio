import React, { useState } from 'react';
import { X, Upload, Code2, Check, AlertCircle, Sparkles } from 'lucide-react';

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
  const [svgCode, setSvgCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      onImportSvg(svgCode, 'Custom Imported SVG');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error parsing SVG markup.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-[600px] max-w-full bg-[#0d1017] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Upload size={16} className="text-[#ff4e2e]" />
            <span>Import Custom Vector SVG</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              Paste raw SVG code or upload a file:
            </span>

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

          <textarea
            value={svgCode}
            onChange={(e) => { setSvgCode(e.target.value); setErrorMsg(null); }}
            placeholder={`<svg viewBox="0 0 100 100">\n  <path d="M 10 10 L 90 90 ..." fill="#ff4e2e" />\n</svg>`}
            rows={9}
            className="w-full bg-[#07080c] border border-[#222736] focus:border-[#ff4e2e] rounded-lg p-3 text-xs font-mono text-slate-200 outline-none resize-none custom-scrollbar"
          />

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-red-950/40 border border-red-500/40 rounded text-xs font-mono text-red-200">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-14 px-5 bg-[#090b10] border-t border-[#1f2430] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            Automatically decomposes paths into 3D extruded parts
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-slate-200 rounded text-xs font-mono transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 bg-[#ff4e2e] hover:bg-[#ff6144] text-white rounded text-xs font-semibold shadow-lg shadow-[#ff4e2e]/25 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Extrude into 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
