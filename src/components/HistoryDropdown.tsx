import React, { useEffect, useRef } from 'react';
import { History, Undo2, Redo2, Trash2, CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import { ProjectStateSnapshot } from '../utils/projectState';

interface HistoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  undoStack: ProjectStateSnapshot[];
  redoStack: ProjectStateSnapshot[];
  onJumpToUndoStep: (index: number) => void;
  onJumpToRedoStep: (index: number) => void;
  onClearHistory: () => void;
}

export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  isOpen,
  onClose,
  undoStack,
  redoStack,
  onJumpToUndoStep,
  onJumpToRedoStep,
  onClearHistory
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalSteps = undoStack.length + redoStack.length;

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div 
      ref={panelRef}
      className="absolute top-11 left-1/2 -translate-x-1/2 w-80 max-h-[460px] bg-[#0c0f17] border border-[#232938] rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Header */}
      <div className="p-3 border-b border-[#1c2230] flex items-center justify-between bg-[#080a10]">
        <div className="flex items-center gap-2">
          <History size={14} className="text-[#ff4e2e]" />
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              History Stack
            </h3>
            <span className="text-[9.5px] font-mono text-slate-500">
              {undoStack.length} undoable • {redoStack.length} redoable
            </span>
          </div>
        </div>

        {totalSteps > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-[9.5px] font-mono text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition"
            title="Clear all recorded history"
          >
            <Trash2 size={11} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Stack List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {totalSteps === 0 ? (
          <div className="py-8 text-center text-slate-500 text-[11px] font-mono flex flex-col items-center gap-1.5">
            <Clock size={20} className="text-slate-600 mb-1" />
            <span>No actions recorded yet</span>
            <span className="text-[9.5px] text-slate-600">Changes will appear here</span>
          </div>
        ) : (
          <>
            {/* Redoable Steps (Future) */}
            {redoStack.map((step, idx) => {
              const reverseIdx = redoStack.length - 1 - idx;
              return (
                <button
                  key={`redo-${step.timestamp}-${idx}`}
                  onClick={() => {
                    onJumpToRedoStep(reverseIdx);
                    onClose();
                  }}
                  className="w-full text-left p-2 rounded-lg border border-dashed border-white/5 hover:border-white/15 bg-white/[0.01] hover:bg-white/[0.04] transition group flex items-center justify-between opacity-50 hover:opacity-100"
                >
                  <div className="flex items-center gap-2">
                    <Redo2 size={12} className="text-slate-500 group-hover:text-slate-300" />
                    <div>
                      <div className="text-[11px] font-mono text-slate-400 group-hover:text-slate-200">
                        {step.actionName || 'Redo Step'}
                      </div>
                      <div className="text-[9px] font-mono text-slate-600">
                        Future state • {formatTimeAgo(step.timestamp)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 group-hover:text-[#ff4e2e] opacity-0 group-hover:opacity-100 transition">
                    Jump ↵
                  </span>
                </button>
              );
            })}

            {/* Current Active Head */}
            <div className="p-2 rounded-lg bg-[#ff4e2e]/10 border border-[#ff4e2e]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff4e2e] animate-pulse" />
                <div>
                  <div className="text-[11px] font-mono font-bold text-white">
                    Active Current State
                  </div>
                  <div className="text-[9px] font-mono text-[#ff4e2e]/80">
                    Head of project timeline
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-[#ff4e2e]/20 text-[#ff4e2e] px-1.5 py-0.5 rounded font-bold">
                HEAD
              </span>
            </div>

            {/* Undoable Steps (Past, from newest to oldest) */}
            {[...undoStack].reverse().map((step, rIdx) => {
              const actualIdx = undoStack.length - 1 - rIdx;
              return (
                <button
                  key={`undo-${step.timestamp}-${actualIdx}`}
                  onClick={() => {
                    onJumpToUndoStep(actualIdx);
                    onClose();
                  }}
                  className="w-full text-left p-2 rounded-lg border border-transparent hover:border-[#1e2433] hover:bg-white/[0.03] transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Undo2 size={12} className="text-slate-500 group-hover:text-slate-300" />
                    <div>
                      <div className="text-[11px] font-mono text-slate-300 group-hover:text-white font-medium">
                        {step.actionName || `Change #${actualIdx + 1}`}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        Step {actualIdx + 1} • {formatTimeAgo(step.timestamp)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 group-hover:text-[#ff4e2e] opacity-0 group-hover:opacity-100 transition">
                    Restore ↵
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-[#1c2230] bg-[#090b10] flex items-center justify-between text-[9.5px] font-mono text-slate-500">
        <span>Click any step to time-travel</span>
        <span>Cmd+Z / Cmd+Shift+Z</span>
      </div>
    </div>
  );
};
