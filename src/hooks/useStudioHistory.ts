// src/hooks/useStudioHistory.ts
// 60-Step Non-Destructive Visual Time-Travel Undo/Redo Engine with Continuous Tweak Debouncing
import { useState, useRef, useCallback } from 'react';
import { ProjectStateSnapshot } from '../utils/projectState';

interface UseStudioHistoryOptions {
  createStateSnapshot: (actionName?: string) => ProjectStateSnapshot;
  applySnapshot: (snapshot: ProjectStateSnapshot) => void;
  onToast?: (message: string) => void;
}

export function useStudioHistory({
  createStateSnapshot,
  applySnapshot,
  onToast
}: UseStudioHistoryOptions) {
  const undoStackRef = useRef<ProjectStateSnapshot[]>([]);
  const redoStackRef = useRef<ProjectStateSnapshot[]>([]);
  const [undoStackList, setUndoStackList] = useState<ProjectStateSnapshot[]>([]);
  const [redoStackList, setRedoStackList] = useState<ProjectStateSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isRestoringRef = useRef(false);

  const isTweakSessionRef = useRef(false);
  const tweakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Push a discrete undo snapshot
   */
  const pushUndoSnapshot = useCallback((actionName = 'Edit Parameter') => {
    if (isRestoringRef.current) return;
    const snap = createStateSnapshot(actionName);
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > 60) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setUndoStackList([...undoStackRef.current]);
    setRedoStackList([]);
    setCanUndo(true);
    setCanRedo(false);
  }, [createStateSnapshot]);

  /**
   * Intelligently records a single pre-edit snapshot before a continuous tweak session (slider scrub, color pick)
   * Prevents flooding the undo stack while guaranteeing 1-click Cmd+Z undo for any continuous property edit.
   */
  const recordContinuousTweak = useCallback((actionName = 'Edit Parameter') => {
    if (isRestoringRef.current) return;
    if (!isTweakSessionRef.current) {
      const snap = createStateSnapshot(actionName);
      undoStackRef.current.push(snap);
      if (undoStackRef.current.length > 60) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];
      setUndoStackList([...undoStackRef.current]);
      setRedoStackList([]);
      setCanUndo(true);
      setCanRedo(false);
      isTweakSessionRef.current = true;
    }
    if (tweakTimerRef.current) clearTimeout(tweakTimerRef.current);
    tweakTimerRef.current = setTimeout(() => {
      isTweakSessionRef.current = false;
    }, 600);
  }, [createStateSnapshot]);

  /**
   * Undo to previous state
   */
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const currentSnap = createStateSnapshot('Pre-Undo State');
    redoStackRef.current.push(currentSnap);

    const prevSnap = undoStackRef.current.pop()!;
    isRestoringRef.current = true;
    applySnapshot(prevSnap);
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 50);

    setUndoStackList([...undoStackRef.current]);
    setRedoStackList([...redoStackRef.current]);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
    if (onToast) onToast(`Undo: ${prevSnap.actionName || 'Change'}`);
  }, [applySnapshot, createStateSnapshot, onToast]);

  /**
   * Redo to future state
   */
  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const currentSnap = createStateSnapshot('Pre-Redo State');
    undoStackRef.current.push(currentSnap);

    const nextSnap = redoStackRef.current.pop()!;
    isRestoringRef.current = true;
    applySnapshot(nextSnap);
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 50);

    setUndoStackList([...undoStackRef.current]);
    setRedoStackList([...redoStackRef.current]);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
    if (onToast) onToast(`Redo: ${nextSnap.actionName || 'Change'}`);
  }, [applySnapshot, createStateSnapshot, onToast]);

  /**
   * Jump directly to a specific undo history index
   */
  const handleJumpToUndoStep = useCallback((index: number) => {
    if (index < 0 || index >= undoStackRef.current.length) return;
    const currentSnap = createStateSnapshot('Pre-Jump State');

    const discarded = undoStackRef.current.splice(index + 1);
    redoStackRef.current = [currentSnap, ...discarded.reverse(), ...redoStackRef.current];

    const targetSnap = undoStackRef.current[index];
    undoStackRef.current.splice(index, 1);

    isRestoringRef.current = true;
    applySnapshot(targetSnap);
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 50);

    setUndoStackList([...undoStackRef.current]);
    setRedoStackList([...redoStackRef.current]);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
    if (onToast) onToast(`Restored: ${targetSnap.actionName || `Step #${index + 1}`}`);
  }, [applySnapshot, createStateSnapshot, onToast]);

  /**
   * Jump directly to a specific redo history index
   */
  const handleJumpToRedoStep = useCallback((index: number) => {
    if (index < 0 || index >= redoStackRef.current.length) return;
    const currentSnap = createStateSnapshot('Pre-Jump State');

    const toRestore = redoStackRef.current.splice(0, index + 1);
    const targetSnap = toRestore.pop()!;

    undoStackRef.current.push(currentSnap, ...toRestore);
    isRestoringRef.current = true;
    applySnapshot(targetSnap);
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 50);

    setUndoStackList([...undoStackRef.current]);
    setRedoStackList([...redoStackRef.current]);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
    if (onToast) onToast(`Redone: ${targetSnap.actionName || 'Step'}`);
  }, [applySnapshot, createStateSnapshot, onToast]);

  /**
   * Clear all history undo/redo stacks
   */
  const handleClearHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    setUndoStackList([]);
    setRedoStackList([]);
    setCanUndo(false);
    setCanRedo(false);
    if (onToast) onToast('History stack cleared');
  }, [onToast]);

  return {
    canUndo,
    canRedo,
    undoStackList,
    redoStackList,
    pushUndoSnapshot,
    recordContinuousTweak,
    handleUndo,
    handleRedo,
    handleJumpToUndoStep,
    handleJumpToRedoStep,
    handleClearHistory,
    isRestoringRef
  };
}
