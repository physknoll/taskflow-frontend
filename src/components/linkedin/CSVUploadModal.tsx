'use client';

import { useState, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLinkedInCSVUpload } from '@/hooks/useLinkedIn';
import { LinkedInCSVUploadResponse } from '@/types';
import { cn } from '@/lib/utils';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Loader2,
} from 'lucide-react';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// CSV column documentation
const CSV_COLUMNS = [
  {
    name: 'url',
    required: true,
    description: 'LinkedIn URL (person or company)',
    example: 'https://linkedin.com/in/johndoe',
  },
  {
    name: 'display_name',
    required: false,
    description: 'Display name',
    example: 'John Doe',
  },
  {
    name: 'headline',
    required: false,
    description: 'Headline/description',
    example: 'CEO at TechCorp',
  },
  {
    name: 'profile_type',
    required: false,
    description: 'Type: own, competitor, industry, prospect',
    example: 'competitor',
  },
  {
    name: 'tags',
    required: false,
    description: 'Tags separated by semicolons',
    example: 'tech;leadership;saas',
  },
  {
    name: 'client_id',
    required: false,
    description: 'Associated client ID',
    example: '674abc123...',
  },
  {
    name: 'interval_minutes',
    required: false,
    description: 'Scrape interval (min 15)',
    example: '30',
  },
  {
    name: 'priority',
    required: false,
    description: 'Priority: low, normal, high',
    example: 'high',
  },
];

const SUPPORTED_URL_FORMATS = [
  'https://linkedin.com/in/username',
  'https://www.linkedin.com/in/username',
  'https://linkedin.com/company/company-name',
  'https://www.linkedin.com/company/company-name',
  'linkedin.com/in/username (without https)',
];

const EXAMPLE_CSV = `url,display_name,headline,profile_type,tags,client_id,interval_minutes,priority
https://linkedin.com/in/johndoe,John Doe,CEO at TechCorp,competitor,tech;leadership,,30,high
https://linkedin.com/company/techcorp,TechCorp,Leading tech company,competitor,tech;saas,,60,normal
https://linkedin.com/in/janesmith,Jane Smith,VP Marketing,industry,marketing,,60,normal`;

export function CSVUploadModal({ isOpen, onClose, onSuccess }: CSVUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showDocs, setShowDocs] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<LinkedInCSVUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadCSV, isUploading, downloadTemplate, resetUpload } = useLinkedInCSVUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setResults(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResults(null);
    }
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadCSV(selectedFile);
      setResults(result);
      if (result.created > 0) {
        onSuccess?.();
      }
    } catch {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResults(null);
    resetUpload();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResults(null);
    resetUpload();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import LinkedIn Profiles"
      description="Import multiple profiles from a CSV file"
      size="lg"
    >
      <div className="space-y-6">
        {/* Documentation Section */}
        <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDocs(!showDocs)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-surface-900 dark:text-white">CSV Format Guide</span>
            </div>
            {showDocs ? (
              <ChevronUp className="w-4 h-4 text-surface-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-surface-400" />
            )}
          </button>

          {showDocs && (
            <div className="px-4 pb-4 space-y-4 border-t border-surface-200 dark:border-surface-700">
              {/* Column Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="text-left py-2 pr-4 font-medium text-surface-700 dark:text-surface-300">Column</th>
                      <th className="text-left py-2 pr-4 font-medium text-surface-700 dark:text-surface-300">Required</th>
                      <th className="text-left py-2 pr-4 font-medium text-surface-700 dark:text-surface-300">Description</th>
                      <th className="text-left py-2 font-medium text-surface-700 dark:text-surface-300">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CSV_COLUMNS.map((col) => (
                      <tr key={col.name} className="border-b border-surface-100 dark:border-surface-700/50">
                        <td className="py-2 pr-4">
                          <code className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded text-xs font-mono">
                            {col.name}
                          </code>
                        </td>
                        <td className="py-2 pr-4">
                          {col.required ? (
                            <Badge variant="success" size="sm">Yes</Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">No</Badge>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-surface-600 dark:text-surface-400">{col.description}</td>
                        <td className="py-2">
                          <code className="text-xs text-surface-500 dark:text-surface-400">{col.example}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Example CSV */}
              <div>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Example CSV:</p>
                <div className="bg-surface-900 dark:bg-surface-950 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-surface-300 font-mono whitespace-pre">{EXAMPLE_CSV}</pre>
                </div>
              </div>

              {/* Supported URLs */}
              <div>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Supported URL formats:</p>
                <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
                  {SUPPORTED_URL_FORMATS.map((format, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-surface-400 rounded-full" />
                      <code className="text-xs">{format}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Download Template Button */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Upload Zone or Results */}
        {results ? (
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-6 border border-surface-200 dark:border-surface-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-surface-900 dark:text-white">Import Results</h3>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Import Another
                </Button>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-2xl font-bold">{results.created}</span>
                  <span className="text-sm text-surface-500">imported</span>
                </div>
                {results.skipped > 0 && (
                  <div className="flex items-center gap-2 text-warning-600 dark:text-warning-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-2xl font-bold">{results.skipped}</span>
                    <span className="text-sm text-surface-500">skipped</span>
                  </div>
                )}
              </div>

              {/* Skipped Rows Details */}
              {results.skippedRows && results.skippedRows.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Skipped rows:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {results.skippedRows.map((row, i) => (
                      <div key={i} className="text-sm text-surface-500 dark:text-surface-400 flex gap-2">
                        <span className="text-surface-400">Row {row.row}:</span>
                        <span className="text-error-500 dark:text-error-400">{row.reason}</span>
                        {row.url && (
                          <span className="text-surface-400 truncate max-w-[200px]">({row.url})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* File Selection */}
            {selectedFile ? (
              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-primary-500" />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-sm text-surface-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-error-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                  isDragging
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                )}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-surface-400" />
                <p className="font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-surface-400">CSV files only (max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button variant="outline" onClick={handleClose}>
            {results ? 'Close' : 'Cancel'}
          </Button>
          {!results && (
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading} isLoading={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Profiles
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
