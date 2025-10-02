/**
 * Import/Export Wizard Container Component
 * Main orchestrator for multi-step import/export workflow with form validation
 *
 * Features:
 * - Multi-step wizard with progress tracking
 * - React Hook Form integration with Zod validation
 * - Step navigation with validation gates
 * - Keyboard navigation support
 * - Accessible ARIA attributes
 * - Responsive design with Tailwind CSS
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizardStore, WizardStep, OperationType } from '@/stores/wizardStore';
import { ChevronLeft, ChevronRight, X, FileUp, FileDown } from 'lucide-react';

/**
 * Wizard form schema
 */
const wizardSchema = z.object({
  operationType: z.nativeEnum(OperationType),
  files: z.array(z.any()).min(1, 'At least one file is required'),
  mappings: z.object({
    fields: z.array(z.any()).optional(),
    layers: z.array(z.any()).optional(),
  }),
  conflicts: z.array(z.any()).optional(),
});

type WizardFormData = z.infer<typeof wizardSchema>;

/**
 * Step configuration
 */
interface IStepConfig {
  id: WizardStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEP_CONFIGS: IStepConfig[] = [
  {
    id: WizardStep.FILE_UPLOAD,
    title: 'Upload Files',
    description: 'Select files to import or configure export',
    icon: <FileUp className="w-5 h-5" />,
  },
  {
    id: WizardStep.PREVIEW,
    title: 'Preview',
    description: 'Review file contents and metadata',
    icon: <FileDown className="w-5 h-5" />,
  },
  {
    id: WizardStep.MAPPING,
    title: 'Configure Mapping',
    description: 'Map fields and layers',
    icon: <FileUp className="w-5 h-5" />,
  },
  {
    id: WizardStep.CONFLICT_RESOLUTION,
    title: 'Resolve Conflicts',
    description: 'Handle conflicts and duplicates',
    icon: <FileDown className="w-5 h-5" />,
  },
  {
    id: WizardStep.CONFIRMATION,
    title: 'Confirm',
    description: 'Review and execute operation',
    icon: <FileUp className="w-5 h-5" />,
  },
];

/**
 * Props
 */
export interface IImportExportWizardProps {
  onComplete?: (data: WizardFormData) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Import/Export Wizard Component
 */
export const ImportExportWizard: React.FC<IImportExportWizardProps> = ({
  onComplete,
  onCancel,
  className = '',
}) => {
  // Wizard state
  const {
    currentStep,
    operationType,
    progress,
    nextStep,
    previousStep,
    resetWizard,
    canProceedToNextStep,
  } = useWizardStore();

  // Form management
  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    mode: 'onChange',
    defaultValues: {
      operationType: OperationType.IMPORT,
      files: [],
      mappings: {
        fields: [],
        layers: [],
      },
      conflicts: [],
    },
  });

  const { handleSubmit, formState } = methods;

  // Get current step config
  const currentStepConfig = STEP_CONFIGS.find((s) => s.id === currentStep);
  const currentStepIndex = STEP_CONFIGS.findIndex((s) => s.id === currentStep);

  // Handle next step
  const handleNext = useCallback(() => {
    if (canProceedToNextStep()) {
      nextStep();
    }
  }, [canProceedToNextStep, nextStep]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    previousStep();
  }, [previousStep]);

  // Handle form submission
  const onSubmit = useCallback(
    (data: WizardFormData) => {
      if (currentStep === WizardStep.CONFIRMATION) {
        onComplete?.(data);
        resetWizard();
      } else {
        handleNext();
      }
    },
    [currentStep, onComplete, resetWizard, handleNext]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    resetWizard();
    onCancel?.();
  }, [resetWizard, onCancel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        if (canProceedToNextStep()) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCancel, handleNext, canProceedToNextStep]);

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}
      role="dialog"
      aria-labelledby="wizard-title"
      aria-describedby="wizard-description"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {operationType === OperationType.IMPORT ? (
            <FileDown className="w-6 h-6 text-blue-600" aria-hidden="true" />
          ) : (
            <FileUp className="w-6 h-6 text-green-600" aria-hidden="true" />
          )}
          <div>
            <h2
              id="wizard-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {operationType === OperationType.IMPORT ? 'Import' : 'Export'} Wizard
            </h2>
            <p id="wizard-description" className="text-sm text-gray-500 dark:text-gray-400">
              {currentStepConfig?.description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close wizard"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {currentStepIndex + 1} of {STEP_CONFIGS.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(((currentStepIndex) / (STEP_CONFIGS.length - 1)) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentStepIndex) / (STEP_CONFIGS.length - 1)) * 100}%`,
            }}
            role="progressbar"
            aria-valuenow={currentStepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={STEP_CONFIGS.length}
          />
        </div>

        {/* Breadcrumbs */}
        <nav aria-label="Wizard steps" className="mt-4">
          <ol className="flex items-center space-x-2">
            {STEP_CONFIGS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <li
                  key={step.id}
                  className={`flex items-center ${index > 0 ? 'flex-1' : ''}`}
                >
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" aria-hidden="true" />
                  )}
                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : isCompleted
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {step.icon}
                    <span className="text-sm font-medium hidden md:inline">
                      {step.title}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Form */}
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {currentStepConfig?.title}
              </h3>

              {/* Step-specific content will be rendered here */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  Step content component will be rendered here for: {currentStep}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  This is a placeholder. Individual step components (FileUploadStep,
                  PreviewStep, etc.) will be implemented in subsequent tasks.
                </p>
              </div>

              {/* Form validation errors */}
              {formState.errors && Object.keys(formState.errors).length > 0 && (
                <div
                  className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  role="alert"
                >
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                    Please fix the following errors:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {Object.entries(formState.errors).map(([key, error]) => (
                      <li key={key}>
                        {key}: {error?.message as string}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={!progress.canGoBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!canProceedToNextStep()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  aria-label={
                    currentStep === WizardStep.CONFIRMATION ? 'Complete wizard' : 'Next step'
                  }
                >
                  <span>
                    {currentStep === WizardStep.CONFIRMATION ? 'Complete' : 'Next'}
                  </span>
                  {currentStep !== WizardStep.CONFIRMATION && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>

      {/* Keyboard Shortcuts Helper */}
      <div className="sr-only" role="region" aria-label="Keyboard shortcuts">
        Press Escape to cancel, Ctrl+Enter to proceed to next step
      </div>
    </div>
  );
};

export default ImportExportWizard;
