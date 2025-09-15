'use client';

import { cn } from '@/lib/utils';
import { 
  ProxyCardSkeleton, 
  ProxyGridSkeleton, 
  SessionListSkeleton, 
  TableSkeleton, 
  ChartSkeleton,
  SystemStatsSkeleton,
  InlineLoadingSpinner,
  ButtonLoadingSpinner,
  LoadingDots,
  ConditionalLoading
} from '@/components/ui/loading-skeletons';

interface LoadingStateProps {
  type: 'card' | 'table' | 'chart' | 'list' | 'grid' | 'stats';
  count?: number;
  className?: string;
}

export default function LoadingStates({ type, count = 3, className }: LoadingStateProps) {
  const renderCardSkeleton = () => (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-200 p-6", className)}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className={cn("overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg", className)}>
      <div className="animate-pulse">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
        {/* Table Rows */}
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChartSkeleton = () => (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-200 p-6", className)}>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  switch (type) {
    case 'card':
      return <ProxyCardSkeleton className={className} />;
    case 'grid':
      return <ProxyGridSkeleton className={className} count={count} />;
    case 'table':
      return <TableSkeleton className={className} rows={count} />;
    case 'chart':
      return <ChartSkeleton className={className} />;
    case 'list':
      return <SessionListSkeleton className={className} count={count} />;
    case 'stats':
      return <SystemStatsSkeleton className={className} />;
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <ProxyCardSkeleton key={index} />
          ))}
        </div>
      );
  }
}

// Specialized loading components using enhanced skeletons
export function CardLoadingSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return <ProxyGridSkeleton count={count} className={className} />;
}

export function TableLoadingSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return <TableSkeleton rows={count} className={className} />;
}

export function ChartLoadingSkeleton({ className }: { className?: string }) {
  return <ChartSkeleton className={className} />;
}

export function ListLoadingSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return <SessionListSkeleton count={count} className={className} />;
}

export function StatsLoadingSkeleton({ className }: { className?: string }) {
  return <SystemStatsSkeleton className={className} />;
}

// Re-export enhanced loading components
export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <InlineLoadingSpinner size={size} />
    </div>
  );
}

// Enhanced button loading state
export { ButtonLoadingSpinner };

// Page loading overlay
export function PageLoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title, 
  description, 
  action,
  icon 
}: { 
  title: string; 
  description: string; 
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}

// Error state component
export function ErrorState({ 
  title = 'Something went wrong', 
  description, 
  retry,
  className 
}: { 
  title?: string; 
  description: string; 
  retry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto h-12 w-12 text-red-400 mb-4">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {retry && (
        <div className="mt-6">
          <button
            onClick={retry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}