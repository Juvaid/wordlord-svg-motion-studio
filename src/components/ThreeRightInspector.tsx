import React, { useState } from 'react';
import { 
  Box, 
  Sparkles, 
  Sun, 
  Eye, 
  EyeOff, 
  Sliders, 
  RotateCcw, 
  Layers, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { 
  InspectorSection, 
  SliderField, 
  ColorSwatchField 
} from './inspector';
import { ThreeStudioConfig, ThreePart } from '../types/threeStudio';

interface ThreeRightInspectorProps {
  width: number;
  config: ThreeStudioConfig;
  parts: ThreePart[];
  onUpdateConfig: (partial: Partial<ThreeStudioConfig>) => void;
  onUpdatePart: (index: number, partial: Partial<ThreePart>) => void;
  onResetParts: () => void;
}

export const ThreeRightInspector: React.FC<ThreeRightInspectorProps> = ({
  width,
  config,
  parts,
  onUpdateConfig,
  onUpdatePart,
  onResetParts
}) => {
  const [expandedPartIdx, setExpandedPartIdx] = useState<number | null>(null);

  return (
    <aside 
      className="h-full bg-[#0d1017] border-l border-[#1f2430] flex flex-col z-30 select-none overflow-hidden transition-all duration-75"
      style={{ width }}
    >
      {/* Inspector Header */}
      <div className="h-10 border-b border-[#1f2430] flex items-center justify-between px-3 bg-[#090b10] flex-shrink-0">
        <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200">
          <Box size={13} className="text-[#ff4e2e]" />
          <span>3D Properties & PBR</span>
        </div>
        <button
          onClick={onResetParts}
          title="Reset Geometry & Parts"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Inspector Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
        
        {/* SECTION 1: EXTRUSION & BEVEL */}
        <InspectorSection id="3d-geometry" title="Extrusion & Bevel Geometry" icon={<Box size={12} className="text-[#ff4e2e]" />}>
          <SliderField
            label="Extrude Depth"
            value={config.depth}
            min={2}
            max={80}
            step={1}
            unit="px"
            onChange={(val) => onUpdateConfig({ depth: val })}
          />
          <SliderField
            label="Bevel Thickness"
            value={config.bevelThickness}
            min={0}
            max={12}
            step={0.2}
            unit="px"
            onChange={(val) => onUpdateConfig({ bevelThickness: val })}
          />
          <SliderField
            label="Bevel Radius / Size"
            value={config.bevelSize}
            min={0}
            max={10}
            step={0.2}
            unit="px"
            onChange={(val) => onUpdateConfig({ bevelSize: val })}
          />
          <SliderField
            label="Bevel Smooth Segments"
            value={config.bevelSegments}
            min={1}
            max={8}
            step={1}
            onChange={(val) => onUpdateConfig({ bevelSegments: val })}
          />
          <SliderField
            label="Viewport Mesh Scale"
            value={config.meshScale}
            min={0.5}
            max={2.0}
            step={0.05}
            onChange={(val) => onUpdateConfig({ meshScale: val })}
          />
        </InspectorSection>

        {/* SECTION 2: PBR SURFACE MATERIALS */}
        <InspectorSection id="3d-pbr" title="PBR Surface & Fluting" icon={<Sparkles size={12} className="text-[#ff4e2e]" />}>
          <div className="grid grid-cols-2 gap-2">
            <ColorSwatchField
              label="Face Color"
              value={config.faceColor}
              onChange={(color) => onUpdateConfig({ faceColor: color })}
            />
            <ColorSwatchField
              label="Side / Bevel Color"
              value={config.sideColor}
              onChange={(color) => onUpdateConfig({ sideColor: color })}
            />
          </div>

          <SliderField
            label="Metallic Reflection"
            value={config.metalness}
            min={0}
            max={1}
            step={0.02}
            onChange={(val) => onUpdateConfig({ metalness: val })}
          />
          <SliderField
            label="Roughness / Diffusion"
            value={config.roughness}
            min={0.02}
            max={1}
            step={0.02}
            onChange={(val) => onUpdateConfig({ roughness: val })}
          />
          <SliderField
            label="Specular Clearcoat"
            value={config.clearcoat}
            min={0}
            max={1}
            step={0.05}
            onChange={(val) => onUpdateConfig({ clearcoat: val })}
          />
          <SliderField
            label="Glass Transmission"
            value={config.transmission}
            min={0}
            max={1}
            step={0.05}
            onChange={(val) => onUpdateConfig({ transmission: val })}
          />

          {/* Fluting Toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10.5px] font-mono text-slate-300">Fluted Ribbed Texture</span>
            <button
              onClick={() => onUpdateConfig({ flutingEnabled: !config.flutingEnabled })}
              className={`px-2 py-0.5 rounded text-[9.5px] font-mono border transition-colors ${
                config.flutingEnabled
                  ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-white font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {config.flutingEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          {config.flutingEnabled && (
            <SliderField
              label="Flute Groove Depth"
              value={config.fluteScale}
              min={0.1}
              max={1.5}
              step={0.05}
              onChange={(val) => onUpdateConfig({ fluteScale: val })}
            />
          )}
        </InspectorSection>

        {/* SECTION 3: STUDIO LIGHTING */}
        <InspectorSection id="3d-lighting" title="Studio Lighting Rig" icon={<Sun size={12} className="text-[#ff4e2e]" />}>
          <div className="grid grid-cols-2 gap-2">
            <ColorSwatchField
              label="Key Light"
              value={config.keyColor}
              onChange={(color) => onUpdateConfig({ keyColor: color })}
            />
            <ColorSwatchField
              label="Rim Light"
              value={config.rimColor}
              onChange={(color) => onUpdateConfig({ rimColor: color })}
            />
          </div>

          <SliderField
            label="Key Light Intensity"
            value={config.keyIntensity}
            min={0}
            max={6}
            step={0.1}
            onChange={(val) => onUpdateConfig({ keyIntensity: val })}
          />

          <SliderField
            label="Rim Light Intensity"
            value={config.rimIntensity}
            min={0}
            max={8}
            step={0.1}
            onChange={(val) => onUpdateConfig({ rimIntensity: val })}
          />

          <SliderField
            label="Fill Light Intensity"
            value={config.fillIntensity}
            min={0}
            max={4}
            step={0.1}
            onChange={(val) => onUpdateConfig({ fillIntensity: val })}
          />
          <SliderField
            label="Ambient Light Level"
            value={config.ambientIntensity}
            min={0}
            max={1.5}
            step={0.05}
            onChange={(val) => onUpdateConfig({ ambientIntensity: val })}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10.5px] font-mono text-slate-300">Studio Floor & Grid</span>
            <button
              onClick={() => onUpdateConfig({ showFloor: !config.showFloor })}
              className={`px-2 py-0.5 rounded text-[9.5px] font-mono border transition-colors ${
                config.showFloor
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {config.showFloor ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </InspectorSection>

        {/* SECTION 4: UNREAL BLOOM OPTICS */}
        <InspectorSection id="3d-bloom" title="Unreal Bloom Post-Processing" icon={<Sparkles size={12} className="text-[#ff4e2e]" />}>
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-mono text-slate-300">Glow Bloom Engine</span>
            <button
              onClick={() => onUpdateConfig({ bloomEnabled: !config.bloomEnabled })}
              className={`px-2 py-0.5 rounded text-[9.5px] font-mono border transition-colors ${
                config.bloomEnabled
                  ? 'bg-[#ff4e2e]/20 border-[#ff4e2e] text-white font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {config.bloomEnabled ? 'Active' : 'Bypassed'}
            </button>
          </div>

          {config.bloomEnabled && (
            <>
              <SliderField
                label="Bloom Strength / Intensity"
                value={config.bloomStrength}
                min={0.1}
                max={3.0}
                step={0.05}
                onChange={(val) => onUpdateConfig({ bloomStrength: val })}
              />
              <SliderField
                label="Bloom Diffusion Radius"
                value={config.bloomRadius}
                min={0.1}
                max={1.5}
                step={0.05}
                onChange={(val) => onUpdateConfig({ bloomRadius: val })}
              />
              <SliderField
                label="Luminosity Threshold"
                value={config.bloomThreshold}
                min={0.1}
                max={1.0}
                step={0.05}
                onChange={(val) => onUpdateConfig({ bloomThreshold: val })}
              />
            </>
          )}
        </InspectorSection>

        {/* SECTION 5: MULTI-PART / LETTERS INSPECTOR */}
        <InspectorSection id="3d-parts" title={`Parts Breakdown (${parts.length} Glyphs)`} icon={<Layers size={12} className="text-[#ff4e2e]" />}>
          <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {parts.map((part, pIdx) => {
              const isExpanded = expandedPartIdx === pIdx;
              return (
                <div 
                  key={part.id} 
                  className={`flex flex-col rounded-lg border transition-all ${
                    isExpanded 
                      ? 'bg-[#141824] border-[#2b3346]' 
                      : 'bg-[#10131d] border-[#1e2434] hover:border-slate-500'
                  }`}
                >
                  {/* Card Header Row */}
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => onUpdatePart(pIdx, { visible: !part.visible })}
                        title={part.visible ? 'Hide Part' : 'Show Part'}
                        className={`p-1 rounded transition-colors ${
                          part.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600'
                        }`}
                      >
                        {part.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>

                      {/* Part Color Swatch */}
                      <div 
                        className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: part.faceColor }}
                      />

                      <span className={`text-[10.5px] font-mono font-medium truncate ${part.visible ? 'text-slate-200' : 'text-slate-500'}`}>
                        {part.name}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedPartIdx(isExpanded ? null : pIdx)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Expanded Sub-Controls for this Part */}
                  {isExpanded && (
                    <div className="p-2 pt-0 border-t border-white/5 flex flex-col gap-2 mt-1">
                      <SliderField
                        label="Depth Offset"
                        value={part.depthOffset}
                        min={-20}
                        max={40}
                        step={1}
                        unit="px"
                        onChange={(val) => onUpdatePart(pIdx, { depthOffset: val })}
                      />
                      <SliderField
                        label="Phase Stagger Delay"
                        value={part.phaseDelay}
                        min={0}
                        max={1.5}
                        step={0.02}
                        unit="s"
                        onChange={(val) => onUpdatePart(pIdx, { phaseDelay: val })}
                      />
                      <ColorSwatchField
                        label="Custom Part Color"
                        value={part.faceColor}
                        onChange={(color) => onUpdatePart(pIdx, { faceColor: color })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </InspectorSection>

      </div>
    </aside>
  );
};
