import React from 'react';
import { X, Command, Keyboard, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcutCategories = [
    {
      title: 'General & Navigation',
      items: [
        { keys: ['Space'], action: 'Play / Pause Timeline' },
        { keys: ['Tab'], action: 'Cycle 2D Vector / 3D Extruded / Motion Graphics' },
        { keys: ['Cmd', 'Z'], action: 'Undo Previous Change' },
        { keys: ['Cmd', 'Shift', 'Z'], action: 'Redo Change' },
        { keys: ['Cmd', 'S'], action: 'Save Project Snapshot' },
        { keys: ['0'], action: 'Reset Camera / View Centered' },
        { keys: ['?'], action: 'Show / Hide Keyboard Shortcuts' }
      ]
    },
    {
      title: 'Timeline & Sequencer (All Workspaces)',
      items: [
        { keys: ['Space'], action: 'Play / Pause Sequence' },
        { keys: ['['], action: 'Set Work Area In-Point' },
        { keys: [']'], action: 'Set Work Area Out-Point' },
        { keys: ['K'], action: 'Insert Keyframe at Playhead' },
        { keys: ['Del'], action: 'Delete Selected Keyframe' },
        { keys: ['J'], action: 'Jump to Previous Keyframe / Phase' },
        { keys: ['Shift', 'J'], action: 'Jump to Next Keyframe / Phase' },
        { keys: ['←', '→'], action: 'Step Backward / Forward 1 Frame' },
        { keys: ['Home', 'End'], action: 'Jump to In-Point / Out-Point' },
        { keys: ['L'], action: 'Toggle Loop Mode' },
        { keys: ['M'], action: 'Toggle Audio Clicks' }
      ]
    },
    {
      title: '3D Extruded Studio (Blender-Style)',
      items: [
        { keys: ['1'], action: 'Front Ortho / Camera View' },
        { keys: ['2'], action: 'Isometric 45° Perspective' },
        { keys: ['3'], action: 'Top-Down Plan View' },
        { keys: ['4'], action: 'Side Profile View' },
        { keys: ['G'], action: 'Focus Location / Position Sliders' },
        { keys: ['Alt', 'R'], action: 'Reset Object Rotation to 0°' },
        { keys: ['Alt', 'G'], action: 'Reset Object Position to Origin' }
      ]
    },
    {
      title: 'Export & Production',
      items: [
        { keys: ['V'], action: 'Open 60 FPS Video Render Modal' },
        { keys: ['E'], action: 'Open Code / 3D GLTF Export Modal' },
        { keys: ['Esc'], action: 'Close Active Modal / Reset Focus' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-[740px] max-w-full bg-[#0d1017] border border-[#232736] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="h-12 px-4 border-b border-[#1f2430] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
            <Keyboard size={16} className="text-[#ff4e2e]" />
            <span>Studio Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {shortcutCategories.map(cat => (
            <div key={cat.title} className="flex flex-col gap-2 p-3 bg-[#11141e] border border-[#202534] rounded-lg">
              <span className="text-[10.5px] font-mono text-[#ff4e2e] uppercase font-bold tracking-wider">
                {cat.title}
              </span>
              <div className="flex flex-col gap-1.5">
                {cat.items.map(item => (
                  <div key={item.action} className="flex items-center justify-between py-1 text-xs font-mono">
                    <span className="text-slate-300 text-[11px] truncate">{item.action}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map(k => (
                        <kbd
                          key={k}
                          className="px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[10px] font-mono text-slate-200 shadow-sm min-w-[20px] text-center"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="h-11 px-5 bg-[#090b10] border-t border-[#1f2430] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Pro tip: Press [ ? ] anywhere to toggle this cheat-sheet</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded text-xs font-mono transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
