'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { 
  NetworkErrorFallback, 
  ComponentErrorFallback, 
  LoadingErrorFallback,
  ErrorFallbackSelector 
} from '@/components/error-fallbacks';

// Test components that throw different types of errors
function NetworkErrorComponent() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Failed to fetch data from server');
  }
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Network Component</h3>
      <p className="text-sm text-gray-600 mb-4">This component simulates a network error.</p>
      <Button onClick={() => setShouldError(true)}>Trigger Network Error</Button>
    </div>
  );
}

function ComponentErrorComponent() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Component render error occurred');
  }
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Component Error</h3>
      <p className="text-sm text-gray-600 mb-4">This component simulates a component error.</p>
      <Button onClick={() => setShouldError(true)}>Trigger Component Error</Button>
    </div>
  );
}

function LoadingErrorComponent() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Data loading timeout occurred');
  }
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Loading Error</h3>
      <p className="text-sm text-gray-600 mb-4">This component simulates a loading error.</p>
      <Button onClick={() => setShouldError(true)}>Trigger Loading Error</Button>
    </div>
  );
}

function AutoDetectErrorComponent() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Network connection failed');
  }
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Auto-Detect Error</h3>
      <p className="text-sm text-gray-600 mb-4">This component uses ErrorFallbackSelector for automatic error type detection.</p>
      <Button onClick={() => setShouldError(true)}>Trigger Auto-Detect Error</Button>
    </div>
  );
}

export default function TestErrorBoundariesPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Error Boundary Testing</h1>
        <p className="text-gray-600">
          Test different error boundary components and fallback behaviors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Error Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Network Error Fallback</h2>
          <ErrorBoundary
            fallback={(error, retry) => (
              <NetworkErrorFallback 
                error={error} 
                retry={retry} 
                showDetails={true}
              />
            )}
            onReset={() => window.location.reload()}
          >
            <NetworkErrorComponent />
          </ErrorBoundary>
        </Card>

        {/* Component Error Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Component Error Fallback</h2>
          <ErrorBoundary
            fallback={(error, retry) => (
              <ComponentErrorFallback 
                error={error} 
                retry={retry} 
                componentName="Test Component"
                showDetails={true}
              />
            )}
            onReset={() => window.location.reload()}
          >
            <ComponentErrorComponent />
          </ErrorBoundary>
        </Card>

        {/* Loading Error Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Loading Error Fallback</h2>
          <ErrorBoundary
            fallback={(error, retry) => (
              <LoadingErrorFallback 
                error={error} 
                retry={retry} 
                dataType="user data"
                showDetails={true}
                timeout={true}
              />
            )}
            onReset={() => window.location.reload()}
          >
            <LoadingErrorComponent />
          </ErrorBoundary>
        </Card>

        {/* Auto-Detect Error Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Auto-Detect Error Fallback</h2>
          <ErrorBoundary
            fallback={(error, retry) => (
              <ErrorFallbackSelector 
                error={error} 
                retry={retry} 
                componentName="Auto-Detect Component"
                dataType="network data"
                showDetails={true}
              />
            )}
            onReset={() => window.location.reload()}
          >
            <AutoDetectErrorComponent />
          </ErrorBoundary>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enhanced Error Boundary Features</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">Retry Mechanism</h3>
              <p className="text-blue-700">
                Automatic retry with exponential backoff and maximum retry limits.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-semibold text-green-900 mb-2">Error Logging</h3>
              <p className="text-green-700">
                Comprehensive error logging with context and debugging information.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <h3 className="font-semibold text-purple-900 mb-2">Fallback UI</h3>
              <p className="text-purple-700">
                Specific fallback components for different error types and scenarios.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}