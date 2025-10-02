/**
 * Preview Step Component
 * Placeholder for file preview functionality (to be implemented in Task 178.4)
 */

'use client';

import React from 'react';

export interface IPreviewStepProps {
  files?: unknown[];
}

export const PreviewStep: React.FC<IPreviewStepProps> = ({ files: _files }) => {
  return (
    <div className="space-y-4">
      <div className="p-8 border border-gray-300 dark:border-gray-600 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Preview component will be implemented in Task 178.4
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Features: PDF rendering, image preview, metadata display
        </p>
      </div>
    </div>
  );
};

export default PreviewStep;
