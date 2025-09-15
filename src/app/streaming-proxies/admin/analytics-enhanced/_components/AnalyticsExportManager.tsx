'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  Image, 
  Database, 
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';

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

interface AnalyticsExportManagerProps {
  onExport: (options: ExportOptions) => Promise<string>;
  jobs: ExportJob[];
  onDownload: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

export default function AnalyticsExportManager({
  onExport,
  jobs,
  onDownload,
  onDelete
}: AnalyticsExportManagerProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'csv',
    dataType: 'all',
    timeRange: '7d',
    filters: {},
    includeCharts: false,
    includeRawData: true,
    compression: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportTypes = [
    { value: 'csv', label: 'CSV', icon: <FileText className="h-4 w-4" />, description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', icon: <Database className="h-4 w-4" />, description: 'JavaScript Object Notation' },
    { value: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" />, description: 'Portable Document Format' },
    { value: 'excel', label: 'Excel', icon: <FileText className="h-4 w-4" />, description: 'Microsoft Excel format' }
  ];

  const dataTypes = [
    { value: 'performance', label: 'Performance Metrics', description: 'Response times, uptime, error rates' },
    { value: 'usage', label: 'Usage Statistics', description: 'Stream counts, viewer metrics, bandwidth' },
    { value: 'costs', label: 'Cost Analysis', description: 'Billing data, cost breakdowns, trends' },
    { value: 'all', label: 'All Data', description: 'Complete analytics dataset' }
  ];

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'json':
        return <Database className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
            <p className="text-sm text-gray-600">Export analytics data in various formats</p>
          </div>
          <Button onClick={() => setShowExportDialog(true)} className="gap-2">
            <Download className="h-4 w-4" />
            New Export
          </Button>
        </div>

        {/* Quick Export Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {exportTypes.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                setExportOptions({ ...exportOptions, type: type.value as any });
                setShowExportDialog(true);
              }}
            >
              {type.icon}
              <div className="text-center">
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Export Jobs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Export History</h3>
          <div className="text-sm text-gray-500">
            {jobs.length} export{jobs.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No exports yet</p>
              <p className="text-sm">Create your first export to get started</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(job.type)}
                  <div>
                    <div className="font-medium text-gray-900">{job.name}</div>
                    <div className="text-sm text-gray-500">
                      {job.dataType} • {job.type.toUpperCase()}
                      {job.fileSize && ` • ${job.fileSize}`}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created {job.createdAt.toLocaleDateString()}
                      {job.completedAt && ` • Completed ${job.completedAt.toLocaleDateString()}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(job.status)}
                    <span className="text-sm capitalize text-gray-600">{job.status}</span>
                  </div>
                  
                  {job.status === 'processing' && job.progress && (
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}

                  {job.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(job.id)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  )}

                  {job.status === 'failed' && job.error && (
                    <div className="text-xs text-red-600 max-w-xs truncate" title={job.error}>
                      {job.error}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(job.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Configure Export</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExportDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Export Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {exportTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setExportOptions({ ...exportOptions, type: type.value as any })}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          exportOptions.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {type.icon}
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Data to Export
                  </label>
                  <div className="space-y-2">
                    {dataTypes.map((dataType) => (
                      <label key={dataType.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="dataType"
                          value={dataType.value}
                          checked={exportOptions.dataType === dataType.value}
                          onChange={(e) => setExportOptions({ ...exportOptions, dataType: e.target.value as any })}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{dataType.label}</div>
                          <div className="text-sm text-gray-500">{dataType.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Time Range
                  </label>
                  <select
                    value={exportOptions.timeRange}
                    onChange={(e) => setExportOptions({ ...exportOptions, timeRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Export Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeCharts}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeCharts: e.target.checked })}
                      />
                      <span className="text-sm">Include chart visualizations (PDF only)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeRawData}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeRawData: e.target.checked })}
                      />
                      <span className="text-sm">Include raw data points</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.compression}
                        onChange={(e) => setExportOptions({ ...exportOptions, compression: e.target.checked })}
                      />
                      <span className="text-sm">Compress export file</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="gap-2"
                >
                  {isExporting ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Start Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}