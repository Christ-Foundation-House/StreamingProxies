'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, Home, Bug, Clock } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  context?: string; // Additional context about where the error occurred
  showReset?: boolean; // Whether to show the reset button
  showHomeButton?: boolean; // Whether to show the home button
  maxRetries?: number; // Maximum number of retry attempts
  retryDelay?: number; // Delay between retries in milliseconds
  enableErrorReporting?: boolean; // Whether to enable error reporting
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  timestamp: Date | null;
  retryCount: number;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      timestamp: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      timestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error info for better debugging
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error with context for debugging
    this.logError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const { context, enableErrorReporting = true } = this.props;
    
    if (!enableErrorReporting) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: context || 'Unknown',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      retryCount: this.state.retryCount
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Report');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.table(errorData);
      console.groupEnd();
    }

    // Here you could send to an error reporting service
    // Example: sendToErrorReporting(errorData);
  };

  handleReset = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    // Check if we've exceeded max retries
    if (retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) exceeded for ErrorBoundary`);
      return;
    }

    this.setState({ 
      isRetrying: true,
      retryCount: retryCount + 1
    });

    // Add delay before retry to prevent rapid successive failures
    this.retryTimeoutId = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        timestamp: null,
        isRetrying: false
      });
      
      if (this.props.onReset) {
        this.props.onReset();
      }
    }, retryDelay);
  };

  handleForceReset = () => {
    // Clear retry timeout if active
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Reset everything including retry count
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      timestamp: null,
      retryCount: 0,
      isRetrying: false
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  renderErrorDetails() {
    const { error, errorInfo, timestamp } = this.state;
    const { context } = this.props;
    
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    
    return (
      <details className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-600 overflow-auto max-h-60">
        <summary className="font-medium mb-2 cursor-pointer">Error Details</summary>
        {context && (
          <div className="mb-2">
            <strong>Context:</strong> {context}
          </div>
        )}
        {timestamp && (
          <div className="mb-2">
            <strong>Time:</strong> {timestamp.toString()}
          </div>
        )}
        {error?.message && (
          <div className="mb-2">
            <strong>Message:</strong> {error.message}
          </div>
        )}
        {error?.stack && (
          <pre className="whitespace-pre-wrap font-mono text-xs mt-2 p-2 bg-gray-100 rounded">
            {error.stack}
          </pre>
        )}
        {errorInfo?.componentStack && (
          <div className="mt-2">
            <strong>Component Stack:</strong>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-1 p-2 bg-gray-100 rounded">
              {errorInfo.componentStack}
            </pre>
          </div>
        )}
      </details>
    );
  }

  render() {
    const { 
      fallback, 
      showReset = true, 
      showHomeButton = true,
      maxRetries = 3,
      children 
    } = this.props;
    
    const { hasError, error, isRetrying, retryCount } = this.state;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback && error) {
      return fallback(error, this.handleReset);
    }

    const canRetry = retryCount < maxRetries;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md border border-red-100">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-4">
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            {retryCount > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <span>Retry attempt {retryCount} of {maxRetries}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showReset && canRetry && (
                <Button
                  onClick={this.handleReset}
                  disabled={isRetrying}
                  variant="outline"
                  className="gap-2 border-red-300 text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Try again'}
                </Button>
              )}

              {showReset && !canRetry && (
                <Button
                  onClick={this.handleForceReset}
                  variant="outline"
                  className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
              
              {showHomeButton && (
                <Link href="/" passHref>
                  <Button variant="ghost" className="gap-2">
                    <Home className="h-4 w-4" />
                    Go to home
                  </Button>
                </Link>
              )}
            </div>
            
            {this.renderErrorDetails()}
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
