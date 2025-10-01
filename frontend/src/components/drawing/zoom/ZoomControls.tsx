/**
 * Zoom Controls Component
 *
 * Advanced zoom control UI with:
 * - Preset buttons for quick access
 * - Zoom in/out buttons
 * - Fit to view button
 * - Zoom level indicator with editable input
 * - Responsive design
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSmartZoom, DEFAULT_PRESETS, type ZoomPreset } from '../../../hooks/useSmartZoom';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ZoomControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showPresets?: boolean;
  showFitView?: boolean;
  showZoomLevel?: boolean;
  customPresets?: ZoomPreset[];
  orientation?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

// ============================================================================
// Zoom Controls Component
// ============================================================================

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  position = 'bottom-right',
  showPresets = true,
  showFitView = true,
  showZoomLevel = true,
  customPresets,
  orientation = 'horizontal',
  style,
}) => {
  const {
    currentZoom,
    zoomIn,
    zoomOut,
    zoomToPreset,
    fitAllNodes,
  } = useSmartZoom();

  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState(Math.round(currentZoom * 100).toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const presets = customPresets || DEFAULT_PRESETS;

  // ============================================================================
  // Zoom Level Input
  // ============================================================================

  useEffect(() => {
    if (!isEditingZoom) {
      setZoomInputValue(Math.round(currentZoom * 100).toString());
    }
  }, [currentZoom, isEditingZoom]);

  const handleZoomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setZoomInputValue(value);
  }, []);

  const handleZoomInputBlur = useCallback(() => {
    setIsEditingZoom(false);
    const value = parseInt(zoomInputValue, 10);
    if (!isNaN(value) && value > 0) {
      zoomToPreset(value / 100);
    } else {
      setZoomInputValue(Math.round(currentZoom * 100).toString());
    }
  }, [zoomInputValue, currentZoom, zoomToPreset]);

  const handleZoomInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        inputRef.current?.blur();
      } else if (e.key === 'Escape') {
        setZoomInputValue(Math.round(currentZoom * 100).toString());
        setIsEditingZoom(false);
      }
    },
    [currentZoom]
  );

  // ============================================================================
  // Position Styles
  // ============================================================================

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      display: 'flex',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      gap: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
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

  // ============================================================================
  // Button Styles
  // ============================================================================

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
  };

  const presetButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    minWidth: '48px',
  };

  const activePresetStyle: React.CSSProperties = {
    backgroundColor: '#2196F3',
    color: 'white',
    borderColor: '#2196F3',
  };

  const iconButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    fontSize: '18px',
    padding: '8px',
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div style={{ ...getPositionStyles(), ...style }}>
      {/* Zoom In Button */}
      <button
        onClick={zoomIn}
        style={iconButtonStyle}
        title="Zoom In (Ctrl +)"
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = 'white';
        }}
      >
        +
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={zoomOut}
        style={iconButtonStyle}
        title="Zoom Out (Ctrl -)"
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = 'white';
        }}
      >
        −
      </button>

      {/* Divider */}
      {(showPresets || showFitView) && (
        <div
          style={{
            width: orientation === 'horizontal' ? '1px' : '100%',
            height: orientation === 'horizontal' ? 'auto' : '1px',
            backgroundColor: '#ddd',
          }}
        />
      )}

      {/* Zoom Presets */}
      {showPresets &&
        presets.map((preset) => {
          const isActive = Math.abs(currentZoom - preset.value) < 0.05;

          return (
            <button
              key={preset.value}
              onClick={() => zoomToPreset(preset.value)}
              style={{
                ...presetButtonStyle,
                ...(isActive ? activePresetStyle : {}),
              }}
              title={`Zoom to ${preset.label}`}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                }
              }}
            >
              {preset.icon || preset.label}
            </button>
          );
        })}

      {/* Fit to View Button */}
      {showFitView && (
        <>
          {showPresets && (
            <div
              style={{
                width: orientation === 'horizontal' ? '1px' : '100%',
                height: orientation === 'horizontal' ? 'auto' : '1px',
                backgroundColor: '#ddd',
              }}
            />
          )}
          <button
            onClick={() => fitAllNodes()}
            style={iconButtonStyle}
            title="Fit to View (Ctrl 0)"
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'white';
            }}
          >
            ⊡
          </button>
        </>
      )}

      {/* Zoom Level Indicator */}
      {showZoomLevel && (
        <>
          <div
            style={{
              width: orientation === 'horizontal' ? '1px' : '100%',
              height: orientation === 'horizontal' ? 'auto' : '1px',
              backgroundColor: '#ddd',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              border: isEditingZoom ? '1px solid #2196F3' : '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'text',
              minWidth: '72px',
            }}
            onClick={() => {
              setIsEditingZoom(true);
              setTimeout(() => inputRef.current?.select(), 0);
            }}
          >
            {isEditingZoom ? (
              <input
                ref={inputRef}
                type="text"
                value={zoomInputValue}
                onChange={handleZoomInputChange}
                onBlur={handleZoomInputBlur}
                onKeyDown={handleZoomInputKeyDown}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '48px',
                  fontSize: '14px',
                  textAlign: 'right',
                  backgroundColor: 'transparent',
                }}
                autoFocus
              />
            ) : (
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  minWidth: '48px',
                  textAlign: 'right',
                }}
              >
                {Math.round(currentZoom * 100)}
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#666' }}>%</span>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// Zoom Preset Bar Component (Alternative Layout)
// ============================================================================

export interface ZoomPresetBarProps {
  position?: 'top' | 'bottom';
  presets?: ZoomPreset[];
  showLabels?: boolean;
  style?: React.CSSProperties;
}

export const ZoomPresetBar: React.FC<ZoomPresetBarProps> = ({
  position = 'bottom',
  presets = DEFAULT_PRESETS,
  showLabels = true,
  style,
}) => {
  const { currentZoom, zoomToPreset, fitAllNodes } = useSmartZoom();

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    [position]: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'flex',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '8px 16px',
    borderRadius: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    ...style,
  };

  const presetButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '16px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: '#666',
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div style={containerStyle}>
      {presets.map((preset) => {
        const isActive = Math.abs(currentZoom - preset.value) < 0.05;

        return (
          <button
            key={preset.value}
            onClick={() => zoomToPreset(preset.value)}
            style={{
              ...presetButtonStyle,
              backgroundColor: isActive ? '#2196F3' : 'transparent',
              color: isActive ? 'white' : '#666',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            {showLabels ? preset.label : preset.icon || preset.label}
          </button>
        );
      })}

      <div style={{ width: '1px', backgroundColor: '#ddd', margin: '4px 0' }} />

      <button
        onClick={() => fitAllNodes()}
        style={presetButtonStyle}
        title="Fit to View"
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
        }}
      >
        Fit
      </button>
    </div>
  );
};

export default ZoomControls;
