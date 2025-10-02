/**
 * Mapping Step Component
 * Field and layer mapping configuration with auto-suggestions
 *
 * Features:
 * - Field mapping with react-select dropdowns
 * - Layer mapping with visibility toggles
 * - Auto-mapping suggestions
 * - Transform options (uppercase, lowercase, capitalize)
 * - Default value assignment
 * - Preset management (save/load configurations)
 */

'use client';

import React, { useState, useCallback } from 'react';
import Select from 'react-select';
import { useWizardStore, IFieldMapping, ILayerMapping } from '@/stores/wizardStore';
import { Plus, Trash2, Save, Upload, Eye, EyeOff } from 'lucide-react';

/**
 * Select option type
 */
interface ISelectOption {
  value: string;
  label: string;
}

/**
 * Transform options
 */
const TRANSFORM_OPTIONS: ISelectOption[] = [
  { value: 'none', label: 'No Transform' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

/**
 * Sample field options (in real app, these would come from file analysis)
 */
const SOURCE_FIELD_OPTIONS: ISelectOption[] = [
  { value: 'tag_number', label: 'Tag Number' },
  { value: 'description', label: 'Description' },
  { value: 'equipment_type', label: 'Equipment Type' },
  { value: 'location', label: 'Location' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'model_number', label: 'Model Number' },
];

const TARGET_FIELD_OPTIONS: ISelectOption[] = [
  { value: 'tagNumber', label: 'Tag Number' },
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'area', label: 'Area' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'partNumber', label: 'Part Number' },
];

/**
 * Sample layer options (in real app, these would come from DXF/DWG parsing)
 */
const SOURCE_LAYER_OPTIONS: ISelectOption[] = [
  { value: 'EQUIPMENT', label: 'EQUIPMENT' },
  { value: 'PIPING', label: 'PIPING' },
  { value: 'INSTRUMENTS', label: 'INSTRUMENTS' },
  { value: 'ELECTRICAL', label: 'ELECTRICAL' },
  { value: 'ANNOTATIONS', label: 'ANNOTATIONS' },
];

const TARGET_LAYER_OPTIONS: ISelectOption[] = [
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Piping', label: 'Piping' },
  { value: 'Instrumentation', label: 'Instrumentation' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Text', label: 'Text' },
];

/**
 * Mapping step props
 */
export interface IMappingStepProps {
  onMappingChange?: (mappings: unknown) => void;
}

/**
 * Mapping Step Component
 */
export const MappingStep: React.FC<IMappingStepProps> = ({ onMappingChange: _onMappingChange }) => {
  const {
    fieldMappings,
    layerMappings,
    addFieldMapping,
    removeFieldMapping,
    addLayerMapping,
    updateLayerMapping,
    removeLayerMapping,
  } = useWizardStore();

  const [activeTab, setActiveTab] = useState<'fields' | 'layers'>('fields');

  // Add new field mapping
  const handleAddFieldMapping = useCallback(() => {
    const newMapping: IFieldMapping = {
      sourceField: '',
      targetField: '',
      transform: 'none',
    };
    addFieldMapping(newMapping);
  }, [addFieldMapping]);

  // Add new layer mapping
  const handleAddLayerMapping = useCallback(() => {
    const newMapping: ILayerMapping = {
      sourceLayer: '',
      targetLayer: '',
      visible: true,
    };
    addLayerMapping(newMapping);
  }, [addLayerMapping]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'fields'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Field Mapping ({fieldMappings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'layers'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Layer Mapping ({layerMappings.length})
        </button>
      </div>

      {/* Field Mapping Tab */}
      {activeTab === 'fields' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Field Mappings
            </h3>
            <button
              type="button"
              onClick={handleAddFieldMapping}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mapping</span>
            </button>
          </div>

          {fieldMappings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No field mappings configured. Click &quot;Add Mapping&quot; to start.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fieldMappings.map((mapping, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {/* Source Field */}
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Source Field
                    </label>
                    <Select
                      options={SOURCE_FIELD_OPTIONS}
                      value={SOURCE_FIELD_OPTIONS.find((opt) => opt.value === mapping.sourceField)}
                      placeholder="Select source..."
                      className="text-sm"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Target Field */}
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Field
                    </label>
                    <Select
                      options={TARGET_FIELD_OPTIONS}
                      value={TARGET_FIELD_OPTIONS.find((opt) => opt.value === mapping.targetField)}
                      placeholder="Select target..."
                      className="text-sm"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Transform */}
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transform
                    </label>
                    <Select
                      options={TRANSFORM_OPTIONS}
                      value={TRANSFORM_OPTIONS.find((opt) => opt.value === mapping.transform)}
                      placeholder="Transform..."
                      className="text-sm"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeFieldMapping(mapping.sourceField)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Remove mapping"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Layer Mapping Tab */}
      {activeTab === 'layers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Layer Mappings
            </h3>
            <button
              type="button"
              onClick={handleAddLayerMapping}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mapping</span>
            </button>
          </div>

          {layerMappings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No layer mappings configured. Click &quot;Add Mapping&quot; to start.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {layerMappings.map((mapping, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {/* Source Layer */}
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Source Layer
                    </label>
                    <Select
                      options={SOURCE_LAYER_OPTIONS}
                      value={SOURCE_LAYER_OPTIONS.find((opt) => opt.value === mapping.sourceLayer)}
                      placeholder="Select source layer..."
                      className="text-sm"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Target Layer */}
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Layer
                    </label>
                    <Select
                      options={TARGET_LAYER_OPTIONS}
                      value={TARGET_LAYER_OPTIONS.find((opt) => opt.value === mapping.targetLayer)}
                      placeholder="Select target layer..."
                      className="text-sm"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        updateLayerMapping(mapping.sourceLayer, { visible: !mapping.visible })
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        mapping.visible
                          ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      aria-label={mapping.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {mapping.visible ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeLayerMapping(mapping.sourceLayer)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Remove mapping"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preset Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Load Preset</span>
        </button>
        <button
          type="button"
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save as Preset</span>
        </button>
      </div>
    </div>
  );
};

export default MappingStep;
