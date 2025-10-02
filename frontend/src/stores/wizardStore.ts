/**
 * Import/Export Wizard State Management
 * Zustand store for managing multi-step wizard state, file uploads, validation, and presets
 *
 * Features:
 * - Multi-step wizard flow with navigation
 * - File upload state and metadata tracking
 * - Real-time validation results
 * - Field/layer mapping configuration
 * - Conflict resolution state
 * - Preset management with localStorage persistence
 * - Rollback and history support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Wizard step types
 */
export enum WizardStep {
  FILE_UPLOAD = 'file-upload',
  PREVIEW = 'preview',
  MAPPING = 'mapping',
  CONFLICT_RESOLUTION = 'conflict-resolution',
  CONFIRMATION = 'confirmation',
}

/**
 * Import/export operation type
 */
export enum OperationType {
  IMPORT = 'import',
  EXPORT = 'export',
}

/**
 * Supported file formats
 */
export enum FileFormat {
  DXF = 'dxf',
  DWG = 'dwg',
  PDF = 'pdf',
  SVG = 'svg',
  PNG = 'png',
  JSON = 'json',
}

/**
 * Upload file metadata
 */
export interface IUploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  format: FileFormat;
  file: File;
  uploadedAt: Date;
  validated: boolean;
  validationErrors: string[];
  preview?: string; // Base64 or URL
}

/**
 * Validation result
 */
export interface IValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileId: string;
  timestamp: Date;
}

/**
 * Field mapping configuration
 */
export interface IFieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  defaultValue?: string;
}

/**
 * Layer mapping configuration
 */
export interface ILayerMapping {
  sourceLayer: string;
  targetLayer: string;
  visible: boolean;
  color?: string;
  lineType?: string;
}

/**
 * Conflict resolution strategy
 */
export enum ConflictStrategy {
  SKIP = 'skip',
  OVERWRITE = 'overwrite',
  MERGE = 'merge',
  RENAME = 'rename',
  ASK = 'ask',
}

/**
 * Conflict item
 */
export interface IConflict {
  id: string;
  type: 'duplicate' | 'validation' | 'compatibility';
  severity: 'error' | 'warning';
  description: string;
  sourceValue: unknown;
  targetValue?: unknown;
  resolution?: ConflictStrategy;
  resolvedValue?: unknown;
}

/**
 * Import/export preset
 */
export interface IWizardPreset {
  id: string;
  name: string;
  description?: string;
  operationType: OperationType;
  fileFormat: FileFormat;
  fieldMappings: IFieldMapping[];
  layerMappings: ILayerMapping[];
  conflictStrategy: ConflictStrategy;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wizard progress tracking
 */
export interface IWizardProgress {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  canProceed: boolean;
  canGoBack: boolean;
  totalSteps: number;
  currentStepIndex: number;
}

/**
 * Wizard state interface
 */
export interface IWizardState {
  // Operation configuration
  operationType: OperationType;
  selectedFormat: FileFormat | null;

  // Step navigation
  currentStep: WizardStep;
  visitedSteps: WizardStep[];

  // File upload state
  uploadedFiles: IUploadedFile[];
  validationResults: Map<string, IValidationResult>;

  // Mapping configuration
  fieldMappings: IFieldMapping[];
  layerMappings: ILayerMapping[];

  // Conflict resolution
  conflicts: IConflict[];
  globalConflictStrategy: ConflictStrategy;

  // Preset management
  presets: IWizardPreset[];
  activePresetId: string | null;

  // Progress tracking
  progress: IWizardProgress;

  // Actions
  setOperationType: (type: OperationType) => void;
  setFileFormat: (format: FileFormat) => void;

  // Step navigation actions
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetWizard: () => void;

  // File upload actions
  addFiles: (files: IUploadedFile[]) => void;
  removeFile: (fileId: string) => void;
  updateFileValidation: (fileId: string, result: IValidationResult) => void;
  clearFiles: () => void;

  // Mapping actions
  addFieldMapping: (mapping: IFieldMapping) => void;
  updateFieldMapping: (sourceField: string, mapping: Partial<IFieldMapping>) => void;
  removeFieldMapping: (sourceField: string) => void;
  addLayerMapping: (mapping: ILayerMapping) => void;
  updateLayerMapping: (sourceLayer: string, mapping: Partial<ILayerMapping>) => void;
  removeLayerMapping: (sourceLayer: string) => void;
  clearMappings: () => void;

  // Conflict resolution actions
  addConflict: (conflict: IConflict) => void;
  resolveConflict: (conflictId: string, resolution: ConflictStrategy, resolvedValue?: unknown) => void;
  setGlobalConflictStrategy: (strategy: ConflictStrategy) => void;
  clearConflicts: () => void;

  // Preset actions
  savePreset: (preset: Omit<IWizardPreset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<IWizardPreset>) => void;

  // Utility actions
  canProceedToNextStep: () => boolean;
  getStepProgress: () => number;
}

/**
 * Step order for navigation
 */
const STEP_ORDER: WizardStep[] = [
  WizardStep.FILE_UPLOAD,
  WizardStep.PREVIEW,
  WizardStep.MAPPING,
  WizardStep.CONFLICT_RESOLUTION,
  WizardStep.CONFIRMATION,
];

/**
 * Initial progress state
 */
const initialProgress: IWizardProgress = {
  currentStep: WizardStep.FILE_UPLOAD,
  completedSteps: [],
  canProceed: false,
  canGoBack: false,
  totalSteps: STEP_ORDER.length,
  currentStepIndex: 0,
};

/**
 * Create wizard store with persistence for presets
 */
export const useWizardStore = create<IWizardState>()(
  persist(
    (set, get) => ({
      // Initial state
      operationType: OperationType.IMPORT,
      selectedFormat: null,
      currentStep: WizardStep.FILE_UPLOAD,
      visitedSteps: [WizardStep.FILE_UPLOAD],
      uploadedFiles: [],
      validationResults: new Map(),
      fieldMappings: [],
      layerMappings: [],
      conflicts: [],
      globalConflictStrategy: ConflictStrategy.ASK,
      presets: [],
      activePresetId: null,
      progress: initialProgress,

      // Operation type actions
      setOperationType: (type) => set({ operationType: type }),
      setFileFormat: (format) => set({ selectedFormat: format }),

      // Step navigation actions
      goToStep: (step) => {
        const state = get();
        const stepIndex = STEP_ORDER.indexOf(step);
        const currentIndex = STEP_ORDER.indexOf(state.currentStep);

        // Only allow visiting steps that have been visited before or the next step
        if (stepIndex <= currentIndex + 1 || state.visitedSteps.includes(step)) {
          set((s) => ({
            currentStep: step,
            visitedSteps: s.visitedSteps.includes(step)
              ? s.visitedSteps
              : [...s.visitedSteps, step],
            progress: {
              ...s.progress,
              currentStep: step,
              currentStepIndex: stepIndex,
              canGoBack: stepIndex > 0,
              canProceed: get().canProceedToNextStep(),
            },
          }));
        }
      },

      nextStep: () => {
        const state = get();
        const currentIndex = STEP_ORDER.indexOf(state.currentStep);
        if (currentIndex < STEP_ORDER.length - 1 && state.progress.canProceed) {
          const nextStep = STEP_ORDER[currentIndex + 1];
          get().goToStep(nextStep);
        }
      },

      previousStep: () => {
        const state = get();
        const currentIndex = STEP_ORDER.indexOf(state.currentStep);
        if (currentIndex > 0) {
          const prevStep = STEP_ORDER[currentIndex - 1];
          get().goToStep(prevStep);
        }
      },

      resetWizard: () =>
        set({
          currentStep: WizardStep.FILE_UPLOAD,
          visitedSteps: [WizardStep.FILE_UPLOAD],
          uploadedFiles: [],
          validationResults: new Map(),
          fieldMappings: [],
          layerMappings: [],
          conflicts: [],
          activePresetId: null,
          progress: initialProgress,
        }),

      // File upload actions
      addFiles: (files) =>
        set((state) => {
          const newFiles = [...state.uploadedFiles, ...files];
          return {
            uploadedFiles: newFiles,
            progress: {
              ...state.progress,
              canProceed: newFiles.length > 0 && newFiles.every((f) => f.validated),
            },
          };
        }),

      removeFile: (fileId) =>
        set((state) => {
          const newFiles = state.uploadedFiles.filter((f) => f.id !== fileId);
          const newValidation = new Map(state.validationResults);
          newValidation.delete(fileId);

          return {
            uploadedFiles: newFiles,
            validationResults: newValidation,
            progress: {
              ...state.progress,
              canProceed: newFiles.length > 0 && newFiles.every((f) => f.validated),
            },
          };
        }),

      updateFileValidation: (fileId, result) =>
        set((state) => {
          const newValidation = new Map(state.validationResults);
          newValidation.set(fileId, result);

          const updatedFiles = state.uploadedFiles.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  validated: result.isValid,
                  validationErrors: result.errors,
                }
              : f
          );

          return {
            uploadedFiles: updatedFiles,
            validationResults: newValidation,
            progress: {
              ...state.progress,
              canProceed: updatedFiles.length > 0 && updatedFiles.every((f) => f.validated),
            },
          };
        }),

      clearFiles: () =>
        set({
          uploadedFiles: [],
          validationResults: new Map(),
        }),

      // Mapping actions
      addFieldMapping: (mapping) =>
        set((state) => ({
          fieldMappings: [...state.fieldMappings, mapping],
        })),

      updateFieldMapping: (sourceField, mapping) =>
        set((state) => ({
          fieldMappings: state.fieldMappings.map((m) =>
            m.sourceField === sourceField ? { ...m, ...mapping } : m
          ),
        })),

      removeFieldMapping: (sourceField) =>
        set((state) => ({
          fieldMappings: state.fieldMappings.filter((m) => m.sourceField !== sourceField),
        })),

      addLayerMapping: (mapping) =>
        set((state) => ({
          layerMappings: [...state.layerMappings, mapping],
        })),

      updateLayerMapping: (sourceLayer, mapping) =>
        set((state) => ({
          layerMappings: state.layerMappings.map((m) =>
            m.sourceLayer === sourceLayer ? { ...m, ...mapping } : m
          ),
        })),

      removeLayerMapping: (sourceLayer) =>
        set((state) => ({
          layerMappings: state.layerMappings.filter((m) => m.sourceLayer !== sourceLayer),
        })),

      clearMappings: () =>
        set({
          fieldMappings: [],
          layerMappings: [],
        }),

      // Conflict resolution actions
      addConflict: (conflict) =>
        set((state) => ({
          conflicts: [...state.conflicts, conflict],
        })),

      resolveConflict: (conflictId, resolution, resolvedValue) =>
        set((state) => ({
          conflicts: state.conflicts.map((c) =>
            c.id === conflictId ? { ...c, resolution, resolvedValue } : c
          ),
        })),

      setGlobalConflictStrategy: (strategy) =>
        set({ globalConflictStrategy: strategy }),

      clearConflicts: () => set({ conflicts: [] }),

      // Preset actions
      savePreset: (preset) =>
        set((state) => {
          const newPreset: IWizardPreset = {
            ...preset,
            id: `preset-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            presets: [...state.presets, newPreset],
            activePresetId: newPreset.id,
          };
        }),

      loadPreset: (presetId) =>
        set((state) => {
          const preset = state.presets.find((p) => p.id === presetId);
          if (!preset) return state;

          return {
            operationType: preset.operationType,
            selectedFormat: preset.fileFormat,
            fieldMappings: preset.fieldMappings,
            layerMappings: preset.layerMappings,
            globalConflictStrategy: preset.conflictStrategy,
            activePresetId: presetId,
          };
        }),

      deletePreset: (presetId) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== presetId),
          activePresetId: state.activePresetId === presetId ? null : state.activePresetId,
        })),

      updatePreset: (presetId, updates) =>
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === presetId
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          ),
        })),

      // Utility actions
      canProceedToNextStep: () => {
        const state = get();

        switch (state.currentStep) {
          case WizardStep.FILE_UPLOAD:
            return (
              state.uploadedFiles.length > 0 &&
              state.uploadedFiles.every((f) => f.validated && f.validationErrors.length === 0)
            );

          case WizardStep.PREVIEW:
            return true; // Preview is informational, always can proceed

          case WizardStep.MAPPING:
            // At least some mappings configured or using defaults
            return state.fieldMappings.length > 0 || state.layerMappings.length > 0;

          case WizardStep.CONFLICT_RESOLUTION:
            // All conflicts resolved or global strategy set
            return (
              state.conflicts.every((c) => c.resolution !== undefined) ||
              state.globalConflictStrategy !== ConflictStrategy.ASK
            );

          case WizardStep.CONFIRMATION:
            return true; // Confirmation is final step

          default:
            return false;
        }
      },

      getStepProgress: () => {
        const state = get();
        const completedCount = state.visitedSteps.length - 1; // Exclude current
        return Math.round((completedCount / (STEP_ORDER.length - 1)) * 100);
      },
    }),
    {
      name: 'ergoplanner-wizard-presets',
      storage: createJSONStorage(() => localStorage),
      // Only persist presets, not wizard session state
      partialize: (state) => ({
        presets: state.presets,
      }),
    }
  )
);

export default useWizardStore;
