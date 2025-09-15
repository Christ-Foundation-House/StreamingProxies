'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Settings, ArrowLeft, Bug } from 'lucide-react';
import Link from 'next/link';

interface AdminErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  showAdminActions?: boolean;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  timestamp: Date | null;
  retryCount: number;
  isRetrying: boolean;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: AdminErrorBoundaryProps) {
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

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      timestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { pageName, onError } = this.props;
    
    // Enhanced logging for admin pages
    console.group('🚨 Admin Error Boundary Report');
    console.error('Page:', pageName || 'Unknown Admin Page');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Timestamp:', new Date().toISOString());
    console.groupEnd();
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Log admin-specific error data
    this.logAdminError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logAdminError = (error: Error, errorInfo: ErrorInfo) => {
    const { pageName } = this.props;
    
    const adminErrorData = {
      page: pageName || 'Unknown Admin Page',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      retryCount: this.state.retryCount,
      errorType: 'admin_page_error'
    };

    // In production, this would be sent to an error reporting service
    // with admin-specific context and higher priority
    if (process.env.NODE_ENV === 'development') {
      console.table(adminErrorData);
    }
  };

  handleReset = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) exceeded for admin page`);
      return;
    }

    this.setState({ 
      isRetrying: true,
      retryCount: retryCount + 1
    });

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
    }, 1000);
  };

  handleForceReset = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

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

  renderAdminErrorDetails() {
    const { error, errorInfo, timestamp } = this.state;
    const { pageName } = this.props;
    
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    
    return (
      <details className="mt-6 p-4 bg-red-50 rounded-md text-sm text-red-800 overflow-auto max-h-60">
        <summary className="font-medium mb-2 cursor-pointer flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Admin Error Details (Development Only)
        </summary>
        <div className="space-y-2 mt-3">
          {pageName && (
            <div>
              <strong>Admin Page:</strong> {pageName}
            </div>
          )}
          {timestamp && (
            <div>
              <strong>Error Time:</strong> {timestamp.toString()}
            </div>
          )}
          {error?.message && (
            <div>
              <strong>Error Message:</strong> {error.message}
            </div>
          )}
          {error?.stack && (
            <div>
              <strong>Stack Trace:</strong>
              <pre className="whitespace-pre-wrap font-mono text-xs mt-1 p-2 bg-red-100 rounded max-h-32 overflow-auto">
                {error.stack}
              </pre>
            </div>
          )}
          {errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className="whitespace-pre-wrap font-mono text-xs mt-1 p-2 bg-red-100 rounded max-h-32 overflow-auto">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  }

  render() {
    const { 
      fallbackComponent, 
      pageName,
      showAdminActions = true,
      children 
    } = this.props;
    
    const { hasError, error, isRetrying, retryCount } = this.state;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallbackComponent && error) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent error={error} retry={this.handleReset} />;
    }

    const maxRetries = 3;
    const canRetry = retryCount < maxRetries;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Page Error
            </h1>
            
            {pageName && (
              <p className="text-lg text-gray-600 mb-4">
                Error occurred in: <span className="font-medium">{pageName}</span>
              </p>
            )}
            
            <p className="text-gray-600 mb-6">
              {error?.message || 'An unexpected error occurred in the admin panel. This has been logged for investigation.'}
            </p>

            {retryCount > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry attempt {retryCount} of {maxRetries}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {canRetry && (
                <Button
                  onClick={this.handleReset}
                  disabled={isRetrying}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </Button>
              )}

              {!canRetry && (
                <Button
                  onClick={this.handleForceReset}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Page
                </Button>
              )}
              
              <Button variant="outline" asChild className="gap-2">
                <Link href="/streaming-proxies/admin">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin
                </Link>
              </Button>
            </div>

            {showAdminActions && (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Alternative admin actions:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/streaming-proxies/dashboard">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/streaming-proxies/admin/create">
                      Create Proxy
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/streaming-proxies/admin/analytics">
                      View Analytics
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            
            {this.renderAdminErrorDetails()}
          </div>
        </Card>
      </div>
    );
  }
}

export default AdminErrorBoundary;