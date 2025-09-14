'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export function ErrorTestPage() {
  const [errorType, setErrorType] = useState<string | null>(null);

  // Component that throws an error
  const ErrorComponent = () => {
    if (errorType === 'render') {
      // This will cause a render error
      // @ts-ignore - Intentionally causing an error
      return <div>{nonExistentVariable}</div>;
    } else if (errorType === 'api') {
      // Simulate an API error
      throw new Error('API request failed: Could not fetch data');
    } else if (errorType === 'promise') {
      // This will cause an unhandled promise rejection
      throw new Error('Promise rejection: Operation failed');
    }
    
    return <div>No error triggered</div>;
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Error Testing</h1>
      <p className="text-muted-foreground">
        Use the buttons below to test different error scenarios
      </p>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => setErrorType('render')}
        >
          Trigger Render Error
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setErrorType('api')}
        >
          Trigger API Error
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setErrorType('promise')}
        >
          Trigger Promise Rejection
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setErrorType(null)}
        >
          Reset
        </Button>
      </div>

      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-medium mb-2">Error Boundary Test Area</h2>
        <ErrorBoundary 
          errorMessage="Error in test component"
          onReset={() => setErrorType(null)}
        >
          <ErrorComponent />
        </ErrorBoundary>
      </div>

      <div className="p-4 border rounded-lg mt-6">
        <h2 className="text-lg font-medium mb-2">Global Error Boundary Test</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Clicking this button will trigger an error that will be caught by the global error boundary
        </p>
        <Button 
          variant="destructive"
          onClick={() => {
            // This will be caught by the global error boundary
            // @ts-ignore - Intentionally causing an error
            window.doesNotExist.method();
          }}
        >
          Trigger Global Error
        </Button>
      </div>
    </div>
  );
}

export default ErrorTestPage;
