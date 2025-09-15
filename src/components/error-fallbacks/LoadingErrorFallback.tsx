'use client';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Loader2, RefreshCw, AlertTriangle, Database, Clock } from 'lucide-react';

interface LoadingErrorFallbackProps {
  error: Error;
  retry: () => void;
  isRetrying?: boolean;
  dataType?: string;
  showDetails?: boolean;
  timeout?: boolean;
}

export function LoadingErrorFallback({ 
  error, 
  retry, 
  isRetrying = false,
  dataType = 'data',
  showDetails = false,
  timeout = false
}: LoadingErrorFallbackProps) {
  const isTimeoutError = timeout || 
                        error.message.toLowerCase().includes('timeout') ||
                        error.message.toLowerCase().includes('aborted');
  
  const isDataError = error.message.toLowerCase().includes('data') ||
                     error.message.toLowerCase().includes('parse') ||
                     error.message.toLowerCase().includes('json');

  return (
    <Card className="p-6 border-yellow-200 bg-yellow-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {isTimeoutError ? (
            <Clock className="h-12 w-12 text-yellow-500" />
          ) : isDataError ? (
            <Database className="h-12 w-12 text-yellow-500" />
          ) : (
            <Loader2 className="h-12 w-12 text-yellow-500" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          {isTimeoutError ? 'Loading Timeout' : `Failed to Load ${dataType}`}
        </h3>
        
        <p className="text-yellow-700 mb-4">
          {isTimeoutError 
            ? `Loading ${dataType} is taking longer than expected. This might be due to a slow connection or server issues.`
            : isDataError
              ? `There was a problem processing the ${dataType}. The server response may be invalid.`
              : `Unable to load ${dataType}. Please check your connection and try again.`
          }
        </p>

        {showDetails && error.message && (
          <div className="mb-4 p-3 bg-yellow-100 rounded-md text-sm text-yellow-800">
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
            className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Loading...' : `Reload ${dataType}`}
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="gap-2 text-yellow-700 hover:bg-yellow-100"
          >
            Refresh Page
          </Button>
        </div>

        {isTimeoutError && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-md text-sm text-yellow-800">
            <p className="font-medium mb-1">Troubleshooting Tips:</p>
            <ul className="text-left space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Wait a moment and try again</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

export default LoadingErrorFallback;