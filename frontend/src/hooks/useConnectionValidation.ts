/**
 * React Hook for Connection Validation
 *
 * Provides real-time connection validation with visual feedback
 * for ReactFlow connections.
 */

import { useCallback, useMemo } from 'react';
import type { Connection, Node, Edge } from 'reactflow';
import {
  connectionValidator,
  type ValidationResult,
  type ValidationSeverity,
} from '../services/ConnectionValidator';

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseConnectionValidationReturn {
  /**
   * Validate a connection attempt
   */
  validateConnection: (connection: Connection, nodes: Node[]) => ValidationResult;

  /**
   * Check if a connection is valid (can be created)
   */
  isConnectionValid: (connection: Connection, nodes: Node[]) => boolean;

  /**
   * Get validation message for display
   */
  getValidationMessage: (result: ValidationResult) => string;

  /**
   * Get color for validation severity
   */
  getSeverityColor: (severity: ValidationSeverity) => string;

  /**
   * Get edge style for validation result
   */
  getEdgeStyle: (result: ValidationResult) => React.CSSProperties;

  /**
   * Validate existing edges
   */
  validateEdges: (edges: Edge[], nodes: Node[]) => Map<string, ValidationResult>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useConnectionValidation(): UseConnectionValidationReturn {
  /**
   * Validate a connection attempt
   */
  const validateConnection = useCallback(
    (connection: Connection, nodes: Node[]): ValidationResult => {
      return connectionValidator.validateConnection(connection, nodes);
    },
    []
  );

  /**
   * Check if a connection is valid
   */
  const isConnectionValid = useCallback(
    (connection: Connection, nodes: Node[]): boolean => {
      const result = connectionValidator.validateConnection(connection, nodes);
      return result.isValid;
    },
    []
  );

  /**
   * Get validation message
   */
  const getValidationMessage = useCallback((result: ValidationResult): string => {
    return connectionValidator.formatValidationMessage(result);
  }, []);

  /**
   * Get color for severity
   */
  const getSeverityColor = useCallback((severity: ValidationSeverity): string => {
    return connectionValidator.getSeverityColor(severity);
  }, []);

  /**
   * Get edge style based on validation result
   */
  const getEdgeStyle = useCallback(
    (result: ValidationResult): React.CSSProperties => {
      const color = connectionValidator.getSeverityColor(result.severity);

      return {
        stroke: color,
        strokeWidth: result.severity === 'error' ? 3 : result.severity === 'warning' ? 2.5 : 2,
        strokeDasharray: result.severity === 'error' ? '5,5' : result.severity === 'warning' ? '8,4' : undefined,
      };
    },
    []
  );

  /**
   * Validate all existing edges
   */
  const validateEdges = useCallback(
    (edges: Edge[], nodes: Node[]): Map<string, ValidationResult> => {
      const validationMap = new Map<string, ValidationResult>();

      edges.forEach((edge) => {
        const connection: Connection = {
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        };

        const result = connectionValidator.validateConnection(connection, nodes);
        validationMap.set(edge.id, result);
      });

      return validationMap;
    },
    []
  );

  return useMemo(
    () => ({
      validateConnection,
      isConnectionValid,
      getValidationMessage,
      getSeverityColor,
      getEdgeStyle,
      validateEdges,
    }),
    [
      validateConnection,
      isConnectionValid,
      getValidationMessage,
      getSeverityColor,
      getEdgeStyle,
      validateEdges,
    ]
  );
}

// ============================================================================
// Helper Hook for Edge Styling
// ============================================================================

export interface UseValidatedEdgeStylesOptions {
  nodes: Node[];
  edges: Edge[];
  enableValidation?: boolean;
}

export interface UseValidatedEdgeStylesReturn {
  /**
   * Get styled edges with validation feedback
   */
  styledEdges: Edge[];

  /**
   * Validation results map
   */
  validationResults: Map<string, ValidationResult>;

  /**
   * Count of edges by severity
   */
  validationSummary: {
    valid: number;
    warning: number;
    error: number;
  };
}

/**
 * Hook to automatically apply validation styles to edges
 */
export function useValidatedEdgeStyles({
  nodes,
  edges,
  enableValidation = true,
}: UseValidatedEdgeStylesOptions): UseValidatedEdgeStylesReturn {
  const { validateEdges, getEdgeStyle } = useConnectionValidation();

  const validationResults = useMemo(() => {
    if (!enableValidation) {
      return new Map<string, ValidationResult>();
    }
    return validateEdges(edges, nodes);
  }, [edges, nodes, enableValidation, validateEdges]);

  const styledEdges = useMemo(() => {
    if (!enableValidation) {
      return edges;
    }

    return edges.map((edge) => {
      const result = validationResults.get(edge.id);
      if (!result) {
        return edge;
      }

      const style = getEdgeStyle(result);

      return {
        ...edge,
        style: {
          ...edge.style,
          ...style,
        },
        data: {
          ...edge.data,
          validationResult: result,
          validationMessage: connectionValidator.formatValidationMessage(result),
        },
      };
    });
  }, [edges, validationResults, enableValidation, getEdgeStyle]);

  const validationSummary = useMemo(() => {
    const summary = {
      valid: 0,
      warning: 0,
      error: 0,
    };

    validationResults.forEach((result) => {
      summary[result.severity]++;
    });

    return summary;
  }, [validationResults]);

  return useMemo(
    () => ({
      styledEdges,
      validationResults,
      validationSummary,
    }),
    [styledEdges, validationResults, validationSummary]
  );
}

// ============================================================================
// Helper Hook for Connection Callbacks
// ============================================================================

export interface UseValidatedConnectionCallbacksOptions {
  nodes: Node[];
  onConnect?: (connection: Connection) => void;
  allowInvalidConnections?: boolean;
  showValidationTooltip?: boolean;
}

export interface UseValidatedConnectionCallbacksReturn {
  /**
   * onConnect callback with validation
   */
  onConnect: (connection: Connection) => void;

  /**
   * isValidConnection callback for ReactFlow
   */
  isValidConnection: (connection: Connection) => boolean;
}

/**
 * Hook to create validated connection callbacks for ReactFlow
 */
export function useValidatedConnectionCallbacks({
  nodes,
  onConnect,
  allowInvalidConnections = false,
  showValidationTooltip = true,
}: UseValidatedConnectionCallbacksOptions): UseValidatedConnectionCallbacksReturn {
  const { validateConnection, isConnectionValid: checkIsValid } = useConnectionValidation();

  const handleConnect = useCallback(
    (connection: Connection) => {
      const result = validateConnection(connection, nodes);

      // Show validation message if enabled
      if (showValidationTooltip && (result.warnings.length > 0 || result.errors.length > 0)) {
        const message = connectionValidator.formatValidationMessage(result);
        console.warn('Connection Validation:', message);
        // Could show a toast notification here
      }

      // Only allow connection if valid or if invalid connections are allowed
      if (result.isValid || allowInvalidConnections) {
        onConnect?.(connection);
      } else {
        console.error('Connection blocked:', result.errors);
        // Could show an error toast here
      }
    },
    [nodes, onConnect, validateConnection, showValidationTooltip, allowInvalidConnections]
  );

  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (allowInvalidConnections) {
        return true;
      }
      return checkIsValid(connection, nodes);
    },
    [nodes, allowInvalidConnections, checkIsValid]
  );

  return useMemo(
    () => ({
      onConnect: handleConnect,
      isValidConnection,
    }),
    [handleConnect, isValidConnection]
  );
}
