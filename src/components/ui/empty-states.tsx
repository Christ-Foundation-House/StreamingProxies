'use client';

import * as React from 'react';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Database, 
  AlertCircle, 
  Plus, 
  RefreshCw,
  Search,
  Activity
} from 'lucide-react';
import { EmptyState } from './empty-state';

export interface EmptyStateComponentProps {
  onAction?: () => void;
  className?: string;
}

// Empty state for when no proxies exist
export const NoProxiesEmptyState: React.FC<EmptyStateComponentProps> = ({ 
  onAction, 
  className 
}) => (
  <EmptyState
    icon={<Server className="h-12 w-12" />}
    title="No streaming proxies found"
    description="Get started by creating your first streaming proxy to manage your live streams."
    action={onAction ? {
      label: "Create Proxy",
      onClick: onAction
    } : undefined}
    className={className}
  />
);

// Empty state for when no sessions exist
export const NoSessionsEmptyState: React.FC<EmptyStateComponentProps> = ({ 
  onAction, 
  className 
}) => (
  <EmptyState
    icon={<Activity className="h-12 w-12" />}
    title="No streaming sessions"
    description="No active or recent streaming sessions found. Start a new stream to see activity here."
    action={onAction ? {
      label: "Start Stream",
      onClick: onAction
    } : undefined}
    className={className}
  />
);

// Empty state for search results
export const NoSearchResultsEmptyState: React.FC<EmptyStateComponentProps & { searchTerm?: string }> = ({ 
  onAction, 
  searchTerm,
  className 
}) => (
  <EmptyState
    icon={<Search className="h-12 w-12" />}
    title="No results found"
    description={
      searchTerm 
        ? `No results found for "${searchTerm}". Try adjusting your search terms.`
        : "No results found. Try adjusting your search terms or filters."
    }
    action={onAction ? {
      label: "Clear Search",
      onClick: onAction,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Empty state for connection issues
export const ConnectionErrorEmptyState: React.FC<EmptyStateComponentProps> = ({ 
  onAction, 
  className 
}) => (
  <EmptyState
    icon={<WifiOff className="h-12 w-12" />}
    title="Connection error"
    description="Unable to connect to the server. Please check your internet connection and try again."
    action={onAction ? {
      label: "Retry",
      onClick: onAction,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Empty state for offline mode
export const OfflineEmptyState: React.FC<EmptyStateComponentProps> = ({ 
  onAction, 
  className 
}) => (
  <EmptyState
    icon={<WifiOff className="h-12 w-12" />}
    title="You're offline"
    description="Some features may not be available while offline. Check your connection and try again."
    action={onAction ? {
      label: "Retry",
      onClick: onAction,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Empty state for server errors
export const ServerErrorEmptyState: React.FC<EmptyStateComponentProps> = ({ 
  onAction, 
  className 
}) => (
  <EmptyState
    icon={<AlertCircle className="h-12 w-12" />}
    title="Server error"
    description="Something went wrong on our end. Please try again in a few moments."
    action={onAction ? {
      label: "Try Again",
      onClick: onAction,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Empty state for data loading errors
export const DataErrorEmptyState: React.FC<EmptyStateComponentProps> = ({ 
  onAction, 
  className 
}) => (
  <EmptyState
    icon={<Database className="h-12 w-12" />}
    title="Failed to load data"
    description="We couldn't load the requested data. Please try refreshing the page."
    action={onAction ? {
      label: "Refresh",
      onClick: onAction,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Empty state for maintenance mode
export const MaintenanceEmptyState: React.FC<EmptyStateComponentProps> = ({ 
  className 
}) => (
  <EmptyState
    icon={<Server className="h-12 w-12" />}
    title="Under maintenance"
    description="The system is currently under maintenance. Please check back later."
    className={className}
  />
);

// Generic error empty state
export const GenericErrorEmptyState: React.FC<EmptyStateComponentProps & { 
  title?: string; 
  description?: string; 
}> = ({ 
  onAction, 
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  className 
}) => (
  <EmptyState
    icon={<AlertCircle className="h-12 w-12" />}
    title={title}
    description={description}
    action={onAction ? {
      label: "Try Again",
      onClick: onAction,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Empty state selector based on error type
export interface ErrorEmptyStateProps extends EmptyStateComponentProps {
  errorType?: 'network' | 'server' | 'data' | 'offline' | 'maintenance' | 'search' | 'generic';
  errorMessage?: string;
  searchTerm?: string;
}

export const ErrorEmptyState: React.FC<ErrorEmptyStateProps> = ({
  errorType = 'generic',
  errorMessage,
  searchTerm,
  onAction,
  className
}) => {
  switch (errorType) {
    case 'network':
      return <ConnectionErrorEmptyState onAction={onAction} className={className} />;
    case 'server':
      return <ServerErrorEmptyState onAction={onAction} className={className} />;
    case 'data':
      return <DataErrorEmptyState onAction={onAction} className={className} />;
    case 'offline':
      return <OfflineEmptyState onAction={onAction} className={className} />;
    case 'maintenance':
      return <MaintenanceEmptyState className={className} />;
    case 'search':
      return <NoSearchResultsEmptyState onAction={onAction} searchTerm={searchTerm} className={className} />;
    default:
      return (
        <GenericErrorEmptyState 
          onAction={onAction} 
          description={errorMessage}
          className={className} 
        />
      );
  }
};