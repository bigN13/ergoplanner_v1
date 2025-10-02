/**
 * File Upload Step Component
 * Placeholder for file upload functionality (to be implemented in Task 178.3)
 */

'use client';

import React from 'react';

export interface IFileUploadStepProps {
  onFilesSelected?: (files: File[]) => void;
}

export const FileUploadStep: React.FC<IFileUploadStepProps> = ({ onFilesSelected: _onFilesSelected }) => {
  return (
    <div className="space-y-4">
      <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
        <p className="text-gray-500 dark:text-gray-400">
          File upload component will be implemented in Task 178.3
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Features: Drag & drop, batch selection, format validation
        </p>
      </div>
    </div>
  );
};

export default FileUploadStep;
