'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import { ErrorBoundary, ErrorMessages } from '@/components/ui/error-boundary';
import Link from 'next/link';
import { BarChart2, ExternalLink } from 'lucide-react';
import { ClientOnly } from '@/components/ClientOnly';
// Define types directly to avoid import issues
enum ProxyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  ERROR = 'error',
}

// Import formatters directly
const formatRelativeTime = (date: Date | string): string => {
  if (!date) return 'Never';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const formatStreamCount = (current: number, max: number): string => {
  return `${current} / ${max}`;
};

const formatBandwidth = (mbps: number): string => {
  if (mbps < 1) return `${Math.round(mbps * 1000)} Kbps`;
  return `${mbps.toFixed(1)} Mbps`;
};

const getUtilizationColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Define styles locally
const COMPONENT_STYLES = {
  CARD_BASE: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow',
  BUTTON_PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors',
  BUTTON_SECONDARY: 'bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors',
  BUTTON_DANGER: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors',
} as const;

const STATUS_STYLES = {
  [ProxyStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProxyStatus.INACTIVE]: 'bg-red-100 text-red-800',
  [ProxyStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
} as const;

const HEALTH_STYLES = {
  [HealthStatus.HEALTHY]: 'bg-green-500',
  [HealthStatus.WARNING]: 'bg-yellow-500',
  [HealthStatus.ERROR]: 'bg-red-500',
} as const;

// Utility function to merge class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Simple loading spinner component
function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

// Simple status indicator component
function StatusIndicator({ status, size = 'md', className = '' }: { 
  status: string; 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
}) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const statusStyles = STATUS_STYLES[status as keyof typeof STATUS_STYLES] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${statusStyles} ${sizeClasses[size]} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Simple health status dot component
function HealthStatusDot({ status, size = 'md', className = '' }: { 
  status: string; 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const healthStyles = HEALTH_STYLES[status as keyof typeof HEALTH_STYLES] || 'bg-gray-400';
  
  return (
    <span 
      className={`inline-block rounded-full ${healthStyles} ${sizeClasses[size]} ${className}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
}

interface StreamingProxy {
  id: string;
  name: string;
  description?: string;
  rtmpUrl: string;
  rtmpKey?: string;
  serverLocation: string;
  maxConcurrentStreams: number;
  currentActiveStreams: number;
  status: typeof ProxyStatus[keyof typeof ProxyStatus];
  bandwidthLimit?: number;
  bandwidthUsed?: number;
  churchBranchId: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastHealthCheck?: Date | string;
  healthStatus: typeof HealthStatus[keyof typeof HealthStatus];
  lastActiveAt?: Date | string;
}

interface ProxyCardProps {
  proxy: Omit<StreamingProxy, 'id'> & { id: string };
  showActions?: boolean;
  onStartStream?: (proxyId: string) => void;
  onViewDetails?: (proxyId: string) => void;
  onEdit?: (proxy: StreamingProxy) => void;
  onDelete?: (proxyId: string) => void;
  className?: string;
}

const ProxyCardContent = memo(({
  proxy,
  showActions = true,
  onStartStream,
  onViewDetails,
  onEdit,
  onDelete,
  className
}: ProxyCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Memoize computed values to prevent unnecessary recalculations
  const computedValues = useMemo(() => {
    const maxStreams = typeof proxy.maxConcurrentStreams === 'string' 
      ? parseInt(proxy.maxConcurrentStreams, 10) 
      : proxy.maxConcurrentStreams || 0;
      
    const activeStreams = typeof proxy.currentActiveStreams === 'string'
      ? parseInt(proxy.currentActiveStreams, 10)
      : proxy.currentActiveStreams || 0;
      
    const utilizationPercentage = maxStreams > 0 
      ? (activeStreams / maxStreams) * 100 
      : 0;

    const canStartStream = proxy.status === 'active' && activeStreams < maxStreams;

    return {
      maxStreams,
      activeStreams,
      utilizationPercentage,
      canStartStream
    };
  }, [proxy.maxConcurrentStreams, proxy.currentActiveStreams, proxy.status]);

  // Memoize utility functions
  const getUtilizationColor = useCallback((percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }, []);

  // Memoize event handlers to prevent child re-renders
  const handleStartStream = useCallback(async () => {
    if (!onStartStream || !computedValues.canStartStream) return;
    
    setActionLoading('start');
    try {
      await onStartStream(proxy.id);
    } finally {
      setActionLoading(null);
    }
  }, [onStartStream, computedValues.canStartStream, proxy.id]);

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(proxy.id);
    }
  }, [onViewDetails, proxy.id]);
  
  // Safely format the last active time
  const formatLastActive = useCallback((date?: Date | string | null) => {
    if (!date) return 'Never';
    return formatRelativeTime(date);
  }, []);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(proxy);
    }
  }, [onEdit, proxy]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${proxy.name}?`);
    if (!confirmDelete) return;
    
    setActionLoading('delete');
    try {
      await onDelete(proxy.id);
    } finally {
      setActionLoading(null);
    }
  }, [onDelete, proxy.id, proxy.name]);
  
  const getStatusStyles = (status: string) => {
    return STATUS_STYLES[status as keyof typeof STATUS_STYLES] || 'bg-gray-100 text-gray-800';
  };
  
  const getHealthStyles = (status: string) => {
    return HEALTH_STYLES[status as keyof typeof HEALTH_STYLES] || 'bg-gray-400';
  };

  return (
    <div className={cn(COMPONENT_STYLES.CARD_BASE, className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {proxy.name}
          </h3>
          {proxy.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {proxy.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={cn("h-2.5 w-2.5 rounded-full", getHealthStyles(proxy.healthStatus || HealthStatus.HEALTHY))} />
          <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusStyles(proxy.status))}>
            {proxy.status}
          </span>
        </div>
      </div>

      {/* Server Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Location:</span>
          <span className="font-medium text-gray-900">{proxy.serverLocation}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Streams:</span>
          <span className="font-medium text-gray-900">
            {formatStreamCount(computedValues.activeStreams, computedValues.maxStreams)}
          </span>
        </div>
        {proxy.bandwidthLimit && (
          <div className="flex items-center justify-between">
            <Link 
              href={`/streaming-proxies/${proxy.id}/monitoring`} 
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              title="View detailed monitoring"
            >
              <BarChart2 className="h-3.5 w-3.5 mr-1" />
              View Metrics
            </Link>
          </div>
        )}
      </div>

      {/* Utilization Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Utilization</span>
          <span>{Math.round(computedValues.utilizationPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', getUtilizationColor(computedValues.utilizationPercentage))}
            style={{ width: `${Math.min(100, computedValues.utilizationPercentage)}%` }}
          />
        </div>
      </div>

      {/* Last Health Check and Bandwidth Usage */}
      <div className="space-y-2">
        {proxy.lastHealthCheck && (
          <div className={cn("text-sm text-gray-500")}>
            Last active: <ClientOnly fallback="--">
              {formatLastActive(proxy.lastActiveAt)}
            </ClientOnly>
          </div>
        )}
        
        {/* Bandwidth Usage Mini Chart */}
        <div className={cn("mt-1")}>
          <div className={cn("flex justify-between text-xs text-gray-500 mb-1")}>
            <span>Bandwidth (24h)</span>
            <span>{formatBandwidth(proxy.bandwidthUsed || 0)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${Math.min(100, ((proxy.bandwidthUsed || 0) / (proxy.bandwidthLimit || 1)) * 100)}%`,
                backgroundColor: (proxy.bandwidthUsed || 0) > (proxy.bandwidthLimit || 0) * 0.9 
                  ? '#ef4444' // red if over 90% of limit
                  : (proxy.bandwidthUsed || 0) > (proxy.bandwidthLimit || 0) * 0.7 
                    ? '#f59e0b' // yellow if over 70% of limit
                    : '#3b82f6' // blue otherwise
              }}
            />
          </div>
          {proxy.bandwidthLimit && (
            <div className="text-right text-xs text-gray-400 mt-1">
              {Math.round(((proxy.bandwidthUsed || 0) / proxy.bandwidthLimit) * 100)}% of {formatBandwidth(proxy.bandwidthLimit)}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2">
          {onStartStream && (
            <button
              onClick={handleStartStream}
              disabled={!computedValues.canStartStream}
              className={`${COMPONENT_STYLES.BUTTON_PRIMARY} ${
                !computedValues.canStartStream ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {actionLoading === 'start' ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Start Stream'
              )}
            </button>
          )}
          
          {onViewDetails && (
            <button
              onClick={handleViewDetails}
              className={cn(COMPONENT_STYLES.BUTTON_SECONDARY, 'text-sm')}
            >
              Details
            </button>
          )}

          {/* Admin Actions */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit proxy"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={computedValues.activeStreams > 0 || actionLoading === 'delete'}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={computedValues.activeStreams > 0 ? "Cannot delete proxy with active streams" : "Delete proxy"}
                >
                  {actionLoading === 'delete' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {!computedValues.canStartStream && proxy.status === 'active' && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Maximum streams reached
        </div>
      )}
      
      {proxy.status === 'maintenance' && (
        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          Under maintenance
        </div>
      )}
      
      {proxy.status === 'inactive' && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          Proxy inactive
        </div>
      )}
    </div>
  );
});

// Add display name for debugging
ProxyCardContent.displayName = 'ProxyCardContent';

// Compact version of the proxy card
export const CompactProxyCard = memo(({
  proxy,
  onSelect,
  selected = false,
  className
}: {
  proxy: StreamingProxy;
  onSelect?: (proxy: StreamingProxy) => void;
  selected?: boolean;
  className?: string;
}) => {
  // Memoize the click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    onSelect?.(proxy);
  }, [onSelect, proxy]);

  return (
    <div
      className={cn(
        'border rounded-lg p-3 cursor-pointer transition-all duration-200',
        selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{proxy.name}</h4>
            <HealthStatusDot status={proxy.healthStatus} size="sm" />
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>{proxy.serverLocation}</span>
            <span>{formatStreamCount(proxy.currentActiveStreams, proxy.maxConcurrentStreams)}</span>
          </div>
        </div>
        <StatusIndicator status={proxy.status} size="sm" />
      </div>
    </div>
  );
});

CompactProxyCard.displayName = 'CompactProxyCard';