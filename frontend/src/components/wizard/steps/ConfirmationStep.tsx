/**
 * Confirmation Step Component
 * Final review step before executing import/export operation
 */

'use client';

import React from 'react';
import { useWizardStore, OperationType } from '@/stores/wizardStore';

export interface IConfirmationStepProps {
  onConfirm?: () => void;
}

export const ConfirmationStep: React.FC<IConfirmationStepProps> = ({ onConfirm: _onConfirm }) => {
  const {
    operationType,
    uploadedFiles,
    fieldMappings,
    layerMappings,
    conflicts,
    globalConflictStrategy,
  } = useWizardStore();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Ready to {operationType === OperationType.IMPORT ? 'Import' : 'Export'}
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Please review the configuration below before proceeding.
        </p>
      </div>

      <div className="space-y-4">
        {/* Files Summary */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Files</h5>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {uploadedFiles.length} file(s) selected
          </p>
        </div>

        {/* Mappings Summary */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Mappings</h5>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>{fieldMappings.length} field mapping(s)</p>
            <p>{layerMappings.length} layer mapping(s)</p>
          </div>
        </div>

        {/* Conflicts Summary */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Conflicts</h5>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>{conflicts.length} conflict(s) detected</p>
            <p>Strategy: {globalConflictStrategy}</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          Click <strong>Complete</strong> to execute the{' '}
          {operationType === OperationType.IMPORT ? 'import' : 'export'} operation.
        </p>
      </div>
    </div>
  );
};

export default ConfirmationStep;
