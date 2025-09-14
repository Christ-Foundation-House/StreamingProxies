'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  errorMessage?: string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={cn("rounded-lg border border-red-200 bg-red-50 p-4", this.props.className)}>
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {this.props.errorMessage || 'Something went wrong'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{this.state.error?.message}</p>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={this.handleReset}
                  className="border-red-300 bg-white text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-red-700">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs text-red-600">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper function to use the error boundary as a hook
export function useErrorHandler(error: Error | null, errorInfo: ErrorInfo | null) {
  React.useEffect(() => {
    if (error) {
      console.error('Error caught by useErrorHandler:', error, errorInfo);
    }
  }, [error, errorInfo]);
}

// Helper function to wrap a component with an error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  options?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<T> {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary {...options}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Utility for consistent error messages
export const ErrorMessages = {
  component: 'This component encountered an error',
  dataLoading: 'Failed to load data. Please try again.',
  actionFailed: 'The action could not be completed. Please try again.',
  unexpected: 'An unexpected error occurred. Please refresh the page.',
};

// Re-export the ErrorBoundary component as default
export default ErrorBoundary;

// Utility function to combine class names
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
