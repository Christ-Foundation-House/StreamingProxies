'use client';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AlertTriangle, RefreshCw, Settings, Home } from 'lucide-react';
import { useState } from 'react';

interface DashboardSectionErrorFallbackProps {
  error: Error;
  retry: () => void;
  sectionName: string;
  isRetrying?: boolean;
  showDetails?: boolean;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
}

export function DashboardSectionErrorFallback({ 
  error, 
  retry, 
  sectionName,
  isRetrying = false,
  showDetails = process.env.NODE_ENV === 'development',
  onNavigateHome,
  onOpenSettings
}: DashboardSectionErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const isDataError = error.message.toLowerCase().includes('data') ||
                     error.message.toLowerCase().includes('fetch') ||
                     error.message.toLowerCase().includes('api');

  const isRenderError = error.message.toLowerCase().includes('render') ||
                       error.message.toLowerCase().includes('hook') ||
                       error.name === 'ChunkLoadError';

  const getErrorMessage = () => {
    if (isDataError) {
      return `Unable to load ${sectionName.toLowerCase()} data. This might be due to a network issue or server problem.`;
    }
    if (isRenderError) {
      return `The ${sectionName.toLowerCase()} section encountered a display error and couldn't render properly.`;
    }
    return `An error occurred in the ${sectionName.toLowerCase()} section. This section is temporarily unavailable.`;
  };

  const getSuggestions = () => {
    if (isDataError) {
      return [
        'Check your internet connection',
        'Verify the server is running',
        'Try refreshing the data'
      ];
    }
    if (isRenderError) {
      return [
        'Try reloading the section',
        'Clear your browser cache',
        'Refresh the entire page'
      ];
    }
    return [
      'Try reloading the section',
      'Refresh the page',
      'Contact support if the issue persists'
    ];
  };

  return (
    <Card className="p-6 border-orange-200 bg-orange-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-10 w-10 text-orange-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-orange-900 mb-2">
          {sectionName} Unavailable
        </h3>
        
        <p className="text-orange-700 mb-4 max-w-md mx-auto">
          {getErrorMessage()}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Button
            onClick={retry}
            disabled={isRetrying}
            variant="outline"
            className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Reloading...' : 'Reload Section'}
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="gap-2 text-orange-700 hover:bg-orange-100"
          >
            Refresh Page
          </Button>

          {onNavigateHome && (
            <Button
              onClick={onNavigateHome}
              variant="ghost"
              className="gap-2 text-orange-700 hover:bg-orange-100"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}

          {onOpenSettings && (
            <Button
              onClick={onOpenSettings}
              variant="ghost"
              className="gap-2 text-orange-700 hover:bg-orange-100"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          )}
        </div>

        {/* Suggestions */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Try these steps:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Error details for development */}
        {showDetails && (
          <div className="text-left">
            <Button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              variant="ghost"
              size="sm"
              className="gap-2 text-orange-600 hover:bg-orange-100 mb-2"
            >
              <AlertTriangle className="h-4 w-4" />
              {showErrorDetails ? 'Hide' : 'Show'} Error Details
            </Button>

            {showErrorDetails && (
              <div className="p-4 bg-orange-100 rounded-md text-sm text-orange-800 border border-orange-200">
                <div className="mb-2">
                  <strong>Section:</strong> {sectionName}
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
                    <pre className="mt-1 text-xs overflow-auto max-h-32 bg-orange-200 p-2 rounded whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-orange-600">
          Other dashboard sections should continue to work normally.
        </p>
      </div>
    </Card>
  );
}

export default DashboardSectionErrorFallback;