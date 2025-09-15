'use client';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface NetworkErrorFallbackProps {
  error: Error;
  retry: () => void;
  isRetrying?: boolean;
  showDetails?: boolean;
}

export function NetworkErrorFallback({ 
  error, 
  retry, 
  isRetrying = false,
  showDetails = false 
}: NetworkErrorFallbackProps) {
  const isOffline = !navigator.onLine;
  const isConnectionError = error.message.toLowerCase().includes('network') || 
                           error.message.toLowerCase().includes('fetch') ||
                           error.message.toLowerCase().includes('connection') ||
                           error.name === 'TypeError';

  return (
    <Card className="p-6 border-orange-200 bg-orange-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {isOffline ? (
            <WifiOff className="h-12 w-12 text-orange-500" />
          ) : (
            <Wifi className="h-12 w-12 text-orange-500" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-orange-900 mb-2">
          {isOffline ? 'No Internet Connection' : 'Connection Problem'}
        </h3>
        
        <p className="text-orange-700 mb-4">
          {isOffline 
            ? 'Please check your internet connection and try again.'
            : isConnectionError 
              ? 'Unable to connect to the server. Please check your connection.'
              : 'A network error occurred while loading data.'
          }
        </p>

        {showDetails && error.message && (
          <div className="mb-4 p-3 bg-orange-100 rounded-md text-sm text-orange-800">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error Details:</span>
            </div>
            <p className="text-left">{error.message}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={retry}
            disabled={isRetrying}
            variant="outline"
            className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
          
          {isOffline && (
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="gap-2 text-orange-700 hover:bg-orange-100"
            >
              Refresh Page
            </Button>
          )}
        </div>

        {isOffline && (
          <p className="mt-4 text-sm text-orange-600">
            The page will automatically retry when your connection is restored.
          </p>
        )}
      </div>
    </Card>
  );
}

export default NetworkErrorFallback;