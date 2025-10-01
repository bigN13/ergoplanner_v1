import React, { useCallback, useEffect, useState } from 'react';
import { useReactFlow, type XYPosition } from 'reactflow';
import { intelligentConnectionValidator } from '@/services/IntelligentConnectionValidator';
import type { ConnectionPoint, ConnectionValidationResult } from '@/types/connectionPoint';

export interface ConnectionMetadata {
  flowDirection: 'inlet' | 'outlet' | 'bidirectional';
  fluidProperties: {
    type: 'steam' | 'water' | 'air' | 'chemical' | 'oil' | 'gas' | 'electrical';
    temperature?: number; // Celsius
    pressure?: number; // Bar
    flowRate?: number; // L/min or m³/h
    viscosity?: number; // cP
    density?: number; // kg/m³
  };
  materialSpec: {
    pipeSize: string; // DN15, DN20, etc.
    pressureRating: string; // PN10, PN16, Class 150, etc.
    material: string; // Carbon Steel, Stainless Steel, PVC, etc.
    standard: string; // ASME, DIN, BS, ANSI
  };
  designConditions: {
    maxPressure: number;
    maxTemperature: number;
    designCode: string;
    safetyFactor: number;
  };
  tags: {
    lineNumber?: string; // P-001-HW-001
    serviceName?: string; // Hot Water Supply
    systemCode?: string; // HWS
    equipmentTag?: string; // P-001
  };
}

interface ConnectionTooltipProps {
  position: XYPosition;
  validation: ConnectionValidationResult;
  metadata?: ConnectionMetadata;
  visible: boolean;
}

interface FeedbackLineProps {
  start: XYPosition;
  end: XYPosition;
  validation: ConnectionValidationResult;
  isPreview?: boolean;
}

interface ConnectionFeedbackSystemProps {
  enabled?: boolean;
  showTooltips?: boolean;
  showMetadata?: boolean;
  onConnectionValidated?: (validation: ConnectionValidationResult) => void;
}

const ConnectionTooltip: React.FC<ConnectionTooltipProps> = ({
  position,
  validation,
  metadata,
  visible
}) => {
  if (!visible) return null;

  const getValidationColor = () => {
    if (validation.isValid) return '#10b981'; // green-500
    if (validation.warnings.length > 0) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getValidationIcon = () => {
    if (validation.isValid) return '✓';
    if (validation.warnings.length > 0) return '⚠';
    return '✗';
  };

  return (
    <div
      className="connection-tooltip"
      style={{
        position: 'absolute',
        left: position.x + 20,
        top: position.y - 10,
        backgroundColor: 'white',
        border: `2px solid ${getValidationColor()}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000,
        maxWidth: '320px',
        fontSize: '12px',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      {/* Validation Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: getValidationColor()
      }}>
        <span style={{ marginRight: '6px', fontSize: '14px' }}>
          {getValidationIcon()}
        </span>
        {validation.isValid ? 'Valid Connection' :
         validation.warnings.length > 0 ? 'Connection Warning' : 'Invalid Connection'}
      </div>

      {/* Validation Messages */}
      {validation.errors.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
            Errors:
          </div>
          {validation.errors.map((error, index) => (
            <div key={index} style={{ color: '#dc2626', fontSize: '11px', marginLeft: '8px' }}>
              • {error}
            </div>
          ))}
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
            Warnings:
          </div>
          {validation.warnings.map((warning, index) => (
            <div key={index} style={{ color: '#d97706', fontSize: '11px', marginLeft: '8px' }}>
              • {warning}
            </div>
          ))}
        </div>
      )}

      {/* Connection Metadata */}
      {metadata && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>
            Connection Details:
          </div>

          {/* Fluid Properties */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '11px', color: '#6b7280' }}>
              Fluid: {metadata.fluidProperties.type}
            </div>
            {metadata.fluidProperties.pressure && (
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                Pressure: {metadata.fluidProperties.pressure} bar
              </div>
            )}
            {metadata.fluidProperties.temperature && (
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                Temperature: {metadata.fluidProperties.temperature}°C
              </div>
            )}
          </div>

          {/* Material Spec */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '11px', color: '#6b7280' }}>
              Pipe: {metadata.materialSpec.pipeSize} {metadata.materialSpec.pressureRating}
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
              Material: {metadata.materialSpec.material}
            </div>
          </div>

          {/* Tags */}
          {metadata.tags.lineNumber && (
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontWeight: '600', fontSize: '11px', color: '#6b7280' }}>
                Line: {metadata.tags.lineNumber}
              </div>
              {metadata.tags.serviceName && (
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                  Service: {metadata.tags.serviceName}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FeedbackLine: React.FC<FeedbackLineProps> = ({
  start,
  end,
  validation,
  isPreview = false
}) => {
  const getLineStyle = () => {
    let strokeColor = '#6b7280'; // gray-500 default
    let strokeWidth = 2;
    let strokeDasharray = 'none';
    const opacity = isPreview ? 0.7 : 1;

    if (validation.isValid) {
      strokeColor = '#10b981'; // green-500
      strokeWidth = 3;
    } else if (validation.warnings.length > 0) {
      strokeColor = '#f59e0b'; // amber-500
      strokeWidth = 3;
      strokeDasharray = '8,4';
    } else {
      strokeColor = '#ef4444'; // red-500
      strokeWidth = 3;
      strokeDasharray = '4,4';
    }

    return { strokeColor, strokeWidth, strokeDasharray, opacity };
  };

  const style = getLineStyle();
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className="feedback-line"
      style={{
        position: 'absolute',
        left: start.x,
        top: start.y,
        width: length,
        height: style.strokeWidth,
        backgroundColor: style.strokeColor,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
        opacity: style.opacity,
        zIndex: 999,
        pointerEvents: 'none',
        ...(style.strokeDasharray !== 'none' && {
          backgroundImage: `repeating-linear-gradient(90deg, ${style.strokeColor} 0, ${style.strokeColor} 4px, transparent 4px, transparent 8px)`
        })
      }}
    />
  );
};

export default function ConnectionFeedbackSystem({
  enabled = true,
  showTooltips = true,
  showMetadata = true,
  onConnectionValidated
}: ConnectionFeedbackSystemProps): React.JSX.Element {
  const { screenToFlowPosition } = useReactFlow();
  const [currentValidation, setCurrentValidation] = useState<ConnectionValidationResult | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<XYPosition>({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [previewLine, setPreviewLine] = useState<{
    start: XYPosition;
    end: XYPosition;
    validation: ConnectionValidationResult;
  } | null>(null);

  // Listen for connection validation events
  useEffect(() => {
    if (!enabled) return;

    const handleConnectionValidation = (event: CustomEvent) => {
      const { sourcePoint, targetPoint, mousePosition } = event.detail;

      const validation = intelligentConnectionValidator.validateConnection(
        sourcePoint,
        targetPoint
      );

      setCurrentValidation(validation);

      if (mousePosition && showTooltips) {
        setTooltipPosition(mousePosition);
        setShowTooltip(true);
      }

      if (onConnectionValidated) {
        onConnectionValidated(validation);
      }
    };

    const handleConnectionPreview = (event: CustomEvent) => {
      const { start, end, sourcePoint, targetPoint } = event.detail;

      if (sourcePoint && targetPoint) {
        const validation = intelligentConnectionValidator.validateConnection(
          sourcePoint,
          targetPoint
        );

        setPreviewLine({ start, end, validation });
      } else {
        setPreviewLine(null);
      }
    };

    const handleConnectionEnd = () => {
      setShowTooltip(false);
      setPreviewLine(null);
      setCurrentValidation(null);
    };

    window.addEventListener('connectionValidation', handleConnectionValidation as EventListener);
    window.addEventListener('connectionPreview', handleConnectionPreview as EventListener);
    window.addEventListener('connectionEnd', handleConnectionEnd);

    return () => {
      window.removeEventListener('connectionValidation', handleConnectionValidation as EventListener);
      window.removeEventListener('connectionPreview', handleConnectionPreview as EventListener);
      window.removeEventListener('connectionEnd', handleConnectionEnd);
    };
  }, [enabled, showTooltips, onConnectionValidated]);

  const generateSampleMetadata = useCallback((validation: ConnectionValidationResult): ConnectionMetadata => {
    return {
      flowDirection: 'outlet',
      fluidProperties: {
        type: 'water',
        temperature: 80,
        pressure: 6,
        flowRate: 150,
        density: 1000
      },
      materialSpec: {
        pipeSize: 'DN50',
        pressureRating: 'PN10',
        material: 'Carbon Steel',
        standard: 'DIN'
      },
      designConditions: {
        maxPressure: 10,
        maxTemperature: 120,
        designCode: 'ASME B31.1',
        safetyFactor: 1.5
      },
      tags: {
        lineNumber: 'P-001-HW-001',
        serviceName: 'Hot Water Supply',
        systemCode: 'HWS',
        equipmentTag: 'P-001'
      }
    };
  }, []);

  if (!enabled) {
    return <></>;
  }

  return (
    <div className="connection-feedback-system">
      {/* Preview Line */}
      {previewLine && (
        <FeedbackLine
          start={previewLine.start}
          end={previewLine.end}
          validation={previewLine.validation}
          isPreview={true}
        />
      )}

      {/* Validation Tooltip */}
      {showTooltip && currentValidation && (
        <ConnectionTooltip
          position={tooltipPosition}
          validation={currentValidation}
          metadata={showMetadata ? generateSampleMetadata(currentValidation) : undefined}
          visible={showTooltip}
        />
      )}

      {/* Connection Point Indicators */}
      <style jsx>{`
        .connection-point-valid {
          border: 2px solid #10b981 !important;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5) !important;
        }

        .connection-point-warning {
          border: 2px solid #f59e0b !important;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5) !important;
        }

        .connection-point-invalid {
          border: 2px solid #ef4444 !important;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5) !important;
        }

        .connection-preview-line {
          transition: all 0.1s ease-in-out;
        }

        .feedback-line {
          transition: opacity 0.2s ease-in-out;
        }

        .connection-tooltip {
          animation: tooltipFadeIn 0.2s ease-out;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Helper function to emit validation events
export function emitConnectionValidation(
  sourcePoint: ConnectionPoint,
  targetPoint: ConnectionPoint,
  mousePosition: XYPosition
): void {
  const event = new CustomEvent('connectionValidation', {
    detail: { sourcePoint, targetPoint, mousePosition }
  });
  window.dispatchEvent(event);
}

export function emitConnectionPreview(
  start: XYPosition,
  end: XYPosition,
  sourcePoint?: ConnectionPoint,
  targetPoint?: ConnectionPoint
): void {
  const event = new CustomEvent('connectionPreview', {
    detail: { start, end, sourcePoint, targetPoint }
  });
  window.dispatchEvent(event);
}

export function emitConnectionEnd(): void {
  const event = new CustomEvent('connectionEnd');
  window.dispatchEvent(event);
}