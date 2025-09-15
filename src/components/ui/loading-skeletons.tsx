'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import Skeleton from './skeleton';

export interface LoadingSkeletonProps {
  className?: string;
}

// Progressive loading wrapper that shows content as it becomes available
export interface ProgressiveLoadingProps {
  children: React.ReactNode;
  loading: boolean;
  skeleton: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  children,
  loading,
  skeleton,
  delay = 0,
  className
}) => {
  const [showSkeleton, setShowSkeleton] = React.useState(loading);

  React.useEffect(() => {
    if (loading) {
      setShowSkeleton(true);
    } else if (delay > 0) {
      const timer = setTimeout(() => setShowSkeleton(false), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [loading, delay]);

  return (
    <div className={className}>
      {showSkeleton ? skeleton : children}
    </div>
  );
};

// Enhanced skeleton for proxy cards with more realistic layout
export const ProxyCardSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4', className)}>
    {/* Header with status indicator */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    
    {/* Endpoint and region */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    
    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
    
    {/* Action buttons */}
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

// Skeleton for proxy grid
export const ProxyGridSkeleton: React.FC<LoadingSkeletonProps & { count?: number }> = ({ 
  className, 
  count = 6 
}) => (
  <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
    {Array.from({ length: count }, (_, i) => (
      <ProxyCardSkeleton key={i} />
    ))}
  </div>
);

// Enhanced skeleton for system stats with icons and better layout
export const SystemStatsSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-gray-100">
            <Skeleton className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Enhanced skeleton for session list with live indicators
export const SessionListSkeleton: React.FC<LoadingSkeletonProps & { count?: number }> = ({ 
  className, 
  count = 5 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
        {/* Header with live status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-18" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        
        {/* Action button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton for table rows
export const TableRowSkeleton: React.FC<LoadingSkeletonProps & { columns?: number }> = ({ 
  className, 
  columns = 5 
}) => (
  <tr className={className}>
    {Array.from({ length: columns }, (_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Skeleton for table
export const TableSkeleton: React.FC<LoadingSkeletonProps & { rows?: number; columns?: number }> = ({ 
  className, 
  rows = 5, 
  columns = 5 
}) => (
  <div className={cn('overflow-hidden border rounded-lg', className)}>
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {Array.from({ length: columns }, (_, i) => (
            <th key={i} className="px-6 py-3">
              <Skeleton className="h-4 w-full" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }, (_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Skeleton for charts
export const ChartSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <Skeleton className="h-64 w-full" />
    <div className="flex items-center justify-center gap-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-18" />
    </div>
  </div>
);

// Enhanced skeleton for dashboard overview with progressive loading
export const DashboardOverviewSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('space-y-8', className)}>
    {/* Header */}
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Main content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Stats */}
      <SystemStatsSkeleton />
      
      {/* Quick Actions */}
      <QuickActionsSkeleton />
      
      {/* Active Streams */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <SessionListSkeleton count={3} />
      </div>
      
      {/* Proxy Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <ProxyGridSkeleton count={6} />
      </div>
    </div>
  </div>
);

// Skeleton for Quick Actions section
export const QuickActionsSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for bandwidth chart
export const BandwidthChartSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4', className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    <Skeleton className="h-64 w-full" />
    <div className="flex justify-center space-x-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-18" />
      </div>
    </div>
  </div>
);

// Skeleton for monitoring page
export const MonitoringPageSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BandwidthChartSkeleton />
      <ChartSkeleton />
    </div>
    
    {/* Sessions table */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Skeleton className="h-6 w-32" />
      </div>
      <TableSkeleton rows={5} columns={6} />
    </div>
  </div>
);

// Inline loading indicators
export const InlineLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size], className)} />
  );
};

export const ButtonLoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent', className)} />
);

// Loading dots animation
export const LoadingDots: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex space-x-1', className)}>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// Loading pulse for text
export const LoadingText: React.FC<{ width?: string; className?: string }> = ({ 
  width = 'w-24', 
  className 
}) => (
  <Skeleton className={cn('h-4', width, className)} />
);

// Generic loading state component with enhanced options
export interface LoadingStateProps {
  type: 'card' | 'table' | 'chart' | 'list' | 'grid' | 'stats' | 'dashboard' | 'monitoring' | 'quickActions' | 'bandwidth';
  count?: number;
  columns?: number;
  className?: string;
  progressive?: boolean;
  delay?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  type, 
  count, 
  columns, 
  className,
  progressive = false,
  delay = 0
}) => {
  const [showContent, setShowContent] = React.useState(!progressive);

  React.useEffect(() => {
    if (progressive) {
      const timer = setTimeout(() => setShowContent(true), delay);
      return () => clearTimeout(timer);
    }
  }, [progressive, delay]);

  if (progressive && !showContent) {
    return <div className={cn('h-32 w-full', className)} />;
  }

  switch (type) {
    case 'card':
      return <ProxyCardSkeleton className={className} />;
    case 'grid':
      return <ProxyGridSkeleton className={className} count={count} />;
    case 'table':
      return <TableSkeleton className={className} rows={count} columns={columns} />;
    case 'chart':
      return <ChartSkeleton className={className} />;
    case 'list':
      return <SessionListSkeleton className={className} count={count} />;
    case 'stats':
      return <SystemStatsSkeleton className={className} />;
    case 'dashboard':
      return <DashboardOverviewSkeleton className={className} />;
    case 'monitoring':
      return <MonitoringPageSkeleton className={className} />;
    case 'quickActions':
      return <QuickActionsSkeleton className={className} />;
    case 'bandwidth':
      return <BandwidthChartSkeleton className={className} />;
    default:
      return <Skeleton className={cn('h-32 w-full', className)} />;
  }
};

// Conditional loading wrapper
export interface ConditionalLoadingProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export const ConditionalLoading: React.FC<ConditionalLoadingProps> = ({
  loading,
  skeleton,
  children,
  className,
  fallback
}) => {
  if (loading) {
    return <div className={className}>{skeleton}</div>;
  }

  if (fallback && !children) {
    return <div className={className}>{fallback}</div>;
  }

  return <div className={className}>{children}</div>;
};