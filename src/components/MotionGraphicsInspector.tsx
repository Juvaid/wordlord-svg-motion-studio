import React from 'react';
import { 
  Type, 
  Sparkles, 
  Activity, 
  Layers, 
  Terminal, 
  Cpu, 
  Sliders,
  Settings
} from 'lucide-react';
import { BentoConfig, BentoTheme } from '../types';
import { InspectorSection, SliderField, SegmentedField, SettingRow } from './inspector';

interface MotionGraphicsInspectorProps {
  width: number;
  bentoConfig: BentoConfig;
  onUpdateBentoConfig: (updater: (prev: BentoConfig) => BentoConfig) => void;
  duration: number;
  onDurationChange: (val: number) => void;
  stagger: number;
  onStaggerChange: (val: number) => void;
}

export const MotionGraphicsInspector: React.FC<MotionGraphicsInspectorProps> = ({
  width,
  bentoConfig,
  onUpdateBentoConfig,
  duration,
  onDurationChange,
  stagger,
  onStaggerChange
}) => {
  const handleUpdate = <K extends keyof BentoConfig>(key: K, value: BentoConfig[K]) => {
    onUpdateBentoConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <aside 
      style={{ width }}
      className="bg-[#0c0e14] border-l border-[#1f2430] flex flex-col flex-shrink-0 z-20 overflow-y-auto select-none"
    >
      {/* Inspector Header */}
      <div className="p-3 border-b border-[#1f2430] flex items-center justify-between">
        <div>
          <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider block">
            WORKSPACE INSPECTOR
          </span>
          <h2 className="text-xs font-bold text-white font-mono tracking-tight flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#ff4e2e]" />
            <span>MOTION GRAPHICS</span>
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-[#ff4e2e]/10 text-[#ff4e2e] border border-[#ff4e2e]/25 px-1.5 py-0.5 rounded font-bold">
          Bento UI v2.4
        </span>
      </div>

      <div className="p-3 space-y-4">
        {/* Section 1: Typography & Text Content */}
        <InspectorSection 
          id="bento-typography"
          title="Typography & Content" 
          icon={<Type size={12} className="text-slate-400" />}
          defaultOpen={true}
        >
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Headline Word</label>
                <input
                  type="text"
                  value={bentoConfig.headlineWord}
                  onChange={(e) => handleUpdate('headlineWord', e.target.value)}
                  className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-xs font-mono text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Headline Lord</label>
                <input
                  type="text"
                  value={bentoConfig.headlineLord}
                  onChange={(e) => handleUpdate('headlineLord', e.target.value)}
                  className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-xs font-mono text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Subline Brand Text</label>
              <input
                type="text"
                value={bentoConfig.sublineText}
                onChange={(e) => handleUpdate('sublineText', e.target.value)}
                className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-xs font-mono text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Document Path</label>
              <input
                type="text"
                value={bentoConfig.docPath}
                onChange={(e) => handleUpdate('docPath', e.target.value)}
                className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-[11px] font-mono text-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Notion Tag Label</label>
              <input
                type="text"
                value={bentoConfig.tagText}
                onChange={(e) => handleUpdate('tagText', e.target.value)}
                className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-[11px] font-mono text-slate-300 outline-none"
              />
            </div>
          </div>
        </InspectorSection>

        {/* Section 2: Visual Theme & 3D Tilt */}
        <InspectorSection 
          id="bento-visuals"
          title="Card Visuals & 3D Tilt" 
          icon={<Layers size={12} className="text-slate-400" />}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <SegmentedField
              label="Card Aesthetic Theme"
              value={bentoConfig.theme}
              options={[
                { value: 'obsidian', label: 'Obsidian' },
                { value: 'slate', label: 'Slate' },
                { value: 'cyberpunk', label: 'Cyber' },
                { value: 'monochrome', label: 'Mono' },
                { value: 'gold', label: 'Gold' }
              ]}
              onChange={(t) => handleUpdate('theme', t as BentoTheme)}
            />

            <SliderField
              label="3D Perspective Tilt X"
              value={bentoConfig.cardTiltX}
              min={0}
              max={35}
              step={1}
              unit="°"
              onChange={(val) => handleUpdate('cardTiltX', val)}
            />

            <SettingRow label="Show Vector Mark Badge">
              <input
                type="checkbox"
                checked={bentoConfig.showMark !== false}
                onChange={(e) => handleUpdate('showMark', e.target.checked)}
                className="accent-[#ff4e2e] cursor-pointer"
              />
            </SettingRow>
          </div>
        </InspectorSection>

        {/* Section 3: Motion Timing */}
        <InspectorSection 
          id="bento-timing"
          title="Motion Timing & Stagger" 
          icon={<Activity size={12} className="text-slate-400" />}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <SliderField
              label="Animation Duration"
              value={duration}
              min={0.3}
              max={5.0}
              step={0.05}
              unit="s"
              onChange={onDurationChange}
            />

            <SliderField
              label="Vector Stagger Cascade"
              value={stagger}
              min={0}
              max={250}
              step={5}
              unit="ms"
              onChange={onStaggerChange}
            />
          </div>
        </InspectorSection>

        {/* Section 4: Bento Telemetry Badges */}
        <InspectorSection 
          id="bento-telemetry"
          title="Telemetry Grid Badges" 
          icon={<Cpu size={12} className="text-slate-400" />}
          defaultOpen={false}
        >
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Engine Tile</label>
              <input
                type="text"
                value={bentoConfig.engineSpec}
                onChange={(e) => handleUpdate('engineSpec', e.target.value)}
                className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-xs font-mono text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Dynamics Tile</label>
              <input
                type="text"
                value={bentoConfig.dynamicsSpec}
                onChange={(e) => handleUpdate('dynamicsSpec', e.target.value)}
                className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-xs font-mono text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Framerate</label>
                <input
                  type="text"
                  value={bentoConfig.fpsSpec}
                  onChange={(e) => handleUpdate('fpsSpec', e.target.value)}
                  className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-xs font-mono text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Resolution</label>
                <input
                  type="text"
                  value={bentoConfig.resSpec}
                  onChange={(e) => handleUpdate('resSpec', e.target.value)}
                  className="w-full bg-[#161a25] border border-[#232838] focus:border-[#ff4e2e] rounded px-2 py-1 text-xs font-mono text-white outline-none"
                />
              </div>
            </div>
          </div>
        </InspectorSection>
      </div>
    </aside>
  );
};
