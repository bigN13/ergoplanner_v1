/**
 * Formula Editor Component
 *
 * Interactive formula editor with:
 * - Syntax highlighting
 * - Autocomplete for variables and functions
 * - Formula validation
 * - Live preview of results
 */

import React, { useState, useCallback, useMemo } from 'react';
import { getCalculationEngine } from '../../services/CalculationEngine';

// ============================================================================
// Type Definitions
// ============================================================================

export interface FormulaEditorProps {
  initialFormula?: string;
  availableVariables?: Map<string, number>;
  onFormulaChange?: (formula: string, isValid: boolean) => void;
  onCalculate?: (result: number) => void;
}

export interface SyntaxToken {
  type: 'variable' | 'function' | 'operator' | 'number' | 'keyword' | 'error';
  value: string;
  position: number;
}

export interface AutocompleteOption {
  label: string;
  value: string;
  type: 'variable' | 'function' | 'constant';
  description?: string;
}

// ============================================================================
// Formula Editor Component
// ============================================================================

export const FormulaEditor: React.FC<FormulaEditorProps> = ({
  initialFormula = '',
  availableVariables = new Map(),
  onFormulaChange,
  onCalculate,
}) => {
  const [formula, setFormula] = useState(initialFormula);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<AutocompleteOption[]>([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [calculationResult, setCalculationResult] = useState<number | null>(null);

  const _engine = useMemo(() => getCalculationEngine(), []);

  // Available functions
  const functions: AutocompleteOption[] = useMemo(() => [
    { label: 'sqrt', value: 'sqrt(', type: 'function', description: 'Square root' },
    { label: 'pow', value: 'pow(', type: 'function', description: 'Power: pow(base, exponent)' },
    { label: 'exp', value: 'exp(', type: 'function', description: 'Exponential: e^x' },
    { label: 'log', value: 'log(', type: 'function', description: 'Natural logarithm' },
    { label: 'log10', value: 'log10(', type: 'function', description: 'Base-10 logarithm' },
    { label: 'sin', value: 'sin(', type: 'function', description: 'Sine (radians)' },
    { label: 'cos', value: 'cos(', type: 'function', description: 'Cosine (radians)' },
    { label: 'tan', value: 'tan(', type: 'function', description: 'Tangent (radians)' },
    { label: 'abs', value: 'abs(', type: 'function', description: 'Absolute value' },
    { label: 'min', value: 'min(', type: 'function', description: 'Minimum of values' },
    { label: 'max', value: 'max(', type: 'function', description: 'Maximum of values' },
    { label: 'reynolds', value: 'reynolds(', type: 'function', description: 'Reynolds number' },
    { label: 'lmtd', value: 'lmtd(', type: 'function', description: 'Log mean temperature difference' },
  ], []);

  // Available constants
  const constants: AutocompleteOption[] = useMemo(() => [
    { label: 'PI', value: 'PI', type: 'constant', description: '3.14159...' },
    { label: 'E', value: 'E', type: 'constant', description: '2.71828...' },
  ], []);

  // Tokenize formula for syntax highlighting
  const tokens = useMemo(() => tokenizeFormula(formula), [formula]);

  // Handle formula change
  const handleFormulaChange = useCallback((newFormula: string) => {
    setFormula(newFormula);

    // Validate formula
    const errors = validateFormula(newFormula);
    setValidationErrors(errors);

    // Try to calculate
    if (errors.length === 0) {
      try {
        const varMap = new Map(availableVariables);
        const expr = newFormula;

        // Simple evaluation for preview
        let evalExpr = expr;
        for (const [name, value] of varMap) {
          const regex = new RegExp(`\\b${name}\\b`, 'g');
          evalExpr = evalExpr.replace(regex, value.toString());
        }

        // Add constants
        evalExpr = evalExpr.replace(/\bPI\b/g, Math.PI.toString());
        evalExpr = evalExpr.replace(/\bE\b/g, Math.E.toString());

        // Safe evaluation (simplified)
        const result = evaluateFormulaSafe(evalExpr);
        setCalculationResult(result);
        onCalculate?.(result);
      } catch {
        setCalculationResult(null);
      }
    }

    onFormulaChange?.(newFormula, errors.length === 0);
  }, [availableVariables, onFormulaChange, onCalculate]);

  // Handle autocomplete
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newFormula = e.target.value;
    const newCursorPosition = e.target.selectionStart;

    handleFormulaChange(newFormula);
    setCursorPosition(newCursorPosition);

    // Check if we should show autocomplete
    const textBeforeCursor = newFormula.substring(0, newCursorPosition);
    const lastWord = textBeforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/)?.[0];

    if (lastWord && lastWord.length > 0) {
      // Filter options
      const variables: AutocompleteOption[] = Array.from(availableVariables.keys()).map(name => ({
        label: name,
        value: name,
        type: 'variable',
        description: `Value: ${availableVariables.get(name)}`,
      }));

      const allOptions = [...variables, ...functions, ...constants];
      const filtered = allOptions.filter(opt =>
        opt.label.toLowerCase().startsWith(lastWord.toLowerCase())
      );

      if (filtered.length > 0) {
        setAutocompleteOptions(filtered);
        setSelectedOption(0);
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  }, [availableVariables, functions, constants, handleFormulaChange]);

  // Handle autocomplete selection
  const insertAutocomplete = useCallback((option: AutocompleteOption) => {
    const textBeforeCursor = formula.substring(0, cursorPosition);
    const textAfterCursor = formula.substring(cursorPosition);
    const lastWordMatch = textBeforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);

    if (lastWordMatch) {
      const lastWord = lastWordMatch[0];
      const beforeLastWord = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length);
      const newFormula = beforeLastWord + option.value + textAfterCursor;
      handleFormulaChange(newFormula);
      setShowAutocomplete(false);
    }
  }, [formula, cursorPosition, handleFormulaChange]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedOption(prev => (prev + 1) % autocompleteOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedOption(prev => (prev - 1 + autocompleteOptions.length) % autocompleteOptions.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        insertAutocomplete(autocompleteOptions[selectedOption]);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    }
  }, [showAutocomplete, autocompleteOptions, selectedOption, insertAutocomplete]);

  return (
    <div style={{ position: 'relative', fontFamily: 'monospace' }}>
      {/* Formula Input */}
      <div style={{ position: 'relative' }}>
        {/* Syntax highlighted background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: 'transparent',
            zIndex: 0,
          }}
        >
          {tokens.map((token, idx) => (
            <span key={idx} style={{ color: getTokenColor(token.type) }}>
              {token.value}
            </span>
          ))}
        </div>

        {/* Actual textarea */}
        <textarea
          value={formula}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '80px',
            padding: '8px',
            border: validationErrors.length > 0 ? '2px solid #F44336' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            backgroundColor: 'transparent',
            color: 'transparent',
            caretColor: '#000',
            resize: 'vertical',
            zIndex: 1,
          }}
          placeholder="Enter formula (e.g., velocity * diameter * density / viscosity)"
        />
      </div>

      {/* Autocomplete dropdown */}
      {showAutocomplete && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '250px',
          }}
        >
          {autocompleteOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => insertAutocomplete(option)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: idx === selectedOption ? '#E3F2FD' : 'transparent',
                borderBottom: idx < autocompleteOptions.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor:
                      option.type === 'variable' ? '#4CAF50' :
                      option.type === 'function' ? '#2196F3' : '#FF9800',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {option.type[0].toUpperCase()}
                </span>
                <span style={{ fontWeight: 'bold' }}>{option.label}</span>
              </div>
              {option.description && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px', marginLeft: '28px' }}>
                  {option.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#FFEBEE',
            border: '1px solid #F44336',
            borderRadius: '4px',
            color: '#C62828',
            fontSize: '12px',
          }}
        >
          {validationErrors.map((error, idx) => (
            <div key={idx}>• {error}</div>
          ))}
        </div>
      )}

      {/* Calculation result */}
      {calculationResult !== null && validationErrors.length === 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#E8F5E9',
            border: '1px solid #4CAF50',
            borderRadius: '4px',
            color: '#2E7D32',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Result: {calculationResult.toExponential(4)}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function tokenizeFormula(formula: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const regex = /([a-zA-Z_][a-zA-Z0-9_]*|\d+\.?\d*|[+\-*/()^,])/g;
  let match;

  while ((match = regex.exec(formula)) !== null) {
    const value = match[0];
    let type: SyntaxToken['type'] = 'variable';

    if (/^\d/.test(value)) {
      type = 'number';
    } else if (/^[+\-*/()^,]$/.test(value)) {
      type = 'operator';
    } else if (['sqrt', 'pow', 'exp', 'log', 'log10', 'sin', 'cos', 'tan', 'abs', 'min', 'max', 'reynolds', 'lmtd'].includes(value)) {
      type = 'function';
    } else if (['PI', 'E'].includes(value)) {
      type = 'keyword';
    }

    tokens.push({ type, value, position: match.index });
  }

  return tokens;
}

function getTokenColor(type: SyntaxToken['type']): string {
  switch (type) {
    case 'variable': return '#1976D2';
    case 'function': return '#7B1FA2';
    case 'operator': return '#757575';
    case 'number': return '#388E3C';
    case 'keyword': return '#D84315';
    case 'error': return '#F44336';
    default: return '#000';
  }
}

function validateFormula(formula: string): string[] {
  const errors: string[] = [];

  // Check for balanced parentheses
  let openParens = 0;
  for (const char of formula) {
    if (char === '(') openParens++;
    if (char === ')') openParens--;
    if (openParens < 0) {
      errors.push('Unbalanced parentheses: too many closing parentheses');
      break;
    }
  }
  if (openParens > 0) {
    errors.push('Unbalanced parentheses: missing closing parentheses');
  }

  // Check for division by zero
  if (/\/\s*0\b/.test(formula)) {
    errors.push('Division by zero detected');
  }

  // Check for empty expression
  if (formula.trim().length === 0) {
    errors.push('Formula cannot be empty');
  }

  return errors;
}

function evaluateFormulaSafe(expression: string): number {
  // Very basic safe evaluation - in production, use a proper math parser
  const allowedChars = /^[0-9+\-*/(). ]+$/;
  if (!allowedChars.test(expression)) {
    throw new Error('Invalid characters in expression');
  }

   
  return eval(expression);
}
