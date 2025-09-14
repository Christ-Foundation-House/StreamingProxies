'use client';

import { useState, useMemo } from 'react';
import { StreamingProxy, ProxyStatus, HealthStatus } from '@/lib/streaming-proxies/types';
import { formatRelativeTime, formatStreamCount, formatBandwidth } from '@/lib/streaming-proxies/utils/formatters';
import { COMPONENT_STYLES, LAYOUT_STYLES } from '@/lib/streaming-proxies/utils/constants';
import { cn } from '@/lib/utils';
import StatusIndicator, { HealthStatusDot } from '../../_components/StatusIndicator';
import { TableLoadingSkeleton, LoadingSpinner } from '../../_components/LoadingStates';

interface ProxyTableProps {
  proxies: StreamingProxy[];
  loading?: boolean;
  onEdit?: (proxy: StreamingProxy) => void;
  onDelete?: (proxyId: string) => void;
  onBulkAction?: (action: string, proxyIds: string[]) => void;
  onHealthCheck?: (proxyId: string) => void;
  className?: string;
}

type SortField = 'name' | 'status' | 'location' | 'streams' | 'health' | 'updated';
type SortDirection = 'asc' | 'desc';

export default function ProxyTable({
  proxies,
  loading = false,
  onEdit,
  onDelete,
  onBulkAction,
  onHealthCheck,
  className
}: ProxyTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProxyStatus | 'all'>('all');
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter and sort proxies
  const filteredAndSortedProxies = useMemo(() => {
    let filtered = proxies.filter(proxy => {
      const matchesSearch = proxy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proxy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proxy.serverLocation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || proxy.status === statusFilter;
      const matchesHealth = healthFilter === 'all' || proxy.healthStatus === healthFilter;
      
      return matchesSearch && matchesStatus && matchesHealth;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'location':
          aValue = a.serverLocation;
          bValue = b.serverLocation;
          break;
        case 'streams':
          aValue = a.currentActiveStreams;
          bValue = b.currentActiveStreams;
          break;
        case 'health':
          aValue = a.healthStatus;
          bValue = b.healthStatus;
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [proxies, searchTerm, statusFilter, healthFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredAndSortedProxies.map(proxy => proxy.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectProxy = (proxyId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(proxyId);
    } else {
      newSelected.delete(proxyId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0 || !onBulkAction) return;
    
    setActionLoading(action);
    try {
      await onBulkAction(action, Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setActionLoading(null);
    }
  };

  const handleHealthCheck = async (proxyId: string) => {
    if (!onHealthCheck) return;
    
    setActionLoading(`health-${proxyId}`);
    try {
      await onHealthCheck(proxyId);
    } finally {
      setActionLoading(null);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  if (loading) {
    return <TableLoadingSkeleton className={className} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search proxies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={COMPONENT_STYLES.INPUT_BASE}
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProxyStatus | 'all')}
            className={COMPONENT_STYLES.INPUT_BASE}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
          
          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value as HealthStatus | 'all')}
            className={COMPONENT_STYLES.INPUT_BASE}
          >
            <option value="all">All Health</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && onBulkAction && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedIds.size} proxy(ies) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={actionLoading === 'activate'}
                className={cn(
                  COMPONENT_STYLES.BUTTON_SUCCESS,
                  'text-sm',
                  actionLoading === 'activate' && 'opacity-50 cursor-not-allowed'
                )}
              >
                {actionLoading === 'activate' ? <LoadingSpinner size="sm" /> : 'Activate'}
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                disabled={actionLoading === 'deactivate'}
                className={cn(
                  COMPONENT_STYLES.BUTTON_SECONDARY,
                  'text-sm',
                  actionLoading === 'deactivate' && 'opacity-50 cursor-not-allowed'
                )}
              >
                {actionLoading === 'deactivate' ? <LoadingSpinner size="sm" /> : 'Deactivate'}
              </button>
              <button
                onClick={() => handleBulkAction('maintenance')}
                disabled={actionLoading === 'maintenance'}
                className={cn(
                  COMPONENT_STYLES.BUTTON_SECONDARY,
                  'text-sm',
                  actionLoading === 'maintenance' && 'opacity-50 cursor-not-allowed'
                )}
              >
                {actionLoading === 'maintenance' ? <LoadingSpinner size="sm" /> : 'Maintenance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={LAYOUT_STYLES.ADMIN_TABLE}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredAndSortedProxies.length && filteredAndSortedProxies.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Name
                  {getSortIcon('name')}
                </button>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('location')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Location
                  {getSortIcon('location')}
                </button>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('streams')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Streams
                  {getSortIcon('streams')}
                </button>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('health')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Health
                  {getSortIcon('health')}
                </button>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('updated')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Updated
                  {getSortIcon('updated')}
                </button>
              </th>
              
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedProxies.map((proxy) => (
              <tr key={proxy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(proxy.id)}
                    onChange={(e) => handleSelectProxy(proxy.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{proxy.name}</div>
                    {proxy.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {proxy.description}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusIndicator status={proxy.status} size="sm" />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {proxy.serverLocation}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatStreamCount(proxy.currentActiveStreams, proxy.maxConcurrentStreams)}
                  </div>
                  {proxy.bandwidthLimit && (
                    <div className="text-xs text-gray-500">
                      {formatBandwidth(proxy.bandwidthLimit)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <HealthStatusDot status={proxy.healthStatus} size="sm" />
                    {onHealthCheck && (
                      <button
                        onClick={() => handleHealthCheck(proxy.id)}
                        disabled={actionLoading === `health-${proxy.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                        title="Run health check"
                      >
                        {actionLoading === `health-${proxy.id}` ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Check'
                        )}
                      </button>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatRelativeTime(proxy.updatedAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(proxy)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(proxy.id)}
                        disabled={proxy.currentActiveStreams > 0}
                        className={cn(
                          'text-red-600 hover:text-red-700',
                          proxy.currentActiveStreams > 0 && 'opacity-50 cursor-not-allowed'
                        )}
                        title={proxy.currentActiveStreams > 0 ? 'Cannot delete proxy with active streams' : 'Delete proxy'}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedProxies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || healthFilter !== 'all' 
                ? 'No proxies match your filters' 
                : 'No proxies found'
              }
            </div>
          </div>
        )}
      </div>
      
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing {filteredAndSortedProxies.length} of {proxies.length} proxies
        </div>
        {selectedIds.size > 0 && (
          <div>
            {selectedIds.size} selected
          </div>
        )}
      </div>
    </div>
  );
}