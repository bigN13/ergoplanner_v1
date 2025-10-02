/**
 * Conflict Resolution Step Component
 * Side-by-side comparison and conflict resolution with merge strategies
 *
 * Features:
 * - Side-by-side diff view
 * - Conflict resolution strategies (skip, overwrite, merge, rename)
 * - Global strategy application
 * - Individual conflict resolution
 * - Color-coded severity levels
 * - Batch resolution actions
 */

'use client';

import React, { useCallback } from 'react';
import Select from 'react-select';
import {
  useWizardStore,
  ConflictStrategy,
  IConflict,
} from '@/stores/wizardStore';
import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

/**
 * Strategy option type
 */
interface IStrategyOption {
  value: ConflictStrategy;
  label: string;
  description: string;
}

/**
 * Conflict resolution strategies
 */
const STRATEGY_OPTIONS: IStrategyOption[] = [
  {
    value: ConflictStrategy.SKIP,
    label: 'Skip',
    description: 'Skip conflicting items, keep existing',
  },
  {
    value: ConflictStrategy.OVERWRITE,
    label: 'Overwrite',
    description: 'Replace existing with new',
  },
  {
    value: ConflictStrategy.MERGE,
    label: 'Merge',
    description: 'Combine both values',
  },
  {
    value: ConflictStrategy.RENAME,
    label: 'Rename',
    description: 'Create with new name',
  },
  {
    value: ConflictStrategy.ASK,
    label: 'Ask',
    description: 'Decide for each conflict',
  },
];

/**
 * Get severity icon
 */
function getSeverityIcon(severity: IConflict['severity']): React.ReactNode {
  if (severity === 'error') {
    return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
  }
  return <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
}

/**
 * Get severity color
 */
function getSeverityColor(severity: IConflict['severity']): string {
  if (severity === 'error') {
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }
  return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
}

/**
 * Conflict resolution step props
 */
export interface IConflictResolutionStepProps {
  conflicts?: unknown[];
  onResolve?: (conflictId: string, resolution: unknown) => void;
}

/**
 * Conflict Resolution Step Component
 */
export const ConflictResolutionStep: React.FC<IConflictResolutionStepProps> = ({
  conflicts: _conflicts,
  onResolve: _onResolve,
}) => {
  const {
    conflicts,
    globalConflictStrategy,
    setGlobalConflictStrategy,
    resolveConflict,
  } = useWizardStore();

  // Handle global strategy change
  const handleGlobalStrategyChange = useCallback(
    (option: IStrategyOption | null) => {
      if (option) {
        setGlobalConflictStrategy(option.value);
      }
    },
    [setGlobalConflictStrategy]
  );

  // Handle individual conflict resolution
  const handleResolveConflict = useCallback(
    (conflictId: string, strategy: ConflictStrategy) => {
      resolveConflict(conflictId, strategy);
    },
    [resolveConflict]
  );

  // Count resolved vs unresolved
  const resolvedCount = conflicts.filter((c) => c.resolution !== undefined).length;
  const unresolvedCount = conflicts.length - resolvedCount;

  if (conflicts.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Conflicts Detected
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          All files can be imported without conflicts. Proceed to the next step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Conflict Summary
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {unresolvedCount} conflict(s) need resolution. {resolvedCount} resolved.
            </p>
          </div>
        </div>
      </div>

      {/* Global Strategy */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Global Resolution Strategy
        </h3>
        <div className="max-w-md">
          <Select
            options={STRATEGY_OPTIONS}
            value={STRATEGY_OPTIONS.find((opt) => opt.value === globalConflictStrategy)}
            onChange={handleGlobalStrategyChange}
            placeholder="Select strategy..."
            classNamePrefix="react-select"
            formatOptionLabel={(option) => (
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            )}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This strategy will be applied to all unresolved conflicts
          </p>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Detected Conflicts
        </h3>

        <div className="space-y-3">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
            >
              {/* Conflict Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  {getSeverityIcon(conflict.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {conflict.type === 'duplicate'
                          ? 'Duplicate Item'
                          : conflict.type === 'validation'
                            ? 'Validation Error'
                            : 'Compatibility Issue'}
                      </h4>
                      {conflict.resolution && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {conflict.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-side Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                {/* Source Value */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Source (New)
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white font-mono">
                    {JSON.stringify(conflict.sourceValue, null, 2)}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>

                {/* Target Value */}
                {conflict.targetValue !== undefined && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Target (Existing)
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white font-mono">
                      {JSON.stringify(conflict.targetValue, null, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Options */}
              {!conflict.resolution && (
                <div className="flex items-center space-x-2">
                  {STRATEGY_OPTIONS.filter((opt) => opt.value !== ConflictStrategy.ASK).map(
                    (strategy) => (
                      <button
                        key={strategy.value}
                        type="button"
                        onClick={() => handleResolveConflict(conflict.id, strategy.value)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {strategy.label}
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Resolved Strategy */}
              {conflict.resolution && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Resolution:{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {STRATEGY_OPTIONS.find((opt) => opt.value === conflict.resolution)?.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Resolution Progress
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {resolvedCount} / {conflicts.length} resolved (
            {Math.round((resolvedCount / conflicts.length) * 100)}%)
          </span>
        </div>
        <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{
              width: `${(resolvedCount / conflicts.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionStep;
