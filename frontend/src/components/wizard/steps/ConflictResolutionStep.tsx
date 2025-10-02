/**
 * Conflict Resolution Step Component
 * Placeholder for conflict resolution functionality (to be implemented in Task 178.5)
 */

'use client';

import React from 'react';

export interface IConflictResolutionStepProps {
  conflicts?: unknown[];
  onResolve?: (conflictId: string, resolution: unknown) => void;
}

export const ConflictResolutionStep: React.FC<IConflictResolutionStepProps> = ({
  conflicts: _conflicts,
  onResolve: _onResolve,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-8 border border-gray-300 dark:border-gray-600 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Conflict resolution component will be implemented in Task 178.5
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Features: Side-by-side comparison, resolution strategies, batch actions
        </p>
      </div>
    </div>
  );
};

export default ConflictResolutionStep;
