"use client";

import { Info, AlertCircle } from "lucide-react";
import React, { useState, useCallback } from "react";

import type { FormField } from "./PropertyTemplates";
import { getSuggestedUnits, parseValueWithUnit, formatValueWithUnit } from "./UnitConversion";

/**
 * Base form field props
 */
interface BaseFieldProps {
  field: FormField;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Text input field component
 */
export function TextInputField({
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
        <label htmlFor={field.name} className="block text-xs font-medium text-gray-600">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
          {field.unit && <span className="ml-1 text-gray-400">({field.unit})</span>}
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
      <input
        id={field.name}
        name={field.name}
        type="text"
        value={String(value || "")}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled || field.disabled}
        required={field.required}
        aria-describedby={error ? `${field.name}-error` : undefined}
        className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} `}
      />
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
 * Number input field component
 */
export function NumberInputField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      onChange(field.name, isNaN(numValue) ? "" : numValue);
    },
    [field.name, onChange]
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label htmlFor={field.name} className="block text-xs font-medium text-gray-600">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
          {field.unit && <span className="ml-1 text-gray-400">({field.unit})</span>}
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
      <input
        id={field.name}
        name={field.name}
        type="number"
        value={typeof value === "number" ? value : ""}
        onChange={handleChange}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        disabled={disabled || field.disabled}
        required={field.required}
        aria-describedby={error ? `${field.name}-error` : undefined}
        className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} `}
      />
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
 * Select dropdown field component
 */
export function SelectField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(field.name, e.target.value);
    },
    [field.name, onChange]
  );

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
      <select
        id={field.name}
        name={field.name}
        value={String(value || "")}
        onChange={handleChange}
        disabled={disabled || field.disabled}
        required={field.required}
        aria-describedby={error ? `${field.name}-error` : undefined}
        className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} `}
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
 * Checkbox field component
 */
export function CheckboxField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field.name, e.target.checked);
    },
    [field.name, onChange]
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={handleChange}
          disabled={disabled || field.disabled}
          aria-describedby={error ? `${field.name}-error` : undefined}
          className={`h-4 w-4 rounded border focus:ring-1 focus:outline-none ${
            error
              ? "border-red-300 text-red-600 focus:ring-red-500"
              : "border-gray-300 text-blue-600 focus:ring-blue-500"
          } ${disabled || field.disabled ? "opacity-50" : ""} `}
        />
        <div className="flex items-center gap-1">
          <label htmlFor={field.name} className="text-xs font-medium text-gray-600">
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
 * Slider field component
 */
export function SliderField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  const numValue = typeof value === "number" ? value : field.min || 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      onChange(field.name, numValue);
    },
    [field.name, onChange]
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label htmlFor={field.name} className="block text-xs font-medium text-gray-600">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
          <span className="ml-1 text-gray-500">
            ({numValue}
            {field.unit && field.unit})
          </span>
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
      <input
        id={field.name}
        name={field.name}
        type="range"
        value={numValue}
        onChange={handleChange}
        min={field.min || 0}
        max={field.max || 100}
        step={field.step || 1}
        disabled={disabled || field.disabled}
        aria-describedby={error ? `${field.name}-error` : undefined}
        className={`mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 ${disabled || field.disabled ? "opacity-50" : ""} `}
      />
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
 * Textarea field component
 */
export function TextareaField({
  field,
  value,
  onChange,
  error,
  disabled,
}: BaseFieldProps): React.ReactElement {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(field.name, e.target.value);
    },
    [field.name, onChange]
  );

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
      <textarea
        id={field.name}
        name={field.name}
        value={String(value || "")}
        onChange={handleChange}
        placeholder={field.placeholder}
        rows={field.rows || 3}
        disabled={disabled || field.disabled}
        required={field.required}
        aria-describedby={error ? `${field.name}-error` : undefined}
        className={`resize-vertical mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} `}
      />
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
 * Color picker field component
 */
export function ColorField({
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
      <div className="flex items-center gap-2">
        <input
          id={field.name}
          name={field.name}
          type="color"
          value={String(value || "#000000")}
          onChange={handleChange}
          disabled={disabled || field.disabled}
          required={field.required}
          aria-describedby={error ? `${field.name}-error` : undefined}
          className={`h-8 w-16 cursor-pointer rounded border ${
            error ? "border-red-300" : "border-gray-300"
          } ${disabled || field.disabled ? "opacity-50" : ""} `}
        />
        <input
          type="text"
          value={String(value || "#000000")}
          onChange={handleChange}
          placeholder="#000000"
          disabled={disabled || field.disabled}
          className={`flex-1 rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} `}
        />
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
 * Date input field component
 */
export function DateField({
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
      <input
        id={field.name}
        name={field.name}
        type="date"
        value={String(value || "")}
        onChange={handleChange}
        disabled={disabled || field.disabled}
        required={field.required}
        aria-describedby={error ? `${field.name}-error` : undefined}
        className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} `}
      />
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
 * Enhanced text input with unit conversion support
 */
export function UnitInputField({
  field,
  value,
  onChange,
  error,
  disabled,
  unitSystem = "metric",
}: BaseFieldProps & { unitSystem?: "metric" | "imperial" }): React.ReactElement {
  const [inputValue, setInputValue] = useState(String(value || ""));
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  // Get suggested units for this field
  const suggestedUnits = getSuggestedUnits(field.name, unitSystem);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Parse value with unit if present
      const parsed = parseValueWithUnit(newValue);
      if (parsed.success && parsed.unit) {
        setSelectedUnit(parsed.unit);
      }

      onChange(field.name, newValue);
    },
    [field.name, onChange]
  );

  const handleUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newUnit = e.target.value;
      setSelectedUnit(newUnit);

      // Parse current value
      const parsed = parseValueWithUnit(inputValue);
      if (parsed.success && parsed.value !== null) {
        const formattedValue = formatValueWithUnit(parsed.value, newUnit);
        setInputValue(formattedValue);
        onChange(field.name, formattedValue);
      }
    },
    [inputValue, onChange, field.name]
  );

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
      <div className="flex gap-1">
        <input
          id={field.name}
          name={field.name}
          type="text"
          value={inputValue}
          onChange={handleValueChange}
          placeholder={field.placeholder}
          disabled={disabled || field.disabled}
          required={field.required}
          aria-describedby={error ? `${field.name}-error` : undefined}
          className={`flex-1 rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } ${disabled || field.disabled ? "bg-gray-50 text-gray-500" : ""} `}
        />
        {suggestedUnits.length > 0 && (
          <select
            value={selectedUnit}
            onChange={handleUnitChange}
            disabled={disabled || field.disabled}
            className="w-20 rounded border border-gray-300 px-1 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Unit</option>
            {suggestedUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        )}
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
 * Dynamic form field component that renders the appropriate field type
 */
export function DynamicFormField({
  field,
  value,
  onChange,
  error,
  disabled,
  unitSystem = "metric",
}: BaseFieldProps & { unitSystem?: "metric" | "imperial" }): React.ReactElement {
  const props = { field, value, onChange, error, disabled };

  switch (field.type) {
    case "text":
      // Use unit input for fields with units, regular text input otherwise
      return field.unit || getSuggestedUnits(field.name, unitSystem).length > 0 ? (
        <UnitInputField {...props} unitSystem={unitSystem} />
      ) : (
        <TextInputField {...props} />
      );
    case "number":
      return <NumberInputField {...props} />;
    case "select":
      return <SelectField {...props} />;
    case "checkbox":
      return <CheckboxField {...props} />;
    case "slider":
      return <SliderField {...props} />;
    case "textarea":
      return <TextareaField {...props} />;
    case "color":
      return <ColorField {...props} />;
    case "date":
      return <DateField {...props} />;
    default:
      return <TextInputField {...props} />;
  }
}
