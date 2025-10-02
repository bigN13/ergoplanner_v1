/**
 * Mapping Step Component
 * Placeholder for field/layer mapping functionality (to be implemented in Task 178.5)
 */

'use client';

import React from 'react';

export interface IMappingStepProps {
  onMappingChange?: (mappings: unknown) => void;
}

export const MappingStep: React.FC<IMappingStepProps> = ({ onMappingChange: _onMappingChange }) => {
  return (
    <div className="space-y-4">
      <div className="p-8 border border-gray-300 dark:border-gray-600 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Mapping configuration component will be implemented in Task 178.5
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Features: Field mapping, layer mapping, preset management
        </p>
      </div>
    </div>
  );
};

export default MappingStep;
