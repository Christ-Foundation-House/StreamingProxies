'use client';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Server, RefreshCw, Plus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface ProxyGridErrorFallbackProps {
  error: Error;
  retry: () => void;
  isRetrying?: boolean;
  showDetails?: boolean;
  onCreateProxy?: () => void;
  onViewAllProxies?: () => void;
}

export function ProxyGridErrorFallback({ 
  error, 
  retry, 
  isRetrying = false,
  showDetails = process.env.NODE_ENV === 'development',
  onCreateProxy,
  onViewAllProxies
}: ProxyGridErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const isNetworkError = error.message.toLowerCase().includes('network') ||
                        error.message.toLowerCase().includes('fetch') ||
                        error.message.toLowerCase().includes('connection');

  const isDataError = error.message.toLowerCase().includes('data') ||
                     error.message.toLowerCase().includes('parse') ||
                     error.message.toLowerCase().includes('json');

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Unable to connect to the proxy service. Please check your connection and try again.';
    }
    if (isDataError) {
      return 'There was a problem loading proxy data. The data might be corrupted or unavailable.';
    }
    return 'Failed to load streaming proxies. This could be due to a server issue or network problem.';
  };

  const getRecoveryActions = () => {
    if (isNetworkError) {
      return [
        'Check your internet connection',
        'Verify the proxy service is running',
        'Try again in a few moments'
      ];
    }
    if (isDataError) {
      return [
        'Refresh the proxy data',
        'Clear browser cache',
        'Contact support if data appears corrupted'
      ];
    }
    return [
      'Refresh the proxy list',
      'Check system status',
      'Try creating a new proxy to test connectivity'
    ];
  };

  return (
    <div className="space-y-4">
      {/* Header with error state */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Streaming Proxies</h2>
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Error loading proxies</span>
        </div>
      </div>

      {/* Error card */}
      <Card className="p-8 border-red-200 bg-red-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Server className="h-12 w-12 text-red-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Proxy Grid Unavailable
          </h3>
          
          <p className="text-red-700 mb-6 max-w-md mx-auto">
            {getErrorMessage()}
          </p>

          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button
              onClick={retry}
              disabled={isRetrying}
              variant="outline"
              className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Loading Proxies...' : 'Reload Proxies'}
            </Button>
            
            {onCreateProxy && (
              <Button
                onClick={onCreateProxy}
                variant="outline"
                className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                <Plus className="h-4 w-4" />
                Create New Proxy
              </Button>
            )}

            {onViewAllProxies && (
              <Button
                onClick={onViewAllProxies}
                variant="ghost"
                className="gap-2 text-red-700 hover:bg-red-100"
              >
                View All Proxies
              </Button>
            )}
          </div>

          {/* Recovery suggestions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-red-800 mb-3">Recovery steps:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {getRecoveryActions().map((action, index) => (
                <div key={index} className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-2 rounded-md">
                  <span className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center text-xs font-medium text-red-800">
                    {index + 1}
                  </span>
                  {action}
                </div>
              ))}
            </div>
          </div>

          {/* Alternative actions */}
          <div className="border-t border-red-200 pt-4">
            <p className="text-sm text-red-600 mb-3">
              While we fix this issue, you can:
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-100"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => window.location.href = '/streaming-proxies/admin'}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-100"
              >
                Go to Admin Panel
              </Button>
              <Button
                onClick={() => window.location.href = '/streaming-proxies/monitoring'}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-100"
              >
                Check System Status
              </Button>
            </div>
          </div>

          {/* Error details for development */}
          {showDetails && (
            <div className="text-left mt-6 pt-4 border-t border-red-200">
              <Button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                variant="ghost"
                size="sm"
                className="gap-2 text-red-600 hover:bg-red-100 mb-2"
              >
                <AlertTriangle className="h-4 w-4" />
                {showErrorDetails ? 'Hide' : 'Show'} Technical Details
              </Button>

              {showErrorDetails && (
                <div className="p-4 bg-red-100 rounded-md text-sm text-red-800 border border-red-200">
                  <div className="mb-2">
                    <strong>Component:</strong> Proxy Grid
                  </div>
                  <div className="mb-2">
                    <strong>Error Type:</strong> {error.name}
                  </div>
                  <div className="mb-2">
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-32 bg-red-200 p-2 rounded whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ProxyGridErrorFallback;