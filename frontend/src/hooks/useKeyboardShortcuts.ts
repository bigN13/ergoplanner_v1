import { useEffect, useCallback } from 'react';

import { useDrawingStore } from '@/store/drawingStore';

export interface KeyboardShortcutConfig {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for drawing operations
 * Includes undo/redo and other common shortcuts
 */
export const useKeyboardShortcuts = (config: KeyboardShortcutConfig = {}): {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
} => {
  const { enabled = true, preventDefault = true } = config;

  const { undo, redo, canUndo, canRedo } = useDrawingStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const key = event.key.toLowerCase();

    // Don't handle shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    let handled = false;

    if (isCtrl && !isShift && key === 'z') {
      // Ctrl+Z: Undo
      if (canUndo()) {
        undo();
        handled = true;
      }
    } else if (
      (isCtrl && isShift && key === 'z') || // Ctrl+Shift+Z: Redo
      (isCtrl && key === 'y') // Ctrl+Y: Redo (alternative)
    ) {
      if (canRedo()) {
        redo();
        handled = true;
      }
    }

    if (handled && preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [enabled, preventDefault, undo, redo, canUndo, canRedo]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    canUndo: canUndo(),
    canRedo: canRedo(),
    undo,
    redo,
  };
};

/**
 * Hook specifically for undo/redo shortcuts
 * Simpler version focused only on history operations
 */
export const useUndoRedoShortcuts = (enabled: boolean = true): {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
} => {
  return useKeyboardShortcuts({ enabled, preventDefault: true });
};