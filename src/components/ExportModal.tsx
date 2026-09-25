import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, FileCode, Braces } from 'lucide-react';
import { GLYPH_PATHS } from '../data/vectorPaths';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  motionName: string;
  duration: number;
  easeFormula: string;
  glowRadius: number;
  colors: {
    word: string;
    lord: string;
    ligature: string;
    media: string;
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  motionName,
  duration,
  easeFormula,
  glowRadius,
  colors
}) => {
  const [activeTab, setActiveTab] = useState<'svg' | 'css' | 'react' | 'json'>('svg');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const svgCode = `<svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible !important;">
  <defs>
    <filter id="wlm-glow" x="-250%" y="-250%" width="600%" height="600%">
      <feGaussianBlur stdDeviation="${(glowRadius * 0.08).toFixed(1)}" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g id="group-word" fill="${colors.word}">
    <path d="${GLYPH_PATHS.wordW}"/>
    <path d="${GLYPH_PATHS.wordO}"/>
    <path d="${GLYPH_PATHS.wordR}"/>
  </g>
  <g id="group-lord" fill="${colors.lord}">
    <path d="${GLYPH_PATHS.lordL}"/>
    <path d="${GLYPH_PATHS.lordO}"/>
    <path d="${GLYPH_PATHS.lordR}"/>
  </g>
  <g id="group-ligature" fill="${colors.ligature}">
    <path d="${GLYPH_PATHS.ligatureD}"/>
  </g>
  <g id="group-media" fill="${colors.media}" filter="url(#wlm-glow)">
    <path d="${GLYPH_PATHS.mediaM}"/>
    <path d="${GLYPH_PATHS.mediaE}"/>
    <path d="${GLYPH_PATHS.mediaD}"/>
    <path d="${GLYPH_PATHS.mediaI}"/>
    <path d="${GLYPH_PATHS.mediaA}"/>
  </g>
</svg>`;

  const cssCode = `/* WordLord Media — ${motionName} Animation */
:root {
  --wlm-duration: ${duration}s;
  --wlm-ease: ${easeFormula};
  --wlm-glow-color: ${colors.media};
}

.wlm-animated {
  overflow: visible !important;
}

.wlm-animated path {
  animation: wlmReveal var(--wlm-duration) forwards var(--wlm-ease);
}

@keyframes wlmReveal {
  from { opacity: 0; transform: translateY(4px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}`;

  const reactCode = `import React from 'react';

export const WordLordMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="25"
    height="26"
    viewBox="0 0 25 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={\`overflow-visible \${className}\`}
  >
    <defs>
      <filter id="wlm-glow" x="-250%" y="-250%" width="600%" height="600%">
        <feGaussianBlur stdDeviation="${(glowRadius * 0.08).toFixed(1)}" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g fill="${colors.word}">
      <path d="${GLYPH_PATHS.wordW}"/>
      <path d="${GLYPH_PATHS.wordO}"/>
      <path d="${GLYPH_PATHS.wordR}"/>
    </g>
    <g fill="${colors.lord}">
      <path d="${GLYPH_PATHS.lordL}"/>
      <path d="${GLYPH_PATHS.lordO}"/>
      <path d="${GLYPH_PATHS.lordR}"/>
    </g>
    <g fill="${colors.ligature}">
      <path d="${GLYPH_PATHS.ligatureD}"/>
    </g>
    <g fill="${colors.media}" filter="url(#wlm-glow)">
      <path d="${GLYPH_PATHS.mediaM}"/>
      <path d="${GLYPH_PATHS.mediaE}"/>
      <path d="${GLYPH_PATHS.mediaD}"/>
      <path d="${GLYPH_PATHS.mediaI}"/>
      <path d="${GLYPH_PATHS.mediaA}"/>
    </g>
  </svg>
);`;

  const jsonCode = JSON.stringify({
    schema: "wordlord.motion.spec.v1",
    preset: motionName,
    duration: duration,
    interpolator: easeFormula,
    glow: {
      radius: glowRadius,
      color: colors.media
    },
    palette: colors
  }, null, 2);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'svg': return svgCode;
      case 'css': return cssCode;
      case 'react': return reactCode;
      case 'json': return jsonCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const code = getActiveCode();
    const ext = activeTab === 'svg' ? 'svg' : activeTab === 'css' ? 'css' : activeTab === 'react' ? 'tsx' : 'json';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordlord-${activeTab}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-[720px] max-w-full max-h-[85vh] bg-[#0e1118] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#0a0c10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Code2 size={15} className="text-[#ff4e2e]" />
            <span>Export Code & Manifest</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#121520] border-b border-[#1f2430] px-4 pt-2 gap-2">
          {[
            { key: 'svg' as const, label: 'Raw SVG', icon: Code2 },
            { key: 'css' as const, label: 'CSS Keyframes', icon: FileCode },
            { key: 'react' as const, label: 'React TSX', icon: Code2 },
            { key: 'json' as const, label: 'JSON Specs', icon: Braces }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-[#ff4e2e] text-[#ff4e2e]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Output Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          <pre className="bg-[#050608] border border-[#1f2430] rounded-lg p-3 text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre max-h-[350px]">
            {getActiveCode()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="h-14 px-4 bg-[#0a0c10] border-t border-[#1f2430] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            Unclipped Vector Mark // Guaranteed Spec
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181c28] hover:bg-[#222738] border border-[#2b3245] text-slate-200 rounded-md text-xs font-mono transition-all"
            >
              <Download size={12} />
              <span>Download</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ff4e2e] hover:bg-[#ff6144] text-white rounded-md text-xs font-semibold shadow-md transition-all"
            >
              {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
