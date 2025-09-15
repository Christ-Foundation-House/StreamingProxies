'use client';

import { useState, useCallback, useRef } from 'react';
import { ApiClientError, ApiErrorType } from '../api-client';

export interface ExportOptions {
  type: 'csv' | 'json' | 'pdf' | 'excel';
  dataType: 'performance' | 'usage' | 'costs' | 'all';
  timeRange: string;
  filters: {
    region?: string;
    category?: string;
    proxyId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  includeCharts: boolean;
  includeRawData: boolean;
  compression: boolean;
}

export interface ExportJob {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'pdf' | 'excel';
  dataType: 'performance' | 'usage' | 'costs' | 'all';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  createdAt: Date;
  completedAt?: Date;
  fileSize?: string;
  downloadUrl?: string;
  error?: string;
}

export interface UseAnalyticsExportOptions {
  maxConcurrentExports?: number;
  autoCleanupCompleted?: boolean;
  cleanupDelay?: number;
}

export interface UseAnalyticsExportReturn {
  jobs: ExportJob[];
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  
  // Actions
  startExport: (options: ExportOptions) => Promise<string>;
  downloadExport: (jobId: string) => Promise<void>;
  cancelExport: (jobId: string) => void;
  deleteJob: (jobId: string) => void;
  clearAllJobs: () => void;
  
  // Status
  activeExports: number;
  completedExports: number;
  failedExports: number;
}

export function useAnalyticsExport(
  options: UseAnalyticsExportOptions = {}
): UseAnalyticsExportReturn {
  const {
    maxConcurrentExports = 3,
    autoCleanupCompleted = true,
    cleanupDelay = 24 * 60 * 60 * 1000, // 24 hours
  } = options;

  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ApiErrorType | null>(null);

  // Keep track of active export controllers for cancellation
  const exportControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Clear error when starting new operations
  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  // Handle API errors consistently
  const handleError = useCallback((err: unknown) => {
    if (err instanceof ApiClientError) {
      setError(err.message);
      setErrorType(err.type);
    } else if (err instanceof Error) {
      setError(err.message);
      setErrorType(ApiErrorType.UNKNOWN_ERROR);
    } else {
      setError('An unknown error occurred');
      setErrorType(ApiErrorType.UNKNOWN_ERROR);
    }
  }, []);

  // Generate export job name
  const generateJobName = useCallback((options: ExportOptions): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `analytics-${options.dataType}-${options.timeRange}-${timestamp}`;
  }, []);

  // Update job status
  const updateJob = useCallback((jobId: string, updates: Partial<ExportJob>) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      )
    );
  }, []);

  // Start export process
  const startExport = useCallback(async (options: ExportOptions): Promise<string> => {
    const activeCount = jobs.filter(job => 
      job.status === 'processing' || job.status === 'pending'
    ).length;

    if (activeCount >= maxConcurrentExports) {
      throw new Error(`Maximum concurrent exports (${maxConcurrentExports}) reached`);
    }

    const jobId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const jobName = generateJobName(options);

    // Create new job
    const newJob: ExportJob = {
      id: jobId,
      name: jobName,
      type: options.type,
      dataType: options.dataType,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    setJobs(prevJobs => [...prevJobs, newJob]);

    try {
      setLoading(true);
      clearError();

      // Create abort controller for this export
      const controller = new AbortController();
      exportControllersRef.current.set(jobId, controller);

      // Update job status to processing
      updateJob(jobId, { status: 'processing', progress: 10 });

      // Make API call to start export
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Handle different response types
        if (options.type === 'csv') {
          // For CSV, the response body contains the data
          const blob = new Blob([await response.text()], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          
          updateJob(jobId, {
            status: 'completed',
            progress: 100,
            completedAt: new Date(),
            downloadUrl: url,
            fileSize: formatFileSize(blob.size),
          });
        } else if (options.type === 'json') {
          // For JSON, create downloadable blob
          const jsonData = JSON.stringify(result.data, null, 2);
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          updateJob(jobId, {
            status: 'completed',
            progress: 100,
            completedAt: new Date(),
            downloadUrl: url,
            fileSize: formatFileSize(blob.size),
          });
        } else {
          // For PDF and Excel, use the provided download URL
          updateJob(jobId, {
            status: 'completed',
            progress: 100,
            completedAt: new Date(),
            downloadUrl: result.downloadUrl,
            fileSize: result.metadata?.fileSize || 'Unknown',
          });
        }

        // Schedule cleanup if enabled
        if (autoCleanupCompleted) {
          setTimeout(() => {
            deleteJob(jobId);
          }, cleanupDelay);
        }

      } else {
        throw new Error(result.error || 'Export failed');
      }

      return jobId;

    } catch (err) {
      // Don't handle aborted requests as errors
      if (err instanceof Error && err.name === 'AbortError') {
        updateJob(jobId, { status: 'pending' });
        return jobId;
      }

      console.error('Export failed:', err);
      handleError(err);
      
      updateJob(jobId, {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      });

      throw err;
    } finally {
      setLoading(false);
      exportControllersRef.current.delete(jobId);
    }
  }, [jobs, maxConcurrentExports, generateJobName, updateJob, clearError, handleError, autoCleanupCompleted, cleanupDelay]);

  // Download completed export
  const downloadExport = useCallback(async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status !== 'completed' || !job.downloadUrl) {
      throw new Error('Export not available for download');
    }

    try {
      if (job.downloadUrl.startsWith('blob:')) {
        // Handle blob URLs (CSV, JSON)
        const link = document.createElement('a');
        link.href = job.downloadUrl;
        link.download = `${job.name}.${job.type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle server URLs (PDF, Excel)
        const response = await fetch(job.downloadUrl);
        if (!response.ok) {
          throw new Error('Failed to download file');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${job.name}.${job.type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed:', err);
      handleError(err);
      throw err;
    }
  }, [jobs, handleError]);

  // Cancel ongoing export
  const cancelExport = useCallback((jobId: string) => {
    const controller = exportControllersRef.current.get(jobId);
    if (controller) {
      controller.abort();
      exportControllersRef.current.delete(jobId);
    }
    
    updateJob(jobId, { status: 'failed', error: 'Export cancelled by user' });
  }, [updateJob]);

  // Delete job from list
  const deleteJob = useCallback((jobId: string) => {
    // Clean up blob URLs to prevent memory leaks
    const job = jobs.find(j => j.id === jobId);
    if (job?.downloadUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(job.downloadUrl);
    }

    // Cancel if still processing
    const controller = exportControllersRef.current.get(jobId);
    if (controller) {
      controller.abort();
      exportControllersRef.current.delete(jobId);
    }

    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  }, [jobs]);

  // Clear all jobs
  const clearAllJobs = useCallback(() => {
    // Clean up all blob URLs
    jobs.forEach(job => {
      if (job.downloadUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(job.downloadUrl);
      }
    });

    // Cancel all active exports
    exportControllersRef.current.forEach(controller => controller.abort());
    exportControllersRef.current.clear();

    setJobs([]);
  }, [jobs]);

  // Computed values
  const activeExports = jobs.filter(job => 
    job.status === 'processing' || job.status === 'pending'
  ).length;

  const completedExports = jobs.filter(job => job.status === 'completed').length;
  const failedExports = jobs.filter(job => job.status === 'failed').length;

  return {
    jobs,
    loading,
    error,
    errorType,
    
    // Actions
    startExport,
    downloadExport,
    cancelExport,
    deleteJob,
    clearAllJobs,
    
    // Status
    activeExports,
    completedExports,
    failedExports,
  };
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}