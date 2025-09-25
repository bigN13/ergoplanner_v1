/**
 * Custom Symbol Creator
 * Allows users to create parametric custom symbols using a visual editor
 */

import React, { useState, useRef, useCallback } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';

export interface SymbolParameter {
  name: string;
  type: 'number' | 'string' | 'color' | 'boolean' | 'select';
  defaultValue: string | number | boolean;
  min?: number;
  max?: number;
  options?: string[];
  unit?: string;
  description?: string;
}

export interface CustomSymbolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  parameters: SymbolParameter[];
  svgTemplate: string; // SVG string with parameter placeholders
  connectionPoints: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
  defaultSize: {
    width: number;
    height: number;
  };
  tags: string[];
  author?: string;
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomSymbolCreatorProps {
  onSave: (symbol: CustomSymbolDefinition) => void;
  onCancel: () => void;
  initialSymbol?: CustomSymbolDefinition;
}

export const CustomSymbolCreator: React.FC<CustomSymbolCreatorProps> = ({
  onSave,
  onCancel,
  initialSymbol
}) => {
  const [symbolDef, setSymbolDef] = useState<CustomSymbolDefinition>(
    initialSymbol || {
      id: '',
      name: '',
      category: 'Custom',
      description: '',
      parameters: [],
      svgTemplate: '',
      connectionPoints: {
        top: true,
        bottom: true,
        left: true,
        right: true
      },
      defaultSize: {
        width: 60,
        height: 60
      },
      tags: [],
      author: '',
      version: '1.0.0'
    }
  );

  const [currentParameter, setCurrentParameter] = useState<SymbolParameter>({
    name: '',
    type: 'number',
    defaultValue: 0
  });

  const [svgCode, setSvgCode] = useState('');
  const [previewParams, setPreviewParams] = useState<Record<string, string | number | boolean>>({});
  const svgPreviewRef = useRef<HTMLDivElement>(null);

  // Add a parameter
  const addParameter = (): void => {
    if (currentParameter.name) {
      setSymbolDef({
        ...symbolDef,
        parameters: [...symbolDef.parameters, currentParameter]
      });
      setCurrentParameter({
        name: '',
        type: 'number',
        defaultValue: 0
      });
    }
  };

  // Remove a parameter
  const removeParameter = (index: number): void => {
    const newParams = symbolDef.parameters.filter((_, i) => i !== index);
    setSymbolDef({
      ...symbolDef,
      parameters: newParams
    });
  };

  // Update parameter (unused but kept for future use)
  // const _updateParameter = (index: number, param: SymbolParameter): void => {
  //   const newParams = [...symbolDef.parameters];
  //   newParams[index] = param;
  //   setSymbolDef({
  //     ...symbolDef,
  //     parameters: newParams
  //   });
  // };

  // Generate SVG preview
  const generatePreview = useCallback(() => {
    let svg = symbolDef.svgTemplate || svgCode;

    // Replace parameter placeholders with actual values
    symbolDef.parameters.forEach(param => {
      const value = previewParams[param.name] ?? param.defaultValue;
      const placeholder = new RegExp(`{{${param.name}}}`, 'g');
      svg = svg.replace(placeholder, value);
    });

    // Add default values for common properties
    svg = svg
      .replace(/{{width}}/g, symbolDef.defaultSize.width.toString())
      .replace(/{{height}}/g, symbolDef.defaultSize.height.toString())
      .replace(/{{color}}/g, '#000000')
      .replace(/{{fillColor}}/g, '#ffffff')
      .replace(/{{strokeWidth}}/g, '1.5');

    return svg;
  }, [symbolDef, svgCode, previewParams]);

  // Handle save
  const handleSave = (): void => {
    const finalSymbol: CustomSymbolDefinition = {
      ...symbolDef,
      id: symbolDef.id || `custom-${Date.now()}`,
      svgTemplate: svgCode,
      createdAt: symbolDef.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(finalSymbol);
  };

  return (
    <div className="custom-symbol-creator">
      <div className="creator-header">
        <h2>Custom Symbol Creator</h2>
        <div className="header-actions">
          <button onClick={onCancel} className="btn-cancel">Cancel</button>
          <button onClick={handleSave} className="btn-save">Save Symbol</button>
        </div>
      </div>

      <div className="creator-content">
        {/* Basic Information */}
        <div className="section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Symbol Name</label>
            <input
              type="text"
              value={symbolDef.name}
              onChange={(e) => setSymbolDef({ ...symbolDef, name: e.target.value })}
              placeholder="e.g., Custom Pump"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={symbolDef.category}
              onChange={(e) => setSymbolDef({ ...symbolDef, category: e.target.value })}
              placeholder="e.g., Custom Equipment"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={symbolDef.description}
              onChange={(e) => setSymbolDef({ ...symbolDef, description: e.target.value })}
              placeholder="Describe the symbol's purpose..."
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={symbolDef.tags.join(', ')}
              onChange={(e) => setSymbolDef({
                ...symbolDef,
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
              })}
              placeholder="e.g., custom, pump, special"
            />
          </div>
        </div>

        {/* Parameters */}
        <div className="section">
          <h3>Parameters</h3>
          <div className="parameter-list">
            {symbolDef.parameters.map((param, index) => (
              <div key={index} className="parameter-item">
                <span className="param-name">{param.name}</span>
                <span className="param-type">{param.type}</span>
                <span className="param-default">{param.defaultValue}</span>
                <button onClick={() => removeParameter(index)} className="btn-remove">×</button>
              </div>
            ))}
          </div>

          <div className="add-parameter">
            <input
              type="text"
              value={currentParameter.name}
              onChange={(e) => setCurrentParameter({ ...currentParameter, name: e.target.value })}
              placeholder="Parameter name"
            />
            <select
              value={currentParameter.type}
              onChange={(e) => setCurrentParameter({
                ...currentParameter,
                type: e.target.value as SymbolParameter['type']
              })}
            >
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="color">Color</option>
              <option value="boolean">Boolean</option>
              <option value="select">Select</option>
            </select>
            <input
              type="text"
              value={currentParameter.defaultValue}
              onChange={(e) => setCurrentParameter({ ...currentParameter, defaultValue: e.target.value })}
              placeholder="Default value"
            />
            <button onClick={addParameter} className="btn-add">Add Parameter</button>
          </div>
        </div>

        {/* SVG Template */}
        <div className="section">
          <h3>SVG Template</h3>
          <div className="svg-editor">
            <textarea
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              placeholder="Enter SVG code with parameter placeholders (e.g., {{width}}, {{height}}, {{color}})"
              rows={10}
            />
            <div className="template-help">
              <p>Available placeholders:</p>
              <ul>
                <li><code>{'{{width}}'}</code> - Symbol width</li>
                <li><code>{'{{height}}'}</code> - Symbol height</li>
                <li><code>{'{{color}}'}</code> - Stroke color</li>
                <li><code>{'{{fillColor}}'}</code> - Fill color</li>
                <li><code>{'{{strokeWidth}}'}</code> - Stroke width</li>
                {symbolDef.parameters.map((param, index) => (
                  <li key={index}><code>{`{{${param.name}}}`}</code> - {param.description || param.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Connection Points */}
        <div className="section">
          <h3>Connection Points</h3>
          <div className="connection-points">
            <label>
              <input
                type="checkbox"
                checked={symbolDef.connectionPoints.top}
                onChange={(e) => setSymbolDef({
                  ...symbolDef,
                  connectionPoints: { ...symbolDef.connectionPoints, top: e.target.checked }
                })}
              />
              Top
            </label>
            <label>
              <input
                type="checkbox"
                checked={symbolDef.connectionPoints.bottom}
                onChange={(e) => setSymbolDef({
                  ...symbolDef,
                  connectionPoints: { ...symbolDef.connectionPoints, bottom: e.target.checked }
                })}
              />
              Bottom
            </label>
            <label>
              <input
                type="checkbox"
                checked={symbolDef.connectionPoints.left}
                onChange={(e) => setSymbolDef({
                  ...symbolDef,
                  connectionPoints: { ...symbolDef.connectionPoints, left: e.target.checked }
                })}
              />
              Left
            </label>
            <label>
              <input
                type="checkbox"
                checked={symbolDef.connectionPoints.right}
                onChange={(e) => setSymbolDef({
                  ...symbolDef,
                  connectionPoints: { ...symbolDef.connectionPoints, right: e.target.checked }
                })}
              />
              Right
            </label>
          </div>
        </div>

        {/* Size Settings */}
        <div className="section">
          <h3>Default Size</h3>
          <div className="size-settings">
            <div className="form-group">
              <label>Width</label>
              <input
                type="number"
                value={symbolDef.defaultSize.width}
                onChange={(e) => setSymbolDef({
                  ...symbolDef,
                  defaultSize: { ...symbolDef.defaultSize, width: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="form-group">
              <label>Height</label>
              <input
                type="number"
                value={symbolDef.defaultSize.height}
                onChange={(e) => setSymbolDef({
                  ...symbolDef,
                  defaultSize: { ...symbolDef.defaultSize, height: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="section">
          <h3>Preview</h3>
          <div className="preview-container">
            <div className="preview-controls">
              {symbolDef.parameters.map((param, index) => (
                <div key={index} className="preview-control">
                  <label>{param.name}</label>
                  {param.type === 'number' && (
                    <input
                      type="number"
                      value={previewParams[param.name] ?? param.defaultValue}
                      onChange={(e) => setPreviewParams({
                        ...previewParams,
                        [param.name]: parseFloat(e.target.value)
                      })}
                      min={param.min}
                      max={param.max}
                    />
                  )}
                  {param.type === 'string' && (
                    <input
                      type="text"
                      value={previewParams[param.name] ?? param.defaultValue}
                      onChange={(e) => setPreviewParams({
                        ...previewParams,
                        [param.name]: e.target.value
                      })}
                    />
                  )}
                  {param.type === 'color' && (
                    <input
                      type="color"
                      value={previewParams[param.name] ?? param.defaultValue}
                      onChange={(e) => setPreviewParams({
                        ...previewParams,
                        [param.name]: e.target.value
                      })}
                    />
                  )}
                  {param.type === 'boolean' && (
                    <input
                      type="checkbox"
                      checked={previewParams[param.name] ?? param.defaultValue}
                      onChange={(e) => setPreviewParams({
                        ...previewParams,
                        [param.name]: e.target.checked
                      })}
                    />
                  )}
                  {param.type === 'select' && param.options && (
                    <select
                      value={previewParams[param.name] ?? param.defaultValue}
                      onChange={(e) => setPreviewParams({
                        ...previewParams,
                        [param.name]: e.target.value
                      })}
                    >
                      {param.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
            <div className="preview-display" ref={svgPreviewRef}>
              <div dangerouslySetInnerHTML={{ __html: generatePreview() }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Symbol Node Component for ReactFlow
 */
export const CustomSymbolNode: React.FC<NodeProps & { data: CustomSymbolDefinition }> = ({
  data,
  selected
}) => {
  const [_parameters, _setParameters] = useState<Record<string, string | number | boolean>>({});

  // Generate SVG from template and parameters
  const generateSVG = useCallback(() => {
    let svg = data.svgTemplate;

    // Replace parameter placeholders
    data.parameters.forEach(param => {
      const value = parameters[param.name] ?? param.defaultValue;
      const placeholder = new RegExp(`{{${param.name}}}`, 'g');
      svg = svg.replace(placeholder, value);
    });

    // Replace default placeholders
    svg = svg
      .replace(/{{width}}/g, data.defaultSize.width.toString())
      .replace(/{{height}}/g, data.defaultSize.height.toString())
      .replace(/{{color}}/g, '#000000')
      .replace(/{{fillColor}}/g, '#ffffff')
      .replace(/{{strokeWidth}}/g, '1.5');

    return svg;
  }, [data]);

  return (
    <div className={`custom-symbol-node ${selected ? 'selected' : ''}`}>
      {data.connectionPoints.top && (
        <Handle type="target" position={Position.Top} id="top" />
      )}
      {data.connectionPoints.left && (
        <Handle type="target" position={Position.Left} id="left" />
      )}

      <div
        className="symbol-content"
        dangerouslySetInnerHTML={{ __html: generateSVG() }}
      />

      {data.connectionPoints.right && (
        <Handle type="source" position={Position.Right} id="right" />
      )}
      {data.connectionPoints.bottom && (
        <Handle type="source" position={Position.Bottom} id="bottom" />
      )}
    </div>
  );
};

/**
 * Custom Symbol Manager - handles storage and retrieval of custom symbols
 */
export class CustomSymbolManager {
  private static STORAGE_KEY = 'ergoplanner-custom-symbols';

  static saveSymbol(symbol: CustomSymbolDefinition): void {
    const symbols = this.getSymbols();
    const existingIndex = symbols.findIndex(s => s.id === symbol.id);

    if (existingIndex >= 0) {
      symbols[existingIndex] = symbol;
    } else {
      symbols.push(symbol);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(symbols));
  }

  static getSymbols(): CustomSymbolDefinition[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getSymbol(id: string): CustomSymbolDefinition | undefined {
    const symbols = this.getSymbols();
    return symbols.find(s => s.id === id);
  }

  static deleteSymbol(id: string): void {
    const symbols = this.getSymbols();
    const filtered = symbols.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static exportSymbol(symbol: CustomSymbolDefinition): string {
    return JSON.stringify(symbol, null, 2);
  }

  static importSymbol(json: string): CustomSymbolDefinition {
    return JSON.parse(json);
  }

  static exportAll(): string {
    return JSON.stringify(this.getSymbols(), null, 2);
  }

  static importAll(json: string): void {
    const symbols = JSON.parse(json);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(symbols));
  }
}

export default CustomSymbolCreator;