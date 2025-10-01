/**
 * Zoom Keyboard Shortcuts Hook
 *
 * Comprehensive keyboard shortcut handling for zoom operations:
 * - Ctrl/Cmd + Plus: Zoom in
 * - Ctrl/Cmd + Minus: Zoom out
 * - Ctrl/Cmd + 0: Reset zoom
 * - Ctrl/Cmd + 1-9: Zoom to preset levels
 * - Z: Activate zoom rectangle tool
 * - F: Fit to view
 */

import { useEffect, useCallback } from 'react';
import { useSmartZoom } from './useSmartZoom';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ZoomKeyboardShortcutsConfig {
  enableZoomIn?: boolean;
  enableZoomOut?: boolean;
  enableResetZoom?: boolean;
  enablePresetShortcuts?: boolean;
  enableFitView?: boolean;
  enableRectangleTool?: boolean;
  zoomInKeys?: string[];
  zoomOutKeys?: string[];
  resetKeys?: string[];
  fitViewKeys?: string[];
  rectangleToolKey?: string;
  presetKeys?: Record<number, number>; // key number -> preset value
  preventDefault?: boolean;
  disableWhenInputFocused?: boolean;
}

export interface ZoomKeyboardShortcutsReturn {
  enableShortcuts: () => void;
  disableShortcuts: () => void;
  isEnabled: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<ZoomKeyboardShortcutsConfig> = {
  enableZoomIn: true,
  enableZoomOut: true,
  enableResetZoom: true,
  enablePresetShortcuts: true,
  enableFitView: true,
  enableRectangleTool: true,
  zoomInKeys: ['=', '+'],
  zoomOutKeys: ['-', '_'],
  resetKeys: ['0'],
  fitViewKeys: ['f'],
  rectangleToolKey: 'z',
  presetKeys: {
    1: 0.25,
    2: 0.5,
    3: 0.75,
    4: 1.0,
    5: 1.5,
    6: 2.0,
    7: 3.0,
    8: 4.0,
  },
  preventDefault: true,
  disableWhenInputFocused: true,
};

// ============================================================================
// Zoom Keyboard Shortcuts Hook
// ============================================================================

export function useZoomKeyboardShortcuts(
  config: ZoomKeyboardShortcutsConfig = {},
  onRectangleToolToggle?: (enabled: boolean) => void
): ZoomKeyboardShortcutsReturn {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToPreset,
    fitAllNodes,
  } = useSmartZoom();

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const isInputFocused = useCallback((): boolean => {
    if (!fullConfig.disableWhenInputFocused) return false;

    const { activeElement } = document;
    const tagName = activeElement?.tagName.toLowerCase();

    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      (activeElement as HTMLElement)?.isContentEditable === true
    );
  }, [fullConfig.disableWhenInputFocused]);

  const isModifierPressed = useCallback((e: KeyboardEvent): boolean => {
    return e.ctrlKey || e.metaKey; // Ctrl on Windows/Linux, Cmd on Mac
  }, []);

  // ============================================================================
  // Keyboard Event Handler
  // ============================================================================

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if input is focused
      if (isInputFocused()) return;

      const key = e.key.toLowerCase();
      const hasModifier = isModifierPressed(e);

      // Zoom In (Ctrl/Cmd + Plus/Equal)
      if (
        fullConfig.enableZoomIn &&
        hasModifier &&
        fullConfig.zoomInKeys.includes(key)
      ) {
        if (fullConfig.preventDefault) e.preventDefault();
        zoomIn();
        return;
      }

      // Zoom Out (Ctrl/Cmd + Minus)
      if (
        fullConfig.enableZoomOut &&
        hasModifier &&
        fullConfig.zoomOutKeys.includes(key)
      ) {
        if (fullConfig.preventDefault) e.preventDefault();
        zoomOut();
        return;
      }

      // Reset Zoom (Ctrl/Cmd + 0)
      if (
        fullConfig.enableResetZoom &&
        hasModifier &&
        fullConfig.resetKeys.includes(key)
      ) {
        if (fullConfig.preventDefault) e.preventDefault();
        resetZoom();
        return;
      }

      // Preset Shortcuts (Ctrl/Cmd + 1-9)
      if (fullConfig.enablePresetShortcuts && hasModifier) {
        const keyNumber = parseInt(key, 10);
        if (!isNaN(keyNumber) && fullConfig.presetKeys[keyNumber] !== undefined) {
          if (fullConfig.preventDefault) e.preventDefault();
          zoomToPreset(fullConfig.presetKeys[keyNumber]);
          return;
        }
      }

      // Fit to View (F)
      if (
        fullConfig.enableFitView &&
        !hasModifier &&
        fullConfig.fitViewKeys.includes(key)
      ) {
        if (fullConfig.preventDefault) e.preventDefault();
        fitAllNodes();
        return;
      }

      // Rectangle Tool (Z)
      if (
        fullConfig.enableRectangleTool &&
        !hasModifier &&
        key === fullConfig.rectangleToolKey
      ) {
        if (fullConfig.preventDefault) e.preventDefault();
        onRectangleToolToggle?.(true);
        return;
      }
    },
    [
      fullConfig,
      isInputFocused,
      isModifierPressed,
      zoomIn,
      zoomOut,
      resetZoom,
      zoomToPreset,
      fitAllNodes,
      onRectangleToolToggle,
    ]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Deactivate rectangle tool on key release
      if (
        fullConfig.enableRectangleTool &&
        key === fullConfig.rectangleToolKey
      ) {
        onRectangleToolToggle?.(false);
      }
    },
    [fullConfig, onRectangleToolToggle]
  );

  // ============================================================================
  // Effect: Attach/Detach Event Listeners
  // ============================================================================

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    enableShortcuts: () => {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    },
    disableShortcuts: () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    },
    isEnabled: true,
  };
}

// ============================================================================
// Shortcut Help Component
// ============================================================================

export interface ZoomShortcutHelpProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible?: boolean;
  onClose?: () => void;
}

export const ZoomShortcutHelp: React.FC<ZoomShortcutHelpProps> = ({
  position = 'top-right',
  visible = true,
  onClose,
}) => {
  if (!visible) return null;

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'monospace',
      lineHeight: '1.8',
      minWidth: '280px',
    };

    const margin = 16;

    switch (position) {
      case 'top-left':
        return { ...base, top: margin, left: margin };
      case 'top-right':
        return { ...base, top: margin, right: margin };
      case 'bottom-left':
        return { ...base, bottom: margin, left: margin };
      case 'bottom-right':
        return { ...base, bottom: margin, right: margin };
      default:
        return base;
    }
  };

  const shortcuts = [
    { key: 'Ctrl/⌘ +', description: 'Zoom in' },
    { key: 'Ctrl/⌘ -', description: 'Zoom out' },
    { key: 'Ctrl/⌘ 0', description: 'Reset zoom' },
    { key: 'Ctrl/⌘ 1-8', description: 'Zoom to preset' },
    { key: 'F', description: 'Fit to view' },
    { key: 'Z', description: 'Rectangle zoom' },
  ];

  return (
    <div style={getPositionStyles()}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Zoom Shortcuts</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              opacity: 0.7,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.opacity = '0.7';
            }}
          >
            ×
          </button>
        )}
      </div>

      {shortcuts.map((shortcut, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 500,
            }}
          >
            {shortcut.key}
          </span>
          <span style={{ opacity: 0.8 }}>{shortcut.description}</span>
        </div>
      ))}

      <div
        style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '11px',
          opacity: 0.6,
          textAlign: 'center',
        }}
      >
        Press ? to toggle help
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default useZoomKeyboardShortcuts;
