/**
 * Example Implementation: DrawingCanvas with Connection Validation
 *
 * This example shows how to integrate the ConnectionValidator
 * into a ReactFlow-based drawing canvas.
 *
 * Usage:
 * 1. Import useValidatedConnectionCallbacks and useValidatedEdgeStyles
 * 2. Pass the callbacks to ReactFlow component
 * 3. Use styled edges for visual feedback
 */

import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  useValidatedConnectionCallbacks,
  useValidatedEdgeStyles,
} from '../../hooks/useConnectionValidation';

// ============================================================================
// Example Drawing Canvas Component
// ============================================================================

export const DrawingCanvasWithValidation: React.FC = () => {
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'input',
      position: { x: 100, y: 100 },
      data: {
        label: 'Pump P-101',
        pipeSize: { nominal: 4, unit: 'inch', schedule: '40' },
        serviceType: { fluid: 'water', phase: 'liquid', pressure: 1000 },
        material: { material: 'carbon-steel', rating: 'ANSI 150' },
        flowDirection: 'outlet',
      },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 400, y: 100 },
      data: {
        label: 'Tank T-101',
        pipeSize: { nominal: 4, unit: 'inch', schedule: '40' },
        serviceType: { fluid: 'water', phase: 'liquid', pressure: 1000 },
        material: { material: 'carbon-steel', rating: 'ANSI 150' },
        flowDirection: 'inlet',
      },
    },
    {
      id: '3',
      type: 'default',
      position: { x: 100, y: 300 },
      data: {
        label: 'Pump P-102',
        pipeSize: { nominal: 2, unit: 'inch', schedule: '40' },
        serviceType: { fluid: 'steam', phase: 'gas', pressure: 2000 },
        material: { material: 'stainless-steel', rating: 'ANSI 300' },
        flowDirection: 'outlet',
      },
    },
    {
      id: '4',
      type: 'default',
      position: { x: 400, y: 300 },
      data: {
        label: 'Heat Exchanger HX-101',
        pipeSize: { nominal: 6, unit: 'inch', schedule: '40' },
        serviceType: { fluid: 'water', phase: 'liquid', pressure: 800 },
        material: { material: 'carbon-steel', rating: 'ANSI 150' },
        flowDirection: 'inlet',
      },
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Enable/disable validation
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [allowInvalidConnections, setAllowInvalidConnections] = useState(false);

  // Connection validation callbacks
  const { onConnect, isValidConnection } = useValidatedConnectionCallbacks({
    nodes,
    onConnect: useCallback(
      (connection: Connection) => {
        setEdges((eds) => addEdge(connection, eds));
      },
      [setEdges]
    ),
    allowInvalidConnections,
    showValidationTooltip: true,
  });

  // Styled edges with validation feedback
  const { styledEdges, validationSummary } = useValidatedEdgeStyles({
    nodes,
    edges,
    enableValidation: validationEnabled,
  });

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Validation Controls */}
      <div
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Connection Validation Example</h2>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={validationEnabled}
            onChange={(e) => setValidationEnabled(e.target.checked)}
          />
          Enable Validation
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={allowInvalidConnections}
            onChange={(e) => setAllowInvalidConnections(e.target.checked)}
          />
          Allow Invalid Connections
        </label>

        {validationEnabled && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
              Valid: {validationSummary.valid}
            </span>
            <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
              Warnings: {validationSummary.warning}
            </span>
            <span style={{ color: '#F44336', fontWeight: 'bold' }}>
              Errors: {validationSummary.error}
            </span>
          </div>
        )}
      </div>

      {/* ReactFlow Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Instructions */}
      <div
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderTop: '1px solid #ddd',
          fontSize: '0.9rem',
        }}
      >
        <strong>Instructions:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>
            <strong style={{ color: '#4CAF50' }}>Valid (Green):</strong> Connect P-101 to T-101
            (matching size, fluid, material)
          </li>
          <li>
            <strong style={{ color: '#FF9800' }}>Warning (Orange):</strong> Connect P-102 to P-101
            (different sizes, may need reducer)
          </li>
          <li>
            <strong style={{ color: '#F44336' }}>Error (Red):</strong> Connect P-102 to HX-101
            (incompatible: steam to water, size mismatch)
          </li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// Integration Guide
// ============================================================================

/**
 * INTEGRATION GUIDE
 *
 * To integrate connection validation into your existing DrawingCanvas:
 *
 * 1. Import the hooks:
 *    ```typescript
 *    import {
 *      useValidatedConnectionCallbacks,
 *      useValidatedEdgeStyles,
 *    } from '@/hooks/useConnectionValidation';
 *    ```
 *
 * 2. Set up validation callbacks:
 *    ```typescript
 *    const { onConnect, isValidConnection } = useValidatedConnectionCallbacks({
 *      nodes,
 *      onConnect: (connection) => {
 *        setEdges((eds) => addEdge(connection, eds));
 *      },
 *      allowInvalidConnections: false,  // Set to true to allow warnings
 *      showValidationTooltip: true,
 *    });
 *    ```
 *
 * 3. Apply validation styles to edges:
 *    ```typescript
 *    const { styledEdges, validationSummary } = useValidatedEdgeStyles({
 *      nodes,
 *      edges,
 *      enableValidation: true,
 *    });
 *    ```
 *
 * 4. Pass to ReactFlow:
 *    ```typescript
 *    <ReactFlow
 *      nodes={nodes}
 *      edges={styledEdges}  // Use styled edges
 *      onConnect={onConnect}
 *      isValidConnection={isValidConnection}
 *      // ... other props
 *    />
 *    ```
 *
 * 5. (Optional) Display validation summary:
 *    ```typescript
 *    <div>
 *      Valid: {validationSummary.valid}
 *      Warnings: {validationSummary.warning}
 *      Errors: {validationSummary.error}
 *    </div>
 *    ```
 *
 * CUSTOMIZATION
 *
 * To add custom validation rules:
 *
 * ```typescript
 * import { connectionValidator, IValidationRule } from '@/services/ConnectionValidator';
 *
 * class CustomRule implements IValidationRule {
 *   name = 'Custom Rule';
 *   description = 'My custom validation';
 *
 *   validate(data, props) {
 *     // Your validation logic
 *     return {
 *       isValid: true,
 *       severity: 'valid',
 *       messages: [],
 *       warnings: [],
 *       errors: [],
 *     };
 *   }
 * }
 *
 * // Register the rule
 * connectionValidator.registerRule(new CustomRule());
 * ```
 *
 * NODE DATA REQUIREMENTS
 *
 * For validation to work, nodes should have the following data properties:
 *
 * ```typescript
 * {
 *   pipeSize: {
 *     nominal: number,      // e.g., 4 for 4"
 *     unit: 'inch' | 'mm',
 *     schedule: string,     // e.g., '40', '80'
 *   },
 *   serviceType: {
 *     fluid: string,        // e.g., 'water', 'steam'
 *     phase: 'liquid' | 'gas' | 'two-phase',
 *     pressure: number,     // kPa
 *     temperature: number,  // °C
 *   },
 *   material: {
 *     material: string,     // e.g., 'carbon-steel'
 *     rating: string,       // e.g., 'ANSI 150'
 *   },
 *   flowDirection: 'inlet' | 'outlet' | 'bidirectional',
 * }
 * ```
 */
