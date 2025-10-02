/**
 * Preview Step Component
 * Multi-format file preview with zoom, pan, and metadata display
 *
 * Features:
 * - Image preview with zoom/pan controls
 * - PDF page navigation (placeholder - full implementation requires server-side rendering)
 * - JSON data preview with syntax highlighting
 * - DXF metadata preview
 * - File metadata display
 * - Validation issue overlay
 * - Responsive layout
 */

'use client';

import React, { useState, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useWizardStore, FileFormat } from '@/stores/wizardStore';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  File as FileIcon,
} from 'lucide-react';

/**
 * Preview step props
 */
export interface IPreviewStepProps {
  files?: unknown[];
}

/**
 * Image Preview Component
 */
const ImagePreview: React.FC<{ file: File }> = ({ file }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => zoomIn()}
                className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                type="button"
                onClick={() => zoomOut()}
                className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                aria-label="Reset zoom"
              >
                <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Image */}
            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass="w-full h-full flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain"
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

/**
 * PDF Preview Component (Placeholder)
 */
const PDFPreview: React.FC<{ file: File }> = ({ file }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1; // Placeholder - would come from PDF parsing

  return (
    <div className="space-y-4">
      <div className="h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" />
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              PDF Preview
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {file.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Full PDF rendering requires server-side processing
            </p>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center space-x-4">
        <button
          type="button"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/**
 * JSON Preview Component
 */
const JSONPreview: React.FC<{ file: File }> = ({ file }) => {
  const [jsonContent, setJsonContent] = useState<string>('');

  React.useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        setJsonContent(JSON.stringify(parsed, null, 2));
      } catch {
        setJsonContent('Invalid JSON format');
      }
    };
    reader.readAsText(file);
  }, [file]);

  return (
    <div className="h-[500px] bg-gray-900 dark:bg-gray-950 rounded-lg overflow-auto">
      <pre className="p-4 text-sm text-green-400 font-mono">
        <code>{jsonContent}</code>
      </pre>
    </div>
  );
};

/**
 * DXF/DWG Preview Component (Placeholder)
 */
const CADPreview: React.FC<{ file: File; format: FileFormat }> = ({ file, format }) => {
  return (
    <div className="h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center space-y-4">
        <RotateCw className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto" />
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {format.toUpperCase()} File Preview
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {file.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            CAD file rendering requires specialized parser
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            File will be validated during import
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Generic File Preview Component
 */
const GenericFilePreview: React.FC<{ file: File }> = ({ file }) => {
  return (
    <div className="h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center space-y-4">
        <FileIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" />
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            File Preview Not Available
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {file.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            This file type does not support preview
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Preview Step Component
 */
export const PreviewStep: React.FC<IPreviewStepProps> = ({ files: _files }) => {
  const { uploadedFiles } = useWizardStore();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const selectedFile = useMemo(
    () => uploadedFiles[selectedFileIndex],
    [uploadedFiles, selectedFileIndex]
  );

  // Render appropriate preview based on file format
  const renderPreview = () => {
    if (!selectedFile) {
      return (
        <div className="h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No file selected</p>
        </div>
      );
    }

    switch (selectedFile.format) {
      case FileFormat.PNG:
      case FileFormat.SVG:
        return <ImagePreview file={selectedFile.file} />;

      case FileFormat.PDF:
        return <PDFPreview file={selectedFile.file} />;

      case FileFormat.JSON:
        return <JSONPreview file={selectedFile.file} />;

      case FileFormat.DXF:
      case FileFormat.DWG:
        return <CADPreview file={selectedFile.file} format={selectedFile.format} />;

      default:
        return <GenericFilePreview file={selectedFile.file} />;
    }
  };

  if (uploadedFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No files uploaded yet. Please upload files in the previous step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Selector */}
      {uploadedFiles.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {uploadedFiles.map((file, index) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setSelectedFileIndex(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFileIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
      )}

      {/* Preview Area */}
      <div className="space-y-4">
        {renderPreview()}

        {/* File Metadata */}
        {selectedFile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">File Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Format</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                {selectedFile.format}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Size</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <div className="flex items-center space-x-1">
                {selectedFile.validated &&
                selectedFile.validationErrors.length === 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Valid
                    </span>
                  </>
                ) : selectedFile.validated ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Invalid
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {selectedFile && selectedFile.validationErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                  Validation Errors
                </h4>
                <ul className="space-y-1">
                  {selectedFile.validationErrors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-700 dark:text-red-400"
                    >
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Hint */}
        {uploadedFiles.length > 1 && (
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {selectedFileIndex + 1} of {uploadedFiles.length} files
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewStep;
