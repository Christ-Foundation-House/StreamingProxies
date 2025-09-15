'use client';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Server, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

interface ProxyCardErrorFallbackProps {
  error: Error;
  retry: () => void;
  proxyId?: string;
  proxyName?: string;
  isRetrying?: boolean;
  onViewDetails?: () => void;
  onRemoveFromGrid?: () => void;
}

export function ProxyCardErrorFallback({ 
  error, 
  retry, 
  proxyId,
  proxyName,
  isRetrying = false,
  onViewDetails,
  onRemoveFromGrid
}: ProxyCardErrorFallbackProps) {
  const isRenderError = error.message.toLowerCase().includes('render') ||
                       error.message.toLowerCase().includes('hook') ||
                       error.name === 'ChunkLoadError';

  const isDataError = error.message.toLowerCase().includes('data') ||
                     error.message.toLowerCase().includes('fetch') ||
                     error.message.toLowerCase().includes('parse');

  const getErrorMessage = () => {
    if (isRenderError) {
      return 'This proxy card failed to display properly.';
    }
    if (isDataError) {
      return 'Unable to load proxy information.';
    }
    return 'An error occurred while displaying this proxy.';
  };

  const displayName = proxyName || (proxyId ? `Proxy ${proxyId}` : 'Unknown Proxy');

  return (
    <Card className="p-4 border-red-200 bg-red-50 min-h-[200px] flex flex-col justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Server className="h-8 w-8 text-red-400" />
            <AlertTriangle className="h-4 w-4 text-red-600 absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h4 className="font-medium text-red-900 mb-1 truncate">
          {displayName}
        </h4>
        
        <p className="text-sm text-red-700 mb-4">
          {getErrorMessage()}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={retry}
            disabled={isRetrying}
            variant="outline"
            size="sm"
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100 w-full"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Loading...' : 'Retry'}
          </Button>
          
          {onViewDetails && proxyId && (
            <Button
              onClick={onViewDetails}
              variant="ghost"
              size="sm"
              className="gap-2 text-red-600 hover:bg-red-100 w-full"
            >
              <ExternalLink className="h-3 w-3" />
              View Details
            </Button>
          )}

          {onRemoveFromGrid && (
            <Button
              onClick={onRemoveFromGrid}
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:bg-red-100 w-full"
            >
              Remove from grid
            </Button>
          )}
        </div>

        {/* Error indicator */}
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="flex items-center justify-center gap-2 text-xs text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Card Error</span>
          </div>
        </div>

        {/* Development info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
            {error.name}: {error.message}
          </div>
        )}
      </div>
    </Card>
  );
}

export default ProxyCardErrorFallback;