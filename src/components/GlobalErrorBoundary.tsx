'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Global types are handled by Next.js

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | null, errorInfo: ErrorInfo | null, onReset: () => void) => ReactNode;
}

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = { 
    hasError: false, 
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with the caught error and its info
    this.setState((prevState) => ({
      ...prevState,
      errorInfo,
      // Only set error if it's not already set
      error: prevState.error || error
    }));

    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    
    // You can also log to an external service here
    // logErrorToService(error, errorInfo, 'global-boundary');
  }

  handleReset = (): void => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    
    // Use Next.js router for client-side navigation when available
    if (typeof window !== 'undefined') {
      try {
        // Try to use Next.js router first
        const win = window as Window & { next?: { router?: { push: (path: string) => void } } };
        if (win.next?.router?.push) {
          win.next.router.push('/');
          return;
        }
        // Fallback to window.location
        window.location.href = '/';
      } catch (e) {
        console.error('Error during navigation:', e);
        window.location.href = '/';
      }
    }
  };

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo || null, this.handleReset);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-lg border border-red-200">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-700 mb-6">
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Return to home"
                >
                  Return to Home
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="Refresh page"
                >
                  Refresh Page
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-8 p-4 bg-gray-50 rounded-md text-sm text-gray-600 overflow-auto max-h-96">
                  <summary className="font-medium mb-2 cursor-pointer">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                    <h3 className="font-semibold text-red-700">{error.name}: {error.message}</h3>
                    {errorInfo?.componentStack && (
                      <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                    {error.stack && (
                      <pre className="whitespace-pre-wrap font-mono text-xs mt-4 text-gray-700">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default GlobalErrorBoundary;
