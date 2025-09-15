'use client';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Bug, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ComponentErrorFallbackProps {
  error: Error;
  retry: () => void;
  isRetrying?: boolean;
  componentName?: string;
  showDetails?: boolean;
}

export function ComponentErrorFallback({ 
  error, 
  retry, 
  isRetrying = false,
  componentName = 'Component',
  showDetails = process.env.NODE_ENV === 'development'
}: ComponentErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const isRenderError = error.message.toLowerCase().includes('render') ||
                       error.message.toLowerCase().includes('hook') ||
                       error.name === 'ChunkLoadError';

  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Bug className="h-12 w-12 text-red-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          {componentName} Error
        </h3>
        
        <p className="text-red-700 mb-4">
          {isRenderError 
            ? `The ${componentName.toLowerCase()} encountered a rendering error and couldn't display properly.`
            : `An error occurred in the ${componentName.toLowerCase()}. This section is temporarily unavailable.`
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Button
            onClick={retry}
            disabled={isRetrying}
            variant="outline"
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Reloading...' : 'Reload Component'}
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="gap-2 text-red-700 hover:bg-red-100"
          >
            Refresh Page
          </Button>
        </div>

        {showDetails && (
          <div className="text-left">
            <Button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              variant="ghost"
              size="sm"
              className="gap-2 text-red-600 hover:bg-red-100 mb-2"
            >
              <AlertCircle className="h-4 w-4" />
              Error Details
              {showErrorDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showErrorDetails && (
              <div className="p-4 bg-red-100 rounded-md text-sm text-red-800 border border-red-200">
                <div className="mb-2">
                  <strong>Error Type:</strong> {error.name}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32 bg-red-200 p-2 rounded">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-red-600">
          If this problem persists, please contact support.
        </p>
      </div>
    </Card>
  );
}

export default ComponentErrorFallback;