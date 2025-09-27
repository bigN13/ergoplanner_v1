"use client";

import { Info, AlertCircle } from "lucide-react";
import React, { useState, useCallback } from "react";

import type { FormFieldExtended, TableColumn } from "./PropertyTemplates";

/**
 * Base form field props
 */
interface BaseFieldProps {
  field: FormFieldExtended;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Radio group field component
 */
export function RadioGroupField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field.name, e.target.value);
    },
    [field.name, onChange]
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="block text-xs font-medium text-gray-600">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        {field.tooltip && (
          <div className="group relative">
            <Info className="h-3 w-3 cursor-help text-gray-400" />
            <div className="invisible absolute -top-8 left-4 z-10 w-48 rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:visible">
              {field.tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-1" role="radiogroup" aria-labelledby={`${field.name}-label`}>
        {field.options?.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-2 ${
              disabled || field.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name={field.name}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              disabled={disabled || field.disabled}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <div
          id={`${field.name}-error`}
          className="flex items-center gap-1 text-xs text-red-600"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Formula editor field component with syntax highlighting
 */
export function FormulaEditorField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  const [isFocused, setIsFocused] = useState(false);
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(field.name, e.target.value);
    },
    [field.name, onChange]
  );

  // Basic syntax highlighting for formulas
  const highlightFormula = (formula: string) => {
    if (!formula) return "";

    // Escape HTML first
    const escaped = formula
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped
      .replace(/\b(IF|AND|OR|NOT|SUM|AVG|MIN|MAX|COUNT|ROUND|ABS|SQRT|POW|LOG|EXP)\b/gi, '<span class="text-blue-600 font-semibold">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-green-600">$1</span>')
      .replace(/([+\-*/=&lt;&gt;()])/g, '<span class="text-orange-600 font-semibold">$1</span>')
      .replace(/(\$?\w+)/g, (match) => {
        if (!match.match(/^(IF|AND|OR|NOT|SUM|AVG|MIN|MAX|COUNT|ROUND|ABS|SQRT|POW|LOG|EXP)$/i)) {
          return `<span class="text-purple-600">${match}</span>`;
        }
        return match;
      });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label htmlFor={field.name} className="block text-xs font-medium text-gray-600">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.tooltip && (
          <div className="group relative">
            <Info className="h-3 w-3 cursor-help text-gray-400" />
            <div className="invisible absolute -top-8 left-4 z-10 w-48 rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:visible">
              {field.tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <textarea
          id={field.name}
          name={field.name}
          value={String(value || "")}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={field.placeholder || "Enter formula (e.g., IF(pressure > 100, 'High', 'Normal'))"}
          disabled={disabled || field.disabled}
          required={field.required}
          rows={3}
          aria-describedby={error ? `${field.name}-error` : undefined}
          className={`w-full rounded border px-2 py-1 text-sm font-mono focus:ring-1 focus:outline-none ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} ${!isFocused && value ? "opacity-0" : ""}`}
        />
        {!isFocused && Boolean(value) && (
          <div
            className="absolute inset-0 pointer-events-none px-2 py-1 text-sm font-mono overflow-auto"
            dangerouslySetInnerHTML={{ __html: highlightFormula(String(value)) }}
            suppressHydrationWarning
          />
        )}
      </div>
      <div className="text-xs text-gray-500">
        Supported functions: IF, AND, OR, SUM, AVG, MIN, MAX, COUNT, ROUND, ABS, SQRT, POW
      </div>
      {error && (
        <div
          id={`${field.name}-error`}
          className="flex items-center gap-1 text-xs text-red-600"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Table editor field component for multi-row data
 */
export function TableEditorField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  // Parse value as array of objects
  const tableData = Array.isArray(value) ? value : [];

  const handleAddRow = useCallback(() => {
    const newRow = field.columns?.reduce((acc: Record<string, unknown>, col: TableColumn) => {
      acc[col.key] = "";
      return acc;
    }, {} as Record<string, unknown>) || {};
    onChange(field.name, [...tableData, newRow]);
  }, [field.columns, field.name, onChange, tableData]);

  const handleRemoveRow = useCallback((index: number) => {
    const newData = tableData.filter((_, i) => i !== index);
    onChange(field.name, newData);
  }, [field.name, onChange, tableData]);

  const handleCellChange = useCallback((rowIndex: number, colKey: string, cellValue: unknown) => {
    const newData = [...tableData];
    newData[rowIndex] = { ...newData[rowIndex], [colKey]: cellValue };
    onChange(field.name, newData);
  }, [field.name, onChange, tableData]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <label className="block text-xs font-medium text-gray-600">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.tooltip && (
            <div className="group relative">
              <Info className="h-3 w-3 cursor-help text-gray-400" />
              <div className="invisible absolute -top-8 left-4 z-10 w-48 rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:visible">
                {field.tooltip}
              </div>
            </div>
          )}
        </div>
        {!disabled && !field.disabled && (
          <button
            type="button"
            onClick={handleAddRow}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Row
          </button>
        )}
      </div>

      {field.columns && field.columns.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {field.columns.map((col: TableColumn) => (
                  <th key={col.key} className="border-b px-2 py-1 text-left font-medium text-gray-700">
                    {col.label}
                    {col.required && <span className="ml-1 text-red-500">*</span>}
                  </th>
                ))}
                {!disabled && !field.disabled && <th className="w-10 border-b"></th>}
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={(field.columns?.length || 0) + (disabled || field.disabled ? 0 : 1)}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No data. Click &quot;Add Row&quot; to start.
                  </td>
                </tr>
              ) : (
                tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50">
                    {field.columns?.map((col: TableColumn) => (
                      <td key={col.key} className="px-2 py-1">
                        <input
                          type={col.type || "text"}
                          value={String((row as Record<string, unknown>)[col.key] || "")}
                          onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                          disabled={disabled || field.disabled}
                          placeholder={col.placeholder}
                          className="w-full rounded border border-gray-200 px-1 py-0.5 text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                    ))}
                    {!disabled && !field.disabled && (
                      <td className="px-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(rowIndex)}
                          className="text-red-500 hover:text-red-700 text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div
          id={`${field.name}-error`}
          className="flex items-center gap-1 text-xs text-red-600"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}