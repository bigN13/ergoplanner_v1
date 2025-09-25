"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X, ChevronDown, ChevronUp, Settings, Info, Ruler, Activity, Zap, Gauge, Wrench } from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { Node, Edge } from "reactflow";


import { useDrawingStore } from "@/store/drawingStore";
import { PROPERTY_SCHEMAS, type NodeType } from "@/types/propertySchemas";

import { DynamicFormField } from "./PropertyPanel/FormFields";
import {
  getFormFieldsForNodeType,
  groupFieldsBySection,
  getSectionsWithFields,
  type FormField
} from "./PropertyPanel/PropertyTemplates";

interface PropertyPanelProps {
  selectedNode?: Node | null;
  selectedNodes?: Node[];
  selectedEdge?: Edge | null;
  onClose?: () => void;
}

/**
 * Icon mapping for sections
 */
const SECTION_ICONS = {
  basic: Info,
  dimensional: Ruler,
  process: Activity,
  electrical: Zap,
  instrumentation: Gauge,
  construction: Wrench,
  advanced: Settings,
} as const;

export default function PropertyPanel({
  selectedNode: propSelectedNode,
  selectedNodes: propSelectedNodes,
  selectedEdge: propSelectedEdge,
  onClose
}: PropertyPanelProps = {}): React.ReactElement | null {
  const {
    updateNode,
    updateEdge,
    deleteNode,
    deleteEdge,
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
    setSelectedNode,
    setSelectedEdge
  } = useDrawingStore();

  // Use props if provided, otherwise get from store
  const selectedNode = propSelectedNode ?? (selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null);
  const selectedNodes = useMemo(() => {
    if (propSelectedNodes) return propSelectedNodes;
    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      return node ? [node] : [];
    }
    return [];
  }, [propSelectedNodes, selectedNodeId, nodes]);
  const selectedEdge = propSelectedEdge ?? (selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) || null : null);

  // Default close handler
  const handleClose = useMemo(() => onClose ?? (() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }), [onClose, setSelectedNode, setSelectedEdge]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "dimensional", "process", "info"])
  );
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Determine if we're in multi-selection mode
  const isMultiSelect = selectedNodes.length > 1;
  const primaryNode = selectedNode || (selectedNodes.length > 0 ? selectedNodes[0] : null);

  // Get node type and form configuration
  const nodeType = primaryNode?.type as NodeType || "instrument";
  const formFields = getFormFieldsForNodeType(nodeType);
  const fieldsBySection = groupFieldsBySection(formFields);
  const availableSections = getSectionsWithFields(formFields);

  // Get validation schema for current node type
  const validationSchema = PROPERTY_SCHEMAS[nodeType] || PROPERTY_SCHEMAS.instrument;

  // Initialize form with react-hook-form
  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: primaryNode?.data || {},
    mode: "onChange",
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors: formErrors, isDirty } } = methods;

  // Reset form when selection changes
  useEffect(() => {
    if (primaryNode) {
      reset(primaryNode.data || {});
    } else if (selectedEdge) {
      reset(selectedEdge.data || {});
    }
  }, [primaryNode, selectedEdge, reset]);

  // Watch form values for real-time updates
  const formValues = watch();

  const toggleSection = useCallback((section: string): void => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      return newExpanded;
    });
  }, []);

  // Handle property changes with command pattern integration
  const handlePropertyChange = useCallback((fieldName: string, value: unknown): void => {
    setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });

    // Apply changes immediately for real-time updates
    if (isMultiSelect) {
      // Update all selected nodes
      selectedNodes.forEach(node => {
        const updatedData = { ...node.data, [fieldName]: value };
        updateNode(node.id, { data: updatedData });
      });
    } else if (primaryNode) {
      const updatedData = { ...primaryNode.data, [fieldName]: value };
      updateNode(primaryNode.id, { data: updatedData });
    } else if (selectedEdge) {
      const updatedData = { ...selectedEdge.data, [fieldName]: value };
      updateEdge(selectedEdge.id, { data: updatedData });
    }
  }, [setValue, isMultiSelect, selectedNodes, primaryNode, selectedEdge, updateNode, updateEdge]);

  // Handle position changes with command pattern
  const handlePositionChange = useCallback((axis: "x" | "y", value: string): void => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (isMultiSelect) {
        // Update all selected nodes' positions
        selectedNodes.forEach(node => {
          const position = { ...node.position, [axis]: numValue };
          updateNode(node.id, { position });
        });
      } else if (primaryNode) {
        const position = { ...primaryNode.position, [axis]: numValue };
        updateNode(primaryNode.id, { position });
      }
    }
  }, [isMultiSelect, selectedNodes, primaryNode, updateNode]);

  // Handle deletion with confirmation
  const handleDelete = useCallback((): void => {
    const confirmMessage = isMultiSelect
      ? `Are you sure you want to delete ${selectedNodes.length} selected elements?`
      : "Are you sure you want to delete this element?";

    // TODO: Replace with proper modal dialog component
    // eslint-disable-next-line no-alert
    if (confirm(confirmMessage)) {
      if (isMultiSelect) {
        selectedNodes.forEach(node => deleteNode(node.id));
      } else if (primaryNode) {
        deleteNode(primaryNode.id);
      } else if (selectedEdge) {
        deleteEdge(selectedEdge.id);
      }
      handleClose();
    }
  }, [isMultiSelect, selectedNodes, primaryNode, selectedEdge, deleteNode, deleteEdge, handleClose]);

  // Submit handler for form validation
  const onSubmit = useCallback((_data: Record<string, unknown>) => {
    // Form is valid, data is already being updated in real-time
    // Validation successful - data is handled in real-time
  }, []);

  // Render form field with error handling
  const renderFormField = useCallback((field: FormField) => {
    const fieldValue = formValues[field.name];
    const fieldError = formErrors[field.name]?.message;

    return (
      <DynamicFormField
        key={field.name}
        field={field}
        value={fieldValue}
        onChange={handlePropertyChange}
        error={fieldError}
        disabled={false}
        unitSystem={unitSystem}
      />
    );
  }, [formValues, formErrors, handlePropertyChange, unitSystem]);

  // Render property sections dynamically
  const renderPropertySections = useMemo(() => {
    if (!primaryNode && !selectedEdge) return null;

    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Multi-selection info */}
          {isMultiSelect && (
            <div className="mb-4 rounded bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Info className="h-4 w-4" />
                <span>{selectedNodes.length} elements selected</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Changes will be applied to all selected elements
              </p>
            </div>
          )}

          {/* Basic Information Section (always visible) */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => toggleSection("info")}
              className="flex w-full items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Element Information</span>
              </div>
              {expandedSections.has("info") ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has("info") && (
              <div className="mt-2 space-y-3 px-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">ID</label>
                  <input
                    type="text"
                    value={primaryNode?.id || selectedEdge?.id || ""}
                    disabled
                    className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Type</label>
                  <input
                    type="text"
                    value={nodeType || selectedEdge?.type || "edge"}
                    disabled
                    className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                  />
                </div>
                {primaryNode && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">X Position</label>
                      <input
                        type="number"
                        value={Math.round(primaryNode.position.x)}
                        onChange={(e) => handlePositionChange("x", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Y Position</label>
                      <input
                        type="number"
                        value={Math.round(primaryNode.position.y)}
                        onChange={(e) => handlePositionChange("y", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unit System Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Unit System</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUnitSystem("metric")}
                className={`px-3 py-1 text-xs rounded ${
                  unitSystem === "metric"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Metric
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem("imperial")}
                className={`px-3 py-1 text-xs rounded ${
                  unitSystem === "imperial"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Imperial
              </button>
            </div>
          </div>

          {/* Dynamic Property Sections */}
          {primaryNode && availableSections.map(section => {
            const sectionFields = fieldsBySection[section.id];
            if (!sectionFields || sectionFields.length === 0) return null;

            const IconComponent = SECTION_ICONS[section.id as keyof typeof SECTION_ICONS] || Settings;

            return (
              <div key={section.id} className="mb-4">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{section.label}</span>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.has(section.id) && (
                  <div className="mt-2 space-y-3 px-3">
                    {sectionFields.map(renderFormField)}
                  </div>
                )}
              </div>
            );
          })}
        </form>
      </FormProvider>
    );
  }, [primaryNode, selectedEdge, isMultiSelect, selectedNodes, expandedSections, availableSections, fieldsBySection, methods, handleSubmit, onSubmit, toggleSection, unitSystem, renderFormField, handlePositionChange, nodeType]);

  // Render edge properties with similar structure
  const renderEdgeProperties = useMemo(() => {
    if (!selectedEdge) return null;

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => toggleSection("edge-info")}
            className="flex w-full items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Connection Information</span>
            </div>
            {expandedSections.has("edge-info") ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has("edge-info") && (
            <div className="mt-2 space-y-3 px-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">ID</label>
                <input
                  type="text"
                  value={selectedEdge.id}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Source Node</label>
                <input
                  type="text"
                  value={selectedEdge.source}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Target Node</label>
                <input
                  type="text"
                  value={selectedEdge.target}
                  disabled
                  className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Label</label>
                <input
                  type="text"
                  value={selectedEdge.data?.label || ""}
                  onChange={(e) => {
                    const updatedData = { ...selectedEdge.data, label: e.target.value };
                    updateEdge(selectedEdge.id, { data: updatedData });
                  }}
                  placeholder="Enter connection label..."
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [selectedEdge, expandedSections, toggleSection, updateEdge]);

  // Don't render if nothing is selected
  if (!primaryNode && !selectedEdge && selectedNodes.length === 0) {
    return null;
  }

  const title = isMultiSelect
    ? `Properties (${selectedNodes.length} selected)`
    : primaryNode
      ? "Node Properties"
      : "Edge Properties";

  const deleteButtonText = isMultiSelect
    ? `Delete ${selectedNodes.length} Elements`
    : primaryNode
      ? "Delete Node"
      : "Delete Edge";

  return (
    <div className="flex h-full w-80 flex-col border-l border-gray-200 bg-white" role="complementary" aria-label="Properties Panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {title}
        </h3>
        <button
          onClick={handleClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close properties panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {(primaryNode || isMultiSelect) && renderPropertySections}
        {selectedEdge && renderEdgeProperties}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        {/* Form validation status */}
        {isDirty && (
          <div className="text-xs text-blue-600 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Changes are saved automatically
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="w-full rounded bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {deleteButtonText}
        </button>
      </div>
    </div>
  );
}