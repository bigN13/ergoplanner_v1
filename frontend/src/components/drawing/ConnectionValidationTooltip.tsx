/**
 * Connection Validation Tooltip Component
 *
 * Displays validation messages when hovering over connections
 */

import React from 'react';
import type { Edge } from 'reactflow';
import type { ValidationResult } from '../../services/ConnectionValidator';

// ============================================================================
// Component Props
// ============================================================================

export interface ConnectionValidationTooltipProps {
  edge: Edge;
  validationResult?: ValidationResult;
  position: { x: number; y: number };
}

// ============================================================================
// Tooltip Component
// ============================================================================

export const ConnectionValidationTooltip: React.FC<ConnectionValidationTooltipProps> = ({
  edge,
  validationResult,
  position,
}) => {
  if (!validationResult) {
    return null;
  }

  const getSeverityIcon = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'valid':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
    }
  };

  const getSeverityColor = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'valid':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
    }
  };

  const hasMessages =
    validationResult.messages.length > 0 ||
    validationResult.warnings.length > 0 ||
    validationResult.errors.length > 0;

  if (!hasMessages) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x + 10,
        top: position.y + 10,
        background: 'white',
        border: `2px solid ${getSeverityColor(validationResult.severity)}`,
        borderRadius: '4px',
        padding: '0.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxWidth: '400px',
        fontSize: '0.85rem',
        pointerEvents: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #eee',
          fontWeight: 'bold',
          color: getSeverityColor(validationResult.severity),
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>{getSeverityIcon(validationResult.severity)}</span>
        <span>Connection Validation</span>
      </div>

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <div
            style={{
              fontWeight: 'bold',
              color: '#F44336',
              marginBottom: '0.25rem',
              fontSize: '0.8rem',
            }}
          >
            ERRORS
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#F44336' }}>
            {validationResult.errors.map((error, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <div
            style={{
              fontWeight: 'bold',
              color: '#FF9800',
              marginBottom: '0.25rem',
              fontSize: '0.8rem',
            }}
          >
            WARNINGS
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#FF9800' }}>
            {validationResult.warnings.map((warning, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Messages */}
      {validationResult.messages.length > 0 && validationResult.severity === 'valid' && (
        <div>
          <div
            style={{
              fontWeight: 'bold',
              color: '#4CAF50',
              marginBottom: '0.25rem',
              fontSize: '0.8rem',
            }}
          >
            VALID
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#4CAF50' }}>
            {validationResult.messages.map((message, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Validation Summary Badge Component
// ============================================================================

export interface ValidationSummaryBadgeProps {
  valid: number;
  warning: number;
  error: number;
}

export const ValidationSummaryBadge: React.FC<ValidationSummaryBadgeProps> = ({
  valid,
  warning,
  error,
}) => {
  const total = valid + warning + error;

  if (total === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '20px',
        fontSize: '0.85rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <span style={{ fontWeight: 'bold', color: '#666' }}>Connections:</span>

      {valid > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: '#4CAF50',
            fontWeight: 'bold',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>✓</span>
          {valid}
        </span>
      )}

      {warning > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: '#FF9800',
            fontWeight: 'bold',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>⚠</span>
          {warning}
        </span>
      )}

      {error > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: '#F44336',
            fontWeight: 'bold',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>✗</span>
          {error}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// Validation Legend Component
// ============================================================================

export const ValidationLegend: React.FC = () => {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0.75rem',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.8rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#666' }}>
        Connection Validation
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            width: '30px',
            height: '3px',
            background: '#4CAF50',
            borderRadius: '2px',
          }}
        />
        <span style={{ color: '#4CAF50' }}>Valid - All checks passed</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            width: '30px',
            height: '3px',
            background: '#FF9800',
            borderRadius: '2px',
          }}
        />
        <span style={{ color: '#FF9800' }}>Warning - Review recommended</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            width: '30px',
            height: '3px',
            background: '#F44336',
            borderRadius: '2px',
            border: '1px dashed #F44336',
          }}
        />
        <span style={{ color: '#F44336' }}>Error - Invalid connection</span>
      </div>
    </div>
  );
};

// ============================================================================
// Edge Label with Validation Status
// ============================================================================

export interface ValidationEdgeLabelProps {
  validationResult?: ValidationResult;
  label?: string;
}

export const ValidationEdgeLabel: React.FC<ValidationEdgeLabelProps> = ({
  validationResult,
  label,
}) => {
  if (!validationResult) {
    return label ? <div>{label}</div> : null;
  }

  const getSeverityIcon = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'valid':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
    }
  };

  const getSeverityColor = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'valid':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        background: 'white',
        border: `1px solid ${getSeverityColor(validationResult.severity)}`,
        borderRadius: '3px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: getSeverityColor(validationResult.severity),
      }}
    >
      <span>{getSeverityIcon(validationResult.severity)}</span>
      {label && <span>{label}</span>}
    </div>
  );
};
