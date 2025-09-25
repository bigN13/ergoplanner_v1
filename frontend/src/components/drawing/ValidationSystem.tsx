"use client";

import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  // X,
  // Eye,
  // EyeOff,
  RefreshCcw,
  // Settings,
  // Filter,
  Download,
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Node, Edge } from "reactflow";

import { useDrawingStore } from "@/store/drawingStore";

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: "equipment" | "connection" | "labeling" | "standard" | "safety";
  severity: "error" | "warning" | "info";
  enabled: boolean;
  validate: (nodes: Node[], edges: Edge[]) => ValidationIssue[];
}

interface ValidationIssue {
  id: string;
  ruleId: string;
  severity: "error" | "warning" | "info";
  message: string;
  description?: string;
  elementId: string;
  elementType: "node" | "edge";
  position?: { x: number; y: number };
  suggestions?: string[];
  autoFixAvailable?: boolean;
}

interface ValidationSystemProps {
  className?: string;
  visible?: boolean;
  onToggle?: () => void;
}

export default function ValidationSystem({
  className = "",
  visible = true,
  onToggle,
}: ValidationSystemProps): React.JSX.Element | null {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [_selectedIssue, _setSelectedIssue] = useState<ValidationIssue | null>(null);
  const [autoValidate, setAutoValidate] = useState(true);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [highlightIssues, setHighlightIssues] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const { nodes, edges, updateNode } = useDrawingStore();
  // const updateEdge = useDrawingStore((state) => state.updateEdge); // TODO: Implement if needed

  // Define validation rules
  const validationRules: ValidationRule[] = useMemo(
    () => [
      // Equipment Validation Rules
      {
        id: "missing-equipment-tags",
        name: "Missing Equipment Tags",
        description: "Equipment must have unique identification tags",
        category: "equipment",
        severity: "error",
        enabled: true,
        validate: (nodes: Node[]) => {
          const issues: ValidationIssue[] = [];
          nodes.forEach((node) => {
            if (!node.data.label || node.data.label.trim() === "") {
              issues.push({
                id: `missing-tag-${node.id}`,
                ruleId: "missing-equipment-tags",
                severity: "error",
                message: `${node.type} is missing equipment tag`,
                description:
                  "All equipment must have a unique identification tag (e.g., P-101, V-205)",
                elementId: node.id,
                elementType: "node",
                position: node.position,
                suggestions: [
                  `Add tag like ${node.type?.toUpperCase() || 'SYMBOL'}-101`,
                  "Follow company tagging standards",
                  "Ensure tag is unique in drawing",
                ],
                autoFixAvailable: true,
              });
            }
          });
          return issues;
        },
      },
      {
        id: "duplicate-equipment-tags",
        name: "Duplicate Equipment Tags",
        description: "Equipment tags must be unique",
        category: "equipment",
        severity: "error",
        enabled: true,
        validate: (nodes: Node[]) => {
          const issues: ValidationIssue[] = [];
          const tagMap = new Map<string, Node[]>();

          nodes.forEach((node) => {
            if (node.data.label && node.data.label.trim() !== "") {
              const tag = node.data.label.trim().toUpperCase();
              if (!tagMap.has(tag)) {
                tagMap.set(tag, []);
              }
              const tagArray = tagMap.get(tag);
              if (tagArray) {
                tagArray.push(node);
              }
            }
          });

          tagMap.forEach((nodesWithTag, tag) => {
            if (nodesWithTag.length > 1) {
              nodesWithTag.forEach((node) => {
                issues.push({
                  id: `duplicate-tag-${node.id}`,
                  ruleId: "duplicate-equipment-tags",
                  severity: "error",
                  message: `Duplicate equipment tag: ${tag}`,
                  description: `Tag "${tag}" is used by ${nodesWithTag.length} equipment items`,
                  elementId: node.id,
                  elementType: "node",
                  position: node.position,
                  suggestions: [
                    "Rename to unique tag",
                    "Check equipment numbering sequence",
                    "Review tagging standards",
                  ],
                  autoFixAvailable: true,
                });
              });
            }
          });

          return issues;
        },
      },
      {
        id: "missing-equipment-specs",
        name: "Missing Equipment Specifications",
        description: "Critical equipment specifications are missing",
        category: "equipment",
        severity: "warning",
        enabled: true,
        validate: (nodes: Node[]) => {
          const issues: ValidationIssue[] = [];
          const criticalSpecs: { [key: string]: string[] } = {
            pump: ["flowRate", "head", "power"],
            valve: ["size", "pressure"],
            tank: ["capacity", "pressure"],
            heatExchanger: ["duty", "area"],
            compressor: ["capacity", "pressure"],
          };

          nodes.forEach((node) => {
            const requiredSpecs = node.type ? criticalSpecs[node.type] : undefined;
            if (requiredSpecs) {
              const missingSpecs = requiredSpecs.filter((spec: string) => !node.data[spec]);
              if (missingSpecs.length > 0) {
                issues.push({
                  id: `missing-specs-${node.id}`,
                  ruleId: "missing-equipment-specs",
                  severity: "warning",
                  message: `Missing specifications: ${missingSpecs.join(", ")}`,
                  description: `${node.type} requires these specifications for proper documentation`,
                  elementId: node.id,
                  elementType: "node",
                  position: node.position,
                  suggestions: [
                    "Add missing specifications",
                    "Consult equipment datasheet",
                    "Review design basis",
                  ],
                });
              }
            }
          });

          return issues;
        },
      },

      // Connection Validation Rules
      {
        id: "disconnected-equipment",
        name: "Disconnected Equipment",
        description: "Equipment should be connected to the process",
        category: "connection",
        severity: "warning",
        enabled: true,
        validate: (nodes: Node[], edges: Edge[]) => {
          const issues: ValidationIssue[] = [];
          const connectedNodeIds = new Set<string>();

          edges.forEach((edge) => {
            connectedNodeIds.add(edge.source);
            connectedNodeIds.add(edge.target);
          });

          nodes.forEach((node) => {
            if (!connectedNodeIds.has(node.id) && node.type !== "pipe") {
              issues.push({
                id: `disconnected-${node.id}`,
                ruleId: "disconnected-equipment",
                severity: "warning",
                message: `${node.data.label || node.type} is not connected`,
                description: "Equipment should be connected to show process flow",
                elementId: node.id,
                elementType: "node",
                position: node.position,
                suggestions: [
                  "Connect to upstream equipment",
                  "Connect to downstream equipment",
                  "Remove if not part of process",
                ],
              });
            }
          });

          return issues;
        },
      },
      {
        id: "invalid-pump-connections",
        name: "Invalid Pump Connections",
        description: "Pumps should have inlet and outlet connections",
        category: "connection",
        severity: "error",
        enabled: true,
        validate: (nodes: Node[], edges: Edge[]) => {
          const issues: ValidationIssue[] = [];
          const pumpNodes = nodes.filter((n) => n.type === "pump");

          pumpNodes.forEach((pump) => {
            const incomingEdges = edges.filter((e) => e.target === pump.id);
            const outgoingEdges = edges.filter((e) => e.source === pump.id);

            if (incomingEdges.length === 0) {
              issues.push({
                id: `pump-no-inlet-${pump.id}`,
                ruleId: "invalid-pump-connections",
                severity: "error",
                message: `Pump ${pump.data.label} has no inlet connection`,
                description: "Pumps require an inlet connection for proper operation",
                elementId: pump.id,
                elementType: "node",
                position: pump.position,
                suggestions: [
                  "Connect suction line",
                  "Add inlet piping",
                  "Check process flow diagram",
                ],
              });
            }

            if (outgoingEdges.length === 0) {
              issues.push({
                id: `pump-no-outlet-${pump.id}`,
                ruleId: "invalid-pump-connections",
                severity: "error",
                message: `Pump ${pump.data.label} has no outlet connection`,
                description: "Pumps require an outlet connection for proper operation",
                elementId: pump.id,
                elementType: "node",
                position: pump.position,
                suggestions: [
                  "Connect discharge line",
                  "Add outlet piping",
                  "Check process flow diagram",
                ],
              });
            }
          });

          return issues;
        },
      },

      // Labeling Standards
      {
        id: "non-standard-tags",
        name: "Non-Standard Equipment Tags",
        description: "Equipment tags should follow ISA standards",
        category: "labeling",
        severity: "warning",
        enabled: true,
        validate: (nodes: Node[]) => {
          const issues: ValidationIssue[] = [];
          const standardPatterns: { [key: string]: RegExp } = {
            pump: /^P-\d{3,4}[A-Z]?$/i,
            valve: /^[A-Z]{1,3}V-\d{3,4}[A-Z]?$/i,
            tank: /^T-\d{3,4}[A-Z]?$/i,
            heatExchanger: /^[A-Z]-\d{3,4}[A-Z]?$/i,
            compressor: /^C-\d{3,4}[A-Z]?$/i,
          };

          nodes.forEach((node) => {
            const pattern = node.type ? standardPatterns[node.type] : undefined;
            if (pattern && node.data.label) {
              if (!pattern.test(node.data.label)) {
                issues.push({
                  id: `non-standard-tag-${node.id}`,
                  ruleId: "non-standard-tags",
                  severity: "warning",
                  message: `Non-standard tag format: ${node.data.label}`,
                  description: "Equipment tags should follow ISA naming conventions",
                  elementId: node.id,
                  elementType: "node",
                  position: node.position,
                  suggestions: [
                    `Use format like ${getStandardExample(node.type || 'pump')}`,
                    "Follow ISA-5.1 standard",
                    "Check company naming conventions",
                  ],
                });
              }
            }
          });

          return issues;
        },
      },

      // Safety Rules
      {
        id: "missing-safety-valves",
        name: "Missing Safety Valves",
        description: "Pressure vessels should have safety valves",
        category: "safety",
        severity: "error",
        enabled: true,
        validate: (nodes: Node[], edges: Edge[]) => {
          const issues: ValidationIssue[] = [];
          const pressureVessels = nodes.filter(
            (n) => n.type === "tank" && n.data.type === "pressure"
          );

          pressureVessels.forEach((vessel) => {
            const connectedEdges = edges.filter(
              (e) => e.source === vessel.id || e.target === vessel.id
            );

            const hasSafetyValve = connectedEdges.some((edge) => {
              const connectedNodeId = edge.source === vessel.id ? edge.target : edge.source;
              const connectedNode = nodes.find((n) => n.id === connectedNodeId);
              return (
                connectedNode?.data.type === "safety" ||
                connectedNode?.data.label?.toLowerCase().includes("psv")
              );
            });

            if (!hasSafetyValve) {
              issues.push({
                id: `missing-psv-${vessel.id}`,
                ruleId: "missing-safety-valves",
                severity: "error",
                message: `Pressure vessel ${vessel.data.label} missing safety valve`,
                description: "Pressure vessels require safety valves for overpressure protection",
                elementId: vessel.id,
                elementType: "node",
                position: vessel.position,
                suggestions: [
                  "Add pressure safety valve (PSV)",
                  "Connect relief system",
                  "Review safety requirements",
                ],
              });
            }
          });

          return issues;
        },
      },
    ],
    []
  );

  // Get standard tag example for equipment type
  const getStandardExample = (equipmentType: string): string => {
    const examples: { [key: string]: string } = {
      pump: "P-101",
      valve: "V-101",
      tank: "T-101",
      heatExchanger: "E-101",
      compressor: "C-101",
    };
    return examples[equipmentType] || "X-101";
  };

  // Run validation
  const runValidation = useCallback(() => {
    setIsValidating(true);

    setTimeout(() => {
      const allIssues: ValidationIssue[] = [];

      validationRules
        .filter((rule) => rule.enabled)
        .forEach((rule) => {
          const ruleIssues = rule.validate(nodes, edges);
          allIssues.push(...ruleIssues);
        });

      setIssues(allIssues);
      setIsValidating(false);
    }, 100);
  }, [nodes, edges, validationRules]);

  // Auto-validate when nodes or edges change
  useEffect(() => {
    if (autoValidate) {
      runValidation();
    }
  }, [nodes, edges, autoValidate, runValidation]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (showOnlyErrors && issue.severity !== "error") return false;
      if (filterCategory !== "all") {
        const rule = validationRules.find((r) => r.id === issue.ruleId);
        if (rule?.category !== filterCategory) return false;
      }
      return true;
    });
  }, [issues, showOnlyErrors, filterCategory, validationRules]);

  // Auto-fix issue
  const autoFixIssue = useCallback(
    (issue: ValidationIssue) => {
      switch (issue.ruleId) {
        case "missing-equipment-tags":
          const node = nodes.find((n) => n.id === issue.elementId);
          if (node) {
            const nodeType = node.type;
            const existingTags = nodes
              .map((n) => n.data.label)
              .filter(Boolean)
              .map((tag) => tag.toUpperCase());

            let newTag = "";
            let counter = 101;
            do {
              newTag = `${nodeType?.charAt(0)?.toUpperCase() || 'S'}-${counter}`;
              counter++;
            } while (existingTags.includes(newTag));

            updateNode(issue.elementId, { ...node.data, label: newTag });
          }
          break;

        case "duplicate-equipment-tags":
          const duplicateNode = nodes.find((n) => n.id === issue.elementId);
          if (duplicateNode) {
            const baseTag = duplicateNode.data.label || "X-101";
            const baseName = baseTag.split("-")[0];
            const existingTags = nodes
              .map((n) => n.data.label)
              .filter(Boolean)
              .map((tag) => tag.toUpperCase());

            let newTag = "";
            let counter = 101;
            do {
              newTag = `${baseName}-${counter}`;
              counter++;
            } while (existingTags.includes(newTag));

            updateNode(issue.elementId, { ...duplicateNode.data, label: newTag });
          }
          break;
      }

      // Re-run validation after fix
      setTimeout(runValidation, 100);
    },
    [nodes, updateNode, runValidation]
  );

  // Navigate to issue element
  const navigateToIssue = useCallback((issue: ValidationIssue) => {
    if (issue.position) {
      // Scroll to element position (implementation depends on your scroll mechanism)
      // TODO: Implement navigation to issue position
      // console.log("Navigate to:", issue.position);
    }
    // _setSelectedIssue(issue); // TODO: Implement if needed
  }, []);

  // Export validation report
  const exportReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        errors: issues.filter((i) => i.severity === "error").length,
        warnings: issues.filter((i) => i.severity === "warning").length,
        info: issues.filter((i) => i.severity === "info").length,
      },
      issues: issues.map((issue) => ({
        ...issue,
        ruleName: validationRules.find((r) => r.id === issue.ruleId)?.name,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "validation-report.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [issues, validationRules]);

  if (!visible) return null;

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Validation</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={runValidation}
              disabled={isValidating}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Run validation"
            >
              <RefreshCcw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
            </button>
            <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4 rounded bg-gray-50 p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-red-600">
                {issues.filter((i) => i.severity === "error").length}
              </div>
              <div className="text-xs text-gray-500">Errors</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {issues.filter((i) => i.severity === "warning").length}
              </div>
              <div className="text-xs text-gray-500">Warnings</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {issues.filter((i) => i.severity === "info").length}
              </div>
              <div className="text-xs text-gray-500">Info</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={autoValidate}
                onChange={(e) => setAutoValidate(e.target.checked)}
                className="rounded"
              />
              Auto-validate
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showOnlyErrors}
                onChange={(e) => setShowOnlyErrors(e.target.checked)}
                className="rounded"
              />
              Errors only
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={highlightIssues}
                onChange={(e) => setHighlightIssues(e.target.checked)}
                className="rounded"
              />
              Highlight
            </label>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="equipment">Equipment</option>
              <option value="connection">Connection</option>
              <option value="labeling">Labeling</option>
              <option value="standard">Standard</option>
              <option value="safety">Safety</option>
            </select>
            <button
              onClick={exportReport}
              disabled={issues.length === 0}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {filteredIssues.length === 0 ? (
            <div className="py-4 text-center">
              {issues.length === 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p className="text-sm text-gray-500">No validation issues found</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No issues match current filters</p>
              )}
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`cursor-pointer rounded border-l-4 p-2 hover:bg-gray-50 ${
                  issue.severity === "error"
                    ? "border-red-500 bg-red-50"
                    : issue.severity === "warning"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-blue-500 bg-blue-50"
                }`}
                onClick={() => navigateToIssue(issue)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start gap-2">
                    {issue.severity === "error" ? (
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                    ) : (
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                      {issue.description && (
                        <p className="mt-1 text-xs text-gray-600">{issue.description}</p>
                      )}
                      {issue.suggestions && issue.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700">Suggestions:</p>
                          <ul className="ml-2 text-xs text-gray-600">
                            {issue.suggestions.map((suggestion, index) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    {issue.autoFixAvailable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          autoFixIssue(issue);
                        }}
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                        title="Auto-fix this issue"
                      >
                        Fix
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
